/**
 * Experiment Template
 *
 * A minimal blank template for faculty to create custom experiments.
 * Provides the Lab Shell structure with placeholder content.
 */

export const EXPERIMENT_CODE = `
// ╔════════════════════════════════════════════════════════════════════════╗
// ║                                                                         ║
// ║   🔬 EXPERIMENT TEMPLATE - FACULTY CONFIGURATION                       ║
// ║                                                                         ║
// ║   Edit the settings below to create your custom experiment.            ║
// ║   This is a blank template - customize it for your needs!              ║
// ║                                                                         ║
// ╚════════════════════════════════════════════════════════════════════════╝

const LAB_CONFIG = {
  // ─────────────────────────────────────────────────────────────────────────
  // LAB INFORMATION - Edit these to describe your experiment
  // ─────────────────────────────────────────────────────────────────────────

  title: "My Experiment",
  author: "Your Name",
  version: "1.0",

  // ─────────────────────────────────────────────────────────────────────────
  // TABS - Add your content here
  //
  // Tab types:
  //   "text" - Markdown content (instructions, explanations)
  //   "canvas" - Empty canvas for custom content
  // ─────────────────────────────────────────────────────────────────────────

  tabs: [
    {
      name: "Instructions",
      type: "text",
      content: \`
# My Experiment

## Overview
Describe your experiment here. Use markdown formatting:
- **Bold text** for emphasis
- *Italic text* for terms
- Lists for instructions

## Instructions
1. First step
2. Second step
3. Third step

## Background
Add any background information your students need to understand the experiment.

## Questions to Consider
- What do you expect to observe?
- Why might this happen?
      \`
    },
    {
      name: "Experiment",
      type: "canvas",
      width: 800,
      height: 500,
      background: "#1a1a2e",
      // Add your custom content by editing the TabContent component below
    }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // SIDEBAR BUTTONS
  // Available icons: "info", "refresh", "help", "settings"
  // ─────────────────────────────────────────────────────────────────────────

  sidebar: {
    buttons: [
      { icon: "info", tooltip: "About", action: "showInfo" },
      { icon: "refresh", tooltip: "Reset", action: "resetLab", confirmMessage: "Reset the experiment?" },
      { icon: "help", tooltip: "Help", action: "showHelp" },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COLORS - Customize the appearance
  // ─────────────────────────────────────────────────────────────────────────

  colors: {
    background: "#0a0a0f",
    sidebar: "#111118",
    tabBar: "#1a1a22",
    tabActive: "#6366f1",
    text: "#e0e0e0",
    textMuted: "#888888",
    border: "#2a2a35",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE
  // ─────────────────────────────────────────────────────────────────────────

  mobile: {
    showWarning: true,
    warningMessage: "This experiment works best on a larger screen.",
    allowContinue: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INFO & HELP CONTENT
  // ─────────────────────────────────────────────────────────────────────────

  infoContent: \`
# About This Experiment

**Title:** My Experiment
**Author:** Your Name

## Description
Add a description of your experiment here.

## Learning Objectives
- Objective 1
- Objective 2
- Objective 3
  \`,

  helpContent: \`
# Help

## How to Use This Experiment
1. Read the Instructions tab first
2. Click the Experiment tab to begin
3. Follow the on-screen prompts

## Tips
- Take notes as you go
- Try different approaches
- Ask questions!
  \`,
};

// ╔════════════════════════════════════════════════════════════════════════╗
// ║                                                                         ║
// ║   ⚠️  DO NOT EDIT BELOW THIS LINE (unless adding custom content)       ║
// ║                                                                         ║
// ╚════════════════════════════════════════════════════════════════════════╝

import { useState, useEffect, useCallback, useRef } from 'react';
import { Info, RefreshCw, HelpCircle, X } from 'lucide-react';

const ICONS = { info: Info, refresh: RefreshCw, help: HelpCircle };

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.trim().split('\\n');
  return lines.map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0 0.5rem' }}>{line.slice(2)}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1rem 0 0.5rem' }}>{line.slice(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.75rem 0 0.5rem' }}>{line.slice(4)}</h3>;
    if (line.match(/^[-*] /)) return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{processInline(line.slice(2))}</li>;
    if (line.match(/^\\d+\\. /)) return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem', listStyleType: 'decimal' }}>{processInline(line.replace(/^\\d+\\.\\s*/, ''))}</li>;
    if (line.trim() === '') return <div key={i} style={{ height: '0.5rem' }} />;
    return <p key={i} style={{ margin: '0.5rem 0', lineHeight: 1.6, color: '#888' }}>{processInline(line)}</p>;
  });
}

function processInline(text) {
  return <span dangerouslySetInnerHTML={{ __html: text.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>').replace(/\\*(.+?)\\*/g, '<em>$1</em>') }} />;
}

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
// CUSTOM CANVAS CONTENT
// Edit this component to add your experiment's interactive content
// ─────────────────────────────────────────────────────────────────────────

function ExperimentCanvas({ tab }) {
  const canvasRef = useRef(null);
  const [clickCount, setClickCount] = useState(0);

  // Example: A simple interactive demo
  // Replace this with your actual experiment content

  return (
    <div style={{
      width: tab.width || 800,
      height: tab.height || 500,
      background: tab.background || '#1a1a2e',
      borderRadius: '8px',
      border: '1px solid #2a2a35',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
    }}>
      <div style={{ fontSize: '4rem' }}>🔬</div>
      <h2 style={{ margin: 0, color: '#e0e0e0' }}>Experiment Canvas</h2>
      <p style={{ color: '#888', textAlign: 'center', maxWidth: '400px' }}>
        This is a blank canvas for your experiment.
        Edit the ExperimentCanvas component in the code to add your interactive content.
      </p>

      {/* Example interactive element */}
      <button
        onClick={() => setClickCount(c => c + 1)}
        style={{
          padding: '1rem 2rem',
          fontSize: '1rem',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Click Me ({clickCount})
      </button>

      <p style={{ color: '#666', fontSize: '0.85rem' }}>
        Replace this placeholder with your experiment controls
      </p>
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
      // Add your reset logic here
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
          ) : currentTab.type === 'canvas' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
              <ExperimentCanvas tab={currentTab} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
`;
