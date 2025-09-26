import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Suspense } from "react";

export const metadata = {
  title: "Forgot Password - BCS Platform",
  description: "Reset your password for the BCS Interactive Platform",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
