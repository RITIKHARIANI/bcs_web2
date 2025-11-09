"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { NeuralRichTextEditor } from '@/components/editor/neural-rich-text-editor'
import { NeuralButton } from '@/components/ui/neural-button'
import { TagsInput } from '@/components/ui/tags-input'
import { MediaLibraryPanel } from '@/components/ui/media-library-panel'
import { CollaboratorPanel } from '@/components/collaboration/CollaboratorPanel'
import { ActivityFeed } from '@/components/collaboration/ActivityFeed'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group-custom'
import { toast } from 'sonner'
import {
  Save,
  Eye,
  ArrowLeft,
  Brain,
  Hash,
  CheckCircle,
  FileText,
  AlertCircle,
  Layers,
  Trash2,
  Globe,
  Lock,
  Calendar
} from 'lucide-react'

const editModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  parentModuleId: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  visibility: z.enum(['public', 'private']).default('public'),
  tags: z.array(z.string()).default([]),
})

type EditModuleFormData = z.infer<typeof editModuleSchema>

interface Module {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  status: 'draft' | 'published'
  visibility: 'public' | 'private'
  tags: string[]
  parentModuleId: string | null
  createdAt: string
  updatedAt: string
  author_id: string
  author: {
    name: string
    email: string
  }
  parentModule: {
    id: string
    title: string
    slug: string
  } | null
  subModules: {
    id: string
    title: string
    slug: string
  }[]
}

interface ParentModule {
  id: string
  title: string
  slug: string
}

async function fetchModule(id: string): Promise<Module> {
  const response = await fetch(`/api/modules/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Module not found')
    }
    throw new Error('Failed to fetch module')
  }
  const data = await response.json()
  return data.module
}

async function fetchParentModules(): Promise<{ modules: ParentModule[], availableTags: string[] }> {
  const response = await fetch('/api/modules?parentModuleId=null')
  if (!response.ok) {
    throw new Error('Failed to fetch parent modules')
  }
  const data = await response.json()
  return { modules: data.modules, availableTags: data.availableTags || [] }
}

async function updateModule(id: string, data: EditModuleFormData) {
  // Transform parentModuleId to parent_module_id for API consistency
  const { parentModuleId, ...rest } = data;
  const apiData = {
    ...rest,
    parent_module_id: parentModuleId,
  }

  console.log('Updating module with data:', apiData);

  const response = await fetch(`/api/modules/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update module')
  }

  return response.json()
}

