import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { z } from 'zod';

const completeModuleSchema = z.object({
  moduleId: z.string().min(1),
  courseId: z.string().min(1),
  completed: z.boolean().optional(), // If not provided, toggle current state
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = completeModuleSchema.parse(body);
    const { moduleId, courseId, completed } = validatedData;
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
      });
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You must be enrolled in this course to track progress' },
        { status: 403 }
      );
    }

    // Get or create progress record
    const existingProgress = await withDatabaseRetry(async () => {
      return await prisma.module_progress.findUnique({
        where: {
          user_id_module_id_course_id: {
            user_id: userId,
            module_id: moduleId,
            course_id: courseId,
          },
        },
      });
    });

    // Determine new completion state
    const shouldComplete = completed !== undefined
      ? completed
      : (existingProgress?.status !== 'completed');

    // Update or create progress record
    const progress = await withDatabaseRetry(async () => {
      return await prisma.module_progress.upsert({
        where: {
          user_id_module_id_course_id: {
            user_id: userId,
            module_id: moduleId,
            course_id: courseId,
          },
        },
        update: {
          status: shouldComplete ? 'completed' : 'not_started',
          completed_at: shouldComplete ? new Date() : null,
        },
        create: {
          user_id: userId,
          module_id: moduleId,
          course_id: courseId,
          status: shouldComplete ? 'completed' : 'not_started',
          completed_at: shouldComplete ? new Date() : null,
        },
      });
    });

    // Update course_tracking completion percentage
    await updateCourseProgress(userId, courseId);

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Error updating module progress:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update module progress' },
      { status: 500 }
    );
  }
}

// Helper function to recalculate course completion percentage
async function updateCourseProgress(userId: string, courseId: string) {
  try {
    // Get total modules in course
    const totalModules = await withDatabaseRetry(async () => {
      return await prisma.course_modules.count({
        where: {
          course_id: courseId,
          modules: {
            status: 'published', // Only count published modules
          },
        },
      });
    });

    // Get completed modules count
    const completedModules = await withDatabaseRetry(async () => {
      return await prisma.module_progress.count({
        where: {
          user_id: userId,
          course_id: courseId,
          status: 'completed',
        },
      });
    });

    // Calculate percentage
    const completionPct = totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

    // Update course_tracking
    await withDatabaseRetry(async () => {
      return await prisma.course_tracking.update({
        where: {
          course_id_user_id: {
            course_id: courseId,
            user_id: userId,
          },
        },
        data: {
          completion_pct: completionPct,
          modules_completed: completedModules,
          modules_total: totalModules,
          last_accessed: new Date(),
        },
      });
    });
  } catch (error) {
    console.error('Error updating course progress:', error);
    // Don't throw - this is a background update
  }
}
