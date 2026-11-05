import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClientAuthGuard from '@/components/ClientAuthGuard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Student Portal — ExamJK',
  description: 'Student Exam Center and Dashboard'
};

const ALLOWED_ROLES = ['student', 'admin', 'institute'];

/**
 * Student Parent Layout
 * Enforces strict authentication for ALL student routes (/student, /student/*)
 * on both server and client.
 */
export default async function StudentLayout({ children }) {
  const session = await getSessionUser();

  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    redirect('/?error=unauthorized');
  }

  return (
    <ClientAuthGuard allowedRoles={ALLOWED_ROLES}>
      {children}
    </ClientAuthGuard>
  );
}
