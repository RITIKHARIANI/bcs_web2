import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { withDatabaseRetry } from '@/lib/retry'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all statistics in parallel for better performance
    const [modulesCount, coursesCount, studentsCount, totalViews, recentModules, recentCourses] = await Promise.all([
      // Count user's modules
      withDatabaseRetry(async () => 
        prisma.modules.count({
          where: { author_id: session.user.id }
        })
      ),
      
      // Count user's courses
      withDatabaseRetry(async () =>
        prisma.courses.count({
          where: { author_id: session.user.id }
        })
      ),
      
      // Count students enrolled in user's courses (placeholder - will implement when enrollment is added)
      Promise.resolve(0),
      
      // Calculate total views (placeholder - will implement when view tracking is added)  
      Promise.resolve(0),
      
      // Get recent modules (last 5)
      withDatabaseRetry(async () =>
        prisma.modules.findMany({
          where: { author_id: session.user.id },
          include: {
            users: {
              select: { name: true, email: true }
            }
          },
          orderBy: { updated_at: 'desc' },
          take: 5
        })
      ),
      
      // Get recent courses (last 5)
      withDatabaseRetry(async () =>
        prisma.courses.findMany({
          where: { author_id: session.user.id },
          include: {
            users: {
              select: { name: true, email: true }
            },
            _count: {
              select: { course_modules: true }
            }
          },
          orderBy: { updated_at: 'desc' },
          take: 5
        })
      ),
    ])

    // Transform recent modules and courses for frontend
    const recentActivity = [
      ...recentModules.map(module => ({
        id: module.id,
        title: module.title,
        type: 'module' as const,
        status: module.status,
        updatedAt: module.updated_at.toISOString(),
        author: {
          name: module.users.name,
          email: module.users.email
        }
      })),
      ...recentCourses.map(course => ({
        id: course.id,
        title: course.title,
        type: 'course' as const,
        status: course.status,
        updatedAt: course.updated_at.toISOString(),
        moduleCount: course._count.course_modules,
        author: {
          name: course.users.name,
          email: course.users.email
        }
      }))
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10)

    return NextResponse.json({
      stats: {
        modules: modulesCount,
        courses: coursesCount,
        students: studentsCount,
        views: totalViews,
      },
      recentActivity
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
