import { PublicLayout } from "@/components/layouts/app-layout";
import { PublicNetworkVisualization } from "@/components/public/public-network-visualization";

export const metadata = {
  title: "Course Network Visualization - Brain & Cognitive Sciences",
  description: "Explore the interconnected relationships between courses and modules in our Brain & Cognitive Sciences curriculum through an interactive network visualization.",
};

export default function NetworkPage() {
  return (
    <PublicLayout showFooter={false}>
      <div className="flex-1">
        <PublicNetworkVisualization />
      </div>
    </PublicLayout>
  );
}
