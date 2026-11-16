"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const fileInputRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitiatingEsewa, setIsInitiatingEsewa] = useState(false);
  const [isQuerySubmitted, setIsQuerySubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState(item?.type || "set");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [appJumpNotice, setAppJumpNotice] = useState(false);
  const [showOnlineGateway, setShowOnlineGateway] = useState(false);

  const esewaNumber = "9768444902";
  const esewaAccountName = "Deepak Bhatt";
  const esewaOrg = "ExamJK Education & CBT";
  const whatsappNumber = "9768444902";

  useEffect(() => {
    if (isOpen) {
      setIsQuerySubmitted(false);
      setIsProcessing(false);
      setIsInitiatingEsewa(false);
      setShowOnlineGateway(false);
      setTxnId("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setScreenshotUrl("");
      setSenderPhone(studentPhone || (typeof window !== "undefined" ? localStorage.getItem("currentStudentPhone") || "" : ""));
      setSelectedType(item?.type || "set");
    }
  }, [isOpen, item, studentPhone]);

  if (!isOpen || !item) return null;

  // Determine effective price and name
  const isSet = selectedType === "set";
  const itemName = isSet ? (item.name || "Individual UBT Set") : (selectedPackage?.name || item.name || "UBT Exam Package");
  const itemPrice = isSet ? 30 : (selectedPackage?.price || item.price || 1000);
  const formattedPrice = typeof itemPrice === "number" ? `Rs. ${itemPrice}` : itemPrice.toString().startsWith("Rs") ? itemPrice : `Rs. ${itemPrice}`;

  // WhatsApp prefilled release message URL for 9768444902
  const whatsappUrl = `https://wa.me/9779768444902?text=${encodeURIComponent(
    `🔔 *EXAM SET RELEASE REQUEST (Rs. 30)*\n\n` +
    `Hello Admin,\n\nI have sent my payment request for "${itemName}" (${formattedPrice}).\n\n` +
    `👤 Student Name: ${studentName || "Student"}\n` +
    `📱 Phone: ${senderPhone || studentPhone || "N/A"}\n` +
    `📚 Item: ${itemName} (${formattedPrice})\n` +
    (txnId ? `🔢 eSewa Txn ID: ${txnId}\n` : "") +
    (screenshotUrl ? `🧾 Receipt Attached: Yes (${screenshotFile?.name || "Payment Screenshot"})\n` : "") +
    `\nPlease verify my payment and release my exam set on https://examjk.com/admin/notifications. Thank you!`
  )}`;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(esewaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleQuickFillTxn = () => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTxnId(`ESW-${Date.now().toString().slice(-4)}-${randomHex}`);
  };

  const handleScreenshotChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScreenshotFile(file);
    const preview = URL.createObjectURL(file);
    setScreenshotPreview(preview);

    setUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/payment/upload-screenshot", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setScreenshotUrl(data.url);
      }
    } catch (err) {
      console.warn("Screenshot local upload notice:", err.message);
    } finally {
      setUploadingScreenshot(false);
    }
  };

  // Direct Online eSewa Payment Checkout (Logs in with eSewa Mobile Number & MPIN on esewa.com and auto-unlocks)
  const handleEsewaOnlinePay = async () => {
    setIsInitiatingEsewa(true);
    try {
      const curPhone = senderPhone.trim() || studentPhone || (typeof window !== "undefined" ? localStorage.getItem("currentStudentPhone") || "" : "");

      const payload = {
        itemId: item.id || item.name,
        itemName,
        itemType: selectedType || "set",
        amount: typeof itemPrice === "number" ? itemPrice : (selectedType === "set" ? 30 : 1000),
        studentPhone: curPhone,
        studentName: studentName || "Student"
      };

      const res = await fetch("/api/payment/esewa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate eSewa online payment");
      }

      // Automatically create and submit official eSewa EPAY HTML form to redirect to esewa.com.np
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.actionUrl;
      form.style.display = "none";

      Object.entries(data.formData).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = String(v);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("[eSewa Online Payment Error]:", err);
      alert("eSewa Gateway Error: " + (err.message || "Could not connect to eSewa."));
      setIsInitiatingEsewa(false);
    }
  };

  const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const esewaDeepLink = isAndroid
    ? "intent://#Intent;action=android.intent.action.VIEW;scheme=esewa;package=com.f1soft.esewa;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.f1soft.esewa;end;"
    : isIOS
    ? "esewa://"
    : "#";

  // Direct Mobile eSewa App Launch (Opens eSewa App on Android/iOS and copies 9768444902)
  const handleOpenEsewaApp = (e) => {
    // 1. Copy merchant phone number to clipboard immediately
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(esewaNumber);
      }
      setCopied(true);
      setAppJumpNotice(true);
      setTimeout(() => setCopied(false), 3000);
      setTimeout(() => setAppJumpNotice(false), 8000);
    } catch (clipErr) {
      console.warn("Clipboard notice:", clipErr);
    }

    if (!isAndroid && !isIOS) {
      if (e) e.preventDefault();
      handleEsewaOnlinePay();
      return;
    }

    if (isIOS) {
      window.location.href = "esewa://";
      return;
    }

    if (isAndroid) {
      // 1. Direct scheme jump
      const start = Date.now();
      window.location.href = "esewa://";

      // 2. Fallback to explicit intent URL if not switched within 350ms
      setTimeout(() => {
        if (Date.now() - start < 1500) {
          window.location.href = "intent://#Intent;action=android.intent.action.VIEW;scheme=esewa;package=com.f1soft.esewa;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.f1soft.esewa;end;";
        }
      }, 350);
    }
  };

  // Student verifies payment with eSewa Transaction ID (Instant Server Verification & Unlock)
  const handleSendQuery = async () => {
    if (!txnId.trim()) {
      alert("कृपया eSewa मा भुक्तानी गरेपछिको Transaction ID / Reference Code राख्नुहोस्।");
      return;
    }

    if (uploadingScreenshot) {
      alert("Payment screenshot is still uploading. Please wait a moment.");
      return;
    }

    setIsProcessing(true);

    try {
      const cleanTxn = txnId.trim().toUpperCase();
      const curPhone = senderPhone.trim() || studentPhone || (typeof window !== "undefined" ? localStorage.getItem("currentStudentPhone") || "9800000000" : "9800000000");
      const screenshotLocation = screenshotUrl || "";

      // 1. Instant Server-Side Verification via /api/payment/verify-code
      const verifyRes = await fetch("/api/payment/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName || "Student",
          studentPhone: curPhone,
          itemId: item.id || item.name,
          itemName,
          itemType: selectedType,
          amount: typeof itemPrice === "number" ? itemPrice : (selectedType === "set" ? 30 : 1000),
          txnId: cleanTxn,
          screenshotUrl: screenshotLocation
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Failed to verify transaction code");
      }

      // 2. Immediately unlock the set or package locally
      if (selectedType === "set") {
        const u1 = JSON.parse(localStorage.getItem("unlockedStudentExamSets") || "[]");
        const u2 = JSON.parse(localStorage.getItem("releasedStudentExamSets") || "[]");
        const updated = Array.from(new Set([...u1, ...u2, item.id, item.name, itemName].filter(Boolean)));
        localStorage.setItem("unlockedStudentExamSets", JSON.stringify(updated));
        localStorage.setItem("releasedStudentExamSets", JSON.stringify(updated));

        if (curPhone) {
          const studentSetMap = JSON.parse(localStorage.getItem("adminStudentUnlockedSetsMap") || "{}");
          studentSetMap[curPhone] = Array.from(new Set([...(studentSetMap[curPhone] || []), item.id, item.name, itemName].filter(Boolean)));
          localStorage.setItem("adminStudentUnlockedSetsMap", JSON.stringify(studentSetMap));
        }
      } else {
        localStorage.setItem("currentStudentPackage", itemName);
        if (curPhone) {
          const buyerMap = JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}");
          const existingPkgs = buyerMap[curPhone]?.packages || [];
          buyerMap[curPhone] = {
            ...(buyerMap[curPhone] || {}),
            isBuyer: true,
            hasPurchased: true,
            packageName: itemName,
            packages: Array.from(new Set([...existingPkgs, itemName]))
          };
          localStorage.setItem("adminBuyerStudentsMap", JSON.stringify(buyerMap));
        }
      }

      // 3. Save to student's completed payment history
      const payments = JSON.parse(localStorage.getItem("studentPayments") || "[]");
      payments.unshift({
        id: Date.now(),
        txnId: cleanTxn,
        studentName: studentName || "Student",
        studentPhone: curPhone,
        item: itemName,
        type: isSet ? "Individual UBT Set (Rs. 30)" : "UBT Package",
        amount: itemPrice,
        esewaNumber,
        status: "COMPLETED & UNLOCKED",
        screenshotUrl: screenshotLocation,
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleString()
      });
      localStorage.setItem("studentPayments", JSON.stringify(payments));

      setIsProcessing(false);
      setIsQuerySubmitted(true);

      if (onSuccessUnlock) {
        onSuccessUnlock({
          type: selectedType,
          item,
          status: "COMPLETE"
        });
      }

      alert(`🎉 भुक्तानी प्रमाणित भयो (Payment Verified)!\n\nReference Code: ${cleanTxn}\nसेट "${itemName}" तुरुन्तै अनलक गरिएको छ।\n\nतपाईंले अब सिधै Start Exam थिचेर परीक्षा सुरु गर्न सक्नुहुन्छ!`);
      onClose();
    } catch (err) {
      console.error("Query verification error:", err);
      setIsProcessing(false);
      alert("Verification Notice: " + err.message);
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
        padding: "10px",
        overflowY: "auto"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "475px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          border: "1px solid #e2e8f0"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with official eSewa theme - Compressed */}
        <div
          style={{
            background: "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #4ade80 100%)",
            padding: "11px 16px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "3px 6px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <img
                src="/esewa-official.svg"
                alt="eSewa"
                style={{ height: "20px", width: "auto" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span style={{ color: "#16a34a", fontWeight: "900", fontSize: "14px", marginLeft: "2px" }}>
                eSewa
              </span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "15.5px", fontWeight: "800", letterSpacing: "-0.2px" }}>
                eSewa Online Payment &amp; Instant Auto-Unlock
              </h3>
              <p style={{ margin: "1px 0 0 0", fontSize: "11px", opacity: 0.95 }}>
                ⚡ Pay via eSewa.com (9768444902) — Instant Automatic Unlock (No Waiting!)
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
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700"
            }}
          >
            &times;
          </button>
        </div>

        {/* Modal Body - Compressed */}
        <div style={{ padding: "12px 16px" }}>
          {isQuerySubmitted ? (
            /* SUCCESS QUERY SUBMISSION STATE */
            <div style={{ textAlign: "center", padding: "8px 4px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "#eff6ff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px auto",
                  border: "2.5px solid #93c5fd"
                }}
              >
                <span style={{ fontSize: "28px", color: "#2563eb" }}>📨</span>
              </div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#0f172a", fontWeight: "800" }}>
                Query Sent to WhatsApp &amp; Admin!
              </h3>
              <p style={{ margin: "0 0 10px 0", fontSize: "12.5px", color: "#64748b", lineHeight: "1.4" }}>
                Your payment query for <strong style={{ color: "#1e3a8a" }}>{itemName}</strong> has been submitted.
              </p>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  border: "1px solid #e2e8f0",
                  textAlign: "left",
                  fontSize: "12px",
                  marginBottom: "10px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#64748b" }}>Requested Set:</span>
                  <strong style={{ color: "#0f172a" }}>{itemName}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#64748b" }}>Amount:</span>
                  <strong style={{ color: "#16a34a" }}>{formattedPrice}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#64748b" }}>Transaction ID:</span>
                  <strong style={{ color: "#2563eb", fontFamily: "monospace" }}>{txnId}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#64748b" }}>Status:</span>
                  <strong style={{ color: "#d97706" }}>Pending Admin Release (5-10 min)</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>WhatsApp (9768444902):</span>
                  <strong style={{ color: "#16a34a" }}>✓ Request Message Sent</strong>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#fef3c7",
                  border: "1px solid #fde68a",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  marginBottom: "12px",
                  fontSize: "12px",
                  color: "#92400e",
                  textAlign: "left",
                  fontWeight: "600",
                  lineHeight: "1.4"
                }}
              >
                Wait for 5-10 minute, Admin will verify your payment and release your UBT set.
              </div>

              {/* Direct WhatsApp Action Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  width: "100%",
                  backgroundColor: "#25D366",
                  color: "#ffffff",
                  padding: "10px",
                  borderRadius: "7px",
                  fontWeight: "800",
                  fontSize: "13px",
                  textDecoration: "none",
                  marginBottom: "8px",
                  boxShadow: "0 2px 8px rgba(37, 211, 102, 0.3)",
                  boxSizing: "border-box"
                }}
              >
                <span>💬</span>
                <span>Send Release Message on WhatsApp (9768444902) ↗</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "7px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
                }}
              >
                Close &amp; Check Status
              </button>
            </div>
          ) : (
            /* QUERY & PAYMENT FORM */
            <div>
              {/* Item Card with Price Highlight - Compressed */}
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1.5px solid #86efac",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px"
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "9.5px",
                      fontWeight: "800",
                      color: "#166534",
                      backgroundColor: "#dcfce7",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.4px"
                    }}
                  >
                    {isSet ? "INDIVIDUAL UBT SET" : "UBT PACKAGE"}
                  </span>
                  <h4 style={{ margin: "2px 0 1px 0", fontSize: "14.5px", color: "#0f172a", fontWeight: "800" }}>
                    {itemName}
                  </h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
                    {isSet ? "40 Questions, Audio & Timer practice" : "Full access to all included UBT sets"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "600" }}>Price to Pay</div>
                  <div style={{ fontSize: "19px", fontWeight: "900", color: "#16a34a" }}>
                    {formattedPrice}
                  </div>
                </div>
              </div>

              {/* CENTERPIECE: OFFICIAL FONEPAY & ESEWA QR STANDEE */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #16a34a",
                  borderRadius: "14px",
                  padding: "14px",
                  textAlign: "center",
                  marginBottom: "12px",
                  boxShadow: "0 3px 12px rgba(22, 163, 74, 0.1)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>📱</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#166534" }}>
                    Fonepay &amp; eSewa Official QR भुक्तानी
                  </span>
                </div>

                <div
                  onClick={() => setIsQrZoomed(true)}
                  title="Click to zoom QR code"
                  style={{
                    cursor: "pointer",
                    border: "1.5px solid #86efac",
                    borderRadius: "10px",
                    padding: "8px",
                    backgroundColor: "#f0fdf4",
                    display: "inline-block",
                    marginBottom: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    transition: "transform 0.15s ease"
                  }}
                >
                  <img
                    src="/sigma-esewa-fonepay-qr.jpg"
                    alt="Sigma Education Korean Bhasa Center Fonepay eSewa QR"
                    style={{
                      width: "100%",
                      maxWidth: "220px",
                      height: "auto",
                      maxHeight: "280px",
                      borderRadius: "6px",
                      display: "block",
                      margin: "0 auto",
                      objectFit: "contain"
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/esewa-payment-qr.jpg";
                    }}
                  />
                  <span style={{ fontSize: "10.5px", color: "#15803d", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    🔍 क्लिक गरी QR ठूलो बनाउनुहोस्
                  </span>
                </div>

                <div style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b", marginBottom: "2px" }}>
                  Sigma Education Korean Bhasa Center Pvt. Ltd.
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>
                  Terminal: 2222020018404471 &middot; Tokha MC
                </div>
                <div style={{ fontSize: "12px", color: "#1e40af", fontWeight: "700", backgroundColor: "#eff6ff", borderRadius: "6px", padding: "4px 10px", display: "inline-block" }}>
                  भुक्तानी रकम: <strong style={{ color: "#16a34a" }}>{formattedPrice}</strong>
                </div>
              </div>

              {/* PROMINENT WHATSAPP CONFIRMATION SECTION */}
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "2px solid #22c55e",
                  borderRadius: "12px",
                  padding: "12px",
                  textAlign: "center",
                  marginBottom: "12px"
                }}
              >
                <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#166534", marginBottom: "4px", lineHeight: "1.4" }}>
                  🧾 भुक्तानी गरिसकेपछि स्क्रिनसट यो WhatsApp नम्बरमा पठाउनुहोस्:
                </div>
                <div style={{ fontSize: "16px", fontWeight: "900", color: "#065f46", marginBottom: "8px", letterSpacing: "0.5px" }}>
                  +977-9768444902
                </div>
                <a
                  href={`https://wa.me/9779768444902?text=${encodeURIComponent(
                    `Hello Admin,\n\nI have paid ${formattedPrice} via Fonepay / eSewa QR for "${itemName}".\nHere is my payment screenshot to verify and unlock my set!\n\n` +
                    `👤 Student: ${studentName || "Student"} (${senderPhone || studentPhone || "N/A"})\n` +
                    `📚 Exam Set: ${itemName}\n` +
                    `💰 Amount: ${formattedPrice}\n\n` +
                    `Thank you!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 16px",
                    backgroundColor: "#25d366",
                    backgroundImage: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
                    color: "#ffffff",
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontWeight: "800",
                    fontSize: "13.5px",
                    boxShadow: "0 3px 10px rgba(37, 211, 102, 0.35)",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ fontSize: "16px" }}>📲</span>
                  <span>WhatsApp मा स्क्रिनसट पठाउनुहोस् (+977-9768444902)</span>
                </a>
              </div>

              {/* IN-APP PAYMENT VERIFICATION & SCREENSHOT SUBMISSION */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px",
                  marginBottom: "12px"
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚡</span>
                  <span>वा यहाँ विवरण भरेर तुरुन्त अनलक गर्नुहोस् (Instant Unlock):</span>
                </div>

                {/* Screenshot Upload Section */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1.5px dashed #94a3b8",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    marginBottom: "8px",
                    textAlign: "center"
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleScreenshotChange}
                    style={{ display: "none" }}
                  />

                  {screenshotPreview ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "6px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img
                          src={screenshotPreview}
                          alt="Screenshot Preview"
                          style={{ width: "38px", height: "38px", objectFit: "cover", borderRadius: "5px", border: "1px solid #bbf7d0" }}
                        />
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "11.5px", fontWeight: "800", color: "#166534" }}>
                            ✓ Payment Screenshot Attached (eSewa / Bank)
                          </div>
                          <div style={{ fontSize: "10px", color: "#64748b" }}>
                            {screenshotFile?.name || "Ready to send"} &middot; Success Receipt
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          padding: "4px 8px",
                          borderRadius: "5px",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#334155",
                          cursor: "pointer"
                        }}
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>
                          📷 Payment Screenshot (eSewa / Any Bank) <span style={{ color: "#dc2626" }}>*</span>
                        </div>
                        <div style={{ fontSize: "10px", color: "#dc2626", fontWeight: "600" }}>
                          * Must attach successful payment receipt
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingScreenshot}
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: "800",
                          cursor: uploadingScreenshot ? "wait" : "pointer",
                          boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          flexShrink: 0
                        }}
                      >
                        {uploadingScreenshot ? (
                          <>
                            <span>⏳</span>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <span>📁</span>
                            <span>Upload Screenshot</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Transaction ID & Phone Inputs */}
                <div style={{ marginBottom: "6px" }}>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#0f172a", marginBottom: "3px" }}>
                    eSewa Transaction ID / Ref Code <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 98A7B2X or 7-10 digit eSewa Txn ID"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      borderRadius: "6px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      boxSizing: "border-box",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "3px" }}>
                    Sender Phone Number (eSewa Account)
                  </label>
                  <input
                    type="text"
                    placeholder="Your 10-digit mobile number"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12.5px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Action Buttons: Submit Verification */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleSendQuery}
                    disabled={isProcessing}
                    style={{
                      flex: 1,
                      background: isProcessing
                        ? "#94a3b8"
                        : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: "7px",
                      fontWeight: "900",
                      fontSize: "13.5px",
                      letterSpacing: "0.2px",
                      cursor: isProcessing ? "wait" : "pointer",
                      boxShadow: "0 3px 10px rgba(22, 163, 74, 0.28)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <span>⏳</span>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>📨</span>
                        <span>Submit Details &amp; Unlock ({formattedPrice})</span>
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
                      padding: "10px 14px",
                      borderRadius: "7px",
                      fontWeight: "600",
                      fontSize: "12.5px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* COLLAPSIBLE ALTERNATIVE: DIRECT ESEWA ONLINE / APP GATEWAY */}
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "10px", padding: "8px 12px", marginBottom: "6px", backgroundColor: "#fafafa" }}>
                <div
                  onClick={() => setShowOnlineGateway(prev => !prev)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#166534"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🌐</span>
                    <span>eSewa अनलाइन पोर्टल वा एपबाट सिधै लगइन गरी भुक्तानी गर्न यहाँ थिच्नुहोस्</span>
                  </div>
                  <span>{showOnlineGateway ? "▲" : "▼"}</span>
                </div>

                {showOnlineGateway && (
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
                    <a
                      href={esewaDeepLink}
                      onClick={handleOpenEsewaApp}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        textDecoration: "none",
                        background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                        color: "#ffffff",
                        border: "none",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontWeight: "800",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <span>📱</span>
                      <span>eSewa App खोल्नुहोस् ({formattedPrice})</span>
                    </a>

                    {appJumpNotice && (
                      <div style={{
                        backgroundColor: "#ecfdf5",
                        border: "1.5px solid #10b981",
                        color: "#065f46",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontWeight: "700"
                      }}>
                        ✅ eSewa नम्बर ({esewaNumber}) कपी भयो!
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleEsewaOnlinePay}
                      disabled={isInitiatingEsewa}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        backgroundColor: isInitiatingEsewa ? "#94a3b8" : "#ffffff",
                        color: "#166534",
                        border: "1.5px solid #16a34a",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontWeight: "800",
                        fontSize: "12.5px",
                        cursor: isInitiatingEsewa ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      {isInitiatingEsewa ? (
                        <>
                          <span>⏳</span>
                          <span>eSewa Gateway मा जोडिँदै...</span>
                        </>
                      ) : (
                        <>
                          <span>🌐</span>
                          <span>eSewa ePay लगइन गरी भुक्तानी (Auto-Return &amp; Unlock)</span>
                          <span style={{ fontSize: "14px" }}>↗</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Size Zoomed QR Code Modal */}
      {isQrZoomed && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
            padding: "20px"
          }}
          onClick={() => setIsQrZoomed(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "22px",
              borderRadius: "16px",
              maxWidth: "360px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "2px solid #86efac"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ fontSize: "15px", fontWeight: "800", color: "#16a34a" }}>Fonepay / eSewa QR</span>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>Sigma Education Korean Bhasa Center &middot; Tokha MC</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQrZoomed(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: "8px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <img
                src="/sigma-esewa-fonepay-qr.jpg"
                alt="Fonepay eSewa QR Code"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "360px",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: "6px"
                }}
                onError={(e) => {
                  e.currentTarget.src = "/esewa-payment-qr.jpg";
                }}
              />
            </div>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", color: "#334155" }}>
                Scan directly using <strong>eSewa / Mobile Banking App</strong>
              </span>
              <span style={{ fontSize: "11.5px", color: "#15803d", fontWeight: "700" }}>
                Amount: <strong>{formattedPrice}</strong>
              </span>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Terminal: 2222020018404471
              </span>
            </div>

            <div style={{ marginTop: "12px", backgroundColor: "#f0fdf4", border: "1.5px solid #22c55e", borderRadius: "8px", padding: "10px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#166534", marginBottom: "4px" }}>
                🧾 भुक्तानीपछि स्क्रिनसट यो WhatsApp नम्बरमा पठाउनुहोस्:
              </div>
              <div style={{ fontSize: "15px", fontWeight: "900", color: "#065f46", marginBottom: "8px" }}>
                +977-9768444902
              </div>
              <a
                href="https://wa.me/9779768444902?text=Hello%20Admin%2C%20I%20have%20paid%20via%20QR.%20Here%20is%20my%20payment%20screenshot%20to%20unlock%20my%20UBT%20exam%20set."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "9px 12px",
                  backgroundColor: "#25d366",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: "800",
                  fontSize: "12.5px"
                }}
              >
                <span>📲</span>
                <span>WhatsApp मा स्क्रिनसट पठाउनुहोस्</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsQrZoomed(false)}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "8px",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "12.5px",
                cursor: "pointer"
              }}
            >
              Close QR Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
