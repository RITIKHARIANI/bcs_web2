"use client";

import React from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Test nodes and edges with the exact same structure as our network visualization
const testNodes: Node[] = [
  {
    id: 'course-test1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Test Course' },
    style: { background: '#3B82F6', color: 'white', border: '2px solid #1E40AF' }
  },
  {
    id: 'module-test1', 
    type: 'default',
    position: { x: 400, y: 150 },
    data: { label: 'Test Module' },
    style: { background: '#8B5CF6', color: 'white', border: '2px solid #7C3AED' }
  },
];

const testEdges: Edge[] = [
  {
    id: 'course-test1-module-test1',
    source: 'course-test1',
    target: 'module-test1',
    type: 'smoothstep',
    animated: false,
    style: { 
      stroke: '#FF0000',      // Bright red for maximum visibility
      strokeWidth: 6,         // Very thick
      strokeOpacity: 1,
    },
    label: 'TEST EDGE',
    labelStyle: { 
      fontSize: 14, 
      fill: '#FF0000',
      fontWeight: 'bold'
    },
    labelBgStyle: { 
      fill: '#FFFF00', 
      fillOpacity: 1 
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#FF0000'
    }
  }
];

function EdgeTestContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(testNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(testEdges);

  React.useEffect(() => {
    console.log('=== EDGE TEST DEBUG ===');
    console.log('Test nodes:', nodes);
    console.log('Test edges:', edges);
    console.log('Edge details:', edges.map(e => ({
      id: e.id,
      source: e.source, 
      target: e.target,
      type: e.type,
      style: e.style,
      animated: e.animated
    })));
    console.log('=== END EDGE TEST DEBUG ===');
  }, [nodes, edges]);

  return (
    <div className="h-screen bg-background">
      <div className="p-4 bg-card border-b">
        <h1 className="text-2xl font-bold">ReactFlow Edge Rendering Test</h1>
        <p className="text-muted-foreground">
          Testing if ReactFlow can render edges with the same configuration as network visualization
        </p>
        <div className="mt-2 flex gap-4">
          <span>Nodes: {nodes.length}</span>
          <span>Edges: {edges.length}</span>
          <span className="text-red-600">Expected: Bright red edge from Course to Module</span>
        </div>
      </div>
      
      <div className="h-[calc(100vh-120px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{
            padding: 0.2,
            maxZoom: 1.2,
            minZoom: 0.4
          }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 3, stroke: '#FF0000' }
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function EdgeTestPage() {
  return (
    <ReactFlowProvider>
      <EdgeTestContent />
    </ReactFlowProvider>
  );
}
