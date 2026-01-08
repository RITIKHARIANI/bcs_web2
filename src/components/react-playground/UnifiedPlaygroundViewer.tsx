'use client';

/**
 * UnifiedPlaygroundViewer
 *
 * Immersive playground viewer with thin header and info drawer.
 * Used for both Featured Templates and Community Playgrounds.
 */

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Info, Code } from 'lucide-react';
import PlaygroundInfoDrawer from './PlaygroundInfoDrawer';

// Lazy load the preview component (Sandpack doesn't support SSR)
const PlaygroundViewerClient = dynamic(
  () => import('@/components/react-playground/PlaygroundViewerClient'),
  {
    loading: () => (
      <div className="h-full flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neural-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading playground...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export interface UnifiedPlaygroundViewerProps {
  // Required
  title: string;
  sourceCode: string;
  dependencies: Record<string, string>;

  // Optional metadata
  description?: string;
  author?: {
    name: string;
    avatar?: string;
    university?: string;
  };
  stats?: {
    viewCount: number;
    createdAt: Date;
  };
  category?: string;
  tags?: string[];
  requirementsList?: string[]; // Raw list for info drawer

  // Access control
  canEdit?: boolean;
  editUrl?: string;
}

export default function UnifiedPlaygroundViewer({
  title,
  sourceCode,
  dependencies,
  description,
  author,
  stats,
  category,
  tags,
  requirementsList,
  canEdit,
  editUrl,
}: UnifiedPlaygroundViewerProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Check if we have any metadata to show
  const hasMetadata = description || author || stats || category || tags?.length || requirementsList?.length;

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Thin Header */}
      <header className="h-12 flex items-center justify-between px-4 bg-gray-900 border-b border-gray-800 shrink-0">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/playgrounds"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-gray-700 shrink-0" />
          <h1 className="text-white font-medium truncate">{title}</h1>
        </div>

        {/* Right: Info + Edit */}
        <div className="flex items-center gap-2 shrink-0">
          {hasMetadata && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Show info"
              title="About this playground"
            >
              <Info className="h-5 w-5" />
            </button>
          )}
          {canEdit && editUrl && (
            <Link
              href={editUrl}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          )}
        </div>
      </header>

      {/* Full-screen Preview */}
      <div className="flex-1 min-h-0">
        <PlaygroundViewerClient
          code={sourceCode}
          dependencies={dependencies}
          showConsole={true}
          className="h-full w-full"
        />
      </div>

      {/* Info Drawer */}
      <PlaygroundInfoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={title}
        description={description}
        author={author}
        stats={stats}
        category={category}
        tags={tags}
        dependencies={requirementsList}
      />
    </div>
  );
}
