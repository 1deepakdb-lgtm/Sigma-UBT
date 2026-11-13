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
        <div style={{ maxWidth: "1050px", margin: "40px auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ color: "#1e293b", margin: 0 }}>Question {selectedQuestionIndex + 1} Review ({q.type})</h2>
            <button 
              onClick={() => setSelectedQuestionIndex(null)}
              style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
            >
              Go Back
            </button>
          </div>

          <div style={{ backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "30px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <p style={{ color: "#1e293b", fontSize: "15px", fontWeight: "bold", margin: "0 0 10px 0" }}>
              {q.mainHeading || (selectedQuestionIndex < 20 ? `[ ${selectedQuestionIndex + 1} ] 다음을 읽고 알맞은 것을 고르십시오.` : `[ ${selectedQuestionIndex + 1} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`)}
            </p>
            {q.questionHeading && (
              <p style={{ color: "#334155", fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                {q.questionHeading}
              </p>
            )}
            <p style={{ color: "#1e293b", fontSize: "18px", fontWeight: "bold", margin: "0 0 15px 0" }}>
              {selectedQuestionIndex + 1}. {q.description || ""}
            </p>

            {q.image && (
              <div style={{ margin: "15px 0", textAlign: "center" }}>
                <img src={q.image} alt="Question Visual" style={{ maxHeight: "180px", maxWidth: "240px", objectFit: "contain", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
              </div>
            )}

            {q.audio && (
              <div style={{ margin: "15px 0" }}>
                <audio controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} src={q.audio} style={{ width: "100%", height: "35px" }} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "25px" }}>
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
                  <div key={optIdx} style={{ display: "flex", flexDirection: "column", padding: "12px 15px", backgroundColor: bg, color: color, border: border, borderRadius: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "50%", 
                        backgroundColor: badgeBg, color: badgeColor, border: badgeBorder,
                        display: "flex", alignItems: "center", justifyContent: "center", 
                        fontWeight: "bold", fontSize: "14px", marginRight: "15px", flexShrink: 0
                      }}>
                        {optIdx + 1}
                      </div>
                      <span style={{ fontSize: "16px", flex: 1 }}>{optText}</span>
                      {Number(optIdx) === Number(q.answer) && (
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", marginLeft: "10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Correct Answer
                        </span>
                      )}
                      {Number(optIdx) === Number(studentAns) && Number(optIdx) !== Number(q.answer) && (
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#ef4444", marginLeft: "10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Your Answer
                        </span>
                      )}
                    </div>

                    {optImg && (
                      <div style={{ marginTop: "8px", paddingLeft: "45px" }}>
                        <img src={optImg} alt={`Opt ${optIdx + 1}`} style={{ maxHeight: "50px", borderRadius: "4px" }} />
                      </div>
                    )}
                    {optAud && (
                      <div style={{ marginTop: "8px", paddingLeft: "45px" }}>
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
      <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ marginBottom: "15px" }}>
          <button 
            onClick={() => setShowDetailedView(false)}
            style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "8px 18px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
          >
            Back
          </button>
        </div>

        <div style={{ backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", backgroundColor: "#0284c7", color: "white", padding: "15px 20px", justifyContent: "space-between", fontWeight: "bold", fontSize: "15px", flexWrap: "wrap", gap: "10px" }}>
            <span>Total Questions: {total}</span>
            <span>Exam: {examName}</span>
            <span>Solved: {calculatedAttempted}</span>
            <span>UnSolved: {unsolvedCount}</span>
          </div>

          <div style={{ padding: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
              
              <div style={{ flex: 1, minWidth: "300px", borderRight: "2px solid #e2e8f0", paddingRight: "15px" }}>
                <h3 style={{ textAlign: "center", color: "#0284c7", marginBottom: "15px", fontSize: "16px" }}>Reading Questions</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
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
                        key={q.id || idx}
                        onClick={() => setSelectedQuestionIndex(idx)}
                        style={{
                          padding: "12px 0",
                          backgroundColor: bgColor,
                          border: `1px solid ${borderColor}`,
                          borderRadius: "4px",
                          fontWeight: "bold",
                          fontSize: "15px",
                          cursor: "pointer",
                          color: textColor
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: "300px", paddingLeft: "5px" }}>
                <h3 style={{ textAlign: "center", color: "#0284c7", marginBottom: "15px", fontSize: "16px" }}>Listening Questions</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
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
                        key={q.id || actualIndex}
                        onClick={() => setSelectedQuestionIndex(actualIndex)}
                        style={{
                          padding: "12px 0",
                          backgroundColor: bgColor,
                          border: `1px solid ${borderColor}`,
                          borderRadius: "4px",
                          fontWeight: "bold",
                          fontSize: "15px",
                          cursor: "pointer",
                          color: textColor
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
          border-radius: 16px;
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

        /* LANDSCAPE MODE: FIT ON SCREEN CLEANLY WITHOUT SCROLL OR OVERFLOW */
        @media (orientation: landscape) and (max-height: 650px) {
          .result-summary-top-bar {
            display: none !important;
          }
          .result-summary-wrap {
            padding: 6px 12px !important;
            height: 100vh !important;
            min-height: 100vh !important;
            overflow: hidden !important;
          }
          .result-summary-card {
            max-width: 650px !important;
            padding: 10px 16px !important;
            max-height: 96vh !important;
            border-radius: 12px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          .result-summary-header {
            margin-bottom: 6px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 10px !important;
            text-align: left !important;
          }
          .result-summary-trophy {
            width: 32px !important;
            height: 32px !important;
            font-size: 18px !important;
            margin: 0 !important;
            flex-shrink: 0 !important;
          }
          .result-summary-title {
            font-size: 15.5px !important;
            margin: 0 !important;
          }
          .result-summary-badge {
            font-size: 11.5px !important;
            padding: 2px 8px !important;
          }
          .result-summary-grid {
            flex-direction: row !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .result-summary-stats {
            flex: 1.25 !important;
            padding: 8px 12px !important;
            gap: 4px !important;
            margin-bottom: 0 !important;
          }
          .result-summary-stats > div {
            padding-bottom: 3px !important;
            max-width: 100% !important;
          }
          .result-summary-stats span {
            font-size: 12.5px !important;
          }
          .result-summary-actions {
            flex: 1 !important;
            flex-direction: column !important;
            justify-content: center !important;
            gap: 8px !important;
          }
          .result-summary-actions button {
            width: 100% !important;
            max-width: none !important;
            min-width: 0 !important;
            padding: 9px 12px !important;
            font-size: 13px !important;
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