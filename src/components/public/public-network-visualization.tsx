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

      // Generate nodes with DEFAULT types and INLINE styling (like working comparison)
      const courseNodes: Node[] = (data.courses || []).map((course, index) => ({
        id: `course-${course.id}`,
        type: 'default', // ✅ Use DEFAULT type like working comparison
        position: { 
          x: 100, // Fixed left column for courses
          y: 50 + (index * 200) // Vertical spacing for courses
        },
        data: {
          label: `📚 ${course.title} (${course.courseModules?.length || 0} modules)`,
        },
        style: {
          // ✅ INLINE styling like working comparison
          background: '#3B82F6', // Blue for courses
          color: 'white',
          border: '2px solid #1E40AF',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: 'bold',
          minWidth: '160px',
          textAlign: 'center' as const
        }
      }));

      // Separate root modules from child modules for better positioning
      const rootModules = (data.modules || []).filter(m => !m.parentModuleId);
      const childModules = (data.modules || []).filter(m => m.parentModuleId);

      const moduleNodes: Node[] = [
        // Root modules in middle column
        ...rootModules.map((module, index) => ({
          id: `module-${module.id}`,
          type: 'default', // ✅ Use DEFAULT type like working comparison
          position: { 
            x: 400, // Middle column for root modules
            y: 50 + (index * 180)
          },
          data: {
            label: `🔗 ${module.title} (Root)`,
          },
          style: {
            // ✅ INLINE styling like working comparison
            background: '#10B981', // Green for root modules
            color: 'white',
            border: '2px solid #047857',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            minWidth: '140px',
            textAlign: 'center' as const
          }
        })),
        // Child modules in right column
        ...childModules.map((module, index) => ({
          id: `module-${module.id}`,
          type: 'default', // ✅ Use DEFAULT type like working comparison
          position: { 
            x: 700, // Right column for child modules
            y: 50 + (index * 160)
          },
          data: {
            label: `⚡ ${module.title} (Sub)`,
          },
          style: {
            // ✅ INLINE styling like working comparison
            background: '#8B5CF6', // Purple for sub modules
            color: 'white',
            border: '2px solid #6D28D9',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            minWidth: '140px',
            textAlign: 'center' as const
          }
        }))
      ];

      const courseModuleEdges: Edge[] = [];
      const moduleParentEdges: Edge[] = [];

      // Create edges between courses and modules
      (data.courses || []).forEach((course) => {
        (course.courseModules || []).forEach((cm) => {
          if (cm.module?.id) {
            courseModuleEdges.push({
              id: `course-${course.id}-module-${cm.module.id}`,
              source: `course-${course.id}`,
              target: `module-${cm.module.id}`,
              type: 'straight',  // Changed from smoothstep - test edge uses default/straight
              animated: false,
              style: { 
                stroke: '#FF0000',        // BRIGHT RED - same as working test
                strokeWidth: 6,           // THICK - same as working test
                strokeOpacity: 1,
                zIndex: 1000             // Force to front
              },
              label: 'TEST EDGE',         // Clear label
              labelStyle: { 
                fontSize: 14,             // Larger font
                fill: '#FF0000',         // Red text
                fontWeight: 'bold'
              },
              labelBgStyle: { 
                fill: '#FFFF00',         // Yellow background for visibility
                fillOpacity: 1
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,               // Larger arrow
                height: 20,
                color: '#FF0000'         // Red arrow
              }
            });
          }
        });
      });

      // Create edges between parent and child modules
      (data.modules || []).forEach((module) => {
        if (module.parentModuleId) {
          moduleParentEdges.push({
            id: `module-${module.parentModuleId}-module-${module.id}`,
            source: `module-${module.parentModuleId}`,
            target: `module-${module.id}`,
            type: 'smoothstep',
            style: { 
              stroke: '#8B5CF6', 
              strokeWidth: 2, 
              strokeDasharray: '5,5' 
            },
            label: 'parent-child',
            labelStyle: { 
              fontSize: 11, 
              fill: '#6B7280',
              fontWeight: 'bold' 
            },
            labelBgStyle: { 
              fill: '#ffffff', 
              fillOpacity: 0.8 
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 12,
              height: 12,
              color: '#8B5CF6'
            }
          });
        }
      });

      const allNodes = [...courseNodes, ...moduleNodes];
      const allEdges = [...courseModuleEdges, ...moduleParentEdges];

      console.log(`Generated ${courseNodes.length} course nodes, ${moduleNodes.length} module nodes`);
      console.log(`Generated ${courseModuleEdges.length} course-module edges, ${moduleParentEdges.length} parent-child edges`);
      console.log('Course-module edges:', courseModuleEdges.map(e => `${e.source} -> ${e.target}`));
      console.log('Parent-child edges:', moduleParentEdges.map(e => `${e.source} -> ${e.target}`));
      
      // DETAILED DEBUG: Log the exact data received
      console.log('=== DETAILED NETWORK VISUALIZATION DEBUG ===');
      console.log('Raw data courses:', data.courses?.length || 0);
      console.log('Raw data modules:', data.modules?.length || 0);
      
      if (data.courses && data.courses.length > 0) {
        console.log('First course details:', {
          id: data.courses[0].id,
          title: data.courses[0].title,
          status: data.courses[0].status,
          courseModules: data.courses[0].courseModules?.length || 0,
          courseModulesDetails: data.courses[0].courseModules?.map(cm => ({
            moduleId: cm.module?.id,
            moduleTitle: cm.module?.title,
            moduleStatus: cm.module?.status,
          }))
        });
      }
      
      console.log('Generated nodes:', allNodes.map(n => ({ id: n.id, type: n.type, position: n.position })));
      console.log('Generated edges:', allEdges.map(e => ({ id: e.id, source: e.source, target: e.target, type: e.type, style: e.style })));
      
      // CRITICAL: Check if source/target nodes actually exist
      allEdges.forEach(edge => {
        const sourceNode = allNodes.find(n => n.id === edge.source);
        const targetNode = allNodes.find(n => n.id === edge.target);
        console.log(`Edge ${edge.id}:`);
        console.log(`  Source ${edge.source}: ${sourceNode ? 'FOUND' : 'MISSING!'}`);
        console.log(`  Target ${edge.target}: ${targetNode ? 'FOUND' : 'MISSING!'}`);
        if (sourceNode) console.log(`  Source position:`, sourceNode.position);
        if (targetNode) console.log(`  Target position:`, targetNode.position);
      });
      
      console.log('=== END DETAILED DEBUG ===');

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
    <div className="h-screen bg-background relative">
      {/* Force edge visibility with CSS overrides */}
      <style>{`
        .react-flow__edge-path {
          stroke: #FF0000 !important;
          stroke-width: 6px !important;
          stroke-opacity: 1 !important;
          z-index: 1000 !important;
        }
        .react-flow__edge {
          pointer-events: all !important;
          z-index: 1000 !important;
        }
        .react-flow__edge-label {
          fill: #FF0000 !important;
          font-weight: bold !important;
          font-size: 14px !important;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.15,
          maxZoom: 1.0,
          minZoom: 0.4,
          includeHiddenNodes: false
        }}
        defaultViewport={{
          x: 0,
          y: 0, 
          zoom: 0.8
        }}
        defaultEdgeOptions={{
          type: 'straight',
          style: { 
            strokeWidth: 6,
            stroke: '#FF0000',
            strokeOpacity: 1,
            zIndex: 1000
          }
        }}
        deleteKeyCode={null}
        multiSelectionKeyCode={null}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls 
          position="top-right" 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          className="bg-card border border-border shadow-lg"
        />
        <MiniMap 
          position="bottom-right"
          zoomable
          pannable
          nodeColor={(node) => {
            if (node.type === 'course') return '#3B82F6';
            return '#8B5CF6';
          }}
          className="!bg-card !border-border shadow-lg"
          style={{ 
            backgroundColor: 'hsl(var(--card))',
            width: 200, 
            height: 150 
          }}
        />
        
        {/* Info Panel */}
        <Panel position="top-left">
          <Card className="w-72 sm:w-80 max-w-[90vw]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <Network className="h-5 w-5 text-neural-primary" />
                <h3 className="font-semibold">Course Network Visualization</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Explore how published courses and modules are interconnected in our Brain & Cognitive Sciences curriculum. This view shows only publicly available content.
              </p>
              
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-neural-primary">{stats.courses}</div>
                  <div className="text-xs text-muted-foreground">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-synapse-primary">{stats.modules}</div>
                  <div className="text-xs text-muted-foreground">Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-cognition-teal">{stats.connections}</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">Legend:</div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-neural-primary/20 border-2 border-neural-primary"></div>
                  <span>Courses</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-cognition-teal/20 border-2 border-cognition-teal"></div>
                  <span>Root Modules</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-synapse-primary/20 border-2 border-synapse-primary"></div>
                  <span>Sub-modules</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-8 h-0.5" style={{ backgroundColor: '#3B82F6' }}></div>
                  <span>Course-Module</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-8 h-0.5" style={{ 
                    backgroundColor: '#8B5CF6',
                    backgroundImage: 'repeating-linear-gradient(to right, #8B5CF6 0px, #8B5CF6 4px, transparent 4px, transparent 8px)',
                    backgroundSize: '8px 100%'
                  }}></div>
                  <span>Parent-Child</span>
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
