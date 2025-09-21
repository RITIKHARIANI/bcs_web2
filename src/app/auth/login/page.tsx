import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { PublicLayout } from "@/components/layouts/app-layout";

function LoginContent() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <PublicLayout showFooter={false}>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </PublicLayout>
  );
}
