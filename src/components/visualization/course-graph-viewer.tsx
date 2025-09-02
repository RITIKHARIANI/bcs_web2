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
  ReactFlowProvider,
  MarkerType
} from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NeuralButton } from '@/components/ui/neural-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  EyeOff,
  RotateCw,
  Layout,
  BookOpen,
  Brain,
  Users,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight
} from 'lucide-react'
import 'reactflow/dist/style.css'

// Custom Node Components
const ModuleNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const router = useRouter()
  
  const handleClick = useCallback(() => {
    if (data.courseSlug && data.moduleSlug) {
      router.push(`/courses/${data.courseSlug}?module=${data.moduleSlug}`)
    }
  }, [data.courseSlug, data.moduleSlug, router])

  return (
    <div 
      className={`neural-graph-node group cursor-pointer transition-all duration-200 hover:scale-105 ${
        selected ? 'ring-2 ring-neural-primary ring-offset-2' : ''
      }`}
      onClick={handleClick}
    >
      <div className={`p-4 rounded-xl border-2 min-w-48 max-w-64 ${
        data.type === 'course' 
          ? 'bg-gradient-neural text-primary-foreground border-neural-primary shadow-lg' 
          : data.status === 'published'
            ? 'bg-gradient-to-br from-white to-neural-light/10 border-neural-light hover:border-neural-primary shadow-md'
            : 'bg-gradient-to-br from-muted/50 to-muted border-muted-foreground/30 text-muted-foreground shadow-sm'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${
            data.type === 'course' 
              ? 'bg-white/20' 
              : 'bg-neural-primary/10'
          }`}>
            {data.type === 'course' ? (
              <BookOpen className="h-4 w-4" />
            ) : (
              <Brain className="h-4 w-4 text-neural-primary" />
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {data.featured && (
              <Badge className="bg-cognition-orange text-white scale-75">
                Featured
              </Badge>
            )}
            {data.status === 'published' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className={`font-semibold text-sm leading-tight line-clamp-2 ${
            data.type === 'course' ? 'text-primary-foreground' : 'text-foreground'
          }`}>
            {data.title}
          </h4>
          
          {data.description && (
            <p className={`text-xs line-clamp-3 ${
              data.type === 'course' 
                ? 'text-primary-foreground/80' 
                : 'text-muted-foreground'
            }`}>
              {data.description}
            </p>
          )}
          
          <div className={`flex items-center justify-between text-xs ${
            data.type === 'course' 
              ? 'text-primary-foreground/60' 
              : 'text-muted-foreground'
          }`}>
            {data.type === 'course' ? (
              <>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {data.moduleCount || 0} modules
                </div>
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {data.author}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.ceil((data.content?.split(' ').length || 0) / 200)}m read
                </div>
                <div className="flex items-center">
                  Order: {data.sortOrder || 0}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-neural-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </div>
  )
}

const nodeTypes = {
  moduleNode: ModuleNode,
}

// Main Component
interface CourseGraphViewerProps {
  course: any
  showMiniMap?: boolean
  interactive?: boolean
  className?: string
}

function CourseGraphFlow({ course, showMiniMap = true, interactive = true }: CourseGraphViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNodeType, setSelectedNodeType] = useState<string>('all')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  
  const { fitView, zoomIn, zoomOut } = useReactFlow()

  // Generate nodes and edges from course data
  const { graphNodes, graphEdges } = useMemo(() => {
    if (!course) return { graphNodes: [], graphEdges: [] }

    const graphNodes: Node[] = []
    const graphEdges: Edge[] = []

    // Add course node at the center
    graphNodes.push({
      id: `course-${course.id}`,
      type: 'moduleNode',
      position: { x: 0, y: 0 },
      data: {
        id: course.id,
        title: course.title,
        description: course.description,
        type: 'course',
        status: course.status,
        featured: course.featured,
        author: course.author?.name || 'Unknown',
        moduleCount: course.courseModules?.length || 0,
        courseSlug: course.slug
      }
    })

    // Add module nodes in a circular layout around the course
    const moduleCount = course.courseModules?.length || 0
    const radius = Math.max(200, moduleCount * 30)
    
          course.courseModules?.forEach((courseModule: any, index: number) => {
        const currentModule = courseModule.module
        const angle = (index * 2 * Math.PI) / moduleCount
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        // Add module node
        graphNodes.push({
          id: `module-${currentModule.id}`,
          type: 'moduleNode',
          position: { x, y },
          data: {
            id: currentModule.id,
            title: currentModule.title,
            description: currentModule.description,
            type: 'module',
            status: currentModule.status,
            content: currentModule.content,
            sortOrder: courseModule.sortOrder,
            courseSlug: course.slug,
            moduleSlug: currentModule.slug
          }
        })

        // Add edge from course to module
        graphEdges.push({
          id: `course-${course.id}-module-${currentModule.id}`,
          source: `course-${course.id}`,
          target: `module-${currentModule.id}`,
          type: 'smoothstep',
          style: { 
            stroke: '#6366f1', 
            strokeWidth: 2,
            opacity: 0.7
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6366f1',
          }
        })

        // Add edges between sequential modules
        if (index > 0) {
          const prevModule = course.courseModules[index - 1].module
          graphEdges.push({
            id: `module-${prevModule.id}-module-${currentModule.id}`,
            source: `module-${prevModule.id}`,
            target: `module-${currentModule.id}`,
            type: 'smoothstep',
            style: { 
              stroke: '#8b5cf6', 
              strokeWidth: 1,
              opacity: 0.5,
              strokeDasharray: '5 5'
            }
          })
        }
      })

    return { graphNodes, graphEdges }
  }, [course])

  // Filter nodes based on search and type
  const filteredNodes = useMemo(() => {
    let filtered = graphNodes
    
    if (searchQuery) {
      filtered = filtered.filter(node => 
        node.data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.data.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (selectedNodeType !== 'all') {
      filtered = filtered.filter(node => node.data.type === selectedNodeType)
    }
    
    return filtered
  }, [graphNodes, searchQuery, selectedNodeType])

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

  const handleDownload = useCallback(() => {
    // TODO: Implement graph export functionality
    console.log('Export graph feature to be implemented')
  }, [])

  const handleShare = useCallback(() => {
    // TODO: Implement graph sharing functionality
    console.log('Share graph feature to be implemented')
  }, [])

  return (
    <div className={`relative w-full h-full bg-background border border-border rounded-lg overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Controls Panel */}
      <Panel position="top-left" className="bg-transparent">
        <Card className="cognitive-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Layout className="mr-2 h-4 w-4" />
              Course Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                className="pl-7 h-8 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex space-x-2">
              <NeuralButton
                variant={selectedNodeType === 'all' ? 'neural' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-6"
                onClick={() => setSelectedNodeType('all')}
              >
                All
              </NeuralButton>
              <NeuralButton
                variant={selectedNodeType === 'course' ? 'neural' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-6"
                onClick={() => setSelectedNodeType('course')}
              >
                Course
              </NeuralButton>
              <NeuralButton
                variant={selectedNodeType === 'module' ? 'neural' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-6"
                onClick={() => setSelectedNodeType('module')}
              >
                Modules
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
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <div className="font-semibold text-neural-primary">
                  {course.courseModules?.length || 0}
                </div>
                <div className="text-muted-foreground">Modules</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-neural-primary">
                  {filteredNodes.length}
                </div>
                <div className="text-muted-foreground">Visible</div>
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
          className="opacity-20"
        />
        
        <Controls 
          className="bg-background/90 border border-border rounded-lg"
          showInteractive={interactive}
        />
        
        {showMiniMap && (
          <MiniMap
            className="bg-background/90 border border-border rounded-lg"
            nodeColor={(node) => {
              switch (node.data.type) {
                case 'course': return '#6366f1'
                case 'module': return '#8b5cf6'
                default: return '#64748b'
              }
            }}
            nodeStrokeWidth={2}
            maskColor="rgba(0, 0, 0, 0.2)"
            pannable
            zoomable
          />
        )}
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
                <div className="w-3 h-3 rounded bg-neural-light border border-neural-primary"></div>
                <span>Module</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-3 h-3 text-neural-primary" />
                <span>Hierarchy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0 border-t border-dashed border-neural-secondary"></div>
                <span>Sequence</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Panel>
    </div>
  )
}

export function CourseGraphViewer(props: CourseGraphViewerProps) {
  return (
    <ReactFlowProvider>
      <div className={`w-full ${props.className || 'h-96'}`}>
        <CourseGraphFlow {...props} />
      </div>
    </ReactFlowProvider>
  )
}
