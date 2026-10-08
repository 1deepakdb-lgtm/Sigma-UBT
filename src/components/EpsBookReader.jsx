'use client';

import React, { useState, useEffect, useRef } from "react";
import {
  loadEps60Chapters,
  saveEps60Chapters,
  fetchServerEpsChapters,
  syncChapterToServer
} from "@/lib/epsBookData";

// In-memory thumbnail cache across renders
const pdfCoverMemoryCache = new Map();

/**
 * ChapterCover Component
 * Renders the uploaded chapter PDF's first page preview (or custom cover photo, or styled Korean textbook fallback)
 */
function ChapterCover({
  chapter,
  titleKo,
  titleNe,
  pdfUrl,
  coverImage,
  bookPart = 1,
  height = "195px",
  margin = "10px 0 12px 0",
  onClick
}) {
  const chStr = chapter < 10 ? `0${chapter}` : `${chapter}`;
  const defaultStaticCover = `/uploads/eps-chapters/covers/cover_${chStr}.jpg`;
  const initialThumb = coverImage || defaultStaticCover;

  const [thumbUrl, setThumbUrl] = useState(initialThumb);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (coverImage) {
      setThumbUrl(coverImage);
    } else {
      setThumbUrl(`/uploads/eps-chapters/covers/cover_${chStr}.jpg`);
    }
  }, [coverImage, chStr]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Open Chapter ${chapter}: ${titleKo}`}
      style={{
        margin: margin,
        height: height,
        backgroundColor: bookPart === 2 ? "#fffbeb" : "#f0f9ff",
        borderRadius: "10px",
        border: isHovered ? "1.5px solid #0284c7" : "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: isHovered ? "0 8px 20px rgba(2, 132, 199, 0.16)" : "0 2px 6px rgba(0,0,0,0.03)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-2px)" : "none",
        userSelect: "none"
      }}
    >
      {/* 1. RENDERED FIRST PAGE THUMBNAIL (INSTANT IMAGE) - FULL BOX */}
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={`Chapter ${chapter} Cover`}
          loading="eager"
          decoding="async"
          onError={() => setThumbUrl(null)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
            transition: "transform 0.25s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)"
          }}
        />
      ) : (
        /* 2. ELEGANT TEXTBOOK BOOK COVER PLACEHOLDER (FULL BOX) */
        <div style={{
          width: "100%",
          height: "100%",
          background: bookPart === 2
            ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
            : "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "16px 14px",
          boxSizing: "border-box",
          position: "relative",
          textAlign: "center"
        }}>
          {/* Book Spine Line */}
          <div style={{
            position: "absolute",
            left: "10px",
            top: 0,
            bottom: 0,
            width: "3px",
            backgroundColor: bookPart === 2 ? "#d97706" : "#2563eb",
            opacity: 0.35
          }} />

          <div style={{ paddingLeft: "8px" }}>
            <div style={{
              fontSize: "10px",
              fontWeight: "900",
              color: bookPart === 2 ? "#b45309" : "#1d4ed8",
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              EPS-TOPIK
            </div>
            <div style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: "#334155",
              marginTop: "2px"
            }}>
              Book {chapter <= 30 ? "1" : "2"}
            </div>
          </div>

          <div style={{ padding: "0 10px" }}>
            <span style={{ fontSize: "28px", display: "block", marginBottom: "4px" }}>📖</span>
            <div style={{
              fontSize: "14px",
              fontWeight: "800",
              color: "#0f172a",
              lineHeight: "1.3",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical"
            }}>
              {titleKo}
            </div>
          </div>

          <div style={{ paddingLeft: "8px" }}>
            <span style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: bookPart === 2 ? "#92400e" : "#1e40af",
              backgroundColor: "rgba(255,255,255,0.7)",
              padding: "3px 10px",
              borderRadius: "12px",
              display: "inline-block"
            }}>
              제 {chapter} 과
            </span>
          </div>
        </div>
      )}

      {/* HOVER OVERLAY */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(1px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        color: "white",
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.15s ease",
        zIndex: 3
      }}>
        <div style={{
          backgroundColor: "#0284c7",
          color: "white",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          ▶
        </div>
        <span style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.3px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
          Full Screen मा हेर्नुहोस्
        </span>
      </div>
    </div>
  );
}

export default function EpsBookReader({ mode = "student", initialChapter = 1 }) {
  const isInstitute = mode === "institute";
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null); // When set, enters Full-Screen View!
  const [bookFilter, setBookFilter] = useState("all"); // "all", "book1", "book2"
  const [searchQuery, setSearchQuery] = useState("");

  // Full Screen Audio Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showTrackDropdown, setShowTrackDropdown] = useState(false);
  const [showBottomDropdown, setShowBottomDropdown] = useState(false);

  // Floating Popup Player State (Draggable, Minimizable, Removable)
  const [popupPos, setPopupPos] = useState({ x: 20, y: 20 });
  const [popupMode, setPopupMode] = useState("full"); // "full" = format in image, "mini" = play button only, "hidden" = completely closed
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 20, initialY: 20, moved: false });
  const popupContainerRef = useRef(null);

  // Admin/Institute Upload & Edit Modal State
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadModalChapter, setUploadModalChapter] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [newTrackName, setNewTrackName] = useState("");
  const [newTrackUrl, setNewTrackUrl] = useState("");

  // Admin Chapter Title Edit State
  const [editTitleKo, setEditTitleKo] = useState("");
  const [editTitleNe, setEditTitleNe] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSavingChapterInfo, setIsSavingChapterInfo] = useState(false);

  const openUploadModal = (chapter) => {
    if (!chapter) return;
    setUploadModalChapter(chapter);
    setEditTitleKo(chapter.titleKo || "");
    setEditTitleNe(chapter.titleNe || "");
    setEditNotes(chapter.notes || "");
  };

  const audioRef = useRef(null);
  const pdfInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // 1. Immediate local cache load for responsive UI
    const data = loadEps60Chapters();
    setChapters(data);

    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role") || "";
      const isAuth = !isInstitute && mode !== "student" && (mode === "admin" || storedRole === "admin");
      setIsAdmin(isAuth);
    }

    // 2. Fetch fresh persistent chapters from server so student, institute & admin are synchronized
    fetchServerEpsChapters().then((serverChapters) => {
      if (serverChapters && Array.isArray(serverChapters) && serverChapters.length > 0) {
        setChapters(serverChapters);
        setSelectedChapter((prev) => {
          if (!prev) return prev;
          const fresh = serverChapters.find((c) => c.chapter === prev.chapter);
          return fresh || prev;
        });
      }
    });
  }, [mode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideTop = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!insideTop) {
        setShowTrackDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeTrack = selectedChapter?.audioTracks?.[currentTrackIndex] || null;

  // Drag & Drop Handler (Works smoothly anywhere on screen for mouse & touch)
  const handleDragStart = (e) => {
    // Only drag with left mouse button or touch
    if (e.type === "mousedown" && e.button !== 0) return;

    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: popupPos.x,
      initialY: popupPos.y,
      moved: false,
    };
    setIsDragging(true);

    const onMove = (moveEvt) => {
      const curX = moveEvt.type === "touchmove" ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const curY = moveEvt.type === "touchmove" ? moveEvt.touches[0].clientY : moveEvt.clientY;
      const dx = curX - dragRef.current.startX;
      const dy = curY - dragRef.current.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }

      const elemWidth = popupContainerRef.current?.offsetWidth || 360;
      const elemHeight = popupContainerRef.current?.offsetHeight || 60;
      const winW = typeof window !== "undefined" ? window.innerWidth : 1000;
      const winH = typeof window !== "undefined" ? window.innerHeight : 800;

      const maxX = Math.max(0, winW - elemWidth);
      const maxY = Math.max(0, winH - elemHeight);

      const nextX = Math.max(8, Math.min(maxX - 8, dragRef.current.initialX + dx));
      const nextY = Math.max(8, Math.min(maxY - 8, dragRef.current.initialY + dy));

      setPopupPos({ x: nextX, y: nextY });
    };

    const onEnd = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  // Clean PDF URL without browser toolbar, page count or buttons - fit maximum screen
  const getCleanPdfUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.includes("drive.google.com")) {
      return trimmed;
    }
    const base = trimmed.split("#")[0];
    return `${base}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&pagemode=none&view=FitH&zoom=page-width`;
  };

  // Open Full-Screen View for a Chapter (Auto Browser Full Screen Mode)
  const openChapterFullScreen = (chapter) => {
    setSelectedChapter(chapter);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowTrackDropdown(false);
    setPopupMode("full");

    // Automatically trigger browser full screen mode
    if (typeof document !== "undefined" && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.warn("Auto fullscreen trigger:", err);
      });
    }
  };

  // Close Full-Screen View and return to Chapter Grid
  const closeFullScreen = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => { });
    }
    setSelectedChapter(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setShowTrackDropdown(false);
  };

  // Playable audio URL (handles direct URL or TTS fallback)
  const getPlayableAudioUrl = (track) => {
    if (!track) return "";
    if (track.url && track.url.trim()) {
      return track.url.trim();
    }
    // High-quality Korean voice synthesis fallback
    if (track.textKo && track.textKo.trim()) {
      return `/api/tts?text=${encodeURIComponent(track.textKo.trim())}&lang=ko&voice=female`;
    }
    return "";
  };

  // Track auto-play trigger when track changes while playing
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn("Track change play error:", err);
      });
    }
  }, [currentTrackIndex]);

  // Direct Track Selection with Instant Auto-Play
  const handleSelectTrack = (idx) => {
    setCurrentTrackIndex(idx);
    setShowTrackDropdown(false);
    setIsPlaying(true);
    setCurrentTime(0);

    // Fast attempt & metadata fallback
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn("Auto-play trigger:", err);
        });
      }
    }, 60);
  };

  // Play / Pause toggle with 100% reliable hardware synchronization
  const togglePlayPause = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio play issue:", err);
      });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Speed change
  const cyclePlaybackRate = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const rates = [1.0, 1.25, 1.5, 0.75];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Seek forward or backward by seconds
  const seekBy = (secs) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration || 0, audioRef.current.currentTime + secs));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Time format helper
  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Filter chapters for list view
  const filteredChapters = chapters.filter((c) => {
    if (bookFilter === "book1" && c.chapter > 30) return false;
    if (bookFilter === "book2" && c.chapter <= 30) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = c.chapter.toString() === q || `ch ${c.chapter}` === q || `chapter ${c.chapter}` === q;
      const matchKo = c.titleKo?.toLowerCase().includes(q);
      const matchNe = c.titleNe?.toLowerCase().includes(q);
      const matchEn = c.titleEn?.toLowerCase().includes(q);
      return matchNum || matchKo || matchNe || matchEn;
    }
    return true;
  });

  // ========== DIRECT EDIT & UPLOAD HANDLERS (ADMIN/INSTITUTE) ==========

  // Save Chapter Title, Nepali Meaning, and Study Notes
  const handleSaveChapterInfo = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!uploadModalChapter) return;

    if (!editTitleKo.trim()) {
      alert("⚠️ कृपया कोरियन शीर्षक (Korean Title) खाली नराख्नुहोस्।");
      return;
    }

    const chapterNum = uploadModalChapter.chapter;
    setIsSavingChapterInfo(true);

    try {
      const serverUpdated = await syncChapterToServer(chapterNum, {
        titleKo: editTitleKo.trim(),
        titleNe: editTitleNe.trim(),
        notes: editNotes.trim()
      });

      const updatedFields = {
        titleKo: editTitleKo.trim(),
        titleNe: editTitleNe.trim(),
        notes: editNotes.trim()
      };

      if (serverUpdated) {
        setChapters(serverUpdated);
      } else {
        const localUpdated = chapters.map((c) =>
          c.chapter === chapterNum ? { ...c, ...updatedFields } : c
        );
        setChapters(localUpdated);
        saveEps60Chapters(localUpdated);
      }

      setUploadModalChapter((prev) => (prev ? { ...prev, ...updatedFields } : prev));
      setSelectedChapter((prev) => (prev?.chapter === chapterNum ? { ...prev, ...updatedFields } : prev));

      alert(`✅ Chapter ${chapterNum} को नाम सफलतापूर्वक सेभ गरियो!\n• कोरियन: ${editTitleKo.trim()}\n• नेपाली: ${editTitleNe.trim()}`);
    } catch (err) {
      alert("⚠️ च्याप्टर नाम सेभ गर्दा त्रुटि भयो: " + err.message);
    } finally {
      setIsSavingChapterInfo(false);
    }
  };

  // Direct PDF File Upload
  const handleUploadPdfFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadModalChapter) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("⚠️ कृपया केवल PDF (.pdf) फाइल छान्नुहोस्।");
      return;
    }

    const chapterNum = uploadModalChapter.chapter;
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "x-user-role": "admin"
        }
      });
      const result = await res.json();

      if (result.success && result.url) {
        // Sync with persistent server storage so all students & institutes see it immediately
        const serverUpdated = await syncChapterToServer(chapterNum, { pdfUrl: result.url });

        if (serverUpdated) {
          setChapters(serverUpdated);
        } else {
          const localUpdated = chapters.map((c) => {
            if (c.chapter === chapterNum) {
              return { ...c, pdfUrl: result.url };
            }
            return c;
          });
          setChapters(localUpdated);
          saveEps60Chapters(localUpdated);
        }

        // Update modal & current selected chapter if open
        setUploadModalChapter((prev) => ({ ...prev, pdfUrl: result.url }));
        setSelectedChapter((prev) => {
          if (prev?.chapter === chapterNum) {
            return { ...prev, pdfUrl: result.url };
          }
          return prev;
        });

        alert(`✅ Chapter ${chapterNum} को PDF फाइल सफलतापूर्वक अपलोड भयो र सबै विद्यार्थी तथा इन्स्टिच्युटहरूका लागि सर्भरमा सुरक्षित भयो!`);
      } else {
        alert(`⚠️ Upload failed: ${result.message || result.error || "Unknown error"}`);
      }
    } catch (err) {
      alert("⚠️ अपलोड गर्दा त्रुटि भयो: " + err.message);
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  // Direct Multiple Audio Files Upload
  const handleUploadAudioFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !uploadModalChapter) return;

    const chapterNum = uploadModalChapter.chapter;
    setUploadingAudio(true);
    try {
      const newTracks = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            "x-user-role": "admin"
          }
        });
        const result = await res.json();

        if (result.success && result.url) {
          const rawName = file.name.replace(/\.[^/.]+$/, "");
          const cleanName = rawName.replace(/^[0-9_-]+/, "").replace(/_/g, " ").trim();
          newTracks.push({
            id: `ch${chapterNum}-t${Date.now()}-${i}`,
            name: `Track ${(uploadModalChapter.audioTracks?.length || 0) + i + 1}: ${cleanName || "Listening Audio"}`,
            url: result.url,
            textKo: ""
          });
        }
      }

      if (newTracks.length > 0) {
        const currentTracks = uploadModalChapter.audioTracks || [];
        const combined = [...currentTracks, ...newTracks];

        // Sync with persistent server storage so all students & institutes get it
        const serverUpdated = await syncChapterToServer(chapterNum, { audioTracks: combined });

        if (serverUpdated) {
          setChapters(serverUpdated);
        } else {
          const localUpdated = chapters.map((c) => {
            if (c.chapter === chapterNum) {
              return { ...c, audioTracks: combined };
            }
            return c;
          });
          setChapters(localUpdated);
          saveEps60Chapters(localUpdated);
        }

        setUploadModalChapter((prev) => ({ ...prev, audioTracks: combined }));
        setSelectedChapter((prev) => {
          if (prev?.chapter === chapterNum) {
            return { ...prev, audioTracks: combined };
          }
          return prev;
        });

        alert(`✅ Chapter ${chapterNum} मा ${newTracks.length} वटा अडियो ट्र्याकहरू सर्भरमा सुरक्षित गरियो! अब विद्यार्थी र इन्स्टिच्युटहरूले तुरुन्त सुन्न सक्नेछन्।`);
      }
    } catch (err) {
      alert("⚠️ अडियो फाइल अपलोड त्रुटि: " + err.message);
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  // Remove audio track from chapter
  const handleRemoveAudioTrack = async (trackIndex) => {
    if (!uploadModalChapter) return;
    const chapterNum = uploadModalChapter.chapter;
    const filtered = uploadModalChapter.audioTracks.filter((_, i) => i !== trackIndex);

    // Sync with persistent server storage
    const serverUpdated = await syncChapterToServer(chapterNum, { audioTracks: filtered });

    if (serverUpdated) {
      setChapters(serverUpdated);
    } else {
      const localUpdated = chapters.map((c) => {
        if (c.chapter === chapterNum) {
          return { ...c, audioTracks: filtered };
        }
        return c;
      });
      setChapters(localUpdated);
      saveEps60Chapters(localUpdated);
    }

    setUploadModalChapter((prev) => ({ ...prev, audioTracks: filtered }));
    setSelectedChapter((prev) => {
      if (prev?.chapter === chapterNum) {
        return { ...prev, audioTracks: filtered };
      }
      return prev;
    });
  };

  // Direct Cover Image File Upload (Admin/Institute)
  const handleUploadCoverFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadModalChapter) return;

    if (!file.type.startsWith("image/")) {
      alert("⚠️ कृपया फोटो फाइल (JPG, PNG, WebP) छान्नुहोस्।");
      return;
    }

    const chapterNum = uploadModalChapter.chapter;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: { "x-user-role": "admin" }
      });
      const result = await res.json();

      if (result.success && result.url) {
        const serverUpdated = await syncChapterToServer(chapterNum, { coverImage: result.url });
        if (serverUpdated) {
          setChapters(serverUpdated);
        } else {
          const localUpdated = chapters.map((c) =>
            c.chapter === chapterNum ? { ...c, coverImage: result.url } : c
          );
          setChapters(localUpdated);
          saveEps60Chapters(localUpdated);
        }

        setUploadModalChapter((prev) => ({ ...prev, coverImage: result.url }));
        setSelectedChapter((prev) => (prev?.chapter === chapterNum ? { ...prev, coverImage: result.url } : prev));
        alert(`✅ Chapter ${chapterNum} को कभर फोटो सफलतापूर्वक सेभ गरियो!`);
      } else {
        alert(`⚠️ Upload failed: ${result.message || result.error || "Unknown error"}`);
      }
    } catch (err) {
      alert("⚠️ कभर फोटो अपलोड गर्दा त्रुटि: " + err.message);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Remove Cover Image (Reset to PDF 1st Page preview or default)
  const handleRemoveCoverImage = async () => {
    if (!uploadModalChapter) return;
    const chapterNum = uploadModalChapter.chapter;

    const serverUpdated = await syncChapterToServer(chapterNum, { coverImage: "" });
    if (serverUpdated) {
      setChapters(serverUpdated);
    } else {
      const localUpdated = chapters.map((c) =>
        c.chapter === chapterNum ? { ...c, coverImage: "" } : c
      );
      setChapters(localUpdated);
      saveEps60Chapters(localUpdated);
    }

    setUploadModalChapter((prev) => ({ ...prev, coverImage: "" }));
    setSelectedChapter((prev) => (prev?.chapter === chapterNum ? { ...prev, coverImage: "" } : prev));
  };

  // =========================================================================
  // 1. FULL-SCREEN WIPED DISPLAY VIEW (CLEAN, NO MENUS, DROPDOWN LISTENING)
  // =========================================================================
  if (selectedChapter) {
    const hasAudio = selectedChapter.audioTracks && selectedChapter.audioTracks.length > 0;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#ffffff",
          zIndex: 99999,
          overflow: "hidden",
          fontFamily: "Arial, sans-serif"
        }}
      >
        {/* ================= 1. DRAGGABLE FLOATING POPUP AUDIO PLAYER (FULL FORMAT) ================= */}
        {popupMode === "full" && (
          <div
            ref={popupContainerRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{
              position: "fixed",
              left: `${popupPos.x}px`,
              top: `${popupPos.y}px`,
              zIndex: 100005,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#ffffff",
              border: "2px solid #2563eb",
              borderRadius: "16px",
              padding: "8px 14px",
              boxShadow: "0 10px 35px rgba(0, 0, 0, 0.2), 0 2px 10px rgba(37, 99, 235, 0.25)",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              maxWidth: "calc(100vw - 20px)",
              boxSizing: "border-box"
            }}
          >
            {/* DRAG HANDLE */}
            <div
              title="Drag to move anywhere on screen"
              style={{
                cursor: isDragging ? "grabbing" : "grab",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px 2px",
                fontSize: "14px",
                userSelect: "none",
                flexShrink: 0
              }}
            >
              ⠿
            </div>

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeFullScreen();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              title="Return to Chapter List"
              style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                color: "#ffffff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 2px 8px rgba(29, 78, 216, 0.35)",
                flexShrink: 0
              }}
            >
              <span>⬅</span> Back
            </button>

            {/* CHAPTER TITLE & CRISP BADGE */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: 0,
                maxWidth: "260px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    whiteSpace: "nowrap"
                  }}
                >
                  Ch {selectedChapter.chapter}
                </span>
                <span
                  style={{
                    fontWeight: "800",
                    fontSize: "14px",
                    color: "#0f172a",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {selectedChapter.titleKo}
                </span>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#1d4ed8",
                  fontWeight: "600",
                  marginTop: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {selectedChapter.titleNe}
              </div>
            </div>

            {/* AUDIO CONTROLS (PILL WITH PLAY + DROPDOWN, SEEKBAR, TIME, SPEED) */}
            {hasAudio && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
                {/* UPPER: BLUE PILL (PLAY/PAUSE + TRACK DROPDOWN) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                    color: "#ffffff",
                    border: "1.5px solid #93c5fd",
                    borderRadius: "24px",
                    padding: "3px 8px 3px 4px",
                    boxShadow: "0 2px 10px rgba(29, 78, 216, 0.3)"
                  }}
                >
                  {/* PLAY / PAUSE BUTTON */}
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title={isPlaying ? "Click to Pause Audio" : "Click to Play Audio"}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      color: "#1d4ed8",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: isPlaying ? "12px" : "14px",
                      fontWeight: "900",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                      flexShrink: 0,
                      transition: "transform 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    {isPlaying ? "❚❚" : "▶"}
                  </button>

                  {/* TRACK DROPDOWN */}
                  <div style={{ position: "relative" }} ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTrackDropdown(!showTrackDropdown);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      title="Select Audio Track"
                      style={{
                        background: "rgba(255, 255, 255, 0.15)",
                        color: "#ffffff",
                        border: "1px solid rgba(255, 255, 255, 0.35)",
                        borderRadius: "16px",
                        padding: "4px 9px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      <span style={{ fontSize: "12px" }}>🎧</span>
                      <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {activeTrack?.name || `Track ${currentTrackIndex + 1}`}
                      </span>
                      <span style={{ fontSize: "9px", color: "#bfdbfe" }}>{showTrackDropdown ? "▲" : "▼"}</span>
                    </button>

                    {/* DROPDOWN MENU */}
                    {showTrackDropdown && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: "34px",
                          right: 0,
                          width: "280px",
                          backgroundColor: "#ffffff",
                          border: "2px solid #2563eb",
                          borderRadius: "12px",
                          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                          zIndex: 100010,
                          overflow: "hidden"
                        }}
                      >
                        <div style={{
                          padding: "8px 12px",
                          background: "#eff6ff",
                          borderBottom: "1px solid #bfdbfe",
                          fontSize: "11px",
                          fontWeight: "bold",
                          color: "#1d4ed8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}>
                          <span>🎧 Chapter {selectedChapter.chapter} Tracks:</span>
                          <span style={{ fontSize: "10px", color: "#2563eb" }}>Auto-play on click</span>
                        </div>
                        <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                          {selectedChapter.audioTracks.map((track, idx) => {
                            const isCurrent = idx === currentTrackIndex;
                            return (
                              <div
                                key={track.id || idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectTrack(idx);
                                }}
                                style={{
                                  padding: "8px 10px",
                                  background: isCurrent ? "#dbeafe" : "transparent",
                                  color: isCurrent ? "#1d4ed8" : "#1e293b",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #f1f5f9",
                                  borderLeft: isCurrent ? "3px solid #1d4ed8" : "3px solid transparent",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  fontWeight: isCurrent ? "700" : "500"
                                }}
                              >
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
                                  {isCurrent ? "▶ " : "🎵 "}{track.name}
                                </span>
                                <span style={{
                                  fontSize: "10px",
                                  padding: "2px 5px",
                                  borderRadius: "4px",
                                  background: isCurrent ? "#1d4ed8" : "#f1f5f9",
                                  color: isCurrent ? "#ffffff" : "#64748b",
                                  fontWeight: "bold"
                                }}>
                                  {isCurrent ? "Playing" : `Track ${idx + 1}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* LOWER: SEEKBAR + TIME + SKIP BUTTONS + SPEED */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = Number(e.target.value);
                      setCurrentTime(newTime);
                      if (audioRef.current) audioRef.current.currentTime = newTime;
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      width: "80px",
                      cursor: "pointer",
                      accentColor: "#2563eb",
                      height: "4px"
                    }}
                  />
                  <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace", minWidth: "30px", fontWeight: "600" }}>
                    {formatTime(currentTime)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      seekBy(-5);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title="Rewind 5s"
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "10px",
                      padding: "2px 5px",
                      color: "#475569",
                      fontWeight: "bold"
                    }}
                  >
                    ⏪
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      seekBy(5);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title="Forward 5s"
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "10px",
                      padding: "2px 5px",
                      color: "#475569",
                      fontWeight: "bold"
                    }}
                  >
                    ⏩
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cyclePlaybackRate(e);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title="Playback Speed"
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      border: "1px solid #bfdbfe",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    {playbackRate}x
                  </button>
                </div>
              </div>
            )}

            {/* ADMIN / INSTITUTE UPLOAD BUTTON */}
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openUploadModal(selectedChapter);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                title="Upload Chapter Audio / PDF"
                style={{
                  backgroundColor: "#f59e0b",
                  color: "#0f172a",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0
                }}
              >
                📤 Upload
              </button>
            )}

            {/* WINDOW ACTIONS: MINIMIZE TO PLAY BUTTON ONLY & CLOSE/REMOVE */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0, marginLeft: "4px" }}>
              {/* MINIMIZE TO FLOATING PLAY BUTTON ONLY ("play button matra rakhnus") */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupMode("mini");
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                title="Minimize to Play Button Only"
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ─
              </button>

              {/* REMOVE / CLOSE ("any if dont want remove hune gari") */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupMode("hidden");
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                title="Close / Remove Player from Screen"
                style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ================= 2. MINI FLOATING PLAY BUTTON MODE ("PLAY BUTTON MATRA RAKHNUS", DRAGGABLE ANYWHERE) ================= */}
        {popupMode === "mini" && (
          <div
            ref={popupContainerRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{
              position: "fixed",
              left: `${popupPos.x}px`,
              top: `${popupPos.y}px`,
              zIndex: 100005,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
              color: "#ffffff",
              border: "2px solid #93c5fd",
              borderRadius: "32px",
              padding: "4px 8px 4px 6px",
              boxShadow: "0 8px 25px rgba(29, 78, 216, 0.45), 0 2px 8px rgba(0, 0, 0, 0.2)",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none"
            }}
          >
            {/* DRAG HANDLE */}
            <span
              title="Drag anywhere"
              style={{
                cursor: isDragging ? "grabbing" : "grab",
                color: "#bfdbfe",
                fontSize: "12px",
                paddingRight: "2px"
              }}
            >
              ⠿
            </span>

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeFullScreen();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              title="Exit to Chapters"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                borderRadius: "14px",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              ⬅
            </button>

            {/* PURE PLAY / PAUSE BUTTON */}
            {hasAudio && (
              <button
                type="button"
                onClick={togglePlayPause}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                title={isPlaying ? "Click to Pause Audio" : "Click to Play Audio"}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  color: "#1d4ed8",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: isPlaying ? "13px" : "15px",
                  fontWeight: "900",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                  flexShrink: 0
                }}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>
            )}

            {/* EXPAND BUTTON TO RESTORE FULL FORMAT */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPopupMode("full");
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              title="Expand Full Player"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                borderRadius: "14px",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <span>⛶</span> Full
            </button>

            {/* REMOVE / CLOSE BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPopupMode("hidden");
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              title="Remove Player from Screen"
              style={{
                background: "rgba(239, 68, 68, 0.8)",
                color: "#ffffff",
                border: "none",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                fontSize: "10px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ================= 3. HIDDEN MODE ("ANY IF DONT WANT REMOVE HUNE GARI") ================= */}
        {popupMode === "hidden" && (
          <>
            {/* Discrete Back button at top-left so user is never trapped */}
            <button
              type="button"
              onClick={closeFullScreen}
              title="Return to Chapter List"
              style={{
                position: "fixed",
                top: "14px",
                left: "14px",
                zIndex: 100005,
                background: "rgba(15, 23, 42, 0.85)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(8px)",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)"
              }}
            >
              ⬅ Back
            </button>

            {/* Discrete Restore button at top-right */}
            <button
              type="button"
              onClick={() => setPopupMode("full")}
              title="Show Audio Player"
              style={{
                position: "fixed",
                top: "14px",
                right: "14px",
                zIndex: 100005,
                background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                color: "#ffffff",
                border: "1px solid #93c5fd",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 14px rgba(29, 78, 216, 0.35)"
              }}
            >
              <span>🎧</span> Show Player
            </button>
          </>
        )}

        {/* ================= 4. PURE 100% FULL BROWSER PDF VIEW (NO BROWSER TOOLBAR, MAXIMUM FULLSCREEN FIT) ================= */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#ffffff",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          zIndex: 1
        }}>
          {selectedChapter.pdfUrl ? (
            <iframe
              src={getCleanPdfUrl(selectedChapter.pdfUrl)}
              title={`EPS Book Chapter ${selectedChapter.chapter}`}
              style={{
                width: "100vw",
                height: "100vh",
                border: "none",
                margin: 0,
                padding: 0,
                display: "block",
                backgroundColor: "#ffffff",
                outline: "none"
              }}
            />
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
              color: "#0f172a",
              backgroundColor: "#ffffff",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "56px", marginBottom: "16px" }}>📖</span>
              <h2 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "22px" }}>
                Chapter {selectedChapter.chapter}: {selectedChapter.titleKo}
              </h2>
              <p style={{ margin: "0 0 20px 0", color: "#475569", fontSize: "15px", maxWidth: "500px" }}>
                {selectedChapter.titleNe}
              </p>

              <div style={{
                backgroundColor: "#f8fafc",
                border: "1.5px solid #ec4899",
                borderRadius: "12px",
                padding: "20px",
                maxWidth: "600px",
                width: "100%",
                textAlign: "left",
                marginBottom: "20px",
                boxShadow: "0 4px 15px rgba(236, 72, 153, 0.15)"
              }}>
                <div style={{ color: "#2563eb", fontWeight: "bold", fontSize: "13px", marginBottom: "8px" }}>
                  💡 Chapter Study Notes / Vocabulary Summary:
                </div>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "#334155", whiteSpace: "pre-line" }}>
                  {selectedChapter.notes || "No extra study notes entered."}
                </p>
              </div>

              {isAdmin && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                  <button
                    onClick={() => openUploadModal(selectedChapter)}
                    style={{
                      background: "linear-gradient(135deg, #ec4899 0%, #2563eb 100%)",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4), 0 0 20px rgba(37, 99, 235, 0.3)"
                    }}
                  >
                    📁 Upload PDF File for Chapter {selectedChapter.chapter}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACTIVE HTML5 AUDIO ENGINE WITH HARDWARE SYNC */}
        {activeTrack && (
          <audio
            ref={audioRef}
            src={getPlayableAudioUrl(activeTrack)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => {
              if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
                audioRef.current.playbackRate = playbackRate;
                if (isPlaying) {
                  audioRef.current.play().catch(() => { });
                }
              }
            }}
            onEnded={() => {
              // Do NOT continuously play all tracks automatically; play only selected track and stop when finished
              setIsPlaying(false);
              setCurrentTime(0);
              if (audioRef.current) audioRef.current.currentTime = 0;
            }}
            onError={(e) => {
              console.warn("Audio playback error:", e);
              setIsPlaying(false);
            }}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN CLEAN 60 CHAPTERS GRID VIEW (BEFORE FULL-SCREEN)
  // =========================================================================
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#1e293b", width: "100%" }}>
      {/* HEADER BAR */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)",
        color: "white",
        borderRadius: "14px",
        padding: "24px 28px",
        marginBottom: "22px",
        boxShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.25)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            📖 EPS Book Library & Multi-Listening
          </h2>
          <p style={{ margin: "6px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
            च्याप्टर क्लिक गरेर Full Screen मा PDF हेर्नुहोस् र Dropdown Arrow बाट Multi-Listening सुन्नुहोस्।
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* BOOK FILTER TABS */}
          <div style={{ display: "flex", backgroundColor: "rgba(0,0,0,0.25)", padding: "4px", borderRadius: "10px", gap: "4px" }}>
            <button
              onClick={() => setBookFilter("all")}
              style={{
                padding: "8px 14px",
                backgroundColor: bookFilter === "all" ? "white" : "transparent",
                color: bookFilter === "all" ? "#1e3a8a" : "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px"
              }}
            >
              All 60 Ch
            </button>
            <button
              onClick={() => setBookFilter("book1")}
              style={{
                padding: "8px 14px",
                backgroundColor: bookFilter === "book1" ? "white" : "transparent",
                color: bookFilter === "book1" ? "#1e3a8a" : "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px"
              }}
            >
              📘 Book 1 (1–30)
            </button>
            <button
              onClick={() => setBookFilter("book2")}
              style={{
                padding: "8px 14px",
                backgroundColor: bookFilter === "book2" ? "white" : "transparent",
                color: bookFilter === "book2" ? "#1e3a8a" : "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px"
              }}
            >
              📙 Book 2 (31–60)
            </button>
          </div>

          {/* SINGLE MASTER EDIT BUTTON FOR ALL CHAPTERS - Admin only */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => openUploadModal(chapters[0] || { chapter: 1 })}
              title="Edit PDF, Audio, Cover and Titles for any chapter"
              style={{
                backgroundColor: "#10b981",
                backgroundImage: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                border: "none",
                padding: "9px 18px",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                boxShadow: "0 4px 12px rgba(5, 150, 105, 0.4)",
                transition: "all 0.15s ease"
              }}
            >
              <span>✏️</span>
              <span>Edit Chapter (PDF & Audio)</span>
            </button>
          )}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{
        backgroundColor: "white",
        padding: "16px 20px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <span style={{ position: "absolute", left: "12px", top: "10px", fontSize: "16px" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by chapter number or topic (e.g. 14, 비빔밥, खाना, नमस्ते)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 38px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "#f8fafc"
            }}
          />
        </div>

        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#64748b" }}>
          Showing {filteredChapters.length} of 60 Chapters
        </span>
      </div>

      {/* 60 CHAPTERS CLEAN GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
        marginBottom: "40px"
      }}>
        {filteredChapters.map((c) => {
          const hasPdf = Boolean(c.pdfUrl);
          const audioCount = c.audioTracks?.length || 0;

          return (
            <div
              key={c.id || c.chapter}
              onClick={() => openChapterFullScreen(c)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(2, 132, 199, 0.15)";
                e.currentTarget.style.borderColor = "#38bdf8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
              title={`Click to open Chapter ${c.chapter} in Full Screen`}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                userSelect: "none"
              }}
            >
              <div>
                {/* CHAPTER HEADER: Center in Institute Mode, with PDF/Audio/Edit removed */}
                {isInstitute ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{
                      backgroundColor: c.chapter <= 30 ? "#dbeafe" : "#fef3c7",
                      color: c.chapter <= 30 ? "#1d4ed8" : "#b45309",
                      padding: "5px 20px",
                      borderRadius: "16px",
                      fontSize: "13px",
                      fontWeight: "800",
                      letterSpacing: "0.5px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      border: c.chapter <= 30 ? "1px solid #bfdbfe" : "1px solid #fde68a"
                    }}>
                      Chapter {c.chapter}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{
                      backgroundColor: c.chapter <= 30 ? "#dbeafe" : "#fef3c7",
                      color: c.chapter <= 30 ? "#1d4ed8" : "#b45309",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold"
                    }}>
                      Chapter {c.chapter}
                    </span>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {hasPdf ? (
                        <span style={{ fontSize: "11px", backgroundColor: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                          📄 PDF
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", backgroundColor: "#f1f5f9", color: "#94a3b8", padding: "2px 6px", borderRadius: "4px" }}>
                          No PDF
                        </span>
                      )}
                      {audioCount > 0 && (
                        <span style={{ fontSize: "11px", backgroundColor: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                          🎧 {audioCount}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* CHAPTER COVER / FIRST PAGE PREVIEW */}
                <ChapterCover
                  chapter={c.chapter}
                  titleKo={c.titleKo}
                  titleNe={c.titleNe}
                  pdfUrl={c.pdfUrl}
                  coverImage={c.coverImage}
                  bookPart={c.chapter <= 30 ? 1 : 2}
                  height="195px"
                  margin="10px 0 12px 0"
                  onClick={(e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                    openChapterFullScreen(c);
                  }}
                />

                <div style={{ textAlign: "center", marginTop: "6px" }}>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "bold", color: "#0f172a", textAlign: "center" }}>
                    {c.titleKo}
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.4", textAlign: "center" }}>
                    {c.titleNe}
                  </p>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* =========================================================================
          3. UPLOAD & EDIT MODAL (POPUP FOR ADMIN / INSTITUTE)
         ========================================================================= */}
      {uploadModalChapter && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 100002,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "14px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "16px" }}>
              <div>
                <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", display: "inline-block", marginBottom: "4px" }}>
                  🔑 Admin Authenticated
                </span>
                <h3 style={{ margin: 0, color: "#0f172a", fontSize: "17px" }}>
                  ✏️ Edit Chapter {uploadModalChapter.chapter}: {uploadModalChapter.titleKo}
                </h3>
              </div>
              <button
                onClick={() => setUploadModalChapter(null)}
                style={{ backgroundColor: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {/* CHAPTER SELECTOR (ONE MASTER MODAL FOR ALL CHAPTERS) */}
            <div style={{ backgroundColor: "#eff6ff", border: "1.5px solid #bfdbfe", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
              <label style={{ fontWeight: "bold", fontSize: "13px", color: "#1e40af", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📚</span> Select Chapter to Edit (च्याप्टर छान्नुहोस्):
              </label>
              <select
                value={uploadModalChapter.chapter}
                onChange={(e) => {
                  const targetCh = chapters.find(ch => ch.chapter === Number(e.target.value));
                  if (targetCh) openUploadModal(targetCh);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1.5px solid #3b82f6",
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#1e3a8a",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  minWidth: "220px"
                }}
              >
                {chapters.map(ch => (
                  <option key={ch.chapter} value={ch.chapter}>
                    Chapter {ch.chapter}: {ch.titleKo} ({ch.titleNe})
                  </option>
                ))}
              </select>
            </div>

            {/* 1. EDIT CHAPTER NAME & TITLES (ADMIN / INSTITUTE) */}
            <div style={{ backgroundColor: "#f0fdf4", padding: "16px", borderRadius: "10px", border: "1.5px solid #86efac", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#166534", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>✏️</span> Chapter {uploadModalChapter.chapter} Name & Details (च्याप्टरको नाम):
                </label>
                <span style={{ fontSize: "11px", color: "#15803d", fontWeight: "bold", backgroundColor: "#dcfce7", padding: "2px 8px", borderRadius: "10px" }}>
                  Admin Editable
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}>
                    🇰🇷 Korean Title (कोरियन शीर्षक):
                  </label>
                  <input
                    type="text"
                    value={editTitleKo}
                    onChange={(e) => setEditTitleKo(e.target.value)}
                    placeholder="उदा. 한글 익히기 I"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1.5px solid #94a3b8",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#0f172a",
                      boxSizing: "border-box",
                      backgroundColor: "#ffffff"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}>
                    🇳🇵 Nepali Meaning / Title (नेपाली अर्थ):
                  </label>
                  <input
                    type="text"
                    value={editTitleNe}
                    onChange={(e) => setEditTitleNe(e.target.value)}
                    placeholder="उदा. कोरियन वर्णमाला सिक्ने भाग १ (स्वर र व्यञ्जन)"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1.5px solid #94a3b8",
                      fontSize: "13px",
                      color: "#0f172a",
                      boxSizing: "border-box",
                      backgroundColor: "#ffffff"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}>
                    📝 Study Notes / Vocabulary Summary (अध्ययन टिप्पणी/नोट):
                  </label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="च्याप्टरको मुख्य अध्ययन नोट वा व्याख्या..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12px",
                      color: "#0f172a",
                      boxSizing: "border-box",
                      backgroundColor: "#ffffff",
                      fontFamily: "Arial, sans-serif"
                    }}
                  />
                </div>

                <div style={{ textAlign: "right", marginTop: "2px" }}>
                  <button
                    type="button"
                    disabled={isSavingChapterInfo}
                    onClick={handleSaveChapterInfo}
                    style={{
                      backgroundColor: "#16a34a",
                      color: "white",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: isSavingChapterInfo ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)"
                    }}
                  >
                    <span>💾</span> {isSavingChapterInfo ? "Saving..." : "Save Chapter Name"}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. CHAPTER COVER / 1ST PAGE PREVIEW & CUSTOM COVER PHOTO */}
            <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📸</span> Chapter {uploadModalChapter.chapter} Cover / पहिलो पेज (1st Page Preview):
                </label>
                {uploadModalChapter.coverImage && (
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "bold", backgroundColor: "#dcfce7", padding: "2px 8px", borderRadius: "10px" }}>
                    Custom Image
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ width: "120px", height: "155px", flexShrink: 0 }}>
                  <ChapterCover
                    chapter={uploadModalChapter.chapter}
                    titleKo={uploadModalChapter.titleKo}
                    titleNe={uploadModalChapter.titleNe}
                    pdfUrl={uploadModalChapter.pdfUrl}
                    coverImage={uploadModalChapter.coverImage}
                    bookPart={uploadModalChapter.chapter <= 30 ? 1 : 2}
                    height="155px"
                    margin="0"
                    onClick={() => { }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: "220px" }}>
                  <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>
                    {uploadModalChapter.pdfUrl
                      ? "यो च्याप्टरको अपलोड भएको PDF को पहिलो पेज (First Page) स्वतः कभर कार्डमा देखिन्छ। यदि तपाईं छुट्टै विशेष कभर फोटो राख्न चाहनुहुन्छ भने तलबाट फोटो अपलोड गर्न सक्नुहुन्छ।"
                      : "PDF अपलोड गरेपछि पहिलो पेज स्वतः कभर बन्नेछ, वा अहिले नै कुनै कभर फोटो छनौट गर्न सक्नुहुन्छ।"}
                  </p>

                  <input
                    type="file"
                    ref={coverInputRef}
                    accept="image/*"
                    onChange={handleUploadCoverFile}
                    style={{ display: "none" }}
                  />

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => coverInputRef.current?.click()}
                      style={{
                        backgroundColor: "#0284c7",
                        color: "white",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      <span>🖼️</span> {uploadingCover ? "Uploading..." : "कभर फोटो अपलोड (Upload Custom Cover)"}
                    </button>

                    {uploadModalChapter.coverImage && (
                      <button
                        type="button"
                        onClick={handleRemoveCoverImage}
                        style={{
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fca5a5",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        ✕ Remove Custom Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SEPARATE PDF UPLOAD */}
            <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#0f172a", marginBottom: "6px" }}>
                📄 Chapter {uploadModalChapter.chapter} PDF Document:
              </label>

              <input
                type="file"
                ref={pdfInputRef}
                accept=".pdf,application/pdf"
                onChange={handleUploadPdfFile}
                style={{ display: "none" }}
              />

              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                <button
                  type="button"
                  disabled={uploadingPdf}
                  onClick={() => pdfInputRef.current?.click()}
                  style={{
                    backgroundColor: "#0284c7",
                    color: "white",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  {uploadingPdf ? "⏳ Uploading PDF..." : "📁 Pick & Upload PDF File"}
                </button>
                {uploadModalChapter.pdfUrl && (
                  <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "bold" }}>
                    ✅ PDF Attached
                  </span>
                )}
              </div>

              {uploadModalChapter.pdfUrl && (
                <div style={{ fontSize: "12px", color: "#64748b", wordBreak: "break-all" }}>
                  URL: {uploadModalChapter.pdfUrl}
                </div>
              )}
            </div>

            {/* 2. SEPARATE MULTI-AUDIO UPLOAD */}
            <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#0f172a", marginBottom: "6px" }}>
                🎧 Chapter {uploadModalChapter.chapter} Multi-Listening Audio Files:
              </label>

              <input
                type="file"
                ref={audioInputRef}
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                multiple
                onChange={handleUploadAudioFiles}
                style={{ display: "none" }}
              />

              <button
                type="button"
                disabled={uploadingAudio}
                onClick={() => audioInputRef.current?.click()}
                style={{
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  padding: "9px 16px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  marginBottom: "12px"
                }}
              >
                {uploadingAudio ? "⏳ Uploading Audio..." : "🎵 Pick & Upload Audio Files (.mp3)"}
              </button>

              {/* LIST OF TRACKS */}
              <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "white", padding: "6px" }}>
                {uploadModalChapter.audioTracks?.length === 0 ? (
                  <p style={{ margin: 0, padding: "8px", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
                    No audio tracks uploaded yet.
                  </p>
                ) : (
                  uploadModalChapter.audioTracks.map((tr, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px" }}>
                      <span style={{ fontWeight: "bold", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "420px" }}>
                        {tr.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAudioTrack(idx)}
                        style={{ backgroundColor: "#fee2e2", color: "#ef4444", border: "none", padding: "2px 6px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <div style={{ textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setUploadModalChapter(null)}
                style={{
                  backgroundColor: "#0f172a",
                  color: "white",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
