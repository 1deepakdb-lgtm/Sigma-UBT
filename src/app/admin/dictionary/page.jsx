'use client';

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DictionarySection from "@/components/DictionarySection";

export default function AdminDictionaryPage() {
  const [instituteLanguage, setInstituteLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("instituteLanguage") || "both";
    }
    return "both";
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "Arial, sans-serif" }}>
      {/* Top Navbar for Super Admin */}
      <Navbar role="admin" instituteLanguage={instituteLanguage} />

      {/* Main Content Area */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "25px 20px" }}>
        <DictionarySection instituteLanguage={instituteLanguage} userRole="admin" />
      </div>
    </div>
  );
}
