'use client';

/**
 * Learning Controls
 * Learning rate, regularization type and rate
 */

import React from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import {
  LEARNING_RATES,
  REGULARIZATION_RATES,
  RegularizationType,
} from '@/lib/tensorflow-playground/types';

const REGULARIZATION_TYPES: { type: RegularizationType; label: string }[] = [
  { type: 'none', label: 'None' },
  { type: 'l1', label: 'L1' },
  { type: 'l2', label: 'L2' },
];

export function LearningControls() {
  const { state, dispatch } = usePlayground();

  const handleLearningRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_LEARNING_RATE', rate: parseFloat(e.target.value) });
  };

  const handleRegularizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: 'SET_REGULARIZATION',
      regularization: e.target.value as RegularizationType,
    });
  };

  const handleRegularizationRateChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch({
      type: 'SET_REGULARIZATION_RATE',
      rate: parseFloat(e.target.value),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Learning Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-2">
          Learning Rate
        </label>
        <select
          value={state.learningRate}
          onChange={handleLearningRateChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
        >
          {LEARNING_RATES.map((rate) => (
            <option key={rate} value={rate}>
              {rate}
            </option>
          ))}
        </select>
      </div>

      {/* Regularization Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-2">
          Regularization
        </label>
        <select
          value={state.regularization}
          onChange={handleRegularizationChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
        >
          {REGULARIZATION_TYPES.map(({ type, label }) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Regularization Rate */}
      {state.regularization !== 'none' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-2">
            Regularization Rate
          </label>
          <select
            value={state.regularizationRate}
            onChange={handleRegularizationRateChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {REGULARIZATION_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
