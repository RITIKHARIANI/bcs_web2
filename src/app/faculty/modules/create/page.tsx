import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { CreateModuleForm } from "@/components/faculty/create-module-form";

export default async function CreateModulePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "faculty") {
    redirect("/");
  }

  return <CreateModuleForm />;
}
