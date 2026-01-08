/**
 * Playground Viewer Page
 *
 * Public page for students to view and interact with playgrounds.
 * Shows ONLY the interactive preview - no code editor.
 * Faculty members see an "Edit in Builder" button.
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getTemplateById } from '@/lib/react-playground/templates';
import { arrayToDependencies } from '@/lib/react-playground/sandpack-config';
import { ArrowLeft, Code } from 'lucide-react';
import PlaygroundViewerClient from '@/components/react-playground/PlaygroundViewerClient';

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function PlaygroundViewerPage({ params }: PageProps) {
  const { templateId } = await params;

  // Find the template
  const template = getTemplateById(templateId);

  if (!template) {
    notFound();
  }

  // Check if user is faculty (for "Edit in Builder" button)
  const session = await auth();
  const isFaculty = session?.user?.role === 'faculty' || session?.user?.role === 'admin';

  // Convert dependencies array to Sandpack format
  const dependencies = arrayToDependencies(template.dependencies || []);

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Header - fixed height */}
      <header className="h-14 flex items-center justify-between px-4 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/playgrounds"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="w-px h-6 bg-gray-700" />
          <div>
            <h1 className="text-white font-medium">{template.name}</h1>
            {template.description && (
              <p className="text-sm text-gray-400 truncate max-w-md hidden sm:block">{template.description}</p>
            )}
          </div>
        </div>

        {/* Edit button for faculty */}
        {isFaculty && (
          <Link
            href={`/playgrounds/builder?template=${template.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Edit in Builder</span>
            <span className="sm:hidden">Edit</span>
          </Link>
        )}
      </header>

      {/* Full-screen Preview - takes remaining height */}
      <div className="flex-1 min-h-0">
        <Suspense
          fallback={
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-neural-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading playground...</p>
              </div>
            </div>
          }
        >
          <PlaygroundViewerClient
            code={template.sourceCode}
            dependencies={dependencies}
            showConsole={true}
            className="h-full w-full"
          />
        </Suspense>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { templateId } = await params;
  const template = getTemplateById(templateId);

  if (!template) {
    return {
      title: 'Playground Not Found',
    };
  }

  return {
    title: `${template.name} | Interactive Lab`,
    description: template.description,
  };
}
