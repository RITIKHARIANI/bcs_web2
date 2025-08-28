'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HierarchicalModuleLibrary } from '@/components/faculty/hierarchical-module-library'
import Link from 'next/link'

export function ModuleManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📚 Hierarchical Module Library
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Create, organize, and manage your learning modules with unlimited nesting levels
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>✨ Drag & Drop Reordering</span>
                <span>•</span>
                <span>🏗️ Unlimited Nesting (1.1.1.1...)</span>
                <span>•</span>
                <span>🔍 Smart Search</span>
                <span>•</span>
                <span>♻️ Module Reusability</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/faculty/dashboard">
                <Button variant="ghost" size="sm">
                  ← Back to Dashboard
                </Button>
              </Link>
              <Link href="/faculty/modules/create">
                <Button>
                  + Create Module
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search modules by title, description, or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Published</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>Draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-blue-700">
              <p className="font-medium">💡 Enhanced Module Management Tips:</p>
              <ul className="mt-1 list-disc list-inside space-y-1 text-blue-600">
                <li><strong>Drag & Drop:</strong> Use the ⋮⋮ handle to reorder modules within the same level</li>
                <li><strong>Nesting:</strong> Click "+ Sub" to create unlimited nesting levels (1.1.1.1.1...)</li>
                <li><strong>Tree Navigation:</strong> Use ▶/▼ to expand/collapse sections, or "Expand All"/"Collapse All"</li>
                <li><strong>Reusability:</strong> Modules can be used in multiple courses - usage count shown in gray</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <HierarchicalModuleLibrary searchTerm={searchTerm} />
        </div>
      </main>
    </div>
  )
}
