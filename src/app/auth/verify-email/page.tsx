import { Suspense } from 'react'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'
import { Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neural-light via-background to-cognition-teal/20 p-4">
      <Card className="cognitive-card max-w-md w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4 text-center">
            <Mail className="h-12 w-12 text-neural-primary mx-auto" />
            <div className="h-4 bg-gradient-to-r from-neural-light/30 to-neural-primary/30 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gradient-to-r from-neural-primary/30 to-neural-light/30 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailForm />
    </Suspense>
  )
}