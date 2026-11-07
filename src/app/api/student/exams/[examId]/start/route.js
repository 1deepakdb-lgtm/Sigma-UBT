import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStudent } from '@/lib/rbac';

export async function POST(req, { params }) {
  try {
    const { session, errorResponse } = await requireStudent(req);
    if (errorResponse) return errorResponse;

    const { examId } = params;

    // Find exam set by ID or name
    let examSet = await prisma.examSet.findFirst({
      where: {
        OR: [
          { id: examId },
          { name: examId }
        ]
      },
      include: {
        package: true,
        questions: {
          orderBy: { qIndex: 'asc' }
        }
      }
    });

    // Fallback: If not found, use first available set
    if (!examSet) {
      examSet = await prisma.examSet.findFirst({
        include: {
          package: true,
          questions: {
            orderBy: { qIndex: 'asc' }
          }
        }
      });
    }

    if (!examSet) {
      return NextResponse.json({ error: 'Exam set not found' }, { status: 404 });
    }

    // Strict Institute Isolation:
    // If set is private to another institute, prevent access
    if (examSet.isPrivate && examSet.creatorInstituteId && examSet.creatorInstituteId !== session.instituteId) {
      return NextResponse.json({ error: 'Access denied: This exam set is private to its creator institute.' }, { status: 403 });
    }

    // Access authorization check for student
    const isFree = Boolean(
      examSet.isFree ||
      examSet.setType === 'FREE' ||
      (examSet.name && examSet.name.toLowerCase().includes('free demo'))
    );

    if (!isFree) {
      const studentUser = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
          institute: {
            include: { examSets: true }
          }
        }
      });

      const instituteId = studentUser?.instituteId || session.instituteId || null;
      const institutePkg = studentUser?.institute?.examPackage || null;
      const studentBatch = studentUser?.batch || null;
      const shiftNames = ['morning', 'day', 'evening', 'night', 'afternoon'];
      const assignedPkg = (studentBatch && !shiftNames.includes(studentBatch.toLowerCase().trim())) ? studentBatch : null;

      const isMyInstituteSet = Boolean(instituteId && examSet.creatorInstituteId && examSet.creatorInstituteId === instituteId);
      const isExplicitlyReleased = Boolean(
        studentUser?.institute?.examSets?.some(ies => ies.examSetId === examSet.id)
      );

      const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const setPkgNorm = norm(examSet.packageName || examSet.package?.name || '');
      const setNameNorm = norm(examSet.name || '');
      const isJp = Boolean(
        examSet.setType === 'MOCK' ||
        setNameNorm.includes('mock') ||
        setNameNorm.includes('jlpt') ||
        setNameNorm.includes('jft') ||
        setNameNorm.includes('nat')
      );

      const checkPkg = (pkg) => {
        if (!pkg) return false;
        const pNorm = norm(pkg);
        if (pNorm === setPkgNorm) return true;
        if (pNorm.includes('chapter') && (setPkgNorm.includes('chapter') || setNameNorm.includes('chapter'))) return true;
        if (pNorm.includes('100') && (setPkgNorm.includes('100') || setNameNorm.includes('100'))) return true;
        if (pNorm.includes('model') && (setPkgNorm.includes('model') || setNameNorm.includes('model'))) return true;
        if (pNorm.includes('full') && !pNorm.includes('mock') && !isJp && !setPkgNorm.includes('chapter') && !setPkgNorm.includes('model')) return true;
        if ((pNorm.includes('mock') || pNorm.includes('jlpt') || pNorm.includes('jft') || pNorm.includes('nat')) && isJp) return true;
        return false;
      };

      const hasAccess = Boolean(
        isMyInstituteSet ||
        isExplicitlyReleased ||
        checkPkg(institutePkg) ||
        checkPkg(assignedPkg)
      );

      if (!hasAccess) {
        return NextResponse.json({
          error: 'This exam set is locked. Please acquire the appropriate institute package or set access.'
        }, { status: 403 });
      }
    }

    const durationSeconds = examSet.duration || 3000;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationSeconds * 1000);

    // Create or retrieve ongoing exam session
    const examSession = await prisma.examSession.create({
      data: {
        userId: session.id,
        examSetId: examSet.id,
        startedAt: now,
        expiresAt,
        status: 'IN_PROGRESS'
      }
    });

    // Strip answers completely to prevent exam cheating
    const questionsWithoutAnswers = examSet.questions.map(q => {
      let parsedOptions = [];
      try {
        parsedOptions = JSON.parse(q.optionsJson || '[]');
      } catch (e) {
        parsedOptions = [];
      }

      return {
        id: q.id,
        qIndex: q.qIndex,
        type: q.type,
        mainHeading: q.mainHeading,
        questionHeading: q.questionHeading,
        description: q.description,
        image: q.image,
        audio: q.audio,
        options: parsedOptions
        // SECURITY: answer key is strictly stripped during active exam.
        // Grading and correct answer review is returned only by the server submit endpoint.
      };
    });

    // Fetch Institute Watermark if student has institute
    let watermark = '';
    if (session.instituteId) {
      const inst = await prisma.institute.findUnique({
        where: { id: session.instituteId },
        select: { watermarkText: true, logoUrl: true }
      });
      watermark = inst?.watermarkText || inst?.logoUrl || '';
    }

    return NextResponse.json({
      success: true,
      sessionId: examSession.id,
      examName: examSet.name,
      packageName: examSet.packageName || examSet.package?.name,
      duration: durationSeconds,
      expiresAt: expiresAt.toISOString(),
      watermark,
      questions: questionsWithoutAnswers
    });
  } catch (err) {
    console.error('Error starting exam:', err);
    return NextResponse.json({ error: 'Failed to start exam' }, { status: 500 });
  }
}
