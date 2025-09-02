import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { EditModuleForm } from "@/components/faculty/edit-module-form";

export default async function EditModulePage({
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

  return <EditModuleForm moduleId={id} />;
}
