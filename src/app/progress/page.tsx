import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { AuthenticatedLayout } from '@/components/layouts/app-layout';
import { CourseProgressCard } from '@/components/progress/CourseProgressCard';
import { BookOpen, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';

async function getUserProgress(userId: string) {
  try {
    // Direct database query instead of API fetch (fixes Bug #1)
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
      startedAt: enrollment.started_at.toISOString(),
      lastAccessed: enrollment.last_accessed.toISOString(),
      completionPct: enrollment.completion_pct,
      modulesCompleted: enrollment.modules_completed,
      modulesTotal: enrollment.modules_total,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        slug: enrollment.course.slug,
        description: enrollment.course.description,
        moduleCount: enrollment.course._count.course_modules,
        instructor: {
          id: enrollment.course.users.id,
          name: enrollment.course.users.name,
          avatarUrl: enrollment.course.users.avatar_url,
        },
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

    return {
      stats: {
        totalEnrolledCourses,
        totalCompletedCourses,
        totalCompletedModules,
        averageProgress: avgProgress,
      },
      enrolledCourses: coursesWithProgress,
      recentActivity: recentCompletions,
    };
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return null;
  }
}

export const metadata = {
  title: 'My Progress - Brain & Cognitive Sciences',
  description: 'Track your learning progress across all enrolled courses',
};

export default async function ProgressPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/progress');
  }

  // Fetch progress data using API endpoint
  const progressData = await getUserProgress(session.user.id);

  const stats = progressData?.stats || {
    totalEnrolledCourses: 0,
    totalCompletedCourses: 0,
    totalCompletedModules: 0,
    averageProgress: 0,
  };

  const enrolledCourses = progressData?.enrolledCourses || [];

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neural-primary mb-2">
            My Learning Progress
          </h1>
          <p className="text-muted-foreground">
            Track your progress across all enrolled courses
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="cognitive-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalEnrolledCourses}
            </div>
            <div className="text-sm text-muted-foreground">
              Enrolled Courses
            </div>
          </div>

          <div className="cognitive-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalCompletedModules}
            </div>
            <div className="text-sm text-muted-foreground">
              Modules Completed
            </div>
          </div>

          <div className="cognitive-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.averageProgress}%
            </div>
            <div className="text-sm text-muted-foreground">
              Average Progress
            </div>
          </div>

          <div className="cognitive-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalCompletedCourses}
            </div>
            <div className="text-sm text-muted-foreground">
              Courses Completed
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Courses
          </h2>

          {enrolledCourses.length === 0 ? (
            <div className="cognitive-card p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Courses Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start your learning journey by enrolling in a course
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-neural-primary to-synapse-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {enrolledCourses.map((enrollment: any) => (
                <CourseProgressCard
                  key={enrollment.trackingId}
                  course={enrollment.course}
                  progress={{
                    completionPct: enrollment.completionPct,
                    modulesCompleted: enrollment.modulesCompleted,
                    modulesTotal: enrollment.modulesTotal,
                    lastAccessed: new Date(enrollment.lastAccessed),
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {progressData?.recentActivity && progressData.recentActivity.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="cognitive-card p-6">
              <div className="space-y-4">
                {progressData.recentActivity.map((activity: any, index: number) => (
                  <div
                    key={`${activity.moduleId}-${index}`}
                    className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Completed {activity.moduleTitle}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        in {activity.courseTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.completedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
