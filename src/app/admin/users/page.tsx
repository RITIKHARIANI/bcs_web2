import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import AdminUsersManagement from '@/components/admin/AdminUsersManagement';
import { AuthenticatedLayout } from '@/components/layouts/app-layout';

export default async function AdminUsersPage() {
  const session = await auth();

  // Check authentication
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Only admin can access
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-neural-900 via-neural-800 to-synapse-900 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="text-white">Loading users...</div>}>
            <AdminUsersManagement />
          </Suspense>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
