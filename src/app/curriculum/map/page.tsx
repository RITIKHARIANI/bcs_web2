import { auth } from '@/lib/auth/config';
import { CurriculumMapAuthenticated } from '@/components/curriculum/CurriculumMapAuthenticated';
import { CurriculumMapPublic } from '@/components/curriculum/CurriculumMapPublic';

export const metadata = {
  title: 'Curriculum Map | BCS E-Textbook',
  description: 'Explore the complete curriculum and course relationships'
};

export default async function CurriculumMapPage() {
  const session = await auth();

  if (session?.user?.id) {
    return <CurriculumMapAuthenticated userId={session.user.id} />;
  }

  return <CurriculumMapPublic />;
}
