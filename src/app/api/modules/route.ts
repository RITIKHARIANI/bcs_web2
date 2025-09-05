import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long'),
  content: z.string().optional(),
  description: z.string().optional(),
  parent_module_id: z.string().optional(),
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
    const existingModule = await prisma.modules.findFirst({
      where: {
        slug: validatedData.slug,
        author_id: session.user.id,
      },
    })

    if (existingModule) {
      return NextResponse.json(
        { error: 'A module with this slug already exists' },
        { status: 400 }
      )
    }

    // Determine sort order for hierarchical positioning
    let sort_order = 0
    if (validatedData.parent_module_id) {
      const lastSibling = await prisma.modules.findFirst({
        where: {
          parent_module_id: validatedData.parent_module_id,
          author_id: session.user.id,
        },
        orderBy: { sort_order: 'desc' },
      })
      sort_order = (lastSibling?.sort_order || 0) + 1
    } else {
      const lastRootModule = await prisma.modules.findFirst({
        where: {
          parent_module_id: null,
          author_id: session.user.id,
        },
        orderBy: { sort_order: 'desc' },
      })
      sort_order = (lastRootModule?.sort_order || 0) + 1
    }

    const newModule = await prisma.modules.create({
      data: {
        id: `module_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        description: validatedData.description,
        parent_module_id: validatedData.parent_module_id,
        status: validatedData.status,
        author_id: session.user.id,
        sort_order,
      },
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        modules: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            other_modules: true,
            course_modules: true,
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
    const parent_module_id = searchParams.get('parent_module_id') 
    const status = searchParams.get('status')

    // Handle different query parameter formats
    let whereClause: any = { author_id: session.user.id }
    
    if (parentId) {
      if (parentId === 'root') {
        whereClause.parent_module_id = null
      } else {
        whereClause.parent_module_id = parentId
      }
    } else if (parent_module_id !== undefined) {
      if (parent_module_id === 'null' || parent_module_id === null) {
        whereClause.parent_module_id = null
      } else {
        whereClause.parent_module_id = parent_module_id
      }
    }
    
    if (status) {
      whereClause.status = status
    }

    const modules = await prisma.modules.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        modules: {
          select: {
            id: true,
            title: true,
          },
        },
        other_modules: {
          select: {
            id: true,
            title: true,
            status: true,
            created_at: true,
          },
          orderBy: {
            sort_order: 'asc',
          },
        },
        _count: {
          select: {
            other_modules: true,
            course_modules: true,
          },
        },
      },
      orderBy: {
        sort_order: 'asc',
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
