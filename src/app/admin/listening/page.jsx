'use client';

import React from "react";
import Navbar from "@/components/Navbar";
import ClientErrorBoundary from "@/components/ClientErrorBoundary";
import EpsBookReader from "@/components/EpsBookReader";

export default function AdminListeningPage() {
  return (
    <ClientErrorBoundary fallbackTitle="Admin Study Materials Interface">
      <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "Arial, sans-serif", width: "100%", overflowX: "hidden" }}>
        {/* Top Navbar */}
        <Navbar role="admin" instituteLanguage="both" />

        {/* Main Content Area */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(12px, 3vw, 24px)", width: "100%", boxSizing: "border-box" }}>
          <ClientErrorBoundary fallbackTitle="Unable to load Study Materials Reader">
            <EpsBookReader mode="admin" instituteLanguage="both" />
          </ClientErrorBoundary>
        </div>
      </div>
    </ClientErrorBoundary>
  );
}
