'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CHAPTER_MEANINGS_DATA } from '@/lib/koreanChapterMeaningData';
import { KOREAN_CHAPTER_BOOK_DATA } from '@/lib/koreanChapterBookEngine';

// Helper to render grammar and rule text with O replaced by ✔ (green) and X (red)
export function renderRuleWithSymbols(text) {
  if (text === null || text === undefined) return null;
  if (typeof text !== 'string') return text;

  // 1. Normalize all O variants or circle symbols to ✔
  const normalized = text
    .replace(/받침\s*O\b/gi, '받침 ✔')
    .replace(/\(O\)/gi, '(✔)')
    .replace(/\[O\]/gi, '[✔]')
    .replace(/⭕/g, '✔')
    .replace(/(^|\s|\(|\[)O(\s|\)|\]|$|,|\.|\/)/g, '$1✔$2');

  // 2. Tokenize by symbols: ✔, ✓, ❌, ✖, or standalone X
  const tokenRegex = /(✔|✓|❌|✖|\bX\b)/g;
  const parts = normalized.split(tokenRegex);

  return parts.map((part, idx) => {
    if (part === '✔' || part === '✓') {
      return (
        <span
          key={idx}
          style={{
            color: '#22c55e',
            fontWeight: '900',
            display: 'inline-block',
            margin: '0 2px'
          }}
        >
          ✔
        </span>
      );
    }
    if (part === '❌' || part === '✖' || part === 'X') {
      return (
        <span
          key={idx}
          style={{
            color: '#ef4444',
            fontWeight: '900',
            display: 'inline-block',
            margin: '0 2px'
          }}
        >
          X
        </span>
      );
    }
    return part;
  });
}

