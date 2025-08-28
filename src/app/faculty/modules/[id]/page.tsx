import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ModuleViewer } from "@/components/faculty/module-viewer";

export default async function ModuleViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "faculty") {
    redirect("/");
  }

  const { id } = await params;

  return <ModuleViewer moduleId={id} />;
}
