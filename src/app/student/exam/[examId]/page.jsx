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

const UbtWatermark = ({ logoUrl = "", instituteName = "", opacity = 0.16 }) => {
  if (logoUrl) {
    return (
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        userSelect: "none",
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        maxWidth: "85%",
        maxHeight: "85%"
      }}>
        <img
          src={logoUrl}
          alt="Institute Logo Watermark"
          style={{
            maxHeight: "140px",
            maxWidth: "250px",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            filter: "grayscale(20%)"
          }}
          draggable="false"
        />
        {instituteName && (
          <span style={{
            fontSize: "13px",
            fontWeight: "800",
            color: "#0284c7",
            marginTop: "6px",
            textAlign: "center",
            letterSpacing: "0.5px"
          }}>
            {instituteName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
      userSelect: "none",
      opacity,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1
    }}>
      <svg width="240" height="150" viewBox="0 0 240 150" fill="none">
        <path d="M65 118 H175 A38 38 0 0 0 175 42 A48 48 0 0 0 82 50 A32 32 0 0 0 65 118 Z" fill="#38bdf8" fillOpacity="0.25" />
        <text x="120" y="55" textAnchor="middle" fill="#0284c7" fontSize="19" fontWeight="900" fontFamily="sans-serif">EPS</text>
        <text x="120" y="76" textAnchor="middle" fill="#0284c7" fontSize="19" fontWeight="900" fontFamily="sans-serif">TOPIK</text>
        <text x="120" y="98" textAnchor="middle" fill="#db2777" fontSize="14" fontWeight="800" fontFamily="sans-serif">Exam Korean</text>
        <text x="120" y="116" textAnchor="middle" fill="#0284c7" fontSize="15" fontWeight="800" fontFamily="sans-serif">UBT APP</text>
      </svg>
    </div>
  );
};

