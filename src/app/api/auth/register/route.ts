import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../../../../lib/db'
import { sendVerificationEmail } from '../../../../lib/email'
import { z } from 'zod'

// Enhanced validation schema
const registerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-\']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .refine(email => {
      // Optional: Add university email validation
      // return email.endsWith('@illinois.edu') || email.endsWith('@uillinois.edu')
      return true
    }, 'Please use a valid university email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
})

export async function POST(request: NextRequest) {
  // Optional: Rate limiting check here
  // Optional: CORS handling if needed
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: {
        email: validatedData.email,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password with recommended security settings
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds)

    // Generate unique user ID and email verification token
    const userId = `faculty_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with email verification fields
    const newUser = await prisma.users.create({
      data: {
        id: userId,
        name: validatedData.name,
        email: validatedData.email,
        password_hash: hashedPassword,
        role: 'faculty',
        email_verified: false,
        email_verification_token: verificationToken,
        email_verification_token_expires: verificationTokenExpires,
        last_verification_email_sent_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        email_verified: true,
      },
    })

    // Send verification email
    const verificationUrl = new URL(`/api/auth/verify-email?token=${verificationToken}`, request.url).toString()

    try {
      await sendVerificationEmail(newUser.email, newUser.name, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email to:', newUser.email, emailError)
      // Continue with registration but log the error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Faculty account created successfully. Please check your email to verify your account.',
        requiresVerification: true,
        emailSent: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.created_at,
          emailVerified: newUser.email_verified,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid input', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    // Handle database constraint errors
    if (error instanceof Error && (error.message.includes('Unique constraint') || error.message.includes('unique constraint'))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'An account with this email address already exists',
          field: 'email'
        },
        { status: 409 } // Conflict status code
      )
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { 
            success: false,
            error: 'An account with this email address already exists',
            field: 'email'
          },
          { status: 409 }
        )
      }
    }

    // Generic server error
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    )
  }
}
