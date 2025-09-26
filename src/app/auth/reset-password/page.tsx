import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export const metadata = {
  title: "Reset Password - BCS Platform",
  description: "Set a new password for your BCS Platform account",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
