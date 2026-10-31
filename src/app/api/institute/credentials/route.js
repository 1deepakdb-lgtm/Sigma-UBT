import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';

export async function POST(req) {
  try {
    const { session, errorResponse } = await requireRole(req, ['admin', 'institute']);
    
    const body = await req.json().catch(() => ({}));
    const { userId, password, instituteName } = body;

    const cleanUid = (userId || '').trim();
    const cleanPwd = (password || '').trim();

    if (!cleanUid || cleanUid.length < 3) {
      return NextResponse.json({ error: 'User ID must be at least 3 characters.' }, { status: 400 });
    }
    if (!cleanPwd || cleanPwd.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters.' }, { status: 400 });
    }

    // If an institute user/admin is authenticated or instituteName is provided
    let targetInst = null;
    if (session?.instituteId) {
      targetInst = await prisma.institute.findUnique({ where: { id: session.instituteId } });
    } else if (instituteName) {
      targetInst = await prisma.institute.findFirst({
        where: {
          OR: [
            { name: instituteName },
            { username: instituteName }
          ]
        }
      });
    }

    if (targetInst) {
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
    }

    return NextResponse.json({
      success: true,
      message: 'Credentials updated successfully for both Billing and Manage Students.'
    });
  } catch (err) {
    console.error('Error in /api/institute/credentials:', err);
    return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
  }
}
