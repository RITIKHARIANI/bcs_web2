import { notFound } from "next/navigation";
import { CourseViewer } from "@/components/public/course-viewer";
import { PublicLayout } from "@/components/layouts/app-layout";

async function getCourse(slug: string) {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/public/courses/${slug}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch course: ${response.status} ${response.statusText}`);
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
      title: "Course Not Found - Brain & Cognitive Sciences",
      description: "The requested course could not be found.",
    };
  }

  return {
    title: `${course.title} - Brain & Cognitive Sciences`,
    description: course.description || `Learn about ${course.title} through interactive modules and comprehensive content.`,
    keywords: ["neuroscience", "cognitive science", "brain", "learning", course.title],
    openGraph: {
      title: `${course.title} - Brain & Cognitive Sciences`,
      description: course.description || `Learn about ${course.title} through interactive modules.`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} - Brain & Cognitive Sciences`,
      description: course.description || `Learn about ${course.title} through interactive modules.`,
    },
  };
}

export default async function CoursePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ module?: string; search?: string }>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  return (
    <PublicLayout>
      <CourseViewer course={course} initialModule={search?.module} initialSearch={search?.search} />
    </PublicLayout>
  );
}
