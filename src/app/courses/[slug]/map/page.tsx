import { Metadata } from 'next';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { QuestMapPublic } from '@/components/quest-map/QuestMapPublic';
import { QuestMapAuthenticated } from '@/components/quest-map/QuestMapAuthenticated';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Fetch course title for metadata
  const course = await prisma.courses.findUnique({
    where: { slug, status: 'published' },
    select: { title: true, description: true }
  });

  if (!course) {
    return {
      title: 'Quest Map - Course Not Found',
      description: 'The requested course could not be found.'
    };
  }

  return {
    title: `${course.title} - Quest Map`,
    description: course.description || `Interactive quest map for ${course.title}`,
    openGraph: {
      title: `${course.title} - Learning Quest Map`,
      description: course.description || `Explore the learning journey for ${course.title}`,
      type: 'website'
    }
  };
}

export default async function QuestMapPage({ params }: PageProps) {
  const session = await auth();
  const { slug } = await params;

  // Verify course exists
  const course = await prisma.courses.findUnique({
    where: { slug, status: 'published' },
    select: { id: true, title: true }
  });

  if (!course) {
    redirect('/courses');
  }

  // Determine which component to render based on authentication
  if (session?.user) {
    // Check if user is enrolled
    const enrollment = await prisma.course_tracking.findUnique({
      where: {
        course_id_user_id: {
          course_id: course.id,
          user_id: session.user.id
        }
      }
    });

    if (enrollment) {
      // User is enrolled - show personalized quest map
      return <QuestMapAuthenticated courseSlug={slug} userId={session.user.id} />;
    }
  }

  // Not logged in or not enrolled - show public preview
  return <QuestMapPublic courseSlug={slug} />;
}
