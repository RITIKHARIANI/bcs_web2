import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { CreateModuleForm } from '@/components/faculty/create-module-form'

interface CreateModulePageProps {
  searchParams: {
    parentId?: string
  }
}

export default async function CreateModulePage({ searchParams }: CreateModulePageProps) {
  const session = await auth()

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
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Module
              </h1>
              <p className="text-sm text-gray-600">
                Add a new learning module to your library
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <CreateModuleForm 
            parentModuleId={searchParams.parentId}
            user={session.user}
          />
        </div>
      </main>
    </div>
  )
}
