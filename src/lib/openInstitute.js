import prisma from '@/lib/prisma';

/**
 * Ensures a dedicated Open Learning Institute exists for self-registered and Google students.
 * This guarantees free access to Korean & Japanese study materials, audio books, dictionaries,
 * and exam sets without institute dependency errors.
 */
export async function getOrCreateOpenInstitute(languageTrack = 'both') {
  try {
    const validLang = ['korean', 'japanese', 'both'].includes(languageTrack) ? languageTrack : 'both';

    const configMap = {
      korean: {
        id: 'examjk-open-korean',
        username: 'examjk-open-korean',
        name: 'ExamJK Korean Academy',
        watermarkText: 'ExamJK Korean Student',
        language: 'korean'
      },
      japanese: {
        id: 'examjk-open-japanese',
        username: 'examjk-open-japanese',
        name: 'ExamJK Japanese Academy',
        watermarkText: 'ExamJK Japanese Student',
        language: 'japanese'
      },
      both: {
        id: 'examjk-open-academy',
        username: 'examjk-open',
        name: 'ExamJK Open Academy',
        watermarkText: 'ExamJK Free Student',
        language: 'both'
      }
    };

    const target = configMap[validLang] || configMap.both;

    let openInst = await prisma.institute.findFirst({
      where: {
        OR: [
          { id: target.id },
          { username: target.username },
          { name: target.name }
        ]
      }
    });

    if (!openInst) {
      openInst = await prisma.institute.create({
        data: {
          id: target.id,
          name: target.name,
          username: target.username,
          subscription: 'Free Access',
          entryDate: '2026-01-01',
          expireDate: '2099-12-31',
          examPackage: 'Free Student Access',
          status: 'Active',
          logoUrl: '/examjk-logo.png',
          watermarkText: target.watermarkText,
          language: target.language
        }
      });
    } else if (openInst.language !== target.language || openInst.examPackage !== 'Free Student Access') {
      // Ensure language and free package match config
      openInst = await prisma.institute.update({
        where: { id: openInst.id },
        data: {
          language: target.language,
          examPackage: 'Free Student Access'
        }
      });
    }

    return openInst;
  } catch (err) {
    console.error('getOrCreateOpenInstitute notice:', err);
    return null;
  }
}