async function deleteModule(id: string) {
  const response = await fetch(`/api/modules/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete module')
  }

  return response.json()
}

interface EditModuleFormProps {
  moduleId: string
}

export function EditModuleForm({ moduleId }: EditModuleFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [insertImageFn, setInsertImageFn] = useState<((url: string, alt?: string, caption?: string) => void) | null>(null)

  const { data: module, isLoading: isLoadingModule, error: moduleError } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => fetchModule(moduleId),
  })

  const { data: parentModuleData, isLoading: isLoadingParents } = useQuery({
    queryKey: ['modules', 'parents'],
    queryFn: fetchParentModules,
  })

  const parentModules = parentModuleData?.modules || []

  // Populate tags and available tags when data loads
  useEffect(() => {
    if (module?.tags) {
      setTags(module.tags)
    }
  }, [module?.tags])

  useEffect(() => {
    if (parentModuleData?.availableTags) {
      setAvailableTags(parentModuleData.availableTags)
    }
  }, [parentModuleData?.availableTags])

  const updateMutation = useMutation({
    mutationFn: (data: EditModuleFormData) => updateModule(moduleId, data),
    onSuccess: () => {
      toast.success('Module updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      // Redirect to the module's view page
      router.push(`/faculty/modules/${moduleId}`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update module')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteModule(moduleId),
    onSuccess: () => {
      toast.success('Module deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      router.push('/faculty/modules')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete module')
      setShowDeleteConfirm(false)
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditModuleFormData>({
    resolver: zodResolver(editModuleSchema),
  })

  const watchedTitle = watch('title')
  const watchedStatus = watch('status')
  const watchedVisibility = watch('visibility')
  const watchedParentId = watch('parentModuleId')

  // Initialize form when module data loads
  useEffect(() => {
    if (module) {
      setValue('title', module.title)
      setValue('slug', module.slug)
      setValue('description', module.description || '')
      setValue('content', module.content)
      setValue('parentModuleId', module.parentModuleId)
      setValue('status', module.status)
      setValue('visibility', module.visibility || 'public')
      setValue('tags', module.tags || [])
      // Also set the tags state
      setTags(module.tags || [])
    }
  }, [module, setValue])

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && module && watchedTitle !== module.title) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
      setValue('slug', slug)
    }
  }, [watchedTitle, setValue, module])

  const onSubmit = async (data: EditModuleFormData) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        tags
      })
    } catch (error) {
      // Error is handled by mutation
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync()
    } catch (error) {
      // Error is handled by mutation
    }
  }

  // Available parent modules (exclude self and descendants)
  const availableParentModules = parentModules.filter(parent => 
    parent.id !== moduleId && 
    (!module?.subModules?.some(sub => sub.id === parent.id))
  )

  if (isLoadingModule) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-6 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gradient-to-r from-neural-light/30 to-neural-primary/30 rounded w-1/3"></div>
              <div className="h-4 bg-gradient-to-r from-neural-primary/30 to-neural-light/30 rounded w-1/2"></div>
            </div>
          </div>
        </header>
      </div>
    )
  }

  if (moduleError || !module) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/faculty/modules">
                <NeuralButton variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Modules
                </NeuralButton>
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <Card className="cognitive-card max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Module Not Found
              </h2>
              <p className="text-muted-foreground mb-6">
                The module you are trying to edit does not exist or you do not have permission to edit it.
              </p>
              <Link href="/faculty/modules">
                <NeuralButton variant="neural">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Modules
                </NeuralButton>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Left Section - Back Button + Title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href={`/faculty/modules/${moduleId}`}>
                <NeuralButton variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Back to Module</span>
                </NeuralButton>
              </Link>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Hide icon on mobile to save space */}
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neural flex-shrink-0">
                  {module.parentModule ? (
                    <Layers className="h-6 w-6 text-primary-foreground" />
                  ) : (
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neural-primary truncate">
                    Edit Module
                  </h1>
                  {/* Hide subtitle on very small screens */}
                  <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground truncate">
                    Modify content and settings for: {module.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* SECONDARY BUTTON: Preview - Blue Outline */}
              <Link href={`/modules/${module.slug}`}>
                <NeuralButton
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] min-w-[44px] border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950 transition-all duration-200 hover:scale-105"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden lg:inline ml-2">Preview</span>
                </NeuralButton>
              </Link>
              {/* PRIMARY BUTTON: Save Changes - Orange Solid */}
              <NeuralButton
                variant="neural"
                size="sm"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || updateMutation.isPending}
                className="min-h-[44px] min-w-[44px] bg-[#FF6B35] hover:bg-[#E55A28] text-white font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Save className="h-4 w-4" />
                <span className="hidden md:inline ml-2">
                  {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </span>
              </NeuralButton>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Module Settings */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="cognitive-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-neural-primary" />
                  Module Details
                </CardTitle>
                <CardDescription>
                  Configure the basic information for your module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information Group */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-medium text-sm">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter module title..."
                      {...register('title')}
                      className="h-11 p-4 border-neural-light/30 focus:border-neural-primary transition-colors"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug" className="font-medium text-sm">URL Slug *</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="slug"
                        placeholder="url-friendly-slug"
                        {...register('slug')}
                        className="h-11 p-4 pl-10 border-neural-light/30 focus:border-neural-primary transition-colors"
                      />
                    </div>
                    {errors.slug && (
                      <p className="text-sm text-red-500">{errors.slug.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-medium text-sm">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the module..."
                      rows={3}
                      {...register('description')}
                      className="p-4 border-neural-light/30 focus:border-neural-primary transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Categorization Group */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <TagsInput
                    value={tags}
                    onChange={setTags}
                    label="Tags"
                    placeholder="Add tags to categorize this module..."
                    suggestions={availableTags}
                    maxTags={10}
                    id="tags"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="parentModule" className="font-medium text-sm">Parent Module</Label>
                  <Select
                    value={watchedParentId ?? 'none'}
                    onValueChange={(value) => setValue('parentModuleId', value === 'none' ? null : value)}
                    disabled={isLoadingParents}
                  >
                    <SelectTrigger className="border-neural-light/30 focus:border-neural-primary">
                      <SelectValue placeholder={isLoadingParents ? "Loading modules..." : "None (Root Module)"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Root Module)</SelectItem>
                      {!isLoadingParents && availableParentModules.length === 0 && (
                        <SelectItem value="no-modules" disabled>No parent modules available</SelectItem>
                      )}
                      {!isLoadingParents && availableParentModules.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    {isLoadingParents && (
                      <p className="text-xs text-muted-foreground animate-pulse">Loading available parent modules...</p>
                    )}
                  </div>
                </div>

                {/* Publishing Settings Group */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <div className="space-y-3">
                    <Label htmlFor="status" className="font-medium text-sm">Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="draft" id="status-draft" />
                          <Label
                            htmlFor="status-draft"
                            className="flex items-center cursor-pointer font-normal"
                          >
                            <FileText className="mr-1.5 h-4 w-4 text-orange-500" />
                            Draft
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="published" id="status-published" />
                          <Label
                            htmlFor="status-published"
                            className="flex items-center cursor-pointer font-normal"
                          >
                            <CheckCircle className="mr-1.5 h-4 w-4 text-green-500" />
                            Published
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="visibility" className="font-medium text-sm">Visibility</Label>
                  <Controller
                    name="visibility"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="public" id="visibility-public" />
                          <Label
                            htmlFor="visibility-public"
                            className="flex items-center cursor-pointer font-normal"
                          >
                            <Globe className="mr-1.5 h-4 w-4 text-blue-500" />
                            Public
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="private" id="visibility-private" />
                          <Label
                            htmlFor="visibility-private"
                            className="flex items-center cursor-pointer font-normal"
                          >
                            <Lock className="mr-1.5 h-4 w-4 text-purple-500" />
                            Private
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                    />
                    <p className="text-xs text-muted-foreground">
                      Public: Can be added to any course. Private: Only you can add to courses.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Module Statistics - Improved Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Status Card */}
              <Card className="cognitive-card bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-synapse-primary/10">
                        <CheckCircle className="h-4 w-4 text-synapse-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Status</p>
                      <div className="mt-1">
                        <Badge variant={watchedStatus === 'published' ? 'default' : 'outline'} className="text-xs">
                          {watchedStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sub-modules Card */}
              <Card className="cognitive-card bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-neural-primary/10">
                        <Layers className="h-4 w-4 text-neural-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Sub-modules</p>
                      <p className="text-xl font-bold text-foreground">{module.subModules?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Created Date Card */}
              <Card className="cognitive-card bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-cognition-teal/10">
                        <Calendar className="h-4 w-4 text-cognition-teal" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Created</p>
                      <p className="text-sm font-semibold text-foreground">
                        {module.createdAt
                          ? new Date(module.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Updated Date Card */}
              <Card className="cognitive-card bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-cognition-orange/10">
                        <Calendar className="h-4 w-4 text-cognition-orange" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Updated</p>
                      <p className="text-sm font-semibold text-foreground">
                        {module.updatedAt
                          ? new Date(module.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Collaboration */}
            <CollaboratorPanel
              entityType="module"
              entityId={moduleId}
              authorId={module.author_id}
            />

            {/* Activity Feed */}
            <ActivityFeed
              entityType="module"
              entityId={moduleId}
              limit={10}
            />

            {/* Danger Zone */}
            <Card className="cognitive-card border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that permanently affect this module
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NeuralButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteMutation.isPending}
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Module
                </NeuralButton>
              </CardContent>
            </Card>
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="cognitive-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-neural-primary" />
                  Module Content
                </CardTitle>
                <CardDescription>
                  Write and format your educational content using the rich text editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NeuralRichTextEditor
                  content={watch('content') || ''}
                  onChange={(html) => setValue('content', html)}
                  placeholder="Start writing your module content..."
                  autoSave={true}
                  moduleId={moduleId}
                  onEditorReady={(insertImage) => setInsertImageFn(() => insertImage)}
                />
                {errors.content && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.content.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Media Library */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 h-[calc(100vh-8rem)]">
              <MediaLibraryPanel
                moduleId={moduleId}
                onMediaSelect={(file, altText, caption) => {
                  if (insertImageFn) {
                    insertImageFn(file.url, altText || file.originalName, caption);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertCircle className="mr-2 h-5 w-5" />
                Confirm Deletion
              </CardTitle>
              <CardDescription>
                This action cannot be undone. This will permanently delete the module and all its content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <NeuralButton
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </NeuralButton>
                <NeuralButton
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Module'}
                </NeuralButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
