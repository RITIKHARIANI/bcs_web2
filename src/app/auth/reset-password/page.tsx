import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neural-light via-background to-cognition-teal/20 p-4">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gradient-to-r from-neural-light/30 to-neural-primary/30 rounded mb-4"></div>
        <div className="h-4 w-32 bg-gradient-to-r from-neural-primary/30 to-neural-light/30 rounded"></div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}