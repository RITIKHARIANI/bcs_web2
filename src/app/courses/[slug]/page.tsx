import { notFound } from "next/navigation";
import { CourseViewer } from "@/components/public/course-viewer";
import { PublicLayout } from "@/components/layouts/app-layout";
import { prisma } from '@/lib/db';

async function getCourse(slug: string) {
  try {
    const course = await prisma.courses.findFirst({
      where: {
        slug,
        status: 'published', // Only show published courses publicly
      },
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        course_modules: {
          include: {
            modules: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                content: true,
                status: true,
                parent_module_id: true,
                sort_order: true,
                created_at: true,
                updated_at: true,
              },
            },
          },
          where: {
            modules: {
              status: 'published', // Only include published modules
            },
          },
          orderBy: {
            sort_order: 'asc',
          },
        },
        _count: {
          select: {
            course_modules: true,
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    // Transform data structure to match component expectations
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      featured: course.featured || false,
      status: course.status,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      author: {
        name: course.users.name,
        email: course.users.email,
      },
      courseModules: course.course_modules.map(cm => ({
        sortOrder: cm.sort_order,
        module: {
          id: cm.modules.id,
          title: cm.modules.title,
          slug: cm.modules.slug,
          description: cm.modules.description,
          content: cm.modules.content,
          status: cm.modules.status,
          parentModuleId: cm.modules.parent_module_id,
          sortOrder: cm.modules.sort_order,
          createdAt: cm.modules.created_at,
          updatedAt: cm.modules.updated_at,
        }
      })),
      _count: {
        courseModules: course._count.course_modules,
      },
    };
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
