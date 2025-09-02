"use client";

import { EnhancedCourseViewer } from './enhanced-course-viewer'

interface CourseViewerProps {
  course: any
  initialModule?: string
  initialSearch?: string
}

export function CourseViewer({ course, initialModule, initialSearch }: CourseViewerProps) {
  return (
    <EnhancedCourseViewer 
      course={course} 
      initialModule={initialModule}
      initialSearch={initialSearch}
    />
  )
}
