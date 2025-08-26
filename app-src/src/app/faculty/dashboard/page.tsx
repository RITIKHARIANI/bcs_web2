import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { FacultyDashboard } from '@/components/faculty/dashboard'

export default async function FacultyDashboardPage() {
  const session = await auth()

  if (!session || session.user.role !== 'faculty') {
    redirect('/auth/login')
  }

  return <FacultyDashboard user={session.user} />
}
