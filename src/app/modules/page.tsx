import { ModuleCatalog } from "@/components/public/module-catalog";
import { PublicLayout } from "@/components/layouts/app-layout";

export const metadata = {
  title: "Module Catalog - BCS Interactive Platform",
  description: "Explore individual learning modules in Brain and Cognitive Sciences. Interactive educational content created by expert faculty.",
};

export default function ModulesPage() {
  return (
    <PublicLayout>
      <ModuleCatalog />
    </PublicLayout>
  );
}
