/**
 * Playground Templates
 *
 * Pre-built templates for faculty to use as starting points.
 * Includes basic React, THREE.js, and the Braitenberg vehicles simulation.
 */

import type { PlaygroundTemplate, PlaygroundCategory } from '@/types/react-playground';

// Basic React Counter
export const BASIC_COUNTER_TEMPLATE: PlaygroundTemplate = {
  id: 'basic-counter',
  name: 'Interactive Counter',
  description: 'A simple React counter demonstrating useState and event handling',
  category: 'tutorials',
  tags: ['beginner', 'hooks', 'state'],
  dependencies: [],
  isPublic: true,
  sourceCode: `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>{count}</h1>
      <p style={{ marginBottom: '2rem', opacity: 0.8 }}>Click the buttons to change the count</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setCount(c => c - 1)}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.5rem',
            border: 'none',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          -
        </button>
        <button
          onClick={() => setCount(0)}
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.5rem',
            border: 'none',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
`,
};

// THREE.js Spinning Cube with React Three Fiber
export const THREEJS_CUBE_TEMPLATE: PlaygroundTemplate = {
  id: 'threejs-cube',
  name: '3D Spinning Cube',
  description: 'Interactive 3D cube using React Three Fiber with orbit controls',
  category: '3d-graphics',
  tags: ['3d', 'three.js', 'interactive'],
  dependencies: ['three', '@react-three/fiber', '@react-three/drei'],
  isPublic: true,
  sourceCode: `import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshWobbleMaterial } from '@react-three/drei';

function SpinningBox({ position, color }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={clicked ? 1.5 : 1}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <MeshWobbleMaterial
        color={hovered ? 'hotpink' : color}
        speed={2}
        factor={0.5}
      />
    </mesh>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }}>
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <SpinningBox position={[0, 0, 0]} color="#6366f1" />
        <OrbitControls enablePan enableZoom enableRotate />
        <gridHelper args={[10, 10, '#333', '#222']} />
      </Canvas>
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        color: '#888',
        fontFamily: 'system-ui',
        fontSize: '14px',
      }}>
        Click cube to scale • Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
`,
};

// Neural Network Visualization
export const NEURAL_NETWORK_TEMPLATE: PlaygroundTemplate = {
  id: 'neural-network-viz',
  name: 'Neural Network Visualization',
  description: 'Interactive visualization of a simple neural network with animated signals',
  category: 'neural-networks',
  tags: ['neural', 'visualization', 'educational'],
  dependencies: [],
  isPublic: true,
  sourceCode: `import { useState, useEffect, useRef } from 'react';

const LAYERS = [3, 4, 4, 2]; // Input, hidden, hidden, output

function Neuron({ x, y, isActive, onClick }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={20}
      fill={isActive ? '#6366f1' : '#1a1a2e'}
      stroke={isActive ? '#818cf8' : '#333'}
      strokeWidth={2}
      style={{ cursor: 'pointer', transition: 'all 0.3s' }}
      onClick={onClick}
    />
  );
}

function Connection({ x1, y1, x2, y2, isActive }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={isActive ? '#6366f1' : '#222'}
      strokeWidth={isActive ? 2 : 1}
      style={{ transition: 'all 0.3s' }}
    />
  );
}

export default function App() {
  const [activeNeurons, setActiveNeurons] = useState(new Set());
  const [signals, setSignals] = useState([]);
  const containerRef = useRef(null);

  const width = 600;
  const height = 400;
  const padding = 60;

  // Calculate neuron positions
  const getNeuronPos = (layerIndex, neuronIndex) => {
    const layerX = padding + (layerIndex / (LAYERS.length - 1)) * (width - 2 * padding);
    const layerHeight = LAYERS[layerIndex] * 60;
    const startY = (height - layerHeight) / 2 + 30;
    const neuronY = startY + neuronIndex * 60;
    return { x: layerX, y: neuronY };
  };

  // Propagate signal through network
  const propagateSignal = (layerIndex, neuronIndex) => {
    const key = \`\${layerIndex}-\${neuronIndex}\`;
    setActiveNeurons(prev => new Set([...prev, key]));

    if (layerIndex < LAYERS.length - 1) {
      setTimeout(() => {
        for (let i = 0; i < LAYERS[layerIndex + 1]; i++) {
          if (Math.random() > 0.3) {
            propagateSignal(layerIndex + 1, i);
          }
        }
      }, 200);
    }

    setTimeout(() => {
      setActiveNeurons(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 500);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui',
    }}>
      <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Neural Network</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Click input neurons (left) to send signals through the network
      </p>
      <svg width={width} height={height} ref={containerRef}>
        {/* Connections */}
        {LAYERS.map((layerSize, layerIndex) => {
          if (layerIndex === LAYERS.length - 1) return null;
          const connections = [];
          for (let i = 0; i < layerSize; i++) {
            for (let j = 0; j < LAYERS[layerIndex + 1]; j++) {
              const pos1 = getNeuronPos(layerIndex, i);
              const pos2 = getNeuronPos(layerIndex + 1, j);
              const isActive = activeNeurons.has(\`\${layerIndex}-\${i}\`) &&
                               activeNeurons.has(\`\${layerIndex + 1}-\${j}\`);
              connections.push(
                <Connection
                  key={\`\${layerIndex}-\${i}-\${j}\`}
                  x1={pos1.x}
                  y1={pos1.y}
                  x2={pos2.x}
                  y2={pos2.y}
                  isActive={isActive}
                />
              );
            }
          }
          return connections;
        })}

        {/* Neurons */}
        {LAYERS.map((layerSize, layerIndex) =>
          Array.from({ length: layerSize }).map((_, neuronIndex) => {
            const pos = getNeuronPos(layerIndex, neuronIndex);
            const isActive = activeNeurons.has(\`\${layerIndex}-\${neuronIndex}\`);
            return (
              <Neuron
                key={\`\${layerIndex}-\${neuronIndex}\`}
                x={pos.x}
                y={pos.y}
                isActive={isActive}
                onClick={() => layerIndex === 0 && propagateSignal(0, neuronIndex)}
              />
            );
          })
        )}

        {/* Labels */}
        <text x={padding} y={height - 10} fill="#666" fontSize="12">Input</text>
        <text x={width - padding - 30} y={height - 10} fill="#666" fontSize="12">Output</text>
      </svg>
    </div>
  );
}
`,
};

