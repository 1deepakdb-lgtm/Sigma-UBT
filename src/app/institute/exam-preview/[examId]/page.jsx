'use client';

if (typeof globalThis !== 'undefined' && !globalThis.localStorage) {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0
  };
}

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";

// Safely extract a string from a value that might be an object {text, audio, image, video}
const safeText = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return String(val.text || val.label || "");
  return String(val);
};
const safeMedia = (val, key) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return String(val[key] || "");
  return String(val);
};

const InstituteExamPreview = () => {
  const params = useParams(); const examId = params?.examId;
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("Reading"); // "Reading" or "Listening"

  useEffect(() => {
    // 1. Load exam sets and question bank updated by Admin
    const savedSets = JSON.parse(localStorage.getItem("examSets")) || [];
    const currentExam = savedSets.find(s => s.id.toString() === examId?.toString());
    setExam(currentExam);

    const targetSetName = currentExam ? currentExam.name : `Chapterwise 0${examId}`;
    const targetPackageName = currentExam ? currentExam.packageName : "";

    // Model Question Bank sets are open for institute preview
    // No purchase restriction block needed

    const allQuestions = JSON.parse(localStorage.getItem("questionBank")) || [];
    
    // Fetch questions mapped precisely to this exam set as updated by Admin
    let matchedQuestions = allQuestions.filter(q => 
      q && (
        q.setId?.toString() === examId?.toString() || 
        q.set === targetSetName || 
        (q.package === targetPackageName && q.set === targetSetName)
      )
    );

    let readingQ = matchedQuestions.filter(q => q.type === "Reading");
    let listeningQ = matchedQuestions.filter(q => q.type === "Listening");

    const finalBatch = [];

    // Map 20 Reading questions from Admin updates
    for (let i = 1; i <= 20; i++) {
      if (readingQ[i - 1]) {
        finalBatch.push({ ...readingQ[i - 1], id: i, type: "Reading" });
      } else {
        finalBatch.push({
          id: i,
          type: "Reading",
          mainHeading: `[ ${i} ] 다음을 읽고 알맞은 것을 고르십시오.`,
          questionHeading: "",
          description: "No description provided.",
          image: "",
          audio: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          answer: 0
        });
      }
    }

    // Map 20 Listening questions from Admin updates (Total 40)
    for (let i = 1; i <= 20; i++) {
      const qNum = 20 + i;
      if (listeningQ[i - 1]) {
        finalBatch.push({ ...listeningQ[i - 1], id: qNum, type: "Listening" });
      } else {
        finalBatch.push({
          id: qNum,
          type: "Listening",
          mainHeading: `[ ${qNum} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,
          questionHeading: "",
          description: "No description provided.",
          image: "",
          audio: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          answer: 0
        });
      }
    }

    setQuestions(finalBatch);
  }, [examId]);

  // CSS Security styles to completely block copying, text selecting, and dragging
  const protectedStyle = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    fontFamily: "Arial, sans-serif"
  };

  const containerStyle = { maxWidth: "1250px", margin: "30px auto", padding: "30px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", ...protectedStyle };
  const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1e3a8a", color: "white", padding: "20px", borderRadius: "6px", marginBottom: "25px" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
  const thStyle = { backgroundColor: "#f8fafc", padding: "14px 12px", textAlign: "left", borderBottom: "2px solid #e2e8f0", color: "#475569", fontSize: "13px", fontWeight: "700" };
  const tdStyle = { padding: "15px 12px", borderBottom: "1px solid #e2e8f0", color: "#1e293b", fontSize: "14px", verticalAlign: "middle" };

  const displayedQuestions = questions.filter(q => q.type === activeTab);

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px" }}>{exam?.name || "List of Question"}</h2>
        </div>
        <button 
          onClick={() => router.back()} 
          style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}
        >
          Back
        </button>
      </div>

      {/* Tabs for Reading (1-20) and Listening (21-40) */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("Reading")}
          style={{
            padding: "8px 20px",
            backgroundColor: activeTab === "Reading" ? "#0ea5e9" : "#cbd5e1",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Reading (1-20)
        </button>
        <button
          onClick={() => setActiveTab("Listening")}
          style={{
            padding: "8px 20px",
            backgroundColor: activeTab === "Listening" ? "#0ea5e9" : "#cbd5e1",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Listening (21-40)
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <th style={{ ...thStyle, width: "60px", borderTopLeftRadius: "8px" }}>Q.NO</th>
              <th style={{ ...thStyle, width: "230px" }}>Main Heading</th>
              <th style={{ ...thStyle, width: "180px" }}>Question Heading</th>
              <th style={{ ...thStyle, width: "240px" }}>Description & Media</th>
              <th style={{ ...thStyle, width: "220px" }}>Options</th>
              <th style={{ ...thStyle, width: "80px", textAlign: "center", borderTopRightRadius: "8px" }}>Answer</th>
            </tr>
          </thead>
          <tbody>
            {displayedQuestions.map((q, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "white" : "#fbfcfd" }}>
                <td style={{ ...tdStyle, fontWeight: "bold", textAlign: "center" }}>{q.id}</td>
                
                {/* Main Heading */}
                <td style={tdStyle}>
                  <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.4" }}>{safeText(q.mainHeading) || "-"}</div>
                </td>

                {/* Question Heading */}
                <td style={tdStyle}>
                  <div style={{ fontSize: "13px", color: "#334155" }}>{safeText(q.questionHeading) || "-"}</div>
                </td>

                {/* Description & Secure Protected Media (Image / Audio) */}
                <td style={tdStyle}>
                  <div style={{ fontSize: "13px", color: "#475569", marginBottom: (safeMedia(q.image, "image") || safeMedia(q.audio, "audio")) ? "8px" : "0" }}>{safeText(q.description)}</div>
                  
                  {safeMedia(q.image, "image") && (
                    <div style={{ marginBottom: "5px", position: "relative", display: "inline-block" }}>
                      {/* Transparent shield overlay to block dragging or saving images */}
                      <div 
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2, background: "transparent" }} 
                        onContextMenu={(e) => e.preventDefault()} 
                        onDragStart={(e) => e.preventDefault()}
                      />
                      <img 
                        src={safeMedia(q.image, "image")} 
                        alt="Visual Preview" 
                        style={{ maxHeight: "100px", maxWidth: "140px", objectFit: "contain", borderRadius: "4px", backgroundColor: "white", pointerEvents: "none", userSelect: "none" }} 
                        draggable="false"
                      />
                    </div>
                  )}

                  {safeMedia(q.audio, "audio") && (
                    <div style={{ position: "relative" }}>
                      {/* Protected audio player blocking download options */}
                      <audio 
                        src={safeMedia(q.audio, "audio")} 
                        controls 
                        controlsList="nodownload noremoteplayback noplaybackrate" 
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ width: "100%", height: "30px" }} 
                      />
                    </div>
                  )}
                </td>

                {/* Options */}
                <td style={tdStyle}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {(q.options || []).map((opt, oIdx) => (
                      <span key={oIdx} style={{ fontSize: "13px", color: "#1e293b" }}>
                        {oIdx + 1}. {safeText(opt)}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Answer */}
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold", color: "#16a34a", fontSize: "16px" }}>
                  {q.answer !== undefined ? Number(q.answer) + 1 : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstituteExamPreview;