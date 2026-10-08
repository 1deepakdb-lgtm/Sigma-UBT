import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireInstituteOrAdmin } from '@/lib/rbac';

function formatGoogleError(status, errText, url) {
  if (status === 401) {
    return 'Google Permission Denied (Status 401): Google rejected the request because the Apps Script is not deployed to "Anyone". Fix: In Google Sheets, click Extensions > Apps Script > Deploy > Manage deployments > Edit (pencil icon), change "Who has access" from "Only myself" to "Anyone", and click Deploy again.';
  }
  if (status === 403) {
    return 'Google Forbidden Error (Status 403): You do not have permission to execute this Apps Script Web App. Ensure "Who has access" is set to "Anyone" and "Execute as" is set to "Me".';
  }
  if (status === 404) {
    return 'Google Apps Script Not Found (Status 404): The deployment URL does not exist or was deleted. Please create a new deployment (Deploy > New deployment > Web app) and copy the /exec URL.';
  }
  if (errText && (errText.includes('<!DOCTYPE') || errText.includes('<html'))) {
    if (errText.includes('drive-logo') || errText.includes('असमर्थ') || errText.includes('drive.google.com')) {
      return 'The URL entered points to a Google Drive file/folder instead of an Apps Script Web App. Please follow Tab 2 ("Apps Script Guide") to deploy the script and copy the URL ending in /exec.';
    }
    return `Google returned an error page (Status ${status}). Please ensure your Apps Script is deployed as Web App with access set to "Anyone" and ends with /exec.`;
  }
  return `Google Apps Script returned status ${status}. ${errText || 'Please verify deployment permissions.'}`;
}

export async function POST(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const instituteId = session.instituteId || 'default-institute';
    const body = await req.json();

    const profile = await prisma.billingProfile.findUnique({
      where: { instituteId }
    });

    const googleSheetUrl = (body.googleSheetUrl || profile?.googleSheetUrl || '').trim();
    const ownerEmail = (body.ownerEmail || profile?.ownerEmail || '').trim();

    if (!googleSheetUrl) {
      return NextResponse.json({
        error: 'Google Sheet Webhook URL is not configured. Please enter your Google Apps Script Web App URL.'
      }, { status: 400 });
    }

    if (googleSheetUrl.includes('drive.google.com')) {
      return NextResponse.json({
        error: 'The entered URL is a Google Drive link. Google Drive links cannot receive automated sync requests. Please deploy the Apps Script Web App (starts with https://script.google.com/macros/s/.../exec) following the guide in Tab 2.'
      }, { status: 400 });
    }

    if (googleSheetUrl.includes('docs.google.com')) {
      return NextResponse.json({
        error: 'The entered URL is a Google Spreadsheet document link, not an Apps Script Web App URL. To enable automated cloud sync, deploy the Apps Script Web App (starts with https://script.google.com/macros/s/.../exec) following the guide in Tab 2.'
      }, { status: 400 });
    }

    if (googleSheetUrl.endsWith('/dev')) {
      return NextResponse.json({
        error: 'You entered a development test URL ending in "/dev". Google blocks external server access to /dev URLs. Please deploy a production Web App (Deploy > New deployment > Web app) and use the URL that ends with "/exec".'
      }, { status: 400 });
    }

    if (!googleSheetUrl.includes('script.google.com/macros/s/')) {
      return NextResponse.json({
        error: 'Invalid Webhook URL format. A valid Google Apps Script Web App URL must start with "https://script.google.com/macros/s/..." and end with "/exec".'
      }, { status: 400 });
    }

    // Handle Connection Test Ping
    if (body.action === 'test') {
      const testPayload = {
        action: 'test',
        instituteName: profile?.companyName || session.name || 'Institute',
        ownerEmail: ownerEmail || '',
        timestamp: new Date().toISOString()
      };

      try {
        const res = await fetch(googleSheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload),
          redirect: 'follow'
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          return NextResponse.json({
            error: formatGoogleError(res.status, errText, googleSheetUrl)
          }, { status: 502 });
        }

        let testResult = null;
        try {
          const text = await res.text();
          try {
            testResult = JSON.parse(text);
          } catch {
            testResult = { message: text };
          }
        } catch {
          testResult = { message: 'Connection successful' };
        }

        return NextResponse.json({
          success: true,
          message: testResult.message || 'Connection test successful! Google Sheet Webhook is active and responding.',
          details: testResult
        });
      } catch (fetchErr) {
        return NextResponse.json({
          error: `Failed to connect to Google Apps Script URL: ${fetchErr.message}. Make sure the Web App is deployed with "Who has access: Anyone".`
        }, { status: 502 });
      }
    }

    // Bulk Sync Bills - Accept from body or query DB
    let bills = [];
    if (Array.isArray(body.bills) && body.bills.length > 0) {
      bills = body.bills;
    } else {
      bills = await prisma.billRecord.findMany({
        where: instituteId && instituteId !== 'default-institute' ? { instituteId } : {},
        orderBy: { createdAt: 'asc' }
      });
      if (bills.length === 0) {
        bills = await prisma.billRecord.findMany({
          orderBy: { createdAt: 'asc' }
        });
      }
    }

    const payload = {
      action: 'bulk_sync',
      instituteName: profile?.companyName || session.name || 'Institute',
      ownerEmail: ownerEmail || '',
      bills: bills.map((b) => ({
        billNumber: b.billNumber,
        date: b.date,
        studentName: b.studentName,
        address: b.address,
        contactNumber: b.contactNumber,
        parentNumber: b.parentNumber || '',
        courseDetail: b.courseDetail,
        coursePackage: b.coursePackage,
        paymentSystem: b.paymentSystem,
        paymentMethod: b.paymentMethod || b.parentBillNumber || 'Cash',
        grossFee: b.grossFee || b.totalFee,
        discountPercent: b.discountPercent || 0,
        discountAmount: b.discountAmount || 0,
        totalFee: b.totalFee, // Includes 13% VAT/PAN
        vatPercent: 13,
        vatAmount: b.vatAmount || (b.totalFee - b.totalFee / 1.13),
        paidAmount: b.paidAmount,
        dueAmount: b.dueAmount,
        amountInWords: b.amountInWords,
        preparedBy: b.preparedBy,
        createdAt: b.createdAt
      }))
    };

    const res = await fetch(googleSheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return NextResponse.json({
        error: formatGoogleError(res.status, errText, googleSheetUrl)
      }, { status: 502 });
    }

    let result = null;
    try {
      const text = await res.text();
      try {
        result = JSON.parse(text);
      } catch {
        result = { message: text };
      }
    } catch {
      result = { success: true };
    }

    if (bills.length > 0) {
      try {
        const billNumbers = bills.map(b => b.billNumber).filter(Boolean);
        if (billNumbers.length > 0) {
          await prisma.billRecord.updateMany({
            where: { billNumber: { in: billNumbers } },
            data: { isSyncedToSheet: true, syncedAt: new Date() }
          });
        }
      } catch (dbErr) {
        console.warn('Failed to update synced flags in DB:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${bills.length} bills to Google Sheet!`,
      totalBills: bills.length,
      result
    });
  } catch (err) {
    console.error('Error syncing to Google Sheet:', err);
    return NextResponse.json({
      error: `Sync error: ${err.message || 'Failed to reach Google Apps Script'}`
    }, { status: 500 });
  }
}
