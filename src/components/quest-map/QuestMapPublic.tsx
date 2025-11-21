'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Map as MapIcon, LogIn, Eye, BookOpen, Trophy } from 'lucide-react';
import Link from 'next/link';
import { NeuralButton } from '@/components/ui/neural-button';

interface Quest {
  id: string;
  title: string;
  slug: string;
  description: string;
  moduleNumber: string | null;
  position: { x: number; y: number };
  prerequisites: string[];
  xp: number;
  difficulty: string;
  estimatedMinutes: number | null;
  type: string;
  status: 'viewable';
}

interface QuestMapData {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    author: {
      name: string;
      email: string;
      avatar_url: string | null;
      title: string | null;
      department: string | null;
    };
    tags: string[];
    featured: boolean;
  };
  quests: Quest[];
  totalModules: number;
  totalXP: number;
}

interface QuestMapPublicProps {
  courseSlug: string;
}

export function QuestMapPublic({ courseSlug }: QuestMapPublicProps) {
  const [data, setData] = useState<QuestMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch public quest map data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseSlug}/map`);
        if (!response.ok) {
          throw new Error('Failed to fetch quest map');
        }
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching quest map:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseSlug]);

  // Update map dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setMapDimensions({
          width: containerRef.current.scrollWidth,
          height: containerRef.current.scrollHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [data]);

  // Calculate SVG paths for connections
  const connectionPaths = useMemo(() => {
    if (!data || mapDimensions.width === 0) return null;

    return data.quests.flatMap(quest =>
      quest.prerequisites.map(prereqId => {
        const prereq = data.quests.find(q => q.id === prereqId);
        if (!prereq) return null;

        const startX = (prereq.position.x / 100) * mapDimensions.width;
        const startY = (prereq.position.y / 100) * mapDimensions.height;
        const endX = (quest.position.x / 100) * mapDimensions.width;
        const endY = (quest.position.y / 100) * mapDimensions.height;

        const controlY1 = startY + (endY - startY) / 2;
        const controlY2 = startY + (endY - startY) / 2;

        return (
          <path
            key={`${prereq.id}-${quest.id}`}
            d={`M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`}
            fill="none"
            stroke="#64748b"
            strokeWidth="3"
            opacity="0.5"
            className="transition-all duration-300"
          />
        );
      })
    );
  }, [data, mapDimensions]);

  const handleNodeClick = (quest: Quest) => {
    router.push(`/courses/${courseSlug}/${quest.slug}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <div className="text-center">
          <MapIcon className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-400" />
          <p className="text-lg">Loading quest map...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <div className="text-center">
          <p className="text-lg text-red-400">Failed to load quest map</p>
          <Link href={`/courses/${courseSlug}`}>
            <NeuralButton variant="outline" className="mt-4">
              Back to Course
            </NeuralButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Public Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400 flex-shrink-0">
            <MapIcon size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold truncate">{data.course.title}</h1>
            <p className="text-xs text-slate-400">Course Quest Map • {data.totalModules} Modules • {data.totalXP} Total XP</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
          <Link href={`/courses/${courseSlug}`}>
            <NeuralButton variant="outline" size="sm" className="hidden sm:flex">
              <Eye className="h-4 w-4 mr-2" />
              View Course
            </NeuralButton>
            <NeuralButton variant="outline" size="sm" className="sm:hidden">
              <Eye className="h-4 w-4" />
            </NeuralButton>
          </Link>
          <Link href="/auth/login">
            <NeuralButton variant="neural" size="sm" className="hidden sm:flex">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to Track Progress
            </NeuralButton>
            <NeuralButton variant="neural" size="sm" className="sm:hidden">
              <LogIn className="h-4 w-4" />
            </NeuralButton>
          </Link>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative flex-1 overflow-auto custom-scrollbar" ref={containerRef}>
        <div className="relative w-full min-h-[800px] max-w-5xl mx-auto py-20 px-4">
          {/* SVG Connections */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
            {connectionPaths}
          </svg>

          {/* Quest Nodes */}
          {data.quests.map(quest => (
            <button
              key={quest.id}
              onClick={() => handleNodeClick(quest)}
              className="
                absolute w-16 h-16 -ml-8 -mt-8 rounded-full
                bg-slate-700 border-4 border-slate-600
                text-slate-300
                flex items-center justify-center
                transition-all duration-300 hover:scale-110
                hover:bg-slate-600 hover:border-slate-500
                focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-slate-950 focus:ring-blue-500
                cursor-pointer
                shadow-lg hover:shadow-xl
              "
              style={{
                left: `${quest.position.x}%`,
                top: `${quest.position.y}%`
              }}
            >
              {quest.type === 'boss' ? (
                <Trophy size={20} />
              ) : (
                <Eye size={20} />
              )}

              {/* Tooltip */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-10">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 border border-slate-700 text-slate-300 shadow-lg">
                  {quest.title}
                </span>
                <div className="text-center mt-1">
                  <span className="text-xs text-slate-500">{quest.xp} XP</span>
                  {quest.estimatedMinutes && (
                    <span className="text-xs text-slate-500 ml-2">~{quest.estimatedMinutes}min</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Call to Action Footer */}
      <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 text-center shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <p className="text-slate-300 text-sm sm:text-base">
              Sign in to track your progress, earn <span className="font-bold text-blue-400">{data.totalXP} XP</span>, and unlock achievements!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/login">
              <NeuralButton variant="neural" className="w-full sm:w-auto">
                Sign In
              </NeuralButton>
            </Link>
            <Link href="/auth/register">
              <NeuralButton variant="outline" className="w-full sm:w-auto">
                Create Account
              </NeuralButton>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
