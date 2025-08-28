'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/editor/rich-text-editor'
import { useRouter } from 'next/navigation'

interface Module {
  id: string
  title: string
  description?: string
  content?: string
  status: string
  parentModuleId?: string
  moduleNumber: string
}

interface EditModuleFormProps {
  moduleId: string
}

export function EditModuleForm({ moduleId }: EditModuleFormProps) {
  const [module, setModule] = useState<Module | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    fetchModule()
  }, [moduleId])

  const fetchModule = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/modules/${moduleId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Module not found')
          return
        }
        throw new Error('Failed to fetch module')
      }
      
      const moduleData = await response.json()
      setModule(moduleData)
      setTitle(moduleData.title)
      setDescription(moduleData.description || '')
      setContent(moduleData.content || '')
      setStatus(moduleData.status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load module')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setSaving(true)

    if (!title.trim()) {
      setError('Title is required')
      setSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          content: content.trim() || undefined,
          status,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update module')
      }

      setSuccessMessage('Module updated successfully!')
      
      // Redirect back to modules after a short delay
      setTimeout(() => {
        router.push('/faculty/modules')
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete module')
      }

      router.push('/faculty/modules')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading module...</p>
        </div>
      </div>
    )
  }

  if (error && !module) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => router.push('/faculty/modules')}>
          Back to Modules
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <span>Edit Module</span>
              {module && (
                <span className="ml-3 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {module.moduleNumber}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="title">Module Title *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter module title"
              required
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the module content"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Module Content</Label>
            <div className="mt-1">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your module content here..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/faculty/modules')}
              disabled={saving}
            >
              Cancel
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={saving}
                className="text-red-600 hover:text-red-700"
              >
                Delete Module
              </Button>
              
              <Button
                type="submit"
                disabled={saving || !title.trim()}
              >
                {saving ? 'Saving...' : 'Update Module'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
