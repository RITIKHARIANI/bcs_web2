import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ModuleLibrary } from "@/components/faculty/module-library";

export default async function ModulesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "faculty") {
    redirect("/");
  }

  return <ModuleLibrary />;
}
