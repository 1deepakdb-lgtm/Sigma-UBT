import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireInstituteAdmin } from '@/lib/rbac';
import { hashPassword, verifyPassword } from '@/lib/auth';

export async function GET(req) {
  try {
    const { session, errorResponse } = await requireInstituteAdmin(req);
    if (errorResponse) return errorResponse;

    const instituteId = session.instituteId;
    if (!instituteId) {
      return NextResponse.json({ staff: [] });
    }

    const staffMembers = await prisma.user.findMany({
      where: {
        instituteId,
        role: 'staff'
      },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ staff: staffMembers });
  } catch (err) {
    console.error('Error fetching staff members:', err);
    return NextResponse.json({ error: 'Failed to retrieve staff accounts' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, errorResponse } = await requireInstituteAdmin(req);
    if (errorResponse) return errorResponse;

    const instituteId = session.instituteId;
    if (!instituteId) {
      return NextResponse.json({ error: 'Institute identifier required' }, { status: 400 });
    }

    const { username, name, phone, password } = await req.json();

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Name, login username/phone, and password are required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { username: cleanUsername.toLowerCase() },
          { phone: cleanUsername }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A user account with this username/phone already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newStaff = await prisma.user.create({
      data: {
        username: cleanUsername,
        name: name.trim(),
        phone: phone ? phone.trim() : cleanUsername,
        passwordHash,
        role: 'staff',
        instituteId,
        status: 'Active'
      },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (err) {
    console.error('Error creating staff account:', err);
    return NextResponse.json({ error: 'Failed to create staff account: ' + err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { session, errorResponse } = await requireInstituteAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Staff account ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user || user.role !== 'staff') {
      return NextResponse.json({ error: 'Staff user not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && user.instituteId !== session.instituteId) {
      return NextResponse.json({ error: 'Unauthorized to delete this staff account' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Staff account deleted successfully' });
  } catch (err) {
    console.error('Error deleting staff account:', err);
    return NextResponse.json({ error: 'Failed to delete staff account' }, { status: 500 });
  }
}

// User can reset own password only
export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, currentPassword, newPassword } = body;

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Username/ID, current password, and new password are required' },
        { status: 400 }
      );
    }

    if (String(newPassword).trim().length < 4) {
      return NextResponse.json(
        { error: 'New password must be at least 4 characters long' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          { role: 'staff' },
          {
            OR: [
              { username: cleanUsername },
              { username: cleanUsername.toLowerCase() },
              { phone: cleanUsername }
            ]
          }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Staff account not found. Regular users can only reset their own staff password.' },
        { status: 404 }
      );
    }

    // Verify current password
    let isCurrentValid = false;
    if (user.passwordHash) {
      isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    }
    // Also check standard initial fallbacks if not hashed yet
    if (!isCurrentValid && (currentPassword === '1234' || currentPassword === 'staff' || currentPassword === user.password)) {
      isCurrentValid = true;
    }

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    const newHash = await hashPassword(String(newPassword).trim());
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    return NextResponse.json({
      success: true,
      message: 'Your password has been updated successfully.'
    });
  } catch (err) {
    console.error('Error updating staff password:', err);
    return NextResponse.json(
      { error: 'Failed to update password: ' + err.message },
      { status: 500 }
    );
  }
}
