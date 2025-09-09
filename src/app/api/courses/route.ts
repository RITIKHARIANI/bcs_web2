import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long'),
  description: z.string().optional(),
  modules: z.array(z.object({
    moduleId: z.string(),
    order: z.number(),
  })).optional().default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    // Check if slug is unique for this author
    const existingCourse = await prisma.courses.findFirst({
      where: {
        slug: validatedData.slug,
        author_id: session.user.id,
      },
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'A course with this slug already exists' },
        { status: 400 }
      )
    }

    // Verify all modules belong to the author
    if (validatedData.modules.length > 0) {
      const moduleIds = validatedData.modules.map(m => m.moduleId)
      const userModules = await prisma.modules.findMany({
        where: {
          id: { in: moduleIds },
          author_id: session.user.id,
        },
      })

      if (userModules.length !== moduleIds.length) {
        return NextResponse.json(
          { error: 'Some modules do not exist or do not belong to you' },
          { status: 400 }
        )
      }
    }

    // Create course with modules in a transaction
    const newCourse = await prisma.$transaction(async (tx) => {
      const course = await tx.courses.create({
        data: {
          id: `course_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          title: validatedData.title,
          slug: validatedData.slug,
          description: validatedData.description,
          status: validatedData.status,
          featured: validatedData.featured,
          author_id: session.user.id,
        },
      })

      // Create course-module relationships
      if (validatedData.modules.length > 0) {
        await tx.course_modules.createMany({
          data: validatedData.modules.map(({ moduleId, order }, index) => ({
            id: `${course.id}_${moduleId}_${Date.now()}_${index}`,
            course_id: course.id,
            module_id: moduleId,
            sort_order: order,
          })),
        })
      }

      return course
    })

    // Fetch the complete course with modules and author
    const courseWithDetails = await prisma.courses.findUnique({
      where: { id: newCourse.id },
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        course_modules: {
          include: {
            modules: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                status: true,
              },
            },
          },
          orderBy: {
            sort_order: 'asc',
          },
        },
        _count: {
          select: {
            course_modules: true,
          },
        },
      },
    })

    return NextResponse.json({ course: courseWithDetails })
  } catch (error) {
    console.error('Error creating course:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const status = searchParams.get('status')
    const authorOnly = searchParams.get('authorOnly')

    // If authorOnly is specified, require authentication
    if (authorOnly === 'true') {
      const session = await auth()
      if (!session?.user || session.user.role !== 'faculty') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const courses = await prisma.courses.findMany({
        where: {
          author_id: session.user.id,
          ...(status && { status }),
        },
        include: {
          users: {
            select: {
              name: true,
              email: true,
            },
          },
          course_modules: {
            include: {
              modules: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  description: true,
                  status: true,
                },
              },
            },
            orderBy: {
              sort_order: 'asc',
            },
          },
          _count: {
            select: {
              course_modules: true,
            },
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      })

      return NextResponse.json({ courses })
    }

    // Public course listing
    const courses = await prisma.courses.findMany({
      where: {
        status: 'published',
        ...(featured === 'true' && { featured: true }),
      },
      include: {
        users: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            course_modules: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { updated_at: 'desc' },
      ],
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}