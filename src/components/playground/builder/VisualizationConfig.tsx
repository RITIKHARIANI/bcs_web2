"use client";

import React from 'react';
import { VisualizationConfig, VisualizationType } from '@/types/playground';
import { Monitor, BarChart3, Activity } from 'lucide-react';

interface VisualizationConfigProps {
  config: VisualizationConfig;
  onUpdate: (config: VisualizationConfig) => void;
}

export function VisualizationConfigPanel({ config, onUpdate }: VisualizationConfigProps) {
  const handleTypeChange = (type: VisualizationType) => {
    let newConfig: any = {};

    switch (type) {
      case 'canvas':
        newConfig = {
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
        };
        break;
      case 'd3_svg':
        newConfig = {
          width: 800,
          height: 600,
        };
        break;
      case 'plotly':
        newConfig = {
          width: 800,
          height: 600,
        };
        break;
    }

    onUpdate({
      type,
      config: newConfig,
      layout: {
        width: 800,
        height: 600,
        position: { x: 0, y: 0 },
      },
    });
  };

  const handleConfigUpdate = (updates: any) => {
    onUpdate({
      ...config,
      config: { ...config.config, ...updates },
    });
  };

  const renderTypeSpecificSettings = () => {
    switch (config.type) {
      case 'canvas':
        const canvasConfig = config.config as any;
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={canvasConfig.width || 800}
                  onChange={(e) => handleConfigUpdate({ width: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={canvasConfig.height || 600}
                  onChange={(e) => handleConfigUpdate({ height: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={canvasConfig.backgroundColor || '#ffffff'}
                  onChange={(e) => handleConfigUpdate({ backgroundColor: e.target.value })}
                  className="w-20 h-10 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={canvasConfig.backgroundColor || '#ffffff'}
                  onChange={(e) => handleConfigUpdate({ backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={canvasConfig.useTurtleManager || false}
                  onChange={(e) => handleConfigUpdate({ useTurtleManager: e.target.checked, useWebTurtle: false })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Use TurtleManager (multi-turtle)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={canvasConfig.useWebTurtle || false}
                  onChange={(e) => handleConfigUpdate({ useWebTurtle: e.target.checked, useTurtleManager: false })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Use WebTurtle (single turtle)
                </label>
              </div>
            </div>
          </>
        );

      case 'd3_svg':
      case 'plotly':
        const chartConfig = config.config as any;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                value={chartConfig.width || 800}
                onChange={(e) => handleConfigUpdate({ width: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                value={chartConfig.height || 600}
                onChange={(e) => handleConfigUpdate({ height: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const visualizationTypes = [
    {
      type: 'canvas' as VisualizationType,
      label: 'Canvas',
      description: 'HTML5 Canvas for graphics',
      icon: Monitor,
      color: 'bg-blue-500',
    },
    {
      type: 'd3_svg' as VisualizationType,
      label: 'D3.js SVG',
      description: 'Data visualization with D3',
      icon: BarChart3,
      color: 'bg-purple-500',
    },
    {
      type: 'plotly' as VisualizationType,
      label: 'Plotly',
      description: 'Interactive plots',
      icon: Activity,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="visualization-config space-y-6">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Visualization Type
        </label>
        <div className="grid grid-cols-1 gap-3">
          {visualizationTypes.map((vizType) => {
            const IconComponent = vizType.icon;
            const isSelected = config.type === vizType.type;

            return (
              <button
                key={vizType.type}
                onClick={() => handleTypeChange(vizType.type)}
                className={`p-4 rounded-lg border-2 transition-all text-left
                           ${isSelected
                             ? 'border-blue-500 bg-blue-50'
                             : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${vizType.color} p-2 rounded-md text-white`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{vizType.label}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{vizType.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      ✓
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Type-Specific Settings */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Settings</h4>
        <div className="space-y-4">
          {renderTypeSpecificSettings()}
        </div>
      </div>
    </div>
  );
}
