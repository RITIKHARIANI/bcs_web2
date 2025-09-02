import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { FacultyDashboard } from "@/components/faculty/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "faculty") {
    redirect("/");
  }

  return <FacultyDashboard user={session.user} />;
}
