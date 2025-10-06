import { CourseCatalog } from "@/components/public/course-catalog";
import { PublicLayout } from "@/components/layouts/app-layout";

export const metadata = {
  title: "Course Catalog - BCS Interactive Platform",
  description: "Explore comprehensive courses in Brain and Cognitive Sciences. Interactive learning modules created by expert faculty.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CoursesPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialSearch = typeof params.search === 'string' ? params.search : '';

  return (
    <PublicLayout>
      <CourseCatalog initialSearch={initialSearch} />
    </PublicLayout>
  );
}