'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AdminStudentsPage() {
  const router = useRouter();

  // Institutes & Students states
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstituteFilter, setSelectedInstituteFilter] = useState("All");
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [copiedStudentId, setCopiedStudentId] = useState(null);
  const [copiedAllStudents, setCopiedAllStudents] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    instituteName: "",
    assignedPackage: "Chapterwise 30 set",
    expiryDuration: "1 Month"
  });

  // Exam Sets states
  const [examSets, setExamSets] = useState([]);
  const [examPackages, setExamPackages] = useState([]);
  const [selectedPackageFilter, setSelectedPackageFilter] = useState("All");

  const loadData = () => {
    try {
      // Load institutes
      const savedInst = JSON.parse(localStorage.getItem("institutes") || "[]");
      setInstitutes(savedInst);

      // Load all students across institutes
      const allInstStudents = JSON.parse(localStorage.getItem("instituteStudents") || "{}");
      let aggregatedStudents = [];
      for (const [instName, list] of Object.entries(allInstStudents)) {
        if (Array.isArray(list)) {
          list.forEach((s) => {
            aggregatedStudents.push({ ...s, instituteName: s.instituteName || instName });
          });
        }
      }
      setStudents(aggregatedStudents);

      // Load packages & exam sets
      const savedPackages = JSON.parse(localStorage.getItem("examPackages") || "[]");
      const savedSets = JSON.parse(localStorage.getItem("examSets") || "[]");
      setExamPackages(savedPackages);
      setExamSets(savedSets);

      if (savedInst.length > 0 && !formData.instituteName) {
        setFormData((prev) => ({ ...prev, instituteName: savedInst[0].name }));
      }
    } catch (e) {
      console.error("Failed to load admin students data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateExpiryDate = (duration) => {
    if (duration === "Lifetime") return "Lifetime";
    const date = new Date();
    if (duration === "15 Days") date.setDate(date.getDate() + 15);
    else if (duration === "1 Month") date.setMonth(date.getMonth() + 1);
    else if (duration === "2 Months") date.setMonth(date.getMonth() + 2);
    else if (duration === "3 Months") date.setMonth(date.getMonth() + 3);
    return date.toISOString().split("T")[0];
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    const calculatedExpiryDate = calculateExpiryDate(formData.expiryDuration);
    const targetInst = formData.instituteName || (institutes[0]?.name || "Language Institute");

    const allStudents = JSON.parse(localStorage.getItem("instituteStudents") || "{}");
    const currentInstStudents = allStudents[targetInst] || [];

    const studentPayload = {
      id: editId || undefined,
      name: formData.name.trim(),
      username: formData.phone.trim(),
      phone: formData.phone.trim(),
      password: (formData.password || "1234").trim(),
      batch: formData.assignedPackage || "Full Set UBT",
      status: "Active",
      instituteName: targetInst
    };

    try {
      const res = await fetch("/api/institute/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentPayload)
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save student in database");
        return;
      }

      if (editId) {
        const updated = currentInstStudents.map((stu) =>
          stu.id === editId || stu.phone === formData.phone
            ? { ...stu, ...formData, id: data.student?.id || stu.id, instituteName: targetInst, expiryDate: calculatedExpiryDate }
            : stu
        );
        allStudents[targetInst] = updated;
        alert("Student updated successfully in database!");
      } else {
        const newStudent = {
          id: data.student?.id || Date.now(),
          ...formData,
          instituteName: targetInst,
          expiryDate: calculatedExpiryDate,
          status: "Active"
        };
        allStudents[targetInst] = [...currentInstStudents.filter(s => s.phone !== formData.phone), newStudent];
        alert("Student registered successfully! They can log in with Phone: " + formData.phone + " and Password: " + (formData.password || "1234"));
      }

      localStorage.setItem("instituteStudents", JSON.stringify(allStudents));

      const globalUsers = JSON.parse(localStorage.getItem("users") || "{}");
      globalUsers[formData.phone] = { name: formData.name, password: formData.password || "1234" };
      localStorage.setItem("users", JSON.stringify(globalUsers));

      resetForm();
      loadData();
    } catch (err) {
      console.error("Save student error:", err);
      alert("Error connecting to server to save student: " + err.message);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      phone: student.phone,
      password: student.password || "",
      instituteName: student.instituteName || "",
      assignedPackage: student.assignedPackage || "Chapterwise 30 set",
      expiryDuration: student.expiryDuration || "1 Month"
    });
    setEditId(student.id);
    setShowForm(true);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleDelete = async (id, instName) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const allStudents = JSON.parse(localStorage.getItem("instituteStudents") || "{}");
      const targetInst = instName || Object.keys(allStudents)[0];
      let targetPhone = "";
      if (allStudents[targetInst]) {
        const target = allStudents[targetInst].find(s => s.id === id);
        targetPhone = target?.phone || '';
        allStudents[targetInst] = allStudents[targetInst].filter((s) => s.id !== id);
        localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
      }
      try {
        await fetch(`/api/institute/students?id=${encodeURIComponent(id || '')}&phone=${encodeURIComponent(targetPhone)}`, {
          method: "DELETE"
        });
      } catch (e) {
        console.warn("Delete student API notice:", e);
      }
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      password: "",
      instituteName: institutes[0]?.name || "",
      assignedPackage: "Chapterwise 30 set",
      expiryDuration: "1 Month"
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleCopyStudent = (stu) => {
    const text = `Student ID: ${stu.phone}\nPassword: ${stu.password || "123"}\nName: ${stu.name}\nInstitute: ${stu.instituteName || "Sigma"}\nPackage: ${stu.assignedPackage}\nExpiry: ${stu.expiryDate}`;
    navigator.clipboard.writeText(text);
    setCopiedStudentId(stu.id);
    setTimeout(() => setCopiedStudentId(null), 2000);
  };

  const handleCopyAllStudents = () => {
    if (filteredStudents.length === 0) return;
    const header = "Name\tInstitute\tPhone\tPackage\tExpiry\tStatus";
    const rows = filteredStudents.map((s) =>
      `${s.name}\t${s.instituteName || "-"}\t${s.phone}\t${s.assignedPackage}\t${s.expiryDate}\t${s.status || "Active"}`
    );
    const content = [header, ...rows].join("\n");
    navigator.clipboard.writeText(content);
    setCopiedAllStudents(true);
    setTimeout(() => setCopiedAllStudents(false), 2500);
  };

  // Filter students
  const filteredStudents = students.filter((stu) => {
    const matchesInstitute = selectedInstituteFilter === "All" || stu.instituteName === selectedInstituteFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      stu.name?.toLowerCase().includes(q) ||
      stu.phone?.toLowerCase().includes(q) ||
      stu.assignedPackage?.toLowerCase().includes(q) ||
      stu.instituteName?.toLowerCase().includes(q);
    return matchesInstitute && matchesSearch;
  });

  // Filter sets
  const filteredSets = selectedPackageFilter === "All"
    ? examSets
    : examSets.filter((s) => s.packageName === selectedPackageFilter);

  // Styles
  const containerStyle = { minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" };
  const contentStyle = { padding: "30px", maxWidth: "1200px", margin: "0 auto" };
  const cardStyle = { backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: "25px", border: "1px solid #e2e8f0" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "15px", backgroundColor: "white", borderRadius: "8px", overflow: "hidden" };
  const thStyle = { backgroundColor: "#f8fafc", color: "#475569", padding: "14px 16px", textAlign: "left", fontSize: "13px", fontWeight: "700", borderBottom: "2px solid #e2e8f0" };
  const tdStyle = { padding: "12px 15px", borderBottom: "1px solid #e2e8f0", color: "#1e293b", fontSize: "14px" };
  const inputStyle = { width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", backgroundColor: "white" };

  return (
    <div style={containerStyle}>
      <Navbar role="admin" />

      <div style={contentStyle}>
        {/* TOP BAR / TITLE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ color: "#1e293b", margin: 0, fontSize: "22px" }}>Admin Student Management</h2>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
              Manage registered students across institutes and review assigned UBT exam sets
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {filteredStudents.length > 0 && (
              <button
                onClick={handleCopyAllStudents}
                style={{
                  backgroundColor: copiedAllStudents ? "#16a34a" : "#475569",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>{copiedAllStudents ? "✅" : "📋"}</span>
                <span>{copiedAllStudents ? "All Copied!" : "Copy All Students Data"}</span>
              </button>
            )}
            <button
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              style={{
                backgroundColor: showForm ? "#ef4444" : "#16a34a",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px"
              }}
            >
              {showForm ? "Cancel" : "+ Add New Student"}
            </button>
          </div>
        </div>

        {/* ADD / EDIT STUDENT FORM */}
        {showForm && (
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 15px 0", color: "#1e293b" }}>
              {editId ? "Update Student Details" : "Register New Student"}
            </h3>
            <form onSubmit={handleSubmitStudent} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>
                  Institute
                </label>
                <select name="instituteName" value={formData.instituteName} onChange={handleInputChange} style={inputStyle} required>
                  {institutes.length === 0 ? (
                    <option value="Language Institute">Language Institute</option>
                  ) : (
                    institutes.map((inst, idx) => (
                      <option key={idx} value={inst.name}>{inst.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>
                  Student Full Name
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle} placeholder="Enter full name" />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>
                  Phone Number (Login ID)
                </label>
                <input type="number" name="phone" value={formData.phone} onChange={handleInputChange} required style={inputStyle} placeholder="Enter phone number" />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>
                  Password
                </label>
                <input type="text" name="password" value={formData.password} onChange={handleInputChange} required style={inputStyle} placeholder="Create password" />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>
                  Assigned Package
                </label>
                <select name="assignedPackage" value={formData.assignedPackage} onChange={handleInputChange} style={inputStyle}>
                  <option value="Chapterwise 30 set">Chapterwise 30 set</option>
                  <option value="Chapterwise 12 set">Chapterwise 12 set</option>
                  <option value="100 UBT set">100 UBT set</option>
                  <option value="Full Package">Full Package</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>
                  Package Expiry Duration
                </label>
                <select name="expiryDuration" value={formData.expiryDuration} onChange={handleInputChange} style={inputStyle}>
                  <option value="15 Days">15 Days</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: editId ? "#f59e0b" : "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    width: "100%",
                    fontSize: "14px"
                  }}
                >
                  {editId ? "Update Student" : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SEARCH & INSTITUTE FILTER */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
            <input
              type="text"
              placeholder="🔍 Search student name, phone, package, institute..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0, maxWidth: "380px" }}
            />
            <select
              value={selectedInstituteFilter}
              onChange={(e) => setSelectedInstituteFilter(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0, width: "auto", minWidth: "180px" }}
            >
              <option value="All">All Institutes</option>
              {institutes.map((inst, idx) => (
                <option key={idx} value={inst.name}>{inst.name}</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "bold" }}>
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>

        {/* STUDENTS TABLE */}
        <div style={cardStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ ...thStyle, borderTopLeftRadius: "8px" }}>Student Name</th>
                <th style={thStyle}>Institute</th>
                <th style={thStyle}>Phone (Login ID)</th>
                <th style={thStyle}>Package & Expiry</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, borderTopRightRadius: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8", padding: "30px" }}>
                    No students registered yet matching criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu.id}>
                    <td style={{ ...tdStyle, fontWeight: "bold" }}>{stu.name}</td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", color: "#334155", fontWeight: "bold" }}>
                        {stu.instituteName || "Sigma Education"}
                      </span>
                    </td>
                    <td style={tdStyle}>{stu.phone}</td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: "bold", color: "#2563eb" }}>{stu.assignedPackage}</span>
                      <br />
                      <span style={{ fontSize: "12px", color: "#ef4444" }}>Ends: {stu.expiryDate}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                        {stu.status || "Active"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleCopyStudent(stu)}
                        title="Copy Student Login Details"
                        style={{
                          backgroundColor: copiedStudentId === stu.id ? "#16a34a" : "#475569",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          marginRight: "5px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}
                      >
                        {copiedStudentId === stu.id ? "✅ Copied" : "📋 Copy"}
                      </button>
                      <button onClick={() => handleEdit(stu)} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", marginRight: "5px", cursor: "pointer", fontSize: "12px" }}>Edit</button>
                      <button onClick={() => handleDelete(stu.id, stu.instituteName)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* UBT EXAM SETS (UNDER INSIDE MANAGE STUDENTS FOR ADMIN) */}
          <div style={{ marginTop: "45px", borderTop: "2px solid #e2e8f0", paddingTop: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ color: "#1e3a8a", margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📝</span> UBT Exam Sets & Packages Overview
                </h3>
                <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
                  Browse and test all active UBT exam sets available across institutes and students
                </p>
              </div>
              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "bold" }}>
                Total Sets: {filteredSets.length}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", marginTop: "15px" }}>
              <button
                onClick={() => setSelectedPackageFilter("All")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: selectedPackageFilter === "All" ? "#1e3a8a" : "white",
                  color: selectedPackageFilter === "All" ? "white" : "#1e3a8a",
                  border: "1px solid #1e3a8a",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                All Sets
              </button>
              {examPackages.map((pkg, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPackageFilter(pkg.name)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: selectedPackageFilter === pkg.name ? "#1e3a8a" : "white",
                    color: selectedPackageFilter === pkg.name ? "white" : "#1e3a8a",
                    border: "1px solid #1e3a8a",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  {pkg.name}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
              {filteredSets.length === 0 ? (
                <p style={{ color: "#64748b", gridColumn: "1 / -1", textAlign: "center", padding: "30px", background: "white", borderRadius: "8px" }}>
                  No exam sets available.
                </p>
              ) : (
                filteredSets.map((set) => (
                  <div
                    key={set.id}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      border: "1px solid #e2e8f0",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#475569", background: "#cbd5e1", padding: "2px 6px", borderRadius: "4px" }}>
                        {set.packageName || "UBT-TEST"}
                      </span>
                      <h4 style={{ margin: "10px 0", fontSize: "16px", color: "#1e293b" }}>{set.name}</h4>
                    </div>
                    <div style={{ marginTop: "15px" }}>
                      <button
                        onClick={() => router.push(`/institute/exam-preview/${set.id}`)}
                        style={{
                          width: "100%",
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          padding: "9px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        PREVIEW EXAM
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
