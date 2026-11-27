import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { billNumber } = params || {};
    if (!billNumber) {
      return NextResponse.json({ error: 'Bill number is required' }, { status: 400 });
    }

    const decoded = decodeURIComponent(billNumber).trim();

    // Find bill by billNumber or id
    const bill = await prisma.billRecord.findFirst({
      where: {
        OR: [
          { billNumber: { equals: decoded } },
          { id: { equals: decoded } }
        ]
      }
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Fetch billing profile for the institute
    let profile = null;
    if (bill.instituteId) {
      profile = await prisma.billingProfile.findUnique({
        where: { instituteId: bill.instituteId }
      });

      if (!profile) {
        const inst = await prisma.institute.findUnique({
          where: { id: bill.instituteId }
        });
        profile = {
          companyName: inst?.name || 'EXAMJK EDUCATION KOREAN BHASA CENTER',
          companyAddress: 'Samakhushi Chowk, Kathmandu',
          contactNumber: '9768444902, 9806100148',
          email: 'examjkedu@gmail.com',
          panVatNumber: '616838513',
          logoUrl: inst?.logoUrl || '/logo.png',
          stampUrl: ''
        };
      }
    }

    return NextResponse.json({ success: true, bill, profile });
  } catch (err) {
    console.error('Error fetching public bill:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
