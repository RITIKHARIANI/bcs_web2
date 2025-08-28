'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  slug: string
  description?: string
  author: {
    name: string
  }
  tags: string[]
  featured: boolean
  moduleCount: number
  modules: Array<{
    id: string
    title: string
    moduleNumber: string
    sortOrder: number
  }>
  createdAt: string
  updatedAt: string
}

interface CourseCatalogData {
  courses: Course[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export function PublicCourseCatalog() {
  const [data, setData] = useState<CourseCatalogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [searchTerm])

  const fetchCourses = async (offset = 0, append = false) => {
    try {
      if (!append) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams({
        limit: '12',
        offset: offset.toString(),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/public/courses?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      
      const newData = await response.json()
      
      if (append && data) {
        setData({
          ...newData,
          courses: [...data.courses, ...newData.courses]
        })
      } else {
        setData(newData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (data && data.pagination.hasMore) {
      fetchCourses(data.courses.length, true)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Unable to Load Courses
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
        <Button onClick={() => fetchCourses()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Search courses by title, description, or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <span>
              {data ? `${data.pagination.total} course${data.pagination.total !== 1 ? 's' : ''} available` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      {data && data.courses.some(course => course.featured) && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <span className="text-yellow-500 mr-2">⭐</span>
            Featured Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.courses
              .filter(course => course.featured)
              .map((course) => (
                <CourseCard key={course.id} course={course} featured />
              ))}
          </div>
        </div>
      )}

      {/* All Courses */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {data && data.courses.some(course => course.featured) ? 'All Courses' : 'Available Courses'}
        </h2>
        
        {data && data.courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm 
                ? `No courses match "${searchTerm}". Try a different search term.`
                : 'No courses are currently available. Check back later for new content.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Load More Button */}
            {data && data.pagination.hasMore && (
              <div className="text-center pt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Loading More...
                    </>
                  ) : (
                    'Load More Courses'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface CourseCardProps {
  course: Course
  featured?: boolean
}

function CourseCard({ course, featured = false }: CourseCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 h-full flex flex-col ${
      featured ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
    }`}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
              {course.title}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              By {course.author.name}
            </CardDescription>
          </div>
          {featured && (
            <span className="text-yellow-500 ml-2">⭐</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {course.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1">
            {course.description}
          </p>
        )}
        
        <div className="space-y-3 mt-auto">
          {/* Tags */}
          {course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {course.tags.length > 3 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  +{course.tags.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Module Count */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{course.moduleCount} module{course.moduleCount !== 1 ? 's' : ''}</span>
            <span>Updated {formatDate(course.updatedAt)}</span>
          </div>
          
          {/* View Course Button */}
          <Link href={`/courses/${course.slug}`} className="block">
            <Button className="w-full">
              View Course
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}
