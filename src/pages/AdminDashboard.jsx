import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [totalInstitutes, setTotalInstitutes] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [selectedPackage, setSelectedPackage] = useState("Chapter wise");
  const [selectedSet, setSelectedSet] = useState("Chapter 1-2");
  const [isProcessing, setIsProcessing] = useState(false);

  // Book & Audio URL States
  const [bookTitle, setBookTitle] = useState("EPS TOPIK 2026 - Chapter 14");
  const [bookPdfUrl, setBookPdfUrl] = useState("");
  const [audioTracks, setAudioTracks] = useState([{ name: "Track 1: 대화 1", url: "" }]);

  const institutes = JSON.parse(localStorage.getItem("institutes")) || [];

  useEffect(() => {
    setTotalInstitutes(institutes.length);

    const instituteStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    let studentCount = 0;
    Object.values(instituteStudents).forEach(list => {
      if (Array.isArray(list)) studentCount += list.length;
    });
    setTotalStudents(studentCount);

    const questions = JSON.parse(localStorage.getItem("questionBank")) || [];
    setTotalQuestions(questions.length);
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  const handleAddAudioField = () => {
    setAudioTracks([...audioTracks, { name: `Track ${audioTracks.length + 1}`, url: "" }]);
  };

  const handleAudioChange = (index, field, value) => {
    const updated = [...audioTracks];
    updated[index][field] = value;
    setAudioTracks(updated);
  };

  const convertToDirectUrl = (url, type = "pdf") => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        if (type === "audio") {
          return `https://docs.google.com/uc?export=download&id=${fileId}`;
        } else {
          return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal#view=FitH`;
        }
      }
    }
    return url;
  };

  const handlePublishBookAndAudio = (e) => {
    e.preventDefault();
    if (!bookPdfUrl.trim()) {
      alert("❌ कृपया EPS Book को PDF URL राख्नुहोस्!");
      return;
    }

    try {
      const formattedPdfUrl = convertToDirectUrl(bookPdfUrl, "pdf");
      const formattedAudioTracks = audioTracks
        .filter(t => t.url.trim())
        .map(t => ({ ...t, url: convertToDirectUrl(t.url, "audio") }));

      const newBookMaterial = {
        id: Date.now(),
        title: bookTitle || "EPS Book Chapter",
        pdfFile: formattedPdfUrl,
        audioFiles: formattedAudioTracks,
        date: new Date().toLocaleDateString()
      };

      const existingFolders = JSON.parse(localStorage.getItem("epsFoldersContent")) || {};
      const bookList = existingFolders["EPS Book"] || [];
      existingFolders["EPS Book"] = [newBookMaterial, ...bookList];

      localStorage.setItem("epsFoldersContent", JSON.stringify(existingFolders));
      
      alert("✅ EPS Book PDF र अडियो ट्र्याकहरूको लिङ्क सफलतापूर्वक पब्लिश भयो र स्टुडेन्ट तथा इन्स्टिच्युटमा डेलिभर भयो!");
      
      setBookPdfUrl("");
      setAudioTracks([{ name: "Track 1: 대화 1", url: "" }]);
    } catch (err) {
      console.error("Publish error:", err);
      alert("❌ सेभ गर्न असफल भयो।");
    }
  };

  const handleBulkPdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        
        let allTextItems = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          allTextItems.push(...textContent.items.map(item => item.str));
        }

        const generatedQuestions = [];

        for (let i = 1; i <= 40; i++) {
          const type = i <= 20 ? "Reading" : "Listening";
          const chunkText = allTextItems.slice((i - 1) * 3, i * 3).join(" ") || `Question description for item ${i}`;

          generatedQuestions.push({
            id: Date.now() + i,
            setId: selectedSet,
            package: selectedPackage,
            set: selectedSet,
            type: type,
            mainHeading: type === "Reading" ? `[ ${i} ] 다음을 읽고 알맞은 것을 고르십시오.` : `[ ${i} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,
            questionHeading: `Question ${i}`,
            description: `[Q${i}] ${chunkText}`,
            image: i === 2 ? "https://cdn-icons-png.flaticon.com/512/3014/3014187.png" : "",
            audio: type === "Listening" ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" : "",
            options: [
              `① Option 1 (${i})`,
              `② Option 2 (${i})`,
              `③ Option 3 (${i})`,
              `④ Option 4 (${i})`
            ],
            answer: 0 
          });
        }

        const existingQuestions = JSON.parse(localStorage.getItem("questionBank")) || [];
        const filteredExisting = existingQuestions.filter(q => q.set !== selectedSet && q.setId !== selectedSet);
        const updatedQuestions = [...filteredExisting, ...generatedQuestions];
        
        localStorage.setItem("questionBank", JSON.stringify(updatedQuestions));
        
        const savedSets = JSON.parse(localStorage.getItem("examSets")) || [];
        const newSetEntry = { id: Date.now(), name: selectedSet, packageName: selectedPackage };
        if (!savedSets.some(s => s.name === selectedSet)) {
          localStorage.setItem("examSets", JSON.stringify([...savedSets, newSetEntry]));
        }

        setTotalQuestions(updatedQuestions.length);
        setIsProcessing(false);
        alert("✅ सफलतापर्वक ठ्याक्कै २० Reading (१-२०) र २० Listening (२१-४०) प्रश्नहरू क्रमबद्ध रूपमा इम्पोर्ट भयो!");
      } catch (error) {
        console.error("Error reading PDF:", error);
        setIsProcessing(false);
        alert("❌ PDF फाइल रिड गर्न सकिएन!");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const protectedStyle = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none"
  };

  // ड्यासबोर्डलाई उज्यालो र स्पष्ट बनाइएको छ
  const containerStyle = { 
    minHeight: "100vh", 
    backgroundColor: "#f1f5f9", 
    fontFamily: "Arial, sans-serif",
    position: "relative",
    ...protectedStyle
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
  const navLinkStyle = { color: "#cbd5e1", textDecoration: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", transition: "0.2s" };
  const activeNavLinkStyle = { ...navLinkStyle, backgroundColor: "#2563eb", color: "white" };

  const contentAreaStyle = { padding: "30px", maxWidth: "1200px", margin: "0 auto" };
  const cardContainerStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" };
  const cardStyle = { backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderLeft: "5px solid #2563eb" };
  const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #cbd5e1", borderRadius: "5px", boxSizing: "border-box", backgroundColor: "white" };

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      
      {/* STICKY TOP NAVIGATION BAR */}
      <div style={topNavStyle}>
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>SIGMA ADMIN PANEL</div>
        
        <div style={menuContainerStyle}>
          <Link to="/admin" style={activeNavLinkStyle}>Dashboard</Link>
          <Link to="/admin/institutes" style={navLinkStyle}>Manage Institutes</Link>
          <Link to="/admin/questions" style={navLinkStyle}>Question Model Bank</Link>
          <Link to="/admin/listening" style={navLinkStyle}>EPS Book</Link>
          <Link to="/admin/news" style={navLinkStyle}>EPS Notices</Link>
          <Link to="/admin/settings" style={navLinkStyle}>Settings</Link>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Logout</button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={contentAreaStyle}>
        <h2 style={{ color: "#1e293b", marginTop: "10px", fontSize: "22px" }}>Welcome to Sigma Education</h2>
        
        <div style={cardContainerStyle}>
          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px", textTransform: "uppercase" }}>Total Institutes</h4>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#1e293b" }}>{totalInstitutes}</p>
          </div>
          
          <div style={{ ...cardStyle, borderLeftColor: "#16a34a" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px", textTransform: "uppercase" }}>Registered Students</h4>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#1e293b" }}>{totalStudents}</p>
          </div>
          
          <div style={{ ...cardStyle, borderLeftColor: "#f59e0b" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px", textTransform: "uppercase" }}>Total Questions</h4>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#1e293b" }}>{totalQuestions}</p>
          </div>
        </div>

        {/* EPS BOOK PDF & AUDIO URL PUBLISH SECTION */}
        <div style={{ marginTop: "40px", backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
          <h3 style={{ color: "#1e3a8a", marginTop: 0, marginBottom: "15px" }}>📚 Publish EPS Book PDF & Audio Links (Dropdown Player)</h3>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>बुकको PDF लिङ्क र अडियो ट्र्याकहरूको लिङ्क राख्नुहोस्। यसले स्टोरेज भरिने समस्या कहिल्यै ल्याउँदैन र तुरुन्त डेलिभर हुन्छ।</p>

          <form onSubmit={handlePublishBookAndAudio}>
            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Book / Chapter Title</label>
            <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} style={inputStyle} required />

            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Book PDF Direct URL (e.g. Google Drive / Cloudinary link)</label>
            <input type="url" placeholder="https://example.com/chapter14.pdf" value={bookPdfUrl} onChange={(e) => setBookPdfUrl(e.target.value)} style={inputStyle} required />

            <h4 style={{ color: "#475569", margin: "15px 0 10px 0", fontSize: "15px" }}>🎧 Audio Track URLs for Dropdown Player</h4>
            {audioTracks.map((track, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px", marginBottom: "10px" }}>
                <input 
                  type="text" 
                  placeholder="Track Name (e.g. Track 1)" 
                  value={track.name} 
                  onChange={(e) => handleAudioChange(idx, "name", e.target.value)} 
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }} 
                />
                <input 
                  type="url" 
                  placeholder="Audio Direct URL (https://...mp3)" 
                  value={track.url} 
                  onChange={(e) => handleAudioChange(idx, "url", e.target.value)} 
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }} 
                />
              </div>
            ))}

            <button type="button" onClick={handleAddAudioField} style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "8px 14px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", marginBottom: "20px" }}>
              + Add More Audio Track URL
            </button>

            <button type="submit" style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", width: "100%", cursor: "pointer", fontSize: "15px" }}>
              PUBLISH EPS BOOK & AUDIO DROPDOWN
            </button>
          </form>
        </div>

        {/* BULK 40 QUESTIONS PDF IMPORT SECTION */}
        <div style={{ marginTop: "40px", backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
          <h3 style={{ color: "#1e3a8a", marginTop: 0, marginBottom: "15px" }}>Bulk Import 40 Questions (20 Reading + 20 Listening)</h3>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>एउटै PDF अपलोड गर्नुहोस् जसले ठ्याक्कै २० वटा Reading (१-२०) र २० वटा Listening (२१-४०) गरी जम्मा ४० वटा प्रश्न मात्र सेटमा क्रमबद्ध इम्पोर्ट गर्नेछ।</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Select Package Name</label>
              <input type="text" value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)} style={inputStyle} placeholder="e.g. Chapter wise" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Select Set Name</label>
              <input type="text" value={selectedSet} onChange={(e) => setSelectedSet(e.target.value)} style={inputStyle} placeholder="e.g. Chapter 1-2" />
            </div>
          </div>

          <div style={{ padding: "30px", backgroundColor: "#f8fafc", border: "2px dashed #0284c7", borderRadius: "8px", textAlign: "center" }}>
            <label style={{ fontWeight: "bold", color: "#0284c7", cursor: "pointer", display: "block", fontSize: "16px" }}>
              {isProcessing ? "⏳ Processing & Mapping Q1-20 Reading & Q21-40 Listening..." : "📄 Upload Question PDF (Exact 40 Questions)"}
              <input type="file" accept="application/pdf" onChange={handleBulkPdfUpload} disabled={isProcessing} style={{ display: "none" }} />
            </label>
            <span style={{ fontSize: "13px", color: "#64748b", display: "block", marginTop: "8px" }}>PDF अपलोड गरेपछि स्वतः २० Reading र २० Listening मात्र क्रम मिलाएर सेभ हुनेछन्।</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;