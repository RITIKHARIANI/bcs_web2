"use client";

import React from 'react';
import { ControlConfig, ButtonConfig } from '@/types/playground';

interface ButtonProps {
  config: ControlConfig;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export function Button({ config, onClick, variant = 'primary' }: ButtonProps) {
  const buttonConfig = config.config as ButtonConfig;

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  // Auto-detect variant based on action
  const autoVariant =
    buttonConfig.action === 'start'
      ? 'success'
      : buttonConfig.action === 'stop'
      ? 'danger'
      : buttonConfig.action === 'reset'
      ? 'secondary'
      : variant;

  return (
    <div className="playground-button">
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${variantClasses[autoVariant]}`}
        title={config.description}
      >
        {config.label}
      </button>
      {config.description && (
        <p className="text-xs text-gray-500 mt-1">{config.description}</p>
      )}
    </div>
  );
}
