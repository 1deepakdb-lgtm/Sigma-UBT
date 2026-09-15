import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentResult = () => {
  const navigate = useNavigate();
  const studentName = localStorage.getItem("currentUser") || "Student";

  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

  const resultData = JSON.parse(localStorage.getItem("lastExamResult")) || { 
    examName: "EPS-TOPIK Exam",
    score: 0, 
    total: 40, 
    attempted: 0, 
    questions: [], 
    selectedAnswers: {} 
  };
  
  const { examName, questions, selectedAnswers } = resultData;

  const readingQuestions = questions.filter(q => q.type === "Reading").slice(0, 20);
  const listeningQuestions = questions.filter(q => q.type === "Listening").slice(0, 20);
  const displayedQuestions = [...readingQuestions, ...listeningQuestions];
  const total = displayedQuestions.length > 0 ? displayedQuestions.length : 40;

  let calculatedAttempted = 0;
  let calculatedScore = 0;

  displayedQuestions.forEach((q, idx) => {
    const studentAns = selectedAnswers[idx] !== undefined 
      ? selectedAnswers[idx] 
      : (selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : undefined);

    if (studentAns !== undefined && studentAns !== null && studentAns !== "") {
      calculatedAttempted += 1;
      if (Number(studentAns) === Number(q.answer)) {
        calculatedScore += 1;
      }
    }
  });

  const percentage = total > 0 ? ((calculatedScore / total) * 100).toFixed(2) : "0.00";
  const unsolvedCount = total - calculatedAttempted;

  if (showDetailedView) {
    if (selectedQuestionIndex !== null) {
      const q = displayedQuestions[selectedQuestionIndex];
      const studentAns = selectedAnswers[selectedQuestionIndex] !== undefined 
        ? selectedAnswers[selectedQuestionIndex] 
        : (selectedAnswers[q?.id] !== undefined ? selectedAnswers[q?.id] : undefined);
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
              Back to Question Grid
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
                <audio controls src={q.audio} style={{ width: "100%", height: "35px" }} />
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
                      {Number(optIdx) === Number(q.answer) && <span style={{ fontSize: "13px", fontWeight: "bold", color: "#16a34a", marginLeft: "10px" }}>✔ Correct Answer</span>}
                      {Number(optIdx) === Number(studentAns) && Number(optIdx) !== Number(q.answer) && <span style={{ fontSize: "13px", fontWeight: "bold", color: "#ef4444", marginLeft: "10px" }}>❌ Your Answer</span>}
                    </div>

                    {optImg && (
                      <div style={{ marginTop: "8px", paddingLeft: "45px" }}>
                        <img src={optImg} alt={`Opt ${optIdx + 1}`} style={{ maxHeight: "50px", borderRadius: "4px" }} />
                      </div>
                    )}
                    {optAud && (
                      <div style={{ marginTop: "8px", paddingLeft: "45px" }}>
                        <audio controls src={optAud} style={{ width: "100%", height: "25px" }} />
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
                    const studentAns = selectedAnswers[idx] !== undefined 
                      ? selectedAnswers[idx] 
                      : (selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : undefined);
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
                    const studentAns = selectedAnswers[actualIndex] !== undefined 
                      ? selectedAnswers[actualIndex] 
                      : (selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : undefined);
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
      <div style={{ backgroundColor: "#0284c7", color: "white", padding: "15px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "18px", fontWeight: "bold" }}>
        <span>✕ Exam Ended - Exam Summary</span>
      </div>

      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
        <h2 style={{ color: "#1e293b", fontSize: "22px", marginBottom: "20px" }}>Congratulation, Exam Ended</h2>

        <div style={{ backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "40px 30px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <p style={{ margin: "5px 0", fontSize: "16px", color: "#1e293b", fontWeight: "bold" }}>Name: {studentName}</p>
            <p style={{ margin: "5px 0", fontSize: "16px", color: "#1e293b", fontWeight: "bold" }}>Exam: {examName}</p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "15px 0", color: "#475569", fontSize: "16px" }}>Total Questions</td>
                <td style={{ padding: "15px 0", textAlign: "right", color: "#1e293b", fontSize: "18px", fontWeight: "bold" }}>{total}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "15px 0", color: "#475569", fontSize: "16px" }}>Total Attempt</td>
                <td style={{ padding: "15px 0", textAlign: "right", color: "#1e293b", fontSize: "18px", fontWeight: "bold" }}>{calculatedAttempted}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "15px 0", color: "#475569", fontSize: "16px" }}>Total Correct</td>
                <td style={{ padding: "15px 0", textAlign: "right", color: "#16a34a", fontSize: "18px", fontWeight: "bold" }}>{calculatedScore}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "15px 0", color: "#475569", fontSize: "16px" }}>Your Percentage</td>
                <td style={{ padding: "15px 0", textAlign: "right", color: "#0284c7", fontSize: "18px", fontWeight: "bold" }}>{percentage}%</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
            <button 
              onClick={() => setShowDetailedView(true)}
              style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
            >
              VIEW RESULT
            </button>
            <button 
              onClick={() => navigate("/student", { state: { activeTab: "results" } })}
              style={{ backgroundColor: "white", color: "#0284c7", border: "1px solid #0284c7", padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
            >
              RESULTS LIST
            </button>
            <button 
              onClick={() => navigate("/student")}
              style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
            >
              BACK TO MAIN PAGE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResult;