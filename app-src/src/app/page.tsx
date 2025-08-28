import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                BCS E-Textbook Platform
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Brain and Cognitive Sciences Department
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/courses">
                <Button variant="outline">Browse Courses</Button>
              </Link>
              <Link href="/auth/login">
                <Button>Faculty Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Learning Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore comprehensive courses in Brain and Cognitive Sciences through 
            our modern e-textbook platform with rich multimedia content and 
            hierarchical learning modules.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Rich Content
              </CardTitle>
              <CardDescription>
                Interactive modules with videos, images, and multimedia content 
                for enhanced learning experiences.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Hierarchical Learning
              </CardTitle>
              <CardDescription>
                Organized course structure with nested modules and clear 
                learning pathways from basic to advanced concepts.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Public Access
              </CardTitle>
              <CardDescription>
                Free access to all published courses and materials for students 
                and researchers worldwide.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Start Learning Today
              </h3>
              <p className="text-gray-600 mb-6">
                Browse our course catalog and dive into the fascinating world of 
                brain and cognitive sciences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/courses">
                  <Button size="lg">View All Courses</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" variant="outline">Faculty Registration</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Brain and Cognitive Sciences Department. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}