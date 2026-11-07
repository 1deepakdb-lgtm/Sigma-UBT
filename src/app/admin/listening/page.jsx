'use client';

import React from "react";
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
        animation: "listeningSpin 0.8s linear infinite"
      }} />
      <style>{`@keyframes listeningSpin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>
        Loading Study Materials & Japanese Resources...
      </span>
    </div>
  )
});

export default function AdminListeningPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "Arial, sans-serif", width: "100%", overflowX: "hidden" }}>
      {/* Top Navbar */}
      <Navbar role="admin" instituteLanguage="both" />

      {/* Main Content Area */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(12px, 3vw, 24px)", width: "100%", boxSizing: "border-box" }}>
        <ClientErrorBoundary fallbackTitle="Unable to load Study Materials">
          <EpsBookReader mode="admin" />
        </ClientErrorBoundary>
      </div>
    </div>
  );
}
