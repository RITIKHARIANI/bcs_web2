'use client';

import { useState } from 'react';
import { StartedCourseCard } from './StartedCourseCard';
import { ArrowDownAZ, Clock } from 'lucide-react';

interface Course {
  trackingId: string;
  startedAt: string;
  lastAccessed: string;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    status: string;
    moduleCount: number;
    instructor: {
      id: string;
      name: string;
      avatarUrl: string | null;
      university: string | null;
    };
  };
}

interface StartedCoursesListProps {
  courses: Course[];
}

export function StartedCoursesList({ courses: initialCourses }: StartedCoursesListProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');
  const [courses, setCourses] = useState(initialCourses);

  const handleSort = (newSort: 'recent' | 'alphabetical') => {
    setSortBy(newSort);

    const sorted = [...courses].sort((a, b) => {
      if (newSort === 'alphabetical') {
        return a.course.title.localeCompare(b.course.title);
      } else {
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
      }
    });

    setCourses(sorted);
  };

  if (courses.length === 0) {
    return null; // EmptyEnrollmentsState will be shown by parent
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <button
            onClick={() => handleSort('recent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'recent'
                ? 'bg-neural-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Recent
          </button>
          <button
            onClick={() => handleSort('alphabetical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'alphabetical'
                ? 'bg-neural-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowDownAZ className="h-3.5 w-3.5" />
            A-Z
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((courseData) => (
          <StartedCourseCard
            key={courseData.trackingId}
            course={courseData.course}
            startedAt={courseData.startedAt}
            lastAccessed={courseData.lastAccessed}
          />
        ))}
      </div>
    </div>
  );
}
