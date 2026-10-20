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

    const { searchParams: __sp } = new URL(req.url);
    const instIdQuery = __sp.get('instId');
    const instituteId = (session.role === 'admin' ? instIdQuery : null) || session.instituteId || 'default-institute';
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

    // Helper: English-only Date Time for Last Updated column
    const nowEnglish = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date());

    // Handle Single Expense Sync (Create, Edit, Delete)
    if (body.action === 'sync_expense' || body.action === 'append_or_update_expense') {
      const exp = body.expense;
      if (!exp) {
        return NextResponse.json({ error: 'No expense payload provided' }, { status: 400 });
      }

      const expPayload = {
        action: 'append_or_update_expense',
        ownerEmail: ownerEmail || '',
        expense: {
          id: exp.id,
          date: exp.date,
          title: exp.title,
          category: exp.category,
          amount: Number(exp.amount) || 0,
          paymentMethod: exp.paymentMethod || 'Cash',
          remarks: exp.remarks || '',
          recordedBy: exp.recordedBy || '',
          lastUpdated: exp.lastUpdated || nowEnglish,
          isDeleted: Boolean(exp.isDeleted)
        }
      };

      try {
        const res = await fetch(googleSheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expPayload),
          redirect: 'follow'
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          return NextResponse.json({
            error: formatGoogleError(res.status, errText, googleSheetUrl)
          }, { status: 502 });
        }

        let expResult = null;
        try {
          const text = await res.text();
          try { expResult = JSON.parse(text); } catch { expResult = { message: text }; }
        } catch {
          expResult = { success: true };
        }

        if (expResult?.message === "Sheet ready." || (expResult?.status === "success" && !expResult?.action && !expResult?.message?.includes("expense"))) {
          return NextResponse.json({
            success: false,
            error: "Your Google Sheet is still running an older version of the Apps Script code. To enable automatic expense storage: Open your Google Sheet, click Extensions > Apps Script, paste the updated script from Tab 2, and deploy as a New version.",
            needsScriptUpdate: true
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          message: expResult?.message || 'Expense successfully synced to Google Sheet!',
          result: expResult
        });
      } catch (expErr) {
        return NextResponse.json({
          error: `Failed to sync expense to Google Apps Script URL: ${expErr.message}`
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

    // Ensure exactly 1 entry per student (by 10-digit contactNumber or billNumber)
    const uniqueBillsMap = new Map();
    for (const b of bills) {
      const cleanPhone = (b.contactNumber || '').replace(/\D/g, '').slice(-10);
      const key = cleanPhone || String(b.billNumber || '').trim().toLowerCase() || b.id;
      uniqueBillsMap.set(key, b);
    }
    const deduplicatedBills = Array.from(uniqueBillsMap.values());

    // Helper: Format Nepali mobile numbers with +977- prefix for Google Sheet
    const formatNepalPhone = (val) => {
      if (!val) return '';
      const digits = String(val).replace(/\D/g, '');
      const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
      return last10 ? `'+977-${last10}` : '';
    };

    let formattedExpenses = [];
    if (Array.isArray(body.expenses) && body.expenses.length > 0) {
      formattedExpenses = body.expenses.map((exp) => ({
        id: exp.id,
        date: exp.date,
        title: exp.title,
        category: exp.category,
        amount: Number(exp.amount) || 0,
        paymentMethod: exp.paymentMethod || 'Cash',
        remarks: exp.remarks || '',
        recordedBy: exp.recordedBy || '',
        lastUpdated: exp.lastUpdated || nowEnglish
      }));
    }

    const payload = {
      action: 'bulk_sync',
      instituteName: profile?.companyName || session.name || 'Institute',
      ownerEmail: ownerEmail || '',
      bills: deduplicatedBills.map((b) => ({
        billNumber: b.billNumber,
        date: b.date,
        studentName: b.studentName,
        address: b.address,
        contactNumber: formatNepalPhone(b.contactNumber),
        parentNumber: formatNepalPhone(b.parentNumber),
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
        createdAt: b.createdAt,
        lastUpdated: nowEnglish
      })),
      expenses: formattedExpenses
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

    if (formattedExpenses.length > 0 && result && result.syncedExpenses === undefined) {
      return NextResponse.json({
        success: false,
        error: "Your Google Sheet is still running an older version of the Apps Script code. To enable automatic expense storage: Open your Google Sheet, click Extensions > Apps Script, paste the updated script from Tab 2, and deploy as a New version.",
        needsScriptUpdate: true,
        result
      }, { status: 400 });
    }

    const successMsg = formattedExpenses.length > 0
      ? `Successfully synchronized ${bills.length} bills and ${formattedExpenses.length} expenses to Google Sheet!`
      : `Successfully synchronized ${bills.length} bills to Google Sheet!`;

    return NextResponse.json({
      success: true,
      message: successMsg,
      totalBills: bills.length,
      totalExpenses: formattedExpenses.length,
      result
    });
  } catch (err) {
    console.error('Error syncing to Google Sheet:', err);
    return NextResponse.json({
      error: `Sync error: ${err.message || 'Failed to reach Google Apps Script'}`
    }, { status: 500 });
  }
}
