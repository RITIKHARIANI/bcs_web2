import { redirect } from 'next/navigation';

// Redirect to the new generic progress page
// This route is kept for backwards compatibility
export default function StudentProgressPage() {
  redirect('/progress');
}
