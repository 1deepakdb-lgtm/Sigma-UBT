import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireInstituteOrAdmin } from '@/lib/rbac';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const setId = searchParams.get('setId');
    const setName = searchParams.get('setName');
    const type = searchParams.get('type');

    const where = {};
    if (setId) where.examSetId = setId;
    if (setName) {
      where.examSet = { name: setName };
    }
    if (type) where.type = type;

    const questions = await prisma.question.findMany({
      where,
      include: {
        examSet: {
          select: { id: true, name: true, packageName: true }
        }
      },
      orderBy: { qIndex: 'asc' }
    });

    const parsed = questions.map(q => ({
      ...q,
      options: JSON.parse(q.optionsJson || '[]')
    }));

    return NextResponse.json({ questions: parsed });
  } catch (err) {
    console.error('Error fetching questions:', err);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const {
      examSetId,
      qIndex = 1,
      type = 'Reading',
      mainHeading = '',
      questionHeading = '',
      description = '',
      image = '',
      audio = '',
      options = [],
      answer = 0
    } = await req.json();

    if (!examSetId) {
      return NextResponse.json({ error: 'examSetId is required' }, { status: 400 });
    }

    const created = await prisma.question.create({
      data: {
        examSetId,
        qIndex: Number(qIndex),
        type,
        mainHeading,
        questionHeading: String(questionHeading || qIndex),
        description,
        image,
        audio,
        optionsJson: JSON.stringify(options),
        answer: Number(answer)
      }
    });

    return NextResponse.json({
      success: true,
      question: {
        ...created,
        options: JSON.parse(created.optionsJson)
      }
    });
  } catch (err) {
    console.error('Error creating question:', err);
    return NextResponse.json({ error: 'Failed to save question' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const {
      id,
      qIndex,
      type,
      mainHeading,
      questionHeading,
      description,
      image,
      audio,
      options,
      answer
    } = await req.json();

    if (!id) return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });

    const updateData = {};
    if (qIndex !== undefined) updateData.qIndex = Number(qIndex);
    if (type !== undefined) updateData.type = type;
    if (mainHeading !== undefined) updateData.mainHeading = mainHeading;
    if (questionHeading !== undefined) updateData.questionHeading = String(questionHeading);
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (audio !== undefined) updateData.audio = audio;
    if (options !== undefined) updateData.optionsJson = JSON.stringify(options);
    if (answer !== undefined) updateData.answer = Number(answer);

    const updated = await prisma.question.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      question: {
        ...updated,
        options: JSON.parse(updated.optionsJson)
      }
    });
  } catch (err) {
    console.error('Error updating question:', err);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    console.error('Error deleting question:', err);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
