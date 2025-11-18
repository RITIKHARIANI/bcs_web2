import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, ArrowRight, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StartedCourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    moduleCount: number;
    instructor: {
      id: string;
      name: string;
      avatarUrl: string | null;
      university: string | null;
    };
  };
  startedAt: string;
  lastAccessed: string;
}

export function StartedCourseCard({ course, startedAt, lastAccessed }: StartedCourseCardProps) {
  const startedDate = new Date(startedAt);
  const accessedDate = new Date(lastAccessed);

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="cognitive-card group h-full transition-all duration-200 hover:shadow-lg hover:border-neural-primary/30">
        <div className="p-6 flex flex-col h-full">
          {/* Course Title */}
          <h3 className="text-xl font-bold text-neural-primary mb-2 group-hover:text-synapse-primary transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
              {course.description}
            </p>
          )}

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            {course.instructor.avatarUrl ? (
              <Image
                src={course.instructor.avatarUrl}
                alt={course.instructor.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-3 w-3 text-gray-500" />
              </div>
            )}
            <span className="text-gray-700">{course.instructor.name}</span>
            {course.instructor.university && (
              <span className="text-gray-500">• {course.instructor.university}</span>
            )}
          </div>

          {/* Module Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <BookOpen className="h-4 w-4" />
            <span>{course.moduleCount} {course.moduleCount === 1 ? 'module' : 'modules'}</span>
          </div>

          {/* Timestamps */}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Started {formatDistanceToNow(startedDate, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Last accessed {formatDistanceToNow(accessedDate, { addSuffix: true })}</span>
            </div>
          </div>

          {/* Continue Learning Button */}
          <button className="mt-auto flex items-center justify-center gap-2 w-full py-2 px-4 bg-gradient-to-r from-neural-primary to-synapse-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
            Continue Learning
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
