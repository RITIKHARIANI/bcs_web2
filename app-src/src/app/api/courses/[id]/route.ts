import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const updateCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
  slug: z.string().optional(),
})

const updateModulesSchema = z.object({
  moduleIds: z.array(z.string()),
})

// GET /api/courses/[id] - Get specific course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const course = await prisma.course.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
      include: {
        courseModules: {
          include: {
            module: {
              include: {
                subModules: {
                  select: {
                    id: true,
                    title: true,
                    moduleNumber: true,
                    status: true,
                  },
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

// PUT /api/courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = updateCourseSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { id } = await params
    // Check if course exists and belongs to user
    const existingCourse = await prisma.course.findFirst({
      where: {
        id,
        authorId: session.user.id,
      }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const updates = validationResult.data
    
    // Update slug if title changed
    if (updates.title && updates.title !== existingCourse.title) {
      updates.slug = generateSlug(updates.title)
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updates,
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

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    console.error('Update course error:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

// DELETE /api/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Check if course exists and belongs to user
    const existingCourse = await prisma.course.findFirst({
      where: {
        id,
        authorId: session.user.id,
      }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Delete course (courseModules will be deleted automatically due to cascade)
    await prisma.course.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Delete course error:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}

// POST /api/courses/[id]/modules - Update course modules
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = updateModulesSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { id } = await params
    const { moduleIds } = validationResult.data

    // Check if course exists and belongs to user
    const existingCourse = await prisma.course.findFirst({
      where: {
        id,
        authorId: session.user.id,
      }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verify all modules belong to the user
    if (moduleIds.length > 0) {
      const userModules = await prisma.module.findMany({
        where: {
          id: { in: moduleIds },
          authorId: session.user.id,
        }
      })

      if (userModules.length !== moduleIds.length) {
        return NextResponse.json(
          { error: 'Some modules do not exist or do not belong to you' },
          { status: 400 }
        )
      }
    }

    // Delete existing course modules
    await prisma.courseModule.deleteMany({
      where: { courseId: id }
    })

    // Add new course modules if any
    if (moduleIds.length > 0) {
      const courseModuleData = moduleIds.map((moduleId, index) => ({
        courseId: id,
        moduleId,
        sortOrder: index + 1,
      }))

      await prisma.courseModule.createMany({
        data: courseModuleData
      })
    }

    // Fetch updated course
    const updatedCourse = await prisma.course.findUnique({
      where: { id },
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

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    console.error('Update course modules error:', error)
    return NextResponse.json({ error: 'Failed to update course modules' }, { status: 500 })
  }
}
