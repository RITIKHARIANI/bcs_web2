import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { redirect, notFound } from 'next/navigation';
import { CurriculumMapAuthenticated } from '@/components/curriculum/CurriculumMapAuthenticated';
import { CurriculumMapPublic } from '@/components/curriculum/CurriculumMapPublic';
import { Header } from '@/components/Header';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const path = await withDatabaseRetry(async () => {
    return await prisma.learning_paths.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true
      }
    });
  });

  if (!path) {
    return {
      title: 'Learning Path Not Found | BCS E-Textbook'
    };
  }

  return {
    title: `${path.title} | Learning Paths | BCS E-Textbook`,
    description: path.description || `Explore the ${path.title} learning path`
  };
}

export default async function LearningPathPage({ params }: PageProps) {
  const session = await auth();
  const { slug } = await params;

  // Fetch path to get title
  const path = await withDatabaseRetry(async () => {
    return await prisma.learning_paths.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true
      }
    });
  });

  if (!path) {
    notFound();
  }

  if (session?.user?.id) {
    return (
      <>
        <Header />
        <CurriculumMapAuthenticated
          userId={session.user.id}
          pathTitle={path.title}
          pathSlug={path.slug}
        />
      </>
    );
  }

  return (
    <>
      <Header />
      <CurriculumMapPublic
        pathTitle={path.title}
        pathSlug={path.slug}
      />
    </>
  );
}
