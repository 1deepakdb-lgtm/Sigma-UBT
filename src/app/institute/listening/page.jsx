'use client';

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import EpsBookReader from "@/components/EpsBookReader";

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
        <EpsBookReader mode="institute" instituteLanguage={instituteLanguage} />
      </div>
    </div>
  );
}