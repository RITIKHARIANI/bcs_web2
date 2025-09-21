"use client";

import React, { useEffect, useState } from 'react';
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

// This will use the EXACT same data that the network visualization receives
// but in a simpler configuration to isolate the issue

interface NetworkData {
  courses: any[];
  modules: any[];
}

function NetworkCompareContent() {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Fetch the same data that network visualization uses
    fetch('/api/debug/network-data')
      .then(res => res.json())
      .then(data => {
        console.log('=== NETWORK COMPARE DEBUG ===');
        console.log('Received data:', data);
        
        if (data.apiResponse) {
          setNetworkData(data.apiResponse);
          
          // Create nodes using THE SAME logic as network visualization
          const courseNodes = data.apiResponse.courses.map((course, index) => ({
            id: `course-${course.id}`,
            type: 'default', // Use default instead of custom types
            position: { x: 100, y: 100 },
            data: { label: course.title },
            style: { background: '#3B82F6', color: 'white' }
          }));

          const moduleNodes = data.apiResponse.modules.map((module, index) => ({
            id: `module-${module.id}`,
            type: 'default', // Use default instead of custom types  
            position: { x: 400, y: 150 },
            data: { label: module.title },
            style: { background: '#8B5CF6', color: 'white' }
          }));

          // Create edges using THE SAME logic as network visualization
          const courseModuleEdges = [];
          data.apiResponse.courses.forEach(course => {
            (course.courseModules || []).forEach(cm => {
              if (cm.module?.id) {
                console.log(`Creating edge: course-${course.id} -> module-${cm.module.id}`);
                courseModuleEdges.push({
                  id: `course-${course.id}-module-${cm.module.id}`,
                  source: `course-${course.id}`,
                  target: `module-${cm.module.id}`,
                  type: 'straight',
                  style: { 
                    stroke: '#FF0000',
                    strokeWidth: 6,
                    strokeOpacity: 1
                  },
                  label: 'COMPARE TEST',
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#FF0000'
                  }
                });
              }
            });
          });

          console.log('Created nodes:', courseNodes.concat(moduleNodes));
          console.log('Created edges:', courseModuleEdges);
          
          // Verify source/target exist
          courseModuleEdges.forEach(edge => {
            const allNodes = courseNodes.concat(moduleNodes);
            const sourceExists = allNodes.find(n => n.id === edge.source);
            const targetExists = allNodes.find(n => n.id === edge.target);
            console.log(`Edge ${edge.id}: source ${sourceExists ? 'EXISTS' : 'MISSING'}, target ${targetExists ? 'EXISTS' : 'MISSING'}`);
          });

          setNodes(courseNodes.concat(moduleNodes));
          setEdges(courseModuleEdges);
        }
      })
      .catch(err => {
        console.error('Failed to load network data:', err);
      });
  }, []);

  return (
    <div className="h-screen bg-background">
      <div className="p-4 bg-card border-b">
        <h1 className="text-2xl font-bold">Network Data Comparison Test</h1>
        <p className="text-muted-foreground">
          Using EXACT same data as network visualization but simplified ReactFlow config
        </p>
        <div className="mt-2 flex gap-4">
          <span>Nodes: {nodes.length}</span>
          <span>Edges: {edges.length}</span>
          <span className="text-red-600">
            {edges.length > 0 ? "Should see RED edge if ReactFlow config is the issue" : "No edges to render"}
          </span>
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

export default function NetworkComparePage() {
  return (
    <ReactFlowProvider>
      <NetworkCompareContent />
    </ReactFlowProvider>
  );
}
