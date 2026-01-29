'use client';

/**
 * Network Diagram
 * SVG visualization of neural network architecture
 * Shows neurons as circles with weight connections
 */

import React, { useMemo } from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { getEnabledFeatureNames } from '@/lib/tensorflow-playground/data/features';

// Layout constants
const NEURON_RADIUS = 18;
const LAYER_SPACING = 120;
const NEURON_SPACING = 50;
const PADDING = 40;

/**
 * Get color for weight visualization
 */
function weightToColor(weight: number): string {
  const absWeight = Math.abs(weight);
  const intensity = Math.min(1, absWeight * 2);

  if (weight >= 0) {
    // Blue for positive
    return `rgba(74, 144, 217, ${0.3 + intensity * 0.7})`;
  } else {
    // Orange for negative
    return `rgba(255, 107, 53, ${0.3 + intensity * 0.7})`;
  }
}

/**
 * Get stroke width for weight
 */
function weightToStrokeWidth(weight: number): number {
  const absWeight = Math.abs(weight);
  return Math.max(1, Math.min(5, absWeight * 3));
}

interface NeuronPosition {
  x: number;
  y: number;
  layerIndex: number;
  neuronIndex: number;
}

export function NetworkDiagram() {
  const { state } = usePlayground();
  const { features, hiddenLayers, networkState } = state;

  // Get input feature labels
  const inputLabels = getEnabledFeatureNames(features);
  const inputCount = inputLabels.length;

  // Calculate layer sizes - memoized to prevent recreation
  const layerSizes = useMemo(
    () => [inputCount, ...hiddenLayers, 1],
    [inputCount, hiddenLayers]
  );

  // Calculate dimensions
  const numLayers = layerSizes.length;
  const maxNeurons = Math.max(...layerSizes);

  const width = (numLayers - 1) * LAYER_SPACING + PADDING * 2;
  const height = (maxNeurons - 1) * NEURON_SPACING + PADDING * 2;

  // Calculate neuron positions
  const positions = useMemo(() => {
    const pos: NeuronPosition[][] = [];

    for (let l = 0; l < numLayers; l++) {
      const layerPos: NeuronPosition[] = [];
      const layerSize = layerSizes[l];
      const layerHeight = (layerSize - 1) * NEURON_SPACING;
      const startY = (height - layerHeight) / 2;

      for (let n = 0; n < layerSize; n++) {
        layerPos.push({
          x: PADDING + l * LAYER_SPACING,
          y: startY + n * NEURON_SPACING,
          layerIndex: l,
          neuronIndex: n,
        });
      }
      pos.push(layerPos);
    }

    return pos;
  }, [numLayers, layerSizes, height]);

  // Draw connections
  const connections = useMemo(() => {
    if (!networkState) return [];

    const lines: React.ReactNode[] = [];
    const weights = networkState.weights;

    for (let l = 0; l < weights.length; l++) {
      const targetLayerIndex = l + 1; // Target is one layer ahead (skip input)
      const sourcePositions = positions[l];
      const targetPositions = positions[targetLayerIndex];

      // Skip if positions don't exist (can happen during layer changes)
      if (!sourcePositions || !targetPositions) continue;

      for (let t = 0; t < weights[l].length; t++) {
        const neuronWeights = weights[l][t];
        const targetPos = targetPositions[t];

        // Skip if target position doesn't exist
        if (!targetPos) continue;

        for (let s = 0; s < neuronWeights.length; s++) {
          const weight = neuronWeights[s];
          const sourcePos = sourcePositions[s];

          // Skip if source position doesn't exist
          if (!sourcePos) continue;

          lines.push(
            <line
              key={`${l}-${t}-${s}`}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke={weightToColor(weight)}
              strokeWidth={weightToStrokeWidth(weight)}
              strokeOpacity={0.8}
            />
          );
        }
      }
    }

    return lines;
  }, [networkState, positions]);

  // Draw neurons
  const neurons = useMemo(() => {
    const nodes: React.ReactNode[] = [];

    for (let l = 0; l < positions.length; l++) {
      for (let n = 0; n < positions[l].length; n++) {
        const pos = positions[l][n];
        const isInput = l === 0;
        const isOutput = l === positions.length - 1;

        // Get activation value if available
        let activation = 0;
        if (networkState && l > 0) {
          const actualLayerIndex = l - 1; // Adjust for input layer
          if (
            networkState.activations[actualLayerIndex] &&
            networkState.activations[actualLayerIndex][n] !== undefined
          ) {
            activation = networkState.activations[actualLayerIndex][n];
          }
        }

        // Color based on activation
        let fillColor = '#1f2937'; // Default dark gray
        if (!isInput && networkState) {
          const intensity = Math.abs(activation);
          if (activation >= 0) {
            fillColor = `rgba(74, 144, 217, ${0.3 + intensity * 0.7})`;
          } else {
            fillColor = `rgba(255, 107, 53, ${0.3 + intensity * 0.7})`;
          }
        }

        nodes.push(
          <g key={`neuron-${l}-${n}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={NEURON_RADIUS}
              fill={fillColor}
              stroke={isOutput ? '#10b981' : '#4b5563'}
              strokeWidth={isOutput ? 3 : 2}
            />
            {/* Input labels */}
            {isInput && (
              <text
                x={pos.x - NEURON_RADIUS - 8}
                y={pos.y + 4}
                textAnchor="end"
                className="text-xs fill-gray-400"
                style={{ fontSize: '11px' }}
              >
                {inputLabels[n]}
              </text>
            )}
            {/* Output label */}
            {isOutput && (
              <text
                x={pos.x + NEURON_RADIUS + 8}
                y={pos.y + 4}
                textAnchor="start"
                className="text-xs fill-gray-400"
                style={{ fontSize: '11px' }}
              >
                Output
              </text>
            )}
          </g>
        );
      }
    }

    return nodes;
  }, [positions, networkState, inputLabels]);

  // Layer labels
  const layerLabels = useMemo(() => {
    const labels: React.ReactNode[] = [];

    // Add "INPUTS" label above first layer
    labels.push(
      <text
        key="input-label"
        x={positions[0][0].x}
        y={20}
        textAnchor="middle"
        className="text-xs fill-gray-500 uppercase"
        style={{ fontSize: '10px', letterSpacing: '0.05em' }}
      >
        Inputs
      </text>
    );

    // Add hidden layer numbers
    for (let l = 1; l < positions.length - 1; l++) {
      labels.push(
        <text
          key={`hidden-${l}`}
          x={positions[l][0].x}
          y={20}
          textAnchor="middle"
          className="text-xs fill-gray-500"
          style={{ fontSize: '10px' }}
        >
          {hiddenLayers[l - 1]} neuron{hiddenLayers[l - 1] !== 1 ? 's' : ''}
        </text>
      );
    }

    // Add "OUTPUT" label
    labels.push(
      <text
        key="output-label"
        x={positions[positions.length - 1][0].x}
        y={20}
        textAnchor="middle"
        className="text-xs fill-gray-500 uppercase"
        style={{ fontSize: '10px', letterSpacing: '0.05em' }}
      >
        Output
      </text>
    );

    return labels;
  }, [positions, hiddenLayers]);

  return (
    <svg
      width={width}
      height={height + 20}
      viewBox={`0 0 ${width} ${height + 20}`}
      className="overflow-visible"
    >
      <g transform="translate(0, 20)">
        {connections}
        {neurons}
      </g>
      {layerLabels}
    </svg>
  );
}
