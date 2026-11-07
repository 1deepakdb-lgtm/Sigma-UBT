import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStudent } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

function isSetCoveredBySinglePackage(set, pkgName) {
  if (!set || !pkgName) return false;
  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetPkgNorm = norm(pkgName);
  const setPkgNorm = norm(set.packageName || set.package?.name || '');
  const setNameNorm = norm(set.name || '');
  const isJp = Boolean(
    set.setType === 'MOCK' ||
    set.track === 'japanese' ||
    setNameNorm.includes('mock') ||
    setNameNorm.includes('jlpt') ||
    setNameNorm.includes('jft') ||
    setNameNorm.includes('nat')
  );

  // Direct Specific Exam / Particular Exam Set match
  const cleanTarget = targetPkgNorm.replace('specificexam', '');
  if (setNameNorm && (targetPkgNorm === setNameNorm || cleanTarget === setNameNorm || (set.id && targetPkgNorm === norm(set.id)))) {
    return true;
  }

  if (setPkgNorm && targetPkgNorm === setPkgNorm) return true;
  if (targetPkgNorm.includes('chapter') && (setPkgNorm.includes('chapter') || setNameNorm.includes('chapter'))) return true;
  if (targetPkgNorm.includes('100') && (setPkgNorm.includes('100') || setNameNorm.includes('100'))) return true;
  if (targetPkgNorm.includes('model') && (setPkgNorm.includes('model') || setNameNorm.includes('model'))) return true;

  // Korean Full Set UBT covers standard UBT sets
  if (
    targetPkgNorm.includes('full') &&
    !targetPkgNorm.includes('mock') &&
    !isJp &&
    !setPkgNorm.includes('chapter') &&
    !setPkgNorm.includes('model') &&
    !setNameNorm.includes('chapter') &&
    !setNameNorm.includes('model')
  ) {
    return true;
  }

  // Japanese Full Mock Test package covers all Japanese mock sets
  if ((targetPkgNorm.includes('full') || targetPkgNorm.includes('all')) && targetPkgNorm.includes('mock')) {
    if (isJp) return true;
  }

  // Specific Japanese Package tracks
  if (targetPkgNorm.includes('jft') && (setNameNorm.includes('jft') || setPkgNorm.includes('jft'))) return true;
  if (targetPkgNorm.includes('nat') && (setNameNorm.includes('nat') || setPkgNorm.includes('nat'))) return true;
  if (targetPkgNorm.includes('jlpt') && (setNameNorm.includes('jlpt') || setPkgNorm.includes('jlpt'))) return true;
  if (targetPkgNorm.includes('mock') && (setPkgNorm.includes('mock') || setNameNorm.includes('mock'))) return true;

  return false;
}

function isSetCoveredByPackage(set, pkgName) {
  if (!set || !pkgName) return false;
  const parts = String(pkgName).split(',').map(s => s.trim()).filter(Boolean);
  return parts.some(item => isSetCoveredBySinglePackage(set, item));
}

export async function GET(req) {
  try {
    const { session, errorResponse } = await requireStudent(req);
    if (errorResponse) return errorResponse;

    // Fetch student profile including institute and assigned exam sets
    const studentUser = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        institute: {
          include: {
            examSets: true
          }
        }
      }
    });

    const instituteId = studentUser?.instituteId || session.instituteId || null;
    const institutePkg = studentUser?.institute?.examPackage || null;
    const studentBatch = studentUser?.batch || null;
    const shiftNames = ['morning', 'day', 'evening', 'night', 'afternoon'];
    const assignedPkg = (studentBatch && !shiftNames.includes(studentBatch.toLowerCase().trim())) ? studentBatch : null;

    // Filter sets based on strict institute isolation:
    // Students can see global published sets OR their own institute's sets
    const setsWhere = {
      OR: [
        { isPublished: true, isPrivate: false },
        ...(instituteId ? [{ creatorInstituteId: instituteId }] : [])
      ]
    };

    const sets = await prisma.examSet.findMany({
      where: setsWhere,
      include: {
        package: true,
        _count: { select: { questions: true } }
      },
      orderBy: { name: 'asc' }
    });

    // Check past results for this student
    const results = await prisma.examResult.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' }
    });

    // Check student language track for strict Korean vs Japanese isolation
    const studentLang = (studentUser?.institute?.language && studentUser.institute.language !== 'both')
      ? studentUser.institute.language
      : (studentUser?.language && studentUser.language !== 'both' ? studentUser.language : (studentUser?.institute?.language || studentUser?.language || 'both'));

    const isPureKorean = studentLang === 'korean';
    const isPureJapanese = studentLang === 'japanese';

    // Map sets with unlocked status based on institute packages, ownership, and releases
    const instituteReleasedSetIds = new Set(
      (studentUser?.institute?.examSets || []).map(ies => ies.examSetId)
    );

    const enrichedSets = sets
      .filter(set => {
        const setNameNorm = (set.name || '').toLowerCase();
        const setPkgNorm = (set.packageName || set.package?.name || '').toLowerCase();
        const isJp = Boolean(
          set.setType === 'MOCK' ||
          set.track === 'japanese' ||
          setNameNorm.includes('mock') ||
          setNameNorm.includes('jlpt') ||
          setNameNorm.includes('jft') ||
          setNameNorm.includes('nat') ||
          setPkgNorm.includes('mock')
        );

        // Korean students NEVER see Japanese sets
        if (isPureKorean && isJp) return false;
        // Japanese students NEVER see Korean UBT sets
        if (isPureJapanese && !isJp) return false;
        return true;
      })
      .map(set => {
        const isFree = Boolean(
          set.isFree ||
          set.setType === 'FREE' ||
          (set.name && set.name.toLowerCase().includes('free demo'))
        );

        const isCreatedByMyInstitute = Boolean(
          instituteId &&
          set.creatorInstituteId &&
          set.creatorInstituteId === instituteId
        );

        const isExplicitlyReleasedToInstitute = instituteReleasedSetIds.has(set.id);

        const isCoveredByStudentPkg = Boolean(
          assignedPkg && isSetCoveredByPackage(set, assignedPkg)
        );

        const isUnlocked = Boolean(
          isFree ||
          isExplicitlyReleasedToInstitute ||
          isCoveredByStudentPkg
        );

        return {
          id: set.id,
          name: set.name,
          packageName: set.packageName || set.package?.name || (set.setType === 'MOCK' ? 'Mock Test' : 'Full Set UBT'),
          packageId: set.packageId,
          creatorInstituteId: set.creatorInstituteId,
          creatorInstituteName: set.creatorInstituteName,
          isPrivate: set.isPrivate,
          isPublished: set.isPublished,
          isFree: set.isFree,
          setType: set.setType,
          duration: set.duration,
          questionsCount: set._count?.questions || 40,
          isUnlocked,
          isInstituteSet: isCreatedByMyInstitute || isExplicitlyReleasedToInstitute
        };
      });

    return NextResponse.json({
      sets: enrichedSets,
      pastResults: results,
      institute: studentUser?.institute ? {
        id: studentUser.institute.id,
        name: studentUser.institute.name,
        examPackage: studentUser.institute.examPackage,
        language: studentUser.institute.language,
        status: studentUser.institute.status
      } : null
    });
  } catch (err) {
    console.error('Error fetching student exams:', err);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}
