import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { NetworkVisualization } from "@/components/faculty/network-visualization";
import { IntegratedGraphSystem } from "@/components/visualization/integrated-graph-system";

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
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interactive Course & Module Visualization</h1>
          <p className="text-muted-foreground">
            Design, visualize, and analyze course structures, module relationships, and educational pathways.
          </p>
        </div>
        
        {/* Enhanced Visualization System */}
        <IntegratedGraphSystem
          mode="faculty"
          className="h-[700px]"
        />
        
        {/* Legacy Network Visualization for Reference */}
        <div className="mt-12 border-t pt-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Legacy Network View</h2>
            <p className="text-sm text-muted-foreground">
              Original concept visualization for reference
            </p>
          </div>
          <NetworkVisualization />
        </div>
      </div>
    </div>
  );
}
