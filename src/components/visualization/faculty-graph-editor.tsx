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
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  NodeDragHandler,
  OnConnect,
  MarkerType
} from 'reactflow'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NeuralButton } from '@/components/ui/neural-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Edit3, 
  Save, 
  Download, 
  Upload,
  Plus,
  Trash2,
  Search,
  Undo2,
  Redo2,
  Layout,
  BookOpen,
  Brain,
  Settings,
  Link2,
  Unlink,
  Copy,
  Maximize2,
  Minimize2,
  RotateCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import 'reactflow/dist/style.css'

// Editable Module Node
const EditableModuleNode = ({ 
  data, 
  selected, 
  dragging 
}: { 
  data: any; 
  selected: boolean;
  dragging: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(data.title)

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleSave = useCallback(() => {
    if (title.trim() && title !== data.title) {
      data.onUpdate?.(data.id, { title: title.trim() })
    }
    setIsEditing(false)
  }, [title, data])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setTitle(data.title)
      setIsEditing(false)
    }
  }, [handleSave, data.title])

  return (
    <div 
      className={`neural-graph-node group transition-all duration-200 ${
        dragging ? 'scale-105 shadow-lg' : ''
      } ${selected ? 'ring-2 ring-neural-primary ring-offset-2' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`p-4 rounded-xl border-2 min-w-48 max-w-64 relative ${
        data.status === 'published'
          ? 'bg-gradient-to-br from-white to-neural-light/10 border-neural-light hover:border-neural-primary shadow-md'
          : 'bg-gradient-to-br from-muted/50 to-muted border-muted-foreground/30 shadow-sm'
      }`}>
        {/* Module Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 rounded-lg bg-neural-primary/10">
            <Brain className="h-4 w-4 text-neural-primary" />
          </div>
          
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className="text-xs">
              {data.sortOrder}
            </Badge>
            {data.status === 'published' && (
              <CheckCircle className="h-3 w-3 text-green-500" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          {/* Editable Title */}
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className="h-8 text-sm font-semibold"
              autoFocus
            />
          ) : (
            <h4 
              className="font-semibold text-sm leading-tight line-clamp-2 text-foreground cursor-text"
              title="Double-click to edit"
            >
              {data.title}
            </h4>
          )}
          
          {data.description && (
            <p className="text-xs line-clamp-3 text-muted-foreground">
              {data.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>
              {data.status === 'published' ? 'Published' : 'Draft'}
            </div>
            <div>
              {Math.ceil((data.content?.split(' ').length || 0) / 200)}m read
            </div>
          </div>
        </div>
        
        {/* Action Buttons (visible on hover) */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1">
            <NeuralButton
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 bg-background/80"
              onClick={() => data.onEdit?.(data.id)}
              title="Edit Module"
            >
              <Edit3 className="h-3 w-3" />
            </NeuralButton>
            <NeuralButton
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 bg-background/80 text-destructive"
              onClick={() => data.onRemove?.(data.id)}
              title="Remove from Course"
            >
              <Trash2 className="h-3 w-3" />
            </NeuralButton>
          </div>
        </div>
        
        {/* Drag indicator */}
        {dragging && (
          <div className="absolute inset-0 bg-neural-primary/20 rounded-xl pointer-events-none" />
        )}
      </div>
    </div>
  )
}

const nodeTypes = {
  editableModule: EditableModuleNode,
}

// Main Faculty Graph Editor Component
interface FacultyGraphEditorProps {
  courseId?: string
  className?: string
  onSave?: (courseData: any) => void
}

function FacultyGraphEditorFlow({ courseId, className, onSave }: FacultyGraphEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [availableModules, setAvailableModules] = useState<any[]>([])
  
  const { fitView, getViewport, setViewport } = useReactFlow()
  const queryClient = useQueryClient()

  // Fetch course data
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null
      const response = await fetch(`/api/courses/${courseId}`)
      return response.json()
    },
    enabled: !!courseId
  })

  // Fetch all available modules
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const response = await fetch('/api/modules')
      return response.json()
    }
  })

  // Save course structure mutation
  const saveCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      })
      return response.json()
    },
    onSuccess: () => {
      toast.success('Course structure saved successfully!')
      setHasChanges(false)
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    },
    onError: (error) => {
      console.error('Save error:', error)
      toast.error('Failed to save course structure')
    }
  })

  // Generate nodes and edges from course data
  useEffect(() => {
    if (!courseData?.course) return

    const course = courseData.course
    const courseModules = course.courseModules || []
    
    const newNodes: Node[] = []
    const newEdges: Edge[] = []

    // Create nodes for each module
    courseModules.forEach((courseModule: any, index: number) => {
      const currentModule = courseModule.module
      const angle = (index * 2 * Math.PI) / Math.max(courseModules.length, 1)
      const radius = Math.max(200, courseModules.length * 25)
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      newNodes.push({
        id: `module-${currentModule.id}`,
        type: 'editableModule',
        position: { x, y },
        data: {
          ...currentModule,
          sortOrder: courseModule.sortOrder,
          onUpdate: handleNodeUpdate,
          onEdit: handleNodeEdit,
          onRemove: handleNodeRemove,
        },
        draggable: true,
      })

      // Create edges for sequential flow
      if (index > 0) {
        const prevModule = courseModules[index - 1].module
        newEdges.push({
          id: `edge-${prevModule.id}-${currentModule.id}`,
          source: `module-${prevModule.id}`,
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
      }
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [courseData, setNodes, setEdges])

  // Update available modules
  useEffect(() => {
    if (modulesData?.modules && courseData?.course) {
      const usedModuleIds = new Set(
        courseData.course.courseModules?.map((cm: any) => cm.module.id) || []
      )
      const available = modulesData.modules.filter(
        (module: any) => !usedModuleIds.has(module.id) && module.status === 'published'
      )
      setAvailableModules(available)
    }
  }, [modulesData, courseData])

  // Handle node updates
  const handleNodeUpdate = useCallback((nodeId: string, updates: any) => {
    setNodes(nodes => 
      nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    )
    setHasChanges(true)
  }, [setNodes])

  // Handle node editing
  const handleNodeEdit = useCallback((nodeId: string) => {
    const moduleId = nodeId.replace('module-', '')
    window.open(`/faculty/modules/edit/${moduleId}`, '_blank')
  }, [])

  // Handle node removal
  const handleNodeRemove = useCallback((nodeId: string) => {
    setNodes(nodes => nodes.filter(node => node.id !== nodeId))
    setEdges(edges => edges.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ))
    setHasChanges(true)
  }, [setNodes, setEdges])

  // Handle adding new modules
  const handleAddModule = useCallback((module: any) => {
    const newNodeId = `module-${module.id}`
    const existingCount = nodes.length
    const angle = (existingCount * 2 * Math.PI) / (existingCount + 1)
    const radius = Math.max(200, existingCount * 30)
    const x = Math.cos(angle) * radius + Math.random() * 50 - 25
    const y = Math.sin(angle) * radius + Math.random() * 50 - 25

    const newNode: Node = {
      id: newNodeId,
      type: 'editableModule',
      position: { x, y },
      data: {
        ...module,
        sortOrder: existingCount + 1,
        onUpdate: handleNodeUpdate,
        onEdit: handleNodeEdit,
        onRemove: handleNodeRemove,
      },
      draggable: true,
    }

    setNodes(nodes => [...nodes, newNode])
    setHasChanges(true)
  }, [nodes, setNodes, handleNodeUpdate, handleNodeEdit, handleNodeRemove])

  // Handle connecting nodes
  const onConnect: OnConnect = useCallback((connection: Connection) => {
    const newEdge = {
      ...connection,
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
    }
    setEdges(edges => addEdge(newEdge, edges))
    setHasChanges(true)
  }, [setEdges])

  // Handle saving
  const handleSave = useCallback(async () => {
    if (!courseData?.course) return

    // Convert graph data back to course structure
    const courseModules = nodes.map((node, index) => ({
      moduleId: node.data.id,
      sortOrder: index + 1,
    }))

    const updatedCourse = {
      ...courseData.course,
      courseModules
    }

    await saveCourseMutation.mutateAsync(updatedCourse)
    onSave?.(updatedCourse)
  }, [nodes, courseData, saveCourseMutation, onSave])

  // Handle node drag
  const onNodeDrag: NodeDragHandler = useCallback((event, node) => {
    setHasChanges(true)
  }, [])

  // Auto-layout function
  const handleAutoLayout = useCallback(() => {
    const nodeCount = nodes.length
    const radius = Math.max(250, nodeCount * 30)
    
    const updatedNodes = nodes.map((node, index) => {
      const angle = (index * 2 * Math.PI) / nodeCount
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      return {
        ...node,
        position: { x, y }
      }
    })
    
    setNodes(updatedNodes)
    setHasChanges(true)
    setTimeout(() => fitView(), 100)
  }, [nodes, setNodes, fitView])

  // Reset view
  const handleReset = useCallback(() => {
    fitView()
  }, [fitView])

  if (courseLoading || modulesLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loading variant="neural" text="Loading course editor..." />
      </div>
    )
  }

  if (!courseData?.course) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No course data available. Please select a course to edit.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full bg-background border border-border rounded-lg overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Editor Controls */}
      <Panel position="top-left" className="bg-transparent">
        <Card className="cognitive-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Edit3 className="mr-2 h-4 w-4" />
              Course Structure Editor
              {hasChanges && (
                <Badge variant="secondary" className="ml-2 scale-75">
                  Unsaved
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Save/Load Actions */}
            <div className="flex space-x-2">
              <NeuralButton
                variant={hasChanges ? 'neural' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-6"
                onClick={handleSave}
                disabled={!hasChanges || saveCourseMutation.isPending}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </NeuralButton>
              <NeuralButton
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-6"
                onClick={handleAutoLayout}
              >
                <Layout className="h-3 w-3 mr-1" />
                Auto Layout
              </NeuralButton>
            </div>
            
            {/* Module Search & Add */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search modules to add..."
                  className="pl-7 h-8 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {searchQuery && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableModules
                    .filter(module => 
                      module.title.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 5)
                    .map(module => (
                      <div
                        key={module.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs cursor-pointer hover:bg-muted"
                        onClick={() => handleAddModule(module)}
                      >
                        <span className="truncate">{module.title}</span>
                        <Plus className="h-3 w-3 text-neural-primary" />
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            
            {/* View Actions */}
            <div className="flex space-x-1">
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

      {/* Course Info Panel */}
      <Panel position="top-right" className="bg-transparent">
        <Card className="cognitive-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              {courseData.course.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <div className="font-semibold text-neural-primary">
                  {nodes.length}
                </div>
                <div className="text-muted-foreground">Modules</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-neural-primary">
                  {edges.length}
                </div>
                <div className="text-muted-foreground">Connections</div>
              </div>
            </div>
            
            {hasChanges && (
              <Alert className="mt-3 p-2">
                <Info className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  You have unsaved changes
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Panel>

      {/* Main Graph Editor */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDrag={onNodeDrag}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-background via-muted/30 to-neural-light/20"
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Control", "Meta"]}
      >
        <Background 
          color="#6366f1" 
          gap={20} 
          size={1} 
          className="opacity-20"
        />
        
        <Controls className="bg-background/90 border border-border rounded-lg" />
        
        <MiniMap
          className="bg-background/90 border border-border rounded-lg"
          nodeColor="#6366f1"
          nodeStrokeWidth={2}
          maskColor="rgba(0, 0, 0, 0.2)"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Instructions Panel */}
      <Panel position="bottom-left" className="bg-transparent">
        <Card className="cognitive-card">
          <CardContent className="pt-4">
            <div className="space-y-1 text-xs">
              <div className="font-semibold mb-2">Instructions</div>
              <div>• Double-click nodes to edit titles</div>
              <div>• Drag nodes to reposition</div>
              <div>• Connect nodes by dragging from edges</div>
              <div>• Use Backspace to delete selected items</div>
              <div>• Search and add modules from the control panel</div>
            </div>
          </CardContent>
        </Card>
      </Panel>
    </div>
  )
}

export function FacultyGraphEditor(props: FacultyGraphEditorProps) {
  return (
    <ReactFlowProvider>
      <div className={`w-full ${props.className || 'h-96'}`}>
        <FacultyGraphEditorFlow {...props} />
      </div>
    </ReactFlowProvider>
  )
}
