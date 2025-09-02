"use client";

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NeuralButton } from '@/components/ui/neural-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Network, 
  BookOpen, 
  Edit3,
  Eye,
  Users,
  Brain,
  Layers,
  TrendingUp,
  Settings
} from 'lucide-react'
import { CourseGraphViewer } from './course-graph-viewer'
import { ModuleRelationshipViewer } from './module-relationship-viewer'
import { FacultyGraphEditor } from './faculty-graph-editor'

interface IntegratedGraphSystemProps {
  mode?: 'public' | 'faculty'
  course?: any
  courseId?: string
  className?: string
}

export function IntegratedGraphSystem({ 
  mode = 'public',
  course,
  courseId,
  className = 'h-[600px]'
}: IntegratedGraphSystemProps) {
  const [activeTab, setActiveTab] = useState(
    mode === 'faculty' ? 'editor' : 'course'
  )

  // Faculty view with all three graph types
  if (mode === 'faculty') {
    return (
      <div className={`w-full ${className} space-y-4`}>
        <Card className="cognitive-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Network className="mr-3 h-5 w-5 text-neural-primary" />
              Interactive Course & Module Visualization
              <Badge className="ml-3 bg-neural-primary text-white">Faculty Tools</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="editor" className="flex items-center space-x-1">
                  <Edit3 className="h-3 w-3" />
                  <span className="hidden sm:inline">Editor</span>
                </TabsTrigger>
                <TabsTrigger value="course" className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span className="hidden sm:inline">Structure</span>
                </TabsTrigger>
                <TabsTrigger value="relationships" className="flex items-center space-x-1">
                  <Network className="h-3 w-3" />
                  <span className="hidden sm:inline">Relations</span>
                </TabsTrigger>
              </TabsList>

              {/* Faculty Course Structure Editor */}
              <TabsContent value="editor" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Edit3 className="h-5 w-5 text-neural-primary" />
                      <div>
                        <h3 className="font-semibold">Course Structure Editor</h3>
                        <p className="text-sm text-muted-foreground">
                          Drag-and-drop modules to design your course flow
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit Mode
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg overflow-hidden">
                    <FacultyGraphEditor 
                      courseId={courseId}
                      className="h-96"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <Card className="p-3 bg-muted/20">
                      <div className="flex items-center space-x-2">
                        <Edit3 className="h-4 w-4 text-neural-primary" />
                        <span className="font-medium">Interactive Editing</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Double-click nodes to edit, drag to reposition
                      </p>
                    </Card>
                    <Card className="p-3 bg-muted/20">
                      <div className="flex items-center space-x-2">
                        <Layers className="h-4 w-4 text-neural-primary" />
                        <span className="font-medium">Module Management</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add, remove, and reorder course modules
                      </p>
                    </Card>
                    <Card className="p-3 bg-muted/20">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-neural-primary" />
                        <span className="font-medium">Auto Layout</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatic arrangement for optimal visualization
                      </p>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Course Structure View */}
              <TabsContent value="course" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-neural-primary" />
                      <div>
                        <h3 className="font-semibold">Course Structure View</h3>
                        <p className="text-sm text-muted-foreground">
                          Interactive visualization of course hierarchy and module flow
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Eye className="h-3 w-3 mr-1" />
                      View Mode
                    </Badge>
                  </div>
                  
                  <div className="border border-border rounded-lg overflow-hidden">
                    {course ? (
                      <CourseGraphViewer 
                        course={course}
                        className="h-96"
                        showMiniMap={true}
                        interactive={true}
                      />
                    ) : (
                      <div className="h-96 flex items-center justify-center bg-muted/20 text-muted-foreground">
                        Select a course to view its structure
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Module Relationships */}
              <TabsContent value="relationships" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Network className="h-5 w-5 text-neural-primary" />
                      <div>
                        <h3 className="font-semibold">Module Relationship Analysis</h3>
                        <p className="text-sm text-muted-foreground">
                          Cross-course module usage and reusability insights
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <Brain className="h-3 w-3 mr-1" />
                      Analysis Mode
                    </Badge>
                  </div>
                  
                  <div className="border border-border rounded-lg overflow-hidden">
                    <ModuleRelationshipViewer className="h-96" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <Card className="p-3 bg-orange-50 border-orange-200">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">Reusable Modules</span>
                      </div>
                      <p className="text-xs text-orange-700 mt-1">
                        Modules used across multiple courses for efficient content management
                      </p>
                    </Card>
                    <Card className="p-3 bg-blue-50 border-blue-200">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Usage Analytics</span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        Insights into module popularity and course interconnections
                      </p>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Public view - just the course structure
  return (
    <div className={`w-full ${className}`}>
      <Card className="cognitive-card h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BookOpen className="mr-3 h-5 w-5 text-neural-primary" />
            Course Structure Visualization
            <Badge className="ml-3 bg-muted text-muted-foreground">Interactive</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <div className="space-y-4 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Network className="h-4 w-4 text-neural-primary" />
                <p className="text-sm text-muted-foreground">
                  Explore the course structure and navigate between modules
                </p>
              </div>
              <Badge variant="outline">
                <Eye className="h-3 w-3 mr-1" />
                Interactive View
              </Badge>
            </div>
            
            <div className="border border-border rounded-lg overflow-hidden flex-1">
              {course ? (
                <CourseGraphViewer 
                  course={course}
                  className="h-full min-h-96"
                  showMiniMap={true}
                  interactive={true}
                />
              ) : (
                <div className="h-96 flex items-center justify-center bg-muted/20 text-muted-foreground">
                  Course data not available
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