// Data Visualization Template
export const DATA_VIZ_TEMPLATE: PlaygroundTemplate = {
  id: 'data-viz',
  name: 'Interactive Data Chart',
  description: 'Real-time animated bar chart with dynamic data updates',
  category: 'visualizations',
  tags: ['charts', 'data', 'animation'],
  dependencies: [],
  isPublic: true,
  sourceCode: `import { useState, useEffect } from 'react';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function App() {
  const [data, setData] = useState([
    { label: 'A', value: 65 },
    { label: 'B', value: 45 },
    { label: 'C', value: 80 },
    { label: 'D', value: 35 },
    { label: 'E', value: 55 },
  ]);

  const [animating, setAnimating] = useState(false);

  const randomize = () => {
    setAnimating(true);
    setData(prev => prev.map(d => ({
      ...d,
      value: Math.floor(Math.random() * 100) + 10,
    })));
    setTimeout(() => setAnimating(false), 500);
  };

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui',
      color: 'white',
    }}>
      <h2 style={{ marginBottom: '2rem' }}>Interactive Bar Chart</h2>

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        height: '300px',
        gap: '20px',
        padding: '20px',
        background: '#111',
        borderRadius: '12px',
      }}>
        {data.map((d, i) => (
          <div
            key={d.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '14px', color: '#888' }}>{d.value}</span>
            <div
              style={{
                width: '60px',
                height: \`\${(d.value / maxValue) * 250}px\`,
                background: COLORS[i],
                borderRadius: '8px 8px 0 0',
                transition: 'height 0.5s ease-out',
              }}
            />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{d.label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={randomize}
        disabled={animating}
        style={{
          marginTop: '2rem',
          padding: '12px 24px',
          fontSize: '16px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: animating ? 'not-allowed' : 'pointer',
          opacity: animating ? 0.7 : 1,
        }}
      >
        Randomize Data
      </button>
    </div>
  );
}
`,
};

// All templates registry
export const PLAYGROUND_TEMPLATES: PlaygroundTemplate[] = [
  BASIC_COUNTER_TEMPLATE,
  THREEJS_CUBE_TEMPLATE,
  NEURAL_NETWORK_TEMPLATE,
  DATA_VIZ_TEMPLATE,
];

// Get template by ID
export const getTemplateById = (id: string): PlaygroundTemplate | undefined => {
  return PLAYGROUND_TEMPLATES.find(t => t.id === id);
};

// Get templates by category
export const getTemplatesByCategory = (category: PlaygroundCategory): PlaygroundTemplate[] => {
  return PLAYGROUND_TEMPLATES.filter(t => t.category === category);
};

// Search templates
export const searchTemplates = (query: string): PlaygroundTemplate[] => {
  const q = query.toLowerCase();
  return PLAYGROUND_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q))
  );
};
