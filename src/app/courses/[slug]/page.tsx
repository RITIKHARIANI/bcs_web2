import { notFound } from "next/navigation";
import { CourseViewer } from "@/components/public/course-viewer";

async function getCourse(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/courses/by-slug/${slug}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.course;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  
  if (!course) {
    return {
      title: "Course Not Found - BCS Interactive Platform",
    };
  }

  return {
    title: `${course.title} - BCS Interactive Platform`,
    description: course.description || `Learn about ${course.title} through interactive modules and comprehensive content.`,
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  return <CourseViewer course={course} />;
}
