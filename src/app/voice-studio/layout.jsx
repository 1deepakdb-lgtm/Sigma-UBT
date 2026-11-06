import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClientAuthGuard from '@/components/ClientAuthGuard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'AI Voice Studio — ExamJK',
  description: 'AI Voice Generation and Audio Management'
};

/**
 * Voice Studio Parent Layout
 * Enforces strict authentication for Voice Studio (/voice-studio)
 * on both server and client. Only admin role permitted.
 */
export default async function VoiceStudioLayout({ children }) {
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

