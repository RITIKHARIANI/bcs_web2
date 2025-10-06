"use client";

import React, { useState, useRef } from 'react';
import { Playground, ControlConfig, VisualizationConfig, CodeConfig, ControlType, PlaygroundCategory, VisualizationType } from '@/types/playground';
import { ControlPalette } from '@/components/playground/builder/ControlPalette';
import { BuilderCanvas } from '@/components/playground/builder/BuilderCanvas';
import { PropertiesPanel } from '@/components/playground/builder/PropertiesPanel';
import { CodeEditor } from '@/components/playground/builder/CodeEditor';
import { VisualizationConfigPanel } from '@/components/playground/builder/VisualizationConfig';
import { PlaygroundRenderer } from '@/components/playground/PlaygroundRenderer';
import { Save, Eye, EyeOff, Settings, Code, Layout, FileText } from 'lucide-react';

type BuilderTab = 'layout' | 'code' | 'visualization' | 'metadata';

export default function PlaygroundBuilderPage() {
  const [activeTab, setActiveTab] = useState<BuilderTab>('layout');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);

  // Playground State
  const [playground, setPlayground] = useState<Playground>({
    id: '',
    title: 'New Playground',
    description: '',
    category: PlaygroundCategory.ALGORITHMS,
    createdBy: '',
    organizationId: '',
    isPublic: false,
    shareUrl: '',
    embedCode: '',
    controls: [],
    visualization: {
      type: VisualizationType.CANVAS,
      config: {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        useWebTurtle: false,
        useTurtleManager: false,
      },
      layout: {
        width: 800,
        height: 600,
        position: { x: 0, y: 0 },
      },
    },
    code: {
      language: 'python',
      content: '# Write your code here\n',
      libraries: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    viewCount: 0,
    forkCount: 0,
  });

  // Control Management
  const handleControlAdd = (control: ControlConfig) => {
    setPlayground(prev => ({
      ...prev,
      controls: [...prev.controls, control],
    }));
  };

  const handleControlUpdate = (updatedControl: ControlConfig) => {
    setPlayground(prev => ({
      ...prev,
      controls: prev.controls.map(c =>
        c.id === updatedControl.id ? updatedControl : c
      ),
    }));
  };

  const handleControlDelete = (controlId: string) => {
    setPlayground(prev => ({
      ...prev,
      controls: prev.controls.filter(c => c.id !== controlId),
    }));
    setSelectedControlId(null);
  };

  const handleControlMove = (controlId: string, position: { x: number; y: number }) => {
    setPlayground(prev => ({
      ...prev,
      controls: prev.controls.map(c =>
        c.id === controlId ? { ...c, position } : c
      ),
    }));
  };

  // Code Management
  const handleCodeUpdate = (codeConfig: CodeConfig) => {
    setPlayground(prev => ({
      ...prev,
      code: codeConfig,
    }));
  };

  // Visualization Management
  const handleVisualizationUpdate = (visualizationConfig: VisualizationConfig) => {
    setPlayground(prev => ({
      ...prev,
      visualization: visualizationConfig,
    }));
  };

  // Metadata Management
  const handleMetadataUpdate = (updates: Partial<Playground>) => {
    setPlayground(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Save Playground
  const handleSave = async () => {
    console.log('Saving playground:', playground);
    // TODO: Implement API call to save playground
    alert('Playground saved! (API integration pending)');
  };

  // Test Run
  const handleTestRun = () => {
    setShowPreview(true);
  };

  const selectedControl = playground.controls.find(c => c.id === selectedControlId) || null;

  const tabs = [
    { id: 'layout' as BuilderTab, label: 'Layout', icon: Layout },
    { id: 'code' as BuilderTab, label: 'Code', icon: Code },
    { id: 'visualization' as BuilderTab, label: 'Visualization', icon: Settings },
    { id: 'metadata' as BuilderTab, label: 'Metadata', icon: FileText },
  ];

  return (
    <div className="playground-builder h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Playground Builder</h1>
          <input
            type="text"
            value={playground.title}
            onChange={(e) => handleMetadataUpdate({ title: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
            placeholder="Playground Title"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Playground
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Control Palette (only in layout tab) */}
        {activeTab === 'layout' && (
          <div className="w-64 bg-white border-r border-gray-200">
            <ControlPalette onControlSelect={(type) => {
              // Create new control at center of canvas
              const newControl: ControlConfig = {
                id: `${type}_${Date.now()}`,
                type,
                label: `New ${type.replace('_', ' ')}`,
                bindTo: `param_${Date.now()}`,
                config: getDefaultConfig(type),
                position: { x: 100, y: 100 },
              };
              handleControlAdd(newControl);
              setSelectedControlId(newControl.id);
            }} />
          </div>
        )}

        {/* Center - Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 px-4">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors
                               ${activeTab === tab.id
                                 ? 'border-blue-500 text-blue-600'
                                 : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'layout' && (
              <BuilderCanvas
                controls={playground.controls}
                selectedControlId={selectedControlId}
                onControlAdd={handleControlAdd}
                onControlUpdate={handleControlUpdate}
                onControlSelect={setSelectedControlId}
                onControlMove={handleControlMove}
              />
            )}

            {activeTab === 'code' && (
              <CodeEditor
                codeConfig={playground.code}
                onUpdate={handleCodeUpdate}
                onTest={handleTestRun}
              />
            )}

            {activeTab === 'visualization' && (
              <div className="p-6 overflow-y-auto bg-white">
                <VisualizationConfigPanel
                  config={playground.visualization}
                  onUpdate={handleVisualizationUpdate}
                />
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="p-6 overflow-y-auto bg-white">
                <div className="max-w-2xl space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={playground.title}
                      onChange={(e) => handleMetadataUpdate({ title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={playground.description}
                      onChange={(e) => handleMetadataUpdate({ description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe what this playground demonstrates..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={playground.category}
                      onChange={(e) => handleMetadataUpdate({ category: e.target.value as PlaygroundCategory })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.values(PlaygroundCategory).map((category) => (
                        <option key={category} value={category}>
                          {category.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={playground.isPublic}
                      onChange={(e) => handleMetadataUpdate({ isPublic: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Make this playground public
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties Panel (only in layout tab) */}
        {activeTab === 'layout' && (
          <div className="w-80 bg-white border-l border-gray-200">
            <PropertiesPanel
              selectedControl={selectedControl}
              onUpdate={handleControlUpdate}
              onDelete={() => selectedControlId && handleControlDelete(selectedControlId)}
              onClose={() => setSelectedControlId(null)}
            />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <EyeOff className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <PlaygroundRenderer playground={playground} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for default configs
function getDefaultConfig(type: ControlType): any {
  switch (type) {
    case ControlType.SLIDER:
      return { min: 0, max: 100, step: 1, defaultValue: 50, showValue: true };
    case ControlType.BUTTON:
      return { action: 'custom', variant: 'primary' };
    case ControlType.DROPDOWN:
      return {
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' },
        ],
        defaultValue: 'opt1',
      };
    case ControlType.CHECKBOX:
      return { defaultValue: false };
    case ControlType.COLOR_PICKER:
      return { defaultValue: '#3b82f6' };
    case ControlType.TEXT_INPUT:
      return { placeholder: 'Enter text...', defaultValue: '' };
    default:
      return {};
  }
}
