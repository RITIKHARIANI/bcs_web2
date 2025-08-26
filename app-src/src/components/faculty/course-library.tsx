'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface CourseModule {
  id: string
  sortOrder: number
  customTitle?: string
  module: {
    id: string
    title: string
    moduleNumber: string
    status: string
  }
}

interface Course {
  id: string
  title: string
  description?: string
  slug: string
  status: string
  tags: string[]
  createdAt: string
  updatedAt: string
  courseModules: CourseModule[]
  _count: {
    courseModules: number
  }
}

interface CourseLibraryProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
}

export function CourseLibrary({ user }: CourseLibraryProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/courses')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses')
      }

      setCourses(data.courses || [])
    } catch (error) {
      console.error('Fetch courses error:', error)
      setError('Failed to load courses')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to delete course')
        return
      }

      // Refresh courses list
      fetchCourses()
    } catch (error) {
      console.error('Delete course error:', error)
      alert('Failed to delete course')
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading courses...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchCourses}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex space-x-4">
          <Link href="/faculty/courses/create">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Course
            </Button>
          </Link>
          <Link href="/faculty/dashboard">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No courses match your search.' : 'Start building your course library by creating your first course.'}
            </p>
            {!searchTerm && (
              <Link href="/faculty/courses/create">
                <Button>Create Your First Course</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onDelete={deleteCourse}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CourseCardProps {
  course: Course
  onDelete: (id: string) => void
}

function CourseCard({ course, onDelete }: CourseCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="relative h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                {course.status}
              </span>
            </div>
            {course.description && (
              <CardDescription className="mb-3">
                {course.description}
              </CardDescription>
            )}
            {course.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Module Count and Info */}
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>{course._count.courseModules} module{course._count.courseModules !== 1 ? 's' : ''}</span>
              <span>Updated {formatDate(course.updatedAt)}</span>
            </div>
          </div>

          {/* Module List Preview */}
          {course.courseModules.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Modules:</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {course.courseModules.slice(0, 3).map((courseModule) => (
                  <div key={courseModule.id} className="text-xs text-gray-600 flex items-center">
                    <span className="mr-2">{courseModule.sortOrder}.</span>
                    <span>{courseModule.module.moduleNumber} - {courseModule.module.title}</span>
                  </div>
                ))}
                {course.courseModules.length > 3 && (
                  <div className="text-xs text-gray-500 italic">
                    +{course.courseModules.length - 3} more modules...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Link href={`/faculty/courses/${course.id}/edit`}>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Button>
              </Link>
              
              <Link href={`/courses/${course.slug}`}>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </Button>
              </Link>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(course.id)}
              className="text-red-600 hover:text-red-700"
              title="Delete Course"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
