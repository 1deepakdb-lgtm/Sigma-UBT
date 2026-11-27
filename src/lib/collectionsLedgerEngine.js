/**
 * collectionsLedgerEngine.js
 * Single Source of Truth for Collections Ledger, Daily, Weekly, and Monthly Records.
 *
 * Implements strict accounting principles:
 * 1. Billed Amount: Derived from active (non-cancelled) bill totalFee.
 * 2. Collected Amount: Derived strictly from individual payment transactions (paymentsJson or installments).
 * 3. Outstanding Amount: Billed Fee - Valid Collected Payments.
 * 4. Transaction Dates: Collections are attributed to the actual date the payment was received, NOT the bill date.
 * 5. Bill Edits: Editing a bill fee recalculates outstanding balances without falsely creating/inflating collections.
 * 6. Cancellations & Refunds: Cancelled bills and refund transactions are distinctly tracked.
 */

// Format date to YYYY-MM-DD in Asia/Kathmandu timezone (default)
export function getKathmanduDateStr(dateInput = new Date()) {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

// Compute standard date range boundaries
export function getDateRangeBoundaries(timeframe = 'daily', targetMonth = null, customStart = null, customEnd = null) {
  const today = getKathmanduDateStr();
  
  if (timeframe === 'today' || timeframe === 'daily') {
    return { startDate: today, endDate: today, label: `Daily (${today})` };
  }

  if (timeframe === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yest = getKathmanduDateStr(d);
    return { startDate: yest, endDate: yest, label: `Yesterday (${yest})` };
  }

  if (timeframe === 'weekly' || timeframe === 'week') {
    // 7 days window up to today
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const startWeek = getKathmanduDateStr(d);
    return { startDate: startWeek, endDate: today, label: `Weekly (${startWeek} to ${today})` };
  }

  if (timeframe === 'monthly' || timeframe === 'month') {
    const mStr = targetMonth || today.slice(0, 7); // YYYY-MM
    const [y, m] = mStr.split('-').map(Number);
    const firstDay = `${mStr}-01`;
    const lastDayNum = new Date(y, m, 0).getDate();
    const lastDay = `${mStr}-${String(lastDayNum).padStart(2, '0')}`;
    return { startDate: firstDay, endDate: lastDay, targetMonth: mStr, label: `Monthly (${mStr})` };
  }

  if (timeframe === 'custom' && customStart && customEnd) {
    return { startDate: customStart, endDate: customEnd, label: `Custom (${customStart} to ${customEnd})` };
  }

  return { startDate: '1970-01-01', endDate: '2099-12-31', label: 'All-Time' };
}

// Normalize payment method string across all possible inputs (Cash, Esewa, Khalti, Bank, etc.)
export function normalizePaymentMethod(rawMethod) {
  if (!rawMethod) return 'Cash';
  const s = String(rawMethod).trim().toLowerCase();
  if (s.includes('esewa') || s.includes('e-sewa')) return 'Online Esewa';
  if (s.includes('khalti')) return 'Online Khalti';
  if (s.includes('bank') || s.includes('acc') || s.includes('account') || s.includes('transfer') || s.includes('fonepay') || s.includes('connectips')) return 'Online Bank Acc';
  if (s.includes('cash')) return 'Cash';
  return 'Other';
}

/**
 * Extracts and normalizes individual payment transactions from a BillRecord.
 * Every transaction contains:
 * - billNumber, studentName, contactNumber, address
 * - date (actual payment date)
 * - amount (actual payment amount)
 * - paymentMethod (Cash, Online Bank Acc, Online Esewa, Online Khalti, Other)
 * - installment (1, 2, 3...)
 * - isRefund (boolean)
 * - isCancelled (boolean)
 */
export function extractTransactionsFromBill(bill) {
  if (!bill) return [];
  
  const isCancelled = Boolean(
    bill.isCancelled ||
    bill.paymentSystem === 'CANCELLED' ||
    bill.paymentSystem === 'Cancelled'
  );

  let txs = [];
  try {
    if (bill.paymentsJson) {
      const parsed = typeof bill.paymentsJson === 'string' ? JSON.parse(bill.paymentsJson) : bill.paymentsJson;
      if (Array.isArray(parsed) && parsed.length > 0) {
        txs = parsed.map((p, idx) => ({
          id: p.id || `${bill.id || bill.billNumber}-tx-${idx + 1}`,
          billId: bill.id,
          billNumber: bill.billNumber,
          studentName: bill.studentName,
          address: bill.address || '',
          contactNumber: bill.contactNumber,
          date: p.date || bill.date || getKathmanduDateStr(),
          amount: Number(p.amount) || 0,
          paymentMethod: normalizePaymentMethod(p.paymentMethod || bill.paymentMethod || bill.parentBillNumber || 'Cash'),
          installment: p.installment || (idx + 1),
          preparedBy: p.preparedBy || bill.preparedBy || '',
          isRefund: Boolean(p.isRefund || (Number(p.amount) < 0)),
          isCancelled
        }));
      }
    }
  } catch (e) {
    txs = [];
  }

  // Fallback if paymentsJson was empty or not populated
  if (txs.length === 0) {
    if (bill.firstInstallment && Number(bill.firstInstallment) > 0) {
      txs.push({
        id: `${bill.id || bill.billNumber}-tx-1`,
        billId: bill.id,
        billNumber: bill.billNumber,
        studentName: bill.studentName,
        address: bill.address || '',
        contactNumber: bill.contactNumber,
        date: bill.firstPaymentDate || bill.date || getKathmanduDateStr(),
        amount: Number(bill.firstInstallment) || 0,
        paymentMethod: normalizePaymentMethod(bill.paymentMethod || bill.parentBillNumber || 'Cash'),
        installment: 1,
        preparedBy: bill.preparedBy || '',
        isRefund: false,
        isCancelled
      });
    }
    if (bill.secondInstallment && Number(bill.secondInstallment) > 0) {
      txs.push({
        id: `${bill.id || bill.billNumber}-tx-2`,
        billId: bill.id,
        billNumber: bill.billNumber,
        studentName: bill.studentName,
        address: bill.address || '',
        contactNumber: bill.contactNumber,
        date: bill.secondPaymentDate || bill.date || getKathmanduDateStr(),
        amount: Number(bill.secondInstallment) || 0,
        paymentMethod: normalizePaymentMethod(bill.paymentMethod || bill.parentBillNumber || 'Cash'),
        installment: 2,
        preparedBy: bill.preparedBy || '',
        isRefund: false,
        isCancelled
      });
    }
    if (bill.thirdInstallment && Number(bill.thirdInstallment) > 0) {
      txs.push({
        id: `${bill.id || bill.billNumber}-tx-3`,
        billId: bill.id,
        billNumber: bill.billNumber,
        studentName: bill.studentName,
        address: bill.address || '',
        contactNumber: bill.contactNumber,
        date: bill.thirdPaymentDate || bill.date || getKathmanduDateStr(),
        amount: Number(bill.thirdInstallment) || 0,
        paymentMethod: normalizePaymentMethod(bill.paymentMethod || bill.parentBillNumber || 'Cash'),
        installment: 3,
        preparedBy: bill.preparedBy || '',
        isRefund: false,
        isCancelled
      });
    }
  }

  // Final fallback to paidAmount
  if (txs.length === 0 && Number(bill.paidAmount) > 0) {
    txs.push({
      id: `${bill.id || bill.billNumber}-tx-main`,
      billId: bill.id,
      billNumber: bill.billNumber,
      studentName: bill.studentName,
      address: bill.address || '',
      contactNumber: bill.contactNumber,
      date: bill.date || getKathmanduDateStr(),
      amount: Number(bill.paidAmount) || 0,
      paymentMethod: normalizePaymentMethod(bill.paymentMethod || bill.parentBillNumber || 'Cash'),
      installment: 1,
      preparedBy: bill.preparedBy || '',
      isRefund: false,
      isCancelled
    });
  }

  return txs;
}

/**
 * Calculates Single-Source-of-Truth financial metrics across any set of bills.
 * 
 * Supports options:
 * - timeframe: "daily" | "today" | "yesterday" | "weekly" | "monthly" | "all" | "custom"
 * - targetMonth: "YYYY-MM"
 * - customStart: "YYYY-MM-DD"
 * - customEnd: "YYYY-MM-DD"
 * - paymentMethodFilter: "all" | "Cash" | "Online Bank Acc" | "Online Esewa" | "Online Khalti" | "Other"
 */
export function calculateCollectionsLedger(bills = [], options = {}) {
  const {
    timeframe = 'all',
    targetMonth = null,
    customStart = null,
    customEnd = null,
    paymentMethodFilter = 'all'
  } = options;

  const { startDate, endDate, label } = getDateRangeBoundaries(timeframe, targetMonth, customStart, customEnd);

  let totalBilled = 0;          // Total course fee invoiced in period
  let totalGrossFee = 0;        // Gross fee before discount
  let totalDiscount = 0;        // Discount amount
  let totalCollected = 0;       // Cash + Online received in period
  let totalOutstanding = 0;     // Remaining due on active bills in period
  let totalRefunds = 0;         // Refunds issued in period
  let totalCash = 0;            // Total cash in hand
  let totalOnline = 0;          // Total digital/online payments
  
  let totalBillsIssued = 0;     // Number of non-cancelled bills issued in period
  let cancelledBillsCount = 0;  // Number of cancelled bills
  let cancelledBilledAmount = 0;// Billed amount on cancelled bills
  let partialPaymentsCount = 0; // Number of partial installment payments

  const methodBreakdown = {
    Cash: 0,
    'Online Bank Acc': 0,
    'Online Esewa': 0,
    'Online Khalti': 0,
    Other: 0
  };

  const matchingTransactions = [];
  const matchingBills = [];

  // 1. Process Bills for Invoicing Stats (Billed Amount, Discount, Outstanding)
  // Bill issuance is attributed to bill.date
  bills.forEach((bill) => {
    const billDate = bill.date || (bill.createdAt ? new Date(bill.createdAt).toISOString().split('T')[0] : '');
    const isCancelled = Boolean(
      bill.isCancelled ||
      bill.paymentSystem === 'CANCELLED' ||
      bill.paymentSystem === 'Cancelled'
    );

    const inBillPeriod = (billDate >= startDate && billDate <= endDate);

    if (inBillPeriod) {
      matchingBills.push(bill);
      if (isCancelled) {
        cancelledBillsCount++;
        cancelledBilledAmount += Number(bill.totalFee) || 0;
      } else {
        totalBillsIssued++;
        totalGrossFee += Number(bill.grossFee) || Number(bill.totalFee) || 0;
        totalDiscount += Number(bill.discountAmount) || 0;
        totalBilled += Number(bill.totalFee) || 0;
        totalOutstanding += Math.max(0, Number(bill.dueAmount) || 0);
      }
    }
  });

  // 2. Process Actual Payment Transactions (Collections & Method Breakdown)
  // Collection is attributed to tx.date (actual transaction date)
  bills.forEach((bill) => {
    const txs = extractTransactionsFromBill(bill);
    
    txs.forEach((tx) => {
      // If bill is cancelled and tx is marked cancelled, omit from collections unless non-refundable
      if (tx.isCancelled) return;

      const txDate = tx.date || bill.date || '';
      const inTxPeriod = (txDate >= startDate && txDate <= endDate);

      if (!inTxPeriod) return;

      // Method filter
      const m = normalizePaymentMethod(tx.paymentMethod);
      if (paymentMethodFilter !== 'all' && m !== paymentMethodFilter) return;

      matchingTransactions.push(tx);

      if (tx.isRefund || tx.amount < 0) {
        totalRefunds += Math.abs(tx.amount);
        totalCollected -= Math.abs(tx.amount);
      } else {
        totalCollected += tx.amount;
        if (tx.installment > 1) {
          partialPaymentsCount++;
        }

        if (m === 'Cash') {
          totalCash += tx.amount;
          methodBreakdown.Cash += tx.amount;
        } else if (m === 'Online Bank Acc') {
          totalOnline += tx.amount;
          methodBreakdown['Online Bank Acc'] += tx.amount;
        } else if (m === 'Online Esewa') {
          totalOnline += tx.amount;
          methodBreakdown['Online Esewa'] += tx.amount;
        } else if (m === 'Online Khalti') {
          totalOnline += tx.amount;
          methodBreakdown['Online Khalti'] += tx.amount;
        } else {
          totalOnline += tx.amount;
          methodBreakdown.Other += tx.amount;
        }
      }
    });
  });

  return {
    timeframe,
    label,
    startDate,
    endDate,
    totalBilled,
    totalGrossFee,
    totalDiscount,
    totalCollected,
    totalOutstanding,
    totalRefunds,
    totalCash,
    totalOnline,
    totalBillsIssued,
    cancelledBillsCount,
    cancelledBilledAmount,
    partialPaymentsCount,
    breakdown: methodBreakdown,
    transactionsCount: matchingTransactions.length,
    transactions: matchingTransactions,
    billsCount: matchingBills.length
  };
}
