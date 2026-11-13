import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStudent } from '@/lib/rbac';

export async function POST(req, { params }) {
  try {
    const { session, errorResponse } = await requireStudent(req);
    // If not authenticated via cookie, check if guest/student info is passed in body
    const body = await req.json();
    const { sessionId, selectedAnswers = {}, studentName: bodyName, studentPhone: bodyPhone } = body;

    let effectiveUserId = session?.id || null;
    let effectiveStudentName = session?.name || session?.username || bodyName || 'Student';

    if (!effectiveUserId) {
      // Find or fallback to open student user
      const guestPhone = bodyPhone || 'guest_student';
      let existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: guestPhone },
            { username: guestPhone }
          ]
        }
      });
      if (existingUser) {
        effectiveUserId = existingUser.id;
        effectiveStudentName = existingUser.name || existingUser.username || effectiveStudentName;
      } else {
        // Fallback to first available student or admin user
        const anyUser = await prisma.user.findFirst();
        if (anyUser) {
          effectiveUserId = anyUser.id;
        }
      }
    }

    const { examId } = params;
    const now = new Date();

    let examSession = null;
    if (sessionId && !sessionId.startsWith('offline_')) {
      examSession = await prisma.examSession.findUnique({
        where: { id: sessionId },
        include: {
          examSet: {
            include: {
              questions: {
                orderBy: { qIndex: 'asc' }
              }
            }
          }
        }
      });
    }

    // Auto-reconstruct session for offline submissions or when session ID was locally generated
    if (!examSession) {
      let examSet = await prisma.examSet.findFirst({
        where: {
          OR: [
            { id: examId },
            { name: examId },
            { name: decodeURIComponent(examId || '') }
          ]
        },
        include: {
          questions: {
            orderBy: { qIndex: 'asc' }
          }
        }
      });

      if (!examSet) {
        examSet = await prisma.examSet.findFirst({
          include: {
            questions: {
              orderBy: { qIndex: 'asc' }
            }
          }
        });
      }

      if (!examSet) {
        return NextResponse.json({ error: 'Exam set not found' }, { status: 404 });
      }

      examSession = await prisma.examSession.create({
        data: {
          userId: effectiveUserId || 'anonymous_student',
          examSetId: examSet.id,
          startedAt: new Date(Date.now() - 3000 * 1000),
          completedAt: now,
          status: 'SUBMITTED'
        },
        include: {
          examSet: {
            include: {
              questions: {
                orderBy: { qIndex: 'asc' }
              }
            }
          }
        }
      });
    }

    const questions = examSession.examSet.questions;

    let readingCorrect = 0;
    let listeningCorrect = 0;
    let totalCorrect = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const breakdown = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = q.qIndex !== undefined ? q.qIndex : (i + 1);

      // Match student answer by ID first, then string ID, then qIndex, then array index
      let rawAns = undefined;
      if (selectedAnswers[q.id] !== undefined) {
        rawAns = selectedAnswers[q.id];
      } else if (selectedAnswers[String(q.id)] !== undefined) {
        rawAns = selectedAnswers[String(q.id)];
      } else if (selectedAnswers[qNum] !== undefined) {
        rawAns = selectedAnswers[qNum];
      } else if (selectedAnswers[String(qNum)] !== undefined) {
        rawAns = selectedAnswers[String(qNum)];
      } else if (selectedAnswers[i] !== undefined) {
        rawAns = selectedAnswers[i];
      } else if (selectedAnswers[String(i)] !== undefined) {
        rawAns = selectedAnswers[String(i)];
      }

      const studentAns = (rawAns !== undefined && rawAns !== null && rawAns !== '') ? Number(rawAns) : -1;
      const isUnanswered = studentAns === -1 || isNaN(studentAns);
      
      const qAns = q.answer !== undefined && q.answer !== null ? Number(q.answer) : -999;
      let isCorrect = false;

      // Accommodate both 0-indexed (0=Opt1, 1=Opt2, 2=Opt3, 3=Opt4) and 1-indexed (1=Opt1, 2=Opt2)
      if (!isUnanswered && qAns !== -999) {
        if (studentAns === qAns || studentAns + 1 === qAns) {
          isCorrect = true;
        }
      }

      if (isUnanswered) {
        unansweredCount++;
      } else if (isCorrect) {
        totalCorrect++;
        if (q.type === 'Reading' || qNum <= 20) readingCorrect++;
        else listeningCorrect++;
      } else {
        wrongCount++;
      }

      breakdown.push({
        qIndex: qNum,
        type: q.type || (qNum <= 20 ? 'Reading' : 'Listening'),
        studentAnswer: studentAns,
        correctAnswer: q.answer,
        isCorrect
      });
    }

    // EPS-TOPIK: Reading 1-20 (5 pts each = 100), Listening 21-40 (5 pts each = 100). Total: 200 pts
    const readingScore = readingCorrect * 5;
    const listeningScore = listeningCorrect * 5;
    const totalScore = readingScore + listeningScore;
    const totalQuestions = questions.length > 0 ? questions.length : 40;
    const percentage = Math.round((totalCorrect / totalQuestions) * 100);
    const passed = percentage >= 40 || totalScore >= 96;

    // Save or update result in real-time
    const result = await prisma.examResult.upsert({
      where: { sessionId: examSession.id },
      update: {
        readingScore,
        listeningScore,
        totalScore,
        totalQuestions,
        correctAnswers: totalCorrect,
        wrongAnswers: wrongCount,
        unanswered: unansweredCount,
        passed,
        answersJson: JSON.stringify(selectedAnswers)
      },
      create: {
        sessionId: examSession.id,
        userId: effectiveUserId || examSession.userId,
        examSetId: examSession.examSetId,
        studentName: effectiveStudentName,
        examName: examSession.examSet.name,
        readingScore,
        listeningScore,
        totalScore,
        totalQuestions,
        correctAnswers: totalCorrect,
        wrongAnswers: wrongCount,
        unanswered: unansweredCount,
        passed,
        answersJson: JSON.stringify(selectedAnswers)
      }
    });

    await prisma.examSession.update({
      where: { id: examSession.id },
      data: {
        completedAt: now,
        status: 'SUBMITTED'
      }
    });

    return NextResponse.json({
      success: true,
      result: {
        id: result.id,
        examName: examSession.examSet.name,
        readingScore,
        listeningScore,
        totalScore,
        totalQuestions,
        correctAnswers: totalCorrect,
        readingCorrect,
        listeningCorrect,
        wrongAnswers: wrongCount,
        unanswered: unansweredCount,
        percentage,
        passed,
        breakdown
      }
    });
  } catch (err) {
    console.error('Error submitting exam:', err);
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 });
  }
}
