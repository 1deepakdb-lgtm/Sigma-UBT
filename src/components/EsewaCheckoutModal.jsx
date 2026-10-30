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
  const [isQuerySubmitted, setIsQuerySubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState(item?.type || "set");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [driveReceiptLink, setDriveReceiptLink] = useState("");

  const esewaNumber = "9768444902";
  const esewaAccountName = "Deepak Bhatt";
  const esewaOrg = "Sigma Education UBT";
  const driveFolderUrl = "https://drive.google.com/drive/folders/1ZaKiEPRNOusOvCZSpstWyWHGVRk-lRlE?usp=drive_link";
  const whatsappNumber = "9768444902";

  useEffect(() => {
    if (isOpen) {
      setIsQuerySubmitted(false);
      setIsProcessing(false);
      setTxnId("");
      setDriveReceiptLink("");
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
  const itemPrice = isSet ? 40 : (selectedPackage?.price || item.price || 1000);
  const formattedPrice = typeof itemPrice === "number" ? `Rs. ${itemPrice}` : itemPrice.toString().startsWith("Rs") ? itemPrice : `Rs. ${itemPrice}`;

  // WhatsApp prefilled message URL for 9768444902
  const whatsappUrl = `https://wa.me/9779768444902?text=${encodeURIComponent(
    `Hello Deepak Sir,\n\nI have sent my payment request for "${itemName}" (${formattedPrice}).\n\n` +
    `Student Name: ${studentName || "Student"}\n` +
    `Phone: ${senderPhone || studentPhone || "N/A"}\n` +
    (txnId ? `eSewa Txn ID: ${txnId}\n` : "") +
    (driveReceiptLink ? `Drive Receipt Link / File: ${driveReceiptLink}\n` : "") +
    `Google Drive Folder: ${driveFolderUrl}\n\n` +
    `I am attaching my payment screenshot here. Please verify and release my UBT exam set. Thank you!`
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

  // Student submits the query with payment screenshot and Txn ID
  const handleSendQuery = async () => {
    if (!txnId.trim()) {
      alert("Please enter the eSewa Transaction ID / Reference Code from your payment receipt.");
      return;
    }

    setIsProcessing(true);

    try {
      const cleanTxn = txnId.trim().toUpperCase();
      const curPhone = senderPhone.trim() || studentPhone || (typeof window !== "undefined" ? localStorage.getItem("currentStudentPhone") || "9800000000" : "9800000000");
      const screenshotLocation = driveReceiptLink.trim() || driveFolderUrl;

      // 1. Submit to server API
      await fetch("/api/payment/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName || "Student",
          studentPhone: curPhone,
          itemId: item.id || item.name,
          itemName,
          itemType: selectedType,
          amount: typeof itemPrice === "number" ? itemPrice : 40,
          txnId: cleanTxn,
          screenshotUrl: screenshotLocation,
          driveFolderUrl,
          driveReceiptLink: driveReceiptLink.trim()
        })
      }).catch((e) => console.warn("API query notice:", e));

      // 2. Add to studentNotifications so Super Admin receives real-time notification
      const adminNotifs = JSON.parse(localStorage.getItem("studentNotifications") || "[]");
      const newNotif = {
        id: Date.now(),
        type: "payment_query",
        subject: `UBT Purchase Query: ${itemName} (${formattedPrice})`,
        message: `Student ${studentName || "Student"} (${curPhone}) submitted an eSewa payment query.\n\n` +
                 `Set/Package: ${itemName} (${formattedPrice})\n` +
                 `eSewa Transaction ID: ${cleanTxn}\n` +
                 `Screenshot Storage: Google Drive Folder\n` +
                 `Google Drive Folder: ${driveFolderUrl}\n` +
                 (driveReceiptLink.trim() ? `Uploaded File / Link: ${driveReceiptLink.trim()}\n\n` : `\n`) +
                 `Please check the Google Drive Receipts Folder and click 'Confirm & Release UBT' below to unlock.`,
        studentName: studentName || "Student",
        studentPhone: curPhone,
        itemName,
        itemId: item.id || item.name,
        itemType: selectedType,
        amount: itemPrice,
        txnId: cleanTxn,
        screenshotUrl: screenshotLocation,
        driveFolderUrl,
        driveReceiptLink: driveReceiptLink.trim(),
        status: "Pending", // "Pending" | "Released" | "Rejected"
        read: false,
        date: new Date().toLocaleString()
      };
      localStorage.setItem("studentNotifications", JSON.stringify([newNotif, ...adminNotifs]));

      // 3. Save to studentPendingQueries for immediate button state update
      const pendingQueries = JSON.parse(localStorage.getItem("studentPendingQueries") || "[]");
      pendingQueries.unshift({
        id: Date.now(),
        itemId: item.id || item.name,
        itemName,
        phone: curPhone,
        studentName: studentName || "Student",
        amount: itemPrice,
        txnId: cleanTxn,
        screenshotUrl: screenshotLocation,
        driveFolderUrl,
        status: "Pending",
        date: new Date().toLocaleString()
      });
      localStorage.setItem("studentPendingQueries", JSON.stringify(pendingQueries));

      // 4. Save to student's payment history
      const payments = JSON.parse(localStorage.getItem("studentPayments") || "[]");
      payments.unshift({
        id: Date.now(),
        txnId: cleanTxn,
        studentName: studentName || "Student",
        studentPhone: curPhone,
        item: itemName,
        type: isSet ? "Individual UBT Set (Rs. 40)" : "UBT Package",
        amount: itemPrice,
        esewaNumber,
        status: "Pending Admin Confirmation",
        screenshotUrl: screenshotLocation,
        driveFolderUrl,
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleString()
      });
      localStorage.setItem("studentPayments", JSON.stringify(payments));

      // 5. Automatically open WhatsApp to send request directly to Deepak Bhatt (9768444902)
      try {
        const waSendMsg = encodeURIComponent(
          `Hello Deepak Sir,\n\nI have submitted my UBT unlock request on the website.\n\n` +
          `Student Name: ${studentName || "Student"}\n` +
          `Phone: ${curPhone}\n` +
          `Item: ${itemName} (${formattedPrice})\n` +
          `eSewa Txn ID: ${cleanTxn}\n` +
          `Google Drive Folder: ${driveFolderUrl}\n` +
          (driveReceiptLink.trim() ? `Drive File / Link: ${driveReceiptLink.trim()}\n\n` : `\n`) +
          `I am attaching my payment screenshot here. Please confirm my request and release the UBT set. Thank you!`
        );
        window.open(`https://wa.me/9779768444902?text=${waSendMsg}`, "_blank");
      } catch (waErr) {
        console.warn("WhatsApp popup notice:", waErr);
      }

      setIsProcessing(false);
      setIsQuerySubmitted(true);

      if (onSuccessUnlock) {
        onSuccessUnlock({
          type: selectedType,
          item,
          status: "Pending",
          pendingQuery: true
        });
      }
    } catch (err) {
      console.error("Query submission error:", err);
      setIsProcessing(false);
      alert("Failed to submit query: " + err.message);
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
          border: "1px solid #e2e8f0"
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
                eSewa Payment &amp; Query
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "11.5px", opacity: 0.9 }}>
                Send Screenshot &amp; Txn ID &middot; Super Admin Release
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
          {isQuerySubmitted ? (
            /* SUCCESS QUERY SUBMISSION STATE */
            <div style={{ textAlign: "center", padding: "16px 8px" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  backgroundColor: "#eff6ff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                  border: "3px solid #93c5fd"
                }}
              >
                <span style={{ fontSize: "34px", color: "#2563eb" }}>📨</span>
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "21px", color: "#0f172a", fontWeight: "800" }}>
                Request Sent to WhatsApp &amp; Super Admin!
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>
                Your payment query for <strong style={{ color: "#1e3a8a" }}>{itemName}</strong> has been submitted to Super Admin, and WhatsApp has been launched.
              </p>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  border: "1px solid #e2e8f0",
                  textAlign: "left",
                  fontSize: "13px",
                  marginBottom: "16px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Requested Set:</span>
                  <strong style={{ color: "#0f172a" }}>{itemName}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Amount:</span>
                  <strong style={{ color: "#16a34a" }}>{formattedPrice}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Transaction ID:</span>
                  <strong style={{ color: "#2563eb", fontFamily: "monospace" }}>{txnId}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Web Status:</span>
                  <strong style={{ color: "#d97706" }}>Pending Super Admin Release</strong>
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
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "12px",
                  color: "#92400e",
                  textAlign: "left"
                }}
              >
                Super Admin has received your request on the web dashboard and WhatsApp. Once verified, your UBT set will be unlocked immediately!
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
                  gap: "8px",
                  width: "100%",
                  backgroundColor: "#25D366",
                  color: "#ffffff",
                  padding: "13px",
                  borderRadius: "8px",
                  fontWeight: "800",
                  fontSize: "14px",
                  textDecoration: "none",
                  marginBottom: "10px",
                  boxShadow: "0 4px 12px rgba(37, 211, 102, 0.35)",
                  boxSizing: "border-box"
                }}
              >
                <span>💬</span>
                <span>Open WhatsApp Chat Again (9768444902) ↗</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                }}
              >
                Close &amp; Check Status
              </button>
            </div>
          ) : (
            /* QUERY & PAYMENT FORM */
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
                    {isSet ? "40 Questions, Audio & Timer practice" : "Full access to all included UBT sets"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Price to Pay</div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#16a34a" }}>
                    {formattedPrice}
                  </div>
                </div>
              </div>

              {/* Step Info Banner */}
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "12.5px",
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span>ℹ️</span>
                <span>
                  Scan the eSewa QR code below, send your payment screenshot on WhatsApp to <strong>9768444902</strong>, enter your eSewa Transaction ID, and click <strong>Send Query</strong>. Super Admin will verify and release your UBT set.
                </span>
              </div>

              {/* QR CODE & SEND QUERY FLOW */}
              <div>
                  {/* eSewa Details Box */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1.5px dashed #16a34a",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      marginBottom: "14px",
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
                        borderRadius: "10px",
                        border: "1.5px solid #86efac",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
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
                          width: "115px",
                          height: "115px",
                          objectFit: "contain",
                          display: "block",
                          borderRadius: "6px"
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/images/esewa-payment-qr.jpg";
                        }}
                      />
                      <div style={{ fontSize: "9px", fontWeight: "800", color: "#16a34a", marginTop: "3px" }}>
                        🔍 CLICK TO ENLARGE
                      </div>
                    </div>

                    {/* Details & Copy */}
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

                      <div style={{ fontSize: "12px", color: "#334155", margin: "2px 0" }}>
                        Account Name: <strong>{esewaAccountName}</strong>
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        Org: <strong>{esewaOrg}</strong>
                      </div>

                      {/* WhatsApp & Google Drive Action Links */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "#25D366",
                            color: "#ffffff",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: "800",
                            textDecoration: "none",
                            boxShadow: "0 2px 6px rgba(37, 211, 102, 0.3)",
                            width: "fit-content"
                          }}
                        >
                          <span>💬</span>
                          <span>Send Screenshot on WhatsApp (9768444902) ↗</span>
                        </a>

                        <a
                          href={driveFolderUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#1d4ed8",
                            textDecoration: "underline"
                          }}
                        >
                          <span>📁</span>
                          <span>Google Drive Receipts Folder ↗</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Google Drive Upload Screenshot Box */}
                  <div
                    style={{
                      backgroundColor: "#f0f7ff",
                      border: "1.5px solid #93c5fd",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      marginBottom: "16px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <div
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          flexShrink: 0
                        }}
                      >
                        📁
                      </div>
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#1e3a8a" }}>
                          Store Screenshot in Google Drive
                        </div>
                        <div style={{ fontSize: "11px", color: "#2563eb" }}>
                          Receipts are stored directly in Google Drive (not on website server)
                        </div>
                      </div>
                    </div>

                    <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#334155", lineHeight: "1.4" }}>
                      Please click below to open the official Google Drive folder and upload your payment screenshot:
                    </p>

                    <a
                      href={driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontWeight: "800",
                        fontSize: "13px",
                        textDecoration: "none",
                        boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                        marginBottom: "10px",
                        boxSizing: "border-box"
                      }}
                    >
                      <span>📁</span>
                      <span>Click to Open &amp; Upload to Google Drive Folder ↗</span>
                    </a>

                    <div style={{ marginTop: "8px" }}>
                      <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                        Google Drive File Name / Link (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MyReceipt.jpg or pasted Drive link"
                        value={driveReceiptLink}
                        onChange={(e) => setDriveReceiptLink(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12.5px",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>

                  {/* Transaction ID & Phone Inputs */}
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
                      eSewa Transaction ID / Ref Code <span style={{ color: "#dc2626" }}>*</span>
                    </label>
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
                    />
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                      Sender Phone Number (eSewa Account)
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

                  {/* Action Buttons: SEND QUERY */}
                  <div style={{ display: "flex", gap: "10px" }}>
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
                        padding: "13px",
                        borderRadius: "8px",
                        fontWeight: "900",
                        fontSize: "14.5px",
                        letterSpacing: "0.3px",
                        cursor: isProcessing ? "wait" : "pointer",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      {isProcessing ? (
                        <>
                          <span>⏳</span>
                          <span>Sending to WhatsApp &amp; Super Admin...</span>
                        </>
                      ) : (
                        <>
                          <span>📨</span>
                          <span>SEND REQUEST TO WHATSAPP &amp; SUPER ADMIN ({formattedPrice})</span>
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
