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
import DictionarySection from "@/components/DictionarySection";
import EpsBookReader from "@/components/EpsBookReader";
import { performLogout } from "@/lib/clientAuth";

const StudentDashboard = () => {
  const router = useRouter();
  const pathname = usePathname(); const location = { pathname, state: {} };

  const [activeTab, setActiveTab] = useState("home"); 
  const [examSets, setExamSets] = useState([]);
  const [examPackages, setExamPackages] = useState([]);
  const [selectedPackageFilter, setSelectedPackageFilter] = useState("All");

  const [activeBookFolder, setActiveBookFolder] = useState("EPS Book");
  const [folderMaterials, setFolderMaterials] = useState([]);
  const [selectedAudioTracks, setSelectedAudioTracks] = useState({});

  const [searchWord, setSearchWord] = useState("");
  const [vocabResult, setVocabResult] = useState(null);
  const [loadingVocab, setLoadingVocab] = useState(false);

  const [newsList, setNewsList] = useState([]);
  const [results, setResults] = useState([]);
  const [showBannerPopup, setShowBannerPopup] = useState(false);
  const [popupNotice, setPopupNotice] = useState(null);
  const [myNotifications, setMyNotifications] = useState([]);
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");

  const institutes = JSON.parse(localStorage.getItem("institutes")) || [];
  const logoWatermark = institutes[0]?.logoUrl || "";
  const studentName = localStorage.getItem("currentUser") || "Student Portal";
  const currentStudentPhone = localStorage.getItem("currentStudentPhone");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  useEffect(() => {
    const savedPackages = JSON.parse(localStorage.getItem("examPackages")) || [
      { id: 1, name: "30 Set Chapter UBT", price: "Rs. 1,000", desc: "Complete chapterwise practice sets with audio." },
      { id: 2, name: "100 UBT set", price: "Rs. 2,500", desc: "Full-length simulated exam packages for real test experience." },
      { id: 3, name: "Full Package", price: "Rs. 4,000", desc: "All chapters, listening tracks, and unlimited UBT sets." }
    ];
    
    const allSets = JSON.parse(localStorage.getItem("examSets")) || [];
    
    // Retrieve students list and institute enrolled students to find active packages assigned by institute
    const studentsList = JSON.parse(localStorage.getItem("studentsList")) || [];
    const allInstituteStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    
    let currentStudent = studentsList.find(s => s.phone === currentStudentPhone);
    let studentInstitute = null;

    if (!currentStudent) {
      for (const instName in allInstituteStudents) {
        const found = (allInstituteStudents[instName] || []).find(s => s.phone === currentStudentPhone);
        if (found) {
          currentStudent = found;
          studentInstitute = instName;
          break;
        }
      }
    }

    // Apply institute custom pricing if available
    let finalizedPackages = savedPackages;
    if (studentInstitute) {
      const instPrices = JSON.parse(localStorage.getItem(`instPrices_${studentInstitute}`) || "{}");
      if (Object.keys(instPrices).length > 0) {
        finalizedPackages = savedPackages.map(p => instPrices[p.name] ? { ...p, price: instPrices[p.name] } : p);
      }
    }

    // Filter exam sets based on what the institute has assigned to this student
    const assignedPackage = currentStudent?.assignedPackage || currentStudent?.package;
    const allowedPackageNames = currentStudent?.assignedPackages || currentStudent?.purchasedPackages || (assignedPackage ? [assignedPackage] : []);

    const accessibleSets = allSets.filter(set => {
      if (allowedPackageNames.length > 0) {
        if (allowedPackageNames.includes(set.packageName)) return true;
        const matchingPkgs = finalizedPackages.filter(p => allowedPackageNames.includes(p.name));
        for (const mp of matchingPkgs) {
          if (mp.includedSets && mp.includedSets.includes(set.name)) return true;
        }
        return false;
      }
      return true;
    });

    const allFoldersData = JSON.parse(localStorage.getItem("epsFoldersContent")) || {};
    const savedNews = JSON.parse(localStorage.getItem("epsNewsList")) || [];
    const savedResults = JSON.parse(localStorage.getItem("examResults")) || [];

    setExamPackages(savedPackages);
    setExamSets(accessibleSets);
    setFolderMaterials(allFoldersData[activeBookFolder] || []);
    setNewsList(savedNews);
    setResults(savedResults);

    const allNotifications = JSON.parse(localStorage.getItem("studentNotifications")) || [];
    setMyNotifications(allNotifications.filter((n) => n.studentName === studentName || (currentStudentPhone && n.studentPhone === currentStudentPhone)));

    const popup = savedNews.find(n => n.isPopup);
    if (popup) {
      const lastShownId = localStorage.getItem("lastShownStudentPopupId");
      if (lastShownId !== popup.id.toString()) {
        setPopupNotice(popup);
        setShowBannerPopup(true);
      }
    }

    // Always fetch latest notices and news from server API
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.notices)) {
          setNewsList(data.notices);
          try {
            localStorage.setItem("epsNewsList", JSON.stringify(data.notices));
          } catch (e) {}
          const livePopup = data.notices.find(n => n.isPopup);
          if (livePopup) {
            const lastShownId = localStorage.getItem("lastShownStudentPopupId");
            if (lastShownId !== livePopup.id.toString()) {
              setPopupNotice(livePopup);
              setShowBannerPopup(true);
            }
          }
        }
      })
      .catch((err) => console.warn("Failed to fetch notices in student dashboard:", err));
  }, [activeTab, activeBookFolder, currentStudentPhone]);

  const handleCloseBanner = () => {
    if (popupNotice) {
      localStorage.setItem("lastShownStudentPopupId", popupNotice.id.toString());
    }
    setShowBannerPopup(false);
  };

  const handleLogout = () => {
    performLogout();
  };

  const findStudentInstitute = () => {
    const allInstitutesStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    for (const [instName, list] of Object.entries(allInstitutesStudents)) {
      if (Array.isArray(list) && list.find((s) => s.phone === currentStudentPhone || s.name === studentName)) {
        return instName;
      }
    }
    return "";
  };

  const pushStudentNotification = (payload) => {
    const requests = JSON.parse(localStorage.getItem("studentNotifications")) || [];
    const newItem = {
      id: Date.now(),
      studentName,
      studentPhone: currentStudentPhone || "",
      instituteName: findStudentInstitute(),
      read: false,
      date: new Date().toLocaleString(),
      ...payload
    };
    const updated = [newItem, ...requests];
    localStorage.setItem("studentNotifications", JSON.stringify(updated));
    setMyNotifications(updated.filter((n) => n.studentName === studentName || (currentStudentPhone && n.studentPhone === currentStudentPhone)));
  };

  const handleBuyRequest = (packageName) => {
    const requests = JSON.parse(localStorage.getItem("examPurchaseRequests")) || [];
    const newReq = {
      id: Date.now(),
      studentName: localStorage.getItem("currentUser") || "Student",
      packageName,
      date: new Date().toLocaleDateString(),
      status: "Pending"
    };
    localStorage.setItem("examPurchaseRequests", JSON.stringify([...requests, newReq]));
    pushStudentNotification({
      type: "purchase",
      subject: `Purchase request: ${packageName}`,
      message: `${studentName} requested to buy the "${packageName}" exam package.`
    });
    alert(`✅ Purchase request for "${packageName}" submitted successfully! Your institute/admin will review and activate it shortly.`);
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notifySubject.trim() || !notifyMessage.trim()) {
      alert("Please fill in both subject and message.");
      return;
    }
    pushStudentNotification({
      type: "message",
      subject: notifySubject.trim(),
      message: notifyMessage.trim()
    });
    setNotifySubject("");
    setNotifyMessage("");
    alert("✅ Your message was sent to the admin panel.");
  };

  // Fixed multi-way translation handler supporting Nepali script recognition
  const handleSearchVocabulary = async (e) => {
    e.preventDefault();
    if (!searchWord.trim()) return;

    setLoadingVocab(true);
    try {
      const isNepali = /[\u0900-\u097F]/.test(searchWord);

      let koText = "";
      let enText = "";
      let neText = "";

      if (isNepali) {
        neText = searchWord;
        const resKo = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ne&tl=ko&dt=t&q=${encodeURIComponent(searchWord)}`);
        const dataKo = await resKo.json();
        koText = dataKo[0]?.[0]?.[0] || "";

        const resEn = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ne&tl=en&dt=t&q=${encodeURIComponent(searchWord)}`);
        const dataEn = await resEn.json();
        enText = dataEn[0]?.[0]?.[0] || "";
      } else {
        const detectRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(searchWord)}`);
        const detectData = await detectRes.json();
        const detectedLang = detectData[2];

        if (detectedLang === 'ko') {
          koText = searchWord;
          const resEn = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(searchWord)}`);
          const dataEn = await resEn.json();
          enText = dataEn[0]?.[0]?.[0] || "";

          const resNe = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=ne&dt=t&q=${encodeURIComponent(searchWord)}`);
          const dataNe = await resNe.json();
          neText = dataNe[0]?.[0]?.[0] || "";
        } else {
          enText = searchWord;
          const resKo = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(searchWord)}`);
          const dataKo = await resKo.json();
          koText = dataKo[0]?.[0]?.[0] || "";

          const resNe = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ne&dt=t&q=${encodeURIComponent(searchWord)}`);
          const dataNe = await resNe.json();
          neText = dataNe[0]?.[0]?.[0] || "";
        }
      }

      setVocabResult({
        korean: koText,
        english: enText,
        nepali: neText
      });
    } catch (err) {
      console.error("Translation error", err);
      alert("Translation failed. Please check your network.");
    }
    setLoadingVocab(false);
  };

  const filteredSets = selectedPackageFilter === "All" 
    ? examSets 
    : examSets.filter(s => s.packageName === selectedPackageFilter);

  const protectedStyle = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none"
  };

  const containerStyle = { 
    minHeight: "100vh", 
    backgroundColor: "rgba(241, 245, 249, 0.92)", 
    fontFamily: "Arial, sans-serif",
    position: "relative",
    backgroundImage: logoWatermark ? `url(${logoWatermark})` : "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "350px",
    backgroundBlendMode: "overlay",
    ...protectedStyle
  };

  const topNavStyle = { 
    backgroundColor: "#1e3a8a", 
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
  
  const getNavBtnStyle = (tabName) => ({
    backgroundColor: activeTab === tabName ? "#2563eb" : "transparent",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    transition: "0.2s"
  });

  const contentAreaStyle = { padding: "30px", maxWidth: "1200px", margin: "0 auto" };
  const cardStyle = { backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: "20px", border: "1px solid #e2e8f0" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderRadius: "8px", overflow: "hidden" };
  const thStyle = { backgroundColor: "#f8fafc", padding: "15px", textAlign: "left", borderBottom: "2px solid #e2e8f0", color: "#475569" };
  const tdStyle = { padding: "15px", borderBottom: "1px solid #e2e8f0", color: "#1e293b" };

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      
      {showBannerPopup && popupNotice && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999999 }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", width: "90%", maxWidth: "500px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", border: "3px solid #2563eb", position: "relative" }}>
            <span style={{ backgroundColor: "#dcfce7", color: "#166534", fontSize: "12px", padding: "3px 10px", borderRadius: "10px", fontWeight: "bold" }}>📢 EPS Notice Flex Banner</span>
            <h2 style={{ color: "#1e3a8a", marginTop: "12px", marginBottom: "10px", fontSize: "22px" }}>{popupNotice.title}</h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "15px" }}>Date: {popupNotice.date}</p>
            <p style={{ color: "#334155", fontSize: "15px", lineHeight: "1.6", marginBottom: "15px", whiteSpace: "pre-line" }}>{popupNotice.content}</p>

            {popupNotice.fileUrl && popupNotice.fileType === "audio" && (
              <div style={{ marginBottom: "15px" }}>
                <audio controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} autoPlay src={popupNotice.fileUrl} style={{ width: "100%", height: "35px" }} />
              </div>
            )}
            {popupNotice.fileUrl && popupNotice.fileType === "video" && (
              <div style={{ marginBottom: "15px" }}>
                <video controls autoPlay src={popupNotice.fileUrl} style={{ width: "100%", maxHeight: "200px", borderRadius: "6px" }} />
              </div>
            )}
            {popupNotice.fileUrl && popupNotice.fileType === "image" && (
              <div style={{ marginBottom: "15px", textAlign: "center" }}>
                <img src={popupNotice.fileUrl} alt="Notice" style={{ maxWidth: "100%", maxHeight: "180px", borderRadius: "6px" }} />
              </div>
            )}
            {popupNotice.fileUrl && (popupNotice.fileType === "document" || popupNotice.fileType === "pdf") && (
              <div style={{ marginBottom: "15px", textAlign: "center" }}>
                <a 
                  href={popupNotice.fileUrl} 
                  download={popupNotice.fileName || "Notice_Document"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: "inline-block", backgroundColor: "#0284c7", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold", fontSize: "13px" }}
                >
                  {popupNotice.fileType === "pdf" ? "📕 View / Download PDF" : "📥 Download Attached Document"}
                </a>
              </div>
            )}

            <button 
              onClick={handleCloseBanner}
              style={{ width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}
            >
              CLOSE & CONTINUE
            </button>
          </div>
        </div>
      )}

      <div style={topNavStyle}>
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>STUDENT PORTAL ({studentName})</div>
        
        <div style={menuContainerStyle}>
          <button onClick={() => setActiveTab("home")} style={getNavBtnStyle("home")}>Dashboard</button>
          <button onClick={() => setActiveTab("exams")} style={getNavBtnStyle("exams")}>Start UBT Exam</button>
          <button onClick={() => setActiveTab("buyExam")} style={getNavBtnStyle("buyExam")}>Buy Exam</button>
          <button onClick={() => setActiveTab("vocab")} style={getNavBtnStyle("vocab")}>Dictionary</button>
          <button onClick={() => setActiveTab("listening")} style={getNavBtnStyle("listening")}>EPS Book</button>
          <button onClick={() => setActiveTab("news")} style={getNavBtnStyle("news")}>EPS Notice</button>
          <button onClick={() => setActiveTab("notify")} style={getNavBtnStyle("notify")}>Notify Admin</button>
          <button onClick={() => setActiveTab("results")} style={getNavBtnStyle("results")}>Performance</button>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Logout</button>
      </div>

      <div style={contentAreaStyle}>
        
        {activeTab === "home" && (
          <div>
            <h2 style={{ textAlign: "center", color: "#1e293b", marginBottom: "35px", fontSize: "32px", fontWeight: "800", letterSpacing: "0.5px" }}>Our Services</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", maxWidth: "1000px", margin: "0 auto" }}>
              
              <div onClick={() => setActiveTab("exams")} style={{ background: "linear-gradient(135deg, #fbcfe8 0%, #93c5fd 100%)", borderRadius: "20px", padding: "35px 20px", textAlign: "center", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ width: "75px", height: "75px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto", fontSize: "32px" }}>👨‍💻⏱️</div>
                <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px", fontWeight: "700" }}>Start UBT Exam</h3>
              </div>

              <div onClick={() => setActiveTab("listening")} style={{ background: "linear-gradient(135deg, #5eead4 0%, #7dd3fc 100%)", borderRadius: "20px", padding: "35px 20px", textAlign: "center", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ width: "75px", height: "75px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto", fontSize: "32px" }}>🟩QB</div>
                <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px", fontWeight: "700" }}>Modal Bank</h3>
              </div>

              <div onClick={() => setActiveTab("results")} style={{ background: "linear-gradient(135deg, #e9d5ff 0%, #fbcfe8 100%)", borderRadius: "20px", padding: "35px 20px", textAlign: "center", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ width: "75px", height: "75px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto", fontSize: "32px" }}>📊</div>
                <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px", fontWeight: "700" }}>Your Performance</h3>
              </div>

              <div onClick={() => setActiveTab("buyExam")} style={{ background: "linear-gradient(135deg, #fef08a 0%, #fed7aa 100%)", borderRadius: "20px", padding: "35px 20px", textAlign: "center", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ width: "75px", height: "75px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto", fontSize: "32px" }}>🤝</div>
                <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px", fontWeight: "700" }}>Buy Exam</h3>
              </div>

              <div onClick={() => setActiveTab("listening")} style={{ background: "linear-gradient(135deg, #fed7aa 0%, #93c5fd 100%)", borderRadius: "20px", padding: "35px 20px", textAlign: "center", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ width: "75px", height: "75px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto", fontSize: "32px" }}>📚</div>
                <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px", fontWeight: "700" }}>EPS Book</h3>
              </div>

              <div onClick={() => setActiveTab("vocab")} style={{ background: "linear-gradient(135deg, #cbd5e1 0%, #93c5fd 100%)", borderRadius: "20px", padding: "35px 20px", textAlign: "center", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ width: "75px", height: "75px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto", fontSize: "32px" }}>📖</div>
                <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px", fontWeight: "700" }}>Dictionary</h3>
              </div>

              <div onClick={() => setActiveTab("notify")} style={{ background: "linear-gradient(135deg, #bae6fd 0%, #c7d2fe 100%)", borderRadius: "20px", padding: "35px 20px", textAlign: "center", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ width: "75px", height: "75px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto", fontSize: "32px" }}>🔔</div>
                <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px", fontWeight: "700" }}>Notify Admin</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === "vocab" && (
          <DictionarySection title="📖 Multi-Language Dictionary" />
        )}

        {activeTab === "news" && (
          <div>
            <div style={{ marginBottom: "35px" }}>
              <h1 style={{ color: "#1e293b", marginBottom: "20px", textAlign: "center" }}>Notice Board & Official Portals</h1>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                <a href="https://eps.hrdkorea.or.kr" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", borderRadius: "12px", padding: "25px 20px", textAlign: "center", textDecoration: "none", color: "white", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}>
                  <div style={{ width: "55px", height: "55px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", fontSize: "24px" }}>📄</div>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Official Notices</h4>
                </a>
                <a href="https://eps.hrdkorea.or.kr" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", borderRadius: "12px", padding: "25px 20px", textAlign: "center", textDecoration: "none", color: "white", boxShadow: "0 4px 12px rgba(2,132,199,0.2)" }}>
                  <div style={{ width: "55px", height: "55px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", fontSize: "24px" }}>📰</div>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Official News</h4>
                </a>
                <a href="https://eps.hrdkorea.or.kr" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", borderRadius: "12px", padding: "25px 20px", textAlign: "center", textDecoration: "none", color: "white", boxShadow: "0 4px 12px rgba(5,150,105,0.2)" }}>
                  <div style={{ width: "55px", height: "55px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", fontSize: "24px" }}>📝</div>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>New Application Portal</h4>
                </a>
                <a href="https://eps.hrdkorea.or.kr" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", borderRadius: "12px", padding: "25px 20px", textAlign: "center", textDecoration: "none", color: "white", boxShadow: "0 4px 12px rgba(217,119,6,0.2)" }}>
                  <div style={{ width: "55px", height: "55px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", fontSize: "24px" }}>🔍</div>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>EPS Result Checker</h4>
                </a>
                <a href="https://eps.hrdkorea.or.kr" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", borderRadius: "12px", padding: "25px 20px", textAlign: "center", textDecoration: "none", color: "white", boxShadow: "0 4px 12px rgba(124,58,237,0.2)" }}>
                  <div style={{ width: "55px", height: "55px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", fontSize: "24px" }}>📋</div>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Job Application Form</h4>
                </a>
                <a href="https://eps.hrdkorea.or.kr" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)", borderRadius: "12px", padding: "25px 20px", textAlign: "center", textDecoration: "none", color: "white", boxShadow: "0 4px 12px rgba(15,118,110,0.2)" }}>
                  <div style={{ width: "55px", height: "55px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", fontSize: "24px" }}>🏛️</div>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>HRD Korea Notice Board</h4>
                </a>
              </div>
            </div>

            <div style={cardStyle}>
              <h1 style={{ color: "#1e293b", marginBottom: "20px", textAlign: "center" }}>Institute Notice</h1>
              {newsList.length === 0 ? (
                <p style={{ color: "#64748b", textAlign:"center" }}>No notices available.</p>
              ) : (
                <div>
                  {newsList.map(item => (
                    <div key={item.id} style={{ marginBottom: "20px", padding: "16px", backgroundColor: item.isPopup ? "#eff6ff" : "#f8fafc", border: item.isPopup ? "2px solid #2563eb" : "1px solid #cbd5e1", borderRadius: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {item.category === "news" ? (
                            <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: "bold", padding: "3px 9px", borderRadius: "10px" }}>
                              📰 Official News
                            </span>
                          ) : (
                            <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: "11px", fontWeight: "bold", padding: "3px 9px", borderRadius: "10px" }}>
                              📢 Notice
                            </span>
                          )}
                          <h4 style={{ margin: 0, color: "#1e3a8a", fontSize: "16px" }}>{item.title}</h4>
                        </div>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{item.date}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.5", whiteSpace: "pre-line" }}>{item.content}</p>

                      {item.fileUrl && item.fileType === "audio" && (
                        <div style={{ marginTop: "12px" }}>
                          <audio controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} src={item.fileUrl} style={{ width: "100%", height: "36px" }} />
                        </div>
                      )}
                      {item.fileUrl && item.fileType === "video" && (
                        <div style={{ marginTop: "12px" }}>
                          <video controls src={item.fileUrl} style={{ width: "100%", maxHeight: "260px", borderRadius: "6px", backgroundColor: "#000" }} />
                        </div>
                      )}
                      {item.fileUrl && item.fileType === "image" && (
                        <div style={{ marginTop: "12px" }}>
                          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                            <img src={item.fileUrl} alt="Notice" style={{ maxWidth: "250px", maxHeight: "180px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                          </a>
                        </div>
                      )}
                      {item.fileUrl && (item.fileType === "document" || item.fileType === "pdf") && (
                        <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <a 
                            href={item.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "bold", backgroundColor: "#2563eb", color: "#ffffff", padding: "6px 14px", borderRadius: "6px", textDecoration: "none" }}
                          >
                            <span>{item.fileType === "pdf" ? "📕" : "📄"}</span> View {item.fileType === "pdf" ? "PDF" : "Document"}
                          </a>
                          <a 
                            href={item.fileUrl} 
                            download={item.fileName || "Notice_Document"} 
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "bold", backgroundColor: "#0284c7", color: "#ffffff", padding: "6px 14px", borderRadius: "6px", textDecoration: "none" }}
                          >
                            <span>📥</span> Download
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "buyExam" && (
          <div>
            <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "20px", fontSize: "22px" }}>Available Exam Packages for Purchase</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {examPackages.map((pkg, idx) => (
                <div key={pkg.id || idx} style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 3px 10px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", padding: "25px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: "bold", color: "#2563eb", background: "#eff6ff", padding: "4px 10px", borderRadius: "20px" }}>PREMIUM PACKAGE</span>
                    <h4 style={{ margin: "15px 0 10px 0", fontSize: "20px", color: "#1e293b" }}>{pkg.name}</h4>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.5", marginBottom: "20px" }}>{pkg.desc || "Access full UBT examination sets, listening audio files, and detailed performance metrics."}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: "#16a34a", marginBottom: "15px" }}>{pkg.price || "Rs. 1,500"}</div>
                    <button onClick={() => handleBuyRequest(pkg.name)} style={{ width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
                      REQUEST PURCHASE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div>
            <h3 style={{ color: "#475569", marginTop: 0, fontSize: "18px" }}>Available UBT Exam Sets (Institute Package Access)</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", marginTop: "15px" }}>
              <button onClick={() => setSelectedPackageFilter("All")} style={{ padding: "8px 16px", backgroundColor: selectedPackageFilter === "All" ? "#1e3a8a" : "white", color: selectedPackageFilter === "All" ? "white" : "#1e3a8a", border: "1px solid #1e3a8a", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>All Sets</button>
              {examPackages.map((pkg, idx) => (
                <button key={idx} onClick={() => setSelectedPackageFilter(pkg.name)} style={{ padding: "8px 16px", backgroundColor: selectedPackageFilter === pkg.name ? "#1e3a8a" : "white", color: selectedPackageFilter === pkg.name ? "white" : "#1e3a8a", border: "1px solid #1e3a8a", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>{pkg.name}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              {filteredSets.length === 0 ? (
                <p style={{ color: "#64748b", gridColumn: "1 / -1", textAlign: "center", padding: "30px", background: "white", borderRadius: "8px" }}>No exam sets currently assigned by your institute.</p>
              ) : (
                filteredSets.map((set) => (
                  <div key={set.id} style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", padding: "20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#475569", background: "#cbd5e1", padding: "2px 6px", borderRadius: "4px" }}>{set.packageName || "UBT-TEST"}</span>
                    <h4 style={{ margin: "10px 0", fontSize: "16px", color: "#1e293b" }}>{set.name}</h4>
                    <button onClick={() => router.push(`/student/exam/${set.id}`)} style={{ width: "100%", backgroundColor: "#16a34a", color: "white", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>START EXAM</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "listening" && (
          <div style={{ marginTop: "10px", marginBottom: "30px" }}>
            <EpsBookReader mode="student" />
          </div>
        )}

        {activeTab === "notify" && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: "#1e293b", marginBottom: "15px" }}>Send a message to Admin</h3>
              <form onSubmit={handleSendNotification}>
                <input
                  type="text"
                  placeholder="Subject"
                  value={notifySubject}
                  onChange={(e) => setNotifySubject(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box", marginBottom: "12px" }}
                  required
                />
                <textarea
                  placeholder="Write your message, question, or request..."
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  rows={5}
                  style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box", fontFamily: "inherit", marginBottom: "12px" }}
                  required
                />
                <button type="submit" style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px 22px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                  Send to Admin
                </button>
              </form>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: "#1e293b" }}>My sent notifications</h3>
              {myNotifications.length === 0 ? (
                <p style={{ color: "#64748b", margin: 0 }}>You have not sent any messages yet.</p>
              ) : (
                myNotifications.map((item) => (
                  <div key={item.id} style={{ marginBottom: "15px", padding: "15px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                      <h4 style={{ margin: 0, color: "#1e3a8a", fontSize: "15px" }}>{item.subject}</h4>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{item.date}</span>
                    </div>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#334155", whiteSpace: "pre-line" }}>{item.message}</p>
                    {item.adminReply && (
                      <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#ecfdf5", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                        <div style={{ fontSize: "12px", fontWeight: "bold", color: "#047857", marginBottom: "4px" }}>Admin reply {item.repliedAt ? `· ${item.repliedAt}` : ""}</div>
                        <p style={{ margin: 0, color: "#065f46", whiteSpace: "pre-line" }}>{item.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>My Exam Results & Performance Logs</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Exam Set</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Percentage</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan="4" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>No exam results recorded.</td></tr>
                ) : (
                  results.map((res, idx) => (
                    <tr key={idx}>
                      <td style={{ ...tdStyle, fontWeight: "bold" }}>{res.examName || "UBT Set"}</td>
                      <td style={{ ...tdStyle, fontWeight: "bold", color: "#2563eb" }}>{res.score} / {res.total || 40}</td>
                      <td style={tdStyle}>{res.percentage || "0"}%</td>
                      <td style={tdStyle}><span style={{ backgroundColor: res.passed ? "#dcfce7" : "#fee2e2", color: res.passed ? "#166534" : "#991b1b", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>{res.passed ? "Passed" : "Failed"}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;