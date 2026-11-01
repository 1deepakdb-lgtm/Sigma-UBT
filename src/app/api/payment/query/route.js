import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireInstituteAdmin } from '@/lib/rbac';
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
      amount = 40,
      txnId,
      screenshotUrl,
      driveFolderUrl = 'https://drive.google.com/drive/folders/1ZaKiEPRNOusOvCZSpstWyWHGVRk-lRlE?usp=drive_link'
    } = body;

    if (!itemName) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    const cleanTxn = (txnId || '').trim().toUpperCase();
    const cleanPhone = (studentPhone || '').trim();

    // 1. Record in PaymentTransaction
    const tx = await prisma.paymentTransaction.create({
      data: {
        transactionUuid: `QUERY-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        transactionCode: cleanTxn || 'QUERY_SUBMITTED',
        studentName,
        studentPhone: cleanPhone,
        itemId: itemId ? String(itemId) : itemName,
        itemName,
        itemType,
        amount: Number(amount) || 40,
        status: 'PENDING',
        gateway: 'ESEWA_MANUAL',
        rawResponse: JSON.stringify({
          screenshotUrl,
          driveFolderUrl,
          submittedAt: new Date().toISOString()
        })
      }
    });

    // 2. Create notification for Super Admin
    await prisma.notification.create({
      data: {
        title: `UBT Purchase Query: ${itemName} (Rs. ${amount})`,
        message: `Student ${studentName} (${cleanPhone}) submitted eSewa payment query.\n` +
          `Set: ${itemName}\n` +
          `Txn ID: ${cleanTxn}\n` +
          (screenshotUrl ? `Screenshot: ${screenshotUrl}` : `Drive Folder: ${driveFolderUrl}`),
        target: 'admin'
      }
    });

    return NextResponse.json({
      success: true,
      queryId: tx.id,
      transactionUuid: tx.transactionUuid,
      status: 'PENDING'
    });
  } catch (err) {
    console.error('Payment query submission error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit payment query' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    // Students can ONLY query their own transactions
    if (session.role === 'student') {
      const studentPhone = session.phone || session.username;
      const list = await prisma.paymentTransaction.findMany({
        where: {
          OR: [
            { studentPhone: studentPhone },
            { studentName: session.name }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      return NextResponse.json({ success: true, queries: list });
    }

    const where = {};
    if (phone) {
      where.studentPhone = phone;
    }

    const list = await prisma.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({ success: true, queries: list });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { session, errorResponse } = await requireInstituteAdmin(req);
    if (errorResponse) return errorResponse;
    const body = await req.json();
    const { id, txnId, phone, itemId, action = 'release' } = body; // 'release' | 'reject'

    let targetTx = null;

    if (id) {
      targetTx = await prisma.paymentTransaction.findUnique({
        where: { id: Number(id) }
      }).catch(() => null);
    }

    if (!targetTx && txnId) {
      targetTx = await prisma.paymentTransaction.findFirst({
        where: { transactionCode: String(txnId).trim().toUpperCase() }
      });
    }

    if (!targetTx && phone) {
      targetTx = await prisma.paymentTransaction.findFirst({
        where: {
          studentPhone: String(phone).trim(),
          ...(itemId ? { itemId: String(itemId) } : {})
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!targetTx) {
      return NextResponse.json({ error: 'Matching transaction not found' }, { status: 404 });
    }

    const updated = await prisma.paymentTransaction.update({
      where: { id: targetTx.id },
      data: {
        status: action === 'release' ? 'COMPLETE' : 'FAILED',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch (err) {
    console.error('Error updating transaction:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

