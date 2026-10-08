import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, hashPassword, signToken } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';

/**
 * GET /api/admin/superadmin
 * Returns the current super-admin's own profile data.
 * Only accessible by role=admin.
 */
export async function GET(req) {
  try {
    const { session, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Super admin user not found' }, { status: 404 });
    }

    // Sanity check — only return data if confirmed admin
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('SuperAdmin GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/superadmin
 * Allows the super-admin to update their own profile: name, phone, username, and/or password.
 * Current password is ALWAYS required to authorize any change.
 * Only accessible by role=admin.
 */
export async function PUT(req) {
  try {
    const { session, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { currentPassword, newName, newPhone, newUsername, newPassword, confirmNewPassword } = body;

    // Current password is mandatory for any profile change
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required to make any changes.' },
        { status: 400 }
      );
    }

    // Fetch admin user from DB with password hash
    const adminUser = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify the current password
    const isPasswordCorrect = await verifyPassword(currentPassword, adminUser.passwordHash);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: 'Current password is incorrect. No changes were saved.' },
        { status: 401 }
      );
    }

    // Build the update payload
    const dataToUpdate = {};

    if (newName && newName.trim()) {
      dataToUpdate.name = newName.trim();
    }

    if (newPhone !== undefined) {
      dataToUpdate.phone = newPhone.trim() || null;
    }

    if (newUsername && newUsername.trim()) {
      const trimmedUsername = newUsername.trim().toLowerCase();
      if (trimmedUsername !== adminUser.username) {
        // Check uniqueness
        const existing = await prisma.user.findUnique({ where: { username: trimmedUsername } });
        if (existing && existing.id !== adminUser.id) {
          return NextResponse.json(
            { error: `Username '${trimmedUsername}' is already taken.` },
            { status: 400 }
          );
        }
        dataToUpdate.username = trimmedUsername;
      }
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long.' },
          { status: 400 }
        );
      }
      if (newPassword !== confirmNewPassword) {
        return NextResponse.json(
          { error: 'New passwords do not match.' },
          { status: 400 }
        );
      }
      // Prevent reuse of the same password
      const isSamePassword = await verifyPassword(newPassword, adminUser.passwordHash);
      if (isSamePassword) {
        return NextResponse.json(
          { error: 'New password must be different from the current password.' },
          { status: 400 }
        );
      }
      dataToUpdate.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided to update.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        phone: true,
        status: true,
        updatedAt: true,
      },
    });

    // If username or password changed, issue a fresh JWT so the session stays valid
    let newToken = null;
    if (dataToUpdate.username || dataToUpdate.passwordHash) {
      newToken = await signToken({
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role,
        instituteId: null,
        instituteName: null,
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Super admin profile updated successfully.',
      user: updatedUser,
      tokenRefreshed: !!newToken,
    });

    // Rotate the session cookie if credentials changed
    if (newToken) {
      response.cookies.set('sigma_session', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('SuperAdmin PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
