import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (courseId) {
      // Get specific course structure
      const course = await prisma.courses.findFirst({
        where: {
          id: courseId,
          author_id: session.user.id,
        },
        include: {
          course_modules: {
            include: {
              modules: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  description: true,
                  status: true,
                  parent_module_id: true,
                  sort_order: true,
                },
              },
            },
            orderBy: {
              sort_order: 'asc',
            },
          },
        },
      })

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      return NextResponse.json({ 
        type: 'course',
        course,
        modules: course.course_modules.map(cm => cm.modules)
      })
    } else {
      // Get all user's modules and courses for full structure view
      const [modules, courses] = await Promise.all([
        prisma.modules.findMany({
          where: {
            author_id: session.user.id,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            status: true,
            parent_module_id: true,
            sort_order: true,
            created_at: true,
          },
          orderBy: {
            sort_order: 'asc',
          },
        }),
        prisma.courses.findMany({
          where: {
            author_id: session.user.id,
          },
          include: {
                      course_modules: {
            include: {
              modules: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  description: true,
                  status: true,
                  parent_module_id: true,
                  sort_order: true,
                },
              },
            },
          },
            _count: {
              select: {
                course_modules: true,
              },
            },
          },
        }),
      ])

      return NextResponse.json({
        type: 'full',
        modules,
        courses,
      })
    }
  } catch (error) {
    console.error('Error fetching course structure:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course structure' },
      { status: 500 }
    )
  }
}
