import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';

function addMonths(dateString, months) {
  const d = new Date(dateString + 'T00:00:00');
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().slice(0, 10);
}

function calculateExpiry(entryDate, subscription) {
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
      const isExpired = new Date(inst.expireDate + 'T23:59:59') < new Date();
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
      watermarkText = ''
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

    const institute = await prisma.institute.create({
      data: {
        name,
        username,
        subscription,
        entryDate,
        expireDate,
        examPackage,
        status: 'Active',
        watermarkText
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
      // Optional: reset the institute's login user password
      newPassword,
    } = await req.json();

    if (!id) return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 });

    // ── Institute record update ──────────────────────────────────────────────
    const instituteData = {};
    if (name !== undefined && name.trim()) instituteData.name = name.trim();
    if (subscription) instituteData.subscription = subscription;
    if (entryDate) instituteData.entryDate = entryDate;
    if (examPackage) instituteData.examPackage = examPackage;
    if (status) instituteData.status = status;
    if (logoUrl !== undefined) instituteData.logoUrl = logoUrl || null;
    if (watermarkText !== undefined) instituteData.watermarkText = watermarkText || null;

    if (entryDate && subscription) {
      instituteData.expireDate = calculateExpiry(entryDate, subscription);
      // Auto-activate if a new valid expiry is set
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
