import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const ListeningAudio = () => {
  const navigate = useNavigate();
  const [activeFolder, setActiveFolder] = useState("EPS Book");
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states & Edit tracking
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [audioInputUrl, setAudioInputUrl] = useState("");
  const [audioInputName, setAudioInputName] = useState("");
  const [audioFiles, setAudioFiles] = useState([]); 
  const [pdfFileUrl, setPdfFileUrl] = useState("");
  const [notesText, setNotesText] = useState("");

  // Student view reader & audio playback state
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  const institutes = JSON.parse(localStorage.getItem("institutes")) || [];
  const logoWatermark = institutes[0]?.logoUrl || "";

  const loadFolderContent = () => {
    setIsLoading(true);
    try {
      const allFolders = JSON.parse(localStorage.getItem("epsFoldersContent")) || {};
      setMaterials(allFolders[activeFolder] || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadFolderContent();
    handleCancelEdit();
    setSelectedMaterial(null);
  }, [activeFolder]);

  useEffect(() => {
    if (selectedMaterial && selectedMaterial.audioFiles && selectedMaterial.audioFiles.length > 0) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [selectedMaterial, currentAudioIndex]);

  const handleLogout = () => {
    navigate("/");
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
          // PDF लाई फुल विथमा फिट गराउन rm=minimal र view=FitH थपिएको छ
          return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal#view=FitH`;
        }
      }
    }
    return url;
  };

  const handleAddAudioTrack = () => {
    if (!audioInputUrl.trim()) {
      alert("⚠️ कृपया अडियोको लिङ्क (URL) राख्नुहोस्।");
      return;
    }
    const formattedUrl = convertToDirectUrl(audioInputUrl, "audio");
    const trackName = audioInputName.trim() || `Track ${audioFiles.length + 1}`;
    setAudioFiles([...audioFiles, { name: trackName, url: formattedUrl }]);
    setAudioInputUrl("");
    setAudioInputName("");
  };

  const handleSaveMaterial = (e) => {
    e.preventDefault();
    if (!title.trim() || !pdfFileUrl.trim()) {
      alert("⚠️ कृपया शीर्षक (Title) र PDF को लिङ्क अनिवार्य रूपमा भर्नुहोस्।");
      return;
    }

    setIsLoading(true);
    try {
      const formattedPdfUrl = convertToDirectUrl(pdfFileUrl, "pdf");
      const allFolders = JSON.parse(localStorage.getItem("epsFoldersContent")) || {};
      const folderList = allFolders[activeFolder] || [];
      let updatedFolderList;

      if (editingId !== null) {
        updatedFolderList = folderList.map(item => {
          if (item.id === editingId) {
            return {
              ...item,
              title,
              coverImage: coverImage || item.coverImage,
              audioFiles: audioFiles.length > 0 ? audioFiles.map(a => ({ ...a, url: convertToDirectUrl(a.url, "audio") })) : item.audioFiles,
              pdfFile: formattedPdfUrl,
              notesText
            };
          }
          return item;
        });
        alert("✅ सामग्री सफलतापूर्वक अपडेट भयो!");
      } else {
        const processedAudioFiles = audioFiles.map(a => ({ ...a, url: convertToDirectUrl(a.url, "audio") }));
        const newItem = {
          id: Date.now(),
          title,
          coverImage,
          audioFiles: processedAudioFiles,
          pdfFile: formattedPdfUrl,
          notesText
        };
        updatedFolderList = [newItem, ...folderList];
        alert("✅ नयाँ सामग्री सफलतापूर्वक सेभ भयो!");
      }

      allFolders[activeFolder] = updatedFolderList;
      localStorage.setItem("epsFoldersContent", JSON.stringify(allFolders));

      setMaterials(updatedFolderList);
      handleCancelEdit();
    } catch (err) {
      alert("⚠️ त्रुटि भयो! कृपया फेरि प्रयास गर्नुहोस्।");
    }
    setIsLoading(false);
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCoverImage(item.coverImage || "");
    setAudioFiles(item.audioFiles || []);
    setPdfFileUrl(item.pdfFile || "");
    setNotesText(item.notesText || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setCoverImage("");
    setAudioFiles([]);
    setAudioInputUrl("");
    setAudioInputName("");
    setPdfFileUrl("");
    setNotesText("");
  };

  const handleDelete = (id) => {
    if (window.confirm("के तपाइँ यो सामग्री हटाउन चाहनुहुन्छ?")) {
      const allFolders = JSON.parse(localStorage.getItem("epsFoldersContent")) || {};
      const folderList = allFolders[activeFolder] || [];
      const updatedFolderList = folderList.filter(item => item.id !== id);
      
      allFolders[activeFolder] = updatedFolderList;
      localStorage.setItem("epsFoldersContent", JSON.stringify(allFolders));
      setMaterials(updatedFolderList);

      if (editingId === id) {
        handleCancelEdit();
      }
      alert("🗑️ सामग्री सफलतापूर्वक हटाइयो!");
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback error:", err);
        alert("⚠️ अडियो प्ले गर्न सकिएन। कृपया Google Drive फाइलको अनुमति (Sharing Permission) 'Anyone with the link can view' मा सेट गरिएको छ कि छैन पक्का गर्नुहोस्।");
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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

  // FULLSCREEN READER VIEW WITH STRETCHED FULL WIDTH PDF
  if (selectedMaterial) {
    const hasAudio = selectedMaterial.audioFiles && selectedMaterial.audioFiles.length > 0;
    const currentAudio = hasAudio ? selectedMaterial.audioFiles[currentAudioIndex] : null;

    return (
      <div style={{ ...containerStyle, display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: "#ffffff" }} onContextMenu={(e) => e.preventDefault()}>
        
        {/* Top Header Bar */}
        <div style={{ backgroundColor: "#1e293b", color: "white", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", zIndex: 1100, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button 
              onClick={() => setSelectedMaterial(null)} 
              style={{ background: "none", border: "none", color: "#60a5fa", fontSize: "22px", cursor: "pointer", fontWeight: "bold" }}
            >
              ❮
            </button>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "white" }}>
              EPS TOPIK 2026 - {selectedMaterial.title}
            </h3>
          </div>
        </div>

        {/* Custom Audio Player Bar */}
        {hasAudio && (
          <div style={{ backgroundColor: "#ffffff", padding: "12px 20px", borderBottom: "1px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Play / Pause Toggle Button */}
              <button 
                onClick={togglePlayPause}
                style={{ backgroundColor: "#1e3a8a", color: "white", border: "none", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", fontWeight: "bold", flexShrink: 0 }}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>

              {/* Track Selector Dropdown */}
              <select 
                value={currentAudioIndex}
                onChange={(e) => {
                  setCurrentAudioIndex(Number(e.target.value));
                  setIsPlaying(false);
                }}
                style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "bold", backgroundColor: "#f8fafc" }}
              >
                {selectedMaterial.audioFiles.map((aud, idx) => (
                  <option key={idx} value={idx}>🎧 {aud.name}</option>
                ))}
              </select>
            </div>

            {/* Scrubber and Time Indicators */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "#64748b" }}>
              <span>{formatTime(currentTime)}</span>
              <input 
                type="range" 
                min={0} 
                max={duration || 0} 
                value={currentTime} 
                onChange={handleSeek}
                style={{ flex: 1, cursor: "pointer" }}
              />
              <span>{formatTime(duration)}</span>
            </div>

            {/* Active HTML5 Audio Engine */}
            {currentAudio && (
              <audio 
                ref={audioRef}
                src={currentAudio.url}
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={() => {
                  setIsPlaying(false);
                  alert("⚠️ अडियो फाइल प्ले गर्न सकिएन। कृपया सुनिश्चित गर्नुहोस् कि Google Drive फाइलको अनुमति (Sharing) सबैले हेर्न मिल्ने गरी (Anyone with the link) सेट गरिएको छ।");
                }}
              />
            )}
          </div>
        )}

        {/* Full Width PDF View Container */}
        <div style={{ flex: 1, width: "100vw", height: "100%", position: "relative", backgroundColor: "#ffffff", overflow: "hidden" }}>
          <iframe 
            src={selectedMaterial.pdfFile} 
            title={selectedMaterial.title} 
            style={{ width: "100%", height: "100%", border: "none", display: "block", backgroundColor: "#ffffff" }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      
      {/* STICKY TOP NAVIGATION BAR */}
      <div style={topNavStyle}>
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>STUDENT PORTAL (sigma)</div>
        
        <div style={menuContainerStyle}>
          <Link to="/admin" style={navLinkStyle}>Dashboard</Link>
          <Link to="/admin/institutes" style={navLinkStyle}>Manage Institutes</Link>
          <Link to="/admin/questions" style={navLinkStyle}>Upload Question</Link>
          <Link to="/admin/listening" style={activeNavLinkStyle}>EPS Book</Link>
          <Link to="/admin/news" style={navLinkStyle}>EPS Notices</Link>
          <Link to="/admin/notifications" style={navLinkStyle}>Notifications</Link>
          <Link to="/admin/settings" style={navLinkStyle}>Settings</Link>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Logout</button>
      </div>

      <div style={contentStyle}>
        <h2 style={{ color: "#1e3a8a", marginTop: "10px", marginBottom: "20px" }}>EPS Study Materials & Library</h2>

        {/* Folder Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "25px", flexWrap: "wrap" }}>
          {["EPS Book", "Model Question", "Notes", "Chapterwise Meaning"].map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              style={{
                padding: "10px 20px",
                backgroundColor: activeFolder === folder ? "#1e3a8a" : "white",
                color: activeFolder === folder ? "white" : "#1e3a8a",
                border: "1px solid #1e3a8a",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              📁 {folder}
            </button>
          ))}
        </div>

        {/* Add/Update Material Form */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b", marginBottom: 0 }}>
              {editingId !== null ? `✏️ Edit Material in [${activeFolder}]` : `➕ Add New Material to [${activeFolder}]`}
            </h3>
            {editingId !== null && (
              <button 
                type="button" 
                onClick={handleCancelEdit} 
                style={{ backgroundColor: "#64748b", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveMaterial}>
            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Title / Chapter Name</label>
            <input 
              type="text" 
              placeholder="e.g. Chapter - 04 (동작과 사물)" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={inputStyle} 
              required 
            />

            <label style={{ fontWeight: "bold", fontSize: "13px" }}>PDF Document URL (Google Drive Share Link or Direct URL)</label>
            <input 
              type="url" 
              placeholder="https://drive.google.com/file/d/.../view or direct link" 
              value={pdfFileUrl} 
              onChange={(e) => setPdfFileUrl(e.target.value)} 
              style={inputStyle} 
              required 
            />

            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Add Audio Track URL</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "10px", marginBottom: "15px" }}>
              <input 
                type="text" 
                placeholder="Track Name" 
                value={audioInputName} 
                onChange={(e) => setAudioInputName(e.target.value)} 
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
              />
              <input 
                type="url" 
                placeholder="Audio URL (.mp3)" 
                value={audioInputUrl} 
                onChange={(e) => setAudioInputUrl(e.target.value)} 
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
              />
              <button 
                type="button" 
                onClick={handleAddAudioTrack}
                style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "8px 15px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                + Add Track
              </button>
            </div>

            {audioFiles.length > 0 && (
              <ul style={{ marginBottom: "15px", paddingLeft: "20px", background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                {audioFiles.map((aud, idx) => (
                  <li key={idx} style={{ fontSize: "13px", color: "#16a34a", marginBottom: "4px" }}>🎵 {aud.name}</li>
                ))}
              </ul>
            )}

            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Notes / Description Text</label>
            <textarea 
              placeholder="Enter chapter notes..." 
              value={notesText} 
              onChange={(e) => setNotesText(e.target.value)} 
              style={{ ...inputStyle, height: "80px" }} 
            />

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ backgroundColor: editingId !== null ? "#16a34a" : "#0284c7", color: "white", padding: "12px 20px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", width: "100%", opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "⏳ Processing..." : (editingId !== null ? "Update Material" : "Save Material")}
            </button>
          </form>
        </div>

        {/* Existing Materials List */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: "#1e293b", marginBottom: "20px" }}>[{activeFolder}] Materials</h3>
          {isLoading ? (
            <p style={{ color: "#2563eb", fontWeight: "bold", textAlign: "center", padding: "20px" }}>⏳ Loading materials...</p>
          ) : materials.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>No materials added in this folder yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {materials.map((item, index) => {
                const rowBg = index % 2 === 0 ? "#cbd5e1" : "#fed7aa";
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      backgroundColor: rowBg, 
                      padding: "15px 20px", 
                      borderRadius: "12px", 
                    }}
                  >
                    <div 
                      onClick={() => setSelectedMaterial(item)}
                      style={{ flex: 1, cursor: "pointer", fontSize: "16px", fontWeight: "bold", color: "#1e293b" }}
                    >
                      {item.title}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button 
                        onClick={() => setSelectedMaterial(item)}
                        style={{ 
                          backgroundColor: "#1e3a8a", 
                          color: "white", 
                          border: "none", 
                          padding: "10px 20px", 
                          borderRadius: "20px", 
                          fontWeight: "bold", 
                          fontSize: "14px", 
                          cursor: "pointer"
                        }}
                      >
                        View Pdf
                      </button>

                      <button onClick={() => handleEditClick(item)} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}>Delete</button>
                    </div>
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

export default ListeningAudio;