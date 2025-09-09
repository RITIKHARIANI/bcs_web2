import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { FacultyDashboard } from "@/components/faculty/dashboard";
import { AuthenticatedLayout } from "@/components/layouts/app-layout";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "faculty") {
    redirect("/");
  }

  return (
    <AuthenticatedLayout>
      <FacultyDashboard user={session.user} />
    </AuthenticatedLayout>
  );
}
