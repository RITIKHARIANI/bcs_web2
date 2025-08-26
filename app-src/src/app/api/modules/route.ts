import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional(),
  content: z.string().optional(),
  parentModuleId: z.string().optional(),
})

// GET /api/modules - Get all modules for current faculty
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    const modules = await prisma.module.findMany({
      where: {
        authorId: session.user.id,
        parentModuleId: parentId || null,
      },
      include: {
        subModules: {
          include: {
            _count: {
              select: {
                courseModules: true,
                subModules: true,
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            courseModules: true,
            subModules: true,
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Get modules error:', error)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}

// POST /api/modules - Create new module
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createModuleSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { title, description, content, parentModuleId } = validationResult.data

    // Generate slug and sort order
    const slug = generateSlug(title)
    
    // Get next sort order for this parent level
    const lastModule = await prisma.module.findFirst({
      where: {
        authorId: session.user.id,
        parentModuleId: parentModuleId || null,
      },
      orderBy: { sortOrder: 'desc' }
    })
    
    const sortOrder = (lastModule?.sortOrder || 0) + 1

    // Generate module number
    let moduleNumber: string
    if (parentModuleId) {
      const parentModule = await prisma.module.findUnique({
        where: { id: parentModuleId }
      })
      if (!parentModule) {
        return NextResponse.json({ error: 'Parent module not found' }, { status: 404 })
      }
      moduleNumber = `${parentModule.moduleNumber}.${sortOrder}`
    } else {
      moduleNumber = sortOrder.toString()
    }

    const newModule = await prisma.module.create({
      data: {
        title,
        slug,
        description,
        content,
        authorId: session.user.id,
        parentModuleId,
        sortOrder,
        moduleNumber,
      },
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

    return NextResponse.json({ module: newModule }, { status: 201 })
  } catch (error) {
    console.error('Create module error:', error)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}
