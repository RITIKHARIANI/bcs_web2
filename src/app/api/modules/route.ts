import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long'),
  content: z.string().optional(),
  description: z.string().optional(),
  parentModuleId: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createModuleSchema.parse(body)

    // Check if slug is unique for this author
    const existingModule = await prisma.module.findFirst({
      where: {
        slug: validatedData.slug,
        authorId: session.user.id,
      },
    })

    if (existingModule) {
      return NextResponse.json(
        { error: 'A module with this slug already exists' },
        { status: 400 }
      )
    }

    // Determine sort order for hierarchical positioning
    let sortOrder = 0
    if (validatedData.parentModuleId) {
      const lastSibling = await prisma.module.findFirst({
        where: {
          parentModuleId: validatedData.parentModuleId,
          authorId: session.user.id,
        },
        orderBy: { sortOrder: 'desc' },
      })
      sortOrder = (lastSibling?.sortOrder || 0) + 1
    } else {
      const lastRootModule = await prisma.module.findFirst({
        where: {
          parentModuleId: null,
          authorId: session.user.id,
        },
        orderBy: { sortOrder: 'desc' },
      })
      sortOrder = (lastRootModule?.sortOrder || 0) + 1
    }

    const newModule = await prisma.module.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        description: validatedData.description,
        parentModuleId: validatedData.parentModuleId,
        status: validatedData.status,
        authorId: session.user.id,
        sortOrder,
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
        _count: {
          select: {
            subModules: true,
            courseModules: true,
          },
        },
      },
    })

    return NextResponse.json({ module: newModule })
  } catch (error) {
    console.error('Error creating module:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const status = searchParams.get('status')

    const modules = await prisma.module.findMany({
      where: {
        authorId: session.user.id,
        ...(parentId && { parentModuleId: parentId }),
        ...(parentId === 'root' && { parentModuleId: null }),
        ...(status && { status }),
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
        _count: {
          select: {
            subModules: true,
            courseModules: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}
