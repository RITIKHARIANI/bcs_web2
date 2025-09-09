import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

function RegisterContent() {
  return <RegisterForm />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
