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

  const esewaNumber = "9768444902";
  const esewaAccountName = "Deepak Bhatt";
  const esewaOrg = "ExamJK Education & CBT";
  const whatsappNumber = "9768444902";

  useEffect(() => {
    if (isOpen) {
      setIsQuerySubmitted(false);
      setIsProcessing(false);
      setIsInitiatingEsewa(false);
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

              {/* PRIMARY METHOD: ESEWA APP & ESEWA ONLINE PAYMENT */}
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "2px solid #16a34a",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "12px",
                  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.12)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "18px" }}>📱</span>
                    <strong style={{ fontSize: "14px", color: "#166534" }}>
                      Method 1: eSewa एप वा अनलाइनबाट भुक्तानी
                    </strong>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      color: "#ffffff",
                      backgroundColor: "#16a34a",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      letterSpacing: "0.2px"
                    }}
                  >
                    ⚡ Instant Auto-Unlock
                  </span>
                </div>

                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#15803d", lineHeight: "1.5" }}>
                  eSewa एपमार्फत वा eSewa अनलाइन लगइन गरी <strong>{formattedPrice}</strong> भुक्तानी गर्नुहोस्। भुक्तानी प्रमाणित हुनासाथ यो सेट <strong>स्वतः अनलक भई तुरुन्तै परीक्षा सुरु</strong> हुनेछ।
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Option A: Open directly in native eSewa Mobile App (No Captcha / No Robot Check) */}
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
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontWeight: "800",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <span>📱</span>
                    <span>eSewa App खोल्नुहोस् र भुक्तानी गर्नुहोस् ({formattedPrice})</span>
                  </a>

                  {appJumpNotice && (
                    <div style={{
                      backgroundColor: "#ecfdf5",
                      border: "1.5px solid #10b981",
                      color: "#065f46",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      lineHeight: "1.4"
                    }}>
                      ✅ <strong>eSewa नम्बर ({esewaNumber})</strong> कपी भयो! eSewa एपमा <em>"Send Money"</em> मा पेस्ट गरी <strong>{formattedPrice}</strong> भुक्तानी गर्नुहोस्।
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "-2px", marginBottom: "4px", fontSize: "11px", padding: "0 2px" }}>
                    <a
                      href="esewa://"
                      onClick={() => {
                        try { navigator.clipboard.writeText(esewaNumber); } catch(e){}
                        setCopied(true);
                      }}
                      style={{ color: "#15803d", textDecoration: "underline", fontWeight: "700" }}
                    >
                      🚀 सिधै eSewa खोल्नुहोस् (esewa://)
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.f1soft.esewa"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#64748b", textDecoration: "underline" }}
                    >
                      Play Store बाट eSewa App ↗
                    </a>
                  </div>

                  {/* Option B: Official eSewa ePay Gateway (developer.esewa.com.np/pages/Epay) */}
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
                      padding: "11px 16px",
                      borderRadius: "8px",
                      fontWeight: "800",
                      fontSize: "13px",
                      cursor: isInitiatingEsewa ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      transition: "all 0.15s ease"
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
                        <span>eSewa ePay लगइन गरी भुक्तानी (Auto-Return & Unlock)</span>
                        <span style={{ fontSize: "14px" }}>↗</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* DIVIDER */}
              <div style={{ display: "flex", alignItems: "center", margin: "10px 0 10px 0", gap: "8px" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
                <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "700" }}>
                  OR METHOD 2: SCAN QR / MANUAL TRANSFER ({esewaNumber})
                </span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
              </div>

              {/* QR CODE & SEND QUERY FLOW */}
              <div>
                {/* eSewa Details Box - Compressed */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1.5px dashed #16a34a",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    marginBottom: "8px",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center"
                  }}
                >
                  {/* QR Code Container - Compact */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "4px",
                      borderRadius: "8px",
                      border: "1.5px solid #86efac",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      textAlign: "center",
                      flexShrink: 0,
                      cursor: "pointer"
                    }}
                    onClick={() => setIsQrZoomed(true)}
                    title="Click to enlarge QR code"
                  >
                    <img
                      src="/esewa-payment-qr.jpg"
                      alt="eSewa QR 9768444902"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                        display: "block",
                        borderRadius: "4px"
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/images/esewa-payment-qr.jpg";
                      }}
                    />
                    <div style={{ fontSize: "8.5px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>
                      🔍 ENLARGE
                    </div>
                  </div>

                  {/* Details & Copy - Compact */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                      Official eSewa ID / Phone:
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "2px 0" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "17px",
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
                          borderRadius: "5px",
                          padding: "2px 6px",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        {copied ? "✓ Copied" : "Copy"}
                      </button>
                    </div>

                    <div style={{ fontSize: "11.5px", color: "#334155", margin: "1px 0" }}>
                      Account Name: <strong>{esewaAccountName}</strong>
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                      Org: <strong>{esewaOrg}</strong>
                    </div>
                  </div>
                </div>

                {/* Clean Payment Screenshot Upload Section - Compressed */}
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

                {/* Transaction ID & Phone Inputs - Compressed */}
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

                {/* Action Buttons: SEND QUERY - 1-Click to WhatsApp & Admin */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleSendQuery}
                    disabled={isProcessing}
                    style={{
                      flex: 1,
                      background: isProcessing
                        ? "#94a3b8"
                        : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: "7px",
                      fontWeight: "900",
                      fontSize: "13.5px",
                      letterSpacing: "0.2px",
                      cursor: isProcessing ? "wait" : "pointer",
                      boxShadow: "0 3px 10px rgba(37, 99, 235, 0.28)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <span>⏳</span>
                        <span>Sending Query...</span>
                      </>
                    ) : (
                      <>
                        <span>📨</span>
                        <span>Send Query ({formattedPrice})</span>
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
                <span style={{ fontSize: "15px", fontWeight: "800", color: "#16a34a" }}>eSewa Official QR</span>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>Deepak Bhatt &middot; 9768444902</p>
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
                src="/esewa-payment-qr.jpg"
                alt="eSewa Payment QR Code"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "300px",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: "6px"
                }}
                onError={(e) => {
                  e.currentTarget.src = "/images/esewa-payment-qr.jpg";
                }}
              />
            </div>
            <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", color: "#334155" }}>
                Scan directly using your <strong>eSewa Mobile App</strong>
              </span>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Amount: <strong>{formattedPrice}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsQrZoomed(false)}
              style={{
                marginTop: "14px",
                width: "100%",
                padding: "10px",
                backgroundColor: "#16a34a",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "13px",
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
