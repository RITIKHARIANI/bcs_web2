"use client";

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NeuralButton } from '@/components/ui/neural-button'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  BookOpen, 
  User,
  Calendar,
  Layers,
  Clock,
  CheckCircle,
  Brain,
  Play,
  List,
  ChevronRight,
  Star,
  Share2,
  Bookmark
} from 'lucide-react'

interface Module {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  status: 'draft' | 'published'
  parentModuleId: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface CourseModule {
  sortOrder: number
  module: Module
}

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  featured: boolean
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  author: {
    name: string
    email: string
  }
  courseModules: CourseModule[]
  _count: {
    courseModules: number
  }
}

interface CourseViewerProps {
  course: Course
}

export function CourseViewer({ course }: CourseViewerProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    course.courseModules[0]?.module?.id || null
  )

  const selectedModule = course.courseModules.find(
    cm => cm.module.id === selectedModuleId
  )?.module

  const currentModuleIndex = course.courseModules.findIndex(
    cm => cm.module.id === selectedModuleId
  )

  const nextModuleData = course.courseModules[currentModuleIndex + 1]?.module
  const prevModuleData = course.courseModules[currentModuleIndex - 1]?.module

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/courses">
                <NeuralButton variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Catalog
                </NeuralButton>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neural">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neural-primary">{course.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    by {course.author.name} • {course.courseModules.length} modules
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {course.featured && (
                <Badge className="bg-cognition-orange text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              <NeuralButton variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </NeuralButton>
              <NeuralButton variant="ghost" size="sm">
                <Bookmark className="h-4 w-4" />
              </NeuralButton>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course Navigation */}
          <div className="lg:col-span-1">
            <Card className="cognitive-card sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <List className="mr-2 h-5 w-5 text-neural-primary" />
                  Course Modules
                </CardTitle>
                <CardDescription>
                  {course.description || 'Interactive learning modules covering key concepts and applications.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {course.courseModules.map((courseModule, index) => {
                  const currentModule = courseModule.module
                  const isSelected = selectedModuleId === currentModule.id
                  const isCompleted = false // TODO: Add completion tracking
                  
                  return (
                    <button
                      key={currentModule.id}
                      onClick={() => setSelectedModuleId(currentModule.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        isSelected 
                          ? 'border-neural-primary bg-neural-primary/10 shadow-sm' 
                          : 'border-border hover:border-neural-light hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isSelected 
                              ? 'bg-neural-primary text-white' 
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${
                            isSelected ? 'text-neural-primary' : 'text-foreground'
                          }`}>
                            {currentModule.title}
                          </p>
                          {currentModule.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {currentModule.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <ChevronRight className="h-4 w-4 text-neural-primary flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-3">
            {selectedModule ? (
              <div className="space-y-6">
                {/* Module Header */}
                <Card className="cognitive-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center text-2xl">
                          <Brain className="mr-3 h-6 w-6 text-neural-primary" />
                          {selectedModule.title}
                        </CardTitle>
                        {selectedModule.description && (
                          <CardDescription className="mt-2 text-base">
                            {selectedModule.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary">
                        Module {currentModuleIndex + 1} of {course.courseModules.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Updated {new Date(selectedModule.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        {course.author.name}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Module Content */}
                <Card className="cognitive-card">
                  <CardContent className="p-8">
                    <div 
                      className="neural-content prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedModule.content }}
                    />
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <div>
                    {prevModuleData && (
                      <NeuralButton 
                        variant="outline" 
                        onClick={() => setSelectedModuleId(prevModuleData.id)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous: {prevModuleData.title}
                      </NeuralButton>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {currentModuleIndex + 1} of {course.courseModules.length} modules
                    </p>
                  </div>
                  
                  <div>
                    {nextModuleData ? (
                      <NeuralButton 
                        variant="neural" 
                        onClick={() => setSelectedModuleId(nextModuleData.id)}
                      >
                        Next: {nextModuleData.title}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </NeuralButton>
                    ) : (
                      <NeuralButton variant="synaptic">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Course Complete!
                      </NeuralButton>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Card className="cognitive-card">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Welcome to {course.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Select a module from the sidebar to begin your learning journey.
                  </p>
                  {course.courseModules.length > 0 && (
                    <NeuralButton 
                      variant="neural"
                      onClick={() => setSelectedModuleId(course.courseModules[0].module.id)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start with Module 1
                    </NeuralButton>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
