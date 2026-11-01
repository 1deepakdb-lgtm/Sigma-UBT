import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requireInstituteOrAdmin } from '@/lib/rbac';

export async function GET(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const queryInst = searchParams.get('institute') || searchParams.get('instituteId') || searchParams.get('instituteName');

    const where = { role: 'student' };
    let targetInstId = null;

    if (session.role === 'admin') {
      if (queryInst && queryInst !== 'All') {
        const inst = await prisma.institute.findFirst({
          where: {
            OR: [
              { id: queryInst },
              { name: queryInst },
              { username: queryInst }
            ]
          }
        });
        if (inst) targetInstId = inst.id;
      }
    } else {
      // Institutes and staff can ONLY query their own students
      targetInstId = session.instituteId;
    }

    if (targetInstId) {
      where.instituteId = targetInstId;
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
        language: true,
        createdAt: true,
        institute: { select: { id: true, name: true, language: true } },
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

    const body = await req.json();
    const {
      id: reqStudentId,
      name,
      username,
      password = '1234',
      phone = '',
      batch = 'Full Set UBT',
      status = 'Active',
      language = 'both',
      instituteId: reqInstId,
      instituteName: reqInstName
    } = body;

    const rawName = (name || '').trim();
    const rawPhone = (phone || username || '').trim();

    if (!rawName || !rawPhone) {
      return NextResponse.json({ error: 'Student name and phone number are required' }, { status: 400 });
    }

    // Clean and normalize phone number
    const digitsOnly = rawPhone.replace(/[^0-9]/g, '');
    const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
    const cleanUsername = last10 || rawPhone;
    const cleanPhone = last10 || rawPhone;
    const cleanPassword = (password || '1234').toString().trim() || '1234';

    // Determine institute ID with multi-level fallback
    let targetInstituteId = null;
    if (session && session.role === 'institute' && session.instituteId) {
      targetInstituteId = session.instituteId;
    } else {
      const searchTarget = reqInstId || reqInstName || session?.instituteName || null;
      if (searchTarget) {
        const inst = await prisma.institute.findFirst({
          where: {
            OR: [
              { id: searchTarget },
              { name: searchTarget },
              { username: searchTarget }
            ]
          }
        });
        if (inst) targetInstituteId = inst.id;
      }
      if (!targetInstituteId) {
        const defaultInst = await prisma.institute.findFirst();
        if (defaultInst) targetInstituteId = defaultInst.id;
      }
    }

    const passwordHash = await hashPassword(cleanPassword);

    // Build comprehensive search terms to find existing student
    const candidateTerms = Array.from(new Set([
      cleanUsername,
      rawPhone,
      digitsOnly,
      last10,
      `+977${last10}`,
      `+977-${last10}`
    ].filter(Boolean)));

    const orConditions = [];
    for (const term of candidateTerms) {
      orConditions.push({ username: term });
      orConditions.push({ phone: term });
    }
    if (last10 && last10.length >= 6) {
      orConditions.push({ username: { contains: last10 } });
      orConditions.push({ phone: { contains: last10 } });
    }

    let existing = null;
    if (reqStudentId && typeof reqStudentId === 'string' && reqStudentId.length > 10) {
      existing = await prisma.user.findFirst({
        where: { id: reqStudentId, role: 'student' }
      });
    }
    if (!existing) {
      existing = await prisma.user.findFirst({
        where: {
          role: 'student',
          OR: orConditions
        }
      });
    }

    // Ensure username is valid without violating unique constraint of another user
    let finalUsername = cleanUsername;
    const existingWithSameUsername = await prisma.user.findUnique({ where: { username: finalUsername } });
    if (existingWithSameUsername && existingWithSameUsername.id !== existing?.id) {
      finalUsername = `${cleanUsername}-${Date.now().toString().slice(-4)}`;
    }

    if (existing) {
      // Prevent cross-tenant IDOR: an institute cannot overwrite a student belonging to another institute
      if (session?.role !== 'admin' && existing.instituteId && existing.instituteId !== targetInstituteId) {
        return NextResponse.json({
          error: 'Forbidden. This student is registered under another institute.'
        }, { status: 403 });
      }

      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: rawName,
          username: finalUsername,
          passwordHash,
          phone: cleanPhone,
          batch: batch || existing.batch || 'Full Set UBT',
          status: status || 'Active',
          language: language ? language.toLowerCase() : (existing.language || 'both'),
          instituteId: targetInstituteId || existing.instituteId
        },
        select: {
          id: true,
          name: true,
          username: true,
          phone: true,
          batch: true,
          status: true,
          language: true,
          createdAt: true
        }
      });
      return NextResponse.json({ success: true, student: updated, updated: true });
    }

    const student = await prisma.user.create({
      data: {
        name: rawName,
        username: finalUsername,
        passwordHash,
        phone: cleanPhone,
        batch: batch || 'Full Set UBT',
        status: status || 'Active',
        role: 'student',
        language: (language || 'both').toLowerCase(),
        instituteId: targetInstituteId
      },
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        batch: true,
        status: true,
        language: true,
        createdAt: true
      }
    });

    return NextResponse.json({ success: true, student });
  } catch (err) {
    console.error('Error creating student:', err);
    return NextResponse.json({ error: 'Failed to create student: ' + err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const phone = searchParams.get('phone');

    if (!id && !phone) return NextResponse.json({ error: 'ID or phone is required' }, { status: 400 });

    const digitsOnly = (phone || '').replace(/[^0-9]/g, '');
    const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    const where = id ? { id } : {
      OR: [
        { phone },
        { username: phone },
        ...(last10 ? [{ phone: { contains: last10 } }, { username: { contains: last10 } }] : [])
      ]
    };

    const targetStudent = await prisma.user.findFirst({ where });
    if (!targetStudent) {
      return NextResponse.json({ success: true, message: 'Student not found in database or already deleted' });
    }

    // Validate ownership: non-admin institutes can only delete students belonging to their institute
    if (session.role !== 'admin') {
      if (!targetStudent.instituteId || targetStudent.instituteId !== session.instituteId) {
        return NextResponse.json({ error: 'Forbidden. You do not own this student record.' }, { status: 403 });
      }
    }

    await prisma.user.delete({ where: { id: targetStudent.id } });
    return NextResponse.json({ success: true, message: 'Student removed' });
  } catch (err) {
    console.error('Error deleting student:', err);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
