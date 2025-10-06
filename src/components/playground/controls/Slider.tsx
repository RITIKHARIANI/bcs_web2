"use client";

import React, { useState, useEffect } from 'react';
import { ControlConfig, SliderConfig } from '@/types/playground';

interface SliderProps {
  config: ControlConfig;
  value?: number;
  onChange: (value: number) => void;
}

export function Slider({ config, value, onChange }: SliderProps) {
  const sliderConfig = config.config as SliderConfig;
  const [currentValue, setCurrentValue] = useState<number>(
    value ?? sliderConfig.defaultValue
  );

  useEffect(() => {
    if (value !== undefined && value !== currentValue) {
      setCurrentValue(value);
    }
  }, [value, currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setCurrentValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="playground-slider w-full space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          {config.label}
        </label>
        <span className="text-sm font-semibold text-blue-600">
          {currentValue}
          {sliderConfig.unit && (
            <span className="text-xs text-gray-500 ml-1">
              {sliderConfig.unit}
            </span>
          )}
        </span>
      </div>

      {config.description && (
        <p className="text-xs text-gray-500">{config.description}</p>
      )}

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{sliderConfig.min}</span>
        <input
          type="range"
          min={sliderConfig.min}
          max={sliderConfig.max}
          step={sliderConfig.step}
          value={currentValue}
          onChange={handleChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-400">{sliderConfig.max}</span>
      </div>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #2563eb;
          border-radius: 50%;
          cursor: pointer;
        }

        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #2563eb;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        input[type='range']::-webkit-slider-runnable-track {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
        }

        input[type='range']::-moz-range-track {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
