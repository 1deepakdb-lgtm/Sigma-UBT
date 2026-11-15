import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStudent } from '@/lib/rbac';

export async function POST(req, { params }) {
  try {
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

    // Access authorization check for student: All free sets are accessible by everyone across all devices
    const isFree = Boolean(
      examSet.isFree === true ||
      examSet.isFree === "true" ||
      examSet.isFree === 1 ||
      examSet.setType === 'FREE' ||
      examSet.distributionMode === 'free' ||
      examSet.isFreeForInstituteStudents === true ||
      examSet.price === 0 ||
      examSet.price === "0" ||
      examSet.price === "Rs. 0" ||
      (typeof examSet.price === "string" && examSet.price.toLowerCase().includes("free")) ||
      (examSet.name && examSet.name.toLowerCase().includes('free')) ||
      (examSet.packageName && examSet.packageName.toLowerCase().includes('free')) ||
      (examSet.packageName && examSet.packageName.toLowerCase().includes('model')) ||
      (examSet.name && (
        examSet.name.toLowerCase().includes('set 01') ||
        examSet.name.toLowerCase().includes('set 1') ||
        examSet.name.toLowerCase().includes('01~02') ||
        examSet.name.toLowerCase().includes('demo')
      )) ||
      examSet.source === 'model_question_bank' ||
      examSet.folder === 'Model Question Bank'
    );

    // Optional session check for free sets, required session check for paid sets
    const { session: realSession } = await requireStudent(req).catch(() => ({ session: null }));

    let studentPhone = '';
    let txnCode = '';
    try {
      const clonedReq = req.clone();
      const body = await clonedReq.json();
      studentPhone = body?.studentPhone || '';
      txnCode = body?.txnCode || '';
    } catch {}

    const cleanPhone = (studentPhone || realSession?.phone || realSession?.username || '').replace(/[^0-9]/g, '').slice(-10);
    const targetSetName = (examSet.name || '').trim().toUpperCase();
    const targetSetId = examSet.id ? String(examSet.id).trim() : '';
    const setPkgName = (examSet.packageName || examSet.package?.name || '').trim();

    // Check if student has an individually approved/released payment transaction for this set or package
    let approvedTx = null;
    if (realSession?.id || cleanPhone || txnCode) {
      const userConditions = [
        ...(realSession?.id ? [{ userId: realSession.id }] : []),
        ...(studentPhone ? [{ studentPhone: studentPhone }] : []),
        ...(cleanPhone ? [{ studentPhone: { contains: cleanPhone } }] : []),
        ...(txnCode ? [{ transactionCode: txnCode }, { transactionUuid: txnCode }] : [])
      ];

      const itemConditions = [
        ...(targetSetId ? [{ itemId: targetSetId }] : []),
        { itemId: targetSetName },
        { itemName: targetSetName },
        { itemName: examSet.name },
        ...(setPkgName ? [{ itemName: setPkgName }, { itemId: setPkgName }] : [])
      ];

      approvedTx = await prisma.paymentTransaction.findFirst({
        where: {
          AND: [
            ...(userConditions.length > 0 ? [{ OR: userConditions }] : []),
            { OR: itemConditions },
            { status: { in: ['COMPLETE', 'Released'] } }
          ]
        }
      });
    }

    // Default guest session for free exams or verified paid guest
    const session = realSession || (isFree || approvedTx ? {
      id: approvedTx?.userId || 'f4f85796-a608-44ef-a0e9-57461f32d215',
      role: 'student',
      name: approvedTx?.studentName || 'Student',
      phone: approvedTx?.studentPhone || studentPhone || '9800000000',
      instituteId: 'examjk-open'
    } : null);

    if (!isFree && !approvedTx) {
      if (!session) {
        return NextResponse.json({
          error: `Set "${examSet.name}" requires payment of Rs. 30. Please unlock via eSewa.`,
          requiresPayment: true,
          price: 30
        }, { status: 401 });
      }

      // Strict Institute Isolation:
      // If set is private to another institute, prevent access
      if (examSet.isPrivate && examSet.creatorInstituteId && examSet.creatorInstituteId !== session.instituteId) {
        return NextResponse.json({ error: 'Access denied: This exam set is private to its creator institute.' }, { status: 403 });
      }

      // Fetch student profile including institute details
      const studentUser = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
          institute: {
            include: { examSets: true }
          }
        }
      });

      // Check student language track for strict Korean vs Japanese isolation
      const studentLang = (studentUser?.institute?.language && studentUser.institute.language !== 'both')
        ? studentUser.institute.language
        : (studentUser?.language && studentUser.language !== 'both' ? studentUser.language : (studentUser?.institute?.language || studentUser?.language || 'both'));

      const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const setPkgNorm = norm(examSet.packageName || examSet.package?.name || '');
      const setNameNorm = norm(examSet.name || '');
      const isJp = Boolean(
        examSet.setType === 'MOCK' ||
        examSet.track === 'japanese' ||
        setNameNorm.includes('mock') ||
        setNameNorm.includes('jlpt') ||
        setNameNorm.includes('jft') ||
        setNameNorm.includes('nat') ||
        setPkgNorm.includes('mock')
      );

      // Strict Track Gate
      if (studentLang === 'korean' && isJp) {
        return NextResponse.json({
          error: 'Access denied: Korean track students cannot access Japanese mock tests.'
        }, { status: 403 });
      }

      if (studentLang === 'japanese' && !isJp) {
        return NextResponse.json({
          error: 'Access denied: Japanese track students cannot access Korean UBT exams.'
        }, { status: 403 });
      }

      const isInstituteStudent = Boolean(
        studentUser?.instituteId &&
        !studentUser.instituteId.startsWith('examjk-open') &&
        studentUser.institute &&
        !studentUser.institute.id.startsWith('examjk-open')
      );

      const instituteId = isInstituteStudent ? studentUser.instituteId : null;
      const studentBatch = studentUser?.batch || null;
      const shiftNames = ['morning', 'day', 'evening', 'night', 'afternoon'];

      const checkSinglePkg = (pkg) => {
        if (!pkg) return false;
        const pNorm = norm(pkg);
        const cleanP = pNorm.replace('specificexam', '');
        if (setNameNorm && (pNorm === setNameNorm || cleanP === setNameNorm || (examSet.id && pNorm === norm(examSet.id)))) return true;
        if (pNorm === setPkgNorm) return true;
        if (pNorm.includes('chapter') && (setPkgNorm.includes('chapter') || setNameNorm.includes('chapter'))) return true;
        if (pNorm.includes('100') && (setPkgNorm.includes('100') || setNameNorm.includes('100'))) return true;
        if (pNorm.includes('model') && (setPkgNorm.includes('model') || setNameNorm.includes('model'))) return true;
        if (pNorm.includes('full') && !pNorm.includes('mock') && !isJp && !setPkgNorm.includes('chapter') && !setPkgNorm.includes('model')) return true;
        if ((pNorm.includes('full') || pNorm.includes('all')) && pNorm.includes('mock') && isJp) return true;
        if (pNorm.includes('jft') && (setNameNorm.includes('jft') || setPkgNorm.includes('jft'))) return true;
        if (pNorm.includes('nat') && (setNameNorm.includes('nat') || setPkgNorm.includes('nat'))) return true;
        if (pNorm.includes('jlpt') && (setNameNorm.includes('jlpt') || setPkgNorm.includes('jlpt'))) return true;
        if (pNorm.includes('mock') && (setPkgNorm.includes('mock') || setNameNorm.includes('mock'))) return true;
        return false;
      };

      const checkPkg = (pkg) => {
        if (!pkg) return false;
        const parts = String(pkg).split(',').map(s => s.trim()).filter(Boolean);
        return parts.some(checkSinglePkg);
      };

      if (!approvedTx) {
        if (isInstituteStudent) {
          const assignedPkg = (studentBatch && !shiftNames.includes(studentBatch.toLowerCase().trim()) && !studentBatch.toLowerCase().includes('free'))
            ? studentBatch
            : (studentUser?.institute?.examPackage || null);

          const isMyInstituteSet = Boolean(instituteId && examSet.creatorInstituteId && examSet.creatorInstituteId === instituteId);
          const isExplicitlyReleased = Boolean(
            studentUser?.institute?.examSets?.some(ies => ies.examSetId === examSet.id)
          );

          const hasInstituteAccess = Boolean(
            isMyInstituteSet ||
            isExplicitlyReleased ||
            checkPkg(assignedPkg)
          );

          if (!hasInstituteAccess) {
            return NextResponse.json({
              error: `Set "${examSet.name}" requires payment of Rs. 30. Please unlock via eSewa to take this test.`,
              isLocked: true,
              requiresPayment: true,
              price: 30
            }, { status: 403 });
          }
        } else {
          // Self-registered student:
          const adminAssignedPkg = (studentBatch && !shiftNames.includes(studentBatch.toLowerCase().trim()) && !studentBatch.toLowerCase().includes('free') && !studentBatch.toLowerCase().includes('google') && !studentBatch.toLowerCase().includes('student'))
            ? studentBatch
            : null;

          const hasAdminAccess = Boolean(
            adminAssignedPkg && checkPkg(adminAssignedPkg)
          );

          if (!hasAdminAccess) {
            return NextResponse.json({
              error: `Set "${examSet.name}" requires payment of Rs. 30. Please unlock via eSewa to take this test.`,
              isLocked: true,
              requiresPayment: true,
              price: 30,
              requiresAdminGrant: true
            }, { status: 403 });
          }
        }
      }
    }

    const durationSeconds = examSet.duration || 3000;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationSeconds * 1000);

    // Create or retrieve ongoing exam session (use authenticated user ID or default student)
    const activeUserId = session?.id || "f4f85796-a608-44ef-a0e9-57461f32d215";
    const examSession = await prisma.examSession.create({
      data: {
        userId: activeUserId,
        examSetId: examSet.id,
        startedAt: now,
        expiresAt,
        status: 'IN_PROGRESS'
      }
    });

    // Prepare questions and answerSheet for seamless online & offline support
    const answerSheet = {};
    const questionsForStudent = examSet.questions.map(q => {
      let parsedOptions = [];
      try {
        parsedOptions = JSON.parse(q.optionsJson || '[]');
      } catch (e) {
        parsedOptions = [];
      }

      const qAns = q.answer !== undefined && q.answer !== null ? Number(q.answer) : null;
      if (qAns !== null) {
        answerSheet[q.id] = qAns;
        if (q.qIndex !== undefined) {
          answerSheet[q.qIndex] = qAns;
        }
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
        options: parsedOptions,
        answer: qAns
      };
    });

    // Fetch Institute Watermark if student has institute
    let watermark = '';
    if (session?.instituteId) {
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
      questions: questionsForStudent,
      answerSheet
    });
  } catch (err) {
    console.error('Error starting exam:', err);
    return NextResponse.json({ error: 'Failed to start exam' }, { status: 500 });
  }
}
