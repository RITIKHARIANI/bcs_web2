// Python execution engine using Pyodide for client-side Python execution
export interface PythonExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
  requiredPackages: string[];
}

export interface PythonExecutionOptions {
  timeout?: number; // in milliseconds
  captureOutput?: boolean;
  installPackages?: string[];
}

class PythonEngine {
  private pyodide: any = null;
  private isInitialized = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.isInitializing && this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = this.doInitialize();
    await this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        throw new Error('Python engine can only be initialized in browser');
      }

      // Load Pyodide from CDN to avoid bundling issues
      const loadPyodideFromCDN = async () => {
        // Check if Pyodide is already loaded globally
        if ((globalThis as any).loadPyodide) {
          return (globalThis as any).loadPyodide;
        }

        // Load Pyodide script from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.async = true;
        
        return new Promise((resolve, reject) => {
          script.onload = () => {
            if ((globalThis as any).loadPyodide) {
              resolve((globalThis as any).loadPyodide);
            } else {
              reject(new Error('Failed to load Pyodide from CDN'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load Pyodide script'));
          document.head.appendChild(script);
        });
      };

      const loadPyodide = await loadPyodideFromCDN();
      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });

      // Setup output capturing
      this.pyodide.runPython(`
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

class OutputCapture:
    def __init__(self):
        self.stdout = io.StringIO()
        self.stderr = io.StringIO()
    
    def capture_output(self, code):
        self.stdout = io.StringIO()
        self.stderr = io.StringIO()
        
        try:
            with redirect_stdout(self.stdout), redirect_stderr(self.stderr):
                exec(code, globals())
            return self.stdout.getvalue(), self.stderr.getvalue()
        except Exception as e:
            return self.stdout.getvalue(), str(e)

output_capture = OutputCapture()
      `);

      this.isInitialized = true;
      this.isInitializing = false;
    } catch (error) {
      this.isInitializing = false;
      this.initPromise = null;
      throw new Error(`Failed to initialize Python engine: ${error}`);
    }
  }

  async executeCode(
    code: string,
    options: PythonExecutionOptions = {}
  ): Promise<PythonExecutionResult> {
    await this.initialize();

    const {
      timeout = 30000,
      captureOutput = true,
      installPackages = []
    } = options;

    const startTime = performance.now();
    let output = '';
    let error: string | null = null;
    let requiredPackages: string[] = [];

    try {
      // Detect required packages from the code
      requiredPackages = this.detectRequiredPackages(code);

      // Install packages if needed
      const packagesToInstall = [...new Set([...installPackages, ...requiredPackages])];
      if (packagesToInstall.length > 0) {
        await this.installPackages(packagesToInstall);
      }

      // Execute code with timeout
      const executionPromise = this.executeWithTimeout(code, captureOutput, timeout);
      const result = await executionPromise;
      
      output = result.output;
      error = result.error;

    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown execution error';
    }

    const executionTime = performance.now() - startTime;

    return {
      output,
      error,
      executionTime,
      requiredPackages
    };
  }

  private async executeWithTimeout(
    code: string,
    captureOutput: boolean,
    timeout: number
  ): Promise<{ output: string; error: string | null }> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeout}ms`));
      }, timeout);

      try {
        if (captureOutput) {
          const result = this.pyodide.runPython(`
