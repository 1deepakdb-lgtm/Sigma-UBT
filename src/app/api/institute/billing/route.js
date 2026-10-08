import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireInstituteOrAdmin, requireInstituteAdmin } from '@/lib/rbac';
import { reduceStockInternal } from './products/route';

export async function GET(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const instituteId = session.instituteId || 'default-institute';
    const { searchParams } = new URL(req.url);
    const billNumber = searchParams.get('billNumber');
    const phone = searchParams.get('phone');
    const search = searchParams.get('search');

    // 1. Search by WhatsApp / Phone Number or Bill Number
    if (phone || billNumber || search) {
      const query = (phone || billNumber || search || '').trim();
      const bill = await prisma.billRecord.findFirst({
        where: {
          instituteId,
          OR: [
            { contactNumber: { contains: query } },
            { billNumber: { equals: query } },
            { studentName: { contains: query } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!bill) {
        return NextResponse.json({ error: 'Bill not found for query: ' + query }, { status: 404 });
      }

      return NextResponse.json({ bill });
    }

    // 2. Fetch billing profile and all bills for this institute
    let profile = await prisma.billingProfile.findUnique({
      where: { instituteId }
    });

    if (!profile) {
      const inst = await prisma.institute.findUnique({ where: { id: instituteId } });
      profile = await prisma.billingProfile.create({
        data: {
          instituteId,
          companyName: inst?.name || 'SIGMA EDUCATION KOREAN BHASA CENTER',
          companyAddress: 'Samakhushi Chowk, Kathmandu',
          contactNumber: '9768444902, 9806100148',
          email: 'sigmaedu2023@gmail.com',
          panVatNumber: '616838513',
          logoUrl: inst?.logoUrl || '/sigma-logo.png',
          stampUrl: '',
          editCount: 0,
          isLocked: false
        }
      });
    }

    const bills = await prisma.billRecord.findMany({
      where: { instituteId },
      orderBy: { createdAt: 'desc' }
    });

    const formattedBills = bills.map(b => {
      let method = b.parentBillNumber || 'Cash';
      try {
        if (b.paymentsJson) {
          const parsed = JSON.parse(b.paymentsJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const last = parsed[parsed.length - 1];
            if (last && last.paymentMethod) method = last.paymentMethod;
          }
        }
      } catch (e) {}
      return {
        ...b,
        paymentMethod: method
      };
    });

    // Lifetime Google Setup Open Count from database
    const setupSetting = await prisma.systemSetting.findUnique({
      where: { key: `googleSetupOpenCount_${instituteId}` }
    });
    const googleSetupOpenCount = setupSetting ? (parseInt(setupSetting.value, 10) || 0) : 0;

    return NextResponse.json({ profile, bills: formattedBills, googleSetupOpenCount });
  } catch (err) {
    console.error('Error in GET /api/institute/billing:', err);
    return NextResponse.json({ error: 'Failed to retrieve billing data' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const instituteId = session.instituteId || 'default-institute';
    const data = await req.json();

    const {
      date,
      studentName,
      address,
      contactNumber,
      parentName,
      parentNumber,
      classTime,
      courseDetail,
      coursePackage,
      paymentSystem,
      grossFee,
      discountPercent = 0,
      discountAmount = 0,
      totalFee,
      paidAmount,
      amountInWords,
      materials,
      preparedBy
    } = data;

    const cleanPhone = (contactNumber || '').trim();
    if (!cleanPhone) {
      return NextResponse.json({ error: 'WhatsApp Contact Number is required.' }, { status: 400 });
    }

    // CHECK: Does a bill already exist for this WhatsApp number in this institute?
    const existingBill = await prisma.billRecord.findFirst({
      where: {
        instituteId,
        contactNumber: cleanPhone
      }
    });

    const now = new Date();
    const paymentDate = date || now.toISOString().split('T')[0];
    const incomingPaid = Number(paidAmount) || 0;

    // SCENARIO A: Existing student bill -> DO NOT generate a new bill number! Update existing bill!
    if (existingBill) {
      // If already fully paid, disallow next pay
      if (existingBill.dueAmount <= 0) {
        return NextResponse.json({
          error: `Payment is already complete for student with WhatsApp ${cleanPhone}. No further payments required.`,
          alreadyCompleted: true
        }, { status: 400 });
      }

      // PAYMENT CANNOT ACCEPT MORE THAN REMAINING DUE BALANCE
      if (incomingPaid > existingBill.dueAmount) {
        return NextResponse.json({
          error: `Payment amount (Rs. ${incomingPaid.toLocaleString()}) cannot exceed the remaining due balance of Rs. ${Number(existingBill.dueAmount).toLocaleString()}.`
        }, { status: 400 });
      }

      // Parse existing payments array
      let paymentsList = [];
      try {
        paymentsList = existingBill.paymentsJson ? JSON.parse(existingBill.paymentsJson) : [];
      } catch (e) {
        paymentsList = [];
      }

      // If paymentsList is empty, seed it with the original first payment
      if (paymentsList.length === 0) {
        paymentsList.push({
          installment: 1,
          amount: Number(existingBill.firstInstallment || existingBill.paidAmount || 0),
          date: existingBill.firstPaymentDate || existingBill.date,
          preparedBy: existingBill.preparedBy || '',
          paymentMethod: existingBill.parentBillNumber || 'Cash'
        });
      }

      const instNum = paymentsList.length + 1;
      const chosenMethod = (data.paymentMethod && data.paymentMethod.trim()) ? data.paymentMethod.trim() : 'Cash';

      // Append new payment entry with its OWN payment method!
      paymentsList.push({
        installment: instNum,
        amount: incomingPaid,
        date: paymentDate,
        preparedBy: (preparedBy && preparedBy.trim()) ? preparedBy.trim() : (existingBill.preparedBy || ''),
        paymentMethod: chosenMethod
      });

      // Accurately compute total paid across ALL recorded transactions
      const totalPaidSoFar = paymentsList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const remainingDue = Math.max(0, Number(existingBill.totalFee) - totalPaidSoFar);
      const isCompleted = remainingDue <= 0;

      let updatedFirst = existingBill.firstInstallment || paymentsList[0]?.amount || null;
      let updatedFirstDate = existingBill.firstPaymentDate || paymentsList[0]?.date || null;
      let updatedSecond = existingBill.secondInstallment;
      let updatedSecondDate = existingBill.secondPaymentDate;
      let updatedThird = existingBill.thirdInstallment;
      let updatedThirdDate = existingBill.thirdPaymentDate;

      if (instNum === 2) {
        updatedSecond = incomingPaid;
        updatedSecondDate = paymentDate;
      } else if (instNum === 3) {
        updatedThird = incomingPaid;
        updatedThirdDate = paymentDate;
      }

      const updatedBill = await prisma.billRecord.update({
        where: { id: existingBill.id },
        data: {
          paidAmount: totalPaidSoFar,
          dueAmount: remainingDue,
          amountInWords: amountInWords || existingBill.amountInWords,
          firstInstallment: updatedFirst,
          firstPaymentDate: updatedFirstDate,
          secondInstallment: updatedSecond,
          secondPaymentDate: updatedSecondDate,
          thirdInstallment: updatedThird,
          thirdPaymentDate: updatedThirdDate,
          paymentsJson: JSON.stringify(paymentsList),
          parentBillNumber: chosenMethod,
          paymentSystem: isCompleted ? 'Full Payment' : `${instNum === 2 ? '2nd' : instNum === 3 ? '3rd' : `${instNum}th`} Installment`,
          preparedBy: (preparedBy && preparedBy.trim()) ? preparedBy.trim() : (existingBill.preparedBy || ''),
          isSyncedToSheet: false
        }
      });

      // Background auto-sync to Google Sheet
      triggerSheetSync(instituteId, updatedBill, materials);

      return NextResponse.json({
        success: true,
        updated: true,
        message: isCompleted
          ? `Bill ${existingBill.billNumber} payment is now 100% COMPLETE! (Due balance: Rs. 0)`
          : `Installment #${instNum} recorded on Bill ${existingBill.billNumber}.`,
        bill: { ...updatedBill, paymentMethod: chosenMethod }
      });
    }

    // SCENARIO B: Brand New Student Bill -> Generate 1 Unique Bill Number
    if (!studentName || !courseDetail || totalFee === undefined || paidAmount === undefined) {
      return NextResponse.json({ error: 'Missing required bill information' }, { status: 400 });
    }

    const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    let nextNum = (await prisma.billRecord.count()) + 1;
    let generatedBillNumber = `BILL-${datePrefix}-${String(nextNum).padStart(4, '0')}`;
    while (await prisma.billRecord.findUnique({ where: { billNumber: generatedBillNumber } })) {
      nextNum++;
      generatedBillNumber = `BILL-${datePrefix}-${String(nextNum).padStart(4, '0')}`;
    }

    const parsedGross = Number(grossFee) || Number(totalFee);
    const parsedDiscPct = Number(discountPercent) || 0;
    const parsedDiscAmount = Number(discountAmount) || (parsedGross * (parsedDiscPct / 100));
    const finalTotalFee = Number(totalFee); // Includes 13% VAT/PAN!
    const vatAmt = finalTotalFee - (finalTotalFee / 1.13); // 13% included

    // PAYMENT CANNOT ACCEPT MORE THAN COURSE GROSS FEE OR AFTER DISCOUNT FEE
    const maxFeeAllowed = finalTotalFee > 0 ? finalTotalFee : parsedGross;
    if (incomingPaid > maxFeeAllowed) {
      return NextResponse.json({
        error: `Payment amount (Rs. ${incomingPaid.toLocaleString()}) cannot exceed the course fee after discount (Rs. ${maxFeeAllowed.toLocaleString()}).`
      }, { status: 400 });
    }

    let firstInst = null;
    let firstDate = null;
    if (paymentSystem !== 'Full Payment' || incomingPaid < finalTotalFee) {
      firstInst = incomingPaid;
      firstDate = paymentDate;
    }

    const initialDue = Math.max(0, finalTotalFee - incomingPaid);
    const chosenMethod = (data.paymentMethod && data.paymentMethod.trim()) ? data.paymentMethod.trim() : 'Cash';

    const initialPayments = [
      {
        installment: 1,
        amount: incomingPaid,
        date: paymentDate,
        preparedBy: (preparedBy && preparedBy.trim()) ? preparedBy.trim() : '',
        paymentMethod: chosenMethod
      }
    ];

    const newBill = await prisma.billRecord.create({
      data: {
        billNumber: generatedBillNumber,
        instituteId,
        date: paymentDate,
        admittedDate: paymentDate,  // Locked: first bill date = admitted date, never changed
        studentName: studentName.trim(),
        address: address || '',
        contactNumber: cleanPhone,
        parentName: (parentName || '').trim(),
        parentNumber: parentNumber || '',
        classTime: (classTime || '').trim(),
        courseDetail: courseDetail.trim(),
        coursePackage: coursePackage || 'Full packages',
        paymentSystem: initialDue <= 0 ? 'Full Payment' : '1st Installment',
        grossFee: parsedGross,
        discountPercent: parsedDiscPct,
        discountAmount: parsedDiscAmount,
        totalFee: finalTotalFee, // Immutable once entered!
        vatPercent: 13,
        vatAmount: vatAmt,
        paidAmount: incomingPaid,
        dueAmount: initialDue,
        amountInWords: amountInWords || '',
        firstInstallment: firstInst,
        firstBillNo: generatedBillNumber,
        firstPaymentDate: firstDate,
        paymentsJson: JSON.stringify(initialPayments),
        parentBillNumber: chosenMethod,
        materialsJson: JSON.stringify(materials || []),
        preparedBy: (preparedBy && preparedBy.trim()) ? preparedBy.trim() : ''
      }
    });

    // Background auto-sync to Google Sheet
    triggerSheetSync(instituteId, newBill, materials);

    // Auto-reduce product stock for any sold items/books
    if (Array.isArray(materials) && materials.length > 0) {
      reduceStockInternal(materials).catch((err) => console.error('Failed to auto-reduce stock on bill creation:', err));
    }

    return NextResponse.json({ success: true, bill: newBill });
  } catch (err) {
    console.error('Error creating bill record:', err);
    return NextResponse.json({ error: 'Failed to create bill record: ' + err.message }, { status: 500 });
  }
}

// Background Sheet Sync Helper
async function triggerSheetSync(instituteId, bill, materials) {
  try {
    const profile = await prisma.billingProfile.findUnique({ where: { instituteId } });
    if (profile?.googleSheetUrl) {
      fetch(profile.googleSheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append_or_update_bill',
          bill,
          materials: materials || [],
          ownerEmail: profile.ownerEmail || ''
        })
      }).then(async (res) => {
        if (res.ok) {
          await prisma.billRecord.update({
            where: { id: bill.id },
            data: { isSyncedToSheet: true, syncedAt: new Date() }
          });
        }
      }).catch((e) => {
        console.warn('Background Google Sheet sync notice:', e.message);
      });
    }
  } catch (e) {
    console.warn('Google Sheet auto-sync failed silently:', e);
  }
}

export async function PUT(req) {
  try {
    const { session, errorResponse } = await requireInstituteAdmin(req);
    if (errorResponse) return errorResponse;

    const instituteId = session.instituteId || 'default-institute';
    const body = await req.json();

    // 1. LIFETIME GOOGLE SETUP PIN OPEN COUNTER (Database Persistence for Lifetime Lock)
    if (body.action === 'increment_google_setup_count') {
      const currentSetting = await prisma.systemSetting.findUnique({
        where: { key: `googleSetupOpenCount_${instituteId}` }
      });
      const currentVal = currentSetting ? (parseInt(currentSetting.value, 10) || 0) : 0;
      const nextVal = currentVal + 1;
      await prisma.systemSetting.upsert({
        where: { key: `googleSetupOpenCount_${instituteId}` },
        create: { key: `googleSetupOpenCount_${instituteId}`, value: String(nextVal) },
        update: { value: String(nextVal) }
      });
      return NextResponse.json({ success: true, googleSetupOpenCount: nextVal });
    }

    if (body.action === 'reset_google_setup_count') {
      await prisma.systemSetting.upsert({
        where: { key: `googleSetupOpenCount_${instituteId}` },
        create: { key: `googleSetupOpenCount_${instituteId}`, value: '0' },
        update: { value: '0' }
      });
      return NextResponse.json({ success: true, googleSetupOpenCount: 0 });
    }

    // 2. ADMIN FULL EDIT OF AN EXISTING BILL RECORD
    if (body.action === 'edit_bill' && body.billId) {
      const existing = await prisma.billRecord.findUnique({ where: { id: body.billId } });
      if (!existing) {
        return NextResponse.json({ error: 'Bill record not found' }, { status: 404 });
      }
      if (session.role !== 'admin' && existing.instituteId !== instituteId) {
        return NextResponse.json({ error: 'Unauthorized to edit this bill' }, { status: 403 });
      }

      const gross = Number(body.grossFee) >= 0 ? Number(body.grossFee) : (Number(existing.grossFee) || Number(existing.totalFee));
      const discPct = Number(body.discountPercent) >= 0 ? Number(body.discountPercent) : (Number(existing.discountPercent) || 0);
      const discAmt = gross * (discPct / 100);
      const total = Number(body.totalFee) >= 0 ? Number(body.totalFee) : Math.max(0, gross - discAmt);
      const paid = Number(body.paidAmount) >= 0 ? Number(body.paidAmount) : Number(existing.paidAmount || 0);

      // PAYMENT CANNOT ACCEPT MORE THAN COURSE GROSS FEE OR AFTER DISCOUNT FEE
      const maxAllowed = total > 0 ? total : gross;
      if (paid > maxAllowed) {
        return NextResponse.json({
          error: `Paid amount (Rs. ${paid.toLocaleString()}) cannot exceed course fee after discount (Rs. ${maxAllowed.toLocaleString()}).`
        }, { status: 400 });
      }

      const due = Math.max(0, total - paid);

      const updatedBill = await prisma.billRecord.update({
        where: { id: body.billId },
        data: {
          date: body.date || existing.date,
          studentName: body.studentName ? body.studentName.trim() : existing.studentName,
          address: body.address !== undefined ? body.address : existing.address,
          contactNumber: body.contactNumber ? body.contactNumber.trim() : existing.contactNumber,
          parentName: body.parentName !== undefined ? (body.parentName || '').trim() : existing.parentName,
          parentNumber: body.parentNumber !== undefined ? body.parentNumber : existing.parentNumber,
          classTime: body.classTime !== undefined ? (body.classTime || '').trim() : existing.classTime,
          courseDetail: body.courseDetail ? body.courseDetail.trim() : existing.courseDetail,
          coursePackage: body.coursePackage || existing.coursePackage,
          paymentSystem: body.paymentSystem || existing.paymentSystem,
          grossFee: gross,
          discountPercent: discPct,
          discountAmount: discAmt,
          totalFee: total,
          paidAmount: paid,
          dueAmount: due,
          amountInWords: body.amountInWords || existing.amountInWords,
          materialsJson: body.materials ? JSON.stringify(body.materials) : existing.materialsJson,
          preparedBy: body.preparedBy !== undefined ? body.preparedBy : existing.preparedBy,
          parentBillNumber: (body.paymentMethod && body.paymentMethod.trim()) ? body.paymentMethod.trim() : (existing.parentBillNumber || 'Cash')
        }
      });

      // Real-time background auto-sync to linked Google Sheet
      triggerSheetSync(instituteId, updatedBill, body.materials || (existing.materialsJson ? JSON.parse(existing.materialsJson) : []));

      return NextResponse.json({ success: true, bill: updatedBill, message: 'Bill record updated successfully.' });
    }

    // 2. ADMIN EDIT COMPANY BILL PAD HEADER (Unrestricted for Admin)
    let profile = await prisma.billingProfile.findUnique({ where: { instituteId } });

    if (profile) {
      const updated = await prisma.billingProfile.update({
        where: { instituteId },
        data: {
          companyName: body.companyName ?? profile.companyName,
          companyAddress: body.companyAddress ?? profile.companyAddress,
          contactNumber: body.contactNumber ?? profile.contactNumber,
          email: body.email ?? profile.email,
          panVatNumber: body.panVatNumber ?? profile.panVatNumber,
          logoUrl: body.logoUrl !== undefined ? body.logoUrl : profile.logoUrl,
          stampUrl: body.stampUrl !== undefined ? body.stampUrl : profile.stampUrl,
          googleSheetUrl: body.googleSheetUrl !== undefined ? body.googleSheetUrl : profile.googleSheetUrl,
          ownerEmail: body.ownerEmail !== undefined ? body.ownerEmail : profile.ownerEmail,
          editCount: profile.editCount + 1,
          isLocked: false
        }
      });

      return NextResponse.json({
        success: true,
        profile: updated,
        message: 'Bill Pad Header updated successfully.'
      });
    } else {
      const created = await prisma.billingProfile.create({
        data: {
          instituteId,
          companyName: body.companyName || 'SIGMA EDUCATION KOREAN BHASA CENTER',
          companyAddress: body.companyAddress || 'Samakhushi Chowk, Kathmandu',
          contactNumber: body.contactNumber || '9768444902, 9806100148',
          email: body.email || 'sigmaedu2023@gmail.com',
          panVatNumber: body.panVatNumber || '616838513',
          logoUrl: body.logoUrl || '/sigma-logo.png',
          stampUrl: body.stampUrl || '',
          googleSheetUrl: body.googleSheetUrl || '',
          ownerEmail: body.ownerEmail || '',
          editCount: 0,
          isLocked: false
        }
      });

      return NextResponse.json({
        success: true,
        profile: created,
        message: 'Bill Pad Header initialized. 1 lifetime correction remaining.'
      });
    }
  } catch (err) {
    console.error('Error updating billing profile:', err);
    return NextResponse.json({ error: 'Failed to update billing profile' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { session, errorResponse } = await requireInstituteAdmin(req);
    if (errorResponse) return errorResponse;

    const instituteId = session.instituteId || 'default-institute';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
    }

    const bill = await prisma.billRecord.findUnique({ where: { id } });
    if (!bill) {
      return NextResponse.json({ error: 'Bill record not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && bill.instituteId !== instituteId) {
      return NextResponse.json({ error: 'Unauthorized to delete this bill' }, { status: 403 });
    }

    await prisma.billRecord.delete({ where: { id } });

    // Real-time update Google Sheet on deletion
    triggerSheetSync(instituteId, { id, billNumber: bill.billNumber, isDeleted: true }, []);

    return NextResponse.json({ success: true, message: 'Bill record deleted successfully' });
  } catch (err) {
    console.error('Error deleting bill record:', err);
    return NextResponse.json({ error: 'Failed to delete bill record' }, { status: 500 });
  }
}
