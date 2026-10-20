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

import React from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import { performLogout } from "@/lib/clientAuth";

const AdminDashboard = () => {
  const router = useRouter();

  const handleLogout = () => {
    performLogout();
  };

  // --- Styling Objects ---
  const containerStyle = { 
    display: "flex", 
    minHeight: "100vh", 
    backgroundColor: "#f1f5f9", 
    fontFamily: "Arial, sans-serif" 
  };
  
  const sidebarStyle = { 
    width: "260px", 
    backgroundColor: "#1e293b", 
    color: "white", 
    display: "flex", 
    flexDirection: "column" 
  };
  
  const sidebarHeader = { 
    padding: "20px", 
    fontSize: "22px", 
    fontWeight: "bold", 
    borderBottom: "1px solid #334155", 
    textAlign: "center",
    letterSpacing: "1px"
  };
  
  const linkStyle = { 
    color: "#cbd5e1", 
    textDecoration: "none", 
    padding: "14px 20px", 
    display: "block", 
    borderBottom: "1px solid #334155", 
    transition: "0.2s",
    fontSize: "14px",
    fontWeight: "bold"
  };
  
  const mainContentStyle = { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column" 
  };
  
  const topbarStyle = { 
    backgroundColor: "white", 
    padding: "15px 30px", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
  };
  
  const contentAreaStyle = { 
    padding: "30px", 
    flex: 1 
  };
  
  const cardContainerStyle = { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
    gap: "20px", 
    marginTop: "20px" 
  };
  
  const cardStyle = { 
    backgroundColor: "white", 
    padding: "25px", 
    borderRadius: "8px", 
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)", 
    borderLeft: "5px solid #2563eb" 
  };

  return (
    <div style={containerStyle}>
      
      {/* Sidebar Navigation without EPS Result Checker */}
      <div style={sidebarStyle}>
        <div style={sidebarHeader}>SIGMA ADMIN</div>
        <div style={{ flex: 1, marginTop: "5px" }}>
          <Link href="/admin" style={{ ...linkStyle, backgroundColor: "#2563eb", color: "white" }}>Dashboard</Link>
          <Link href="/admin/institutes" style={linkStyle}>Manage Institutes</Link>
          <Link href="/admin/questions" style={linkStyle}>Upload Questions</Link>
          <Link href="/admin/listening" style={linkStyle}>Books</Link>
          <Link href="/admin/news" style={linkStyle}>EPS News Update</Link>
          <Link href="/admin/notifications" style={linkStyle}>Notifications</Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={mainContentStyle}>
        
        {/* Top Navbar */}
        <div style={topbarStyle}>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>System Overview</h2>
          <button 
            onClick={handleLogout} 
            style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            Logout
          </button>
        </div>

        {/* Dashboard Statistics */}
        <div style={contentAreaStyle}>
          <h3 style={{ color: "#475569", marginTop: 0, fontSize: "18px" }}>Welcome to Sigma EPS Master Admin Panel</h3>
          
          <div style={cardContainerStyle}>
            {/* Institute Card */}
            <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #3b82f6, #2563eb)", color: "white", borderLeft: "none" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#f1f5f9", fontSize: "12px", textTransform: "uppercase", fontWeight: "700" }}>Total Institutes</h4>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#ffffff" }}>12</p>
            </div>
            
            {/* Student Card */}
            <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #10b981, #059669)", color: "white", borderLeft: "none" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#f1f5f9", fontSize: "12px", textTransform: "uppercase", fontWeight: "700" }}>Registered Students</h4>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#ffffff" }}>1,245</p>
            </div>
            
            {/* Question Bank Card */}
            <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #f59e0b, #d97706)", color: "white", borderLeft: "none" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#f1f5f9", fontSize: "12px", textTransform: "uppercase", fontWeight: "700" }}>Total Questions</h4>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#ffffff" }}>850</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;