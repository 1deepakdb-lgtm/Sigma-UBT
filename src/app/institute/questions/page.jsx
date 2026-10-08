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

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import { performLogout } from "@/lib/clientAuth";

const AdminQuestionManager = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("packages");
  
  const [packages, setPackages] = useState([]);
  const [sets, setSets] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [packageName, setPackageName] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [setName, setSetName] = useState("");

  const [filterPackage, setFilterPackage] = useState("");
  const [filterSet, setFilterSet] = useState("");
  const [questionListType, setQuestionListType] = useState("Reading");
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [audioDragOver, setAudioDragOver] = useState(false);

  const inputRefs = useRef([]);

  const [qForm, setQForm] = useState({
    mainHeading: "",
    questionHeading: "",
    description: "",
    image: "",
    audio: "",
    options: [
      { text: "", audio: "", image: "", video: "" },
      { text: "", audio: "", image: "", video: "" },
      { text: "", audio: "", image: "", video: "" },
      { text: "", audio: "", image: "", video: "" }
    ],
    answer: 0
  });

  const institutes = JSON.parse(localStorage.getItem("institutes")) || [];
  const logoWatermark = institutes[0]?.logoUrl || "";

  useEffect(() => {
    try {
      const savedPackages = JSON.parse(localStorage.getItem("examPackages")) || [];
      const savedSets = JSON.parse(localStorage.getItem("examSets")) || [];
      const savedQuestions = JSON.parse(localStorage.getItem("questionBank")) || [];
      
      setPackages(savedPackages);
      setSets(savedSets);
      setQuestions(savedQuestions);

      if (savedPackages.length > 0) {
        setFilterPackage(savedPackages[0].name);
        setSelectedPackage(savedPackages[0].name);
      }
      if (savedSets.length > 0) {
        setFilterSet(savedSets[0].name);
      }
    } catch (err) {
      console.error("Error loading data from localStorage", err);
    }
  }, []);

  const handleLogout = () => {
    performLogout();
  };

  const handleSavePackage = (e) => {
    e.preventDefault();
    if (!packageName.trim()) return;
    const updated = [...packages, { id: Date.now(), name: packageName }];
    setPackages(updated);
    localStorage.setItem("examPackages", JSON.stringify(updated));
    setPackageName("");
    alert("Package added successfully!");
  };

  const handleDeletePackage = (id) => {
    if (window.confirm("Delete package?")) {
      const updated = packages.filter(p => p.id !== id);
      setPackages(updated);
      localStorage.setItem("examPackages", JSON.stringify(updated));
    }
  };

  const handleSaveSet = (e) => {
    e.preventDefault();
    if (!setName.trim() || !selectedPackage) return;
    const updated = [...sets, { id: Date.now(), name: setName, packageName: selectedPackage }];
    setSets(updated);
    localStorage.setItem("examSets", JSON.stringify(updated));
    setSetName("");
    alert("Set added successfully!");
  };

  const handleDeleteSet = (id) => {
    if (window.confirm("Delete set?")) {
      const updated = sets.filter(s => s.id !== id);
      setSets(updated);
      localStorage.setItem("examSets", JSON.stringify(updated));
    }
  };

  const processFileToDataURL = (file, setter) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setter(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImagePaste = (e, setter) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        processFileToDataURL(blob, setter);
        e.preventDefault();
      }
    }
  };

  const applyUnderline = (idx) => {
    const inputEl = inputRefs.current[idx];
    if (!inputEl) return;

    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    const currentText = qForm.options[idx].text || "";

    if (start === null || end === null || start === end) {
      alert("⚠️ कृपया अप्सन टेक्स्टबाट केही अक्षरहरू चयन (Select) गर्नुहोस्।");
      return;
    }

    const selectedStr = currentText.substring(start, end);
    const newlyFormatted = (selectedStr.startsWith("<u>") && selectedStr.endsWith("</u>")) 
      ? selectedStr.replace(/^<u>|<\/u>$/g, "") 
      : `<u>${selectedStr}</u>`;

    const updatedText = currentText.substring(0, start) + newlyFormatted + currentText.substring(end);

    const newOpts = [...qForm.options];
    newOpts[idx] = { ...newOpts[idx], text: updatedText };
    setQForm({ ...qForm, options: newOpts });

    setTimeout(() => {
      inputEl.focus();
      inputEl.setSelectionRange(start, start + newlyFormatted.length);
    }, 0);
  };

  const handleGenerate40 = () => {
    if (!filterPackage || !filterSet) {
      alert("Please select both a Package and a Set first!");
      return;
    }

    if (window.confirm(`Initialize 40 question list for [${filterPackage} → ${filterSet}]?`)) {
      const batch = [];
      for (let i = 1; i <= 40; i++) {
        const generatedId = Date.now() + i + Math.random();
        batch.push({
          id: generatedId,
          package: filterPackage,
          set: filterSet,
          type: i <= 20 ? "Reading" : "Listening",
          mainHeading: `[${i}] 다음을 읽고 알맞은 것을 고르십시오.`,
          questionHeading: String(generatedId),
          description: "", 
          image: "",
          audio: "",
          options: [
            { text: `Option 1 for Q${i}`, audio: "", image: "", video: "" },
            { text: `Option 2 for Q${i}`, audio: "", image: "", video: "" },
            { text: `Option 3 for Q${i}`, audio: "", image: "", video: "" },
            { text: `Option 4 for Q${i}`, audio: "", image: "", video: "" }
          ],
          answer: 0
        });
      }

      const filtered = questions.filter(q => !(q.package === filterPackage && q.set === filterSet));
      const updated = [...filtered, ...batch];
      setQuestions(updated);
      localStorage.setItem("questionBank", JSON.stringify(updated));
      alert("40 Questions generated successfully!");
    }
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!filterPackage || !filterSet) return;

    const normalizedOptions = qForm.options.map(opt => {
      if (typeof opt === 'string') return { text: opt, audio: "", image: "", video: "" };
      return {
        text: opt.text || "",
        audio: opt.audio || "",
        image: opt.image || "",
        video: opt.video || ""
      };
    });

    const questionPayload = {
      ...qForm,
      options: normalizedOptions,
      package: filterPackage,
      set: filterSet,
      type: questionListType
    };

    if (editingQuestionId) {
      const updated = questions.map(q => q.id === editingQuestionId ? { ...q, ...questionPayload } : q);
      setQuestions(updated);
      localStorage.setItem("questionBank", JSON.stringify(updated));
      setEditingQuestionId(null);
      alert("Question updated successfully!");
    } else {
      const newId = Date.now();
      const newQ = {
        id: newId,
        ...questionPayload,
        questionHeading: questionPayload.questionHeading || String(newId)
      };
      const updated = [...questions, newQ];
      setQuestions(updated);
      localStorage.setItem("questionBank", JSON.stringify(updated));
      alert("Question added successfully!");
    }

    setQForm({
      mainHeading: "",
      questionHeading: "",
      description: "",
      image: "",
      audio: "",
      options: [
        { text: "", audio: "", image: "", video: "" },
        { text: "", audio: "", image: "", video: "" },
        { text: "", audio: "", image: "", video: "" },
        { text: "", audio: "", image: "", video: "" }
      ],
      answer: 0
    });
  };

  const handleEditClick = (q) => {
    setEditingQuestionId(q.id);
    setQuestionListType(q.type);
    
    const formattedOptions = (q.options || ["", "", "", ""]).map(opt => {
      if (typeof opt === 'string') return { text: opt, audio: "", image: "", video: "" };
      return { 
        text: opt.text || "", 
        audio: opt.audio || "", 
        image: opt.image || "", 
        video: opt.video || ""
      };
    });

    setQForm({
      mainHeading: q.mainHeading || "",
      questionHeading: q.questionHeading || String(q.id),
      description: q.description || "",
      image: q.image || "",
      audio: q.audio || "",
      options: formattedOptions,
      answer: q.answer || 0
    });
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm("Delete this question?")) {
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      localStorage.setItem("questionBank", JSON.stringify(updated));
    }
  };

  const displayedQuestions = questions.filter(
    q => q && q.package === filterPackage && q.set === filterSet && q.type === questionListType
  );

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
  const inputStyle = { width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", backgroundColor: "white" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "15px", backgroundColor: "white", borderRadius: "8px", overflow: "hidden" };
  
  const thStyle = { 
    backgroundColor: "#1e3a8a", 
    color: "white", 
    padding: "12px 15px", 
    textAlign: "left", 
    borderBottom: "2px solid #1e293b", 
    fontSize: "14px",
    fontWeight: "bold"
  };

  const tdStyle = { padding: "12px 15px", borderBottom: "1px solid #e2e8f0", color: "#1e293b", fontSize: "14px" };

  const dropZoneStyle = {
    border: dragOver ? "2px dashed #2563eb" : "2px dashed #cbd5e1",
    backgroundColor: dragOver ? "#eff6ff" : "#f8fafc",
    padding: "20px",
    textAlign: "center",
    borderRadius: "6px",
    marginBottom: "12px",
    cursor: "pointer",
    color: "#64748b"
  };

  const audioDropZoneStyle = {
    border: audioDragOver ? "2px dashed #16a34a" : "2px dashed #cbd5e1",
    backgroundColor: audioDragOver ? "#f0fdf4" : "#f8fafc",
    padding: "15px",
    textAlign: "center",
    borderRadius: "6px",
    marginBottom: "12px",
    cursor: "pointer",
    color: "#16a34a"
  };

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      {/* STICKY TOP NAVIGATION BAR */}
      <div style={topNavStyle}>
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>SIGMA ADMIN PANEL</div>
        
        <div style={menuContainerStyle}>
          <Link href="/admin" style={navLinkStyle}>Dashboard</Link>
          <Link href="/admin/institutes" style={navLinkStyle}>Manage Institutes</Link>
          <Link href="/admin/questions" style={activeNavLinkStyle}>Upload Question</Link>
          <Link href="/admin/listening" style={navLinkStyle}>EPS Book</Link>
          <Link href="/admin/news" style={navLinkStyle}>EPS Notices</Link>
          <Link href="/admin/notifications" style={navLinkStyle}>Notifications</Link>
          <Link href="/admin/settings" style={navLinkStyle}>Settings</Link>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Logout</button>
      </div>

      <div style={contentStyle}>
        <h2 style={{ color: "#1e293b", marginTop: "10px", marginBottom: "20px" }}>Package & Question Management</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "25px", flexWrap: "wrap" }}>
          <button onClick={() => setActiveTab("packages")} style={{ padding: "10px 20px", backgroundColor: activeTab === "packages" ? "#1e3a8a" : "white", color: activeTab === "packages" ? "white" : "#1e3a8a", border: "1px solid #1e3a8a", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>1. Packages</button>
          <button onClick={() => setActiveTab("sets")} style={{ padding: "10px 20px", backgroundColor: activeTab === "sets" ? "#1e3a8a" : "white", color: activeTab === "sets" ? "white" : "#1e3a8a", border: "1px solid #1e3a8a", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>2. Exam Sets</button>
          <button onClick={() => setActiveTab("allSets")} style={{ padding: "10px 20px", backgroundColor: activeTab === "allSets" ? "#1e3a8a" : "white", color: activeTab === "allSets" ? "white" : "#1e3a8a", border: "1px solid #1e3a8a", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>3. All UBT Sets</button>
          <button onClick={() => setActiveTab("questions")} style={{ padding: "10px 20px", backgroundColor: activeTab === "questions" ? "#1e3a8a" : "white", color: activeTab === "questions" ? "white" : "#1e3a8a", border: "1px solid #1e3a8a", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>4. Question Table List</button>
        </div>

        {activeTab === "packages" && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>Create Package</h3>
            <form onSubmit={handleSavePackage}>
              <input type="text" placeholder="Package Name" value={packageName} onChange={(e) => setPackageName(e.target.value)} style={inputStyle} required />
              <button type="submit" style={{ backgroundColor: "#0284c7", color: "white", padding: "10px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Add Package</button>
            </form>
            <ul style={{ marginTop: "20px", paddingLeft: "20px" }}>
              {packages.map(p => (
                <li key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                  <span>{p.name}</span>
                  <button onClick={() => handleDeletePackage(p.id)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "sets" && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>Create Exam Set</h3>
            <form onSubmit={handleSaveSet}>
              <label style={{ fontWeight: "bold", fontSize: "13px" }}>Select Package</label>
              <select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)} style={inputStyle} required>
                <option value="">-- Choose Package --</option>
                {packages.map((p, idx) => <option key={idx} value={p.name}>{p.name}</option>)}
              </select>
              <label style={{ fontWeight: "bold", fontSize: "13px" }}>Set Name</label>
              <input type="text" placeholder="Set Name (e.g. Set 01)" value={setName} onChange={(e) => setSetName(e.target.value)} style={inputStyle} required />
              <button type="submit" style={{ backgroundColor: "#0284c7", color: "white", padding: "10px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Create Set</button>
            </form>
            <ul style={{ marginTop: "20px", paddingLeft: "20px" }}>
              {sets.map(s => (
                <li key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                  <span>📁 [{s.packageName}] → {s.name}</span>
                  <button onClick={() => handleDeleteSet(s.id)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "allSets" && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>All Created UBT Sets Overview</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>S.N.</th>
                    <th style={thStyle}>Package Name</th>
                    <th style={thStyle}>Exam Set Name</th>
                    <th style={thStyle}>Total Questions Configured</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sets.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>No exam sets created yet.</td>
                    </tr>
                  ) : (
                    sets.map((s, idx) => {
                      const count = questions.filter(q => q.package === s.packageName && q.set === s.name).length;
                      return (
                        <tr key={s.id || idx}>
                          <td style={tdStyle}>{idx + 1}</td>
                          <td style={{ ...tdStyle, fontWeight: "bold", color: "#1e3a8a" }}>{s.packageName}</td>
                          <td style={{ ...tdStyle, fontWeight: "bold" }}>{s.name}</td>
                          <td style={tdStyle}>
                            <span style={{ backgroundColor: count === 40 ? "#dcfce7" : "#fef9c3", color: count === 40 ? "#166534" : "#854d0e", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                              {count} / 40 Questions
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <button 
                              onClick={() => {
                                setFilterPackage(s.packageName);
                                setFilterSet(s.name);
                                setActiveTab("questions");
                              }}
                              style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                            >
                              Manage Questions
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "questions" && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: "#1e293b" }}>Select Target Package & Set</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label style={{ fontWeight: "bold", fontSize: "13px" }}>Package</label>
                  <select value={filterPackage} onChange={(e) => setFilterPackage(e.target.value)} style={inputStyle}>
                    {packages.map((p, idx) => <option key={idx} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: "bold", fontSize: "13px" }}>Set</label>
                  <select value={filterSet} onChange={(e) => setFilterSet(e.target.value)} style={inputStyle}>
                    {sets.filter(s => s.packageName === filterPackage).map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleGenerate40} style={{ backgroundColor: "#16a34a", color: "white", border: "none", padding: "12px 20px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                ⚡ Initialize 40 Question Templates for this Set
              </button>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: "#1e293b" }}>{editingQuestionId ? "Update Question" : "Add New Question"}</h3>
              <form onSubmit={handleSaveQuestion}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={{ fontWeight: "bold", fontSize: "13px" }}>Question Type</label>
                    <select value={questionListType} onChange={(e) => setQuestionListType(e.target.value)} style={inputStyle}>
                      <option value="Reading">Reading</option>
                      <option value="Listening">Listening</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: "bold", fontSize: "13px" }}>Correct Answer</label>
                    <select value={qForm.answer} onChange={(e) => setQForm({ ...qForm, answer: parseInt(e.target.value) })} style={inputStyle}>
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </div>
                </div>

                <label style={{ fontWeight: "bold", fontSize: "13px" }}>Main Heading</label>
                <input type="text" value={qForm.mainHeading} onChange={(e) => setQForm({ ...qForm, mainHeading: e.target.value })} style={inputStyle} />

                <label style={{ fontWeight: "bold", fontSize: "13px" }}>Question Heading (Question Number)</label>
                <input type="text" value={qForm.questionHeading} onChange={(e) => setQForm({ ...qForm, questionHeading: e.target.value })} style={inputStyle} />

                <label style={{ fontWeight: "bold", fontSize: "13px" }}>Description / Text (Ctrl+V to paste image)</label>
                <textarea 
                  value={qForm.description} 
                  onChange={(e) => setQForm({ ...qForm, description: e.target.value })} 
                  onPaste={(e) => handleImagePaste(e, (img) => setQForm({ ...qForm, image: img }))}
                  style={{ ...inputStyle, height: "70px" }} 
                />

                <div 
                  style={dropZoneStyle}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer?.files?.[0];
                    if (file) processFileToDataURL(file, (img) => setQForm({ ...qForm, image: img }));
                  }}
                >
                  <p style={{ margin: "0 0 5px 0", fontWeight: "bold", color: "#1e3a8a" }}>🖼️ Drag & Drop Question Image Here or Browse</p>
                  <input type="file" accept="image/*" onChange={(e) => processFileToDataURL(e.target.files[0], (img) => setQForm({ ...qForm, image: img }))} style={{ fontSize: "12px" }} />
                </div>

                {qForm.image && (
                  <div style={{ marginBottom: "15px" }}>
                    <img 
                      src={qForm.image} 
                      alt="Preview" 
                      style={{ 
                        maxHeight: "120px", 
                        maxWidth: "100%", 
                        width: "auto",
                        height: "auto",
                        borderRadius: "4px", 
                        border: "1px solid #cbd5e1",
                        imageRendering: 'high-quality',
                        WebkitImageRendering: '-webkit-optimize-contrast'
                      }} 
                    />
                    <button type="button" onClick={() => setQForm({ ...qForm, image: "" })} style={{ display: "block", marginTop: "4px", background: "#ef4444", color: "white", border: "none", padding: "2px 6px", fontSize: "11px", borderRadius: "4px", cursor: "pointer" }}>Remove Image</button>
                  </div>
                )}

                <div 
                  style={audioDropZoneStyle}
                  onDragOver={(e) => { e.preventDefault(); setAudioDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setAudioDragOver(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setAudioDragOver(false);
                    const file = e.dataTransfer?.files?.[0];
                    if (file) processFileToDataURL(file, (aud) => setQForm({ ...qForm, audio: aud }));
                  }}
                >
                  <p style={{ margin: "0 0 5px 0", fontWeight: "bold", color: "#16a34a" }}>🎧 Upload / Drag & Drop Main Audio File (.mp3)</p>
                  <input type="file" accept="audio/*" onChange={(e) => processFileToDataURL(e.target.files[0], (aud) => setQForm({ ...qForm, audio: aud }))} style={{ fontSize: "12px" }} />
                </div>

                {qForm.audio && (
                  <div style={{ marginBottom: "15px" }}>
                    <audio controls src={qForm.audio} style={{ height: "35px", width: "100%" }} />
                    <button type="button" onClick={() => setQForm({ ...qForm, audio: "" })} style={{ display: "block", marginTop: "4px", background: "#ef4444", color: "white", border: "none", padding: "2px 6px", fontSize: "11px", borderRadius: "4px", cursor: "pointer" }}>Remove Audio</button>
                  </div>
                )}

                <h4 style={{ margin: "15px 0 10px 0", color: "#1e293b" }}>Options (Text, Image, Audio & Video Support)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  {qForm.options.map((opt, idx) => (
                    <div key={idx} style={{ padding: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <label style={{ fontSize: "12px", fontWeight: "bold", color: "#1e3a8a" }}>Option {idx + 1}</label>
                        <button
                          type="button"
                          onClick={() => applyUnderline(idx)}
                          style={{
                            backgroundColor: "#1e3a8a",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            textDecoration: "underline"
                          }}
                          title="Select text in option box and click here to underline"
                        >
                          Underline Selected
                        </button>
                      </div>
                      
                      <input 
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text" 
                        placeholder={`Option ${idx + 1} Text (Select text & click Underline)`}
                        value={opt.text} 
                        onChange={(e) => {
                          const newOpts = [...qForm.options];
                          newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                          setQForm({ ...qForm, options: newOpts });
                        }}
                        style={{ 
                          ...inputStyle, 
                          marginBottom: "8px"
                        }} 
                      />

                      <div style={{ fontSize: "13px", color: "#475569", marginBottom: "8px", fontStyle: "italic" }}>
                        Preview: <span dangerouslySetInnerHTML={{ __html: opt.text || "(empty)" }} />
                      </div>

                      <div 
                        style={{
                          border: "1px dashed #cbd5e1",
                          backgroundColor: "white",
                          padding: "8px 10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderRadius: "4px",
                          marginBottom: "8px",
                          fontSize: "12px",
                          color: "#64748b"
                        }}
                      >
                        <span>{opt.image ? "🖼️ Image attached" : opt.audio ? "🎧 Audio attached" : "📁 Choose file"}</span>
                        <label style={{ backgroundColor: "#0284c7", color: "white", padding: "4px 8px", borderRadius: "3px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>
                          Choose
                          <input 
                            type="file" 
                            accept="image/*,audio/*,video/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                processFileToDataURL(file, (mediaUrl) => {
                                  const newOpts = [...qForm.options];
                                  const isAudio = file.type.includes("audio");
                                  const isVideo = file.type.includes("video");
                                  newOpts[idx] = { 
                                    ...newOpts[idx], 
                                    image: (!isAudio && !isVideo) ? mediaUrl : newOpts[idx].image,
                                    audio: isAudio ? mediaUrl : newOpts[idx].audio,
                                    video: isVideo ? mediaUrl : newOpts[idx].video
                                  };
                                  setQForm({ ...qForm, options: newOpts });
                                });
                              }
                            }} 
                            style={{ display: "none" }} 
                          />
                        </label>
                      </div>

                      {opt.image && (
                        <div style={{ marginBottom: "5px" }}>
                          <img 
                            src={opt.image} 
                            alt={`Opt ${idx+1}`} 
                            style={{ 
                              maxHeight: "60px", 
                              maxWidth: "100%", 
                              width: "auto",
                              height: "auto",
                              borderRadius: "4px",
                              imageRendering: 'high-quality',
                              WebkitImageRendering: '-webkit-optimize-contrast'
                            }} 
                          />
                          <button type="button" onClick={() => {
                            const newOpts = [...qForm.options];
                            newOpts[idx] = { ...newOpts[idx], image: "" };
                            setQForm({ ...qForm, options: newOpts });
                          }} style={{ background: "#ef4444", color: "white", border: "none", fontSize: "10px", padding: "1px 4px", cursor: "pointer", display: "block", marginTop: "3px" }}>Remove</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button type="submit" style={{ backgroundColor: "#0284c7", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", width: "100%" }}>
                  {editingQuestionId ? "Update Question" : "Save Question"}
                </button>
              </form>
            </div>

            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, color: "#1e293b" }}>List of Question</h3>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "#64748b" }}>Package: {filterPackage} | Set: {filterSet}</span>
              </div>

              <div style={{ display: "flex", gap: "5px", marginBottom: "20px" }}>
                <button onClick={() => setQuestionListType("Reading")} style={{ padding: "8px 20px", backgroundColor: questionListType === "Reading" ? "#0284c7" : "#e2e8f0", color: questionListType === "Reading" ? "white" : "#475569", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Reading</button>
                <button onClick={() => setQuestionListType("Listening")} style={{ padding: "8px 20px", backgroundColor: questionListType === "Listening" ? "#0284c7" : "#e2e8f0", color: questionListType === "Listening" ? "white" : "#475569", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Listening</button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "700px" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Q.NO</th>
                      <th style={thStyle}>Main Heading</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Answer</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedQuestions.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No questions found. Click the green button above to initialize.</td>
                      </tr>
                    ) : (
                      displayedQuestions.map((q, idx) => (
                        <tr key={q.id || idx} style={{ borderBottom: "1px solid #e2e8f0", fontSize: "14px" }}>
                          <td style={{ padding: "12px", fontWeight: "bold" }}>{idx + 1}</td>
                          <td style={{ padding: "12px", color: "#1e3a8a", fontWeight: "bold" }}>{q.mainHeading}</td>
                          <td style={{ padding: "12px" }}>{q.description}</td>
                          <td style={{ padding: "12px", color: "#16a34a", fontWeight: "bold" }}>Option {Number(q.answer) + 1}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <button onClick={() => handleEditClick(q)} style={{ background: "#2563eb", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", marginRight: "5px", cursor: "pointer", fontSize: "12px" }}>Edit</button>
                            <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestionManager;