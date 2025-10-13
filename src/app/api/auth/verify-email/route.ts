import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// Validate email verification token (GET request - read-only, safe for scanners)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await prisma.users.findUnique({
      where: {
        email_verification_token: token
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json(
        {
          success: true,
          message: 'Email already verified',
          alreadyVerified: true
        }
      );
    }

    // Check if token is expired
    if (user.email_verification_token_expires && user.email_verification_token_expires < new Date()) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new verification email.' },
        { status: 400 }
      );
    }

    // Token is valid
    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      valid: true
    });

  } catch (error) {
    console.error('Email verification token validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate verification token' },
      { status: 500 }
    );
  }
}

// Handle POST requests - either verify email or resend verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Distinguish between verification and resend based on request body
    if (body.token) {
      // This is a verification request
      return await handleVerification(body.token);
    } else if (body.email) {
      // This is a resend verification email request
      return await handleResendVerification(body.email);
    } else {
      return NextResponse.json(
        { error: 'Either token or email is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Email verification POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Perform email verification (state-changing operation)
async function handleVerification(token: string) {
  try {
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await prisma.users.findUnique({
      where: {
        email_verification_token: token
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json(
        {
          success: true,
          message: 'Email already verified',
          alreadyVerified: true
        }
      );
    }

    // Check if token is expired
    if (user.email_verification_token_expires && user.email_verification_token_expires < new Date()) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new verification email.' },
        { status: 400 }
      );
    }

    // Verify the email
    await prisma.users.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_verified_at: new Date(),
        email_verification_token: null, // Clear the token
        email_verification_token_expires: null, // Clear expiration
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

// Resend verification email
async function handleResendVerification(email: string) {
  try {
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a verification email has been sent.'
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified.'
      });
    }

    // Rate limiting: Check if user has requested verification email recently
    if (user.last_verification_email_sent_at) {
      const timeSinceLastEmail = Date.now() - user.last_verification_email_sent_at.getTime();
      const twentyMinutes = 20 * 60 * 1000; // 20 minutes in milliseconds

      if (timeSinceLastEmail < twentyMinutes) {
        const minutesRemaining = Math.ceil((twentyMinutes - timeSinceLastEmail) / 60000);
        return NextResponse.json(
          {
            error: `Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before requesting another verification email.`,
            rateLimited: true,
            retryAfter: minutesRemaining
          },
          { status: 429 } // Too Many Requests
        );
      }
    }

    // Generate new verification token with expiration
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token and timestamp
    await prisma.users.update({
      where: { id: user.id },
      data: {
        email_verification_token: verificationToken,
        email_verification_token_expires: verificationTokenExpires,
        last_verification_email_sent_at: new Date(),
        updated_at: new Date()
      }
    });

    // Send verification email
    try {
      const { sendVerificationEmail } = await import('@/lib/email');
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the request if email sending fails
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
