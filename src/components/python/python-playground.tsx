"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NeuralButton } from '@/components/ui/neural-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCcw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { loadPyodide, loadScientificPackages, setupPythonEnvironment, executePythonCode, isPyodideReady } from '@/lib/pyodide-loader';
import { WebTurtle } from '@/lib/web-turtle';
import { TurtleManager } from '@/lib/turtle-manager';

interface PythonPlaygroundProps {
  initialCode?: string;
  title?: string;
  description?: string;
  readOnly?: boolean;
  height?: number;
  showCanvas?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

export function PythonPlayground({
  initialCode = '# Python Playground\n\nprint("Hello, World!")\n\n# Try some basic math\nx = 5\ny = 10\nprint(f"x + y = {x + y}")',
  title = 'Python Playground',
  description = 'Write and execute Python code in your browser',
  readOnly = false,
  height = 400,
  showCanvas = false,
  canvasWidth = 600,
  canvasHeight = 400,
}: PythonPlaygroundProps) {
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [webTurtle, setWebTurtle] = useState<WebTurtle | null>(null);
  const [turtleManager, setTurtleManager] = useState<TurtleManager | null>(null);

  // Initialize Pyodide on component mount
  useEffect(() => {
    let mounted = true;

    const initializePyodide = async () => {
      try {
        setIsLoading(true);
        console.log('Initializing Python environment...');

        // Load Pyodide from CDN
        const pyodide = await loadPyodide();

        if (!mounted) return;

        // Load scientific packages
        await loadScientificPackages(pyodide);

        if (!mounted) return;

        // Setup Python environment
        await setupPythonEnvironment(pyodide);

        if (!mounted) return;

        // Setup WebTurtle integration if canvas is enabled
        if (showCanvas && canvasRef.current) {
          const manager = new TurtleManager(canvasRef.current);
          const mainTurtle = manager.createTurtle('main', 'vehicle');

          setTurtleManager(manager);
          setWebTurtle(mainTurtle);

          // Setup interactivity
          manager.setupInteractivity();

          // Register enhanced turtle system with Python
          pyodide.registerJsModule('turtle_graphics', {
            // Main turtle for simple graphics
            turtle: mainTurtle,
            create_turtle: () => mainTurtle,

            // Advanced multi-turtle system for simulations
            manager: manager,
            create_vehicle: (id: string, vehicleType: string) => {
              return manager.createTurtle(id, 'vehicle', { type: vehicleType });
            },
            create_heat_source: (id: string, x?: number, y?: number) => {
              const heatSource = manager.createTurtle(id, 'heat_source');
              if (x !== undefined && y !== undefined) {
                heatSource.goto(x, y);
              }
              return heatSource;
            },
            start_animation: () => manager.startAnimation(),
            stop_animation: () => manager.stopAnimation(),
            clear_all: () => manager.clearAll(),
            get_turtle: (id: string) => manager.getTurtle(id),
            update_entity_data: (id: string, data: any) => manager.updateEntityData(id, data),
            set_animation_callback: (callback: () => void) => manager.setAnimationCallback(callback),
          });
        }

        setPyodideReady(true);
        console.log('Python environment ready!');
      } catch (error) {
        console.error('Failed to initialize Python environment:', error);
        setError(`Failed to load Python environment: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isPyodideReady()) {
      initializePyodide();
    } else {
      setPyodideReady(true);
    }

    return () => {
      mounted = false;
    };
  }, [showCanvas, canvasWidth, canvasHeight]);

  // Setup canvas when it becomes available
  useEffect(() => {
    if (showCanvas && canvasRef.current && !webTurtle && pyodideReady) {
      const turtle = new WebTurtle(canvasRef.current);
      setWebTurtle(turtle);
    }
  }, [showCanvas, pyodideReady, webTurtle]);

  const runCode = useCallback(async () => {
    if (!pyodideReady || !isPyodideReady()) {
      setError('Python environment is not ready yet. Please wait...');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      const pyodide = (window as any).pyodide;

      // Clear canvas if turtle graphics are being used and canvas is available
      if (webTurtle && showCanvas && (code.includes('turtle') || code.includes('WebTurtle'))) {
        webTurtle.clear();
      }

      // Execute the code
      const result = await executePythonCode(pyodide, code);

      if (result.error) {
        setError(result.error);
      } else {
        setOutput(result.output || (result.result !== undefined ? String(result.result) : 'Code executed successfully'));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunning(false);
    }
  }, [code, pyodideReady, webTurtle, showCanvas]);

  const resetCode = useCallback(() => {
    setCode(initialCode);
    setOutput('');
    setError('');
    if (webTurtle && showCanvas) {
      webTurtle.clear();
    }
  }, [initialCode, webTurtle, showCanvas]);

  const stopExecution = useCallback(() => {
    setIsRunning(false);
    // Note: Actually stopping Python execution in Pyodide is complex
    // For now, we just reset the UI state
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              <Badge variant={pyodideReady ? "default" : "secondary"}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Loading
                  </>
                ) : pyodideReady ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Ready
                  </>
                )}
              </Badge>
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex gap-2">
            <NeuralButton
              onClick={runCode}
              disabled={!pyodideReady || isRunning || isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run
                </>
              )}
            </NeuralButton>
            {isRunning && (
              <NeuralButton
                onClick={stopExecution}
                size="sm"
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </NeuralButton>
            )}
            <NeuralButton
              onClick={resetCode}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </NeuralButton>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Code Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Python Code</label>
            <textarea
              ref={codeTextareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              readOnly={readOnly}
              className="w-full p-3 border rounded-md font-mono text-sm resize-vertical"
              style={{ height: `${height}px` }}
              placeholder="Enter your Python code here..."
              spellCheck={false}
            />
          </div>

          {/* Canvas and Output Tabs */}
          <Tabs defaultValue={showCanvas ? "canvas" : "output"}>
            <TabsList>
              {showCanvas && <TabsTrigger value="canvas">Graphics</TabsTrigger>}
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>

            {showCanvas && (
              <TabsContent value="canvas">
                <div className="border rounded-md p-4 bg-gray-50">
                  <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    className="border bg-white mx-auto block"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              </TabsContent>
            )}

            <TabsContent value="output">
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Output</label>
                  <div className="w-full p-3 border rounded-md bg-gray-50 font-mono text-sm whitespace-pre-wrap min-h-[100px] max-h-[300px] overflow-y-auto">
                    {output || 'No output yet. Run some code to see results here.'}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="help">
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">How to use the Python Playground:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Write Python code in the editor above</li>
                    <li>Click the &quot;Run&quot; button to execute your code</li>
                    <li>View output in the &quot;Output&quot; tab</li>
                    {showCanvas && <li>View graphics and animations in the &quot;Graphics&quot; tab</li>}
                    <li>Use the &quot;Reset&quot; button to restore the original code</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Available Libraries:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li><code>numpy</code> - Numerical computing</li>
                    <li><code>matplotlib</code> - Plotting and visualization</li>
                    {showCanvas && <li><code>web_turtle</code> - Turtle graphics (browser-compatible)</li>}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Example Code:</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{showCanvas ? `# Turtle Graphics Example
import web_turtle
turtle = web_turtle.create_turtle()

# Draw a square
for i in range(4):
    turtle.forward(100)
    turtle.right(90)

print("Square drawn!")` : `# Basic Python Example
import numpy as np
import matplotlib.pyplot as plt

# Create some data
x = np.linspace(0, 10, 100)
y = np.sin(x)

print(f"Generated {len(x)} data points")
print(f"Max value: {y.max():.2f}")
print(f"Min value: {y.min():.2f}")`}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}