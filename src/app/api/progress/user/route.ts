import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all enrolled courses with progress
    const enrolledCourses = await withDatabaseRetry(async () => {
      return await prisma.course_tracking.findMany({
        where: {
          user_id: userId,
          status: 'active',
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              users: {
                select: {
                  id: true,
                  name: true,
                  avatar_url: true,
                },
              },
              _count: {
                select: {
                  course_modules: true,
                },
              },
            },
          },
        },
        orderBy: {
          last_accessed: 'desc',
        },
      });
    });

    // Get total completed modules across all courses
    const totalCompletedModules = await withDatabaseRetry(async () => {
      return await prisma.module_progress.count({
        where: {
          user_id: userId,
          status: 'completed',
        },
      });
    });

    // Get recently completed modules (last 10)
    const recentActivity = await withDatabaseRetry(async () => {
      return await prisma.module_progress.findMany({
        where: {
          user_id: userId,
          status: 'completed',
          completed_at: {
            not: null,
          },
        },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          completed_at: 'desc',
        },
        take: 10,
      });
    });

    // Calculate overall stats
    const totalEnrolledCourses = enrolledCourses.length;
    const totalCompletedCourses = enrolledCourses.filter(
      e => e.completion_pct === 100
    ).length;

    // Calculate average progress across all courses
    const avgProgress = totalEnrolledCourses > 0
      ? Math.round(
          enrolledCourses.reduce((sum, e) => sum + e.completion_pct, 0) /
            totalEnrolledCourses
        )
      : 0;

    // Transform enrolled courses data
    const coursesWithProgress = enrolledCourses.map(enrollment => ({
      trackingId: enrollment.id,
      startedAt: enrollment.started_at,
      lastAccessed: enrollment.last_accessed,
      completionPct: enrollment.completion_pct,
      modulesCompleted: enrollment.modules_completed,
      modulesTotal: enrollment.modules_total,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        slug: enrollment.course.slug,
        description: enrollment.course.description,
        instructor: {
          id: enrollment.course.users.id,
          name: enrollment.course.users.name,
          avatarUrl: enrollment.course.users.avatar_url,
        },
        moduleCount: enrollment.course._count.course_modules,
      },
    }));

    // Transform recent activity
    const recentCompletions = recentActivity.map(activity => ({
      moduleId: activity.module.id,
      moduleTitle: activity.module.title,
      moduleSlug: activity.module.slug,
      courseId: activity.course.id,
      courseTitle: activity.course.title,
      courseSlug: activity.course.slug,
      completedAt: activity.completed_at,
    }));

    return NextResponse.json({
      stats: {
        totalEnrolledCourses,
        totalCompletedCourses,
        totalCompletedModules,
        averageProgress: avgProgress,
      },
      enrolledCourses: coursesWithProgress,
      recentActivity: recentCompletions,
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}
