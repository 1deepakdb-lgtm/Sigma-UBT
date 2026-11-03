'use client';

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

// Privacy Masking Helpers for Ambiguous / Self-Signup Guest Users
function maskString(str) {
  if (!str) return "••••••";
  const s = String(str).trim();
  if (s.includes("@")) {
    const [local, domain] = s.split("@");
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local.slice(0, 3)}***@${domain}`;
  }
  if (s.length >= 8) {
    return `${s.slice(0, 2)}******${s.slice(-2)}`;
  }
  if (s.length >= 4) {
    return `${s.slice(0, 1)}****${s.slice(-1)}`;
  }
  return "••••••";
}

function maskName(name) {
  if (!name) return "Guest User";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const w = parts[0];
    return w.length > 3 ? `${w.slice(0, 3)}***` : `${w}***`;
  }
  return parts.map((p, i) => (i === 0 ? `${p.slice(0, 3)}***` : `${p[0]}***`)).join(" ");
}

function isStudentAmbiguous(stu, buyerMap = {}) {
  // If explicitly marked as buyer/purchased, they are a buyer
  if (stu.isBuyer === true || stu.hasPurchased === true) return false;
  if (buyerMap[stu.id] || buyerMap[stu.phone] || buyerMap[stu.username]) return false;

  const batchLower = (stu.batch || "").toLowerCase();
  const pkgLower = (stu.assignedPackage || "").toLowerCase();
  const instLower = (stu.instituteName || stu.institute?.name || "").toLowerCase();

  const isGuest =
    batchLower.includes("free") ||
    batchLower.includes("guest") ||
    pkgLower.includes("free") ||
    instLower.includes("open") ||
    instLower.includes("examjk") ||
    stu.isFreeStudent === true ||
    stu.isSelfSignup === true;

  const hasPaidPkg =
    (pkgLower.includes("chapter") || pkgLower.includes("ubt") || pkgLower.includes("package") || pkgLower.includes("standard")) &&
    !pkgLower.includes("free") &&
    !batchLower.includes("free");

  if (isGuest && !hasPaidPkg) {
    return true;
  }
  return false;
}

function AdminStudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active folder tab: 'buyers' | 'ambiguous' | 'all'
  const initialTab = searchParams.get("tab") || "buyers";
  const [folderTab, setFolderTab] = useState(initialTab === "ambiguous" ? "ambiguous" : "buyers");

  // Institutes & Students states
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstituteFilter, setSelectedInstituteFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("all"); // "all" | "korean" | "japanese" | "both"
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [copiedStudentId, setCopiedStudentId] = useState(null);
  const [copiedAllStudents, setCopiedAllStudents] = useState(false);

  // Upgrade / Sell Product Modal state for Ambiguous Guests
  const [upgradeModalStudent, setUpgradeModalStudent] = useState(null);
  const [upgradePackage, setUpgradePackage] = useState("Full Set UBT");
  const [upgradeDuration, setUpgradeDuration] = useState("1 Month");
  const [upgradeNotes, setUpgradeNotes] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    instituteName: "",
    assignedPackage: "Chapterwise 30 set",
    expiryDuration: "1 Month",
    language: "both"
  });

  // Exam Sets states
  const [examSets, setExamSets] = useState([]);
  const [examPackages, setExamPackages] = useState([]);
  const [selectedPackageFilter, setSelectedPackageFilter] = useState("All");

  const loadData = async () => {
    try {
      // 1. Load institutes
      const savedInst = JSON.parse(localStorage.getItem("institutes") || "[]");
      setInstitutes(savedInst);

      // 2. Load all students across institutes from localStorage
      const allInstStudents = JSON.parse(localStorage.getItem("instituteStudents") || "{}");
      let aggregatedStudents = [];
      for (const [instName, list] of Object.entries(allInstStudents)) {
        if (Array.isArray(list)) {
          list.forEach((s) => {
            aggregatedStudents.push({ ...s, instituteName: s.instituteName || instName });
          });
        }
      }

      // 3. Fetch all backend database users (including self-signup guests)
      try {
        const res = await fetch("/api/institute/students");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.students)) {
            data.students.forEach((dbStu) => {
              const existingIdx = aggregatedStudents.findIndex(
                (s) => s.id === dbStu.id || s.phone === dbStu.phone || s.phone === dbStu.username
              );
              const mapped = {
                id: dbStu.id,
                name: dbStu.name,
                phone: dbStu.phone || dbStu.username,
                username: dbStu.username,
                assignedPackage: dbStu.batch || "Full Set UBT",
                batch: dbStu.batch || "Full Set UBT",
                language: dbStu.language || dbStu.institute?.language || "both",
                instituteName: dbStu.institute?.name || "ExamJK Open Academy",
                status: dbStu.status || "Active",
                createdAt: dbStu.createdAt,
                isFreeStudent:
                  (dbStu.batch || "").toLowerCase().includes("free") ||
                  !dbStu.institute?.name ||
                  dbStu.institute?.name.includes("Open"),
                expiryDate: dbStu.expiryDate || "Active"
              };
              if (existingIdx >= 0) {
                aggregatedStudents[existingIdx] = {
                  ...mapped,
                  ...aggregatedStudents[existingIdx]
                };
              } else {
                aggregatedStudents.push(mapped);
              }
            });
          }
        }
      } catch (err) {
        console.warn("Backend students fetch notice:", err);
      }

      // 4. Check buyer map
      const buyerMap = JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}");
      const mappedList = aggregatedStudents.map((s) => {
        const isMarked = Boolean(buyerMap[s.id] || buyerMap[s.phone] || buyerMap[s.username]);
        if (isMarked) {
          return {
            ...s,
            isBuyer: true,
            hasPurchased: true,
            assignedPackage: buyerMap[s.id]?.package || s.assignedPackage,
            expiryDate: buyerMap[s.id]?.expiryDate || s.expiryDate
          };
        }
        return s;
      });

      setStudents(mappedList);

      // 5. Load packages & exam sets
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
      language: formData.language || "both",
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

      const buyerMap = JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}");
      buyerMap[formData.phone] = { isBuyer: true, package: formData.assignedPackage, expiryDate: calculatedExpiryDate };
      localStorage.setItem("adminBuyerStudentsMap", JSON.stringify(buyerMap));

      if (editId) {
        const updated = currentInstStudents.map((stu) =>
          stu.id === editId || stu.phone === formData.phone
            ? {
                ...stu,
                ...formData,
                id: data.student?.id || stu.id,
                instituteName: targetInst,
                expiryDate: calculatedExpiryDate,
                isBuyer: true
              }
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
          status: "Active",
          isBuyer: true
        };
        allStudents[targetInst] = [
          ...currentInstStudents.filter((s) => s.phone !== formData.phone),
          newStudent
        ];
        alert("Student registered successfully! Added directly to Buyers Folder.");
      }

      localStorage.setItem("instituteStudents", JSON.stringify(allStudents));

      const globalUsers = JSON.parse(localStorage.getItem("users") || "{}");
      globalUsers[formData.phone] = { name: formData.name, password: formData.password || "1234" };
      localStorage.setItem("users", JSON.stringify(globalUsers));

      resetForm();
      loadData();
      setFolderTab("buyers");
    } catch (err) {
      console.error("Save student error:", err);
      alert("Error connecting to server to save student: " + err.message);
    }
  };

  // Upgrade Ambiguous User to Buyer upon Product Purchase
  const handleConfirmUpgrade = async () => {
    if (!upgradeModalStudent) return;
    setIsUpgrading(true);

    const calculatedExpiry = calculateExpiryDate(upgradeDuration);
    const targetInst = upgradeModalStudent.instituteName || "ExamJK Institute";

    try {
      // 1. Update in backend database
      await fetch("/api/institute/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: upgradeModalStudent.id,
          name: upgradeModalStudent.name,
          phone: upgradeModalStudent.phone || upgradeModalStudent.username,
          username: upgradeModalStudent.username || upgradeModalStudent.phone,
          batch: upgradePackage,
          status: "Active",
          instituteName: targetInst
        })
      });

      // 2. Mark in admin buyer map
      const buyerMap = JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}");
      const stuKey = upgradeModalStudent.id || upgradeModalStudent.phone || upgradeModalStudent.username;
      buyerMap[stuKey] = {
        isBuyer: true,
        hasPurchased: true,
        package: upgradePackage,
        expiryDate: calculatedExpiry,
        purchasedAt: new Date().toISOString()
      };
      if (upgradeModalStudent.phone) buyerMap[upgradeModalStudent.phone] = buyerMap[stuKey];
      if (upgradeModalStudent.username) buyerMap[upgradeModalStudent.username] = buyerMap[stuKey];
      localStorage.setItem("adminBuyerStudentsMap", JSON.stringify(buyerMap));

      // 3. Update in local storage instituteStudents
      const allStudents = JSON.parse(localStorage.getItem("instituteStudents") || "{}");
      const instList = allStudents[targetInst] || [];
      const updatedInst = [
        ...instList.filter((s) => s.id !== upgradeModalStudent.id && s.phone !== upgradeModalStudent.phone),
        {
          ...upgradeModalStudent,
          assignedPackage: upgradePackage,
          batch: upgradePackage,
          expiryDate: calculatedExpiry,
          isBuyer: true,
          hasPurchased: true
        }
      ];
      allStudents[targetInst] = updatedInst;
      localStorage.setItem("instituteStudents", JSON.stringify(allStudents));

      alert(`✅ Success! "${upgradeModalStudent.name}" has been upgraded to Buyer with package "${upgradePackage}".\nThey are now included in the Buyers Folder with full details unlocked!`);
      setUpgradeModalStudent(null);
      setUpgradeNotes("");
      await loadData();
      setFolderTab("buyers");
    } catch (err) {
      console.error("Upgrade error:", err);
      alert("Failed to upgrade student: " + err.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      phone: student.phone,
      password: student.password || "",
      instituteName: student.instituteName || "",
      assignedPackage: student.assignedPackage || "Chapterwise 30 set",
      expiryDuration: student.expiryDuration || "1 Month",
      language: student.language || "both"
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
        const target = allStudents[targetInst].find((s) => s.id === id);
        targetPhone = target?.phone || "";
        allStudents[targetInst] = allStudents[targetInst].filter((s) => s.id !== id);
        localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
      }
      try {
        await fetch(
          `/api/institute/students?id=${encodeURIComponent(id || "")}&phone=${encodeURIComponent(targetPhone)}`,
          { method: "DELETE" }
        );
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
      expiryDuration: "1 Month",
      language: "both"
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleCopyStudent = (stu) => {
    const text = `Student ID: ${stu.phone}\nPassword: ${stu.password || "123"}\nName: ${stu.name}\nInstitute: ${stu.instituteName || "ExamJK"}\nPackage: ${stu.assignedPackage}\nExpiry: ${stu.expiryDate}`;
    navigator.clipboard.writeText(text);
    setCopiedStudentId(stu.id);
    setTimeout(() => setCopiedStudentId(null), 2000);
  };

  const handleCopyAllStudents = () => {
    if (displayList.length === 0) return;
    const header = "Name\tInstitute\tPhone\tPackage\tExpiry\tStatus";
    const rows = displayList.map((s) => {
      const isAmb = isStudentAmbiguous(s);
      const name = isAmb ? maskName(s.name) : s.name;
      const phone = isAmb ? maskString(s.phone) : s.phone;
      return `${name}\t${s.instituteName || "-"}\t${phone}\t${s.assignedPackage}\t${s.expiryDate}\t${s.status || "Active"}`;
    });
    const content = [header, ...rows].join("\n");
    navigator.clipboard.writeText(content);
    setCopiedAllStudents(true);
    setTimeout(() => setCopiedAllStudents(false), 2500);
  };

  // Group into Buyers vs Ambiguous Users
  const buyerMapCurrent = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}") : {};
  const allAmbiguousStudents = students.filter((s) => isStudentAmbiguous(s, buyerMapCurrent));
  const allBuyerStudents = students.filter((s) => !isStudentAmbiguous(s, buyerMapCurrent));

  // Determine active list based on folderTab
  const currentFolderList =
    folderTab === "ambiguous"
      ? allAmbiguousStudents
      : folderTab === "buyers"
      ? allBuyerStudents
      : students;

  // Search, Institute and Language Filter
  const displayList = currentFolderList.filter((stu) => {
    const sLang = (stu.language || "korean").toLowerCase();
    const matchesLanguage =
      languageFilter === "all" ||
      (languageFilter === "korean" && (sLang === "korean" || sLang === "both")) ||
      (languageFilter === "japanese" && (sLang === "japanese" || sLang === "both")) ||
      (languageFilter === "both" && sLang === "both");
    const matchesInstitute =
      selectedInstituteFilter === "All" || stu.instituteName === selectedInstituteFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      stu.name?.toLowerCase().includes(q) ||
      stu.phone?.toLowerCase().includes(q) ||
      stu.username?.toLowerCase().includes(q) ||
      stu.assignedPackage?.toLowerCase().includes(q) ||
      stu.instituteName?.toLowerCase().includes(q);
    return matchesLanguage && matchesInstitute && matchesSearch;
  });

  // Filter sets
  const filteredSets =
    selectedPackageFilter === "All"
      ? examSets
      : examSets.filter((s) => s.packageName === selectedPackageFilter);

  // Styles
  const containerStyle = { minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" };
  const contentStyle = { padding: "28px 32px", maxWidth: "1280px", margin: "0 auto" };
  const cardStyle = { backgroundColor: "#ffffff", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "22px", border: "1px solid #e2e8f0" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "12px", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" };
  const thStyle = { backgroundColor: "#0f172a", color: "#ffffff", padding: "12px 16px", textAlign: "left", fontSize: "12.5px", fontWeight: "700", letterSpacing: "0.3px" };
  const tdStyle = { padding: "12px 16px", borderBottom: "1px solid #e2e8f0", color: "#1e293b", fontSize: "13.5px", verticalAlign: "middle" };
  const inputStyle = { width: "100%", padding: "10px 12px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", backgroundColor: "#ffffff", fontSize: "13.5px" };

  return (
    <div style={containerStyle}>
      <Navbar role="admin" />

      <div style={contentStyle}>
        {/* TOP BAR / TITLE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
              Admin Portal · Student Registry
            </div>
            <h1 style={{ color: "#0f172a", margin: 0, fontSize: "24px", fontWeight: "800", letterSpacing: "-0.4px" }}>
              Admin Student Management
            </h1>
            <p style={{ color: "#64748b", margin: "3px 0 0 0", fontSize: "13.5px" }}>
              Manage enrolled buyers and guest self-signups across Korean &amp; Japanese tracks
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {displayList.length > 0 && (
              <button
                type="button"
                onClick={handleCopyAllStudents}
                style={{
                  backgroundColor: copiedAllStudents ? "#15803d" : "#334155",
                  color: "#ffffff",
                  border: "none",
                  padding: "9px 15px",
                  borderRadius: "7px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.15s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}
              >
                <span>{copiedAllStudents ? "✅" : "📋"}</span>
                <span>{copiedAllStudents ? "Folder Data Copied!" : "Copy Folder Data"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              style={{
                backgroundColor: showForm ? "#dc2626" : "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "9px 18px",
                borderRadius: "7px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                transition: "background-color 0.15s ease",
                boxShadow: showForm ? "none" : "0 2px 6px rgba(22, 163, 74, 0.25)"
              }}
            >
              <span>{showForm ? "✕" : "+"}</span>
              <span>{showForm ? "Cancel Form" : "Add New Buyer Student"}</span>
            </button>
          </div>
        </div>

        {/* FOLDER NAVIGATION TABS (EQUAL 3-COLUMN RESPONSIVE GRID) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          {/* Buyers Folder Tab */}
          <button
            type="button"
            onClick={() => setFolderTab("buyers")}
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              border: folderTab === "buyers" ? "2px solid #10b981" : "1.5px solid #cbd5e1",
              backgroundColor: folderTab === "buyers" ? "#ecfdf5" : "#ffffff",
              boxShadow: folderTab === "buyers" ? "0 4px 14px rgba(16, 185, 129, 0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>💼</span>
                <strong style={{ fontSize: "15px", color: folderTab === "buyers" ? "#065f46" : "#0f172a" }}>
                  Buyers Folder (खरिदकर्ता विद्यार्थीहरू)
                </strong>
              </div>
              <span
                style={{
                  backgroundColor: folderTab === "buyers" ? "#10b981" : "#e2e8f0",
                  color: folderTab === "buyers" ? "#ffffff" : "#475569",
                  padding: "4px 12px",
                  borderRadius: "14px",
                  fontWeight: "800",
                  fontSize: "12px",
                  whiteSpace: "nowrap"
                }}
              >
                {allBuyerStudents.length} Students
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: folderTab === "buyers" ? "#047857" : "#64748b", lineHeight: "1.4" }}>
              Enrolled students with paid exam packages. Full details, login credentials &amp; packages visible.
            </p>
          </button>

          {/* Ambiguous / Self-Signup Guest Users Folder Tab */}
          <button
            type="button"
            onClick={() => setFolderTab("ambiguous")}
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              border: folderTab === "ambiguous" ? "2px solid #f59e0b" : "1.5px solid #cbd5e1",
              backgroundColor: folderTab === "ambiguous" ? "#fffbeb" : "#ffffff",
              boxShadow: folderTab === "ambiguous" ? "0 4px 14px rgba(245, 158, 11, 0.18)" : "0 1px 3px rgba(0,0,0,0.04)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>❓</span>
                <strong style={{ fontSize: "15px", color: folderTab === "ambiguous" ? "#92400e" : "#0f172a" }}>
                  Ambiguous Users Folder (अन्योल पाहुनाहरू)
                </strong>
              </div>
              <span
                style={{
                  backgroundColor: folderTab === "ambiguous" ? "#f59e0b" : "#e2e8f0",
                  color: folderTab === "ambiguous" ? "#ffffff" : "#475569",
                  padding: "4px 12px",
                  borderRadius: "14px",
                  fontWeight: "800",
                  fontSize: "12px",
                  whiteSpace: "nowrap"
                }}
              >
                {allAmbiguousStudents.length} Guests
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: folderTab === "ambiguous" ? "#b45309" : "#64748b", lineHeight: "1.4" }}>
              Self-registered guests via Sign Up button. Full details masked until they buy a package via Super Admin.
            </p>
          </button>

          {/* All Users Folder Tab */}
          <button
            type="button"
            onClick={() => setFolderTab("all")}
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              border: folderTab === "all" ? "2px solid #2563eb" : "1.5px solid #cbd5e1",
              backgroundColor: folderTab === "all" ? "#eff6ff" : "#ffffff",
              boxShadow: folderTab === "all" ? "0 4px 14px rgba(37, 99, 235, 0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>📁</span>
                <strong style={{ fontSize: "15px", color: folderTab === "all" ? "#1e40af" : "#0f172a" }}>
                  All Users
                </strong>
              </div>
              <span
                style={{
                  backgroundColor: folderTab === "all" ? "#2563eb" : "#e2e8f0",
                  color: folderTab === "all" ? "#ffffff" : "#475569",
                  padding: "4px 12px",
                  borderRadius: "14px",
                  fontWeight: "800",
                  fontSize: "12px",
                  whiteSpace: "nowrap"
                }}
              >
                {students.length} Total
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: folderTab === "all" ? "#1d4ed8" : "#64748b", lineHeight: "1.4" }}>
              Unified student directory of all enrolled buyers and self-signup guests combined.
            </p>
          </button>
        </div>

        {/* FOLDER NOTICE BANNER */}
        {folderTab === "ambiguous" && (
          <div
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "10px",
              padding: "14px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
              boxShadow: "0 1px 3px rgba(245, 158, 11, 0.08)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "280px" }}>
              <span style={{ fontSize: "20px" }}>🔒</span>
              <div style={{ fontSize: "13px", color: "#92400e", lineHeight: "1.5" }}>
                <strong>Guest Privacy Protection Active:</strong> These {allAmbiguousStudents.length} users came by themselves using the self-signup button. Full personal details (phone, email, login password) are masked to protect user privacy. When they buy a product or are upgraded by Super Admin, they will move into the <strong>Buyers Folder</strong> with full details unlocked.
              </div>
            </div>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#b45309", backgroundColor: "#fef3c7", border: "1px solid #fde68a", padding: "4px 12px", borderRadius: "12px", whiteSpace: "nowrap" }}>
              🔒 Privacy Protected
            </span>
          </div>
        )}

        {folderTab === "buyers" && (
          <div
            style={{
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
              boxShadow: "0 1px 3px rgba(16, 185, 129, 0.08)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>💼</span>
              <div style={{ fontSize: "13px", color: "#065f46", lineHeight: "1.5" }}>
                <strong>Buyers Directory Active:</strong> Displaying {allBuyerStudents.length} verified purchasing students enrolled by institutes or upgraded via product purchase. Full contact details and package controls are fully accessible below.
              </div>
            </div>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#047857", backgroundColor: "#d1fae5", border: "1px solid #a7f3d0", padding: "4px 10px", borderRadius: "12px", whiteSpace: "nowrap" }}>
              Verified Buyers
            </span>
          </div>
        )}

        {folderTab === "all" && (
          <div
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
              boxShadow: "0 1px 3px rgba(37, 99, 235, 0.08)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>📁</span>
              <div style={{ fontSize: "13px", color: "#1e40af", lineHeight: "1.5" }}>
                <strong>All Users Directory:</strong> Showing complete roster of {students.length} accounts ({allBuyerStudents.length} verified buyers + {allAmbiguousStudents.length} self-signup guests).
              </div>
            </div>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#1d4ed8", backgroundColor: "#dbeafe", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "12px", whiteSpace: "nowrap" }}>
              Total: {students.length}
            </span>
          </div>
        )}

        {/* ADD / EDIT STUDENT FORM */}
        {showForm && (
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 15px 0", color: "#1e293b" }}>
              {editId ? "Update Student Details" : "Register New Buyer Student"}
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
                  <option value="Full Set UBT">Full Set UBT</option>
                  <option value="Chapterwise 30 set">Chapterwise 30 set</option>
                  <option value="Chapterwise 12 set">Chapterwise 12 set</option>
                  <option value="100 UBT set">100 UBT set</option>
                  <option value="Full Package">Full Package</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#334155" }}>
                  Select Study Language:
                </label>
                <select
                  name="language"
                  value={formData.language || "both"}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyle,
                    fontWeight: "700",
                    backgroundColor: "#f8fafc",
                    border: "1.5px solid #cbd5e1"
                  }}
                >
                  <option value="korean">🇰🇷 Korean</option>
                  <option value="japanese">🇯🇵 Japanese</option>
                  <option value="both">🌐 Both</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>
                  Package Expiry Duration
                </label>
                <select name="expiryDuration" value={formData.expiryDuration} onChange={handleInputChange} style={inputStyle}>
                  <option value="15 Days">15 Days</option>
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: editId ? "#f59e0b" : "#16a34a",
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
                  {editId ? "Update Student" : "Save Student into Buyers Folder"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SEARCH & INSTITUTE FILTER */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
            <input
              type="text"
              placeholder={folderTab === "ambiguous" ? "🔍 Search ambiguous guest name or institute..." : "🔍 Search student name, phone, package..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0, maxWidth: "340px" }}
            />
            <select
              value={selectedInstituteFilter}
              onChange={(e) => setSelectedInstituteFilter(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0, width: "auto", minWidth: "170px" }}
            >
              <option value="All">All Institutes</option>
              {institutes.map((inst, idx) => (
                <option key={idx} value={inst.name}>{inst.name}</option>
              ))}
            </select>

            {/* Super Admin Track Filter: All, Korean, Japanese, Both */}
            <div style={{ display: "inline-flex", gap: "4px", backgroundColor: "#f1f5f9", padding: "3px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              {[
                { key: "all", label: "🌐 All Tracks" },
                { key: "korean", label: "🇰🇷 Korean" },
                { key: "japanese", label: "🇯🇵 Japanese" },
                { key: "both", label: "🌐 Both" }
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setLanguageFilter(opt.key)}
                  style={{
                    backgroundColor: languageFilter === opt.key ? (opt.key === "japanese" ? "#9333ea" : opt.key === "korean" ? "#2563eb" : "#0f172a") : "transparent",
                    color: languageFilter === opt.key ? "#ffffff" : "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 11px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "bold" }}>
            Showing {displayList.length} of {currentFolderList.length} in this folder
          </div>
        </div>

        {/* STUDENTS TABLE */}
        <div style={cardStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ ...thStyle, borderTopLeftRadius: "8px" }}>Student Name</th>
                <th style={thStyle}>Source / Institute</th>
                <th style={thStyle}>Phone (Login ID)</th>
                <th style={thStyle}>Study Language</th>
                <th style={thStyle}>Package &amp; Expiry</th>
                <th style={thStyle}>Folder Status</th>
                <th style={{ ...thStyle, borderTopRightRadius: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8", padding: "40px" }}>
                    {folderTab === "ambiguous"
                      ? "No ambiguous self-signup guests found. All registered students are verified buyers!"
                      : "No students registered yet in this folder."}
                  </td>
                </tr>
              ) : (
                displayList.map((stu) => {
                  const isAmb = isStudentAmbiguous(stu, buyerMapCurrent);

                  return (
                    <tr key={stu.id} style={{ backgroundColor: isAmb ? "#fffdf5" : "#ffffff" }}>
                      {/* Name Column */}
                      <td style={{ ...tdStyle, fontWeight: "bold" }}>
                        {isAmb ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>👤</span>
                            <span>{maskName(stu.name)}</span>
                          </div>
                        ) : (
                          stu.name
                        )}
                      </td>

                      {/* Institute Column */}
                      <td style={tdStyle}>
                        <span
                          style={{
                            backgroundColor: isAmb ? "#fef3c7" : "#f1f5f9",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: isAmb ? "#92400e" : "#334155",
                            fontWeight: "bold"
                          }}
                        >
                          {isAmb ? "Self-Signup Guest" : (stu.instituteName || "ExamJK Education")}
                        </span>
                      </td>

                      {/* Phone Column - Masked for Ambiguous Users */}
                      <td style={tdStyle}>
                        {isAmb ? (
                          <span style={{ color: "#b45309", fontFamily: "monospace", fontWeight: "700" }}>
                            🔒 {maskString(stu.phone || stu.username)}
                          </span>
                        ) : (
                          <span style={{ fontFamily: "monospace" }}>{stu.phone}</span>
                        )}
                      </td>

                      {/* Study Language Column */}
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "800",
                          backgroundColor: stu.language === "japanese" ? "#f3e8ff" : stu.language === "korean" ? "#eff6ff" : "#f1f5f9",
                          color: stu.language === "japanese" ? "#7e22ce" : stu.language === "korean" ? "#1d4ed8" : "#334155",
                          border: `1px solid ${stu.language === "japanese" ? "#d8b4fe" : stu.language === "korean" ? "#bfdbfe" : "#cbd5e1"}`
                        }}>
                          {stu.language === "japanese" ? "🇯🇵 Japanese" : stu.language === "korean" ? "🇰🇷 Korean" : "🌐 Both"}
                        </span>
                      </td>

                      {/* Package Column */}
                      <td style={tdStyle}>
                        {isAmb ? (
                          <div>
                            <span style={{ fontWeight: "700", color: "#f59e0b" }}>No Package Purchased</span>
                            <br />
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Free Access Student</span>
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontWeight: "bold", color: "#16a34a" }}>
                              {stu.assignedPackage || "Full Set UBT"}
                            </span>
                            <br />
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              Ends: {stu.expiryDate || "Active"}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status Column */}
                      <td style={tdStyle}>
                        {isAmb ? (
                          <span
                            style={{
                              backgroundColor: "#fef3c7",
                              color: "#b45309",
                              border: "1px solid #fde68a",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "11.5px",
                              fontWeight: "800"
                            }}
                          >
                            ❓ Ambiguous Guest
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: "#dcfce7",
                              color: "#166534",
                              border: "1px solid #bbf7d0",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "11.5px",
                              fontWeight: "800"
                            }}
                          >
                            ✅ Verified Buyer
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td style={tdStyle}>
                        {isAmb ? (
                          /* Ambiguous user can only be upgraded to Buyer by Super Admin purchasing a product */
                          <button
                            type="button"
                            onClick={() => {
                              setUpgradeModalStudent(stu);
                              setUpgradePackage("Full Set UBT");
                              setUpgradeDuration("1 Month");
                            }}
                            title="Super Admin sell product or assign package to include in Buyers Folder"
                            style={{
                              backgroundColor: "#2563eb",
                              color: "white",
                              border: "none",
                              padding: "7px 14px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "bold",
                              boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              whiteSpace: "nowrap"
                            }}
                          >
                            <span>💳</span>
                            <span>Sell Product &rarr; Move to Buyers</span>
                          </button>
                        ) : (
                          /* Full actions for verified Buyers */
                          <div style={{ display: "flex", gap: "6px", flexWrap: "nowrap" }}>
                            <button
                              onClick={() => handleCopyStudent(stu)}
                              title="Copy Student Login Details"
                              style={{
                                backgroundColor: copiedStudentId === stu.id ? "#16a34a" : "#475569",
                                color: "white",
                                border: "none",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "bold",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {copiedStudentId === stu.id ? "✅ Copied" : "📋 Copy"}
                            </button>
                            <button
                              onClick={() => handleEdit(stu)}
                              style={{
                                backgroundColor: "#2563eb",
                                color: "white",
                                border: "none",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                whiteSpace: "nowrap"
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(stu.id, stu.instituteName)}
                              style={{
                                backgroundColor: "#ef4444",
                                color: "white",
                                border: "none",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                whiteSpace: "nowrap"
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* UBT EXAM SETS (UNDER INSIDE MANAGE STUDENTS FOR ADMIN) */}
          <div style={{ marginTop: "45px", borderTop: "2px solid #e2e8f0", paddingTop: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ color: "#1e3a8a", margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📝</span> UBT Exam Sets &amp; Packages Overview
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

      {/* MODAL: SUPER ADMIN SELL PRODUCT / UPGRADE GUEST TO BUYER */}
      {upgradeModalStudent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              border: "1px solid #e2e8f0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                💳
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: "800" }}>
                  Sell Product to Guest
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Confirm purchase to unlock student details and move to Buyers Folder
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "18px" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Selected Guest:</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b", marginTop: "2px" }}>
                {maskName(upgradeModalStudent.name)} ({maskString(upgradeModalStudent.phone || upgradeModalStudent.username)})
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                Select Purchased Product Package:
              </label>
              <select
                value={upgradePackage}
                onChange={(e) => setUpgradePackage(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "14px" }}
              >
                <option value="Full Set UBT">Full Set UBT (40 Question Exam Simulator)</option>
                <option value="Chapterwise 30 set">Chapterwise 30 set</option>
                <option value="Chapterwise 12 set">Chapterwise 12 set</option>
                <option value="100 UBT set">100 UBT Mega Set</option>
                <option value="Full Package">Full Package (Complete Study + Exam)</option>
              </select>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                Package Expiry Duration:
              </label>
              <select
                value={upgradeDuration}
                onChange={(e) => setUpgradeDuration(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "14px" }}
              >
                <option value="15 Days">15 Days</option>
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
                <option value="3 Months">3 Months</option>
                <option value="Lifetime">Lifetime Access</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                Payment Note / Order Reference (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Paid Rs. 1500 via eSewa / Cash"
                value={upgradeNotes}
                onChange={(e) => setUpgradeNotes(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setUpgradeModalStudent(null)}
                disabled={isUpgrading}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpgrade}
                disabled={isUpgrading}
                style={{
                  flex: 2,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  fontWeight: "800",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)"
                }}
              >
                {isUpgrading ? "Upgrading..." : "✅ Confirm Purchase & Move to Buyers"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminStudentsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Student Folders...</div>}>
      <AdminStudentsContent />
    </Suspense>
  );
}
