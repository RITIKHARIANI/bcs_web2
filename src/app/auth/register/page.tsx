import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { PublicLayout } from "@/components/layouts/app-layout";

function RegisterContent() {
  return <RegisterForm />;
}

export default function RegisterPage() {
  return (
    <PublicLayout showFooter={false}>
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterContent />
      </Suspense>
    </PublicLayout>
  );
}
