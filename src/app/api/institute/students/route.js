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
    const allowAll = searchParams.get('all') === 'true';

    const where = { role: 'student' };
    let targetInstId = null;

    if (session.role === 'admin') {
      if (queryInst && queryInst !== 'All') {
        let inst = await prisma.institute.findFirst({
          where: {
            OR: [
              { id: queryInst },
              { name: queryInst },
              { username: queryInst }
            ]
          }
        });

        // Also check if queryInst matches an institute user (e.g. name or username)
        if (!inst) {
          const instUser = await prisma.user.findFirst({
            where: {
              role: { in: ['institute', 'staff'] },
              OR: [
                { id: queryInst },
                { name: queryInst },
                { username: queryInst }
              ]
            },
            select: { instituteId: true }
          });
          if (instUser?.instituteId) {
            inst = await prisma.institute.findUnique({
              where: { id: instUser.instituteId }
            });
          }
        }

        if (inst) {
          targetInstId = inst.id;
        } else {
          // If a specific institute was requested by admin but does not exist, return empty array (prevent data leak)
          return NextResponse.json({ students: [] });
        }
      } else if (!allowAll) {
        // Guard: If admin calls without an institute query and without explicit ?all=true,
        // do not return all students to prevent data bleed into uninitialized panels
        return NextResponse.json({ students: [] });
      }
    } else {
      // STRICT TENANT ISOLATION: Institutes and staff can ONLY ever query their own students
      targetInstId = session.instituteId || null;
      if (!targetInstId && session.id) {
        const instUser = await prisma.user.findUnique({
          where: { id: session.id },
          select: { instituteId: true, username: true }
        });
        targetInstId = instUser?.instituteId || null;
        if (!targetInstId && instUser?.username) {
          const inst = await prisma.institute.findFirst({
            where: {
              OR: [
                { id: instUser.username },
                { username: instUser.username },
                { name: instUser.username }
              ]
            }
          });
          if (inst) targetInstId = inst.id;
        }
      }
      if (!targetInstId) {
        return NextResponse.json({ students: [] });
      }
    }

    if (targetInstId) {
      where.instituteId = targetInstId;
      // Normal institutes or institute-filtered views: NEVER show self-signup open students
      if (!targetInstId.startsWith('examjk-open')) {
        where.NOT = [
          { instituteId: { startsWith: 'examjk-open' } },
          { instituteId: null }
        ];
      }
    } else if (session.role !== 'admin' || !allowAll) {
      return NextResponse.json({ students: [] });
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
        instituteId: true,
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

    // Determine institute ID with strict tenant isolation
    let targetInstituteId = null;
    if (session && (session.role === 'institute' || session.role === 'staff')) {
      targetInstituteId = session.instituteId || null;
      if (!targetInstituteId && session.id) {
        const instUser = await prisma.user.findUnique({
          where: { id: session.id },
          select: { instituteId: true }
        });
        targetInstituteId = instUser?.instituteId || null;
      }
      if (!targetInstituteId) {
        return NextResponse.json({ error: 'Institute identity could not be verified' }, { status: 403 });
      }
    } else if (session && session.role === 'admin') {
      const searchTarget = reqInstId || reqInstName || session?.instituteName || null;
      if (searchTarget) {
        let inst = await prisma.institute.findFirst({
          where: {
            OR: [
              { id: searchTarget },
              { name: searchTarget },
              { username: searchTarget }
            ]
          }
        });
        if (!inst) {
          const instUser = await prisma.user.findFirst({
            where: {
              role: { in: ['institute', 'staff'] },
              OR: [
                { id: searchTarget },
                { name: searchTarget },
                { username: searchTarget }
              ]
            },
            select: { instituteId: true }
          });
          if (instUser?.instituteId) {
            inst = await prisma.institute.findUnique({
              where: { id: instUser.instituteId }
            });
          }
        }
        if (inst) targetInstituteId = inst.id;
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized to create or modify students' }, { status: 403 });
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
        where: { id: reqStudentId, role: 'student', instituteId: targetInstituteId }
      });
    }
    if (!existing) {
      existing = await prisma.user.findFirst({
        where: {
          role: 'student',
          instituteId: targetInstituteId,
          OR: orConditions
        }
      });
    }

    // Ensure username is valid without violating unique constraint of another user
    let finalUsername = cleanUsername;
    const existingWithSameUsername = await prisma.user.findUnique({ where: { username: finalUsername } });
    if (existingWithSameUsername && existingWithSameUsername.id !== existing?.id) {
      finalUsername = `${cleanUsername}-${targetInstituteId ? targetInstituteId.slice(0, 4) : Date.now().toString().slice(-4)}`;
      const secondCollision = await prisma.user.findUnique({ where: { username: finalUsername } });
      if (secondCollision && secondCollision.id !== existing?.id) {
        finalUsername = `${cleanUsername}-${Date.now().toString().slice(-4)}`;
      }
    }

    if (existing) {
      // Prevent cross-tenant IDOR: an institute cannot overwrite a student belonging to another institute or self-registered open users
      if (session?.role !== 'admin') {
        const isSelfRegistered = !existing.instituteId || existing.instituteId.startsWith('examjk-open');
        if (isSelfRegistered || existing.instituteId !== targetInstituteId) {
          return NextResponse.json({
            error: 'Forbidden. This student is registered under another institute or registered independently via open signup.'
          }, { status: 403 });
        }
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
    const deleteAll = searchParams.get('deleteAll');

    // Resolve caller's institute ID for authorization
    let callerInstId = null;
    if (session.role !== 'admin') {
      callerInstId = session.instituteId;
      if (!callerInstId && session.id) {
        const u = await prisma.user.findUnique({
          where: { id: session.id },
          select: { instituteId: true, username: true }
        });
        callerInstId = u?.instituteId;
        if (!callerInstId && u?.username) {
          const inst = await prisma.institute.findFirst({
            where: {
              OR: [
                { id: u.username },
                { username: u.username },
                { name: u.username }
              ]
            }
          });
          if (inst) callerInstId = inst.id;
        }
      }
      if (!callerInstId && session.id) {
        const inst = await prisma.institute.findUnique({ where: { id: session.id } });
        if (inst) callerInstId = inst.id;
      }
    }

    // Support bulk deletion for institute
    if (deleteAll === 'true' || id === 'all') {
      const targetInstId = session.role === 'admin' ? (searchParams.get('instituteId') || callerInstId) : callerInstId;
      if (!targetInstId) {
        return NextResponse.json({ error: 'Institute ID required for bulk student deletion' }, { status: 400 });
      }
      const studentsToDelete = await prisma.user.findMany({
        where: { role: 'student', instituteId: targetInstId },
        select: { id: true }
      });
      const ids = studentsToDelete.map(s => s.id);
      if (ids.length > 0) {
        await prisma.$transaction(async (tx) => {
          await tx.examResult.deleteMany({ where: { userId: { in: ids } } });
          await tx.examSession.deleteMany({ where: { userId: { in: ids } } });
          await tx.user.deleteMany({ where: { id: { in: ids } } });
        });
      }
      return NextResponse.json({ success: true, count: ids.length, message: `Successfully deleted ${ids.length} students` });
    }

    if (!id && !phone) return NextResponse.json({ error: 'ID or phone is required' }, { status: 400 });

    const digitsOnly = (phone || id || '').replace(/[^0-9]/g, '');
    const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    // Multi-factor lookup: match by exact id, phone, username, or last 10 digits
    let targetStudent = null;
    if (id && id.length > 15 && id.includes('-')) {
      targetStudent = await prisma.user.findFirst({ where: { id, role: 'student' } });
    }
    if (!targetStudent && phone) {
      targetStudent = await prisma.user.findFirst({
        where: {
          role: 'student',
          OR: [
            { phone: phone },
            { username: phone },
            ...(last10 && last10.length >= 6 ? [{ phone: { contains: last10 } }, { username: { contains: last10 } }] : [])
          ]
        }
      });
    }
    if (!targetStudent && id) {
      targetStudent = await prisma.user.findFirst({
        where: {
          role: 'student',
          OR: [
            { id: id },
            { phone: id },
            { username: id },
            ...(last10 && last10.length >= 6 ? [{ phone: { contains: last10 } }, { username: { contains: last10 } }] : [])
          ]
        }
      });
    }

    if (!targetStudent) {
      return NextResponse.json({ success: true, message: 'Student record not found in database or already deleted' });
    }

    // Validate ownership: non-admin institutes can only delete students belonging to their institute
    if (session.role !== 'admin') {
      const isOwner = callerInstId && targetStudent.instituteId === callerInstId;
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden. You do not own this student record.' }, { status: 403 });
      }
    }

    // Perform atomic cascaded deletion
    await prisma.$transaction(async (tx) => {
      await tx.examResult.deleteMany({ where: { userId: targetStudent.id } });
      await tx.examSession.deleteMany({ where: { userId: targetStudent.id } });
      await tx.user.delete({ where: { id: targetStudent.id } });
    });

    return NextResponse.json({ success: true, message: 'Student removed from database' });
  } catch (err) {
    console.error('Error deleting student:', err);
    return NextResponse.json({ error: 'Failed to delete student: ' + (err.message || String(err)) }, { status: 500 });
  }
}
