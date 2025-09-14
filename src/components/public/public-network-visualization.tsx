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
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { withDatabaseRetry } from '@/lib/retry';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Network, Layers, Info, RefreshCw, AlertCircle } from 'lucide-react';
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

// Custom node types
const CourseNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-neural-primary bg-gradient-to-br from-neural-primary/10 to-neural-primary/5 min-w-[180px]">
    <div className="flex items-center gap-2 mb-2">
      <BookOpen className="h-4 w-4 text-neural-primary" />
      <div className="font-medium text-sm text-neural-primary">Course</div>
    </div>
    <div className="font-bold text-foreground text-sm leading-tight">{data.label}</div>
    <div className="flex items-center gap-2 mt-2">
      <Badge variant="outline" className="text-xs px-2 py-0">
        {data.status}
      </Badge>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Layers className="h-3 w-3" />
        {data.moduleCount}
      </div>
    </div>
  </div>
);

const ModuleNode = ({ data }: { data: any }) => (
  <div className={`px-3 py-2 shadow-md rounded border-2 min-w-[140px] ${
    data.isRoot 
      ? 'border-cognition-teal bg-gradient-to-br from-cognition-teal/10 to-cognition-teal/5' 
      : 'border-synapse-primary bg-gradient-to-br from-synapse-primary/10 to-synapse-primary/5'
  }`}>
    <div className="flex items-center gap-2 mb-1">
      <Network className={`h-3 w-3 ${data.isRoot ? 'text-cognition-teal' : 'text-synapse-primary'}`} />
      <div className={`text-xs font-medium ${data.isRoot ? 'text-cognition-teal' : 'text-synapse-primary'}`}>
        {data.isRoot ? 'Root Module' : 'Module'}
      </div>
    </div>
    <div className="font-semibold text-foreground text-xs leading-tight">{data.label}</div>
    <Badge variant="secondary" className="text-xs px-2 py-0 mt-1">
      {data.status}
    </Badge>
  </div>
);

const nodeTypes: NodeTypes = {
  course: CourseNode,
  module: ModuleNode,
};

async function fetchVisualizationData(): Promise<VisualizationData> {
  const response = await fetch('/api/visualization/course-structure')
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Visualization API error:', response.status, errorText)
    throw new Error(`Failed to fetch visualization data (${response.status})`)
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
      
      const data = await withDatabaseRetry(() => fetchVisualizationData());
      
      if (!data.courses || !data.modules) {
        throw new Error('Invalid data structure received');
      }

      // Generate nodes and edges
      const courseNodes: Node[] = (data.courses || []).map((course, index) => ({
        id: `course-${course.id}`,
        type: 'course',
        position: { 
          x: 100 + (index % 3) * 300, 
          y: 100 + Math.floor(index / 3) * 200 
        },
        data: {
          label: course.title,
          status: course.status,
          moduleCount: course.courseModules?.length || 0,
          type: 'course',
        },
      }));

      const moduleNodes: Node[] = (data.modules || []).map((module, index) => ({
        id: `module-${module.id}`,
        type: 'module',
        position: { 
          x: 500 + (index % 4) * 200, 
          y: 300 + Math.floor(index / 4) * 150 
        },
        data: {
          label: module.title,
          status: module.status,
          isRoot: !module.parentModuleId,
          type: 'module',
        },
      }));

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
              type: 'smoothstep',
              style: { stroke: 'hsl(var(--neural-primary))', strokeWidth: 2 },
              label: 'contains',
              labelStyle: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' },
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
            style: { stroke: 'hsl(var(--synapse-primary))', strokeWidth: 2, strokeDasharray: '5,5' },
            label: 'parent-child',
            labelStyle: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' },
          });
        }
      });

      const allNodes = [...courseNodes, ...moduleNodes];
      const allEdges = [...courseModuleEdges, ...moduleParentEdges];

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
          <h2 className="text-xl font-semibold mb-2">Loading Network Visualization</h2>
          <p className="text-muted-foreground">Fetching course and module relationships...</p>
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
              <h2 className="text-xl font-semibold mb-2">Failed to Load Visualization</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
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
    <div className="h-screen bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'course') return 'hsl(var(--neural-primary))';
            return 'hsl(var(--synapse-primary))';
          }}
          className="!bg-background !border-border"
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
                Explore how courses and modules are interconnected in our Brain & Cognitive Sciences curriculum.
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
                  <div className="w-8 h-0.5 bg-neural-primary"></div>
                  <span>Course-Module</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-8 h-0.5 bg-synapse-primary" style={{ backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 2px, hsl(var(--synapse-primary)) 2px, hsl(var(--synapse-primary)) 4px)' }}></div>
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
