"use client";

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { NeuralButton } from '@/components/ui/neural-button'
import { 
  Database, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  BookOpen, 
  Layers,
  ArrowRight,
  Info
} from 'lucide-react'

interface DatabaseDebugData {
  summary: {
    totalCourses: number
    totalModules: number
    totalCourseModules: number
    publishedCourses: number
    publishedModules: number
    rootModules: number
    childModules: number
    publishedRelationships: number
  }
  courses: {
    all: any[]
    published: any[]
  }
  modules: {
    all: any[]
    published: any[]
    root: any[]
    children: any[]
  }
  relationships: {
    courseModules: any[]
    parentChild: any[]
  }
  potentialIssues: {
    unpublishedCourses: number
    unpublishedModules: number
    orphanedModules: number
    coursesWithoutModules: number
  }
}

interface NetworkDebugData {
  apiResponse: any
  edgeAnalysis: {
    courseModuleEdges: any[]
    parentChildEdges: any[]
    issues: string[]
  }
  summary: {
    coursesFound: number
    modulesFound: number
    courseModuleEdgesPossible: number
    parentChildEdgesPossible: number
    issuesDetected: number
  }
}

async function fetchDatabaseData(): Promise<DatabaseDebugData> {
  const response = await fetch('/api/debug/database-data')
  if (!response.ok) {
    throw new Error(`Database debug failed: ${response.status}`)
  }
  return response.json()
}

async function fetchNetworkData(): Promise<NetworkDebugData> {
  const response = await fetch('/api/debug/network-data')
  if (!response.ok) {
    throw new Error(`Network debug failed: ${response.status}`)
  }
  return response.json()
}

export function DatabaseDebugViewer() {
  const [activeTab, setActiveTab] = useState<'database' | 'network'>('database')

  const databaseQuery = useQuery({
    queryKey: ['database-debug'],
    queryFn: fetchDatabaseData,
  })

  const networkQuery = useQuery({
    queryKey: ['network-debug'],
    queryFn: fetchNetworkData,
    enabled: activeTab === 'network',
  })

  const refresh = () => {
    databaseQuery.refetch()
    networkQuery.refetch()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neural">
                <Database className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neural-primary">Database Debug Console</h1>
                <p className="text-sm text-muted-foreground">
                  Investigate database structure and network visualization data
                </p>
              </div>
            </div>
            
            <NeuralButton onClick={refresh} variant="neural" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </NeuralButton>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-4 flex space-x-1">
            <NeuralButton
              variant={activeTab === 'database' ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('database')}
            >
              Database Structure
            </NeuralButton>
            <NeuralButton
              variant={activeTab === 'network' ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('network')}
            >
              Network Data
            </NeuralButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {activeTab === 'database' && (
          <DatabaseAnalysis query={databaseQuery} />
        )}
        
        {activeTab === 'network' && (
          <NetworkAnalysis query={networkQuery} />
        )}
      </main>
    </div>
  )
}

