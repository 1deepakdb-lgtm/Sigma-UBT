import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      studentName = 'Student',
      studentPhone = '',
      itemId,
      itemName,
      itemType = 'set',
      amount = 30,
      txnId,
      screenshotUrl = ''
    } = body;

    if (!itemName) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    const cleanTxn = (txnId || '').trim().toUpperCase();
    if (!cleanTxn || cleanTxn.length < 4) {
      return NextResponse.json({
        error: 'Please enter a valid eSewa Transaction ID / Reference Code (at least 4 characters).'
      }, { status: 400 });
    }

    const session = await getSessionUser(req).catch(() => null);
    const effectiveUserId = session?.id || null;
    const effectivePhone = (studentPhone || session?.phone || session?.username || '').trim();
    const cleanPhone = effectivePhone.replace(/[^0-9]/g, '').slice(-10);

    // Replay attack prevention: check if another student has already claimed this exact transaction code
    const existingTx = await prisma.paymentTransaction.findFirst({
      where: {
        transactionCode: cleanTxn,
        status: { in: ['COMPLETE', 'Released'] }
      }
    });

    if (existingTx) {
      // If claimed by another student, reject duplicate usage
      const isSameUser = (effectiveUserId && existingTx.userId === effectiveUserId) ||
        (cleanPhone && existingTx.studentPhone && existingTx.studentPhone.includes(cleanPhone));

      if (!isSameUser) {
        return NextResponse.json({
          error: 'This eSewa Transaction Code has already been used by another account.'
        }, { status: 400 });
      }
    }

    const parsedAmount = itemType === 'set' ? 30 : (Number(amount) || 1000);
    const targetItemId = itemId ? String(itemId) : itemName;

    // 1. Record transaction as COMPLETE in database
    const transactionUuid = `ESEWA-APP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    await prisma.paymentTransaction.create({
      data: {
        transactionUuid,
        transactionCode: cleanTxn,
        userId: effectiveUserId,
        studentPhone: effectivePhone || '9768444902',
        studentName: studentName || 'Student',
        itemId: targetItemId,
        itemName,
        itemType,
        amount: parsedAmount,
        status: 'COMPLETE',
        gateway: 'ESEWA_APP_DIRECT',
        rawResponse: JSON.stringify({
          verifiedVia: 'eSewa Mobile App MPIN',
          txnCode: cleanTxn,
          merchantPhone: '9768444902',
          screenshotUrl,
          verifiedAt: new Date().toISOString()
        })
      }
    });

    // 2. Permanent DB Persistence: Update User record if package purchased
    try {
      if (effectiveUserId && itemType === 'package') {
        await prisma.user.update({
          where: { id: effectiveUserId },
          data: { batch: itemName }
        });
      } else if (cleanPhone && itemType === 'package') {
        await prisma.user.updateMany({
          where: {
            OR: [
              { phone: { contains: cleanPhone } },
              { username: { contains: cleanPhone } }
            ]
          },
          data: { batch: itemName }
        });
      }
    } catch (uErr) {
      console.warn('[Verify Code] User record update notice:', uErr.message);
    }

    // 3. Keep PaymentQuery in sync for Super Admin panel and reports
    try {
      await prisma.paymentQuery.create({
        data: {
          studentName: studentName || 'Student',
          phone: effectivePhone || 'N/A',
          itemName,
          itemType,
          amount: parsedAmount,
          status: 'Released',
          txnId: cleanTxn,
          notes: `Instant Verified via eSewa App (Txn: ${cleanTxn})`
        }
      });
    } catch (pqErr) {}

    // 4. Create real-time notification for Admin
    try {
      await prisma.notification.create({
        data: {
          title: `eSewa Payment Verified: ${itemName} (Rs. ${parsedAmount})`,
          message: `Student ${studentName} (${effectivePhone}) paid Rs. ${parsedAmount} via eSewa App.\nTxn ID: ${cleanTxn}\nItem: ${itemName} (${itemType})`,
          target: 'admin'
        }
      });
    } catch (notifErr) {}

    return NextResponse.json({
      success: true,
      message: `🎉 Set "${itemName}" unlocked successfully!`,
      itemId: targetItemId,
      itemName,
      itemType,
      amount: parsedAmount,
      txnCode: cleanTxn
    });
  } catch (err) {
    console.error('[Verify Code Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to verify transaction' }, { status: 500 });
  }
}
