import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereCondition = {
      status: 'published', // Only show published courses
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { tags: { hasSome: [search] } }
        ]
      })
    }

    // Get courses with module count
    const courses = await prisma.course.findMany({
      where: whereCondition,
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        courseModules: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                moduleNumber: true,
                status: true
              }
            }
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        _count: {
          select: {
            courseModules: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { updatedAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const totalCount = await prisma.course.count({
      where: whereCondition
    })

    // Transform the data for public consumption
    const publicCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      author: {
        name: course.author.name
      },
      tags: course.tags,
      featured: course.featured,
      moduleCount: course._count.courseModules,
      modules: course.courseModules.map(cm => ({
        id: cm.module.id,
        title: cm.customTitle || cm.module.title,
        moduleNumber: cm.module.moduleNumber,
        sortOrder: cm.sortOrder
      })),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }))

    return NextResponse.json({
      courses: publicCourses,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching public courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
