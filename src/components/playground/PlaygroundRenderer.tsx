"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Playground, ControlType, PlaygroundExecutionContext } from '@/types/playground';
import { Slider, Button, Dropdown, Checkbox } from './controls';
import { ParameterBinder } from '@/lib/playground/parameter-binder';
import { PlaygroundExecutionEngine } from '@/lib/playground/execution-engine';
import { TurtleManager } from '@/lib/turtle-manager';
import { WebTurtle } from '@/lib/web-turtle';

interface PlaygroundRendererProps {
  playground: Playground;
  onParameterChange?: (parameters: Record<string, any>) => void;
}

export function PlaygroundRenderer({ playground, onParameterChange }: PlaygroundRendererProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | undefined>();
  const [isRunning, setIsRunning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const parameterBinderRef = useRef<ParameterBinder>(new ParameterBinder());
  const executionEngineRef = useRef<PlaygroundExecutionEngine | null>(null);
  const turtleManagerRef = useRef<TurtleManager | null>(null);

  // Initialize parameter binder and execution engine
  useEffect(() => {
    const binder = parameterBinderRef.current;
    binder.initializeFromControls(playground.controls);
    setParameters(binder.getAllParameters());

    // Subscribe to parameter changes
    const unsubscribe = binder.onAnyParameterChange((params) => {
      setParameters(params);
      onParameterChange?.(params);
    });

    // Initialize execution context
    const context: PlaygroundExecutionContext = {
      parameters: binder.getAllParameters(),
      visualizationElement: visualizationRef.current!,
      onUpdate: (params) => {
        setParameters(params);
        onParameterChange?.(params);
      },
      onError: (err) => {
        setError(err.message);
        setIsRunning(false);
      },
    };

    executionEngineRef.current = new PlaygroundExecutionEngine(context, binder);

    return () => {
      unsubscribe();
    };
  }, [playground.controls, onParameterChange]);

  // Initialize canvas/turtle if needed
  useEffect(() => {
    if (playground.visualization.type === 'canvas' && canvasRef.current) {
      const config = playground.visualization.config as any;

      if (config.useTurtleManager) {
        const manager = new TurtleManager(canvasRef.current);
        manager.setupInteractivity();
        turtleManagerRef.current = manager;

        // Register with Python/JS
        if (typeof window !== 'undefined') {
          (window as any).turtle_graphics = {
            manager: manager,
            create_vehicle: (id: string, type: string) =>
              manager.createTurtle(id, 'vehicle', { type }),
            create_heat_source: (id: string, x?: number, y?: number) => {
              const turtle = manager.createTurtle(id, 'heat_source');
              if (x !== undefined && y !== undefined) {
                turtle.goto(x, y);
              }
              return turtle;
            },
            start_animation: () => manager.startAnimation(),
            stop_animation: () => manager.stopAnimation(),
            clear_all: () => manager.clearAll(),
            set_animation_callback: (cb: () => void) => manager.setAnimationCallback(cb),
          };
        }
      } else if (config.useWebTurtle) {
        const turtle = new WebTurtle(canvasRef.current);
        (window as any).turtle_graphics = {
          turtle: turtle,
        };
      }
    }

    return () => {
      if (turtleManagerRef.current) {
        turtleManagerRef.current.stopAnimation();
      }
    };
  }, [playground.visualization]);

  // Execute code
  const executeCode = useCallback(async () => {
    if (!executionEngineRef.current) return;

    setIsRunning(true);
    setError(undefined);
    setOutput('');

    try {
      await executionEngineRef.current.initialize();

      // Register turtle_graphics module with Pyodide if it exists
      if (typeof window !== 'undefined' && (window as any).turtle_graphics) {
        const { getPyodide } = await import('@/lib/pyodide-loader');
        const pyodide = getPyodide();
        pyodide.registerJsModule('turtle_graphics', (window as any).turtle_graphics);
      }

      const result = await executionEngineRef.current.execute(playground.code);

      setOutput(result.output);
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  }, [playground.code]);

  // Auto-execute on mount
  useEffect(() => {
    executeCode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-execute when parameters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (executionEngineRef.current && !isRunning) {
        executeCode();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [parameters, executeCode, isRunning]);

  // Handle control changes
  const handleControlChange = useCallback((controlId: string, value: any) => {
    parameterBinderRef.current.setParameterFromControl(controlId, value);
  }, []);

  // Handle button actions
  const handleButtonClick = useCallback((controlId: string, action: string) => {
    if (action === 'start' || action === 'custom') {
      executeCode();
    } else if (action === 'stop') {
      turtleManagerRef.current?.stopAnimation();
      setIsRunning(false);
    } else if (action === 'reset') {
      turtleManagerRef.current?.clearAll();
      executeCode();
    }
  }, [executeCode]);

  // Render control based on type
  const renderControl = (control: any) => {
    const key = control.id;

    switch (control.type) {
      case ControlType.SLIDER:
        return (
          <Slider
            key={key}
            config={control}
            value={parameters[control.bindTo]}
            onChange={(value) => handleControlChange(control.id, value)}
          />
        );

      case ControlType.BUTTON:
        return (
          <Button
            key={key}
            config={control}
            onClick={() => handleButtonClick(control.id, control.config.action)}
          />
        );

      case ControlType.DROPDOWN:
        return (
          <Dropdown
            key={key}
            config={control}
            value={parameters[control.bindTo]}
            onChange={(value) => handleControlChange(control.id, value)}
          />
        );

      case ControlType.CHECKBOX:
        return (
          <Checkbox
            key={key}
            config={control}
            value={parameters[control.bindTo]}
            onChange={(value) => handleControlChange(control.id, value)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="playground-renderer w-full h-full flex gap-4">
      {/* Controls Panel */}
      <div className="controls-panel w-80 space-y-4 p-4 bg-gray-50 rounded-lg overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800">Controls</h3>
        {playground.controls.map(renderControl)}

        {/* Output Section */}
        {output && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Output</h4>
            <pre className="text-xs bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {output}
            </pre>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-red-700">Error</h4>
            <pre className="text-xs bg-red-50 p-3 rounded border border-red-200 text-red-700 whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        )}
      </div>

      {/* Visualization Panel */}
      <div
        ref={visualizationRef}
        className="visualization-panel flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center relative"
      >
        {playground.visualization.type === 'canvas' && (
          <canvas
            ref={canvasRef}
            width={(playground.visualization.config as any).width}
            height={(playground.visualization.config as any).height}
            className="border border-gray-300 rounded"
            style={{
              backgroundColor: (playground.visualization.config as any).backgroundColor || '#ffffff',
            }}
          />
        )}

        {playground.visualization.type === 'd3_svg' && (
          <div className="d3-container w-full h-full" id="d3-visualization"></div>
        )}

        {playground.visualization.type === 'plotly' && (
          <div className="plotly-container w-full h-full" id="plotly-visualization"></div>
        )}

        {isRunning && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
            Running...
          </div>
        )}
      </div>
    </div>
  );
}
