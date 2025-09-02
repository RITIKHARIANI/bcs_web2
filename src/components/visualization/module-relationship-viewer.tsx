"use client";

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NeuralButton } from '@/components/ui/neural-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { 
  Network, 
  Search, 
  Filter,
  BookOpen,
  Brain,
  Users,
  Layers,
  Link2,
  TrendingUp,
  Share2,
  Eye,
  EyeOff,
  RotateCw,
  Maximize2,
  Minimize2
} from 'lucide-react'
import 'reactflow/dist/style.css'

// Custom Node for Cross-Course Module View
const CrossCourseModuleNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const router = useRouter()
  
  const handleClick = useCallback(() => {
    // Navigate to first course that contains this module
    if (data.courses && data.courses.length > 0) {
      const firstCourse = data.courses[0]
      router.push(`/courses/${firstCourse.slug}?module=${data.slug}`)
    }
  }, [data.courses, data.slug, router])

  const usageCount = data.courses?.length || 0
  const isReusable = usageCount > 1

  return (
    <div 
      className={`neural-graph-node group cursor-pointer transition-all duration-200 hover:scale-105 ${
        selected ? 'ring-2 ring-neural-primary ring-offset-2' : ''
      }`}
      onClick={handleClick}
    >
      <div className={`p-4 rounded-xl border-2 min-w-48 max-w-64 relative ${
        isReusable
          ? 'bg-gradient-to-br from-cognition-orange/10 to-cognition-orange/5 border-cognition-orange shadow-md'
          : data.status === 'published'
            ? 'bg-gradient-to-br from-white to-neural-light/10 border-neural-light hover:border-neural-primary shadow-md'
            : 'bg-gradient-to-br from-muted/50 to-muted border-muted-foreground/30 text-muted-foreground shadow-sm'
      }`}>
        {/* Reusability indicator */}
        {isReusable && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-cognition-orange text-white scale-75">
              <Link2 className="h-3 w-3 mr-1" />
              {usageCount} courses
            </Badge>
          </div>
        )}
        
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${
            isReusable ? 'bg-cognition-orange/20' : 'bg-neural-primary/10'
          }`}>
            <Brain className={`h-4 w-4 ${
              isReusable ? 'text-cognition-orange' : 'text-neural-primary'
            }`} />
          </div>
          
          <div className="text-xs text-muted-foreground">
            ID: {data.id}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
            {data.title}
          </h4>
          
          {data.description && (
            <p className="text-xs line-clamp-3 text-muted-foreground">
              {data.description}
            </p>
          )}
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              Used in courses:
            </div>
            <div className="flex flex-wrap gap-1">
              {data.courses?.slice(0, 2).map((course: any) => (
                <Badge 
                  key={course.id} 
                  variant="outline" 
                  className="text-xs scale-75 origin-left"
                >
                  {course.title}
                </Badge>
              ))}
              {usageCount > 2 && (
                <Badge variant="secondary" className="text-xs scale-75 origin-left">
                  +{usageCount - 2} more
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {data.status}
            </div>
            <div className="flex items-center">
              Order: {data.sortOrder || 0}
            </div>
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
          isReusable ? 'bg-cognition-orange/10' : 'bg-neural-primary/10'
        }`} />
      </div>
    </div>
  )
}

const CourseClusterNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const router = useRouter()
  
  const handleClick = useCallback(() => {
    router.push(`/courses/${data.slug}`)
  }, [data.slug, router])

  return (
    <div 
      className={`neural-graph-node group cursor-pointer transition-all duration-200 hover:scale-105 ${
        selected ? 'ring-2 ring-neural-primary ring-offset-2' : ''
      }`}
      onClick={handleClick}
    >
      <div className="p-4 rounded-xl border-2 min-w-56 max-w-72 bg-gradient-neural text-primary-foreground border-neural-primary shadow-lg">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 rounded-lg bg-white/20">
            <BookOpen className="h-5 w-5" />
          </div>
          
          <div className="flex items-center space-x-1">
            {data.featured && (
              <Badge className="bg-cognition-orange text-white scale-75">
                Featured
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-base leading-tight line-clamp-2">
            {data.title}
          </h4>
          
          {data.description && (
            <p className="text-sm line-clamp-3 text-primary-foreground/80">
              {data.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-primary-foreground/60">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {data.moduleCount} modules
            </div>
            <div className="flex items-center">
              <Layers className="h-3 w-3 mr-1" />
              {data.sharedModules || 0} shared
            </div>
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </div>
  )
}

const nodeTypes = {
  crossCourseModule: CrossCourseModuleNode,
  courseCluster: CourseClusterNode,
}

// Main Component
interface ModuleRelationshipViewerProps {
  className?: string
}

function ModuleRelationshipFlow({ className }: ModuleRelationshipViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'reusability' | 'dependencies'>('reusability')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  
  const { fitView, zoomIn, zoomOut } = useReactFlow()

  // Fetch all courses and modules for cross-course analysis
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses-modules-relationship'],
    queryFn: async () => {
      const [coursesResponse] = await Promise.all([
        fetch('/api/courses'),
      ])
      
      const courses = await coursesResponse.json()
      return courses
    }
  })

  // Generate cross-course relationship graph
  const { graphNodes, graphEdges } = useMemo(() => {
    if (!coursesData?.courses) return { graphNodes: [], graphEdges: [] }

    const graphNodes: Node[] = []
    const graphEdges: Edge[] = []
    
    // Create module usage map
    const moduleUsageMap = new Map<string, any>()
    
    // Process all courses to find module usage
    coursesData.courses.forEach((course: any) => {
      course.courseModules?.forEach((courseModule: any) => {
        const currentModule = courseModule.module
        const moduleId = currentModule.id
        
        if (!moduleUsageMap.has(moduleId)) {
          moduleUsageMap.set(moduleId, {
            ...currentModule,
            courses: []
          })
        }
        
        moduleUsageMap.get(moduleId).courses.push({
          id: course.id,
          title: course.title,
          slug: course.slug
        })
      })
    })

    if (viewMode === 'reusability') {
      // Show modules and their reusability across courses
      const moduleArray = Array.from(moduleUsageMap.values())
      const reusableModules = moduleArray.filter(module => module.courses.length > 1)
      const regularModules = moduleArray.filter(module => module.courses.length === 1)

      // Add reusable modules in center cluster
      const reusableCount = reusableModules.length
      reusableModules.forEach((module, index) => {
        const angle = (index * 2 * Math.PI) / Math.max(reusableCount, 1)
        const radius = 150
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        graphNodes.push({
          id: `module-${module.id}`,
          type: 'crossCourseModule',
          position: { x, y },
          data: module
        })
      })

      // Add regular modules in outer ring
      const regularCount = Math.min(regularModules.length, 20) // Limit for performance
      const outerRadius = 300
      regularModules.slice(0, regularCount).forEach((module, index) => {
        const angle = (index * 2 * Math.PI) / regularCount
        const x = Math.cos(angle) * outerRadius
        const y = Math.sin(angle) * outerRadius

        graphNodes.push({
          id: `module-${module.id}`,
          type: 'crossCourseModule',
          position: { x, y },
          data: module
        })
      })

      // Add course cluster nodes
      coursesData.courses.forEach((course: any, index: number) => {
        const courseRadius = 500
        const angle = (index * 2 * Math.PI) / coursesData.courses.length
        const x = Math.cos(angle) * courseRadius
        const y = Math.sin(angle) * courseRadius

        const sharedModules = course.courseModules?.filter((cm: any) => 
          moduleUsageMap.get(cm.module.id)?.courses.length > 1
        ).length || 0

        graphNodes.push({
          id: `course-${course.id}`,
          type: 'courseCluster',
          position: { x, y },
          data: {
            ...course,
            moduleCount: course.courseModules?.length || 0,
            sharedModules
          }
        })

        // Add edges from shared modules to courses
        course.courseModules?.forEach((courseModule: any) => {
          const currentModule = courseModule.module
          const moduleUsage = moduleUsageMap.get(currentModule.id)
          
          if (moduleUsage && moduleUsage.courses.length > 1) {
            graphEdges.push({
              id: `module-${currentModule.id}-course-${course.id}`,
              source: `module-${currentModule.id}`,
              target: `course-${course.id}`,
              type: 'smoothstep',
              style: { 
                stroke: moduleUsage.courses.length > 2 ? '#f59e0b' : '#6366f1',
                strokeWidth: Math.min(moduleUsage.courses.length, 4),
                opacity: 0.6
              }
            })
          }
        })
      })
    }

    return { graphNodes, graphEdges }
  }, [coursesData, viewMode])

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    let filtered = graphNodes
    
    if (searchQuery) {
      filtered = filtered.filter(node => 
        node.data.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.data.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [graphNodes, searchQuery])

  // Filter edges to only show connections between visible nodes
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(node => node.id))
    return graphEdges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    )
  }, [graphEdges, filteredNodes])

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(filteredNodes)
    setEdges(filteredEdges)
  }, [filteredNodes, filteredEdges, setNodes, setEdges])

  // Auto-fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => fitView(), 100)
    }
  }, [nodes, fitView])

  const handleReset = useCallback(() => {
    fitView()
  }, [fitView])

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loading variant="neural" text="Loading module relationships..." />
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full bg-background border border-border rounded-lg overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Controls Panel */}
      <Panel position="top-left" className="bg-transparent">
        <Card className="cognitive-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Network className="mr-2 h-4 w-4" />
              Module Relationships
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                className="pl-7 h-8 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* View Mode */}
            <div className="flex space-x-2">
              <NeuralButton
                variant={viewMode === 'reusability' ? 'neural' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-6"
                onClick={() => setViewMode('reusability')}
              >
                Reusability
              </NeuralButton>
              <NeuralButton
                variant={viewMode === 'dependencies' ? 'neural' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-6"
                onClick={() => setViewMode('dependencies')}
              >
                Dependencies
              </NeuralButton>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-1">
              <NeuralButton
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                onClick={() => setShowLabels(!showLabels)}
                title={showLabels ? "Hide Labels" : "Show Labels"}
              >
                {showLabels ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </NeuralButton>
              <NeuralButton
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                onClick={handleReset}
                title="Reset View"
              >
                <RotateCw className="h-3 w-3" />
              </NeuralButton>
              <NeuralButton
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </NeuralButton>
            </div>
          </CardContent>
        </Card>
      </Panel>

      {/* Stats Panel */}
      <Panel position="top-right" className="bg-transparent">
        <Card className="cognitive-card">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <div className="font-semibold text-neural-primary">
                  {coursesData?.courses?.length || 0}
                </div>
                <div className="text-muted-foreground">Courses</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-cognition-orange">
                  {filteredNodes.filter((n: any) => n.data.courses?.length > 1).length}
                </div>
                <div className="text-muted-foreground">Reusable</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-neural-primary">
                  {filteredNodes.length}
                </div>
                <div className="text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Panel>

      {/* Main Graph */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-background via-muted/30 to-neural-light/20"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background 
          color="#6366f1" 
          gap={20} 
          size={1} 
          variant="dots" 
          className="opacity-20"
        />
        
        <Controls className="bg-background/90 border border-border rounded-lg" />
        
        <MiniMap
          className="bg-background/90 border border-border rounded-lg"
          nodeColor={(node) => {
            if (node.data.courses?.length > 1) return '#f59e0b' // Orange for reusable
            if (node.data.type === 'course') return '#6366f1' // Blue for courses
            return '#8b5cf6' // Purple for regular modules
          }}
          nodeStrokeWidth={2}
          maskColor="rgba(0, 0, 0, 0.2)"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Legend */}
      <Panel position="bottom-left" className="bg-transparent">
        <Card className="cognitive-card">
          <CardContent className="pt-4">
            <div className="space-y-2 text-xs">
              <div className="font-semibold mb-2">Legend</div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-gradient-neural"></div>
                <span>Course</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-cognition-orange"></div>
                <span>Reusable Module</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-neural-secondary"></div>
                <span>Regular Module</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0 border-t-2 border-cognition-orange"></div>
                <span>High Reuse</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Panel>
    </div>
  )
}

export function ModuleRelationshipViewer(props: ModuleRelationshipViewerProps) {
  return (
    <ReactFlowProvider>
      <div className={`w-full ${props.className || 'h-96'}`}>
        <ModuleRelationshipFlow {...props} />
      </div>
    </ReactFlowProvider>
  )
}
