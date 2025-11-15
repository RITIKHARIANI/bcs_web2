import { BookOpen, CheckCircle, TrendingUp } from 'lucide-react'
import { EmptyEnrollmentsState } from './EmptyEnrollmentsState'

interface StudentDashboardProps {
  userName: string
  enrolledCoursesCount?: number
  completedModulesCount?: number
  progressPercentage?: number
}

export function StudentDashboard({
  userName,
  enrolledCoursesCount = 0,
  completedModulesCount = 0,
  progressPercentage = 0
}: StudentDashboardProps) {
  const stats = [
    {
      icon: BookOpen,
      label: 'Enrolled Courses',
      value: enrolledCoursesCount,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: CheckCircle,
      label: 'Completed Modules',
      value: completedModulesCount,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      value: `${progressPercentage}%`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-neural-primary mb-2">
          Welcome back, {userName}!
        </h2>
        <p className="text-muted-foreground">
          Track your learning progress and discover new courses
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="cognitive-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          My Courses
        </h3>

        {enrolledCoursesCount === 0 ? (
          <EmptyEnrollmentsState />
        ) : (
          <div className="cognitive-card p-6">
            <p className="text-muted-foreground">
              Course enrollment display will be implemented in Week 3
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
