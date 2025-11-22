import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layouts/app-layout';
import { ContentModerationView } from '@/components/admin/ContentModerationView';
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Content Management | Admin Dashboard',
  description: 'Manage and moderate all courses and modules across the platform',
};

export default async function AdminContentPage() {
  const session = await auth();

  // Check authentication
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Check admin role
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-neural-primary to-synapse-primary rounded-lg">
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Content Management
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                View and moderate all courses and modules
              </p>
            </div>
          </div>
        </div>

        {/* Content Moderation Interface */}
        <ContentModerationView />
      </div>
    </AuthenticatedLayout>
  );
}
