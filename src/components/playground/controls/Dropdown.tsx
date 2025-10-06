"use client";

import React, { useState, useEffect } from 'react';
import { ControlConfig, DropdownConfig } from '@/types/playground';

interface DropdownProps {
  config: ControlConfig;
  value?: any;
  onChange: (value: any) => void;
}

export function Dropdown({ config, value, onChange }: DropdownProps) {
  const dropdownConfig = config.config as DropdownConfig;
  const [currentValue, setCurrentValue] = useState<any>(
    value ?? dropdownConfig.defaultValue
  );

  useEffect(() => {
    if (value !== undefined && value !== currentValue) {
      setCurrentValue(value);
    }
  }, [value, currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    // Try to parse as JSON if it looks like an object/array
    let parsedValue = newValue;
    try {
      parsedValue = JSON.parse(newValue);
    } catch {
      // Keep as string if not valid JSON
    }
    setCurrentValue(parsedValue);
    onChange(parsedValue);
  };

  return (
    <div className="playground-dropdown w-full space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {config.label}
      </label>

      {config.description && (
        <p className="text-xs text-gray-500">{config.description}</p>
      )}

      <select
        value={JSON.stringify(currentValue)}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
                   text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-transparent cursor-pointer"
      >
        {dropdownConfig.options.map((option, index) => (
          <option key={index} value={JSON.stringify(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
