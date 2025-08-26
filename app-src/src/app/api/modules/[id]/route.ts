import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const updateModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  slug: z.string().optional(),
})

// GET /api/modules/[id] - Get specific module
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
    const moduleData = await prisma.module.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
      include: {
        subModules: {
          include: {
            _count: {
              select: {
                subModules: true,
                courseModules: true,
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        parentModule: {
          select: {
            id: true,
            title: true,
            moduleNumber: true,
          }
        },
        courseModules: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                status: true,
              }
            }
          }
        },
        moduleMedia: {
          include: {
            mediaFile: true
          }
        }
      }
    })

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    return NextResponse.json({ module: moduleData })
  } catch (error) {
    console.error('Get module error:', error)
    return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 })
  }
}

// PUT /api/modules/[id] - Update module
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
    const validationResult = updateModuleSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { id } = await params
    // Check if module exists and belongs to user
    const existingModule = await prisma.module.findFirst({
      where: {
        id,
        authorId: session.user.id,
      }
    })

    if (!existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    const updates = validationResult.data
    
    // Update slug if title changed
    if (updates.title && updates.title !== existingModule.title) {
      updates.slug = generateSlug(updates.title)
    }

    const updatedModule = await prisma.module.update({
      where: { id },
      data: updates,
      include: {
        subModules: {
          select: {
            id: true,
            title: true,
            moduleNumber: true,
            status: true,
          }
        },
        _count: {
          select: {
            courseModules: true,
            subModules: true,
          }
        }
      }
    })

    return NextResponse.json({ module: updatedModule })
  } catch (error) {
    console.error('Update module error:', error)
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
  }
}

// DELETE /api/modules/[id] - Delete module
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
    // Check if module exists and belongs to user
    const existingModule = await prisma.module.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
      include: {
        subModules: true,
        courseModules: true,
      }
    })

    if (!existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Check if module has submodules or is used in courses
    if (existingModule.subModules.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete module with submodules. Delete submodules first.' },
        { status: 400 }
      )
    }

    if (existingModule.courseModules.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete module that is used in courses. Remove from courses first.' },
        { status: 400 }
      )
    }

    await prisma.module.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Module deleted successfully' })
  } catch (error) {
    console.error('Delete module error:', error)
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
  }
}
