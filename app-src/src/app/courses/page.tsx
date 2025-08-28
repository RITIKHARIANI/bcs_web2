import { PublicCourseCatalog } from '@/components/public/course-catalog'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Course Catalog | BCS E-Textbook Platform',
  description: 'Browse all available Brain and Cognitive Sciences courses. Access comprehensive learning materials and modules created by faculty.',
  keywords: 'brain sciences, cognitive science, courses, education, neuroscience, psychology'
}

export default function CourseCatalogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link href="/" className="block">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  BCS E-Textbook Platform
                </h1>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Brain and Cognitive Sciences Department
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← Home
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">
                  Faculty Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              📚 Course Catalog
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Explore comprehensive learning materials in Brain and Cognitive Sciences. 
              All courses are freely accessible and created by our expert faculty.
            </p>
            <div className="mt-8 flex justify-center space-x-6 text-sm text-blue-200">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Free Access
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Faculty Created
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                University Quality
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PublicCourseCatalog />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300">
              © 2024 Brain and Cognitive Sciences Department. All course materials are freely accessible for educational purposes.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                Home
              </Link>
              <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Faculty Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
