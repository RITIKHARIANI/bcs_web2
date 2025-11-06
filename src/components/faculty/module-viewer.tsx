"use client";

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NeuralButton } from '@/components/ui/neural-button'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  Calendar,
  User,
  Hash,
  CheckCircle,
  FileText,
  Brain,
  Layers,
  BookOpen,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

interface Module {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  status: 'draft' | 'published'
  visibility: 'public' | 'private'
  created_at: string
  updated_at: string
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

interface ModuleViewerProps {
  moduleId: string
}

export function ModuleViewer({ moduleId }: ModuleViewerProps) {
  const router = useRouter()

  const { data: module, isLoading, error } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => fetchModule(moduleId),
  })

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
          <div className="space-y-6">
            <Card className="cognitive-card">
              <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gradient-to-r from-neural-light/30 to-neural-primary/30 rounded w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-neural-primary/30 to-neural-light/30 rounded w-1/2"></div>
                  <div className="h-32 bg-gradient-to-br from-neural-light/20 to-cognition-teal/20 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
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
                {error instanceof Error && error.message === 'Module not found' 
                  ? 'Module Not Found' 
                  : 'Unable to Load Module'
                }
              </h2>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error && error.message === 'Module not found'
                  ? 'The module you are looking for does not exist or you do not have permission to view it.'
                  : 'Please try again later or contact support if the problem persists.'
                }
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

  if (!module) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/faculty/modules">
                <NeuralButton variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Modules
                </NeuralButton>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neural">
                  {module.parentModule ? (
                    <Layers className="h-6 w-6 text-primary-foreground" />
                  ) : (
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neural-primary">{module.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    {module.parentModule ? 'Sub-module' : 'Root module'} • /{module.slug}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/faculty/modules/edit/${module.id}`}>
                <NeuralButton variant="neural" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Module
                </NeuralButton>
              </Link>
              {module.status === 'published' && (
                <Link href={`/modules/${module.slug}`}>
                  <NeuralButton variant="synaptic" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Public
                  </NeuralButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Module Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="cognitive-card">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4 text-neural-primary" />
                  Module Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
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

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Author:</span>
                  <span className="font-medium">{module.author?.name || 'Unknown'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Visibility:</span>
                  <Badge variant={module.visibility === 'public' ? 'default' : 'secondary'}>
                    {module.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(module.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium">
                    {new Date(module.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sub-modules:</span>
                  <span className="font-medium">{module.subModules?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Hierarchy */}
            {(module.parentModule || (module.subModules?.length || 0) > 0) && (
              <Card className="cognitive-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Layers className="mr-2 h-4 w-4 text-synapse-primary" />
                    Module Hierarchy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {module.parentModule && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Parent Module:</p>
                      <Link href={`/faculty/modules/${module.parentModule.id}`}>
                        <div className="flex items-center p-2 rounded border hover:bg-muted/50 transition-colors">
                          <Brain className="h-4 w-4 text-neural-primary mr-2" />
                          <span className="text-sm font-medium">{module.parentModule.title}</span>
                        </div>
                      </Link>
                    </div>
                  )}

                  {(module.subModules?.length || 0) > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Sub-modules:</p>
                      <div className="space-y-1">
                        {(module.subModules || []).map((subModule) => (
                          <Link key={subModule.id} href={`/faculty/modules/${subModule.id}`}>
                            <div className="flex items-center p-2 rounded border hover:bg-muted/50 transition-colors">
                              <Layers className="h-4 w-4 text-synapse-primary mr-2" />
                              <span className="text-sm font-medium">{subModule.title}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Module Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="cognitive-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-neural-primary" />
                  Module Content
                </CardTitle>
                {module.description && (
                  <CardDescription>
                    {module.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div 
                  className="neural-content prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: module.content }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
