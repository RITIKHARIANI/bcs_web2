// Playground Builder Type Definitions
// Core types for the interactive educational playground system

export enum PlaygroundCategory {
  NEURAL_NETWORKS = 'neural_networks',
  PHYSICS = 'physics',
  ALGORITHMS = 'algorithms',
  BIOLOGY = 'biology',
  CHEMISTRY = 'chemistry',
  MATHEMATICS = 'mathematics',
  CUSTOM = 'custom',
}

export enum ControlType {
  SLIDER = 'slider',
  DROPDOWN = 'dropdown',
  BUTTON = 'button',
  CHECKBOX = 'checkbox',
  COLOR_PICKER = 'color_picker',
  TEXT_INPUT = 'text_input',
}

export enum VisualizationType {
  CANVAS = 'canvas',
  D3_SVG = 'd3_svg',
  PLOTLY = 'plotly',
  CUSTOM = 'custom',
}

export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  showValue?: boolean;
}

export interface DropdownConfig {
  options: Array<{ label: string; value: any }>;
  defaultValue: any;
}

export interface ButtonConfig {
  action: 'start' | 'stop' | 'reset' | 'custom';
  customAction?: string; // Function name to call
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

export interface CheckboxConfig {
  defaultValue: boolean;
  label: string;
}

export interface ColorPickerConfig {
  defaultValue: string; // hex color
}

export interface TextInputConfig {
  defaultValue: string;
  placeholder?: string;
  maxLength?: number;
}

export type ControlConfigType =
  | SliderConfig
  | DropdownConfig
  | ButtonConfig
  | CheckboxConfig
  | ColorPickerConfig
  | TextInputConfig;

export interface ControlConfig {
  id: string;
  type: ControlType;
  label: string;
  description?: string;

  // Parameter binding - links UI control to code variable
  bindTo: string;

  // Control-specific configuration
  config: ControlConfigType;

  // Layout positioning
  position: { x: number; y: number };
  width?: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  useWebTurtle: boolean;
  useTurtleManager: boolean;
}

export interface D3Config {
  svgWidth: number;
  svgHeight: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export interface PlotlyConfig {
  layout: any; // Plotly layout config
  config: any; // Plotly config
}

export type VisualizationConfigType = CanvasConfig | D3Config | PlotlyConfig;

export interface VisualizationConfig {
  type: VisualizationType;
  config: VisualizationConfigType;
  layout: {
    width: number;
    height: number;
    position: { x: number; y: number };
  };
}

export interface CodeConfig {
  language: 'python' | 'javascript';
  content: string;
  libraries: string[];

  // Auto-conversion settings
  sourceLanguage?: 'tkinter' | 'matlab' | 'processing';
  autoConverted?: boolean;
}

export interface PlaygroundTemplate {
  id: string;
  name: string;
  description: string;
  category: PlaygroundCategory;
  thumbnail: string;

  // Default configuration
  defaultControls: ControlConfig[];
  defaultVisualization: VisualizationConfig;
  codeTemplate: string;

  // Required libraries
  pythonLibraries?: string[];
  jsLibraries?: string[];

  // Metadata
  author?: string;
  version: string;
  tags: string[];
}

export interface Playground {
  id: string;
  title: string;
  description: string;
  category: PlaygroundCategory;

  // Ownership & Permissions
  createdBy: string; // Faculty user ID
  organizationId: string; // BCS organization
  isPublic: boolean;
  shareUrl: string;
  embedCode: string;

  // Template & Configuration
  templateId?: string;
  template?: PlaygroundTemplate;
  controls: ControlConfig[];
  visualization: VisualizationConfig;
  code: CodeConfig;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  version: number;

  // Analytics
  viewCount: number;
  forkCount: number;
  rating?: number;
}

// Builder UI State
export interface BuilderState {
  playground: Playground;
  selectedControl?: ControlConfig;
  previewMode: boolean;
  isDirty: boolean;
}

// Parameter binding system
export interface ParameterBinding {
  controlId: string;
  parameterName: string;
  parameterType: 'number' | 'string' | 'boolean' | 'color';
  transformFunction?: (value: any) => any;
}

// Execution context for playground
export interface PlaygroundExecutionContext {
  parameters: Record<string, any>;
  visualizationElement: HTMLElement;
  onUpdate: (parameters: Record<string, any>) => void;
  onError: (error: Error) => void;
}
