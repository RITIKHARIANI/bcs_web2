import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { AuthenticatedLayout } from '@/components/layouts/app-layout'
import { StudentDashboard } from '@/components/student/StudentDashboard'

export default async function StudentDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/student/dashboard')
  }

  // In Week 3, we'll fetch actual enrollment data from database
  // For now, showing empty state
  const enrolledCoursesCount = 0
  const completedModulesCount = 0
  const progressPercentage = 0

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentDashboard
          userName={session.user.name || 'Student'}
          enrolledCoursesCount={enrolledCoursesCount}
          completedModulesCount={completedModulesCount}
          progressPercentage={progressPercentage}
        />
      </div>
    </AuthenticatedLayout>
  )
}
