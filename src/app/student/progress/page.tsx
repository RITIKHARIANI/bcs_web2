import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth/config'
import { AuthenticatedLayout } from '@/components/layouts/app-layout'
import { TrendingUp, ArrowLeft } from 'lucide-react'

export default async function StudentProgressPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/student/progress')
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="cognitive-card p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full">
              <TrendingUp className="h-16 w-16 text-purple-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Progress Tracking
          </h1>

          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Learning progress tracking will be available in a future update. This feature will allow you to track your course completion, module progress, and learning streaks.
          </p>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">Coming Soon:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Module completion tracking</li>
                <li>• Time spent on learning</li>
                <li>• Learning streak calendar</li>
                <li>• Course progress visualization</li>
                <li>• Achievement badges</li>
              </ul>
            </div>
          </div>

          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neural-primary to-synapse-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
