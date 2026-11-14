'use client';

import React, { useState, useEffect, useRef } from "react";

// Safe text extractor
const safeText = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return String(val.text || val.label || "");
  return String(val);
};

export default function JlptMockExamModal({
  examSet,
  mode = "student", // "student" | "institute" | "admin"
  onClose,
  onComplete
}) {
  if (!examSet) return null;

  const questions = examSet.questions || [];
  const totalQuestions = questions.length;
  const initialDuration = (examSet.timeMin || 50) * 60; // in seconds

  // State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewShowAnswers, setPreviewShowAnswers] = useState(mode === "institute" || mode === "admin");
  const [reviewFilter, setReviewFilter] = useState("all"); // "all" | "wrong" | "flagged"
  const [audioPlayCounts, setAudioPlayCounts] = useState({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioStatusText, setAudioStatusText] = useState("");
  const [examResult, setExamResult] = useState(null);

  // Audio Ref
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const currentQ = questions[currentQIndex] || questions[0];

  // Colors for JLPT Level
  const levelTheme = {
    "JLPT N5": { primary: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
    "JLPT N4": { primary: "#059669", bg: "#ecfdf5", border: "#a7f3d0", text: "#047857" },
    "JLPT N3": { primary: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff", text: "#6d28d9" },
    "JLPT N2": { primary: "#ea580c", bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
    "JLPT N1": { primary: "#dc2626", bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
    "JFT-Basic": { primary: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", text: "#0e7490" }
  }[examSet.level] || { primary: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" };

  // Auto-rotate and lock screen to landscape mode for Mock Exam
  useEffect(() => {
    if (examSet && examSet.id && typeof window !== "undefined") {
      try {
        localStorage.setItem(`offline_jlpt_mock_${examSet.id}`, JSON.stringify(examSet));
      } catch (e) {
        console.warn("Failed to cache JLPT mock set:", e);
      }
    }

    if (typeof window !== "undefined") {
      const lockLandscape = async () => {
        try {
          // Re-enter fullscreen if dismissed
          if (!document.fullscreenElement) {
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) await docEl.requestFullscreen().catch(() => {});
            else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
            else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
            else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
          }
        } catch (e) {}

        try {
          if (screen.orientation && typeof screen.orientation.lock === "function") {
            await screen.orientation.lock("landscape").catch(() => {});
          } else if (screen.lockOrientation) {
            screen.lockOrientation("landscape");
          } else if (screen.webkitLockOrientation) {
            screen.webkitLockOrientation("landscape");
          } else if (screen.mozLockOrientation) {
            screen.mozLockOrientation("landscape");
          }
        } catch (e) {}
      };

      // Re-lock on every rotation attempt
      window.addEventListener("orientationchange", lockLandscape);
      if (screen.orientation) screen.orientation.addEventListener("change", lockLandscape);

      // Initial lock
      lockLandscape();

      return () => {
        window.removeEventListener("orientationchange", lockLandscape);
        if (screen.orientation) screen.orientation.removeEventListener("change", lockLandscape);
        try {
          if (screen.orientation && typeof screen.orientation.unlock === "function") {
            screen.orientation.unlock();
          }
        } catch (e) {}
        try {
          if (document.fullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          }
        } catch (e) {}
      };
    }
    return () => {};
  }, []);

  // Timer countdown for active exam
  useEffect(() => {
    if (isExamSubmitted || mode === "institute" || mode === "admin") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamSubmitted, mode]);

  // Clean audio on unmount or question switch
  useEffect(() => {
    stopCurrentAudio();
  }, [currentQIndex]);

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setAudioStatusText("");
  };

  // Play Tokyo Japanese Listening Audio
  const handlePlayListeningAudio = async (q) => {
    if (isPlayingAudio) {
      stopCurrentAudio();
      return;
    }

    const currentCount = audioPlayCounts[q.id] || 0;
    const maxPlays = (mode === "student" && !isExamSubmitted) ? 2 : 999;

    if (currentCount >= maxPlays) {
      alert("You have reached the maximum 2 audio plays allowed for this official listening question.");
      return;
    }

    setIsPlayingAudio(true);
    setAudioStatusText("Playing Tokyo Japanese Voice...");
    setAudioPlayCounts(prev => ({ ...prev, [q.id]: currentCount + 1 }));

    const textToSpeak = q.audioText || q.audioScript || q.questionText || "";

    // 1. Try Microsoft / Server TTS endpoint first
    try {
      const ttsUrl = `/api/tts?lang=ja&voice=ja-JP-NanamiNeural&text=${encodeURIComponent(textToSpeak)}`;
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = ttsUrl;
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
        setAudioStatusText("Audio Completed");
      };
      audioRef.current.onerror = () => {
        // Fallback to Web Speech API
        playWithWebSpeech(textToSpeak);
      };
      await audioRef.current.play();
    } catch (err) {
      playWithWebSpeech(textToSpeak);
    }
  };

  const playWithWebSpeech = (text) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.95; // Official measured listening pace
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setAudioStatusText("Audio Completed");
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setAudioStatusText("");
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
      setAudioStatusText("");
      alert("Audio playback is not supported on this browser.");
    }
  };

  // Handle Option Select
  const handleSelectOption = (qId, optionIdx) => {
    if (isExamSubmitted && mode === "student") return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  // Toggle Flag
  const handleToggleFlag = (qId) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Auto submit when time runs out
  const handleAutoSubmit = () => {
    calculateAndFinishExam();
  };

  // Submit button click
  const handleSubmitExam = () => {
    setShowConfirmModal(true);
  };

  // Confirm submit
  const confirmSubmit = () => {
    setShowConfirmModal(false);
    calculateAndFinishExam();
  };

  // Score Calculation
  const calculateAndFinishExam = () => {
    stopCurrentAudio();
    if (timerRef.current) clearInterval(timerRef.current);

    let readingCorrect = 0;
    let readingTotal = 0;
    let listeningCorrect = 0;
    let listeningTotal = 0;
    let totalCorrect = 0;

    questions.forEach((q) => {
      const isListening = q.type === "Listening";
      if (isListening) listeningTotal++;
      else readingTotal++;

      const studentAns = selectedAnswers[q.id];
      if (studentAns !== undefined && studentAns === q.answer) {
        totalCorrect++;
        if (isListening) listeningCorrect++;
        else readingCorrect++;
      }
    });

    const readingScore = Math.round((readingCorrect / (readingTotal || 1)) * 100);
    const listeningScore = Math.round((listeningCorrect / (listeningTotal || 1)) * 80);
    const totalScore = readingScore + listeningScore;
    const isPassed = totalScore >= (examSet.passScore || 80);
    const timeSpentSec = initialDuration - timeLeft;

    const resultPayload = {
      examId: examSet.id,
      examTitle: examSet.title,
      level: examSet.level,
      totalQuestions,
      totalCorrect,
      readingCorrect,
      readingTotal,
      readingScore,
      listeningCorrect,
      listeningTotal,
      listeningScore,
      totalScore,
      maxScore: examSet.totalScore || 180,
      passScore: examSet.passScore || 80,
      isPassed,
      timeSpentSec,
      completedAt: new Date().toISOString()
    };

    setExamResult(resultPayload);
    setIsExamSubmitted(true);

    // Save to local storage history
    if (typeof window !== "undefined") {
      try {
        const history = JSON.parse(localStorage.getItem("jlptExamResults") || "[]");
        history.unshift(resultPayload);
        localStorage.setItem("jlptExamResults", JSON.stringify(history.slice(0, 30)));
      } catch (e) { }
    }

    if (onComplete) onComplete(resultPayload);
  };

  // Reset / Retake Exam
  const handleRetakeExam = () => {
    stopCurrentAudio();
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setTimeLeft(initialDuration);
    setIsExamSubmitted(false);
    setExamResult(null);
    setCurrentQIndex(0);
    setAudioPlayCounts({});
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  return (
    <div className="jlpt-exam-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(6px)",
      zIndex: 99999,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "12px",
      boxSizing: "border-box"
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .jlpt-exam-modal {
          width: 100%;
          max-width: 1140px;
          height: 94vh;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: #ffffff;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          position: relative;
        }
        .jlpt-exam-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .jlpt-exam-question-area {
          flex: 1;
          padding: 24px 30px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .jlpt-exam-sidebar {
          width: 280px;
          background-color: #f8fafc;
          border-left: 1.5px solid #e2e8f0;
          padding: 18px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        @media (max-width: 860px) and (orientation: portrait) {
          .jlpt-exam-overlay {
            padding: 0 !important;
          }
          .jlpt-exam-modal {
            height: 100vh !important;
            height: 100dvh !important;
            max-height: 100vh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
          }
          .jlpt-exam-body {
            flex-direction: column !important;
          }
          .jlpt-exam-question-area {
            padding: 16px 14px !important;
          }
          .jlpt-exam-sidebar {
            width: 100% !important;
            border-left: none !important;
            border-top: 1.5px solid #e2e8f0 !important;
            max-height: 220px !important;
            padding: 12px 14px !important;
          }
        }
        @media (orientation: landscape) and (max-height: 600px) {
          .jlpt-exam-overlay {
            padding: 0 !important;
          }
          .jlpt-exam-modal {
            height: 100vh !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
          }
          .jlpt-exam-body {
            flex-direction: row !important;
          }
          .jlpt-exam-question-area {
            padding: 10px 16px !important;
            flex: 1 !important;
          }
          .jlpt-exam-sidebar {
            width: 220px !important;
            border-left: 1.5px solid #e2e8f0 !important;
            border-top: none !important;
            max-height: none !important;
            padding: 10px 12px !important;
          }
        }
        @media (max-width: 540px) {
          .jlpt-exam-question-area {
            padding: 12px 10px !important;
          }
          .jlpt-confirm-card {
            padding: 18px 14px !important;
          }
        }
        @media (orientation: landscape) and (max-height: 520px) {
          .jlpt-confirm-card {
            padding: 12px 16px !important;
            border-radius: 12px !important;
            max-height: 94dvh !important;
          }
          .jlpt-score-banner {
            padding: 10px 14px !important;
            margin-bottom: 12px !important;
            gap: 12px !important;
          }
          .jlpt-score-banner h2 {
            font-size: 16px !important;
            margin: 4px 0 !important;
          }
          .jlpt-score-banner p {
            font-size: 11.5px !important;
          }
          .jlpt-score-circle-card {
            padding: 6px 14px !important;
          }
        }
        @media (max-width: 600px) and (orientation: portrait) {
          .jlpt-score-banner {
            flex-direction: column !important;
            padding: 14px 16px !important;
            align-items: flex-start !important;
          }
          .jlpt-score-details-row {
            flex-direction: column !important;
            width: 100% !important;
          }
        }
      ` }} />
      {/* MAIN EXAM CONTAINER */}
      <div className="jlpt-exam-modal" style={{
        border: `2px solid ${levelTheme.border}`
      }}>
        {/* ============================================================== */}
        {/* HEADER BAR                                                     */}
        {/* ============================================================== */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "14px 22px",
          borderBottom: "1.5px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
        }}>
          {/* Left Title & Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{
              backgroundColor: levelTheme.bg,
              color: levelTheme.text,
              border: `1.5px solid ${levelTheme.border}`,
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "900",
              letterSpacing: "0.5px"
            }}>
              {examSet.level}
            </span>

            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⛩️</span>
                <span>{examSet.title}</span>
              </h3>
              <div style={{ fontSize: "12px", color: levelTheme.primary, fontWeight: "700" }}>
                {examSet.titleJp}
              </div>
            </div>
          </div>

          {/* Center Mode / Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {mode !== "student" ? (
              <span style={{
                backgroundColor: "#fef3c7",
                color: "#b45309",
                border: "1px solid #fde68a",
                padding: "5px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "800"
              }}>
                👁️ Teacher / Institute Preview Mode
              </span>
            ) : null}

            {/* Teacher toggle for answers */}
            {(mode === "institute" || mode === "admin") && !isExamSubmitted && (
              <button
                type="button"
                onClick={() => setPreviewShowAnswers(!previewShowAnswers)}
                style={{
                  backgroundColor: previewShowAnswers ? "#16a34a" : "#f1f5f9",
                  color: previewShowAnswers ? "#ffffff" : "#475569",
                  border: "none",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                {previewShowAnswers ? "✅ Answer Keys Visible" : "👁️ Reveal Answers"}
              </button>
            )}
          </div>

          {/* Right Timer & Exit */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {!isExamSubmitted && mode === "student" && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: timeLeft < 300 ? "#fee2e2" : "#f8fafc",
                padding: "6px 14px",
                borderRadius: "10px",
                border: timeLeft < 300 ? "1.5px solid #ef4444" : "1px solid #e2e8f0"
              }}>
                <span style={{ fontSize: "16px" }}>⏱️</span>
                <span style={{
                  fontSize: "16px",
                  fontWeight: "900",
                  color: timeLeft < 300 ? "#b91c1c" : "#0f172a",
                  fontVariantNumeric: "tabular-nums"
                }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (!isExamSubmitted && mode === "student" && answeredCount > 0) {
                  if (confirm("Are you sure you want to exit the exam? Your ongoing progress will be lost.")) {
                    stopCurrentAudio();
                    onClose();
                  }
                } else {
                  stopCurrentAudio();
                  onClose();
                }
              }}
              style={{
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #cbd5e1",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer"
              }}
            >
              ✕ Exit
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUBMITTED RESULT VIEW                                          */}
        {/* ============================================================== */}
        {isExamSubmitted && examResult ? (
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            backgroundColor: "#f8fafc"
          }}>
            {/* SCORE BANNER */}
            <div className="jlpt-score-banner" style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px 30px",
              border: `2px solid ${examResult.isPassed ? "#86efac" : "#fca5a5"}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px"
            }}>
              <div>
                <span style={{
                  backgroundColor: examResult.isPassed ? "#dcfce7" : "#fee2e2",
                  color: examResult.isPassed ? "#15803d" : "#b91c1c",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "900",
                  letterSpacing: "0.5px"
                }}>
                  {examResult.isPassed ? "合格 (PASSED)" : "不合格 (FAILED)"}
                </span>

                <h2 style={{ margin: "12px 0 6px 0", fontSize: "24px", fontWeight: "900", color: "#0f172a" }}>
                  {examResult.isPassed ? "Congratulations! You passed the official benchmark." : "Good effort! Keep practicing to achieve the passing mark."}
                </h2>
                <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                  Official Pass Requirement: <strong>{examResult.passScore}</strong> / {examResult.maxScore} Points. Time taken: {Math.floor(examResult.timeSpentSec / 60)} min {examResult.timeSpentSec % 60} sec.
                </p>
              </div>

              {/* Total Score Circle Card */}
              <div className="jlpt-score-details-row" style={{
                display: "flex",
                alignItems: "center",
                gap: "20px"
              }}>
                <div className="jlpt-score-circle-card" style={{
                  backgroundColor: levelTheme.bg,
                  border: `2px solid ${levelTheme.border}`,
                  borderRadius: "16px",
                  padding: "16px 24px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: levelTheme.text, fontWeight: "800", textTransform: "uppercase" }}>
                    Total Score
                  </div>
                  <div style={{ fontSize: "36px", fontWeight: "900", color: levelTheme.primary, lineHeight: "1.2" }}>
                    {examResult.totalScore}
                    <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "600" }}> / {examResult.maxScore}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>
                    Accuracy: {Math.round((examResult.totalCorrect / examResult.totalQuestions) * 100)}%
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ backgroundColor: "#ffffff", padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}>
                    📚 <strong>Reading / Knowledge:</strong> {examResult.readingScore} / 100 ({examResult.readingCorrect}/{examResult.readingTotal} Correct)
                  </div>
                  <div style={{ backgroundColor: "#ffffff", padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}>
                    🎧 <strong>Listening:</strong> {examResult.listeningScore} / 80 ({examResult.listeningCorrect}/{examResult.listeningTotal} Correct)
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS & FILTER */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "20px"
            }}>
              {/* Filter pills */}
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { id: "all", label: `All Questions (${totalQuestions})` },
                  { id: "wrong", label: `Incorrect Only (${totalQuestions - examResult.totalCorrect})` },
                  { id: "flagged", label: `Flagged (${flaggedCount})` }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setReviewFilter(f.id)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: reviewFilter === f.id ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                      backgroundColor: reviewFilter === f.id ? "#eff6ff" : "#ffffff",
                      color: reviewFilter === f.id ? "#1d4ed8" : "#475569"
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleRetakeExam}
                  style={{
                    backgroundColor: "#2563eb",
                    backgroundImage: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.3)"
                  }}
                >
                  🔄 Retake Mock Exam
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  ⛩️ Back to Question Bank
                </button>
              </div>
            </div>

            {/* REVIEW QUESTIONS LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {questions
                .filter(q => {
                  const studentAns = selectedAnswers[q.id];
                  const isCorrect = studentAns === q.answer;
                  if (reviewFilter === "wrong") return !isCorrect;
                  if (reviewFilter === "flagged") return Boolean(flaggedQuestions[q.id]);
                  return true;
                })
                .map((q) => {
                  const studentAns = selectedAnswers[q.id];
                  const isCorrect = studentAns === q.answer;
                  const isFlagged = Boolean(flaggedQuestions[q.id]);

                  return (
                    <div
                      key={q.id}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        padding: "20px",
                        border: isCorrect ? "1.5px solid #86efac" : "1.5px solid #fca5a5",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                      }}
                    >
                      {/* Q Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "800",
                            backgroundColor: isCorrect ? "#dcfce7" : "#fee2e2",
                            color: isCorrect ? "#15803d" : "#b91c1c"
                          }}>
                            {isCorrect ? "✅ Correct" : "❌ Incorrect"}
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>
                            Q.{q.qIndex} • {q.sectionJp}
                          </span>
                          {isFlagged && <span style={{ fontSize: "12px" }}>🚩 Marked</span>}
                        </div>

                        {q.type === "Listening" && (
                          <button
                            type="button"
                            onClick={() => handlePlayListeningAudio(q)}
                            style={{
                              backgroundColor: "#eff6ff",
                              color: "#1d4ed8",
                              border: "1px solid #bfdbfe",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            🎧 Replay Audio
                          </button>
                        )}
                      </div>

                      {/* Instruction */}
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                        {q.instruction}
                      </div>

                      {/* Reading Passage if any */}
                      {q.readingPassage && (
                        <div style={{
                          backgroundColor: "#f8fafc",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "13px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-line",
                          color: "#334155",
                          marginBottom: "10px"
                        }}>
                          {q.readingPassage}
                        </div>
                      )}

                      {/* Question Text */}
                      <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                        {q.questionText}
                      </div>

                      {/* Options Grid */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "8px",
                        marginBottom: "14px"
                      }}>
                        {q.options.map((optItem, oIdx) => {
                          const isStudentPick = studentAns === oIdx;
                          const isRightAnswer = q.answer === oIdx;

                          let bg = "#f8fafc";
                          let border = "#e2e8f0";
                          let color = "#334155";

                          if (isRightAnswer) {
                            bg = "#dcfce7";
                            border = "#4ade80";
                            color = "#15803d";
                          } else if (isStudentPick && !isRightAnswer) {
                            bg = "#fee2e2";
                            border = "#f87171";
                            color = "#b91c1c";
                          }

                          return (
                            <div
                              key={oIdx}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: `1.5px solid ${border}`,
                                backgroundColor: bg,
                                color: color,
                                fontSize: "13px",
                                fontWeight: (isRightAnswer || isStudentPick) ? "800" : "500",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                              }}
                            >
                              <span>{["①", "②", "③", "④"][oIdx]}</span>
                              <span>{optItem.text}</span>
                              {isRightAnswer && <span style={{ marginLeft: "auto" }}>✓ Correct</span>}
                              {isStudentPick && !isRightAnswer && <span style={{ marginLeft: "auto" }}>✗ Your Pick</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Explanation (Japanese + English + Nepali) */}
                      {q.explanation && (
                        <div style={{
                          backgroundColor: "#eff6ff",
                          padding: "12px 16px",
                          borderRadius: "10px",
                          border: "1px solid #bfdbfe",
                          fontSize: "12px",
                          lineHeight: "1.5",
                          color: "#1e3a8a",
                          whiteSpace: "pre-line"
                        }}>
                          <strong>💡 Answer Key & Explanation:</strong>
                          <div style={{ marginTop: "4px" }}>{q.explanation}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* ACTIVE EXAM RUNNER WORKSPACE                                   */
          /* ============================================================== */
          <div className="jlpt-exam-body" style={{
            flex: 1,
            display: "flex",
            overflow: "hidden"
          }}>
            {/* ── LEFT: QUESTION & PASSAGE AREA ── */}
            <div className="jlpt-exam-question-area" style={{
              flex: 1,
              padding: "24px 30px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column"
            }}>
              {/* Top Section Tag */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    backgroundColor: levelTheme.bg,
                    color: levelTheme.text,
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "800"
                  }}>
                    {currentQ.sectionJp} ({currentQ.section})
                  </span>

                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>
                    Question {currentQIndex + 1} of {totalQuestions}
                  </span>
                </div>
              </div>

              {/* Official Instruction Header */}
              <div style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "10px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                color: "#475569",
                fontWeight: "600",
                marginBottom: "16px"
              }}>
                {currentQ.instruction}
              </div>

              {/* Reading Passage if any */}
              {currentQ.readingPassage && (
                <div style={{
                  backgroundColor: "#ffffff",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: "1.5px solid #cbd5e1",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  whiteSpace: "pre-line",
                  color: "#1e293b",
                  marginBottom: "18px"
                }}>
                  {currentQ.readingPassage}
                </div>
              )}

              {/* Listening Audio Box if type === "Listening" */}
              {currentQ.type === "Listening" && (
                <div style={{
                  backgroundColor: "#eff6ff",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: "1.5px solid #bfdbfe",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <button
                      type="button"
                      onClick={() => handlePlayListeningAudio(currentQ)}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: isPlayingAudio ? "#ef4444" : "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {isPlayingAudio ? "⏸" : "▶"}
                    </button>

                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e3a8a" }}>
                        🎧 Tokyo Japanese Audio Track
                      </div>
                      <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: "600" }}>
                        {audioStatusText || "Click play to listen to Tokyo dialogue"}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      backgroundColor: "#ffffff",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#1e40af",
                      border: "1px solid #dbeafe"
                    }}>
                      Plays: {audioPlayCounts[currentQ.id] || 0} / {mode === "student" ? 2 : "∞"}
                    </span>
                  </div>
                </div>
              )}

              {/* Main Question Text */}
              <div style={{
                fontSize: "17px",
                fontWeight: "800",
                color: "#0f172a",
                lineHeight: "1.5",
                marginBottom: "22px"
              }}>
                <span style={{ color: levelTheme.primary, marginRight: "8px" }}>
                  Q.{currentQ.qIndex}
                </span>
                {currentQ.questionText}
              </div>

              {/* 4 Options */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "24px"
              }}>
                {currentQ.options.map((optItem, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  const isRevealedCorrect = previewShowAnswers && currentQ.answer === optIdx;

                  let cardBorder = "#e2e8f0";
                  let cardBg = "#ffffff";
                  let circleBg = "#f1f5f9";
                  let circleColor = "#475569";

                  if (isSelected) {
                    cardBorder = "#2563eb";
                    cardBg = "#eff6ff";
                    circleBg = "#2563eb";
                    circleColor = "#ffffff";
                  } else if (isRevealedCorrect) {
                    cardBorder = "#16a34a";
                    cardBg = "#f0fdf4";
                    circleBg = "#16a34a";
                    circleColor = "#ffffff";
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      style={{
                        padding: "14px 18px",
                        borderRadius: "12px",
                        border: `2px solid ${cardBorder}`,
                        backgroundColor: cardBg,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 4px 12px rgba(37,99,235,0.12)" : "none"
                      }}
                    >
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: circleBg,
                        color: circleColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "900",
                        fontSize: "14px"
                      }}>
                        {["①", "②", "③", "④"][optIdx]}
                      </div>

                      <div style={{
                        fontSize: "15px",
                        fontWeight: isSelected ? "800" : "600",
                        color: isSelected ? "#1d4ed8" : "#1e293b",
                        flex: 1
                      }}>
                        {optItem.text}
                      </div>

                      {isRevealedCorrect && (
                        <span style={{
                          backgroundColor: "#dcfce7",
                          color: "#15803d",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "800"
                        }}>
                          Correct Key
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Teacher Explanation in Preview Mode */}
              {previewShowAnswers && currentQ.explanation && (
                <div style={{
                  backgroundColor: "#f0fdf4",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #bbf7d0",
                  fontSize: "12px",
                  color: "#166534",
                  whiteSpace: "pre-line",
                  marginTop: "auto"
                }}>
                  <strong>💡 Instructor Explanation:</strong>
                  <div style={{ marginTop: "4px" }}>{currentQ.explanation}</div>
                </div>
              )}

              {/* Bottom Nav Controls */}
              <div style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "16px",
                borderTop: "1px solid #e2e8f0"
              }}>
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                  style={{
                    backgroundColor: currentQIndex === 0 ? "#f1f5f9" : "#ffffff",
                    color: currentQIndex === 0 ? "#94a3b8" : "#334155",
                    border: "1px solid #cbd5e1",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: currentQIndex === 0 ? "not-allowed" : "pointer"
                  }}
                >
                  ⬅ Previous
                </button>

                {currentQIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                    style={{
                      backgroundColor: "#7c3aed",
                      backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 22px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(124, 58, 237, 0.25)"
                    }}
                  >
                    Next Question ➡
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitExam}
                    style={{
                      backgroundColor: "#16a34a",
                      backgroundImage: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(22,163,74,0.3)"
                    }}
                  >
                    Submit Exam 🏁
                  </button>
                )}
              </div>
            </div>

            {/* ── RIGHT: QUESTION PALETTE SIDEBAR ── */}
            <div className="jlpt-exam-sidebar" style={{
              width: "280px",
              backgroundColor: "#f8fafc",
              borderLeft: "1.5px solid #e2e8f0",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto"
            }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                Question Navigator
              </h4>

              {/* Mini Stats Legend */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "16px",
                fontSize: "11px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#7c3aed" }} />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1" }} />
                  <span>Remaining ({totalQuestions - answeredCount})</span>
                </div>
              </div>

              {/* Question Number Badges Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "8px",
                marginBottom: "20px"
              }}>
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isFlagged = Boolean(flaggedQuestions[q.id]);
                  const isCurrent = currentQIndex === idx;

                  let bg = "#ffffff";
                  let border = "#cbd5e1";
                  let text = "#475569";

                  if (isCurrent) {
                    border = "#0f172a";
                    bg = "#0f172a";
                    text = "#ffffff";
                  } else if (isFlagged) {
                    bg = "#fef3c7";
                    border = "#f59e0b";
                    text = "#b45309";
                  } else if (isAnswered) {
                    bg = "#faf5ff";
                    border = "#8b5cf6";
                    text = "#7c3aed";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQIndex(idx)}
                      style={{
                        padding: "8px 0",
                        borderRadius: "8px",
                        border: `1.5px solid ${border}`,
                        backgroundColor: bg,
                        color: text,
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.1s ease"
                      }}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span style={{ position: "absolute", top: "-4px", right: "-3px", fontSize: "10px" }}>🚩</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button in Sidebar */}
              <button
                type="button"
                onClick={handleSubmitExam}
                style={{
                  marginTop: "auto",
                  width: "100%",
                  backgroundColor: "#16a34a",
                  backgroundImage: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(22,163,74,0.25)"
                }}
              >
                🏁 Finish & Submit Exam
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CONFIRM SUBMISSION MODAL                                       */}
        {/* ============================================================== */}
        {showConfirmModal && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            boxSizing: "border-box",
            zIndex: 100
          }}>
            <div className="jlpt-confirm-card" style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px 22px",
              maxWidth: "420px",
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              textAlign: "center",
              boxSizing: "border-box"
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "#e0f2fe",
                color: "#0284c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px auto"
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                Submit Examination?
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions.
                {totalQuestions - answeredCount > 0 && (
                  <span style={{ color: "#e11d48", display: "block", marginTop: "4px" }}>
                    Notice: {totalQuestions - answeredCount} questions are still unanswered.
                  </span>
                )}
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "10px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Continue Test
                </button>
                <button
                  type="button"
                  onClick={confirmSubmit}
                  style={{
                    flex: 1,
                    backgroundColor: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  Yes, Submit Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
