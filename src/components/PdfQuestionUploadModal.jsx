'use client';

import React, { useState, useRef } from 'react';
import { parsePdfQuestions, getDefaultHeadingForQ } from '@/lib/pdfQuestionParser';

// Clean SVG Icons for zero-emoji compliance
const PdfFileIcon = ({ size = 20, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-3px" }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const UploadCloudIcon = ({ size = 32, color = "#2563eb" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    <polyline points="12 13 12 21" />
    <polyline points="16 17 12 13 8 17" />
  </svg>
);

const CheckCircleIcon = ({ size = 16, color = "#16a34a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-3px" }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ImageIcon = ({ size = 15, color = "#2563eb" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const TrashIcon = ({ size = 14, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CloseIcon = ({ size = 18, color = "#64748b" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function PdfQuestionUploadModal({
  isOpen,
  onClose,
  targetSet,
  targetPackage,
  availableSets = [],
  onImportSuccess
}) {
  const fileInputRef = useRef(null);

  const [selectedSet, setSelectedSet] = useState(targetSet || "");
  const [selectedPackage, setSelectedPackage] = useState(targetPackage || "Full Set UBT");
  const [pdfFile, setPdfFile] = useState(null);
  const [parsingProgress, setParsingProgress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [pdfPages, setPdfPages] = useState([]);
  const [extractedImages, setExtractedImages] = useState([]);

  // Active filter in preview tab: "All" | "Reading" | "Listening"
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedQIndex, setSelectedQIndex] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with prop changes
  React.useEffect(() => {
    if (targetSet) setSelectedSet(targetSet);
    if (targetPackage) setSelectedPackage(targetPackage);
  }, [targetSet, targetPackage]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setErrorMsg("Please upload a valid PDF file (.pdf).");
        return;
      }
      setPdfFile(file);
      setErrorMsg("");
      await processPdf(file);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setErrorMsg("Please upload a valid PDF file (.pdf).");
        return;
      }
      setPdfFile(file);
      setErrorMsg("");
      await processPdf(file);
    }
  };

  const processPdf = async (file) => {
    setIsProcessing(true);
    setErrorMsg("");
    setParsingProgress({ message: "Initializing PDF.js engine..." });

    try {
      const result = await parsePdfQuestions(
        file,
        { package: selectedPackage, set: selectedSet },
        (progress) => setParsingProgress(progress)
      );

      setParsedQuestions(result.questions);
      setPdfPages(result.pages);
      setExtractedImages(result.extractedImages);
      setParsingProgress(null);
      setIsProcessing(false);
    } catch (err) {
      console.error("PDF Parsing error:", err);
      setErrorMsg("Failed to parse PDF: " + (err.message || "Unknown error"));
      setIsProcessing(false);
      setParsingProgress(null);
    }
  };

  // Modify question field in preview
  const handleUpdateQ = (qNum, updates) => {
    setParsedQuestions(prev => prev.map(q => q.qIndex === qNum ? { ...q, ...updates } : q));
  };

  // Modify option text or image
  const handleUpdateOption = (qNum, optIdx, updates) => {
    setParsedQuestions(prev => prev.map(q => {
      if (q.qIndex !== qNum) return q;
      const newOpts = [...q.options];
      newOpts[optIdx] = { ...newOpts[optIdx], ...updates };
      return { ...q, options: newOpts };
    }));
  };

  // Assign image from extracted images
  const handleAssignExtractedImage = (qNum, target, imgDataUrl) => {
    if (target === "question") {
      handleUpdateQ(qNum, { image: imgDataUrl });
    } else if (typeof target === "number") {
      handleUpdateOption(qNum, target, { image: imgDataUrl });
    }
  };

  // Finalize and Save to Question Bank & Backend API
  const handleFinalSave = async () => {
    if (!selectedSet) {
      alert("Please select a target Exam Set first.");
      return;
    }
    if (parsedQuestions.length === 0) {
      alert("No questions to import. Please upload and parse a PDF first.");
      return;
    }

    setIsSaving(true);
    try {
      const finalQuestions = parsedQuestions.map(q => ({
        ...q,
        package: selectedPackage,
        set: selectedSet.trim().toUpperCase(),
        questionHeading: String(q.qIndex)
      }));

      if (onImportSuccess) {
        await onImportSuccess(finalQuestions, selectedSet.trim().toUpperCase(), selectedPackage);
      }
      onClose();
    } catch (err) {
      console.error("Error saving questions:", err);
      alert("Error saving questions: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuestions = parsedQuestions.filter(q => {
    if (activeFilter === "Reading") return q.qIndex <= 20;
    if (activeFilter === "Listening") return q.qIndex > 20;
    return true;
  });

  const activeQuestion = parsedQuestions.find(q => q.qIndex === selectedQIndex) || parsedQuestions[0];

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(4px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "1280px",
        height: "92vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f8fafc"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <PdfFileIcon size={22} color="#dc2626" />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                Import EPS-TOPIK Questions from PDF
              </h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Auto-extracts Q1 to Q40, inherits Korean headings, maps circled options (1-4), preserves pictures, and leaves listening empty.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {parsedQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleFinalSave}
                disabled={isSaving}
                style={{
                  padding: "9px 20px",
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                  borderRadius: "8px",
                  border: "none",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 4px rgba(22, 163, 74, 0.2)"
                }}
              >
                <CheckCircleIcon size={16} color="#ffffff" />
                {isSaving ? "Saving Questions..." : `Import All 40 Questions to "${selectedSet || 'Set'}"`}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <CloseIcon size={18} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Target Set & Configuration Bar */}
        <div style={{
          padding: "12px 24px",
          backgroundColor: "#f1f5f9",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "16px",
          fontSize: "13px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: "600", color: "#334155" }}>Target Exam Set:</span>
            {availableSets.length > 0 ? (
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a"
                }}
              >
                {availableSets.map((s, idx) => {
                  const sName = typeof s === "string" ? s : s.name;
                  return <option key={idx} value={sName}>{sName}</option>;
                })}
              </select>
            ) : (
              <input
                type="text"
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                placeholder="e.g. UBT SET 01"
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              />
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: "600", color: "#334155" }}>Package:</span>
            <input
              type="text"
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              placeholder="e.g. Full Set UBT"
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "13px"
              }}
            />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "6px 14px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <PdfFileIcon size={14} color="#ffffff" />
              {pdfFile ? "Choose Different PDF" : "Select PDF Document"}
            </button>
            {pdfFile && (
              <span style={{ fontSize: "12px", color: "#475569", fontWeight: "600" }}>
                {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            )}
          </div>
        </div>

        {/* Main Workspace Area */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Left Column: Upload Dropzone or Question Navigator */}
          {parsedQuestions.length === 0 ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                backgroundColor: "#f8fafc",
                margin: "24px",
                borderRadius: "12px",
                border: "2px dashed #cbd5e1",
                textAlign: "center"
              }}
            >
              {isProcessing ? (
                <div>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "4px solid #bfdbfe",
                    borderTopColor: "#2563eb",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px auto"
                  }} />
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
                    Parsing EPS-TOPIK Question Paper
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                    {parsingProgress?.message || "Extracting text, images, circled options, and listening questions..."}
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    backgroundColor: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto"
                  }}>
                    <UploadCloudIcon size={36} color="#2563eb" />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>
                    Drag & Drop EPS-TOPIK PDF Exam Paper Here
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "480px", margin: "0 auto 20px auto", lineHeight: "1.5" }}>
                    Upload any standard 40-question Korean EPS-TOPIK PDF. The system automatically extracts Q1 to Q40, carries forward instructions/headings, parses circled options 1 to 4, associates pictures, and formats reading and listening sections.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: "700",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
                    }}
                  >
                    Browse Files
                  </button>
                  {errorMsg && (
                    <div style={{
                      marginTop: "16px",
                      padding: "10px 16px",
                      backgroundColor: "#fef2f2",
                      color: "#dc2626",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      {errorMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Question Navigator (Left Sidebar) */}
              <div style={{
                width: "280px",
                borderRight: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f8fafc"
              }}>
                {/* Filter Selector */}
                <div style={{
                  padding: "12px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  gap: "4px"
                }}>
                  {[
                    { key: "All", label: "All (40)" },
                    { key: "Reading", label: "Reading (1-20)" },
                    { key: "Listening", label: "Listening (21-40)" }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveFilter(tab.key)}
                      style={{
                        flex: 1,
                        padding: "6px 0",
                        fontSize: "11px",
                        fontWeight: "700",
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: activeFilter === tab.key ? "#2563eb" : "#e2e8f0",
                        color: activeFilter === tab.key ? "#ffffff" : "#475569",
                        cursor: "pointer"
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 40-Question Quick Grid */}
                <div style={{
                  padding: "12px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "6px"
                }}>
                  {Array.from({ length: 40 }, (_, i) => i + 1).map(num => {
                    const isSelected = selectedQIndex === num;
                    const isReading = num <= 20;
                    const q = parsedQuestions.find(it => it.qIndex === num);
                    const hasImage = Boolean(q?.image || q?.options?.some(o => o.image));

                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedQIndex(num)}
                        style={{
                          height: "36px",
                          borderRadius: "6px",
                          border: isSelected ? "2px solid #2563eb" : "1px solid #cbd5e1",
                          backgroundColor: isSelected
                            ? "#dbeafe"
                            : isReading
                              ? "#ffffff"
                              : "#f1f5f9",
                          color: isSelected ? "#1d4ed8" : "#334155",
                          fontSize: "12px",
                          fontWeight: isSelected ? "800" : "600",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative"
                        }}
                      >
                        <span>{num}</span>
                        {hasImage && (
                          <span style={{
                            position: "absolute",
                            bottom: "2px",
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            backgroundColor: "#2563eb"
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Question List */}
                <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                  {filteredQuestions.map(q => {
                    const isSelected = selectedQIndex === q.qIndex;
                    const isReading = q.qIndex <= 20;
                    return (
                      <div
                        key={q.qIndex}
                        onClick={() => setSelectedQIndex(q.qIndex)}
                        style={{
                          padding: "10px 12px",
                          marginBottom: "6px",
                          borderRadius: "8px",
                          backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                          border: isSelected ? "1px solid #3b82f6" : "1px solid #e2e8f0",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: "800",
                            color: isSelected ? "#1d4ed8" : "#0f172a"
                          }}>
                            Question {q.qIndex}
                          </span>
                          <span style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: isReading ? "#e0f2fe" : "#fef3c7",
                            color: isReading ? "#0369a1" : "#92400e"
                          }}>
                            {isReading ? "Reading" : "Listening (Empty)"}
                          </span>
                        </div>
                        <div style={{
                          fontSize: "11px",
                          color: "#64748b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {isReading
                            ? (q.description || "(Image / Dialog Q)")
                            : "(Empty Question & Options)"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center / Right Column: Active Question Editor */}
              {activeQuestion && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#ffffff" }}>
                  {/* Question Header Bar */}
                  <div style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#f8fafc"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        backgroundColor: "#2563eb",
                        color: "#ffffff"
                      }}>
                        Q{activeQuestion.qIndex}
                      </span>
                      <span style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: activeQuestion.qIndex <= 20 ? "#0284c7" : "#b45309",
                        backgroundColor: activeQuestion.qIndex <= 20 ? "#e0f2fe" : "#fef3c7",
                        padding: "4px 10px",
                        borderRadius: "6px"
                      }}>
                        {activeQuestion.qIndex <= 20 ? "Reading (읽기)" : "Listening (듣기 - Empty Question & Options)"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        type="button"
                        disabled={activeQuestion.qIndex <= 1}
                        onClick={() => setSelectedQIndex(activeQuestion.qIndex - 1)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#ffffff",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: activeQuestion.qIndex <= 1 ? "not-allowed" : "pointer"
                        }}
                      >
                        Previous Q
                      </button>
                      <button
                        type="button"
                        disabled={activeQuestion.qIndex >= 40}
                        onClick={() => setSelectedQIndex(activeQuestion.qIndex + 1)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#ffffff",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: activeQuestion.qIndex >= 40 ? "not-allowed" : "pointer"
                        }}
                      >
                        Next Q
                      </button>
                    </div>
                  </div>

                  {/* Question Content Fields */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                    {/* 1. Main Heading (Inherited from Previous Question) */}
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                          Question Direction / Heading (Inherited):
                        </label>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          Applies to consecutive question groups (e.g. [1~2], [3~4], [5~8])
                        </span>
                      </div>
                      <input
                        type="text"
                        value={activeQuestion.mainHeading || ""}
                        onChange={(e) => handleUpdateQ(activeQuestion.qIndex, { mainHeading: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#0f172a",
                          backgroundColor: "#f8fafc"
                        }}
                      />
                    </div>

                    {/* READING SECTION (Q1-20) */}
                    {activeQuestion.qIndex <= 20 ? (
                      <>
                        {/* 2. Question Description & Visual */}
                        <div style={{ marginBottom: "20px" }}>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                            Question Text / Stem (Description):
                          </label>
                          <textarea
                            rows={3}
                            value={activeQuestion.description || ""}
                            onChange={(e) => handleUpdateQ(activeQuestion.qIndex, { description: e.target.value })}
                            placeholder="Enter passage, sentence, or dialog..."
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1",
                              fontSize: "13px",
                              lineHeight: "1.6",
                              color: "#0f172a"
                            }}
                          />
                        </div>

                        {/* 3. Question Image (in Description) */}
                        <div style={{
                          marginBottom: "24px",
                          padding: "16px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          backgroundColor: "#f8fafc"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <ImageIcon size={16} color="#2563eb" />
                              <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                                Question Picture / Diagram (Kept in Description Area):
                              </span>
                            </div>
                            {activeQuestion.image && (
                              <button
                                type="button"
                                onClick={() => handleUpdateQ(activeQuestion.qIndex, { image: "" })}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "#dc2626",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <TrashIcon size={13} color="#dc2626" />
                                Remove Image
                              </button>
                            )}
                          </div>

                          {activeQuestion.image ? (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                              <img
                                src={activeQuestion.image}
                                alt="Question Visual"
                                style={{
                                  maxHeight: "160px",
                                  maxWidth: "240px",
                                  objectFit: "contain",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  backgroundColor: "#ffffff"
                                }}
                              />
                              <div style={{ fontSize: "12px", color: "#64748b" }}>
                                <p style={{ margin: "0 0 6px 0", fontWeight: "600", color: "#16a34a" }}>
                                  Image attached to question description.
                                </p>
                                <p style={{ margin: 0 }}>
                                  Students will see this picture directly above or inside the question card during the exam.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              <span>No image attached. Select one from extracted images below or leave text-only.</span>
                            </div>
                          )}
                        </div>

                        {/* 4. Options 1 to 4 (From Circled Digits 1, 2, 3, 4) */}
                        <div style={{ marginBottom: "24px" }}>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "12px" }}>
                            Options (Extracted from Circled 1, 2, 3, 4):
                          </label>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                            {activeQuestion.options.map((opt, optIdx) => {
                              const circleLabels = ["①", "②", "③", "④"];
                              const isCorrect = Number(activeQuestion.answer) === optIdx;

                              return (
                                <div
                                  key={optIdx}
                                  style={{
                                    padding: "14px",
                                    borderRadius: "10px",
                                    border: isCorrect ? "2px solid #16a34a" : "1px solid #cbd5e1",
                                    backgroundColor: isCorrect ? "#f0fdf4" : "#ffffff",
                                    position: "relative"
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <span style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        backgroundColor: isCorrect ? "#16a34a" : "#2563eb",
                                        color: "#ffffff",
                                        fontSize: "13px",
                                        fontWeight: "800",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}>
                                        {circleLabels[optIdx]}
                                      </span>
                                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                                        Option {optIdx + 1}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdateQ(activeQuestion.qIndex, { answer: optIdx })}
                                      style={{
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                        border: "1px solid " + (isCorrect ? "#16a34a" : "#cbd5e1"),
                                        backgroundColor: isCorrect ? "#16a34a" : "#ffffff",
                                        color: isCorrect ? "#ffffff" : "#64748b",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        cursor: "pointer"
                                      }}
                                    >
                                      {isCorrect ? "Correct Answer" : "Set as Answer"}
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    value={opt.text || ""}
                                    onChange={(e) => handleUpdateOption(activeQuestion.qIndex, optIdx, { text: e.target.value })}
                                    placeholder={`Option ${optIdx + 1} text...`}
                                    style={{
                                      width: "100%",
                                      padding: "8px 12px",
                                      borderRadius: "6px",
                                      border: "1px solid #cbd5e1",
                                      fontSize: "13px",
                                      marginBottom: opt.image ? "8px" : "0"
                                    }}
                                  />

                                  {opt.image && (
                                    <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                                      <img
                                        src={opt.image}
                                        alt={`Option ${optIdx + 1}`}
                                        style={{
                                          height: "60px",
                                          borderRadius: "4px",
                                          border: "1px solid #cbd5e1"
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateOption(activeQuestion.qIndex, optIdx, { image: "" })}
                                        style={{
                                          fontSize: "11px",
                                          color: "#dc2626",
                                          background: "none",
                                          border: "none",
                                          cursor: "pointer"
                                        }}
                                      >
                                        Remove Opt Image
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* LISTENING SECTION (Q21-40) - KEPT EMPTY PER SPECIFICATION */
                      <div style={{
                        padding: "24px",
                        borderRadius: "12px",
                        backgroundColor: "#fef3c7",
                        border: "1px solid #fde68a",
                        textAlign: "center"
                      }}>
                        <div style={{
                          display: "inline-block",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          backgroundColor: "#b45309",
                          color: "#ffffff",
                          fontSize: "12px",
                          fontWeight: "800",
                          marginBottom: "12px"
                        }}>
                          Listening Question (Q21 - Q40)
                        </div>
                        <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#92400e", margin: "0 0 8px 0" }}>
                          Empty Question & Options Enforced
                        </h4>
                        <p style={{ fontSize: "13px", color: "#78350f", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
                          Per your instructions, listening questions keep empty question descriptions and empty options. When students take the exam, they will hear the spoken audio clip. You can optionally upload an audio MP3 track for this question later in the question manager.
                        </p>
                      </div>
                    )}

                    {/* Extracted Images from PDF (Quick Assign Gallery) */}
                    {extractedImages.length > 0 && activeQuestion.qIndex <= 20 && (
                      <div style={{
                        marginTop: "20px",
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#f8fafc"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                            Extracted Images from this PDF ({extractedImages.length}):
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            Click any image to assign it directly to Question {activeQuestion.qIndex}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "6px" }}>
                          {extractedImages.map((img, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "8px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                backgroundColor: "#ffffff",
                                minWidth: "120px",
                                textAlign: "center"
                              }}
                            >
                              <img
                                src={img.dataUrl}
                                alt={`PDF Extracted ${idx}`}
                                style={{
                                  maxHeight: "70px",
                                  maxWidth: "100px",
                                  objectFit: "contain",
                                  display: "block",
                                  margin: "0 auto 6px auto"
                                }}
                              />
                              <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px" }}>
                                P.{img.pageNum} ({img.width}x{img.height})
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAssignExtractedImage(activeQuestion.qIndex, "question", img.dataUrl)}
                                style={{
                                  width: "100%",
                                  padding: "3px 0",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  borderRadius: "4px",
                                  border: "none",
                                  backgroundColor: "#2563eb",
                                  color: "#ffffff",
                                  cursor: "pointer",
                                  marginBottom: "3px"
                                }}
                              >
                                Set as Q Image
                              </button>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
                                {[0, 1, 2, 3].map(optI => (
                                  <button
                                    key={optI}
                                    type="button"
                                    onClick={() => handleAssignExtractedImage(activeQuestion.qIndex, optI, img.dataUrl)}
                                    style={{
                                      padding: "2px 0",
                                      fontSize: "9px",
                                      fontWeight: "600",
                                      borderRadius: "3px",
                                      border: "1px solid #cbd5e1",
                                      backgroundColor: "#f1f5f9",
                                      cursor: "pointer"
                                    }}
                                  >
                                    Opt {optI + 1}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {parsedQuestions.length > 0 ? (
              <span>
                <strong>{parsedQuestions.length} Questions ready</strong> • Target: {selectedSet} ({selectedPackage})
              </span>
            ) : (
              <span>Select an EPS-TOPIK Korean PDF to extract all 40 questions.</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            {parsedQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleFinalSave}
                disabled={isSaving}
                style={{
                  padding: "8px 22px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <CheckCircleIcon size={16} color="#ffffff" />
                {isSaving ? "Saving Questions..." : `Import All 40 Questions to "${selectedSet || 'Set'}"`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
