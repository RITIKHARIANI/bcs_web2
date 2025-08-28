"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { NeuralButton } from '@/components/ui/neural-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  Layers,
  AlertCircle,
  Hash,
  CheckCircle,
  GripVertical,
  Plus,
  X,
  Search,
  FileText
} from 'lucide-react'

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long'),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
})

type CreateCourseFormData = z.infer<typeof createCourseSchema>

interface Module {
  id: string
  title: string
  slug: string
  description: string | null
  status: 'draft' | 'published'
  parentModule: {
    id: string
    title: string
  } | null
}

interface SelectedModule {
  moduleId: string
  order: number
  module: Module
}

function SortableModuleItem({ item, onRemove }: { item: SelectedModule; onRemove: (moduleId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.moduleId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
    >
      <Card className="cognitive-card border-2 border-neural-light/30 hover:border-neural-primary/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {item.module.parentModule ? (
                    <Layers className="h-4 w-4 text-synapse-primary mr-1" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-neural-primary mr-1" />
                  )}
                  <h4 className="font-medium text-sm truncate">{item.module.title}</h4>
                </div>
                <Badge 
                  variant={item.module.status === 'published' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {item.module.status}
                </Badge>
              </div>
              {item.module.description && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {item.module.description}
                </p>
              )}
              {item.module.parentModule && (
                <p className="text-xs text-synapse-primary mt-1">
                  Sub-module of: {item.module.parentModule.title}
                </p>
              )}
            </div>

            <NeuralButton
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.moduleId)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </NeuralButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function fetchModules(): Promise<Module[]> {
  const response = await fetch('/api/modules')
  if (!response.ok) {
    throw new Error('Failed to fetch modules')
  }
  const data = await response.json()
  return data.modules
}

async function createCourse(data: CreateCourseFormData & { modules: { moduleId: string; order: number }[] }) {
  const response = await fetch('/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create course')
  }

  return response.json()
}

