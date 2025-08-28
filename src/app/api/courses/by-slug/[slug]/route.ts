import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const course = await prisma.course.findFirst({
      where: {
        slug,
        status: 'published', // Only show published courses publicly
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        courseModules: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                content: true,
                status: true,
                parentModuleId: true,
                sortOrder: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          where: {
            module: {
              status: 'published', // Only include published modules
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: {
            courseModules: true,
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error fetching course by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}
