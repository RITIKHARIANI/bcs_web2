// Playground Execution Engine
// Executes Python/JavaScript code with parameter injection

import { CodeConfig, PlaygroundExecutionContext } from '@/types/playground';
import { loadPyodide, isPyodideReady, executePythonCode, getPyodide, setupPythonEnvironment } from '@/lib/pyodide-loader';
import { ParameterBinder } from './parameter-binder';

export class PlaygroundExecutionEngine {
  private pyodideReady: boolean = false;
  private context: PlaygroundExecutionContext;
  private parameterBinder: ParameterBinder;

  constructor(
    context: PlaygroundExecutionContext,
    parameterBinder: ParameterBinder
  ) {
    this.context = context;
    this.parameterBinder = parameterBinder;
  }

  /**
   * Initialize execution environment
   */
  async initialize(): Promise<void> {
    if (!isPyodideReady()) {
      const pyodide = await loadPyodide();
      await setupPythonEnvironment(pyodide);
    }
    this.pyodideReady = true;
  }

  /**
   * Execute code with current parameters
   */
  async execute(codeConfig: CodeConfig): Promise<{ output: string; error?: string }> {
    try {
      if (codeConfig.language === 'python') {
        return await this.executePython(codeConfig);
      } else if (codeConfig.language === 'javascript') {
        return await this.executeJavaScript(codeConfig);
      } else {
        throw new Error(`Unsupported language: ${codeConfig.language}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.context.onError(error as Error);
      return {
        output: '',
        error: errorMessage,
      };
    }
  }

  /**
   * Execute Python code with parameter injection
   */
  private async executePython(codeConfig: CodeConfig): Promise<{ output: string; error?: string }> {
    if (!this.pyodideReady) {
      throw new Error('Python environment not ready');
    }

    // Inject parameters into Python globals
    const parametersCode = this.parameterBinder.toPythonGlobals();
    const fullCode = `${parametersCode}\n\n${codeConfig.content}`;

    try {
      const pyodide = getPyodide();
      const result = await executePythonCode(pyodide, fullCode);

      // Update context with new parameters
      if (this.context?.onUpdate) {
        this.context.onUpdate(this.parameterBinder.getAllParameters());
      }

      return {
        output: result.output,
        error: result.error,
      };
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute JavaScript code with parameter injection
   */
  private async executeJavaScript(codeConfig: CodeConfig): Promise<{ output: string; error?: string }> {
    const outputs: string[] = [];
    const errors: string[] = [];

    // Create console mock to capture output
    const consoleMock = {
      log: (...args: any[]) => {
        outputs.push(args.map(String).join(' '));
      },
      error: (...args: any[]) => {
        errors.push(args.map(String).join(' '));
      },
      warn: (...args: any[]) => {
        outputs.push('[WARN] ' + args.map(String).join(' '));
      },
    };

    try {
      // Inject parameters
      const parametersCode = this.parameterBinder.toJavaScriptObject();
      const fullCode = `
        (function(console, params) {
          ${parametersCode}
          ${codeConfig.content}
        })
      `;

      // Execute in sandboxed context
      const func = eval(fullCode);
      func(consoleMock, this.parameterBinder.getAllParameters());

      // Update context
      this.context.onUpdate(this.parameterBinder.getAllParameters());

      return {
        output: outputs.join('\n'),
        error: errors.length > 0 ? errors.join('\n') : undefined,
      };
    } catch (error) {
      return {
        output: outputs.join('\n'),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Re-execute with updated parameters
   */
  async reExecute(codeConfig: CodeConfig): Promise<{ output: string; error?: string }> {
    return await this.execute(codeConfig);
  }

  /**
   * Stop execution (for animations/long-running code)
   */
  stop(): void {
    // Implement stop logic for animations
    // This will be handled by the playground renderer
  }
}

/**
 * Create execution engine for playground
 */
export function createExecutionEngine(
  context: PlaygroundExecutionContext,
  parameterBinder: ParameterBinder
): PlaygroundExecutionEngine {
  return new PlaygroundExecutionEngine(context, parameterBinder);
}
