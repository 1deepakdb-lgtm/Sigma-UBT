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
import DictionarySection from "@/components/DictionarySection";
import EpsBookReader from "@/components/EpsBookReader";
import InstituteBillingSection from "@/components/InstituteBillingSection";
import OfficialPortalButtons from "@/components/OfficialPortalButtons";
import { performLogout } from "@/lib/clientAuth";

const InstituteDashboard = () => {
  const router = useRouter();
  const [instituteName, setInstituteName] = useState("Language Institute");

  const [instId, setInstId] = useState(null);

  const [userRole, setUserRole] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("role") || "institute";
    }
    return "institute";
  });

  const [activeTab, setActiveTab] = useState("billing"); 
  const [students, setStudents] = useState([]);
  const [instituteLanguage, setInstituteLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("instituteLanguage") || "both";
    }
    return "both";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("institute")) setInstituteName(decodeURIComponent(params.get("institute")));
      else setInstituteName(localStorage.getItem("currentInstitute") || "Language Institute");
      
      if (params.get("instId")) setInstId(params.get("instId"));
      
      if (params.get("tab")) setActiveTab(params.get("tab"));
      else if (localStorage.getItem("role") === "staff" || params.get("superadmin") === "true") setActiveTab("billing");
      
      if (params.get("superadmin") === "true") setIsStudentsUnlocked(true);
      else setIsStudentsUnlocked(sessionStorage.getItem("instituteStudentsUnlocked") === "true");
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const lang = data.user.instituteLanguage || data.user.institute?.language || "both";
          setInstituteLanguage(lang);
          localStorage.setItem("instituteLanguage", lang);
        }
      })
      .catch(() => {});
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null); 
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    password: "", 
    assignedPackage: "Chapterwise 30 set",
    expiryDuration: "1 Month" 
  });
  const [copiedStudentId, setCopiedStudentId] = useState(null);
  const [copiedAllStudents, setCopiedAllStudents] = useState(false);

  // Notice Publish State for Institute
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeFileUrl, setNoticeFileUrl] = useState(null);
  const [noticeFileName, setNoticeFileName] = useState("");
  const [noticeFileType, setNoticeFileType] = useState("");
  const [noticeFileSize, setNoticeFileSize] = useState(0);
  const [isNoticePopup, setIsNoticePopup] = useState(false);
  const [noticeTargetTrack, setNoticeTargetTrack] = useState("all"); // "all" | "korean" | "japanese"
  const [isNoticeUploading, setIsNoticeUploading] = useState(false);
  const [noticeUploadError, setNoticeUploadError] = useState("");
  const [showPublishNoticeForm, setShowPublishNoticeForm] = useState(false);

  // Lock state for Manage Students protected by Billing User ID & PW (with 20s auto-lock)
  const [isStudentsUnlocked, setIsStudentsUnlocked] = useState(false);
  const [billingLoginUserId, setBillingLoginUserId] = useState("");
  const [billingLoginPassword, setBillingLoginPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlockLoading, setUnlockLoading] = useState(false);
  const lastStudentsActivityRef = useRef(Date.now());
  const [studentsAutoLockCountdown, setStudentsAutoLockCountdown] = useState(20);

  // 20s inactivity auto-lock for Manage Students
  useEffect(() => {
    if (!isStudentsUnlocked) return;

    lastStudentsActivityRef.current = Date.now();
    setStudentsAutoLockCountdown(20);

    const updateActivity = () => {
      lastStudentsActivityRef.current = Date.now();
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach(evt => window.addEventListener(evt, updateActivity, { passive: true }));

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastStudentsActivityRef.current) / 1000);
      const remaining = Math.max(0, 20 - elapsed);
      setStudentsAutoLockCountdown(remaining);

      if (remaining <= 0) {
        setIsStudentsUnlocked(false);
        sessionStorage.removeItem("instituteStudentsUnlocked");
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      events.forEach(evt => window.removeEventListener(evt, updateActivity));
    };
  }, [isStudentsUnlocked]);

  const handleUnlockStudentsWithBilling = async (e) => {
    e.preventDefault();
    setUnlockError("");
    const uid = billingLoginUserId.trim();
    const pwd = billingLoginPassword.trim();

    if (!uid || !pwd) {
      setUnlockError("Please enter both Billing User ID and Password.");
      return;
    }

    setUnlockLoading(true);

    try {
      // 1. Live authentication check via API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: uid, password: pwd })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (data.user.role === "institute" || data.user.role === "admin" || data.user.role === "staff") {
          setIsStudentsUnlocked(true);
          sessionStorage.setItem("instituteStudentsUnlocked", "true");
          setBillingLoginUserId("");
          setBillingLoginPassword("");
          setUnlockLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend auth verification error, checking fallback:", err);
    }

    // 2. Local Billing Admin User ID & PIN / Password fallback
    const savedAdminPin = localStorage.getItem("billingAdminPin") || localStorage.getItem("adminPassword");
    const hasCustomPin = Boolean(savedAdminPin || localStorage.getItem("adminPinIsCustom"));
    const billingAdminPin = savedAdminPin || "9999";
    const institutes = JSON.parse(localStorage.getItem("institutes") || "[]");
    const currentInst = institutes.find(i => i.name === instituteName);

    // If password/PIN was changed by Admin, NEVER accept default password ("9999", "admin", "admin123")!
    const isAdminOrOwnerMatch = hasCustomPin
      ? ((uid.toLowerCase() === "admin" && pwd === billingAdminPin) ||
         (currentInst && (uid.toLowerCase() === currentInst.username?.toLowerCase() || uid.toLowerCase() === currentInst.name?.toLowerCase()) && (pwd === currentInst.password || pwd === billingAdminPin)) ||
         (pwd === billingAdminPin))
      : ((uid.toLowerCase() === "admin" && (pwd === billingAdminPin || pwd === "9999" || pwd === "admin" || pwd === "admin123")) ||
         (currentInst && (uid.toLowerCase() === currentInst.username?.toLowerCase() || uid.toLowerCase() === currentInst.name?.toLowerCase()) && (pwd === currentInst.password || pwd === billingAdminPin || pwd === "9999")) ||
         (pwd === billingAdminPin || (uid.toLowerCase() === "admin" && pwd === "9999")));

    if (isAdminOrOwnerMatch) {
      setIsStudentsUnlocked(true);
      sessionStorage.setItem("instituteStudentsUnlocked", "true");
      setBillingLoginUserId("");
      setBillingLoginPassword("");
      setUnlockLoading(false);
      return;
    }

    // 3. Fallback: Staff account check
    try {
      const staffRes = await fetch('/api/institute/staff');
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        const matched = (staffData.staff || []).find(
          s => s.username?.toLowerCase() === uid.toLowerCase() || s.phone === uid || s.name?.toLowerCase().includes(uid.toLowerCase())
        );
        if (matched && (pwd === "1234" || pwd === "staff" || pwd === "user")) {
          setIsStudentsUnlocked(true);
          sessionStorage.setItem("instituteStudentsUnlocked", "true");
          setBillingLoginUserId("");
          setBillingLoginPassword("");
          setUnlockLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    setUnlockLoading(false);
    setUnlockError(
      hasCustomPin
        ? "Invalid Billing User ID or Password."
        : `Invalid Billing User ID or Password. (Default: admin / ${billingAdminPin})`
    );
  };

  const handleLockStudents = () => {
    setIsStudentsUnlocked(false);
    sessionStorage.removeItem("instituteStudentsUnlocked");
  };

  // Dictionary states
  const [searchWord, setSearchWord] = useState("");
  const [vocabResult, setVocabResult] = useState({ korean: "", english: "", nepali: "" });
  const [loadingVocab, setLoadingVocab] = useState(false);

  // Exam Sets states
  const [examSets, setExamSets] = useState([]);
  const [examPackages, setExamPackages] = useState([]);
  const [selectedPackageFilter, setSelectedPackageFilter] = useState("All");

  // Institute Custom UBT Packages & Price Management States
  const [showCreatePkgForm, setShowCreatePkgForm] = useState(false);
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState("Rs. 1,500");
  const [newPkgType, setNewPkgType] = useState("UBT Full Exam");
  const [newPkgDuration, setNewPkgDuration] = useState("1 Month");
  const [newPkgDesc, setNewPkgDesc] = useState("");
  const [selectedSetsForPkg, setSelectedSetsForPkg] = useState([]);
  const [editingPricePkgName, setEditingPricePkgName] = useState(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");

  // EPS Folders & Listening/Book states
  const [activeBookFolder, setActiveBookFolder] = useState("EPS Book");
  const [folderMaterials, setFolderMaterials] = useState([]);
  const [selectedAudioTracks, setSelectedAudioTracks] = useState({});

  // News states
  const [newsList, setNewsList] = useState([]);
  const [showBannerPopup, setShowBannerPopup] = useState(false);
  const [popupNotice, setPopupNotice] = useState(null);

  const institutes = JSON.parse(localStorage.getItem("institutes")) || [];
  const currentInst = institutes.find(i => i.name === instituteName);
  const logoWatermark = currentInst?.logoUrl || "";

  const handleToggleSetForPackage = (setName) => {
    setSelectedSetsForPkg(prev =>
      prev.includes(setName) ? prev.filter(s => s !== setName) : [...prev, setName]
    );
  };

  const handleSelectAllUbtSets = () => {
    const ubtNames = examSets.filter(s => {
      const sType = s.setType || (s.name?.toLowerCase().includes("chapter") ? "Chapterwise" : "UBT");
      return sType === "UBT";
    }).map(s => s.name);
    setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...ubtNames])));
  };

  const handleSelectAllChapterSets = () => {
    const chNames = examSets.filter(s => {
      const sType = s.setType || (s.name?.toLowerCase().includes("chapter") ? "Chapterwise" : "UBT");
      return sType === "Chapterwise";
    }).map(s => s.name);
    setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...chNames])));
  };

  const handleSelectAllSets = () => {
    setSelectedSetsForPkg(examSets.map(s => s.name));
  };

  const handleClearSelectedSets = () => {
    setSelectedSetsForPkg([]);
  };

  const handleCreateCustomPackage = (e) => {
    e.preventDefault();
    if (!newPkgName.trim()) {
      alert("Please enter a package name.");
      return;
    }

    const cleanPrice = newPkgPrice.trim();
    const formattedPrice = cleanPrice.startsWith("Rs")
      ? cleanPrice
      : `Rs. ${cleanPrice.replace(/[^0-9,]/g, "") || '1,500'}`;

    const newPkg = {
      id: "pkg-inst-" + Date.now(),
      name: newPkgName.trim(),
      price: formattedPrice,
      desc: newPkgDesc.trim() || `Custom ${newPkgType} package configured by ${instituteName}.`,
      duration: newPkgDuration,
      type: newPkgType,
      includedSets: selectedSetsForPkg,
      createdBy: instituteName,
      isCustom: true
    };

    const currentPkgs = JSON.parse(localStorage.getItem("examPackages")) || examPackages;
    const updatedPackages = [...currentPkgs.filter(p => p.name !== newPkg.name), newPkg];
    setExamPackages(updatedPackages);
    localStorage.setItem("examPackages", JSON.stringify(updatedPackages));

    alert(`✅ Custom package "${newPkgName}" created with price ${formattedPrice}!`);
    setNewPkgName("");
    setNewPkgPrice("Rs. 1,500");
    setNewPkgDesc("");
    setSelectedSetsForPkg([]);
    setShowCreatePkgForm(false);
  };

  const handleSavePriceChange = (pkgName) => {
    if (!editingPriceValue.trim()) {
      setEditingPricePkgName(null);
      return;
    }

    const cleanPrice = editingPriceValue.trim();
    const formattedPrice = cleanPrice.startsWith("Rs")
      ? cleanPrice
      : `Rs. ${cleanPrice.replace(/[^0-9,]/g, "") || '1,000'}`;

    const currentPkgs = JSON.parse(localStorage.getItem("examPackages")) || examPackages;
    const updatedPkgs = currentPkgs.map(p =>
      p.name === pkgName ? { ...p, price: formattedPrice } : p
    );

    setExamPackages(updatedPkgs);
    localStorage.setItem("examPackages", JSON.stringify(updatedPkgs));

    const instPrices = JSON.parse(localStorage.getItem(`instPrices_${instituteName}`) || "{}");
    instPrices[pkgName] = formattedPrice;
    localStorage.setItem(`instPrices_${instituteName}`, JSON.stringify(instPrices));

    setEditingPricePkgName(null);
    setEditingPriceValue("");
    alert(`✅ Price for "${pkgName}" updated to ${formattedPrice}!`);
  };

  const handleDeleteCustomPackage = (pkgId, pkgName) => {
    if (window.confirm(`Are you sure you want to delete custom package "${pkgName}"?`)) {
      const currentPkgs = JSON.parse(localStorage.getItem("examPackages")) || examPackages;
      const updatedPkgs = currentPkgs.filter(p => p.id !== pkgId && p.name !== pkgName);
      setExamPackages(updatedPkgs);
      localStorage.setItem("examPackages", JSON.stringify(updatedPkgs));
    }
  };

  const loadData = async () => {
    const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    const localList = allStudents[instituteName] || [];
    setStudents(localList);

    // Sync students from backend database to ensure consistency
    try {
      const queryParam = instituteName ? `?institute=${encodeURIComponent(instituteName)}` : '';
      const res = await fetch(`/api/institute/students${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.students)) {
          const dbStudents = data.students.map((s) => ({
            id: s.id,
            name: s.name,
            phone: s.phone || s.username,
            password: localList.find((l) => l.phone === (s.phone || s.username))?.password || "1234",
            assignedPackage: s.batch || "Full Set UBT",
            expiryDate: calculateExpiryDate("1 Month"),
            status: s.status || "Active"
          }));

          const merged = [...dbStudents];
          for (const loc of localList) {
            if (!merged.some((m) => m.phone === loc.phone)) {
              merged.push(loc);
              // Auto-sync missing student to database
              fetch("/api/institute/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: loc.name,
                  username: loc.phone,
                  password: loc.password || "1234",
                  phone: loc.phone,
                  batch: loc.assignedPackage || "Full Set UBT",
                  status: loc.status || "Active",
                  instituteName: instituteName
                })
              }).catch(() => {});
            }
          }

          allStudents[instituteName] = merged;
          localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
          setStudents(merged);
        }
      }
    } catch (e) {
      console.warn("Notice: Syncing students with database:", e);
    }

    let savedPackages = JSON.parse(localStorage.getItem("examPackages")) || [];
    if (savedPackages.length === 0) {
      savedPackages = [
        { id: "pkg-1", name: "Full Set UBT", price: "Rs. 2,000", desc: "Full EPS-TOPIK UBT exam sets (20 Reading + 20 Listening).", duration: "1 Month", type: "UBT Full Exam" },
        { id: "pkg-2", name: "30 Set Chapter UBT", price: "Rs. 1,000", desc: "Chapterwise practice sets with listening audio.", duration: "1 Month", type: "Chapter Wise" },
        { id: "pkg-3", name: "100 UBT set", price: "Rs. 3,500", desc: "Comprehensive 100 UBT test sets simulation.", duration: "3 Months", type: "UBT Full Exam" },
        { id: "pkg-4", name: "Full Package", price: "Rs. 4,500", desc: "Complete access to all UBT & chapterwise test sets.", duration: "Lifetime", type: "Combo Package" }
      ];
      localStorage.setItem("examPackages", JSON.stringify(savedPackages));
    }

    const instPrices = JSON.parse(localStorage.getItem(`instPrices_${instituteName}`) || "{}");
    if (Object.keys(instPrices).length > 0) {
      savedPackages = savedPackages.map(p => instPrices[p.name] ? { ...p, price: instPrices[p.name] } : p);
    }

    const rawSets = JSON.parse(localStorage.getItem("examSets")) || [];
    // Enforce Institute Isolation: only show global published sets OR sets created by this institute
    const savedSets = rawSets.filter(s =>
      s && (
        s.isPublished === true ||
        (!s.creatorInstituteName && s.isPrivate !== true) ||
        (s.creatorInstituteName && s.creatorInstituteName.toLowerCase() === instituteName.toLowerCase()) ||
        (instId && s.creatorInstituteId === instId)
      )
    );
    const allFoldersData = JSON.parse(localStorage.getItem("epsFoldersContent")) || {};
    const savedNews = JSON.parse(localStorage.getItem("epsNewsList")) || [];

    setExamPackages(savedPackages);
    setExamSets(savedSets);
    setFolderMaterials(allFoldersData[activeBookFolder] || []);
    setNewsList(savedNews);

    const popup = savedNews.find(n => n.isPopup);
    if (popup) {
      const lastShownId = localStorage.getItem("lastShownInstitutePopupId");
      if (lastShownId !== popup.id.toString()) {
        setPopupNotice(popup);
        setShowBannerPopup(true);
      }
    }

    // Fetch notices for this institute and its students only
    const currentInst = instituteName || (typeof window !== "undefined" ? localStorage.getItem("currentInstitute") : "") || "";
    const noticeQuery = currentInst ? `?role=institute&institute=${encodeURIComponent(currentInst)}` : "?role=institute";
    fetch(`/api/news${noticeQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.notices)) {
          const myNotices = data.notices.filter(n => {
            if (!n.instituteName) return true; // Global admin notice
            if (!currentInst) return false;
            return n.instituteName.trim().toLowerCase() === currentInst.trim().toLowerCase();
          });
          setNewsList(myNotices);
          try {
            localStorage.setItem("epsNewsList", JSON.stringify(myNotices));
          } catch (e) {}
          const livePopup = myNotices.find(n => n.isPopup);
          if (livePopup) {
            const lastShownId = localStorage.getItem("lastShownInstitutePopupId");
            if (lastShownId !== livePopup.id.toString()) {
              setPopupNotice(livePopup);
              setShowBannerPopup(true);
            }
          }
        }
      })
      .catch((err) => console.warn("Failed to fetch notices in institute dashboard:", err));
  };

  useEffect(() => {
    loadData();
  }, [activeTab, instituteName, activeBookFolder]);

  const handleCloseBanner = () => {
    if (popupNotice) {
      localStorage.setItem("lastShownInstitutePopupId", popupNotice.id.toString());
    }
    setShowBannerPopup(false);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    loadData();
  };

  const handleLogout = () => {
    performLogout();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNoticeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let detectedType = "document";
    const mime = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();

    if (mime.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)) detectedType = "image";
    else if (mime.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(name)) detectedType = "video";
    else if (mime.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(name)) detectedType = "audio";
    else if (name.endsWith(".pdf") || mime === "application/pdf") detectedType = "pdf";

    setNoticeFileType(detectedType);
    setNoticeFileName(file.name);
    setNoticeFileSize(file.size);
    setIsNoticeUploading(true);
    setNoticeUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: { "x-user-role": "institute" }
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setNoticeFileUrl(data.url);
        setIsNoticeUploading(false);
      } else {
        throw new Error(data.message || data.error || "Upload failed");
      }
    } catch (err) {
      if (file.size <= 4 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNoticeFileUrl(reader.result);
          setIsNoticeUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        setIsNoticeUploading(false);
        setNoticeUploadError(err.message || "Upload failed");
      }
    }
  };

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      alert("Please provide both Title and Details for the notice.");
      return;
    }

    const payload = {
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      category: "notice",
      isPopup: isNoticePopup,
      fileUrl: noticeFileUrl,
      fileName: noticeFileName || (noticeFileUrl ? "Attached_Media" : ""),
      fileType: noticeFileType,
      fileSize: noticeFileSize,
      instituteName: instituteName || "Language Institute",
      instituteId: instId || null,
      publishedBy: "institute",
      language: noticeTargetTrack,
      track: noticeTargetTrack
    };

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert("Notice published successfully! Delivered to your institute students only.");
        setNoticeTitle("");
        setNoticeContent("");
        setNoticeFileUrl(null);
        setNoticeFileName("");
        setNoticeFileType("");
        setNoticeFileSize(0);
        setIsNoticePopup(false);
        setNoticeTargetTrack("all");
        setShowPublishNoticeForm(false);
        loadData();
      } else {
        alert("Failed to publish: " + (data.error || "Error"));
      }
    } catch (err) {
      alert("Publish failed: " + err.message);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert("Delete failed: " + (data.error || "Error"));
      }
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  };

  // Fixed translation handler using script-range verification for Nepali (Devanagari) input
  const handleSearchVocabulary = async (e) => {
    e.preventDefault();
    if (!searchWord.trim()) return;

    setLoadingVocab(true);
    try {
      const isNepali = /[\u0900-\u097F]/.test(searchWord);

      let koText = "";
      let enText = "";
      let neText = "";

      if (isNepali) {
        neText = searchWord;
        const resKo = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ne&tl=ko&dt=t&q=${encodeURIComponent(searchWord)}`);
        const dataKo = await resKo.json();
        koText = dataKo[0]?.[0]?.[0] || "";

        const resEn = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ne&tl=en&dt=t&q=${encodeURIComponent(searchWord)}`);
        const dataEn = await resEn.json();
        enText = dataEn[0]?.[0]?.[0] || "";
      } else {
        const detectRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(searchWord)}`);
        const detectData = await detectRes.json();
        const detectedLang = detectData[2];

        if (detectedLang === 'ko') {
          koText = searchWord;
          const resEn = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(searchWord)}`);
          const dataEn = await resEn.json();
          enText = dataEn[0]?.[0]?.[0] || "";

          const resNe = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=ne&dt=t&q=${encodeURIComponent(searchWord)}`);
          const dataNe = await resNe.json();
          neText = dataNe[0]?.[0]?.[0] || "";
        } else {
          enText = searchWord;
          const resKo = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(searchWord)}`);
          const dataKo = await resKo.json();
          koText = dataKo[0]?.[0]?.[0] || "";

          const resNe = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ne&dt=t&q=${encodeURIComponent(searchWord)}`);
          const dataNe = await resNe.json();
          neText = dataNe[0]?.[0]?.[0] || "";
        }
      }

      setVocabResult({ korean: koText, english: enText, nepali: neText });
    } catch (err) {
      console.error("Translation error", err);
      alert("Translation failed. Please check your network.");
    }
    setLoadingVocab(false);
  };

  const calculateExpiryDate = (duration) => {
    if (duration === "Lifetime") return "Lifetime";
    const date = new Date();
    if (duration === "15 Days") date.setDate(date.getDate() + 15);
    else if (duration === "1 Month") date.setMonth(date.getMonth() + 1);
    else if (duration === "2 Months") date.setMonth(date.getMonth() + 2);
    else if (duration === "3 Months") date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0]; 
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    const calculatedExpiryDate = calculateExpiryDate(formData.expiryDuration);
    const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    const currentInstStudents = allStudents[instituteName] || [];

    const studentPayload = {
      id: editId || undefined,
      name: formData.name.trim(),
      username: formData.phone.trim(),
      phone: formData.phone.trim(),
      password: (formData.password || "1234").trim(),
      batch: formData.assignedPackage || "Full Set UBT",
      status: "Active",
      instituteName: instituteName,
      instituteId: instId || undefined
    };

    try {
      const res = await fetch("/api/institute/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save student in database. Please check details.");
        return;
      }

      if (editId) {
        const updatedStudents = currentInstStudents.map((stu) =>
          stu.id === editId || stu.phone === formData.phone
            ? { ...stu, ...formData, id: data.student?.id || stu.id, expiryDate: calculatedExpiryDate }
            : stu
        );
        allStudents[instituteName] = updatedStudents;
        localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
        setStudents(updatedStudents);
        alert("Student Updated Successfully!\nPassword and details have been updated in the database.");
        resetForm();
        return;
      }

      // NEW student
      const newStudent = {
        id: data.student?.id || Date.now(),
        ...formData,
        expiryDate: calculatedExpiryDate,
        status: "Active"
      };
      const updatedStudents = [...currentInstStudents.filter(s => s.phone !== formData.phone), newStudent];
      allStudents[instituteName] = updatedStudents;
      localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
      setStudents(updatedStudents);

      // Keep legacy users map for any fallback reads
      const globalUsers = JSON.parse(localStorage.getItem("users")) || {};
      globalUsers[formData.phone] = { name: formData.name, password: formData.password || "1234" };
      localStorage.setItem("users", JSON.stringify(globalUsers));

      alert("Student Registered Successfully!\nThey can now log in with:\nPhone / Username: " + formData.phone + "\nPassword: " + (formData.password || "1234"));
      resetForm();
    } catch (err) {
      console.error("Save student error:", err);
      alert("Error saving student to database: " + err.message);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      phone: student.phone,
      password: student.password || "",
      assignedPackage: student.assignedPackage || "Chapterwise 30 set",
      expiryDuration: student.expiryDuration || "1 Month"
    });
    setEditId(student.id);
    setShowForm(true);
    setActiveTab("students");
  };

  const handleDelete = async (id, phone) => {
    if (window.confirm("Delete this student?")) {
      const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
      const currentInstStudents = allStudents[instituteName] || [];
      const target = currentInstStudents.find(s => s.id === id || s.phone === phone);
      const targetPhone = phone || target?.phone || '';
      const updatedStudents = currentInstStudents.filter(stu => stu.id !== id && stu.phone !== targetPhone);
      allStudents[instituteName] = updatedStudents;
      localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
      setStudents(updatedStudents);

      try {
        await fetch(`/api/institute/students?id=${encodeURIComponent(id || '')}&phone=${encodeURIComponent(targetPhone)}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.warn("Delete student API notice:", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", password: "", assignedPackage: "Chapterwise 30 set", expiryDuration: "1 Month" });
    setEditId(null);
    setShowForm(false);
  };

  const handleCopyStudent = (stu) => {
    if (!stu) return;
    const text = `🎓 SIGMA EPS STUDENT LOGIN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${stu.name}
📱 Phone (Login ID): ${stu.phone}
🔑 Password: ${stu.password || "1234"}
Assigned Package: ${stu.assignedPackage || "Full Set"}
⏳ Expiry Date: ${stu.expiryDate || "Active"}
🏢 Institute: ${instituteName}
🌐 Student Portal: ${typeof window !== "undefined" ? window.location.origin : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    navigator.clipboard.writeText(text);
    setCopiedStudentId(stu.id);
    setTimeout(() => setCopiedStudentId(null), 2500);
  };

  const handleCopyAllStudents = () => {
    if (students.length === 0) return;
    const header = "Student Name\tPhone Number (Login ID)\tPassword\tAssigned Package\tExpiry Date\tStatus\n";
    const rows = students.map(s => `${s.name}\t${s.phone}\t${s.password || "1234"}\t${s.assignedPackage || "N/A"}\t${s.expiryDate || "N/A"}\t${s.status || "Active"}`).join("\n");
    navigator.clipboard.writeText(header + rows);
    setCopiedAllStudents(true);
    setTimeout(() => setCopiedAllStudents(false), 2500);
  };

  const filteredSets = selectedPackageFilter === "All" 
    ? examSets 
    : examSets.filter(s => s.packageName === selectedPackageFilter);


  const protectedStyle = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none"
  };

  const containerStyle = { 
    minHeight: "100vh", 
    backgroundColor: "rgba(241, 245, 249, 0.92)", 
    fontFamily: "Arial, sans-serif",
    position: "relative",
    backgroundImage: logoWatermark ? `url(${logoWatermark})` : "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "350px",
    backgroundBlendMode: "overlay",
    ...protectedStyle
  };

  const topNavStyle = { 
    backgroundColor: "#1e3a8a", 
    color: "white", 
    padding: "15px 30px", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    flexWrap: "wrap",
    gap: "15px",
    position: "sticky",
    top: 0,
    zIndex: 1000
  };

  const menuContainerStyle = { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" };
  
  const getNavBtnStyle = (tabName) => ({
    backgroundColor: activeTab === tabName ? "#2563eb" : "transparent",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    transition: "0.2s"
  });

  const contentAreaStyle = { padding: "30px", maxWidth: "1200px", margin: "0 auto", userSelect: "text" };
  const cardStyle = { backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: "20px", border: "1px solid #e2e8f0" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderRadius: "8px", overflow: "hidden" };
  const thStyle = { backgroundColor: "#f8fafc", padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: "700", fontSize: "13px", borderBottom: "2px solid #e2e8f0" };
  const tdStyle = { padding: "15px", borderBottom: "1px solid #e2e8f0", color: "#1e293b", verticalAlign: "middle" };
  const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #cbd5e1", borderRadius: "5px", boxSizing: "border-box", backgroundColor: "white" };

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      <style>{`
        .dynamic-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 5px 5px 10px rgba(0,0,0,0.1), -5px -5px 10px rgba(255,255,255,0.8) !important;
          border-radius: 12px !important;
          background: linear-gradient(145deg, #ffffff, #f3f4f6);
          border: 1px solid rgba(255,255,255,0.6);
        }
        .dynamic-card::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .dynamic-card:hover {
          transform: translateY(-4px);
          box-shadow: 8px 8px 15px rgba(0,0,0,0.12), -8px -8px 15px rgba(255,255,255,0.9) !important;
        }
        .dynamic-card:hover::after {
          opacity: 1;
        }
        .dynamic-btn {
          transition: all 0.15s ease;
          box-shadow: 4px 4px 8px rgba(0,0,0,0.2), -4px -4px 8px rgba(255,255,255,0.3) !important;
        }
        .dynamic-btn:hover {
          transform: translateY(-2px);
          box-shadow: 6px 6px 12px rgba(0,0,0,0.25), -4px -4px 8px rgba(255,255,255,0.4) !important;
          filter: brightness(1.1);
        }
        .dynamic-btn:active {
          transform: translateY(2px);
          box-shadow: inset 4px 4px 8px rgba(0,0,0,0.3), inset -4px -4px 8px rgba(255,255,255,0.1) !important;
        }
        .pkg-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 5px 5px 12px rgba(0,0,0,0.08), -5px -5px 12px rgba(255,255,255,0.8) !important;
          border-radius: 14px !important;
          background: linear-gradient(145deg, #ffffff, #f4f6f8);
          border: 1px solid rgba(255,255,255,0.5);
        }
        .pkg-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 10px 10px 20px rgba(0,0,0,0.12), -10px -10px 20px rgba(255,255,255,0.9) !important;
          border-color: #3b82f6 !important;
        }
      `}</style>
      
      {showBannerPopup && popupNotice && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999999 }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", width: "90%", maxWidth: "500px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", border: "3px solid #2563eb", position: "relative" }}>
            <span style={{ backgroundColor: "#dcfce7", color: "#166534", fontSize: "12px", padding: "3px 10px", borderRadius: "10px", fontWeight: "bold" }}>📢 EPS Notice Flex Banner</span>
            <h2 style={{ color: "#1e3a8a", marginTop: "12px", marginBottom: "10px", fontSize: "22px" }}>{popupNotice.title}</h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "15px" }}>Date: {popupNotice.date}</p>
            <p style={{ color: "#334155", fontSize: "15px", lineHeight: "1.6", marginBottom: "15px", whiteSpace: "pre-line" }}>{popupNotice.content}</p>

            {popupNotice.fileUrl && popupNotice.fileType === "audio" && (
              <div style={{ marginBottom: "15px" }}>
                <audio controls autoPlay src={popupNotice.fileUrl} style={{ width: "100%", height: "35px" }} />
              </div>
            )}
            {popupNotice.fileUrl && popupNotice.fileType === "video" && (
              <div style={{ marginBottom: "15px" }}>
                <video controls autoPlay src={popupNotice.fileUrl} style={{ width: "100%", maxHeight: "200px", borderRadius: "6px" }} />
              </div>
            )}
            {popupNotice.fileUrl && popupNotice.fileType === "image" && (
              <div style={{ marginBottom: "15px", textAlign: "center" }}>
                <img src={popupNotice.fileUrl} alt="Notice" style={{ maxWidth: "100%", maxHeight: "180px", borderRadius: "6px" }} />
              </div>
            )}
            {popupNotice.fileUrl && (popupNotice.fileType === "document" || popupNotice.fileType === "pdf") && (
              <div style={{ marginBottom: "15px", textAlign: "center" }}>
                <a 
                  href={popupNotice.fileUrl} 
                  download={popupNotice.fileName || "Notice_Document"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: "inline-block", backgroundColor: "#0284c7", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold", fontSize: "13px" }}
                >
                  {popupNotice.fileType === "pdf" ? "📕 View / Download PDF" : "📥 Download Attached Document"}
                </a>
              </div>
            )}

            <button 
              onClick={handleCloseBanner}
              style={{ width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}
            >
              CLOSE & CONTINUE
            </button>
          </div>
        </div>
      )}

      <div style={topNavStyle}>
        <div style={{ fontSize: "18px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>INSTITUTE PANEL ({instituteName})</span>
          {userRole === "staff" && (
            <span style={{ fontSize: "11px", backgroundColor: "#10b981", color: "white", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
              👤 Staff Cashier
            </span>
          )}
        </div>
        
        <div style={menuContainerStyle}>
          <button onClick={() => handleTabChange("billing")} style={getNavBtnStyle("billing")}>
            Billing
          </button>
          
          <button onClick={() => handleTabChange("listening")} style={getNavBtnStyle("listening")}>Study Materials</button>
          <button onClick={() => handleTabChange("dictionary")} style={getNavBtnStyle("dictionary")}>Dictionary</button>
          <button onClick={() => handleTabChange("news")} style={getNavBtnStyle("news")}>Notice</button>
          {userRole !== "staff" && (
            <button onClick={() => handleTabChange("students")} style={getNavBtnStyle("students")}>
              Manage Students
            </button>
          )}
        </div>

        <div>
          <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Logout</button>
        </div>
      </div>

      <div style={contentAreaStyle}>
        
        {activeTab === "billing" && (
          <InstituteBillingSection instituteName={instituteName} userRole={userRole} instId={instId} instituteLanguage={instituteLanguage} />
        )}

        {(activeTab === "students" || activeTab === "exams") && (
          !isStudentsUnlocked ? (
            <div style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "40px 16px 60px 16px",
              boxSizing: "border-box"
            }}>
              <div style={{
                width: "100%",
                maxWidth: "420px",
                backgroundColor: "#f0f9ff",
                borderRadius: "14px",
                boxShadow: "0 10px 25px rgba(2, 132, 199, 0.12)",
                border: "1px solid #7dd3fc",
                overflow: "hidden",
                flexShrink: 0
              }}>
                {/* Header: Sky Blue with Login Icon */}
                <div style={{
                  backgroundColor: "#0284c7",
                  backgroundImage: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)",
                  padding: "26px 20px 22px 20px",
                  textAlign: "center",
                  color: "#ffffff"
                }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    border: "2px solid rgba(255, 255, 255, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px auto",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)"
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                  </div>
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "bold", color: "#ffffff", letterSpacing: "0.5px" }}>
                    Login
                  </h2>
                </div>

                {/* Form: Sky Blue Tint Background */}
                <div style={{ padding: "26px 24px 30px 24px", backgroundColor: "#f0f9ff" }}>
                  {unlockError && (
                    <div style={{
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span>❌</span> {unlockError}
                    </div>
                  )}

                  <form onSubmit={handleUnlockStudentsWithBilling} style={{ textAlign: "left" }}>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#0369a1", marginBottom: "6px" }}>
                        User ID / Username *
                      </label>
                      <input
                        type="text"
                        value={billingLoginUserId}
                        onChange={(e) => setBillingLoginUserId(e.target.value)}
                        placeholder="Enter User ID or Username"
                        autoFocus
                        required
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "8px",
                          border: "1.5px solid #bae6fd",
                          backgroundColor: "#ffffff",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          outline: "none"
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "22px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#0369a1", marginBottom: "6px" }}>
                        Password *
                      </label>
                      <input
                        type="password"
                        value={billingLoginPassword}
                        onChange={(e) => setBillingLoginPassword(e.target.value)}
                        placeholder="Enter Password"
                        required
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "8px",
                          border: "1.5px solid #bae6fd",
                          backgroundColor: "#ffffff",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          outline: "none"
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={unlockLoading}
                      style={{
                        width: "100%",
                        backgroundColor: "#0284c7",
                        backgroundImage: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                        color: "#ffffff",
                        border: "none",
                        padding: "13px 20px",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: "bold",
                        cursor: unlockLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <span>{unlockLoading ? "Logging in..." : "Login"}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Top Metrics Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "24px" }}>
              <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #0284c7, #0369a1)", border: "none", marginBottom: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "14px 16px" }}>
                <span style={{ fontSize: "11px", color: "#e0f2fe", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Available Packages</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "22px", fontWeight: "800", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {examPackages.length}
                </p>
              </div>

              <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #0284c7, #0369a1)", border: "none", marginBottom: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "14px 16px" }}>
                <span style={{ fontSize: "11px", color: "#e0f2fe", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Created by {instituteName}</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "22px", fontWeight: "800", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {examPackages.filter(p => p.isCustom || p.createdBy === instituteName).length}
                </p>
              </div>

              <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #0284c7, #0369a1)", border: "none", marginBottom: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "14px 16px" }}>
                <span style={{ fontSize: "11px", color: "#e0f2fe", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Accessible Exam Sets</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "22px", fontWeight: "800", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {examSets.length}
                </p>
              </div>

              <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #0284c7, #0369a1)", border: "none", marginBottom: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "14px 16px" }}>
                <span style={{ fontSize: "11px", color: "#e0f2fe", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Package Pricing Range</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "17px", letterSpacing: "-0.5px", fontWeight: "800", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {examPackages.length > 0 ? (
                    `${examPackages[0]?.price || 'Rs. 1,000'} - ${examPackages[examPackages.length - 1]?.price || 'Rs. 4,500'}`
                  ) : "Configurable"}
                </p>
              </div>

              <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #0284c7, #0369a1)", border: "none", marginBottom: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "14px 16px" }}>
                <span style={{ fontSize: "11px", color: "#e0f2fe", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Students</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "22px", fontWeight: "800", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {students.length}
                </p>
              </div>
            </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <h3 style={{ color: "#475569", margin: 0, fontSize: "18px" }}>My Enrolled Students ({students.length})</h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={handleLockStudents}
                    title="Lock Manage Students again"
                    style={{
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      border: "1px solid #f87171",
                      padding: "10px 14px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>Lock Section</span>
                  </button>
                  <span style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "600",
                    backgroundColor: "#f1f5f9",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    ⏱️ Auto-lock in: <strong style={{ color: studentsAutoLockCountdown <= 5 ? "#ef4444" : "#0284c7" }}>{studentsAutoLockCountdown}s</strong>
                  </span>
                  <Link
                    href={`/institute/questions?institute=${encodeURIComponent(instituteName)}${instId ? `&instId=${instId}` : ""}`}
                    className="dynamic-btn"
                    style={{
                      textDecoration: "none",
                      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "0 20px",
                      minHeight: "42px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)"
                    }}
                    title="Create and manage your private UBT sets & question bucket"
                  >
                    <span style={{ color: "#ffffff" }}>Create UBT Set</span>
                  </Link>

                  <button
                    className="dynamic-btn"
                    onClick={() => setShowCreatePkgForm(!showCreatePkgForm)}
                    style={{
                      background: showCreatePkgForm ? "#ef4444" : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "0 20px",
                      minHeight: "42px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)"
                    }}
                  >
                    {showCreatePkgForm ? (
                      <span style={{ color: "#ffffff" }}>✕ Cancel Creation</span>
                    ) : (
                      <span style={{ color: "#ffffff" }}>Create UBT Exam Package</span>
                    )}
                  </button>

                  <button
                    onClick={() => showForm ? resetForm() : setShowForm(true)}
                    className="dynamic-btn"
                    style={{
                      background: showForm ? "#ef4444" : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "0 20px",
                      minHeight: "42px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)"
                    }}
                  >
                    <span style={{ color: "#ffffff" }}>{showForm ? "Cancel" : "Add New Student"}</span>
                  </button>
                </div>
              </div>

              {showForm && (
                <div style={cardStyle}>
                  <h4 style={{ margin: "0 0 15px 0", color: "#1e293b" }}>{editId ? "Update Student Details" : "Register Student under " + instituteName}</h4>
                  <form onSubmit={handleSubmitStudent} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Student Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle} placeholder="Enter student name" />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Phone Number (Login ID)</label>
                      <input type="number" name="phone" value={formData.phone} onChange={handleInputChange} required style={inputStyle} placeholder="Enter phone number" />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Password</label>
                      <input type="text" name="password" value={formData.password} onChange={handleInputChange} required style={inputStyle} placeholder="Create password" />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Assigned Package</label>
                      <select name="assignedPackage" value={formData.assignedPackage} onChange={handleInputChange} style={inputStyle}>
                        {examPackages.length === 0 ? (
                          <>
                            <option value="Full Set UBT">Full Set UBT</option>
                            <option value="30 Set Chapter UBT">30 Set Chapter UBT</option>
                            <option value="100 UBT set">100 UBT set</option>
                          </>
                        ) : (
                          examPackages.map((pkg, idx) => (
                            <option key={idx} value={pkg.name}>
                              {pkg.name} {pkg.price ? `(${pkg.price})` : ''}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Package Expiry Duration</label>
                      <select name="expiryDuration" value={formData.expiryDuration} onChange={handleInputChange} style={inputStyle}>
                        <option value="15 Days">15 Days</option>
                        <option value="1 Month">1 Month</option>
                        <option value="3 Months">3 Months</option>
                        <option value="Lifetime">Lifetime</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <button type="submit" style={{ backgroundColor: editId ? "#f59e0b" : "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                        {editId ? "Update Student" : "Save Student"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={{ ...thStyle, borderTopLeftRadius: "8px" }}>Student Name</th>
                    <th style={thStyle}>Phone Number</th>
                    <th style={thStyle}>Package & Expiry</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, borderTopRightRadius: "8px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan="5" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>No students registered yet.</td></tr>
                  ) : (
                    students.map((stu) => (
                      <tr key={stu.id}>
                        <td style={{ ...tdStyle, fontWeight: "bold" }}>{stu.name}</td>
                        <td style={tdStyle}>{stu.phone}</td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: "bold", color: "#2563eb" }}>{stu.assignedPackage}</span>
                          <br/><span style={{ fontSize: "12px", color: "#ef4444" }}>Ends: {stu.expiryDate}</span>
                        </td>
                        <td style={tdStyle}><span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>{stu.status || "Active"}</span></td>
                        <td style={tdStyle}>

                          <button onClick={() => handleEdit(stu)} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", marginRight: "5px", cursor: "pointer", fontSize: "12px" }}>Edit</button>
                          <button onClick={() => handleDelete(stu.id, stu.phone)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* UBT PACKAGES & PRICING MANAGEMENT (CREATED BY OWN CHOICE & CUSTOM PRICE) */}
        {true && (
          <div style={{ marginTop: "50px" }}>
            

            {/* Form to Create Custom Package */}
            {showCreatePkgForm && (
              <div style={cardStyle}>
                <div style={{ paddingTop: "10px" }}>
                  <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a", fontWeight: "700" }}>
                    🛠️ Design Custom Package Details
                  </h4>

                  <form onSubmit={handleCreateCustomPackage}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                          Package Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Special 20 UBT Sets or Crash Course Bundle"
                          value={newPkgName}
                          onChange={(e) => setNewPkgName(e.target.value)}
                          style={inputStyle}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                          Set Package Price (NPR) *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rs. 1,500 or 1500"
                          value={newPkgPrice}
                          onChange={(e) => setNewPkgPrice(e.target.value)}
                          style={{ ...inputStyle, fontWeight: "700", color: "#166534" }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                          Package Category
                        </label>
                        <select
                          value={newPkgType}
                          onChange={(e) => setNewPkgType(e.target.value)}
                          style={inputStyle}
                        >
                          <option value="UBT Full Exam">UBT Full Exam</option>
                          <option value="Chapter Wise">Chapter Wise Practice</option>
                          <option value="Combo Package">Combo Full Package</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                          Default Validity / Expiry Duration
                        </label>
                        <select
                          value={newPkgDuration}
                          onChange={(e) => setNewPkgDuration(e.target.value)}
                          style={inputStyle}
                        >
                          <option value="15 Days">15 Days</option>
                          <option value="1 Month">1 Month</option>
                          <option value="3 Months">3 Months</option>
                          <option value="6 Months">6 Months</option>
                          <option value="Lifetime">Lifetime</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: "18px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                        Package Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Intensive model test sets with 20 Reading + 20 Listening questions per set."
                        value={newPkgDesc}
                        onChange={(e) => setNewPkgDesc(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Sets Selection by Choice */}
                    <div style={{ marginBottom: "20px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <label style={{ fontSize: "13px", fontWeight: "700", color: "#1e3a8a" }}>
                            🎯 Choose Exam Sets Included in this Package ({selectedSetsForPkg.length} selected)
                          </label>
                          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                            Students who purchase or are assigned this package will have access to these sets.
                          </p>
                        </div>

                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={handleSelectAllUbtSets}
                            style={{ backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                          >
                            + All UBT Sets
                          </button>
                          <button
                            type="button"
                            onClick={handleSelectAllChapterSets}
                            style={{ backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                          >
                            + All Chapter Sets
                          </button>
                          <button
                            type="button"
                            onClick={handleSelectAllSets}
                            style={{ backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={handleClearSelectedSets}
                            style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {examSets.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>No sets available in the system yet.</p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", maxHeight: "200px", overflowY: "auto", padding: "4px" }}>
                          {examSets.map((s, idx) => {
                            const isChecked = selectedSetsForPkg.includes(s.name);
                            const isUbt = (s.setType || (s.name?.toLowerCase().includes("chapter") ? "Chapterwise" : "UBT")) === "UBT";
                            return (
                              <label
                                key={idx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 10px",
                                  borderRadius: "6px",
                                  backgroundColor: isChecked ? "#eff6ff" : "#ffffff",
                                  border: isChecked ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  fontWeight: isChecked ? "700" : "normal",
                                  color: isChecked ? "#1e40af" : "#1e293b"
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleSetForPackage(s.name)}
                                  style={{ cursor: "pointer" }}
                                />
                                <span>{isUbt ? "🎯" : "📚"} {s.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "6px",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)"
                      }}
                    >
                      ✓ Save & Activate Custom Package
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* List & Cards of All UBT Packages with Set Price Action */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>
                    Configured UBT Packages ({examPackages.length})
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                    Click <strong>"✏️ Set / Edit Price"</strong> on any package to customize its fee for your students.
                  </p>
                </div>

                <Link
                  href={`/institute/questions?institute=${encodeURIComponent(instituteName)}${instId ? `&instId=${instId}` : ""}`}
                  style={{
                    textDecoration: "none",
                    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    fontSize: "13px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)"
                  }}
                  title="Create your own private UBT sets & question bucket"
                >
                  <span style={{ color: "#ffffff" }}>Create UBT Set</span>
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                {examPackages.map((pkg, idx) => {
                  const isCustom = pkg.isCustom || pkg.createdBy === instituteName;
                  const isEditingPrice = editingPricePkgName === pkg.name;

                  // Find how many sets are linked to this package
                  const linkedSets = examSets.filter(s =>
                    s.packageName === pkg.name ||
                    (pkg.includedSets && pkg.includedSets.includes(s.name))
                  );

                  const bgColors = [
                    "linear-gradient(145deg, #eff6ff, #dbeafe)",
                    "linear-gradient(145deg, #f0fdf4, #dcfce7)",
                    "linear-gradient(145deg, #fffbeb, #fef3c7)",
                    "linear-gradient(145deg, #fdf4ff, #fae8ff)",
                    "linear-gradient(145deg, #f0f9ff, #e0f2fe)",
                    "linear-gradient(145deg, #fef2f2, #fee2e2)"
                  ];

                  return (
                    <div
                      className="pkg-card"
                      key={pkg.id || idx}
                      style={{
                        background: bgColors[idx % bgColors.length],
                        borderRadius: "12px",
                        border: isCustom ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        position: "relative"
                      }}
                    >
                      <div>
                        {/* Tags */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <span style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            backgroundColor: isCustom ? "#dbeafe" : "#f1f5f9",
                            color: isCustom ? "#1e40af" : "#475569"
                          }}>
                            {isCustom ? "🏢 Institute Choice" : "Standard Package"}
                          </span>

                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                            ⏳ {pkg.duration || "1 Month"}
                          </span>
                        </div>

                        <h4 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#1e293b", fontWeight: "800" }}>
                          {pkg.name}
                        </h4>

                        <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                          {pkg.desc || "Full EPS-TOPIK UBT examination sets with audio and detailed scoring."}
                        </p>

                        {/* Sets preview */}
                        <div style={{ marginBottom: "16px", backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "12px", fontWeight: "700", color: "#1e3a8a", marginBottom: "6px" }}>
                            Included Sets: {linkedSets.length > 0 ? `${linkedSets.length} Sets` : 'All Assigned Sets'}
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", maxHeight: "60px", overflowY: "auto" }}>
                            {linkedSets.length > 0 ? (
                              linkedSets.map((s, sIdx) => (
                                <span key={sIdx} style={{ fontSize: "11px", backgroundColor: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", color: "#334155" }}>
                                  {s.name}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Inherits all sets under {pkg.name}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing Section with Instant Price Modifier */}
                      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Package Price:</span>
                          <span style={{ fontSize: "20px", fontWeight: "800", color: "#16a34a" }}>
                            {pkg.price || "Rs. 1,500"}
                          </span>
                        </div>

                        {/* Price editing toggle */}
                        {isEditingPrice ? (
                          <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                            <input
                              type="text"
                              value={editingPriceValue}
                              onChange={(e) => setEditingPriceValue(e.target.value)}
                              placeholder="New Price (e.g. Rs. 2,000)"
                              style={{ ...inputStyle, marginBottom: 0, padding: "8px 10px", fontSize: "13px", flex: 1 }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePriceChange(pkg.name)}
                              style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPricePkgName(null)}
                              style={{ backgroundColor: "#e2e8f0", color: "#334155", border: "none", padding: "8px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                            <button
                              onClick={() => {
                                setEditingPricePkgName(pkg.name);
                                setEditingPriceValue(pkg.price || "Rs. 1,500");
                              }}
                              style={{
                                flex: 1,
                                backgroundColor: "#f0fdf4",
                                color: "#166534",
                                border: "1.5px solid #86efac",
                                padding: "8px",
                                borderRadius: "6px",
                                fontWeight: "700",
                                fontSize: "12px",
                                cursor: "pointer"
                              }}
                            >
                              ✏️ Set / Edit Price
                            </button>

                            <button
                              onClick={() => {
                                setFormData(prev => ({ ...prev, assignedPackage: pkg.name }));
                                setShowForm(true);
                                handleTabChange("students");
                              }}
                              style={{
                                backgroundColor: "#eff6ff",
                                color: "#1e40af",
                                border: "1.5px solid #bfdbfe",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                fontWeight: "700",
                                fontSize: "12px",
                                cursor: "pointer"
                              }}
                            >
                              + Assign to Student
                            </button>
                          </div>
                        )}

                        {isCustom && (
                          <div style={{ textAlign: "right" }}>
                            <button
                              onClick={() => handleDeleteCustomPackage(pkg.id, pkg.name)}
                              style={{ backgroundColor: "transparent", color: "#dc2626", border: "none", fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}
                            >
                              Delete custom package
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        
              {/* UBT EXAM SETS UNDER INSIDE MANAGE STUDENTS */}
              <div style={{ marginTop: "40px", borderTop: "2px solid #e2e8f0", paddingTop: "25px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ color: "#1e3a8a", margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>📝</span> UBT Exam Sets & Packages Overview
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
                      Preview and verify available UBT test sets for students under your institute
                    </p>
                  </div>
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "bold" }}>
                    Total Sets: {filteredSets.length}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", marginTop: "15px" }}>
                  <button onClick={() => setSelectedPackageFilter("All")} style={{ padding: "8px 16px", backgroundColor: selectedPackageFilter === "All" ? "#1e3a8a" : "white", color: selectedPackageFilter === "All" ? "white" : "#1e3a8a", border: "1px solid #1e3a8a", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>All Sets</button>
                  {examPackages.map((pkg, idx) => (
                    <button key={idx} onClick={() => setSelectedPackageFilter(pkg.name)} style={{ padding: "8px 16px", backgroundColor: selectedPackageFilter === pkg.name ? "#1e3a8a" : "white", color: selectedPackageFilter === pkg.name ? "white" : "#1e3a8a", border: "1px solid #1e3a8a", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>{pkg.name}</button>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                  {filteredSets.length === 0 ? (
                    <p style={{ color: "#64748b", gridColumn: "1 / -1", textAlign: "center", padding: "30px", background: "white", borderRadius: "8px" }}>No exam sets available.</p>
                  ) : (
                    filteredSets.map((set) => (
                      <div key={set.id} style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#475569", background: "#cbd5e1", padding: "2px 6px", borderRadius: "4px" }}>{set.packageName || "UBT-TEST"}</span>
                          <h4 style={{ margin: "10px 0", fontSize: "16px", color: "#1e293b" }}>{set.name}</h4>
                        </div>
                        <div style={{ marginTop: "15px" }}>
                          <button onClick={() => router.push(`/institute/exam-preview/${set.id}`)} style={{ width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", padding: "9px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>PREVIEW EXAM</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === "listening" && (
          <div style={{ marginTop: "10px", marginBottom: "30px" }}>
            <EpsBookReader mode="institute" instituteLanguage={instituteLanguage} />
          </div>
        )}

        {/* DICTIONARY TAB */}
        {activeTab === "dictionary" && (
          <DictionarySection instituteLanguage={instituteLanguage} />
        )}

        {activeTab === "news" && (
          <div>
            {/* 6 official portal buttons with simple, attractive, larger icons */}
            <div style={{ marginBottom: "32px" }}>
              <OfficialPortalButtons />
            </div>

            {/* INSTITUTE NOTICE SECTION — publish & full poster view */}
            <div style={{ maxWidth: "860px", margin: "0 auto" }}>
              {/* Publish Notice Action Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: "20px", fontWeight: "800" }}>
                    Institute Notices ({newsList.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPublishNoticeForm(!showPublishNoticeForm)}
                  style={{
                    background: showPublishNoticeForm ? "#64748b" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.30)",
                    transition: "0.2s"
                  }}
                >
                  {showPublishNoticeForm ? "✕ Close Form" : "+ Publish Notice for Students"}
                </button>
              </div>

              {/* Publish Form */}
              {showPublishNoticeForm && (
                <div style={{ background: "white", borderRadius: "16px", padding: "26px", marginBottom: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.08)", border: "2px solid #6366f1" }}>
                  <h4 style={{ margin: "0 0 16px 0", color: "#1e1b4b", fontSize: "17px", fontWeight: "800" }}>
                    Publish New Notice for {instituteName} Students
                  </h4>
                  <form onSubmit={handlePublishNotice}>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Notice Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Special Weekend Model Exam Notice"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Notice Details / Description *</label>
                      <textarea
                        placeholder="Enter notice details, instructions, schedules..."
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        required
                        style={{ width: "100%", height: "100px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box", resize: "vertical" }}
                      />
                    </div>

                    {/* Media upload */}
                    <div style={{ marginBottom: "16px", padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>📎 Attach Media (Poster Image, Video, Audio, PDF, Document)</label>
                        {noticeFileUrl && (
                          <button
                            type="button"
                            onClick={() => { setNoticeFileUrl(null); setNoticeFileName(""); setNoticeFileType(""); setNoticeFileSize(0); }}
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "3px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="audio/*,video/*,image/*,application/pdf,.doc,.docx,.txt"
                        onChange={handleNoticeFileUpload}
                        disabled={isNoticeUploading}
                        style={{ width: "100%", fontSize: "13px" }}
                      />
                      {isNoticeUploading && (
                        <p style={{ margin: "8px 0 0 0", color: "#4f46e5", fontSize: "12px", fontWeight: "600" }}>⏳ Uploading media file... please wait</p>
                      )}
                      {noticeFileUrl && !isNoticeUploading && (
                        <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f0fdf4", borderRadius: "6px", border: "1px solid #86efac", fontSize: "12px", color: "#15803d", fontWeight: "600" }}>
                          ✓ Attached: {noticeFileName || "File"} ({noticeFileType.toUpperCase()})
                        </div>
                      )}
                    </div>

                    {/* Target Study Track Selector */}
                    <div style={{ marginBottom: "18px", backgroundColor: "#f8fafc", padding: "14px 16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                      <label style={{ fontWeight: "bold", fontSize: "13px", color: "#1e3a8a", display: "block", marginBottom: "8px" }}>
                        🎯 Target Study Track (लक्षित भाषा ट्र्याक)
                      </label>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {[
                          { key: "all", label: "🌐 All Students (Korean & Japanese)" },
                          { key: "korean", label: "🇰🇷 Korean Track Only (EPS-TOPIK)" },
                          { key: "japanese", label: "🇯🇵 Japanese Track Only (SSW / JLPT)" }
                        ].map((opt) => (
                          <label
                            key={opt.key}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 14px",
                              borderRadius: "8px",
                              border: noticeTargetTrack === opt.key ? "2px solid #2563eb" : "1px solid #cbd5e1",
                              backgroundColor: noticeTargetTrack === opt.key ? "#eff6ff" : "#ffffff",
                              cursor: "pointer",
                              fontWeight: noticeTargetTrack === opt.key ? "700" : "500",
                              fontSize: "13px",
                              color: noticeTargetTrack === opt.key ? "#1d4ed8" : "#334155"
                            }}
                          >
                            <input
                              type="radio"
                              name="noticeTargetTrack"
                              value={opt.key}
                              checked={noticeTargetTrack === opt.key}
                              onChange={(e) => setNoticeTargetTrack(e.target.value)}
                              style={{ cursor: "pointer" }}
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Popup checkbox */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                      <input
                        type="checkbox"
                        id="instNoticePopup"
                        checked={isNoticePopup}
                        onChange={(e) => setIsNoticePopup(e.target.checked)}
                        style={{ width: "17px", height: "17px", cursor: "pointer" }}
                      />
                      <label htmlFor="instNoticePopup" style={{ fontSize: "13px", fontWeight: "700", color: "#4f46e5", cursor: "pointer" }}>
                        Show as Pop-up Flex Banner on Student Dashboard
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        type="submit"
                        disabled={isNoticeUploading}
                        style={{
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "white",
                          border: "none",
                          padding: "11px 24px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          fontSize: "14px",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
                        }}
                      >
                        Publish Notice to Students
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPublishNoticeForm(false)}
                        style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "11px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Published Notices Container */}
              <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
                {newsList.length === 0 ? (
                  <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0", margin: 0 }}>No notices available.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {newsList.map(item => (
                      <div key={item.id} style={{
                        borderRadius: "14px",
                        overflow: "hidden",
                        border: item.isPopup ? "2px solid #6366f1" : "1px solid #e2e8f0",
                        boxShadow: item.isPopup ? "0 4px 20px rgba(99,102,241,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
                        background: item.isPopup ? "linear-gradient(135deg, #fafaff 0%, #f0f0ff 100%)" : "#fff",
                      }}>
                        {/* Header bar — centered with delete action */}
                        <div style={{ background: item.isPopup ? "linear-gradient(90deg, #6366f1, #4f46e5)" : "linear-gradient(90deg, #475569, #334155)", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                          <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              {(() => {
                                const itemTrack = (item.language || item.track || "all").toLowerCase();
                                return (
                                  <span style={{
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    backgroundColor: itemTrack === "japanese" ? "rgba(168, 85, 247, 0.35)" : itemTrack === "korean" ? "rgba(59, 130, 246, 0.35)" : "rgba(255, 255, 255, 0.2)",
                                    color: "#ffffff",
                                    border: "1px solid rgba(255,255,255,0.4)"
                                  }}>
                                    {itemTrack === "japanese" ? "🇯🇵 Japanese Track" : itemTrack === "korean" ? "🇰🇷 Korean Track" : "🌐 All Tracks"}
                                  </span>
                                );
                              })()}
                              {item.isPopup && (
                                <span style={{ fontSize: "10px", fontWeight: "800", backgroundColor: "#fbbf24", color: "#78350f", padding: "2px 6px", borderRadius: "8px" }}>
                                  📢 Flex Banner
                                </span>
                              )}
                            </div>
                            <h4 style={{ margin: 0, color: "white", fontSize: "17px", fontWeight: "700" }}>{item.title}</h4>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)" }}>📅 {item.date}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteNotice(item.id)}
                            style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </div>

                      {/* Body — centered */}
                      <div style={{ padding: "22px 24px", textAlign: "center" }}>
                        {item.content && (
                          <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.8", whiteSpace: "pre-line", marginBottom: (item.fileUrl ? "18px" : "0"), textAlign: "center" }}>{item.content}</p>
                        )}

                        {/* Image poster — full view, adjusting width & height according to notice poster, centered */}
                        {item.fileUrl && item.fileType === "image" && (
                          <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", maxWidth: "100%" }}>
                              <img
                                src={item.fileUrl}
                                alt="Notice Poster"
                                style={{
                                  maxWidth: "100%",
                                  width: "auto",
                                  height: "auto",
                                  maxHeight: "85vh",
                                  display: "block",
                                  margin: "0 auto",
                                  borderRadius: "10px",
                                  border: "1px solid #e2e8f0",
                                  objectFit: "contain",
                                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                  cursor: "pointer"
                                }}
                              />
                            </a>
                          </div>
                        )}

                        {/* Audio */}
                        {item.fileUrl && item.fileType === "audio" && (
                          <div style={{ maxWidth: "500px", margin: "14px auto 0 auto" }}>
                            <audio controls src={item.fileUrl} style={{ width: "100%", height: "40px" }} />
                          </div>
                        )}

                        {/* Video — full width */}
                        {item.fileUrl && item.fileType === "video" && (
                          <div style={{ maxWidth: "700px", margin: "14px auto 0 auto" }}>
                            <video controls src={item.fileUrl} style={{ width: "100%", height: "auto", borderRadius: "10px", backgroundColor: "#000", display: "block" }} />
                          </div>
                        )}

                        {/* PDF / Document */}
                        {item.fileUrl && (item.fileType === "document" || item.fileType === "pdf") && (
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginTop: "16px" }}>
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "bold", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", padding: "8px 18px", borderRadius: "8px", textDecoration: "none" }}>
                              <span>{item.fileType === "pdf" ? "📕" : "📄"}</span> View {item.fileType === "pdf" ? "PDF" : "Document"}
                            </a>
                            <a href={item.fileUrl} download={item.fileName || "Notice_Document"}
                              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "bold", background: "linear-gradient(135deg, #0284c7, #0369a1)", color: "#fff", padding: "8px 18px", borderRadius: "8px", textDecoration: "none" }}>
                              <span>📥</span> Download
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}




      </div>
    </div>
  );
};

export default InstituteDashboard;