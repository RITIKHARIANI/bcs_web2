import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';

/**
 * POST /api/progress/module/complete
 * Mark a module as complete, award XP, unlock dependents
 *
 * Quest Map Feature - Core completion endpoint
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { moduleId, courseId } = body;

  if (!moduleId || !courseId) {
    return NextResponse.json(
      { error: 'moduleId and courseId required' },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  const result = await withDatabaseRetry(async () => {
    // Verify enrollment
    const enrollment = await prisma.course_tracking.findUnique({
      where: {
        course_id_user_id: { course_id: courseId, user_id: userId }
      }
    });

    if (!enrollment) {
      return { error: 'Not enrolled in course', status: 403 };
    }

    // Get module data
    const moduleData = await prisma.modules.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        title: true,
        xp_reward: true,
        quest_type: true,
        difficulty_level: true
      }
    });

    if (!moduleData) {
      return { error: 'Module not found', status: 404 };
    }

    // Upsert progress record
    const now = new Date();
    const progress = await prisma.module_progress.upsert({
      where: {
        user_id_module_id_course_id: {
          user_id: userId,
          module_id: moduleId,
          course_id: courseId
        }
      },
      update: {
        status: 'completed',
        completed_at: now,
        xp_earned: moduleData.xp_reward,
        updated_at: now
      },
      create: {
        user_id: userId,
        module_id: moduleId,
        course_id: courseId,
        status: 'completed',
        completed_at: now,
        started_at: now,
        xp_earned: moduleData.xp_reward
      }
    });

    // Update user gamification stats (XP and level)
    const userStats = await prisma.user_gamification_stats.upsert({
      where: { user_id: userId },
      update: {
        total_xp: { increment: moduleData.xp_reward },
        last_active_date: now
      },
      create: {
        user_id: userId,
        total_xp: moduleData.xp_reward,
        level: 1,
        last_active_date: now
      }
    });

    // Calculate new level (exponential: Level = floor(sqrt(totalXP / 100)))
    const newLevel = Math.floor(Math.sqrt(userStats.total_xp / 100));
    if (newLevel > userStats.level) {
      await prisma.user_gamification_stats.update({
        where: { user_id: userId },
        data: { level: newLevel }
      });
    }

    // Update learning session for today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    await prisma.learning_sessions.upsert({
      where: {
        user_id_date: {
          user_id: userId,
          date: today
        }
      },
      update: {
        modules_completed: { increment: 1 },
        last_activity: now
      },
      create: {
        user_id: userId,
        date: today,
        modules_completed: 1,
        first_activity: now,
        last_activity: now
      }
    });

    // Update course tracking
    const allProgress = await prisma.module_progress.findMany({
      where: { user_id: userId, course_id: courseId }
    });

    const completedCount = allProgress.filter(p => p.status === 'completed').length;

    const courseModules = await prisma.course_modules.findMany({
      where: { course_id: courseId },
      select: { module_id: true }
    });

    const totalModules = courseModules.length;
    const completionPct = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    await prisma.course_tracking.update({
      where: {
        course_id_user_id: { course_id: courseId, user_id: userId }
      },
      data: {
        modules_completed: completedCount,
        modules_total: totalModules,
        completion_pct: completionPct,
        last_accessed: now
      }
    });

    // Find newly unlocked modules
    // Get all modules in this course with their prerequisites
    const allModulesInCourse = await prisma.course_modules.findMany({
      where: { course_id: courseId },
      include: {
        modules: {
          select: {
            id: true,
            title: true,
            prerequisite_module_ids: true
          }
        }
      }
    });

    // Build a map of module IDs to their completion status
    const completedModuleIds = new Set(
      allProgress.filter(p => p.status === 'completed').map(p => p.module_id)
    );

    // Check which modules are newly unlocked
    const newlyUnlocked = allModulesInCourse
      .map(cm => cm.modules)
      .filter(m => {
        // Skip if no prerequisites
        const prereqs = m.prerequisite_module_ids || [];
        if (prereqs.length === 0) return false;

        // Skip if this module doesn't depend on the just-completed module
        if (!prereqs.includes(moduleId)) return false;

        // Skip if already completed
        if (completedModuleIds.has(m.id)) return false;

        // Check if ALL prerequisites are now completed
        return prereqs.every(prereqId => completedModuleIds.has(prereqId));
      })
      .map(m => ({ id: m.id, title: m.title }));

    // Check for achievements (simple implementation for now)
    const achievements: Array<{ id: string; title: string; icon: string }> = [];

    // Achievement: First Module
    if (completedCount === 1) {
      achievements.push({
        id: 'first-module',
        title: 'First Steps',
        icon: '🎯'
      });
    }

    // Achievement: 5 Modules
    if (completedCount === 5) {
      achievements.push({
        id: 'five-modules',
        title: 'On a Roll',
        icon: '🔥'
      });
    }

    // Achievement: Course Complete
    if (completionPct === 100) {
      achievements.push({
        id: 'course-complete',
        title: 'Course Champion',
        icon: '🏆'
      });
    }

    // TODO: Store achievements in database

    return {
      success: true,
      xpAwarded: moduleData.xp_reward,
      totalXP: userStats.total_xp + moduleData.xp_reward,
      level: newLevel > userStats.level ? newLevel : userStats.level,
      leveledUp: newLevel > userStats.level,
      newlyUnlockedModules: newlyUnlocked,
      completionPct,
      modulesCompleted: completedCount,
      totalModules,
      achievements
    };
  });

  if ('error' in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json(result);
}
