import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStudent } from '@/lib/rbac';

export async function GET(req) {
  try {
    const { session, errorResponse } = await requireStudent(req);
    if (errorResponse) return errorResponse;

    // Get sets available
    const sets = await prisma.examSet.findMany({
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

    return NextResponse.json({ sets, pastResults: results });
  } catch (err) {
    console.error('Error fetching student exams:', err);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}
