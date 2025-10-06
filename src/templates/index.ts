// Playground Template Registry
// Central registry for all playground templates

import { PlaygroundTemplate, PlaygroundCategory } from '@/types/playground';
import { braitenbergVehiclesTemplate } from './braitenberg-vehicles';
// Import other templates as they're created
// import { neuralNetworkTemplate } from './neural-network';
// import { physicsProjectileTemplate } from './physics-projectile';

/**
 * Template Registry
 * All available playground templates
 */
export const TEMPLATE_REGISTRY: Record<string, PlaygroundTemplate> = {
  'braitenberg-vehicles': braitenbergVehiclesTemplate,
  // Add more templates here as they're created
  // 'neural-network': neuralNetworkTemplate,
  // 'physics-projectile': physicsProjectileTemplate,
};

/**
 * Get template by ID
 */
export function getTemplate(id: string): PlaygroundTemplate | undefined {
  return TEMPLATE_REGISTRY[id];
}

/**
 * Get all templates
 */
export function getAllTemplates(): PlaygroundTemplate[] {
  return Object.values(TEMPLATE_REGISTRY);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: PlaygroundCategory): PlaygroundTemplate[] {
  return getAllTemplates().filter(template => template.category === category);
}

/**
 * Search templates
 */
export function searchTemplates(query: string): PlaygroundTemplate[] {
  const lowerQuery = query.toLowerCase();
  return getAllTemplates().filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
