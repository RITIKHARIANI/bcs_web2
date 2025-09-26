// Email utilities for authentication and notifications
import { randomBytes, createHash } from 'crypto';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Generate secure token for email verification/password reset
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Create hash of token for database storage (security best practice)
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Mock email sending function (replace with your email service)
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    // For development/testing, just log the email
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Mock Email Sent:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('HTML Content:', html);
      return true;
    }

    // TODO: Implement with your email service (SendGrid, Resend, AWS SES, etc.)
    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await sgMail.send(msg);
    return true;
    */

    // Example with Resend:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });
    return true;
    */

    console.warn('Email service not configured for production');
    return false;

  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  // Email verification template
  verifyEmail: (name: string, verificationUrl: string) => ({
    subject: 'Verify Your Email - BCS Platform',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #13294B 0%, #E84A27 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🧠 BCS Platform</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Brain & Cognitive Sciences</p>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #13294B; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${name}!</h2>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">
            Thank you for registering for the BCS Interactive Platform. To complete your registration and access all features, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #13294B 0%, #E84A27 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              Verify Email Address
            </a>
          </div>
          
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #777; text-align: center;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #E84A27; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="margin: 0; font-size: 14px; color: #777; text-align: center;">
            This verification link will expire in 24 hours for security reasons.<br>
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  }),

  // Password reset template
  resetPassword: (name: string, resetUrl: string) => ({
    subject: 'Reset Your Password - BCS Platform',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #13294B 0%, #E84A27 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🔒 BCS Platform</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Password Reset Request</p>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #13294B; margin: 0 0 20px 0; font-size: 24px;">Hello, ${name}</h2>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">
            We received a request to reset your password for your BCS Platform account. If you made this request, click the button below to set a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #13294B 0%, #E84A27 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              Reset Password
            </a>
          </div>
          
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #777; text-align: center;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #E84A27; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>🔐 Security Notice:</strong><br>
              This password reset link will expire in 1 hour for security reasons.<br>
              If you didn't request this reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  // Email verified confirmation
  emailVerified: (name: string, loginUrl: string) => ({
    subject: 'Email Verified - Welcome to BCS Platform!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #13294B 0%, #E84A27 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">✅ BCS Platform</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Email Verified Successfully!</p>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #13294B; margin: 0 0 20px 0; font-size: 24px;">Welcome to the platform, ${name}! 🎉</h2>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">
            Congratulations! Your email has been verified successfully. You now have full access to all platform features including:
          </p>
          
          <div style="background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <ul style="margin: 0; padding: 0 0 0 20px; color: #555;">
              <li style="margin: 0 0 8px 0;">📚 Create and manage educational modules</li>
              <li style="margin: 0 0 8px 0;">🎓 Build comprehensive courses</li>
              <li style="margin: 0 0 8px 0;">📁 Upload and manage media files</li>
              <li style="margin: 0 0 8px 0;">📊 Access analytics and insights</li>
              <li style="margin: 0;">🌐 Publish content for students</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #13294B 0%, #E84A27 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              Login to Your Account
            </a>
          </div>
          
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #777; text-align: center;">
            Ready to start creating amazing educational content!
          </p>
        </div>
      </div>
    `,
  })
};

const emailUtils = { generateToken, hashToken, sendEmail, emailTemplates };
export default emailUtils;
