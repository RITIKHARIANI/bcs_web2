/**
 * Lab Shell Template
 *
 * A reusable UI framework providing:
 * - Left sidebar (40px) with icon buttons
 * - Top tab navigation with state persistence
 * - Scrollable main content area
 * - Mobile detection with warning banner
 *
 * Faculty edit the LAB_CONFIG at the top, the engine code below renders the lab.
 */

export const LAB_SHELL_CODE = `
// ╔════════════════════════════════════════════════════════════════════════╗
// ║                                                                         ║
// ║   🧪 LAB SHELL TEMPLATE - FACULTY CONFIGURATION                        ║
// ║                                                                         ║
// ║   Edit the settings below to customize your lab.                       ║
// ║   The syntax is similar to Python dictionaries!                        ║
// ║                                                                         ║
// ╚════════════════════════════════════════════════════════════════════════╝

const LAB_CONFIG = {
  // ─────────────────────────────────────────────────────────────────────────
  // LAB INFORMATION
  // ─────────────────────────────────────────────────────────────────────────

  title: "My Lab Template",
  author: "Faculty Name",
  version: "1.0",

  // ─────────────────────────────────────────────────────────────────────────
  // TABS - Define your tabs here
  // Types: "text" (markdown content), "canvas" (empty canvas for custom content)
  // ─────────────────────────────────────────────────────────────────────────

  tabs: [
    {
      name: "Introduction",
      type: "text",
      content: \`
# Welcome to the Lab

## Overview
This is a template for creating interactive educational labs.

## Instructions
1. Click on the tabs above to navigate
2. Use the sidebar buttons for actions
3. Explore and learn!

## Getting Started
Edit the LAB_CONFIG at the top of this file to customize:
- Tab names and content
- Sidebar buttons
- Colors and styling
      \`
    },
    {
      name: "Tab 2",
      type: "text",
      content: \`
# Second Tab

This is the second tab. You can add your content here.

Replace this with your own educational content!
      \`
    },
    {
      name: "Tab 3",
      type: "canvas",
      width: 800,
      height: 600,
      background: "#1a1a2e",
    }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // SIDEBAR BUTTONS
  // Available icons: "info", "refresh", "help", "settings", "home", "play"
  // ─────────────────────────────────────────────────────────────────────────

  sidebar: {
    buttons: [
      {
        icon: "info",
        tooltip: "About this lab",
        action: "showInfo",
      },
      {
        icon: "refresh",
        tooltip: "Reset lab",
        action: "resetLab",
        confirmMessage: "Reset the lab? All progress will be lost.",
      },
      {
        icon: "help",
        tooltip: "Help",
        action: "showHelp",
      },
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
    tabInactive: "#333340",
    text: "#e0e0e0",
    textMuted: "#888888",
    border: "#2a2a35",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE SETTINGS
  // ─────────────────────────────────────────────────────────────────────────

  mobile: {
    showWarning: true,
    warningMessage: "This lab works best on a computer or tablet.",
    allowContinue: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INFO MODAL - Shown when clicking the info button
  // ─────────────────────────────────────────────────────────────────────────

  infoContent: \`
# About This Lab

**Title:** My Lab Template
**Version:** 1.0
**Author:** Faculty Name

## Description
This is a template for creating interactive educational labs.
Customize it by editing the LAB_CONFIG at the top of the code.

## Credits
Built with the BCS Lab Framework.
  \`,

  // ─────────────────────────────────────────────────────────────────────────
  // HELP MODAL - Shown when clicking the help button
  // ─────────────────────────────────────────────────────────────────────────

  helpContent: \`
# Help

## Navigation
- Click tabs to switch between sections
- Use sidebar buttons for actions

## Tips
- The lab state is preserved when switching tabs
- Click the reset button to start over

## Keyboard Shortcuts
- Press 1-9 to switch tabs
- Press R to reset
  \`,
};

// ╔════════════════════════════════════════════════════════════════════════╗
// ║                                                                         ║
// ║   ⚠️  DO NOT EDIT BELOW THIS LINE                                      ║
// ║                                                                         ║
// ║   The code below reads your configuration and creates the lab.         ║
// ║   You don't need to understand or modify it.                           ║
// ║                                                                         ║
// ╚════════════════════════════════════════════════════════════════════════╝

import { useState, useEffect, useCallback, useRef } from 'react';
import { Info, RefreshCw, HelpCircle, Settings, Home, Play, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────
// ICON MAPPING
// ─────────────────────────────────────────────────────────────────────────

const ICONS = {
  info: Info,
  refresh: RefreshCw,
  help: HelpCircle,
  settings: Settings,
  home: Home,
  play: Play,
};

// ─────────────────────────────────────────────────────────────────────────
// SIMPLE MARKDOWN RENDERER
// ─────────────────────────────────────────────────────────────────────────

function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.trim().split('\\n');
  const elements = [];
  let currentList = [];
  let listType = null;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={\`list-\${elements.length}\`} style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          {currentList.map((item, i) => (
            <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    // Headers
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={index} style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0 0.5rem', color: LAB_CONFIG.colors.text }}>
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1rem 0 0.5rem', color: LAB_CONFIG.colors.text }}>
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.75rem 0 0.5rem', color: LAB_CONFIG.colors.text }}>
          {line.substring(4)}
        </h3>
      );
    }
    // List items
    else if (line.match(/^\\s*[-*]\\s+/)) {
      const content = line.replace(/^\\s*[-*]\\s+/, '');
      currentList.push(renderInlineMarkdown(content));
    }
    // Numbered list
    else if (line.match(/^\\s*\\d+\\.\\s+/)) {
      const content = line.replace(/^\\s*\\d+\\.\\s+/, '');
      currentList.push(renderInlineMarkdown(content));
    }
    // Empty line
    else if (line.trim() === '') {
      flushList();
      elements.push(<div key={index} style={{ height: '0.5rem' }} />);
    }
    // Regular paragraph
    else {
      flushList();
      elements.push(
        <p key={index} style={{ margin: '0.5rem 0', lineHeight: '1.6', color: LAB_CONFIG.colors.textMuted }}>
          {renderInlineMarkdown(line)}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

function renderInlineMarkdown(text) {
  // Bold
  text = text.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
  // Code
  text = text.replace(/\`(.+?)\`/g, '<code style="background: #2a2a35; padding: 0.1rem 0.3rem; border-radius: 3px; font-family: monospace;">$1</code>');

  return <span dangerouslySetInnerHTML={{ __html: text }} />;
}

// ─────────────────────────────────────────────────────────────────────────
// MOBILE WARNING COMPONENT
// ─────────────────────────────────────────────────────────────────────────

function MobileWarning({ onDismiss }) {
  const { mobile, colors } = LAB_CONFIG;

  if (!mobile.showWarning) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        background: colors.sidebar,
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '400px',
        textAlign: 'center',
        border: \`1px solid \${colors.border}\`,
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
        <h2 style={{ color: colors.text, marginBottom: '1rem' }}>Mobile Device Detected</h2>
        <p style={{ color: colors.textMuted, marginBottom: '1.5rem' }}>
          {mobile.warningMessage}
        </p>
        {mobile.allowContinue && (
          <button
            onClick={onDismiss}
            style={{
              background: colors.tabActive,
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Continue Anyway
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MODAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────

function Modal({ title, content, onClose }) {
  const { colors } = LAB_CONFIG;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        background: colors.sidebar,
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'hidden',
        border: \`1px solid \${colors.border}\`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: \`1px solid \${colors.border}\`,
        }}>
          <h2 style={{ margin: 0, color: colors.text }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textMuted,
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          maxHeight: 'calc(80vh - 60px)',
        }}>
          {renderMarkdown(content)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SIDEBAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────

function Sidebar({ onAction }) {
  const { sidebar, colors } = LAB_CONFIG;
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div style={{
      width: '48px',
      background: colors.sidebar,
      borderRight: \`1px solid \${colors.border}\`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '0.5rem',
      gap: '0.25rem',
    }}>
      {sidebar.buttons.map((button, index) => {
        const IconComponent = ICONS[button.icon] || Info;
        const isHovered = hoveredButton === index;

        return (
          <div key={index} style={{ position: 'relative' }}>
            <button
              onClick={() => onAction(button)}
              onMouseEnter={() => setHoveredButton(index)}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                width: '36px',
                height: '36px',
                border: 'none',
                borderRadius: '8px',
                background: isHovered ? colors.tabActive : 'transparent',
                color: isHovered ? 'white' : colors.textMuted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <IconComponent size={18} />
            </button>
            {isHovered && button.tooltip && (
              <div style={{
                position: 'absolute',
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginLeft: '8px',
                background: colors.tabBar,
                color: colors.text,
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                zIndex: 100,
                border: \`1px solid \${colors.border}\`,
              }}>
                {button.tooltip}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// TAB BAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────

function TabBar({ activeTab, onTabChange }) {
  const { tabs, colors } = LAB_CONFIG;

  return (
    <div style={{
      display: 'flex',
      background: colors.tabBar,
      borderBottom: \`1px solid \${colors.border}\`,
      overflowX: 'auto',
    }}>
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => onTabChange(index)}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === index ? colors.tabActive : 'transparent',
            color: activeTab === index ? 'white' : colors.textMuted,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === index ? '600' : '400',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            borderBottom: activeTab === index ? \`2px solid \${colors.tabActive}\` : '2px solid transparent',
          }}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// TAB CONTENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────

function TabContent({ tab, isActive }) {
  const { colors } = LAB_CONFIG;
  const canvasRef = useRef(null);

  if (!isActive) {
    return <div style={{ display: 'none' }} />;
  }

  if (tab.type === 'text') {
    return (
      <div style={{
        padding: '1.5rem',
        overflowY: 'auto',
        height: '100%',
      }}>
        {renderMarkdown(tab.content)}
      </div>
    );
  }

  if (tab.type === 'canvas') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        overflow: 'auto',
        padding: '1rem',
      }}>
        <div
          ref={canvasRef}
          style={{
            width: tab.width || 800,
            height: tab.height || 600,
            background: tab.background || colors.sidebar,
            borderRadius: '8px',
            border: \`1px solid \${colors.border}\`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textMuted,
          }}
        >
          Canvas Area ({tab.width || 800} × {tab.height || 600})
        </div>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN LAB SHELL COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export default function App() {
  const { tabs, colors, infoContent, helpContent } = LAB_CONFIG;
  const [activeTab, setActiveTab] = useState(0);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [modal, setModal] = useState(null);
  const [tabStates, setTabStates] = useState({});

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setShowMobileWarning(isMobile && LAB_CONFIG.mobile.showWarning);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Number keys for tab switching
      const num = parseInt(e.key);
      if (num >= 1 && num <= tabs.length) {
        setActiveTab(num - 1);
      }
      // R for reset
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        handleAction({ action: 'resetLab', confirmMessage: 'Reset the lab?' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs.length]);

  const handleAction = useCallback((button) => {
    if (button.confirmMessage) {
      if (!window.confirm(button.confirmMessage)) return;
    }

    switch (button.action) {
      case 'showInfo':
        setModal({ title: 'About', content: infoContent });
        break;
      case 'showHelp':
        setModal({ title: 'Help', content: helpContent });
        break;
      case 'resetLab':
        setActiveTab(0);
        setTabStates({});
        break;
      default:
        console.log('Action:', button.action);
    }
  }, [infoContent, helpContent]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      background: colors.background,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: colors.text,
      overflow: 'hidden',
    }}>
      {/* Mobile Warning */}
      {showMobileWarning && (
        <MobileWarning onDismiss={() => setShowMobileWarning(false)} />
      )}

      {/* Modal */}
      {modal && (
        <Modal
          title={modal.title}
          content={modal.content}
          onClose={() => setModal(null)}
        />
      )}

      {/* Sidebar */}
      <Sidebar onAction={handleAction} />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Tab Bar */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {tabs.map((tab, index) => (
            <TabContent
              key={index}
              tab={tab}
              isActive={index === activeTab}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
`;
