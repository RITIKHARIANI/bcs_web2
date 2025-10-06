"use client";

import React, { useState } from 'react';
import { CodeConfig } from '@/types/playground';
import { Code, Play } from 'lucide-react';

interface CodeEditorProps {
  codeConfig: CodeConfig;
  onUpdate: (codeConfig: CodeConfig) => void;
  onTest: () => void;
}

export function CodeEditor({ codeConfig, onUpdate, onTest }: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'settings'>('code');

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...codeConfig,
      content: e.target.value,
    });
  };

  const handleLanguageChange = (language: 'python' | 'javascript') => {
    onUpdate({
      ...codeConfig,
      language,
    });
  };

  const handleLibraryAdd = (library: string) => {
    if (!library.trim()) return;

    const libraries = codeConfig.libraries || [];

    if (!libraries.includes(library)) {
      onUpdate({
        ...codeConfig,
        libraries: [...libraries, library],
      });
    }
  };

  const handleLibraryRemove = (library: string) => {
    const libraries = codeConfig.libraries || [];

    onUpdate({
      ...codeConfig,
      libraries: libraries.filter(l => l !== library),
    });
  };

  const currentLibraries = codeConfig.libraries || [];

  return (
    <div className="code-editor h-full bg-white border-t border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800">Code Editor</h3>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-md border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors
                         ${activeTab === 'code'
                           ? 'bg-blue-500 text-white'
                           : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors
                         ${activeTab === 'settings'
                           ? 'bg-blue-500 text-white'
                           : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={onTest}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
        >
          <Play className="w-4 h-4" />
          Test Run
        </button>
      </div>

      {/* Content */}
      {activeTab === 'code' ? (
        <div className="flex-1 p-4 overflow-hidden">
          <textarea
            value={codeConfig.content}
            onChange={handleCodeChange}
            className="w-full h-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={codeConfig.language === 'python'
              ? '# Write your Python code here\n# Use parameter variables directly (e.g., num_vehicles, speed)\n\nimport turtle_graphics\n\n# Your code...'
              : '// Write your JavaScript code here\n// Use parameter variables directly (e.g., numVehicles, speed)\n\n// Your code...'}
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('python')}
                className={`flex-1 px-4 py-2 rounded-md border-2 transition-all
                           ${codeConfig.language === 'python'
                             ? 'border-blue-500 bg-blue-50 text-blue-700'
                             : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
              >
                <div className="font-medium">Python</div>
                <div className="text-xs mt-1">via Pyodide</div>
              </button>
              <button
                onClick={() => handleLanguageChange('javascript')}
                className={`flex-1 px-4 py-2 rounded-md border-2 transition-all
                           ${codeConfig.language === 'javascript'
                             ? 'border-blue-500 bg-blue-50 text-blue-700'
                             : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
              >
                <div className="font-medium">JavaScript</div>
                <div className="text-xs mt-1">Native</div>
              </button>
            </div>
          </div>

          {/* Libraries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {codeConfig.language === 'python' ? 'Python Libraries' : 'JavaScript Libraries'}
            </label>

            {/* Library List */}
            <div className="mb-3 flex flex-wrap gap-2">
              {currentLibraries.map((lib) => (
                <div
                  key={lib}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  <span>{lib}</span>
                  <button
                    onClick={() => handleLibraryRemove(lib)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Add Library */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={codeConfig.language === 'python' ? 'numpy, matplotlib, etc.' : 'd3, plotly, etc.'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLibraryAdd((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('input[placeholder*="numpy"]');
                  if (input) {
                    handleLibraryAdd(input.value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter or click Add to include a library
            </p>
          </div>

          {/* Common Libraries Shortcuts */}
          {codeConfig.language === 'python' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Add (Python)
              </label>
              <div className="flex flex-wrap gap-2">
                {['numpy', 'matplotlib', 'pandas', 'scipy'].map((lib) => (
                  <button
                    key={lib}
                    onClick={() => handleLibraryAdd(lib)}
                    disabled={currentLibraries.includes(lib)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {lib}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
