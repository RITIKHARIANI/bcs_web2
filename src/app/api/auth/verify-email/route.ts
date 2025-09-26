import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail, emailTemplates } from '@/lib/email';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
    }

    // Find user by verification token
    const user = await prisma.users.findUnique({
      where: {
        email_verification_token: token,
      },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
    }

    if (user.email_verified) {
      return NextResponse.redirect(new URL('/auth/login?message=already_verified', request.url));
    }

    // Verify email
    await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        email_verified: true,
        email_verified_at: new Date(),
        email_verification_token: null, // Clear the token after verification
      },
    });

    // Send welcome email
    const loginUrl = new URL('/auth/login', request.url).toString();
    const welcomeEmail = emailTemplates.emailVerified(user.name, loginUrl);
    
    await sendEmail({
      to: user.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
    });

    return NextResponse.redirect(new URL('/auth/login?message=email_verified', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    // Find user by verification token
    const user = await prisma.users.findUnique({
      where: {
        email_verification_token: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 200 }
      );
    }

    // Verify email
    await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        email_verified: true,
        email_verified_at: new Date(),
        email_verification_token: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Email verification failed' },
      { status: 500 }
    );
  }
}
