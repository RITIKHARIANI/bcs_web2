import { CourseDetailView } from '@/components/public/course-detail-view'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

async function getCourse(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/courses/${slug}`, {
      cache: 'no-store' // Ensure fresh data for dynamic content
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch course')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { slug } = await params
  const data = await getCourse(slug)
  
  if (!data?.course) {
    return {
      title: 'Course Not Found | BCS E-Textbook Platform'
    }
  }

  const course = data.course
  
  return {
    title: `${course.title} | BCS E-Textbook Platform`,
    description: course.description || `Learn ${course.title} from ${course.author.name}. Comprehensive Brain and Cognitive Sciences course with ${course.modules.length} modules.`,
    keywords: `${course.title}, ${course.author.name}, brain sciences, cognitive science, ${course.tags.join(', ')}`,
    openGraph: {
      title: course.title,
      description: course.description,
      type: 'article',
      url: `/courses/${course.slug}`
    }
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const data = await getCourse(slug)
  
  if (!data?.course) {
    notFound()
  }

  const course = data.course

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
              <Link href="/courses">
                <Button variant="ghost" size="sm">
                  ← Course Catalog
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Faculty Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="text-blue-200 text-sm mb-6">
              <Link href="/courses" className="hover:text-white transition-colors">
                Course Catalog
              </Link>
              <span className="mx-2">→</span>
              <span className="text-white">{course.title}</span>
            </nav>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-4">
                  {course.title}
                </h1>
                {course.description && (
                  <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                    {course.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-6 text-blue-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>By {course.author.name}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{course.modules.length} module{course.modules.length !== 1 ? 's' : ''}</span>
                  </div>
                  {course.featured && (
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-2">⭐</span>
                      <span>Featured Course</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {course.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-100 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CourseDetailView course={course} />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300">
              © 2024 Brain and Cognitive Sciences Department. Course materials by {course.author.name}.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <Link href="/courses" className="text-blue-600 dark:text-blue-400 hover:underline">
                Browse More Courses
              </Link>
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                Home
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
