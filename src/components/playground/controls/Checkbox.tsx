"use client";

import React, { useState, useEffect } from 'react';
import { ControlConfig, CheckboxConfig } from '@/types/playground';

interface CheckboxProps {
  config: ControlConfig;
  value?: boolean;
  onChange: (value: boolean) => void;
}

export function Checkbox({ config, value, onChange }: CheckboxProps) {
  const checkboxConfig = config.config as CheckboxConfig;
  const [isChecked, setIsChecked] = useState<boolean>(
    value ?? checkboxConfig.defaultValue
  );

  useEffect(() => {
    if (value !== undefined && value !== isChecked) {
      setIsChecked(value);
    }
  }, [value, isChecked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsChecked(newValue);
    onChange(newValue);
  };

  return (
    <div className="playground-checkbox flex items-start space-x-3">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded
                     focus:ring-blue-500 focus:ring-2 cursor-pointer"
        />
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 cursor-pointer">
          {config.label}
        </label>
        {config.description && (
          <p className="text-xs text-gray-500 mt-1">{config.description}</p>
        )}
      </div>
    </div>
  );
}
