import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CoursesSection } from "@/components/CoursesSection";
import { NetworkVisualization } from "@/components/NetworkVisualization";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <CoursesSection />
        <NetworkVisualization />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
