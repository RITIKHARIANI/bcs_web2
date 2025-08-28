import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { EditModuleForm } from '@/components/faculty/edit-module-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EditModulePageProps {
  params: Promise<{ id: string }>
}

export default async function EditModulePage({ params }: EditModulePageProps) {
  const session = await auth()
  const { id } = await params

  if (!session || session.user.role !== 'faculty') {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Edit Module
              </h1>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Update your module content and settings
              </p>
            </div>
            <Link href="/faculty/modules">
              <Button variant="ghost">
                ← Back to Modules
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <EditModuleForm moduleId={id} />
        </div>
      </main>
    </div>
  )
}
