"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PythonCodeEditor } from './python-code-editor';
import { pythonEngine, PythonExecutionResult } from '@/lib/python-engine';
import { NeuralButton } from '@/components/ui/neural-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Square,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  Code,
  Terminal,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';

interface PythonPlaygroundProps {
  initialCode?: string;
  title?: string;
  description?: string;
  moduleId?: string;
  onSave?: (code: string, title: string, description: string) => Promise<void>;
  readOnly?: boolean;
  showFullscreen?: boolean;
  className?: string;
}

export function PythonPlayground({
  initialCode = `# Python Code Playground
# Write your code here and click Run to execute

print("Hello, Python!")

# Example: Simple calculation
x = 10
y = 20
result = x + y
print(f"The sum of {x} and {y} is {result}")

# Example: Using built-in modules
import math
print(f"Square root of 16 is {math.sqrt(16)}")
`,
  title = "Python Playground",
  description = "",
  moduleId,
  onSave,
  readOnly = false,
  showFullscreen = true,
  className = ""
}: PythonPlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PythonExecutionResult | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [detectedPackages, setDetectedPackages] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playgroundTitle, setPlaygroundTitle] = useState(title);
  const [playgroundDescription, setPlaygroundDescription] = useState(description);
  const [activeTab, setActiveTab] = useState<'output' | 'packages' | 'settings'>('output');
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize Python engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        await pythonEngine.initialize();
        setIsEngineReady(true);
        toast.success('Python engine ready!');
      } catch (error) {
        toast.error('Failed to initialize Python engine');
        console.error('Python engine initialization error:', error);
      }
    };

    initEngine();
  }, []);

  // Detect packages when code changes
  useEffect(() => {
    const detectPackages = () => {
      if (!code.trim()) {
        setDetectedPackages([]);
        return;
      }

      try {
        // Use dynamic import to avoid bundling issues during build
        import('@/lib/python-engine').then(module => {
          const packages = module.detectPythonPackages(code);
          setDetectedPackages(packages);
        }).catch(error => {
          console.error('Package detection error:', error);
        });
      } catch (error) {
        console.error('Package detection error:', error);
      }
    };

    const timeoutId = setTimeout(detectPackages, 500);
    return () => clearTimeout(timeoutId);
  }, [code]);

  const runCode = useCallback(async () => {
    if (!isEngineReady || !code.trim()) {
      toast.warning('Enter some Python code to run');
      return;
    }

    setIsRunning(true);
    setResult(null);
    
    // Create abort controller for this execution
    abortControllerRef.current = new AbortController();

    try {
      const executionResult = await pythonEngine.executeCode(code, {
        timeout: 30000,
        captureOutput: true,
        installPackages: detectedPackages
      });

      if (!abortControllerRef.current.signal.aborted) {
        setResult(executionResult);
        setActiveTab('output');
      }
    } catch (error) {
      if (!abortControllerRef.current.signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setResult({
          output: '',
          error: errorMessage,
          executionTime: 0,
          requiredPackages: []
        });
        setActiveTab('output');
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, [code, isEngineReady, detectedPackages]);

  const stopExecution = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsRunning(false);
      toast.info('Execution stopped');
    }
  }, []);

  const resetCode = useCallback(() => {
    setCode(initialCode);
    setResult(null);
    setDetectedPackages([]);
  }, [initialCode]);

  const savePlayground = useCallback(async () => {
    if (!onSave) return;
    
    try {
      await onSave(code, playgroundTitle, playgroundDescription);
      toast.success('Playground saved successfully');
    } catch (error) {
      toast.error('Failed to save playground');
      console.error('Save error:', error);
    }
  }, [code, playgroundTitle, playgroundDescription, onSave]);

  const downloadCode = useCallback(() => {
    const blob = new Blob([code], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playgroundTitle.replace(/[^a-z0-9]/gi, '_')}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, playgroundTitle]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const playgroundContent = (
    <div className={`python-playground ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''} ${className}`}>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-neural-primary" />
            <CardTitle className="text-lg">
              {readOnly ? playgroundTitle : (
                <input
                  type="text"
                  value={playgroundTitle}
                  onChange={(e) => setPlaygroundTitle(e.target.value)}
                  className="bg-transparent border-none outline-none text-lg font-semibold"
                  placeholder="Playground title..."
                />
              )}
            </CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            {detectedPackages.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Package className="h-3 w-3 mr-1" />
                {detectedPackages.length} packages
              </Badge>
            )}
            
            {!isEngineReady && (
              <Badge variant="outline" className="text-xs">
                Loading Python...
              </Badge>
            )}
            
            {showFullscreen && (
              <NeuralButton
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </NeuralButton>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Description */}
          {!readOnly && (
            <div>
              <textarea
                value={playgroundDescription}
                onChange={(e) => setPlaygroundDescription(e.target.value)}
                placeholder="Add a description for this playground..."
                className="w-full p-2 text-sm border rounded-md bg-background resize-none"
                rows={2}
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <NeuralButton
                onClick={isRunning ? stopExecution : runCode}
                disabled={!isEngineReady}
                variant={isRunning ? "destructive" : "neural"}
                size="sm"
              >
                {isRunning ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run
                  </>
                )}
              </NeuralButton>

              {!readOnly && (
                <>
                  <NeuralButton
                    onClick={resetCode}
                    variant="ghost"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </NeuralButton>

                  {onSave && (
                    <NeuralButton
                      onClick={savePlayground}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Save
                    </NeuralButton>
                  )}
                </>
              )}

              <NeuralButton
                onClick={downloadCode}
                variant="ghost"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </NeuralButton>
            </div>

            {result && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{Math.round(result.executionTime)}ms</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Main Content Area */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Code Editor */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Python Code
              </h3>
              <PythonCodeEditor
                value={code}
                onChange={setCode}
                height="400px"
                readOnly={readOnly}
                className="border rounded-lg"
              />
            </div>

            {/* Output Area */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Terminal className="h-4 w-4 mr-2" />
                Output & Results
              </h3>
              
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="output">Output</TabsTrigger>
                  <TabsTrigger value="packages">Packages</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="output" className="space-y-4">
                  {result ? (
                    <div className="space-y-4">
                      {result.error ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="font-mono text-sm whitespace-pre-wrap">
                            {result.error}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>Execution completed successfully</AlertDescription>
                        </Alert>
                      )}
                      
                      {result.output && (
                        <Card>
                          <CardContent className="p-4">
                            <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-3 rounded">
                              {result.output}
                            </pre>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      {isRunning ? (
                        <div className="text-center">
                          <div className="animate-spin h-8 w-8 border-2 border-neural-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                          <p>Running code...</p>
                        </div>
                      ) : (
                        <p>Run your code to see output here</p>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="packages" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Detected Packages</h4>
                    {detectedPackages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {detectedPackages.map((pkg) => (
                          <Badge key={pkg} variant="outline">
                            {pkg}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No packages detected. Import packages to see them here.
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Engine Status</label>
                      <div className="flex items-center space-x-2 mt-1">
                        {isEngineReady ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Python engine ready</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">Initializing Python engine...</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return playgroundContent;
}
