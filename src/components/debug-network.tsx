"use client";

import React, { useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Simple test component to debug edge visibility
function DebugNetworkContent() {
  // Hard-coded test data
  const testNodes: Node[] = [
    {
      id: 'course-test',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Test Course' },
      style: { background: '#3B82F6', color: 'white', padding: '10px' }
    },
    {
      id: 'module-test',
      type: 'default', 
      position: { x: 400, y: 200 },
      data: { label: 'Test Module' },
      style: { background: '#8B5CF6', color: 'white', padding: '10px' }
    }
  ];
  
  const testEdges: Edge[] = [
    {
      id: 'test-edge',
      source: 'course-test',
      target: 'module-test',
      type: 'smoothstep',
      style: { 
        stroke: '#FF0000', // Red color for visibility
        strokeWidth: 5,    // Thick for visibility
        strokeDasharray: 'none'
      },
      label: 'TEST EDGE',
      labelStyle: { 
        fontSize: 16, 
        fill: '#FF0000',
        fontWeight: 'bold'
      },
      labelBgStyle: { 
        fill: '#FFFF00', 
        fillOpacity: 1.0 
      }
    }
  ];
  
  const [nodes, setNodes, onNodesChange] = useNodesState(testNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(testEdges);
  
  useEffect(() => {
    console.log('=== DEBUG NETWORK COMPONENT ===');
    console.log('Nodes:', nodes);
    console.log('Edges:', edges);
    console.log('Expected: Red thick edge from "Test Course" to "Test Module"');
  }, [nodes, edges]);
  
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <h2>Debug Network Visualization</h2>
      <p>Expected: Red thick edge connecting the two nodes</p>
      <div style={{ height: '500px', border: '2px solid #ccc' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Debug Info:</h3>
        <p>Nodes: {nodes.length}</p>
        <p>Edges: {edges.length}</p>
        <pre>{JSON.stringify(edges, null, 2)}</pre>
      </div>
    </div>
  );
}

export function DebugNetwork() {
  return (
    <ReactFlowProvider>
      <DebugNetworkContent />
    </ReactFlowProvider>
  );
}
