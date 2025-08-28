import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { Button } from '@/components/ui/button'
import { HierarchicalModuleLibrary } from '@/components/faculty/hierarchical-module-library'
import Link from 'next/link'
import { ModuleManagementPage } from '@/components/faculty/module-management-page'

export default async function ModulesPage() {
  const session = await auth()

  if (!session || session.user.role !== 'faculty') {
    redirect('/auth/login')
  }

  return <ModuleManagementPage />
}
