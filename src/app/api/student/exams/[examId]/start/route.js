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

    // Strip answers to prevent cheating
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
        options: parsedOptions,
        answer: q.answer
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
