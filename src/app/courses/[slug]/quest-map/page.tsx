import { auth } from '@/lib/auth/config';
import { QuestMapPublic } from '@/components/quest-map/QuestMapPublic';
import { QuestMapAuthenticated } from '@/components/quest-map/QuestMapAuthenticated';

interface QuestMapPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: QuestMapPageProps) {
  const { slug } = await params;
  return {
    title: `Quest Map - ${slug} | BCS E-Textbook`,
    description: 'Interactive quest map showing all modules and their prerequisites',
  };
}

export default async function QuestMapPage({ params }: QuestMapPageProps) {
  const session = await auth();
  const { slug } = await params;

  // Show authenticated version if logged in, public otherwise
  if (session?.user) {
    return <QuestMapAuthenticated courseSlug={slug} />;
  }

  return <QuestMapPublic courseSlug={slug} />;
}
