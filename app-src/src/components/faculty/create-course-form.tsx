'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Module {
  id: string
  title: string
  description?: string
  moduleNumber: string
  status: string
  subModules: Module[]
  _count?: {
    courseModules: number
    subModules: number
  }
}

interface CreateCourseFormProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
}

export function CreateCourseForm({ user }: CreateCourseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  })
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingModules, setIsLoadingModules] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  // Fetch modules when component mounts
  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setIsLoadingModules(true)
      const response = await fetch('/api/modules')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch modules')
      }

      setModules(data.modules || [])
    } catch (error) {
      console.error('Fetch modules error:', error)
      setErrors({ modules: 'Failed to load modules' })
    } finally {
      setIsLoadingModules(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Basic validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (selectedModules.length === 0) {
      newErrors.modules = 'Please select at least one module for the course'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags,
          moduleIds: selectedModules,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          const serverErrors: Record<string, string> = {}
          data.details.forEach((issue: { path: string[]; message: string }) => {
            serverErrors[issue.path[0]] = issue.message
          })
          setErrors(serverErrors)
        } else {
          setErrors({ general: data.error || 'Failed to create course' })
        }
      } else {
        setIsSuccess(true)
        // Redirect after short delay to show success message
        setTimeout(() => {
          router.push('/faculty/courses')
        }, 1500)
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const toggleModuleSelection = (moduleId: string) => {
    setSelectedModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId)
      } else {
        return [...prev, moduleId]
      }
    })
    // Clear modules error when user selects a module
    if (errors.modules) {
      setErrors(prev => ({ ...prev, modules: '' }))
    }
  }

  const getSelectedModulesList = () => {
    return selectedModules.map(id => modules.find(moduleItem => moduleItem.id === id)).filter(Boolean) as Module[]
  }

  const getAllModules = (moduleList: Module[]): Module[] => {
    let allModules: Module[] = []
    for (const moduleItem of moduleList) {
      allModules.push(moduleItem)
      if (moduleItem.subModules && moduleItem.subModules.length > 0) {
        allModules = allModules.concat(getAllModules(moduleItem.subModules))
      }
    }
    return allModules
  }

  const filteredModules = getAllModules(modules).filter(moduleItem =>
    moduleItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moduleItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Created!</h3>
            <p className="text-gray-600">Redirecting to course library...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Course Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Enter the basic information for your new course
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {errors.general}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter course title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of this course (optional)"
                className="w-full p-3 border border-gray-200 rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Enter tags separated by commas (optional)"
              />
              <p className="text-xs text-gray-500">
                E.g., neuroscience, cognitive psychology, research methods
              </p>
            </div>

            <div className="space-y-2">
              <Label>Selected Modules ({selectedModules.length})</Label>
              {errors.modules && (
                <p className="text-sm text-red-500">{errors.modules}</p>
              )}
              <div className="min-h-[120px] p-3 border border-gray-200 rounded-md bg-gray-50">
                {selectedModules.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No modules selected. Choose modules from the library on the right.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getSelectedModulesList().map((moduleItem, index) => (
                      <div
                        key={moduleItem.id}
                        className="flex items-center justify-between bg-white p-2 rounded border"
                      >
                        <div>
                          <span className="font-medium text-sm">
                            {index + 1}. {moduleItem.moduleNumber} - {moduleItem.title}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModuleSelection(moduleItem.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          
          <div className="flex items-center justify-between p-6 pt-0">
            <Link href="/faculty/courses">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                variant="outline"
                disabled={isLoading}
              >
                Save as Draft
              </Button>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Module Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Module Library</CardTitle>
          <CardDescription>
            Select modules to include in your course
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2">
            {isLoadingModules ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading modules...</p>
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No modules found</p>
                {searchTerm && (
                  <p className="text-sm">Try a different search term</p>
                )}
                {!searchTerm && modules.length === 0 && (
                  <div className="mt-4">
                    <p className="mb-2">You haven&apos;t created any modules yet.</p>
                    <Link href="/faculty/modules/create">
                      <Button size="sm">Create Your First Module</Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              filteredModules.map((moduleItem) => (
                <div
                  key={moduleItem.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedModules.includes(moduleItem.id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleModuleSelection(moduleItem.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(moduleItem.id)}
                          onChange={() => {}} // Handled by parent click
                          className="rounded"
                        />
                        <span className="font-medium text-sm">
                          {moduleItem.moduleNumber} - {moduleItem.title}
                        </span>
                      </div>
                      {moduleItem.description && (
                        <p className="text-xs text-gray-600 mt-1 ml-6">
                          {moduleItem.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1 ml-6 text-xs text-gray-500">
                        <span>Status: {moduleItem.status}</span>
                        {moduleItem._count && (
                          <>
                            <span>•</span>
                            <span>{moduleItem._count.subModules} submodules</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
