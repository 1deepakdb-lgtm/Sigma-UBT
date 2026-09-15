import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [replyText, setReplyText] = useState({});
  const [selected, setSelected] = useState(null);

  const institutes = JSON.parse(localStorage.getItem("institutes")) || [];
  const logoWatermark = institutes[0]?.logoUrl || "";

  const loadNotifications = () => {
    const saved = JSON.parse(localStorage.getItem("studentNotifications")) || [];
    setNotifications(saved);
  };

  useEffect(() => {
    loadNotifications();
    const onStorage = () => loadNotifications();
    window.addEventListener("storage", onStorage);
    const timer = setInterval(loadNotifications, 3000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(timer);
    };
  }, []);

  const saveNotifications = (updated) => {
    setNotifications(updated);
    localStorage.setItem("studentNotifications", JSON.stringify(updated));
  };

  const handleLogout = () => {
    navigate("/");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
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

  const topNavStyle = {
    backgroundColor: "#1e293b",
    color: "white",
    padding: "15px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    flexWrap: "wrap",
    gap: "15px",
    position: "sticky",
    top: 0,
    zIndex: 1000
  };

  const menuContainerStyle = { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" };
  const navLinkStyle = { color: "#cbd5e1", textDecoration: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", transition: "0.2s" };
  const activeNavLinkStyle = { ...navLinkStyle, backgroundColor: "#2563eb", color: "white" };

  const contentStyle = { padding: "30px", maxWidth: "1200px", margin: "0 auto" };
  const cardStyle = { backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: "25px", border: "1px solid #e2e8f0" };

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
      <div style={topNavStyle}>
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>SIGMA ADMIN PANEL</div>

        <div style={menuContainerStyle}>
          <Link to="/admin" style={navLinkStyle}>Dashboard</Link>
          <Link to="/admin/institutes" style={navLinkStyle}>Manage Institutes</Link>
          <Link to="/admin/questions" style={navLinkStyle}>Upload Question</Link>
          <Link to="/admin/listening" style={navLinkStyle}>EPS Book</Link>
          <Link to="/admin/news" style={navLinkStyle}>EPS Notices</Link>
          <Link to="/admin/notifications" style={activeNavLinkStyle}>
            Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Link>
          <Link to="/admin/settings" style={navLinkStyle}>Settings</Link>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Logout</button>
      </div>

      <div style={contentStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <h2 style={{ color: "#1e293b", margin: 0, fontSize: "22px" }}>Student Notifications</h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {filterBtn("all", `All (${notifications.length})`)}
            {filterBtn("unread", `Unread (${unreadCount})`)}
            {filterBtn("replied", "Replied")}
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ padding: "8px 16px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: "20px" }}>
          <div style={cardStyle}>
            {filtered.length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", margin: 0 }}>No notifications from students yet.</p>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openNotification(item)}
                  style={{
                    marginBottom: "12px",
                    padding: "15px",
                    backgroundColor: item.read ? "#f8fafc" : "#eff6ff",
                    border: selected?.id === item.id ? "2px solid #2563eb" : item.read ? "1px solid #cbd5e1" : "2px solid #93c5fd",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        {!item.read && (
                          <span style={{ width: "8px", height: "8px", backgroundColor: "#2563eb", borderRadius: "50%", display: "inline-block" }} />
                        )}
                        <h4 style={{ margin: 0, color: "#1e3a8a", fontSize: "15px" }}>{item.subject || "Student message"}</h4>
                        <span style={{ fontSize: "11px", fontWeight: "bold", color: item.type === "purchase" ? "#b45309" : "#1d4ed8", background: item.type === "purchase" ? "#fef3c7" : "#dbeafe", padding: "2px 8px", borderRadius: "10px" }}>
                          {item.type === "purchase" ? "Purchase" : "Message"}
                        </span>
                      </div>
                      <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#475569" }}>
                        {item.studentName}{item.studentPhone ? ` · ${item.studentPhone}` : ""}{item.instituteName ? ` · ${item.instituteName}` : ""}
                      </p>
                    </div>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{item.date}</span>
                  </div>
                  <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#334155", lineHeight: "1.5" }}>
                    {(item.message || "").slice(0, 140)}{(item.message || "").length > 140 ? "..." : ""}
                  </p>
                </div>
              ))
            )}
          </div>

          {selected && (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>{selected.subject}</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    From: <strong>{selected.studentName}</strong>
                    {selected.studentPhone ? ` (${selected.studentPhone})` : ""}
                  </p>
                  {selected.instituteName && (
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>Institute: {selected.instituteName}</p>
                  )}
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>{selected.date}</p>
                </div>
                <button onClick={() => handleDelete(selected.id)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
                  Delete
                </button>
              </div>

              <div style={{ marginTop: "18px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", whiteSpace: "pre-line", color: "#334155", fontSize: "15px", lineHeight: "1.6" }}>
                {selected.message}
              </div>

              {selected.adminReply && (
                <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#ecfdf5", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#047857", marginBottom: "6px" }}>YOUR REPLY {selected.repliedAt ? `· ${selected.repliedAt}` : ""}</div>
                  <p style={{ margin: 0, color: "#065f46", whiteSpace: "pre-line" }}>{selected.adminReply}</p>
                </div>
              )}

              <textarea
                placeholder="Type a reply to this student..."
                value={replyText[selected.id] || ""}
                onChange={(e) => setReplyText({ ...replyText, [selected.id]: e.target.value })}
                rows={4}
                style={{ width: "100%", marginTop: "16px", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontFamily: "inherit" }}
              />
              <button
                onClick={() => sendReply(selected.id)}
                style={{ marginTop: "10px", width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                Send Reply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
