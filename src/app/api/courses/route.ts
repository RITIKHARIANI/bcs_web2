import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const status = searchParams.get('status') || 'published'

    const courses = await prisma.course.findMany({
      where: {
        status,
        ...(featured === 'true' && { featured: true }),
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        courseModules: {
          include: {
            module: true,
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
      orderBy: {
        updatedAt: 'desc',
      },
    })

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      instructor: course.author.name,
      moduleCount: course._count.courseModules,
      status: course.status,
      featured: course.featured,
      tags: course.tags,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }))

    return NextResponse.json({ courses: formattedCourses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
