"use client";

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { NeuralButton } from '@/components/ui/neural-button'
import { 
  Search, 
  BookOpen, 
  User,
  Calendar,
  Layers,
  Star,
  ArrowRight,
  Brain,
  Filter,
  Grid,
  List,
  Clock,
  CheckCircle,
  FileText,
  Play
} from 'lucide-react'

interface Module {
  id: string
  title: string
  slug: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  tags: string[]
  users: {
    name: string
  }
  parentModule: {
    title: string
    slug: string
  } | null
  _count: {
    subModules: number
  }
}

async function fetchPublicModules(): Promise<Module[]> {
  const response = await fetch('/api/modules?status=published')
  if (!response.ok) {
    throw new Error('Failed to fetch modules')
  }
  const data = await response.json()
  return data.modules
}

type ModuleCatalogProps = {
  initialSearch?: string;
};

export function ModuleCatalog({ initialSearch = '' }: ModuleCatalogProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [showRootOnly, setShowRootOnly] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: modules = [], isLoading, error } = useQuery({
    queryKey: ['publicModules'],
    queryFn: fetchPublicModules,
  })

  // Get all unique tags from modules
  const allTags = Array.from(new Set(modules.flatMap(module => module.tags || [])))

  const filteredModules = modules.filter(module => {
    const matchesSearch = 
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (module.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRoot = !showRootOnly || !module.parentModule
    const matchesTag = !selectedTag || (module.tags || []).includes(selectedTag)
    
    return matchesSearch && matchesRoot && matchesTag
  })

  const rootModules = modules.filter(module => !module.parentModule)

  if (isLoading) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="text-center space-y-4">
              <div className="h-12 bg-gradient-to-r from-neural-light/30 to-neural-primary/30 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gradient-to-r from-neural-primary/30 to-neural-light/30 rounded w-1/3 mx-auto"></div>
            </div>
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
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-background flex items-center justify-center py-20">
        <Card className="cognitive-card max-w-md">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neural-primary/10 via-background to-synapse-primary/10 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-neural">
                <FileText className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-neural-primary mb-6">
              Learning Modules
              <span className="block text-3xl text-synapse-primary mt-2">
                Interactive Educational Content
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore individual learning modules created by faculty experts. 
              Each module focuses on specific topics with interactive content, 
              assessments, and comprehensive materials.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search modules, topics, tags, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg border-neural-light/30 focus:border-neural-primary bg-background/80 backdrop-blur"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Root Modules */}
      {rootModules.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-neural-light/5 to-synapse-light/5">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-cognition-orange" />
                <h2 className="text-3xl font-bold text-neural-primary">Root Modules</h2>
                <p className="text-muted-foreground">Foundational learning modules</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rootModules.slice(0, 6).map((module) => (
                <Link key={module.id} href={`/modules/${module.slug}`}>
                  <Card className="cognitive-card group cursor-pointer h-full transform transition-all duration-300 hover:scale-105 hover:shadow-floating">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-neural-primary text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Root
                        </Badge>
                      </div>
                      <CardTitle className="flex items-start text-lg">
                        <FileText className="mr-2 h-5 w-5 text-neural-primary mt-1 flex-shrink-0" />
                        <span className="group-hover:text-neural-primary transition-colors">
                          {module.title}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {module.description || 'Explore this comprehensive module covering important concepts and practical applications.'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(module.tags || []).slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(module.tags || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(module.tags || []).length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {module.users?.name || 'Unknown'}
                        </div>
                        <div className="flex items-center">
                          <Layers className="mr-1 h-3 w-3" />
                          {module._count.subModules} sub-modules
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          Updated {new Date(module.updatedAt).toLocaleDateString()}
                        </div>
                        
                        <NeuralButton variant="neural" size="sm" className="group-hover:bg-neural-deep">
                          Start Learning
                          <Play className="ml-1 h-3 w-3" />
                        </NeuralButton>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Modules */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-neural-primary mb-2">All Modules</h2>
              <p className="text-muted-foreground">
                {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-foreground">Tag:</label>
                  <select 
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="bg-background border border-border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-neural-primary"
                  >
                    <option value="">All Tags</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <NeuralButton
                variant={showRootOnly ? 'neural' : 'ghost'}
                size="sm"
                onClick={() => setShowRootOnly(!showRootOnly)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showRootOnly ? 'Show All' : 'Root Only'}
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

          {filteredModules.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredModules.map((module) => (
                <Link key={module.id} href={`/modules/${module.slug}`}>
                  <Card className="cognitive-card group cursor-pointer h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-start text-lg">
                          <FileText className="mr-2 h-5 w-5 text-neural-primary mt-1 flex-shrink-0" />
                          <span className="group-hover:text-neural-primary transition-colors">
                            {module.title}
                          </span>
                        </CardTitle>
                        <div className="flex flex-col space-y-1 ml-2">
                          {!module.parentModule && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Root
                            </Badge>
                          )}
                          {module.status === 'published' && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Published
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {module.parentModule && (
                        <div className="text-sm text-muted-foreground">
                          Sub-module of: <Link href={`/modules/${module.parentModule.slug}`} className="text-neural-primary hover:underline">{module.parentModule.title}</Link>
                        </div>
                      )}
                      
                      <CardDescription className="mt-2 line-clamp-3">
                        {module.description || 'Explore this comprehensive module covering important concepts and practical applications in brain and cognitive sciences.'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {/* Tags */}
                      {(module.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {(module.tags || []).slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {(module.tags || []).length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{(module.tags || []).length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {module.users?.name || 'Unknown'}
                        </div>
                        <div className="flex items-center">
                          <Layers className="mr-1 h-3 w-3" />
                          {module._count.subModules} sub-modules
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(module.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <NeuralButton variant="outline" size="sm" className="w-full group-hover:bg-neural-primary group-hover:text-white">
                        Explore Module
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </NeuralButton>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="cognitive-card">
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No modules found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or filters, or check back later for new modules.
                </p>
                <NeuralButton 
                  variant="neural" 
                  onClick={() => {
                    setSearchTerm('')
                    setShowRootOnly(false)
                    setSelectedTag('')
                  }}
                >
                  Clear Search
                </NeuralButton>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
