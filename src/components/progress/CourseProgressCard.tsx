import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { NeuralButton } from '../ui/neural-button';

interface CourseProgressCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    instructor: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
    moduleCount: number;
  };
  progress: {
    completionPct: number;
    modulesCompleted: number;
    modulesTotal: number;
    lastAccessed: Date;
  };
}

export function CourseProgressCard({
  course,
  progress,
}: CourseProgressCardProps) {
  const { completionPct, modulesCompleted, modulesTotal } = progress;

  return (
    <div className="cognitive-card p-6 space-y-4">
      {/* Course Header */}
      <div>
        <Link
          href={`/courses/${course.slug}`}
          className="block group"
        >
          <h3 className="text-xl font-bold text-foreground group-hover:text-neural-primary transition-colors">
            {course.title}
          </h3>
        </Link>
        {course.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        )}
      </div>

      {/* Instructor Info */}
      <div className="flex items-center gap-2">
        {course.instructor.avatarUrl ? (
          <Image
            src={course.instructor.avatarUrl}
            alt={course.instructor.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-neural-light flex items-center justify-center text-xs font-medium text-neural-primary">
            {course.instructor.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm text-muted-foreground">
          {course.instructor.name}
        </span>
      </div>

      {/* Progress Bar */}
      <ProgressBar percentage={completionPct} />

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>
              {modulesCompleted}/{modulesTotal} modules
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              Last accessed {new Date(progress.lastAccessed).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <Link href={`/courses/${course.slug}`}>
          <NeuralButton variant="synaptic" className="w-full gap-2">
            {completionPct === 100 ? (
              <>
                <span>Review Course</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Continue Learning</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </NeuralButton>
        </Link>
      </div>
    </div>
  );
}
