'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Module {
  id: string
  title: string
  moduleNumber: string
  description?: string
  content?: string
  author: {
    name: string
  }
  parentModule?: {
    id: string
    title: string
    moduleNumber: string
  }
  subModules: Array<{
    id: string
    title: string
    moduleNumber: string
    description?: string
  }>
  siblings: Array<{
    id: string
    title: string
    moduleNumber: string
  }>
  courses: Array<{
    id: string
    title: string
    slug: string
  }>
  createdAt: string
  updatedAt: string
}

interface ModuleViewProps {
  module: Module
}

export function ModuleView({ module }: ModuleViewProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Navigation Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Course Context */}
        {module.courses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                📚 Course Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {module.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                    {course.title}
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    View full course →
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Parent Module */}
        {module.parentModule && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ⬆️ Parent Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/modules/${module.parentModule.id}`}
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mr-2">
                    {module.parentModule.moduleNumber}
                  </span>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {module.parentModule.title}
                  </h4>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Sibling Modules */}
        {module.siblings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                🔗 Related Modules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {module.siblings.map((sibling) => (
                <Link
                  key={sibling.id}
                  href={`/modules/${sibling.id}`}
                  className="block p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mr-2">
                      {sibling.moduleNumber}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {sibling.title}
                    </span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Module Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Module Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Author:</span>
              <p className="text-gray-600 dark:text-gray-400">{module.author.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
              <p className="text-gray-600 dark:text-gray-400">{formatDate(module.updatedAt)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Module Number:</span>
              <p className="text-gray-600 dark:text-gray-400">{module.moduleNumber}</p>
            </div>
            {module.subModules.length > 0 && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Submodules:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {module.subModules.length} submodule{module.subModules.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Module Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mr-3">
                    Module {module.moduleNumber}
                  </span>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {module.title}
                </CardTitle>
                {module.description && (
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {module.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {module.content ? (
              <div className="space-y-6">
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-em:text-gray-700 dark:prose-em:text-gray-300 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-a:text-blue-600 dark:prose-a:text-blue-400"
                  dangerouslySetInnerHTML={{ __html: module.content }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Content Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This module is being prepared by {module.author.name}. Please check back later for content.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submodules */}
        {module.subModules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                📚 Submodules
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Explore the detailed sections of this module
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {module.subModules.map((subModule) => (
                  <Link
                    key={subModule.id}
                    href={`/modules/${subModule.id}`}
                    className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mr-3">
                            {subModule.moduleNumber}
                          </span>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {subModule.title}
                          </h4>
                        </div>
                        {subModule.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 ml-8">
                            {subModule.description}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="ml-4">
                        View →
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              🧭 Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {module.courses.length > 0 && (
                <Link href={`/courses/${module.courses[0].slug}`}>
                  <Button variant="outline" size="sm">
                    ← Back to Course
                  </Button>
                </Link>
              )}
              
              <Link href="/courses">
                <Button variant="outline" size="sm">
                  Browse All Courses
                </Button>
              </Link>

              {module.parentModule && (
                <Link href={`/modules/${module.parentModule.id}`}>
                  <Button variant="outline" size="sm">
                    ↑ Parent Module
                  </Button>
                </Link>
              )}

              {module.subModules.length > 0 && (
                <Link href={`/modules/${module.subModules[0].id}`}>
                  <Button variant="outline" size="sm">
                    First Submodule →
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
