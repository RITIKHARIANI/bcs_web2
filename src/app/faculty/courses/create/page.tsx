import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { CreateCourseForm } from "@/components/faculty/create-course-form";

export default async function CreateCoursePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "faculty") {
    redirect("/");
  }

  return <CreateCourseForm />;
}
