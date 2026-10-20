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
  
  const { examName, questions, selectedAnswers } = resultData;

  const readingQuestions = questions.filter(q => q.type === "Reading").slice(0, 20);
  const listeningQuestions = questions.filter(q => q.type === "Listening").slice(0, 20);
  const displayedQuestions = [...readingQuestions, ...listeningQuestions];
  const total = displayedQuestions.length > 0 ? displayedQuestions.length : 40;

  let calculatedAttempted = 0;
  let calculatedScore = 0;

  displayedQuestions.forEach((q, idx) => {
    const studentAns = selectedAnswers[q.id] !== undefined 
      ? selectedAnswers[q.id] 
      : (q.qIndex !== undefined ? selectedAnswers[q.qIndex] : undefined);

    if (studentAns !== undefined && studentAns !== null && studentAns !== "") {
      calculatedAttempted += 1;
      if (Number(studentAns) === Number(q.answer)) {
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
      const studentAns = selectedAnswers[q?.id] !== undefined 
        ? selectedAnswers[q?.id] 
        : (q?.qIndex !== undefined ? selectedAnswers[q?.qIndex] : undefined);
      const isAttempted = studentAns !== undefined && studentAns !== null && studentAns !== "";
      const isCorrect = isAttempted && Number(studentAns) === Number(q.answer);

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
                    const studentAns = selectedAnswers[q.id] !== undefined 
                      ? selectedAnswers[q.id] 
                      : (q.qIndex !== undefined ? selectedAnswers[q.qIndex] : undefined);
                    const isCorrect = studentAns !== undefined && studentAns !== null && studentAns !== "" && Number(studentAns) === Number(q.answer);
                    const isAttempted = studentAns !== undefined && studentAns !== null && studentAns !== "";

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
                    const studentAns = selectedAnswers[q.id] !== undefined 
                      ? selectedAnswers[q.id] 
                      : (q.qIndex !== undefined ? selectedAnswers[q.qIndex] : undefined);
                    const isCorrect = studentAns !== undefined && studentAns !== null && studentAns !== "" && Number(studentAns) === Number(q.answer);
                    const isAttempted = studentAns !== undefined && studentAns !== null && studentAns !== "";

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
      <div style={{ backgroundColor: "#0284c7", color: "white", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "16px", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <span>Exam Summary</span>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        
        <div style={{ 
          width: "100%",
          maxWidth: "500px", 
          backgroundColor: "white", 
          borderRadius: "12px", 
          padding: "30px", 
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid #e2e8f0" 
        }}>
          
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ width: "68px", height: "68px", borderRadius: "50%", backgroundColor: "#fef3c7", border: "1px solid #fde68a", margin: "0 auto 12px auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>
              🏆
            </div>
            <h2 style={{ color: "#0f172a", fontSize: "22px", margin: "0 0 10px 0", fontWeight: "800" }}>Congratulations, Exam Ended!</h2>
            <div style={{ display: "inline-block", backgroundColor: "#f1f5f9", padding: "6px 16px", borderRadius: "20px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>
              <span style={{ color: "#0284c7" }}>👤 Name:</span> {studentName} &nbsp; | &nbsp; <span style={{ color: "#0284c7" }}>Exam:</span> {examName}
            </div>
          </div>

          <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "20px", marginBottom: "25px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", border: "1px solid #e2e8f0" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "280px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
              <span style={{ color: "#64748b", fontSize: "15px", fontWeight: "600" }}>Total Questions</span>
              <span style={{ color: "#0f172a", fontSize: "16px", fontWeight: "bold" }}>{total}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "280px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
              <span style={{ color: "#64748b", fontSize: "15px", fontWeight: "600" }}>Total Attempted</span>
              <span style={{ color: "#0f172a", fontSize: "16px", fontWeight: "bold" }}>{calculatedAttempted}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "280px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
              <span style={{ color: "#64748b", fontSize: "15px", fontWeight: "600" }}>Total Correct</span>
              <span style={{ color: "#16a34a", fontSize: "18px", fontWeight: "900" }}>{calculatedScore}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "280px", paddingTop: "4px" }}>
              <span style={{ color: "#64748b", fontSize: "15px", fontWeight: "600" }}>Your Percentage</span>
              <span style={{ color: percentage >= 40 ? "#0284c7" : "#ef4444", fontSize: "18px", fontWeight: "900" }}>{percentage}%</span>
            </div>

          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
            <button 
              onClick={() => setShowDetailedView(true)}
              style={{ flex: 1, minWidth: "180px", maxWidth: "220px", backgroundColor: "#0284c7", color: "white", border: "none", padding: "12px 20px", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", transition: "transform 0.2s", boxShadow: "0 4px 6px rgba(2, 132, 199, 0.2)" }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              VIEW RESULT
            </button>
            <button 
              onClick={() => router.push("/student")}
              style={{ flex: 1, minWidth: "180px", maxWidth: "220px", backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "12px 20px", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#e2e8f0'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#f1f5f9'; e.target.style.transform = 'translateY(0)'; }}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResult;