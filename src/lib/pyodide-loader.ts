// Pyodide CDN Loader - Loads Pyodide dynamically to avoid bundle bloat
// Supports multiple CDN fallbacks and caching for optimal performance

interface PyodideInterface {
  loadPackage: (packages: string[] | string) => Promise<void>;
  runPython: (code: string) => any;
  runPythonAsync: (code: string) => Promise<any>;
  globals: any;
  FS: any;
  loadPackagesFromImports: (code: string) => Promise<void>;
  registerJsModule: (name: string, module: any) => void;
  unpackArchive: (buffer: ArrayBuffer, format: string, options?: any) => void;
  toPy: (obj: any) => any;
  isPyProxy: (obj: any) => boolean;
}

declare global {
  interface Window {
    loadPyodide: (config?: any) => Promise<PyodideInterface>;
    pyodide: PyodideInterface;
  }
}

// CDN URLs for Pyodide (ordered by preference)
const PYODIDE_CDN_URLS = [
  'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
  'https://unpkg.com/pyodide@0.24.1/dist/',
  'https://cdnjs.cloudflare.com/ajax/libs/pyodide/0.24.1/',
] as const;

// Cache for loaded Pyodide instance
let pyodideInstance: PyodideInterface | null = null;
let pyodideLoadPromise: Promise<PyodideInterface> | null = null;

export interface PyodideConfig {
  indexURL?: string;
  packageCacheDir?: string;
  lockFileURL?: string;
  homedir?: string;
  fullStdLib?: boolean;
}

/**
 * Load Pyodide from CDN with fallback support
 */
async function loadPyodideFromCDN(cdnUrl: string, config?: PyodideConfig): Promise<PyodideInterface> {
  return new Promise((resolve, reject) => {
    // Check if Pyodide is already loaded
    if (window.pyodide) {
      resolve(window.pyodide);
      return;
    }

    // Create script tag for Pyodide
    const script = document.createElement('script');
    script.src = `${cdnUrl}pyodide.js`;
    script.async = true;

    script.onload = async () => {
      try {
        console.log(`Loading Pyodide from ${cdnUrl}`);
        const pyodide = await window.loadPyodide({
          indexURL: cdnUrl,
          fullStdLib: false, // Load only essential packages for faster startup
          ...config,
        });

        window.pyodide = pyodide;
        resolve(pyodide);
      } catch (error) {
        console.error(`Failed to initialize Pyodide from ${cdnUrl}:`, error);
        reject(error);
      }
    };

    script.onerror = () => {
      reject(new Error(`Failed to load Pyodide script from ${cdnUrl}`));
    };

    // Add script to document
    document.head.appendChild(script);
  });
}

/**
 * Load Pyodide with CDN fallback strategy
 */
export async function loadPyodide(config?: PyodideConfig): Promise<PyodideInterface> {
  // Return cached instance if available
  if (pyodideInstance) {
    return pyodideInstance;
  }

  // Return existing load promise if in progress
  if (pyodideLoadPromise) {
    return pyodideLoadPromise;
  }

  pyodideLoadPromise = (async () => {
    let lastError: Error | null = null;

    // Try each CDN URL until one works
    for (const cdnUrl of PYODIDE_CDN_URLS) {
      try {
        console.log(`Attempting to load Pyodide from: ${cdnUrl}`);
        const pyodide = await loadPyodideFromCDN(cdnUrl, config);

        // Cache the successful instance
        pyodideInstance = pyodide;

        console.log('Pyodide loaded successfully from:', cdnUrl);
        return pyodide;
      } catch (error) {
        console.warn(`Failed to load Pyodide from ${cdnUrl}:`, error);
        lastError = error as Error;
        continue;
      }
    }

    // All CDNs failed
    const errorMessage = `Failed to load Pyodide from all CDN sources. Last error: ${lastError?.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  })();

  return pyodideLoadPromise;
}

/**
 * Load common scientific packages for Python playground
 */
export async function loadScientificPackages(pyodide: PyodideInterface): Promise<void> {
  console.log('Loading scientific packages...');

  try {
    // Load essential packages for scientific computing and graphics
    await pyodide.loadPackage([
      'numpy',
      'matplotlib',
      'micropip', // For installing additional packages
    ]);

    // Install additional packages via micropip if needed
    await pyodide.runPython(`
      import micropip
      # Add any additional packages here if needed
    `);

    console.log('Scientific packages loaded successfully');
  } catch (error) {
    console.error('Failed to load scientific packages:', error);
    throw error;
  }
}

/**
 * Setup Python environment for interactive graphics
 */
export async function setupPythonEnvironment(pyodide: PyodideInterface): Promise<void> {
  console.log('Setting up Python environment...');

  try {
    // Setup matplotlib for web backend
    await pyodide.runPython(`
      import matplotlib
      matplotlib.use('Agg')  # Use non-interactive backend
      import matplotlib.pyplot as plt
      import numpy as np

      # Setup for capturing output
      import sys
      from io import StringIO

      # Global variables for output capture
      _stdout_buffer = StringIO()
      _original_stdout = sys.stdout

      def capture_output():
          sys.stdout = _stdout_buffer

      def get_output():
          output = _stdout_buffer.getvalue()
          _stdout_buffer.seek(0)
          _stdout_buffer.truncate(0)
          sys.stdout = _original_stdout
          return output

      def reset_output():
          sys.stdout = _original_stdout
          _stdout_buffer.seek(0)
          _stdout_buffer.truncate(0)
    `);

    console.log('Python environment setup complete');
  } catch (error) {
    console.error('Failed to setup Python environment:', error);
    throw error;
  }
}

/**
 * Execute Python code with output capture
 */
export async function executePythonCode(
  pyodide: PyodideInterface,
  code: string
): Promise<{ output: string; error?: string; result?: any }> {
  try {
    // Setup output capture
    await pyodide.runPython('capture_output()');

    // Execute the code
    const result = await pyodide.runPython(code);

    // Get captured output
    const output = await pyodide.runPython('get_output()');

    return {
      output: output || '',
      result: result,
    };
  } catch (error) {
    // Reset output capture on error
    await pyodide.runPython('reset_output()');

    return {
      output: '',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check if Pyodide is loaded and ready
 */
export function isPyodideReady(): boolean {
  return pyodideInstance !== null && window.pyodide !== undefined;
}

/**
 * Get cached Pyodide instance (throws if not loaded)
 */
export function getPyodide(): PyodideInterface {
  if (!pyodideInstance) {
    throw new Error('Pyodide is not loaded. Call loadPyodide() first.');
  }
  return pyodideInstance;
}

/**
 * Cleanup Pyodide resources
 */
export function cleanupPyodide(): void {
  pyodideInstance = null;
  pyodideLoadPromise = null;

  // Remove Pyodide from window if present
  if (window.pyodide) {
    delete window.pyodide;
  }
}