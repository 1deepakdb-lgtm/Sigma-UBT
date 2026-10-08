import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStudent } from '@/lib/rbac';

export async function POST(req, { params }) {
  try {
    const { session, errorResponse } = await requireStudent(req);
    if (errorResponse) return errorResponse;

    const { sessionId, selectedAnswers = {} } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const examSession = await prisma.examSession.findUnique({
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

    if (!examSession) {
      return NextResponse.json({ error: 'Invalid exam session' }, { status: 404 });
    }

    if (examSession.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden session' }, { status: 403 });
    }

    const now = new Date();
    const questions = examSession.examSet.questions;

    let readingCorrect = 0;
    let listeningCorrect = 0;
    let totalCorrect = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const breakdown = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = q.qIndex;

      // Match student answer by ID first, then 1-based qIndex, then 0-based array index
      let rawAns = undefined;
      if (selectedAnswers[q.id] !== undefined) {
        rawAns = selectedAnswers[q.id];
      } else if (selectedAnswers[qNum] !== undefined) {
        rawAns = selectedAnswers[qNum];
      } else if (selectedAnswers[i] !== undefined) {
        rawAns = selectedAnswers[i];
      }

      const studentAns = (rawAns !== undefined && rawAns !== null && rawAns !== '') ? Number(rawAns) : -1;
      const isUnanswered = studentAns === -1 || isNaN(studentAns);
      const isCorrect = !isUnanswered && studentAns === q.answer;

      if (isUnanswered) {
        unansweredCount++;
      } else if (isCorrect) {
        totalCorrect++;
        if (q.type === 'Reading') readingCorrect++;
        else listeningCorrect++;
      } else {
        wrongCount++;
      }

      breakdown.push({
        qIndex: qNum,
        type: q.type,
        studentAnswer: studentAns,
        correctAnswer: q.answer,
        isCorrect
      });
    }

    // EPS-TOPIK: Reading 1-20 (5 pts each = 100), Listening 21-40 (5 pts each = 100). Total: 200 pts
    const readingScore = readingCorrect * 5;
    const listeningScore = listeningCorrect * 5;
    const totalScore = readingScore + listeningScore;
    const passed = totalScore >= 96; // Standard pass mark threshold

    // Save or update result
    const result = await prisma.examResult.upsert({
      where: { sessionId: examSession.id },
      update: {
        readingScore,
        listeningScore,
        totalScore,
        correctAnswers: totalCorrect,
        wrongAnswers: wrongCount,
        unanswered: unansweredCount,
        passed,
        answersJson: JSON.stringify(selectedAnswers)
      },
      create: {
        sessionId: examSession.id,
        userId: session.id,
        examSetId: examSession.examSetId,
        studentName: session.name || session.username,
        examName: examSession.examSet.name,
        readingScore,
        listeningScore,
        totalScore,
        totalQuestions: questions.length,
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
        totalQuestions: questions.length,
        correctAnswers: totalCorrect,
        wrongAnswers: wrongCount,
        unanswered: unansweredCount,
        passed,
        breakdown
      }
    });
  } catch (err) {
    console.error('Error submitting exam:', err);
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 });
  }
}
