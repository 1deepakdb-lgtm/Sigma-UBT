import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InstituteStudents = () => {
  const navigate = useNavigate();
  const instituteName = localStorage.getItem("currentInstitute") || "Language Institute";
  const userRole = localStorage.getItem("currentInstitute") ? "institute" : "admin";

  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ 
    name: "", 
    username: "",
    phone: "", 
    password: "", 
    batch: "1",
    assignedPackage: "Chapterwise 30 set",
    expiryDuration: "1 Month" 
  });

  useEffect(() => {
    const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    setStudents(allStudents[instituteName] || []);
  }, [instituteName]);

  const handleDashboardRedirect = () => {
    if (userRole === "institute") {
      navigate("/institute");
    } else {
      navigate("/admin");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateExpiryDate = (duration) => {
    if (duration === "Lifetime") return "Lifetime";
    const date = new Date();
    if (duration === "15 Days") date.setDate(date.getDate() + 15);
    else if (duration === "1 Month") date.setMonth(date.getMonth() + 1);
    else if (duration === "2 Months") date.setMonth(date.getMonth() + 2);
    else if (duration === "3 Months") date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0]; 
  };

  const handleSubmitStudent = (e) => {
    e.preventDefault();
    const calculatedExpiryDate = calculateExpiryDate(formData.expiryDuration);

    const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    const currentInstStudents = allStudents[instituteName] || [];
    
    let updatedStudents;

    if (editId) {
      updatedStudents = currentInstStudents.map((stu) => 
        stu.id === editId ? { ...stu, ...formData, expiryDate: calculatedExpiryDate } : stu
      );
      alert("✅ Student Updated Successfully!");
    } else {
      const exists = currentInstStudents.some(s => s.phone === formData.phone);
      if (exists) {
        alert("❌ This student phone number is already registered!");
        return;
      }
      const newStudent = {
        id: Date.now(),
        ...formData,
        expiryDate: calculatedExpiryDate,
        status: "Active"
      };
      updatedStudents = [...currentInstStudents, newStudent];
      alert("✅ Student Added Successfully!");
    }

    allStudents[instituteName] = updatedStudents;
    localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
    setStudents(updatedStudents);

    const globalUsers = JSON.parse(localStorage.getItem("users")) || {};
    globalUsers[formData.phone] = { name: formData.name, password: formData.password };
    localStorage.setItem("users", JSON.stringify(globalUsers));

    resetForm();
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      username: student.username || "",
      phone: student.phone,
      password: student.password,
      batch: student.batch || "1",
      assignedPackage: student.assignedPackage || "Chapterwise 30 set",
      expiryDuration: student.expiryDuration || "1 Month"
    });
    setEditId(student.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
      const currentInstStudents = allStudents[instituteName] || [];
      const updatedStudents = currentInstStudents.filter(stu => stu.id !== id);
      allStudents[instituteName] = updatedStudents;
      
      localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
      setStudents(updatedStudents);
      alert("🗑️ Student Deleted Successfully!");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", username: "", phone: "", password: "", batch: "1", assignedPackage: "Chapterwise 30 set", expiryDuration: "1 Month" });
    setEditId(null);
    setShowForm(false);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.phone.includes(searchTerm)
  );

  const containerStyle = { display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" };
  const topbarStyle = { backgroundColor: "white", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
  const contentStyle = { padding: "30px", maxWidth: "1200px", margin: "0 auto", width: "100%", boxSizing: "border-box" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderRadius: "8px", overflow: "hidden", marginTop: "20px" };
  const thStyle = { backgroundColor: "#0ea5e9", padding: "12px 15px", textAlign: "left", color: "white", fontSize: "14px" };
  const tdStyle = { padding: "12px 15px", borderBottom: "1px solid #e2e8f0", color: "#1e293b", fontSize: "14px" };
  const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #cbd5e1", borderRadius: "5px", boxSizing: "border-box" };

  return (
    <div style={containerStyle}>
      <div style={topbarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h2 style={{ margin: 0, color: "#1e3a8a", fontSize: "20px" }}>SIGMA UBT</h2>
          <span style={{ color: "#64748b", fontSize: "14px" }}>Student Management</span>
        </div>
        <button 
          onClick={handleDashboardRedirect}
          style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "8px 16px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          ← Dashboard
        </button>
      </div>

      <div style={contentStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h2 style={{ margin: "0 0 5px 0", color: "#1e293b" }}>Students</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Create and manage your institute students.</p>
          </div>
          <button 
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            style={{ backgroundColor: showForm ? "#ef4444" : "#0ea5e9", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            {showForm ? "Cancel" : "+ Create Student"}
          </button>
        </div>

        {showForm && (
          <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: "25px", borderLeft: `5px solid ${editId ? "#f59e0b" : "#0ea5e9"}` }}>
            <h4 style={{ margin: "0 0 15px 0", color: "#1e293b" }}>{editId ? "Update Student" : "Register New Student"}</h4>
            <form onSubmit={handleSubmitStudent} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle} placeholder="Enter name" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} style={inputStyle} placeholder="Enter username" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>Phone Number</label>
                <input type="number" name="phone" value={formData.phone} onChange={handleInputChange} required style={inputStyle} placeholder="Phone number" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>Password</label>
                <input type="text" name="password" value={formData.password} onChange={handleInputChange} required style={inputStyle} placeholder="Password" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>Batch</label>
                <input type="text" name="batch" value={formData.batch} onChange={handleInputChange} style={inputStyle} placeholder="Batch name/number" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>Assigned Package</label>
                <select name="assignedPackage" value={formData.assignedPackage} onChange={handleInputChange} style={inputStyle}>
                  <option value="Chapterwise 30 set">Chapterwise 30 set</option>
                  <option value="Chapterwise 12 set">Chapterwise 12 set</option>
                  <option value="100 UBT set">100 UBT set</option>
                  <option value="Full Package">Full Package</option>
                </select>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>Expiry Duration</label>
                <select name="expiryDuration" value={formData.expiryDuration} onChange={handleInputChange} style={inputStyle}>
                  <option value="15 Days">15 Days</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <button type="submit" style={{ backgroundColor: editId ? "#f59e0b" : "#16a34a", color: "white", border: "none", padding: "12px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                  {editId ? "Update Student" : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        )}

        <input 
          type="text" 
          placeholder="Search student..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...inputStyle, marginBottom: "20px", backgroundColor: "white" }} 
        />

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>S.N.</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Batch</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>No students found.</td>
                </tr>
              ) : (
                filteredStudents.map((stu, index) => (
                  <tr key={stu.id}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: "bold" }}>{stu.name}</td>
                    <td style={tdStyle}>{stu.username || "-"}</td>
                    <td style={tdStyle}>{stu.phone}</td>
                    <td style={tdStyle}>{stu.batch || "1"}</td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>{stu.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEdit(stu)} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", marginRight: "5px", fontSize: "12px" }}>Edit</button>
                      <button onClick={() => handleDelete(stu.id)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default InstituteStudents;