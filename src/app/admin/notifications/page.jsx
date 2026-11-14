'use client';

if (typeof globalThis !== 'undefined' && !globalThis.localStorage) {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0
  };
}

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { performLogout } from "@/lib/clientAuth";

const GOOGLE_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1ZaKiEPRNOusOvCZSpstWyWHGVRk-lRlE?usp=drive_link";

const AdminNotifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [replyText, setReplyText] = useState({});
  const [selected, setSelected] = useState(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const institutes = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("institutes") || "[]") : [];
  const logoWatermark = institutes[0]?.logoUrl || "";

  const loadNotifications = async () => {
    const saved = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("studentNotifications") || "[]") : [];

    // Also fetch remote queries from database to sync student submissions
    try {
      const res = await fetch("/api/payment/query");
      if (res.ok) {
        const data = await res.json();
        if (data.queries && data.queries.length > 0) {
          const dbNotifs = data.queries.map((q) => {
            let raw = {};
            try { raw = JSON.parse(q.rawResponse || "{}"); } catch(e) {}
            return {
              id: q.id,
              queryId: q.id,
              type: "payment_query",
              subject: `UBT Purchase Query: ${q.itemName} (Rs. ${q.amount})`,
              message: `Student ${q.studentName} (${q.studentPhone}) submitted an eSewa payment query.\n\n` +
                       `Set/Package: ${q.itemName} (Rs. ${q.amount})\n` +
                       `eSewa Transaction ID: ${q.transactionCode}\n` +
                       `Status: ${q.status === 'COMPLETE' ? 'Released' : q.status === 'FAILED' ? 'Rejected' : 'Pending'}\n` +
                       `Google Drive Folder: ${raw.driveFolderUrl || GOOGLE_DRIVE_FOLDER_URL}`,
              studentName: q.studentName,
              studentPhone: q.studentPhone,
              itemName: q.itemName,
              itemId: q.itemId,
              itemType: q.itemType,
              amount: q.amount,
              txnId: q.transactionCode,
              screenshotUrl: raw.screenshotUrl,
              driveFolderUrl: raw.driveFolderUrl || GOOGLE_DRIVE_FOLDER_URL,
              status: q.status === 'COMPLETE' ? 'Released' : q.status === 'FAILED' ? 'Rejected' : 'Pending',
              read: q.status === 'COMPLETE',
              date: new Date(q.createdAt).toLocaleString(),
              fromDb: true
            };
          });

          // Merge by unique id / txnId
          const existingKeys = new Set(saved.map((s) => s.txnId || s.id));
          const toAdd = dbNotifs.filter((dn) => !existingKeys.has(dn.txnId) && !existingKeys.has(dn.id));
          const merged = [...saved, ...toAdd];

          // Update status of any existing notification if DB has newer complete status
          dbNotifs.forEach((dn) => {
            const match = merged.find((m) => (m.txnId && m.txnId === dn.txnId) || (m.queryId && m.queryId === dn.id));
            if (match && dn.status !== 'Pending') {
              match.status = dn.status;
            }
          });

          setNotifications(merged);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not sync remote queries:", e);
    }

    setNotifications(saved);
  };

  useEffect(() => {
    loadNotifications();
    const onStorage = () => loadNotifications();
    window.addEventListener("storage", onStorage);
    const timer = setInterval(loadNotifications, 4000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(timer);
    };
  }, []);

  const saveNotifications = (updated) => {
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem("studentNotifications", JSON.stringify(updated));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingQueriesCount = notifications.filter((n) => n.type === "payment_query" && n.status !== "Released").length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "queries") return n.type === "payment_query" || n.type === "purchase";
    if (filter === "replied") return !!n.adminReply;
    return true;
  });

  const markAllRead = () => {
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this notification?")) return;
    saveNotifications(notifications.filter((n) => n.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const openNotification = (item) => {
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n));
    saveNotifications(updated);
    setSelected({ ...item, read: true });
  };

  // SUPER ADMIN ACTION: Confirm & Release UBT Set to Student
  const handleReleaseUbt = async (item) => {
    if (!item) return;
    const confirmRelease = window.confirm(
      `Confirm payment and release ${item.itemName || "UBT Set"} to ${item.studentName || "Student"} (${item.studentPhone || "No Phone"})?`
    );
    if (!confirmRelease) return;

    setIsReleasing(true);
    try {
      const targetId = item.itemId || item.itemName;
      const targetName = item.itemName || "UBT Exam Set";
      const studentPhone = item.studentPhone || "";
      const isPackage = item.itemType === "package";

      if (typeof window !== 'undefined') {
        // 1. If individual set: release ONLY to this specific student
        if (!isPackage && studentPhone) {
          const studentSetMap = JSON.parse(localStorage.getItem("adminStudentUnlockedSetsMap") || "{}");
          const curSets = studentSetMap[studentPhone] || [];
          studentSetMap[studentPhone] = Array.from(new Set([...curSets, targetId, targetName, targetId?.toString()]));
          localStorage.setItem("adminStudentUnlockedSetsMap", JSON.stringify(studentSetMap));

          // Also keep unlockedStudentExamSets for immediate local session
          const unlocked = JSON.parse(localStorage.getItem("unlockedStudentExamSets") || "[]");
          localStorage.setItem("unlockedStudentExamSets", JSON.stringify(Array.from(new Set([...unlocked, targetId, targetName, targetId?.toString()]))));
        }

        // 2. If package: release ONLY that specific package to this specific student
        if (isPackage && studentPhone) {
          const buyerMap = JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}");
          const currentPkgs = buyerMap[studentPhone]?.packages || [];
          buyerMap[studentPhone] = {
            isBuyer: true,
            hasPurchased: true,
            packageName: targetName,
            packages: Array.from(new Set([...currentPkgs, targetName])),
            approvedAt: new Date().toISOString()
          };
          localStorage.setItem("adminBuyerStudentsMap", JSON.stringify(buyerMap));
        }

        // 3. Update studentPendingQueries status to Released for this specific student and item
        const pending = JSON.parse(localStorage.getItem("studentPendingQueries") || "[]");
        const updatedPending = pending.map((p) => {
          if (p.txnId === item.txnId || (p.phone === item.studentPhone && (p.itemId === item.itemId || p.itemName === item.itemName))) {
            return { ...p, status: "Released", releasedAt: new Date().toLocaleString() };
          }
          return p;
        });
        localStorage.setItem("studentPendingQueries", JSON.stringify(updatedPending));
      }

      // 5. Update backend database via PATCH
      await fetch("/api/payment/query", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.queryId || item.id,
          txnId: item.txnId,
          phone: item.studentPhone,
          itemId: item.itemId,
          action: "release"
        })
      }).catch((e) => console.warn("Backend update notice:", e));

      // 6. Update notification in state and localStorage
      const successReply = `Payment Verified! Your UBT Set (${targetName}) has been confirmed and released. You can start your exam right now.`;
      const updatedNotifs = notifications.map((n) =>
        n.id === item.id || (n.txnId && n.txnId === item.txnId)
          ? {
              ...n,
              status: "Released",
              read: true,
              adminReply: successReply,
              repliedAt: new Date().toLocaleString()
            }
          : n
      );
      saveNotifications(updatedNotifs);

      setSelected((prev) =>
        prev
          ? {
              ...prev,
              status: "Released",
              adminReply: successReply,
              repliedAt: new Date().toLocaleString()
            }
          : null
      );

      setIsReleasing(false);
      alert(`UBT Set (${targetName}) successfully released to ${item.studentName}! The student can now start the exam.`);
    } catch (err) {
      console.error("Error releasing UBT set:", err);
      setIsReleasing(false);
      alert("Failed to release UBT set: " + err.message);
    }
  };

  // SUPER ADMIN ACTION: Reject payment query
  const handleRejectQuery = async (item) => {
    if (!item) return;
    const reason = window.prompt("Reason for rejecting query (optional):", "Payment receipt could not be verified in eSewa.");
    if (reason === null) return;

    try {
      await fetch("/api/payment/query", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.queryId || item.id,
          txnId: item.txnId,
          phone: item.studentPhone,
          itemId: item.itemId,
          action: "reject"
        })
      }).catch((e) => console.warn("Reject notice:", e));

      const rejectReply = `Payment Query Rejected: ${reason}`;
      const updatedNotifs = notifications.map((n) =>
        n.id === item.id
          ? {
              ...n,
              status: "Rejected",
              read: true,
              adminReply: rejectReply,
              repliedAt: new Date().toLocaleString()
            }
          : n
      );
      saveNotifications(updatedNotifs);

      setSelected((prev) =>
        prev
          ? {
              ...prev,
              status: "Rejected",
              adminReply: rejectReply,
              repliedAt: new Date().toLocaleString()
            }
          : null
      );
      alert("Payment query marked as rejected.");
    } catch (err) {
      alert("Failed to reject query: " + err.message);
    }
  };

  const sendReply = (id) => {
    const text = (replyText[id] || "").trim();
    if (!text) {
      alert("Please type a reply first.");
      return;
    }
    const updated = notifications.map((n) =>
      n.id === id
        ? {
            ...n,
            read: true,
            adminReply: text,
            repliedAt: new Date().toLocaleString()
          }
        : n
    );
    saveNotifications(updated);
    setReplyText({ ...replyText, [id]: "" });
    setSelected(updated.find((n) => n.id === id) || null);
    alert("Reply sent. The student can see it in their Notify Admin tab.");
  };

  const protectedStyle = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none"
  };

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "rgba(241, 245, 249, 0.92)",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    backgroundImage: logoWatermark ? `url(${logoWatermark})` : "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "350px",
    backgroundBlendMode: "overlay",
    ...protectedStyle
  };

  const contentStyle = { padding: "30px", maxWidth: "1280px", margin: "0 auto" };
  const cardStyle = { backgroundColor: "white", padding: "24px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "25px", border: "1px solid #e2e8f0" };

  const filterBtn = (key, label) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      style={{
        padding: "8px 16px",
        backgroundColor: filter === key ? "#1e3a8a" : "white",
        color: filter === key ? "white" : "#1e3a8a",
        border: "1px solid #1e3a8a",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "13px"
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      <Navbar role="admin" notificationCount={unreadCount} />

      <div style={contentStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <h2 style={{ color: "#1e293b", margin: 0, fontSize: "22px", fontWeight: "800" }}>Student Notifications &amp; Payment Queries</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
              Verify student payment screenshots and release UBT sets
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {filterBtn("all", `All (${notifications.length})`)}
            {filterBtn("queries", `Payment Queries (${pendingQueriesCount})`)}
            {filterBtn("unread", `Unread (${unreadCount})`)}
            {filterBtn("replied", "Replied")}
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ padding: "8px 16px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.15fr" : "1fr", gap: "20px" }}>
          {/* NOTIFICATION LIST */}
          <div style={cardStyle}>
            {filtered.length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", margin: "20px 0" }}>No notifications from students yet.</p>
            ) : (
              filtered.map((item) => {
                const isQuery = item.type === "payment_query";
                const isReleased = item.status === "Released";
                const isRejected = item.status === "Rejected";

                return (
                  <div
                    key={item.id}
                    onClick={() => openNotification(item)}
                    style={{
                      marginBottom: "12px",
                      padding: "15px",
                      backgroundColor: item.read ? "#f8fafc" : "#eff6ff",
                      border: selected?.id === item.id ? "2px solid #2563eb" : item.read ? "1px solid #cbd5e1" : "2px solid #93c5fd",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "0.15s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          {!item.read && (
                            <span style={{ width: "8px", height: "8px", backgroundColor: "#2563eb", borderRadius: "50%", display: "inline-block" }} />
                          )}
                          <h4 style={{ margin: 0, color: "#1e3a8a", fontSize: "14.5px", fontWeight: "700" }}>{item.subject || "Student message"}</h4>

                          {isQuery ? (
                            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#b45309", background: "#fef3c7", padding: "2px 8px", borderRadius: "10px" }}>
                              Query (Rs. {item.amount || 40})
                            </span>
                          ) : item.type === "purchase" ? (
                            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: "10px" }}>
                              Purchase
                            </span>
                          ) : (
                            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#1d4ed8", background: "#dbeafe", padding: "2px 8px", borderRadius: "10px" }}>
                              Message
                            </span>
                          )}

                          {isQuery && (
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: "800",
                                color: isReleased ? "#166534" : isRejected ? "#991b1b" : "#c2410c",
                                background: isReleased ? "#dcfce7" : isRejected ? "#fee2e2" : "#ffedd5",
                                padding: "2px 8px",
                                borderRadius: "10px"
                              }}
                            >
                              {isReleased ? "✓ Released" : isRejected ? "✗ Rejected" : "⏳ Pending Confirmation"}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#475569" }}>
                          {item.studentName}{item.studentPhone ? ` · ${item.studentPhone}` : ""}{item.instituteName ? ` · ${item.instituteName}` : ""}
                        </p>
                      </div>
                      <span style={{ fontSize: "11.5px", color: "#64748b" }}>{item.date}</span>
                    </div>

                    <p style={{ margin: "8px 0 0 0", fontSize: "13.5px", color: "#334155", lineHeight: "1.4" }}>
                      {(item.message || "").slice(0, 120)}{(item.message || "").length > 120 ? "..." : ""}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* NOTIFICATION DETAIL & UBT RELEASE PANEL */}
          {selected && (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px 0", color: "#1e293b", fontSize: "18px" }}>{selected.subject}</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    From: <strong>{selected.studentName}</strong>
                    {selected.studentPhone ? ` (${selected.studentPhone})` : ""}
                  </p>
                  {selected.instituteName && (
                    <p style={{ margin: "3px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>Institute: {selected.instituteName}</p>
                  )}
                  <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>{selected.date}</p>
                </div>
                <button
                  onClick={() => handleDelete(selected.id)}
                  style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
                >
                  Delete
                </button>
              </div>

              {/* PAYMENT QUERY REVIEW CARD */}
              {(selected.type === "payment_query" || selected.screenshotUrl || selected.txnId) && (
                <div style={{ marginTop: "16px", backgroundColor: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#0369a1", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>💳</span>
                      <span>eSewa Payment Verification Details</span>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        color: selected.status === "Released" ? "#166534" : selected.status === "Rejected" ? "#991b1b" : "#c2410c",
                        background: selected.status === "Released" ? "#dcfce7" : selected.status === "Rejected" ? "#fee2e2" : "#ffedd5",
                        padding: "3px 10px",
                        borderRadius: "12px"
                      }}
                    >
                      {selected.status === "Released" ? "✓ UBT RELEASED" : selected.status === "Rejected" ? "✗ REJECTED" : "⏳ AWAITING CONFIRMATION"}
                    </span>
                  </div>

                  {/* Item, Price, Txn Info Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e0f2fe", marginBottom: "12px", fontSize: "13px" }}>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11.5px", display: "block" }}>UBT Item</span>
                      <strong style={{ color: "#0f172a" }}>{selected.itemName || "UBT Exam Set"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11.5px", display: "block" }}>Amount Paid</span>
                      <strong style={{ color: "#16a34a", fontSize: "15px" }}>Rs. {selected.amount || 40}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11.5px", display: "block" }}>eSewa Transaction ID</span>
                      <strong style={{ color: "#0369a1", fontFamily: "monospace", fontSize: "13.5px" }}>{selected.txnId || "N/A"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11.5px", display: "block" }}>Sender Phone</span>
                      <strong style={{ color: "#0f172a" }}>{selected.studentPhone || "N/A"}</strong>
                    </div>
                  </div>

                  {/* Screenshot Preview & Google Drive Folder Link */}
                  <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e0f2fe", marginBottom: "14px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                      Payment Screenshot Proof (Stored in Google Drive)
                    </div>

                    {/* Check if screenshot is direct image or stored in Google Drive */}
                    {selected.screenshotUrl && (selected.screenshotUrl.startsWith("data:image") || selected.screenshotUrl.startsWith("/uploads/") || selected.screenshotUrl.endsWith(".jpg") || selected.screenshotUrl.endsWith(".png") || selected.screenshotUrl.endsWith(".webp")) ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", marginBottom: "10px" }}>
                        <img
                          src={selected.screenshotUrl}
                          alt="Student Payment Screenshot"
                          onClick={() => setPreviewImage(selected.screenshotUrl)}
                          style={{
                            maxHeight: "140px",
                            maxWidth: "180px",
                            objectFit: "contain",
                            borderRadius: "6px",
                            border: "1.5px solid #cbd5e1",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                          }}
                        />
                        <div style={{ flex: 1, minWidth: "160px" }}>
                          <button
                            type="button"
                            onClick={() => window.open(selected.screenshotUrl, "_blank")}
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              border: "1px solid #bfdbfe",
                              borderRadius: "6px",
                              padding: "6px 12px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            🔍 View Full Screenshot
                          </button>
                          <p style={{ margin: "6px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                            Click image to view in detail
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ backgroundColor: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px" }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#1e40af" }}>
                          📁 Stored in Google Drive Receipts Folder
                        </div>
                        <p style={{ margin: "4px 0 6px 0", fontSize: "11.5px", color: "#3b82f6" }}>
                          Payment screenshots are stored directly in Google Drive (not stored on website server).
                        </p>
                        {selected.driveReceiptLink && (
                          <div style={{ fontSize: "12px", color: "#0f172a", marginTop: "4px" }}>
                            Student File/Link: <strong>{selected.driveReceiptLink}</strong>
                          </div>
                        )}
                      </div>
                    )}

                    {/* External Action Links: Google Drive & WhatsApp */}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      <a
                        href={selected.driveFolderUrl || GOOGLE_DRIVE_FOLDER_URL}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          color: "#1d4ed8",
                          textDecoration: "none",
                          fontWeight: "700",
                          fontSize: "12.5px"
                        }}
                      >
                        <span>📁</span>
                        <span>Open Google Drive Receipts Folder ↗</span>
                      </a>

                      <a
                        href={`https://wa.me/9779768444902?text=${encodeURIComponent(
                          `Super Admin Inquiry: Payment Query for student ${selected.studentName} (${selected.studentPhone || "No Phone"}), Set: ${selected.itemName}, Txn ID: ${selected.txnId || "N/A"}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "#25D366",
                          color: "#ffffff",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontWeight: "700",
                          fontSize: "12.5px",
                          boxShadow: "0 2px 6px rgba(37, 211, 102, 0.3)"
                        }}
                      >
                        <span>💬</span>
                        <span>WhatsApp Deepak Bhatt (9768444902) ↗</span>
                      </a>

                      {selected.studentPhone && (
                        <a
                          href={`https://wa.me/977${selected.studentPhone.replace(/[^0-9]/g, "").slice(-10)}?text=${encodeURIComponent(
                            `Hello ${selected.studentName}, your payment of Rs. ${selected.amount || 30} for "${selected.itemName}" has been confirmed and your exam set is now RELEASED! You can start your exam on https://examjk.com/student. Best wishes!`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "#15803d",
                            color: "#ffffff",
                            padding: "8px 14px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontWeight: "700",
                            fontSize: "12.5px"
                          }}
                        >
                          <span>💬</span>
                          <span>WhatsApp Student ({selected.studentPhone}) ↗</span>
                        </a>
                      )}
                    </div>
                    <span style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                      Folder ID: 1ZaKiEPRNOusOvCZSpstWyWHGVRk-lRlE &middot; WhatsApp: 9768444902
                    </span>
                  </div>

                  {/* ACTION BUTTON: Confirm & Release UBT Set */}
                  {selected.status === "Released" ? (
                    <div style={{ backgroundColor: "#dcfce7", border: "1px solid #86efac", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                      <div style={{ color: "#166534", fontWeight: "800", fontSize: "14px" }}>
                        ✓ UBT Set Released to Student
                      </div>
                      <p style={{ margin: "3px 0 0 0", color: "#15803d", fontSize: "12px" }}>
                        Student {selected.studentName} can take this exam without restrictions.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => handleReleaseUbt(selected)}
                        disabled={isReleasing}
                        style={{
                          flex: 2,
                          minWidth: "220px",
                          background: isReleasing ? "#94a3b8" : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                          color: "#ffffff",
                          border: "none",
                          padding: "13px 18px",
                          borderRadius: "8px",
                          fontWeight: "800",
                          fontSize: "14px",
                          cursor: isReleasing ? "wait" : "pointer",
                          boxShadow: "0 3px 10px rgba(22, 163, 74, 0.35)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px"
                        }}
                      >
                        {isReleasing ? (
                          <>
                            <span>⏳</span>
                            <span>Releasing UBT Set...</span>
                          </>
                        ) : (
                          <>
                            <span>✅</span>
                            <span>Confirm Payment &amp; Release UBT Set (Rs. {selected.amount || 30})</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectQuery(selected)}
                        style={{
                          flex: 1,
                          backgroundColor: "#fff",
                          color: "#dc2626",
                          border: "1px solid #fca5a5",
                          padding: "13px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Message Content */}
              <div style={{ marginTop: "16px", padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", whiteSpace: "pre-line", color: "#334155", fontSize: "14px", lineHeight: "1.6" }}>
                {selected.message}
              </div>

              {selected.adminReply && (
                <div style={{ marginTop: "14px", padding: "14px", backgroundColor: "#ecfdf5", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
                  <div style={{ fontSize: "11.5px", fontWeight: "bold", color: "#047857", marginBottom: "4px" }}>
                    YOUR REPLY {selected.repliedAt ? `· ${selected.repliedAt}` : ""}
                  </div>
                  <p style={{ margin: 0, color: "#065f46", whiteSpace: "pre-line", fontSize: "13.5px" }}>{selected.adminReply}</p>
                </div>
              )}

              <textarea
                placeholder="Type a custom reply to this student..."
                value={replyText[selected.id] || ""}
                onChange={(e) => setReplyText({ ...replyText, [selected.id]: e.target.value })}
                rows={3}
                style={{ width: "100%", marginTop: "14px", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontFamily: "inherit", fontSize: "13.5px" }}
              />
              <button
                onClick={() => sendReply(selected.id)}
                style={{ marginTop: "8px", width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13.5px" }}
              >
                Send Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Full Screenshot Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <img
              src={previewImage}
              alt="Receipt Preview"
              style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "8px" }}
            />
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                top: "-15px",
                right: "-15px",
                background: "#ffffff",
                color: "#0f172a",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
