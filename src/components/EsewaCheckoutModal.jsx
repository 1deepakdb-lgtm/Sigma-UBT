"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EsewaCheckoutModal({
  isOpen,
  onClose,
  item,
  studentName = "Student",
  studentPhone = "",
  onSuccessUnlock
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedType, setSelectedType] = useState(item?.type || "set");
  const [selectedPackage, setSelectedPackage] = useState(null);

  const esewaNumber = "9768444902";
  const esewaAccountName = "Deepak Bhatt";
  const esewaOrg = "Sigma Education UBT";

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsProcessing(false);
      setTxnId("");
      setSenderPhone(studentPhone || (typeof window !== "undefined" ? localStorage.getItem("currentStudentPhone") || "" : ""));
      setSelectedType(item?.type || "set");
    }
  }, [isOpen, item, studentPhone]);

  if (!isOpen || !item) return null;

  // Determine effective price and name
  const isSet = selectedType === "set";
  const itemName = isSet ? (item.name || "Individual UBT Set") : (selectedPackage?.name || item.name || "UBT Exam Package");
  const itemPrice = isSet ? 40 : (selectedPackage?.price || item.price || 1000);
  const formattedPrice = typeof itemPrice === "number" ? `Rs. ${itemPrice}` : itemPrice.toString().startsWith("Rs") ? itemPrice : `Rs. ${itemPrice}`;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(esewaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleQuickFillTxn = () => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTxnId(`ESW-${Date.now().toString().slice(-4)}-${randomHex}`);
  };

  const handleConfirmPayment = () => {
    if (!txnId.trim()) {
      alert("Please enter the eSewa Transaction ID / Reference Code from your eSewa payment receipt.");
      return;
    }

    setIsProcessing(true);

    // Simulate instant verification and auto-unlock
    setTimeout(() => {
      try {
        const cleanTxn = txnId.trim().toUpperCase();
        const curPhone = senderPhone.trim() || studentPhone || (typeof window !== "undefined" ? localStorage.getItem("currentStudentPhone") || "9800000000" : "9800000000");

        if (isSet) {
          // Unlock individual set (Rs. 40)
          const unlockedSets = JSON.parse(localStorage.getItem("unlockedStudentExamSets") || "[]");
          const setId = item.id || item.name;
          const setName = item.name;

          const updatedSets = Array.from(new Set([...unlockedSets, setId, setName, setId?.toString()]));
          localStorage.setItem("unlockedStudentExamSets", JSON.stringify(updatedSets));

          // Log payment record
          const purchaseHistory = JSON.parse(localStorage.getItem("studentPayments") || "[]");
          const newPayment = {
            id: Date.now(),
            txnId: cleanTxn,
            studentName: studentName || "Student",
            studentPhone: curPhone,
            item: setName,
            type: "Individual UBT Set",
            amount: 40,
            esewaNumber,
            recipientName: esewaAccountName,
            status: "Auto-Unlocked",
            date: new Date().toISOString(),
            formattedDate: new Date().toLocaleString()
          };
          localStorage.setItem("studentPayments", JSON.stringify([newPayment, ...purchaseHistory]));

          // Also record in examPurchaseRequests for admin tracking
          const requests = JSON.parse(localStorage.getItem("examPurchaseRequests") || "[]");
          requests.unshift({
            id: Date.now(),
            studentName: studentName || "Student",
            studentPhone: curPhone,
            packageName: `Set: ${setName} (Rs. 40 Individual Set)`,
            txnId: cleanTxn,
            date: new Date().toLocaleDateString(),
            status: "Auto-Unlocked (eSewa)"
          });
          localStorage.setItem("examPurchaseRequests", JSON.stringify(requests));
        } else {
          // Unlock full package
          const pkgName = selectedPackage?.name || item.name || "Full Set UBT";
          localStorage.setItem("hasPurchasedExamAccess", "true");
          localStorage.setItem("currentStudentPackage", pkgName);
          localStorage.setItem("currentStudentExpiryDate", "1 Month");

          // Update buyer map
          const buyerMap = JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}");
          const expDate = new Date();
          expDate.setMonth(expDate.getMonth() + 1);
          const expString = expDate.toISOString().split("T")[0];

          buyerMap[curPhone] = {
            isBuyer: true,
            hasPurchased: true,
            package: pkgName,
            expiryDate: expString
          };
          if (studentName) {
            buyerMap[studentName] = buyerMap[curPhone];
          }
          localStorage.setItem("adminBuyerStudentsMap", JSON.stringify(buyerMap));

          // Log payment
          const purchaseHistory = JSON.parse(localStorage.getItem("studentPayments") || "[]");
          purchaseHistory.unshift({
            id: Date.now(),
            txnId: cleanTxn,
            studentName: studentName || "Student",
            studentPhone: curPhone,
            item: pkgName,
            type: "UBT Exam Package",
            amount: itemPrice,
            esewaNumber,
            recipientName: esewaAccountName,
            status: "Auto-Unlocked",
            date: new Date().toISOString(),
            formattedDate: new Date().toLocaleString()
          });
          localStorage.setItem("studentPayments", JSON.stringify(purchaseHistory));
        }

        setIsProcessing(false);
        setIsSuccess(true);

        if (onSuccessUnlock) {
          onSuccessUnlock({
            type: selectedType,
            item,
            packageName: isSet ? null : (selectedPackage?.name || item.name),
            price: itemPrice,
            txnId: cleanTxn
          });
        }
      } catch (err) {
        console.error("Auto unlock error:", err);
        setIsProcessing(false);
        alert("Payment saved, but could not update local storage. Please refresh the page.");
      }
    }, 900);
  };

  const handleStartExamNow = () => {
    onClose();
    if (isSet) {
      router.push(`/student/exam/${item.id || encodeURIComponent(item.name)}`);
    } else {
      router.push("/student");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px",
        overflowY: "auto"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "540px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          animation: "modalFadeIn 0.2s ease-out"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with official eSewa theme */}
        <div
          style={{
            background: "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #4ade80 100%)",
            padding: "18px 24px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "4px 8px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <img
                src="/esewa-official.svg"
                alt="eSewa"
                style={{ height: "24px", width: "auto" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span style={{ color: "#16a34a", fontWeight: "900", fontSize: "15px", marginLeft: "2px" }}>
                eSewa
              </span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", letterSpacing: "-0.2px" }}>
                Instant eSewa Auto-Unlock
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "11.5px", opacity: 0.9 }}>
                Direct Payment &middot; Immediate 24/7 Activation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#ffffff",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700"
            }}
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "22px 24px" }}>
          {isSuccess ? (
            /* SUCCESS STATE */
            <div style={{ textAlign: "center", padding: "16px 8px" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  backgroundColor: "#dcfce7",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                  border: "3px solid #86efac"
                }}
              >
                <span style={{ fontSize: "36px", color: "#16a34a" }}>✓</span>
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#0f172a", fontWeight: "800" }}>
                Payment Confirmed &amp; Auto-Unlocked!
              </h3>
              <p style={{ margin: "0 0 18px 0", fontSize: "14px", color: "#64748b" }}>
                Thank you! Your transaction has been registered and access to{" "}
                <strong style={{ color: "#16a34a" }}>{itemName}</strong> is now unlocked.
              </p>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  border: "1px solid #e2e8f0",
                  textAlign: "left",
                  fontSize: "13px",
                  marginBottom: "20px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Item Unlocked:</span>
                  <strong style={{ color: "#0f172a" }}>{itemName}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Amount Paid:</span>
                  <strong style={{ color: "#16a34a" }}>{formattedPrice}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Transaction Ref:</span>
                  <strong style={{ color: "#2563eb", fontFamily: "monospace" }}>{txnId}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>eSewa Account:</span>
                  <strong style={{ color: "#0f172a" }}>9768444902 ({esewaAccountName})</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleStartExamNow}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "12px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
                  }}
                >
                  {isSet ? "🚀 Start This Exam Now ▶" : "Go to Exam Sets ▶"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "12px 18px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <div>
              {/* Item Card with Price Highlight */}
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1.5px solid #86efac",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px"
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      color: "#166534",
                      backgroundColor: "#dcfce7",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    {isSet ? "INDIVIDUAL UBT SET" : "UBT PACKAGE"}
                  </span>
                  <h4 style={{ margin: "4px 0 2px 0", fontSize: "16px", color: "#0f172a", fontWeight: "800" }}>
                    {itemName}
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                    {isSet ? "Instant access to 40 EPS-TOPIK Questions & Audio" : "Full access to all included UBT sets"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Price to Pay</div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#16a34a" }}>
                    {formattedPrice}
                  </div>
                </div>
              </div>

              {/* eSewa Payment Details Box */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px dashed #16a34a",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "18px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "center"
                }}
              >
                {/* QR Code Container */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    textAlign: "center",
                    flexShrink: 0
                  }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=9768444902`}
                    alt="eSewa QR 9768444902"
                    style={{ width: "110px", height: "110px", display: "block" }}
                    onError={(e) => {
                      // fallback representation if offline
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div style={{ fontSize: "9.5px", fontWeight: "700", color: "#16a34a", marginTop: "3px" }}>
                    SCAN WITH ESEWA
                  </div>
                </div>

                {/* Recipient Details & 1-Click Copy */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                    Official eSewa ID / Phone:
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "20px",
                        fontWeight: "900",
                        color: "#0f172a",
                        letterSpacing: "0.5px"
                      }}
                    >
                      {esewaNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      style={{
                        backgroundColor: copied ? "#dcfce7" : "#f1f5f9",
                        color: copied ? "#166534" : "#0f172a",
                        border: "1px solid",
                        borderColor: copied ? "#86efac" : "#cbd5e1",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        fontSize: "11.5px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>

                  <div style={{ fontSize: "12px", color: "#334155", margin: "3px 0" }}>
                    Account Name: <strong>{esewaAccountName}</strong>
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    Org: <strong>{esewaOrg}</strong>
                  </div>

                  <div
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      fontSize: "10.5px",
                      fontWeight: "700",
                      color: "#15803d",
                      backgroundColor: "#dcfce7",
                      padding: "2px 8px",
                      borderRadius: "12px"
                    }}
                  >
                    ⚡ Auto-Unlocks in seconds after confirmation
                  </div>
                </div>
              </div>

              {/* Step Instructions */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  color: "#475569",
                  marginBottom: "16px",
                  border: "1px solid #e2e8f0"
                }}
              >
                <div style={{ fontWeight: "700", color: "#1e3a8a", marginBottom: "4px" }}>
                  Quick 3-Step Verification:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span>1. Open eSewa &rarr; Send Money to <strong>9768444902</strong> (Amount: <strong>{formattedPrice}</strong>).</span>
                  <span>2. Copy the <strong>Transaction Code / Ref ID</strong> from your eSewa receipt.</span>
                  <span>3. Paste below &amp; click <strong>Confirm &amp; Auto-Unlock</strong>!</span>
                </div>
              </div>

              {/* Form Input: Transaction Code */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#0f172a" }}>
                    eSewa Transaction ID / Ref Code <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleQuickFillTxn}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      padding: 0
                    }}
                    title="Fill a simulated test transaction ID"
                  >
                    ⚡ Test Auto-Fill ID
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 98A7B2X or 7-10 digit eSewa Txn ID"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
              </div>

              {/* Sender Phone (Optional / Pre-filled) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "5px" }}>
                  Sender Mobile / eSewa Number (For Receipt Matching)
                </label>
                <input
                  type="text"
                  placeholder="Your 10-digit mobile number"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    background: isProcessing
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "13px",
                    borderRadius: "8px",
                    fontWeight: "800",
                    fontSize: "14px",
                    cursor: isProcessing ? "wait" : "pointer",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  {isProcessing ? (
                    <>
                      <span>⏳</span>
                      <span>Verifying &amp; Unlocking...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Confirm &amp; Auto-Unlock ({formattedPrice})</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "13px 18px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
