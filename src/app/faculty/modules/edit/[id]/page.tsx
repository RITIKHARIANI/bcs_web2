import { auth } from "@/lib/auth/config";
import { redirect, notFound } from "next/navigation";
import { EditModuleForm } from "@/components/faculty/edit-module-form";
import { prisma } from "@/lib/db";

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

  // Check if user is authorized to edit this module
  const module = await prisma.modules.findUnique({
    where: { id },
    select: {
      id: true,
      author_id: true,
      module_collaborators: {
        where: { user_id: session.user.id },
        select: { id: true },
      },
    },
  });

  if (!module) {
    notFound();
  }

  // User must be either the author or a collaborator
  const isAuthor = module.author_id === session.user.id;
  const isCollaborator = module.module_collaborators.length > 0;

  if (!isAuthor && !isCollaborator) {
    redirect("/faculty/dashboard?error=unauthorized");
  }

  return <EditModuleForm moduleId={id} />;
}
