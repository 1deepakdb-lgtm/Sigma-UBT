import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const StudentExam = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const studentName = localStorage.getItem("currentUser") || "Student";

  const [isStarted, setIsStarted] = useState(false);
  const [viewMode, setViewMode] = useState("overview"); 
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3000); // 50 Minutes (3000 seconds)
  const [exactExamName, setExactExamName] = useState(`Chapterwise 0${examId}`);

  const institutes = JSON.parse(localStorage.getItem("institutes")) || [];
  const logoWatermark = institutes[0]?.logoUrl || "";

  const audioRef = useRef(null);
  const optionAudioRefs = useRef({});
  const playCountRef = useRef(0);
  const optionPlayCountRef = useRef({});
  const timeoutRef = useRef(null);
  const optionTimeoutRefs = useRef({});

  const [mainAudioLocked, setMainAudioLocked] = useState(false);
  const [optionAudioLocked, setOptionAudioLocked] = useState({});
  const [isPlayingAnyAudio, setIsPlayingAnyAudio] = useState(false);

  useEffect(() => {
    const savedSets = JSON.parse(localStorage.getItem("examSets")) || [];
    const allQuestions = JSON.parse(localStorage.getItem("questionBank")) || [];
    
    const currentExamSet = savedSets.find(s => s.id.toString() === examId?.toString() || s.name === examId);
    const targetSetName = currentExamSet ? currentExamSet.name : `Chapterwise 0${examId}`;
    setExactExamName(targetSetName);

    const targetPackageName = currentExamSet ? currentExamSet.packageName : "";

    let matchedQuestions = allQuestions.filter(q => 
      q && (
        q.setId?.toString() === examId?.toString() || 
        q.set === targetSetName || 
        (q.package === targetPackageName && q.set === targetSetName)
      )
    );

    let readingQ = matchedQuestions.filter(q => q.type === "Reading");
    let listeningQ = matchedQuestions.filter(q => q.type === "Listening");

    const finalBatch = [];

    for (let i = 1; i <= 20; i++) {
      if (readingQ[i - 1]) {
        finalBatch.push({ ...readingQ[i - 1], id: readingQ[i - 1].id || i, type: "Reading" });
      } else {
        finalBatch.push({
          id: i,
          type: "Reading",
          mainHeading: `[ ${i} ] 다음을 읽고 알맞은 것을 고르십시오.`,
          questionHeading: "",
          description: "",
          image: "",
          audio: "",
          options: ["가방", "지갑", "우산", "이불"],
          answer: 0
        });
      }
    }

    for (let i = 1; i <= 20; i++) {
      const qNum = 20 + i;
      if (listeningQ[i - 1]) {
        finalBatch.push({ ...listeningQ[i - 1], id: listeningQ[i - 1].id || qNum, type: "Listening" });
      } else {
        finalBatch.push({
          id: qNum,
          type: "Listening",
          mainHeading: `[ ${qNum} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,
          questionHeading: "",
          description: "",
          image: "",
          audio: "",
          options: ["듣기 1", "듣기 2", "듣기 3", "듣기 4"],
          answer: 0
        });
      }
    }

    setQuestions(finalBatch);
  }, [examId]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    Object.values(optionTimeoutRefs.current).forEach(t => clearTimeout(t));
    optionTimeoutRefs.current = {};

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    Object.values(optionAudioRefs.current).forEach(aud => {
      if (aud) {
        aud.pause();
        aud.currentTime = 0;
      }
    });

    playCountRef.current = 0;
    optionPlayCountRef.current = {};
    setMainAudioLocked(false);
    setOptionAudioLocked({});
    setIsPlayingAnyAudio(false);
  }, [currentQuestion]);

  useEffect(() => {
    if (isStarted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStarted]);

  const handleGetStarted = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    }
    setIsStarted(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // यहाँ इन्डेक्स र q.id दुवैमा सेभ हुने गरी अपडेट गरिएको छ
  const handleOptionSelect = (index) => {
    const currentQ = questions[currentQuestion];
    setSelectedAnswers({ 
      ...selectedAnswers, 
      [currentQuestion]: index,
      [currentQ.id]: index 
    });
  };

  const handleAudioPlay = () => {
    if (playCountRef.current === 0) {
      playCountRef.current = 1;
      setMainAudioLocked(true);
      setIsPlayingAnyAudio(true);
    }
  };

  const handleAudioEnded = () => {
    if (playCountRef.current === 1) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (audioRef.current && playCountRef.current === 1) {
          playCountRef.current = 2;
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => console.log("Audio 2nd play error:", err));
        }
      }, 3000);
    } else if (playCountRef.current >= 2) {
      setIsPlayingAnyAudio(false);
    }
  };

  const handleOptionAudioPlay = (index) => {
    const currentCount = optionPlayCountRef.current[index] || 0;
    if (currentCount === 0) {
      optionPlayCountRef.current[index] = 1;
      setOptionAudioLocked(prev => ({ ...prev, [index]: true }));
      setIsPlayingAnyAudio(true);
    }
  };

  const handleOptionAudioEnded = (index) => {
    const currentCount = optionPlayCountRef.current[index] || 1;
    if (currentCount === 1) {
      if (optionTimeoutRefs.current[index]) clearTimeout(optionTimeoutRefs.current[index]);
      optionTimeoutRefs.current[index] = setTimeout(() => {
        const optAud = optionAudioRefs.current[index];
        if (optAud && optionPlayCountRef.current[index] === 1) {
          optionPlayCountRef.current[index] = 2;
          optAud.currentTime = 0;
          optAud.play().catch(err => console.log("Opt audio 2nd play error:", err));
        }
      }, 3000);
    } else if (currentCount >= 2) {
      setIsPlayingAnyAudio(false);
    }
  };

  const handleFinalSubmit = () => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      Object.values(optionTimeoutRefs.current).forEach(t => clearTimeout(t));
      if (audioRef.current) audioRef.current.pause();
      Object.values(optionAudioRefs.current).forEach(aud => aud && aud.pause());

      let score = 0;
      let attemptedCount = 0;
      const formattedSelectedAnswers = {};

      questions.forEach((q, index) => {
        const userSelectedAnswer = selectedAnswers[index] !== undefined 
          ? selectedAnswers[index] 
          : selectedAnswers[q.id];
        
        if (userSelectedAnswer !== undefined && userSelectedAnswer !== null && userSelectedAnswer !== "") {
          formattedSelectedAnswers[q.id] = userSelectedAnswer;
          formattedSelectedAnswers[index] = userSelectedAnswer;
          
          attemptedCount += 1; 
          if (Number(userSelectedAnswer) === Number(q.answer)) {
            score += 1; 
          }
        }
      });

      const totalQ = questions.length > 0 ? questions.length : 40;
      const examResultData = { 
        examName: exactExamName,
        score, 
        total: totalQ, 
        attempted: attemptedCount,
        percentage: Math.round((score / totalQ) * 100),
        passed: Math.round((score / totalQ) * 100) >= 40,
        questions,
        selectedAnswers: formattedSelectedAnswers
      };
      
      localStorage.setItem("lastExamResult", JSON.stringify(examResultData));

      const existingResults = JSON.parse(localStorage.getItem("examResults")) || [];
      localStorage.setItem("examResults", JSON.stringify([examResultData, ...existingResults]));

      setShowConfirmModal(false);
      navigate("/student/result");
    } catch (err) {
      console.error("Submission error:", err);
      navigate("/student/result");
    }
  };

  const solvedCount = Object.keys(selectedAnswers).length;
  const unsolvedCount = questions.length - solvedCount;

  const protectedStyle = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none"
  };

  if (!isStarted) {
    return (
      <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif", boxSizing: "border-box", ...protectedStyle }} onContextMenu={(e) => e.preventDefault()}>
        <div style={{ backgroundColor: "white", padding: "40px 50px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", textAlign: "center", border: "1px solid #e2e8f0", maxWidth: "550px", width: "100%" }}>
          <h2 style={{ color: "#0284c7", fontSize: "26px", marginTop: 0, marginBottom: "20px" }}>EPS-TOPIK UBT Exam</h2>
          <div style={{ width: "70px", height: "70px", backgroundColor: "#0f172a", borderRadius: "50%", margin: "0 auto 20px auto", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "30px" }}>
            👤
          </div>
          <div style={{ fontSize: "15px", color: "#334155", lineHeight: "1.8", marginBottom: "30px" }}>
            <p style={{ margin: "5px 0" }}><b>Your Exam ID :</b> 287378RM</p>
            <p style={{ margin: "5px 0" }}><b>Name of Student :</b> {studentName}</p>
            <p style={{ margin: "5px 0" }}><b>Exam Title :</b> {exactExamName}</p>
            <p style={{ margin: "5px 0", color: "#2563eb" }}><b>Total Questions :</b> 40 (20 Reading + 20 Listening)</p>
            <p style={{ margin: "5px 0", color: "#d97706" }}><b>Time Limit :</b> 50 Minutes</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "280px", margin: "0 auto" }}>
            <button 
              type="button"
              onClick={handleGetStarted}
              style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "12px", fontSize: "16px", fontWeight: "bold", borderRadius: "6px", cursor: "pointer" }}
            >
              GET STARTED
            </button>
            <button 
              type="button"
              onClick={() => navigate("/student")}
              style={{ backgroundColor: "white", color: "#0ea5e9", border: "1px solid #0ea5e9", padding: "10px", fontSize: "15px", fontWeight: "bold", borderRadius: "6px", cursor: "pointer" }}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return <div style={{ padding: "50px", textAlign: "center" }}>Loading exam questions...</div>;

  const containerExamStyle = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "rgba(241, 245, 249, 0.92)",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    padding: "15px",
    overflow: "hidden",
    position: "relative",
    backgroundImage: logoWatermark ? `url(${logoWatermark})` : "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "400px",
    backgroundBlendMode: "overlay",
    ...protectedStyle
  };

  return (
    <div style={containerExamStyle} onContextMenu={(e) => e.preventDefault()}>
      
      {showConfirmModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999999 }}>
          <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "8px", width: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", fontSize: "18px" }}>Confirm Submission</h3>
            <p style={{ color: "#475569", fontSize: "14px", marginBottom: "20px", lineHeight: "1.4" }}>
              Are you sure you want to submit and end the exam?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{ backgroundColor: "transparent", color: "#0284c7", border: "none", fontWeight: "bold", fontSize: "13px", cursor: "pointer", padding: "6px 10px" }}
              >
                CANCEL
              </button>
              <button 
                type="button"
                onClick={handleFinalSubmit}
                style={{ backgroundColor: "#0284c7", color: "white", border: "none", fontWeight: "bold", fontSize: "13px", cursor: "pointer", padding: "6px 14px", borderRadius: "4px" }}
              >
                AGREE
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "overview" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "850px", width: "100%", height: "100%", margin: "auto", justifyContent: "center" }}>
          
          <div style={{ display: "flex", backgroundColor: "#0284c7", color: "white", padding: "14px 20px", borderRadius: "8px 8px 0 0", justifyContent: "space-between", fontWeight: "bold", fontSize: "15px" }}>
            <span>Remaining Questions: 40</span>
            <span>{exactExamName}</span>
            <span>Time Remaining: {formatTime(timeLeft)}</span>
          </div>

          <div style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #cbd5e1", borderTop: "none", padding: "25px 30px", borderRadius: "0 0 8px 8px", boxShadow: "0 4px 15px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "25px" }}>
              
              <div style={{ flex: 1, borderRight: "2px solid #e2e8f0", paddingRight: "15px" }}>
                <h4 style={{ textAlign: "center", color: "#0284c7", margin: "0 0 15px 0", fontSize: "15px" }}>Reading Questions (1 - 20)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                  {questions.slice(0, 20).map((q, idx) => (
                    <button
                      type="button"
                      key={q.id}
                      onClick={() => { setCurrentQuestion(idx); setViewMode("single"); }}
                      style={{
                        padding: "12px 0",
                        backgroundColor: (selectedAnswers[idx] !== undefined || selectedAnswers[q.id] !== undefined) ? "#dcfce7" : "white",
                        border: "1px solid #0284c7",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        cursor: "pointer",
                        color: "#1e293b",
                        transition: "0.15s"
                      }}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, paddingLeft: "15px" }}>
                <h4 style={{ textAlign: "center", color: "#0284c7", margin: "0 0 15px 0", fontSize: "15px" }}>Listening Questions (21 - 40)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                  {questions.slice(20, 40).map((q, idx) => {
                    const actualIndex = idx + 20;
                    return (
                      <button
                        type="button"
                        key={q.id}
                        onClick={() => { setCurrentQuestion(actualIndex); setViewMode("single"); }}
                        style={{
                          padding: "12px 0",
                          backgroundColor: (selectedAnswers[actualIndex] !== undefined || selectedAnswers[q.id] !== undefined) ? "#dcfce7" : "white",
                          border: "1px solid #0284c7",
                          borderRadius: "5px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          cursor: "pointer",
                          color: "#1e293b",
                          transition: "0.15s"
                        }}
                      >
                        {actualIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div style={{ marginTop: "25px", textAlign: "right" }}>
              <button 
                type="button"
                onClick={() => setShowConfirmModal(true)}
                style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "12px 24px", fontSize: "15px", fontWeight: "bold", borderRadius: "5px", cursor: "pointer" }}
              >
                SUBMIT AND FINISH EXAM
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "1050px", width: "100%", height: "100%", margin: "auto", justifyContent: "center" }}>
          
          {(() => {
            const currentQ = questions[currentQuestion];
            return (
              <div>
                <div style={{ display: "flex", backgroundColor: "#0284c7", color: "white", padding: "12px 20px", borderRadius: "8px 8px 0 0", justifyContent: "space-between", fontWeight: "bold", fontSize: "15px" }}>
                  <span>Remaining Questions: 40</span>
                  <span>{exactExamName}</span>
                  <span>Time Remaning :{formatTime(timeLeft)}</span>
                </div>

                <div style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #cbd5e1", borderTop: "none", borderRadius: "0 0 8px 8px", boxShadow: "0 4px 15px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "550px", minHeight: "550px" }}>
                  <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                    
                    <div style={{ flex: 1.2, padding: "20px 25px", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflowY: "auto", height: "100%" }}>
                      <p style={{ color: "#1e293b", fontSize: "20px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                        {currentQ.mainHeading || (currentQuestion < 20 ? "[ 1 - 20 ] 다음을 읽고 알맞은 것을 고르십시오." : "[ 21 - 40 ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.")}
                      </p>
                      {currentQ.questionHeading && (
                        <p style={{ color: "#334155", fontSize: "20px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                          {currentQ.questionHeading}
                        </p>
                      )}
                      
                      {currentQ.description && (
                        <div style={{ 
                          border: "1px solid #94a3b8", 
                          borderRadius: "6px", 
                          padding: "12px 15px", 
                          backgroundColor: "white", 
                          color: "#1e293b", 
                          fontSize: "20px", 
                          fontWeight: "bold", 
                          lineHeight: "1.5",
                          whiteSpace: "pre-wrap",
                          marginBottom: "12px"
                        }}>
                          {currentQ.description}
                        </div>
                      )}

                      {currentQ.image && (
                        <div style={{ margin: "auto", border: "1px solid #cbd5e1", padding: "10px", borderRadius: "6px", backgroundColor: "white", textAlign: "center" }}>
                          <img 
                            src={currentQ.image} 
                            alt="Question Visual" 
                            style={{ 
                              display: 'block', 
                              maxHeight: '250px', 
                              maxWidth: '100%', 
                              width: 'auto',
                              height: 'auto',
                              objectFit: 'contain', 
                              margin: '0 auto', 
                              pointerEvents: 'none',
                              imageRendering: 'high-quality',
                              WebkitImageRendering: '-webkit-optimize-contrast'
                            }} 
                            draggable="false" 
                          />
                        </div>
                      )}

                      {currentQ.audio && (
                        <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "center" }}>
                          <audio 
                            ref={audioRef}
                            controls
                            controlsList="nodownload noremoteplayback noplaybackrate"
                            onContextMenu={(e) => e.preventDefault()} 
                            onPlay={handleAudioPlay}
                            onEnded={handleAudioEnded}
                            src={currentQ.audio} 
                            style={{ 
                              width: "100%", 
                              height: "32px",
                              pointerEvents: (mainAudioLocked || isPlayingAnyAudio) ? "none" : "auto", 
                              opacity: mainAudioLocked ? 0.5 : 1,
                              filter: mainAudioLocked ? "grayscale(80%)" : "none"
                            }} 
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, padding: "20px 25px", display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: "10px", overflowY: "auto", height: "100%" }}>
                      {(currentQ.options || []).map((option, index) => {
                        const isSelected = selectedAnswers[currentQuestion] === index || selectedAnswers[currentQ.id] === index;
                        const optText = typeof option === 'object' && option !== null ? option.text : option;
                        const optImg = typeof option === 'object' && option !== null ? option.image : null;
                        const optAud = typeof option === 'object' && option !== null ? option.audio : (currentQ.optionAudios?.[index] || null);
                        const isOptLocked = optionAudioLocked[index];

                        return (
                          <div 
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              padding: "10px 12px",
                              borderBottom: "1px solid #e2e8f0",
                              cursor: "pointer",
                              backgroundColor: isSelected ? "#eff6ff" : "transparent"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                              <div style={{
                                width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #0284c7",
                                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px",
                                marginRight: "15px", backgroundColor: isSelected ? "#0284c7" : "white", color: isSelected ? "white" : "#0284c7",
                                flexShrink: 0
                              }}>
                                {index + 1}
                              </div>
                              <span 
                                style={{ fontSize: "20px", fontWeight: "normal", color: "#1e293b", flex: 1 }} 
                                dangerouslySetInnerHTML={{ __html: optText }} 
                              />
                            </div>

                            {optImg && (
                              <div style={{ marginTop: "6px", paddingLeft: "47px" }}>
                                <img 
                                  src={optImg} 
                                  alt={`Option ${index + 1}`} 
                                  style={{ 
                                    maxHeight: "80px", 
                                    maxWidth: "100%",
                                    width: "auto",
                                    height: "auto",
                                    borderRadius: "4px", 
                                    border: "1px solid #cbd5e1",
                                    imageRendering: 'high-quality',
                                    WebkitImageRendering: '-webkit-optimize-contrast'
                                  }} 
                                />
                              </div>
                            )}

                            {optAud && (
                              <div style={{ marginTop: "6px", paddingLeft: "47px", width: "100%" }} onClick={(e) => e.stopPropagation()}>
                                <audio 
                                  ref={el => optionAudioRefs.current[index] = el}
                                  controls
                                  controlsList="nodownload noremoteplayback noplaybackrate"
                                  onContextMenu={(e) => e.preventDefault()}
                                  onPlay={() => handleOptionAudioPlay(index)}
                                  onEnded={() => handleOptionAudioEnded(index)}
                                  src={optAud}
                                  style={{ 
                                    width: "100%", 
                                    height: "30px",
                                    pointerEvents: (isOptLocked || isPlayingAnyAudio) ? "none" : "auto", 
                                    opacity: isOptLocked ? 0.5 : 1,
                                    filter: isOptLocked ? "grayscale(80%)" : "none"
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", padding: "12px 25px", backgroundColor: "#f8fafc", borderTop: "1px solid #cbd5e1", borderRadius: "0 0 8px 8px", justifyContent: "space-between" }}>
                    <button 
                      type="button"
                      onClick={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        Object.values(optionTimeoutRefs.current).forEach(t => clearTimeout(t));
                        if (audioRef.current) audioRef.current.pause();
                        Object.values(optionAudioRefs.current).forEach(aud => aud && aud.pause());
                        setCurrentQuestion(prev => Math.max(0, prev - 1));
                      }}
                      disabled={currentQuestion === 0}
                      style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "9px 18px", borderRadius: "4px", fontWeight: "bold", cursor: currentQuestion === 0 ? "not-allowed" : "pointer", fontSize: "13px" }}
                    >
                      ❮ PREVIOUS
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        Object.values(optionTimeoutRefs.current).forEach(t => clearTimeout(t));
                        if (audioRef.current) audioRef.current.pause();
                        Object.values(optionAudioRefs.current).forEach(aud => aud && aud.pause());
                        setViewMode("overview");
                      }}
                      style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "9px 18px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                    >
                      ☷ TOTAL QUESTION
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        Object.values(optionTimeoutRefs.current).forEach(t => clearTimeout(t));
                        if (audioRef.current) audioRef.current.pause();
                        Object.values(optionAudioRefs.current).forEach(aud => aud && aud.pause());
                        if (currentQuestion < questions.length - 1) {
                          setCurrentQuestion(prev => prev + 1);
                        } else {
                          setShowConfirmModal(true); 
                        }
                      }}
                      style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "9px 18px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                    >
                      {currentQuestion === questions.length - 1 ? "SUBMIT ❯" : "NEXT ❯"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default StudentExam;