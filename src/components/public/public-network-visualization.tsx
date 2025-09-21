"use client";

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { withDatabaseRetry } from '@/lib/retry';
import { Card, CardContent } from '@/components/ui/card';
import { Network, RefreshCw, AlertCircle } from 'lucide-react';
import { NeuralButton } from '@/components/ui/neural-button';

interface CourseData {
  id: string;
  title: string;
  status: string;
  courseModules: Array<{
    id: string;
    sortOrder: number;
    module: {
      id: string;
      title: string;
      status: string;
      parentModuleId: string | null;
    };
  }>;
}

interface ModuleData {
  id: string;
  title: string;
  status: string;
  parentModuleId: string | null;
  sortOrder: number;
}

interface VisualizationData {
  courses: CourseData[];
  modules: ModuleData[];
}

// ✅ REMOVED: Custom node components that were preventing edge rendering
// Using default ReactFlow nodes with inline styling for guaranteed compatibility

async function fetchVisualizationData(): Promise<VisualizationData> {
  const response = await fetch('/api/public/network-visualization')
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Public network API error:', response.status, errorText)
    throw new Error(`Failed to fetch public network data (${response.status})`)
  }
  return response.json()
}

function PublicNetworkVisualizationContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ courses: 0, modules: 0, connections: 0 });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await withDatabaseRetry(() => fetchVisualizationData(), { maxAttempts: 5 });
      
      if (!data.courses || !data.modules) {
        throw new Error('Invalid data structure received');
      }

      // Generate elegant course nodes with interactive functionality
      const courseNodes: Node[] = (data.courses || []).map((course, index) => ({
        id: `course-${course.id}`,
        type: 'default',
        position: { 
          x: 50, // Left column for courses
          y: 80 + (index * 180) // Better vertical spacing
        },
        data: {
          label: course.title,
          courseData: course, // Store full data for interactions
        },
        style: {
          background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
          color: 'white',
          border: '3px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '16px 12px',
          fontSize: '13px',
          fontWeight: '600',
          minWidth: '200px',
          maxWidth: '220px',
          textAlign: 'center' as const,
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }
      }));

      // Separate root modules from child modules for better positioning
      const rootModules = (data.modules || []).filter(m => !m.parentModuleId);
      const childModules = (data.modules || []).filter(m => m.parentModuleId);

      const moduleNodes: Node[] = [
        // Root modules in middle column - elegant design
        ...rootModules.map((module, index) => ({
          id: `module-${module.id}`,
          type: 'default',
          position: { 
            x: 350, // Middle column for root modules
            y: 80 + (index * 160)
          },
          data: {
            label: module.title,
            moduleData: module, // Store full data for interactions
            isRoot: true
          },
          style: {
            background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
            color: 'white',
            border: '3px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '12px 10px',
            fontSize: '12px',
            fontWeight: '600',
            minWidth: '170px',
            maxWidth: '190px',
            textAlign: 'center' as const,
            boxShadow: '0 3px 10px rgba(16, 185, 129, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }
        })),
        // Child modules in right column - elegant design
        ...childModules.map((module, index) => ({
          id: `module-${module.id}`,
          type: 'default',
          position: { 
            x: 620, // Right column for child modules
            y: 80 + (index * 140)
          },
          data: {
            label: module.title,
            moduleData: module, // Store full data for interactions
            isRoot: false
          },
          style: {
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            color: 'white',
            border: '3px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '10px',
            padding: '12px 10px',
            fontSize: '12px',
            fontWeight: '600',
            minWidth: '160px',
            maxWidth: '180px',
            textAlign: 'center' as const,
            boxShadow: '0 3px 10px rgba(139, 92, 246, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }
        }))
      ];

      const courseModuleEdges: Edge[] = [];
      const moduleParentEdges: Edge[] = [];

      // Create elegant edges between courses and modules
      (data.courses || []).forEach((course) => {
        (course.courseModules || []).forEach((cm) => {
          if (cm.module?.id) {
            courseModuleEdges.push({
              id: `course-${course.id}-module-${cm.module.id}`,
              source: `course-${course.id}`,
              target: `module-${cm.module.id}`,
              type: 'smoothstep',
              animated: true,
              style: { 
                stroke: 'rgba(99, 102, 241, 0.8)', // Elegant indigo
                strokeWidth: 3,
                strokeOpacity: 0.9,
                strokeDasharray: '0' // Solid line
              },
              label: 'contains',
              labelStyle: { 
                fontSize: 11,
                fill: '#6366f1',
                fontWeight: '500',
                fontFamily: 'system-ui, sans-serif'
              },
              labelBgStyle: { 
                fill: 'rgba(255, 255, 255, 0.9)',
                fillOpacity: 0.95
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 12,
                height: 12,
                color: '#6366f1'
              }
            });
          }
        });
      });

      // Create elegant parent-child module edges
      (data.modules || []).forEach((module) => {
        if (module.parentModuleId) {
          moduleParentEdges.push({
            id: `module-${module.parentModuleId}-module-${module.id}`,
            source: `module-${module.parentModuleId}`,
            target: `module-${module.id}`,
            type: 'smoothstep',
            animated: false,
            style: { 
              stroke: 'rgba(139, 92, 246, 0.7)',
              strokeWidth: 2.5,
              strokeDasharray: '8,4',
              strokeOpacity: 0.8
            },
            label: 'extends',
            labelStyle: { 
              fontSize: 10,
              fill: '#8B5CF6',
              fontWeight: '500',
              fontFamily: 'system-ui, sans-serif'
            },
            labelBgStyle: { 
              fill: 'rgba(255, 255, 255, 0.95)',
              fillOpacity: 0.95
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 10,
              height: 10,
              color: '#8B5CF6'
            }
          });
        }
      });

      const allNodes = [...courseNodes, ...moduleNodes];
      const allEdges = [...courseModuleEdges, ...moduleParentEdges];

      console.log(`✨ Network generated: ${courseNodes.length} courses, ${moduleNodes.length} modules, ${allEdges.length} connections`);

      setNodes(allNodes);
      setEdges(allEdges);
      setStats({
        courses: courseNodes.length,
        modules: moduleNodes.length,
        connections: allEdges.length,
      });

    } catch (error) {
      console.error('Error fetching visualization data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load visualization data');
      setNodes([]);
      setEdges([]);
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node clicks for navigation
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const data = node.data;
    
    if (data.courseData) {
      // Navigate to course page
      window.open(`/courses/${data.courseData.slug}`, '_blank');
    } else if (data.moduleData) {
      // Navigate to module page
      window.open(`/modules/${data.moduleData.slug}`, '_blank');
    }
  }, []);

  // Handle node hover effects
  const onNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
    // Add hover effect by updating node style
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === node.id
          ? {
              ...n,
              style: {
                ...n.style,
                transform: 'scale(1.05)',
                zIndex: 1000,
              },
            }
          : n
      )
    );
  }, [setNodes]);

  const onNodeMouseLeave = useCallback((event: React.MouseEvent, node: Node) => {
    // Remove hover effect
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === node.id
          ? {
              ...n,
              style: {
                ...n.style,
                transform: 'scale(1)',
                zIndex: 1,
              },
            }
          : n
      )
    );
  }, [setNodes]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-neural-primary" />
          <h2 className="text-xl font-semibold mb-2">Loading Public Network Visualization</h2>
          <p className="text-muted-foreground">Fetching published course and module relationships...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-semibold mb-2">Failed to Load Public Network</h2>
              <p className="text-muted-foreground mb-4">Unable to load the public course network visualization. {error}</p>
              <NeuralButton onClick={fetchData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </NeuralButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* Elegant background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
        }}></div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.1,
          maxZoom: 1.2,
          minZoom: 0.3,
          includeHiddenNodes: false
        }}
        defaultViewport={{
          x: 0,
          y: 0, 
          zoom: 0.7
        }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { 
            strokeWidth: 2,
            strokeOpacity: 0.8
          }
        }}
        deleteKeyCode={null}
        multiSelectionKeyCode={null}
        selectNodesOnDrag={false}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          gap={20} 
          size={1} 
          color="rgba(148, 163, 184, 0.3)"
        />
        <Controls 
          position="top-right" 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          className="bg-card/95 backdrop-blur border border-border/50 shadow-xl rounded-lg"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        />
        <MiniMap 
          position="bottom-right"
          zoomable
          pannable
          nodeColor={(node) => {
            const data = node.data;
            if (data.courseData) return '#3B82F6';
            if (data.isRoot) return '#10B981';
            return '#8B5CF6';
          }}
          className="!bg-card/95 !backdrop-blur !border-border/50 shadow-xl rounded-lg overflow-hidden"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            width: 220, 
            height: 160 
          }}
        />
        
        {/* Elegant Info Panel */}
        <Panel position="top-left">
          <Card className="w-80 sm:w-96 max-w-[90vw] bg-card/95 backdrop-blur border-border/50 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Course Network</h3>
                  <p className="text-xs text-muted-foreground">Brain & Cognitive Sciences</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Explore the interconnected relationships between courses and modules. Click any node to open its content page.
              </p>
              
              {/* Enhanced Statistics */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-3 rounded-lg bg-gradient-to-b from-blue-50 to-blue-100/50 border border-blue-200/50">
                  <div className="text-xl font-bold text-blue-600">{stats.courses}</div>
                  <div className="text-xs text-blue-600/70 font-medium">Courses</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-b from-green-50 to-green-100/50 border border-green-200/50">
                  <div className="text-xl font-bold text-green-600">{stats.modules}</div>
                  <div className="text-xs text-green-600/70 font-medium">Modules</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-b from-purple-50 to-purple-100/50 border border-purple-200/50">
                  <div className="text-xl font-bold text-purple-600">{stats.connections}</div>
                  <div className="text-xs text-purple-600/70 font-medium">Links</div>
                </div>
              </div>

              {/* Enhanced Legend */}
              <div className="space-y-2.5">
                <div className="text-sm font-semibold text-foreground mb-3 border-b border-border/30 pb-2">Visual Guide</div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm"></div>
                  <span className="font-medium">Courses</span>
                  <span className="text-xs text-muted-foreground ml-auto">Click to explore</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-sm"></div>
                  <span className="font-medium">Root Modules</span>
                  <span className="text-xs text-muted-foreground ml-auto">Primary topics</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm"></div>
                  <span className="font-medium">Sub-modules</span>
                  <span className="text-xs text-muted-foreground ml-auto">Detailed content</span>
                </div>
                
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-6 h-0.5 bg-indigo-500 rounded-full"></div>
                      <div className="w-0 h-0 border-l-[4px] border-l-indigo-500 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5"></div>
                    </div>
                    <span className="font-medium">Contains</span>
                    <span className="text-xs text-muted-foreground ml-auto">Course → Module</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-6 h-0.5 bg-purple-500 rounded-full" style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, #8B5CF6 0px, #8B5CF6 3px, transparent 3px, transparent 6px)',
                      }}></div>
                      <div className="w-0 h-0 border-l-[4px] border-l-purple-500 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5"></div>
                    </div>
                    <span className="font-medium">Extends</span>
                    <span className="text-xs text-muted-foreground ml-auto">Parent → Child</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function PublicNetworkVisualization() {
  return (
    <ReactFlowProvider>
      <PublicNetworkVisualizationContent />
    </ReactFlowProvider>
  );
}