export function CreateCourseForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedModules, setSelectedModules] = useState<SelectedModule[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModuleSelector, setShowModuleSelector] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const { data: modules = [], isLoading: isLoadingModules } = useQuery({
    queryKey: ['modules'],
    queryFn: fetchModules,
  })

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      toast.success('Course created successfully!')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      router.push(`/faculty/courses`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create course')
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      status: 'draft',
      featured: false,
    },
  })

  const watchedTitle = watch('title')
  const watchedStatus = watch('status')

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
      setValue('slug', slug)
    }
  }, [watchedTitle, setValue])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSelectedModules((items) => {
        const oldIndex = items.findIndex((item) => item.moduleId === active.id)
        const newIndex = items.findIndex((item) => item.moduleId === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        // Update order values
        return newItems.map((item, index) => ({
          ...item,
          order: index,
        }))
      })
    }
  }

  const addModule = (module: Module) => {
    const isAlreadySelected = selectedModules.some(item => item.moduleId === module.id)
    if (isAlreadySelected) {
      toast.error('Module is already added to the course')
      return
    }

    const newItem: SelectedModule = {
      moduleId: module.id,
      order: selectedModules.length,
      module,
    }
    setSelectedModules([...selectedModules, newItem])
                          toast.success(`Added &quot;${module.title}&quot; to course`)
  }

  const removeModule = (moduleId: string) => {
    setSelectedModules(prev => {
      const filtered = prev.filter(item => item.moduleId !== moduleId)
      // Re-order remaining items
      return filtered.map((item, index) => ({
        ...item,
        order: index,
      }))
    })
  }

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const availableModules = filteredModules.filter(module =>
    !selectedModules.some(selected => selected.moduleId === module.id)
  )

  const onSubmit = async (data: CreateCourseFormData) => {
    try {
      await createCourseMutation.mutateAsync({
        ...data,
        modules: selectedModules.map(({ moduleId, order }) => ({ moduleId, order })),
      })
    } catch (error) {
      // Error is handled by mutation
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/faculty/courses">
                <NeuralButton variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Courses
                </NeuralButton>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neural">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neural-primary">Create New Course</h1>
                  <p className="text-sm text-muted-foreground">
                    Assemble modules into a complete learning experience
                  </p>
                </div>
              </div>
            </div>
            
            <NeuralButton
              variant="synaptic"
              size="sm"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </NeuralButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Settings */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="cognitive-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-neural-primary" />
                  Course Details
                </CardTitle>
                <CardDescription>
                  Configure the basic information for your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter course title..."
                    {...register('title')}
                    className="border-neural-light/30 focus:border-neural-primary"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="slug"
                      placeholder="url-friendly-slug"
                      {...register('slug')}
                      className="pl-10 border-neural-light/30 focus:border-neural-primary"
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-sm text-red-500">{errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the course..."
                    rows={3}
                    {...register('description')}
                    className="border-neural-light/30 focus:border-neural-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="draft"
                        {...register('status')}
                        className="text-neural-primary"
                      />
                      <span className="flex items-center text-sm">
                        <FileText className="mr-1 h-4 w-4 text-orange-500" />
                        Draft
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="published"
                        {...register('status')}
                        className="text-neural-primary"
                      />
                      <span className="flex items-center text-sm">
                        <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                        Published
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('featured')}
                      className="text-neural-primary"
                    />
                    <span className="text-sm">Feature this course</span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Featured courses appear prominently on the homepage
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Course Statistics */}
            <Card className="cognitive-card">
              <CardHeader>
                <CardTitle className="text-sm">Course Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modules:</span>
                  <span className="font-medium">{selectedModules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published Modules:</span>
                  <span className="font-medium">
                    {selectedModules.filter(item => item.module.status === 'published').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={watchedStatus === 'published' ? 'default' : 'outline'}>
                    {watchedStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module Assembly */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neural-primary">Course Assembly</h2>
              <NeuralButton
                variant="neural"
                size="sm"
                onClick={() => setShowModuleSelector(!showModuleSelector)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Modules
              </NeuralButton>
            </div>

            {/* Module Selector */}
            {showModuleSelector && (
              <Card className="cognitive-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="mr-2 h-5 w-5 text-neural-primary" />
                    Select Modules
                  </CardTitle>
                  <CardDescription>
                    Choose modules to include in your course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search modules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-neural-light/30 focus:border-neural-primary"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {isLoadingModules ? (
                        <div className="text-center py-4 text-muted-foreground">
                          Loading modules...
                        </div>
                      ) : availableModules.length > 0 ? (
                        availableModules.map((module) => (
                          <div
                            key={module.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {module.parentModule ? (
                                  <Layers className="h-4 w-4 text-synapse-primary" />
                                ) : (
                                  <BookOpen className="h-4 w-4 text-neural-primary" />
                                )}
                                <span className="font-medium">{module.title}</span>
                                <Badge 
                                  variant={module.status === 'published' ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {module.status}
                                </Badge>
                              </div>
                              {module.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {module.description}
                                </p>
                              )}
                            </div>
                            <NeuralButton
                              variant="ghost"
                              size="sm"
                              onClick={() => addModule(module)}
                            >
                              <Plus className="h-4 w-4" />
                            </NeuralButton>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          {searchTerm ? 'No modules found matching your search' : 'All modules have been added'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Module List */}
            <Card className="cognitive-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="mr-2 h-5 w-5 text-neural-primary" />
                  Course Modules ({selectedModules.length})
                </CardTitle>
                <CardDescription>
                  Drag and drop to reorder modules. Students will follow this sequence.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedModules.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedModules.map(item => item.moduleId)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {selectedModules.map((item, index) => (
                          <div key={item.moduleId} className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-neural flex items-center justify-center text-white text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <SortableModuleItem
                                item={item}
                                onRemove={removeModule}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No modules added yet. Click &quot;Add Modules&quot; to start building your course.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
