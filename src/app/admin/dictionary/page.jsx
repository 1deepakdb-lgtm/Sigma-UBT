'use client';

import React from "react";
import Navbar from "@/components/Navbar";
import DictionarySection from "@/components/DictionarySection";
import ClientErrorBoundary from "@/components/ClientErrorBoundary";

export default function AdminDictionaryPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "Arial, sans-serif" }}>
      {/* Top Navbar for Super Admin with Both Tracks */}
      <Navbar role="admin" instituteLanguage="both" />

      {/* Main Content Area */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "25px 20px" }}>
        <ClientErrorBoundary fallbackTitle="Admin Dictionary Interface">
          <DictionarySection instituteLanguage="both" userRole="admin" />
        </ClientErrorBoundary>
      </div>
    </div>
  );
}
