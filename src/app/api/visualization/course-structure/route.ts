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
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          authorId: session.user.id,
        },
        include: {
          courseModules: {
            include: {
              module: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  description: true,
                  status: true,
                  parentModuleId: true,
                  sortOrder: true,
                },
              },
            },
            orderBy: {
              sortOrder: 'asc',
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
        modules: course.courseModules.map(cm => cm.module)
      })
    } else {
      // Get all user's modules and courses for full structure view
      const [modules, courses] = await Promise.all([
        prisma.module.findMany({
          where: {
            authorId: session.user.id,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            status: true,
            parentModuleId: true,
            sortOrder: true,
            createdAt: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        }),
        prisma.course.findMany({
          where: {
            authorId: session.user.id,
          },
          include: {
                      courseModules: {
            include: {
              module: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  description: true,
                  status: true,
                  parentModuleId: true,
                  sortOrder: true,
                },
              },
            },
          },
            _count: {
              select: {
                courseModules: true,
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
