"use client";

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { NeuralButton } from '@/components/ui/neural-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  AlertCircle
} from 'lucide-react'

interface Module {
  id: string
  title: string
  slug: string
  description: string | null
  status: 'draft' | 'published'
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

async function fetchModules(): Promise<Module[]> {
  const response = await fetch('/api/modules')
  if (!response.ok) {
    throw new Error('Failed to fetch modules')
  }
  const data = await response.json()
  return data.modules
}

export function ModuleLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')

  const { data: modules = [], isLoading, error } = useQuery({
    queryKey: ['modules'],
    queryFn: fetchModules,
  })

  const filteredModules = modules.filter(module => {
    const matchesSearch = 
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.slug.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || module.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const rootModules = filteredModules.filter(module => !module.parentModule)
  const subModules = filteredModules.filter(module => module.parentModule)

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="cognitive-card max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Unable to Load Modules
            </h2>
            <p className="text-muted-foreground">
              Please try again later or contact support if the problem persists.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
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
            
            <Link href="/faculty/modules/create">
              <NeuralButton variant="neural" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Module
              </NeuralButton>
            </Link>
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
                      {modules.filter(m => m.status === 'published').length}
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
                      {modules.filter(m => m.status === 'draft').length}
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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search modules by title, description, or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-neural-light/30 focus:border-neural-primary"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <NeuralButton
                variant={statusFilter === 'all' ? 'neural' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </NeuralButton>
              <NeuralButton
                variant={statusFilter === 'published' ? 'neural' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('published')}
              >
                Published
              </NeuralButton>
              <NeuralButton
                variant={statusFilter === 'draft' ? 'neural' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('draft')}
              >
                Drafts
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
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {filteredModules.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredModules.map((module) => (
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
              {searchTerm || statusFilter !== 'all' ? (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No modules found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms or filters.
                  </p>
                  <NeuralButton 
                    variant="neural" 
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    }}
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
