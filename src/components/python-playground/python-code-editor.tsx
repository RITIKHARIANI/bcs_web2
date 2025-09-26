"use client";

import React, { useRef, useEffect, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

interface PythonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  theme?: 'light' | 'dark';
  readOnly?: boolean;
  className?: string;
}

export function PythonCodeEditor({
  value,
  onChange,
  placeholder = "# Write your Python code here...",
  height = "300px",
  theme = 'light',
  readOnly = false,
  className = ""
}: PythonCodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !editorRef.current) return;

    const extensions = [
      basicSetup,
      python(),
      EditorView.theme({
        '&': { height },
        '.cm-content': { 
          padding: '16px',
          minHeight: height,
          fontSize: '14px',
          fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace'
        },
        '.cm-focused': { outline: 'none' },
        '.cm-editor': { 
          borderRadius: '6px',
          border: theme === 'light' 
            ? '1px solid hsl(var(--border))' 
            : '1px solid hsl(var(--border))',
        },
        '.cm-scroller': { 
          fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace'
        }
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          onChange(newValue);
        }
      }),
      EditorState.readOnly.of(readOnly),
      ...(theme === 'dark' ? [oneDark] : [])
    ];

    const state = EditorState.create({
      doc: value,
      extensions
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
  }, [mounted, height, theme, readOnly]);

  useEffect(() => {
    if (editorViewRef.current && value !== editorViewRef.current.state.doc.toString()) {
      const transaction = editorViewRef.current.state.update({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: value
        }
      });
      editorViewRef.current.dispatch(transaction);
    }
  }, [value]); // onChange is intentionally not included to avoid infinite loops

  if (!mounted) {
    return (
      <div 
        className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
        style={{ height }}
      >
        <div className="animate-pulse p-4">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`python-code-editor ${className}`}>
      <div ref={editorRef} />
      {!value && placeholder && (
        <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none text-sm">
          {placeholder}
        </div>
      )}
    </div>
  );
}
