import prisma from '@/lib/prisma';

/**
 * Ensures a dedicated Open Learning Institute exists for self-registered and Google students.
 * This guarantees free access to Korean & Japanese study materials, audio books, dictionaries,
 * and exam sets without institute dependency errors.
 */
export async function getOrCreateOpenInstitute(languageTrack = 'both') {
  try {
    const validLang = ['korean', 'japanese', 'both'].includes(languageTrack) ? languageTrack : 'both';

    let openInst = await prisma.institute.findFirst({
      where: {
        OR: [
          { username: 'examjk-open' },
          { name: { contains: 'ExamJK Open Academy' } }
        ]
      }
    });

    if (!openInst) {
      openInst = await prisma.institute.create({
        data: {
          id: 'examjk-open-academy',
          name: 'ExamJK Open Academy',
          username: 'examjk-open',
          subscription: 'Standard',
          entryDate: '2026-01-01',
          expireDate: '2099-12-31',
          examPackage: 'Full Set UBT',
          status: 'Active',
          logoUrl: '/examjk-logo.png',
          watermarkText: 'ExamJK Free Student',
          language: 'both' // Always both so students can switch between Korean & Japanese freely
        }
      });
    }

    return openInst;
  } catch (err) {
    console.error('getOrCreateOpenInstitute notice:', err);
    // Fallback: try to find any active institute
    const fallback = await prisma.institute.findFirst().catch(() => null);
    return fallback;
  }
}
