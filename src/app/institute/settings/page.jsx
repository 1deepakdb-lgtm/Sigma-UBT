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

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import { performLogout } from "@/lib/clientAuth";

const AdminSettings = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const institutes = JSON.parse(localStorage.getItem("institutes")) || [];
  const logoWatermark = institutes[0]?.logoUrl || "";

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all fields.");
      setIsError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      setIsError(true);
      return;
    }

    const storedAdminPass = localStorage.getItem("adminPassword") || localStorage.getItem("billingAdminPin") || "admin123";

    if (currentPassword !== storedAdminPass && currentPassword !== (localStorage.getItem("billingAdminPin") || "")) {
      setMessage("Current password is incorrect.");
      setIsError(true);
      return;
    }

    localStorage.setItem("adminPassword", newPassword);
    localStorage.setItem("billingAdminPin", newPassword);
    localStorage.setItem("shared_institute_gate_password", newPassword);
    localStorage.setItem("shared_institute_gate_is_custom", "true");
    localStorage.setItem("adminPinIsCustom", "true");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
    setMessage("Password successfully updated for both Billing & Manage Students! Default passwords have been disabled.");
    setIsError(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLogout = () => {
    performLogout();
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
    display: "flex",
    flexDirection: "column",
    ...protectedStyle
  };

  // Sticky top navigation bar
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

  // Centering content layout area
  const contentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px"
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "500px",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc"
  };

  const buttonStyle = {
    backgroundColor: "#0284c7",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    width: "100%"
  };

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      
      {/* STICKY TOP NAVIGATION BAR */}
      <div style={topNavStyle}>
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>SIGMA ADMIN PANEL</div>
        
        <div style={menuContainerStyle}>
          <Link href="/admin" style={navLinkStyle}>Dashboard</Link>
          <Link href="/admin/institutes" style={navLinkStyle}>Manage Institutes</Link>
          <Link href="/admin/questions" style={navLinkStyle}>Upload Question</Link>
          <Link href="/admin/listening" style={navLinkStyle}>Study Materials</Link>
          <Link href="/admin/news" style={navLinkStyle}>Notice</Link>
          <Link href="/admin/settings" style={activeNavLinkStyle}>Settings</Link>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Logout</button>
      </div>

      {/* Main Settings Form Area (Centered) */}
      <div style={contentStyle}>
        <div style={{ width: "100%", maxWidth: "500px", marginBottom: "15px" }}>
          <h2 style={{ color: "#1e293b", margin: 0, fontSize: "22px" }}>Admin Account Settings</h2>
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "15px", fontSize: "18px" }}>Reset Admin Password</h3>
          
          {message && (
            <div style={{ backgroundColor: isError ? "#fee2e2" : "#dcfce7", color: isError ? "#991b1b" : "#166534", padding: "10px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
              {message}
            </div>
          )}

          <form onSubmit={handlePasswordReset} autoComplete="off">
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#475569" }}>Current Password</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                style={inputStyle}
                autoComplete="current-password"
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#475569" }}>New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={inputStyle}
                autoComplete="new-password"
                required
              />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#475569" }}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                style={inputStyle}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" style={buttonStyle}>
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;