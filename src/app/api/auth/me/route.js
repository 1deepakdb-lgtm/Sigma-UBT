import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        phone: true,
        batch: true,
        status: true,
        createdAt: true,
        instituteId: true,
        institute: {
          select: {
            id: true,
            name: true,
            subscription: true,
            expireDate: true,
            status: true,
            logoUrl: true,
            watermarkText: true,
            examPackage: true,
            language: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    let studentPackage = 'Full Set UBT';
    let expiryDate = null;

    if (user.role === 'student') {
      const shiftNames = ['morning', 'day', 'evening', 'night', 'afternoon'];
      const isShiftOnly = user.batch && shiftNames.includes(user.batch.toLowerCase().trim());

      // If user.batch is a real package name, use it; otherwise fallback to institute package or Full Set UBT
      if (user.batch && !isShiftOnly) {
        studentPackage = user.batch;
      } else if (user.institute?.examPackage) {
        studentPackage = user.institute.examPackage;
      } else {
        studentPackage = 'Full Set UBT';
      }

      if (user.phone) {
        const cleanDigits = user.phone.replace(/[^0-9]/g, '');
        const last10 = cleanDigits.slice(-10);
        const bill = await prisma.billRecord.findFirst({
          where: {
            OR: [
              { contactNumber: user.phone },
              ...(last10.length >= 6 ? [{ contactNumber: { contains: last10 } }] : [])
            ]
          },
          orderBy: { createdAt: 'desc' }
        });

        if (bill) {
          if (bill.coursePackage && !shiftNames.includes(bill.coursePackage.toLowerCase().trim())) {
            studentPackage = bill.coursePackage;
          }
          if (bill.date) {
            const bDate = new Date(bill.date);
            if (!isNaN(bDate.getTime())) {
              bDate.setMonth(bDate.getMonth() + 1);
              expiryDate = bDate.toISOString().split('T')[0];
            }
          }
        }
      }

      // 1. Calculate standard student package expiry date (1 Month from student creation date)
      if (!expiryDate && user.createdAt) {
        const cDate = new Date(user.createdAt);
        cDate.setMonth(cDate.getMonth() + 1);
        expiryDate = cDate.toISOString().split('T')[0];
      }

      // 2. Fallback to institute expireDate if student creation date is unavailable
      if (!expiryDate && user.institute?.expireDate) {
        expiryDate = user.institute.expireDate;
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        studentPackage,
        expiryDate: expiryDate || 'Active',
        instituteLanguage: user.institute?.language || 'both'
      }
    });
  } catch (err) {
    console.error('Me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
