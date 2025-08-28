"use client";

import { useCallback, useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  NodeTypes,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NeuralButton } from '@/components/ui/neural-button'
import { 
  BookOpen, 
  Brain, 
  Layers, 
  Eye, 
  Edit,
  ArrowLeft,
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// Custom Node Components
function CourseNode({ data }: { data: any }) {
  return (
    <div className="p-4 rounded-lg border-2 border-neural-primary bg-gradient-neural text-white shadow-lg min-w-[200px]">
      <div className="flex items-center space-x-2 mb-2">
        <BookOpen className="h-5 w-5" />
        <span className="font-bold text-sm">{data.title}</span>
      </div>
      <div className="text-xs opacity-90">
        {data.moduleCount} modules
      </div>
      <Badge variant="secondary" className="mt-2 text-xs">
        Course
      </Badge>
    </div>
  )
}

function ModuleNode({ data }: { data: any }) {
  const isRoot = !data.parentModuleId
  
  return (
    <div className={`p-3 rounded-lg border-2 shadow-md min-w-[150px] ${
      isRoot 
        ? 'border-synapse-primary bg-gradient-synaptic text-white' 
        : 'border-cognition-teal bg-gradient-cognitive text-white'
    }`}>
      <div className="flex items-center space-x-2 mb-1">
        {isRoot ? (
          <Brain className="h-4 w-4" />
        ) : (
          <Layers className="h-4 w-4" />
        )}
        <span className="font-semibold text-xs">{data.title}</span>
      </div>
      {data.description && (
        <div className="text-xs opacity-90 line-clamp-2 mb-2">
          {data.description}
        </div>
      )}
      <div className="flex items-center justify-between">
        <Badge 
          variant={data.status === 'published' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {data.status}
        </Badge>
        <div className="flex space-x-1">
          <Link href={`/faculty/modules/${data.id}`}>
            <button className="p-1 rounded hover:bg-white/20 transition-colors">
              <Eye className="h-3 w-3" />
            </button>
          </Link>
          <Link href={`/faculty/modules/edit/${data.id}`}>
            <button className="p-1 rounded hover:bg-white/20 transition-colors">
              <Edit className="h-3 w-3" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  course: CourseNode,
  module: ModuleNode,
}

interface Module {
  id: string
  title: string
  slug: string
  description: string | null
  status: 'draft' | 'published'
  parentModuleId: string | null
  sortOrder: number
}

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  _count: {
    courseModules: number
  }
  courseModules: {
    module: {
      id: string
      title: string
      slug?: string
      description?: string | null
      status?: 'draft' | 'published'
      parentModuleId?: string | null
      sortOrder?: number
    }
  }[]
}

interface VisualizationData {
  type: 'full' | 'course'
  modules: Module[]
  courses?: Course[]
  course?: Course & {
    courseModules: {
      module: Module
    }[]
  }
}

async function fetchVisualizationData(courseId?: string): Promise<VisualizationData> {
  const url = courseId 
    ? `/api/visualization/course-structure?courseId=${courseId}`
    : '/api/visualization/course-structure'
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch visualization data')
  }
  return response.json()
}

interface NetworkVisualizationProps {
  courseId?: string
  onClose?: () => void
}

export function NetworkVisualization({ courseId, onClose }: NetworkVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['visualization', courseId],
    queryFn: () => fetchVisualizationData(courseId),
  })

  // Generate nodes and edges from data
  const { filteredNodes, filteredEdges } = useMemo(() => {
    if (!data) return { filteredNodes: [], filteredEdges: [] }

    const newNodes: Node[] = []
    const newEdges: Edge[] = []

    if (data.type === 'course' && data.course) {
      // Course view: Show course + its modules
      const course = data.course
      
      // Add course node
      newNodes.push({
        id: `course-${course.id}`,
        type: 'course',
        position: { x: 400, y: 50 },
        data: {
          ...course,
          moduleCount: course.courseModules.length,
        },
      })

      // Add module nodes
      course.courseModules.forEach((cm, index) => {
        const moduleData = cm.module
        
        // Filter by search and status
        const matchesSearch = !searchTerm || 
          moduleData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (moduleData.description && moduleData.description.toLowerCase().includes(searchTerm.toLowerCase()))
        
        const matchesStatus = statusFilter === 'all' || moduleData.status === statusFilter
        
        if (matchesSearch && matchesStatus) {
          // Calculate position in a circular layout around the course
          const angle = (index / course.courseModules.length) * 2 * Math.PI
          const radius = 250
          const x = 400 + Math.cos(angle) * radius
          const y = 300 + Math.sin(angle) * radius

          newNodes.push({
            id: moduleData.id,
            type: 'module',
            position: { x, y },
            data: moduleData,
          })

          // Connect to course
          newEdges.push({
            id: `course-${course.id}-${moduleData.id}`,
            source: `course-${course.id}`,
            target: moduleData.id,
            type: 'smoothstep',
            style: { stroke: '#6366f1', strokeWidth: 2 },
            animated: true,
          })

          // Connect to parent module if exists
          if (moduleData.parentModuleId) {
            const parentExists = course.courseModules.some(
              pcm => pcm.module.id === moduleData.parentModuleId
            )
            if (parentExists) {
              newEdges.push({
                id: `${moduleData.parentModuleId}-${moduleData.id}`,
                source: moduleData.parentModuleId,
                target: moduleData.id,
                type: 'smoothstep',
                style: { stroke: '#10b981', strokeWidth: 1.5 },
              })
            }
          }
        }
      })
    } else if (data.type === 'full') {
      // Full view: Show all courses and modules
      let xOffset = 0
      const courseSpacing = 400

      data.courses?.forEach((course, courseIndex) => {
        // Add course node
        newNodes.push({
          id: `course-${course.id}`,
          type: 'course',
          position: { x: xOffset, y: 50 },
          data: {
            ...course,
            moduleCount: course._count.courseModules,
          },
        })

        // Add modules for this course
        const courseModules = data.modules.filter(module =>
          course.courseModules.some(cm => cm.module.id === module.id)
        )

        courseModules.forEach((moduleData, moduleIndex) => {
          // Filter by search and status
          const matchesSearch = !searchTerm || 
            moduleData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (moduleData.description && moduleData.description.toLowerCase().includes(searchTerm.toLowerCase()))
          
          const matchesStatus = statusFilter === 'all' || moduleData.status === statusFilter
          
          if (matchesSearch && matchesStatus) {
            const y = 200 + (moduleIndex * 120)
            
            newNodes.push({
              id: moduleData.id,
              type: 'module',
              position: { x: xOffset + 50, y },
              data: moduleData,
            })

            // Connect to course
            newEdges.push({
              id: `course-${course.id}-${moduleData.id}`,
              source: `course-${course.id}`,
              target: moduleData.id,
              type: 'smoothstep',
              style: { stroke: '#6366f1', strokeWidth: 2 },
            })

            // Connect to parent module if exists and in same course
            if (moduleData.parentModuleId) {
              const parentInCourse = courseModules.find(m => m.id === moduleData.parentModuleId)
              if (parentInCourse) {
                newEdges.push({
                  id: `${moduleData.parentModuleId}-${moduleData.id}`,
                  source: moduleData.parentModuleId,
                  target: moduleData.id,
                  type: 'smoothstep',
                  style: { stroke: '#10b981', strokeWidth: 1.5 },
                })
              }
            }
          }
        })

        xOffset += courseSpacing
      })

      // Add standalone modules (not in any course)
      const standaloneModules = data.modules.filter(module =>
        !data.courses?.some(course =>
          course.courseModules.some(cm => cm.module.id === module.id)
        )
      )

      standaloneModules.forEach((moduleData, index) => {
        const matchesSearch = !searchTerm || 
          moduleData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (moduleData.description && moduleData.description.toLowerCase().includes(searchTerm.toLowerCase()))
        
        const matchesStatus = statusFilter === 'all' || moduleData.status === statusFilter
        
        if (matchesSearch && matchesStatus) {
          newNodes.push({
            id: moduleData.id,
            type: 'module',
            position: { x: xOffset, y: 200 + (index * 120) },
            data: moduleData,
          })

          // Connect to parent module if exists
          if (moduleData.parentModuleId) {
            newEdges.push({
              id: `${moduleData.parentModuleId}-${moduleData.id}`,
              source: moduleData.parentModuleId,
              target: moduleData.id,
              type: 'smoothstep',
              style: { stroke: '#10b981', strokeWidth: 1.5 },
            })
          }
        }
      })
    }

    return { filteredNodes: newNodes, filteredEdges: newEdges }
  }, [data, searchTerm, statusFilter])

  useEffect(() => {
    setNodes(filteredNodes)
    setEdges(filteredEdges)
  }, [filteredNodes, filteredEdges, setNodes, setEdges])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-neural-primary" />
          <p className="text-muted-foreground">Loading visualization...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="cognitive-card">
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Visualization</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the network visualization.
          </p>
          <NeuralButton onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </NeuralButton>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'relative'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          {onClose && (
            <NeuralButton variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </NeuralButton>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neural-primary">
              {data?.type === 'course' ? `Course Structure: ${data.course?.title}` : 'Content Structure'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Interactive visualization of your {data?.type === 'course' ? 'course' : 'content'} structure
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <NeuralButton
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden sm:flex"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </NeuralButton>
          <NeuralButton variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </NeuralButton>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-muted/50">
        <div className="relative flex-1 max-w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center justify-between sm:justify-start space-x-2">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground hidden sm:inline">Filter:</span>
          </div>
          <div className="flex space-x-1 sm:space-x-2">
            <NeuralButton
              variant={statusFilter === 'all' ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="text-xs sm:text-sm"
            >
              All
            </NeuralButton>
            <NeuralButton
              variant={statusFilter === 'published' ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('published')}
              className="text-xs sm:text-sm"
            >
              Published
            </NeuralButton>
            <NeuralButton
              variant={statusFilter === 'draft' ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('draft')}
              className="text-xs sm:text-sm"
            >
              Drafts
            </NeuralButton>
          </div>
        </div>
      </div>

      {/* React Flow */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-180px)] sm:h-[calc(100vh-120px)]' : 'h-64 sm:h-96'} border rounded-lg`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              if (node.type === 'course') return '#6366f1'
              if (node.data.parentModuleId) return '#06b6d4'
              return '#8b5cf6'
            }}
            pannable
            zoomable
          />
        </ReactFlow>
      </div>
    </div>
  )
}
