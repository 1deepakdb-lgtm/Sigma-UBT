'use client';

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import ClientErrorBoundary from "@/components/ClientErrorBoundary";

const EpsBookReader = dynamic(() => import("@/components/EpsBookReader"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "450px",
      gap: "14px",
      color: "#64748b"
    }}>
      <div style={{
        width: "38px",
        height: "38px",
        border: "3px solid #e2e8f0",
        borderTopColor: "#2563eb",
        borderRadius: "50%",
        animation: "instListeningSpin 0.8s linear infinite"
      }} />
      <style>{`@keyframes instListeningSpin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>
        Loading Study Materials...
      </span>
    </div>
  )
});

export default function InstituteListeningPage() {
  const [instituteLanguage, setInstituteLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("instituteLanguage") || "korean";
    }
    return "korean";
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          const lang = data.user.instituteLanguage || data.user.institute?.language || "both";
          setInstituteLanguage(lang);
          if (typeof window !== "undefined") localStorage.setItem("instituteLanguage", lang);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "Arial, sans-serif", width: "100%", overflowX: "hidden" }}>
      {/* Top Navbar */}
      <Navbar role="institute" activeTab="listening" instituteLanguage={instituteLanguage} />

      {/* Main Content Area */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(12px, 3vw, 24px)", width: "100%", boxSizing: "border-box" }}>
        <ClientErrorBoundary fallbackTitle="Unable to load Study Materials">
          <EpsBookReader mode="institute" instituteLanguage={instituteLanguage} />
        </ClientErrorBoundary>
      </div>
    </div>
  );
}
