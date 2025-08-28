import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { NetworkVisualization } from "@/components/faculty/network-visualization";

export const metadata = {
  title: "Content Structure Visualization - BCS Faculty",
  description: "Interactive network visualization of your courses and module relationships",
};

export default async function VisualizationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "faculty") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <NetworkVisualization />
      </div>
    </div>
  );
}