function DatabaseAnalysis({ query }: { query: any }) {
  if (query.isLoading) {
    return <div className="text-center py-8">Loading database analysis...</div>
  }

  if (query.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load database data: {query.error.message}
        </AlertDescription>
      </Alert>
    )
  }

  const data: DatabaseDebugData = query.data

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-neural-primary">{data.summary.totalCourses}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-xs text-green-600">{data.summary.publishedCourses} published</p>
              </div>
              <BookOpen className="h-8 w-8 text-neural-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-synapse-primary">{data.summary.totalModules}</p>
                <p className="text-sm text-muted-foreground">Total Modules</p>
                <p className="text-xs text-green-600">{data.summary.publishedModules} published</p>
              </div>
              <Layers className="h-8 w-8 text-synapse-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-cognition-teal">{data.summary.publishedRelationships}</p>
                <p className="text-sm text-muted-foreground">Course-Module Links</p>
                <p className="text-xs text-blue-600">Published relationships</p>
              </div>
              <ArrowRight className="h-8 w-8 text-cognition-teal" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{data.summary.childModules}</p>
                <p className="text-sm text-muted-foreground">Child Modules</p>
                <p className="text-xs text-blue-600">{data.summary.rootModules} root modules</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Potential Issues */}
      {(data.potentialIssues.unpublishedCourses > 0 || 
        data.potentialIssues.unpublishedModules > 0 || 
        data.potentialIssues.orphanedModules > 0 || 
        data.potentialIssues.coursesWithoutModules > 0) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Potential Issues Detected:</strong>
            <ul className="mt-2 space-y-1">
              {data.potentialIssues.unpublishedCourses > 0 && (
                <li>• {data.potentialIssues.unpublishedCourses} unpublished courses</li>
              )}
              {data.potentialIssues.unpublishedModules > 0 && (
                <li>• {data.potentialIssues.unpublishedModules} unpublished modules</li>
              )}
              {data.potentialIssues.orphanedModules > 0 && (
                <li>• {data.potentialIssues.orphanedModules} orphaned modules (parent not found)</li>
              )}
              {data.potentialIssues.coursesWithoutModules > 0 && (
                <li>• {data.potentialIssues.coursesWithoutModules} courses without published modules</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Published Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-neural-primary" />
              Published Courses ({data.courses.published.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.courses.published.length === 0 ? (
              <p className="text-muted-foreground">No published courses found</p>
            ) : (
              <div className="space-y-2">
                {data.courses.published.map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">by {course.users.name}</p>
                    </div>
                    <Badge variant="outline">{course.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Published Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="mr-2 h-5 w-5 text-synapse-primary" />
              Published Modules ({data.modules.published.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.modules.published.length === 0 ? (
              <p className="text-muted-foreground">No published modules found</p>
            ) : (
              <div className="space-y-2">
                {data.modules.published.slice(0, 10).map((module: any) => (
                  <div key={module.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">{module.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {module.users.name} • {module.parent_module_id ? 'Child' : 'Root'} Module
                      </p>
                    </div>
                    <Badge variant={module.parent_module_id ? "secondary" : "default"}>
                      {module.parent_module_id ? 'Child' : 'Root'}
                    </Badge>
                  </div>
                ))}
                {data.modules.published.length > 10 && (
                  <p className="text-xs text-muted-foreground">
                    ... and {data.modules.published.length - 10} more modules
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Relationships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowRight className="mr-2 h-5 w-5 text-cognition-teal" />
            Course-Module Relationships ({data.relationships.courseModules.length})
          </CardTitle>
          <CardDescription>
            These relationships create course → module edges in the network visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.relationships.courseModules.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>No course-module relationships found!</strong><br />
                This is likely why edges aren&apos;t appearing in the network visualization.
                You need to add modules to courses to create connections.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {data.relationships.courseModules.slice(0, 15).map((rel: any, idx: number) => (
                <div key={idx} className="flex items-center p-2 bg-muted/50 rounded">
                  <span className="font-medium text-neural-primary">{rel.courseTitle}</span>
                  <ArrowRight className="mx-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-synapse-primary">{rel.moduleTitle}</span>
                </div>
              ))}
              {data.relationships.courseModules.length > 15 && (
                <p className="text-xs text-muted-foreground">
                  ... and {data.relationships.courseModules.length - 15} more relationships
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function NetworkAnalysis({ query }: { query: any }) {
  if (query.isLoading) {
    return <div className="text-center py-8">Loading network analysis...</div>
  }

  if (query.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load network data: {query.error.message}
        </AlertDescription>
      </Alert>
    )
  }

  const data: NetworkDebugData = query.data

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-neural-primary">{data.summary.coursesFound}</p>
              <p className="text-sm text-muted-foreground">Courses in API</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-synapse-primary">{data.summary.modulesFound}</p>
              <p className="text-sm text-muted-foreground">Modules in API</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-cognition-teal">{data.summary.courseModuleEdgesPossible}</p>
              <p className="text-sm text-muted-foreground">Course-Module Edges</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{data.summary.parentChildEdgesPossible}</p>
              <p className="text-sm text-muted-foreground">Parent-Child Edges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues */}
      {data.edgeAnalysis.issues.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Issues Detected:</strong>
            <ul className="mt-2 space-y-1">
              {data.edgeAnalysis.issues.map((issue: string, idx: number) => (
                <li key={idx}>• {issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Edge Analysis */}
      {data.summary.courseModuleEdgesPossible === 0 && data.summary.parentChildEdgesPossible === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>No edges can be created!</strong><br />
            The network visualization has no relationships to display. This explains why no edges are appearing.
            You need to add modules to courses or create parent-child module relationships.
          </AlertDescription>
        </Alert>
      )}

      {/* Raw API Response */}
      <Card>
        <CardHeader>
          <CardTitle>Raw API Response</CardTitle>
          <CardDescription>
            This is the exact data the network visualization component receives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data.apiResponse, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
