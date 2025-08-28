'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Module {
  id: string
  title: string
  description?: string
  moduleNumber: string
  status: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  subModules: Module[]
  _count?: {
    courseModules: number
    subModules: number
  }
}

interface ModuleLibraryProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
}

export function ModuleLibrary({ user }: ModuleLibraryProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/modules')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch modules')
      }

      setModules(data.modules || [])
    } catch (error) {
      console.error('Fetch modules error:', error)
      setError('Failed to load modules')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to delete module')
        return
      }

      // Refresh modules list
      fetchModules()
    } catch (error) {
      console.error('Delete module error:', error)
      alert('Failed to delete module')
    }
  }

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Loading modules...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchModules}>Try Again</Button>
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
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex space-x-4">
          <Link href="/faculty/modules/create">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Module
            </Button>
          </Link>
          <Link href="/faculty/dashboard">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Modules List */}
      {filteredModules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No modules found</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {searchTerm ? 'No modules match your search.' : 'Start building your module library by creating your first module.'}
            </p>
            {!searchTerm && (
              <Link href="/faculty/modules/create">
                <Button>Create Your First Module</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onDelete={deleteModule}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ModuleCardProps {
  module: Module
  onDelete: (id: string) => void
  level: number
}

function ModuleCard({ module, onDelete, level }: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels

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
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const indentClass = level > 0 ? `ml-${Math.min(level * 6, 24)}` : ''

  return (
    <div className={indentClass}>
      <Card className="relative">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-lg">
                  {module.moduleNumber} - {module.title}
                </CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                  {module.status}
                </span>
              </div>
              {module.description && (
                <CardDescription className="mt-2">
                  {module.description}
                </CardDescription>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Used in {module._count?.courseModules || 0} course{(module._count?.courseModules || 0) !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{module._count?.subModules || 0} submodule{(module._count?.subModules || 0) !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>Updated {formatDate(module.updatedAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {module.subModules.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? '▼' : '▶'} {module.subModules.length}
                </Button>
              )}
              
              <Link href={`/faculty/modules/create?parentId=${module.id}`}>
                <Button variant="ghost" size="sm" title="Add Submodule">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Button>
              </Link>
              
              <Link href={`/faculty/modules/${module.id}/edit`}>
                <Button variant="ghost" size="sm" title="Edit Module">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(module.id)}
                className="text-red-600 hover:text-red-700"
                title="Delete Module"
                disabled={(module._count?.courseModules || 0) > 0 || (module._count?.subModules || 0) > 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Submodules */}
        {isExpanded && module.subModules.length > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {module.subModules.map((subModule) => (
                <ModuleCard
                  key={subModule.id}
                  module={subModule}
                  onDelete={onDelete}
                  level={level + 1}
                />
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
