import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { generateToken, sendEmail, emailTemplates } from '../../../../lib/email';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.users.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    // Always return success for security (don't reveal if email exists)
    // But only send email if user actually exists
    if (user) {
      // Generate password reset token
      const resetToken = generateToken();
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Store token in database
      await prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          password_reset_token: resetToken,
          password_reset_expires: tokenExpiry,
        },
      });

      // Send password reset email
      const resetUrl = new URL(`/auth/reset-password?token=${resetToken}`, request.url).toString();
      const resetEmail = emailTemplates.resetPassword(user.name, resetUrl);

      const emailSent = await sendEmail({
        to: user.email,
        subject: resetEmail.subject,
        html: resetEmail.html,
      });

      if (!emailSent) {
        console.error('Failed to send password reset email to:', user.email);
        // In production, you might still want to return success for security
        // But log this error for investigation
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
