import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Helper function to check if a module is an ancestor of another module
async function checkIfModuleIsAncestor(moduleId: string, potentialDescendantId: string): Promise<boolean> {
  if (moduleId === potentialDescendantId) {
    return true
  }

  const descendant = await prisma.module.findUnique({
    where: { id: potentialDescendantId },
    select: { parentModuleId: true },
  })

  if (!descendant || !descendant.parentModuleId) {
    return false
  }

  return await checkIfModuleIsAncestor(moduleId, descendant.parentModuleId)
}

const updateModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long').optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  parentModuleId: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const foundModule = await prisma.module.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        parentModule: {
          select: {
            id: true,
            title: true,
          },
        },
        subModules: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        moduleMedia: {
          include: {
            mediaFile: true,
          },
        },
        _count: {
          select: {
            subModules: true,
            courseModules: true,
          },
        },
      },
    })

    if (!foundModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    return NextResponse.json({ module: foundModule })
  } catch (error) {
    console.error('Error fetching module:', error)
    return NextResponse.json(
      { error: 'Failed to fetch module' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Check if module exists and belongs to user
    const existingModule = await prisma.module.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
    })

    if (!existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateModuleSchema.parse(body)

    // If slug is being updated, check uniqueness
    if (validatedData.slug && validatedData.slug !== existingModule.slug) {
      const slugExists = await prisma.module.findFirst({
        where: {
          slug: validatedData.slug,
          authorId: session.user.id,
          id: { not: id },
        },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A module with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Validate parentModuleId if provided
    if (validatedData.parentModuleId !== undefined) {
      if (validatedData.parentModuleId !== null && validatedData.parentModuleId !== '') {
        // Check if parent module exists and belongs to the same author
        const parentModule = await prisma.module.findFirst({
          where: {
            id: validatedData.parentModuleId,
            authorId: session.user.id,
          },
        })

        if (!parentModule) {
          return NextResponse.json(
            { error: 'Parent module not found or you do not have permission to access it' },
            { status: 400 }
          )
        }

        // Prevent circular reference (module cannot be its own parent)
        if (validatedData.parentModuleId === id) {
          return NextResponse.json(
            { error: 'A module cannot be its own parent' },
            { status: 400 }
          )
        }

        // Prevent circular reference in hierarchy (check if current module is an ancestor of the intended parent)
        const isAncestor = await checkIfModuleIsAncestor(id, validatedData.parentModuleId)
        if (isAncestor) {
          return NextResponse.json(
            { error: 'Cannot create circular reference. The selected parent module is already a descendant of this module.' },
            { status: 400 }
          )
        }
      } else if (validatedData.parentModuleId === '') {
        // Convert empty string to null
        validatedData.parentModuleId = null
      }
    }

    const updatedModule = await prisma.module.update({
      where: { id },
      data: validatedData,
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        parentModule: {
          select: {
            id: true,
            title: true,
          },
        },
        subModules: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: {
            subModules: true,
            courseModules: true,
          },
        },
      },
    })

    return NextResponse.json({ module: updatedModule })
  } catch (error) {
    console.error('Error updating module:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Check if module exists and belongs to user
    const moduleToDelete = await prisma.module.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
      include: {
        _count: {
          select: {
            subModules: true,
            courseModules: true,
          },
        },
      },
    })

    if (!moduleToDelete) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Prevent deletion if module has submodules or is used in courses
    if (moduleToDelete._count.subModules > 0) {
      return NextResponse.json(
        { error: 'Cannot delete module with submodules. Please delete submodules first.' },
        { status: 400 }
      )
    }

    if (moduleToDelete._count.courseModules > 0) {
      return NextResponse.json(
        { error: 'Cannot delete module that is used in courses. Remove from courses first.' },
        { status: 400 }
      )
    }

    await prisma.module.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    )
  }
}
