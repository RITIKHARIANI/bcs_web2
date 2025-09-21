import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { DatabaseDebugViewer } from "@/components/debug/database-debug-viewer";

export default async function DatabaseDebugPage() {
  const session = await auth();

  // Only allow faculty to access debug pages
  if (!session?.user || session.user.role !== "faculty") {
    redirect("/auth/login");
  }

  return <DatabaseDebugViewer />;
}