const StudentExam = () => {
  const router = useRouter();
  const params = useParams(); const examId = params?.examId;
  const [studentName, setStudentName] = useState("");
  const [logoWatermark, setLogoWatermark] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [playingOptionIndex, setPlayingOptionIndex] = useState(null);

  const [isStarted, setIsStarted] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(1);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [overviewTab, setOverviewTab] = useState("all"); // "all" | "solved" | "unsolved"

  const [viewMode, setViewMode] = useState("single"); 
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
      const u = localStorage.getItem("currentUser") || localStorage.getItem("currentStudentName") || "Student";
      setStudentName(u);
      const storedLogo = localStorage.getItem("currentInstituteLogo");
      if (storedLogo) setLogoWatermark(storedLogo);
      const storedInstName = localStorage.getItem("currentInstituteName");
      if (storedInstName) setInstituteName(storedInstName);

      const institutes = JSON.parse(localStorage.getItem("institutes") || "[]");
      if (institutes[0]?.logoUrl && !storedLogo) {
        setLogoWatermark(institutes[0].logoUrl);
      }
      if (institutes[0]?.name && !storedInstName) {
        setInstituteName(institutes[0].name);
      }

      // Automatically fetch /api/auth/me to get the authenticated student's institute logo and name
      fetch("/api/auth/me")
        .then(r => r.json())
        .then(d => {
          if (d?.user?.institute?.logoUrl) {
            setLogoWatermark(d.user.institute.logoUrl);
            localStorage.setItem("currentInstituteLogo", d.user.institute.logoUrl);
          }
          if (d?.user?.institute?.name) {
            setInstituteName(d.user.institute.name);
            localStorage.setItem("currentInstituteName", d.user.institute.name);
          }
          if (d?.user?.name || d?.user?.username) {
            setStudentName(d.user.name || d.user.username);
          }
        })
        .catch(() => {});
    } catch (e) {}
  }, []);

  // Lock landscape immediately on mount (including Downloading Questions); re-lock on any rotation attempt
  useEffect(() => {
    const lockLandscape = async () => {
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

    // Listen for any rotation attempt and immediately re-lock landscape
    window.addEventListener("orientationchange", lockLandscape);
    if (screen.orientation) {
      screen.orientation.addEventListener("change", lockLandscape);
    }

    // Initial lock
    lockLandscape();

    return () => {
      window.removeEventListener("orientationchange", lockLandscape);
      if (screen.orientation) {
        screen.orientation.removeEventListener("change", lockLandscape);
      }
    };
  }, []);

  // Step 1: Downloading Questions progress simulation and auto-entry
  useEffect(() => {
    if (isDownloaded) return;
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (questions.length === 0 && prev >= 85) {
          return 85;
        }
        const delta = Math.floor(Math.random() * 8) + 6;
        const nextVal = Math.min(100, prev + delta);
        if (nextVal >= 100) {
          clearInterval(interval);
        }
        return nextVal;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [questions.length, isDownloaded]);

  useEffect(() => {
    if (downloadProgress >= 100 && questions.length > 0 && !isDownloaded) {
      const timer = setTimeout(() => {
        setIsDownloaded(true);
        setIsStarted(true);
        enterFullScreen();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [downloadProgress, questions.length, isDownloaded]);

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
        const storedPhone = typeof window !== "undefined" ? (localStorage.getItem("currentStudentPhone") || localStorage.getItem("studentPhone") || "") : "";
        const res = await fetch(`/api/student/exams/${examId || "set-1-demo"}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentPhone: storedPhone })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            let finalQs = [...data.questions];
            if (finalQs.length < 40) {
              for (let i = finalQs.length + 1; i <= 40; i++) {
                finalQs.push({
                  id: `q_gen_${i}`,
                  qIndex: i,
                  type: i <= 20 ? "Reading" : "Listening",
                  mainHeading: i <= 20 ? `[ ${i} ] 다음을 읽고 알맞은 것을 고르십시오.` : `[ ${i} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,
                  questionHeading: "",
                  description: "",
                  image: "",
                  audio: "",
                  options: ["1", "2", "3", "4"],
                  answer: 0
                });
              }
            }
            setQuestions(finalQs);
            if (data.answerSheet) setAnswerSheet(data.answerSheet);
            setBackendSessionId(data.sessionId);
            if (data.examName) setExactExamName(data.examName);
            if (data.instituteLogoUrl) {
              setLogoWatermark(data.instituteLogoUrl);
              localStorage.setItem("currentInstituteLogo", data.instituteLogoUrl);
            } else if (data.watermark && (data.watermark.startsWith("http") || data.watermark.startsWith("/"))) {
              setLogoWatermark(data.watermark);
              localStorage.setItem("currentInstituteLogo", data.watermark);
            }
            if (data.instituteName) {
              setInstituteName(data.instituteName);
              localStorage.setItem("currentInstituteName", data.instituteName);
            }

            // DOWNLOAD & CACHE QUESTIONS + ANSWERSHEET FOR COMPLETE OFFLINE TAKE & REVIEW
            try {
              localStorage.setItem(`offline_ubt_exam_${examId || "set-1-demo"}`, JSON.stringify({
                questions: finalQs,
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
          // If backend denies access (e.g. 401 Unauthorized or 403 Forbidden because this is a paid set of Rs. 30)
          const errData = await res.json().catch(() => ({}));
          if (res.status === 401 || res.status === 403) {
            alert(errData.error || "This exam set requires payment of Rs. 30. Please unlock via eSewa to take this test.");
            router.push("/student");
            return;
          }
          console.warn("Backend start API status:", res.status, errData);
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

      // All UBT exams have free access for all students unconditionally
      const isExamSetFree = true;
      const hasPaidExam = true;

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

      const initialAnswerSheet = {};
      finalBatch.forEach(q => {
        if (q.answer !== undefined && q.answer !== null) {
          initialAnswerSheet[q.id] = Number(q.answer);
          if (q.qIndex !== undefined) initialAnswerSheet[q.qIndex] = Number(q.answer);
        }
      });
      setAnswerSheet(prev => ({ ...initialAnswerSheet, ...prev }));
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

  const enterFullScreen = () => {
    try {
      if (typeof document !== "undefined") {
        document.body.classList.add("pdf-open", "exam-fullscreen-active");
        document.documentElement.classList.add("pdf-open", "exam-fullscreen-active");
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          const el = document.documentElement;
          if (el.requestFullscreen) {
            el.requestFullscreen({ navigationUI: "hide" }).catch(() => {
              el.requestFullscreen().catch(() => {});
            });
          } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
          } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
          } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
          }
        }
      }
    } catch (e) {}

    // Synchronize native Android, iOS Capacitor, ReactNative, and Smartboard bridges to hide status bar
    if (typeof window !== "undefined") {
      try {
        window.Capacitor?.Plugins?.StatusBar?.hide?.().catch?.(() => {});
        window.Capacitor?.Plugins?.StatusBar?.setOverlaysWebView?.({ overlay: false }).catch?.(() => {});
        window.ReactNativeWebView?.postMessage?.(JSON.stringify({ type: "HIDE_STATUS_BAR", fullscreen: true }));
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "HIDE_STATUS_BAR", fullscreen: true }, "*");
        }
        const p = window.parent || window;
        const bridges = [
          window.AndroidApp, window.SmartboardApp, window.SmartBoardApp, window.SmartBoard, window.smartboard, window.BoardApp, window.boardApp, window.Android, window.android,
          p.AndroidApp, p.SmartboardApp, p.SmartBoardApp, p.SmartBoard, p.smartboard, p.BoardApp, p.boardApp, p.Android, p.android
        ];
        for (const b of bridges) {
          if (!b) continue;
          if (typeof b.hideStatusBar === "function") b.hideStatusBar();
          if (typeof b.hideNavigationBar === "function") b.hideNavigationBar();
          if (typeof b.setStatusBarVisible === "function") b.setStatusBarVisible(false);
          if (typeof b.setNavigationBarVisible === "function") b.setNavigationBarVisible(false);
          if (typeof b.hideSystemUI === "function") b.hideSystemUI();
          if (typeof b.setSystemUIVisible === "function") b.setSystemUIVisible(false);
          if (typeof b.setImmersiveFullscreen === "function") b.setImmersiveFullscreen(true);
          if (typeof b.setSwipeRefreshEnabled === "function") b.setSwipeRefreshEnabled(false);
          if (typeof b.setPdfOpen === "function") b.setPdfOpen(true);
        }
      } catch (err) {}
    }
  };

  // Default to full-screen & hide mobile status bar as soon as UBT exam opens
  useEffect(() => {
    enterFullScreen();
    const handleGesture = () => {
      enterFullScreen();
    };
    // Use capture phase with valid user-activation events (click, touchend, pointerup) so fullscreen triggers reliably
    window.addEventListener("click", handleGesture, true);
    window.addEventListener("touchend", handleGesture, { capture: true, passive: true });
    window.addEventListener("pointerup", handleGesture, { capture: true, passive: true });
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        enterFullScreen();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("click", handleGesture, true);
      window.removeEventListener("touchend", handleGesture, true);
      window.removeEventListener("pointerup", handleGesture, true);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const toggleFullScreen = () => {
    try {
      if (typeof document !== "undefined" && (document.fullscreenElement || document.webkitFullscreenElement)) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else {
        enterFullScreen();
      }
    } catch (e) {}
  };

  const handleGetStarted = async () => {
    // Keep this full screen so mobile status bar and navigation do not overlay
    enterFullScreen();

    // Auto-lock orientation to landscape on student device
    if (typeof window !== "undefined") {
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
    }
    setCurrentQuestion(0);
    setViewMode("single");
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
        const rawCorrect = answerSheet[q.id] ?? answerSheet[String(q.id)] ?? answerSheet[q.qIndex] ?? answerSheet[String(q.qIndex)] ?? answerSheet[idx + 1] ?? q.answer;
        const correctAns = rawCorrect !== undefined && rawCorrect !== null ? Number(rawCorrect) : 0;
        return {
          ...q,
          answer: correctAns
        };
      });

      let score = 0;
      let readingCorrect = 0;
      let listeningCorrect = 0;
      let attemptedCount = 0;
      const formattedSelectedAnswers = {};

      enrichedQuestions.forEach((q, index) => {
        const qIdKey = q.id !== undefined ? q.id : (index + 1);
        const qNum = q.qIndex !== undefined ? q.qIndex : (index + 1);

        const userSelectedAnswer = selectedAnswers[q.id] !== undefined 
          ? selectedAnswers[q.id] 
          : (selectedAnswers[String(q.id)] !== undefined
            ? selectedAnswers[String(q.id)]
            : (selectedAnswers[qNum] !== undefined
              ? selectedAnswers[qNum]
              : (selectedAnswers[String(qNum)] !== undefined
                ? selectedAnswers[String(qNum)]
                : selectedAnswers[index])));
        
        if (userSelectedAnswer !== undefined && userSelectedAnswer !== null && userSelectedAnswer !== "") {
          const numAns = Number(userSelectedAnswer);
          formattedSelectedAnswers[qIdKey] = numAns;
          formattedSelectedAnswers[String(qIdKey)] = numAns;
          formattedSelectedAnswers[qNum] = numAns;
          formattedSelectedAnswers[String(qNum)] = numAns;
          formattedSelectedAnswers[index] = numAns;
          
          attemptedCount += 1; 

          const qAns = q.answer !== undefined && q.answer !== null ? Number(q.answer) : undefined;
          let isCorrect = false;
          if (qAns !== undefined) {
            // Accommodate 0-indexed (0=Opt1, 1=Opt2...) and 1-indexed (1=Opt1, 2=Opt2...) matches
            if (numAns === qAns || numAns + 1 === qAns) {
              isCorrect = true;
            }
          }

          if (isCorrect) {
            score += 1; 
            const isReading = (q.type && q.type.toLowerCase() === "reading") || qNum <= 20 || index < 20;
            if (isReading) {
              readingCorrect += 1;
            } else {
              listeningCorrect += 1;
            }
          }
        }
      });

      const totalQ = enrichedQuestions.length > 0 ? enrichedQuestions.length : 40;
      const readingScore = readingCorrect * 5;
      const listeningScore = listeningCorrect * 5;
      const totalScore = readingScore + listeningScore;
      const percentage = Math.round((score / totalQ) * 100);
      const passed = percentage >= 40 || totalScore >= 96;

      const curStudentName = typeof window !== 'undefined' ? (localStorage.getItem("currentStudentName") || localStorage.getItem("currentUser") || "Student") : "Student";
      const curStudentPhone = typeof window !== 'undefined' ? (localStorage.getItem("currentStudentPhone") || localStorage.getItem("studentPhone") || "") : "";

      const examResultData = { 
        examName: exactExamName,
        score, 
        total: totalQ, 
        attempted: attemptedCount,
        readingCorrect,
        listeningCorrect,
        readingScore,
        listeningScore,
        totalScore,
        percentage,
        passed,
        questions: enrichedQuestions,
        selectedAnswers: formattedSelectedAnswers,
        isOfflineSubmitted: false,
        studentName: curStudentName,
        createdAt: new Date().toISOString()
      };

      // Attempt submit to backend with 4.5s timeout, falling back smoothly to offline queue
      let onlineSubmitted = false;
      if (typeof navigator !== "undefined" && navigator.onLine) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4500);
          const submitRes = await fetch(`/api/student/exams/${examId || "set-1-demo"}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: backendSessionId || `offline_${Date.now()}`,
              selectedAnswers: formattedSelectedAnswers,
              studentName: curStudentName,
              studentPhone: curStudentPhone
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
              examResultData.readingScore = resObj.readingScore ?? readingScore;
              examResultData.listeningScore = resObj.listeningScore ?? listeningScore;
              examResultData.totalScore = resObj.totalScore ?? totalScore;
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
            readingScore,
            listeningScore,
            totalScore,
            studentName: curStudentName,
            studentPhone: curStudentPhone,
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

  const UBT_EXAM_CSS = `
    .ubt-exam-wrapper {
      width: 100%;
      height: 100%;
      max-height: 100%;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      overflow: hidden;
      position: fixed;
      inset: 0;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2147483640;
      background-color: #f8fafc;
    }
    .student-bottom-nav,
    .institute-bottom-nav,
    .navbar-bottom-nav,
    .student-header,
    .institute-top-nav,
    nav {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    .ubt-exam-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: 100%;
      width: 100%;
      height: 100%;
      max-height: 100%;
      margin: 0;
      justify-content: stretch;
      min-height: 0;
      border-radius: 0;
      overflow: hidden;
      box-shadow: none;
    }
    .ubt-exam-header-bar,
    .ubt-overview-top-bar {
      display: flex !important;
      align-items: center !important;
      background-color: #f8fafc !important;
      color: #334155 !important;
      border-bottom: 1px solid #cbd5e1 !important;
      padding-top: calc(env(safe-area-inset-top, 0px) + 6px) !important;
      padding-bottom: 6px !important;
      padding-left: calc(env(safe-area-inset-left, 0px) + 14px) !important;
      padding-right: calc(env(safe-area-inset-right, 0px) + 14px) !important;
      font-size: 13.5px !important;
      font-weight: 600 !important;
      flex-shrink: 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    :fullscreen .ubt-exam-header-bar,
    :-webkit-full-screen .ubt-exam-header-bar,
    :fullscreen .ubt-overview-top-bar,
    :-webkit-full-screen .ubt-overview-top-bar {
      padding-top: calc(env(safe-area-inset-top, 0px) + 6px) !important;
      padding-bottom: 6px !important;
      padding-left: calc(env(safe-area-inset-left, 0px) + 14px) !important;
      padding-right: calc(env(safe-area-inset-right, 0px) + 14px) !important;
    }
    .ubt-exam-card {
      background-color: #f8fafc !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      flex: 1 !important;
      min-height: 0 !important;
      overflow: hidden !important;
      padding: 8px 12px !important;
      gap: 8px !important;
    }
    .ubt-exam-columns {
      display: flex !important;
      flex: 1 !important;
      overflow: hidden !important;
      min-height: 0 !important;
      gap: 10px !important;
    }
    .ubt-exam-left {
      flex: 1.25 !important;
      background-color: #ffffff !important;
      border: 1.5px solid #cbd5e1 !important;
      border-radius: 12px !important;
      padding: 14px 18px !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      overflow-y: auto !important;
      height: 100% !important;
      min-height: 0 !important;
    }
    .ubt-exam-right {
      flex: 1 !important;
      background-color: #ffffff !important;
      border: 1.5px solid #cbd5e1 !important;
      border-radius: 12px !important;
      padding: 0 !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-evenly !important;
      overflow-y: auto !important;
      height: 100% !important;
      min-height: 0 !important;
    }
    .ubt-opt-row {
      display: flex !important;
      align-items: center !important;
      padding: 10px 18px !important;
      border-bottom: 1px solid #e2e8f0 !important;
      background-color: transparent !important;
      cursor: pointer !important;
      transition: background-color 0.15s ease !important;
      flex: 1 !important;
    }
    .ubt-opt-row:last-child {
      border-bottom: none !important;
    }
    .ubt-opt-selected {
      background-color: #dbeafe !important;
      box-shadow: inset 4px 0 0 #0284c7 !important;
    }
    .ubt-opt-badge {
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      border: 2px solid #94a3b8 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      color: #334155 !important;
      margin-right: 14px !important;
      flex-shrink: 0 !important;
      background-color: #ffffff !important;
      transition: all 0.15s ease !important;
    }
    .ubt-opt-selected .ubt-opt-badge,
    .ubt-opt-badge-selected {
      border-color: #0284c7 !important;
      background-color: #0284c7 !important;
      color: #ffffff !important;
    }
    .ubt-opt-text {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #1e293b !important;
      flex: 1 !important;
    }
    .ubt-opt-selected .ubt-opt-text {
      color: #0369a1 !important;
      font-weight: 700 !important;
    }
    .ubt-exam-nav-bar {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 4px 6px !important;
      flex-shrink: 0 !important;
      gap: 12px !important;
    }
    .ubt-exam-nav-bar button {
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.35) !important;
      transition: all 0.15s ease !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      border: none !important;
      border-radius: 9999px !important;
      padding: 9px 24px !important;
      cursor: pointer !important;
    }
    .ubt-exam-nav-bar button:disabled {
      opacity: 0.45 !important;
      cursor: not-allowed !important;
      box-shadow: none !important;
      transform: none !important;
    }

    /* FORCE LANDSCAPE: rotate entire exam when device is held in portrait */
    @media (orientation: portrait) {
      .ubt-exam-landscape-enforcer {
        position: fixed !important;
        top: 0 !important;
        left: 100vw !important;
        left: 100dvw !important;
        width: 100vh !important;
        width: 100dvh !important;
        height: 100vw !important;
        height: 100dvw !important;
        transform: rotate(90deg) !important;
        transform-origin: top left !important;
        overflow: hidden !important;
        z-index: 2147483640 !important;
        background-color: #f8fafc !important;
      }
    }
    @media (orientation: landscape) {
      .ubt-exam-landscape-enforcer {
        position: fixed !important;
        inset: 0 !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        z-index: 2147483640 !important;
        background-color: #f8fafc !important;
      }
    }

    /* Responsive Confirm Submission Modal */
    .ubt-confirm-modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background-color: rgba(15, 23, 42, 0.72) !important;
      backdrop-filter: blur(3px) !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      z-index: 99999999 !important;
      padding: 12px !important;
      box-sizing: border-box !important;
    }
    .ubt-confirm-modal-card {
      background-color: #ffffff !important;
      padding: 24px 22px !important;
      border-radius: 18px !important;
      max-width: min(420px, 94vw) !important;
      width: 100% !important;
      max-height: 92dvh !important;
      overflow-y: auto !important;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
      box-sizing: border-box !important;
      text-align: center !important;
    }
    .ubt-confirm-modal-icon {
      width: 44px !important;
      height: 44px !important;
      border-radius: 50% !important;
      background-color: #e0f2fe !important;
      color: #0284c7 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 auto 10px auto !important;
    }
    .ubt-confirm-modal-title {
      margin: 0 0 6px 0 !important;
      color: #0f172a !important;
      font-size: 18px !important;
      font-weight: 800 !important;
    }
    .ubt-confirm-modal-text {
      color: #475569 !important;
      font-size: 13.5px !important;
      margin: 0 0 18px 0 !important;
      line-height: 1.45 !important;
    }
    .ubt-confirm-modal-actions {
      display: flex !important;
      justify-content: center !important;
      gap: 10px !important;
    }
    .ubt-confirm-btn-cancel {
      flex: 1 !important;
      background-color: #f1f5f9 !important;
      color: #475569 !important;
      border: 1px solid #cbd5e1 !important;
      padding: 10px 14px !important;
      border-radius: 8px !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
    }
    .ubt-confirm-btn-submit {
      flex: 1 !important;
      background-color: #0284c7 !important;
      color: #ffffff !important;
      border: none !important;
      padding: 10px 16px !important;
      border-radius: 8px !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      cursor: pointer !important;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35) !important;
      transition: all 0.15s ease !important;
    }
  `;

  if (!isStarted || !isDownloaded || questions.length === 0) {
    return (
      <div 
        className="ubt-exam-landscape-enforcer"
        onClick={enterFullScreen}
        onTouchStart={enterFullScreen}
        onContextMenu={(e) => e.preventDefault()}
      >
        <style dangerouslySetInnerHTML={{ __html: UBT_EXAM_CSS }} />
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          boxSizing: "border-box",
          ...protectedStyle
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "#334155", fontSize: "22px", fontWeight: "400", letterSpacing: "0.2px" }}>
            <span>Downloading Questions {downloadProgress} %</span>
            <svg className="ubt-download-spinner" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
              <style>{`
                @keyframes ubt-spinner-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .ubt-download-spinner { animation: ubt-spinner-spin 1s steps(8, end) infinite; }
              `}</style>
              <line x1="12" y1="2" x2="12" y2="6" stroke="#94a3b8" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="#475569" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" stroke="#cbd5e1" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" stroke="#334155" />
              <line x1="2" y1="12" x2="6" y2="12" stroke="#e2e8f0" />
              <line x1="18" y1="12" x2="22" y2="12" stroke="#1e293b" />
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" stroke="#64748b" />
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" stroke="#cbd5e1" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const containerExamStyle = {
    width: "100%",
    height: "100%",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    padding: "0",
    overflow: "hidden",
    position: "relative",
    backgroundImage: "none",
    ...protectedStyle
  };

  return (
    <div className="ubt-exam-landscape-enforcer">
    <div className="ubt-exam-wrapper" style={containerExamStyle} onContextMenu={(e) => e.preventDefault()}>
      <style dangerouslySetInnerHTML={{ __html: UBT_EXAM_CSS }} />
      
      {showConfirmModal && (
        <div className="ubt-confirm-modal-overlay">
          <div className="ubt-confirm-modal-card">
            <div className="ubt-confirm-modal-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h3 className="ubt-confirm-modal-title">Confirm Submission</h3>
            <p className="ubt-confirm-modal-text">
              Are you sure you want to submit and complete the exam? Your final score and answer breakdown will be calculated.
            </p>
            <div className="ubt-confirm-modal-actions">
              <button 
                type="button"
                className="ubt-confirm-btn-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                CONTINUE TEST
              </button>
              <button 
                type="button"
                className="ubt-confirm-btn-submit"
                onClick={handleFinalSubmit}
              >
                YES, SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "overview" ? (
        <div className="ubt-exam-main" style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "100%", width: "100%", height: "100%", margin: "0", justifyContent: "stretch", borderRadius: "0", overflow: "hidden" }}>
          
          {/* STEP 3: WHOLE QUESTIONS OVERVIEW TOP BAR (Screenshot 3) */}
          <div className="ubt-overview-top-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1", flexShrink: 0, boxSizing: "border-box", width: "100%" }}>
            
            {/* Left: User Icon & Exam Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#475569">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>{exactExamName || "New UBT - 127"}</span>
            </div>

            {/* Center: Category / Filter Tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#475569", fontSize: "13.5px", fontWeight: "600", padding: "4px 10px" }}>Nepal</span>
              <button
                type="button"
                onClick={() => setOverviewTab("all")}
                style={{
                  backgroundColor: overviewTab === "all" ? "#0284c7" : "transparent",
                  color: overviewTab === "all" ? "#ffffff" : "#475569",
                  border: "none",
                  borderRadius: "8px",
                  padding: "5px 14px",
                  fontWeight: "700",
                  fontSize: "13.5px",
                  cursor: "pointer"
                }}
              >
                Whole Questions
              </button>
              <button
                type="button"
                onClick={() => setOverviewTab("solved")}
                style={{
                  backgroundColor: overviewTab === "solved" ? "#0284c7" : "transparent",
                  color: overviewTab === "solved" ? "#ffffff" : "#475569",
                  border: "none",
                  borderRadius: "8px",
                  padding: "5px 14px",
                  fontWeight: "700",
                  fontSize: "13.5px",
                  cursor: "pointer"
                }}
              >
                Solved Questions
              </button>
              <button
                type="button"
                onClick={() => setOverviewTab("unsolved")}
                style={{
                  backgroundColor: overviewTab === "unsolved" ? "#0284c7" : "transparent",
                  color: overviewTab === "unsolved" ? "#ffffff" : "#475569",
                  border: "none",
                  borderRadius: "8px",
                  padding: "5px 14px",
                  fontWeight: "700",
                  fontSize: "13.5px",
                  cursor: "pointer"
                }}
              >
                Unsolved Questions
              </button>
            </div>

            {/* Right: Timer & Student ID */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontWeight: "800", fontSize: "14.5px", color: "#0f172a" }}>{formatTime(timeLeft)}</span>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{studentName || "jdf jdf"}</span>
              <button
                type="button"
                onClick={toggleFullScreen}
                title="Toggle Fullscreen"
                style={{
                  background: "transparent",
                  border: "1px solid #cbd5e1",
                  color: "#64748b",
                  borderRadius: "6px",
                  padding: "2px 6px",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                ⛶
              </button>
            </div>
          </div>

          {/* MAIN 2-PANEL QUESTION OVERVIEW (Reading 1-20 & Listening 21-40) */}
          <div style={{ display: "flex", flex: 1, minHeight: 0, gap: "12px", padding: "10px 14px", backgroundColor: "#f8fafc", boxSizing: "border-box", overflow: "hidden" }}>
            
            {/* Reading Questions (1 - 20) */}
            <div style={{ flex: 1, backgroundColor: "#ffffff", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "10px 14px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
              <UbtWatermark logoUrl={logoWatermark} instituteName={instituteName} opacity={0.15} />
              <h3 style={{ textAlign: "center", margin: "0 0 8px 0", fontSize: "15px", fontWeight: "700", color: "#334155", flexShrink: 0, zIndex: 2 }}>
                Reading Questions
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "repeat(4, 1fr)", gap: "8px", flex: 1, minHeight: 0, zIndex: 2 }}>
                {questions.slice(0, 20).map((q, idx) => {
                  const isCurrent = currentQuestion === idx;
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  let opacity = 1;
                  if (overviewTab === "solved" && !isAnswered) opacity = 0.28;
                  if (overviewTab === "unsolved" && isAnswered) opacity = 0.28;

                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => { setCurrentQuestion(idx); setViewMode("single"); }}
                      style={{
                        height: "100%",
                        minHeight: "34px",
                        borderRadius: "10px",
                        border: isCurrent ? "2px solid #0284c7" : "1px solid #cbd5e1",
                        backgroundColor: isCurrent ? "#0284c7" : (isAnswered ? "#e0f2fe" : "#ffffff"),
                        color: isCurrent ? "#ffffff" : (isAnswered ? "#0369a1" : "#1e293b"),
                        fontSize: "14px",
                        fontWeight: "700",
                        cursor: "pointer",
                        opacity,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Listening Questions (21 - 40) */}
            <div style={{ flex: 1, backgroundColor: "#ffffff", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "10px 14px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
              <UbtWatermark logoUrl={logoWatermark} instituteName={instituteName} opacity={0.15} />
              <h3 style={{ textAlign: "center", margin: "0 0 8px 0", fontSize: "15px", fontWeight: "700", color: "#334155", flexShrink: 0, zIndex: 2 }}>
                Listening Questions
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "repeat(4, 1fr)", gap: "8px", flex: 1, minHeight: 0, zIndex: 2 }}>
                {questions.slice(20, 40).map((q, idx) => {
                  const actualIdx = idx + 20;
                  const isCurrent = currentQuestion === actualIdx;
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  let opacity = 1;
                  if (overviewTab === "solved" && !isAnswered) opacity = 0.28;
                  if (overviewTab === "unsolved" && isAnswered) opacity = 0.28;

                  return (
                    <button
                      key={q.id || actualIdx}
                      type="button"
                      onClick={() => { setCurrentQuestion(actualIdx); setViewMode("single"); }}
                      style={{
                        height: "100%",
                        minHeight: "34px",
                        borderRadius: "10px",
                        border: isCurrent ? "2px solid #0284c7" : "1px solid #cbd5e1",
                        backgroundColor: isCurrent ? "#0284c7" : (isAnswered ? "#e0f2fe" : "#ffffff"),
                        color: isCurrent ? "#ffffff" : (isAnswered ? "#0369a1" : "#1e293b"),
                        fontSize: "14px",
                        fontWeight: "700",
                        cursor: "pointer",
                        opacity,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {actualIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* BOTTOM BAR: BACK & SUBMIT AND FINISH EXAM (Screenshot 3) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 18px", backgroundColor: "#f8fafc", borderTop: "1px solid #cbd5e1", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setViewMode("single")}
              style={{
                backgroundColor: "#64748b",
                color: "#ffffff",
                borderRadius: "9999px",
                border: "none",
                padding: "8px 22px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              ❮ Back to Question
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              style={{
                backgroundColor: "#0284c7",
                color: "#ffffff",
                borderRadius: "9999px",
                border: "none",
                padding: "8px 26px",
                fontWeight: "800",
                fontSize: "13.5px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(2, 132, 199, 0.35)"
              }}
            >
              Submit And Finish Exam
            </button>
          </div>

        </div>
      ) : (
        <div className="ubt-exam-main" style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "100%", width: "100%", height: "100%", margin: "0", justifyContent: "stretch", borderRadius: "0", overflow: "hidden" }}>
          
          {(() => {
            const currentQ = questions[currentQuestion];
            if (!currentQ) return null;
            const rawOptions = currentQ.options || [];

            return (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                
                {/* STEP 2: TOP HEADER STRIP (Screenshot 2 & 4) */}
                <div className="ubt-exam-header-bar" style={{ display: "flex", alignItems: "center", backgroundColor: "#f8fafc", color: "#334155", borderBottom: "1px solid #cbd5e1", fontSize: "13.5px", fontWeight: "600", flexShrink: 0, width: "100%", boxSizing: "border-box" }}>
                  <div style={{ padding: "0 16px 0 4px", borderRight: "1px solid #cbd5e1", whiteSpace: "nowrap" }}>
                    <span>{exactExamName || "New UBT - 127"}</span>
                  </div>
                  <div style={{ padding: "0 16px", borderRight: "1px solid #cbd5e1", whiteSpace: "nowrap" }}>
                    <span>Whole Question:40</span>
                  </div>
                  <div style={{ padding: "0 16px", borderRight: "1px solid #cbd5e1", whiteSpace: "nowrap" }}>
                    <span>Remaining Question:{unsolvedCount}</span>
                  </div>
                  <div style={{ padding: "0 16px", fontWeight: "800", color: "#0f172a", whiteSpace: "nowrap" }}>
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{studentName || ""}</span>
                    <button
                      type="button"
                      onClick={toggleFullScreen}
                      title="Toggle Fullscreen"
                      style={{
                        background: "transparent",
                        border: "1px solid #cbd5e1",
                        color: "#64748b",
                        borderRadius: "6px",
                        padding: "2px 6px",
                        fontSize: "11px",
                        cursor: "pointer"
                      }}
                    >
                      ⛶
                    </button>
                  </div>
                </div>

                {/* 2-COLUMN QUESTION AREA (Screenshot 2 & 4) */}
                <div className="ubt-exam-card" style={{ backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, minHeight: 0, overflow: "hidden", padding: "8px 12px", gap: "8px" }}>
                  <div className="ubt-exam-columns" style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0, gap: "10px" }}>
                    
                    {/* LEFT CARD: QUESTION PROMPT, EXCLAMATION BADGE, AUDIO PLAY / VISUAL, WATERMARK */}
                    <div className="ubt-exam-left" style={{ flex: 1.25, backgroundColor: "#ffffff", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "14px 18px", position: "relative", display: "flex", flexDirection: "column", overflowY: "auto", height: "100%", minHeight: 0 }}>
                      


                      {/* Header Question Range Prompt */}
                      <p style={{ margin: "0 0 4px 0", fontSize: "16.5px", fontWeight: "700", color: "#1e293b", lineHeight: "1.35", paddingRight: "30px" }}>
                        {currentQ.mainHeading || (currentQuestion < 20 ? "[ 1~4 ] 다음 그림을 보고 맞은 단어나 문장을 고르십시오." : "[ 21~22 ] 들은 것을 고르십시오.")}
                      </p>
                      
                      {/* Question Number */}
                      <p style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                        {currentQuestion + 1}.
                      </p>

                      {/* Center Content: Watermark + Audio Play Button / Image / Passage */}
                      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", width: "100%" }}>
                        <UbtWatermark logoUrl={logoWatermark} instituteName={instituteName} opacity={0.20} />

                        {/* Text Passage (if any) */}
                        {currentQ.description && (
                          <div
                            className="ubt-exam-desc"
                            style={{
                              border: "1.5px solid #cbd5e1",
                              borderRadius: "8px",
                              padding: "10px 14px",
                              backgroundColor: "#ffffff",
                              color: "#1e293b",
                              fontSize: "16px",
                              fontWeight: "600",
                              lineHeight: "1.4",
                              whiteSpace: "pre-wrap",
                              maxHeight: "160px",
                              overflowY: "auto",
                              width: "92%",
                              zIndex: 2,
                              marginBottom: "8px"
                            }}
                            dangerouslySetInnerHTML={{ __html: currentQ.description }}
                          />
                        )}

                        {/* Image Visual (Reading Question) */}
                        {currentQ.image && (
                          <div style={{ zIndex: 2, textAlign: "center", maxWidth: "90%", maxHeight: "155px" }}>
                            <img
                              src={currentQ.image}
                              alt={`Question ${currentQuestion + 1}`}
                              style={{
                                maxHeight: "145px",
                                maxWidth: "100%",
                                objectFit: "contain",
                                borderRadius: "6px"
                              }}
                            />
                          </div>
                        )}

                        {/* Audio Play Button: Display ONLY when question actually has audio */}
                        {Boolean(currentQ.audio && currentQ.audio.trim()) && (
                          <div style={{ zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (audioRef.current && currentQ.audio) {
                                  if (isPlayingAnyAudio) {
                                    audioRef.current.pause();
                                    setIsPlayingAnyAudio(false);
                                  } else {
                                    audioRef.current.play().catch(e => console.log("Audio play notice:", e));
                                  }
                                }
                              }}
                              style={{
                                width: "54px",
                                height: "54px",
                                borderRadius: "50%",
                                backgroundColor: "#0284c7",
                                color: "#ffffff",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 14px rgba(2, 132, 199, 0.4)",
                                transition: "transform 0.15s ease"
                              }}
                            >
                              {isPlayingAnyAudio ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                                  <rect x="6" y="4" width="4" height="16" rx="1" />
                                  <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                              ) : (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" style={{ marginLeft: "3px" }}>
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                              )}
                            </button>
                            <audio
                              ref={audioRef}
                              src={currentQ.audio}
                              onPlay={handleAudioPlay}
                              onEnded={handleAudioEnded}
                              style={{ display: "none" }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Bottom Copyright Notice */}
                      <div style={{ textAlign: "center", fontSize: "10.5px", color: "#94a3b8", marginTop: "auto", flexShrink: 0, paddingTop: "4px" }}>
                        © Protected content. Copying or sharing is prohibited.
                      </div>
                    </div>

                    {/* RIGHT CARD: OPTIONS LIST WITH CIRCULAR BADGES & SUBTLE DIVIDERS */}
                    <div className="ubt-exam-right" style={{ flex: 1, backgroundColor: "#ffffff", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: 0, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-evenly", overflowY: "auto", height: "100%", minHeight: 0 }}>
                      <UbtWatermark logoUrl={logoWatermark} instituteName={instituteName} opacity={0.16} />

                      {rawOptions.map((option, index) => {
                        const isSelected = selectedAnswers[currentQ.id] === index;
                        const optText = typeof option === 'object' && option !== null ? option.text : option;
                        const optImg = typeof option === 'object' && option !== null ? option.image : null;
                        const optAud = typeof option === 'object' && option !== null ? option.audio : (currentQ.optionAudios?.[index] || null);
                        const hasOptAudio = Boolean(optAud && String(optAud).trim());

                        return (
                          <div
                            key={index}
                            className={`ubt-opt-row ${isSelected ? "ubt-opt-selected" : ""}`}
                            onClick={() => handleOptionSelect(index)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              flex: 1,
                              padding: "10px 18px",
                              borderBottom: index < rawOptions.length - 1 ? "1px solid #e2e8f0" : "none",
                              backgroundColor: isSelected ? "#dbeafe" : "transparent",
                              cursor: "pointer",
                              zIndex: 2,
                              transition: "background-color 0.15s ease"
                            }}
                          >
                            <div
                              className={`ubt-opt-badge ${isSelected ? "ubt-opt-badge-selected" : ""}`}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                border: `1.5px solid ${isSelected ? "#0284c7" : "#38bdf8"}`,
                                backgroundColor: isSelected ? "#0284c7" : "#ffffff",
                                color: isSelected ? "#ffffff" : "#0284c7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "700",
                                fontSize: "14px",
                                marginRight: "14px",
                                flexShrink: 0,
                                transition: "all 0.15s ease"
                              }}
                            >
                              {index + 1}
                            </div>
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
                              {optImg && (
                                <img
                                  src={optImg}
                                  alt={`Option ${index + 1}`}
                                  style={{ maxHeight: "65px", maxWidth: "120px", objectFit: "contain", borderRadius: "4px" }}
                                />
                              )}
                              <span
                                style={{
                                  fontSize: "17px",
                                  fontWeight: isSelected ? "700" : "500",
                                  color: isSelected ? "#0284c7" : "#1e293b",
                                  lineHeight: 1.3
                                }}
                                dangerouslySetInnerHTML={{ __html: optText }}
                              />
                            </div>
                            {/* Option Audio Play Button: Display ONLY when this option actually has audio */}
                            {hasOptAudio && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const audEl = optionAudioRefs.current[index];
                                  if (audEl) {
                                    if (playingOptionIndex === index) {
                                      audEl.pause();
                                      setPlayingOptionIndex(null);
                                    } else {
                                      if (audioRef.current) audioRef.current.pause();
                                      Object.values(optionAudioRefs.current).forEach(a => a && a.pause());
                                      audEl.currentTime = 0;
                                      audEl.play().then(() => setPlayingOptionIndex(index)).catch(err => console.log("Opt audio error:", err));
                                    }
                                  }
                                }}
                                style={{
                                  backgroundColor: playingOptionIndex === index ? "#ef4444" : "#0284c7",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "28px",
                                  height: "28px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  marginLeft: "auto",
                                  flexShrink: 0,
                                  boxShadow: "0 2px 4px rgba(2, 132, 199, 0.25)"
                                }}
                                title="Play option audio"
                              >
                                {playingOptionIndex === index ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                  </svg>
                                ) : (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff" style={{ marginLeft: "1.5px" }}>
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                )}
                              </button>
                            )}
                            {hasOptAudio && (
                              <audio
                                ref={el => optionAudioRefs.current[index] = el}
                                src={optAud}
                                onEnded={() => setPlayingOptionIndex(null)}
                                style={{ display: "none" }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* BOTTOM NAVIGATION: < PREV | ▦ WHOLE QUESTIONS | NEXT > (Screenshot 2 & 4) */}
                  <div className="ubt-exam-nav-bar" style={{ display: "flex", padding: "7px 18px", backgroundColor: "#f8fafc", borderTop: "1px solid #cbd5e1", justifyContent: "space-between", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <button
                      type="button"
                      disabled={currentQuestion === 0}
                      onClick={() => {
                        if (audioRef.current) audioRef.current.pause();
                        setIsPlayingAnyAudio(false);
                        setCurrentQuestion(prev => Math.max(0, prev - 1));
                      }}
                      style={{
                        backgroundColor: "#0284c7",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "9999px",
                        padding: "7px 22px",
                        fontWeight: "800",
                        fontSize: "13.5px",
                        cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
                        opacity: currentQuestion === 0 ? 0.45 : 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)"
                      }}
                    >
                      ❮ PREV
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) audioRef.current.pause();
                        setIsPlayingAnyAudio(false);
                        setViewMode("overview");
                      }}
                      style={{
                        backgroundColor: "#0284c7",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "9999px",
                        padding: "7px 26px",
                        fontWeight: "800",
                        fontSize: "13.5px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)"
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                      WHOLE QUESTIONS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) audioRef.current.pause();
                        setIsPlayingAnyAudio(false);
                        if (currentQuestion < questions.length - 1) {
                          setCurrentQuestion(prev => prev + 1);
                        } else {
                          setShowConfirmModal(true);
                        }
                      }}
                      style={{
                        backgroundColor: "#0284c7",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "9999px",
                        padding: "7px 22px",
                        fontWeight: "800",
                        fontSize: "13.5px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)"
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
    </div>
  );
};

export default StudentExam;
