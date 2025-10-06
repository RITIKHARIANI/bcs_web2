"use client";

import React from 'react';
import { ControlType } from '@/types/playground';
import {
  Sliders,
  Square,
  ChevronDown,
  CheckSquare,
  Palette,
  Type
} from 'lucide-react';

interface ControlPaletteProps {
  onControlSelect: (controlType: ControlType) => void;
}

const AVAILABLE_CONTROLS = [
  {
    type: ControlType.SLIDER,
    label: 'Slider',
    icon: Sliders,
    description: 'Numeric range control',
    color: 'bg-blue-500',
  },
  {
    type: ControlType.BUTTON,
    label: 'Button',
    icon: Square,
    description: 'Action trigger',
    color: 'bg-green-500',
  },
  {
    type: ControlType.DROPDOWN,
    label: 'Dropdown',
    icon: ChevronDown,
    description: 'Select from options',
    color: 'bg-purple-500',
  },
  {
    type: ControlType.CHECKBOX,
    label: 'Checkbox',
    icon: CheckSquare,
    description: 'Boolean toggle',
    color: 'bg-orange-500',
  },
  {
    type: ControlType.COLOR_PICKER,
    label: 'Color Picker',
    icon: Palette,
    description: 'Color selection',
    color: 'bg-pink-500',
  },
  {
    type: ControlType.TEXT_INPUT,
    label: 'Text Input',
    icon: Type,
    description: 'Text entry field',
    color: 'bg-indigo-500',
  },
];

export function ControlPalette({ onControlSelect }: ControlPaletteProps) {
  const handleDragStart = (e: React.DragEvent, controlType: ControlType) => {
    e.dataTransfer.setData('controlType', controlType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="control-palette h-full bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Controls</h3>
        <p className="text-xs text-gray-500 mt-1">
          Drag controls to the builder canvas
        </p>
      </div>

      <div className="space-y-2">
        {AVAILABLE_CONTROLS.map((control) => {
          const IconComponent = control.icon;
          return (
            <div
              key={control.type}
              draggable
              onDragStart={(e) => handleDragStart(e, control.type)}
              onClick={() => onControlSelect(control.type)}
              className="control-palette-item group cursor-move bg-gray-50 hover:bg-gray-100
                         border border-gray-200 rounded-lg p-3 transition-all duration-200
                         hover:shadow-md hover:border-gray-300"
            >
              <div className="flex items-start gap-3">
                <div className={`${control.color} p-2 rounded-md text-white
                                 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-800">
                    {control.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {control.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1.5">
          <li>• Drag controls to the canvas</li>
          <li>• Click to configure properties</li>
          <li>• Bind controls to code parameters</li>
          <li>• Preview updates in real-time</li>
        </ul>
      </div>
    </div>
  );
}