output_capture.capture_output('''${code.replace(/'''/g, '\\\'\\\'\\\'').replace(/\\/g, '\\\\')}''')
          `);
          
          const [stdout, stderr] = result.toJs();
          clearTimeout(timeoutId);
          resolve({
            output: stdout || '',
            error: stderr || null
          });
        } else {
          const result = this.pyodide.runPython(code);
          clearTimeout(timeoutId);
          resolve({
            output: result ? String(result) : '',
            error: null
          });
        }
      } catch (err) {
        clearTimeout(timeoutId);
        resolve({
          output: '',
          error: err instanceof Error ? err.message : 'Execution error'
        });
      }
    });
  }

  private detectRequiredPackages(code: string): string[] {
    const packages = new Set<string>();
    
    // Common package mappings
    const packageMappings: { [key: string]: string } = {
      'numpy': 'numpy',
      'np': 'numpy',
      'pandas': 'pandas',
      'pd': 'pandas',
      'matplotlib': 'matplotlib',
      'plt': 'matplotlib',
      'scipy': 'scipy',
      'sklearn': 'scikit-learn',
      'cv2': 'opencv-python',
      'PIL': 'pillow',
      'requests': 'requests',
      'json': '', // Built-in
      'math': '', // Built-in
      'random': '', // Built-in
      'os': '', // Built-in
      'sys': '', // Built-in
      'time': '', // Built-in
      'datetime': '', // Built-in
      're': '', // Built-in
      'tkinter': 'tkinter', // Special case for GUI
    };

    // Look for import statements
    const importRegex = /(?:^|\n)\s*(?:import\s+(\w+)|from\s+(\w+)\s+import)/gm;
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      const packageName = match[1] || match[2];
      if (packageName && packageMappings.hasOwnProperty(packageName)) {
        const mappedPackage = packageMappings[packageName];
        if (mappedPackage) {
          packages.add(mappedPackage);
        }
      } else if (packageName) {
        // For unknown packages, assume package name is the same as import name
        packages.add(packageName);
      }
    }

    return Array.from(packages);
  }

  private async installPackages(packages: string[]): Promise<void> {
    const pyodidePackages = [
      'numpy', 'pandas', 'matplotlib', 'scipy', 'scikit-learn', 
      'pillow', 'requests', 'micropip'
    ];

    for (const pkg of packages) {
      try {
        if (pyodidePackages.includes(pkg)) {
          await this.pyodide.loadPackage(pkg);
        } else {
          // Try to install via micropip for other packages
          await this.pyodide.loadPackage('micropip');
          await this.pyodide.runPython(`
import micropip
micropip.install('${pkg}')
          `);
        }
      } catch (error) {
        console.warn(`Failed to install package: ${pkg}`, error);
        // Continue execution even if package installation fails
      }
    }
  }

  async isPackageAvailable(packageName: string): Promise<boolean> {
    await this.initialize();
    
    try {
      await this.pyodide.runPython(`import ${packageName}`);
      return true;
    } catch {
      return false;
    }
  }

  async getAvailablePackages(): Promise<string[]> {
    await this.initialize();
    
    try {
      const result = this.pyodide.runPython(`
import pkgutil
[pkg.name for pkg in pkgutil.iter_modules()]
      `);
      return result.toJs();
    } catch {
      return [];
    }
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  async destroy(): Promise<void> {
    if (this.pyodide) {
      this.pyodide = null;
      this.isInitialized = false;
      this.isInitializing = false;
      this.initPromise = null;
    }
  }
}

// Export singleton instance
export const pythonEngine = new PythonEngine();

// Utility functions
export async function executePythonCode(
  code: string,
  options?: PythonExecutionOptions
): Promise<PythonExecutionResult> {
  return pythonEngine.executeCode(code, options);
}

export function detectPythonPackages(code: string): string[] {
  const packages = new Set<string>();
  
  // Common package mappings
  const packageMappings: { [key: string]: string } = {
    'numpy': 'numpy',
    'np': 'numpy',
    'pandas': 'pandas',
    'pd': 'pandas',
    'matplotlib': 'matplotlib',
    'plt': 'matplotlib',
    'scipy': 'scipy',
    'sklearn': 'scikit-learn',
    'cv2': 'opencv-python',
    'PIL': 'pillow',
    'requests': 'requests',
    'json': '', // Built-in
    'math': '', // Built-in
    'random': '', // Built-in
    'os': '', // Built-in
    'sys': '', // Built-in
    'time': '', // Built-in
    'datetime': '', // Built-in
    're': '', // Built-in
    'tkinter': 'tkinter', // Special case for GUI
  };

  // Look for import statements
  const importRegex = /(?:^|\n)\s*(?:import\s+(\w+)|from\s+(\w+)\s+import)/gm;
  let match;
  
  while ((match = importRegex.exec(code)) !== null) {
    const packageName = match[1] || match[2];
    if (packageName && packageMappings.hasOwnProperty(packageName)) {
      const mappedPackage = packageMappings[packageName];
      if (mappedPackage) {
        packages.add(mappedPackage);
      }
    } else if (packageName) {
      // For unknown packages, assume package name is the same as import name
      packages.add(packageName);
    }
  }

  return Array.from(packages);
}
