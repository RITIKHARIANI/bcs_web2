import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { AuthenticatedLayout } from '@/components/layouts/app-layout'
import { StudentDashboard } from '@/components/student/StudentDashboard'
import { StartedCoursesList } from '@/components/student/StartedCoursesList'
import { EmptyEnrollmentsState } from '@/components/student/EmptyEnrollmentsState'
import { prisma } from '@/lib/db'
import { withDatabaseRetry } from '@/lib/retry'

export default async function StudentDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/student/dashboard')
  }

  // Fetch started courses
  const startedCourses = await withDatabaseRetry(async () => {
    return await prisma.course_tracking.findMany({
      where: {
        student_id: session.user.id,
        status: 'active',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            status: true,
            users: {
              select: {
                id: true,
                name: true,
                avatar_url: true,
                university: true,
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
      orderBy: { started_at: 'desc' },
    });
  });

  // Transform data for components
  const courses = startedCourses.map((tracking) => ({
    trackingId: tracking.id,
    startedAt: tracking.started_at.toISOString(),
    lastAccessed: tracking.last_accessed.toISOString(),
    course: {
      id: tracking.course.id,
      title: tracking.course.title,
      slug: tracking.course.slug,
      description: tracking.course.description,
      status: tracking.course.status,
      moduleCount: tracking.course._count.course_modules,
      instructor: {
        id: tracking.course.users.id,
        name: tracking.course.users.name,
        avatarUrl: tracking.course.users.avatar_url,
        university: tracking.course.users.university,
      },
    },
  }));

  const enrolledCoursesCount = courses.length;
  const completedModulesCount = 0; // Week 4 feature
  const progressPercentage = 0; // Week 4 feature

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentDashboard
          userName={session.user.name || 'Student'}
          enrolledCoursesCount={enrolledCoursesCount}
          completedModulesCount={completedModulesCount}
          progressPercentage={progressPercentage}
        />

        {/* Started Courses Section */}
        <div className="mt-8">
          {enrolledCoursesCount === 0 ? (
            <EmptyEnrollmentsState />
          ) : (
            <StartedCoursesList courses={courses} />
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
