import React, { useState } from "react";

import { useNavigate } from "react-router-dom";



const StudentResult = () => {

  const navigate = useNavigate();

  const studentName = localStorage.getItem("currentUser") || "Student";



  const [showDetailedView, setShowDetailedView] = useState(false);



  const resultData = JSON.parse(localStorage.getItem("lastExamResult")) || { 

    score: 0, 

    total: 40, 

    attempted: 0, 

    questions: [], 

    selectedAnswers: {} 

  };

  

  const { score, total, attempted, questions, selectedAnswers } = resultData;

  const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : "0.00";



  if (showDetailedView) {

    return (

      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif", padding: "20px" }}>

        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>

            <h2 style={{ color: "#1e293b", margin: 0 }}>Detailed Exam Review</h2>

            <button 

              onClick={() => setShowDetailedView(false)}

              style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}

            >

              Back to Summary

            </button>

          </div>



          {questions.map((q, idx) => {

            const studentAns = selectedAnswers[idx];

            const isAttempted = studentAns !== undefined;

            const isCorrect = isAttempted && studentAns === q.answer;



            return (

              <div key={q.id || idx} style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "15px", borderLeft: `6px solid ${!isAttempted ? "#cbd5e1" : isCorrect ? "#16a34a" : "#ef4444"}`, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>

                <p style={{ fontWeight: "bold", color: "#1e293b", margin: "0 0 10px 0", fontSize: "16px" }}>

                  {q.mainHeading || `[ ${idx + 1} ]`} {q.questionHeading} {q.description}

                </p>

                {q.image && (

                  <img src={q.image} alt="Q Image" style={{ maxHeight: "140px", display: "block", marginBottom: "15px", borderRadius: "4px" }} />

                )}

                {q.audio && (

                  <audio controls src={q.audio} style={{ display: "block", marginBottom: "15px", width: "100%", height: "35px" }} />

                )}

                

                {/* Options with Safe Text, Image & Audio Support */}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "15px" }}>

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



                    if (optIdx === q.answer) {

                      bg = "#f0fdf4";

                      color = "#166534";

                      border = "1px solid #16a34a"; 

                      badgeBg = "#16a34a";

                      badgeColor = "white";

                      badgeBorder = "2px solid #16a34a";

                    }

                    if (optIdx === studentAns && !isCorrect) {

                      bg = "#fef2f2";

                      color = "#991b1b";

                      border = "1px solid #ef4444"; 

                      badgeBg = "#ef4444";

                      badgeColor = "white";

                      badgeBorder = "2px solid #ef4444";

                    }



                    return (

                      <div key={optIdx} style={{ display: "flex", flexDirection: "column", padding: "12px 15px", backgroundColor: bg, color: color, border: border, borderRadius: "6px", fontSize: "15px" }}>

                        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>

                          <div style={{

                            width: "30px", height: "30px", borderRadius: "50%", 

                            backgroundColor: badgeBg, color: badgeColor, border: badgeBorder,

                            display: "flex", alignItems: "center", justifyContent: "center", 

                            fontWeight: "bold", fontSize: "14px", marginRight: "15px", flexShrink: 0

                          }}>

                            {optIdx + 1}

                          </div>

                          <span style={{ flex: 1 }}>{optText}</span>

                          {optIdx === q.answer && <span style={{ fontSize: "12px", fontWeight: "bold", color: "#16a34a", marginLeft: "10px" }}>✔ Correct</span>}

                          {optIdx === studentAns && optIdx !== q.answer && <span style={{ fontSize: "12px", fontWeight: "bold", color: "#ef4444", marginLeft: "10px" }}>❌ Your Answer</span>}

                        </div>



                        {optImg && (

                          <div style={{ marginTop: "8px", paddingLeft: "45px" }}>

                            <img src={optImg} alt={`Option ${optIdx + 1}`} style={{ maxHeight: "50px", borderRadius: "4px", border: "1px solid #cbd5e1" }} />

                          </div>

                        )}



                        {optAud && (

                          <div style={{ marginTop: "8px", paddingLeft: "45px", width: "100%" }}>

                            <audio controls src={optAud} style={{ width: "100%", height: "28px" }} />

                          </div>

                        )}

                      </div>

                    );

                  })}

                </div>

              </div>

            );

          })}

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



        <div style={{ backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "40px 30px", position: "relative", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>

          <div style={{ textAlign: "center", marginBottom: "30px", position: "relative", zIndex: 1 }}>

            <p style={{ margin: "5px 0", fontSize: "16px", color: "#1e293b", fontWeight: "bold" }}>Name: {studentName}</p>

            <p style={{ margin: "5px 0", fontSize: "16px", color: "#1e293b", fontWeight: "bold" }}>ExamId: 287378RM</p>

          </div>



          <table style={{ width: "100%", borderCollapse: "collapse", position: "relative", zIndex: 1, marginBottom: "40px" }}>

            <tbody>

              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>

                <td style={{ padding: "15px 0", color: "#475569", fontSize: "16px" }}>Total Questions</td>

                <td style={{ padding: "15px 0", textAlign: "right", color: "#1e293b", fontSize: "18px", fontWeight: "bold" }}>{total}</td>

              </tr>

              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>

                <td style={{ padding: "15px 0", color: "#475569", fontSize: "16px" }}>Total Attempt</td>

                <td style={{ padding: "15px 0", textAlign: "right", color: "#1e293b", fontSize: "18px", fontWeight: "bold" }}>{attempted}</td>

              </tr>

              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>

                <td style={{ padding: "15px 0", color: "#475569", fontSize: "16px" }}>Total Correct</td>

                <td style={{ padding: "15px 0", textAlign: "right", color: "#16a34a", fontSize: "18px", fontWeight: "bold" }}>{score}</td>

              </tr>

              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>

                <td style={{ padding: "15px 0", color: "#475569", fontSize: "16px" }}>Your Percentage</td>

                <td style={{ padding: "15px 0", textAlign: "right", color: "#0284c7", fontSize: "18px", fontWeight: "bold" }}>{percentage}%</td>

              </tr>

            </tbody>

          </table>



          <div style={{ display: "flex", justifyContent: "center", gap: "15px", position: "relative", zIndex: 1, flexWrap: "wrap" }}>

            <button 

              onClick={() => setShowDetailedView(true)}

              style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}

            >

              VIEW RESULT

            </button>

            <button 

              onClick={() => navigate("/student")}

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