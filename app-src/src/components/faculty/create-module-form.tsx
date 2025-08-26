'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/editor/rich-text-editor'

interface CreateModuleFormProps {
  parentModuleId?: string
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
}

interface ParentModule {
  id: string
  title: string
  moduleNumber: string
}

export function CreateModuleForm({ parentModuleId, user }: CreateModuleFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '<p>Start writing your module content here...</p>',
  })
  const [parentModule, setParentModule] = useState<ParentModule | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  // Fetch parent module info if parentModuleId is provided
  useEffect(() => {
    if (parentModuleId) {
      fetch(`/api/modules/${parentModuleId}`)
        .then(res => res.json())
        .then(data => {
          if (data.module) {
            setParentModule({
              id: data.module.id,
              title: data.module.title,
              moduleNumber: data.module.moduleNumber,
            })
          }
        })
        .catch(console.error)
    }
  }, [parentModuleId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Basic validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parentModuleId,
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
          setErrors({ general: data.error || 'Failed to create module' })
        }
      } else {
        setIsSuccess(true)
        // Redirect after short delay to show success message
        setTimeout(() => {
          router.push('/faculty/modules')
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

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
  }

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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Module Created!</h3>
            <p className="text-gray-600">Redirecting to module library...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {parentModule ? `Create Submodule under "${parentModule.title}"` : 'Create New Module'}
        </CardTitle>
        <CardDescription>
          {parentModule 
            ? `This will be module ${parentModule.moduleNumber}.X in your hierarchy`
            : 'Create a standalone module that can be reused across multiple courses'
          }
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {errors.general && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          {parentModule && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900">Parent Module</h4>
              <p className="text-sm text-blue-700">
                {parentModule.moduleNumber} - {parentModule.title}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">Module Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter module title"
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
              placeholder="Brief description of this module (optional)"
              className="w-full p-3 border border-gray-200 rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Module Content</Label>
            <RichTextEditor
              content={formData.content}
              onChange={handleContentChange}
              placeholder="Start writing your module content here..."
            />
          </div>
        </CardContent>
        
        <div className="flex items-center justify-between p-6 pt-0">
          <Link href="/faculty/modules">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          
          <div className="flex space-x-4">
            <Button 
              type="submit" 
              variant="outline"
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault()
                // Save as draft logic could go here
                handleSubmit(e)
              }}
            >
              Save as Draft
            </Button>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Module'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
