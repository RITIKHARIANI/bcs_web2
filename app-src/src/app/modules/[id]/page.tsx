import { ModuleView } from '@/components/public/module-view'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ModulePageProps {
  params: Promise<{ id: string }>
}

async function getModule(id: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/modules/${id}`, {
      cache: 'no-store' // Ensure fresh data for dynamic content
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch module')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching module:', error)
    return null
  }
}

export async function generateMetadata({ params }: ModulePageProps) {
  const { id } = await params
  const data = await getModule(id)
  
  if (!data?.module) {
    return {
      title: 'Module Not Found | BCS E-Textbook Platform'
    }
  }

  const module = data.module
  
  return {
    title: `${module.moduleNumber}: ${module.title} | BCS E-Textbook Platform`,
    description: module.description || `Learn about ${module.title} by ${module.author.name}. Part of Brain and Cognitive Sciences educational content.`,
    keywords: `${module.title}, ${module.author.name}, brain sciences, cognitive science, module ${module.moduleNumber}`,
    openGraph: {
      title: `${module.moduleNumber}: ${module.title}`,
      description: module.description,
      type: 'article',
      url: `/modules/${module.id}`
    }
  }
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { id } = await params
  const data = await getModule(id)
  
  if (!data?.module) {
    notFound()
  }

  const module = data.module

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

      {/* Module Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="text-indigo-200 text-sm mb-6">
              <Link href="/courses" className="hover:text-white transition-colors">
                Course Catalog
              </Link>
              {module.courses.length > 0 && (
                <>
                  <span className="mx-2">→</span>
                  <Link 
                    href={`/courses/${module.courses[0].slug}`} 
                    className="hover:text-white transition-colors"
                  >
                    {module.courses[0].title}
                  </Link>
                </>
              )}
              <span className="mx-2">→</span>
              <span className="text-white">Module {module.moduleNumber}</span>
            </nav>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-100 rounded-full text-sm font-medium mr-4">
                    Module {module.moduleNumber}
                  </span>
                  {module.parentModule && (
                    <span className="text-indigo-200 text-sm">
                      Submodule of {module.parentModule.moduleNumber}: {module.parentModule.title}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-white mb-4">
                  {module.title}
                </h1>
                
                {module.description && (
                  <p className="text-xl text-indigo-100 mb-6 leading-relaxed">
                    {module.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-6 text-indigo-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>By {module.author.name}</span>
                  </div>
                  
                  {module.subModules.length > 0 && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>{module.subModules.length} submodule{module.subModules.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {module.courses.length > 0 && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Used in {module.courses.length} course{module.courses.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ModuleView module={module} />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300">
              © 2024 Brain and Cognitive Sciences Department. Module content by {module.author.name}.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              {module.courses.length > 0 && (
                <Link 
                  href={`/courses/${module.courses[0].slug}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Back to {module.courses[0].title}
                </Link>
              )}
              <Link href="/courses" className="text-blue-600 dark:text-blue-400 hover:underline">
                Browse All Courses
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
