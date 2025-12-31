/**
 * Neural Network Lab Template
 *
 * A simple interactive neural network visualization for teaching.
 * Students can click input neurons to send signals through the network.
 *
 * Features:
 * - Lab Shell UI (sidebar + tabs)
 * - Interactive neural network visualization
 * - Animated signal propagation
 * - Configurable network architecture
 */

export const NEURAL_NETWORK_LAB_CODE = `
// ╔════════════════════════════════════════════════════════════════════════╗
// ║                                                                         ║
// ║   🧠 NEURAL NETWORK LAB - FACULTY CONFIGURATION                        ║
// ║                                                                         ║
// ║   Edit the settings below to customize your lab.                       ║
// ║   The syntax is similar to Python dictionaries!                        ║
// ║                                                                         ║
// ╚════════════════════════════════════════════════════════════════════════╝

const LAB_CONFIG = {
  // ─────────────────────────────────────────────────────────────────────────
  // LAB INFORMATION
  // ─────────────────────────────────────────────────────────────────────────

  title: "Simple Neural Network",
  author: "Faculty Name",
  version: "1.0",

  // ─────────────────────────────────────────────────────────────────────────
  // TABS
  // ─────────────────────────────────────────────────────────────────────────

  tabs: [
    {
      name: "Introduction",
      type: "text",
      content: \`
# Neural Networks

## What is a Neural Network?
A neural network is a system of connected nodes (neurons) that process information.
Each connection has a **weight** that determines how much influence one neuron has on another.

## How This Lab Works

### Structure
- **Input Layer** (left): Where signals enter the network
- **Hidden Layers** (middle): Process and transform signals
- **Output Layer** (right): The final result

### Interactions
1. **Click** an input neuron to send a signal
2. Watch the signal **propagate** through the network
3. See how signals **combine** and **activate** neurons

## Key Concepts
- Neurons **activate** when their input exceeds a threshold
- **Weights** (shown by connection thickness) affect signal strength
- Multiple inputs **sum** together before activation
- This is how neural networks "learn" patterns!
      \`
    },
    {
      name: "Network Simulator",
      type: "neural-network"
    }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // NETWORK ARCHITECTURE
  // Just a list of numbers: [inputs, hidden1, hidden2, ..., outputs]
  // Example: [3, 4, 4, 2] = 3 inputs, two hidden layers of 4, 2 outputs
  // ─────────────────────────────────────────────────────────────────────────

  network: {
    layers: [3, 4, 4, 2],
    activation: "sigmoid",    // "sigmoid", "relu", or "tanh"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // VISUAL SETTINGS
  // ─────────────────────────────────────────────────────────────────────────

  display: {
    neuronRadius: 24,
    connectionWidth: 2,
    animationSpeed: 300,      // milliseconds per layer
    showWeights: true,        // Show weight values on hover
    showSignalFlow: true,     // Animated dots on connections
    pulseOnActivate: true,    // Pulse effect on neurons
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COLORS
  // ─────────────────────────────────────────────────────────────────────────

  colors: {
    // UI
    background: "#0a0a0f",
    sidebar: "#111118",
    tabBar: "#1a1a22",
    tabActive: "#6366f1",
    text: "#e0e0e0",
    textMuted: "#888888",
    border: "#2a2a35",

    // Network
    neuronInactive: "#1a1a2e",
    neuronActive: "#6366f1",
    neuronBorder: "#333344",
    neuronActiveBorder: "#818cf8",
    connection: "#2a2a35",
    connectionActive: "#6366f1",
    inputNeuron: "#22c55e",
    outputNeuron: "#f59e0b",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SIDEBAR
  // ─────────────────────────────────────────────────────────────────────────

  sidebar: {
    buttons: [
      { icon: "info", tooltip: "About", action: "showInfo" },
      { icon: "refresh", tooltip: "Reset", action: "resetLab", confirmMessage: "Reset the network?" },
      { icon: "help", tooltip: "Help", action: "showHelp" },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE
  // ─────────────────────────────────────────────────────────────────────────

  mobile: {
    showWarning: true,
    warningMessage: "This lab works best on a computer or tablet.",
    allowContinue: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INFO & HELP
  // ─────────────────────────────────────────────────────────────────────────

  infoContent: \`
# About This Lab

**Title:** Simple Neural Network
**Purpose:** Visualize how signals propagate through a neural network

## The Science
Neural networks are computational models inspired by biological brains.
They learn by adjusting the weights of connections between neurons.

## This Simulation
- Shows a feedforward neural network
- Demonstrates signal propagation
- Weights are randomly initialized
- Click inputs to see activation patterns
  \`,

  helpContent: \`
# How to Use This Lab

## Interactions
- **Click** any input neuron (green, left side) to send a signal
- **Watch** the signal propagate through the network
- **Hover** over connections to see weights

## Controls
- **Reset:** Click the reset button to clear all activations
- **1-2:** Number keys switch tabs

## Understanding the Display
- **Circle color:** Darker = inactive, Purple = active
- **Line thickness:** Thicker = stronger weight
- **Green neurons:** Input layer
- **Yellow neurons:** Output layer
  \`,
};

// ╔════════════════════════════════════════════════════════════════════════╗
// ║                                                                         ║
// ║   ⚠️  DO NOT EDIT BELOW THIS LINE                                      ║
// ║                                                                         ║
// ╚════════════════════════════════════════════════════════════════════════╝

import { useState, useEffect, useCallback, useRef } from 'react';
import { Info, RefreshCw, HelpCircle, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────

const ICONS = { info: Info, refresh: RefreshCw, help: HelpCircle };

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

// Activation functions
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function relu(x) { return Math.max(0, x); }
function tanh(x) { return Math.tanh(x); }

const activationFunctions = { sigmoid, relu, tanh };

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
// NEURAL NETWORK VISUALIZATION
// ─────────────────────────────────────────────────────────────────────────

function NeuralNetworkViz({ onReset }) {
  const { network, display, colors } = LAB_CONFIG;
  const { layers } = network;
  const svgRef = useRef(null);

  const [activations, setActivations] = useState(() =>
    layers.map(size => new Array(size).fill(0))
  );
  const [weights, setWeights] = useState(() => {
    // Initialize random weights between layers
    const w = [];
    for (let i = 0; i < layers.length - 1; i++) {
      const layerWeights = [];
      for (let j = 0; j < layers[i]; j++) {
        const neuronWeights = [];
        for (let k = 0; k < layers[i + 1]; k++) {
          neuronWeights.push((Math.random() - 0.5) * 2);
        }
        layerWeights.push(neuronWeights);
      }
      w.push(layerWeights);
    }
    return w;
  });
  const [animatingLayers, setAnimatingLayers] = useState(new Set());
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [signalFlows, setSignalFlows] = useState([]);
  const [pulsingNeurons, setPulsingNeurons] = useState([]);
  const animationFrameRef = useRef(null);

  // Calculate positions
  const padding = 80;
  const width = 600;
  const height = 400;

  const getNeuronPos = (layerIndex, neuronIndex) => {
    const layerX = padding + (layerIndex / (layers.length - 1)) * (width - 2 * padding);
    const layerSize = layers[layerIndex];
    const spacing = Math.min(80, (height - 2 * padding) / layerSize);
    const layerHeight = (layerSize - 1) * spacing;
    const startY = (height - layerHeight) / 2;
    const neuronY = startY + neuronIndex * spacing;
    return { x: layerX, y: neuronY };
  };

  // Propagate signal with visual effects
  const propagateSignal = useCallback((layerIndex, neuronIndex) => {
    const activate = activationFunctions[network.activation] || sigmoid;

    // Trigger pulse effect on clicked neuron
    if (display.pulseOnActivate) {
      const pos = getNeuronPos(layerIndex, neuronIndex);
      setPulsingNeurons(prev => [...prev, { x: pos.x, y: pos.y, id: Date.now() }]);
    }

    // Set input neuron active
    setActivations(prev => {
      const next = prev.map(l => [...l]);
      next[layerIndex][neuronIndex] = 1;
      return next;
    });
    setAnimatingLayers(prev => new Set([...prev, layerIndex]));

    // Propagate through layers
    let currentLayer = layerIndex;
    const propagateNext = () => {
      if (currentLayer >= layers.length - 1) {
        setTimeout(() => {
          setAnimatingLayers(new Set());
          setSignalFlows([]);
        }, display.animationSpeed);
        return;
      }

      // Create signal flows for active connections
      if (display.showSignalFlow) {
        const newFlows = [];
        for (let i = 0; i < layers[currentLayer]; i++) {
          for (let j = 0; j < layers[currentLayer + 1]; j++) {
            const pos1 = getNeuronPos(currentLayer, i);
            const pos2 = getNeuronPos(currentLayer + 1, j);
            newFlows.push({
              id: \`\${currentLayer}-\${i}-\${j}-\${Date.now()}\`,
              x1: pos1.x, y1: pos1.y,
              x2: pos2.x, y2: pos2.y,
              progress: 0,
            });
          }
        }
        setSignalFlows(newFlows);

        // Animate the flows
        let progress = 0;
        const animateFlows = () => {
          progress += 0.05;
          if (progress <= 1) {
            setSignalFlows(flows => flows.map(f => ({ ...f, progress })));
            animationFrameRef.current = requestAnimationFrame(animateFlows);
          }
        };
        animateFlows();
      }

      setTimeout(() => {
        setActivations(prev => {
          const next = prev.map(l => [...l]);

          // Calculate activations for next layer
          for (let j = 0; j < layers[currentLayer + 1]; j++) {
            let sum = 0;
            for (let i = 0; i < layers[currentLayer]; i++) {
              sum += next[currentLayer][i] * weights[currentLayer][i][j];
            }
            const activation = activate(sum);
            next[currentLayer + 1][j] = activation;

            // Trigger pulse on activated neurons
            if (display.pulseOnActivate && activation > 0.3) {
              const pos = getNeuronPos(currentLayer + 1, j);
              setPulsingNeurons(prev => [...prev, { x: pos.x, y: pos.y, id: Date.now() + j }]);
            }
          }

          return next;
        });

        setAnimatingLayers(prev => new Set([...prev, currentLayer + 1]));
        currentLayer++;
        propagateNext();
      }, display.animationSpeed);
    };

    propagateNext();
  }, [layers, weights, network.activation, display.animationSpeed, display.showSignalFlow, display.pulseOnActivate]);

  // Reset handler
  useEffect(() => {
    if (onReset) {
      onReset.current = () => {
        setActivations(layers.map(size => new Array(size).fill(0)));
        setAnimatingLayers(new Set());
        setSignalFlows([]);
        setPulsingNeurons([]);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [onReset, layers]);

  // Clean up pulses after animation
  useEffect(() => {
    if (pulsingNeurons.length > 0) {
      const timer = setTimeout(() => {
        setPulsingNeurons([]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pulsingNeurons]);

  // Clear activations after animation
  useEffect(() => {
    const hasActive = activations.some(l => l.some(v => v > 0));
    if (hasActive && animatingLayers.size === 0) {
      const timer = setTimeout(() => {
        setActivations(layers.map(size => new Array(size).fill(0)));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activations, animatingLayers, layers]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ marginBottom: '1rem', color: '#888', fontSize: '0.9rem' }}>
        Click any <span style={{ color: colors.inputNeuron }}>green input neuron</span> to send a signal
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ background: colors.background, borderRadius: '12px', border: \`1px solid \${colors.border}\` }}
      >
        {/* Connections */}
        {layers.map((layerSize, layerIndex) => {
          if (layerIndex === layers.length - 1) return null;
          const connections = [];

          for (let i = 0; i < layerSize; i++) {
            for (let j = 0; j < layers[layerIndex + 1]; j++) {
              const pos1 = getNeuronPos(layerIndex, i);
              const pos2 = getNeuronPos(layerIndex + 1, j);
              const weight = weights[layerIndex][i][j];
              const isActive = activations[layerIndex][i] > 0.1 && activations[layerIndex + 1][j] > 0.1;
              const isHovered = hoveredConnection?.layer === layerIndex && hoveredConnection?.from === i && hoveredConnection?.to === j;

              connections.push(
                <g key={\`\${layerIndex}-\${i}-\${j}\`}>
                  <line
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    stroke={isActive ? colors.connectionActive : colors.connection}
                    strokeWidth={Math.abs(weight) * 2 + (isHovered ? 2 : 0)}
                    strokeOpacity={isActive ? 0.8 : 0.3}
                    style={{ transition: 'all 0.3s' }}
                    onMouseEnter={() => setHoveredConnection({ layer: layerIndex, from: i, to: j })}
                    onMouseLeave={() => setHoveredConnection(null)}
                  />
                  {isHovered && display.showWeights && (
                    <text
                      x={(pos1.x + pos2.x) / 2}
                      y={(pos1.y + pos2.y) / 2 - 5}
                      fill={colors.text}
                      fontSize="11"
                      textAnchor="middle"
                    >
                      w={weight.toFixed(2)}
                    </text>
                  )}
                </g>
              );
            }
          }
          return connections;
        })}

        {/* Signal flow dots */}
        {display.showSignalFlow && signalFlows.map(flow => {
          const x = flow.x1 + (flow.x2 - flow.x1) * flow.progress;
          const y = flow.y1 + (flow.y2 - flow.y1) * flow.progress;
          return (
            <circle
              key={flow.id}
              cx={x}
              cy={y}
              r={4}
              fill={colors.connectionActive}
              opacity={Math.sin(flow.progress * Math.PI)}
            />
          );
        })}

        {/* Neurons */}
        {layers.map((layerSize, layerIndex) =>
          Array.from({ length: layerSize }).map((_, neuronIndex) => {
            const pos = getNeuronPos(layerIndex, neuronIndex);
            const activation = activations[layerIndex][neuronIndex];
            const isInput = layerIndex === 0;
            const isOutput = layerIndex === layers.length - 1;
            const isActive = activation > 0.1;

            let fillColor = colors.neuronInactive;
            if (isActive) {
              fillColor = colors.neuronActive;
            } else if (isInput) {
              fillColor = colors.inputNeuron + '44';
            } else if (isOutput) {
              fillColor = colors.outputNeuron + '44';
            }

            let strokeColor = colors.neuronBorder;
            if (isActive) {
              strokeColor = colors.neuronActiveBorder;
            } else if (isInput) {
              strokeColor = colors.inputNeuron;
            } else if (isOutput) {
              strokeColor = colors.outputNeuron;
            }

            return (
              <g key={\`\${layerIndex}-\${neuronIndex}\`}>
                {/* Glow for active neurons */}
                {isActive && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={display.neuronRadius + 8}
                    fill={colors.neuronActive}
                    opacity={0.3}
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={display.neuronRadius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={2}
                  style={{
                    cursor: isInput ? 'pointer' : 'default',
                    transition: 'all 0.3s',
                  }}
                  onClick={() => {
                    if (isInput) {
                      propagateSignal(layerIndex, neuronIndex);
                    }
                  }}
                />
                {/* Activation value */}
                {isActive && (
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    fill="white"
                    fontSize="11"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {activation.toFixed(1)}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Pulse effects */}
        {display.pulseOnActivate && pulsingNeurons.map(pulse => (
          <circle
            key={pulse.id}
            cx={pulse.x}
            cy={pulse.y}
            r={display.neuronRadius}
            fill="none"
            stroke={colors.neuronActive}
            strokeWidth={3}
            opacity={0}
            style={{
              animation: 'pulse 0.6s ease-out forwards',
            }}
          />
        ))}

        {/* Layer labels */}
        <text x={padding} y={height - 15} fill={colors.textMuted} fontSize="12" textAnchor="middle">Input</text>
        <text x={width - padding} y={height - 15} fill={colors.textMuted} fontSize="12" textAnchor="middle">Output</text>
        {layers.length > 2 && (
          <text x={width / 2} y={height - 15} fill={colors.textMuted} fontSize="12" textAnchor="middle">Hidden</text>
        )}

        {/* CSS Animation for pulse */}
        <defs>
          <style>
            {\`
              @keyframes pulse {
                0% { r: \${display.neuronRadius}; opacity: 0.8; stroke-width: 3; }
                100% { r: \${display.neuronRadius + 20}; opacity: 0; stroke-width: 1; }
              }
            \`}
          </style>
        </defs>
      </svg>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', color: '#666', fontSize: '0.8rem' }}>
        <span>Layers: {layers.join(' → ')}</span>
        <span>Activation: {network.activation}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [modal, setModal] = useState(null);
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

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {currentTab.type === 'text' ? (
            <div style={{ padding: '1.5rem', overflowY: 'auto', height: '100%' }}>
              {renderMarkdown(currentTab.content)}
            </div>
          ) : currentTab.type === 'neural-network' ? (
            <NeuralNetworkViz onReset={resetRef} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
`;
