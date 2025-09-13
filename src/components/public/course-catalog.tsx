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
  CheckCircle
} from 'lucide-react'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  featured: boolean
  createdAt: string
  updatedAt: string
  author: {
    name: string
  }
  _count: {
    courseModules: number
  }
}

async function fetchPublicCourses(): Promise<Course[]> {
  const response = await fetch('/api/courses')
  if (!response.ok) {
    throw new Error('Failed to fetch courses')
  }
  const data = await response.json()
  return data.courses
}

export function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['publicCourses'],
    queryFn: fetchPublicCourses,
  })

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    const matchesFeatured = !showFeaturedOnly || course.featured
    
    return matchesSearch && matchesFeatured
  })

  const featuredCourses = courses.filter(course => course.featured)

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
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Unable to Load Courses
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
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-neural-primary mb-6">
              Brain & Cognitive Sciences
              <span className="block text-3xl text-synapse-primary mt-2">
                Interactive Learning Platform
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore cutting-edge educational content created by faculty experts. 
              Dive deep into neuroscience, psychology, and cognitive science through 
              interactive modules and comprehensive courses.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses, topics, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg border-neural-light/30 focus:border-neural-primary bg-background/80 backdrop-blur"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-neural-light/5 to-synapse-light/5">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-cognition-orange" />
                <h2 className="text-3xl font-bold text-neural-primary">Featured Courses</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.slice(0, 3).map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`}>
                  <Card className="cognitive-card group cursor-pointer h-full transform transition-all duration-300 hover:scale-105 hover:shadow-floating">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-cognition-orange text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      <CardTitle className="flex items-start text-lg">
                        <BookOpen className="mr-2 h-5 w-5 text-neural-primary mt-1 flex-shrink-0" />
                        <span className="group-hover:text-neural-primary transition-colors">
                          {course.title}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {course.description || 'Explore this comprehensive course covering important concepts and practical applications.'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {course.author?.name || 'Unknown'}
                        </div>
                        <div className="flex items-center">
                          <Layers className="mr-1 h-3 w-3" />
                          {course._count.courseModules} modules
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          Updated {new Date(course.updatedAt).toLocaleDateString()}
                        </div>
                        
                        <NeuralButton variant="neural" size="sm" className="group-hover:bg-neural-deep">
                          Start Learning
                          <ArrowRight className="ml-1 h-3 w-3" />
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

      {/* All Courses */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-neural-primary mb-2">All Courses</h2>
              <p className="text-muted-foreground">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <NeuralButton
                variant={showFeaturedOnly ? 'neural' : 'ghost'}
                size="sm"
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFeaturedOnly ? 'Show All' : 'Featured Only'}
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

          {filteredCourses.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`}>
                  <Card className="cognitive-card group cursor-pointer h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-start text-lg">
                          <BookOpen className="mr-2 h-5 w-5 text-neural-primary mt-1 flex-shrink-0" />
                          <span className="group-hover:text-neural-primary transition-colors">
                            {course.title}
                          </span>
                        </CardTitle>
                        {course.featured && (
                          <Badge variant="secondary" className="ml-2">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-2 line-clamp-3">
                        {course.description || 'Explore this comprehensive course covering important concepts and practical applications in brain and cognitive sciences.'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {course.author?.name || 'Unknown'}
                        </div>
                        <div className="flex items-center">
                          <Layers className="mr-1 h-3 w-3" />
                          {course._count.courseModules} modules
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(course.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <NeuralButton variant="outline" size="sm" className="w-full group-hover:bg-neural-primary group-hover:text-white">
                        Explore Course
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
                  No courses found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or check back later for new courses.
                </p>
                <NeuralButton 
                  variant="neural" 
                  onClick={() => {
                    setSearchTerm('')
                    setShowFeaturedOnly(false)
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