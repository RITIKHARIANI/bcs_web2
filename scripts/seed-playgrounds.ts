/**
 * Playground Template Seeding Script
 *
 * Runs during deployment to ensure featured playground templates exist in the database.
 * This script can be executed via: npm run seed:playgrounds
 *
 * Uses upsert to:
 * - Create new templates if they don't exist
 * - Update existing templates if definitions change
 */

import { PrismaClient } from '@prisma/client';

// Use DIRECT_URL for seeding (like migrations) to bypass PgBouncer
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

// Template definitions (duplicated from src/lib/react-playground/templates.ts to avoid import issues during build)
// Keep these in sync with the source file
const PLAYGROUND_TEMPLATES = [
  {
    id: 'basic-counter',
    name: 'Basic Counter',
    description: 'A simple counter demonstrating React useState hook',
    category: 'react_basics',
    tags: ['react', 'useState', 'beginner'],
    dependencies: ['react', 'react-dom'],
    sourceCode: `import React from 'react';

export default function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{
      fontFamily: 'system-ui',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1>Counter: {count}</h1>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={() => setCount(c => c - 1)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
        >
          -
        </button>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
        >
          +
        </button>
      </div>
      <button
        onClick={() => setCount(0)}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer'
        }}
      >
        Reset
      </button>
    </div>
  );
}`,
  },
  {
    id: 'threejs-cube',
    name: '3D Rotating Cube',
    description: 'Interactive 3D cube using Three.js and React Three Fiber',
    category: 'visualization',
    tags: ['three.js', '3d', 'animation', 'intermediate'],
    dependencies: ['react', 'react-dom', 'three', '@react-three/fiber'],
    sourceCode: `import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function Box() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
}

export default function App() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a2e' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box />
      </Canvas>
    </div>
  );
}`,
  },
  {
    id: 'neural-network-viz',
    name: 'Neural Network Visualization',
    description: 'Interactive visualization of a simple neural network architecture',
    category: 'neural_networks',
    tags: ['neural network', 'visualization', 'svg', 'intermediate'],
    dependencies: ['react', 'react-dom'],
    sourceCode: `import React from 'react';

export default function NeuralNetworkViz() {
  const [activeLayer, setActiveLayer] = React.useState(null);

  const layers = [
    { name: 'Input', neurons: 4, color: '#60a5fa' },
    { name: 'Hidden 1', neurons: 6, color: '#a78bfa' },
    { name: 'Hidden 2', neurons: 6, color: '#f472b6' },
    { name: 'Output', neurons: 2, color: '#34d399' }
  ];

  const layerSpacing = 150;
  const neuronSpacing = 50;

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ color: 'white', marginBottom: '1rem' }}>Neural Network</h1>
      <svg width="700" height="400" style={{ background: '#1e293b', borderRadius: '8px' }}>
        {/* Draw connections */}
        {layers.slice(0, -1).map((layer, i) => {
          const nextLayer = layers[i + 1];
          const x1 = 100 + i * layerSpacing;
          const x2 = 100 + (i + 1) * layerSpacing;

          return layer.neurons > 0 && Array.from({ length: layer.neurons }).map((_, j) => {
            const y1 = 200 - ((layer.neurons - 1) * neuronSpacing) / 2 + j * neuronSpacing;
            return Array.from({ length: nextLayer.neurons }).map((_, k) => {
              const y2 = 200 - ((nextLayer.neurons - 1) * neuronSpacing) / 2 + k * neuronSpacing;
              return (
                <line
                  key={\`\${i}-\${j}-\${k}\`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#475569"
                  strokeWidth="1"
                  opacity={activeLayer === null || activeLayer === i ? 0.6 : 0.1}
                />
              );
            });
          });
        })}

        {/* Draw neurons */}
        {layers.map((layer, i) => {
          const x = 100 + i * layerSpacing;
          return Array.from({ length: layer.neurons }).map((_, j) => {
            const y = 200 - ((layer.neurons - 1) * neuronSpacing) / 2 + j * neuronSpacing;
            return (
              <g key={\`\${i}-\${j}\`}>
                <circle
                  cx={x}
                  cy={y}
                  r="15"
                  fill={layer.color}
                  opacity={activeLayer === null || activeLayer === i ? 1 : 0.3}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setActiveLayer(i)}
                  onMouseLeave={() => setActiveLayer(null)}
                />
              </g>
            );
          });
        })}

        {/* Layer labels */}
        {layers.map((layer, i) => (
          <text
            key={layer.name}
            x={100 + i * layerSpacing}
            y={380}
            fill="white"
            textAnchor="middle"
            fontSize="12"
          >
            {layer.name}
          </text>
        ))}
      </svg>
      <p style={{ color: '#94a3b8', marginTop: '1rem' }}>
        Hover over neurons to highlight layer connections
      </p>
    </div>
  );
}`,
  },
  {
    id: 'data-viz',
    name: 'Data Visualization',
    description: 'Interactive bar chart with Recharts library',
    category: 'data_visualization',
    tags: ['recharts', 'charts', 'data', 'intermediate'],
    dependencies: ['react', 'react-dom', 'recharts'],
    sourceCode: `import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 700 },
];

export default function DataViz() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#1a1a2e',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
        Monthly Performance
      </h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}`,
  },
  {
    id: 'braitenberg-vehicles',
    name: 'Braitenberg Vehicles',
    description:
      'Simulation of Braitenberg vehicles demonstrating emergent behavior from simple sensor-motor connections',
    category: 'simulations',
    tags: ['simulation', 'ai', 'behavior', 'advanced'],
    dependencies: ['react', 'react-dom'],
    sourceCode: `import React from 'react';

export default function BraitenbergVehicles() {
  const canvasRef = React.useRef(null);
  const [vehicleType, setVehicleType] = React.useState('fear');

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    // Light source
    const light = { x: 300, y: 200, radius: 30 };

    // Vehicle
    let vehicle = {
      x: 100,
      y: 300,
      angle: 0,
      speed: 2,
      sensorDistance: 20,
      wheelBase: 15
    };

    function getSensorValues() {
      const leftSensor = {
        x: vehicle.x + Math.cos(vehicle.angle - 0.3) * vehicle.sensorDistance,
        y: vehicle.y + Math.sin(vehicle.angle - 0.3) * vehicle.sensorDistance
      };
      const rightSensor = {
        x: vehicle.x + Math.cos(vehicle.angle + 0.3) * vehicle.sensorDistance,
        y: vehicle.y + Math.sin(vehicle.angle + 0.3) * vehicle.sensorDistance
      };

      const leftDist = Math.hypot(leftSensor.x - light.x, leftSensor.y - light.y);
      const rightDist = Math.hypot(rightSensor.x - light.x, rightSensor.y - light.y);

      // Convert distance to intensity (closer = stronger)
      const maxDist = 400;
      const leftIntensity = Math.max(0, 1 - leftDist / maxDist);
      const rightIntensity = Math.max(0, 1 - rightDist / maxDist);

      return { leftIntensity, rightIntensity, leftSensor, rightSensor };
    }

    function update() {
      const { leftIntensity, rightIntensity } = getSensorValues();

      let leftWheel, rightWheel;

      if (vehicleType === 'fear') {
        // Type 2a: Crossed connections - runs away from light
        leftWheel = rightIntensity * 3;
        rightWheel = leftIntensity * 3;
      } else if (vehicleType === 'aggression') {
        // Type 2b: Direct connections - charges toward light
        leftWheel = leftIntensity * 3;
        rightWheel = rightIntensity * 3;
      } else {
        // Type 3: Explorer - more complex behavior
        leftWheel = 1 + rightIntensity * 2;
        rightWheel = 1 + leftIntensity * 2;
      }

      // Base speed
      leftWheel += 0.5;
      rightWheel += 0.5;

      // Update angle based on wheel difference
      const angleDelta = (rightWheel - leftWheel) * 0.05;
      vehicle.angle += angleDelta;

      // Update position
      const avgSpeed = (leftWheel + rightWheel) / 2;
      vehicle.x += Math.cos(vehicle.angle) * avgSpeed;
      vehicle.y += Math.sin(vehicle.angle) * avgSpeed;

      // Wrap around screen
      if (vehicle.x < 0) vehicle.x = canvas.width;
      if (vehicle.x > canvas.width) vehicle.x = 0;
      if (vehicle.y < 0) vehicle.y = canvas.height;
      if (vehicle.y > canvas.height) vehicle.y = 0;
    }

    function draw() {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw light
      const gradient = ctx.createRadialGradient(
        light.x, light.y, 0,
        light.x, light.y, 150
      );
      gradient.addColorStop(0, 'rgba(255, 220, 100, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 220, 100, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(light.x, light.y, 150, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw vehicle
      const { leftSensor, rightSensor, leftIntensity, rightIntensity } = getSensorValues();

      // Body
      ctx.save();
      ctx.translate(vehicle.x, vehicle.y);
      ctx.rotate(vehicle.angle);

      ctx.fillStyle = vehicleType === 'fear' ? '#ef4444' :
                      vehicleType === 'aggression' ? '#f97316' : '#22c55e';
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-10, -12);
      ctx.lineTo(-10, 12);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Sensors
      ctx.fillStyle = \`rgba(100, 200, 255, \${0.3 + leftIntensity * 0.7})\`;
      ctx.beginPath();
      ctx.arc(leftSensor.x, leftSensor.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = \`rgba(100, 200, 255, \${0.3 + rightIntensity * 0.7})\`;
      ctx.beginPath();
      ctx.arc(rightSensor.x, rightSensor.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    function animate() {
      update();
      draw();
      animationId = requestAnimationFrame(animate);
    }

    // Handle mouse movement for light
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      light.x = e.clientX - rect.left;
      light.y = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [vehicleType]);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1rem'
    }}>
      <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Braitenberg Vehicles</h1>
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            background: '#1e293b',
            color: 'white',
            border: '1px solid #475569',
            borderRadius: '4px'
          }}
        >
          <option value="fear">Type 2a: Fear (avoids light)</option>
          <option value="aggression">Type 2b: Aggression (seeks light)</option>
          <option value="explorer">Type 3: Explorer</option>
        </select>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border: '1px solid #334155',
          borderRadius: '8px',
          cursor: 'none'
        }}
      />
      <p style={{ color: '#94a3b8', marginTop: '1rem', textAlign: 'center' }}>
        Move your mouse to control the light source
      </p>
    </div>
  );
}`,
  },
  {
    id: 'lab-shell',
    name: 'Lab Shell Template',
    description: 'A starter template for creating interactive labs with control panel and canvas',
    category: 'templates',
    tags: ['template', 'lab', 'starter'],
    dependencies: ['react', 'react-dom'],
    sourceCode: `import React from 'react';

export default function LabShell() {
  const [params, setParams] = React.useState({
    speed: 50,
    size: 30,
    color: '#8b5cf6'
  });

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#0f172a',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      {/* Control Panel */}
      <div style={{
        width: '280px',
        padding: '1.5rem',
        background: '#1e293b',
        borderRight: '1px solid #334155',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Controls</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
            Speed: {params.speed}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={params.speed}
            onChange={(e) => setParams(p => ({ ...p, speed: Number(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
            Size: {params.size}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={params.size}
            onChange={(e) => setParams(p => ({ ...p, size: Number(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
            Color
          </label>
          <input
            type="color"
            value={params.color}
            onChange={(e) => setParams(p => ({ ...p, color: e.target.value }))}
            style={{ width: '100%', height: '40px', cursor: 'pointer' }}
          />
        </div>

        <button
          onClick={() => setParams({ speed: 50, size: 30, color: '#8b5cf6' })}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Reset
        </button>
      </div>

      {/* Main Canvas Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: params.size * 3,
          height: params.size * 3,
          background: params.color,
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          animation: \`pulse \${2 - params.speed / 100}s infinite ease-in-out\`
        }} />
      </div>

      <style>{\`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      \`}</style>
    </div>
  );
}`,
  },
  {
    id: 'fish-tank-lab',
    name: 'Fish Tank Lab',
    description:
      'Interactive aquarium simulation with bioluminescent creatures. Explore emergent behavior, flocking, and light attraction.',
    category: 'simulations',
    tags: ['simulation', 'biology', 'behavior', 'intermediate'],
    dependencies: ['react', 'react-dom'],
    sourceCode: `import React from 'react';

export default function FishTankLab() {
  const canvasRef = React.useRef(null);
  const [params, setParams] = React.useState({
    fishCount: 15,
    wormCount: 8,
    attractionStrength: 0.5,
    showTrails: false
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let mousePos = { x: canvas.width / 2, y: canvas.height / 2 };

    // Fish array
    let fish = Array.from({ length: params.fishCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 8 + Math.random() * 6,
      hue: 180 + Math.random() * 60,
      glowPhase: Math.random() * Math.PI * 2
    }));

    // Worms (slower, wavy movement)
    let worms = Array.from({ length: params.wormCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      angle: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.3,
      length: 20 + Math.random() * 15,
      segments: [],
      hue: 300 + Math.random() * 60,
      waveOffset: Math.random() * Math.PI * 2
    }));

    // Initialize worm segments
    worms.forEach(worm => {
      for (let i = 0; i < 10; i++) {
        worm.segments.push({
          x: worm.x - i * 3,
          y: worm.y
        });
      }
    });

    function updateFish() {
      fish.forEach(f => {
        // Attraction to mouse (light)
        const dx = mousePos.x - f.x;
        const dy = mousePos.y - f.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 20) {
          f.vx += (dx / dist) * params.attractionStrength * 0.1;
          f.vy += (dy / dist) * params.attractionStrength * 0.1;
        }

        // Simple flocking - avoid others
        fish.forEach(other => {
          if (other === f) return;
          const odx = f.x - other.x;
          const ody = f.y - other.y;
          const odist = Math.sqrt(odx * odx + ody * ody);
          if (odist < 30 && odist > 0) {
            f.vx += (odx / odist) * 0.1;
            f.vy += (ody / odist) * 0.1;
          }
        });

        // Limit speed
        const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
        if (speed > 3) {
          f.vx = (f.vx / speed) * 3;
          f.vy = (f.vy / speed) * 3;
        }

        // Update position
        f.x += f.vx;
        f.y += f.vy;

        // Bounce off walls
        if (f.x < 20 || f.x > canvas.width - 20) f.vx *= -0.8;
        if (f.y < 20 || f.y > canvas.height - 20) f.vy *= -0.8;
        f.x = Math.max(20, Math.min(canvas.width - 20, f.x));
        f.y = Math.max(20, Math.min(canvas.height - 20, f.y));

        // Update glow
        f.glowPhase += 0.05;
      });
    }

    function updateWorms() {
      worms.forEach(w => {
        // Wavy movement with gradual turns
        w.waveOffset += 0.03;
        const targetAngle = Math.atan2(mousePos.y - w.y, mousePos.x - w.x);
        const angleDiff = targetAngle - w.angle;

        // Normalize angle difference
        let normalizedDiff = angleDiff;
        while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
        while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;

        // Gradual turn toward light
        w.angle += normalizedDiff * 0.01 * params.attractionStrength;

        // Add wave motion
        w.angle += Math.sin(w.waveOffset) * 0.03;

        // Move head
        w.x += Math.cos(w.angle) * w.speed;
        w.y += Math.sin(w.angle) * w.speed;

        // Bounce off walls
        if (w.x < 30 || w.x > canvas.width - 30) w.angle = Math.PI - w.angle;
        if (w.y < 30 || w.y > canvas.height - 30) w.angle = -w.angle;
        w.x = Math.max(30, Math.min(canvas.width - 30, w.x));
        w.y = Math.max(30, Math.min(canvas.height - 30, w.y));

        // Update segments to follow head
        w.segments.unshift({ x: w.x, y: w.y });
        if (w.segments.length > 10) w.segments.pop();
      });
    }

    function draw() {
      // Clear with slight trail effect
      if (params.showTrails) {
        ctx.fillStyle = 'rgba(5, 15, 35, 0.1)';
      } else {
        ctx.fillStyle = '#050f23';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw light glow at mouse
      const lightGradient = ctx.createRadialGradient(
        mousePos.x, mousePos.y, 0,
        mousePos.x, mousePos.y, 150
      );
      lightGradient.addColorStop(0, 'rgba(100, 200, 255, 0.15)');
      lightGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
      ctx.fillStyle = lightGradient;
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 150, 0, Math.PI * 2);
      ctx.fill();

      // Draw worms
      worms.forEach(w => {
        ctx.beginPath();
        ctx.moveTo(w.segments[0].x, w.segments[0].y);

        for (let i = 1; i < w.segments.length; i++) {
          ctx.lineTo(w.segments[i].x, w.segments[i].y);
        }

        ctx.strokeStyle = \`hsla(\${w.hue}, 80%, 60%, 0.8)\`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow effect
        ctx.strokeStyle = \`hsla(\${w.hue}, 80%, 70%, 0.3)\`;
        ctx.lineWidth = 8;
        ctx.stroke();
      });

      // Draw fish
      fish.forEach(f => {
        const glow = 0.5 + Math.sin(f.glowPhase) * 0.3;
        const angle = Math.atan2(f.vy, f.vx);

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(angle);

        // Glow
        ctx.shadowColor = \`hsla(\${f.hue}, 80%, 60%, \${glow})\`;
        ctx.shadowBlur = 15;

        // Body
        ctx.fillStyle = \`hsla(\${f.hue}, 70%, 50%, 0.9)\`;
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size, f.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.beginPath();
        ctx.moveTo(-f.size, 0);
        ctx.lineTo(-f.size - 6, -4);
        ctx.lineTo(-f.size - 6, 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    }

    function animate() {
      updateFish();
      updateWorms();
      draw();
      animationId = requestAnimationFrame(animate);
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [params]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#050f23',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div style={{
        width: '260px',
        padding: '1.5rem',
        background: '#0a1628',
        borderRight: '1px solid #1e3a5f'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#60a5fa' }}>Fish Tank Lab</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            Fish Count: {params.fishCount}
          </label>
          <input
            type="range"
            min="5"
            max="30"
            value={params.fishCount}
            onChange={(e) => setParams(p => ({ ...p, fishCount: Number(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            Worm Count: {params.wormCount}
          </label>
          <input
            type="range"
            min="0"
            max="15"
            value={params.wormCount}
            onChange={(e) => setParams(p => ({ ...p, wormCount: Number(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            Light Attraction: {params.attractionStrength.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={params.attractionStrength}
            onChange={(e) => setParams(p => ({ ...p, attractionStrength: Number(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={params.showTrails}
            onChange={(e) => setParams(p => ({ ...p, showTrails: e.target.checked }))}
          />
          Show Trails
        </label>

        <p style={{ marginTop: '2rem', color: '#64748b', fontSize: '0.75rem', lineHeight: 1.5 }}>
          Move your mouse to guide the bioluminescent creatures with light.
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <canvas
          ref={canvasRef}
          width={700}
          height={500}
          style={{
            borderRadius: '12px',
            border: '1px solid #1e3a5f',
            cursor: 'none'
          }}
        />
      </div>
    </div>
  );
}`,
  },
  {
    id: 'neural-network-lab',
    name: 'Neural Network Lab',
    description:
      'Build and visualize neural networks. Adjust layers, neurons, and watch how signals propagate through the network.',
    category: 'neural_networks',
    tags: ['neural network', 'deep learning', 'visualization', 'advanced'],
    dependencies: ['react', 'react-dom'],
    sourceCode: `import React from 'react';

export default function NeuralNetworkLab() {
  const [layers, setLayers] = React.useState([4, 6, 6, 2]);
  const [activeNeuron, setActiveNeuron] = React.useState(null);
  const [activations, setActivations] = React.useState([]);

  // Generate random activations
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActivations(layers.map(count =>
        Array.from({ length: count }, () => Math.random())
      ));
    }, 1000);
    return () => clearInterval(interval);
  }, [layers]);

  const layerSpacing = 140;
  const neuronSpacing = 45;
  const svgWidth = 600;
  const svgHeight = 350;
  const startX = 80;

  const getNeuronY = (layerIndex, neuronIndex) => {
    const layerSize = layers[layerIndex];
    return svgHeight / 2 - ((layerSize - 1) * neuronSpacing) / 2 + neuronIndex * neuronSpacing;
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#0f172a',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      {/* Controls */}
      <div style={{
        width: '280px',
        padding: '1.5rem',
        background: '#1e293b',
        borderRight: '1px solid #334155'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#a78bfa' }}>Neural Network Lab</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
            Input Layer: {layers[0]} neurons
          </label>
          <input
            type="range"
            min="2"
            max="8"
            value={layers[0]}
            onChange={(e) => setLayers(l => [Number(e.target.value), ...l.slice(1)])}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
            Hidden Layer 1: {layers[1]} neurons
          </label>
          <input
            type="range"
            min="2"
            max="10"
            value={layers[1]}
            onChange={(e) => setLayers(l => [l[0], Number(e.target.value), l[2], l[3]])}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
            Hidden Layer 2: {layers[2]} neurons
          </label>
          <input
            type="range"
            min="2"
            max="10"
            value={layers[2]}
            onChange={(e) => setLayers(l => [l[0], l[1], Number(e.target.value), l[3]])}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
            Output Layer: {layers[3]} neurons
          </label>
          <input
            type="range"
            min="1"
            max="6"
            value={layers[3]}
            onChange={(e) => setLayers(l => [...l.slice(0, 3), Number(e.target.value)])}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{
          padding: '1rem',
          background: '#0f172a',
          borderRadius: '8px',
          marginTop: '2rem'
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            <strong style={{ color: '#a78bfa' }}>Total Parameters:</strong><br/>
            {layers.slice(0, -1).reduce((sum, l, i) => sum + l * layers[i + 1], 0).toLocaleString()} weights
          </p>
        </div>
      </div>

      {/* Visualization */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <svg width={svgWidth} height={svgHeight} style={{ background: '#1e293b', borderRadius: '12px' }}>
          {/* Connections */}
          {layers.slice(0, -1).map((layerSize, layerIndex) => {
            const nextLayerSize = layers[layerIndex + 1];
            const x1 = startX + layerIndex * layerSpacing;
            const x2 = startX + (layerIndex + 1) * layerSpacing;

            return Array.from({ length: layerSize }).flatMap((_, i) =>
              Array.from({ length: nextLayerSize }).map((_, j) => {
                const y1 = getNeuronY(layerIndex, i);
                const y2 = getNeuronY(layerIndex + 1, j);
                const activation = activations[layerIndex]?.[i] || 0;

                return (
                  <line
                    key={\`\${layerIndex}-\${i}-\${j}\`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={\`rgba(167, 139, 250, \${0.1 + activation * 0.4})\`}
                    strokeWidth={1 + activation}
                  />
                );
              })
            );
          })}

          {/* Neurons */}
          {layers.map((layerSize, layerIndex) =>
            Array.from({ length: layerSize }).map((_, neuronIndex) => {
              const x = startX + layerIndex * layerSpacing;
              const y = getNeuronY(layerIndex, neuronIndex);
              const activation = activations[layerIndex]?.[neuronIndex] || 0;
              const isActive = activeNeuron?.layer === layerIndex && activeNeuron?.neuron === neuronIndex;

              return (
                <g key={\`\${layerIndex}-\${neuronIndex}\`}>
                  {/* Glow */}
                  <circle
                    cx={x}
                    cy={y}
                    r={18}
                    fill={\`rgba(167, 139, 250, \${activation * 0.3})\`}
                  />
                  {/* Neuron */}
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill={\`hsl(260, \${50 + activation * 30}%, \${30 + activation * 30}%)\`}
                    stroke={isActive ? '#fff' : '#a78bfa'}
                    strokeWidth={isActive ? 2 : 1}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setActiveNeuron({ layer: layerIndex, neuron: neuronIndex })}
                    onMouseLeave={() => setActiveNeuron(null)}
                  />
                  {/* Activation value */}
                  <text
                    x={x}
                    y={y + 4}
                    fill="white"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {activation.toFixed(1)}
                  </text>
                </g>
              );
            })
          )}

          {/* Layer labels */}
          {['Input', 'Hidden 1', 'Hidden 2', 'Output'].map((label, i) => (
            <text
              key={label}
              x={startX + i * layerSpacing}
              y={svgHeight - 15}
              fill="#94a3b8"
              fontSize="11"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}`,
  },
  {
    id: 'experiment-lab',
    name: 'Experiment Lab',
    description:
      'A/B testing simulation showing statistical significance. Run experiments and visualize confidence intervals.',
    category: 'statistics',
    tags: ['statistics', 'a/b testing', 'data science', 'intermediate'],
    dependencies: ['react', 'react-dom'],
    sourceCode: `import React from 'react';

export default function ExperimentLab() {
  const [controlRate, setControlRate] = React.useState(0.10);
  const [treatmentRate, setTreatmentRate] = React.useState(0.12);
  const [sampleSize, setSampleSize] = React.useState(1000);
  const [results, setResults] = React.useState(null);
  const [isRunning, setIsRunning] = React.useState(false);

  const runExperiment = () => {
    setIsRunning(true);
    setResults(null);

    // Simulate experiment over time
    let controlSuccess = 0;
    let treatmentSuccess = 0;
    const iterations = 20;
    let currentIteration = 0;

    const interval = setInterval(() => {
      currentIteration++;
      const samplesPerIteration = sampleSize / iterations;

      for (let i = 0; i < samplesPerIteration; i++) {
        if (Math.random() < controlRate) controlSuccess++;
        if (Math.random() < treatmentRate) treatmentSuccess++;
      }

      const currentControlRate = controlSuccess / (currentIteration * samplesPerIteration);
      const currentTreatmentRate = treatmentSuccess / (currentIteration * samplesPerIteration);
      const n = currentIteration * samplesPerIteration;

      // Calculate confidence intervals (95%)
      const controlSE = Math.sqrt((currentControlRate * (1 - currentControlRate)) / n);
      const treatmentSE = Math.sqrt((currentTreatmentRate * (1 - currentTreatmentRate)) / n);

      // Z-score for difference
      const pooledRate = (controlSuccess + treatmentSuccess) / (2 * n);
      const pooledSE = Math.sqrt(2 * pooledRate * (1 - pooledRate) / n);
      const zScore = pooledSE > 0 ? (currentTreatmentRate - currentControlRate) / pooledSE : 0;
      const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

      setResults({
        controlRate: currentControlRate,
        treatmentRate: currentTreatmentRate,
        controlCI: [currentControlRate - 1.96 * controlSE, currentControlRate + 1.96 * controlSE],
        treatmentCI: [currentTreatmentRate - 1.96 * treatmentSE, currentTreatmentRate + 1.96 * treatmentSE],
        lift: ((currentTreatmentRate - currentControlRate) / currentControlRate) * 100,
        pValue,
        significant: pValue < 0.05,
        n
      });

      if (currentIteration >= iterations) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 100);
  };

  // Normal CDF approximation
  function normalCDF(x) {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#0f172a',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      {/* Controls */}
      <div style={{
        width: '300px',
        padding: '1.5rem',
        background: '#1e293b',
        borderRight: '1px solid #334155'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#22c55e' }}>Experiment Lab</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
            Control Rate: {(controlRate * 100).toFixed(1)}%
          </label>
          <input
            type="range"
            min="0.01"
            max="0.30"
            step="0.01"
            value={controlRate}
            onChange={(e) => setControlRate(Number(e.target.value))}
            style={{ width: '100%' }}
            disabled={isRunning}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
            Treatment Rate: {(treatmentRate * 100).toFixed(1)}%
          </label>
          <input
            type="range"
            min="0.01"
            max="0.30"
            step="0.01"
            value={treatmentRate}
            onChange={(e) => setTreatmentRate(Number(e.target.value))}
            style={{ width: '100%' }}
            disabled={isRunning}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
            Sample Size: {sampleSize.toLocaleString()} per group
          </label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={sampleSize}
            onChange={(e) => setSampleSize(Number(e.target.value))}
            style={{ width: '100%' }}
            disabled={isRunning}
          />
        </div>

        <button
          onClick={runExperiment}
          disabled={isRunning}
          style={{
            width: '100%',
            padding: '1rem',
            background: isRunning ? '#475569' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {isRunning ? 'Running...' : 'Run Experiment'}
        </button>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#0f172a',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0, lineHeight: 1.6 }}>
            This simulation demonstrates A/B testing concepts.
            Set true conversion rates and sample size, then watch
            as the experiment collects data and calculates statistical significance.
          </p>
        </div>
      </div>

      {/* Results */}
      <div style={{
        flex: 1,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {results ? (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            {/* Significance Badge */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              padding: '1rem',
              background: results.significant ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
              borderRadius: '8px',
              border: \`1px solid \${results.significant ? '#22c55e' : '#eab308'}\`
            }}>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: results.significant ? '#22c55e' : '#eab308'
              }}>
                {results.significant ? '✓ Statistically Significant!' : '⚠ Not Significant Yet'}
              </span>
              <p style={{ margin: '0.5rem 0 0', color: '#94a3b8' }}>
                p-value: {results.pValue.toFixed(4)} (α = 0.05)
              </p>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{
                padding: '1.5rem',
                background: '#1e293b',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#94a3b8', margin: '0 0 0.5rem' }}>Control</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#60a5fa' }}>
                  {(results.controlRate * 100).toFixed(2)}%
                </p>
                <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
                  CI: [{(results.controlCI[0] * 100).toFixed(2)}%, {(results.controlCI[1] * 100).toFixed(2)}%]
                </p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: '#1e293b',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#94a3b8', margin: '0 0 0.5rem' }}>Treatment</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#22c55e' }}>
                  {(results.treatmentRate * 100).toFixed(2)}%
                </p>
                <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
                  CI: [{(results.treatmentCI[0] * 100).toFixed(2)}%, {(results.treatmentCI[1] * 100).toFixed(2)}%]
                </p>
              </div>
            </div>

            {/* Lift */}
            <div style={{
              padding: '1.5rem',
              background: '#1e293b',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#94a3b8', margin: '0 0 0.5rem' }}>Relative Lift</p>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                margin: 0,
                color: results.lift > 0 ? '#22c55e' : '#ef4444'
              }}>
                {results.lift > 0 ? '+' : ''}{results.lift.toFixed(2)}%
              </p>
              <p style={{ color: '#64748b', margin: '0.5rem 0 0' }}>
                n = {results.n.toLocaleString()} per group
              </p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No experiment running</p>
            <p>Configure parameters and click "Run Experiment" to start</p>
          </div>
        )}
      </div>
    </div>
  );
}`,
  },
  // ============ CLIENT PLAYGROUNDS ============
  {
    id: 'client-vehicles-demo',
    name: 'Braitenberg Vehicles 3D Lab',
    description: 'Interactive 3D simulation with fish tank, draggable lamps, and nematodes',
    category: 'simulations',
    tags: ['3d', 'three.js', 'braitenberg', 'simulation', 'client'],
    dependencies: ['react', 'react-dom', 'three'],
    sourceCode: `import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const styles = {
  card: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1.5rem', marginBottom: '1rem' },
  btn: { padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' },
  btnSecondary: { padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 500 },
  btnDanger: { padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' },
  btnSuccess: { padding: '10px 20px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' },
};

function MobileWarning({ onContinue }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem', textAlign: 'center', color: 'white', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖥️</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Desktop Recommended</h2>
      <p style={{ color: '#888', marginBottom: '2rem', maxWidth: 300 }}>This 3D simulation requires mouse controls for the best experience.</p>
      <button onClick={onContinue} style={styles.btn}>Continue Anyway</button>
    </div>
  );
}

function LabDescription() {
  return (
    <div style={{ padding: '2rem', color: 'white', maxWidth: 900, margin: '0 auto', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>Braitenberg Vehicles 3D Lab</h1>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>Explore emergent behavior from simple sensor-motor connections</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '🐛', title: 'Nematodes', desc: 'Simple creatures that swim in the tank with two different behavior patterns' },
          { icon: '💡', title: 'Light Sources', desc: 'Double-click lamps to toggle them and observe how creatures respond' },
          { icon: '🎥', title: 'Camera Control', desc: 'Click and drag to orbit around the scene, scroll to zoom in/out' },
        ].map(item => (
          <div key={item.title} style={styles.card}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>
            <h3 style={{ color: '#a5b4fc', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{item.title}</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)' }}>
        <h3 style={{ color: '#a5b4fc', marginBottom: '1rem', fontSize: '1rem' }}>Vehicle Behaviors</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255, 153, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.2rem' }}>🔴</span>
            </div>
            <div>
              <div style={{ color: '#ff9999', fontWeight: 600, marginBottom: '0.25rem' }}>Vehicle 1: Sinusoidal</div>
              <div style={{ color: '#888', fontSize: '0.85rem' }}>Smooth, wave-like movement patterns</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(153, 255, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.2rem' }}>🟢</span>
            </div>
            <div>
              <div style={{ color: '#99ff99', fontWeight: 600, marginBottom: '0.25rem' }}>Vehicle 2: Erratic</div>
              <div style={{ color: '#888', fontSize: '0.85rem' }}>Random, unpredictable movements</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
        👆 Select <strong style={{ color: '#a5b4fc' }}>Vehicle 1</strong> or <strong style={{ color: '#a5b4fc' }}>Vehicle 2</strong> tabs to start the simulation
      </div>
    </div>
  );
}

function ThreeScene({ behaviorType, isPaused, lamps, onLampToggle }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const nematodesRef = useRef([]);
  const lampMeshesRef = useRef([]);
  const lampLightsRef = useRef([]);
  const animationRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const orbitRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 14 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080810);
    scene.fog = new THREE.Fog(0x080810, 15, 35);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // Renderer with better quality
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
    mainLight.position.set(8, 12, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Subtle blue rim light
    const rimLight = new THREE.DirectionalLight(0x6366f1, 0.3);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    // Room floor with gradient effect
    const floorGeo = new THREE.PlaneGeometry(25, 25);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x12121a, roughness: 0.9, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Enhanced table with wood grain effect
    const tableGeo = new THREE.BoxGeometry(7, 0.35, 4.5);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.7, metalness: 0.05 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 1.5, 0);
    table.castShadow = true;
    table.receiveShadow = true;
    scene.add(table);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.5, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3a2a20, roughness: 0.8 });
    [[-3, 0.75, -2], [3, 0.75, -2], [-3, 0.75, 2], [3, 0.75, 2]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      scene.add(leg);
    });

    // Enhanced fish tank
    const tankGroup = new THREE.Group();
    tankGroup.position.set(0, 2.45, 0);

    // Tank glass with better transparency
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.25,
      roughness: 0.05, metalness: 0, transmission: 0.9,
      thickness: 0.1, envMapIntensity: 1
    });
    [[0, 0.8, 1.8, 5.5, 1.6, 0.06], [0, 0.8, -1.8, 5.5, 1.6, 0.06], [2.7, 0.8, 0, 0.06, 1.6, 3.6], [-2.7, 0.8, 0, 0.06, 1.6, 3.6]].forEach(([x, y, z, w, h, d]) => {
      const wallGeo = new THREE.BoxGeometry(w, h, d);
      const wall = new THREE.Mesh(wallGeo, glassMat);
      wall.position.set(x, y, z);
      tankGroup.add(wall);
    });

    // Water with animated caustics effect
    const waterGeo = new THREE.BoxGeometry(5.3, 1.2, 3.5);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a5a8a, transparent: true, opacity: 0.5,
      roughness: 0.1, metalness: 0.1, transmission: 0.6
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 0.55, 0);
    tankGroup.add(water);

    // Tank bottom with sand texture
    const bottomGeo = new THREE.BoxGeometry(5.5, 0.15, 3.6);
    const bottomMat = new THREE.MeshStandardMaterial({ color: 0x3a6a5a, roughness: 0.9 });
    const bottom = new THREE.Mesh(bottomGeo, bottomMat);
    tankGroup.add(bottom);

    // Add some decorative pebbles
    const pebbleGeo = new THREE.SphereGeometry(0.08, 8, 6);
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x556655, roughness: 0.8 });
    for (let i = 0; i < 15; i++) {
      const pebble = new THREE.Mesh(pebbleGeo, pebbleMat);
      pebble.position.set((Math.random() - 0.5) * 4.5, 0.1, (Math.random() - 0.5) * 3);
      pebble.scale.set(0.8 + Math.random() * 0.5, 0.6 + Math.random() * 0.3, 0.8 + Math.random() * 0.5);
      tankGroup.add(pebble);
    }

    scene.add(tankGroup);

    // Worm-like nematodes - thin and long
    const nematodeColor = behaviorType === 1 ? 0xff7777 : 0x77ff77;
    const nematodeMat = new THREE.MeshStandardMaterial({
      color: nematodeColor, roughness: 0.5, metalness: 0.05,
      emissive: nematodeColor, emissiveIntensity: 0.2
    });

    for (let i = 0; i < 10; i++) {
      // Create segmented worm body using multiple small spheres
      const wormGroup = new THREE.Group();
      const numSegments = 8;
      const segmentRadius = 0.025;
      const segmentSpacing = 0.045;

      for (let s = 0; s < numSegments; s++) {
        const segGeo = new THREE.SphereGeometry(segmentRadius * (1 - s * 0.05), 8, 6);
        const segment = new THREE.Mesh(segGeo, nematodeMat.clone());
        segment.position.x = s * segmentSpacing;
        segment.castShadow = true;
        wormGroup.add(segment);
      }

      wormGroup.position.set((Math.random() - 0.5) * 4.5, 2.45 + 0.35 + Math.random() * 0.9, (Math.random() - 0.5) * 3);
      const vx = (Math.random() - 0.5) * 0.025;
      const vz = (Math.random() - 0.5) * 0.025;
      wormGroup.userData.velocity = new THREE.Vector3(vx, (Math.random() - 0.5) * 0.008, vz);
      wormGroup.userData.phase = Math.random() * Math.PI * 2;
      wormGroup.rotation.y = Math.atan2(vx, vz);
      scene.add(wormGroup);
      nematodesRef.current.push(wormGroup);
    }

    // Larger, more visible lamps
    lamps.forEach((lamp, idx) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(lamp.position[0], lamp.position[1], lamp.position[2]);

      // Larger lamp base
      const baseGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.15, 20);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.7 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.075;
      base.castShadow = true;
      lampGroup.add(base);

      // Thicker lamp pole
      const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.3, 12);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.6 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 0.8;
      pole.castShadow = true;
      lampGroup.add(pole);

      // Larger lamp shade
      const shadeGeo = new THREE.ConeGeometry(0.4, 0.22, 16, 1, true);
      const shadeMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.5, metalness: 0.5, side: THREE.DoubleSide });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.y = 1.4;
      shade.rotation.x = Math.PI;
      lampGroup.add(shade);

      // Much larger bulb for visibility
      const bulbGeo = new THREE.SphereGeometry(0.22, 20, 20);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: lamp.isOn ? 0xffffcc : 0x444444,
        emissive: lamp.isOn ? 0xffaa44 : 0x000000,
        emissiveIntensity: lamp.isOn ? 1.0 : 0,
        roughness: 0.15
      });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 1.52;
      bulb.userData.lampIndex = idx;
      lampGroup.add(bulb);

      // Stronger light source
      if (lamp.isOn) {
        const light = new THREE.PointLight(0xffdd88, 4, 12);
        light.position.y = 1.52;
        light.castShadow = true;
        lampGroup.add(light);
        lampLightsRef.current[idx] = light;
      }

      scene.add(lampGroup);
      lampMeshesRef.current[idx] = { group: lampGroup, bulb, mat: bulbMat };
    });

    // Animation loop
    function animate() {
      animationRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      const elapsed = clockRef.current.getElapsedTime();

      if (!isPaused) {
        nematodesRef.current.forEach(worm => {
          const pos = worm.position;
          const vel = worm.userData.velocity;
          const phase = worm.userData.phase || 0;

          // Different movement behaviors
          if (behaviorType === 1) {
            // Vehicle 1: Smooth sinusoidal - coordinated, wave-like swimming
            vel.x += Math.sin(elapsed * 2 + pos.z + phase) * 0.0015;
            vel.z += Math.cos(elapsed * 1.5 + pos.x + phase) * 0.0015;
          } else {
            // Vehicle 2: Erratic - sudden direction changes, unpredictable
            if (Math.random() < 0.05) {
              vel.x += (Math.random() - 0.5) * 0.008;
              vel.z += (Math.random() - 0.5) * 0.008;
            }
            vel.x += (Math.random() - 0.5) * 0.002;
            vel.z += (Math.random() - 0.5) * 0.002;
          }
          vel.clampLength(0, 0.04);

          pos.x += vel.x * delta * 60;
          pos.y += vel.y * delta * 60;
          pos.z += vel.z * delta * 60;

          // Tank bounds
          if (pos.x > 2.3) { pos.x = 2.3; vel.x *= -1; }
          if (pos.x < -2.3) { pos.x = -2.3; vel.x *= -1; }
          if (pos.z > 1.5) { pos.z = 1.5; vel.z *= -1; }
          if (pos.z < -1.5) { pos.z = -1.5; vel.z *= -1; }
          if (pos.y > 3.7) { pos.y = 3.7; vel.y *= -1; }
          if (pos.y < 2.65) { pos.y = 2.65; vel.y *= -1; }

          // Face movement direction
          worm.rotation.y = Math.atan2(vel.x, vel.z);

          // Wriggling animation - segments undulate
          const segments = worm.children;
          segments.forEach((seg, i) => {
            const wave = Math.sin(elapsed * 6 + phase + i * 0.8) * 0.015;
            seg.position.y = wave;
            seg.position.z = Math.sin(elapsed * 5 + phase + i * 0.6) * 0.01;
          });
        });
      }

      renderer.render(scene, camera);
    }
    animate();

    // Event handlers
    function handleResize() {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    function handleMouseDown(e) { isDraggingRef.current = true; lastMouseRef.current = { x: e.clientX, y: e.clientY }; }
    function handleMouseMove(e) {
      if (!isDraggingRef.current) return;
      orbitRef.current.theta -= (e.clientX - lastMouseRef.current.x) * 0.01;
      orbitRef.current.phi = Math.max(0.2, Math.min(Math.PI - 0.2, orbitRef.current.phi - (e.clientY - lastMouseRef.current.y) * 0.01));
      updateCameraPosition();
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
    function handleMouseUp() { isDraggingRef.current = false; }
    function handleWheel(e) { e.preventDefault(); orbitRef.current.radius = Math.max(6, Math.min(22, orbitRef.current.radius + e.deltaY * 0.01)); updateCameraPosition(); }
    function handleDblClick(e) {
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const bulbs = lampMeshesRef.current.map(l => l.bulb);
      const intersects = raycaster.intersectObjects(bulbs);
      if (intersects.length > 0) {
        const idx = intersects[0].object.userData.lampIndex;
        if (idx !== undefined) onLampToggle(idx);
      }
    }

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
    renderer.domElement.addEventListener('dblclick', handleDblClick);

    function updateCameraPosition() {
      if (!cameraRef.current) return;
      const { theta, phi, radius } = orbitRef.current;
      cameraRef.current.position.x = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.position.y = radius * Math.cos(phi);
      cameraRef.current.position.z = radius * Math.sin(phi) * Math.sin(theta);
      cameraRef.current.lookAt(0, 2.2, 0);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('dblclick', handleDblClick);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [behaviorType]);

  useEffect(() => {
    lamps.forEach((lamp, idx) => {
      const meshData = lampMeshesRef.current[idx];
      if (!meshData) return;
      meshData.mat.color.setHex(lamp.isOn ? 0xffffcc : 0x444444);
      meshData.mat.emissive.setHex(lamp.isOn ? 0xffaa44 : 0x000000);
      meshData.mat.emissiveIntensity = lamp.isOn ? 1.0 : 0;

      const existingLight = lampLightsRef.current[idx];
      if (lamp.isOn && !existingLight) {
        const light = new THREE.PointLight(0xffdd88, 4, 12);
        light.position.y = 1.52;
        light.castShadow = true;
        meshData.group.add(light);
        lampLightsRef.current[idx] = light;
      } else if (!lamp.isOn && existingLight) {
        meshData.group.remove(existingLight);
        existingLight.dispose();
        lampLightsRef.current[idx] = null;
      }
    });
  }, [lamps]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#080810' }} />;
}

function VehicleTab({ behaviorType, tabState, setTabState }) {
  const [isPaused, setIsPaused] = useState(tabState?.isPaused || false);
  const [lamps, setLamps] = useState(tabState?.lamps || [{ position: [-3.5, 0, -2], isOn: false }, { position: [3.5, 0, 2], isOn: true }]);
  const [key, setKey] = useState(0);

  useEffect(() => { setTabState({ isPaused, lamps }); }, [isPaused, lamps]);

  const handleReset = () => { setIsPaused(false); setLamps([{ position: [-3.5, 0, -2], isOn: false }, { position: [3.5, 0, 2], isOn: true }]); setKey(k => k + 1); };
  const handleLampToggle = useCallback((i) => { setLamps(prev => prev.map((l, idx) => idx === i ? { ...l, isOn: !l.isOn } : l)); }, []);

  const color = behaviorType === 1 ? '#ff7777' : '#77ff77';
  const behaviorName = behaviorType === 1 ? 'Sinusoidal' : 'Erratic';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 56, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '0.75rem' }}>
        <button onClick={() => setIsPaused(!isPaused)} style={isPaused ? styles.btnSuccess : styles.btnDanger}>
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button onClick={handleReset} style={styles.btnSecondary}>↺ Reset</button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>Lamps:</span>
            {lamps.map((l, i) => (
              <div key={i} onClick={() => handleLampToggle(i)} style={{
                width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                background: l.isOn ? 'radial-gradient(circle, #ffdd88 0%, #ffaa44 100%)' : '#333',
                boxShadow: l.isOn ? '0 0 12px #ffaa44' : 'none', border: '2px solid #555', transition: 'all 0.3s'
              }} title={\`Lamp \${i + 1}: \${l.isOn ? 'ON' : 'OFF'}\`} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '6px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 20, border: \`1px solid \${color}40\` }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: \`0 0 8px \${color}\` }} />
            <span style={{ color, fontWeight: 600, fontSize: '0.85rem' }}>Vehicle {behaviorType}: {behaviorName}</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <ThreeScene key={key} behaviorType={behaviorType} isPaused={isPaused} lamps={lamps} onLampToggle={handleLampToggle} />
        <div style={{ position: 'absolute', bottom: 16, left: 16, padding: '8px 14px', background: 'rgba(0,0,0,0.7)', borderRadius: 8, fontSize: '0.75rem', color: '#888' }}>
          🖱️ Drag to orbit • Scroll to zoom • Double-click lamp to toggle
        </div>
      </div>
    </div>
  );
}

function AppShell({ tabs, leftMenuButtons }) {
  const [activeTab, setActiveTab] = useState(0);
  const [tabStates, setTabStates] = useState({});
  return (
    <div style={{ display: 'flex', height: '100vh', paddingTop: 40, boxSizing: 'border-box', background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 100%)', fontFamily: 'system-ui' }}>
      <div style={{ width: 44, background: 'rgba(15, 15, 26, 0.8)', borderRight: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12 }}>
        {leftMenuButtons.map(btn => (
          <button key={btn.id} onClick={btn.onClick} title={btn.title}
            style={{ width: 32, height: 32, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 8, color: '#a5b4fc', cursor: 'pointer', marginBottom: 8, fontSize: '14px' }}>
            {btn.icon}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', background: 'rgba(15, 15, 26, 0.8)', borderBottom: '1px solid rgba(99, 102, 241, 0.1)', padding: '0 1rem' }}>
          {tabs.map((tab, i) => (
            <button key={tab.id} onClick={() => setActiveTab(i)}
              style={{ padding: '14px 24px', background: 'transparent', color: activeTab === i ? '#fff' : '#666', border: 'none',
                borderBottom: activeTab === i ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === i ? 600 : 400, transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>{tabs[activeTab].render(tabStates[tabs[activeTab].id], (s) => setTabStates(prev => ({ ...prev, [tabs[activeTab].id]: s })))}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [showMobile, setShowMobile] = useState(false);
  const [bypass, setBypass] = useState(false);
  useEffect(() => { setShowMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768); }, []);
  if (showMobile && !bypass) return <MobileWarning onContinue={() => setBypass(true)} />;
  const tabs = [
    { id: 'desc', label: 'Lab Description', render: () => <LabDescription /> },
    { id: 'v1', label: 'Vehicle 1', render: (s, set) => <VehicleTab behaviorType={1} tabState={s} setTabState={set} /> },
    { id: 'v2', label: 'Vehicle 2', render: (s, set) => <VehicleTab behaviorType={2} tabState={s} setTabState={set} /> },
  ];
  const leftMenuButtons = [
    { id: 'info', icon: 'ℹ️', title: 'About', onClick: () => alert('Braitenberg Vehicles 3D Lab\\nExplore emergent behavior from simple sensor-motor connections.') },
    { id: 'reset', icon: '↺', title: 'Reset', onClick: () => window.confirm('Reset the simulation?') && window.location.reload() },
  ];
  return <AppShell tabs={tabs} leftMenuButtons={leftMenuButtons} />;
}`,
  },
  {
    id: 'client-neural-network',
    name: 'Neural Network Simulator',
    description: 'Interactive neural network visualization with adjustable layers',
    category: 'neural_networks',
    tags: ['neural network', 'visualization', 'educational', 'client'],
    dependencies: ['react', 'react-dom'],
    sourceCode: `import React, { useState, useEffect, useCallback } from 'react';

const styles = {
  card: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1.5rem', marginBottom: '1rem' },
  btn: { padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' },
  btnSecondary: { padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' },
  btnDanger: { padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' },
  btnSuccess: { padding: '10px 20px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' },
  stepBtn: { width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
};

function MobileWarning({ onContinue }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem', textAlign: 'center', color: 'white', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖥️</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Desktop Recommended</h2>
      <p style={{ color: '#888', marginBottom: '2rem', maxWidth: 300 }}>This neural network simulation is optimized for larger screens.</p>
      <button onClick={onContinue} style={styles.btn}>Continue Anyway</button>
    </div>
  );
}

function NetworkViz({ layers, activations, onNeuronClick, showLabels = true }) {
  const width = 750, height = 420, layerSpacing = width / (layers.length + 1);
  const getNeuronY = (li, ni) => { const spacing = Math.min(55, (height - 80) / layers[li]); return height / 2 - ((layers[li] - 1) * spacing) / 2 + ni * spacing; };

  return (
    <svg width={width} height={height} style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3"/>
        </linearGradient>
      </defs>

      {layers.slice(0, -1).map((size, li) => Array.from({ length: size }).flatMap((_, i) => Array.from({ length: layers[li + 1] }).map((_, j) => {
        const act = activations[li]?.[i] || 0;
        return (
          <line key={\`\${li}-\${i}-\${j}\`} x1={(li + 1) * layerSpacing} y1={getNeuronY(li, i)} x2={(li + 2) * layerSpacing} y2={getNeuronY(li + 1, j)}
            stroke={act > 0.3 ? \`rgba(139, 92, 246, \${0.3 + act * 0.7})\` : 'rgba(99, 102, 241, 0.15)'}
            strokeWidth={act > 0.3 ? 2 + act * 2 : 1}
            style={{ transition: 'all 0.5s ease-out' }} />
        );
      })))}

      {layers.map((size, li) => Array.from({ length: size }).map((_, ni) => {
        const act = activations[li]?.[ni] || 0;
        const cx = (li + 1) * layerSpacing, cy = getNeuronY(li, ni);
        const isActive = act > 0.5;
        return (
          <g key={\`\${li}-\${ni}\`} onClick={() => onNeuronClick(li, ni)} style={{ cursor: 'pointer' }}>
            {isActive && <circle cx={cx} cy={cy} r={24} fill="rgba(139, 92, 246, 0.3)" filter="url(#glow)" style={{ transition: 'all 0.5s' }} />}
            <circle cx={cx} cy={cy} r={18}
              fill={\`hsl(\${260 - act * 40}, \${60 + act * 20}%, \${25 + act * 35}%)\`}
              stroke={isActive ? '#a78bfa' : '#6366f1'} strokeWidth={isActive ? 3 : 2}
              style={{ transition: 'all 0.5s ease-out', filter: isActive ? 'url(#glow)' : 'none' }} />
            <text x={cx} y={cy + 5} fill="white" fontSize="11" fontWeight="600" textAnchor="middle" style={{ pointerEvents: 'none' }}>{act.toFixed(1)}</text>
          </g>
        );
      }))}

      {showLabels && ['Input', ...layers.slice(1, -1).map((_, i) => \`Hidden \${i + 1}\`), 'Output'].map((label, i) => (
        <text key={label} x={(i + 1) * layerSpacing} y={height - 15} fill="#6366f1" fontSize="13" fontWeight="500" textAnchor="middle">{label}</text>
      ))}
    </svg>
  );
}

function IntroTab() {
  return (
    <div style={{ padding: '2rem', color: 'white', maxWidth: 850, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>Neural Network Simulator</h1>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>Explore how artificial neural networks process information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '🧠', title: 'Neurons', desc: 'Processing units that receive, transform, and transmit signals' },
          { icon: '🔗', title: 'Connections', desc: 'Weighted links that determine signal strength between neurons' },
          { icon: '⚡', title: 'Activation', desc: 'The output value of a neuron based on its inputs' },
          { icon: '📊', title: 'Layers', desc: 'Groups of neurons: input, hidden, and output layers' },
        ].map(item => (
          <div key={item.title} style={styles.card}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
            <h3 style={{ color: '#a5b4fc', marginBottom: '0.25rem', fontSize: '1rem' }}>{item.title}</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', textAlign: 'center' }}>
        <p style={{ color: '#a5b4fc', margin: 0 }}>👆 Use the <strong>Build Network</strong> tab to design your network, then <strong>Train & Visualize</strong> to see it in action!</p>
      </div>
    </div>
  );
}

function BuildTab({ tabState, setTabState }) {
  const [layers, setLayers] = useState(tabState?.layers || [3, 4, 4, 2]);
  useEffect(() => { setTabState({ layers }); }, [layers]);

  const updateLayer = (i, delta) => {
    const newLayers = [...layers];
    newLayers[i] = Math.max(1, Math.min(8, newLayers[i] + delta));
    setLayers(newLayers);
  };

  const layerNames = ['Input Layer', ...layers.slice(1, -1).map((_, i) => \`Hidden Layer \${i + 1}\`), 'Output Layer'];
  const layerColors = ['#22c55e', ...layers.slice(1, -1).map(() => '#6366f1'), '#f59e0b'];

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Build Your Network</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
        <div style={styles.card}>
          <h3 style={{ color: '#a5b4fc', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>Layer Configuration</h3>

          {layers.map((size, i) => (
            <div key={i} style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, borderLeft: \`3px solid \${layerColors[i]}\` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#ccc' }}>{layerNames[i]}</span>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>{size} neurons</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => updateLayer(i, -1)} style={{ ...styles.stepBtn, background: size <= 1 ? '#333' : 'rgba(239, 68, 68, 0.8)', color: size <= 1 ? '#666' : 'white' }} disabled={size <= 1}>−</button>
                <div style={{ flex: 1, height: 8, background: '#1a1a2e', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: \`\${(size / 8) * 100}%\`, height: '100%', background: layerColors[i], borderRadius: 4, transition: 'width 0.2s' }} />
                </div>
                <button onClick={() => updateLayer(i, 1)} style={{ ...styles.stepBtn, background: size >= 8 ? '#333' : 'rgba(34, 197, 94, 0.8)', color: size >= 8 ? '#666' : 'white' }} disabled={size >= 8}>+</button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button onClick={() => layers.length < 6 && setLayers([...layers.slice(0, -1), 4, layers[layers.length - 1]])}
              style={{ ...styles.btnSecondary, flex: 1, opacity: layers.length >= 6 ? 0.5 : 1 }} disabled={layers.length >= 6}>
              + Add Hidden
            </button>
            <button onClick={() => layers.length > 2 && setLayers([...layers.slice(0, -2), layers[layers.length - 1]])}
              style={{ ...styles.btnSecondary, flex: 1, opacity: layers.length <= 2 ? 0.5 : 1 }} disabled={layers.length <= 2}>
              − Remove
            </button>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 8, fontSize: '0.8rem', color: '#888' }}>
            Total: {layers.reduce((a, b) => a + b, 0)} neurons, {layers.slice(0, -1).reduce((acc, l, i) => acc + l * layers[i + 1], 0)} connections
          </div>
        </div>

        <div>
          <h3 style={{ color: '#a5b4fc', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>Network Preview</h3>
          <NetworkViz layers={layers} activations={[]} onNeuronClick={() => {}} />
        </div>
      </div>
    </div>
  );
}

function TrainTab({ tabState }) {
  const layers = tabState?.layers || [3, 4, 4, 2];
  const [activations, setActivations] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setActivations(layers.map(count => Array.from({ length: count }, () => Math.random())));
      setEpoch(e => e + 1);
    }, speed);
    return () => clearInterval(interval);
  }, [isRunning, layers, speed]);

  const handleNeuronClick = useCallback((li, ni) => {
    setActivations(layers.map((c, l) => Array.from({ length: c }, (_, n) => {
      if (l === li && n === ni) return 1;
      if (l > li) return Math.random() * 0.8 + 0.2;
      return 0;
    })));
  }, [layers]);

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Train & Visualize</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
        <div style={styles.card}>
          <h3 style={{ color: '#a5b4fc', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>Controls</h3>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button onClick={() => setIsRunning(!isRunning)} style={isRunning ? styles.btnDanger : styles.btnSuccess}>
              {isRunning ? '⏹ Stop' : '▶ Start'}
            </button>
            <button onClick={() => { setActivations([]); setEpoch(0); }} style={styles.btnSecondary}>↺ Reset</button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>Animation Speed</span>
              <span style={{ fontSize: '0.85rem', color: '#a5b4fc' }}>{speed < 1000 ? 'Fast' : speed < 2000 ? 'Medium' : 'Slow'}</span>
            </div>
            <input type="range" min="500" max="3000" step="250" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>EPOCH</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a5b4fc' }}>{epoch}</div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 8, fontSize: '0.8rem', color: '#888' }}>
            💡 Click any neuron to manually trigger activation and see signal propagation through the network.
          </div>
        </div>

        <div>
          <h3 style={{ color: '#a5b4fc', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>Live Visualization</h3>
          <NetworkViz layers={layers} activations={activations} onNeuronClick={handleNeuronClick} />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#6366f1' }} />
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Inactive</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 10px #a78bfa' }} />
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 20, height: 3, background: 'linear-gradient(90deg, #6366f1 0%, #a78bfa 100%)' }} />
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Signal flow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppShell({ tabs, leftMenuButtons }) {
  const [activeTab, setActiveTab] = useState(0);
  const [tabStates, setTabStates] = useState({});
  return (
    <div style={{ display: 'flex', height: '100vh', paddingTop: 40, boxSizing: 'border-box', background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 100%)', fontFamily: 'system-ui' }}>
      <div style={{ width: 44, background: 'rgba(15, 15, 26, 0.8)', borderRight: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12 }}>
        {leftMenuButtons.map(btn => (
          <button key={btn.id} onClick={btn.onClick} title={btn.title}
            style={{ width: 32, height: 32, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 8, color: '#a5b4fc', cursor: 'pointer', marginBottom: 8, fontSize: '14px', transition: 'all 0.2s' }}>
            {btn.icon}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', background: 'rgba(15, 15, 26, 0.8)', borderBottom: '1px solid rgba(99, 102, 241, 0.1)', padding: '0 1rem' }}>
          {tabs.map((tab, i) => (
            <button key={tab.id} onClick={() => setActiveTab(i)}
              style={{ padding: '14px 24px', background: 'transparent', color: activeTab === i ? '#fff' : '#666', border: 'none',
                borderBottom: activeTab === i ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === i ? 600 : 400, transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>{tabs[activeTab].render(tabStates, (s) => setTabStates(prev => ({ ...prev, [tabs[activeTab].id]: { ...prev[tabs[activeTab].id], ...s } })))}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [showMobile, setShowMobile] = useState(false);
  const [bypass, setBypass] = useState(false);
  useEffect(() => { setShowMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768); }, []);
  if (showMobile && !bypass) return <MobileWarning onContinue={() => setBypass(true)} />;
  const tabs = [
    { id: 'intro', label: 'Introduction', render: () => <IntroTab /> },
    { id: 'build', label: 'Build Network', render: (states, setState) => <BuildTab tabState={states?.build} setTabState={(s) => setState({ build: s })} /> },
    { id: 'train', label: 'Train & Visualize', render: (states) => <TrainTab tabState={states?.build} /> },
  ];
  const leftMenuButtons = [
    { id: 'info', icon: 'ℹ️', title: 'About', onClick: () => alert('Neural Network Simulator - Interactive visualization of artificial neural networks') },
    { id: 'reset', icon: '↺', title: 'Reset', onClick: () => window.confirm('Reset the simulator?') && window.location.reload() },
  ];
  return <AppShell tabs={tabs} leftMenuButtons={leftMenuButtons} />;
}`,
  },
  {
    id: 'client-experiment',
    name: 'Experiment Lab',
    description: 'A/B testing simulation with statistical analysis',
    category: 'statistics',
    tags: ['statistics', 'a/b testing', 'experiment', 'client'],
    dependencies: ['react', 'react-dom'],
    sourceCode: `import React, { useState, useEffect } from 'react';

function MobileWarning({ onContinue }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem', textAlign: 'center', color: 'white', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖥️</div>
      <h2>Desktop Recommended</h2>
      <p style={{ color: '#888', marginBottom: '2rem' }}>This simulation is optimized for desktop.</p>
      <button onClick={onContinue} style={{ padding: '12px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Continue Anyway</button>
    </div>
  );
}

function normalCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1; x = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

function SetupTab({ tabState, setTabState }) {
  const [controlRate, setControlRate] = useState(tabState?.controlRate || 0.10);
  const [treatmentRate, setTreatmentRate] = useState(tabState?.treatmentRate || 0.12);
  const [sampleSize, setSampleSize] = useState(tabState?.sampleSize || 1000);
  useEffect(() => { setTabState({ controlRate, treatmentRate, sampleSize }); }, [controlRate, treatmentRate, sampleSize]);
  return (
    <div style={{ padding: '2rem', color: 'white', maxWidth: 600 }}>
      <h2 style={{ color: '#22c55e', marginBottom: '1.5rem' }}>Experiment Setup</h2>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Control Rate: {(controlRate * 100).toFixed(1)}%</label>
        <input type="range" min="0.01" max="0.30" step="0.01" value={controlRate} onChange={(e) => setControlRate(Number(e.target.value))} style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Treatment Rate: {(treatmentRate * 100).toFixed(1)}%</label>
        <input type="range" min="0.01" max="0.30" step="0.01" value={treatmentRate} onChange={(e) => setTreatmentRate(Number(e.target.value))} style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Sample Size: {sampleSize.toLocaleString()}</label>
        <input type="range" min="100" max="10000" step="100" value={sampleSize} onChange={(e) => setSampleSize(Number(e.target.value))} style={{ width: '100%' }} />
      </div>
      <div style={{ background: '#1a1a2e', padding: '1rem', borderRadius: 8 }}>
        <h3 style={{ color: '#a5b4fc' }}>Expected Lift</h3>
        <p style={{ fontSize: '2rem', color: treatmentRate > controlRate ? '#22c55e' : '#ef4444' }}>{(((treatmentRate - controlRate) / controlRate) * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
}

function RunTab({ tabState, setTabState }) {
  const config = { controlRate: tabState?.controlRate ?? 0.10, treatmentRate: tabState?.treatmentRate ?? 0.12, sampleSize: tabState?.sampleSize ?? 1000 };
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const runExperiment = () => {
    setIsRunning(true); setResults(null); setProgress(0);
    let controlSuccess = 0, treatmentSuccess = 0; const iterations = 20; let current = 0;
    const interval = setInterval(() => {
      current++; const samplesPerIteration = config.sampleSize / iterations;
      for (let i = 0; i < samplesPerIteration; i++) { if (Math.random() < config.controlRate) controlSuccess++; if (Math.random() < config.treatmentRate) treatmentSuccess++; }
      const n = current * samplesPerIteration;
      const cRate = controlSuccess / n, tRate = treatmentSuccess / n;
      const cSE = Math.sqrt((cRate * (1 - cRate)) / n), tSE = Math.sqrt((tRate * (1 - tRate)) / n);
      const pooled = (controlSuccess + treatmentSuccess) / (2 * n);
      const pooledSE = Math.sqrt(2 * pooled * (1 - pooled) / n);
      const z = pooledSE > 0 ? (tRate - cRate) / pooledSE : 0;
      const pValue = 2 * (1 - normalCDF(Math.abs(z)));
      setProgress(current / iterations);
      const newResults = { controlRate: cRate, treatmentRate: tRate, controlCI: [cRate - 1.96 * cSE, cRate + 1.96 * cSE], treatmentCI: [tRate - 1.96 * tSE, tRate + 1.96 * tSE], lift: ((tRate - cRate) / cRate) * 100, pValue, significant: pValue < 0.05, n };
      setResults(newResults); setTabState({ results: newResults });
      if (current >= iterations) { clearInterval(interval); setIsRunning(false); }
    }, 150);
  };
  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h2 style={{ color: '#22c55e', marginBottom: '1rem' }}>Run Experiment</h2>
      <button onClick={runExperiment} disabled={isRunning} style={{ padding: '12px 24px', background: isRunning ? '#666' : '#22c55e', color: 'white', border: 'none', borderRadius: 8, cursor: isRunning ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>{isRunning ? \`Running... \${Math.round(progress * 100)}%\` : 'Start Experiment'}</button>
      {results && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: '#1a1a2e', padding: '1.5rem', borderRadius: 8, textAlign: 'center' }}><p style={{ color: '#888' }}>Control</p><p style={{ fontSize: '2rem', color: '#60a5fa' }}>{(results.controlRate * 100).toFixed(2)}%</p></div>
          <div style={{ background: '#1a1a2e', padding: '1.5rem', borderRadius: 8, textAlign: 'center' }}><p style={{ color: '#888' }}>Treatment</p><p style={{ fontSize: '2rem', color: '#22c55e' }}>{(results.treatmentRate * 100).toFixed(2)}%</p></div>
        </div>
      )}
    </div>
  );
}

function ResultsTab({ tabState }) {
  const results = tabState?.results;
  if (!results) return <div style={{ padding: '2rem', color: '#888', textAlign: 'center' }}>Run an experiment first.</div>;
  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h2 style={{ color: '#22c55e', marginBottom: '1rem' }}>Results</h2>
      <div style={{ padding: '1.5rem', borderRadius: 8, marginBottom: '1rem', background: results.significant ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)', border: \`1px solid \${results.significant ? '#22c55e' : '#eab308'}\` }}>
        <h3 style={{ color: results.significant ? '#22c55e' : '#eab308' }}>{results.significant ? '✓ Statistically Significant!' : '⚠ Not Significant'}</h3>
        <p style={{ color: '#888' }}>p-value: {results.pValue.toFixed(4)}</p>
      </div>
      <div style={{ background: '#1a1a2e', padding: '1.5rem', borderRadius: 8 }}>
        <h3>Relative Lift</h3>
        <p style={{ fontSize: '3rem', color: results.lift > 0 ? '#22c55e' : '#ef4444' }}>{results.lift > 0 ? '+' : ''}{results.lift.toFixed(2)}%</p>
        <p style={{ color: '#888' }}>Based on {results.n.toLocaleString()} samples per group</p>
      </div>
    </div>
  );
}

function AppShell({ tabs, leftMenuButtons }) {
  const [activeTab, setActiveTab] = useState(0);
  const [tabStates, setTabStates] = useState({});
  return (
    <div style={{ display: 'flex', height: '100vh', paddingTop: 40, boxSizing: 'border-box', background: '#0a0a0f', fontFamily: 'system-ui' }}>
      <div style={{ width: 30, background: '#0f0f1a', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
        {leftMenuButtons.map(btn => <button key={btn.id} onClick={btn.onClick} title={btn.title} style={{ width: 24, height: 24, background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', marginBottom: 8 }}>{btn.icon}</button>)}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', background: '#0f0f1a', borderBottom: '1px solid #222' }}>
          {tabs.map((tab, i) => <button key={tab.id} onClick={() => setActiveTab(i)} style={{ padding: '12px 20px', background: activeTab === i ? '#1a1a2e' : 'transparent', color: activeTab === i ? '#fff' : '#666', border: 'none', borderBottom: activeTab === i ? '2px solid #22c55e' : '2px solid transparent', cursor: 'pointer' }}>{tab.label}</button>)}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>{tabs[activeTab].render(tabStates, (s) => setTabStates(prev => ({ ...prev, [tabs[activeTab].id]: { ...prev[tabs[activeTab].id], ...s } })))}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [showMobile, setShowMobile] = useState(false);
  const [bypass, setBypass] = useState(false);
  useEffect(() => { setShowMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768); }, []);
  if (showMobile && !bypass) return <MobileWarning onContinue={() => setBypass(true)} />;
  const tabs = [
    { id: 'setup', label: 'Setup', render: (states, setState) => <SetupTab tabState={states?.setup} setTabState={setState} /> },
    { id: 'run', label: 'Run Experiment', render: (states, setState) => <RunTab tabState={states?.setup} setTabState={setState} /> },
    { id: 'results', label: 'Results', render: (states) => <ResultsTab tabState={states?.run} /> },
  ];
  const leftMenuButtons = [
    { id: 'info', icon: 'ℹ', title: 'Info', onClick: () => alert('Experiment Lab - A/B Testing Simulator') },
    { id: 'reset', icon: '↺', title: 'Reset', onClick: () => window.confirm('Reset?') && window.location.reload() },
  ];
  return <AppShell tabs={tabs} leftMenuButtons={leftMenuButtons} />;
}`,
  },
];

async function seedPlaygrounds() {
  try {
    console.log('🌱 Starting playground template seeding...');

    let created = 0;
    let skipped = 0;

    for (const template of PLAYGROUND_TEMPLATES) {
      // Check if template already exists - if so, skip (don't overwrite user edits)
      const existing = await prisma.playgrounds.findUnique({
        where: { id: template.id },
        select: { id: true },
      });

      if (existing) {
        console.log(`   ⏭️  Skipping "${template.name}" (already exists)`);
        skipped++;
        continue;
      }

      // Create new template
      await prisma.playgrounds.create({
        data: {
          id: template.id,
          title: template.name,
          description: template.description || '',
          category: template.category,
          source_code: template.sourceCode,
          requirements: template.dependencies || [],
          is_public: true,
          is_featured: true,
          is_protected: true,
          app_type: 'sandpack',
          // Note: created_by is nullable for system-seeded templates
        },
      });
      console.log(`   ✅ Created "${template.name}"`);
      created++;
    }

    console.log(`\n✅ Playground template seeding complete!`);
    console.log(`   - Created: ${created} new templates`);
    console.log(`   - Skipped: ${skipped} existing templates`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding playground templates:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedPlaygrounds();
