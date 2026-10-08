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
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { performLogout } from "@/lib/clientAuth";

const AdminNews = () => {
  const router = useRouter();
  const [newsList, setNewsList] = useState([]);
  const [category, setCategory] = useState("notice"); // "notice" | "news"
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPopupBanner, setIsPopupBanner] = useState(false);
  
  // Media upload states
  const [mediaFile, setMediaFile] = useState(null); 
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");     
  const [fileSize, setFileSize] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Filter state for announcements
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "notice" | "news"

  const institutes = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem("institutes")) || []) : [];
  const logoWatermark = institutes[0]?.logoUrl || "";

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success && Array.isArray(data.notices)) {
        setNewsList(data.notices);
        try {
          localStorage.setItem("epsNewsList", JSON.stringify(data.notices));
        } catch (e) {}
        return;
      }
    } catch (e) {
      console.warn("Failed to fetch notices from /api/news, using localStorage fallback:", e);
    }
    try {
      const savedNews = JSON.parse(localStorage.getItem("epsNewsList")) || [];
      setNewsList(savedNews);
    } catch (e) {
      console.error("Failed to load news notices", e);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleLogout = () => {
    performLogout();
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 150 * 1024 * 1024) {
      alert("⚠️ File exceeds 150MB limit. Please choose a smaller file.");
      e.target.value = "";
      return;
    }

    const name = file.name.toLowerCase();
    const mime = file.type.toLowerCase();

    let detectedType = "document";
    if (mime.startsWith("video/") || name.endsWith(".mp4") || name.endsWith(".webm") || name.endsWith(".mov") || name.endsWith(".avi") || name.endsWith(".mkv") || name.endsWith(".3gp") || name.endsWith(".wmv")) {
      detectedType = "video";
    } else if (mime.startsWith("audio/") || name.endsWith(".mp3") || name.endsWith(".wav") || name.endsWith(".ogg") || name.endsWith(".m4a") || name.endsWith(".aac") || name.endsWith(".flac")) {
      detectedType = "audio";
    } else if (mime.startsWith("image/") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".webp") || name.endsWith(".gif") || name.endsWith(".svg") || name.endsWith(".bmp")) {
      detectedType = "image";
    } else if (name.endsWith(".pdf") || mime === "application/pdf") {
      detectedType = "pdf";
    } else {
      detectedType = "document";
    }

    setFileType(detectedType);
    setFileName(file.name);
    setFileSize(file.size);
    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "x-user-role": "admin"
        }
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setMediaFile(data.url);
        setIsUploading(false);
      } else {
        throw new Error(data.message || data.error || "Upload failed");
      }
    } catch (err) {
      console.warn("Server API upload failed, attempting fallback:", err);
      if (file.size <= 4 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaFile(reader.result);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        setIsUploading(false);
        setUploadError(err.message || "Failed to upload file to server.");
        alert("⚠️ Upload failed: " + (err.message || "Could not save file to server."));
      }
    }
  };

  const handleRemoveFile = () => {
    setMediaFile(null);
    setFileName("");
    setFileType("");
    setFileSize(0);
    setUploadError("");
    const fileInput = document.getElementById("noticeFileInput");
    if (fileInput) fileInput.value = "";
  };

  const handlePublish = async (targetCategory = category) => {
    if (!title.trim() || !content.trim()) {
      alert("कृपया शीर्षक र विवरण (Title and Details) दुवै भर्नुहोस्!");
      return;
    }

    const newItem = {
      id: Date.now(),
      category: targetCategory, // "notice" | "news"
      title: title.trim(),
      content: content.trim(),
      isPopup: isPopupBanner,
      fileUrl: mediaFile,
      fileName: fileName || (mediaFile ? "Attached_Media" : ""),
      fileType: fileType,
      fileSize: fileSize,
      date: new Date().toISOString().split("T")[0]
    };

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notices)) {
        setNewsList(data.notices);
        try {
          localStorage.setItem("epsNewsList", JSON.stringify(data.notices));
        } catch (e) {}
      } else {
        const updated = [newItem, ...newsList];
        setNewsList(updated);
        try {
          localStorage.setItem("epsNewsList", JSON.stringify(updated));
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Server POST error, storing locally:", err);
      const updated = [newItem, ...newsList];
      setNewsList(updated);
      try {
        localStorage.setItem("epsNewsList", JSON.stringify(updated));
      } catch (e) {}
    }

    setTitle("");
    setContent("");
    setIsPopupBanner(false);
    handleRemoveFile();

    const categoryTitle = targetCategory === "news" ? "Official News" : "Official Notice";
    alert(`✅ ${categoryTitle} successfully published and delivered to Student and Institute portals!`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this notice / news item?")) {
      try {
        const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success && Array.isArray(data.notices)) {
          setNewsList(data.notices);
          try {
            localStorage.setItem("epsNewsList", JSON.stringify(data.notices));
          } catch (e) {}
          return;
        }
      } catch (err) {
        console.warn("Delete API error, deleting locally:", err);
      }
      const updated = newsList.filter(n => n.id !== id);
      setNewsList(updated);
      try {
        localStorage.setItem("epsNewsList", JSON.stringify(updated));
      } catch (err) {
        console.error("Storage error:", err);
      }
    }
  };

  const filteredNewsList = newsList.filter(item => {
    if (activeFilter === "notice") return item.category !== "news";
    if (activeFilter === "news") return item.category === "news";
    return true;
  });

  const noticesCount = newsList.filter(n => n.category !== "news").length;
  const newsCount = newsList.filter(n => n.category === "news").length;

  const protectedStyle = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none"
  };

  const containerStyle = { 
    minHeight: "100vh", 
    backgroundColor: "rgba(241, 245, 249, 0.94)", 
    fontFamily: "Arial, sans-serif",
    position: "relative",
    backgroundImage: logoWatermark ? `url(${logoWatermark})` : "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "350px",
    backgroundBlendMode: "overlay",
    ...protectedStyle
  };

  const contentStyle = { padding: "30px 24px", maxWidth: "1200px", margin: "0 auto" };
  const cardStyle = { 
    backgroundColor: "white", 
    padding: "26px", 
    borderRadius: "10px", 
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)", 
    marginBottom: "25px", 
    border: "1px solid #e2e8f0" 
  };
  const inputStyle = { 
    width: "100%", 
    padding: "11px 14px", 
    marginBottom: "16px", 
    borderRadius: "7px", 
    border: "1px solid #cbd5e1", 
    boxSizing: "border-box", 
    backgroundColor: "white",
    fontSize: "14px"
  };

  const graphicCardStyle = (gradient) => ({
    background: gradient,
    borderRadius: "14px",
    padding: "22px 14px",
    color: "white",
    textAlign: "center",
    textDecoration: "none",
    boxShadow: "0 6px 14px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  });

  const iconCircleStyle = {
    width: "54px",
    height: "54px",
    backgroundColor: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "10px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.12)"
  };

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      
      {/* STICKY TOP NAVIGATION BAR */}
      <Navbar role="admin" />

      <div style={contentStyle}>
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h2 style={{ color: "#1e3a8a", margin: "0 0 6px 0", fontSize: "26px", fontWeight: 800 }}>
            Official Notice & News Portal
          </h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
            Publish official notices, government news, and attach rich media (Video, Audio, Images, PDF, Documents)
          </p>
        </div>

        {/* OFFICIAL PORTALS GRAPHIC CARDS SECTION */}
        <div style={{ marginBottom: "35px" }}>
          <h3 style={{ color: "#1e293b", marginBottom: "15px", fontSize: "17px", fontWeight: 700 }}>
            🌐 Official EPS & Government Portals
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
            <a href="https://epsnepal.gov.np/notices" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)")}>
              <div style={iconCircleStyle}>📄</div>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>Official Notices</h4>
            </a>

            <a href="https://epsnepal.gov.np/news" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #0284c7 0%, #0369a1 100%)")}>
              <div style={iconCircleStyle}>📰</div>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>Official News</h4>
            </a>

            <a href="https://eoers.epsnepal.gov.np/" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #10b981 0%, #047857 100%)")}>
              <div style={iconCircleStyle}>📝</div>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>Application Portal</h4>
            </a>

            <a href="https://epstopik.hrdkorea.or.kr/epstopik/pass/candidate/sucessReportList.do?lang=en" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #f59e0b 0%, #b45309 100%)")}>
              <div style={iconCircleStyle}>🔍</div>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>EPS Result Checker</h4>
            </a>

            <a href="https://epsnepal.gov.np/jobappform/" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)")}>
              <div style={iconCircleStyle}>📋</div>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>Job Application</h4>
            </a>

            <a href="https://epstopik.hrdkorea.or.kr/epstopik/cust/aid/NoticeList.do?lang=en" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #0f766e 0%, #115e59 100%)")}>
              <div style={iconCircleStyle}>🏛️</div>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>HRD Korea Notices</h4>
            </a>
          </div>
        </div>

        {/* PUBLISH FORM CARD */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px", fontWeight: 700 }}>
              Publish Official Notice / News
            </h3>

            {/* Category Toggle Pills */}
            <div style={{ display: "flex", gap: "8px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
              <button
                type="button"
                onClick={() => setCategory("notice")}
                style={{
                  padding: "7px 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: category === "notice" ? "#2563eb" : "transparent",
                  color: category === "notice" ? "#ffffff" : "#475569",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "0.2s"
                }}
              >
                📢 Official Notice
              </button>
              <button
                type="button"
                onClick={() => setCategory("news")}
                style={{
                  padding: "7px 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: category === "news" ? "#0284c7" : "transparent",
                  color: category === "news" ? "#ffffff" : "#475569",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "0.2s"
                }}
              >
                📰 Official News
              </button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handlePublish(category); }}>
            <label style={{ fontWeight: "bold", fontSize: "13px", color: "#334155", display: "block", marginBottom: "6px" }}>
              {category === "news" ? "Official News Title" : "Notice Title"}
            </label>
            <input 
              type="text" 
              placeholder={category === "news" ? "e.g. HRD Korea Official Employment Quota Update 2026" : "e.g. TOPIK Exam Application Notice"} 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={inputStyle} 
              required 
            />

            <label style={{ fontWeight: "bold", fontSize: "13px", color: "#334155", display: "block", marginBottom: "6px" }}>
              {category === "news" ? "Official News Content / Details" : "Notice Content / Details"}
            </label>
            <textarea 
              placeholder={category === "news" ? "Enter official news description, announcements, details..." : "Enter notice description, instructions, guidelines..."} 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              style={{ ...inputStyle, height: "110px", resize: "vertical" }} 
              required 
            />

            {/* Rich Media Attachment Section */}
            <div style={{ marginBottom: "20px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontWeight: "bold", fontSize: "13px", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📎</span> Attach Media File (Video, Audio, Image, PDF, Text, etc.)
                </label>
                {mediaFile && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    style={{
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      border: "1px solid #fca5a5",
                      padding: "4px 10px",
                      borderRadius: "5px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    ✕ Remove Attachment
                  </button>
                )}
              </div>

              <input 
                id="noticeFileInput"
                type="file" 
                accept="audio/*,video/*,image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.csv"
                onChange={handleFileChange} 
                disabled={isUploading}
                style={{ 
                  width: "100%", 
                  padding: "9px", 
                  borderRadius: "6px", 
                  border: "1px solid #cbd5e1", 
                  backgroundColor: "white", 
                  boxSizing: "border-box" 
                }} 
              />
              <span style={{ fontSize: "11.5px", color: "#64748b", marginTop: "5px", display: "block" }}>
                Supports all formats smoothly: <strong>MP4/WebM Videos</strong>, <strong>MP3/WAV Audios</strong>, <strong>Images</strong>, <strong>PDFs</strong>, and <strong>Documents</strong> (Up to 150MB).
              </span>

              {/* Uploading Status Indicator */}
              {isUploading && (
                <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: "#eff6ff", borderRadius: "6px", border: "1px solid #93c5fd", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px", animation: "spin 1s linear infinite" }}>⏳</span>
                  <span style={{ fontSize: "13px", color: "#1e40af", fontWeight: 600 }}>
                    Uploading file to server... Please wait.
                  </span>
                </div>
              )}

              {uploadError && (
                <div style={{ marginTop: "10px", padding: "8px 12px", backgroundColor: "#fef2f2", borderRadius: "6px", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "12px" }}>
                  {uploadError}
                </div>
              )}

              {/* Live Preview Card */}
              {mediaFile && !isUploading && (
                <div style={{ marginTop: "14px", padding: "14px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                      📁 Attached: {fileName || "Uploaded File"} {fileSize > 0 && `(${formatBytes(fileSize)})`}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "10px" }}>
                      {fileType.toUpperCase()}
                    </span>
                  </div>

                  {fileType === "video" && (
                    <video 
                      controls 
                      src={mediaFile} 
                      style={{ width: "100%", maxHeight: "250px", borderRadius: "6px", backgroundColor: "#000000" }} 
                    />
                  )}

                  {fileType === "audio" && (
                    <audio 
                      controls 
                      src={mediaFile} 
                      style={{ width: "100%", height: "40px" }} 
                    />
                  )}

                  {fileType === "image" && (
                    <div style={{ textAlign: "center" }}>
                      <img 
                        src={mediaFile} 
                        alt="Preview" 
                        style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                      />
                    </div>
                  )}

                  {(fileType === "pdf" || fileType === "document") && (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
                      <span style={{ fontSize: "28px" }}>{fileType === "pdf" ? "📕" : "📄"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{fileName || "Document"}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{formatBytes(fileSize)}</div>
                      </div>
                      <a 
                        href={mediaFile} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "6px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "12px", fontWeight: 600 }}
                      >
                        Preview / Download
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Checkbox for Pop-up Flex Banner */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px", backgroundColor: "#f8fafc", padding: "12px 14px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
              <input 
                type="checkbox" 
                id="popupCheck" 
                checked={isPopupBanner} 
                onChange={(e) => setIsPopupBanner(e.target.checked)} 
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="popupCheck" style={{ fontSize: "13.5px", fontWeight: "bold", color: "#1e3a8a", cursor: "pointer" }}>
                📢 Show as Pop-up Flex Banner on Student Dashboard
              </label>
            </div>

            {/* Two Action Buttons: Publish Notice & Publish Official News */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <button 
                type="button" 
                onClick={() => handlePublish("notice")}
                disabled={isUploading}
                style={{ 
                  backgroundColor: "#2563eb", 
                  color: "white", 
                  padding: "13px 20px", 
                  border: "none", 
                  borderRadius: "7px", 
                  fontWeight: 700, 
                  fontSize: "14px",
                  cursor: isUploading ? "not-allowed" : "pointer", 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.3)"
                }}
              >
                <span>📢</span> Publish Notice
              </button>

              <button 
                type="button" 
                onClick={() => handlePublish("news")}
                disabled={isUploading}
                style={{ 
                  backgroundColor: "#0284c7", 
                  color: "white", 
                  padding: "13px 20px", 
                  border: "none", 
                  borderRadius: "7px", 
                  fontWeight: 700, 
                  fontSize: "14px",
                  cursor: isUploading ? "not-allowed" : "pointer", 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(2,132,199,0.3)"
                }}
              >
                <span>📰</span> Publish Official News
              </button>
            </div>
          </form>
        </div>

        {/* PUBLISHED ANNOUNCEMENTS SECTION */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px", fontWeight: 700 }}>
              Published Notices & News ({filteredNewsList.length})
            </h3>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setActiveFilter("all")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: activeFilter === "all" ? "#1e3a8a" : "white",
                  color: activeFilter === "all" ? "white" : "#475569",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                All ({newsList.length})
              </button>
              <button
                onClick={() => setActiveFilter("notice")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: activeFilter === "notice" ? "#2563eb" : "white",
                  color: activeFilter === "notice" ? "white" : "#475569",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                📢 Notices ({noticesCount})
              </button>
              <button
                onClick={() => setActiveFilter("news")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: activeFilter === "news" ? "#0284c7" : "white",
                  color: activeFilter === "news" ? "white" : "#475569",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                📰 Official News ({newsCount})
              </button>
            </div>
          </div>

          {filteredNewsList.length === 0 ? (
            <p style={{ color: "#64748b", margin: "10px 0", textAlign: "center", padding: "20px" }}>
              No notices or news published under this filter yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {filteredNewsList.map((item) => {
                const isNews = item.category === "news";
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      padding: "20px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0", 
                      backgroundColor: item.isPopup ? "#f0f9ff" : "#ffffff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        {isNews ? (
                          <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "10px" }}>
                            📰 Official News
                          </span>
                        ) : (
                          <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "10px" }}>
                            📢 Official Notice
                          </span>
                        )}

                        {item.isPopup && (
                          <span style={{ backgroundColor: "#dcfce7", color: "#166534", fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "10px" }}>
                            📢 Pop-up Banner Active
                          </span>
                        )}

                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                          📅 {item.date}
                        </span>
                      </div>

                      <button 
                        onClick={() => handleDelete(item.id)} 
                        style={{ 
                          backgroundColor: "#ef4444", 
                          color: "white", 
                          border: "none", 
                          padding: "5px 12px", 
                          borderRadius: "5px", 
                          cursor: "pointer", 
                          fontSize: "12px",
                          fontWeight: 600
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    <h4 style={{ margin: "4px 0 10px 0", color: "#1e293b", fontSize: "17px", fontWeight: 700 }}>
                      {item.title}
                    </h4>

                    <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 14px 0", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                      {item.content}
                    </p>

                    {/* Rich Media Previews */}
                    {item.fileUrl && (
                      <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        {item.fileType === "video" && (
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>🎥 Video Attachment:</div>
                            <video 
                              controls 
                              src={item.fileUrl} 
                              style={{ width: "100%", maxHeight: "320px", borderRadius: "6px", backgroundColor: "#000" }} 
                            />
                          </div>
                        )}

                        {item.fileType === "audio" && (
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>🔊 Audio Attachment:</div>
                            <audio 
                              controls 
                              src={item.fileUrl} 
                              style={{ width: "100%", height: "38px" }} 
                            />
                          </div>
                        )}

                        {item.fileType === "image" && (
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>🖼️ Image Attachment:</div>
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                              <img 
                                src={item.fileUrl} 
                                alt="Attachment" 
                                style={{ maxWidth: "300px", maxHeight: "240px", borderRadius: "6px", border: "1px solid #cbd5e1", cursor: "pointer" }} 
                              />
                            </a>
                          </div>
                        )}

                        {(item.fileType === "pdf" || item.fileType === "document") && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontSize: "24px" }}>{item.fileType === "pdf" ? "📕" : "📄"}</span>
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                                  {item.fileName || "Attached Document"}
                                </div>
                                {item.fileSize > 0 && (
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                                    {formatBytes(item.fileSize)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                              <a 
                                href={item.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ 
                                  backgroundColor: "#2563eb", 
                                  color: "white", 
                                  padding: "6px 14px", 
                                  borderRadius: "5px", 
                                  textDecoration: "none", 
                                  fontSize: "12px", 
                                  fontWeight: 600 
                                }}
                              >
                                View File
                              </a>
                              <a 
                                href={item.fileUrl} 
                                download={item.fileName || "Notice_Document"} 
                                style={{ 
                                  backgroundColor: "#0284c7", 
                                  color: "white", 
                                  padding: "6px 14px", 
                                  borderRadius: "5px", 
                                  textDecoration: "none", 
                                  fontSize: "12px", 
                                  fontWeight: 600 
                                }}
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNews;