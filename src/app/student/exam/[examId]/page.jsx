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

const StudentExam = () => {
  const router = useRouter();
  const params = useParams(); const examId = params?.examId;
  const [studentName, setStudentName] = useState("");
  const [logoWatermark, setLogoWatermark] = useState("");

  const [isStarted, setIsStarted] = useState(false);
  const [viewMode, setViewMode] = useState("overview"); 
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3000); // 50 Minutes (3000 seconds)
  const [exactExamName, setExactExamName] = useState(`Chapterwise 0${examId}`);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [submittedExamResult, setSubmittedExamResult] = useState(null);
  const [inlineShowDetailed, setInlineShowDetailed] = useState(false);
  const [inlineSelectedQIndex, setInlineSelectedQIndex] = useState(null);

  useEffect(() => {
    try {
      router.prefetch("/student/result");
      router.prefetch("/student");
    } catch (e) {}
  }, [router]);

  useEffect(() => {
    try {
      const u = localStorage.getItem("currentUser") || "Student";
      setStudentName(u);
      const institutes = JSON.parse(localStorage.getItem("institutes") || "[]");
      if (institutes[0]?.logoUrl) {
        setLogoWatermark(institutes[0].logoUrl);
      }
    } catch (e) {}
  }, []);

  // Auto-rotate and lock screen to landscape mode on UBT Exam start
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (screen.orientation && typeof screen.orientation.lock === "function") {
          screen.orientation.lock("landscape").catch(() => {
            if (screen.orientation && typeof screen.orientation.unlock === "function") {
              screen.orientation.unlock();
            }
          });
        } else if (screen.orientation && typeof screen.orientation.unlock === "function") {
          screen.orientation.unlock();
        }
      } catch (e) {}
    }
    return () => {
      if (typeof window !== "undefined") {
        try {
          if (screen.orientation && typeof screen.orientation.unlock === "function") {
            screen.orientation.unlock();
          }
        } catch (e) {}
      }
    };
  }, []);

  const audioRef = useRef(null);
  const optionAudioRefs = useRef({});
  const playCountRef = useRef(0);
  const optionPlayCountRef = useRef({});
  const timeoutRef = useRef(null);
  const optionTimeoutRefs = useRef({});

  const [mainAudioLocked, setMainAudioLocked] = useState(false);
  const [optionAudioLocked, setOptionAudioLocked] = useState({});
  const [isPlayingAnyAudio, setIsPlayingAnyAudio] = useState(false);
  const [backendSessionId, setBackendSessionId] = useState(null);
  const [answerSheet, setAnswerSheet] = useState({});

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch(`/api/student/exams/${examId || "set-1-demo"}/start`, {
          method: "POST"
        });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length >= 40) {
            setQuestions(data.questions);
            if (data.answerSheet) setAnswerSheet(data.answerSheet);
            setBackendSessionId(data.sessionId);
            if (data.examName) setExactExamName(data.examName);

            // DOWNLOAD & CACHE QUESTIONS + ANSWERSHEET FOR COMPLETE OFFLINE TAKE & REVIEW
            try {
              localStorage.setItem(`offline_ubt_exam_${examId || "set-1-demo"}`, JSON.stringify({
                questions: data.questions,
                answerSheet: data.answerSheet || {},
                sessionId: data.sessionId,
                examName: data.examName,
                duration: data.duration,
                expiresAt: data.expiresAt,
                cachedAt: Date.now()
              }));
            } catch (cErr) {
              console.warn("Could not write offline exam cache:", cErr);
            }
            return;
          }
        } else {
          // STRICT SECURITY: If backend denies access (e.g. 403 Forbidden), halt immediately and redirect
          const errData = await res.json().catch(() => ({}));
          alert(errData.error || "Access Denied: You do not have authorization to access this exam.");
          router.push("/student");
          return;
        }
      } catch (err) {
        console.warn("Backend start API network error (attempting offline cache):", err);
        try {
          const cachedExamStr = localStorage.getItem(`offline_ubt_exam_${examId || "set-1-demo"}`);
          if (cachedExamStr) {
            const cachedExam = JSON.parse(cachedExamStr);
            if (cachedExam.questions && cachedExam.questions.length >= 40) {
              setQuestions(cachedExam.questions);
              if (cachedExam.answerSheet) setAnswerSheet(cachedExam.answerSheet);
              setBackendSessionId(cachedExam.sessionId || `offline_${Date.now()}`);
              if (cachedExam.examName) setExactExamName(cachedExam.examName);
              return;
            }
          }
        } catch (offlineErr) {
          console.warn("Offline restore error:", offlineErr);
        }
      }

      const savedSets = JSON.parse(localStorage.getItem("examSets")) || [];
      const allQuestions = JSON.parse(localStorage.getItem("questionBank")) || [];
      
      const currentExamSet = savedSets.find(s => s.id.toString() === examId?.toString() || s.name === examId);
      const targetSetName = currentExamSet ? currentExamSet.name : `Chapterwise 0${examId}`;
      setExactExamName(targetSetName);

      // Check Free Student / Self-Signup Paid Access Authorization
      const savedPkg = typeof window !== 'undefined' ? (localStorage.getItem("currentStudentPackage") || "") : "";
      const isFreeGuest = typeof window !== 'undefined' && (
        localStorage.getItem("isFreeStudent") === "true" ||
        localStorage.getItem("isGoogleAuth") === "true" ||
        savedPkg.toLowerCase().includes("free")
      );
      const buyerMap = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}") : {};
      const curPhone = typeof window !== 'undefined' ? (localStorage.getItem("currentStudentPhone") || localStorage.getItem("studentPhone") || "") : "";
      const curUser = typeof window !== 'undefined' ? (localStorage.getItem("currentUser") || "") : "";
      const buyerInfo = buyerMap[curPhone] || buyerMap[curUser];

      const unlockedSets = typeof window !== 'undefined' ? [
        ...(JSON.parse(localStorage.getItem("unlockedStudentExamSets") || "[]")),
        ...(JSON.parse(localStorage.getItem("releasedStudentExamSets") || "[]"))
      ] : [];
      const isSetIndividuallyUnlocked = unlockedSets.some((id) =>
        id?.toString() === examId?.toString() ||
        id?.toString() === currentExamSet?.id?.toString() ||
        id?.toString() === currentExamSet?.name?.toString() ||
        id?.toString() === targetSetName?.toString() ||
        (typeof examId === "string" && id?.toString() === decodeURIComponent(examId))
      );

      const isExamSetFree = Boolean(
        currentExamSet?.isFree ||
        currentExamSet?.setType === "FREE" ||
        (currentExamSet?.name && currentExamSet.name.toLowerCase().includes("free demo")) ||
        (targetSetName && targetSetName.toLowerCase().includes("free demo"))
      );

      const hasPaidExam = Boolean(
        isExamSetFree ||
        isSetIndividuallyUnlocked ||
        buyerInfo?.isBuyer ||
        buyerInfo?.hasPurchased ||
        (typeof window !== 'undefined' && localStorage.getItem("hasPurchasedExamAccess") === "true") ||
        (!isFreeGuest && savedPkg && !savedPkg.toLowerCase().includes("free"))
      );

      if (!isExamSetFree && isFreeGuest && !hasPaidExam) {
        alert("Access Restricted: UBT & Mock tests require a purchased package or individual set unlock. Please unlock this set via eSewa to take the exam.");
        router.push("/student");
        return;
      }

      // Check Package Expiry Date Authorization (bypassed if individually unlocked or free demo)
      if (!isExamSetFree && !isSetIndividuallyUnlocked) {
        const savedExpDate = typeof window !== 'undefined' ? localStorage.getItem("currentStudentExpiryDate") : null;
        if (savedExpDate && savedExpDate !== 'Active' && !savedExpDate.toLowerCase().includes("lifetime") && !isNaN(new Date(savedExpDate).getTime())) {
          const isExp = new Date(savedExpDate + 'T23:59:59') < new Date();
          if (isExp) {
            alert(`Access Restricted: Your package expired on ${savedExpDate}. Please renew your package with your institute to take this exam.`);
            router.push("/student");
            return;
          }
        }
      }

      // Check Private Institute Bucket Access Authorization
      if (currentExamSet && currentExamSet.creatorInstituteName && !currentExamSet.isPublished) {
        const currentStudentPhone = typeof window !== 'undefined' ? (localStorage.getItem("currentStudentPhone") || localStorage.getItem("studentPhone")) : null;
        const allInstituteStudents = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("instituteStudents") || "{}") : {};
        const cleanDigits = (p) => (p || "").toString().replace(/[^0-9]/g, "").slice(-10);
        const targetCleanPhone = cleanDigits(currentStudentPhone);
        const isMatchingPhone = (phone) => {
          if (!phone || !currentStudentPhone) return false;
          if (phone === currentStudentPhone) return true;
          const c = cleanDigits(phone);
          return Boolean(c && targetCleanPhone && c === targetCleanPhone);
        };

        let studentInstitute = typeof window !== 'undefined' ? (localStorage.getItem("currentInstitute") || null) : null;
        if (!studentInstitute) {
          for (const inst in allInstituteStudents) {
            if ((allInstituteStudents[inst] || []).some(s => isMatchingPhone(s.phone))) {
              studentInstitute = inst;
              break;
            }
          }
        }
        if (!studentInstitute || studentInstitute.toLowerCase() !== currentExamSet.creatorInstituteName.toLowerCase()) {
          alert(`Access Restricted: This exam set is in the private bucket of "${currentExamSet.creatorInstituteName}". Students from other institutes cannot access it.`);
          router.push("/student");
          return;
        }
      }

      const targetPackageName = currentExamSet ? currentExamSet.packageName : "";

      // Model Question Bank sets are open for all users
      // No restricted authorization check needed

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
    }
    loadQuestions();
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
    // Enter fullscreen and lock orientation to landscape display on full screen
    if (typeof window !== "undefined") {
      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
      } catch (e) {}

      try {
        if (screen.orientation && typeof screen.orientation.lock === "function") {
          screen.orientation.lock("landscape").catch(() => {});
        } else if (screen.lockOrientation) {
          screen.lockOrientation("landscape");
        } else if (screen.webkitLockOrientation) {
          screen.webkitLockOrientation("landscape");
        } else if (screen.mozLockOrientation) {
          screen.mozLockOrientation("landscape");
        }
      } catch (e) {}
    }
    setIsStarted(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Removed array index saving to prevent collisions with q.id
  const handleOptionSelect = (index) => {
    const currentQ = questions[currentQuestion];
    setSelectedAnswers({ 
      ...selectedAnswers, 
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

  const handleFinalSubmit = async () => {
    try {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      Object.values(optionTimeoutRefs.current).forEach(t => clearTimeout(t));
      if (audioRef.current) audioRef.current.pause();
      Object.values(optionAudioRefs.current).forEach(aud => aud && aud.pause());

      // Prepare enriched questions with cached answerSheet for 100% offline accuracy & review
      const enrichedQuestions = questions.map((q, idx) => {
        const correctAns = answerSheet[q.id] ?? answerSheet[q.qIndex] ?? answerSheet[idx + 1] ?? q.answer;
        return {
          ...q,
          answer: correctAns !== undefined && correctAns !== null ? Number(correctAns) : undefined
        };
      });

      let score = 0;
      let attemptedCount = 0;
      const formattedSelectedAnswers = {};

      enrichedQuestions.forEach((q, index) => {
        // Fallback to array index for older states if q.id is missing
        const userSelectedAnswer = selectedAnswers[q.id] !== undefined 
          ? selectedAnswers[q.id] 
          : selectedAnswers[index];
        
        if (userSelectedAnswer !== undefined && userSelectedAnswer !== null && userSelectedAnswer !== "") {
          const numAns = Number(userSelectedAnswer);
          formattedSelectedAnswers[q.id] = numAns;
          if (q.qIndex !== undefined) {
            formattedSelectedAnswers[q.qIndex] = numAns;
          }
          
          attemptedCount += 1; 
          if (q.answer !== undefined && numAns === Number(q.answer)) {
            score += 1; 
          }
        }
      });

      const totalQ = enrichedQuestions.length > 0 ? enrichedQuestions.length : 40;
      const examResultData = { 
        examName: exactExamName,
        score, 
        total: totalQ, 
        attempted: attemptedCount,
        percentage: Math.round((score / totalQ) * 100),
        passed: Math.round((score / totalQ) * 100) >= 40,
        questions: enrichedQuestions,
        selectedAnswers: formattedSelectedAnswers,
        isOfflineSubmitted: false
      };

      // Attempt submit to backend with 3.5s timeout, falling back smoothly to offline mode
      let onlineSubmitted = false;
      if (backendSessionId && typeof navigator !== "undefined" && navigator.onLine) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const submitRes = await fetch(`/api/student/exams/${examId || "set-1-demo"}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: backendSessionId,
              selectedAnswers: formattedSelectedAnswers
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (submitRes.ok) {
            onlineSubmitted = true;
            const submitData = await submitRes.json();
            if (submitData.result) {
              const resObj = submitData.result;
              examResultData.score = resObj.correctAnswers !== undefined ? resObj.correctAnswers : score;
              examResultData.total = resObj.totalQuestions || totalQ;
              examResultData.passed = Boolean(resObj.passed);
              examResultData.percentage = Math.round(((examResultData.score) / (examResultData.total)) * 100);
              if (Array.isArray(resObj.breakdown)) {
                examResultData.questions = enrichedQuestions.map((q, qIdx) => {
                  const bd = resObj.breakdown.find(b => b.qIndex === q.qIndex || b.qIndex === (qIdx + 1));
                  return bd ? { ...q, answer: bd.correctAnswer } : q;
                });
              }
            }
          }
        } catch (e) {
          console.warn("Submit API network notice (enqueuing for offline sync):", e);
        }
      }

      // If offline or network submission timed out, tag and queue for sync
      if (!onlineSubmitted) {
        examResultData.isOfflineSubmitted = true;
        try {
          const syncQueue = JSON.parse(localStorage.getItem("offlineExamSyncQueue") || "[]");
          syncQueue.push({
            examId: examId || "set-1-demo",
            sessionId: backendSessionId || `offline_${Date.now()}`,
            selectedAnswers: formattedSelectedAnswers,
            score,
            total: totalQ,
            submittedAt: new Date().toISOString()
          });
          localStorage.setItem("offlineExamSyncQueue", JSON.stringify(syncQueue));
        } catch (queueErr) {
          console.warn("Could not save to offline sync queue:", queueErr);
        }
      }
      
      localStorage.setItem("lastExamResult", JSON.stringify(examResultData));

      const existingResults = JSON.parse(localStorage.getItem("examResults")) || [];
      localStorage.setItem("examResults", JSON.stringify([examResultData, ...existingResults]));

      setSubmittedExamResult(examResultData);
      setIsExamSubmitted(true);
      setShowConfirmModal(false);

      try {
        router.push("/student/result");
      } catch (navErr) {
        console.warn("Offline router navigation notice (active in-page review fallback):", navErr);
      }
    } catch (err) {
      console.error("Submission error:", err);
      try {
        router.push("/student/result");
      } catch (e) {}
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
      <div 
        className="ubt-pre-exam-screen"
        style={{ 
          width: "100vw", 
          minHeight: "100dvh", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          backgroundColor: "#f8fafc", 
          fontFamily: "Arial, sans-serif", 
          boxSizing: "border-box", 
          padding: "12px 14px",
          overflowY: "auto",
          ...protectedStyle 
        }} 
        onContextMenu={(e) => e.preventDefault()}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .ubt-pre-exam-dialog {
            background-color: #ffffff;
            padding: 20px 24px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
            max-width: 760px;
            width: 100%;
            max-height: 94vh;
            max-height: 94dvh;
            overflow-y: auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            gap: 22px;
            margin: auto;
            align-items: center;
          }
          .ubt-pre-exam-col-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            justify-content: space-between;
          }
          .ubt-pre-exam-col-details {
            flex: 1.25;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
          }
          .ubt-pre-exam-icon {
            width: 54px;
            height: 54px;
            background-color: #0284c7;
            border-radius: 50%;
            margin: 0 auto 8px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 10px rgba(2,132,199,0.3);
            flex-shrink: 0;
          }
          .ubt-pre-exam-title {
            color: #0f172a;
            font-size: 22px;
            margin: 0 0 4px 0;
            font-weight: 800;
          }
          .ubt-pre-exam-subtitle {
            color: #64748b;
            margin: 0 0 14px 0;
            font-size: 13px;
          }
          .ubt-pre-exam-table {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            text-align: left;
            width: 100%;
            box-sizing: border-box;
          }
          .ubt-pre-exam-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 8px;
            margin-bottom: 8px;
            font-size: 13px;
          }
          .ubt-pre-exam-btn {
            flex: 1;
            padding: 11px;
            font-size: 13.5px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .ubt-pre-exam-buttons {
            display: flex;
            gap: 10px;
            width: 100%;
            margin-top: 14px;
          }

          /* Stack vertically on portrait mode phones or narrow views */
          @media (orientation: portrait), (max-width: 580px) {
            .ubt-pre-exam-dialog {
              flex-direction: column !important;
              max-width: 440px !important;
              padding: 18px 16px !important;
              gap: 14px !important;
            }
            .ubt-pre-exam-buttons {
              margin-top: 8px !important;
            }
          }
        ` }} />
        <div className="ubt-pre-exam-dialog">
          <div className="ubt-pre-exam-col-info">
            <div className="ubt-pre-exam-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h2 className="ubt-pre-exam-title">EPS-TOPIK UBT Exam</h2>
            <p className="ubt-pre-exam-subtitle">Please verify your details before starting</p>
            
            <div className="ubt-pre-exam-buttons">
              <button 
                type="button"
                className="ubt-pre-exam-btn"
                onClick={() => router.push("/student")}
                style={{ backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}
              >
                CANCEL
              </button>
              <button 
                type="button"
                className="ubt-pre-exam-btn"
                onClick={handleGetStarted}
                style={{ backgroundColor: "#0284c7", color: "white", border: "none", boxShadow: "0 4px 6px rgba(2, 132, 199, 0.2)" }}
              >
                GET START
              </button>
            </div>
          </div>

          <div className="ubt-pre-exam-col-details">
            <div className="ubt-pre-exam-table">
              <div className="ubt-pre-exam-row">
                <span style={{ color: "#64748b", fontWeight: "600" }}>Exam ID</span>
                <span style={{ color: "#0f172a", fontWeight: "bold" }}>287378RM</span>
              </div>
              <div className="ubt-pre-exam-row">
                <span style={{ color: "#64748b", fontWeight: "600" }}>Student Name</span>
                <span suppressHydrationWarning style={{ color: "#0f172a", fontWeight: "bold" }}>{studentName}</span>
              </div>
              <div className="ubt-pre-exam-row">
                <span style={{ color: "#64748b", fontWeight: "600" }}>Exam Title</span>
                <span style={{ color: "#0f172a", fontWeight: "bold" }}>{exactExamName}</span>
              </div>
              <div className="ubt-pre-exam-row">
                <span style={{ color: "#64748b", fontWeight: "600" }}>Total Questions</span>
                <span style={{ color: "#2563eb", fontWeight: "bold" }}>40 (20 Reading + 20 Listening)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#64748b", fontWeight: "600" }}>Time Limit</span>
                <span style={{ color: "#d97706", fontWeight: "bold" }}>50 Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // OFFLINE SUBMITTED RESULT & QUESTION REVIEW (1 - 40)
  // ==============================================================
  if (isExamSubmitted && submittedExamResult) {
    const res = submittedExamResult;
    const revQuestions = res.questions || [];
    const revReading = revQuestions.filter(q => (q.type && q.type.toLowerCase() === "reading") || (q.qIndex !== undefined && q.qIndex <= 20)).slice(0, 20);
    const revListening = revQuestions.filter(q => (q.type && q.type.toLowerCase() === "listening") || (q.qIndex !== undefined && q.qIndex > 20)).slice(0, 20);
    const allRevQuestions = [...revReading, ...revListening].length > 0 ? [...revReading, ...revListening] : revQuestions.slice(0, 40);
    const revAnswers = res.selectedAnswers || {};

    const getAns = (q, idx) => {
      if (!q) return undefined;
      if (revAnswers[q.id] !== undefined) return revAnswers[q.id];
      if (q.qIndex !== undefined && revAnswers[q.qIndex] !== undefined) return revAnswers[q.qIndex];
      if (revAnswers[idx] !== undefined) return revAnswers[idx];
      return undefined;
    };

    // 1. Detailed Single Question View
    if (inlineShowDetailed && inlineSelectedQIndex !== null) {
      const q = allRevQuestions[inlineSelectedQIndex];
      const studentAns = getAns(q, inlineSelectedQIndex);
      const isAttempted = studentAns !== undefined && studentAns !== null && studentAns !== "";
      const isCorrect = isAttempted && q?.answer !== undefined && Number(studentAns) === Number(q.answer);

      return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "16px", boxSizing: "border-box", fontFamily: "Arial, sans-serif", overflowY: "auto" }}>
          <div style={{ maxWidth: "980px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setInlineSelectedQIndex(null)}
                  style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                >
                  ❮ Back to Grid
                </button>
                <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px", fontWeight: "800" }}>
                  Question {inlineSelectedQIndex + 1} Review ({q?.type || (inlineSelectedQIndex < 20 ? "Reading" : "Listening")})
                </h3>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ backgroundColor: isCorrect ? "#dcfce7" : (isAttempted ? "#fee2e2" : "#f1f5f9"), color: isCorrect ? "#15803d" : (isAttempted ? "#b91c1c" : "#64748b"), padding: "6px 14px", borderRadius: "20px", fontWeight: "800", fontSize: "12px" }}>
                  {isCorrect ? "✓ Correct" : (isAttempted ? "✗ Incorrect" : "○ Not Attempted")}
                </span>
                <button
                  type="button"
                  onClick={() => { setInlineShowDetailed(false); setInlineSelectedQIndex(null); }}
                  style={{ backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "6px 14px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}
                >
                  Summary
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <p style={{ color: "#0f172a", fontSize: "15px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                {q?.mainHeading || (inlineSelectedQIndex < 20 ? `[ ${inlineSelectedQIndex + 1} ] 다음을 읽고 알맞은 것을 고르십시오.` : `[ ${inlineSelectedQIndex + 1} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`)}
              </p>
              {q?.questionHeading && (
                <p style={{ color: "#334155", fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                  {q.questionHeading}
                </p>
              )}
              <p style={{ color: "#0f172a", fontSize: "17px", fontWeight: "bold", margin: "0 0 15px 0" }}>
                {inlineSelectedQIndex + 1}. {q?.description || ""}
              </p>

              {q?.image && (
                <div style={{ margin: "15px 0", textAlign: "center" }}>
                  <img src={q.image} alt="Question" style={{ maxHeight: "180px", maxWidth: "260px", objectFit: "contain", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
              )}

              {q?.audio && (
                <div style={{ margin: "15px 0" }}>
                  <audio controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} src={q.audio} style={{ width: "100%", height: "35px" }} />
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                {Array.isArray(q?.options) && q.options.map((opt, optIdx) => {
                  const optText = typeof opt === 'object' && opt !== null ? opt.text : opt;
                  const optImg = typeof opt === 'object' && opt !== null ? opt.image : null;
                  const optAud = typeof opt === 'object' && opt !== null ? opt.audio : null;

                  const isThisCorrect = Number(optIdx) === Number(q.answer);
                  const isThisStudent = Number(optIdx) === Number(studentAns);

                  let bg = "#f8fafc";
                  let border = "1px solid #cbd5e1";
                  let color = "#1e293b";
                  let badgeBg = "white";
                  let badgeBorder = "2px solid #0284c7";
                  let badgeColor = "#0284c7";

                  if (isThisCorrect) {
                    bg = "#f0fdf4";
                    border = "1.5px solid #16a34a";
                    color = "#15803d";
                    badgeBg = "#16a34a";
                    badgeBorder = "2px solid #16a34a";
                    badgeColor = "white";
                  } else if (isThisStudent && !isCorrect) {
                    bg = "#fef2f2";
                    border = "1.5px solid #ef4444";
                    color = "#b91c1c";
                    badgeBg = "#ef4444";
                    badgeBorder = "2px solid #ef4444";
                    badgeColor = "white";
                  }

                  return (
                    <div key={optIdx} style={{ display: "flex", flexDirection: "column", padding: "10px 14px", backgroundColor: bg, border, borderRadius: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: badgeBg, color: badgeColor, border: badgeBorder, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px", marginRight: "12px", flexShrink: 0 }}>
                          {optIdx + 1}
                        </div>
                        <span style={{ fontSize: "15px", flex: 1, color }}>{optText}</span>
                        {isThisCorrect && (
                          <span style={{ fontSize: "12px", fontWeight: "800", color: "#16a34a", marginLeft: "8px" }}>
                            ✓ Correct Answer
                          </span>
                        )}
                        {isThisStudent && !isThisCorrect && (
                          <span style={{ fontSize: "12px", fontWeight: "800", color: "#ef4444", marginLeft: "8px" }}>
                            ✗ Your Answer
                          </span>
                        )}
                      </div>
                      {optImg && (
                        <div style={{ marginTop: "6px", paddingLeft: "40px" }}>
                          <img src={optImg} alt={`Opt ${optIdx + 1}`} style={{ maxHeight: "60px", borderRadius: "4px" }} />
                        </div>
                      )}
                      {optAud && (
                        <div style={{ marginTop: "6px", paddingLeft: "40px" }}>
                          <audio controls controlsList="nodownload" src={optAud} style={{ width: "100%", height: "26px" }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => setInlineSelectedQIndex(prev => Math.max(0, prev - 1))}
                  disabled={inlineSelectedQIndex === 0}
                  style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "9px 18px", borderRadius: "6px", fontWeight: "bold", cursor: inlineSelectedQIndex === 0 ? "not-allowed" : "pointer", opacity: inlineSelectedQIndex === 0 ? 0.5 : 1 }}
                >
                  ❮ Previous
                </button>
                <button
                  type="button"
                  onClick={() => setInlineSelectedQIndex(prev => Math.min(allRevQuestions.length - 1, prev + 1))}
                  disabled={inlineSelectedQIndex === allRevQuestions.length - 1}
                  style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "9px 18px", borderRadius: "6px", fontWeight: "bold", cursor: inlineSelectedQIndex === allRevQuestions.length - 1 ? "not-allowed" : "pointer", opacity: inlineSelectedQIndex === allRevQuestions.length - 1 ? 0.5 : 1 }}
                >
                  Next ❯
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. 40-Question Grid Overview
    if (inlineShowDetailed && inlineSelectedQIndex === null) {
      return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "16px", boxSizing: "border-box", fontFamily: "Arial, sans-serif", overflowY: "auto" }}>
          <div style={{ maxWidth: "980px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setInlineShowDetailed(false)}
                style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
              >
                ❮ Back to Summary
              </button>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>● Correct ({res.score})</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#ef4444" }}>● Incorrect ({res.attempted - res.score})</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>● Unanswered ({res.total - res.attempted})</span>
              </div>
            </div>

            <div style={{ backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ backgroundColor: "#0284c7", color: "white", padding: "12px 20px", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px", flexWrap: "wrap", gap: "8px" }}>
                <span>Exam: {res.examName}</span>
                <span>Score: {res.score} / {res.total} ({res.percentage}%)</span>
                <span>Click any question number to review</span>
              </div>

              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "280px" }}>
                    <h4 style={{ textAlign: "center", color: "#0284c7", margin: "0 0 12px 0", fontSize: "15px" }}>Reading Questions (1 - 20)</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {allRevQuestions.slice(0, 20).map((q, idx) => {
                        const ans = getAns(q, idx);
                        const isAtt = ans !== undefined && ans !== null && ans !== "";
                        const isCor = isAtt && q.answer !== undefined && Number(ans) === Number(q.answer);

                        let bg = "white";
                        let border = "#cbd5e1";
                        let text = "#1e293b";
                        if (isAtt) {
                          if (isCor) { bg = "#16a34a"; border = "#15803d"; text = "white"; }
                          else { bg = "#ef4444"; border = "#dc2626"; text = "white"; }
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setInlineSelectedQIndex(idx)}
                            style={{ padding: "10px 0", backgroundColor: bg, border: `1.5px solid ${border}`, borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", color: text }}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: "280px" }}>
                    <h4 style={{ textAlign: "center", color: "#0284c7", margin: "0 0 12px 0", fontSize: "15px" }}>Listening Questions (21 - 40)</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {allRevQuestions.slice(20, 40).map((q, idx) => {
                        const actualIdx = idx + 20;
                        const ans = getAns(q, actualIdx);
                        const isAtt = ans !== undefined && ans !== null && ans !== "";
                        const isCor = isAtt && q.answer !== undefined && Number(ans) === Number(q.answer);

                        let bg = "white";
                        let border = "#cbd5e1";
                        let text = "#1e293b";
                        if (isAtt) {
                          if (isCor) { bg = "#16a34a"; border = "#15803d"; text = "white"; }
                          else { bg = "#ef4444"; border = "#dc2626"; text = "white"; }
                        }

                        return (
                          <button
                            key={actualIdx}
                            type="button"
                            onClick={() => setInlineSelectedQIndex(actualIdx)}
                            style={{ padding: "10px 0", backgroundColor: bg, border: `1.5px solid ${border}`, borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", color: text }}
                          >
                            {actualIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. Default: Exam Summary Screen
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "column" }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .exam-finish-top-bar {
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
          .exam-finish-wrap {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
          }
          .exam-finish-card {
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
          .exam-finish-header {
            text-align: center;
            margin-bottom: 18px;
          }
          .exam-finish-trophy {
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
          .exam-finish-title {
            color: #0f172a;
            font-size: 22px;
            margin: 0 0 8px 0;
            fontWeight: 800;
          }
          .exam-finish-badge {
            display: inline-block;
            background-color: #f1f5f9;
            padding: 6px 14px;
            border-radius: 20px;
            color: #475569;
            font-weight: 600;
            font-size: 13.5px;
          }
          .exam-finish-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .exam-finish-stats {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            border: 1px solid #e2e8f0;
          }
          .exam-finish-actions {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          /* LANDSCAPE MODE: FIT ON SCREEN CLEANLY WITHOUT SCROLL OR OVERFLOW */
          @media (orientation: landscape) and (max-height: 650px) {
            .exam-finish-top-bar {
              display: none !important;
            }
            .exam-finish-wrap {
              padding: 6px 12px !important;
              height: 100vh !important;
              min-height: 100vh !important;
              overflow: hidden !important;
            }
            .exam-finish-card {
              max-width: 650px !important;
              padding: 10px 16px !important;
              max-height: 96vh !important;
              border-radius: 12px !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
            }
            .exam-finish-header {
              margin-bottom: 6px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 10px !important;
              text-align: left !important;
            }
            .exam-finish-trophy {
              width: 32px !important;
              height: 32px !important;
              font-size: 18px !important;
              margin: 0 !important;
              flex-shrink: 0 !important;
            }
            .exam-finish-title {
              font-size: 15.5px !important;
              margin: 0 !important;
            }
            .exam-finish-badge {
              font-size: 11.5px !important;
              padding: 2px 8px !important;
            }
            .exam-finish-grid {
              flex-direction: row !important;
              align-items: stretch !important;
              gap: 12px !important;
            }
            .exam-finish-stats {
              flex: 1.25 !important;
              padding: 8px 12px !important;
              gap: 4px !important;
              margin-bottom: 0 !important;
            }
            .exam-finish-stats > div {
              padding-bottom: 3px !important;
              max-width: 100% !important;
            }
            .exam-finish-stats span {
              font-size: 12.5px !important;
            }
            .exam-finish-actions {
              flex: 1 !important;
              flex-direction: column !important;
              justify-content: center !important;
              gap: 8px !important;
            }
            .exam-finish-actions button {
              width: 100% !important;
              max-width: none !important;
              min-width: 0 !important;
              padding: 9px 12px !important;
              font-size: 13px !important;
            }
          }
        ` }} />

        <div className="exam-finish-top-bar">
          <span>Exam Summary</span>
        </div>

        <div className="exam-finish-wrap">
          <div className="exam-finish-card">
            <div className="exam-finish-header">
              <div className="exam-finish-trophy">
                🏆
              </div>
              <div>
                <h2 className="exam-finish-title">Congratulations, Exam Ended!</h2>
                <div className="exam-finish-badge">
                  <span style={{ color: "#0284c7" }}>👤 Name:</span> {studentName} &nbsp; | &nbsp; <span style={{ color: "#0284c7" }}>Exam:</span> {res.examName}
                </div>
              </div>
            </div>

            <div className="exam-finish-grid">
              <div className="exam-finish-stats">
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "260px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "6px" }}>
                  <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Total Questions</span>
                  <span style={{ color: "#0f172a", fontSize: "15px", fontWeight: "bold" }}>{res.total}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "260px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "6px" }}>
                  <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Total Attempted</span>
                  <span style={{ color: "#0f172a", fontSize: "15px", fontWeight: "bold" }}>{res.attempted}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "260px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "6px" }}>
                  <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Total Correct</span>
                  <span style={{ color: "#16a34a", fontSize: "17px", fontWeight: "900" }}>{res.score}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "260px", paddingTop: "4px" }}>
                  <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Your Percentage</span>
                  <span style={{ color: res.percentage >= 40 ? "#0284c7" : "#ef4444", fontSize: "17px", fontWeight: "900" }}>{res.percentage}%</span>
                </div>
              </div>

              <div className="exam-finish-actions">
                <button
                  type="button"
                  onClick={() => setInlineShowDetailed(true)}
                  style={{ flex: 1, minWidth: "160px", backgroundColor: "#0284c7", color: "white", border: "none", padding: "12px 18px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 6px rgba(2, 132, 199, 0.2)" }}
                >
                  VIEW REVIEW (1-40)
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/student")}
                  style={{ flex: 1, minWidth: "160px", backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "12px 18px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return <div style={{ padding: "50px", textAlign: "center" }}>Loading exam questions...</div>;

  const containerExamStyle = {
    width: "100vw",
    minHeight: "100dvh",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "rgba(241, 245, 249, 0.92)",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    padding: "12px",
    overflow: "hidden",
    position: "relative",
    backgroundImage: "none",
    ...protectedStyle
  };

  return (
    <div className="ubt-exam-wrapper" style={containerExamStyle} onContextMenu={(e) => e.preventDefault()}>
      <style dangerouslySetInnerHTML={{ __html: `
        .ubt-exam-wrapper {
          width: 100vw;
          min-height: 100dvh;
          height: 100vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 12px;
          overflow: hidden;
          position: relative;
        }
        .ubt-exam-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 1050px;
          width: 100%;
          height: 100%;
          margin: auto;
          justify-content: center;
          min-height: 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }
        .ubt-exam-card {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          border-top: none;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 550px;
          min-height: 550px;
        }
        .ubt-exam-columns {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .ubt-exam-left {
          flex: 1.2;
          padding: 20px 25px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          height: 100%;
        }
        .ubt-exam-right {
          flex: 1;
          padding: 20px 25px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 10px;
          overflow-y: auto;
          height: 100%;
        }
        .ubt-exam-header-bar {
          display: flex;
          background-color: #0284c7;
          color: white;
          padding: 14px 22px;
          border-radius: 16px 16px 0 0;
          justify-content: space-between;
          font-weight: bold;
          font-size: 15.5px;
          gap: 8px;
        }
        .ubt-exam-nav-bar {
          display: flex;
          padding: 14px 24px;
          background-color: #f8fafc;
          border-top: 1px solid #cbd5e1;
          border-radius: 0 0 16px 16px;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .ubt-exam-nav-bar button {
          background-color: #0ea5e9;
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 6px rgba(14, 165, 233, 0.35);
          transition: all 0.15s ease;
        }
        .ubt-exam-nav-bar button:active {
          transform: scale(0.97);
        }
        .ubt-overview-box {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          border-top: none;
          padding: 25px 30px;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          overflow-y: auto;
          max-height: 80vh;
        }
        .ubt-overview-flex {
          display: flex;
          justify-content: space-between;
          gap: 25px;
        }

        /* LANDSCAPE OPTIMIZED EXAM STYLING FOR ALL MOBILE & TABLET DEVICES */
        @media (orientation: landscape) and (max-height: 600px) {
          .ubt-exam-wrapper {
            padding: 4px 8px !important;
            height: 100vh !important;
            height: 100dvh !important;
            overflow: hidden !important;
          }
          .ubt-exam-main {
            height: 100% !important;
            max-width: 100% !important;
            justify-content: center !important;
            border-radius: 14px !important;
          }
          .ubt-exam-card {
            height: calc(100dvh - 8px) !important;
            min-height: 0 !important;
            max-height: calc(100dvh - 8px) !important;
            border-radius: 0 0 14px 14px !important;
          }
          .ubt-exam-columns {
            flex-direction: row !important;
            flex: 1 !important;
            overflow: hidden !important;
            min-height: 0 !important;
          }
          .ubt-exam-left {
            flex: 1.25 !important;
            padding: 8px 14px !important;
            border-right: 1.5px solid #e2e8f0 !important;
            border-bottom: none !important;
            max-height: none !important;
            overflow-y: auto !important;
            height: 100% !important;
          }
          .ubt-exam-left p {
            font-size: 15.5px !important;
            margin-bottom: 6px !important;
            line-height: 1.35 !important;
          }
          .ubt-exam-right {
            flex: 1 !important;
            padding: 8px 14px !important;
            overflow-y: auto !important;
            height: 100% !important;
            max-height: none !important;
            gap: 6px !important;
          }
          .ubt-exam-header-bar {
            padding: 7px 16px !important;
            font-size: 13px !important;
            border-radius: 14px 14px 0 0 !important;
          }
          .ubt-exam-nav-bar {
            padding: 7px 16px !important;
            border-radius: 0 0 14px 14px !important;
          }
          .ubt-exam-nav-bar button {
            padding: 9px 20px !important;
            font-size: 13.5px !important;
            font-weight: 800 !important;
            border-radius: 8px !important;
          }
          .ubt-overview-box {
            padding: 10px 14px !important;
            border-radius: 0 0 14px 14px !important;
            max-height: calc(100dvh - 45px) !important;
          }
          .ubt-overview-flex {
            flex-direction: row !important;
            gap: 12px !important;
          }
          .ubt-overview-flex button {
            padding: 6px 0 !important;
            font-size: 11.5px !important;
          }
        }

        /* FALLBACK FOR PORTRAIT MOBILE BEFORE ROTATION */
        @media (orientation: portrait) and (max-width: 768px) {
          .ubt-exam-wrapper {
            padding: 6px !important;
            height: 100dvh !important;
            overflow-y: auto !important;
          }
          .ubt-exam-main {
            height: 100% !important;
            justify-content: flex-start !important;
            border-radius: 14px !important;
          }
          .ubt-exam-header-bar {
            padding: 10px 14px !important;
            font-size: 13px !important;
            border-radius: 14px 14px 0 0 !important;
            flex-wrap: wrap !important;
          }
          .ubt-exam-card {
            height: auto !important;
            min-height: 0 !important;
            flex: 1 !important;
            max-height: calc(100dvh - 75px) !important;
            border-radius: 0 0 14px 14px !important;
          }
          .ubt-exam-columns {
            flex-direction: column !important;
            overflow-y: auto !important;
            flex: 1 !important;
          }
          .ubt-exam-left {
            flex: none !important;
            max-height: 42vh !important;
            border-right: none !important;
            border-bottom: 1.5px solid #cbd5e1 !important;
            padding: 12px 14px !important;
            height: auto !important;
          }
          .ubt-exam-left p {
            font-size: 17px !important;
          }
          .ubt-exam-right {
            flex: 1 !important;
            max-height: 46vh !important;
            padding: 12px 14px !important;
            height: auto !important;
          }
          .ubt-exam-nav-bar {
            padding: 10px 14px !important;
            border-radius: 0 0 14px 14px !important;
            gap: 8px !important;
          }
          .ubt-exam-nav-bar button {
            padding: 10px 18px !important;
            font-size: 13px !important;
            font-weight: 800 !important;
            border-radius: 8px !important;
          }
          .ubt-overview-box {
            padding: 16px 14px !important;
            border-radius: 0 0 14px 14px !important;
            max-height: calc(100dvh - 75px) !important;
          }
          .ubt-overview-flex {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .ubt-overview-flex > div:first-child {
            border-right: none !important;
            border-bottom: 1.5px solid #e2e8f0 !important;
            padding-right: 0 !important;
            padding-bottom: 16px !important;
          }
          .ubt-overview-flex > div:last-child {
            padding-left: 0 !important;
          }
        }
      ` }} />
      
      {showConfirmModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999999, padding: "16px", boxSizing: "border-box" }}>
          <div style={{ backgroundColor: "white", padding: "24px 20px", borderRadius: "12px", maxWidth: "420px", width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", boxSizing: "border-box" }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>Confirm Submission</h3>
            <p style={{ color: "#475569", fontSize: "14px", marginBottom: "20px", lineHeight: "1.4" }}>
              Are you sure you want to submit and end the exam?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{ backgroundColor: "transparent", color: "#0284c7", border: "none", fontWeight: "bold", fontSize: "13px", cursor: "pointer", padding: "8px 14px", borderRadius: "4px" }}
              >
                CANCEL
              </button>
              <button 
                type="button"
                onClick={handleFinalSubmit}
                style={{ backgroundColor: "#0284c7", color: "white", border: "none", fontWeight: "bold", fontSize: "13px", cursor: "pointer", padding: "8px 18px", borderRadius: "4px" }}
              >
                AGREE
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "overview" ? (
        <div className="ubt-exam-main" style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "850px", width: "100%", height: "100%", margin: "auto", justifyContent: "center", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)" }}>
          
          <div className="ubt-exam-header-bar" style={{ display: "flex", backgroundColor: "#0284c7", color: "white", padding: "14px 22px", borderRadius: "16px 16px 0 0", justifyContent: "space-between", fontWeight: "bold", fontSize: "15.5px" }}>
            <span>Remaining Questions: 40</span>
            <span>{exactExamName}</span>
            <span>Time Remaining: {formatTime(timeLeft)}</span>
          </div>

          <div className="ubt-overview-box" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #cbd5e1", borderTop: "none", padding: "25px 30px", borderRadius: "0 0 16px 16px", boxShadow: "0 4px 15px rgba(0,0,0,0.06)" }}>
            <div className="ubt-overview-flex" style={{ display: "flex", justifyContent: "space-between", gap: "25px" }}>
              
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
                        backgroundColor: selectedAnswers[q.id] !== undefined ? "#dcfce7" : "white",
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
                          backgroundColor: selectedAnswers[q.id] !== undefined ? "#dcfce7" : "white",
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

            <div style={{ marginTop: "25px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
              <button 
                type="button"
                onClick={() => setViewMode("single")}
                style={{ backgroundColor: "#64748b", color: "white", border: "none", padding: "12px 24px", fontSize: "15px", fontWeight: "800", borderRadius: "8px", cursor: "pointer", boxShadow: "0 2px 6px rgba(100, 116, 139, 0.35)" }}
              >
                ❮ BACK TO QUESTION
              </button>
              <button 
                type="button"
                onClick={() => setShowConfirmModal(true)}
                style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "12px 28px", fontSize: "15px", fontWeight: "800", borderRadius: "8px", cursor: "pointer", boxShadow: "0 2px 6px rgba(14, 165, 233, 0.35)" }}
              >
                SUBMIT AND FINISH EXAM ❯
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="ubt-exam-main" style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "1050px", width: "100%", height: "100%", margin: "auto", justifyContent: "center", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)" }}>
          
          {(() => {
            const currentQ = questions[currentQuestion];
            return (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                <div className="ubt-exam-header-bar" style={{ display: "flex", backgroundColor: "#0284c7", color: "white", padding: "14px 22px", borderRadius: "16px 16px 0 0", justifyContent: "space-between", fontWeight: "bold", fontSize: "15.5px" }}>
                  <span>Remaining Questions: 40</span>
                  <span>{exactExamName}</span>
                  <span>Time Remaining: {formatTime(timeLeft)}</span>
                </div>

                <div className="ubt-exam-card" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #cbd5e1", borderTop: "none", borderRadius: "0 0 16px 16px", boxShadow: "0 4px 15px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "550px", minHeight: "550px" }}>
                  <div className="ubt-exam-columns" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                    
                    <div className="ubt-exam-left" style={{ flex: 1.2, padding: "20px 25px", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflowY: "auto", height: "100%" }}>
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

                    <div className="ubt-exam-right" style={{ flex: 1, padding: "20px 25px", display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: "10px", overflowY: "auto", height: "100%" }}>
                      {(() => {
                        const rawOptions = currentQ.options || [];
                        const hasImageOptions = rawOptions.some(o => Boolean(typeof o === 'object' && o !== null && o.image));
                        const isBlindListening = !hasImageOptions && rawOptions.every(o => {
                          const t = typeof o === 'object' && o !== null ? (o.text || '').trim() : (o || '').toString().trim();
                          return !t || ['①', '②', '③', '④', '1', '2', '3', '4'].includes(t);
                        });

                        // ── CASE 1: BLIND LISTENING (Questions 29~32 & 33) ──
                        if (isBlindListening) {
                          return (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center", height: "100%", padding: "10px" }}>
                              <p style={{ color: "#475569", fontSize: "16px", margin: "0 0 10px 0", fontWeight: "600", textAlign: "center" }}>
                                🎧 다음을 듣고 알맞은 번호를 고르십시오. (Blind Listening)
                              </p>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                {rawOptions.map((option, index) => {
                                  const isSelected = selectedAnswers[currentQ.id] === index;
                                  const symbols = ['①', '②', '③', '④'];
                                  return (
                                    <button
                                      type="button"
                                      key={index}
                                      onClick={() => handleOptionSelect(index)}
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "24px 15px",
                                        borderRadius: "12px",
                                        border: isSelected ? "3px solid #0284c7" : "1.5px solid #cbd5e1",
                                        backgroundColor: isSelected ? "#e0f2fe" : "white",
                                        cursor: "pointer",
                                        boxShadow: isSelected ? "0 6px 16px rgba(2, 132, 199, 0.25)" : "0 2px 6px rgba(0,0,0,0.04)",
                                        transition: "all 0.15s ease"
                                      }}
                                    >
                                      <span style={{ fontSize: "40px", fontWeight: "bold", color: isSelected ? "#0284c7" : "#1e293b", lineHeight: 1 }}>
                                        {symbols[index]}
                                      </span>
                                      <span style={{ fontSize: "14px", color: isSelected ? "#0369a1" : "#64748b", marginTop: "8px", fontWeight: "600" }}>
                                        선택 {index + 1}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        // ── CASE 2: 4-PICTURE OPTIONS GRID (Questions 23~28, 34~36) ──
                        if (hasImageOptions) {
                          return (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "100%", padding: "5px 0" }}>
                              {rawOptions.map((option, index) => {
                                const isSelected = selectedAnswers[currentQ.id] === index;
                                const optText = typeof option === 'object' && option !== null ? option.text : option;
                                const optImg = typeof option === 'object' && option !== null ? option.image : null;
                                const symbols = ['①', '②', '③', '④'];

                                return (
                                  <div
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      padding: "10px",
                                      borderRadius: "8px",
                                      border: isSelected ? "2.5px solid #0284c7" : "1.5px solid #cbd5e1",
                                      backgroundColor: isSelected ? "#eff6ff" : "white",
                                      cursor: "pointer",
                                      boxShadow: isSelected ? "0 4px 10px rgba(2, 132, 199, 0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
                                      position: "relative"
                                    }}
                                  >
                                    <div style={{
                                      alignSelf: "flex-start",
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "50%",
                                      border: "2px solid #0284c7",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: "bold",
                                      fontSize: "15px",
                                      backgroundColor: isSelected ? "#0284c7" : "white",
                                      color: isSelected ? "white" : "#0284c7",
                                      marginBottom: "6px"
                                    }}>
                                      {index + 1}
                                    </div>
                                    {optImg && (
                                      <img
                                        src={optImg}
                                        alt={`Choice ${index + 1}`}
                                        style={{
                                          maxHeight: "110px",
                                          maxWidth: "100%",
                                          width: "auto",
                                          height: "auto",
                                          objectFit: "contain",
                                          borderRadius: "4px",
                                          pointerEvents: "none"
                                        }}
                                        draggable="false"
                                      />
                                    )}
                                    {optText && !['①', '②', '③', '④', '1', '2', '3', '4'].includes(optText.trim()) && (
                                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", marginTop: "6px", textAlign: "center" }}>
                                        {optText}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }

                        // ── CASE 3: STANDARD TEXT OPTIONS ──
                        return rawOptions.map((option, index) => {
                          const isSelected = selectedAnswers[currentQ.id] === index;
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
                                      border: "1px solid #cbd5e1"
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
                        });
                      })()}
                    </div>
                  </div>

                  <div className="ubt-exam-nav-bar" style={{ display: "flex", padding: "14px 24px", backgroundColor: "#f8fafc", borderTop: "1px solid #cbd5e1", borderRadius: "0 0 16px 16px", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
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
                      style={{ 
                        backgroundColor: "#0ea5e9", 
                        color: "white", 
                        border: "none", 
                        padding: "12px 26px", 
                        borderRadius: "8px", 
                        fontWeight: "800", 
                        cursor: currentQuestion === 0 ? "not-allowed" : "pointer", 
                        fontSize: "15px",
                        letterSpacing: "0.4px",
                        boxShadow: "0 2px 6px rgba(14, 165, 233, 0.35)",
                        minWidth: "125px"
                      }}
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
                      style={{ 
                        backgroundColor: "#0ea5e9", 
                        color: "white", 
                        border: "none", 
                        padding: "12px 28px", 
                        borderRadius: "8px", 
                        fontWeight: "800", 
                        cursor: "pointer", 
                        fontSize: "15px",
                        letterSpacing: "0.4px",
                        boxShadow: "0 2px 6px rgba(14, 165, 233, 0.35)",
                        minWidth: "170px"
                      }}
                    >
                      TOTAL QUESTIONS
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
                      style={{ 
                        backgroundColor: "#0ea5e9", 
                        color: "white", 
                        border: "none", 
                        padding: "12px 26px", 
                        borderRadius: "8px", 
                        fontWeight: "800", 
                        cursor: "pointer", 
                        fontSize: "15px",
                        letterSpacing: "0.4px",
                        boxShadow: "0 2px 6px rgba(14, 165, 233, 0.35)",
                        minWidth: "125px"
                      }}
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