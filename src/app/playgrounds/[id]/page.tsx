"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Playground, PlaygroundCategory } from '@/types/playground';
import { getTemplate } from '@/templates';
import { PlaygroundRenderer } from '@/components/playground/PlaygroundRenderer';
import { ArrowLeft, Share2, GitFork, Eye, Clock, User } from 'lucide-react';
import Link from 'next/link';

export default function PlaygroundViewPage() {
  const params = useParams();
  const router = useRouter();
  const playgroundId = params.id as string;

  const [playground, setPlayground] = useState<Playground | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load playground from template
    const template = getTemplate(playgroundId);

    if (template) {
      // Convert template to playground
      const playgroundFromTemplate: Playground = {
        id: template.id,
        title: template.name,
        description: template.description,
        category: template.category,
        createdBy: 'system',
        organizationId: 'bcs',
        isPublic: true,
        shareUrl: playgroundId,
        embedCode: `<iframe src="${window.location.origin}/playgrounds/${playgroundId}" width="800" height="600"></iframe>`,
        controls: template.defaultControls,
        visualization: template.defaultVisualization,
        code: {
          language: 'python',
          content: template.codeTemplate,
          libraries: template.pythonLibraries || [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        viewCount: 0,
        forkCount: 0,
      };

      setPlayground(playgroundFromTemplate);
      setLoading(false);
    } else {
      // TODO: Fetch from API if not a template
      console.error('Playground not found:', playgroundId);
      setLoading(false);
    }
  }, [playgroundId]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/playgrounds/${playgroundId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  const handleFork = () => {
    // TODO: Implement fork functionality
    alert('Fork functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading playground...</p>
        </div>
      </div>
    );
  }

  if (!playground) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Playground not found</h1>
          <p className="text-gray-600 mb-6">The playground you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/playgrounds">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Browse Playgrounds
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="playground-view min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link href="/playgrounds">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Playgrounds
            </button>
          </Link>

          {/* Title and Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{playground.title}</h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {playground.category.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{playground.description}</p>

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>System Template</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{playground.viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" />
                  <span>{playground.forkCount} forks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Updated {playground.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleFork}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <GitFork className="w-4 h-4" />
                Fork
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Playground Renderer */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto p-6">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <PlaygroundRenderer playground={playground} />
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
          <p>
            This playground runs entirely in your browser using{' '}
            {playground.code.language === 'python' ? 'Pyodide (Python 3.11)' : 'JavaScript'}
          </p>
        </div>
      </footer>
    </div>
  );
}
