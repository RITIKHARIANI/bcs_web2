"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { PlaygroundCategory } from '@/types/playground';
import { TEMPLATE_REGISTRY } from '@/templates';
import { Plus, Search, Filter, Clock, Eye, GitFork } from 'lucide-react';

type FilterType = 'all' | PlaygroundCategory;

export default function PlaygroundsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const templates = Object.values(TEMPLATE_REGISTRY);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || template.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const categories = [
    { id: 'all' as FilterType, label: 'All' },
    { id: PlaygroundCategory.ALGORITHMS, label: 'Algorithms' },
    { id: PlaygroundCategory.NEURAL_NETWORKS, label: 'Neural Networks' },
    { id: PlaygroundCategory.PHYSICS, label: 'Physics' },
    { id: PlaygroundCategory.BIOLOGY, label: 'Biology' },
    { id: PlaygroundCategory.CHEMISTRY, label: 'Chemistry' },
    { id: PlaygroundCategory.MATHEMATICS, label: 'Mathematics' },
    { id: PlaygroundCategory.CUSTOM, label: 'Custom' },
  ];

  return (
    <div className="playgrounds-page min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interactive Playgrounds</h1>
              <p className="text-gray-600 mt-2">
                Explore interactive educational simulations and create your own
              </p>
            </div>
            <Link href="/playgrounds/builder">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                <Plus className="w-5 h-5" />
                Create Playground
              </button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search playgrounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-700">Filter by Category</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                           ${activeFilter === category.id
                             ? 'bg-blue-500 text-white'
                             : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredTemplates.length} playground{filteredTemplates.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Playground Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Link key={template.id} href={`/playgrounds/${template.id}`}>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  {/* Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-white bg-opacity-90 rounded-full text-xs font-medium text-gray-700">
                      {template.category.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>0 views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        <span>0 forks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No playgrounds found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Empty State for No Templates */}
        {templates.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Plus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No playgrounds yet</h3>
            <p className="text-gray-500 mb-6">Create your first interactive playground</p>
            <Link href="/playgrounds/builder">
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                Create Playground
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
