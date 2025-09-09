import { CourseCatalog } from "@/components/public/course-catalog";
import { PublicLayout } from "@/components/layouts/app-layout";

export const metadata = {
  title: "Course Catalog - BCS Interactive Platform",
  description: "Explore comprehensive courses in Brain and Cognitive Sciences. Interactive learning modules created by expert faculty.",
};

export default function CoursesPage() {
  return (
    <PublicLayout>
      <CourseCatalog />
    </PublicLayout>
  );
}