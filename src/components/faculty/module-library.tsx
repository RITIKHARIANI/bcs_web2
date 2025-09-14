"use client";

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { NeuralButton } from '@/components/ui/neural-button'
import { withFetchRetry } from '@/lib/retry'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  BookOpen, 
  FileText, 
  Clock, 
  Eye,
  Edit,
  Brain,
  Layers,
  Calendar,
  Users,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Tag,
  SortAsc,
  SortDesc,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface Module {
  id: string
  title: string
  slug: string
  description: string | null
  status: 'draft' | 'published'
  tags: string[]
  createdAt: string
  updatedAt: string
  parentModule: {
    id: string
    title: string
  } | null
  author: {
    name: string
    email: string
  }
  _count: {
    subModules: number
    courseModules: number
  }
}

interface ModulesResponse {
  modules: Module[]
  availableTags: string[]
}

async function fetchModules(params: {
  search?: string
  status?: string
  tags?: string
  parentId?: string
  sortBy?: string
  sortOrder?: string
}): Promise<ModulesResponse> {
  return withFetchRetry(async () => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        searchParams.append(key, value)
      }
    })
    
    const url = `/api/modules?${searchParams.toString()}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch modules`)
    }
    
    const data = await response.json()
    return {
      modules: data.modules || [],
      availableTags: data.availableTags || []
    }
  }, {
    maxAttempts: 5, // Increased from 3 to 5
    baseDelayMs: 1000
  })
}

