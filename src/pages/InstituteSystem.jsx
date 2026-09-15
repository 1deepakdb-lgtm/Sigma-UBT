import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const InstituteSystem = () => {
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    assignedPackage: "Full Package",
    expiryDuration: "1 Year",
    logoUrl: ""
  });

  const loadInstitutes = () => {
    const saved = JSON.parse(localStorage.getItem("institutes")) || [];
    setInstitutes(saved);
  };

  useEffect(() => {
    loadInstitutes();
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, logoUrl: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateExpiryDate = (duration) => {
    const date = new Date();
    if (duration === "1 Month") date.setMonth(date.getMonth() + 1);
    else if (duration === "3 Months") date.setMonth(date.getMonth() + 3);
    else if (duration === "1 Year") date.setFullYear(date.getFullYear() + 1);
    else return "Lifetime";
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const expiryDate = calculateExpiryDate(formData.expiryDuration);
    
    let updated;
    if (editId) {
      updated = institutes.map(inst => 
        inst.id === editId ? { ...inst, ...formData, expiryDate } : inst
      );
      alert("✅ Institute Updated Successfully!");
    } else {
      const newInst = {
        id: Date.now(),
        ...formData,
        expiryDate,
        status: "Active"
      };
      updated = [...institutes, newInst];
      alert("✅ Institute Added Successfully!");
    }

    localStorage.setItem("institutes", JSON.stringify(updated));
    setInstitutes(updated);
    resetForm();
  };

  const handleEdit = (inst) => {
    setFormData({
      name: inst.name,
      phone: inst.phone,
      password: inst.password,
      assignedPackage: inst.assignedPackage || "Full Package",
      expiryDuration: inst.expiryDuration || "1 Year",
      logoUrl: inst.logoUrl || ""
    });
    setEditId(inst.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", password: "", assignedPackage: "Full Package", expiryDuration: "1 Year", logoUrl: "" });
    setEditId(null);
    setShowForm(false);
  };

  const institutesWatermark = institutes[0]?.logoUrl || "";

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
    backgroundImage: institutesWatermark ? `url(${institutesWatermark})` : "none",
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

  const contentAreaStyle = { padding: "30px", maxWidth: "1200px", margin: "0 auto" };
  const cardStyle = { backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: "20px", border: "1px solid #e2e8f0" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderRadius: "8px", overflow: "hidden" };
  const thStyle = { backgroundColor: "#f8fafc", padding: "15px", textAlign: "left", borderBottom: "2px solid #e2e8f0", color: "#475569" };
  const tdStyle = { padding: "15px", borderBottom: "1px solid #e2e8f0", color: "#1e293b", verticalAlign: "middle" };
  const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #cbd5e1", borderRadius: "5px", boxSizing: "border-box", backgroundColor: "white" };

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      
      {/* STICKY TOP NAVIGATION BAR */}
      <div style={topNavStyle}>
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>SIGMA ADMIN PANEL</div>
        
        <div style={menuContainerStyle}>
          <Link to="/admin" style={navLinkStyle}>Dashboard</Link>
          <Link to="/admin/institutes" style={activeNavLinkStyle}>Manage Institutes</Link>
          <Link to="/admin/questions" style={navLinkStyle}>Upload Question</Link>
          <Link to="/admin/listening" style={navLinkStyle}>EPS Book</Link>
          <Link to="/admin/news" style={navLinkStyle}>EPS Notices</Link>
          <Link to="/admin/notifications" style={navLinkStyle}>Notifications</Link>
          <Link to="/admin/settings" style={navLinkStyle}>Settings</Link>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Logout</button>
      </div>

      <div style={contentAreaStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#1e293b", margin: 0, fontSize: "22px" }}>Institute Management</h2>
          <button onClick={() => showForm ? resetForm() : setShowForm(true)} style={{ backgroundColor: showForm ? "#ef4444" : "#16a34a", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            {showForm ? "Cancel" : "+ Add New Institute"}
          </button>
        </div>

        {showForm && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>{editId ? "Update Institute" : "Register New Institute"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Institute Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle} placeholder="Enter institute name" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Phone / Login ID</label>
                <input type="number" name="phone" value={formData.phone} onChange={handleInputChange} required style={inputStyle} placeholder="Enter phone number" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Password</label>
                <input type="text" name="password" value={formData.password} onChange={handleInputChange} required style={inputStyle} placeholder="Create password" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Assigned Package</label>
                <select name="assignedPackage" value={formData.assignedPackage} onChange={handleInputChange} style={inputStyle}>
                  <option value="Full Package">Full Package</option>
                  <option value="100 UBT set">100 UBT set</option>
                  <option value="Chapterwise Set">Chapterwise Set</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Expiry Duration</label>
                <select name="expiryDuration" value={formData.expiryDuration} onChange={handleInputChange} style={inputStyle}>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Institute Logo (Watermark)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={inputStyle} />
                {formData.logoUrl && <img src={formData.logoUrl} alt="Logo preview" style={{ height: "40px", marginTop: "5px" }} />}
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <button type="submit" style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                  {editId ? "Update Institute" : "Save Institute"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: "#1e293b", marginBottom: "15px" }}>Registered Institutes</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Institute Name</th>
                <th style={thStyle}>Phone / Login ID</th>
                <th style={thStyle}>Total Students</th>
                <th style={thStyle}>Package & Expiry</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutes.length === 0 ? (
                <tr><td colSpan="6" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>No institutes registered yet.</td></tr>
              ) : (
                institutes.map((inst) => {
                  const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
                  const studentCount = allStudents[inst.name]?.length || 0;
                  return (
                    <tr key={inst.id}>
                      <td style={{ ...tdStyle, fontWeight: "bold" }}>{inst.name}</td>
                      <td style={tdStyle}>{inst.phone}</td>
                      <td style={tdStyle}>{studentCount}</td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: "bold", color: "#2563eb" }}>{inst.assignedPackage}</span>
                        <br/><span style={{ fontSize: "12px", color: "#ef4444" }}>Ends: {inst.expiryDate}</span>
                      </td>
                      <td style={tdStyle}><span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>{inst.status}</span></td>
                      <td style={tdStyle}>
                        {/* Delete बटन हटाइयो, अब केवल Update बटन मात्र रहनेछ */}
                        <button onClick={() => handleEdit(inst)} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "6px 14px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Update</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default InstituteSystem;