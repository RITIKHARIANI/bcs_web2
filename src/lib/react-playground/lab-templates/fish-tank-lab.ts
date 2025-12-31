/**
 * Fish Tank Lab Template
 *
 * A 3D simulation of nematodes in a fish tank responding to light sources.
 * Based on Braitenberg's vehicle concepts (Fear, Love, Aggression, Explorer).
 *
 * Features:
 * - Lab Shell UI (sidebar + tabs)
 * - 3D room with table and fish tank
 * - Interactive lamps (drag, double-click to toggle)
 * - Nematode worms with configurable behaviors
 * - Play/pause and reset controls
 */

export const FISH_TANK_LAB_CODE = `
// ╔════════════════════════════════════════════════════════════════════════╗
// ║                                                                         ║
// ║   🐛 FISH TANK LAB - FACULTY CONFIGURATION                             ║
// ║                                                                         ║
// ║   Edit the settings below to customize your lab.                       ║
// ║   The syntax is similar to Python dictionaries!                        ║
// ║                                                                         ║
// ╚════════════════════════════════════════════════════════════════════════╝

const LAB_CONFIG = {
  // ─────────────────────────────────────────────────────────────────────────
  // LAB INFORMATION
  // ─────────────────────────────────────────────────────────────────────────

  title: "Braitenberg Vehicles: Fear vs Love",
  author: "Faculty Name",
  version: "1.0",

  // ─────────────────────────────────────────────────────────────────────────
  // TABS - Define what tabs appear
  // ─────────────────────────────────────────────────────────────────────────

  tabs: [
    {
      name: "Lab Description",
      type: "text",
      content: \`
# Braitenberg Vehicles Lab

## Introduction
In 1984, Valentino Braitenberg described simple vehicles that exhibit
complex behaviors based on how their sensors connect to their motors.

## What You'll Observe

### Vehicle 1: Fear (Tab 2)
Worms with **same-side excitatory** wiring. When light hits the left sensor,
the left motor speeds up. This causes the worm to turn AWAY from light
and speed up - appearing to "fear" the light.

### Vehicle 2: Love (Tab 3)
Worms with **same-side inhibitory** wiring. When light hits a sensor,
that side's motor SLOWS DOWN. This causes the worm to approach light
and rest near it - appearing to "love" the light.

## Instructions
1. Click on the simulation tabs above
2. **Double-click** lamps to turn them on/off
3. **Drag** lamps to move them around
4. Use the control bar to play/pause or reset
5. Observe how worms respond differently to light!

## Key Concepts
- Sensor-motor wiring determines behavior
- Simple rules create complex-looking responses
- No "brain" or planning is needed - just reactive connections
      \`
    },
    {
      name: "Vehicle 1: Fear",
      type: "simulation",
      behavior: "fear",
      description: "Same-side excitatory wiring - worms flee from light"
    },
    {
      name: "Vehicle 2: Love",
      type: "simulation",
      behavior: "love",
      description: "Same-side inhibitory wiring - worms approach light"
    }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // SIMULATION SETTINGS
  // ─────────────────────────────────────────────────────────────────────────

  simulation: {
    // Worm settings
    wormCount: 8,           // Number of worms (1-20)
    wormSpeed: 0.02,        // Base speed (0.01 = slow, 0.05 = fast)
    wormSize: 0.15,         // Body radius
    wormLength: 0.5,        // Body length

    // Lamp settings
    lampCount: 3,           // Number of lamps (1-5)
    lampIntensity: 2.0,     // Light brightness
    lampRange: 4.0,         // How far light reaches

    // Tank dimensions
    tankWidth: 6,           // X axis
    tankDepth: 4,           // Z axis
    tankHeight: 3,          // Y axis (water depth)

    // Physics
    turnSpeed: 0.03,        // How fast worms turn (reduced for smoother motion)
    sensorSpread: 0.3,      // Distance between sensors
    smoothing: 0.08,        // Rotation smoothing factor (lower = smoother)

    // Visual effects
    showBubbles: true,      // Rising bubbles in water
    bubbleCount: 25,        // Number of bubbles
    wormWiggle: true,       // Worms undulate as they swim
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BEHAVIORS - Simple math formulas
  //
  // Variables: L = left sensor (0-1), R = right sensor (0-1)
  // Output: motor speed (higher = faster)
  // ─────────────────────────────────────────────────────────────────────────

  behaviors: {
    fear: {
      name: "Fear (Vehicle 2a)",
      description: "Flees from light",
      leftMotor:  "L * 2 + 0.5",
      rightMotor: "R * 2 + 0.5",
    },
    love: {
      name: "Love (Vehicle 3a)",
      description: "Approaches light",
      leftMotor:  "1.5 - L",
      rightMotor: "1.5 - R",
    },
    aggression: {
      name: "Aggression (Vehicle 2b)",
      description: "Attacks light",
      leftMotor:  "R * 2 + 0.5",
      rightMotor: "L * 2 + 0.5",
    },
    explorer: {
      name: "Explorer (Vehicle 3b)",
      description: "Curious explorer",
      leftMotor:  "1.5 - R",
      rightMotor: "1.5 - L",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COLORS - "Deep Ocean Glow" Bioluminescent Theme
  // ─────────────────────────────────────────────────────────────────────────

  colors: {
    // UI - Dark theme with aqua accents
    background: "#0a0a0f",
    sidebar: "#0d1520",
    tabBar: "#0f1a28",
    tabActive: "#00CED1",
    text: "#e0e0e0",
    textMuted: "#7aa3b8",
    border: "#1a3a4a",

    // 3D Scene - Deep ocean atmosphere
    sceneBackground: 0x0a1628,
    roomFloor: 0x1a2a4a,
    roomWalls: 0x152238,
    tableTop: 0x2d4a6a,
    tankGlass: 0x40e0d0,
    water: 0x00CED1,
    waterEmissive: 0x004455,

    // Worms - Bioluminescent rainbow palette
    wormColors: [
      0xFF6B6B, // Coral red
      0x4ECDC4, // Teal
      0x45B7D1, // Sky blue
      0x96CEB4, // Seafoam
      0xFFEAA7, // Warm yellow
      0xDDA0DD, // Plum
      0x98D8C8, // Mint
      0xF7DC6F, // Golden
      0xBB8FCE, // Lavender
      0x85C1E9, // Light blue
    ],
    wormGlow: 0.3,

    // Lamps - Warm golden glow
    lampOn: 0xFFA500,
    lampOff: 0x333344,

    // Bubbles
    bubbleIridescence: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SIDEBAR
  // ─────────────────────────────────────────────────────────────────────────

  sidebar: {
    buttons: [
      { icon: "info", tooltip: "About", action: "showInfo" },
      { icon: "refresh", tooltip: "Reset All", action: "resetLab", confirmMessage: "Reset the lab?" },
      { icon: "help", tooltip: "Help", action: "showHelp" },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE
  // ─────────────────────────────────────────────────────────────────────────

  mobile: {
    showWarning: true,
    warningMessage: "This 3D lab works best on a computer or tablet with a mouse.",
    allowContinue: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INFO & HELP
  // ─────────────────────────────────────────────────────────────────────────

  infoContent: \`
# About This Lab

**Title:** Braitenberg Vehicles: Fear vs Love
**Based on:** Valentino Braitenberg's "Vehicles" (1984)

## The Science
Braitenberg showed that simple sensor-motor connections can create
complex-seeming behaviors without any central "brain" or planning.

## The Vehicles
- **Fear (2a):** Same-side excitatory - flees from light
- **Love (3a):** Same-side inhibitory - approaches light
- **Aggression (2b):** Crossed excitatory - attacks light
- **Explorer (3b):** Crossed inhibitory - explores curiously
  \`,

  helpContent: \`
# How to Use This Lab

## Controls
- **Orbit Camera:** Click and drag to rotate view
- **Zoom:** Scroll wheel
- **Toggle Lamp:** Double-click a lamp
- **Move Lamp:** Drag a lamp
- **Play/Pause:** Click the play button
- **Reset:** Click the reset button

## Keyboard Shortcuts
- **1-3:** Switch tabs
- **Space:** Play/pause
- **R:** Reset simulation

## Tips
- Start with just one lamp to see clear behavior
- Compare Fear vs Love with same lamp positions
- Watch how worms turn when light is on one side
  \`,
};

// ╔════════════════════════════════════════════════════════════════════════╗
// ║                                                                         ║
// ║   ⚠️  DO NOT EDIT BELOW THIS LINE                                      ║
// ║                                                                         ║
// ╚════════════════════════════════════════════════════════════════════════╝

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Info, RefreshCw, HelpCircle, X, Play, Pause, RotateCcw } from 'lucide-react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────

const ICONS = { info: Info, refresh: RefreshCw, help: HelpCircle };

function evaluateBehavior(formula, L, R) {
  try {
    const expr = formula.replace(/L/g, L.toString()).replace(/R/g, R.toString());
    return Math.max(0, Math.min(3, Function(\'"use strict"; return (' + expr + ')\')()));
  } catch {
    return 1;
  }
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.trim().split('\\n');
  return lines.map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0 0.5rem' }}>{line.slice(2)}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1rem 0 0.5rem' }}>{line.slice(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.75rem 0 0.5rem' }}>{line.slice(4)}</h3>;
    if (line.match(/^[-*] /)) return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{processInline(line.slice(2))}</li>;
    if (line.trim() === '') return <div key={i} style={{ height: '0.5rem' }} />;
    return <p key={i} style={{ margin: '0.5rem 0', lineHeight: 1.6, color: '#888' }}>{processInline(line)}</p>;
  });
}

function processInline(text) {
  return <span dangerouslySetInnerHTML={{ __html: text.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>').replace(/\\*(.+?)\\*/g, '<em>$1</em>') }} />;
}

// ─────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────

function Modal({ title, content, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#111118', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'hidden', border: '1px solid #2a2a35' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #2a2a35' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(80vh - 60px)' }}>{renderMarkdown(content)}</div>
      </div>
    </div>
  );
}

function MobileWarning({ onDismiss }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#111118', borderRadius: '12px', padding: '2rem', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
        <h2>Mobile Device Detected</h2>
        <p style={{ color: '#888', marginBottom: '1.5rem' }}>{LAB_CONFIG.mobile.warningMessage}</p>
        <button onClick={onDismiss} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', cursor: 'pointer' }}>Continue</button>
      </div>
    </div>
  );
}

function Sidebar({ onAction }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ width: '48px', background: '#111118', borderRight: '1px solid #2a2a35', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.5rem', gap: '0.25rem' }}>
      {LAB_CONFIG.sidebar.buttons.map((btn, i) => {
        const Icon = ICONS[btn.icon] || Info;
        return (
          <div key={i} style={{ position: 'relative' }}>
            <button
              onClick={() => onAction(btn)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ width: 36, height: 36, border: 'none', borderRadius: 8, background: hovered === i ? '#6366f1' : 'transparent', color: hovered === i ? 'white' : '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon size={18} />
            </button>
            {hovered === i && <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8, background: '#1a1a22', padding: '0.5rem 0.75rem', borderRadius: 6, fontSize: '0.85rem', whiteSpace: 'nowrap', zIndex: 100 }}>{btn.tooltip}</div>}
          </div>
        );
      })}
    </div>
  );
}

function TabBar({ activeTab, onTabChange }) {
  return (
    <div style={{ display: 'flex', background: '#1a1a22', borderBottom: '1px solid #2a2a35', overflowX: 'auto' }}>
      {LAB_CONFIG.tabs.map((tab, i) => (
        <button key={i} onClick={() => onTabChange(i)} style={{ padding: '0.75rem 1.5rem', border: 'none', background: activeTab === i ? '#6366f1' : 'transparent', color: activeTab === i ? 'white' : '#888', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === i ? 600 : 400, whiteSpace: 'nowrap' }}>{tab.name}</button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 3D SIMULATION COMPONENT
// ─────────────────────────────────────────────────────────────────────────

function Simulation3D({ behavior, isPlaying, onReset }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const wormsRef = useRef([]);
  const lampsRef = useRef([]);
  const animationRef = useRef(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const { simulation, behaviors, colors } = LAB_CONFIG;
    const behaviorConfig = behaviors[behavior] || behaviors.fear;

    // Scene setup - Deep ocean atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.sceneBackground || 0x0a1628);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 8, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting - Ocean-inspired
    const ambient = new THREE.AmbientLight(0x4080a0, 0.6);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xaaccff, 0.5);
    directional.position.set(5, 10, 5);
    scene.add(directional);

    // Underwater glow light (inside tank)
    const underwaterLight = new THREE.PointLight(0x00ffff, 0.4, 10);
    underwaterLight.position.set(0, simulation.tankHeight / 2, 0);
    scene.add(underwaterLight);

    // Room - Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshLambertMaterial({ color: colors.roomFloor });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    scene.add(floor);

    // Table
    const tableGeo = new THREE.BoxGeometry(simulation.tankWidth + 2, 0.3, simulation.tankDepth + 2);
    const tableMat = new THREE.MeshLambertMaterial({ color: colors.tableTop });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.5;
    scene.add(table);

    // Table legs
    for (let x of [-1, 1]) {
      for (let z of [-1, 1]) {
        const legGeo = new THREE.BoxGeometry(0.2, 1.5, 0.2);
        const leg = new THREE.Mesh(legGeo, tableMat);
        leg.position.set(x * (simulation.tankWidth / 2 + 0.5), -1.25, z * (simulation.tankDepth / 2 + 0.5));
        scene.add(leg);
      }
    }

    // Fish tank - glass walls
    const tw = simulation.tankWidth, td = simulation.tankDepth, th = simulation.tankHeight;
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: colors.tankGlass,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    // Tank walls
    const walls = [
      { geo: [tw, th, 0.1], pos: [0, th/2 - 0.35, td/2] },
      { geo: [tw, th, 0.1], pos: [0, th/2 - 0.35, -td/2] },
      { geo: [0.1, th, td], pos: [tw/2, th/2 - 0.35, 0] },
      { geo: [0.1, th, td], pos: [-tw/2, th/2 - 0.35, 0] },
      { geo: [tw, 0.1, td], pos: [0, -0.35, 0] }, // bottom
    ];
    walls.forEach(w => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...w.geo), glassMat);
      mesh.position.set(...w.pos);
      scene.add(mesh);
    });

    // Water - Glowing teal with inner luminosity
    const waterGeo = new THREE.BoxGeometry(tw - 0.2, th - 0.5, td - 0.2);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: colors.water,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      emissive: colors.waterEmissive || 0x004455,
      emissiveIntensity: 0.3,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = th/2 - 0.6;
    scene.add(water);

    // Create bubbles - Iridescent rainbow shimmer
    const bubbles = [];
    if (simulation.showBubbles) {
      const bubbleMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        roughness: 0,
        metalness: colors.bubbleIridescence ? 0.3 : 0,
        iridescence: colors.bubbleIridescence ? 1 : 0,
        iridescenceIOR: 1.3,
      });
      for (let i = 0; i < simulation.bubbleCount; i++) {
        const size = 0.03 + Math.random() * 0.05;
        const bubble = new THREE.Mesh(
          new THREE.SphereGeometry(size, 8, 8),
          bubbleMat
        );
        bubble.position.set(
          (Math.random() - 0.5) * (tw - 0.5),
          -0.3 + Math.random() * (th - 0.5),
          (Math.random() - 0.5) * (td - 0.5)
        );
        scene.add(bubble);
        bubbles.push({
          mesh: bubble,
          speed: 0.01 + Math.random() * 0.02,
          wobbleOffset: Math.random() * Math.PI * 2,
          wobbleSpeed: 1 + Math.random() * 2,
        });
      }
    }

    // Create worms - Bioluminescent rainbow creatures
    const worms = [];
    const wormColorPalette = colors.wormColors || [0xFF6B35];
    for (let i = 0; i < simulation.wormCount; i++) {
      const group = new THREE.Group();
      const segments = [];

      // Pick color from rainbow palette for each worm
      const wormColor = wormColorPalette[i % wormColorPalette.length];

      // Body segments with bioluminescent glow
      const bodyMat = new THREE.MeshStandardMaterial({
        color: wormColor,
        emissive: wormColor,
        emissiveIntensity: colors.wormGlow || 0.25,
        roughness: 0.4,
      });
      for (let s = 0; s < 5; s++) {
        const seg = new THREE.Mesh(
          new THREE.SphereGeometry(simulation.wormSize * (1 - s * 0.12), 8, 8),
          bodyMat
        );
        seg.position.z = -s * simulation.wormSize * 1.4;
        group.add(seg);
        segments.push(seg);
      }

      // Random position in tank
      group.position.set(
        (Math.random() - 0.5) * (tw - 1),
        (Math.random() - 0.3) * (th - 1.5),
        (Math.random() - 0.5) * (td - 1)
      );
      group.rotation.y = Math.random() * Math.PI * 2;

      scene.add(group);
      worms.push({
        mesh: group,
        segments,
        velocity: new THREE.Vector3(0, 0, simulation.wormSpeed),
        sensors: { left: new THREE.Vector3(), right: new THREE.Vector3() },
        wigglePhase: Math.random() * Math.PI * 2,
        wiggleSpeed: 3 + Math.random() * 2,
        targetRotation: group.rotation.y,  // For smooth rotation
        bobPhase: Math.random() * Math.PI * 2,  // For smooth Y bobbing
      });
    }
    wormsRef.current = worms;

    // Create lamps
    const lamps = [];
    for (let i = 0; i < simulation.lampCount; i++) {
      const group = new THREE.Group();

      // Bulb
      const bulbGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const bulbMat = new THREE.MeshBasicMaterial({ color: colors.lampOff });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 0.3;
      group.add(bulb);

      // Stand - Blue-gray to match ocean theme
      const standGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3);
      const standMat = new THREE.MeshLambertMaterial({ color: 0x3a4a5a });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.y = 0.15;
      group.add(stand);

      // Base
      const baseGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05);
      const base = new THREE.Mesh(baseGeo, standMat);
      group.add(base);

      // Point light
      const light = new THREE.PointLight(colors.lampOn, 0, simulation.lampRange);
      light.position.y = 0.3;
      group.add(light);

      // Position around tank edge
      const angle = (i / simulation.lampCount) * Math.PI * 2;
      group.position.set(
        Math.cos(angle) * (tw / 2 + 0.8),
        -0.35,
        Math.sin(angle) * (td / 2 + 0.8)
      );

      scene.add(group);
      lamps.push({
        mesh: group,
        bulb,
        light,
        isOn: false,
      });
    }
    lampsRef.current = lamps;

    // Camera controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = new THREE.Spherical(12, Math.PI / 3, 0);

    const updateCamera = () => {
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const onMouseDown = (e) => {
      // Check if clicking on lamp
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const lampMeshes = lamps.map(l => l.mesh);
      const intersects = raycaster.intersectObjects(lampMeshes, true);

      if (intersects.length > 0) {
        // Clicking on lamp - don't start camera rotation
        return;
      }

      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      spherical.theta -= dx * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2, spherical.phi + dy * 0.01));
      updateCamera();
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    const onWheel = (e) => {
      spherical.radius = Math.max(5, Math.min(20, spherical.radius + e.deltaY * 0.01));
      updateCamera();
    };

    const onDoubleClick = (e) => {
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const lampMeshes = lamps.map(l => l.mesh);
      const intersects = raycaster.intersectObjects(lampMeshes, true);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const lamp = lamps.find(l => l.mesh.children.includes(clickedMesh) || l.mesh === clickedMesh.parent);
        if (lamp) {
          lamp.isOn = !lamp.isOn;
          lamp.bulb.material.color.setHex(lamp.isOn ? colors.lampOn : colors.lampOff);
          lamp.light.intensity = lamp.isOn ? simulation.lampIntensity : 0;
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel);
    container.addEventListener('dblclick', onDoubleClick);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (isPlaying) {
        const activeLamps = lamps.filter(l => l.isOn);

        worms.forEach(worm => {
          const pos = worm.mesh.position;
          const rot = worm.mesh.rotation.y;

          // Calculate sensor positions
          const sensorDist = simulation.sensorSpread;
          worm.sensors.left.set(
            pos.x + Math.sin(rot + 0.5) * sensorDist,
            pos.y,
            pos.z + Math.cos(rot + 0.5) * sensorDist
          );
          worm.sensors.right.set(
            pos.x + Math.sin(rot - 0.5) * sensorDist,
            pos.y,
            pos.z + Math.cos(rot - 0.5) * sensorDist
          );

          // Calculate light intensity at sensors
          let leftLight = 0, rightLight = 0;
          activeLamps.forEach(lamp => {
            const lampPos = lamp.mesh.position;
            const leftDist = worm.sensors.left.distanceTo(lampPos);
            const rightDist = worm.sensors.right.distanceTo(lampPos);
            leftLight += Math.max(0, 1 - leftDist / simulation.lampRange);
            rightLight += Math.max(0, 1 - rightDist / simulation.lampRange);
          });
          leftLight = Math.min(1, leftLight);
          rightLight = Math.min(1, rightLight);

          // Apply behavior
          const leftMotor = evaluateBehavior(behaviorConfig.leftMotor, leftLight, rightLight);
          const rightMotor = evaluateBehavior(behaviorConfig.rightMotor, leftLight, rightLight);

          // Differential steering with smooth rotation
          const avgSpeed = (leftMotor + rightMotor) / 2 * simulation.wormSpeed;
          const turnRate = (rightMotor - leftMotor) * simulation.turnSpeed;

          // Accumulate target rotation and smoothly interpolate
          worm.targetRotation += turnRate;
          const smoothing = simulation.smoothing || 0.08;
          worm.mesh.rotation.y += (worm.targetRotation - worm.mesh.rotation.y) * smoothing;

          pos.x += Math.sin(worm.mesh.rotation.y) * avgSpeed;
          pos.z += Math.cos(worm.mesh.rotation.y) * avgSpeed;

          // Smooth Y bobbing (sine wave instead of random noise)
          worm.bobPhase += 0.02;
          const targetY = Math.sin(worm.bobPhase) * 0.3 + (th / 2 - 0.5);
          pos.y += (targetY - pos.y) * 0.02;

          // Boundary collision with smooth redirection
          const margin = 0.4;
          if (pos.x < -tw/2 + margin) {
            pos.x = -tw/2 + margin;
            worm.targetRotation = Math.abs(worm.targetRotation) < Math.PI/2
              ? Math.PI/4 : Math.PI - Math.PI/4;
          }
          if (pos.x > tw/2 - margin) {
            pos.x = tw/2 - margin;
            worm.targetRotation = Math.abs(worm.targetRotation) < Math.PI/2
              ? -Math.PI/4 : -(Math.PI - Math.PI/4);
          }
          if (pos.z < -td/2 + margin) {
            pos.z = -td/2 + margin;
            worm.targetRotation = worm.targetRotation > 0 ? Math.PI/2 : -Math.PI/2;
          }
          if (pos.z > td/2 - margin) {
            pos.z = td/2 - margin;
            worm.targetRotation = worm.targetRotation > 0 ? Math.PI - Math.PI/2 : -(Math.PI - Math.PI/2);
          }
          if (pos.y < 0.2) pos.y = 0.2;
          if (pos.y > th - 0.8) pos.y = th - 0.8;

          // Worm wiggle animation
          if (simulation.wormWiggle && worm.segments) {
            worm.wigglePhase += 0.1 * worm.wiggleSpeed;
            worm.segments.forEach((seg, idx) => {
              if (idx > 0) {
                const wiggle = Math.sin(worm.wigglePhase - idx * 0.8) * 0.04 * idx;
                seg.position.x = wiggle;
                seg.position.y = Math.sin(worm.wigglePhase * 0.5 - idx * 0.5) * 0.02 * idx;
              }
            });
          }
        });

        // Bubble animation
        bubbles.forEach(bubble => {
          bubble.mesh.position.y += bubble.speed;
          const time = Date.now() * 0.001;
          bubble.mesh.position.x += Math.sin(time * bubble.wobbleSpeed + bubble.wobbleOffset) * 0.002;
          bubble.mesh.position.z += Math.cos(time * bubble.wobbleSpeed + bubble.wobbleOffset) * 0.002;

          // Reset bubble to bottom when it reaches surface
          if (bubble.mesh.position.y > th - 0.5) {
            bubble.mesh.position.y = -0.3;
            bubble.mesh.position.x = (Math.random() - 0.5) * (tw - 0.5);
            bubble.mesh.position.z = (Math.random() - 0.5) * (td - 0.5);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('dblclick', onDoubleClick);
      renderer.dispose();
    };
  }, [behavior, resetKey]);

  useEffect(() => {
    if (onReset) {
      const handler = () => setResetKey(k => k + 1);
      onReset.current = handler;
    }
  }, [onReset]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [modal, setModal] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const resetRef = useRef(null);

  useEffect(() => {
    const check = () => setShowMobileWarning(window.innerWidth < 768 && LAB_CONFIG.mobile.showWarning);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= LAB_CONFIG.tabs.length) setActiveTab(num - 1);
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(p => !p); }
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey) {
        if (resetRef.current) resetRef.current();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleAction = useCallback((btn) => {
    if (btn.confirmMessage && !window.confirm(btn.confirmMessage)) return;
    if (btn.action === 'showInfo') setModal({ title: 'About', content: LAB_CONFIG.infoContent });
    else if (btn.action === 'showHelp') setModal({ title: 'Help', content: LAB_CONFIG.helpContent });
    else if (btn.action === 'resetLab') {
      setActiveTab(0);
      setIsPlaying(true);
      if (resetRef.current) resetRef.current();
    }
  }, []);

  const currentTab = LAB_CONFIG.tabs[activeTab];

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: '#0a0a0f', fontFamily: 'system-ui', color: '#e0e0e0', overflow: 'hidden' }}>
      {showMobileWarning && <MobileWarning onDismiss={() => setShowMobileWarning(false)} />}
      {modal && <Modal title={modal.title} content={modal.content} onClose={() => setModal(null)} />}

      <Sidebar onAction={handleAction} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {currentTab.type === 'text' ? (
            <div style={{ padding: '1.5rem', overflowY: 'auto', height: '100%' }}>
              {renderMarkdown(currentTab.content)}
            </div>
          ) : currentTab.type === 'simulation' ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Control bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#111118', borderBottom: '1px solid #2a2a35' }}>
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: isPlaying ? '#ef4444' : '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={() => resetRef.current && resetRef.current()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#374151', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
                <span style={{ marginLeft: 'auto', color: '#888', fontSize: '0.85rem' }}>
                  {currentTab.description} • Double-click lamps to toggle
                </span>
              </div>
              {/* 3D Scene */}
              <div style={{ flex: 1 }}>
                <Simulation3D behavior={currentTab.behavior} isPlaying={isPlaying} onReset={resetRef} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
`;