export default function KoreanMeaningBookView({
  meaningChapters = [],
  isAdmin = false,
  onOpenEditModal,
  getCleanPdfUrl
}) {
  // Navigation: null = All Chapter Folders view, number = Viewing specific chapter (1-60)
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Filter & Search states
  const [bookPartFilter, setBookPartFilter] = useState("all"); // "all" | "book1" | "book2"
  const [folderSearch, setFolderSearch] = useState("");

  // Inside-chapter states
  const [chapterViewMode, setChapterViewMode] = useState("book"); // "book" | "table" | "flashcard" | "pdf"
  const [wordSearch, setWordSearch] = useState("");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [userQuizAnswers, setUserQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Audio Speech state (Dictionary Model Neural Speech)
  const [speakingWordId, setSpeakingWordId] = useState(null);
  const audioPlayerRef = useRef(null);

  const handleSpeak = (text, id = null, gender = 'female') => {
    if (!text || typeof window === 'undefined') return;

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
      const ttsUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=ko&gender=${gender}&voice=${voice}&pitch=%2B0Hz&rate=-4%25&model=${model}`;
      const audio = new Audio(ttsUrl);
      audioPlayerRef.current = audio;
      setSpeakingWordId(playKey);

      audio.onended = () => {
        setSpeakingWordId(null);
        audioPlayerRef.current = null;
      };

      audio.onerror = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'ko-KR';
          utterance.rate = 0.85;
          utterance.onend = () => setSpeakingWordId(null);
          utterance.onerror = () => setSpeakingWordId(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeakingWordId(null);
        }
      };

      audio.play().catch(() => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'ko-KR';
          utterance.rate = 0.85;
          utterance.onend = () => setSpeakingWordId(null);
          utterance.onerror = () => setSpeakingWordId(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeakingWordId(null);
        }
      });
    } catch (e) {
      console.warn("Speech error:", e);
      setSpeakingWordId(null);
    }
  };

  // Combine server meaningChapters metadata with our rich vocabulary dataset
  const combinedChapters = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const chNum = i + 1;
      const srv = (meaningChapters || []).find(c => Number(c.chapter) === chNum) || {};
      const words = CHAPTER_MEANINGS_DATA[chNum] || [];

      return {
        chapter: chNum,
        bookPart: chNum <= 30 ? 1 : 2,
        titleKo: srv.titleKo || `제${chNum}과`,
        titleNe: srv.titleNe || `अध्याय ${chNum}`,
        titleEn: srv.titleEn || `Chapter ${chNum}`,
        meaningPdfUrl: srv.meaningPdfUrl || "",
        meaningAudioUrl: srv.meaningAudioUrl || "",
        notes: srv.notes || "",
        words: words,
        vocabularyCount: words.length || srv.vocabularyCount || 20
      };
    });
  }, [meaningChapters]);

  // Filtered Chapters list
  const filteredChapters = useMemo(() => {
    return combinedChapters.filter(c => {
      if (bookPartFilter === "book1" && c.chapter > 30) return false;
      if (bookPartFilter === "book2" && c.chapter <= 30) return false;
      if (folderSearch.trim()) {
        const q = folderSearch.toLowerCase().trim();
        const matchNum = c.chapter.toString() === q;
        const matchKo = (c.titleKo || "").toLowerCase().includes(q);
        const matchNe = (c.titleNe || "").toLowerCase().includes(q);
        const matchEn = (c.titleEn || "").toLowerCase().includes(q);
        const matchWords = (c.words || []).some(w =>
          (w.korean || "").toLowerCase().includes(q) ||
          (w.nepali || "").toLowerCase().includes(q) ||
          (w.pronunciation || "").toLowerCase().includes(q)
        );
        return matchNum || matchKo || matchNe || matchEn || matchWords;
      }
      return true;
    });
  }, [combinedChapters, bookPartFilter, folderSearch]);

  // Current active chapter object
  const currentChapterObj = useMemo(() => {
    if (!selectedChapter) return null;
    return combinedChapters.find(c => c.chapter === selectedChapter) || null;
  }, [selectedChapter, combinedChapters]);

  // Filtered words inside current chapter
  const currentChapterWords = useMemo(() => {
    if (!currentChapterObj) return [];
    const words = currentChapterObj.words || [];
    if (!wordSearch.trim()) return words;
    const q = wordSearch.toLowerCase().trim();
    return words.filter(w =>
      (w.korean || "").toLowerCase().includes(q) ||
      (w.nepali || "").toLowerCase().includes(q) ||
      (w.pronunciation || "").toLowerCase().includes(q) ||
      (w.english || "").toLowerCase().includes(q)
    );
  }, [currentChapterObj, wordSearch]);

  // Current active chapter book engine data
  const currentBookData = useMemo(() => {
    if (!selectedChapter) return null;
    return KOREAN_CHAPTER_BOOK_DATA[selectedChapter] || null;
  }, [selectedChapter]);

  // Auto-fallback from PDF view to full textbook book view if no PDF has been uploaded
  useEffect(() => {
    if (chapterViewMode === 'pdf' && !currentChapterObj?.meaningPdfUrl && !isAdmin) {
      setChapterViewMode('book');
    }
  }, [chapterViewMode, currentChapterObj?.meaningPdfUrl, isAdmin]);

  // Quiz score calculator
  const quizScore = useMemo(() => {
    if (!currentBookData || !currentBookData.quiz) return 0;
    let score = 0;
    currentBookData.quiz.forEach(q => {
      if (userQuizAnswers[q.id] === q.correctAnswer) score++;
    });
    return score;
  }, [currentBookData, userQuizAnswers]);

  const renderChapterNavBar = () => {
    if (!currentChapterObj) return null;
    return (
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "20px",
        padding: "12px 16px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
      }}>
        <button
          type="button"
          onClick={() => setSelectedChapter(null)}
          style={{
            backgroundColor: "#1e3a8a",
            color: "#ffffff",
            border: "1px solid #1e3a8a",
            padding: "8px 18px",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            boxShadow: "0 2px 6px rgba(30, 58, 138, 0.25)"
          }}
        >
          Go Back
        </button>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={currentChapterObj.chapter <= 1}
            onClick={() => {
              setSelectedChapter(prev => Math.max(1, prev - 1));
              setFlashcardIndex(0);
              setIsCardFlipped(false);
              setUserQuizAnswers({});
              setQuizSubmitted(false);
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: `1px solid ${currentChapterObj.chapter <= 1 ? "#cbd5e1" : "#1e3a8a"}`,
              backgroundColor: currentChapterObj.chapter <= 1 ? "#f1f5f9" : "#1e3a8a",
              color: currentChapterObj.chapter <= 1 ? "#94a3b8" : "#ffffff",
              cursor: currentChapterObj.chapter <= 1 ? "not-allowed" : "pointer",
              fontWeight: "700",
              fontSize: "12px",
              boxShadow: currentChapterObj.chapter <= 1 ? "none" : "0 2px 6px rgba(30, 58, 138, 0.25)"
            }}
          >
            ◀ Prev Chapter{currentChapterObj.chapter > 1 ? ` ${currentChapterObj.chapter - 1}` : ""}
          </button>
          <button
            type="button"
            disabled={currentChapterObj.chapter >= 60}
            onClick={() => {
              setSelectedChapter(prev => Math.min(60, prev + 1));
              setFlashcardIndex(0);
              setIsCardFlipped(false);
              setUserQuizAnswers({});
              setQuizSubmitted(false);
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: `1px solid ${currentChapterObj.chapter >= 60 ? "#cbd5e1" : "#1e3a8a"}`,
              backgroundColor: currentChapterObj.chapter >= 60 ? "#f1f5f9" : "#1e3a8a",
              color: currentChapterObj.chapter >= 60 ? "#94a3b8" : "#ffffff",
              cursor: currentChapterObj.chapter >= 60 ? "not-allowed" : "pointer",
              fontWeight: "700",
              fontSize: "12px",
              boxShadow: currentChapterObj.chapter >= 60 ? "none" : "0 2px 6px rgba(30, 58, 138, 0.25)"
            }}
          >
            Next Chapter{currentChapterObj.chapter < 60 ? ` ${currentChapterObj.chapter + 1}` : ""} ▶
          </button>

          {isAdmin && onOpenEditModal && (
            <button
              type="button"
              onClick={() => onOpenEditModal(currentChapterObj)}
              style={{
                backgroundColor: "#f59e0b",
                color: "#ffffff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Admin: Attach PDF
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginBottom: "50px", fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "transparent", color: "#0f172a" }}>
      {/* ── 1. CHAPTER FOLDERS GRID VIEW (CHAPTERS 1 TO 60) ──────────────── */}
      {!selectedChapter ? (
        <div>
          {/* Header Banner */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "20px",
            border: "1.5px solid #e2e8f0",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                fontSize: "22px"
              }}>
                📕
              </span>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" }}>
                Meaning Book (अध्याय अनुसार शब्दार्थ संग्रह)
              </h2>
            </div>
          </div>

          {/* Search Bar & Book Filter Tabs */}
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
            {/* Search Input */}
            <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
              <input
                type="text"
                placeholder="Search chapter number or topic (e.g. 14, 자기소개, काम, परिचय, अस्पताल)..."
                value={folderSearch}
                onChange={(e) => setFolderSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "#f8fafc",
                  color: "#0f172a"
                }}
              />
              <span style={{ position: "absolute", left: "12px", top: "11px", color: "#64748b", display: "inline-flex" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
            </div>

            {/* Quick Filter Tabs */}
            <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "10px", gap: "4px" }}>
              <button
                type="button"
                onClick={() => setBookPartFilter("all")}
                style={{
                  padding: "7px 14px",
                  backgroundColor: bookPartFilter === "all" ? "#ffffff" : "transparent",
                  color: bookPartFilter === "all" ? "#dc2626" : "#475569",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  boxShadow: bookPartFilter === "all" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
                }}
              >
                All 60 Ch
              </button>
              <button
                type="button"
                onClick={() => setBookPartFilter("book1")}
                style={{
                  padding: "7px 14px",
                  backgroundColor: bookPartFilter === "book1" ? "#ffffff" : "transparent",
                  color: bookPartFilter === "book1" ? "#dc2626" : "#475569",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  boxShadow: bookPartFilter === "book1" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
                }}
              >
                Book 1 (1–30)
              </button>
              <button
                type="button"
                onClick={() => setBookPartFilter("book2")}
                style={{
                  padding: "7px 14px",
                  backgroundColor: bookPartFilter === "book2" ? "#ffffff" : "transparent",
                  color: bookPartFilter === "book2" ? "#dc2626" : "#475569",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  boxShadow: bookPartFilter === "book2" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
                }}
              >
                Book 2 (31–60)
              </button>
            </div>
          </div>

          {/* Grid of Chapter Folders */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px"
          }}>
            {filteredChapters.map(c => {
              const hasPdf = Boolean(c.meaningPdfUrl);
              const isPart1 = c.bookPart === 1;

              return (
                <div
                  key={c.chapter}
                  onClick={() => {
                    setSelectedChapter(c.chapter);
                    setWordSearch("");
                    setFlashcardIndex(0);
                    setIsCardFlipped(false);
                    setUserQuizAnswers({});
                    setQuizSubmitted(false);
                    setChapterViewMode("book");
                  }}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1.5px solid #e2e8f0",
                    padding: "24px 20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = isPart1 ? "#f87171" : "#f59e0b";
                    e.currentTarget.style.boxShadow = "0 8px 22px rgba(220, 38, 38, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  }}
                >
                  {/* Chapter Header Badge (Centered) */}
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{
                      backgroundColor: isPart1 ? "#fee2e2" : "#fef3c7",
                      color: isPart1 ? "#b91c1c" : "#b45309",
                      padding: "4px 14px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "800",
                      border: `1px solid ${isPart1 ? '#fecaca' : '#fde68a'}`
                    }}>
                      Chapter {c.chapter}
                    </span>
                  </div>

                  {/* Titles (Centered) */}
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: "900", color: "#0f172a", textAlign: "center" }}>
                    제{c.chapter}과 {c.titleKo}
                  </h3>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#dc2626", marginBottom: "4px", textAlign: "center" }}>
                    {c.titleNe}
                  </div>
                  {c.titleEn && (
                    <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                      {c.titleEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── 2. INSIDE CHAPTER VOCABULARY READER VIEW ────────────────────── */
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          border: "1.5px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
          padding: "24px",
          color: "#0f172a"
        }}>
          {/* Chapter Banner */}
          <div style={{
            backgroundColor: currentChapterObj.bookPart === 1 ? "#eff6ff" : "#fffbeb",
            borderRadius: "14px",
            padding: "18px 22px",
            marginBottom: "20px",
            border: `1.5px solid ${currentChapterObj.bookPart === 1 ? "#bfdbfe" : "#fde68a"}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{
                backgroundColor: currentChapterObj.bookPart === 1 ? "#2563eb" : "#d97706",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "800",
                padding: "4px 12px",
                borderRadius: "8px"
              }}>
                Chapter {currentChapterObj.chapter} • Part {currentChapterObj.bookPart}
              </span>
              <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>
                제{currentChapterObj.chapter}과: {currentChapterObj.titleKo} ({currentChapterObj.titleNe})
              </h3>
            </div>
          </div>

          {/* View Mode Switcher & Search Bar inside Chapter */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px"
          }}>
            {/* View Mode Buttons */}
            <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "10px", gap: "4px", flexWrap: "wrap", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => setChapterViewMode("book")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: chapterViewMode === "book" ? "#dc2626" : "transparent",
                  color: chapterViewMode === "book" ? "#ffffff" : "#475569",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: chapterViewMode === "book" ? "0 2px 8px rgba(220,38,38,0.3)" : "none"
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <span>पूर्ण पाठ (Textbook Mode)</span>
              </button>

              <button
                type="button"
                onClick={() => setChapterViewMode("table")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: chapterViewMode === "table" ? "#2563eb" : "transparent",
                  color: chapterViewMode === "table" ? "#ffffff" : "#475569",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: chapterViewMode === "table" ? "0 2px 8px rgba(37,99,235,0.3)" : "none"
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                <span>Word Table (शब्दार्थ तालिका)</span>
              </button>

              <button
                type="button"
                onClick={() => setChapterViewMode("flashcard")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: chapterViewMode === "flashcard" ? "#7c3aed" : "transparent",
                  color: chapterViewMode === "flashcard" ? "#ffffff" : "#475569",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: chapterViewMode === "flashcard" ? "0 2px 8px rgba(124,58,237,0.3)" : "none"
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                <span>Flashcards (फ्ल्यासकार्ड)</span>
              </button>

              {/* Only show Chapter PDF to institute and students if admin uploaded this PDF */}
              {(Boolean(currentChapterObj.meaningPdfUrl) || isAdmin) && (
                <button
                  type="button"
                  onClick={() => setChapterViewMode("pdf")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: chapterViewMode === "pdf" ? "#059669" : "transparent",
                    color: chapterViewMode === "pdf" ? "#ffffff" : "#475569",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: chapterViewMode === "pdf" ? "0 2px 8px rgba(5,150,105,0.3)" : "none"
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <span>{currentChapterObj.meaningPdfUrl ? "Chapter PDF" : "Admin: + Upload Chapter PDF"}</span>
                </button>
              )}
            </div>

            {/* Word Search in this Chapter */}
            {chapterViewMode === "table" && (
              <div style={{ position: "relative", minWidth: "240px" }}>
                <input
                  type="text"
                  placeholder="Search in this chapter words..."
                  value={wordSearch}
                  onChange={(e) => setWordSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    outline: "none",
                    backgroundColor: "#f8fafc",
                    color: "#0f172a"
                  }}
                />
                <span style={{ position: "absolute", left: "10px", top: "9px", color: "#64748b", display: "inline-flex" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
              </div>
            )}
          </div>

          {/* ── SUB-VIEW 0: FULL COMPREHENSIVE TEXTBOOK VIEW (5 SECTIONS) ── */}
          {chapterViewMode === "book" && currentBookData && (
            <div>
              {/* Header Banner - Clean, Attractive Light Style */}
              <div style={{
                textAlign: "center",
                padding: "26px 20px",
                marginBottom: "28px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                color: "#0f172a",
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)"
              }}>
                <div style={{
                  display: "inline-block",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontWeight: "900",
                  fontSize: "13px",
                  padding: "4px 18px",
                  borderRadius: "20px",
                  marginBottom: "10px",
                  letterSpacing: "0.5px",
                  boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)"
                }}>
                  CHAPTER {String(currentBookData.chapter).padStart(2, '0')}
                </div>
                <h1 style={{ margin: "0 0 6px 0", fontSize: "28px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" }}>
                  {currentBookData.titleKo}
                </h1>
                <h2 style={{ margin: "0", fontSize: "20px", fontWeight: "800", color: "#dc2626" }}>
                  {currentBookData.titleNe}
                </h2>
              </div>

              {/* Navigation Bar directly above Section 1 */}
              {renderChapterNavBar()}

              {/* १. 핵심 단어 — महत्त्वपूर्ण शब्दार्थ */}
              <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                border: "1.5px solid #e2e8f0",
                padding: "22px",
                marginBottom: "30px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1.5px solid #e2e8f0"
                }}>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#dc2626" }}>१. 핵심 단어</span> — महत्त्वपूर्ण शब्दार्थ
                  </h3>
                </div>

                <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#1e40af", borderBottom: "2px solid #1d4ed8" }}>
                        <th style={{ padding: "12px 16px", color: "#ffffff", fontWeight: "800", width: "35%" }}>Korean शब्द</th>
                        <th style={{ padding: "12px 16px", color: "#ffffff", fontWeight: "800", width: "40%" }}>नेपाली अर्थ</th>
                        <th style={{ padding: "12px 16px", color: "#ffffff", fontWeight: "800", width: "25%" }}>उच्चारण</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBookData.words.map((w, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc"
                          }}
                        >
                          <td style={{ padding: "12px 16px", fontWeight: "800", color: "#0f172a", fontSize: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <button
                                type="button"
                                onClick={() => handleSpeak(w.korean, `tb_${idx}`)}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  border: "1px solid #e2e8f0",
                                  backgroundColor: speakingWordId === `tb_${idx}` ? "#dc2626" : "#f1f5f9",
                                  color: speakingWordId === `tb_${idx}` ? "#ffffff" : "#0f172a",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px"
                                }}
                                title="उच्चारण सुन्नुहोस्"
                              >
                                🔊
                              </button>
                              <span>{w.korean}</span>
                              {w.category && (
                                <span style={{ fontSize: "10px", fontWeight: "700", color: "#2563eb", backgroundColor: "#eff6ff", padding: "2px 6px", borderRadius: "4px" }}>
                                  {w.category}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>
                            {w.nepali}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#64748b", fontWeight: "600", fontSize: "13px" }}>
                            {w.pronunciation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* २. 기본 표현 — आधारभूत वाक्य तथा नेपाली अर्थ */}
              <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                border: "1.5px solid #e2e8f0",
                padding: "22px",
                marginBottom: "30px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
              }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "19px", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", paddingBottom: "12px", borderBottom: "1.5px solid #e2e8f0" }}>
                  <span style={{ color: "#0284c7" }}>२. 기본 표현</span> — आधारभूत वाक्य तथा नेपाली अर्थ
                </h3>
                <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#1e40af", borderBottom: "2px solid #1d4ed8" }}>
                        <th style={{ padding: "12px 16px", color: "#ffffff", fontWeight: "800", width: "55%" }}>Korean वाक्य</th>
                        <th style={{ padding: "12px 16px", color: "#ffffff", fontWeight: "800", width: "45%" }}>नेपाली अर्थ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentBookData.expressions || []).map((exp, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc"
                          }}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                              <button
                                type="button"
                                onClick={() => handleSpeak(exp.korean, `exp_${idx}`)}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  border: "1px solid #e2e8f0",
                                  backgroundColor: speakingWordId === `exp_${idx}` ? "#2563eb" : "#f1f5f9",
                                  color: speakingWordId === `exp_${idx}` ? "#ffffff" : "#0f172a",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  flexShrink: 0
                                }}
                                title="उच्चारण सुन्नुहोस्"
                              >
                                🔊
                              </button>
                              <div>
                                <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px" }}>
                                  {exp.korean}
                                </div>
                                {exp.pronunciation && (
                                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                    उच्चारण: {exp.pronunciation}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>
                            {exp.nepali}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ३. 문법 — व्याकरणको विस्तृत व्याख्या */}
              <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                border: "1.5px solid #e2e8f0",
                padding: "22px",
                marginBottom: "30px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
              }}>
                <h3 style={{ margin: "0 0 18px 0", fontSize: "19px", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", paddingBottom: "12px", borderBottom: "1.5px solid #e2e8f0" }}>
                  <span style={{ color: "#7c3aed" }}>३. 문법</span> — व्याकरणको विस्तृत व्याख्या
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {(currentBookData.grammars || []).map((gm, gIdx) => (
                    <div
                      key={gIdx}
                      style={{
                        backgroundColor: "#f8fafc",
                        borderRadius: "12px",
                        border: "1.5px solid #e2e8f0",
                        padding: "18px 20px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span style={{
                          backgroundColor: "#7c3aed",
                          color: "#ffffff",
                          fontWeight: "900",
                          fontSize: "13px",
                          padding: "4px 12px",
                          borderRadius: "6px"
                        }}>
                          {gm.label || `Grammar ${gIdx + 1}: ${gm.pattern}`}
                        </span>
                        {gm.meaningNe && (
                          <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                            अर्थ: {renderRuleWithSymbols(gm.meaningNe)}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6", margin: "10px 0" }}>
                        <strong style={{ color: "#1d4ed8" }}>प्रयोग:</strong> {renderRuleWithSymbols(gm.usage)}
                      </div>

                      {gm.batchimRule && (
                        <div style={{
                          backgroundColor: "#f1f5f9",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          color: "#0f172a",
                          margin: "10px 0",
                          whiteSpace: "pre-line"
                        }}>
                          <strong style={{ color: "#0284c7" }}>नियम:</strong><br />
                          {renderRuleWithSymbols(gm.batchimRule)}
                        </div>
                      )}

                      {gm.structure && (
                        <div style={{ fontSize: "13px", color: "#7c3aed", margin: "8px 0", fontWeight: "700" }}>
                          बनावट: {renderRuleWithSymbols(gm.structure)}
                        </div>
                      )}

                      {gm.examples && gm.examples.length > 0 && (
                        <div style={{ marginTop: "12px" }}>
                          <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                            उदाहरण:
                          </div>
                          <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", backgroundColor: "#ffffff" }}>
                              <thead>
                                <tr style={{ backgroundColor: "#1e40af", borderBottom: "1.5px solid #1d4ed8" }}>
                                  <th style={{ padding: "8px 12px", color: "#ffffff", width: "50%", fontWeight: "800" }}>Korean</th>
                                  <th style={{ padding: "8px 12px", color: "#ffffff", width: "50%", fontWeight: "800" }}>नेपाली अर्थ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {gm.examples.map((ex, eIdx) => (
                                  <tr key={eIdx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "8px 12px", fontWeight: "700", color: "#0f172a" }}>
                                      {ex.korean}
                                    </td>
                                    <td style={{ padding: "8px 12px", color: "#15803d", fontWeight: "600" }}>
                                      {ex.nepali}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {gm.answerMethod && (
                        <div style={{
                          marginTop: "12px",
                          backgroundColor: "#fdf4ff",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px dashed #c084fc",
                          fontSize: "13px",
                          color: "#581c87",
                          whiteSpace: "pre-line"
                        }}>
                          <strong style={{ color: "#a21caf" }}>उत्तर दिने तरिका:</strong><br />
                          {renderRuleWithSymbols(gm.answerMethod)}
                        </div>
                      )}

                      {gm.examNote && (
                        <div style={{
                          marginTop: "10px",
                          backgroundColor: "#faf5ff",
                          color: "#581c87",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                          border: "1px solid #e9d5ff"
                        }}>
                          {renderRuleWithSymbols(gm.examNote)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ४. 대화 — संवाद अभ्यास */}
              <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                border: "1.5px solid #e2e8f0",
                padding: "22px",
                marginBottom: "30px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
              }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "19px", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", paddingBottom: "12px", borderBottom: "1.5px solid #e2e8f0" }}>
                  <span style={{ color: "#16a34a" }}>४. 대화</span> — संवाद अभ्यास
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(currentBookData.dialogues || []).map((dlg, dIdx) => (
                    <div
                      key={dIdx}
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "14px 16px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{
                          fontSize: "12px",
                          fontWeight: "900",
                          backgroundColor: dIdx % 2 === 0 ? "#16a34a" : "#2563eb",
                          color: "#ffffff",
                          padding: "2px 8px",
                          borderRadius: "4px"
                        }}>
                          {dlg.speakerKo} ({dlg.speakerNe})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const isMale = ['아궁', '마두', '민수', '바트', '지훈', '반장님', '공장장님'].some(n => (dlg.speakerKo || '').includes(n));
                            handleSpeak(dlg.ko, `dlg_${dIdx}`, isMale ? 'male' : 'female');
                          }}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: "1px solid #e2e8f0",
                            backgroundColor: speakingWordId === `dlg_${dIdx}` ? "#16a34a" : "#ffffff",
                            color: speakingWordId === `dlg_${dIdx}` ? "#ffffff" : "#0f172a",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px"
                          }}
                          title="सम्वाद सुन्नुहोस्"
                        >
                          🔊
                        </button>
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "2px" }}>
                        {dlg.ko}
                      </div>
                      {dlg.nePron && (
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                          उच्चारण: {dlg.nePron}
                        </div>
                      )}
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#166534" }}>
                        {dlg.ne}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ५. EPS-TOPIK अभ्यास प्रश्न */}
              <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1.5px solid #e2e8f0",
                padding: "24px",
                marginBottom: "30px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "18px",
                  paddingBottom: "12px",
                  borderBottom: "1.5px solid #e2e8f0"
                }}>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#ea580c" }}>५. EPS-TOPIK</span> अभ्यास प्रश्न
                  </h3>
                  <span style={{ fontSize: "12px", fontWeight: "800", backgroundColor: "#fff7ed", color: "#c2410c", padding: "4px 12px", borderRadius: "10px", border: "1px solid #ffedd5" }}>
                    ४ वटा अभ्यास प्रश्नहरू
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {(currentBookData.quiz || []).map((q, qIdx) => {
                    const selectedAns = userQuizAnswers[q.id];
                    const isCorrect = selectedAns === q.correctAnswer;

                    return (
                      <div
                        key={q.id || qIdx}
                        style={{
                          backgroundColor: "#f8fafc",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          padding: "16px 18px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.02)"
                        }}
                      >
                        <div style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", marginBottom: "12px" }}>
                          {qIdx + 1}. {q.question}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px" }}>
                          {q.options.map((opt, optIdx) => {
                            const isThisSelected = selectedAns === opt;
                            let optBg = "#ffffff";
                            let optBorder = "#cbd5e1";
                            let optColor = "#0f172a";

                            if (quizSubmitted) {
                              if (opt === q.correctAnswer) {
                                optBg = "#f0fdf4";
                                optBorder = "#22c55e";
                                optColor = "#15803d";
                              } else if (isThisSelected && !isCorrect) {
                                optBg = "#fef2f2";
                                optBorder = "#ef4444";
                                optColor = "#b91c1c";
                              }
                            } else if (isThisSelected) {
                              optBg = "#eff6ff";
                              optBorder = "#3b82f6";
                              optColor = "#1d4ed8";
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() => {
                                  setUserQuizAnswers(prev => ({ ...prev, [q.id]: opt }));
                                }}
                                style={{
                                  padding: "10px 14px",
                                  borderRadius: "8px",
                                  border: `1.5px solid ${optBorder}`,
                                  backgroundColor: optBg,
                                  color: optColor,
                                  textAlign: "left",
                                  fontSize: "14px",
                                  fontWeight: isThisSelected ? "800" : "600",
                                  cursor: quizSubmitted ? "default" : "pointer",
                                  transition: "all 0.15s ease",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px"
                                }}
                              >
                                <span style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  border: `1.5px solid ${isThisSelected ? optColor : '#cbd5e1'}`,
                                  backgroundColor: isThisSelected ? '#2563eb' : '#ffffff',
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "11px",
                                  color: "#ffffff",
                                  fontWeight: "900",
                                  flexShrink: 0
                                }}>
                                  {isThisSelected ? '✓' : ''}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div style={{
                            marginTop: "12px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2",
                            border: `1px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
                            fontSize: "13px"
                          }}>
                            <div style={{ fontWeight: "800", color: isCorrect ? "#15803d" : "#b91c1c" }}>
                              {isCorrect ? (
                                <span><span style={{ color: "#16a34a", fontWeight: "900", marginRight: "6px" }}>✔</span>सही उत्तर!</span>
                              ) : (
                                <span><span style={{ color: "#dc2626", fontWeight: "900", marginRight: "6px" }}>X</span>गलत! सही उत्तर: {q.correctAnswer}</span>
                              )}
                            </div>
                            {q.explanation && (
                              <div style={{ color: "#475569", marginTop: "3px" }}>
                                व्याख्या: {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quiz Controls */}
                <div style={{
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px"
                }}>
                  {!quizSubmitted ? (
                    <button
                      type="button"
                      onClick={() => setQuizSubmitted(true)}
                      style={{
                        backgroundColor: "#ea580c",
                        color: "#ffffff",
                        border: "none",
                        padding: "10px 22px",
                        borderRadius: "8px",
                        fontWeight: "900",
                        fontSize: "14px",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)"
                      }}
                    >
                      उत्तर जाँच गर्नुहोस्
                    </button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                      <div style={{
                        backgroundColor: quizScore === 4 ? "#f0fdf4" : "#eff6ff",
                        color: quizScore === 4 ? "#15803d" : "#1d4ed8",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: "900",
                        border: `1.5px solid ${quizScore === 4 ? '#86efac' : '#93c5fd'}`
                      }}>
                        प्राप्ताङ्क: {quizScore} / 4
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUserQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          padding: "8px 18px",
                          borderRadius: "8px",
                          fontWeight: "800",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                      >
                        फेरि अभ्यास गर्नुहोस्
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {renderChapterNavBar()}
            </div>
          )}

          {/* ── SUB-VIEW A: WORD TABLE / LIST VIEW ────────────────────────── */}
          {chapterViewMode === "table" && (
            <div>
              {renderChapterNavBar()}
              {currentChapterWords.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                  शब्द फेला परेन। कृपया फरक शब्द खोज्नुहोस्।
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {currentChapterWords.map((w, idx) => (
                    <div
                      key={w.id || idx}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                        transition: "all 0.15s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#93c5fd";
                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
                      }}
                    >
                      {/* Left: Korean Word & Audio */}
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "220px" }}>
                        <button
                          type="button"
                          onClick={() => handleSpeak(w.korean, w.id)}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: speakingWordId === w.id ? "#2563eb" : "#f1f5f9",
                            color: speakingWordId === w.id ? "#ffffff" : "#0f172a",
                            border: "1.5px solid #e2e8f0",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "15px"
                          }}
                          title="Play Korean pronunciation"
                        >
                          🔊
                        </button>
                        <div>
                          <div style={{ fontSize: "19px", fontWeight: "900", color: "#0f172a", letterSpacing: "0.2px" }}>
                            {w.korean}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                            उच्चारण: {w.pronunciation}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Nepali Meaning & English */}
                      <div style={{ flex: 1, minWidth: "220px" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                          {w.nepali}
                        </div>
                        {w.english && (
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            {w.english}
                          </div>
                        )}
                      </div>

                      {/* Right: Category badge */}
                      {w.category && (
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          backgroundColor: "#eff6ff",
                          color: "#1d4ed8",
                          padding: "3px 8px",
                          borderRadius: "10px",
                          border: "1px solid #bfdbfe"
                        }}>
                          {w.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SUB-VIEW B: FLASHCARD MODE ─────────────────────────────────── */}
          {chapterViewMode === "flashcard" && (
            <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto", padding: "10px 0" }}>
              {renderChapterNavBar()}
              {currentChapterWords.length === 0 ? (
                <div style={{ color: "#64748b" }}>यस च्याप्टरमा कुनै शब्द उपलब्ध छैन।</div>
              ) : (() => {
                const card = currentChapterWords[flashcardIndex] || currentChapterWords[0];

                return (
                  <div>
                    {/* Progress Indicator */}
                    <div style={{ marginBottom: "16px", fontSize: "13px", fontWeight: "700", color: "#64748b" }}>
                      Card {flashcardIndex + 1} of {currentChapterWords.length}
                    </div>

                    {/* Interactive Flashcard */}
                    <div
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "20px",
                        border: "2px solid #e2e8f0",
                        boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                        minHeight: "260px",
                        padding: "36px 24px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        position: "relative"
                      }}
                    >
                      <span style={{
                        position: "absolute",
                        top: "14px",
                        right: "16px",
                        fontSize: "12px",
                        fontWeight: "800",
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}>
                        {isCardFlipped ? "Flip to Korean ↺" : "Click to Reveal Nepali ↻"}
                      </span>

                      {!isCardFlipped ? (
                        /* Front side: Korean */
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0284c7", marginBottom: "8px" }}>
                            {card.category || "Vocabulary"}
                          </div>
                          <h2 style={{ fontSize: "38px", fontWeight: "900", color: "#0f172a", margin: "0 0 16px 0" }}>
                            {card.korean}
                          </h2>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeak(card.korean);
                            }}
                            style={{
                              backgroundColor: "#f1f5f9",
                              color: "#0f172a",
                              border: "1.5px solid #cbd5e1",
                              borderRadius: "20px",
                              padding: "6px 14px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            🔊 उच्चारण सुन्नुहोस्
                          </button>
                        </div>
                      ) : (
                        /* Back side: Nepali Meaning & Pronunciation */
                        <div>
                          <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>
                            उच्चारण: <strong style={{ color: "#0f172a" }}>{card.pronunciation}</strong>
                          </div>
                          <h2 style={{ fontSize: "30px", fontWeight: "900", color: "#dc2626", margin: "0 0 8px 0" }}>
                            {card.nepali}
                          </h2>
                          {card.english && (
                            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "14px" }}>
                              {card.english}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginTop: "20px" }}>
                      <button
                        type="button"
                        disabled={flashcardIndex <= 0}
                        onClick={() => {
                          setFlashcardIndex(prev => Math.max(0, prev - 1));
                          setIsCardFlipped(false);
                        }}
                        style={{
                          padding: "10px 20px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: flashcardIndex <= 0 ? "#f1f5f9" : "#ffffff",
                          color: flashcardIndex <= 0 ? "#94a3b8" : "#0f172a",
                          cursor: flashcardIndex <= 0 ? "not-allowed" : "pointer",
                          fontWeight: "800",
                          fontSize: "13px"
                        }}
                      >
                        ◀ Previous Word
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = (flashcardIndex + 1) % currentChapterWords.length;
                          setFlashcardIndex(nextIdx);
                          setIsCardFlipped(false);
                        }}
                        style={{
                          padding: "10px 24px",
                          borderRadius: "10px",
                          border: "none",
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          cursor: "pointer",
                          fontWeight: "800",
                          fontSize: "13px",
                          boxShadow: "0 2px 8px rgba(37,99,235,0.3)"
                        }}
                      >
                        Next Word ▶
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── SUB-VIEW C: CHAPTER PDF DOCUMENT ───────────────────────────── */}
          {/* Strictly only show if admin uploaded the PDF, or if user is admin */}
          {chapterViewMode === "pdf" && (Boolean(currentChapterObj.meaningPdfUrl) || isAdmin) && (
            <div>
              {renderChapterNavBar()}
              {currentChapterObj.meaningPdfUrl ? (
                <div style={{ borderRadius: "12px", overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
                  <iframe
                    src={getCleanPdfUrl ? getCleanPdfUrl(currentChapterObj.meaningPdfUrl) : currentChapterObj.meaningPdfUrl}
                    title={`Chapter ${currentChapterObj.chapter} PDF`}
                    style={{ width: "100%", height: "700px", border: "none" }}
                  />
                </div>
              ) : (
                isAdmin && (
                  <div style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: "14px",
                    padding: "40px",
                    textAlign: "center",
                    border: "1px dashed #cbd5e1"
                  }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#ffffff", color: "#64748b", margin: "0 auto 10px auto", border: "1px solid #e2e8f0" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </div>
                    <h4 style={{ margin: "10px 0 6px 0", fontSize: "18px", color: "#0f172a" }}>
                      अहिले कुनै छुट्टै पिडिएफ फाइल जोडिएको छैन
                    </h4>
                    <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 16px 0" }}>
                      यस अध्यायका सम्पूर्ण आधिकारिक शब्दार्थ माथि 'Word Table' र 'Flashcard' ट्याबमा उपलब्ध छन्।
                    </p>
                    {onOpenEditModal && (
                      <button
                        type="button"
                        onClick={() => onOpenEditModal(currentChapterObj)}
                        style={{
                          backgroundColor: "#16a34a",
                          color: "#ffffff",
                          border: "none",
                          padding: "10px 18px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                      >
                        + Upload Chapter {currentChapterObj.chapter} Meaning PDF
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
