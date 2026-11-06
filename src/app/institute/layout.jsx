import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClientAuthGuard from '@/components/ClientAuthGuard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Institute Portal — ExamJK',
  description: 'Language Institute Portal and Exam Management'
};

const ALLOWED_ROLES = ['institute', 'admin', 'staff'];

/**
 * Institute Parent Layout
 * Enforces strict authentication for ALL institute routes (/institute, /institute/*)
 * on both server and client.
 */
export default async function InstituteLayout({ children }) {
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

