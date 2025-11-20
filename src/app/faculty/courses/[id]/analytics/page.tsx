import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import CourseAnalyticsDashboard from '@/components/faculty/analytics/CourseAnalyticsDashboard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseAnalyticsPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  // Check authentication
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Only faculty and admin can access
  if (session.user.role !== 'faculty' && session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 via-neural-800 to-synapse-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-white">Loading analytics...</div>}>
          <CourseAnalyticsDashboard courseId={id} />
        </Suspense>
      </div>
    </div>
  );
}
