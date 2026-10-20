import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requireInstituteOrAdmin } from '@/lib/rbac';

export async function GET(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const where = { role: 'student' };
    if (session.role === 'institute') {
      where.instituteId = session.instituteId;
    }

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        batch: true,
        status: true,
        createdAt: true,
        institute: { select: { name: true } },
        _count: { select: { results: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ students });
  } catch (err) {
    console.error('Error fetching students:', err);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const {
      name,
      username,
      password = '123',
      phone = '',
      batch = 'Morning',
      status = 'Active',
      instituteId: reqInstId
    } = await req.json();

    if (!name || !username) {
      return NextResponse.json({ error: 'Name and username are required' }, { status: 400 });
    }

    // Determine institute ID
    let targetInstituteId = session.role === 'institute' ? session.instituteId : (reqInstId || null);
    if (targetInstituteId) {
      const inst = await prisma.institute.findFirst({
        where: {
          OR: [
            { id: targetInstituteId },
            { name: targetInstituteId },
            { username: targetInstituteId }
          ]
        }
      });
      if (inst) targetInstituteId = inst.id;
    }

    const passwordHash = await hashPassword(password || '1234');

    // Check if student with username or phone already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { username: username.toLowerCase() },
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          passwordHash,
          phone: phone || existing.phone,
          batch: batch || existing.batch,
          status: status || existing.status,
          instituteId: targetInstituteId || existing.instituteId
        },
        select: {
          id: true,
          name: true,
          username: true,
          phone: true,
          batch: true,
          status: true,
          createdAt: true
        }
      });
      return NextResponse.json({ success: true, student: updated, updated: true });
    }

    const student = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash,
        phone,
        batch,
        status,
        role: 'student',
        instituteId: targetInstituteId
      },
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        batch: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({ success: true, student });
  } catch (err) {
    console.error('Error creating student:', err);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // Validate ownership if institute
    if (session.role === 'institute') {
      const student = await prisma.user.findUnique({ where: { id } });
      if (!student || student.instituteId !== session.instituteId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Student removed' });
  } catch (err) {
    console.error('Error deleting student:', err);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
