import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { withDatabaseRetry } from '@/lib/retry'
import { z } from 'zod'

const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long'),
  content: z.string().optional(),
  description: z.string().optional(),
  parent_module_id: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createModuleSchema.parse(body)

    // Check if slug is unique for this author (with retry)
    const existingModule = await withDatabaseRetry(async () => {
      return prisma.modules.findFirst({
        where: {
          slug: validatedData.slug,
          author_id: session.user.id,
        },
      })
    })

    if (existingModule) {
      return NextResponse.json(
        { error: 'A module with this slug already exists' },
        { status: 400 }
      )
    }

    // Determine sort order for hierarchical positioning (with retry)
    let sort_order = 0
    if (validatedData.parent_module_id) {
      const lastSibling = await withDatabaseRetry(async () => {
        return prisma.modules.findFirst({
          where: {
            parent_module_id: validatedData.parent_module_id,
            author_id: session.user.id,
          },
          orderBy: { sort_order: 'desc' },
        })
      })
      sort_order = (lastSibling?.sort_order || 0) + 1
    } else {
      const lastRootModule = await withDatabaseRetry(async () => {
        return prisma.modules.findFirst({
          where: {
            parent_module_id: null,
            author_id: session.user.id,
          },
          orderBy: { sort_order: 'desc' },
        })
      })
      sort_order = (lastRootModule?.sort_order || 0) + 1
    }

    // Clean and validate tags
    const cleanTags = validatedData.tags
      .map(tag => tag.trim().toLowerCase())
      .filter((tag, index, arr) => tag.length > 0 && arr.indexOf(tag) === index) // Remove duplicates and empty tags

    const newModule = await withDatabaseRetry(async () => {
      return prisma.modules.create({
        data: {
          id: `module_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          title: validatedData.title,
          slug: validatedData.slug,
          content: validatedData.content,
          description: validatedData.description,
          parent_module_id: validatedData.parent_module_id,
          status: validatedData.status,
          tags: cleanTags,
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
    const tags = searchParams.get('tags')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'sort_order'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

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

    // Add tag filtering
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
      if (tagList.length > 0) {
        whereClause.tags = {
          hasSome: tagList
        }
      }
    }

    // Add text search
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim()
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { slug: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { hasSome: [searchTerm.toLowerCase()] } }
      ]
    }

    // Build order by clause
    let orderByClause: any
    switch (sortBy) {
      case 'title':
        orderByClause = { title: sortOrder }
        break
      case 'created_at':
        orderByClause = { created_at: sortOrder }
        break
      case 'updated_at':
        orderByClause = { updated_at: sortOrder }
        break
      case 'status':
        orderByClause = { status: sortOrder }
        break
      default:
        orderByClause = { sort_order: sortOrder }
    }

    const modules = await withDatabaseRetry(async () => {
      try {
        // Try the full query first
        return await prisma.modules.findMany({
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
          orderBy: orderByClause,
        })
      } catch (complexQueryError) {
        console.warn('Complex query failed, trying simplified query:', complexQueryError)
        
        // Fallback to simpler query without complex includes
        return await prisma.modules.findMany({
          where: whereClause,
          include: {
            users: {
              select: {
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                other_modules: true,
                course_modules: true,
              },
            },
          },
          orderBy: orderByClause,
        })
      }
    })

    // Get all unique tags for this user (for filtering UI)
    let allUserTags: string[] = []
    try {
      allUserTags = await withDatabaseRetry(async () => {
        const userModules = await prisma.modules.findMany({
          where: { author_id: session.user.id },
          select: { tags: true }
        })
        
        const tagSet = new Set<string>()
        userModules.forEach(module => {
          if (module.tags && Array.isArray(module.tags)) {
            module.tags.forEach(tag => tagSet.add(tag))
          }
        })
        
        return Array.from(tagSet).sort()
      })
    } catch (tagsError) {
      console.warn('Failed to fetch user tags, continuing without tags:', tagsError)
      allUserTags = []
    }

    return NextResponse.json({ modules, availableTags: allUserTags })
  } catch (error) {
    console.error('Error fetching modules:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      cause: error instanceof Error ? error.cause : 'No cause',
      name: error instanceof Error ? error.name : 'Unknown error type'
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch modules',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    )
  }
}
