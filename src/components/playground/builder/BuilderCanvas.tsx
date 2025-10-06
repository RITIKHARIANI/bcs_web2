"use client";

import React, { useState } from 'react';
import { ControlConfig, ControlType } from '@/types/playground';
import { Grip, Settings } from 'lucide-react';

interface BuilderCanvasProps {
  controls: ControlConfig[];
  selectedControlId: string | null;
  onControlAdd: (control: ControlConfig) => void;
  onControlUpdate: (control: ControlConfig) => void;
  onControlSelect: (controlId: string | null) => void;
  onControlMove: (controlId: string, position: { x: number; y: number }) => void;
}

export function BuilderCanvas({
  controls,
  selectedControlId,
  onControlAdd,
  onControlUpdate,
  onControlSelect,
  onControlMove,
}: BuilderCanvasProps) {
  const [draggedControlId, setDraggedControlId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const controlType = e.dataTransfer.getData('controlType') as ControlType;

    if (controlType) {
      // Calculate position relative to canvas
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create new control with default config
      const newControl: ControlConfig = {
        id: `${controlType}_${Date.now()}`,
        type: controlType,
        label: `New ${controlType.replace('_', ' ')}`,
        bindTo: `param_${Date.now()}`,
        config: getDefaultConfig(controlType),
        position: { x, y },
      };

      onControlAdd(newControl);
      onControlSelect(newControl.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleControlDragStart = (e: React.DragEvent, controlId: string) => {
    const control = controls.find(c => c.id === controlId);
    if (!control) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggedControlId(controlId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleControlDrag = (e: React.DragEvent) => {
    if (!draggedControlId || e.clientX === 0 && e.clientY === 0) return;

    const canvas = document.getElementById('builder-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    onControlMove(draggedControlId, { x, y });
  };

  const handleControlDragEnd = () => {
    setDraggedControlId(null);
  };

  const getDefaultConfig = (type: ControlType): any => {
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
  };

  const renderControlPreview = (control: ControlConfig) => {
    const isSelected = control.id === selectedControlId;

    return (
      <div
        key={control.id}
        draggable
        onDragStart={(e) => handleControlDragStart(e, control.id)}
        onDrag={handleControlDrag}
        onDragEnd={handleControlDragEnd}
        onClick={(e) => {
          e.stopPropagation();
          onControlSelect(control.id);
        }}
        className={`absolute cursor-move transition-all duration-200
                   ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-2 hover:ring-gray-300'}
                   bg-white rounded-lg border border-gray-200 p-3 min-w-[200px]`}
        style={{
          left: `${control.position.x}px`,
          top: `${control.position.y}px`,
        }}
      >
        {/* Drag Handle */}
        <div className="absolute -left-8 top-0 h-full flex items-center">
          <div className="p-2 bg-gray-100 rounded-l-md border border-r-0 border-gray-200">
            <Grip className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Control Preview */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">{control.label}</span>
          <Settings className="w-4 h-4 text-gray-400" />
        </div>

        {control.description && (
          <p className="text-xs text-gray-500 mb-2">{control.description}</p>
        )}

        {/* Type-specific preview */}
        <div className="text-xs text-gray-400 bg-gray-50 rounded px-2 py-1">
          {control.type.replace('_', ' ')} → {control.bindTo}
        </div>
      </div>
    );
  };

  return (
    <div
      id="builder-canvas"
      className="builder-canvas relative h-full bg-gray-50 overflow-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => onControlSelect(null)}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Empty State */}
      {controls.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium mb-2">Drop controls here</p>
            <p className="text-sm">Drag controls from the palette to get started</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="relative p-8">
        {controls.map(renderControlPreview)}
      </div>
    </div>
  );
}
