import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { CourseLibrary } from "@/components/faculty/course-library";

export default async function CoursesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "faculty") {
    redirect("/");
  }

  return <CourseLibrary />;
}
