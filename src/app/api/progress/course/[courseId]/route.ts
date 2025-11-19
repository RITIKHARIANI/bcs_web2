import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = await params;
    const userId = session.user.id;

    // Verify user is enrolled in the course
    const enrollment = await withDatabaseRetry(async () => {
      return await prisma.course_tracking.findUnique({
        where: {
          course_id_user_id: {
            course_id: courseId,
            user_id: userId,
          },
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
            },
          },
        },
      });
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 403 }
      );
    }

    // Get all published modules in the course with progress
    const courseModules = await withDatabaseRetry(async () => {
      return await prisma.course_modules.findMany({
        where: {
          course_id: courseId,
          modules: {
            status: 'published',
          },
        },
        include: {
          modules: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              parent_module_id: true,
              sort_order: true,
            },
          },
        },
        orderBy: {
          sort_order: 'asc',
        },
      });
    });

    // Get all progress records for this user in this course
    const progressRecords = await withDatabaseRetry(async () => {
      return await prisma.module_progress.findMany({
        where: {
          user_id: userId,
          course_id: courseId,
        },
      });
    });

    // Create a map of moduleId -> progress
    const progressMap = new Map(
      progressRecords.map(record => [record.module_id, record])
    );

    // Combine modules with their progress
    const modulesWithProgress = courseModules.map(cm => ({
      id: cm.modules.id,
      title: cm.modules.title,
      slug: cm.modules.slug,
      description: cm.modules.description,
      sortOrder: cm.sort_order,
      parentModuleId: cm.modules.parent_module_id,
      progress: progressMap.get(cm.modules.id) || {
        status: 'not_started',
        completed_at: null,
      },
    }));

    return NextResponse.json({
      course: enrollment.course,
      enrollment: {
        startedAt: enrollment.started_at,
        lastAccessed: enrollment.last_accessed,
        completionPct: enrollment.completion_pct,
        modulesCompleted: enrollment.modules_completed,
        modulesTotal: enrollment.modules_total,
      },
      modules: modulesWithProgress,
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course progress' },
      { status: 500 }
    );
  }
}
