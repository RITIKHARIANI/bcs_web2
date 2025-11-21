import { auth } from '@/lib/auth/config';
import { CurriculumMapAuthenticated } from '@/components/curriculum/CurriculumMapAuthenticated';
import { CurriculumMapPublic } from '@/components/curriculum/CurriculumMapPublic';
import { Header } from '@/components/Header';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Curriculum Map | BCS E-Textbook',
  description: 'Explore the complete curriculum and course relationships'
};

export default async function CurriculumMapPage() {
  const session = await auth();

  return (
    <>
      <Header />
      {session?.user?.id ? (
        <CurriculumMapAuthenticated userId={session.user.id} />
      ) : (
        <CurriculumMapPublic />
      )}
    </>
  );
}
