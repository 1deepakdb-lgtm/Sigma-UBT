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

    await prisma.institute.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Institute deleted' });
  } catch (err) {
    console.error('Error deleting institute:', err);
    return NextResponse.json({ error: 'Failed to delete institute' }, { status: 500 });
  }
}
