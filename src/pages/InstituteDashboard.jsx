import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const InstituteDashboard = () => {
  const navigate = useNavigate();
  const instituteName = localStorage.getItem("currentInstitute") || "Language Institute";

  const [activeTab, setActiveTab] = useState("students"); 
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null); 
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    password: "", 
    assignedPackage: "Chapterwise 30 set",
    expiryDuration: "1 Month" 
  });

  // Dictionary states
  const [searchWord, setSearchWord] = useState("");
  const [vocabResult, setVocabResult] = useState({ korean: "", english: "", nepali: "" });
  const [loadingVocab, setLoadingVocab] = useState(false);

  // Exam Sets states
  const [examSets, setExamSets] = useState([]);
  const [examPackages, setExamPackages] = useState([]);
  const [selectedPackageFilter, setSelectedPackageFilter] = useState("All");

  // EPS Folders & Listening/Book states
  const [activeBookFolder, setActiveBookFolder] = useState("EPS Book");
  const [folderMaterials, setFolderMaterials] = useState([]);
  const [selectedAudioTracks, setSelectedAudioTracks] = useState({});

  // News states
  const [newsList, setNewsList] = useState([]);
  const [showBannerPopup, setShowBannerPopup] = useState(false);
  const [popupNotice, setPopupNotice] = useState(null);

  const institutes = JSON.parse(localStorage.getItem("institutes")) || [];
  const currentInst = institutes.find(i => i.name === instituteName);
  const logoWatermark = currentInst?.logoUrl || "";

  const loadData = () => {
    const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    setStudents(allStudents[instituteName] || []);

    const savedPackages = JSON.parse(localStorage.getItem("examPackages")) || [];
    const savedSets = JSON.parse(localStorage.getItem("examSets")) || [];
    const allFoldersData = JSON.parse(localStorage.getItem("epsFoldersContent")) || {};
    const savedNews = JSON.parse(localStorage.getItem("epsNewsList")) || [];

    setExamPackages(savedPackages);
    setExamSets(savedSets);
    setFolderMaterials(allFoldersData[activeBookFolder] || []);
    setNewsList(savedNews);

    const popup = savedNews.find(n => n.isPopup);
    if (popup) {
      const lastShownId = localStorage.getItem("lastShownInstitutePopupId");
      if (lastShownId !== popup.id.toString()) {
        setPopupNotice(popup);
        setShowBannerPopup(true);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, instituteName, activeBookFolder]);

  const handleCloseBanner = () => {
    if (popupNotice) {
      localStorage.setItem("lastShownInstitutePopupId", popupNotice.id.toString());
    }
    setShowBannerPopup(false);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem("currentInstitute");
    localStorage.removeItem("lastShownInstitutePopupId");
    navigate("/");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fixed translation handler using script-range verification for Nepali (Devanagari) input
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

      setVocabResult({ korean: koText, english: enText, nepali: neText });
    } catch (err) {
      console.error("Translation error", err);
      alert("Translation failed. Please check your network.");
    }
    setLoadingVocab(false);
  };

  const calculateExpiryDate = (duration) => {
    if (duration === "Lifetime") return "Lifetime";
    const date = new Date();
    if (duration === "15 Days") date.setDate(date.getDate() + 15);
    else if (duration === "1 Month") date.setMonth(date.getMonth() + 1);
    else if (duration === "2 Months") date.setMonth(date.getMonth() + 2);
    else if (duration === "3 Months") date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0]; 
  };

  const handleSubmitStudent = (e) => {
    e.preventDefault();
    const calculatedExpiryDate = calculateExpiryDate(formData.expiryDuration);
    const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    const currentInstStudents = allStudents[instituteName] || [];
    
    let updatedStudents;
    if (editId) {
      updatedStudents = currentInstStudents.map((stu) => 
        stu.id === editId ? { ...stu, ...formData, expiryDate: calculatedExpiryDate } : stu
      );
      alert("✅ Student Updated Successfully!");
    } else {
      const exists = currentInstStudents.some(s => s.phone === formData.phone);
      if (exists) {
        alert("❌ This student phone number is already registered!");
        return;
      }
      const newStudent = {
        id: Date.now(),
        ...formData,
        expiryDate: calculatedExpiryDate,
        status: "Active"
      };
      updatedStudents = [...currentInstStudents, newStudent];
      alert("✅ Student Added Successfully!");
    }

    allStudents[instituteName] = updatedStudents;
    localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
    setStudents(updatedStudents);

    const globalUsers = JSON.parse(localStorage.getItem("users")) || {};
    globalUsers[formData.phone] = { name: formData.name, password: formData.password };
    localStorage.setItem("users", JSON.stringify(globalUsers));

    resetForm();
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      phone: student.phone,
      password: student.password,
      assignedPackage: student.assignedPackage || "Chapterwise 30 set",
      expiryDuration: student.expiryDuration || "1 Month"
    });
    setEditId(student.id);
    setShowForm(true);
    setActiveTab("students");
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this student?")) {
      const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
      const currentInstStudents = allStudents[instituteName] || [];
      const updatedStudents = currentInstStudents.filter(stu => stu.id !== id);
      allStudents[instituteName] = updatedStudents;
      localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
      setStudents(updatedStudents);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", password: "", assignedPackage: "Chapterwise 30 set", expiryDuration: "1 Month" });
    setEditId(null);
    setShowForm(false);
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
    color: activeTab === tabName ? "white" : "#93c5fd",
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
  const tdStyle = { padding: "15px", borderBottom: "1px solid #e2e8f0", color: "#1e293b", verticalAlign: "middle" };
  const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #cbd5e1", borderRadius: "5px", boxSizing: "border-box", backgroundColor: "white" };

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
                <audio controls autoPlay src={popupNotice.fileUrl} style={{ width: "100%", height: "35px" }} />
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
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>INSTITUTE PANEL ({instituteName})</div>
        
        <div style={menuContainerStyle}>
          <button onClick={() => handleTabChange("students")} style={getNavBtnStyle("students")}>Manage Students</button>
          <button onClick={() => handleTabChange("exams")} style={getNavBtnStyle("exams")}>UBT Exam Sets</button>
          <button onClick={() => handleTabChange("listening")} style={getNavBtnStyle("listening")}>EPS Book</button>
          <button onClick={() => handleTabChange("dictionary")} style={getNavBtnStyle("dictionary")}>Dictionary</button>
          <button onClick={() => handleTabChange("news")} style={getNavBtnStyle("news")}>EPS Notices</button>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Logout</button>
      </div>

      <div style={contentAreaStyle}>
        
        {activeTab === "students" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ color: "#475569", margin: 0, fontSize: "18px" }}>My Enrolled Students</h3>
              <button onClick={() => showForm ? resetForm() : setShowForm(true)} style={{ backgroundColor: showForm ? "#ef4444" : "#16a34a", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                {showForm ? "Cancel" : "+ Add New Student"}
              </button>
            </div>

            {showForm && (
              <div style={cardStyle}>
                <h4 style={{ margin: "0 0 15px 0", color: "#1e293b" }}>{editId ? "Update Student Details" : "Register Student under " + instituteName}</h4>
                <form onSubmit={handleSubmitStudent} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Student Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle} placeholder="Enter student name" />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Phone Number (Login ID)</label>
                    <input type="number" name="phone" value={formData.phone} onChange={handleInputChange} required style={inputStyle} placeholder="Enter phone number" />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Password</label>
                    <input type="text" name="password" value={formData.password} onChange={handleInputChange} required style={inputStyle} placeholder="Create password" />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Assigned Package</label>
                    <select name="assignedPackage" value={formData.assignedPackage} onChange={handleInputChange} style={inputStyle}>
                      <option value="Chapterwise 30 set">Chapterwise 30 set</option>
                      <option value="Chapterwise 12 set">Chapterwise 12 set</option>
                      <option value="100 UBT set">100 UBT set</option>
                      <option value="Full Package">Full Package</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Package Expiry Duration</label>
                    <select name="expiryDuration" value={formData.expiryDuration} onChange={handleInputChange} style={inputStyle}>
                      <option value="15 Days">15 Days</option>
                      <option value="1 Month">1 Month</option>
                      <option value="3 Months">3 Months</option>
                      <option value="Lifetime">Lifetime</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <button type="submit" style={{ backgroundColor: editId ? "#f59e0b" : "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                      {editId ? "Update Student" : "Save Student"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Student Name</th>
                  <th style={thStyle}>Phone Number</th>
                  <th style={thStyle}>Package & Expiry</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan="5" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>No students registered yet.</td></tr>
                ) : (
                  students.map((stu) => (
                    <tr key={stu.id}>
                      <td style={{ ...tdStyle, fontWeight: "bold" }}>{stu.name}</td>
                      <td style={tdStyle}>{stu.phone}</td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: "bold", color: "#2563eb" }}>{stu.assignedPackage}</span>
                        <br/><span style={{ fontSize: "12px", color: "#ef4444" }}>Ends: {stu.expiryDate}</span>
                      </td>
                      <td style={tdStyle}><span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>{stu.status}</span></td>
                      <td style={tdStyle}>
                        <button onClick={() => handleEdit(stu)} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", marginRight: "5px", cursor: "pointer", fontSize: "12px" }}>Edit</button>
                        <button onClick={() => handleDelete(stu.id)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "exams" && (
          <div>
            <h3 style={{ color: "#475569", marginTop: 0, fontSize: "18px" }}>UBT Exam Sets & Packages Overview</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", marginTop: "15px" }}>
              <button onClick={() => setSelectedPackageFilter("All")} style={{ padding: "8px 16px", backgroundColor: selectedPackageFilter === "All" ? "#1e3a8a" : "white", color: selectedPackageFilter === "All" ? "white" : "#1e3a8a", border: "1px solid #1e3a8a", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>All Sets</button>
              {examPackages.map((pkg, idx) => (
                <button key={idx} onClick={() => setSelectedPackageFilter(pkg.name)} style={{ padding: "8px 16px", backgroundColor: selectedPackageFilter === pkg.name ? "#1e3a8a" : "white", color: selectedPackageFilter === pkg.name ? "white" : "#1e3a8a", border: "1px solid #1e3a8a", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>{pkg.name}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              {filteredSets.length === 0 ? (
                <p style={{ color: "#64748b", gridColumn: "1 / -1", textAlign: "center", padding: "30px", background: "white", borderRadius: "8px" }}>No exam sets available.</p>
              ) : (
                filteredSets.map((set) => (
                  <div key={set.id} style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", padding: "20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#475569", background: "#cbd5e1", padding: "2px 6px", borderRadius: "4px" }}>{set.packageName || "UBT-TEST"}</span>
                    <h4 style={{ margin: "10px 0", fontSize: "16px", color: "#1e293b" }}>{set.name}</h4>
                    <button onClick={() => navigate(`/institute/exam-preview/${set.id}`)} style={{ width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>PREVIEW EXAM</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "listening" && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#1e293b", marginBottom: "20px" }}>EPS Study Materials & Library</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "30px" }}>
              {[
                { name: "EPS Book", icon: "📚", color: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", desc: "Official textbooks & audio" },
                { name: "Model Question", icon: "📝", color: "linear-gradient(135deg, #10b981 0%, #047857 100%)", desc: "Practice exam sets" },
                { name: "Notes", icon: "📒", color: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)", desc: "Important study notes" },
                { name: "Chapterwise Meaning", icon: "💡", color: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", desc: "Vocabulary & definitions" }
              ].map((folder) => {
                const isSelected = activeBookFolder === folder.name;
                return (
                  <div
                    key={folder.name}
                    onClick={() => setActiveBookFolder(folder.name)}
                    style={{
                      background: folder.color,
                      color: "white",
                      padding: "20px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 8px 20px rgba(0,0,0,0.2)" : "0 4px 10px rgba(0,0,0,0.08)",
                      border: isSelected ? "3px solid #ffffff" : "3px solid transparent",
                      transform: isSelected ? "translateY(-3px)" : "none",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "30px" }}>{folder.icon}</span>
                      {isSelected && <span style={{ backgroundColor: "white", color: "#1e3a8a", fontSize: "10px", fontWeight: "bold", padding: "3px 8px", borderRadius: "10px" }}>ACTIVE</span>}
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "17px", fontWeight: "bold" }}>{folder.name}</h4>
                      <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>{folder.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <h4 style={{ color: "#1e3a8a", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px", marginTop: "10px" }}>[{activeBookFolder}] Materials</h4>

            {folderMaterials.length === 0 ? (
              <p style={{ color: "#64748b", padding: "20px 0" }}>No materials available in {activeBookFolder} yet.</p>
            ) : (
              <div>
                {folderMaterials.map(item => {
                  const currentTrack = selectedAudioTracks[item.id] || "";
                  return (
                    <div key={item.id} style={{ marginBottom: "35px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1", overflow: "hidden" }}>
                      
                      <div style={{ backgroundColor: "#1e3a8a", color: "white", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{ fontSize: "15px", fontWeight: "bold" }}>📖 {item.title}</div>
                        
                        {item.audioFiles && item.audioFiles.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, maxWidth: "450px" }}>
                            <select 
                              value={currentTrack} 
                              onChange={(e) => setSelectedAudioTracks({ ...selectedAudioTracks, [item.id]: e.target.value })}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "none", backgroundColor: "white", color: "#1e293b", fontWeight: "bold", cursor: "pointer" }}
                            >
                              <option value="">🎧 Select Audio Track...</option>
                              {item.audioFiles.map((audio, aIdx) => (
                                <option key={aIdx} value={audio.url}>{audio.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {currentTrack && (
                          <div>
                            <audio controls autoPlay src={currentTrack} style={{ height: "32px" }} />
                          </div>
                        )}
                      </div>

                      <div style={{ padding: "20px" }}>
                        {item.pdfFile ? (
                          <iframe src={item.pdfFile} title={item.title} style={{ width: "100%", height: "550px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "white" }} />
                        ) : (
                          <p style={{ color: "#64748b" }}>No PDF file attached.</p>
                        )}
                        {item.notesText && <p style={{ fontSize: "14px", color: "#475569", marginTop: "15px", whiteSpace: "pre-line" }}>{item.notesText}</p>}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DICTIONARY TAB */}
        {activeTab === "dictionary" && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#1e293b", marginBottom: "15px" }}>Korean Dictionary & Vocabulary</h3>
            <form onSubmit={handleSearchVocabulary} style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
              <input 
                type="text" 
                placeholder="Type a word in Nepali (नेपाली), Korean (한국어), or English..." 
                value={searchWord} 
                onChange={(e) => setSearchWord(e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                required
              />
              <button type="submit" disabled={loadingVocab} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
                {loadingVocab ? "Searching..." : "🔍 Search"}
              </button>
            </form>

            <h4 style={{ color: "#475569", marginBottom: "15px" }}>Translation Results:</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px" }}>
              <div style={{ backgroundColor: "#f8fafc", padding: "15px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", display: "block", marginBottom: "5px" }}>KOREAN</span>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1e293b" }}>{vocabResult.korean || "-"}</div>
              </div>
              <div style={{ backgroundColor: "#f8fafc", padding: "15px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", display: "block", marginBottom: "5px" }}>ENGLISH</span>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb" }}>{vocabResult.english || "-"}</div>
              </div>
              <div style={{ backgroundColor: "#f8fafc", padding: "15px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", display: "block", marginBottom: "5px" }}>NEPALI (नेपाली)</span>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#16a34a" }}>{vocabResult.nepali || "-"}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div>
            <div style={{ marginBottom: "35px" }}>
             <h1 style={{ color: "#1e293b", marginBottom: "20px", textAlign: "center" }}>Notice Board & Official Portals</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
              </div>

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
              <h1 style={{ marginTop: 0, color: "#1e293b", marginBottom: "20px" }}>Institute Notice</h1>
              {newsList.length === 0 ? (
                <p style={{ color: "#64748b" }}>No notices available.</p>
              ) : (
                <div>
                  {newsList.map(item => (
                    <div key={item.id} style={{ marginBottom: "20px", padding: "15px", backgroundColor: item.isPopup ? "#eff6ff" : "#f8fafc", border: item.isPopup ? "2px solid #2563eb" : "1px solid #cbd5e1", borderRadius: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <h4 style={{ margin: 0, color: "#1e3a8a", fontSize: "16px" }}>{item.title}</h4>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{item.date}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.5", whiteSpace: "pre-line" }}>{item.content}</p>

                      {item.fileUrl && item.fileType === "audio" && (
                        <div style={{ marginTop: "10px" }}>
                          <audio controls src={item.fileUrl} style={{ width: "100%", height: "32px" }} />
                        </div>
                      )}
                      {item.fileUrl && item.fileType === "video" && (
                        <div style={{ marginTop: "10px" }}>
                          <video controls src={item.fileUrl} style={{ width: "100%", maxHeight: "200px", borderRadius: "6px" }} />
                        </div>
                      )}
                      {item.fileUrl && item.fileType === "image" && (
                        <div style={{ marginTop: "10px" }}>
                          <img src={item.fileUrl} alt="Notice" style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "6px" }} />
                        </div>
                      )}
                      {item.fileUrl && item.fileType === "document" && (
                        <div style={{ marginTop: "10px" }}>
                          <a href={item.fileUrl} download="Notice_Document" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", fontWeight: "bold", color: "#2563eb", textDecoration: "none" }}>
                            📥 Download Attached Document
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

      </div>
    </div>
  );
};

export default InstituteDashboard;