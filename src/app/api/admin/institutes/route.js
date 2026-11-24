import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

function addMonths(dateString, months) {
  const d = new Date(dateString + 'T00:00:00');
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().slice(0, 10);
}

function calculateExpiry(entryDate, subscription) {
  if (subscription === 'Lifetime') return '2099-12-31';
  let months = 1;
  if (subscription === '3 Months') months = 3;
  else if (subscription === '6 Months') months = 6;
  else if (subscription === '1 Year') months = 12;
  return addMonths(entryDate, months);
}

export async function GET(req) {
  try {
    const { session, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const institutes = await prisma.institute.findMany({
      include: {
        _count: {
          select: { users: { where: { role: 'student' } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = institutes.map(inst => {
      const isLifetime = inst.subscription === 'Lifetime' || (inst.expireDate && inst.expireDate >= '2099-01-01');
      const isExpired = !isLifetime && inst.expireDate && new Date(inst.expireDate + 'T23:59:59') < new Date();
      return {
        ...inst,
        studentCount: inst._count.users,
        status: isExpired ? 'Expired' : inst.status
      };
    });

    return NextResponse.json({ institutes: formatted });
  } catch (err) {
    console.error('Error fetching institutes:', err);
    return NextResponse.json({ error: 'Failed to fetch institutes' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const {
      name,
      username,
      password,
      subscription = '1 Month',
      entryDate = new Date().toISOString().slice(0, 10),
      examPackage = 'Full Set UBT',
      watermarkText = '',
      language = 'both'
    } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Name, username and password are required' }, { status: 400 });
    }

    // Check unique username
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    const expireDate = calculateExpiry(entryDate, subscription);
    const passwordHash = await hashPassword(password);
    const validLang = ['korean', 'japanese', 'both'].includes((language || '').toLowerCase()) ? language.toLowerCase() : 'both';

    const institute = await prisma.institute.create({
      data: {
        name,
        username,
        subscription,
        entryDate,
        expireDate,
        examPackage,
        status: 'Active',
        watermarkText,
        language: validLang
      }
    });

    await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: 'institute',
        name,
        instituteId: institute.id,
        status: 'Active'
      }
    });

    return NextResponse.json({ success: true, institute });
  } catch (err) {
    console.error('Error creating institute:', err);
    return NextResponse.json({ error: 'Failed to create institute' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { session, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const {
      id,
      name,
      subscription,
      entryDate,
      examPackage,
      status,
      logoUrl,
      watermarkText,
      language,
      // Optional: reset the institute's login user password
      newPassword,
    } = await req.json();

    if (!id) return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 });

    // ── Institute record update ──────────────────────────────────────────────
    const instituteData = {};
    if (name !== undefined && name.trim()) instituteData.name = name.trim();
    if (subscription) {
      instituteData.subscription = subscription;
      if (subscription === 'Lifetime') {
        instituteData.expireDate = '2099-12-31';
        if (!status) instituteData.status = 'Active';
      } else {
        const currentInst = await prisma.institute.findUnique({ where: { id }, select: { entryDate: true } });
        const refDate = entryDate || currentInst?.entryDate || new Date().toISOString().slice(0, 10);
        instituteData.expireDate = calculateExpiry(refDate, subscription);
        if (!status) instituteData.status = 'Active';
      }
    } else if (entryDate) {
      instituteData.entryDate = entryDate;
      const currentInst = await prisma.institute.findUnique({ where: { id }, select: { subscription: true } });
      const refSub = currentInst?.subscription || '1 Month';
      instituteData.expireDate = calculateExpiry(entryDate, refSub);
      if (!status) instituteData.status = 'Active';
    }

    const updated = await prisma.institute.update({
      where: { id },
      data: instituteData,
    });

    // ── Optional: Reset the institute user's password ────────────────────────
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }
      const passwordHash = await hashPassword(newPassword);
      await prisma.user.updateMany({
        where: { instituteId: id, role: 'institute' },
        data: { passwordHash },
      });
      console.log(`[SuperAdmin] Password reset for institute ${id} by admin ${session.id}`);
    }

    console.log(`[SuperAdmin] Institute ${id} updated by admin ${session.id}`);
    return NextResponse.json({ success: true, institute: updated });
  } catch (err) {
    console.error('Error updating institute:', err);
    return NextResponse.json({ error: 'Failed to update institute' }, { status: 500 });
  }
}


export async function DELETE(req) {
  try {
    const { session, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // Find the institute by ID or username
    const institute = await prisma.institute.findFirst({
      where: {
        OR: [
          { id },
          { username: id }
        ]
      }
    });

    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 });
    }

    const instId = institute.id;
    const instUsername = institute.username;

    // Temporarily disable SQLite foreign keys during cascade cleanup
    try {
      await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF;`);
    } catch (e) {
      console.warn('PRAGMA foreign_keys OFF notice:', e.message);
    }

    // 1. Find all users belonging to this institute (students, staff, institute admin)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { instituteId: instId },
          { instituteId: instUsername },
          { username: instUsername }
        ]
      },
      select: { id: true }
    });
    const userIds = users.map(u => u.id);

    // 2. Find sessions for these users
    let sessionIds = [];
    if (userIds.length > 0) {
      const sessions = await prisma.examSession.findMany({
        where: { userId: { in: userIds } },
        select: { id: true }
      });
      sessionIds = sessions.map(s => s.id);
    }

    // 3. Cleanly delete dependent records in proper order
    if (userIds.length > 0 || sessionIds.length > 0) {
      if (userIds.length > 0) {
        await prisma.paymentTransaction.deleteMany({
          where: { userId: { in: userIds } }
        }).catch(e => console.warn('Clean paymentTransaction:', e.message));
      }

      await prisma.examResult.deleteMany({
        where: {
          OR: [
            ...(userIds.length > 0 ? [{ userId: { in: userIds } }] : []),
            ...(sessionIds.length > 0 ? [{ sessionId: { in: sessionIds } }] : [])
          ]
        }
      }).catch(e => console.warn('Clean examResult:', e.message));

      if (userIds.length > 0) {
        await prisma.examSession.deleteMany({
          where: { userId: { in: userIds } }
        }).catch(e => console.warn('Clean examSession:', e.message));

        await prisma.user.deleteMany({
          where: { id: { in: userIds } }
        }).catch(e => console.warn('Clean users:', e.message));
      }
    }

    // Also delete any remaining users with instituteId = instId or instUsername
    await prisma.user.deleteMany({
      where: {
        OR: [
          { instituteId: instId },
          { instituteId: instUsername },
          { username: instUsername }
        ]
      }
    }).catch(e => console.warn('Clean remaining users:', e.message));

    // 4. Delete InstituteExamSet relations
    await prisma.instituteExamSet.deleteMany({
      where: {
        OR: [
          { instituteId: instId },
          { instituteId: instUsername }
        ]
      }
    }).catch(e => console.warn('Clean instituteExamSet:', e.message));

    // 5. Delete BillingProfile & BillRecords
    await prisma.billingProfile.deleteMany({
      where: {
        OR: [
          { instituteId: instId },
          { instituteId: instUsername }
        ]
      }
    }).catch(e => console.warn('Clean billingProfile:', e.message));

    await prisma.billRecord.deleteMany({
      where: {
        OR: [
          { instituteId: instId },
          { instituteId: instUsername }
        ]
      }
    }).catch(e => console.warn('Clean billRecord:', e.message));

    // 6. Unlink any ExamSets / ExamPackages created by this institute
    await prisma.examSet.updateMany({
      where: {
        OR: [
          { creatorInstituteId: instId },
          { creatorInstituteId: instUsername }
        ]
      },
      data: { creatorInstituteId: null, creatorInstituteName: null }
    }).catch(e => console.warn('Unlink examSet:', e.message));

    await prisma.examPackage.updateMany({
      where: {
        OR: [
          { creatorInstituteId: instId },
          { creatorInstituteId: instUsername }
        ]
      },
      data: { creatorInstituteId: null, creatorInstituteName: null }
    }).catch(e => console.warn('Unlink examPackage:', e.message));

    // 7. Delete the Institute itself
    await prisma.institute.deleteMany({
      where: {
        OR: [
          { id: instId },
          { username: instUsername }
        ]
      }
    });

    // Re-enable foreign keys
    try {
      await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);
    } catch (e) {
      console.warn('PRAGMA foreign_keys ON notice:', e.message);
    }

    console.log(`[SuperAdmin] Institute "${institute.name}" (${instId}) permanently deleted by admin ${session.id}`);

    return NextResponse.json({
      success: true,
      message: `Institute "${institute.name}" deleted successfully.`
    });
  } catch (err) {
    console.error('Error deleting institute:', err);
    try {
      await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);
    } catch {}
    return NextResponse.json({
      error: `Failed to delete institute: ${err.message}`
    }, { status: 500 });
  }
}
