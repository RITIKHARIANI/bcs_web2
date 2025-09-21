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
          background: 'linear-gradient(135deg, #13294B 0%, #0F1B33 100%)',
          color: 'white',
          border: '3px solid rgba(19, 41, 75, 0.4)',
          borderRadius: '12px',
          padding: '16px 12px',
          fontSize: '13px',
          fontWeight: '600',
          minWidth: '200px',
          maxWidth: '220px',
          textAlign: 'center' as const,
          boxShadow: '0 4px 12px rgba(19, 41, 75, 0.3)',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
        },
        // Add hover and selection effects via CSS  
        className: 'hover:shadow-lg hover:shadow-blue-900/30 transition-all duration-200'
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
            background: 'linear-gradient(135deg, #E84A27 0%, #C73E1D 100%)',
            color: 'white',
            border: '3px solid rgba(232, 74, 39, 0.4)',
            borderRadius: '10px',
            padding: '12px 10px',
            fontSize: '12px',
            fontWeight: '600',
            minWidth: '170px',
            maxWidth: '190px',
            textAlign: 'center' as const,
            boxShadow: '0 3px 10px rgba(232, 74, 39, 0.3)',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
          },
          className: 'hover:shadow-lg hover:shadow-orange-600/30 transition-all duration-200'
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
            background: 'linear-gradient(135deg, #19B6CE 0%, #1593A3 100%)',
            color: 'white',
            border: '3px solid rgba(25, 182, 206, 0.4)',
            borderRadius: '10px',
            padding: '12px 10px',
            fontSize: '12px',
            fontWeight: '600',
            minWidth: '160px',
            maxWidth: '180px',
            textAlign: 'center' as const,
            boxShadow: '0 3px 10px rgba(25, 182, 206, 0.3)',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
          },
          className: 'hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200'
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
                stroke: 'rgba(19, 41, 75, 0.8)', // UIUC Blue
                strokeWidth: 3,
                strokeOpacity: 0.9,
                strokeDasharray: '0' // Solid line
              },
              label: 'contains',
              labelStyle: { 
                fontSize: 11,
                fill: '#13294B',
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
                color: '#13294B'
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
              stroke: 'rgba(232, 74, 39, 0.7)',
              strokeWidth: 2.5,
              strokeDasharray: '8,4',
              strokeOpacity: 0.8
            },
            label: 'extends',
            labelStyle: { 
              fontSize: 10,
              fill: '#E84A27',
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
              color: '#E84A27'
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

  // Simple click handler for navigation (without problematic hover effects)
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
      {/* UIUC themed background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(19, 41, 75, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(232, 74, 39, 0.1) 0%, transparent 50%)'
        }}></div>
      </div>
      
      {/* Enhanced node interaction styles */}
      <style jsx>{`
        .react-flow .react-flow__node.selected {
          outline: 3px solid rgba(19, 41, 75, 0.6) !important;
          outline-offset: 2px;
        }
        
        .react-flow .react-flow__node.dragging {
          transform: scale(1.05) !important;
          z-index: 1000 !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
        }
        
        .react-flow .react-flow__node:active {
          cursor: grabbing !important;
        }
        
        .react-flow .react-flow__node {
          cursor: grab;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
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
        selectNodesOnDrag={true}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
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
            if (data.courseData) return '#13294B';
            if (data.isRoot) return '#E84A27';
            return '#19B6CE';
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
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-900 to-orange-600" style={{
                  background: 'linear-gradient(135deg, #13294B 0%, #E84A27 100%)'
                }}>
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Course Network</h3>
                  <p className="text-xs text-muted-foreground">Brain & Cognitive Sciences</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Explore the interconnected relationships between courses and modules. Click any node to open its content page, or drag nodes to reorganize the layout.
              </p>
              
              {/* Enhanced Statistics */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-3 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(19, 41, 75, 0.1) 0%, rgba(19, 41, 75, 0.05) 100%)',
                  border: '1px solid rgba(19, 41, 75, 0.2)'
                }}>
                  <div className="text-xl font-bold" style={{color: '#13294B'}}>{stats.courses}</div>
                  <div className="text-xs font-medium" style={{color: 'rgba(19, 41, 75, 0.7)'}}>Courses</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(232, 74, 39, 0.1) 0%, rgba(232, 74, 39, 0.05) 100%)',
                  border: '1px solid rgba(232, 74, 39, 0.2)'
                }}>
                  <div className="text-xl font-bold" style={{color: '#E84A27'}}>{stats.modules}</div>
                  <div className="text-xs font-medium" style={{color: 'rgba(232, 74, 39, 0.7)'}}>Modules</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(25, 182, 206, 0.1) 0%, rgba(25, 182, 206, 0.05) 100%)',
                  border: '1px solid rgba(25, 182, 206, 0.2)'
                }}>
                  <div className="text-xl font-bold" style={{color: '#19B6CE'}}>{stats.connections}</div>
                  <div className="text-xs font-medium" style={{color: 'rgba(25, 182, 206, 0.7)'}}>Links</div>
                </div>
              </div>

              {/* Enhanced Legend */}
              <div className="space-y-2.5">
                <div className="text-sm font-semibold text-foreground mb-3 border-b border-border/30 pb-2">Visual Guide</div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-lg shadow-sm" style={{
                    background: 'linear-gradient(135deg, #13294B 0%, #0F1B33 100%)'
                  }}></div>
                  <span className="font-medium">Courses</span>
                  <span className="text-xs text-muted-foreground ml-auto">Click • Drag • Explore</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-lg shadow-sm" style={{
                    background: 'linear-gradient(135deg, #E84A27 0%, #C73E1D 100%)'
                  }}></div>
                  <span className="font-medium">Root Modules</span>
                  <span className="text-xs text-muted-foreground ml-auto">Primary topics</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-lg shadow-sm" style={{
                    background: 'linear-gradient(135deg, #19B6CE 0%, #1593A3 100%)'
                  }}></div>
                  <span className="font-medium">Sub-modules</span>
                  <span className="text-xs text-muted-foreground ml-auto">Detailed content</span>
                </div>
                
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-6 h-0.5 rounded-full" style={{backgroundColor: '#13294B'}}></div>
                      <div className="w-0 h-0 ml-0.5" style={{
                        borderLeft: '4px solid #13294B',
                        borderTop: '3px solid transparent',
                        borderBottom: '3px solid transparent'
                      }}></div>
                    </div>
                    <span className="font-medium">Contains</span>
                    <span className="text-xs text-muted-foreground ml-auto">Course → Module</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-6 h-0.5 rounded-full" style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, #E84A27 0px, #E84A27 3px, transparent 3px, transparent 6px)',
                      }}></div>
                      <div className="w-0 h-0 ml-0.5" style={{
                        borderLeft: '4px solid #E84A27',
                        borderTop: '3px solid transparent',
                        borderBottom: '3px solid transparent'
                      }}></div>
                    </div>
                    <span className="font-medium">Extends</span>
                    <span className="text-xs text-muted-foreground ml-auto">Parent → Child</span>
                  </div>
                </div>
                
                {/* Interactive Tips */}
                <div className="mt-4 pt-3 border-t border-border/30">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-900 to-orange-600 opacity-60"></div>
                      <span>Drag nodes to reorganize • Click to navigate</span>
                    </div>
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

