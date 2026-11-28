"use client";
import React, { useState, useEffect } from "react";
import { formatCurrency, formatDateDisplay, formatDateMMDDYYYY, getPaymentCountdown, getPaymentMethodIcon } from "@/components/InstituteBillingSection";

export default function PublicBillPage({ params }) {
  const [billNumber, setBillNumber] = useState("");
  const [bill, setBill] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Unwrap params in Next.js 14 / client
    if (params && params.billNumber) {
      setBillNumber(params.billNumber);
    }
  }, [params]);

  useEffect(() => {
    if (!billNumber) return;
    setLoading(true);
    fetch(`/api/bill/${encodeURIComponent(billNumber)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.bill) {
          setBill(d.bill);
          setProfile(d.profile || {});
        } else {
          setError(d.error || "Bill not found");
        }
      })
      .catch(e => {
        console.error("Fetch bill error:", e);
        setError("Failed to load bill. Please check your internet connection.");
      })
      .finally(() => setLoading(false));
  }, [billNumber]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", padding: "30px", backgroundColor: "#ffffff", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>⏳</div>
          <div style={{ fontWeight: "bold", color: "#1e3a8a", fontSize: "16px" }}>Loading Official Bill PDF...</div>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", padding: "30px 40px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1.5px solid #fca5a5", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", maxWidth: "420px" }}>
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>⚠️</div>
          <h2 style={{ color: "#dc2626", margin: "0 0 8px 0", fontSize: "18px" }}>Bill Not Found</h2>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 16px 0" }}>{error || "The requested invoice could not be located."}</p>
        </div>
      </div>
    );
  }

  const selectedInvoice = bill;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", padding: "20px 10px", fontFamily: "sans-serif" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-bill-pad {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
        }
        `
      }} />

      {/* Top Floating Action Controls */}
      <div className="no-print" style={{
        maxWidth: "800px",
        margin: "0 auto 16px auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1e3a8a",
        padding: "12px 20px",
        borderRadius: "8px",
        color: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>📄</span>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>Official Bill Receipt</div>
            <div style={{ fontSize: "11px", color: "#93c5fd" }}>Bill No: {bill.billNumber}</div>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            backgroundColor: "#dc2626",
            color: "#ffffff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 6px rgba(220, 38, 38, 0.3)"
          }}
        >
          <span>🖨️</span>
          <span>Save as PDF / Print</span>
        </button>
      </div>

      {/* Bill Container */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        overflow: "hidden"
      }}>
