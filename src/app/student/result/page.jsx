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

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";

const StudentResult = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const [resultData, setResultData] = useState({ 
    examName: "EPS-TOPIK Exam",
    score: 0, 
    total: 40, 
    attempted: 0, 
    questions: [], 
    selectedAnswers: {} 
  });

  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

  React.useEffect(() => {
    try {
      const u = localStorage.getItem("currentUser") || "Student";
      setStudentName(u);
      const saved = localStorage.getItem("lastExamResult");
      if (saved) {
        setResultData(JSON.parse(saved));
      }
    } catch (e) {}
    setMounted(true);
  }, []);

  // Background Auto-Sync for Offline Submissions to update cPanel database in real time
  React.useEffect(() => {
    const syncOfflineQueue = async () => {
      if (typeof window === "undefined" || !navigator.onLine) return;
      try {
        const queueStr = localStorage.getItem("offlineExamSyncQueue");
        if (!queueStr) return;
        const queue = JSON.parse(queueStr);
        if (!Array.isArray(queue) || queue.length === 0) return;

        const remainingQueue = [];
        for (const item of queue) {
          try {
            const res = await fetch(`/api/student/exams/${item.examId || "set-1-demo"}/submit`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: item.sessionId,
                selectedAnswers: item.selectedAnswers,
                studentName: item.studentName || localStorage.getItem("currentStudentName") || localStorage.getItem("currentUser") || "Student",
                studentPhone: item.studentPhone || localStorage.getItem("currentStudentPhone") || localStorage.getItem("studentPhone") || ""
              })
            });
            if (res.ok) {
              const resData = await res.json();
              if (resData.result) {
                // Update local cached result with synced server record
                setResultData(prev => ({
                  ...prev,
                  isOfflineSubmitted: false,
                  score: resData.result.correctAnswers ?? prev.score,
                  readingScore: resData.result.readingScore,
                  listeningScore: resData.result.listeningScore,
                  totalScore: resData.result.totalScore,
                  percentage: resData.result.percentage ?? prev.percentage,
                  passed: resData.result.passed ?? prev.passed
                }));
              }
            } else {
              remainingQueue.push(item);
            }
          } catch (err) {
            remainingQueue.push(item);
          }
        }
        localStorage.setItem("offlineExamSyncQueue", JSON.stringify(remainingQueue));
      } catch (e) {
        console.warn("Offline sync queue notice:", e);
      }
    };

    syncOfflineQueue();
    window.addEventListener("online", syncOfflineQueue);
    return () => window.removeEventListener("online", syncOfflineQueue);
  }, []);
  
  const { examName, questions = [], selectedAnswers = {} } = resultData;

  const readingQuestions = questions.filter(q => 
    (q.type && q.type.toLowerCase() === "reading") || 
    (q.qIndex !== undefined && q.qIndex <= 20)
  ).slice(0, 20);

  const listeningQuestions = questions.filter(q => 
    (q.type && q.type.toLowerCase() === "listening") || 
    (q.qIndex !== undefined && q.qIndex > 20)
  ).slice(0, 20);

  let displayedQuestions = [...readingQuestions, ...listeningQuestions];
  if (displayedQuestions.length === 0 && questions.length > 0) {
    displayedQuestions = questions.slice(0, 40);
  }
  const total = displayedQuestions.length > 0 ? displayedQuestions.length : 40;

  let calculatedAttempted = 0;
  let calculatedScore = 0;

  const getStudentAnswer = (q, idx) => {
    if (!q) return undefined;
    if (selectedAnswers[q.id] !== undefined) return selectedAnswers[q.id];
    if (q.qIndex !== undefined && selectedAnswers[q.qIndex] !== undefined) return selectedAnswers[q.qIndex];
    if (selectedAnswers[idx] !== undefined) return selectedAnswers[idx];
    return undefined;
  };

  displayedQuestions.forEach((q, idx) => {
    const studentAns = getStudentAnswer(q, idx);

    if (studentAns !== undefined && studentAns !== null && studentAns !== "") {
      calculatedAttempted += 1;
      if (q.answer !== undefined && Number(studentAns) === Number(q.answer)) {
        calculatedScore += 1;
      }
    }
  });

  const percentage = total > 0 ? ((calculatedScore / total) * 100).toFixed(2) : "0.00";
  const unsolvedCount = total - calculatedAttempted;

  if (!mounted) return null;

  if (showDetailedView) {
    if (selectedQuestionIndex !== null) {
      const q = displayedQuestions[selectedQuestionIndex];
      const studentAns = getStudentAnswer(q, selectedQuestionIndex);
      const isAttempted = studentAns !== undefined && studentAns !== null && studentAns !== "";
      const isCorrect = isAttempted && q.answer !== undefined && Number(studentAns) === Number(q.answer);

      return (
        <div className="result-review-outer" style={{ maxWidth: "1050px", margin: "20px auto", padding: "16px", fontFamily: "Arial, sans-serif", boxSizing: "border-box" }}>
          <style dangerouslySetInnerHTML={{ __html: `
            @media (orientation: landscape), (max-height: 650px) {
              .result-review-outer {
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 4px 10px !important;
                height: 100vh !important;
                height: 100dvh !important;
                max-height: 100dvh !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: hidden !important;
              }
              .result-review-header {
                margin-bottom: 4px !important;
              }
              .result-review-header h2 {
                font-size: 14px !important;
              }
              .result-review-header button {
                padding: 4px 14px !important;
                font-size: 12px !important;
              }
              .result-review-card {
                padding: 10px 14px !important;
                flex: 1 !important;
                min-height: 0 !important;
                overflow-y: auto !important;
                border-radius: 12px !important;
              }
              .result-review-card p {
                font-size: 13.5px !important;
                margin-bottom: 3px !important;
              }
              .result-review-card img {
                max-height: 85px !important;
              }
              .result-review-opt-list {
                gap: 5px !important;
                margin-top: 8px !important;
              }
              .result-review-opt-item {
                padding: 5px 10px !important;
              }
              .result-review-opt-badge {
                width: 22px !important;
                height: 22px !important;
                font-size: 11.5px !important;
                margin-right: 8px !important;
              }
              .result-review-opt-text {
                font-size: 13px !important;
              }
            }
          ` }} />
          <div className="result-review-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 style={{ color: "#1e293b", margin: 0, fontSize: "18px" }}>Question {selectedQuestionIndex + 1} Review ({q.type})</h2>
            <button 
              onClick={() => setSelectedQuestionIndex(null)}
              style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "8px 18px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
            >
              ❮ Back to Grid
            </button>
          </div>

          <div className="result-review-card" style={{ backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <p style={{ color: "#1e293b", fontSize: "15px", fontWeight: "bold", margin: "0 0 10px 0" }}>
              {q.mainHeading || (selectedQuestionIndex < 20 ? `[ ${selectedQuestionIndex + 1} ] 다음을 읽고 알맞은 것을 고르십시오.` : `[ ${selectedQuestionIndex + 1} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`)}
            </p>
            {q.questionHeading && (
              <p style={{ color: "#334155", fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                {q.questionHeading}
              </p>
            )}
            <p style={{ color: "#1e293b", fontSize: "17px", fontWeight: "bold", margin: "0 0 12px 0" }}>
              {selectedQuestionIndex + 1}. {q.description || ""}
            </p>

            {q.image && (
              <div style={{ margin: "10px 0", textAlign: "center" }}>
                <img src={q.image} alt="Question Visual" style={{ maxHeight: "160px", maxWidth: "240px", objectFit: "contain", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
              </div>
            )}

            {q.audio && (
              <div style={{ margin: "10px 0" }}>
                <audio controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} src={q.audio} style={{ width: "100%", height: "32px" }} />
              </div>
            )}

            <div className="result-review-opt-list" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "18px" }}>
              {Array.isArray(q.options) && q.options.map((opt, optIdx) => {
                const optText = typeof opt === 'object' && opt !== null ? opt.text : opt;
                const optImg = typeof opt === 'object' && opt !== null ? opt.image : null;
                const optAud = typeof opt === 'object' && opt !== null ? opt.audio : null;

                let bg = "#f8fafc";
                let color = "#1e293b";
                let border = "1px solid #cbd5e1";
                let badgeBg = "white";
                let badgeColor = "#0284c7";
                let badgeBorder = "2px solid #0284c7";

                if (Number(optIdx) === Number(q.answer)) {
                  bg = "#f0fdf4";
                  color = "#166534";
                  border = "1px solid #16a34a";
                  badgeBg = "#16a34a";
                  badgeColor = "white";
                  badgeBorder = "2px solid #16a34a";
                }
                if (Number(optIdx) === Number(studentAns) && !isCorrect) {
                  bg = "#fef2f2";
                  color = "#991b1b";
                  border = "1px solid #ef4444";
                  badgeBg = "#ef4444";
                  badgeColor = "white";
                  badgeBorder = "2px solid #ef4444";
                }

                return (
                  <div key={optIdx} className="result-review-opt-item" style={{ display: "flex", flexDirection: "column", padding: "10px 14px", backgroundColor: bg, color: color, border: border, borderRadius: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <div className="result-review-opt-badge" style={{
                        width: "28px", height: "28px", borderRadius: "50%", 
                        backgroundColor: badgeBg, color: badgeColor, border: badgeBorder,
                        display: "flex", alignItems: "center", justifyContent: "center", 
                        fontWeight: "bold", fontSize: "13px", marginRight: "12px", flexShrink: 0
                      }}>
                        {optIdx + 1}
                      </div>
                      <span className="result-review-opt-text" style={{ fontSize: "15px", flex: 1 }}>{optText}</span>
                      {Number(optIdx) === Number(q.answer) && (
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", marginLeft: "8px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Correct
                        </span>
                      )}
                      {Number(optIdx) === Number(studentAns) && Number(optIdx) !== Number(q.answer) && (
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#ef4444", marginLeft: "8px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Your Answer
                        </span>
                      )}
                    </div>

                    {optImg && (
                      <div style={{ marginTop: "6px", paddingLeft: "40px" }}>
                        <img src={optImg} alt={`Opt ${optIdx + 1}`} style={{ maxHeight: "50px", borderRadius: "4px" }} />
                      </div>
                    )}
                    {optAud && (
                      <div style={{ marginTop: "6px", paddingLeft: "40px" }}>
                        <audio controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} src={optAud} style={{ width: "100%", height: "25px" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "25px", display: "flex", justifyContent: "space-between" }}>
              <button 
                onClick={() => setSelectedQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={selectedQuestionIndex === 0}
                style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", cursor: selectedQuestionIndex === 0 ? "not-allowed" : "pointer" }}
              >
                ❮ Previous Question
              </button>
              <button 
                onClick={() => setSelectedQuestionIndex(prev => Math.min(displayedQuestions.length - 1, prev + 1))}
                disabled={selectedQuestionIndex === displayedQuestions.length - 1}
                style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", cursor: selectedQuestionIndex === displayedQuestions.length - 1 ? "not-allowed" : "pointer" }}
              >
                Next Question ❯
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="result-grid-outer" style={{ maxWidth: "100%", width: "100%", height: "100vh", height: "100dvh", margin: "0 auto", padding: "8px 14px", fontFamily: "Arial, sans-serif", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .result-grid-outer {
            max-width: 100% !important;
            width: 100% !important;
            height: 100vh !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            margin: 0 auto !important;
            padding: 6px 12px !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          .result-grid-top-bar {
            margin-bottom: 6px !important;
            flex-shrink: 0 !important;
          }
          .result-grid-back-btn {
            padding: 6px 16px !important;
            font-size: 12.5px !important;
            border-radius: 8px !important;
          }
          .result-grid-card {
            flex: 1 !important;
            min-height: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            border-radius: 12px !important;
          }
          .result-grid-header {
            padding: 8px 14px !important;
            font-size: 13px !important;
            gap: 10px !important;
            flex-shrink: 0 !important;
          }
          .result-grid-body {
            padding: 8px 12px !important;
            flex: 1 !important;
            min-height: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          .result-grid-columns {
            gap: 12px !important;
            flex: 1 !important;
            min-height: 0 !important;
            display: flex !important;
            flex-direction: row !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          .result-grid-column {
            flex: 1 !important;
            min-height: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            padding-right: 6px !important;
          }
          .result-grid-heading {
            margin: 0 0 4px 0 !important;
            font-size: 13px !important;
            font-weight: 800 !important;
            flex-shrink: 0 !important;
          }
          .result-grid-buttons {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            grid-template-rows: repeat(5, 1fr) !important;
            gap: 5px !important;
            flex: 1 !important;
            height: 100% !important;
            min-height: 0 !important;
          }
          .result-grid-btn {
            height: 100% !important;
            min-height: 0 !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 8px !important;
            font-size: 13px !important;
            font-weight: 800 !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          }
        ` }} />
        <div className="result-grid-top-bar" style={{ marginBottom: "6px", flexShrink: 0 }}>
          <button 
            className="result-grid-back-btn"
            onClick={() => setShowDetailedView(false)}
            style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "8px 18px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px", boxShadow: "0 2px 4px rgba(2, 132, 199, 0.25)" }}
          >
            ❮ Back to Summary
          </button>
        </div>

        <div className="result-grid-card" style={{ backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div className="result-grid-header" style={{ display: "flex", backgroundColor: "#0284c7", color: "white", padding: "10px 18px", justifyContent: "space-between", fontWeight: "bold", fontSize: "13.5px", flexShrink: 0 }}>
            <span>Total Questions: {total}</span>
            <span>Exam: {examName}</span>
            <span>Solved: {calculatedAttempted}</span>
            <span>UnSolved: {unsolvedCount}</span>
          </div>

          <div className="result-grid-body" style={{ padding: "8px 14px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className="result-grid-columns" style={{ display: "flex", justifyContent: "space-between", gap: "14px", flex: 1, minHeight: 0, height: "100%", overflow: "hidden" }}>
              
              <div className="result-grid-column" style={{ flex: 1, borderRight: "2px solid #e2e8f0", paddingRight: "14px", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
                <h3 className="result-grid-heading" style={{ textAlign: "center", color: "#0284c7", margin: "0 0 6px 0", fontSize: "14px", fontWeight: "800", flexShrink: 0 }}>Reading Questions (1 - 20)</h3>
                <div className="result-grid-buttons" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(5, 1fr)", gap: "5px", flex: 1, height: "100%", minHeight: 0 }}>
                  {displayedQuestions.slice(0, 20).map((q, idx) => {
                    const studentAns = getStudentAnswer(q, idx);
                    const isAttempted = studentAns !== undefined && studentAns !== null && studentAns !== "";
                    const isCorrect = isAttempted && q.answer !== undefined && Number(studentAns) === Number(q.answer);

                    let bgColor = "white";
                    let borderColor = "#cbd5e1";
                    let textColor = "#1e293b";

                    if (isAttempted) {
                      if (isCorrect) {
                        bgColor = "#16a34a";
                        borderColor = "#15803d";
                        textColor = "white";
                      } else {
                        bgColor = "#ef4444";
                        borderColor = "#dc2626";
                        textColor = "white";
                      }
                    }

                    return (
                      <button
                        className="result-grid-btn"
                        key={q.id || idx}
                        onClick={() => setSelectedQuestionIndex(idx)}
                        style={{
                          height: "100%",
                          minHeight: 0,
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: bgColor,
                          border: `1.5px solid ${borderColor}`,
                          borderRadius: "8px",
                          fontWeight: "800",
                          fontSize: "13px",
                          cursor: "pointer",
                          color: textColor,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="result-grid-column" style={{ flex: 1, paddingLeft: "14px", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
                <h3 className="result-grid-heading" style={{ textAlign: "center", color: "#0284c7", margin: "0 0 6px 0", fontSize: "14px", fontWeight: "800", flexShrink: 0 }}>Listening Questions (21 - 40)</h3>
                <div className="result-grid-buttons" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(5, 1fr)", gap: "5px", flex: 1, height: "100%", minHeight: 0 }}>
                  {displayedQuestions.slice(20, 40).map((q, idx) => {
                    const actualIndex = idx + 20;
                    const studentAns = getStudentAnswer(q, actualIndex);
                    const isAttempted = studentAns !== undefined && studentAns !== null && studentAns !== "";
                    const isCorrect = isAttempted && q.answer !== undefined && Number(studentAns) === Number(q.answer);

                    let bgColor = "white";
                    let borderColor = "#cbd5e1";
                    let textColor = "#1e293b";

                    if (isAttempted) {
                      if (isCorrect) {
                        bgColor = "#16a34a";
                        borderColor = "#15803d";
                        textColor = "white";
                      } else {
                        bgColor = "#ef4444";
                        borderColor = "#dc2626";
                        textColor = "white";
                      }
                    }

                    return (
                      <button
                        className="result-grid-btn"
                        key={q.id || actualIndex}
                        onClick={() => setSelectedQuestionIndex(actualIndex)}
                        style={{
                          height: "100%",
                          minHeight: 0,
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: bgColor,
                          border: `1.5px solid ${borderColor}`,
                          borderRadius: "8px",
                          fontWeight: "800",
                          fontSize: "13px",
                          cursor: "pointer",
                          color: textColor,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}
                      >
                        {actualIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "column" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .result-summary-top-bar {
          background-color: #0284c7;
          color: white;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .result-summary-wrap {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .result-summary-card {
          width: 100%;
          max-width: 500px;
          background-color: white;
          border-radius: 24px;
          padding: 26px 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          max-height: 94vh;
          overflow-y: auto;
        }
        .result-summary-header {
          text-align: center;
          margin-bottom: 18px;
        }
        .result-summary-trophy {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: #fef3c7;
          border: 1px solid #fde68a;
          margin: 0 auto 10px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
        .result-summary-title {
          color: #0f172a;
          font-size: 22px;
          margin: 0 0 8px 0;
          font-weight: 800;
        }
        .result-summary-badge {
          display: inline-block;
          background-color: #f1f5f9;
          padding: 6px 16px;
          border-radius: 20px;
          color: #475569;
          font-weight: 600;
          font-size: 13.5px;
        }
        .result-summary-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .result-summary-stats {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          border: 1px solid #e2e8f0;
        }
        .result-summary-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* RESPONSIVE PORTRAIT PHONES: FIT ALL DIALOG AND ACTION BUTTONS CLEANLY */
        @media (max-width: 540px) and (orientation: portrait) {
          .result-summary-wrap {
            padding: 10px 12px !important;
          }
          .result-summary-card {
            padding: 18px 16px !important;
            border-radius: 20px !important;
            max-height: calc(100dvh - 24px) !important;
          }
          .result-summary-trophy {
            width: 48px !important;
            height: 48px !important;
            font-size: 24px !important;
            margin-bottom: 6px !important;
          }
          .result-summary-title {
            font-size: 19px !important;
          }
          .result-summary-stats {
            padding: 12px 14px !important;
            gap: 8px !important;
          }
          .result-summary-stats span {
            font-size: 13px !important;
          }
          .result-summary-actions {
            flex-direction: column !important;
            width: 100% !important;
            gap: 8px !important;
          }
          .result-summary-actions button {
            width: 100% !important;
            padding: 11px 16px !important;
            font-size: 13.5px !important;
          }
        }

        /* LANDSCAPE MODE: FIT ON SCREEN CLEANLY WITHOUT SCROLL OR OVERFLOW */
        @media (orientation: landscape), (max-height: 650px) {
          .result-summary-top-bar {
            display: none !important;
          }
          .result-summary-wrap {
            padding: 6px 12px !important;
            height: 100vh !important;
            height: 100dvh !important;
            min-height: 0 !important;
            overflow: hidden !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .result-summary-card {
            max-width: 660px !important;
            width: 100% !important;
            padding: 12px 20px !important;
            max-height: calc(100dvh - 16px) !important;
            border-radius: 24px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            overflow-y: auto !important;
          }
          .result-summary-header {
            margin-bottom: 8px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
            text-align: left !important;
          }
          .result-summary-trophy {
            width: 38px !important;
            height: 38px !important;
            font-size: 20px !important;
            margin: 0 !important;
            flex-shrink: 0 !important;
          }
          .result-summary-title {
            font-size: 16px !important;
            margin: 0 !important;
          }
          .result-summary-badge {
            font-size: 12px !important;
            padding: 2px 10px !important;
            border-radius: 14px !important;
          }
          .result-summary-grid {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .result-summary-stats {
            width: 100% !important;
            max-width: 420px !important;
            padding: 8px 16px !important;
            gap: 4px !important;
            margin-bottom: 0 !important;
            border-radius: 14px !important;
          }
          .result-summary-stats > div {
            padding-bottom: 4px !important;
            max-width: 100% !important;
          }
          .result-summary-stats span {
            font-size: 13px !important;
          }
          .result-summary-actions {
            display: flex !important;
            flex-direction: row !important;
            justify-content: center !important;
            gap: 12px !important;
            width: 100% !important;
            max-width: 420px !important;
          }
          .result-summary-actions button {
            flex: 1 !important;
            width: auto !important;
            max-width: none !important;
            min-width: 0 !important;
            padding: 10px 16px !important;
            font-size: 13px !important;
            border-radius: 8px !important;
          }
        }

        /* ULTRA COMPACT FOR LANDSCAPE SMARTPHONES (HEIGHT <= 520px) */
        @media (orientation: landscape) and (max-height: 520px) {
          .result-summary-wrap {
            padding: 4px 10px !important;
          }
          .result-summary-card {
            padding: 8px 16px !important;
            max-height: calc(100dvh - 8px) !important;
            border-radius: 16px !important;
            max-width: 480px !important;
          }
          .result-summary-header {
            margin-bottom: 4px !important;
            gap: 8px !important;
          }
          .result-summary-trophy {
            width: 28px !important;
            height: 28px !important;
            font-size: 15px !important;
          }
          .result-summary-title {
            font-size: 14.5px !important;
          }
          .result-summary-badge {
            font-size: 11px !important;
            padding: 1px 8px !important;
          }
          .result-summary-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .result-summary-stats {
            padding: 6px 12px !important;
            gap: 2px !important;
            max-width: 360px !important;
          }
          .result-summary-stats > div {
            padding-bottom: 2px !important;
          }
          .result-summary-stats span {
            font-size: 11.5px !important;
          }
          .result-summary-actions {
            display: flex !important;
            flex-direction: row !important;
            gap: 8px !important;
            max-width: 360px !important;
          }
          .result-summary-actions button {
            flex: 1 !important;
            padding: 7px 12px !important;
            font-size: 12px !important;
            border-radius: 8px !important;
          }
        }
      ` }} />

      <div className="result-summary-top-bar">
        <span>Exam Summary</span>
      </div>

      <div className="result-summary-wrap">
        <div className="result-summary-card">
          
          <div className="result-summary-header">
            <div className="result-summary-trophy">
              🏆
            </div>
            <div>
              <h2 className="result-summary-title">Congratulations, Exam Ended!</h2>
              <div className="result-summary-badge">
                <span style={{ color: "#0284c7" }}>👤 Name:</span> {studentName} &nbsp; | &nbsp; <span style={{ color: "#0284c7" }}>Exam:</span> {examName}
              </div>
            </div>
          </div>

          <div className="result-summary-grid">
            <div className="result-summary-stats">
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "280px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "6px" }}>
                <span style={{ color: "#64748b", fontSize: "14.5px", fontWeight: "600" }}>Total Questions</span>
                <span style={{ color: "#0f172a", fontSize: "15px", fontWeight: "bold" }}>{total}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "280px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "6px" }}>
                <span style={{ color: "#64748b", fontSize: "14.5px", fontWeight: "600" }}>Total Attempted</span>
                <span style={{ color: "#0f172a", fontSize: "15px", fontWeight: "bold" }}>{calculatedAttempted}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "280px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "6px" }}>
                <span style={{ color: "#64748b", fontSize: "14.5px", fontWeight: "600" }}>Total Correct</span>
                <span style={{ color: "#16a34a", fontSize: "17px", fontWeight: "900" }}>{calculatedScore}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "280px", paddingTop: "4px" }}>
                <span style={{ color: "#64748b", fontSize: "14.5px", fontWeight: "600" }}>Your Percentage</span>
                <span style={{ color: percentage >= 40 ? "#0284c7" : "#ef4444", fontSize: "17px", fontWeight: "900" }}>{percentage}%</span>
              </div>
            </div>

            <div className="result-summary-actions">
              <button 
                type="button"
                onClick={() => setShowDetailedView(true)}
                style={{ flex: 1, minWidth: "160px", maxWidth: "220px", backgroundColor: "#0284c7", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", transition: "transform 0.2s", boxShadow: "0 4px 6px rgba(2, 132, 199, 0.2)" }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                VIEW RESULT
              </button>
              <button 
                type="button"
                onClick={() => router.push("/student")}
                style={{ flex: 1, minWidth: "160px", maxWidth: "220px", backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseOver={(e) => { e.target.style.backgroundColor = '#e2e8f0'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = '#f1f5f9'; e.target.style.transform = 'translateY(0)'; }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResult;