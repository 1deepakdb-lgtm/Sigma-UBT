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
        language: true,
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
    let isGoogleOrFree = false;

    if (user.role === 'student') {
      const shiftNames = ['morning', 'day', 'evening', 'night', 'afternoon'];
      const isShiftOnly = user.batch && shiftNames.includes(user.batch.toLowerCase().trim());
      isGoogleOrFree = Boolean(
        user.batch?.toLowerCase().includes('google') ||
        user.batch?.toLowerCase().includes('free')
      );

      if (isGoogleOrFree) {
        studentPackage = 'Free Student Access';
      } else if (user.batch && !isShiftOnly) {
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
              const pkgLower = (bill.coursePackage || '').toLowerCase();
              let durationMonths = 1;
              if (pkgLower.includes('6 month') || pkgLower.includes('6 months')) durationMonths = 6;
              else if (pkgLower.includes('3 month') || pkgLower.includes('3 months')) durationMonths = 3;
              else if (pkgLower.includes('2 month') || pkgLower.includes('2 months')) durationMonths = 2;
              else if (pkgLower.includes('15 day') || pkgLower.includes('15 days')) {
                bDate.setDate(bDate.getDate() + 15);
                expiryDate = bDate.toISOString().split('T')[0];
              }
              if (!expiryDate) {
                bDate.setMonth(bDate.getMonth() + durationMonths);
                expiryDate = bDate.toISOString().split('T')[0];
              }
            }
          }
        }
      }

      if (isGoogleOrFree) {
        expiryDate = null;
      } else {
        // Calculate package expiry date (from creation date if not already set from bill)
        if (!expiryDate && user.createdAt) {
          const cDate = new Date(user.createdAt);
          const batchLower = (user.batch || '').toLowerCase();
          let durationMonths = 1;
          if (batchLower.includes('6 month') || batchLower.includes('6 months')) durationMonths = 6;
          else if (batchLower.includes('3 month') || batchLower.includes('3 months')) durationMonths = 3;
          else if (batchLower.includes('2 month') || batchLower.includes('2 months')) durationMonths = 2;
          else if (batchLower.includes('15 day') || batchLower.includes('15 days')) {
            cDate.setDate(cDate.getDate() + 15);
            expiryDate = cDate.toISOString().split('T')[0];
          }
          if (!expiryDate) {
            cDate.setMonth(cDate.getMonth() + durationMonths);
            expiryDate = cDate.toISOString().split('T')[0];
          }
        }

        if (!expiryDate && user.institute?.expireDate) {
          expiryDate = user.institute.expireDate;
        }

        if (!expiryDate) {
          const d = new Date();
          d.setMonth(d.getMonth() + 1);
          expiryDate = d.toISOString().split('T')[0];
        }
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        studentPackage,
        expiryDate: isGoogleOrFree ? null : expiryDate,
        isFreeStudent: Boolean(isGoogleOrFree),
        instituteLanguage: (user.role === 'student' && user.institute?.language && user.institute.language !== 'both')
          ? user.institute.language
          : (user.language && user.language !== 'both' ? user.language : (user.institute?.language || user.language || 'both'))
      }
    });
  } catch (err) {
    console.error('Me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