<div id="printable-bill-pad" style={{
                padding: "8px 14px",
                backgroundColor: "#ffffff",
                fontFamily: "Arial, sans-serif",
                color: "#000000",
                border: "2px solid #000000",
                borderRadius: "6px"
              }}>
                {/* Top Header Matching User Image - Unified, Never Separates */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px",
                  marginBottom: "2px",
                  pageBreakInside: "avoid",
                  breakInside: "avoid"
                }}>
                  <img
                    src={profile.logoUrl || "/examjk-logo.png"}
                    alt="Logo"
                    style={{ width: "60px", height: "60px", objectFit: "contain", flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ textAlign: "center" }}>
                    <h1 style={{
                      margin: "0 0 1px 0",
                      fontSize: "24px",
                      fontWeight: "900",
                      fontFamily: "Georgia, serif",
                      color: "#000000",
                      lineHeight: "1.15"
                    }}>
                      {profile.companyName || "EXAMJK EDUCATION & CBT CENTER"}
                    </h1>
                    <div style={{ fontSize: "13px", fontWeight: "bold", color: "#000000", marginBottom: "1px", lineHeight: "1.15" }}>
                      {profile.companyAddress || "Samakhushi Chowk, Kathmandu"}
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "#000000", lineHeight: "1.15" }}>
                      Email: {profile.email || "examjk2026@gmail.com"} &nbsp;|&nbsp; Contact No: {profile.contactNumber || "9768444902, 9806100148"}
                    </div>
                  </div>
                </div>

                {/* VAT/PAN and DATE line */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "2px",
                  paddingBottom: "2px",
                  borderTop: "1px solid #000000",
                  borderBottom: "1.5px solid #000000",
                  fontWeight: "bold",
                  fontSize: "12px",
                  marginBottom: "2px"
                }}>
                  <div>VAT/PAN: {profile.panVatNumber}</div>
                  <div>DATE: {formatDateMMDDYYYY(selectedInvoice.date)}</div>
                </div>

                {/* Bill Number & Student Info Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: "2px",
                  padding: "4px 8px",
                  border: "1px solid #000000",
                  borderRadius: "4px",
                  marginBottom: "2px",
                  fontSize: "12px",
                  lineHeight: "1.25"
                }}>
                  <div>
                    <div><strong>BILL NO:</strong> <span style={{ fontWeight: "900", fontSize: "12px" }}>{selectedInvoice.billNumber}</span></div>
                    <div><strong>Student Name:</strong> <strong>{selectedInvoice.studentName}</strong></div>
                    <div><strong>Address:</strong> {selectedInvoice.address || "-"}</div>
                  </div>

                  <div>
                    <div><strong>Contact Number:</strong> {(() => {
                      const formatNum = (v) => {
                        if (!v) return "";
                        const d = String(v).replace(/\D/g, "");
                        const l10 = d.length >= 10 ? d.slice(-10) : d;
                        return l10 ? `+977-${l10}` : v;
                      };
                      return [formatNum(selectedInvoice.contactNumber), formatNum(selectedInvoice.parentNumber)].filter(Boolean).join(", ") || "-";
                    })()}</div>
                    {selectedInvoice.parentName && (
                      <div><strong>Parent Name:</strong> {selectedInvoice.parentName}</div>
                    )}
                  </div>
                </div>

                {/* Particulars Table Enclosed in a Complete Box with All Content Centered in Middle */}
                <div style={{
                  border: "1.5px solid #000000",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginBottom: "2px",
                  backgroundColor: "#ffffff"
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", margin: 0 }}>
                    <thead style={{ backgroundColor: "#d1d5db" }}>
                      <tr style={{ backgroundColor: "#d1d5db", borderBottom: "1.5px solid #000000" }}>
                        <th style={{ backgroundColor: "#d1d5db", padding: "2px 2px", width: "45px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", color: "#000000", fontWeight: "bold" }}>S.N.</th>
                        <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", color: "#000000", fontWeight: "bold" }}>Particulars / Items</th>
                        <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", width: "140px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", color: "#000000", fontWeight: "bold" }}>Package Term</th>
                        <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", width: "130px", textAlign: "center", verticalAlign: "middle", color: "#000000", fontWeight: "bold" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                        <td style={{ padding: "1px 1px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", fontWeight: "bold", color: "#000000" }}>1</td>
                        <td style={{ padding: "1px 3px", verticalAlign: "middle", borderRight: "1px solid #000000", color: "#000000" }}>
                          <strong style={{ fontSize: "12px" }}>{selectedInvoice.courseDetail}</strong>
                          {selectedInvoice.classTime ? <span style={{ fontSize: "11px", fontWeight: "normal", color: "#334155" }}> ({selectedInvoice.classTime})</span> : null}
                        </td>
                        <td style={{ padding: "1px 2px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", fontWeight: "600", color: "#000000" }}>
                          {selectedInvoice.coursePackage}
                        </td>
                        <td style={{ padding: "1px 2px", textAlign: "center", verticalAlign: "middle", fontWeight: "bold", color: "#000000" }}>
                          {formatCurrency(selectedInvoice.grossFee || selectedInvoice.totalFee)}
                        </td>
                      </tr>

                      {/* Dynamic Study Materials / Items with respective amounts */}
                      {(() => {
                        let items = [];
                        try {
                          if (selectedInvoice.materialsJson) items = JSON.parse(selectedInvoice.materialsJson);
                          else if (selectedInvoice.materials) items = selectedInvoice.materials;
                        } catch (e) {
                          items = [];
                        }

                        return items.map((mat, idx) => (
                          <tr key={idx} style={{ borderBottom: idx === items.length - 1 ? "none" : "1px solid #cbd5e1" }}>
                            <td style={{ padding: "1px 1px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", fontSize: "12px", color: "#000000" }}>{idx + 2}</td>
                            <td style={{ padding: "1px 3px", verticalAlign: "middle", borderRight: "1px solid #000000", fontSize: "12px", color: "#000000" }}>
                              <strong>{mat.name || "Study Item"}</strong> {mat.qty && Number(mat.qty) > 1 ? <span style={{ color: "#166534", fontWeight: "bold" }}> (Qty: {mat.qty} {mat.unit || ''})</span> : null}
                            </td>
                            <td style={{ padding: "1px 2px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", fontSize: "12px", color: "#000000" }}>
                              {mat.amount > 0 ? "Extra Charge" : "Included"}
                            </td>
                            <td style={{ padding: "1px 2px", textAlign: "center", verticalAlign: "middle", fontSize: "12px", fontWeight: mat.amount > 0 ? "bold" : "normal", color: "#000000" }}>
                              {mat.amount > 0 ? formatCurrency(mat.amount) : "Included"}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* 1. PAYMENT SUMMARY CARD (Full Width on Top) */}
                <div style={{
                  border: "1.5px solid #000000",
                  borderRadius: "5px",
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                  marginBottom: "2px"
                }}>
                  <div style={{
                    backgroundColor: "#d1d5db",
                    color: "#000000",
                    borderBottom: "1px solid #000000",
                    padding: "2px 4px",
                    fontWeight: "900",
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    textAlign: "center"
                  }}>
                    PAYMENT SUMMARY
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <tbody>
                      <tr style={{ backgroundColor: "#ffffff" }}>
                        <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", fontWeight: "bold", color: "#000000" }}>Course Fee (Gross):</td>
                        <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", fontWeight: "900", color: "#000000" }}>
                          {formatCurrency(selectedInvoice.grossFee || selectedInvoice.totalFee)}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: "#ffffff" }}>
                        <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", color: "#16a34a", fontWeight: "bold" }}>
                          Discount ({Number(selectedInvoice.discountPercent) || 0}%):
                        </td>
                        <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", color: "#16a34a", fontWeight: "900" }}>
                          - {formatCurrency(selectedInvoice.discountAmount || 0)}
                        </td>
                      </tr>
                      {/* Study Materials / Items Total on Invoice if any > 0 */}
                      {(() => {
                        let matItems = [];
                        try {
                          if (selectedInvoice.materialsJson) matItems = JSON.parse(selectedInvoice.materialsJson);
                          else if (selectedInvoice.materials) matItems = selectedInvoice.materials;
                        } catch (e) { }
                        const matTotal = matItems.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
                        if (matTotal > 0) {
                          return (
                            <tr style={{ backgroundColor: "#ffffff" }}>
                              <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", color: "#2563eb", fontWeight: "bold" }}>
                                Study Materials / Extra Items:
                              </td>
                              <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", color: "#2563eb", fontWeight: "900" }}>
                                + {formatCurrency(matTotal)}
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })()}
                      {/* Payment (Net Course Fee) */}
                      <tr style={{ backgroundColor: "#ffffff" }}>
                        <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", fontWeight: "bold", color: "#1e3a8a" }}>
                          Payment (Net Course Fee):
                        </td>
                        <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", fontWeight: "900", color: "#1e3a8a" }}>
                          {formatCurrency(Number(selectedInvoice.totalFee || 0) / 1.13)}
                        </td>
                      </tr>
                      {/* 13% VAT / PAN Amount */}
                      <tr style={{ backgroundColor: "#fefce8" }}>
                        <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", fontWeight: "bold", color: "#854d0e" }}>
                          13% VAT / PAN Amount:
                        </td>
                        <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", fontWeight: "900", color: "#854d0e" }}>
                          {formatCurrency(Number(selectedInvoice.totalFee || 0) - (Number(selectedInvoice.totalFee || 0) / 1.13))}
                        </td>
                      </tr>
                      {/* Total Payment (Inclusive of 13% VAT) */}
                      <tr style={{ backgroundColor: "#eff6ff", borderTop: "2px solid #1e3a8a", borderBottom: "2px solid #1e3a8a" }}>
                        <td style={{ padding: "1px 12px", fontWeight: "900", fontSize: "13px", color: "#1e3a8a" }}>
                          Total Payment (Inclusive of 13% VAT):
                        </td>
                        <td style={{ padding: "1px 12px", textAlign: "right", fontSize: "13px", fontWeight: "900", color: "#1e3a8a" }}>
                          {formatCurrency(selectedInvoice.totalFee)}
                        </td>
                      </tr>
                      {/* Total Paid Amount */}
                      <tr style={{ backgroundColor: "#f0fdf4" }}>
                        <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", color: "#166534", fontWeight: "bold" }}>
                          Total Paid Amount:
                        </td>
                        <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", fontWeight: "900", fontSize: "13px", color: "#166534" }}>
                          {formatCurrency(selectedInvoice.paidAmount)}
                        </td>
                      </tr>
                      {/* Remaining Due Balance */}
                      <tr style={{ backgroundColor: "#ffffff" }}>
                        <td style={{ padding: "1px 12px", fontWeight: "bold", color: Number(selectedInvoice.dueAmount) > 0 ? "#dc2626" : "#0d9488" }}>
                          Remaining Due Balance:
                        </td>
                        <td style={{ padding: "1px 12px", textAlign: "right", fontWeight: "900", fontSize: "13px", color: Number(selectedInvoice.dueAmount) > 0 ? "#dc2626" : "#0d9488" }}>
                          {Number(selectedInvoice.dueAmount) > 0 ? formatCurrency(selectedInvoice.dueAmount) : "Paid in Full "}
                        </td>
                      </tr>
                      {(() => {
                        if (Number(selectedInvoice.dueAmount) <= 0) return null;
                        const cd = getPaymentCountdown(selectedInvoice);
                        if (!cd) return null;
                        return (
                          <tr style={{ backgroundColor: cd.isOverdue ? "#fee2e2" : "#fef3c7", borderTop: "1.5px dashed #d97706" }}>
                            <td style={{ padding: "2px 12px", fontWeight: "800", color: cd.badgeColor, fontSize: "11px" }}>
                              ⏰ Next Payment Schedule:
                            </td>
                            <td style={{ padding: "2px 12px", textAlign: "right", fontWeight: "900", fontSize: "11px", color: cd.badgeColor }}>
                              Next payment within: {cd.initialDays} days ({cd.statusText})
                              {cd.targetDate && (
                                <div style={{ fontSize: "10px", fontWeight: "700", color: cd.isOverdue ? "#991b1b" : "#78350f" }}>
                                  Due Date: {cd.targetDate}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* 2. PAYMENT TRANSACTIONS RECORD (Placed Down / Below the Summary Box, Fully Functional) */}
                <div style={{
                  border: "1.5px solid #000000",
                  borderRadius: "5px",
                  padding: "1px 8px",
                  backgroundColor: "#ffffff",
                  marginBottom: "2px"
                }}>
                  <div style={{ backgroundColor: "#d1d5db", color: "#000000", fontWeight: "900", fontSize: "12px", margin: "-1px -8px 2px -8px", padding: "2px 8px", borderBottom: "1px solid #000000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Payment Transactions Record</span>
                    {Number(selectedInvoice.dueAmount) <= 0 ? (
                      <span style={{ fontSize: "11px", color: "#166534", backgroundColor: "#dcfce7", padding: "1px 6px", borderRadius: "8px", fontWeight: "bold" }}>
                        All Payments Complete
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#b91c1c", backgroundColor: "#fee2e2", padding: "1px 6px", borderRadius: "8px", fontWeight: "bold" }}>
                        Pending Balance: {formatCurrency(selectedInvoice.dueAmount)}
                        {(() => {
                          const cd = getPaymentCountdown(selectedInvoice);
                          return cd ? ` • Next Pay: ${cd.statusText}` : "";
                        })()}
                      </span>
                    )}
                  </div>

                  {(() => {
                    let txList = [];
                    try {
                      if (selectedInvoice.paymentsJson) {
                        const parsed = JSON.parse(selectedInvoice.paymentsJson);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          txList = parsed;
                        }
                      }
                    } catch (e) { }

                    if (txList.length === 0) {
                      if (selectedInvoice.firstInstallment) {
                        txList.push({
                          installment: 1,
                          date: selectedInvoice.firstPaymentDate || selectedInvoice.date,
                          amount: selectedInvoice.firstInstallment,
                          paymentMethod: selectedInvoice.paymentMethod || "Cash"
                        });
                      }
                      if (selectedInvoice.secondInstallment) {
                        txList.push({
                          installment: 2,
                          date: selectedInvoice.secondPaymentDate || selectedInvoice.date,
                          amount: selectedInvoice.secondInstallment,
                          paymentMethod: selectedInvoice.paymentMethod || "Cash"
                        });
                      }
                      if (selectedInvoice.thirdInstallment) {
                        txList.push({
                          installment: 3,
                          date: selectedInvoice.thirdPaymentDate || selectedInvoice.date,
                          amount: selectedInvoice.thirdInstallment,
                          paymentMethod: selectedInvoice.paymentMethod || "Cash"
                        });
                      }
                      if (txList.length === 0) {
                        txList.push({
                          installment: 1,
                          date: selectedInvoice.date,
                          amount: selectedInvoice.paidAmount,
                          paymentMethod: selectedInvoice.paymentMethod || "Cash",
                          isFull: true
                        });
                      }
                    }

                    const isFullyPaid = Number(selectedInvoice.dueAmount) <= 0;

                    return (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead style={{ backgroundColor: "#d1d5db" }}>
                          <tr style={{ backgroundColor: "#d1d5db", borderBottom: "1.5px solid #000000" }}>
                            <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", textAlign: "left", color: "#000000", fontWeight: "bold", borderRight: "1px solid #cbd5e1" }}>Payment Date</th>
                            <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", textAlign: "left", color: "#000000", fontWeight: "bold", borderRight: "1px solid #cbd5e1" }}>Transaction</th>
                            <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", textAlign: "center", color: "#000000", fontWeight: "bold", borderRight: "1px solid #cbd5e1" }}>Payment Method</th>
                            <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", textAlign: "right", color: "#000000", fontWeight: "bold" }}>Amount Paid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {txList.map((tx, idx) => {
                            const isLast = idx === txList.length - 1;
                            const isFinalCompleted = isLast && isFullyPaid;
                            const method = tx.paymentMethod || selectedInvoice.paymentMethod || "Cash";

                            return (
                              <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: isFinalCompleted ? "#f0fdf4" : "transparent" }}>
                                <td style={{ padding: "1px 2px", color: "#000000" }}>{tx.date || selectedInvoice.date}</td>
                                <td style={{ padding: "1px 2px", color: "#000000", fontWeight: "600" }}>
                                  {tx.isFull || (txList.length === 1 && isFullyPaid)
                                    ? "Full Payment"
                                    : `Payment #${tx.installment || idx + 1}`}
                                  {isFinalCompleted && (
                                    <span style={{ marginLeft: "6px", fontSize: "10.5px", color: "#166534", fontWeight: "bold" }}>
                                      (Complete)
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: "4px 2px", textAlign: "center", verticalAlign: "middle" }}>
                                  <span style={{
                                    backgroundColor: method === "Cash" ? "#f0fdf4" : method === "Online Esewa" ? "#f0fdf4" : method === "Online Khalti" ? "#faf5ff" : "#eff6ff",
                                    color: method === "Cash" ? "#166534" : method === "Online Esewa" ? "#15803d" : method === "Online Khalti" ? "#7e22ce" : "#1e40af",
                                    border: "1.5px solid",
                                    borderColor: method === "Cash" ? "#86efac" : method === "Online Esewa" ? "#86efac" : method === "Online Khalti" ? "#d8b4fe" : "#93c5fd",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    fontSize: "11.5px",
                                    fontWeight: "800",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "5px",
                                    lineHeight: "1.2",
                                    boxSizing: "border-box"
                                  }}>
                                    {getPaymentMethodIcon(method, 14)}
                                    <span style={{ letterSpacing: "0.2px" }}>{method === "Cash" ? "Cash" : method === "Online Esewa" ? "eSewa" : method === "Online Khalti" ? "Khalti" : method === "Online Bank Acc" ? "Bank Acc" : `${method}`}</span>
                                  </span>
                                </td>
                                <td style={{ padding: "1px 2px", textAlign: "right", fontWeight: "bold", color: "#000000" }}>
                                  {formatCurrency(tx.amount)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* Payment Summary Footer */}
                  <div style={{
                    marginTop: "1px",
                    padding: "1px 3px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ fontWeight: "bold", color: "#000000" }}>Payment Status:</span>
                    <span style={{
                      fontWeight: "900",
                      color: Number(selectedInvoice.dueAmount) <= 0 ? "#166534" : "#b91c1c",
                      backgroundColor: Number(selectedInvoice.dueAmount) <= 0 ? "#eff6ff" : "#fef2f2",
                      padding: "1px 4px",
                      borderRadius: "4px",
                      border: "1px solid",
                      borderColor: Number(selectedInvoice.dueAmount) <= 0 ? "#bfdbfe" : "#fecaca"
                    }}>
                      {Number(selectedInvoice.dueAmount) <= 0 ? "Payment Completed in Full" : ` Partial Payment (Due: ${formatCurrency(selectedInvoice.dueAmount)})`}
                    </span>
                  </div>

                  {/* Rupees in Words */}
                  <div style={{ marginTop: "1px", borderTop: "1px dashed #cbd5e1", paddingTop: "2px", fontSize: "12px" }}>
                    <span style={{ fontWeight: "bold", color: "#000000" }}>Amount in Words: </span>
                    <span style={{ fontWeight: "900", color: "#000000" }}>{selectedInvoice.amountInWords}</span>
                  </div>
                </div>

                {/* Bottom: Prepared By and Authorized Stamp with Name and Logo */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: "2px",
                  paddingTop: "2px",
                  borderTop: "1px solid #000000"
                }}>
                  {/* Prepared By (Shows typed name or blank space for manual typing/signature) */}
                  <div style={{ textAlign: "center", width: "220px" }}>
                    <div style={{ height: "14px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      {selectedInvoice.preparedBy ? (
                        <span style={{ fontWeight: "900", fontSize: "13px", color: "#000000" }}>
                          {selectedInvoice.preparedBy}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "11px", fontStyle: "italic" }}>
                          (Signature)
                        </span>
                      )}
                    </div>
                    <div style={{ borderTop: "1px solid #000000", paddingTop: "2px", fontWeight: "bold", fontSize: "12px" }}>
                      Bill Prepared By
                    </div>
                    <div style={{ fontSize: "11px", color: "#475569" }}>
                      {selectedInvoice.preparedBy ? selectedInvoice.preparedBy : "Staff / Accountant"}
                    </div>
                  </div>

                  {/* Authorized Stamp & Signature according to Admin Uploaded Stamp */}
                  <div style={{ textAlign: "center", width: "240px", position: "relative" }}>
                    {profile.stampUrl ? (
                      <div style={{
                        position: "absolute",
                        bottom: "8px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.85,
                        zIndex: 10
                      }}>
                        <img
                          src={profile.stampUrl}
                          alt="Authorized Stamp"
                          style={{
                            height: "55px",
                            width: "55px",
                            objectFit: "contain",
                            display: "block"
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        position: "absolute",
                        bottom: "8px",
                        left: "50%",
                        width: "55px",
                        height: "55px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: "translateX(-50%) rotate(-5deg)",
                        opacity: 0.85,
                        zIndex: 10
                      }}>
                        {/* Organization Logo inside Seal */}
                        <img
                          src={profile.logoUrl || "/examjk-logo.png"}
                          alt="Seal Logo"
                          style={{ width: "55px", height: "55px", objectFit: "contain" }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div style={{ borderTop: "1px solid #000000", paddingTop: "2px", fontWeight: "bold", fontSize: "12px" }}>
                      Authorized Stamp & Signature
                    </div>
                    <div style={{ fontSize: "11px", color: "#475569" }}>
                      {profile.companyName}
                    </div>
                  </div>
                </div>
              </div>
      </div>
    </div>
  );
}
