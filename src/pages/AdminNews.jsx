import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminNews = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPopupBanner, setIsPopupBanner] = useState(false);
  const [mediaFile, setMediaFile] = useState(null); 
  const [fileType, setFileType] = useState("");     

  const institutes = JSON.parse(localStorage.getItem("institutes")) || [];
  const logoWatermark = institutes[0]?.logoUrl || "";

  useEffect(() => {
    const savedNews = JSON.parse(localStorage.getItem("epsNewsList")) || [];
    setNewsList(savedNews);
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("⚠️ यो फाइल धेरै ठूलो छ! कृपया ४MB भन्दा सानो फाइल (अडियो, भिडियो, इमेज वा पीडीएफ) मात्र अपलोड गर्नुहोस्, अन्यथा ब्राउजरको स्टोरेजमा सेभ हुन सक्दैन।");
        e.target.value = "";
        return;
      }

      const mimeType = file.type;
      let detectedType = "document";
      if (mimeType.startsWith("video/")) detectedType = "video";
      else if (mimeType.startsWith("audio/")) detectedType = "audio";
      else if (mimeType.startsWith("image/")) detectedType = "image";

      setFileType(detectedType);

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaFile(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNews = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("कृपया शीर्षक र विवरण (Title and Content) दुवै भर्नुहोस्!");
      return;
    }

    const newItem = {
      id: Date.now(),
      title,
      content,
      isPopup: isPopupBanner,
      fileUrl: mediaFile,
      fileType: fileType,
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [newItem, ...newsList];
    setNewsList(updated);
    
    localStorage.setItem("epsNewsList", JSON.stringify(updated));

    setTitle("");
    setContent("");
    setIsPopupBanner(false);
    setMediaFile(null);
    setFileType("");
    
    const fileInput = document.getElementById("noticeFileInput");
    if (fileInput) fileInput.value = "";

    alert("✅ EPS Notice सफलतापूर्वक पब्लिश भयो र स्टुडेन्ट तथा इन्स्टिच्युट ड्यासबोर्डमा पठाइयो!");
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this news notice?")) {
      const updated = newsList.filter(n => n.id !== id);
      setNewsList(updated);
      localStorage.setItem("epsNewsList", JSON.stringify(updated));
    }
  };

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

  const contentStyle = { padding: "30px", maxWidth: "1200px", margin: "0 auto" };
  const cardStyle = { backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: "25px", border: "1px solid #e2e8f0" };
  const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", backgroundColor: "white" };

  // ग्राफिक कार्डहरूको लागि स्टाइल
  const graphicCardStyle = (gradient) => ({
    background: gradient,
    borderRadius: "16px",
    padding: "25px 15px",
    color: "white",
    textAlign: "center",
    textDecoration: "none",
    boxShadow: "0 8px 15px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  });

  const iconCircleStyle = {
    width: "60px",
    height: "60px",
    backgroundColor: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    marginBottom: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  };

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      
      {/* STICKY TOP NAVIGATION BAR */}
      <div style={topNavStyle}>
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>SIGMA ADMIN PANEL</div>
        
        <div style={menuContainerStyle}>
          <Link to="/admin" style={navLinkStyle}>Dashboard</Link>
          <Link to="/admin/institutes" style={navLinkStyle}>Manage Institutes</Link>
          <Link to="/admin/questions" style={navLinkStyle}>Upload Question</Link>
          <Link to="/admin/listening" style={navLinkStyle}>EPS Book</Link>
          <Link to="/admin/news" style={activeNavLinkStyle}>EPS Notices</Link>
          <Link to="/admin/notifications" style={navLinkStyle}>Notifications</Link>
          <Link to="/admin/settings" style={navLinkStyle}>Settings</Link>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Logout</button>
      </div>

      <div style={contentStyle}>
        <h2 style={{ color: "#1e3a8a", marginTop: "10px", marginBottom: "20px", textAlign: "center" }}>Notice Board & Official Portals</h2>

        {/* OFFICIAL PORTALS GRAPHIC CARDS SECTION */}
        <div style={{ marginBottom: "35px" }}>
          <h3 style={{ color: "#1e293b", marginBottom: "15px", fontSize: "18px" }}>🌐 Official EPS & Government Links</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px" }}>
            
            <a href="https://epsnepal.gov.np/notices" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)")}>
              <div style={iconCircleStyle}>📄</div>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "bold" }}>Official Notices</h4>
            </a>

            <a href="https://epsnepal.gov.np/news" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #0284c7 0%, #0369a1 100%)")}>
              <div style={iconCircleStyle}>📰</div>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "bold" }}>Official News</h4>
            </a>

            <a href="https://eoers.epsnepal.gov.np/" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #10b981 0%, #047857 100%)")}>
              <div style={iconCircleStyle}>📝</div>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "bold" }}>New Application Portal</h4>
            </a>

            <a href="https://epstopik.hrdkorea.or.kr/epstopik/pass/candidate/sucessReportList.do?lang=en" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #f59e0b 0%, #b45309 100%)")}>
              <div style={iconCircleStyle}>🔍</div>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "bold" }}>EPS Result Checker</h4>
            </a>

            <a href="https://epsnepal.gov.np/jobappform/" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)")}>
              <div style={iconCircleStyle}>📋</div>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "bold" }}>Job Application Form</h4>
            </a>

            <a href="https://epstopik.hrdkorea.or.kr/epstopik/cust/aid/NoticeList.do?lang=en" target="_blank" rel="noopener noreferrer" style={graphicCardStyle("linear-gradient(135deg, #0f766e 0%, #115e59 100%)")}>
              <div style={iconCircleStyle}>🏛️</div>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "bold" }}>HRD Korea Notice Board</h4>
            </a>

          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: "#1e293b" }}>Publish New System Notice</h3>
          <form onSubmit={handleSaveNews}>
            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Notice Title</label>
            <input type="text" placeholder="e.g. TOPIK Exam Application Notice" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />

            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Notice Content / Details</label>
            <textarea placeholder="Enter notice description..." value={content} onChange={(e) => setContent(e.target.value)} style={{ ...inputStyle, height: "100px" }} required />

            {/* File & Media Attachment Input */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "bold", fontSize: "13px", color: "#334155", marginBottom: "5px" }}>Attach Media File (Audio, Video, PDF, Image)</label>
              <input 
                id="noticeFileInput"
                type="file" 
                accept="audio/*,video/*,image/*,application/pdf"
                onChange={handleFileChange} 
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", boxSizing: "border-box" }} 
              />
              <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>Supports MP3 audio, MP4 video, images, and documents (Under 4MB).</span>
            </div>

            {/* Checkbox for Pop-up Flex Banner */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
              <input 
                type="checkbox" 
                id="popupCheck" 
                checked={isPopupBanner} 
                onChange={(e) => setIsPopupBanner(e.target.checked)} 
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="popupCheck" style={{ fontSize: "14px", fontWeight: "bold", color: "#1e3a8a", cursor: "pointer" }}>
                📢 Show as Pop-up Flex Banner on Student Dashboard
              </label>
            </div>

            <button type="submit" style={{ backgroundColor: "#0284c7", color: "white", padding: "12px 20px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", width: "100%" }}>
              Publish Notice
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: "#1e293b" }}>Published Announcements</h3>
          {newsList.length === 0 ? (
            <p style={{ color: "#64748b" }}>No news notices published yet.</p>
          ) : (
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              {newsList.map(item => (
                <li key={item.id} style={{ marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", color: "#1e3a8a", fontSize: "16px" }}>
                      📢 {item.title} {item.isPopup && <span style={{ backgroundColor: "#dcfce7", color: "#166534", fontSize: "11px", padding: "2px 8px", borderRadius: "10px", marginLeft: "10px" }}>Pop-up Banner Active</span>}
                    </span>
                    <button onClick={() => handleDelete(item.id)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                  </div>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Date: {item.date}</span>
                  <p style={{ fontSize: "14px", color: "#475569", margin: "8px 0", whiteSpace: "pre-line" }}>{item.content}</p>

                  {/* Media Preview inside Admin Dashboard */}
                  {item.fileUrl && item.fileType === "audio" && (
                    <div style={{ marginTop: "10px" }}>
                      <audio controls src={item.fileUrl} style={{ width: "100%", height: "35px" }} />
                    </div>
                  )}
                  {item.fileUrl && item.fileType === "video" && (
                    <div style={{ marginTop: "10px" }}>
                      <video controls src={item.fileUrl} style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "6px" }} />
                    </div>
                  )}
                  {item.fileUrl && item.fileType === "image" && (
                    <div style={{ marginTop: "10px" }}>
                      <img src={item.fileUrl} alt="Attachment" style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                    </div>
                  )}
                  {item.fileUrl && item.fileType === "document" && (
                    <div style={{ marginTop: "10px" }}>
                      <a href={item.fileUrl} download="Notice_Document" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", fontWeight: "bold", color: "#2563eb", textDecoration: "none" }}>
                        📥 Download Attached Document
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNews;