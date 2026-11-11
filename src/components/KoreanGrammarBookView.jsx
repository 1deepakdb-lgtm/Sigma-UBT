'use client';

import React, { useState, useMemo, useRef } from 'react';
import { BASIC_GRAMMAR, INTERMEDIATE_GRAMMAR, ADVANCED_GRAMMAR, GRAMMAR_COMPARISONS } from '@/lib/koreanGrammarData';
import { CHAPTER_GRAMMAR_MAP } from '@/lib/koreanChapterGrammarData';
import { renderRuleWithSymbols } from './KoreanMeaningBookView';

export default function KoreanGrammarBookView({ materials = [], isAdmin = false, onUploadMaterial }) {
  // Modes: "chapterwise" | "basic_advanced" | "comparisons" | "pdfs"
  const [activeTab, setActiveTab] = useState("chapterwise");

  // Chapter-wise state
  const [chapterBookFilter, setChapterBookFilter] = useState("all"); // "all" | "book1" | "book2"
  const [chapterSearch, setChapterSearch] = useState("");
  const [selectedChapterNum, setSelectedChapterNum] = useState(null);

  // Basic to Advanced state
  const [levelFilter, setLevelFilter] = useState("all"); // "all" | "Basic" | "Intermediate" | "Advanced"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [grammarSearch, setGrammarSearch] = useState("");
  const [expandedGrammarId, setExpandedGrammarId] = useState(null);

  // Comparison state
  const [selectedComparisonId, setSelectedComparisonId] = useState("comp-01");
  const [compSearch, setCompSearch] = useState("");

  // Audio speech playback (Dictionary Model Neural Speech)
  const [speakingText, setSpeakingText] = useState(null);
  const audioPlayerRef = useRef(null);

  const handleSpeak = (text, id = null, gender = 'female') => {
    if (!text || typeof window === 'undefined') return;

    // Clean grammar patterns for natural dictionary model pronunciation
    // e.g. "-(으)ㄹ 수 있다" -> "을 수 있다" or "아/어 보다" -> "아, 어 보다"
    let cleanText = String(text).trim();
    cleanText = cleanText.replace(/^[~\-\s]+/, '').replace(/[~\-\s]+$/, '');
    cleanText = cleanText.replace(/\(으\)/g, '으');
    cleanText = cleanText.replace(/\//g, ', ');
    cleanText = cleanText.replace(/[#*`_~]/g, '');
    if (!cleanText) cleanText = text;

    const playKey = id || text;

    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }

      const voice = gender === 'male' ? 'ko-KR-InJoonNeural' : 'ko-KR-SunHiNeural';
      const model = gender === 'male' ? 'male-1' : 'female-1';

      // Exact dictionary neural model voice endpoint (Microsoft Neural Voice)
      const ttsUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=ko&gender=${gender}&voice=${voice}&pitch=+0Hz&rate=-4%&model=${model}`;
      const audio = new Audio(ttsUrl);
      audioPlayerRef.current = audio;
      setSpeakingText(playKey);

      audio.onended = () => {
        setSpeakingText(null);
        audioPlayerRef.current = null;
      };

      audio.onerror = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'ko-KR';
          utterance.rate = 0.85;
          utterance.onend = () => setSpeakingText(null);
          utterance.onerror = () => setSpeakingText(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeakingText(null);
        }
      };

      audio.play().catch(() => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'ko-KR';
          utterance.rate = 0.85;
          utterance.onend = () => setSpeakingText(null);
          utterance.onerror = () => setSpeakingText(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeakingText(null);
        }
      });
    } catch (e) {
      console.warn("Speech error:", e);
      setSpeakingText(null);
    }
  };

  // Combine all general grammars
  const allGeneralGrammars = useMemo(() => {
    return [
      ...BASIC_GRAMMAR.map(g => ({ ...g, levelBadge: "Basic (आधारभूत)", levelColor: "#059669", levelBg: "#ecfdf5" })),
      ...INTERMEDIATE_GRAMMAR.map(g => ({ ...g, levelBadge: "Intermediate (मध्यम)", levelColor: "#2563eb", levelBg: "#eff6ff" })),
      ...ADVANCED_GRAMMAR.map(g => ({ ...g, levelBadge: "Advanced (उच्च)", levelColor: "#7c3aed", levelBg: "#f5f3ff" }))
    ];
  }, []);

  // Filtered General Grammars
  const filteredGrammars = useMemo(() => {
    return allGeneralGrammars.filter(g => {
      if (levelFilter !== "all" && g.level !== levelFilter) return false;
      if (categoryFilter !== "all" && g.category !== categoryFilter) return false;
      if (grammarSearch.trim()) {
        const q = grammarSearch.toLowerCase().trim();
        const mKo = (g.pattern || "").toLowerCase().includes(q) || (g.titleKo || "").toLowerCase().includes(q);
        const mNe = (g.titleNe || "").toLowerCase().includes(q) || (g.explanationNe || "").toLowerCase().includes(q);
        const mCat = (g.category || "").toLowerCase().includes(q);
        return mKo || mNe || mCat;
      }
      return true;
    });
  }, [allGeneralGrammars, levelFilter, categoryFilter, grammarSearch]);

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set();
    allGeneralGrammars.forEach(g => {
      if (g.category) set.add(g.category);
    });
    return Array.from(set);
  }, [allGeneralGrammars]);

  // Filtered Chapters (1 to 60)
  const filteredChapters = useMemo(() => {
    return CHAPTER_GRAMMAR_MAP.filter(ch => {
      if (chapterBookFilter === "book1" && ch.chapter > 30) return false;
      if (chapterBookFilter === "book2" && ch.chapter <= 30) return false;
      if (chapterSearch.trim()) {
        const q = chapterSearch.toLowerCase().trim();
        const matchNum = ch.chapter.toString() === q;
        const matchKo = (ch.titleKo || "").toLowerCase().includes(q);
        const matchNe = (ch.titleNe || "").toLowerCase().includes(q);
        const matchGrammar = (ch.grammarPoints || []).some(gp =>
          (gp.pattern || "").toLowerCase().includes(q) || (gp.nameNe || "").toLowerCase().includes(q)
        );
        return matchNum || matchKo || matchNe || matchGrammar;
      }
      return true;
    });
  }, [chapterBookFilter, chapterSearch]);

  // Selected Chapter Object
  const selectedChapterObj = useMemo(() => {
    if (!selectedChapterNum) return null;
    return CHAPTER_GRAMMAR_MAP.find(c => c.chapter === selectedChapterNum) || null;
  }, [selectedChapterNum]);

  // Selected Comparison Object
  const selectedComparisonObj = useMemo(() => {
    return GRAMMAR_COMPARISONS.find(c => c.id === selectedComparisonId) || GRAMMAR_COMPARISONS[0];
  }, [selectedComparisonId]);

  // Grammar PDFs from materials prop
  const grammarPdfs = useMemo(() => {
    return materials.filter(m => m.folder === "Grammar Book");
  }, [materials]);

  return (
    <div style={{ marginBottom: "50px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .grammar-chapter-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            width: 100% !important;
            margin-bottom: 30px !important;
          }
          .grammar-chapter-card {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justifyContent: space-between !important;
            padding: 12px 16px !important;
            border-radius: 14px !important;
            box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04) !important;
            width: 100% !important;
            box-sizing: border-box !important;
            gap: 12px !important;
            min-height: auto !important;
            cursor: pointer !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          .grammar-chapter-card:nth-child(even) {
            background-color: #ffedd5 !important;
            border: 1.5px solid #fed7aa !important;
          }
          .grammar-chapter-card:nth-child(odd) {
            background-color: #dbeafe !important;
            border: 1.5px solid #bfdbfe !important;
          }
          .grammar-chapter-card:active {
            opacity: 0.9 !important;
            transform: scale(0.99) !important;
          }
          .grammar-chapter-inner {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            min-width: 0 !important;
            text-align: left !important;
          }
          .grammar-patterns-box {
            display: none !important;
          }
          .grammar-footer-desktop {
            display: none !important;
          }
          .grammar-chapter-action-btn {
            display: inline-flex !important;
            align-items: center !important;
            justifyContent: center !important;
            background-color: #0f3b82 !important;
            color: #ffffff !important;
            border: none !important;
            border-radius: 10px !important;
            padding: 9px 22px !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            box-shadow: 0 2px 6px rgba(15, 59, 130, 0.3) !important;
            flex-shrink: 0 !important;
            line-height: 1.2 !important;
          }
          .grammar-hero-banner {
            padding: 16px 14px !important;
            border-radius: 12px !important;
            margin-bottom: 16px !important;
          }
          .grammar-filters-box {
            padding: 12px 10px !important;
            border-radius: 10px !important;
            margin-bottom: 14px !important;
          }
          .grammar-cards-container {
            width: 100% !important;
            gap: 10px !important;
          }
          .grammar-card {
            border-radius: 10px !important;
            width: 100% !important;
            box-shadow: 0 1px 4px rgba(0,0,0,0.03) !important;
          }
          .grammar-card-header {
            padding: 12px 14px !important;
          }
          .grammar-card-body {
            padding: 14px 12px !important;
          }
          .grammar-example-item {
            padding: 8px 10px !important;
            border-radius: 8px !important;
          }
          .grammar-desktop-table {
            display: none !important;
          }
          .grammar-mobile-cards {
            display: block !important;
          }
          .grammar-comparison-container {
            padding: 8px 4px !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
          }
          .grammar-conjugation-section {
            width: 100% !important;
            max-width: 100% !important;
          }
          .grammar-chapter-detail-container {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 8px 0 !important;
            width: 100% !important;
          }
          .grammar-hero-banner {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 12px 4px !important;
            background: transparent !important;
          }
          .grammar-conjugation-card {
            padding: 8px 10px !important;
            gap: 6px !important;
            border-radius: 8px !important;
          }
        }
        @media (min-width: 769px) {
          .grammar-chapter-action-btn {
            display: none !important;
          }
          .grammar-desktop-table {
            display: block !important;
          }
          .grammar-mobile-cards {
            display: none !important;
          }
          .grammar-conjugation-section {
            width: 100%;
            max-width: 820px;
          }
        }
      `}</style>

      {/* ── TOP HERO HEADER BANNER ────────────────────────────────────────── */}
      <div className="grammar-hero-banner" style={{
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        padding: "26px 30px",
        marginBottom: "24px",
        border: "1.5px solid #e2e8f0",
        boxShadow: "0 8px 30px rgba(15, 23, 42, 0.05)",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                boxShadow: "0 2px 8px rgba(37,99,235,0.15)"
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </span>
              <div>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" }}>
                  Korean Grammar Book
                </h2>
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => onUploadMaterial && onUploadMaterial("Grammar Book")}
              style={{
                backgroundColor: "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)"
              }}
            >
              <span>+</span> Upload Grammar PDF
            </button>
          )}
        </div>

        {/* ── MODE NAVIGATION TABS ────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginTop: "22px",
          paddingTop: "18px",
          borderTop: "1px solid #f1f5f9",
          flexWrap: "wrap"
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab("chapterwise"); setSelectedChapterNum(null); }}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: activeTab === "chapterwise" ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
              backgroundColor: activeTab === "chapterwise" ? "#2563eb" : "#ffffff",
              color: activeTab === "chapterwise" ? "#ffffff" : "#334155",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: activeTab === "chapterwise" ? "0 4px 12px rgba(37,99,235,0.25)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span>Chapterwise Grammar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("basic_advanced")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: activeTab === "basic_advanced" ? "2px solid #059669" : "1.5px solid #e2e8f0",
              backgroundColor: activeTab === "basic_advanced" ? "#059669" : "#ffffff",
              color: activeTab === "basic_advanced" ? "#ffffff" : "#334155",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: activeTab === "basic_advanced" ? "0 4px 12px rgba(5,150,105,0.25)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>Basic to Advanced</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("comparisons")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: activeTab === "comparisons" ? "2px solid #dc2626" : "1.5px solid #e2e8f0",
              backgroundColor: activeTab === "comparisons" ? "#dc2626" : "#ffffff",
              color: activeTab === "comparisons" ? "#ffffff" : "#334155",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: activeTab === "comparisons" ? "0 4px 12px rgba(220,38,38,0.25)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="6" x2="12" y2="18"></line><line x1="6" y1="12" x2="18" y2="12"></line></svg>
            <span>Grammar Comparisons</span>
          </button>

          {/* Only show PDF Guides tab if grammar PDFs exist OR if user is admin */}
          {(grammarPdfs.length > 0 || isAdmin) && (
            <button
              type="button"
              onClick={() => setActiveTab("pdfs")}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: activeTab === "pdfs" ? "2px solid #7c3aed" : "1.5px solid #e2e8f0",
                backgroundColor: activeTab === "pdfs" ? "#7c3aed" : "#ffffff",
                color: activeTab === "pdfs" ? "#ffffff" : "#334155",
                fontWeight: "800",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: activeTab === "pdfs" ? "0 4px 12px rgba(124,58,237,0.25)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              <span>PDF Guides & Files (व्याकरण पिडिएफ)</span>
              <span style={{
                fontSize: "11px",
                padding: "1px 6px",
                borderRadius: "8px",
                backgroundColor: activeTab === "pdfs" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                color: activeTab === "pdfs" ? "#ffffff" : "#64748b"
              }}>
                {grammarPdfs.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. CHAPTERWISE GRAMMAR VIEW (CHAPTERS 1 TO 60 FOLDERS)            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "chapterwise" && (
        <div>
          {/* IF A SPECIFIC CHAPTER IS SELECTED -> SHOW FULL CHAPTER DETAIL (Out of Box for All Devices) */}
          {selectedChapterObj ? (
            <div className="grammar-chapter-detail-container" style={{
              backgroundColor: "transparent",
              borderRadius: "0",
              border: "none",
              boxShadow: "none",
              padding: "8px 0",
              marginBottom: "24px",
              width: "100%"
            }}>
              {/* Back to Chapters and Chapter Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
                <button
                  type="button"
                  onClick={() => setSelectedChapterNum(null)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  ← Back to All Chapters (सबै अध्यायहरू)
                </button>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    disabled={selectedChapterObj.chapter <= 1}
                    onClick={() => setSelectedChapterNum(prev => Math.max(1, prev - 1))}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: selectedChapterObj.chapter <= 1 ? "#f8fafc" : "#ffffff",
                      color: selectedChapterObj.chapter <= 1 ? "#94a3b8" : "#0f172a",
                      cursor: selectedChapterObj.chapter <= 1 ? "not-allowed" : "pointer",
                      fontWeight: "700",
                      fontSize: "12px"
                    }}
                  >
                    ◀ Prev Chapter {selectedChapterObj.chapter - 1}
                  </button>
                  <button
                    type="button"
                    disabled={selectedChapterObj.chapter >= 60}
                    onClick={() => setSelectedChapterNum(prev => Math.min(60, prev + 1))}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: selectedChapterObj.chapter >= 60 ? "#f8fafc" : "#ffffff",
                      color: selectedChapterObj.chapter >= 60 ? "#94a3b8" : "#0f172a",
                      cursor: selectedChapterObj.chapter >= 60 ? "not-allowed" : "pointer",
                      fontWeight: "700",
                      fontSize: "12px"
                    }}
                  >
                    Next Chapter {selectedChapterObj.chapter + 1} ▶
                  </button>
                </div>
              </div>

              {/* Chapter Title Badge */}
              <div style={{
                backgroundColor: selectedChapterObj.bookPart === 1 ? "#eff6ff" : "#fef3c7",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "24px",
                border: `1.5px solid ${selectedChapterObj.bookPart === 1 ? '#bfdbfe' : '#fde68a'}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{
                    backgroundColor: selectedChapterObj.bookPart === 1 ? "#2563eb" : "#d97706",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "800",
                    padding: "3px 10px",
                    borderRadius: "8px"
                  }}>
                    Chapter {selectedChapterObj.chapter} • Book Part {selectedChapterObj.bookPart}
                  </span>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                    제{selectedChapterObj.chapter}과: {selectedChapterObj.titleKo} ({selectedChapterObj.titleNe})
                  </h3>
                </div>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#475569" }}>
                  {selectedChapterObj.overviewNe}
                </p>
              </div>

              {/* Grammar Points Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {(selectedChapterObj.grammarPoints || []).map((gp, idx) => (
                  <div key={idx} style={{
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "14px",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                  }}>
                    {/* Header of Point */}
                    <div style={{
                      backgroundColor: "#f8fafc",
                      padding: "14px 20px",
                      borderBottom: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {idx + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>
                          {gp.pattern}
                        </h4>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#059669" }}>
                          • {gp.nameNe}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSpeak(gp.pattern)}
                        style={{
                          backgroundColor: speakingText === gp.pattern ? "#dbeafe" : "#f1f5f9",
                          border: speakingText === gp.pattern ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "800",
                          color: speakingText === gp.pattern ? "#1d4ed8" : "#334155",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: speakingText === gp.pattern ? "0 2px 8px rgba(37, 99, 235, 0.2)" : "none",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <span>{speakingText === gp.pattern ? "🔊 Playing..." : "🔊 Listen Pattern"}</span>
                      </button>
                    </div>

                    <div style={{ padding: "20px" }}>
                      {/* Formula Box */}
                      {gp.formula && (
                        <div style={{
                          backgroundColor: "#eff6ff",
                          borderLeft: "4px solid #2563eb",
                          padding: "10px 14px",
                          borderRadius: "0 8px 8px 0",
                          marginBottom: "14px",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#1e40af"
                        }}>
                          [सुत्र / Formula]: <code>{renderRuleWithSymbols(gp.formula)}</code>
                        </div>
                      )}

                      {/* Rule Explanation */}
                      <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>
                        {renderRuleWithSymbols(gp.ruleNe)}
                      </p>

                      {/* Conjugation Examples - Outside of Cells, Shrunk Width, Full Display on Mobile & Web */}
                      {gp.conjugationTable && gp.conjugationTable.length > 0 && (
                        <div className="grammar-conjugation-section" style={{ marginBottom: "18px" }}>
                          <h5 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "800", color: "#1e3a8a", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>🔄</span>
                            <span>रूपान्तरण उदाहरणहरू (Conjugation Examples):</span>
                          </h5>
                          <div className="grammar-conjugation-list" style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                            {gp.conjugationTable.map((row, rIdx) => {
                              const koSpeech = (row.conjugated || "").split(/[[(/]/)[0].trim() || (row.base || "").split(/[[(/]/)[0].trim();
                              const isAudioPlaying = speakingText === koSpeech;

                              return (
                                <div
                                  key={rIdx}
                                  className="grammar-conjugation-card"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: "8px 12px",
                                    padding: "9px 13px",
                                    borderRadius: "10px",
                                    backgroundColor: rIdx % 2 === 0 ? "#f8fafc" : "#ffffff",
                                    border: "1.5px solid #e2e8f0",
                                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
                                    transition: "all 0.15s ease",
                                    width: "100%",
                                    boxSizing: "border-box"
                                  }}
                                >
                                  {/* Left: Round Audio Button + Base Word + Stem Rule Condition */}
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", minWidth: 0 }}>
                                    <button
                                      type="button"
                                      onClick={() => handleSpeak(koSpeech)}
                                      className="conjugation-audio-btn"
                                      style={{
                                        width: "28px",
                                        height: "28px",
                                        minWidth: "28px",
                                        borderRadius: "50%",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: isAudioPlaying ? "#2563eb" : "#ffffff",
                                        color: isAudioPlaying ? "#ffffff" : "#2563eb",
                                        border: `1.5px solid ${isAudioPlaying ? "#2563eb" : "#cbd5e1"}`,
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        padding: 0,
                                        boxShadow: isAudioPlaying ? "0 2px 6px rgba(37,99,235,0.35)" : "0 1px 2px rgba(0,0,0,0.05)",
                                        transition: "all 0.15s ease",
                                        flexShrink: 0
                                      }}
                                      title="Play pronunciation"
                                    >
                                      🔊
                                    </button>

                                    {/* Base Word (मूल शब्द) */}
                                    <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px" }}>
                                      {row.base}
                                    </span>

                                    {/* Stem / Rule Condition (धातु / आधार) */}
                                    {row.stem && (
                                      <span style={{
                                        fontSize: "12px",
                                        padding: "2px 7px",
                                        borderRadius: "6px",
                                        backgroundColor: "#f1f5f9",
                                        color: "#475569",
                                        fontWeight: "600",
                                        border: "1px solid #e2e8f0"
                                      }}>
                                        {renderRuleWithSymbols(row.stem)}
                                      </span>
                                    )}
                                  </div>

                                  {/* Right: Arrow + Conjugated Form + Nepali Meaning */}
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "800" }}>➔</span>

                                    {/* Conjugated Form (व्याकरण जोडिएको रूप) */}
                                    <span style={{
                                      fontSize: "14.5px",
                                      fontWeight: "800",
                                      color: "#1d4ed8",
                                      backgroundColor: "#dbeafe",
                                      border: "1px solid #bfdbfe",
                                      padding: "3px 9px",
                                      borderRadius: "6px",
                                      letterSpacing: "0.2px"
                                    }}>
                                      {row.conjugated}
                                    </span>

                                    {/* Nepali Meaning (नेपाली अर्थ) */}
                                    {row.neMeaning && (
                                      <span style={{
                                        fontSize: "13.5px",
                                        fontWeight: "700",
                                        color: "#059669",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px"
                                      }}>
                                        <span style={{ color: "#cbd5e1" }}>•</span>
                                        <span>{row.neMeaning}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Dialogues & Examples */}
                      {gp.dialogues && gp.dialogues.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                          <h5 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                            पाठ्यपुस्तक संवाद तथा उदाहरण (Textbook Dialogues):
                          </h5>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {gp.dialogues.map((d, dIdx) => (
                              <div key={dIdx} style={{
                                backgroundColor: "#f8fafc",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "10px"
                              }}>
                                <div>
                                  {d.speaker && (
                                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", marginRight: "8px" }}>
                                      [{d.speaker}]
                                    </span>
                                  )}
                                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                                    {d.ko}
                                  </span>
                                  {d.nePron && (
                                    <div style={{ fontSize: "12px", color: "#64748b", margin: "2px 0" }}>
                                      उच्चारण: {d.nePron}
                                    </div>
                                  )}
                                  <div style={{ fontSize: "13px", color: "#059669", fontWeight: "600" }}>
                                    {d.ne}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const isMale = ['아궁', '마두', '민수', '바트', '지훈', '반장님'].some(n => (d.speaker || '').includes(n));
                                    handleSpeak(d.ko, null, isMale ? 'male' : 'female');
                                  }}
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    minWidth: "30px",
                                    borderRadius: "50%",
                                    backgroundColor: speakingText === d.ko ? "#2563eb" : "#ffffff",
                                    color: speakingText === d.ko ? "#ffffff" : "#2563eb",
                                    border: `1.5px solid ${speakingText === d.ko ? "#2563eb" : "#cbd5e1"}`,
                                    padding: 0,
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: speakingText === d.ko ? "0 2px 6px rgba(37,99,235,0.3)" : "none",
                                    flexShrink: 0,
                                    transition: "all 0.15s ease"
                                  }}
                                  title="Play Korean pronunciation"
                                >
                                  🔊
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exam Note */}
                      {gp.examNote && (
                        <div style={{
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fecaca",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          fontSize: "13px",
                          color: "#991b1b"
                        }}>
                          {renderRuleWithSymbols(gp.examNote)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ALL 60 CHAPTERS FOLDERS GRID */
            <div>
              {/* Filter and Search Bar */}
              <div style={{
                backgroundColor: "#ffffff",
                padding: "16px 20px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px"
              }}>
                {/* Search input */}
                <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                  <input
                    type="text"
                    placeholder="Search grammar by chapter or pattern (e.g. 14, -은/는, -아/어서, दिनचर्या)..."
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 38px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#f8fafc"
                    }}
                  />
                  <span style={{ position: "absolute", left: "12px", top: "11px", color: "#64748b", display: "inline-flex" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </span>
                </div>

                {/* Book Part filter pills */}
                <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "10px", gap: "4px" }}>
                  <button
                    type="button"
                    onClick={() => setChapterBookFilter("all")}
                    style={{
                      padding: "7px 14px",
                      backgroundColor: chapterBookFilter === "all" ? "#ffffff" : "transparent",
                      color: chapterBookFilter === "all" ? "#2563eb" : "#475569",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "13px",
                      boxShadow: chapterBookFilter === "all" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
                    }}
                  >
                    All 60 Ch
                  </button>
                  <button
                    type="button"
                    onClick={() => setChapterBookFilter("book1")}
                    style={{
                      padding: "7px 14px",
                      backgroundColor: chapterBookFilter === "book1" ? "#ffffff" : "transparent",
                      color: chapterBookFilter === "book1" ? "#2563eb" : "#475569",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "13px",
                      boxShadow: chapterBookFilter === "book1" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
                    }}
                  >
                    Book 1 (Ch 1–30)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChapterBookFilter("book2")}
                    style={{
                      padding: "7px 14px",
                      backgroundColor: chapterBookFilter === "book2" ? "#ffffff" : "transparent",
                      color: chapterBookFilter === "book2" ? "#2563eb" : "#475569",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "13px",
                      boxShadow: chapterBookFilter === "book2" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
                    }}
                  >
                    Book 2 (Ch 31–60)
                  </button>
                </div>
              </div>

              {/* Grid of Chapter Cards */}
              <div className="grammar-chapter-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                gap: "16px"
              }}>
                {filteredChapters.map(ch => {
                  const patterns = (ch.grammarPoints || []).map(gp => gp.pattern).join(", ");
                  const isPart1 = ch.bookPart === 1;

                  return (
                    <div
                      key={ch.chapter}
                      onClick={() => setSelectedChapterNum(ch.chapter)}
                      className="grammar-chapter-card"
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        border: "1.5px solid #e2e8f0",
                        padding: "18px 20px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.borderColor = isPart1 ? "#3b82f6" : "#f59e0b";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
                      }}
                    >
                      <div className="grammar-chapter-inner">
                        {/* Chapter badge */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <span style={{
                            backgroundColor: isPart1 ? "#eff6ff" : "#fef3c7",
                            color: isPart1 ? "#1d4ed8" : "#b45309",
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            border: `1px solid ${isPart1 ? '#bfdbfe' : '#fde68a'}`
                          }}>
                            Chapter {ch.chapter}
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>
                            Book Part {ch.bookPart}
                          </span>
                        </div>

                        {/* Chapter Titles */}
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                          제{ch.chapter}과: {ch.titleKo}
                        </h4>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#059669", marginBottom: "12px" }}>
                          {ch.titleNe}
                        </div>

                        {/* Grammar Patterns Preview */}
                        <div className="grammar-patterns-box" style={{
                          backgroundColor: "#f8fafc",
                          borderRadius: "8px",
                          padding: "8px 10px",
                          border: "1px solid #f1f5f9",
                          fontSize: "12px",
                          color: "#334155"
                        }}>
                          <span style={{ fontWeight: "700", color: "#2563eb" }}>व्याकरण: </span>
                          <span style={{ fontWeight: "600" }}>{patterns || "आधारभूत शब्दार्थ तथा अभिवादन"}</span>
                        </div>
                      </div>

                      <div className="grammar-footer-desktop" style={{
                        marginTop: "14px",
                        paddingTop: "10px",
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>
                          {(ch.grammarPoints || []).length} Grammar Points
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: isPart1 ? "#2563eb" : "#d97706" }}>
                          अध्ययन गर्नुहोस् ➔
                        </span>
                      </div>
                      <button className="grammar-chapter-action-btn" type="button">Study</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. BASIC TO ADVANCED COMPREHENSIVE GRAMMAR VIEW                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "basic_advanced" && (
        <div>
          {/* Filters Bar */}
          <div className="grammar-filters-box" style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "18px 20px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}>
            {/* Search Input */}
            <div style={{ position: "relative", marginBottom: "14px" }}>
              <input
                type="text"
                placeholder="Search grammar rule, pattern or meaning (e.g. -(으)니까, कारण, -는데, -고 싶다)..."
                value={grammarSearch}
                onChange={(e) => setGrammarSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "#f8fafc"
                }}
              />
              <span style={{ position: "absolute", left: "12px", top: "11px", color: "#64748b", display: "inline-flex" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
            </div>

            {/* Level & Category Selectors in One Clean Responsive Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              {/* Level Selector Pills */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>तहरूप (Level):</span>
                {["all", "Basic", "Intermediate", "Advanced"].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevelFilter(lvl)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "8px",
                      border: levelFilter === lvl ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                      backgroundColor: levelFilter === lvl ? "#2563eb" : "#ffffff",
                      color: levelFilter === lvl ? "#ffffff" : "#475569",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {lvl === "all" ? "All Levels" : lvl === "Basic" ? "Basic" : lvl === "Intermediate" ? "Intermediate" : "Advanced"}
                  </button>
                ))}
              </div>

              {/* Category Selector Dropdown with Arrow (Replaced 20+ wrapping buttons) */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 240px", maxWidth: "420px" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", whiteSpace: "nowrap" }}>वर्ग (Category):</span>
                <div style={{ position: "relative", width: "100%" }}>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      width: "100%",
                      padding: "8px 34px 8px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #2563eb",
                      backgroundColor: "#eff6ff",
                      color: "#1e40af",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      outline: "none",
                      boxShadow: "0 1px 3px rgba(37,99,235,0.1)"
                    }}
                  >
                    <option value="all">All Categories (सबै वर्गहरू - {GRAMMAR_TOPICS.length})</option>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat} style={{ color: "#0f172a", backgroundColor: "#ffffff", fontWeight: "700" }}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#1e40af", fontSize: "11px", fontWeight: "900" }}>
                    ▼
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grammar Cards List */}
          <div className="grammar-cards-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredGrammars.map(g => {
              const isExpanded = expandedGrammarId === g.id;

              return (
                <div
                  key={g.id}
                  className="grammar-card"
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    overflow: "hidden",
                    transition: "all 0.15s ease"
                  }}
                >
                  {/* Card Header Bar */}
                  <div
                    onClick={() => setExpandedGrammarId(isExpanded ? null : g.id)}
                    className="grammar-card-header"
                    style={{
                      padding: "16px 20px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: isExpanded ? "#f8fafc" : "#ffffff",
                      borderBottom: isExpanded ? "1px solid #e2e8f0" : "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: g.levelBg,
                        color: g.levelColor,
                        border: `1px solid ${g.levelColor}40`
                      }}>
                        {g.levelBadge}
                      </span>
                      <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "900", color: "#0f172a" }}>
                        {g.pattern}
                      </h4>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#059669" }}>
                        • {g.titleNe}
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "10px" }}>
                        {g.category}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {g.comparisonId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComparisonId(g.comparisonId);
                            setActiveTab("comparisons");
                          }}
                          style={{
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: "pointer"
                          }}
                        >
                          [तुलना हेर्नुहोस् ↗]
                        </button>
                      )}
                      <span style={{ fontSize: "14px", color: "#64748b" }}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="grammar-card-body" style={{ padding: "20px" }}>
                      {/* Formula */}
                      <div style={{
                        backgroundColor: "#eff6ff",
                        borderLeft: "4px solid #2563eb",
                        padding: "10px 14px",
                        borderRadius: "0 8px 8px 0",
                        marginBottom: "12px",
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#1e40af"
                      }}>
                        [सुत्र / Formula]: <code>{renderRuleWithSymbols(g.formula)}</code>
                      </div>

                      {/* Batchim Rule */}
                      {g.batchimRule && (
                        <div style={{
                          backgroundColor: "#f8fafc",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                          color: "#475569",
                          marginBottom: "14px"
                        }}>
                          <strong>받침 नियम:</strong> {renderRuleWithSymbols(g.batchimRule)}
                        </div>
                      )}

                      {/* Explanation */}
                      <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>
                        {renderRuleWithSymbols(g.explanationNe)}
                      </p>

                      {/* Examples */}
                      {g.examples && g.examples.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                          <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                            उदाहरण वाक्यहरू (Example Sentences):
                          </h5>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {g.examples.map((ex, exIdx) => (
                              <div key={exIdx} className="grammar-example-item" style={{
                                backgroundColor: "#f8fafc",
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "10px"
                              }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                                    {ex.ko}
                                  </div>
                                  {ex.nePron && (
                                    <div style={{ fontSize: "12px", color: "#64748b", margin: "2px 0" }}>
                                      उच्चारण: {ex.nePron}
                                    </div>
                                  )}
                                  <div style={{ fontSize: "13.5px", color: "#15803d", fontWeight: "700" }}>
                                    {ex.ne}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSpeak(ex.ko)}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    backgroundColor: speakingText === ex.ko ? "#2563eb" : "#ffffff",
                                    color: speakingText === ex.ko ? "#ffffff" : "#475569",
                                    border: "1.5px solid #cbd5e1",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                  }}
                                  title="Play pronunciation"
                                >
                                  🔊
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exam Tip */}
                      {g.examTip && (
                        <div style={{
                          backgroundColor: "#fffbeb",
                          border: "1px solid #fde68a",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          fontSize: "13px",
                          color: "#92400e"
                        }}>
                          {renderRuleWithSymbols(g.examTip)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. GRAMMAR COMPARISONS VIEW (तुलना - HIGH-SCORING EXAM PAIRS)     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "comparisons" && (
        <div>
          {/* Comparison Pair Selector Bar */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "16px 20px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
              तुलना जोडी छान्नुहोस् (Select Grammar Comparison Pair):
            </h4>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px" }}>
              {GRAMMAR_COMPARISONS.map(comp => (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => setSelectedComparisonId(comp.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: selectedComparisonId === comp.id ? "2px solid #dc2626" : "1px solid #cbd5e1",
                    backgroundColor: selectedComparisonId === comp.id ? "#dc2626" : "#f8fafc",
                    color: selectedComparisonId === comp.id ? "#ffffff" : "#1e293b",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: selectedComparisonId === comp.id ? "0 4px 12px rgba(220,38,38,0.25)" : "none"
                  }}
                >
                  {comp.title}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Selected Comparison Card */}
          {selectedComparisonObj && (
            <div className="grammar-comparison-container" style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              padding: "24px"
            }}>
              {/* Header */}
              <div style={{ marginBottom: "22px" }}>
                <span style={{
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  fontSize: "12px",
                  fontWeight: "800",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  border: "1px solid #fecaca"
                }}>
                  व्याकरण तुलना (Grammar Comparison)
                </span>
                <h3 style={{ margin: "10px 0 6px 0", fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>
                  {selectedComparisonObj.title}
                </h3>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#dc2626" }}>
                  {selectedComparisonObj.titleNe}
                </div>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
                  {selectedComparisonObj.summaryNe}
                </p>
              </div>

              {/* 1. DETAILED PARAGRAPH EXPLANATIONS (विस्तृत अनुच्छेद व्याख्या) */}
              {(selectedComparisonObj.patternA_paragraph || selectedComparisonObj.patternB_paragraph) && (
                <div style={{ marginBottom: "24px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase" }}>
                    विस्तृत अनुच्छेद व्याख्या (Detailed Paragraph Explanation):
                  </h4>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "16px"
                  }}>
                    {/* Pattern A Box */}
                    {selectedComparisonObj.patternA_paragraph && (
                      <div style={{
                        backgroundColor: "#eff6ff",
                        borderRadius: "12px",
                        border: "1.5px solid #bfdbfe",
                        padding: "16px 18px",
                        boxShadow: "0 2px 8px rgba(37,99,235,0.06)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: "800",
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            padding: "3px 8px",
                            borderRadius: "6px"
                          }}>
                            [A] {selectedComparisonObj.patternA}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "14px", color: "#1e3a8a", lineHeight: "1.65", textAlign: "justify" }}>
                          {selectedComparisonObj.patternA_paragraph}
                        </p>
                      </div>
                    )}

                    {/* Pattern B Box */}
                    {selectedComparisonObj.patternB_paragraph && (
                      <div style={{
                        backgroundColor: "#fef2f2",
                        borderRadius: "12px",
                        border: "1.5px solid #fecaca",
                        padding: "16px 18px",
                        boxShadow: "0 2px 8px rgba(220,38,38,0.06)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: "800",
                            backgroundColor: "#dc2626",
                            color: "#ffffff",
                            padding: "3px 8px",
                            borderRadius: "6px"
                          }}>
                            [B] {selectedComparisonObj.patternB}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "14px", color: "#7f1d1d", lineHeight: "1.65", textAlign: "justify" }}>
                          {selectedComparisonObj.patternB_paragraph}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. IN-DEPTH COMPARATIVE NUANCE PARAGRAPH (गहन तुलनात्मक विश्लेषण) */}
              {selectedComparisonObj.inDepthComparisonParagraph && (
                <div style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1.5px solid #e2e8f0",
                  borderLeft: "5px solid #4f46e5",
                  padding: "16px 20px",
                  marginBottom: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ display: "inline-flex", color: "#4338ca" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#312e81", textTransform: "uppercase" }}>
                      गहन तुलनात्मक विश्लेषण तथा व्यावहारिक अन्तर (In-Depth Comparative Analysis):
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.7", textAlign: "justify" }}>
                    {selectedComparisonObj.inDepthComparisonParagraph}
                  </p>
                </div>
              )}

              {/* 3. Universal Outside-of-Table Comparison Cards (All Devices: Mobile, Tablet, Web) */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase" }}>
                  तुलना कार्डहरू (Comparison Rules):
                </h4>

                {/* Outside-of-Table Cards for ALL devices */}
                <div className="grammar-comparison-cards" style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                  {selectedComparisonObj.rules.map((r, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
                        width: "100%",
                        boxSizing: "border-box"
                      }}
                    >
                      {/* Aspect Header Badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ backgroundColor: "#1e3a8a", color: "#ffffff", padding: "3px 9px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "800" }}>
                          तुलनाको आधार
                        </span>
                        <span style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                          {r.aspect}
                        </span>
                      </div>

                      {/* Side-by-Side or Stacked Rules Outside of Table */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: "10px",
                        width: "100%"
                      }}>
                        <div style={{ backgroundColor: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "8px", padding: "10px 14px" }}>
                          <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#1d4ed8", marginBottom: "4px" }}>
                            [A] {selectedComparisonObj.patternA}
                          </div>
                          <div style={{ fontSize: "13.5px", color: "#1e3a8a", lineHeight: "1.55" }}>
                            {renderRuleWithSymbols(r.ruleA)}
                          </div>
                        </div>

                        <div style={{ backgroundColor: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "8px", padding: "10px 14px" }}>
                          <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#b91c1c", marginBottom: "4px" }}>
                            [B] {selectedComparisonObj.patternB}
                          </div>
                          <div style={{ fontSize: "13.5px", color: "#7f1d1d", lineHeight: "1.55" }}>
                            {renderRuleWithSymbols(r.ruleB)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Contrastive Examples */}
              <div style={{ marginBottom: "22px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase" }}>
                  तुलनात्मक वाक्य उदाहरण (Contrastive Sentences):
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectedComparisonObj.contrasts.map((c, cIdx) => (
                    <div key={cIdx} style={{
                      backgroundColor: "#f8fafc",
                      padding: "16px 18px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px"
                    }}>
                      <div style={{ borderRight: "1px solid #e2e8f0", paddingRight: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "800", color: "#1d4ed8", backgroundColor: "#dbeafe", padding: "2px 8px", borderRadius: "6px" }}>
                            [A: {selectedComparisonObj.patternA}]
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSpeak(c.koA)}
                            style={{
                              backgroundColor: speakingText === c.koA ? "#2563eb" : "#ffffff",
                              color: speakingText === c.koA ? "#ffffff" : "#475569",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              padding: "3px 6px",
                              cursor: "pointer",
                              fontSize: "11px"
                            }}
                            title="Play pronunciation"
                          >
                            🔊
                          </button>
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginTop: "4px" }}>
                          {c.koA}
                        </div>
                        <div style={{ fontSize: "13px", color: "#334155", marginTop: "3px", lineHeight: "1.4" }}>
                          {c.neA}
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "800", color: "#b91c1c", backgroundColor: "#fee2e2", padding: "2px 8px", borderRadius: "6px" }}>
                            [B: {selectedComparisonObj.patternB}]
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSpeak(c.koB)}
                            style={{
                              backgroundColor: speakingText === c.koB ? "#dc2626" : "#ffffff",
                              color: speakingText === c.koB ? "#ffffff" : "#475569",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              padding: "3px 6px",
                              cursor: "pointer",
                              fontSize: "11px"
                            }}
                            title="Play pronunciation"
                          >
                            🔊
                          </button>
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginTop: "4px" }}>
                          {c.koB}
                        </div>
                        <div style={{ fontSize: "13px", color: "#334155", marginTop: "3px", lineHeight: "1.4" }}>
                          {c.neB}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Exam Trap Alert */}
              {(selectedComparisonObj.examTrapParagraph || selectedComparisonObj.examTrapNe) && (
                <div style={{
                  backgroundColor: "#fff1f2",
                  borderLeft: "5px solid #e11d48",
                  padding: "16px 20px",
                  borderRadius: "0 12px 12px 0",
                  boxShadow: "0 2px 8px rgba(225,29,72,0.06)"
                }}>
                  <div style={{ marginBottom: "6px" }}>
                    <strong style={{ fontSize: "14px", color: "#9f1239", textTransform: "uppercase" }}>
                      EPS-TOPIK परीक्षा ट्र्याप र गोल्डेन नियम (Exam Strategy & Warning):
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#881337", lineHeight: "1.65", textAlign: "justify" }}>
                    {renderRuleWithSymbols(selectedComparisonObj.examTrapParagraph || selectedComparisonObj.examTrapNe)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. OFFICIAL PDF GUIDES VIEW                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "pdfs" && (
        <div>
          {grammarPdfs.length === 0 ? (
            <div style={{
              backgroundColor: "#ffffff",
              padding: "40px",
              borderRadius: "14px",
              textAlign: "center",
              border: "1px dashed #cbd5e1"
            }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#e2e8f0", color: "#64748b", margin: "0 auto 10px auto" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <h4 style={{ margin: "10px 0 6px 0", fontSize: "18px", color: "#0f172a" }}>
                अहिले कुनै अतिरिक्त पिडिएफ फाइल जोडिएको छैन
              </h4>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                सम्पूर्ण मुख्य व्याकरण नियमहरू माथि 'Chapterwise Grammar' र 'Basic to Advanced' खण्डमा उपलब्ध छन्।
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onUploadMaterial && onUploadMaterial("Grammar Book")}
                  style={{
                    marginTop: "16px",
                    backgroundColor: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  + Upload New Grammar PDF
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "18px"
            }}>
              {grammarPdfs.map(mat => (
                <div key={mat.id} style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  border: "1.5px solid #e2e8f0",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#fee2e2", color: "#dc2626" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                          {mat.title}
                        </h4>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          {mat.fileSize || "PDF Document"} • {mat.uploadedBy || "Admin"}
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: "6px 0 14px 0", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                      {mat.description}
                    </p>
                  </div>

                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      textAlign: "center",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      padding: "10px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      textDecoration: "none"
                    }}
                  >
                    Open Full PDF ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
