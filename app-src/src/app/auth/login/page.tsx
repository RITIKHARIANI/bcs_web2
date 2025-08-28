import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            BCS E-Textbook Platform
          </h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Brain and Cognitive Sciences Department
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
