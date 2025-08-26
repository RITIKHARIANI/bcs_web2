import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  moduleIds: z.array(z.string()).optional(),
})

// GET /api/courses - Get all courses for current faculty
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      where: {
        authorId: session.user.id,
      },
      include: {
        courseModules: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                moduleNumber: true,
                status: true,
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            courseModules: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

// POST /api/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createCourseSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { title, description, tags, moduleIds } = validationResult.data

    // Generate slug
    const slug = generateSlug(title)
    
    // Check if slug already exists and modify if needed
    let finalSlug = slug
    let counter = 1
    while (await prisma.course.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        slug: finalSlug,
        description,
        tags: tags || [],
        authorId: session.user.id,
      }
    })

    // Add modules to course if provided
    if (moduleIds && moduleIds.length > 0) {
      // Verify all modules belong to the user
      const userModules = await prisma.module.findMany({
        where: {
          id: { in: moduleIds },
          authorId: session.user.id,
        }
      })

      if (userModules.length !== moduleIds.length) {
        // Some modules don't belong to user, delete the course and return error
        await prisma.course.delete({ where: { id: course.id } })
        return NextResponse.json(
          { error: 'Some modules do not exist or do not belong to you' },
          { status: 400 }
        )
      }

      // Create course-module relationships
      const courseModuleData = moduleIds.map((moduleId, index) => ({
        courseId: course.id,
        moduleId,
        sortOrder: index + 1,
      }))

      await prisma.courseModule.createMany({
        data: courseModuleData
      })
    }

    // Fetch the complete course with modules
    const completeCourse = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        courseModules: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                moduleNumber: true,
                status: true,
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            courseModules: true,
          }
        }
      }
    })

    return NextResponse.json({ course: completeCourse }, { status: 201 })
  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}
