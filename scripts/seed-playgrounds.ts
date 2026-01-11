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
];

async function seedPlaygrounds() {
  try {
    console.log('🌱 Starting playground template seeding...');

    let seeded = 0;

    for (const template of PLAYGROUND_TEMPLATES) {
      // Use upsert to avoid prepared statement issues with PgBouncer
      await prisma.playgrounds.upsert({
        where: { id: template.id },
        update: {
          title: template.name,
          description: template.description || '',
          category: template.category,
          source_code: template.sourceCode,
          requirements: template.dependencies || [],
          is_public: true,
          is_featured: true,
          is_protected: true,
          app_type: 'sandpack',
        },
        create: {
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
      seeded++;
    }

    console.log(`✅ Playground template seeding complete!`);
    console.log(`   - Total: ${PLAYGROUND_TEMPLATES.length} templates seeded`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding playground templates:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedPlaygrounds();
