import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClientAuthGuard from '@/components/ClientAuthGuard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard — ExamJK',
  description: 'Master Admin Control Panel'
};

/**
 * Admin Parent Layout
 * Enforces strict authentication for ALL admin routes (/admin, /admin/*)
 * on both server and client.
 */
export default async function AdminLayout({ children }) {
  const session = await getSessionUser();

  if (!session || session.role !== 'admin') {
    redirect('/?error=unauthorized');
  }

  return (
    <ClientAuthGuard allowedRoles={['admin']}>
      {children}
    </ClientAuthGuard>
  );
}
