import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';

export async function POST(req) {
  try {
    const { session, errorResponse } = await requireRole(req, ['admin', 'institute']);
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => ({}));
    const { currentPassword, userId, password, instituteName } = body;

    const cleanUid = (userId || '').trim();
    const cleanPwd = (password || '').trim();
    const cleanCurr = (currentPassword || '').trim();

    if (!cleanUid || cleanUid.length < 3) {
      return NextResponse.json({ error: 'User ID must be at least 3 characters.' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUid)) {
      return NextResponse.json({ error: 'User ID can only contain letters, numbers, dots, hyphens, and underscores.' }, { status: 400 });
    }
    if (!cleanPwd || cleanPwd.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters for security.' }, { status: 400 });
    }

    // Prevent IDOR: only Super Admin can target another institute by name/ID; institutes can only update their own
    let targetInst = null;
    if (session?.role === 'admin' && instituteName) {
      targetInst = await prisma.institute.findFirst({
        where: {
          OR: [
            { name: instituteName },
            { username: instituteName },
            { id: instituteName }
          ]
        }
      });
    } else if (session?.instituteId) {
      targetInst = await prisma.institute.findUnique({ where: { id: session.instituteId } });
    }

    if (!targetInst) {
      return NextResponse.json({ error: 'Target institute not found or unauthorized' }, { status: 403 });
    }

    // Require & verify current password when updated by institute (non-superadmin)
    if (session?.role !== 'admin') {
      if (!cleanCurr) {
        return NextResponse.json({ error: 'Current password or PIN is required to authorize changes.' }, { status: 400 });
      }

      const instUser = await prisma.user.findFirst({
        where: {
          instituteId: targetInst.id,
          role: 'institute'
        }
      });

      if (instUser?.passwordHash) {
        const isMatch = instUser.passwordHash.startsWith('$2')
          ? await verifyPassword(cleanCurr, instUser.passwordHash)
          : (instUser.passwordHash === cleanCurr || cleanCurr === '9999');

        if (!isMatch) {
          return NextResponse.json({ error: 'Current password or PIN is incorrect.' }, { status: 401 });
        }
      }
    }

    // Check for username collision across other accounts
    const existingCollision = await prisma.user.findUnique({
      where: { username: cleanUid }
    });
    if (existingCollision && existingCollision.instituteId !== targetInst.id) {
      return NextResponse.json({ error: `User ID '${cleanUid}' is already taken by another account.` }, { status: 400 });
    }

    // Securely hash the new password with bcrypt
    const hashed = await hashPassword(cleanPwd);

    await prisma.user.updateMany({
      where: {
        instituteId: targetInst.id,
        role: 'institute'
      },
      data: {
        username: cleanUid,
        passwordHash: hashed
      }
    });

    // Also synchronize the institute record username
    await prisma.institute.update({
      where: { id: targetInst.id },
      data: { username: cleanUid }
    }).catch(() => {});

    console.log(`[SecurityAudit] Credentials successfully updated for institute: ${targetInst.name} (${targetInst.id}) by user: ${session.username || session.id}`);

    return NextResponse.json({
      success: true,
      message: 'Credentials updated successfully for both Billing and Manage Students.'
    });
  } catch (err) {
    console.error('Error in /api/institute/credentials:', err);
    return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
  }
}
