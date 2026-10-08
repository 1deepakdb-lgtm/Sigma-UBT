'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { performLogout } from "@/lib/clientAuth";

export default function AdminInstitutesPage() {
  const router = useRouter();
  const [institutes, setInstitutes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    examPackage: "Full Set UBT",
    subscription: "1 Year",
    logoUrl: "",
    watermarkText: "",
    newPassword: "",   // admin-initiated password reset for an existing institute
  });

  const loadInstitutes = async () => {
    try {
      const res = await fetch("/api/admin/institutes");
      if (res.ok) {
        const data = await res.json();
        setInstitutes(data.institutes || []);
      } else {
        const saved = JSON.parse(localStorage.getItem("institutes") || "[]");
        setInstitutes(saved);
      }
    } catch (e) {
      console.error("Failed to load institutes:", e);
      const saved = JSON.parse(localStorage.getItem("institutes") || "[]");
      setInstitutes(saved);
    }
  };

  useEffect(() => {
    loadInstitutes();
  }, []);

  const handleLogout = () => {
    performLogout();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (res.ok) {
          const data = await res.json();
          setFormData({ ...formData, logoUrl: data.url });
          return;
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
      // Fallback base64
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, logoUrl: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        const body = {
          id: editId,
          name: formData.name,
          subscription: formData.subscription,
          examPackage: formData.examPackage,
          logoUrl: formData.logoUrl || null,
          watermarkText: formData.watermarkText || null,
        };
        // Only send newPassword if super admin filled it in
        if (formData.newPassword && formData.newPassword.trim()) {
          body.newPassword = formData.newPassword.trim();
        }
        const res = await fetch("/api/admin/institutes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          alert("❌ Error: " + (data.error || "Failed to update institute"));
          setLoading(false);
          return;
        }
        alert("✅ Institute updated successfully!");
      } else {
        const res = await fetch("/api/admin/institutes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            username: formData.username.trim().toLowerCase(),
            password: formData.password,
            subscription: formData.subscription,
            examPackage: formData.examPackage,
            watermarkText: formData.watermarkText || "",
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          alert("❌ Error: " + (errData.error || "Failed to create institute"));
          setLoading(false);
          return;
        }
        alert("✅ Institute created successfully!");
      }
      await loadInstitutes();
      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (inst) => {
    setFormData({
      name: inst.name,
      username: inst.username,
      password: "",
      examPackage: inst.examPackage || "Full Set UBT",
      subscription: inst.subscription || "1 Year",
      logoUrl: inst.logoUrl || "",
      watermarkText: inst.watermarkText || "",
      newPassword: "",
    });
    setEditId(inst.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      password: "",
      examPackage: "Full Set UBT",
      subscription: "1 Year",
      logoUrl: "",
      watermarkText: "",
      newPassword: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (inst) => {
    const confirmed = window.confirm(
      `⚠️ DELETE INSTITUTE\n\nAre you sure you want to permanently delete:\n\n"${inst.name}" (@${inst.username})\n\nThis will remove ALL students, exam results, and data for this institute. This action CANNOT be undone.`
    );
    if (!confirmed) return;

    // Second confirmation for safety
    const doubleCheck = window.confirm(
      `🔴 FINAL CONFIRMATION\n\nType OK to confirm permanent deletion of "${inst.name}".\n\nAll ${inst.studentCount || 0} student(s) and their data will be deleted.`
    );
    if (!doubleCheck) return;

    setDeletingId(inst.id);
    try {
      const res = await fetch(`/api/admin/institutes?id=${inst.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert("❌ Failed to delete: " + (data.error || "Unknown error"));
      } else {
        alert(`✅ Institute "${inst.name}" has been permanently deleted.`);
        await loadInstitutes();
        if (editId === inst.id) resetForm();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
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
  const navLinkStyle = {
    color: "#cbd5e1",
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold"
  };
  const activeNavLinkStyle = { ...navLinkStyle, backgroundColor: "#2563eb", color: "white" };

  const contentAreaStyle = { padding: "30px", maxWidth: "1200px", margin: "0 auto" };
  const cardStyle = {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    marginBottom: "20px",
    border: "1px solid #e2e8f0"
  };
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    borderRadius: "8px",
    overflow: "hidden"
  };
  const thStyle = {
    backgroundColor: "#f8fafc",
    padding: "15px",
    textAlign: "left",
    borderBottom: "2px solid #e2e8f0",
    color: "#475569"
  };
  const tdStyle = { padding: "15px", borderBottom: "1px solid #e2e8f0", color: "#1e293b", verticalAlign: "middle" };
  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #cbd5e1",
    borderRadius: "5px",
    boxSizing: "border-box",
    backgroundColor: "white"
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "Arial, sans-serif" }}>
      <Navbar role="admin" />

      <div style={contentAreaStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#1e293b", margin: 0, fontSize: "22px" }}>Institute Management</h2>
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            style={{
              backgroundColor: showForm ? "#ef4444" : "#16a34a",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {showForm ? "Cancel" : "+ Add New Institute"}
          </button>
        </div>

        {showForm && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>{editId ? "Update Institute" : "Register New Institute"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>
                  Institute Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  placeholder="Enter institute name"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>
                  Username / Login ID
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!!editId}
                  required
                  style={inputStyle}
                  placeholder="e.g. sigma or phone number"
                />
              </div>
              {!editId && (
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editId}
                    style={inputStyle}
                    placeholder="Create password"
                  />
                </div>
              )}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>
                  Assigned Package
                </label>
                <select name="examPackage" value={formData.examPackage} onChange={handleInputChange} style={inputStyle}>
                  <option value="Full Set UBT">Full Set UBT</option>
                  <option value="100 Set UBT">100 Set UBT</option>
                  <option value="50 Set UBT">50 Set UBT</option>
                  <option value="30 Set Chapter UBT">30 Set Chapter UBT</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>
                  Subscription Duration
                </label>
                <select name="subscription" value={formData.subscription} onChange={handleInputChange} style={inputStyle}>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>
                  Logo Upload (Cloud Storage)
                </label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={inputStyle} />
                {formData.logoUrl && (
                  <img src={formData.logoUrl} alt="Logo preview" style={{ height: "40px", marginTop: "5px" }} />
                )}
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>
                  Watermark Text
                </label>
                <input
                  type="text"
                  name="watermarkText"
                  value={formData.watermarkText}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="e.g. institute name shown on exams"
                />
              </div>
              {/* Super Admin Only: Reset institute login password */}
              {editId && (
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#b45309" }}>
                    🔑 Reset Institute Login Password (Super Admin Only — leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, border: "1.5px solid #fbbf24", backgroundColor: "#fffbeb" }}
                    placeholder="Enter new password for this institute (optional)"
                    autoComplete="new-password"
                    minLength={6}
                  />
                  <p style={{ fontSize: "12px", color: "#92400e", marginTop: "4px" }}>
                    ⚠️ Only fill this if you need to reset the institute's login credentials. Min 6 characters.
                  </p>
                </div>
              )}
              <div style={{ gridColumn: "span 2" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "12px",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    width: "100%"
                  }}
                >
                  {loading ? "Processing..." : editId ? "Update Institute" : "Save Institute"}
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
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Total Students</th>
                <th style={thStyle}>Package & Expiry</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>
                    No institutes registered yet.
                  </td>
                </tr>
              ) : (
                institutes.map((inst) => (
                  <tr key={inst.id}>
                    <td style={{ ...tdStyle, fontWeight: "bold" }}>{inst.name}</td>
                    <td style={tdStyle}>{inst.username}</td>
                    <td style={tdStyle}>{inst.studentCount || 0}</td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: "bold", color: "#2563eb" }}>{inst.examPackage}</span>
                      <br />
                      <span style={{ fontSize: "12px", color: inst.status === "Expired" ? "#dc2626" : "#475569" }}>
                        Ends: {inst.expireDate}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          backgroundColor: inst.status === "Active" ? "#dcfce7" : "#fee2e2",
                          color: inst.status === "Active" ? "#166534" : "#991b1b",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}
                      >
                        {inst.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleEdit(inst)}
                        style={{
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          window.open(`/institute?tab=billing&superadmin=true&institute=${encodeURIComponent(inst.name)}`, '_blank');
                        }}
                        style={{
                          backgroundColor: "#0d9488",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                          marginLeft: "6px"
                        }}
                        title="Configure Google Sheet & Drive Cloud Setup for this institute (Super Admin Unrestricted)"
                      >
                        📊 Cloud Setup
                      </button>
                      <button
                        onClick={() => handleDelete(inst)}
                        disabled={deletingId === inst.id}
                        style={{
                          backgroundColor: deletingId === inst.id ? "#fca5a5" : "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: deletingId === inst.id ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                          marginLeft: "6px",
                          transition: "background 0.15s"
                        }}
                        title="Permanently delete this institute and all its data"
                      >
                        {deletingId === inst.id ? "Deleting..." : "🗑️ Delete"}
                      </button>
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
}
