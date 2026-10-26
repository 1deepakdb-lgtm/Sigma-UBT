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
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { performLogout } from "@/lib/clientAuth";
import { seedSet1Questions } from "@/data/set1Questions";
import PdfQuestionUploadModal from "@/components/PdfQuestionUploadModal";



// Clean SVG Icons for zero-emoji compliance
const ShieldIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BuildingIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="22.01" />
    <line x1="15" y1="22" x2="15" y2="22.01" />
    <line x1="9" y1="6" x2="9" y2="6.01" />
    <line x1="15" y1="6" x2="15" y2="6.01" />
    <line x1="9" y1="10" x2="9" y2="10.01" />
    <line x1="15" y1="10" x2="15" y2="10.01" />
    <line x1="9" y1="14" x2="9" y2="14.01" />
    <line x1="15" y1="14" x2="15" y2="14.01" />
  </svg>
);

const GlobeIcon = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const LockIcon = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TargetIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const BookIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const EditIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const BarChartIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const EyeIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CheckCircleIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const TrashIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

function AdminQuestionManagerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Primary navigation tabs: ubtSets | chapterSets | uploadQuestions | allSets | packages
  const [activeTab, setActiveTab] = useState("ubtSets");
  const initialTabLoadedRef = useRef(false);

  const [packages, setPackages] = useState([]);
  const [sets, setSets] = useState([]);
  const [questions, setQuestions] = useState([]);

  // UBT Set creation state
  const [ubtSetName, setUbtSetName] = useState("");
  const [ubtPackageName, setUbtPackageName] = useState("Full Set UBT");
  const [ubtAutoInit, setUbtAutoInit] = useState(true);

  // Chapter Wise Set creation state
  const [chapterSetName, setChapterSetName] = useState("");
  const [chapterPackageName, setChapterPackageName] = useState("30 Set Chapter UBT");
  const [chapterNote, setChapterNote] = useState("");
  const [chapterAutoInit, setChapterAutoInit] = useState(true);

  // Package creation state
  const [newPackageName, setNewPackageName] = useState("");

  // Question editing / uploading state
  const [filterPackage, setFilterPackage] = useState("");
  const [filterSet, setFilterSet] = useState("");
  const [targetSetType, setTargetSetType] = useState("UBT");
  const [questionListType, setQuestionListType] = useState("Reading"); // "Reading" or "Listening"
  const [questionSubFilter, setQuestionSubFilter] = useState("All"); // "All" | "Reading" | "Listening"
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [qNumber, setQNumber] = useState(1);

  const [dragOver, setDragOver] = useState(false);
  const [audioDragOver, setAudioDragOver] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [bulkJsonInput, setBulkJsonInput] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");

  // Search & filter for All Sets tab
  const [allSetsCategoryFilter, setAllSetsCategoryFilter] = useState("All"); // "All" | "UBT" | "Chapterwise"
  const [allSetsSearch, setAllSetsSearch] = useState("");
  const [allSetsCreatorFilter, setAllSetsCreatorFilter] = useState("All");

  // Creator / Bucket Filter & Super Admin Publishing Authority
  const [creatorFilter, setCreatorFilter] = useState("All"); // "All" | "Super Admin" | "Institutes" | specific institute
  const [isPublishingId, setIsPublishingId] = useState(null);

  // Set selected for viewing questions below UBT Sets table
  const [selectedUbtSetForView, setSelectedUbtSetForView] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const inputRefs = useRef([]);

  const [qForm, setQForm] = useState({
    mainHeading: "[1~2] 다음 내용과 관계있는 그림을 고르십시오.",
    questionHeading: "1",
    description: "",
    image: "",
    audio: "",
    options: [
      { text: "", audio: "", image: "", video: "" },
      { text: "", audio: "", image: "", video: "" },
      { text: "", audio: "", image: "", video: "" },
      { text: "", audio: "", image: "", video: "" }
    ],
    answer: 0
  });

  const safeJsonParse = (raw, fallback) => {
    try {
      if (!raw || raw === "undefined" || raw === "null") return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : (parsed || fallback);
    } catch (e) {
      return fallback;
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tabKey);
        window.history.replaceState({}, "", url.toString());
      } catch (err) {
        // ignore
      }
    }
  };

  const loadData = () => {
    try {
      seedSet1Questions();
      const savedPackages = safeJsonParse(localStorage.getItem("examPackages"), []);
      const savedSets = safeJsonParse(localStorage.getItem("examSets"), []);
      const savedQuestions = safeJsonParse(localStorage.getItem("questionBank"), []);

      // Force ALL set names to be in capital letters (uppercase) and retain creator info
      let normalizedSets = savedSets.map((s) => {
        const upperName = (s.name || "").trim().toUpperCase();
        const sType = s.setType || (upperName.includes("CHAPTER") ? "Chapterwise" : "UBT");
        return {
          ...s,
          name: upperName,
          setType: sType,
          creatorInstituteName: s.creatorInstituteName || "Super Admin",
          isPublished: s.isPublished !== undefined ? s.isPublished : true,
          isPrivate: s.isPrivate !== undefined ? s.isPrivate : false
        };
      });

      // Ensure default fallback sets exist so counts and views are never empty
      if (!normalizedSets.some((s) => s.name === "UBT SET 01")) {
        normalizedSets.push({
          id: "set-ubt-01",
          name: "UBT SET 01",
          packageName: "Full Set UBT",
          setType: "UBT",
          duration: 3000,
          creatorInstituteName: "Super Admin",
          isPublished: true,
          isPrivate: false
        });
      }
      if (!normalizedSets.some((s) => s.name === "SET 1")) {
        normalizedSets.push({
          id: "set-chapter-01",
          name: "SET 1",
          packageName: "30 Set Chapter UBT",
          setType: "Chapterwise",
          duration: 3000,
          creatorInstituteName: "Super Admin",
          isPublished: true,
          isPrivate: false
        });
      }
      localStorage.setItem("examSets", JSON.stringify(normalizedSets));

      // Force questions to uppercase set references
      const normalizedQuestions = savedQuestions.map((q) => ({
        ...q,
        set: (q.set || "").trim().toUpperCase()
      }));
      localStorage.setItem("questionBank", JSON.stringify(normalizedQuestions));

      setPackages(savedPackages);
      setSets(normalizedSets);
      setQuestions(normalizedQuestions);

      if (savedPackages.length > 0 && !filterPackage) {
        setFilterPackage(savedPackages[0].name);
      }
      if (normalizedSets.length > 0 && !filterSet) {
        setFilterSet(normalizedSets[0].name);
        const sType = getSetType(normalizedSets[0]);
        setTargetSetType(sType);
      }
    } catch (err) {
      console.error("Error loading data from localStorage", err);
    }
  };

  // Sync sets created by institutes from SQLite backend DB
  const fetchServerSets = async () => {
    try {
      const res = await fetch("/api/admin/packages?all=true&superadmin=true");
      if (res.ok) {
        const data = await res.json();
        if (data.sets && Array.isArray(data.sets) && data.sets.length > 0) {
          setSets((prevSets) => {
            const map = new Map();
            prevSets.forEach((s) => map.set((s.name || "").trim().toUpperCase(), s));

            data.sets.forEach((dbSet) => {
              const upper = (dbSet.name || "").trim().toUpperCase();
              const existing = map.get(upper);
              map.set(upper, {
                ...existing,
                ...dbSet,
                id: dbSet.id || existing?.id,
                name: upper,
                packageName: dbSet.packageName || existing?.packageName || "Full Set UBT",
                setType: dbSet.setType || existing?.setType || "UBT",
                creatorInstituteId: dbSet.creatorInstituteId || existing?.creatorInstituteId || null,
                creatorInstituteName: dbSet.creatorInstituteName || existing?.creatorInstituteName || "Super Admin",
                isPublished: dbSet.isPublished !== undefined ? dbSet.isPublished : (existing?.isPublished !== undefined ? existing.isPublished : true),
                isPrivate: dbSet.isPrivate !== undefined ? dbSet.isPrivate : (existing?.isPrivate !== undefined ? existing.isPrivate : false)
              });
            });

            const merged = Array.from(map.values());
            try {
              localStorage.setItem("examSets", JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Could not sync sets from server DB:", err);
    }
  };

  useEffect(() => {
    loadData();
    fetchServerSets();

    // Check query params ONLY ON INITIAL LOAD to set tab/set without overriding user button clicks
    if (!initialTabLoadedRef.current && searchParams) {
      initialTabLoadedRef.current = true;
      const tabParam = searchParams.get("tab");
      if (tabParam) {
        if (["ubtSets", "chapterSets", "uploadQuestions", "allSets", "packages"].includes(tabParam)) {
          setActiveTab(tabParam);
        } else if (tabParam === "questions") {
          setActiveTab("uploadQuestions");
        }
      }
      const setParam = searchParams.get("set");
      if (setParam) {
        setFilterSet(setParam.toUpperCase());
        setActiveTab("uploadQuestions");
      }
    }
  }, []);

  // Super Admin Exclusive Authority: Publish or Unpublish an Exam Set
  const handleTogglePublishSet = async (setObj) => {
    const currentPublished = setObj.isPublished !== false;
    const nextPublished = !currentPublished;
    const key = setObj.id || setObj.name;
    setIsPublishingId(key);

    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_publish_set",
          setId: setObj.id,
          setName: setObj.name,
          packageName: setObj.packageName,
          duration: setObj.duration || 3000,
          setType: getSetType(setObj),
          creatorInstituteId: setObj.creatorInstituteId || null,
          creatorInstituteName: setObj.creatorInstituteName || "Super Admin",
          isPublished: nextPublished,
          superadmin: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update publication status");
      }

      // Update sets in local state and localStorage
      const updatedSets = sets.map((s) => {
        if ((s.id && s.id === setObj.id) || (s.name || "").toUpperCase() === (setObj.name || "").toUpperCase()) {
          return {
            ...s,
            isPublished: nextPublished,
            isPrivate: !nextPublished
          };
        }
        return s;
      });

      setSets(updatedSets);
      try {
        localStorage.setItem("examSets", JSON.stringify(updatedSets));
      } catch (e) {}

      if (nextPublished) {
        alert(`Set "${setObj.name}" is now PUBLISHED. All institutes and students across the platform can now access and package it.`);
      } else {
        alert(`Set "${setObj.name}" is now UNPUBLISHED (Private to ${setObj.creatorInstituteName || "Creator Institute"}). Other institutes cannot access it.`);
      }
    } catch (err) {
      console.error("Error toggling publish state:", err);
      // Fallback local update
      const updatedSets = sets.map((s) => {
        if ((s.id && s.id === setObj.id) || (s.name || "").toUpperCase() === (setObj.name || "").toUpperCase()) {
          return {
            ...s,
            isPublished: nextPublished,
            isPrivate: !nextPublished
          };
        }
        return s;
      });
      setSets(updatedSets);
      try {
        localStorage.setItem("examSets", JSON.stringify(updatedSets));
      } catch (e) {}
      alert(`Local update: Set "${setObj.name}" publication set to ${nextPublished ? "Published" : "Private"}.`);
    } finally {
      setIsPublishingId(null);
    }
  };

  const renderCreatorBadge = (setObj) => {
    const isInstitute = setObj.creatorInstituteName && setObj.creatorInstituteName !== "Super Admin" && setObj.creatorInstituteName !== "Admin";
    if (isInstitute) {
      return (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
          backgroundColor: "#ede9fe",
          color: "#5b21b6",
          border: "1px solid #ddd6fe"
        }}>
          <BuildingIcon size={13} color="#6d28d9" />
          <span>Institute: <strong>{setObj.creatorInstituteName}</strong></span>
        </span>
      );
    }
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: "#eff6ff",
        color: "#1e40af",
        border: "1px solid #bfdbfe"
      }}>
        <ShieldIcon size={13} color="#2563eb" />
        <span>Super Admin (Global)</span>
      </span>
    );
  };

  const renderVisibilityBadge = (setObj) => {
    const isPublished = setObj.isPublished !== false;
    if (isPublished) {
      return (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "700",
          backgroundColor: "#dcfce7",
          color: "#166534",
          border: "1px solid #bbf7d0"
        }}>
          <GlobeIcon size={13} color="#166534" />
          <span>Published to All Institutes</span>
        </span>
      );
    }
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "700",
        backgroundColor: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a"
      }}>
        <LockIcon size={13} color="#92400e" />
        <span>Private Bucket (Creator Only)</span>
      </span>
    );
  };

  const renderPublishAuthorityButton = (setObj) => {
    const isPublished = setObj.isPublished !== false;
    const isUpdating = isPublishingId === (setObj.id || setObj.name);

    if (!isPublished) {
      return (
        <button
          onClick={() => handleTogglePublishSet(setObj)}
          disabled={isUpdating}
          title="Super Admin Authority: Publish this set so other institutes can access and package it"
          style={{
            backgroundColor: "#16a34a",
            color: "#ffffff",
            border: "none",
            padding: "6px 12px",
            borderRadius: "5px",
            cursor: isUpdating ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            opacity: isUpdating ? 0.7 : 1,
            boxShadow: "0 1px 3px rgba(22, 163, 74, 0.3)"
          }}
        >
          <GlobeIcon size={13} color="#ffffff" />
          <span>{isUpdating ? "Publishing..." : "Publish to All Institutes"}</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => handleTogglePublishSet(setObj)}
        disabled={isUpdating}
        title="Super Admin Authority: Unpublish this set so it becomes private to its creator institute"
        style={{
          backgroundColor: "#d97706",
          color: "#ffffff",
          border: "none",
          padding: "6px 12px",
          borderRadius: "5px",
          cursor: isUpdating ? "not-allowed" : "pointer",
          fontSize: "12px",
          fontWeight: "700",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          opacity: isUpdating ? 0.7 : 1
        }}
      >
        <LockIcon size={13} color="#ffffff" />
        <span>{isUpdating ? "Updating..." : "Unpublish (Make Private)"}</span>
      </button>
    );
  };

  // Helper to determine if a set is UBT or Chapterwise
  const getSetType = (setObj) => {
    if (!setObj) return "UBT";
    if (setObj.setType) return setObj.setType;
    const nameUpper = (setObj.name || "").toUpperCase();
    const pkgUpper = (setObj.packageName || "").toUpperCase();
    if (nameUpper.includes("CHAPTER") || pkgUpper.includes("CHAPTER")) {
      return "Chapterwise";
    }
    return "UBT";
  };

  // Helper to count questions in a set
  const getSetQuestionCounts = (setObj) => {
    if (!setObj) return { reading: 0, listening: 0, total: 0 };
    const sNameUpper = (setObj.name || "").trim().toUpperCase();
    const matched = questions.filter(
      q => q && ((q.set || "").trim().toUpperCase() === sNameUpper || q.setId === setObj.id) &&
        (!setObj.packageName || (q.package || "").toUpperCase() === (setObj.packageName || "").toUpperCase() || !q.package)
    );
    const reading = matched.filter(q => q.type === "Reading").length;
    const listening = matched.filter(q => q.type === "Listening").length;
    return {
      reading,
      listening,
      total: reading + listening,
      isComplete: reading === 20 && listening === 20
    };
  };

  // Switch to Upload Questions with a specific set
  const handleSelectSetForUpload = (setObj) => {
    const cleanName = (setObj.name || "").trim().toUpperCase();
    setFilterSet(cleanName);
    setFilterPackage(setObj.packageName || "");
    setTargetSetType(getSetType(setObj));
    handleTabChange("uploadQuestions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 1. Create UBT Set (Auto-enforces UPPERCASE set name)
  const handleCreateUbtSet = (e) => {
    e.preventDefault();
    const cleanName = ubtSetName.trim().toUpperCase();
    if (!cleanName) return;

    const existing = sets.find(s => (s.name || "").trim().toUpperCase() === cleanName);
    if (existing) {
      alert(`A set named "${cleanName}" already exists.`);
      return;
    }

    const newSetObj = {
      id: "set-ubt-" + Date.now(),
      name: cleanName,
      packageName: ubtPackageName || "Full Set UBT",
      setType: "UBT",
      duration: 3000,
      creatorInstituteName: "Super Admin",
      isPublished: true,
      isPrivate: false,
      createdAt: new Date().toISOString()
    };

    const updatedSets = [...sets, newSetObj];
    setSets(updatedSets);
    localStorage.setItem("examSets", JSON.stringify(updatedSets));

    // Also ensure package exists in packages list
    if (ubtPackageName && !packages.some(p => p.name === ubtPackageName)) {
      const updatedPackages = [...packages, { id: "pkg-" + Date.now(), name: ubtPackageName, price: "Rs. 2,000" }];
      setPackages(updatedPackages);
      localStorage.setItem("examPackages", JSON.stringify(updatedPackages));
    }

    // Auto-generate 20 Reading + 20 Listening slots if checked
    if (ubtAutoInit) {
      generate40Template(newSetObj.name, newSetObj.packageName);
    }

    alert(`UBT Set "${cleanName}" created successfully with 20 Reading & 20 Listening slots!`);
    setUbtSetName("");
    handleSelectSetForUpload(newSetObj);
  };

  // 2. Create Chapter Wise Set (Auto-enforces UPPERCASE set name)
  const handleCreateChapterSet = (e) => {
    e.preventDefault();
    const cleanName = chapterSetName.trim().toUpperCase();
    if (!cleanName) return;

    const existing = sets.find(s => (s.name || "").trim().toUpperCase() === cleanName);
    if (existing) {
      alert(`A set named "${cleanName}" already exists.`);
      return;
    }

    const newSetObj = {
      id: "set-chapter-" + Date.now(),
      name: cleanName,
      packageName: chapterPackageName || "30 Set Chapter UBT",
      setType: "Chapterwise",
      note: chapterNote.trim(),
      duration: 3000,
      creatorInstituteName: "Super Admin",
      isPublished: true,
      isPrivate: false,
      createdAt: new Date().toISOString()
    };

    const updatedSets = [...sets, newSetObj];
    setSets(updatedSets);
    localStorage.setItem("examSets", JSON.stringify(updatedSets));

    if (chapterPackageName && !packages.some(p => p.name === chapterPackageName)) {
      const updatedPackages = [...packages, { id: "pkg-" + Date.now(), name: chapterPackageName, price: "Rs. 1,000" }];
      setPackages(updatedPackages);
      localStorage.setItem("examPackages", JSON.stringify(updatedPackages));
    }

    if (chapterAutoInit) {
      generate40Template(newSetObj.name, newSetObj.packageName);
    }

    alert(`Chapter Wise Set "${cleanName}" created successfully with 20 Reading & 20 Listening slots!`);
    setChapterSetName("");
    setChapterNote("");
    handleSelectSetForUpload(newSetObj);
  };

  // Delete Set
  const handleDeleteSet = (setId, setName) => {
    if (window.confirm(`Are you sure you want to delete set "${setName}"? All associated questions will be removed.`)) {
      const updatedSets = sets.filter(s => s.id !== setId && s.name !== setName);
      setSets(updatedSets);
      localStorage.setItem("examSets", JSON.stringify(updatedSets));

      const updatedQuestions = questions.filter(q => q.set !== setName && q.setId !== setId);
      setQuestions(updatedQuestions);
      localStorage.setItem("questionBank", JSON.stringify(updatedQuestions));

      if (filterSet === setName) {
        if (updatedSets.length > 0) {
          setFilterSet(updatedSets[0].name);
          setFilterPackage(updatedSets[0].packageName);
        } else {
          setFilterSet("");
        }
      }
    }
  };

  // Generate 20 Reading + 20 Listening Template
  const generate40Template = (targetSetName, targetPackage) => {
    const cleanSetName = (targetSetName || "").trim().toUpperCase();
    const batch = [];
    for (let i = 1; i <= 40; i++) {
      const isReading = i <= 20;
      const type = isReading ? "Reading" : "Listening";
      const heading = isReading
        ? `[ ${i} ] 다음을 읽고 알맞은 것을 고르십시오.`
        : `[ ${i} ] 이야기를 듣고 알맞은 것을 고르십시오.`;

      batch.push({
        id: Date.now() + i + Math.random(),
        package: targetPackage,
        set: cleanSetName,
        qIndex: i,
        type: type,
        mainHeading: heading,
        questionHeading: String(i),
        description: "",
        image: "",
        audio: "",
        options: [
          { text: `Option 1 for Q${i}`, audio: "", image: "", video: "" },
          { text: `Option 2 for Q${i}`, audio: "", image: "", video: "" },
          { text: `Option 3 for Q${i}`, audio: "", image: "", video: "" },
          { text: `Option 4 for Q${i}`, audio: "", image: "", video: "" }
        ],
        answer: 0
      });
    }

    const filtered = questions.filter(q => !((q.set || "").trim().toUpperCase() === cleanSetName && (q.package === targetPackage || !q.package)));
    const updated = [...filtered, ...batch];
    setQuestions(updated);
    localStorage.setItem("questionBank", JSON.stringify(updated));
  };

  const handleManualGenerate40 = () => {
    if (!filterSet) {
      alert("Please select a target Exam Set first!");
      return;
    }
    if (window.confirm(`Initialize all 40 questions (20 Reading + 20 Listening) for set [${filterSet}]? Existing questions will be refreshed.`)) {
      generate40Template(filterSet, filterPackage);
      alert(`40 Question slots (20 Reading + 20 Listening) generated for "${filterSet}"!`);
    }
  };

  // Helper for Underline
  const applyUnderline = (idx) => {
    const inputEl = inputRefs.current[idx];
    if (!inputEl) return;

    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    const currentText = qForm.options[idx].text || "";

    if (start === null || end === null || start === end) {
      alert("Please select text inside the option box first to underline.");
      return;
    }

    const selectedStr = currentText.substring(start, end);
    const newlyFormatted = (selectedStr.startsWith("<u>") && selectedStr.endsWith("</u>"))
      ? selectedStr.replace(/^<u>|<\/u>$/g, "")
      : `<u>${selectedStr}</u>`;

    const updatedText = currentText.substring(0, start) + newlyFormatted + currentText.substring(end);
    const newOpts = [...qForm.options];
    newOpts[idx] = { ...newOpts[idx], text: updatedText };
    setQForm({ ...qForm, options: newOpts });

    setTimeout(() => {
      inputEl.focus();
      inputEl.setSelectionRange(start, start + newlyFormatted.length);
    }, 0);
  };

  const processFileToDataURL = (file, setter) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setter(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImagePaste = (e, setter) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        processFileToDataURL(blob, setter);
        e.preventDefault();
      }
    }
  };

  // Helper to parse multi-options pasted together (circled ① ② ③ ④ or numbered 1. 2. 3. 4. / 1) 2) 3) 4))
  const parseMultiOptionText = (text, startIdx = 0) => {
    if (!text || typeof text !== "string") return null;
    const hasCircled = /[①②③④]/.test(text);
    const hasNumbered = /(?:^|\s)(?:[1-4]\.|\([1-4]\)|[1-4]\))\s*/m.test(text);

    if (!hasCircled && !hasNumbered) return null;

    const result = {};
    if (hasCircled) {
      const splitArr = text.split(/([①②③④])/);
      let curIdx = startIdx;
      for (let i = 0; i < splitArr.length; i++) {
        const p = splitArr[i].trim();
        if (p === "①") curIdx = 0;
        else if (p === "②") curIdx = 1;
        else if (p === "③") curIdx = 2;
        else if (p === "④") curIdx = 3;
        else if (p) {
          result[curIdx] = (result[curIdx] ? result[curIdx] + " " : "") + p;
        }
      }
    } else if (hasNumbered) {
      const splitArr = text.split(/(?:^|\s)(?:([1-4])\.|\(([1-4])\)|([1-4])\))\s*/);
      let curIdx = startIdx;
      for (let i = 0; i < splitArr.length; i++) {
        const p = splitArr[i]?.trim();
        if (!p) continue;
        if (["1", "2", "3", "4"].includes(p)) {
          curIdx = parseInt(p) - 1;
        } else {
          result[curIdx] = (result[curIdx] ? result[curIdx] + " " : "") + p;
        }
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  };

  // Change question number handler (auto-switches Reading vs Listening)
  const handleQNumberChange = (num) => {
    const parsed = Math.max(1, Math.min(40, Number(num) || 1));
    setQNumber(parsed);
    const targetType = parsed <= 20 ? "Reading" : "Listening";
    setQuestionListType(targetType);
    setQForm(prev => ({
      ...prev,
      questionHeading: String(parsed),
      mainHeading: targetType === "Reading"
        ? `[ ${parsed} ] 다음을 읽고 알맞은 것을 고르십시오.`
        : `[ ${parsed} ] 이야기를 듣고 알맞은 것을 고르십시오.`
    }));
  };

  // Save or Update Question
  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!filterSet) {
      alert("Please select a target Exam Set first!");
      return;
    }

    const cleanFilterSet = (filterSet || "").trim().toUpperCase();

    const normalizedOptions = qForm.options.map(opt => {
      if (typeof opt === "string") return { text: opt, audio: "", image: "", video: "" };
      return {
        text: opt.text || "",
        audio: opt.audio || "",
        image: opt.image || "",
        video: opt.video || ""
      };
    });

    const questionPayload = {
      ...qForm,
      qIndex: qNumber,
      questionHeading: String(qNumber),
      options: normalizedOptions,
      package: filterPackage,
      set: cleanFilterSet,
      type: questionListType
    };

    if (editingQuestionId) {
      const updated = questions.map(q => q.id === editingQuestionId ? { ...q, ...questionPayload } : q);
      setQuestions(updated);
      localStorage.setItem("questionBank", JSON.stringify(updated));
      setEditingQuestionId(null);
      alert(`Question #${qNumber} (${questionListType}) updated successfully!`);
    } else {
      // Check if slot already exists
      const existingIdx = questions.findIndex(q => (q.set || "").trim().toUpperCase() === cleanFilterSet && Number(q.qIndex) === Number(qNumber));
      let updated;
      if (existingIdx !== -1) {
        updated = [...questions];
        updated[existingIdx] = { ...updated[existingIdx], ...questionPayload, id: updated[existingIdx].id || Date.now() };
      } else {
        const newId = Date.now();
        updated = [...questions, { id: newId, ...questionPayload }];
      }
      setQuestions(updated);
      localStorage.setItem("questionBank", JSON.stringify(updated));
      alert(`Question #${qNumber} (${questionListType}) saved successfully!`);
    }

    // Auto advance to next question
    if (qNumber < 40) {
      handleQNumberChange(qNumber + 1);
    }
  };

  const handleEditClick = (q) => {
    setEditingQuestionId(q.id);
    const num = Number(q.questionHeading) || Number(q.qIndex) || 1;
    setQNumber(num);
    setQuestionListType(q.type || (num <= 20 ? "Reading" : "Listening"));

    const formattedOptions = (q.options || ["", "", "", ""]).map(opt => {
      if (typeof opt === "string") return { text: opt, audio: "", image: "", video: "" };
      return {
        text: opt.text || "",
        audio: opt.audio || "",
        image: opt.image || "",
        video: opt.video || ""
      };
    });

    setQForm({
      mainHeading: q.mainHeading || "",
      questionHeading: String(num),
      description: q.description || "",
      image: q.image || "",
      audio: q.audio || "",
      options: formattedOptions,
      answer: q.answer !== undefined ? q.answer : 0
    });

    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleEditQuestionFromTable = (q) => {
    setFilterSet((q.set || "").trim().toUpperCase());
    if (q.package) setFilterPackage(q.package);
    setTargetSetType(getSetType(sets.find(s => (s.name || "").trim().toUpperCase() === (q.set || "").trim().toUpperCase())));
    handleEditClick(q);
    handleTabChange("uploadQuestions");
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm("Delete this question?")) {
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      localStorage.setItem("questionBank", JSON.stringify(updated));
    }
  };

  // Bulk JSON Import
  const handleBulkImport = () => {
    try {
      if (!bulkJsonInput.trim()) return;
      const parsed = JSON.parse(bulkJsonInput);
      if (!Array.isArray(parsed)) {
        setBulkStatus("Error: JSON must be an array of questions.");
        return;
      }

      const cleanSet = (filterSet || "").trim().toUpperCase();

      const formatted = parsed.map((item, idx) => {
        const qNum = item.qIndex || item.questionHeading || idx + 1;
        const qType = Number(qNum) <= 20 ? "Reading" : (item.type || "Listening");
        return {
          id: Date.now() + idx + Math.random(),
          package: filterPackage,
          set: cleanSet,
          qIndex: Number(qNum),
          type: qType,
          mainHeading: item.mainHeading || (qType === "Reading" ? `[ ${qNum} ] 다음을 읽고 알맞은 것을 고르십시오.` : `[ ${qNum} ] 이야기를 듣고 알맞은 것을 고르십시오.`),
          questionHeading: String(qNum),
          description: item.description || "",
          image: item.image || "",
          audio: item.audio || "",
          options: (item.options || ["A", "B", "C", "D"]).map(opt =>
            typeof opt === "string" ? { text: opt, audio: "", image: "", video: "" } : opt
          ),
          answer: item.answer !== undefined ? Number(item.answer) : 0
        };
      });

      const filtered = questions.filter(q => !((q.set || "").trim().toUpperCase() === cleanSet && (q.package === filterPackage || !q.package)));
      const updated = [...filtered, ...formatted];
      setQuestions(updated);
      localStorage.setItem("questionBank", JSON.stringify(updated));

      setBulkStatus(`Successfully imported ${formatted.length} questions for "${cleanSet}"!`);
      setTimeout(() => {
        setShowBulkModal(false);
        setBulkJsonInput("");
        setBulkStatus("");
      }, 1500);
    } catch (err) {
      setBulkStatus("JSON Parsing Error: " + err.message);
    }
  };

  // PDF Question Import Handler
  const handlePdfImportSuccess = async (finalQuestions, targetSetName, targetPkgName) => {
    const cleanSet = (targetSetName || filterSet || "").trim().toUpperCase();

    const filtered = questions.filter(q => (q.set || "").trim().toUpperCase() !== cleanSet);
    const updated = [...filtered, ...finalQuestions];
    setQuestions(updated);
    localStorage.setItem("questionBank", JSON.stringify(updated));

    const targetSetObj = sets.find(s => (s.name || "").trim().toUpperCase() === cleanSet);
    if (targetSetObj?.id) {
      try {
        await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examSetId: targetSetObj.id,
            overwrite: true,
            bulkQuestions: finalQuestions
          })
        });
      } catch (err) {
        console.warn("Backend bulk save notice:", err);
      }
    }

    setFilterSet(cleanSet);
    if (targetPkgName) setFilterPackage(targetPkgName);
    alert(`Successfully imported 40 questions from PDF for "${cleanSet}"!`);
  };

  // Dynamic list of institute creators
  const instituteCreators = Array.from(
    new Set(
      sets
        .map((s) => s.creatorInstituteName)
        .filter(Boolean)
        .filter((n) => n !== "Super Admin" && n !== "Admin")
    )
  ).sort();

  // All UBT sets
  const allUbtSets = sets.filter((s) => getSetType(s) === "UBT");

  // UBT sets filtered by creator
  const ubtSetsList = allUbtSets.filter((s) => {
    if (creatorFilter === "All") return true;
    if (creatorFilter === "Super Admin") {
      return !s.creatorInstituteName || s.creatorInstituteName === "Super Admin" || s.creatorInstituteName === "Admin";
    }
    if (creatorFilter === "Institutes") {
      return s.creatorInstituteName && s.creatorInstituteName !== "Super Admin" && s.creatorInstituteName !== "Admin";
    }
    return (s.creatorInstituteName || "").toLowerCase() === creatorFilter.toLowerCase();
  });

  const superAdminUbtCount = allUbtSets.filter((s) => !s.creatorInstituteName || s.creatorInstituteName === "Super Admin" || s.creatorInstituteName === "Admin").length;
  const instituteUbtCount = allUbtSets.filter((s) => s.creatorInstituteName && s.creatorInstituteName !== "Super Admin" && s.creatorInstituteName !== "Admin").length;
  const publishedUbtCount = allUbtSets.filter((s) => s.isPublished !== false).length;
  const privateUbtCount = allUbtSets.filter((s) => s.isPublished === false || s.isPrivate === true).length;

  const chapterSetsList = sets.filter((s) => getSetType(s) === "Chapterwise");

  // Questions displayed under the current selected set
  const currentSetQuestions = questions.filter(
    (q) => q && ((q.set || "").trim().toUpperCase() === (filterSet || "").trim().toUpperCase() || q.setId === filterSet) &&
      (!filterPackage || q.package === filterPackage || !q.package)
  );

  const displayedSetQuestions = currentSetQuestions.filter((q) => {
    if (questionSubFilter === "Reading") return q.type === "Reading";
    if (questionSubFilter === "Listening") return q.type === "Listening";
    return true;
  }).sort((a, b) => (Number(a.questionHeading || a.qIndex) || 0) - (Number(b.questionHeading || b.qIndex) || 0));

  const targetSetCounts = getSetQuestionCounts(sets.find((s) => (s.name || "").trim().toUpperCase() === (filterSet || "").trim().toUpperCase()));

  // Questions of set selected for viewing below UBT Sets list
  const effectiveUbtViewingSet = selectedUbtSetForView || filterSet || (allUbtSets[0]?.name || "UBT SET 01");
  const ubtViewingSetUpper = (effectiveUbtViewingSet || "").trim().toUpperCase();
  const ubtViewingQuestions = questions
    .filter(q => q && (q.set || "").trim().toUpperCase() === ubtViewingSetUpper)
    .sort((a, b) => {
      const numA = Number(a.qIndex || a.questionHeading) || 0;
      const numB = Number(b.qIndex || b.questionHeading) || 0;
      return numA - numB;
    });
  const ubtViewingReadingCount = ubtViewingQuestions.filter(q => q.type === "Reading" || (Number(q.qIndex || q.questionHeading) <= 20)).length;
  const ubtViewingListeningCount = ubtViewingQuestions.filter(q => q.type === "Listening" || (Number(q.qIndex || q.questionHeading) > 20)).length;

  // Counts for All Sets tab
  const totalAllSetsCount = sets.length;
  const totalUbtSetsCount = allUbtSets.length;
  const totalChapterSetsCount = chapterSetsList.length;
  const totalCompleteSetsCount = sets.filter((s) => getSetQuestionCounts(s).isComplete).length;
  const totalQuestionsCount = questions.length;
  const superAdminTotalCount = sets.filter((s) => !s.creatorInstituteName || s.creatorInstituteName === "Super Admin" || s.creatorInstituteName === "Admin").length;
  const instituteTotalCount = sets.filter((s) => s.creatorInstituteName && s.creatorInstituteName !== "Super Admin" && s.creatorInstituteName !== "Admin").length;

  const filteredAllSets = sets.filter((s) => {
    const sType = getSetType(s);
    if (allSetsCategoryFilter === "UBT" && sType !== "UBT") return false;
    if (allSetsCategoryFilter === "Chapterwise" && sType !== "Chapterwise") return false;
    if (allSetsCreatorFilter && allSetsCreatorFilter !== "All") {
      if (allSetsCreatorFilter === "Super Admin") {
        if (s.creatorInstituteName && s.creatorInstituteName !== "Super Admin" && s.creatorInstituteName !== "Admin") return false;
      } else if (allSetsCreatorFilter === "Institutes") {
        if (!s.creatorInstituteName || s.creatorInstituteName === "Super Admin" || s.creatorInstituteName === "Admin") return false;
      } else {
        if ((s.creatorInstituteName || "").toLowerCase() !== allSetsCreatorFilter.toLowerCase()) return false;
      }
    }
    if (allSetsSearch.trim()) {
      const q = allSetsSearch.toLowerCase();
      const matchName = (s.name || "").toLowerCase().includes(q);
      const matchPkg = (s.packageName || "").toLowerCase().includes(q);
      const matchCreator = (s.creatorInstituteName || "").toLowerCase().includes(q);
      if (!matchName && !matchPkg && !matchCreator) return false;
    }
    return true;
  });

  // Package management handlers
  const handleSavePackage = (e) => {
    e.preventDefault();
    if (!newPackageName.trim()) return;
    const updated = [...packages, { id: "pkg-" + Date.now(), name: newPackageName.trim(), price: "Rs. 1,500" }];
    setPackages(updated);
    localStorage.setItem("examPackages", JSON.stringify(updated));
    setNewPackageName("");
    alert("Package created successfully!");
  };

  const handleDeletePackage = (id) => {
    if (window.confirm("Delete this package?")) {
      const updated = packages.filter(p => p.id !== id);
      setPackages(updated);
      localStorage.setItem("examPackages", JSON.stringify(updated));
    }
  };

  // Styles
  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: "#1e293b",
    paddingBottom: "60px"
  };

  const contentStyle = {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "24px 20px"
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
    marginBottom: "24px"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    outline: "none",
    transition: "border 0.2s ease"
  };

  const primaryBtnStyle = {
    backgroundColor: "#2563eb",
    backgroundImage: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    border: "none",
    padding: "11px 22px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
    transition: "all 0.15s ease"
  };

  const secondaryBtnStyle = {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  };

  const navTabBtnStyle = (tabKey) => {
    const isActive = activeTab === tabKey;
    return {
      padding: "12px 20px",
      backgroundColor: isActive ? "#1e3a8a" : "#ffffff",
      color: isActive ? "#ffffff" : "#1e3a8a",
      border: isActive ? "2px solid #1e3a8a" : "1.5px solid #cbd5e1",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "14px",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.15s ease",
      boxShadow: isActive ? "0 4px 12px rgba(30, 58, 138, 0.2)" : "none"
    };
  };

  return (
    <div style={containerStyle}>
      <Navbar role="admin" />

      <div style={contentStyle}>
        {/* Header Breadcrumb & Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Admin Panel / Question & Exam Set Manager
            </div>
            <h1 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#0f172a", fontWeight: "800" }}>
              EPS-TOPIK UBT & Chapter Wise Sets Management
            </h1>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#64748b", backgroundColor: "#e2e8f0", padding: "6px 14px", borderRadius: "20px", fontWeight: "600" }}>
              Total Sets: <strong style={{ color: "#1e3a8a" }}>{totalAllSetsCount}</strong> (Admin: <strong style={{ color: "#2563eb" }}>{superAdminTotalCount}</strong>, Institutes: <strong style={{ color: "#7c3aed" }}>{instituteTotalCount}</strong>) | Questions: <strong style={{ color: "#16a34a" }}>{totalQuestionsCount}</strong>
            </span>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS REQUIRED BY USER */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          {/* 1. UBT Sets Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); handleTabChange("ubtSets"); }}
            style={navTabBtnStyle("ubtSets")}
          >
            <TargetIcon size={16} />
            <span>UBT Sets</span>
            <span style={{ fontSize: "11px", backgroundColor: activeTab === "ubtSets" ? "rgba(255,255,255,0.25)" : "#e2e8f0", color: activeTab === "ubtSets" ? "#fff" : "#1e3a8a", padding: "2px 8px", borderRadius: "10px" }}>
              {totalUbtSetsCount}
            </span>
          </button>

          {/* 2. Chapter Wise Sets Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); handleTabChange("chapterSets"); }}
            style={navTabBtnStyle("chapterSets")}
          >
            <BookIcon size={16} />
            <span>Chapter Wise Sets</span>
            <span style={{ fontSize: "11px", backgroundColor: activeTab === "chapterSets" ? "rgba(255,255,255,0.25)" : "#e2e8f0", color: activeTab === "chapterSets" ? "#fff" : "#1e3a8a", padding: "2px 8px", borderRadius: "10px" }}>
              {totalChapterSetsCount}
            </span>
          </button>

          {/* 3. Upload Questions (20R + 20L) Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); handleTabChange("uploadQuestions"); }}
            style={navTabBtnStyle("uploadQuestions")}
          >
            <EditIcon size={16} />
            <span>Upload Questions (20R + 20L)</span>
          </button>

          {/* 4. All Sets Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); handleTabChange("allSets"); }}
            style={navTabBtnStyle("allSets")}
          >
            <BarChartIcon size={16} />
            <span>All Sets (Overview & Counts)</span>
            <span style={{ fontSize: "11px", backgroundColor: activeTab === "allSets" ? "rgba(255,255,255,0.25)" : "#e2e8f0", color: activeTab === "allSets" ? "#fff" : "#1e3a8a", padding: "2px 8px", borderRadius: "10px" }}>
              {totalAllSetsCount} Sets
            </span>
          </button>

          {/* 5. Packages Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); handleTabChange("packages"); }}
            style={navTabBtnStyle("packages")}
          >
            <BuildingIcon size={16} />
            <span>Packages</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: UBT SETS (CREATE & MANAGE UBT SETS)               */}
        {/* ======================================================== */}
        {activeTab === "ubtSets" && (
          <div>
            {/* Create UBT Set Form */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <TargetIcon size={24} color="#1e3a8a" />
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#1e3a8a", fontWeight: "700" }}>Create New UBT Set</h2>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                    Standard full-length EPS-TOPIK examination format (20 Reading + 20 Listening = 40 Questions)
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateUbtSet}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                      UBT Set Name *
                    </label>
                    <input
                      type="text"
                      placeholder={`E.G. UBT SET ${ubtSetsList.length + 1 < 10 ? '0' + (ubtSetsList.length + 1) : ubtSetsList.length + 1}`}
                      value={ubtSetName}
                      onChange={(e) => setUbtSetName(e.target.value.toUpperCase())}
                      style={{ ...inputStyle, textTransform: "uppercase" }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                      Target Package
                    </label>
                    <select
                      value={ubtPackageName}
                      onChange={(e) => setUbtPackageName(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="Full Set UBT">Full Set UBT (Default)</option>
                      <option value="100 UBT set">100 UBT set</option>
                      <option value="General UBT">General UBT</option>
                      {packages
                        .filter(p => !["Full Set UBT", "100 UBT set", "General UBT"].includes(p.name))
                        .map((p, idx) => (
                          <option key={idx} value={p.name}>{p.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "18px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="ubtAutoInit"
                    checked={ubtAutoInit}
                    onChange={(e) => setUbtAutoInit(e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="ubtAutoInit" style={{ fontSize: "13px", color: "#166534", fontWeight: "600", cursor: "pointer" }}>
                    <strong>Auto-initialize 40 Question slots</strong> (20 Reading + 20 Listening slots ready to upload/edit)
                  </label>
                </div>

                <button type="submit" style={primaryBtnStyle}>
                  + Create UBT Set & Open Question Uploader
                </button>
              </form>
            </div>

            {/* List of UBT Sets */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", color: "#0f172a", fontWeight: "700" }}>
                    UBT Exam Sets ({ubtSetsList.length} of {allUbtSets.length})
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                    Showing sets created by Super Admin and independent Institute buckets. Super Admin has authority to publish any set to all institutes.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "12px", backgroundColor: "#dcfce7", color: "#166534", fontWeight: "700" }}>
                    Published: {publishedUbtCount}
                  </span>
                  <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "12px", backgroundColor: "#fef3c7", color: "#92400e", fontWeight: "700" }}>
                    Private: {privateUbtCount}
                  </span>
                </div>
              </div>

              {/* Creator Filter Toolbar */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "10px",
                backgroundColor: "#f8fafc",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", marginRight: "4px" }}>
                    Creator Filter:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCreatorFilter("All")}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "none",
                      backgroundColor: creatorFilter === "All" ? "#1e3a8a" : "#e2e8f0",
                      color: creatorFilter === "All" ? "#ffffff" : "#475569"
                    }}
                  >
                    All Creators ({allUbtSets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatorFilter("Super Admin")}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "none",
                      backgroundColor: creatorFilter === "Super Admin" ? "#2563eb" : "#e2e8f0",
                      color: creatorFilter === "Super Admin" ? "#ffffff" : "#475569"
                    }}
                  >
                    Super Admin ({superAdminUbtCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatorFilter("Institutes")}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "none",
                      backgroundColor: creatorFilter === "Institutes" ? "#7c3aed" : "#e2e8f0",
                      color: creatorFilter === "Institutes" ? "#ffffff" : "#475569"
                    }}
                  >
                    Institute Buckets ({instituteUbtCount})
                  </button>
                </div>

                {instituteCreators.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
                      Institute:
                    </label>
                    <select
                      value={instituteCreators.includes(creatorFilter) ? creatorFilter : ""}
                      onChange={(e) => setCreatorFilter(e.target.value || "All")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12px",
                        backgroundColor: "#ffffff",
                        color: "#1e293b",
                        fontWeight: "600"
                      }}
                    >
                      <option value="">All Institutes</option>
                      {instituteCreators.map((inst, idx) => (
                        <option key={idx} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {ubtSetsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <p style={{ fontSize: "16px", margin: "0 0 8px 0" }}>No UBT sets match the current creator filter.</p>
                  <p style={{ fontSize: "13px", margin: 0 }}>Select "All Creators" or create a new set above.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#1e3a8a", color: "#ffffff", textAlign: "center" }}>
                        <th style={{ padding: "12px 14px", textAlign: "center", borderRadius: "6px 0 0 0" }}>S.N.</th>
                        <th style={{ padding: "12px 14px", textAlign: "center" }}>UBT Set Name</th>
                        <th style={{ padding: "12px 14px", textAlign: "center" }}>Package</th>
                        <th style={{ padding: "12px 14px", textAlign: "center" }}>Creator / Bucket</th>
                        <th style={{ padding: "12px 14px", textAlign: "center" }}>Visibility / Access</th>
                        <th style={{ padding: "12px 14px", textAlign: "center" }}>Reading (Target 20)</th>
                        <th style={{ padding: "12px 14px", textAlign: "center" }}>Listening (Target 20)</th>
                        <th style={{ padding: "12px 14px", textAlign: "center" }}>Total Status</th>
                        <th style={{ padding: "12px 14px", textAlign: "center", borderRadius: "0 6px 0 0" }}>Super Admin Authority & Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ubtSetsList.map((setObj, idx) => {
                        const counts = getSetQuestionCounts(setObj);
                        const isSelectedForView = (effectiveUbtViewingSet || "").trim().toUpperCase() === (setObj.name || "").trim().toUpperCase();
                        return (
                          <tr
                            key={setObj.id || idx}
                            style={{
                              borderBottom: "1px solid #e2e8f0",
                              backgroundColor: isSelectedForView ? "#f0fdf4" : "transparent",
                              transition: "background-color 0.15s ease",
                              textAlign: "center"
                            }}
                          >
                            <td style={{ padding: "12px 14px", fontWeight: "600", color: "#64748b", textAlign: "center" }}>{idx + 1}</td>
                            <td style={{ padding: "12px 14px", fontWeight: "700", color: "#1e3a8a", textAlign: "center" }}>
                              {setObj.name}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#475569", textAlign: "center" }}>{setObj.packageName || "Full Set UBT"}</td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              {renderCreatorBadge(setObj)}
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              {renderVisibilityBadge(setObj)}
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "12.5px",
                                fontWeight: "700",
                                backgroundColor: counts.reading === 20 ? "#dcfce7" : "#fef3c7",
                                color: counts.reading === 20 ? "#166534" : "#92400e"
                              }}>
                                {counts.reading} / 20 Reading
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "12.5px",
                                fontWeight: "700",
                                backgroundColor: counts.listening === 20 ? "#dcfce7" : "#fef3c7",
                                color: counts.listening === 20 ? "#166534" : "#92400e"
                              }}>
                                {counts.listening} / 20 Listening
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                borderRadius: "6px",
                                fontSize: "12.5px",
                                fontWeight: "700",
                                backgroundColor: counts.isComplete ? "#dbeafe" : "#f1f5f9",
                                color: counts.isComplete ? "#1e40af" : "#475569"
                              }}>
                                {counts.total} / 40 {counts.isComplete ? "Ready" : "Incomplete"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                                {renderPublishAuthorityButton(setObj)}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUbtSetForView(setObj.name);
                                    const el = document.getElementById("admin-ubt-questions-section");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  style={{
                                    backgroundColor: isSelectedForView ? "#15803d" : "#f1f5f9",
                                    color: isSelectedForView ? "#ffffff" : "#1e3a8a",
                                    border: isSelectedForView ? "1px solid #166534" : "1px solid #cbd5e1",
                                    padding: "6px 11px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px"
                                  }}
                                >
                                  <EyeIcon size={12} />
                                  <span>{isSelectedForView ? "Viewing Qs" : "View Questions"}</span>
                                </button>
                                <button
                                  onClick={() => handleSelectSetForUpload(setObj)}
                                  style={{
                                    backgroundColor: "#2563eb",
                                    color: "#ffffff",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "700"
                                  }}
                                >
                                  Upload / Edit Questions
                                </button>
                                <button
                                  onClick={() => handleDeleteSet(setObj.id, setObj.name)}
                                  style={{
                                    backgroundColor: "#fee2e2",
                                    color: "#dc2626",
                                    border: "1px solid #fca5a5",
                                    padding: "6px 10px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ======================================================== */}
              {/* QUESTIONS LIST OF SELECTED SET (BELOW UBT SET LIST)      */}
              {/* ======================================================== */}
              <div id="admin-ubt-questions-section" style={{ marginTop: "32px", borderTop: "2px solid #e2e8f0", paddingTop: "24px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "16px",
                  backgroundColor: "#f8fafc",
                  padding: "16px 20px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "800", color: "#64748b", letterSpacing: "0.5px" }}>
                        Questions Explorer
                      </div>
                      <h4 style={{ margin: "2px 0 0 0", color: "#0f172a", fontSize: "17px", fontWeight: "800" }}>
                        Questions in Set: <span style={{ color: "#2563eb" }}>{effectiveUbtViewingSet || "None Selected"}</span>
                      </h4>
                    </div>

                    {allUbtSets.length > 1 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#475569" }}>Switch Set:</span>
                        <select
                          value={effectiveUbtViewingSet}
                          onChange={(e) => setSelectedUbtSetForView(e.target.value)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1.5px solid #cbd5e1",
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#1e3a8a",
                            backgroundColor: "#ffffff",
                            cursor: "pointer"
                          }}
                        >
                          {allUbtSets.map((s, idx) => {
                            const c = getSetQuestionCounts(s);
                            return (
                              <option key={s.id || idx} value={s.name}>
                                {s.name} ({c.total}/40 Qs - {s.creatorInstituteName || "Super Admin"})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{
                        backgroundColor: "#dbeafe",
                        color: "#1e40af",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "700"
                      }}>
                        {ubtViewingQuestions.length} Questions
                      </span>
                      <span style={{
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "700"
                      }}>
                        {ubtViewingReadingCount} Reading
                      </span>
                      <span style={{
                        backgroundColor: "#f3e8ff",
                        color: "#6b21a8",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "700"
                      }}>
                        {ubtViewingListeningCount} Listening
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        const targetSet = sets.find(s => (s.name || "").trim().toUpperCase() === ubtViewingSetUpper);
                        if (targetSet) {
                          handleSelectSetForUpload(targetSet);
                        } else {
                          setFilterSet(effectiveUbtViewingSet);
                          handleTabChange("uploadQuestions");
                        }
                      }}
                      style={{
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontWeight: "700",
                        fontSize: "12.5px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <EditIcon size={13} color="#ffffff" />
                      <span>Open in Question Editor</span>
                    </button>
                  </div>
                </div>

                {ubtViewingQuestions.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    border: "1.5px dashed #cbd5e1"
                  }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: "700", color: "#475569" }}>
                      No questions found in {effectiveUbtViewingSet} yet.
                    </p>
                    <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b" }}>
                      Click below to open in the Question Editor or initialize the 40 questions template.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const targetSet = sets.find(s => (s.name || "").trim().toUpperCase() === ubtViewingSetUpper);
                        if (targetSet) {
                          handleSelectSetForUpload(targetSet);
                        } else {
                          setFilterSet(effectiveUbtViewingSet);
                          handleTabChange("uploadQuestions");
                        }
                      }}
                      style={{
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      Start Adding Questions
                    </button>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", backgroundColor: "#ffffff" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#0f172a", color: "#ffffff", textAlign: "left" }}>
                          <th style={{ padding: "12px 14px", width: "85px", textAlign: "center" }}>Q.No</th>
                          <th style={{ padding: "12px 14px", width: "230px" }}>Question (Instruction)</th>
                          <th style={{ padding: "12px 14px", width: "260px" }}>Description & Media</th>
                          <th style={{ padding: "12px 14px", minWidth: "260px" }}>Options (① ② ③ ④)</th>
                          <th style={{ padding: "12px 14px", width: "160px" }}>Correct Answer</th>
                          <th style={{ padding: "12px 14px", width: "130px", textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ubtViewingQuestions.map((q, qIdx) => {
                          const qNum = Number(q.qIndex || q.questionHeading) || (qIdx + 1);
                          const isListening = q.type === "Listening" || qNum > 20;
                          const ansIdx = Number(q.answer !== undefined ? q.answer : 0);
                          const ansSymbols = ["①", "②", "③", "④"];
                          const rawAnsText = q.options?.[ansIdx];
                          const ansText = typeof rawAnsText === "string" ? rawAnsText : (rawAnsText?.text || "");

                          return (
                            <tr key={q.id || qIdx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              {/* Q.No */}
                              <td style={{ padding: "12px 14px", textAlign: "center", verticalAlign: "top" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                                  <span style={{
                                    backgroundColor: isListening ? "#7c3aed" : "#1e3a8a",
                                    color: "#ffffff",
                                    fontWeight: "800",
                                    fontSize: "13px",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    minWidth: "38px"
                                  }}>
                                    #{qNum}
                                  </span>
                                  <span style={{
                                    fontSize: "10.5px",
                                    fontWeight: "700",
                                    padding: "2px 7px",
                                    borderRadius: "10px",
                                    backgroundColor: isListening ? "#f3e8ff" : "#dbeafe",
                                    color: isListening ? "#6b21a8" : "#1e40af"
                                  }}>
                                    {isListening ? "Listening" : "Reading"}
                                  </span>
                                </div>
                              </td>

                              {/* Question Heading / Instruction */}
                              <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                                <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "13.5px", lineHeight: "1.45" }}>
                                  {q.mainHeading || `[ ${qNum} ] 다음을 읽고 알맞은 것을 고르십시오.`}
                                </div>
                              </td>

                              {/* Description & Media */}
                              <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {q.description ? (
                                    <div style={{
                                      backgroundColor: "#f8fafc",
                                      padding: "8px 10px",
                                      borderRadius: "6px",
                                      border: "1px solid #e2e8f0",
                                      fontSize: "12px",
                                      color: "#334155",
                                      maxHeight: "90px",
                                      overflowY: "auto",
                                      whiteSpace: "pre-wrap",
                                      lineHeight: "1.4"
                                    }}>
                                      {q.description}
                                    </div>
                                  ) : null}

                                  {q.image && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <img
                                        src={q.image}
                                        alt={`Q#${qNum} visual`}
                                        onClick={() => setPreviewImage(q.image)}
                                        style={{
                                          maxHeight: "65px",
                                          maxWidth: "120px",
                                          objectFit: "contain",
                                          borderRadius: "4px",
                                          border: "1px solid #cbd5e1",
                                          cursor: "pointer",
                                          backgroundColor: "#ffffff"
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setPreviewImage(q.image)}
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: "#2563eb",
                                          fontSize: "11px",
                                          cursor: "pointer",
                                          textDecoration: "underline",
                                          padding: 0
                                        }}
                                      >
                                        Enlarge
                                      </button>
                                    </div>
                                  )}

                                  {q.audio && (
                                    <div style={{ marginTop: "2px" }}>
                                      <audio src={q.audio} controls style={{ height: "28px", width: "100%", maxWidth: "210px" }} />
                                    </div>
                                  )}

                                  {!q.description && !q.image && !q.audio && (
                                    <span style={{ color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>
                                      No passage or media
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Options: All in ONE single unified box */}
                              <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                                <div style={{
                                  backgroundColor: "#f8fafc",
                                  border: "1.5px solid #cbd5e1",
                                  borderRadius: "8px",
                                  padding: "8px 10px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                  minWidth: "220px"
                                }}>
                                  {(q.options || []).map((opt, oIdx) => {
                                    const isCorrect = ansIdx === oIdx;
                                    const optText = typeof opt === "string" ? opt : (opt?.text || "");
                                    const optImg = typeof opt === "object" ? (opt?.image || "") : "";
                                    return (
                                      <div
                                        key={oIdx}
                                        style={{
                                          display: "flex",
                                          alignItems: "flex-start",
                                          gap: "8px",
                                          padding: "4px 8px",
                                          borderRadius: "5px",
                                          backgroundColor: isCorrect ? "#dcfce7" : "transparent",
                                          border: isCorrect ? "1px solid #86efac" : "1px solid transparent",
                                          fontSize: "12.5px",
                                          lineHeight: "1.4"
                                        }}
                                      >
                                        <span style={{
                                          fontWeight: "800",
                                          color: isCorrect ? "#15803d" : "#0284c7",
                                          fontSize: "13px",
                                          minWidth: "18px",
                                          flexShrink: 0
                                        }}>
                                          {ansSymbols[oIdx] || `${oIdx + 1}.`}
                                        </span>
                                        <div style={{ flex: 1, wordBreak: "break-word" }}>
                                          <span style={{
                                            color: isCorrect ? "#14532d" : "#1e293b",
                                            fontWeight: isCorrect ? "700" : "500"
                                          }}>
                                            {optText ? (
                                              <span dangerouslySetInnerHTML={{ __html: optText }} />
                                            ) : (
                                              <span style={{ color: "#94a3b8", fontStyle: "italic" }}>[empty]</span>
                                            )}
                                          </span>
                                          {isCorrect && (
                                            <span style={{
                                              marginLeft: "8px",
                                              fontSize: "10.5px",
                                              fontWeight: "700",
                                              color: "#16a34a",
                                              backgroundColor: "#ffffff",
                                              padding: "1px 6px",
                                              borderRadius: "10px",
                                              border: "1px solid #bbf7d0",
                                              display: "inline-block"
                                            }}>
                                              ✓ Answer
                                            </span>
                                          )}
                                          {optImg && (
                                            <div style={{ marginTop: "4px" }}>
                                              <img
                                                src={optImg}
                                                alt={`Opt ${oIdx + 1}`}
                                                onClick={() => setPreviewImage(optImg)}
                                                style={{
                                                  maxHeight: "45px",
                                                  maxWidth: "100%",
                                                  objectFit: "contain",
                                                  borderRadius: "4px",
                                                  border: "1px solid #cbd5e1",
                                                  cursor: "pointer",
                                                  marginTop: "2px"
                                                }}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>

                              {/* Answer */}
                              <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                  <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    backgroundColor: "#dcfce7",
                                    color: "#15803d",
                                    border: "1px solid #86efac",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    fontWeight: "800",
                                    fontSize: "12px",
                                    width: "fit-content"
                                  }}>
                                    <CheckCircleIcon size={13} color="#15803d" />
                                    Option {ansIdx + 1} ({ansSymbols[ansIdx] || `${ansIdx + 1}`})
                                  </span>
                                  {ansText && (
                                    <span style={{
                                      fontSize: "11px",
                                      color: "#334155",
                                      fontWeight: "600",
                                      lineHeight: "1.3",
                                      wordBreak: "break-word"
                                    }}>
                                      {ansText}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: "12px 14px", textAlign: "center", verticalAlign: "top" }}>
                                <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleEditQuestionFromTable(q)}
                                    title="Edit Question"
                                    style={{
                                      backgroundColor: "#2563eb",
                                      color: "#ffffff",
                                      border: "none",
                                      padding: "6px 10px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                      fontWeight: "700",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px"
                                    }}
                                  >
                                    <EditIcon size={12} color="#ffffff" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    title="Delete Question"
                                    style={{
                                      backgroundColor: "#fee2e2",
                                      color: "#dc2626",
                                      border: "1px solid #fecaca",
                                      padding: "6px 9px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                      fontWeight: "700",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px"
                                    }}
                                  >
                                    <TrashIcon size={12} color="#dc2626" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CHAPTER WISE SETS (CREATE & MANAGE)                */}
        {/* ======================================================== */}
        {activeTab === "chapterSets" && (
          <div>
            {/* Create Chapter Wise Set Form */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <BookIcon size={24} color="#065f46" />
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#065f46", fontWeight: "700" }}>Create New Chapter Wise Set</h2>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                    Create chapter-specific test sets (e.g. Chapter 1-2, Chapter 15, Chapterwise 01) with 20 Reading + 20 Listening questions
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateChapterSet}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                      Chapter Wise Set Name *
                    </label>
                    <input
                      type="text"
                      placeholder="E.G. CHAPTER 01 OR CHAPTERWISE 02"
                      value={chapterSetName}
                      onChange={(e) => setChapterSetName(e.target.value.toUpperCase())}
                      style={{ ...inputStyle, textTransform: "uppercase" }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                      Target Package
                    </label>
                    <select
                      value={chapterPackageName}
                      onChange={(e) => setChapterPackageName(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="30 Set Chapter UBT">30 Set Chapter UBT (Default)</option>
                      <option value="Chapterwise 12 set">Chapterwise 12 set</option>
                      <option value="Chapter wise">Chapter wise</option>
                      {packages
                        .filter(p => !["30 Set Chapter UBT", "Chapterwise 12 set", "Chapter wise"].includes(p.name))
                        .map((p, idx) => (
                          <option key={idx} value={p.name}>{p.name}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                      Chapter Topic / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EPS Book Chapter 1-2: 한글 익히기 & 안부 인사"
                      value={chapterNote}
                      onChange={(e) => setChapterNote(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "18px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="chapterAutoInit"
                    checked={chapterAutoInit}
                    onChange={(e) => setChapterAutoInit(e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="chapterAutoInit" style={{ fontSize: "13px", color: "#166534", fontWeight: "600", cursor: "pointer" }}>
                    <strong>Auto-initialize 40 Question slots</strong> (20 Reading + 20 Listening slots ready to upload/edit)
                  </label>
                </div>

                <button type="submit" style={{ ...primaryBtnStyle, backgroundColor: "#059669", backgroundImage: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}>
                  + Create Chapter Wise Set & Open Question Uploader
                </button>
              </form>
            </div>

            {/* List of Chapter Wise Sets */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "17px", color: "#0f172a", fontWeight: "700" }}>
                  Created Chapter Wise Sets ({chapterSetsList.length})
                </h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Practice Sets for EPS Textbook Chapters
                </span>
              </div>

              {chapterSetsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <p style={{ fontSize: "16px", margin: "0 0 8px 0" }}>No Chapter Wise sets created yet.</p>
                  <p style={{ fontSize: "13px", margin: 0 }}>Use the form above to create your first chapter-wise set!</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#065f46", color: "#ffffff", textAlign: "left" }}>
                        <th style={{ padding: "12px 14px", borderRadius: "6px 0 0 0" }}>S.N.</th>
                        <th style={{ padding: "12px 14px" }}>Chapter Set Name</th>
                        <th style={{ padding: "12px 14px" }}>Package</th>
                        <th style={{ padding: "12px 14px" }}>Reading Qs (Target 20)</th>
                        <th style={{ padding: "12px 14px" }}>Listening Qs (Target 20)</th>
                        <th style={{ padding: "12px 14px" }}>Total Status</th>
                        <th style={{ padding: "12px 14px", textAlign: "center", borderRadius: "0 6px 0 0" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chapterSetsList.map((setObj, idx) => {
                        const counts = getSetQuestionCounts(setObj);
                        return (
                          <tr key={setObj.id || idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "12px 14px", fontWeight: "600", color: "#64748b" }}>{idx + 1}</td>
                            <td style={{ padding: "12px 14px", fontWeight: "700", color: "#065f46" }}>
                              {setObj.name}
                              {setObj.note && <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>{setObj.note}</div>}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#475569" }}>{setObj.packageName || "30 Set Chapter UBT"}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "700",
                                backgroundColor: counts.reading === 20 ? "#dcfce7" : "#fef3c7",
                                color: counts.reading === 20 ? "#166534" : "#92400e"
                              }}>
                                {counts.reading} / 20 Reading
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "700",
                                backgroundColor: counts.listening === 20 ? "#dcfce7" : "#fef3c7",
                                color: counts.listening === 20 ? "#166534" : "#92400e"
                              }}>
                                {counts.listening} / 20 Listening
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "700",
                                backgroundColor: counts.isComplete ? "#dbeafe" : "#f1f5f9",
                                color: counts.isComplete ? "#1e40af" : "#475569"
                              }}>
                                {counts.total} / 40 Questions {counts.isComplete ? "(Ready)" : "(Incomplete)"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                <button
                                  onClick={() => handleSelectSetForUpload(setObj)}
                                  style={{
                                    backgroundColor: "#059669",
                                    color: "#ffffff",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "700"
                                  }}
                                >
                                  Upload / Edit Questions
                                </button>
                                <button
                                  onClick={() => handleDeleteSet(setObj.id, setObj.name)}
                                  style={{
                                    backgroundColor: "#fee2e2",
                                    color: "#dc2626",
                                    border: "1px solid #fca5a5",
                                    padding: "6px 10px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: UPLOAD QUESTIONS (20 READING & 20 LISTENING)       */}
        {/* ======================================================== */}
        {activeTab === "uploadQuestions" && (
          <div>
            {/* Target Set Selector & 20R + 20L Progress Bar */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#1e3a8a", fontWeight: "700" }}>
                    Question Uploader (20 Reading + 20 Listening)
                  </h3>
                  <p style={{ margin: "3px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                    Select any UBT set or Chapter Wise set and configure all 40 questions.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleManualGenerate40}
                    style={{
                      backgroundColor: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    Initialize 40 Qs Template (20R + 20L)
                  </button>
                </div>
              </div>

              {/* Set & Package selection */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Target Exam Set *
                  </label>
                  <select
                    value={filterSet}
                    onChange={(e) => {
                      const selName = (e.target.value || "").trim().toUpperCase();
                      setFilterSet(selName);
                      const targetObj = sets.find(s => (s.name || "").trim().toUpperCase() === selName);
                      if (targetObj) {
                        setFilterPackage(targetObj.packageName || "");
                        setTargetSetType(getSetType(targetObj));
                      }
                    }}
                    style={inputStyle}
                  >
                    <option value="">-- Choose Set --</option>
                    <optgroup label="UBT Sets">
                      {sets.filter(s => getSetType(s) === "UBT").map((s, idx) => (
                        <option key={idx} value={s.name}>
                          {s.name} ({s.packageName || 'UBT'}){s.creatorInstituteName && s.creatorInstituteName !== "Super Admin" ? ` - [${s.creatorInstituteName}${s.isPublished ? ' | Published' : ' | Private'}]` : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Chapter Wise Sets">
                      {sets.filter(s => getSetType(s) === "Chapterwise").map((s, idx) => (
                        <option key={idx} value={s.name}>
                          {s.name} ({s.packageName || 'Chapter'}){s.creatorInstituteName && s.creatorInstituteName !== "Super Admin" ? ` - [${s.creatorInstituteName}]` : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Package Name
                  </label>
                  <input
                    type="text"
                    value={filterPackage}
                    onChange={(e) => setFilterPackage(e.target.value)}
                    style={{ ...inputStyle, backgroundColor: "#f8fafc" }}
                    placeholder="Package name auto-populated"
                  />
                </div>
              </div>

              {/* 20 Reading + 20 Listening Progress Indicator */}
              <div style={{ backgroundColor: "#f8fafc", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e3a8a" }}>
                      Active Set: {filterSet || "None Selected"}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", backgroundColor: targetSetType === "UBT" ? "#dbeafe" : "#dcfce7", color: targetSetType === "UBT" ? "#1e40af" : "#166534" }}>
                      {targetSetType === "UBT" ? "UBT Set" : "Chapter Wise Set"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      backgroundColor: targetSetCounts.reading === 20 ? "#dcfce7" : "#fef3c7",
                      color: targetSetCounts.reading === 20 ? "#166534" : "#b45309"
                    }}>
                      Reading: {targetSetCounts.reading} / 20
                    </span>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      backgroundColor: targetSetCounts.listening === 20 ? "#dcfce7" : "#fef3c7",
                      color: targetSetCounts.listening === 20 ? "#166534" : "#b45309"
                    }}>
                      Listening: {targetSetCounts.listening} / 20
                    </span>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      backgroundColor: targetSetCounts.isComplete ? "#2563eb" : "#94a3b8",
                      color: "#ffffff"
                    }}>
                      Total: {targetSetCounts.total} / 40 {targetSetCounts.isComplete && "(Complete)"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: "10px", backgroundColor: "#e2e8f0", borderRadius: "5px", overflow: "display", display: "flex" }}>
                  <div
                    title={`Reading: ${targetSetCounts.reading}/20`}
                    style={{
                      width: `${(Math.min(targetSetCounts.reading, 20) / 40) * 100}%`,
                      backgroundColor: "#2563eb",
                      transition: "width 0.3s ease"
                    }}
                  />
                  <div
                    title={`Listening: ${targetSetCounts.listening}/20`}
                    style={{
                      width: `${(Math.min(targetSetCounts.listening, 20) / 40) * 100}%`,
                      backgroundColor: "#16a34a",
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Question Upload & Edit Form */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>
                  {editingQuestionId ? `Edit Question #${qNumber}` : `Upload Question #${qNumber}`}
                </h3>

                {editingQuestionId && (
                  <button
                    onClick={() => {
                      setEditingQuestionId(null);
                      setQForm({
                        mainHeading: "[1~2] 다음 내용과 관계있는 그림을 고르십시오.",
                        questionHeading: String(qNumber),
                        description: "",
                        image: "",
                        audio: "",
                        options: [
                          { text: "", audio: "", image: "", video: "" },
                          { text: "", audio: "", image: "", video: "" },
                          { text: "", audio: "", image: "", video: "" },
                          { text: "", audio: "", image: "", video: "" }
                        ],
                        answer: 0
                      });
                    }}
                    style={{ ...secondaryBtnStyle, backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}
                  >
                    Cancel Edit Mode
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveQuestion}>
                {/* Section Toggle & Question Number */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "18px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  {/* Question Section Toggle (Reading Q1-Q20 vs Listening Q21-Q40) */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                      Exam Section
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionListType("Reading");
                          if (qNumber > 20) handleQNumberChange(1);
                        }}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "6px",
                          fontWeight: "700",
                          fontSize: "13px",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: questionListType === "Reading" ? "#2563eb" : "#e2e8f0",
                          color: questionListType === "Reading" ? "#ffffff" : "#475569"
                        }}
                      >
                        Reading (Q1~Q20)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionListType("Listening");
                          if (qNumber <= 20) handleQNumberChange(21);
                        }}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "6px",
                          fontWeight: "700",
                          fontSize: "13px",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: questionListType === "Listening" ? "#16a34a" : "#e2e8f0",
                          color: questionListType === "Listening" ? "#ffffff" : "#475569"
                        }}
                      >
                        Listening (Q21~Q40)
                      </button>
                    </div>
                  </div>

                  {/* Question Number (1 to 40) */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                      Question Number (1 - 40) *
                    </label>
                    <select
                      value={qNumber}
                      onChange={(e) => handleQNumberChange(Number(e.target.value))}
                      style={inputStyle}
                    >
                      <optgroup label="Reading Questions (1 to 20)">
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>Q{n} - Reading</option>
                        ))}
                      </optgroup>
                      <optgroup label="Listening Questions (21 to 40)">
                        {Array.from({ length: 20 }, (_, i) => i + 21).map(n => (
                          <option key={n} value={n}>Q{n} - Listening</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Korean Main Heading Input */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Korean Main Heading *
                  </label>
                  <input
                    type="text"
                    value={qForm.mainHeading}
                    onChange={(e) => setQForm({ ...qForm, mainHeading: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. [1~2] 다음 내용과 관계있는 그림을 고르십시오."
                    required
                  />
                </div>

                {/* Description / Text Passage */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Passage / Description / Dialogue (Supports paste image via Ctrl+V)
                  </label>
                  <textarea
                    value={qForm.description}
                    onChange={(e) => setQForm({ ...qForm, description: e.target.value })}
                    onPaste={(e) => handleImagePaste(e, (img) => setQForm({ ...qForm, image: img }))}
                    style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                    placeholder="Enter question text, dialogue, or passage here..."
                  />
                </div>

                {/* Media Uploads Grid: Image & Audio */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                  {/* Image Upload Drop Zone */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#1e3a8a" }}>
                      Question Image (Reading/Listening)
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer?.files?.[0];
                        if (file) processFileToDataURL(file, (img) => setQForm({ ...qForm, image: img }));
                      }}
                      style={{
                        border: dragOver ? "2px dashed #2563eb" : "2px dashed #cbd5e1",
                        backgroundColor: dragOver ? "#eff6ff" : "#f8fafc",
                        padding: "16px",
                        textAlign: "center",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#475569", fontWeight: "600" }}>
                        Drag & drop image here, paste with Ctrl+V, or browse:
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => processFileToDataURL(e.target.files[0], (img) => setQForm({ ...qForm, image: img }))}
                        style={{ fontSize: "12px" }}
                      />
                    </div>

                    {qForm.image && (
                      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={qForm.image}
                          alt="Preview"
                          style={{ maxHeight: "80px", maxWidth: "160px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        />
                        <button
                          type="button"
                          onClick={() => setQForm({ ...qForm, image: "" })}
                          style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Audio Upload Drop Zone (Especially for Listening) */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#166534" }}>
                      Listening Audio File (.mp3) {questionListType === "Listening" && <span style={{ color: "#dc2626" }}>* Required for Listening</span>}
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setAudioDragOver(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setAudioDragOver(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setAudioDragOver(false);
                        const file = e.dataTransfer?.files?.[0];
                        if (file) processFileToDataURL(file, (aud) => setQForm({ ...qForm, audio: aud }));
                      }}
                      style={{
                        border: audioDragOver ? "2px dashed #16a34a" : "2px dashed #cbd5e1",
                        backgroundColor: audioDragOver ? "#f0fdf4" : "#f8fafc",
                        padding: "16px",
                        textAlign: "center",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#475569", fontWeight: "600" }}>
                        Drag & drop audio (.mp3), or choose file:
                      </p>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => processFileToDataURL(e.target.files[0], (aud) => setQForm({ ...qForm, audio: aud }))}
                        style={{ fontSize: "12px" }}
                      />
                    </div>

                    {qForm.audio && (
                      <div style={{ marginTop: "10px" }}>
                        <audio controls src={qForm.audio} style={{ width: "100%", height: "36px" }} />
                        <button
                          type="button"
                          onClick={() => setQForm({ ...qForm, audio: "" })}
                          style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold", marginTop: "4px" }}
                        >
                          Remove Audio
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4 Options & Correct Answer Key - ALL IN ONE SINGLE BOX */}
                <div style={{
                  marginBottom: "20px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}>
                  {/* Box Header with Quick Paste Bar */}
                  <div style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1.5px solid #e2e8f0"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                      <label style={{ fontSize: "13.5px", fontWeight: "700", color: "#1e3a8a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>4 Options & Correct Answer Key (All in One Box):</span>
                      </label>
                      <span style={{ fontSize: "11.5px", color: "#166534", fontWeight: "600", backgroundColor: "#dcfce7", padding: "2px 8px", borderRadius: "10px" }}>
                        ✓ Click radio button to choose correct answer
                      </span>
                    </div>

                    {/* Quick Paste All Options In One Input Bar */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="📋 Quick Paste all 4 options here (e.g. ① 배추 ② 오이 ③ 채소 ④ 당근 or 1. 배추 2. 오이...)"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const parsed = parseMultiOptionText(val, 0);
                          if (parsed) {
                            const newOpts = [...qForm.options];
                            Object.keys(parsed).forEach(k => {
                              const oIdx = parseInt(k);
                              if (oIdx >= 0 && oIdx < 4) {
                                newOpts[oIdx] = { ...newOpts[oIdx], text: parsed[k] };
                              }
                            });
                            setQForm({ ...qForm, options: newOpts });
                            e.target.value = "";
                          }
                        }}
                        onPaste={(e) => {
                          const pasted = e.clipboardData?.getData("text");
                          if (pasted) {
                            const parsed = parseMultiOptionText(pasted, 0);
                            if (parsed) {
                              e.preventDefault();
                              const newOpts = [...qForm.options];
                              Object.keys(parsed).forEach(k => {
                                const oIdx = parseInt(k);
                                if (oIdx >= 0 && oIdx < 4) {
                                  newOpts[oIdx] = { ...newOpts[oIdx], text: parsed[k] };
                                }
                              });
                              setQForm({ ...qForm, options: newOpts });
                              e.target.value = "";
                            }
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "7px 12px",
                          borderRadius: "6px",
                          border: "1px dashed #0284c7",
                          backgroundColor: "#f0f9ff",
                          fontSize: "12px",
                          color: "#0369a1",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>

                  {/* 4 Options: 2 options above (Row 1), 2 options down (Row 2) */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "12px",
                    padding: "12px",
                    backgroundColor: "#f8fafc"
                  }}>
                    {qForm.options.map((opt, idx) => {
                      const isCorrect = qForm.answer === idx;
                      const symbols = ["①", "②", "③", "④"];
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            backgroundColor: isCorrect ? "#f0fdf4" : "#ffffff",
                            border: isCorrect ? "1.5px solid #16a34a" : "1px solid #e2e8f0",
                            borderLeft: isCorrect ? "4px solid #16a34a" : "4px solid #94a3b8",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                            transition: "all 0.15s ease",
                            display: "flex",
                            flexDirection: "column",
                            gap: (opt.text || opt.image) ? "6px" : "0"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", margin: 0, whiteSpace: "nowrap", flexShrink: 0 }}>
                              <input
                                type="radio"
                                name="adminCorrectAnswer"
                                checked={isCorrect}
                                onChange={() => setQForm({ ...qForm, answer: idx })}
                                style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#16a34a" }}
                              />
                              <span style={{ fontWeight: "700", fontSize: "13px", color: isCorrect ? "#166534" : "#1e3a8a" }}>
                                Option {idx + 1} {symbols[idx]}
                              </span>
                              {isCorrect && (
                                <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#166534", backgroundColor: "#dcfce7", padding: "1px 6px", borderRadius: "4px" }}>
                                  ✓
                                </span>
                              )}
                            </label>

                            <input
                              ref={(el) => (inputRefs.current[idx] = el)}
                              type="text"
                              placeholder={`Option ${idx + 1} text`}
                              value={opt.text}
                              onChange={(e) => {
                                const val = e.target.value;
                                const parsed = parseMultiOptionText(val, idx);
                                if (parsed) {
                                  const newOpts = [...qForm.options];
                                  Object.keys(parsed).forEach(k => {
                                    const oIdx = parseInt(k);
                                    if (oIdx >= 0 && oIdx < 4) {
                                      newOpts[oIdx] = { ...newOpts[oIdx], text: parsed[k] };
                                    }
                                  });
                                  setQForm({ ...qForm, options: newOpts });
                                  return;
                                }
                                const newOpts = [...qForm.options];
                                newOpts[idx] = { ...newOpts[idx], text: val };
                                setQForm({ ...qForm, options: newOpts });
                              }}
                              onPaste={(e) => {
                                const pasted = e.clipboardData?.getData("text");
                                if (pasted) {
                                  const parsed = parseMultiOptionText(pasted, idx);
                                  if (parsed) {
                                    e.preventDefault();
                                    const newOpts = [...qForm.options];
                                    Object.keys(parsed).forEach(k => {
                                      const oIdx = parseInt(k);
                                      if (oIdx >= 0 && oIdx < 4) {
                                        newOpts[oIdx] = { ...newOpts[oIdx], text: parsed[k] };
                                      }
                                    });
                                    setQForm({ ...qForm, options: newOpts });
                                  }
                                }
                              }}
                              style={{
                                ...inputStyle,
                                flex: 1,
                                minWidth: "120px",
                                padding: "8px 10px",
                                fontSize: "13px",
                                marginBottom: 0
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => applyUnderline(idx)}
                              style={{
                                backgroundColor: "#e2e8f0",
                                color: "#1e293b",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 10px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                flexShrink: 0
                              }}
                              title="Select text and click here to underline"
                            >
                              Underline
                            </button>

                            <label style={{
                              backgroundColor: "#e2e8f0",
                              color: "#1e293b",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: "600",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              flexShrink: 0
                            }}>
                              Attach Image
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    processFileToDataURL(file, (mediaUrl) => {
                                      const newOpts = [...qForm.options];
                                      newOpts[idx] = { ...newOpts[idx], image: mediaUrl };
                                      setQForm({ ...qForm, options: newOpts });
                                    });
                                  }
                                }}
                              />
                            </label>

                            {opt.image && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOpts = [...qForm.options];
                                  newOpts[idx] = { ...newOpts[idx], image: "" };
                                  setQForm({ ...qForm, options: newOpts });
                                }}
                                style={{ background: "#fee2e2", color: "#dc2626", border: "none", fontSize: "11px", padding: "8px 9px", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                                title="Remove Image"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {(opt.text || opt.image) && (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
                              {opt.text && (
                                <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                                  Preview: <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                                </div>
                              )}
                              {opt.image && (
                                <img
                                  src={opt.image}
                                  alt={`Opt ${idx + 1}`}
                                  style={{ maxHeight: "40px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ ...primaryBtnStyle, flex: 1, padding: "14px", fontSize: "15px" }}>
                    {editingQuestionId ? `Update Question #${qNumber}` : `Save Question #${qNumber} & Proceed`}
                  </button>
                </div>
              </form>
            </div>

            {/* List of 40 Questions Table for Current Set */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>
                    Questions in {filterSet || "Target Set"} ({currentSetQuestions.length} / 40)
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                    Target: 20 Reading questions (Q1~20) + 20 Listening questions (Q21~40)
                  </p>
                </div>

                {/* Sub-filter tabs */}
                <div style={{ display: "flex", gap: "6px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
                  <button
                    onClick={() => setQuestionSubFilter("All")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "12px",
                      backgroundColor: questionSubFilter === "All" ? "#1e3a8a" : "transparent",
                      color: questionSubFilter === "All" ? "#ffffff" : "#475569"
                    }}
                  >
                    All 40 Qs ({currentSetQuestions.length})
                  </button>
                  <button
                    onClick={() => setQuestionSubFilter("Reading")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "12px",
                      backgroundColor: questionSubFilter === "Reading" ? "#2563eb" : "transparent",
                      color: questionSubFilter === "Reading" ? "#ffffff" : "#475569"
                    }}
                  >
                    Reading ({targetSetCounts.reading}/20)
                  </button>
                  <button
                    onClick={() => setQuestionSubFilter("Listening")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "12px",
                      backgroundColor: questionSubFilter === "Listening" ? "#16a34a" : "transparent",
                      color: questionSubFilter === "Listening" ? "#ffffff" : "#475569"
                    }}
                  >
                    Listening ({targetSetCounts.listening}/20)
                  </button>
                </div>
              </div>

              {displayedSetQuestions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <p style={{ fontSize: "16px", margin: "0 0 10px 0" }}>No questions uploaded for this set yet.</p>
                  <button
                    onClick={handleManualGenerate40}
                    style={{ ...primaryBtnStyle, backgroundColor: "#16a34a" }}
                  >
                    Click to Initialize 40 Question Slots (20R + 20L)
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#1e293b", color: "#ffffff", textAlign: "left" }}>
                        <th style={{ padding: "12px 14px", width: "70px", borderRadius: "6px 0 0 0" }}>Q.No</th>
                        <th style={{ padding: "12px 14px", width: "110px" }}>Section</th>
                        <th style={{ padding: "12px 14px" }}>Main Korean Heading</th>
                        <th style={{ padding: "12px 14px" }}>Media</th>
                        <th style={{ padding: "12px 14px", width: "110px" }}>Answer</th>
                        <th style={{ padding: "12px 14px", textAlign: "center", width: "140px", borderRadius: "0 6px 0 0" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSetQuestions.map((q, idx) => {
                        const num = Number(q.questionHeading) || Number(q.qIndex) || idx + 1;
                        const isReading = q.type === "Reading";
                        return (
                          <tr key={q.id || idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "12px 14px", fontWeight: "700" }}>#{num}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontWeight: "700",
                                backgroundColor: isReading ? "#dbeafe" : "#dcfce7",
                                color: isReading ? "#1e40af" : "#166534"
                              }}>
                                {isReading ? "Reading" : "Listening"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", fontWeight: "600", color: "#1e3a8a" }}>
                              {q.mainHeading}
                              {q.description && (
                                <div style={{ fontSize: "12px", color: "#475569", fontWeight: "normal", marginTop: "2px" }}>
                                  {q.description.substring(0, 70)}...
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: "12px" }}>
                              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                {q.image && <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", backgroundColor: "#eff6ff", padding: "2px 6px", borderRadius: "4px" }}>IMG</span>}
                                {q.audio && <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", backgroundColor: "#f0fdf4", padding: "2px 6px", borderRadius: "4px" }}>MP3</span>}
                                {!q.image && !q.audio && <span style={{ color: "#94a3b8" }}>Text</span>}
                              </div>
                            </td>
                            <td style={{ padding: "12px 14px", fontWeight: "700", color: "#16a34a" }}>
                              Option {Number(q.answer) + 1} ({["①", "②", "③", "④"][q.answer] || "①"})
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                <button
                                  onClick={() => handleEditClick(q)}
                                  style={{ backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "5px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  style={{ backgroundColor: "#ef4444", color: "#ffffff", border: "none", padding: "5px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ALL SETS (COUNTS & COMPLETE OVERVIEW)              */}
        {/* ======================================================== */}
        {activeTab === "allSets" && (
          <div>
            {/* Prominent Statistics Cards Counting All Sets */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <div style={{ ...cardStyle, borderLeft: "5px solid #2563eb", marginBottom: 0 }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Total All Sets</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "28px", fontWeight: "800", color: "#1e3a8a" }}>
                  {totalAllSetsCount}
                </p>
                <span style={{ fontSize: "12px", color: "#64748b" }}>UBT + Chapterwise sets</span>
              </div>

              <div style={{ ...cardStyle, borderLeft: "5px solid #0284c7", marginBottom: 0 }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>UBT Sets Count</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "28px", fontWeight: "800", color: "#0284c7" }}>
                  {totalUbtSetsCount}
                </p>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Standard exam format</span>
              </div>

              <div style={{ ...cardStyle, borderLeft: "5px solid #059669", marginBottom: 0 }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Chapter Wise Sets Count</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "28px", fontWeight: "800", color: "#059669" }}>
                  {totalChapterSetsCount}
                </p>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Book chapter practice sets</span>
              </div>

              <div style={{ ...cardStyle, borderLeft: "5px solid #16a34a", marginBottom: 0 }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Ready Exam Sets</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "28px", fontWeight: "800", color: "#16a34a" }}>
                  {totalCompleteSetsCount}
                </p>
                <span style={{ fontSize: "12px", color: "#64748b" }}>All 40 Qs configured</span>
              </div>
            </div>

            {/* Overview Table with Filters */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>
                    All Created Exam Sets Overview ({filteredAllSets.length})
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                    Track all UBT and Chapter Wise sets and ensure 20 Reading + 20 Listening questions are ready
                  </p>
                </div>

                {/* Filter and Search */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <select
                    value={allSetsCategoryFilter}
                    onChange={(e) => setAllSetsCategoryFilter(e.target.value)}
                    style={{ ...inputStyle, width: "auto", padding: "8px 12px" }}
                  >
                    <option value="All">All Categories</option>
                    <option value="UBT">UBT Sets Only</option>
                    <option value="Chapterwise">Chapter Wise Only</option>
                  </select>

                  <select
                    value={allSetsCreatorFilter}
                    onChange={(e) => setAllSetsCreatorFilter(e.target.value)}
                    style={{ ...inputStyle, width: "auto", padding: "8px 12px" }}
                  >
                    <option value="All">All Creators</option>
                    <option value="Super Admin">Super Admin Only</option>
                    <option value="Institutes">Institute Buckets Only</option>
                    {instituteCreators.map((inst, idx) => (
                      <option key={idx} value={inst}>{inst}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Search by Set, Package, Creator..."
                    value={allSetsSearch}
                    onChange={(e) => setAllSetsSearch(e.target.value)}
                    style={{ ...inputStyle, width: "230px", padding: "8px 12px" }}
                  />
                </div>
              </div>

              {filteredAllSets.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <p style={{ fontSize: "15px", margin: 0 }}>No exam sets matching your filter.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#1e3a8a", color: "#ffffff", textAlign: "left" }}>
                        <th style={{ padding: "12px 14px", width: "60px", borderRadius: "6px 0 0 0" }}>S.N.</th>
                        <th style={{ padding: "12px 14px" }}>Set Name</th>
                        <th style={{ padding: "12px 14px" }}>Category</th>
                        <th style={{ padding: "12px 14px" }}>Package</th>
                        <th style={{ padding: "12px 14px" }}>Creator / Bucket</th>
                        <th style={{ padding: "12px 14px" }}>Visibility / Access</th>
                        <th style={{ padding: "12px 14px" }}>Reading (X/20)</th>
                        <th style={{ padding: "12px 14px" }}>Listening (Y/20)</th>
                        <th style={{ padding: "12px 14px" }}>Total Status</th>
                        <th style={{ padding: "12px 14px", textAlign: "center", borderRadius: "0 6px 0 0" }}>Super Admin Authority & Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAllSets.map((s, idx) => {
                        const counts = getSetQuestionCounts(s);
                        const sType = getSetType(s);
                        return (
                          <tr key={s.id || idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "12px 14px", fontWeight: "600", color: "#64748b" }}>{idx + 1}</td>
                            <td style={{ padding: "12px 14px", fontWeight: "700", color: sType === "UBT" ? "#1e3a8a" : "#065f46" }}>
                              {s.name}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                padding: "3px 9px",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontWeight: "700",
                                backgroundColor: sType === "UBT" ? "#dbeafe" : "#dcfce7",
                                color: sType === "UBT" ? "#1e40af" : "#166534"
                              }}>
                                {sType === "UBT" ? "UBT Set" : "Chapter Wise Set"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", color: "#475569" }}>{s.packageName || "N/A"}</td>
                            <td style={{ padding: "12px 14px" }}>
                              {renderCreatorBadge(s)}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              {renderVisibilityBadge(s)}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "10px",
                                fontSize: "12px",
                                fontWeight: "700",
                                backgroundColor: counts.reading === 20 ? "#dcfce7" : "#fef3c7",
                                color: counts.reading === 20 ? "#166534" : "#b45309"
                              }}>
                                {counts.reading} / 20
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "10px",
                                fontSize: "12px",
                                fontWeight: "700",
                                backgroundColor: counts.listening === 20 ? "#dcfce7" : "#fef3c7",
                                color: counts.listening === 20 ? "#166534" : "#b45309"
                              }}>
                                {counts.listening} / 20
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "700",
                                backgroundColor: counts.isComplete ? "#dcfce7" : "#fef9c3",
                                color: counts.isComplete ? "#166534" : "#854d0e"
                              }}>
                                {counts.total} / 40 {counts.isComplete ? "(Complete)" : "(Incomplete)"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                                {renderPublishAuthorityButton(s)}
                                <button
                                  onClick={() => handleSelectSetForUpload(s)}
                                  style={{
                                    backgroundColor: "#2563eb",
                                    color: "#ffffff",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "700"
                                  }}
                                >
                                  Manage Questions
                                </button>
                                <button
                                  onClick={() => handleDeleteSet(s.id, s.name)}
                                  style={{
                                    backgroundColor: "#fee2e2",
                                    color: "#dc2626",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: PACKAGES MANAGEMENT                                */}
        {/* ======================================================== */}
        {activeTab === "packages" && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#1e293b", fontSize: "18px" }}>Exam Packages</h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
              Define package bundles (e.g. Full Set UBT, 30 Set Chapter UBT) for institutes and students.
            </p>

            <form onSubmit={handleSavePackage} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Enter Package Name (e.g. 50 Set Mega UBT)"
                value={newPackageName}
                onChange={(e) => setNewPackageName(e.target.value)}
                style={{ ...inputStyle, width: "350px", marginBottom: 0 }}
                required
              />
              <button type="submit" style={primaryBtnStyle}>+ Add Package</button>
            </form>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1e293b", color: "#ffffff", textAlign: "left" }}>
                    <th style={{ padding: "12px 14px", width: "60px" }}>S.N.</th>
                    <th style={{ padding: "12px 14px" }}>Package Name</th>
                    <th style={{ padding: "12px 14px" }}>Associated Sets</th>
                    <th style={{ padding: "12px 14px", textAlign: "center", width: "120px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((p, idx) => {
                    const assocSets = sets.filter(s => s.packageName === p.name);
                    return (
                      <tr key={p.id || idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "12px 14px", fontWeight: "600", color: "#64748b" }}>{idx + 1}</td>
                        <td style={{ padding: "12px 14px", fontWeight: "700", color: "#1e3a8a" }}>{p.name}</td>
                        <td style={{ padding: "12px 14px", color: "#475569" }}>
                          {assocSets.length} sets ({assocSets.map(s => s.name).slice(0, 3).join(", ")}{assocSets.length > 3 ? "..." : ""})
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <button
                            onClick={() => handleDeletePackage(p.id)}
                            style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* BULK JSON IMPORT MODAL */}
      {showBulkModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }}>
          <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "12px", width: "90%", maxWidth: "650px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#1e3a8a", fontSize: "18px" }}>
              Bulk Upload Questions for "{filterSet}"
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
              Paste a JSON array of up to 40 questions (Q1~Q20 Reading, Q21~Q40 Listening).
            </p>

            <textarea
              value={bulkJsonInput}
              onChange={(e) => setBulkJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "qIndex": 1,\n    "type": "Reading",\n    "mainHeading": "[1~2] 다음 내용과 관계있는 그림을 고르십시오.",\n    "description": "병원입니다",\n    "options": ["①", "②", "③", "④"],\n    "answer": 0\n  }\n]`}
              style={{ ...inputStyle, height: "220px", fontFamily: "monospace", fontSize: "12px" }}
            />

            {bulkStatus && (
              <div style={{ margin: "10px 0", fontSize: "13px", fontWeight: "bold", color: bulkStatus.includes("Error") ? "#dc2626" : "#16a34a" }}>
                {bulkStatus}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => { setShowBulkModal(false); setBulkStatus(""); }}
                style={secondaryBtnStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                style={primaryBtnStyle}
              >
                Import Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF QUESTION UPLOAD MODAL */}
      <PdfQuestionUploadModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        targetSet={filterSet}
        targetPackage={filterPackage}
        availableSets={sets}
        onImportSuccess={handlePdfImportSuccess}
      />

      {/* IMAGE PREVIEW LIGHTBOX MODAL */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999999,
            padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff",
              padding: "16px",
              borderRadius: "10px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "10px", alignItems: "center" }}>
              <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>Visual Preview</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                style={{ background: "none", border: "none", fontSize: "18px", fontWeight: "bold", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>
            <img src={previewImage} alt="Visual Preview" style={{ maxWidth: "80vw", maxHeight: "75vh", objectFit: "contain", borderRadius: "6px" }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminQuestionManager() {
  return (
    <React.Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "#1e3a8a", fontWeight: "bold" }}>Loading Exam Sets & Question Manager...</div>}>
      <AdminQuestionManagerContent />
    </React.Suspense>
  );
}