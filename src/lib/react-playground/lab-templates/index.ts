/**
 * Lab Templates Index
 *
 * Exports all lab templates with their configurations.
 * These templates use the configuration-driven approach for faculty
 * who are familiar with Python but not JavaScript/React.
 */

import type { PlaygroundTemplate } from '@/types/react-playground';
import { LAB_SHELL_CODE } from './lab-shell';
import { FISH_TANK_LAB_CODE } from './fish-tank-lab';
import { NEURAL_NETWORK_LAB_CODE } from './neural-network-lab';
import { EXPERIMENT_CODE } from './experiment';

// Lab Shell Template
export const LAB_SHELL_TEMPLATE: PlaygroundTemplate = {
  id: 'lab-shell',
  name: 'Lab Shell Framework',
  description: 'Reusable UI framework with sidebar, tabs, and scrollable content - base for all labs',
  category: 'tutorials',
  tags: ['framework', 'shell', 'tabs', 'lab', 'template'],
  dependencies: ['lucide-react'],
  isPublic: true,
  sourceCode: LAB_SHELL_CODE,
};

// Fish Tank Lab Template
export const FISH_TANK_LAB_TEMPLATE: PlaygroundTemplate = {
  id: 'fish-tank-lab',
  name: 'Fish Tank Lab (Braitenberg)',
  description: '3D simulation of nematodes in a fish tank responding to light - demonstrates Fear vs Love behaviors',
  category: 'simulations',
  tags: ['3d', 'braitenberg', 'vehicles', 'simulation', 'lab', 'three.js', 'nematodes'],
  dependencies: ['three', 'lucide-react'],
  isPublic: true,
  sourceCode: FISH_TANK_LAB_CODE,
};

// Neural Network Lab Template
export const NEURAL_NETWORK_LAB_TEMPLATE: PlaygroundTemplate = {
  id: 'neural-network-lab',
  name: 'Neural Network Lab',
  description: 'Interactive neural network visualization - click input neurons to see signal propagation',
  category: 'neural-networks',
  tags: ['neural', 'network', 'lab', 'interactive', 'visualization', 'educational'],
  dependencies: ['lucide-react'],
  isPublic: true,
  sourceCode: NEURAL_NETWORK_LAB_CODE,
};

// Experiment Template
export const EXPERIMENT_TEMPLATE: PlaygroundTemplate = {
  id: 'experiment-lab',
  name: 'Experiment Template',
  description: 'Blank lab template for creating custom experiments - includes Lab Shell structure',
  category: 'other',
  tags: ['experiment', 'blank', 'template', 'lab', 'starter'],
  dependencies: ['lucide-react'],
  isPublic: true,
  sourceCode: EXPERIMENT_CODE,
};

// Export all lab templates as an array
export const LAB_TEMPLATES: PlaygroundTemplate[] = [
  LAB_SHELL_TEMPLATE,
  FISH_TANK_LAB_TEMPLATE,
  NEURAL_NETWORK_LAB_TEMPLATE,
  EXPERIMENT_TEMPLATE,
];

// Re-export individual template codes for direct access
export { LAB_SHELL_CODE } from './lab-shell';
export { FISH_TANK_LAB_CODE } from './fish-tank-lab';
export { NEURAL_NETWORK_LAB_CODE } from './neural-network-lab';
export { EXPERIMENT_CODE } from './experiment';