export function ModuleLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [parentFilter, setParentFilter] = useState<'all' | 'root' | 'sub'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Memoize query params to prevent unnecessary re-fetches
  const queryParams = useMemo(() => ({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
    parentId: parentFilter === 'root' ? 'root' : parentFilter === 'sub' ? 'sub' : undefined,
    sortBy,
    sortOrder
  }), [searchTerm, statusFilter, selectedTags, parentFilter, sortBy, sortOrder])

  const { 
    data = { modules: [], availableTags: [] }, 
    isLoading, 
    error, 
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['modules', queryParams],
    queryFn: () => fetchModules(queryParams),
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    retry: 5, // Increased from 2 to 5 for better reliability
  })

  const { modules, availableTags } = data

  // Helper functions for tag management
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setParentFilter('all')
    setSelectedTags([])
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  // Calculate statistics
  const rootModules = modules.filter(module => !module.parentModule)
  const subModules = modules.filter(module => module.parentModule)
  const publishedCount = modules.filter(m => m.status === 'published').length
  const draftCount = modules.filter(m => m.status === 'draft').length

  if (isLoading) {
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
        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="cognitive-card">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gradient-to-r from-neural-light/30 to-neural-primary/30 rounded w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-neural-primary/30 to-neural-light/30 rounded w-1/2"></div>
                    <div className="h-20 bg-gradient-to-br from-neural-light/20 to-cognition-teal/20 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="cognitive-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Unable to Load Modules
            </h2>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <div className="space-y-3">
              <NeuralButton 
                variant="neural" 
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </>
                )}
              </NeuralButton>
              <p className="text-xs text-muted-foreground">
                If the problem persists, please contact support
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-neural">
                <Brain className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neural-primary">Module Library</h1>
                <p className="text-muted-foreground">
                  Create and manage your educational content modules
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isFetching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Link href="/faculty/modules/create">
                <NeuralButton variant="neural" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Module
                </NeuralButton>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="cognitive-card">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-neural-primary" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total Modules</p>
                    <p className="text-2xl font-bold text-foreground">{modules.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cognitive-card">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Published</p>
                    <p className="text-2xl font-bold text-foreground">
                      {publishedCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cognitive-card">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Edit className="h-8 w-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                    <p className="text-2xl font-bold text-foreground">
                      {draftCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cognitive-card">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Layers className="h-8 w-8 text-synapse-primary" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Root Modules</p>
                    <p className="text-2xl font-bold text-foreground">{rootModules.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Main Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search modules by title, description, slug, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-neural-light/30 focus:border-neural-primary"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <NeuralButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(selectedTags.length > 0 || statusFilter !== 'all' || parentFilter !== 'all') && (
                    <Badge variant="secondary" className="ml-2">
                      {[
                        selectedTags.length,
                        statusFilter !== 'all' ? 1 : 0,
                        parentFilter !== 'all' ? 1 : 0
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </NeuralButton>
                
                <div className="flex border border-border rounded-lg">
                  <NeuralButton
                    variant={viewMode === 'grid' ? 'neural' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </NeuralButton>
                  <NeuralButton
                    variant={viewMode === 'list' ? 'neural' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none border-l"
                  >
                    <List className="h-4 w-4" />
                  </NeuralButton>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {isFiltersOpen && (
              <Card className="cognitive-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Filters & Sorting</h3>
                  <NeuralButton
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </NeuralButton>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {(['all', 'published', 'draft'] as const).map((status) => (
                        <NeuralButton
                          key={status}
                          variant={statusFilter === status ? 'neural' : 'outline'}
                          size="sm"
                          onClick={() => setStatusFilter(status)}
                        >
                          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </NeuralButton>
                      ))}
                    </div>
                  </div>

                  {/* Parent Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <div className="flex flex-wrap gap-2">
                      {(['all', 'root', 'sub'] as const).map((parent) => (
                        <NeuralButton
                          key={parent}
                          variant={parentFilter === parent ? 'neural' : 'outline'}
                          size="sm"
                          onClick={() => setParentFilter(parent)}
                        >
                          {parent === 'all' ? 'All' : parent === 'root' ? 'Root' : 'Sub-modules'}
                        </NeuralButton>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Sort By</label>
                    <div className="flex space-x-2">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="created_at">Created</SelectItem>
                          <SelectItem value="updated_at">Updated</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                        </SelectContent>
                      </Select>
                      <NeuralButton
                        variant="outline"
                        size="sm"
                        onClick={toggleSortOrder}
                      >
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </NeuralButton>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Tags {availableTags.length > 0 && `(${availableTags.length} available)`}
                    </label>
                    {availableTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {availableTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                            className="cursor-pointer hover:bg-neural-primary hover:text-white transition-colors"
                            onClick={() => selectedTags.includes(tag) ? removeTag(tag) : addTag(tag)}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags available</p>
                    )}
                  </div>
                </div>

                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">Selected tags:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="default" className="pr-1">
                            {tag}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer hover:bg-white hover:text-black rounded-full"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {modules.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {modules.map((module) => (
              <Card key={module.id} className="cognitive-card group cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center">
                        {module.parentModule ? (
                          <Layers className="mr-2 h-5 w-5 text-synapse-primary" />
                        ) : (
                          <BookOpen className="mr-2 h-5 w-5 text-neural-primary" />
                        )}
                        {module.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {module.parentModule && (
                          <span className="text-xs text-synapse-primary">
                            Sub-module of: {module.parentModule.title}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={module.status === 'published' ? 'default' : 'outline'}
                        className={module.status === 'published' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'text-orange-600 border-orange-200'
                        }
                      >
                        {module.status === 'published' ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <Edit className="mr-1 h-3 w-3" />
                        )}
                        {module.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {module.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {module.description}
                    </p>
                  )}

                  {/* Tags */}
                  {module.tags && module.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {module.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {module.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{module.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(module.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-3">
                      {module._count.subModules > 0 && (
                        <div className="flex items-center">
                          <Layers className="mr-1 h-3 w-3" />
                          {module._count.subModules}
                        </div>
                      )}
                      {module._count.courseModules > 0 && (
                        <div className="flex items-center">
                          <Users className="mr-1 h-3 w-3" />
                          {module._count.courseModules}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      /{module.slug}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link href={`/faculty/modules/${module.id}`}>
                        <NeuralButton variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </NeuralButton>
                      </Link>
                      <Link href={`/faculty/modules/edit/${module.id}`}>
                        <NeuralButton variant="neural" size="sm">
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </NeuralButton>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="cognitive-card">
            <CardContent className="p-12 text-center">
              <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              {searchTerm || statusFilter !== 'all' || parentFilter !== 'all' || selectedTags.length > 0 ? (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No modules found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms or filters.
                  </p>
                  <NeuralButton 
                    variant="neural" 
                    onClick={clearAllFilters}
                  >
                    Clear Filters
                  </NeuralButton>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No modules yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start building your educational content by creating your first module.
                  </p>
                  <Link href="/faculty/modules/create">
                    <NeuralButton variant="neural">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Module
                    </NeuralButton>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
