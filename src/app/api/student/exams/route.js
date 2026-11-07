import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStudent } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

function isSetCoveredByPackage(set, pkgName) {
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

  // Japanese Mock Test packages cover Japanese mock sets
  if (targetPkgNorm.includes('mock') || targetPkgNorm.includes('jlpt') || targetPkgNorm.includes('jft') || targetPkgNorm.includes('nat')) {
    if (isJp) return true;
    if (setPkgNorm.includes('mock') || setPkgNorm.includes('jlpt') || setPkgNorm.includes('jft') || setPkgNorm.includes('nat')) return true;
  }

  return false;
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

    // Map sets with unlocked status based on institute packages, ownership, and releases
    const instituteReleasedSetIds = new Set(
      (studentUser?.institute?.examSets || []).map(ies => ies.examSetId)
    );

    const enrichedSets = sets.map(set => {
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

      const isCoveredByInstitutePkg = Boolean(
        institutePkg && isSetCoveredByPackage(set, institutePkg)
      );

      const isCoveredByStudentPkg = Boolean(
        assignedPkg && isSetCoveredByPackage(set, assignedPkg)
      );

      const isUnlocked = Boolean(
        isFree ||
        isCreatedByMyInstitute ||
        isExplicitlyReleasedToInstitute ||
        isCoveredByInstitutePkg ||
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
