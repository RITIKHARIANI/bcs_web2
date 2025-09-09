import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ModuleLibrary } from "@/components/faculty/module-library";
import { AuthenticatedLayout } from "@/components/layouts/app-layout";

export default async function ModulesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "faculty") {
    redirect("/");
  }

  return (
    <AuthenticatedLayout>
      <ModuleLibrary />
    </AuthenticatedLayout>
  );
}
