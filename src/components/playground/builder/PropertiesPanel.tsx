"use client";

import React, { useState, useEffect } from 'react';
import { ControlConfig, ControlType, SliderConfig, ButtonConfig, DropdownConfig, CheckboxConfig, ColorPickerConfig, TextInputConfig } from '@/types/playground';
import { X, Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  selectedControl: ControlConfig | null;
  onUpdate: (control: ControlConfig) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function PropertiesPanel({
  selectedControl,
  onUpdate,
  onDelete,
  onClose,
}: PropertiesPanelProps) {
  const [config, setConfig] = useState<ControlConfig | null>(selectedControl);

  useEffect(() => {
    setConfig(selectedControl);
  }, [selectedControl]);

  if (!config) {
    return (
      <div className="properties-panel h-full bg-white border-l border-gray-200 p-6 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-sm">Select a control to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<ControlConfig>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    onUpdate(updated);
  };

  const handleConfigUpdate = (configUpdates: any) => {
    const updated = {
      ...config,
      config: { ...config.config, ...configUpdates },
    };
    setConfig(updated);
    onUpdate(updated);
  };

  const renderTypeSpecificFields = () => {
    switch (config.type) {
      case ControlType.SLIDER:
        const sliderConfig = config.config as SliderConfig;
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Value
              </label>
              <input
                type="number"
                value={sliderConfig.min}
                onChange={(e) => handleConfigUpdate({ min: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Value
              </label>
              <input
                type="number"
                value={sliderConfig.max}
                onChange={(e) => handleConfigUpdate({ max: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Size
              </label>
              <input
                type="number"
                value={sliderConfig.step}
                onChange={(e) => handleConfigUpdate({ step: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Value
              </label>
              <input
                type="number"
                value={sliderConfig.defaultValue}
                onChange={(e) => handleConfigUpdate({ defaultValue: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sliderConfig.showValue ?? true}
                onChange={(e) => handleConfigUpdate({ showValue: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Show Value
              </label>
            </div>
          </>
        );

      case ControlType.BUTTON:
        const buttonConfig = config.config as ButtonConfig;
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={buttonConfig.action}
                onChange={(e) => handleConfigUpdate({ action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="start">Start</option>
                <option value="stop">Stop</option>
                <option value="reset">Reset</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant
              </label>
              <select
                value={buttonConfig.variant || 'primary'}
                onChange={(e) => handleConfigUpdate({ variant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="success">Success</option>
                <option value="danger">Danger</option>
              </select>
            </div>
          </>
        );

      case ControlType.DROPDOWN:
        const dropdownConfig = config.config as DropdownConfig;
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (JSON array)
              </label>
              <textarea
                value={JSON.stringify(dropdownConfig.options, null, 2)}
                onChange={(e) => {
                  try {
                    const options = JSON.parse(e.target.value);
                    handleConfigUpdate({ options });
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
                placeholder='[{"label": "Option 1", "value": "opt1"}]'
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: {`[{"label": "...", "value": "..."}]`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Value
              </label>
              <input
                type="text"
                value={dropdownConfig.defaultValue}
                onChange={(e) => handleConfigUpdate({ defaultValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      case ControlType.CHECKBOX:
        const checkboxConfig = config.config as CheckboxConfig;
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checkboxConfig.defaultValue}
              onChange={(e) => handleConfigUpdate({ defaultValue: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Default Checked
            </label>
          </div>
        );

      case ControlType.COLOR_PICKER:
        const colorConfig = config.config as ColorPickerConfig;
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Color
            </label>
            <input
              type="color"
              value={colorConfig.defaultValue}
              onChange={(e) => handleConfigUpdate({ defaultValue: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        );

      case ControlType.TEXT_INPUT:
        const textConfig = config.config as TextInputConfig;
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={textConfig.placeholder || ''}
                onChange={(e) => handleConfigUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Value
              </label>
              <input
                type="text"
                value={textConfig.defaultValue || ''}
                onChange={(e) => handleConfigUpdate({ defaultValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="properties-panel h-full bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Basic Properties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Control ID
          </label>
          <input
            type="text"
            value={config.id}
            onChange={(e) => handleUpdate({ id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="unique_id"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={config.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Control Label"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            value={config.description || ''}
            onChange={(e) => handleUpdate({ description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of this control"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bind to Parameter
          </label>
          <input
            type="text"
            value={config.bindTo}
            onChange={(e) => handleUpdate({ bindTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="parameter_name"
          />
          <p className="text-xs text-gray-500 mt-1">
            Variable name used in your code
          </p>
        </div>

        {/* Type-Specific Properties */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            {config.type.replace('_', ' ').toUpperCase()} Settings
          </h4>
          <div className="space-y-4">
            {renderTypeSpecificFields()}
          </div>
        </div>

        {/* Delete Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Control
          </button>
        </div>
      </div>
    </div>
  );
}
