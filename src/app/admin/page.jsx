'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { performLogout } from "@/lib/clientAuth";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [totalInstitutes, setTotalInstitutes] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalBuyers, setTotalBuyers] = useState(0);
  const [totalAmbiguous, setTotalAmbiguous] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    // Fetch live backend metrics
    async function loadStats() {
      try {
        const instRes = await fetch("/api/admin/institutes");
        if (instRes.ok) {
          const instData = await instRes.json();
          setTotalInstitutes(instData.institutes?.length || 0);
          const studentsSum = (instData.institutes || []).reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
          setTotalStudents(studentsSum);
        } else {
          const localInst = JSON.parse(localStorage.getItem("institutes") || "[]");
          setTotalInstitutes(localInst.length);
        }

        // Fetch students and separate Buyers vs Ambiguous Users
        try {
          const stuRes = await fetch("/api/institute/students");
          let allStuList = [];
          if (stuRes.ok) {
            const stuData = await stuRes.json();
            allStuList = stuData.students || [];
          } else {
            const allInstStudents = JSON.parse(localStorage.getItem("instituteStudents") || "{}");
            for (const list of Object.values(allInstStudents)) {
              if (Array.isArray(list)) allStuList.push(...list);
            }
          }
          const buyerMap = JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}");
          let bCount = 0;
          let aCount = 0;
          allStuList.forEach((s) => {
            const isMarkedBuyer = Boolean(buyerMap[s.id] || buyerMap[s.phone] || buyerMap[s.username]);
            const batchLower = (s.batch || "").toLowerCase();
            const pkgLower = (s.assignedPackage || "").toLowerCase();
            const instLower = (s.instituteName || s.institute?.name || "").toLowerCase();

            const isGuest =
              batchLower.includes("free") ||
              batchLower.includes("guest") ||
              pkgLower.includes("free") ||
              instLower.includes("open") ||
              instLower.includes("examjk") ||
              s.isFreeStudent === true;

            const hasPaidPkg =
              (pkgLower.includes("chapter") || pkgLower.includes("ubt") || pkgLower.includes("package") || pkgLower.includes("standard")) &&
              !pkgLower.includes("free") &&
              !batchLower.includes("free");

            if (!isMarkedBuyer && isGuest && !hasPaidPkg) {
              aCount++;
            } else {
              bCount++;
            }
          });
          setTotalBuyers(bCount);
          setTotalAmbiguous(aCount);
          if (allStuList.length > 0) setTotalStudents(allStuList.length);
        } catch (e) {
          console.warn("Failed to load student breakdown:", e);
        }

        const qRes = await fetch("/api/admin/questions");
        if (qRes.ok) {
          const qData = await qRes.json();
          setTotalQuestions(qData.questions?.length || 0);
        } else {
          const localQ = JSON.parse(localStorage.getItem("questionBank") || "[]");
          setTotalQuestions(localQ.length);
        }
      } catch (e) {
        console.error("Failed to load admin stats:", e);
      }
    }
    loadStats();
  }, []);

  const handleLogout = () => {
    performLogout();
  };

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "Arial, sans-serif",
    position: "relative"
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
  const cardContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  };
  const cardStyle = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    borderLeft: "5px solid #2563eb"
  };

  return (
    <div style={containerStyle}>
      <Navbar role="admin" />

      {/* MAIN CONTENT AREA */}
      <div style={contentAreaStyle}>
        <h2 style={{ color: "#1e293b", marginTop: "10px", fontSize: "22px" }}>Welcome to Sigma Education</h2>

        <div style={cardContainerStyle}>
          <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #3b82f6, #2563eb)", color: "white", borderLeft: "none" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#f1f5f9", fontSize: "12px", textTransform: "uppercase", fontWeight: "700" }}>Total Institutes</h4>
            <p style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#ffffff" }}>{totalInstitutes}</p>
          </div>

          <Link
            href="/admin/students?tab=buyers"
            className="dynamic-card"
            style={{ ...cardStyle, background: "linear-gradient(145deg, #10b981, #059669)", color: "white", borderLeft: "none", textDecoration: "none", cursor: "pointer", display: "block" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h4 style={{ margin: 0, color: "#f1f5f9", fontSize: "12px", textTransform: "uppercase", fontWeight: "700" }}>💼 Buyers (Purchased)</h4>
              <span style={{ fontSize: "10px", backgroundColor: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>View Folder →</span>
            </div>
            <p style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#ffffff" }}>{totalBuyers}</p>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", display: "block", marginTop: "6px" }}>Enrolled / purchased package students</span>
          </Link>

          <Link
            href="/admin/students?tab=ambiguous"
            className="dynamic-card"
            style={{ ...cardStyle, background: "linear-gradient(145deg, #f59e0b, #d97706)", color: "white", borderLeft: "none", textDecoration: "none", cursor: "pointer", display: "block" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h4 style={{ margin: 0, color: "#f1f5f9", fontSize: "12px", textTransform: "uppercase", fontWeight: "700" }}>❓ Ambiguous Users</h4>
              <span style={{ fontSize: "10px", backgroundColor: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>View Folder →</span>
            </div>
            <p style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#ffffff" }}>{totalAmbiguous}</p>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", display: "block", marginTop: "6px" }}>Self-registered guests (Details masked)</span>
          </Link>

          <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #6366f1, #4f46e5)", color: "white", borderLeft: "none" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#f1f5f9", fontSize: "12px", textTransform: "uppercase", fontWeight: "700" }}>Total Questions</h4>
            <p style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#ffffff" }}>{totalQuestions}</p>
          </div>
        </div>

        {/* EXAM SETS & QUESTIONS QUICK ACTION SHORTCUTS */}
        <div style={{ marginTop: "28px", marginBottom: "10px" }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: "18px", color: "#1e3a8a", fontWeight: "700" }}>
            ⚡ Exam Sets & Questions Management
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px" }}>
            <Link
              href="/admin/questions?tab=ubtSets"
              style={{
                backgroundColor: "#ffffff",
                padding: "18px",
                borderRadius: "10px",
                border: "1.5px solid #bfdbfe",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                textDecoration: "none",
                display: "block",
                transition: "transform 0.15s ease, box-shadow 0.15s ease"
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>🎯</div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#1e3a8a", fontWeight: "700" }}>UBT Sets</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Create UBT exam sets (20 Reading + 20 Listening)</p>
            </Link>

            <Link
              href="/admin/questions?tab=chapterSets"
              style={{
                backgroundColor: "#ffffff",
                padding: "18px",
                borderRadius: "10px",
                border: "1.5px solid #a7f3d0",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                textDecoration: "none",
                display: "block",
                transition: "transform 0.15s ease, box-shadow 0.15s ease"
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>📚</div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#065f46", fontWeight: "700" }}>Chapter Wise Sets</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Create textbook chapter-wise test sets</p>
            </Link>

            <Link
              href="/admin/questions?tab=uploadQuestions"
              style={{
                backgroundColor: "#ffffff",
                padding: "18px",
                borderRadius: "10px",
                border: "1.5px solid #fed7aa",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                textDecoration: "none",
                display: "block",
                transition: "transform 0.15s ease, box-shadow 0.15s ease"
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>📝</div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#c2410c", fontWeight: "700" }}>Upload Questions</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Upload 20 Reading + 20 Listening questions</p>
            </Link>

            <Link
              href="/admin/questions?tab=allSets"
              style={{
                backgroundColor: "#ffffff",
                padding: "18px",
                borderRadius: "10px",
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                textDecoration: "none",
                display: "block",
                transition: "transform 0.15s ease, box-shadow 0.15s ease"
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>📊</div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#0f172a", fontWeight: "700" }}>All Sets</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Count all sets and view status overview</p>
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
}
