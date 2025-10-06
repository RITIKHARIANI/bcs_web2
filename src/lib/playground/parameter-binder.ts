// Parameter Binding Engine
// Connects UI controls to code parameters with type-safe conversion

import { ControlConfig, ParameterBinding } from '@/types/playground';

export class ParameterBinder {
  private parameters: Map<string, any> = new Map();
  private bindings: Map<string, ParameterBinding> = new Map();
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  /**
   * Register a parameter binding
   */
  registerBinding(binding: ParameterBinding): void {
    this.bindings.set(binding.controlId, binding);

    // Initialize parameter with default value if not exists
    if (!this.parameters.has(binding.parameterName)) {
      this.parameters.set(binding.parameterName, null);
    }
  }

  /**
   * Set parameter value from control
   */
  setParameterFromControl(controlId: string, value: any): void {
    const binding = this.bindings.get(controlId);
    if (!binding) {
      console.warn(`No binding found for control: ${controlId}`);
      return;
    }

    // Apply transformation if provided
    const transformedValue = binding.transformFunction
      ? binding.transformFunction(value)
      : value;

    // Type conversion
    const typedValue = this.convertType(
      transformedValue,
      binding.parameterType
    );

    // Update parameter
    this.parameters.set(binding.parameterName, typedValue);

    // Notify listeners
    this.notifyListeners(binding.parameterName, typedValue);
  }

  /**
   * Get parameter value
   */
  getParameter(parameterName: string): any {
    return this.parameters.get(parameterName);
  }

  /**
   * Get all parameters as object
   */
  getAllParameters(): Record<string, any> {
    const params: Record<string, any> = {};
    this.parameters.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * Set parameter directly (not from control)
   */
  setParameter(parameterName: string, value: any): void {
    this.parameters.set(parameterName, value);
    this.notifyListeners(parameterName, value);
  }

  /**
   * Subscribe to parameter changes
   */
  onParameterChange(
    parameterName: string,
    callback: (value: any) => void
  ): () => void {
    if (!this.listeners.has(parameterName)) {
      this.listeners.set(parameterName, new Set());
    }
    this.listeners.get(parameterName)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(parameterName)?.delete(callback);
    };
  }

  /**
   * Subscribe to all parameter changes
   */
  onAnyParameterChange(
    callback: (params: Record<string, any>) => void
  ): () => void {
    const unsubscribers: Array<() => void> = [];

    this.parameters.forEach((_, parameterName) => {
      const unsubscribe = this.onParameterChange(parameterName, () => {
        callback(this.getAllParameters());
      });
      unsubscribers.push(unsubscribe);
    });

    // Return unsubscribe function for all
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  /**
   * Clear all parameters and bindings
   */
  clear(): void {
    this.parameters.clear();
    this.bindings.clear();
    this.listeners.clear();
  }

  /**
   * Initialize bindings from control configs
   */
  initializeFromControls(controls: ControlConfig[]): void {
    controls.forEach((control) => {
      const binding: ParameterBinding = {
        controlId: control.id,
        parameterName: control.bindTo,
        parameterType: this.inferParameterType(control),
      };

      this.registerBinding(binding);

      // Set initial value from control config
      const initialValue = this.getInitialValueFromControl(control);
      if (initialValue !== undefined) {
        this.setParameterFromControl(control.id, initialValue);
      }
    });
  }

  /**
   * Convert value to specified type
   */
  private convertType(value: any, type: ParameterBinding['parameterType']): any {
    switch (type) {
      case 'number':
        return typeof value === 'number' ? value : parseFloat(value);
      case 'string':
        return String(value);
      case 'boolean':
        return Boolean(value);
      case 'color':
        return String(value); // Color is stored as string (hex/rgb)
      default:
        return value;
    }
  }

  /**
   * Infer parameter type from control config
   */
  private inferParameterType(
    control: ControlConfig
  ): ParameterBinding['parameterType'] {
    switch (control.type) {
      case 'slider':
        return 'number';
      case 'checkbox':
        return 'boolean';
      case 'color_picker':
        return 'color';
      case 'text_input':
      case 'dropdown':
      default:
        return 'string';
    }
  }

  /**
   * Get initial value from control config
   */
  private getInitialValueFromControl(control: ControlConfig): any {
    const config = control.config as any;
    return config.defaultValue;
  }

  /**
   * Notify all listeners for a parameter
   */
  private notifyListeners(parameterName: string, value: any): void {
    const listeners = this.listeners.get(parameterName);
    if (listeners) {
      listeners.forEach((callback) => callback(value));
    }
  }

  /**
   * Create Python globals dict from parameters
   */
  toPythonGlobals(): string {
    const params = this.getAllParameters();
    const pythonDict: string[] = [];

    Object.entries(params).forEach(([key, value]) => {
      let pythonValue: string;

      if (typeof value === 'string') {
        pythonValue = `'${value.replace(/'/g, "\\'")}'`;
      } else if (typeof value === 'boolean') {
        pythonValue = value ? 'True' : 'False';
      } else if (value === null || value === undefined) {
        pythonValue = 'None';
      } else {
        pythonValue = String(value);
      }

      pythonDict.push(`    '${key}': ${pythonValue}`);
    });

    return `params = {\n${pythonDict.join(',\n')}\n}`;
  }

  /**
   * Create JavaScript object from parameters
   */
  toJavaScriptObject(): string {
    const params = this.getAllParameters();
    return `const params = ${JSON.stringify(params, null, 2)};`;
  }
}

// Singleton instance for global use
export const globalParameterBinder = new ParameterBinder();
