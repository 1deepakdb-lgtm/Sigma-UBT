import React from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
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
          <Link to="/admin" style={{ ...linkStyle, backgroundColor: "#2563eb", color: "white" }}>Dashboard</Link>
          <Link to="/admin/institutes" style={linkStyle}>Manage Institutes</Link>
          <Link to="/admin/questions" style={linkStyle}>Question Model Bank</Link>
          <Link to="/admin/listening" style={linkStyle}>EPS Book & Listening</Link>
          <Link to="/admin/news" style={linkStyle}>EPS News Update</Link>
          <Link to="/admin/notifications" style={linkStyle}>Notifications</Link>
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
            <div style={cardStyle}>
              <h4 style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px", textTransform: "uppercase" }}>Total Institutes</h4>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#1e293b" }}>12</p>
            </div>
            
            {/* Student Card */}
            <div style={{ ...cardStyle, borderLeftColor: "#16a34a" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px", textTransform: "uppercase" }}>Registered Students</h4>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#1e293b" }}>1,245</p>
            </div>
            
            {/* Question Bank Card */}
            <div style={{ ...cardStyle, borderLeftColor: "#f59e0b" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px", textTransform: "uppercase" }}>Total Questions</h4>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#1e293b" }}>850</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;