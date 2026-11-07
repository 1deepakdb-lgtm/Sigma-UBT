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

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import DictionarySection from "@/components/DictionarySection";
import EpsBookReader from "@/components/EpsBookReader";
import InstituteBillingSection from "@/components/InstituteBillingSection";
import OfficialPortalButtons from "@/components/OfficialPortalButtons";
import { performLogout } from "@/lib/clientAuth";
import { getSharedGateCredentials, verifySharedGateCredentials, updateSharedGateCredentials } from "@/lib/instituteGateAuth";
import { JLPT_MOCK_SETS_META } from "@/data/jlptMockTestData";

const InstituteDashboard = () => {
  const router = useRouter();
  const [instituteName, setInstituteName] = useState("Language Institute");

  const [instId, setInstId] = useState(null);

  const [userRole, setUserRole] = useState("institute");

  const [activeTab, setActiveTab] = useState("billing"); 
  const [students, setStudents] = useState([]);
  const [instituteLanguage, setInstituteLanguage] = useState("both");
  const [studentLangFilter, setStudentLangFilter] = useState("all"); // "all" | "korean" | "japanese"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("institute")) setInstituteName(decodeURIComponent(params.get("institute")));
      else setInstituteName(localStorage.getItem("currentInstitute") || "Language Institute");
      
      // Set role from localStorage on client mount
      setUserRole(localStorage.getItem("role") || "institute");
      
      // Set instituteLanguage from localStorage on client mount
      const storedLang = localStorage.getItem("instituteLanguage") || "both";
      setInstituteLanguage(storedLang);
      
      // Update formData based on stored language
      const isJapanese = storedLang === "japanese" || window.location.search.includes("lang=japanese");
      setFormData(prev => ({
        ...prev,
        assignedPackage: isJapanese ? "Full Mock Test" : "Full Set UBT",
        language: storedLang === "japanese" ? "japanese" : storedLang === "korean" ? "korean" : "both"
      }));

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
          if (lang === "korean" || lang === "japanese") {
            setFormData(prev => ({ ...prev, language: lang }));
            setNoticeTargetTrack(lang);
          }
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
    assignedPackage: "Full Set UBT",
    expiryDuration: "1 Month",
    customExpiryDate: "",
    language: "both"
  });
  const [selectedPackagesList, setSelectedPackagesList] = useState(["Full Set UBT"]);
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

  // Credential update modal state (Admin changes ID & Password; Staff changes Password ONLY)
  const [showCredModal, setShowCredModal] = useState(false);
  const [newCredUserId, setNewCredUserId] = useState("");
  const [credCurrentPassword, setCredCurrentPassword] = useState("");
  const [newCredPassword, setNewCredPassword] = useState("");
  const [confirmCredPassword, setConfirmCredPassword] = useState("");
  const [credMsg, setCredMsg] = useState("");
  const [credLoading, setCredLoading] = useState(false);
  const [unlockedRole, setUnlockedRole] = useState(() => {
    if (typeof window === "undefined") return userRole || "admin";
    return sessionStorage.getItem("instituteUnlockedRole") || (userRole === "staff" ? "staff" : "admin");
  });
  const [unlockedUserId, setUnlockedUserId] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("instituteBillingStaffUser") || "";
  });

  // Check if already unlocked in session (either in Billing or Manage Students)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isUnlocked = sessionStorage.getItem("instituteStudentsUnlocked") === "true" ||
                         sessionStorage.getItem("instituteBillingUnlocked") === "true";
      if (isUnlocked) {
        setIsStudentsUnlocked(true);
      }
    }
  }, []);

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
        sessionStorage.removeItem("instituteBillingUnlocked");
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      events.forEach(evt => window.removeEventListener(evt, updateActivity));
    };
  }, [isStudentsUnlocked]);

  // Unified unlock handler using shared credentials
  const handleUnlockStudentsWithBilling = async (e) => {
    e.preventDefault();
    setUnlockError("");
    const uid = billingLoginUserId.trim();
    const pwd = billingLoginPassword.trim();

    if (!uid || !pwd) {
      setUnlockError("Please enter both User ID and Password.");
      return;
    }

    setUnlockLoading(true);
    const result = await verifySharedGateCredentials(uid, pwd, instituteName);
    setUnlockLoading(false);

    if (result.ok) {
      const isAdm = result.role === "admin";
      setUnlockedRole(isAdm ? "admin" : "staff");
      setUnlockedUserId(result.userId || uid);
      sessionStorage.setItem("instituteUnlockedRole", isAdm ? "admin" : "staff");
      sessionStorage.setItem("instituteBillingStaffUser", result.userId || uid);
      setIsStudentsUnlocked(true);
      sessionStorage.setItem("instituteStudentsUnlocked", "true");
      sessionStorage.setItem("instituteBillingUnlocked", "true");
      setBillingLoginUserId("");
      setBillingLoginPassword("");
      setUnlockError("");
    } else {
      setUnlockError(result.error || "Invalid User ID or Password.");
    }
  };

  const handleLockStudents = () => {
    setIsStudentsUnlocked(false);
    sessionStorage.removeItem("instituteStudentsUnlocked");
    sessionStorage.removeItem("instituteBillingUnlocked");
    sessionStorage.removeItem("instituteUnlockedRole");
  };

  const handleOpenCredModal = () => {
    const isStaff = (unlockedRole === "staff" || userRole === "staff");
    if (isStaff) {
      setNewCredUserId(unlockedUserId || (typeof window !== "undefined" && localStorage.getItem("currentUser")) || "staff");
    } else {
      const creds = getSharedGateCredentials(instituteName);
      setNewCredUserId(creds.userId || "admin");
    }
    setCredCurrentPassword("");
    setNewCredPassword("");
    setConfirmCredPassword("");
    setCredMsg("");
    setShowCredModal(true);
  };

  const handleUpdateCredSubmit = async (e) => {
    e.preventDefault();
    setCredMsg("");

    const isStaff = (unlockedRole === "staff" || userRole === "staff");

    if (isStaff) {
      // Staff User: change password only, not ID!
      if (!credCurrentPassword) {
        setCredMsg("Please enter your current password.");
        return;
      }
      if (!newCredPassword || newCredPassword.trim().length < 4) {
        setCredMsg("New password must be at least 4 characters.");
        return;
      }
      if (newCredPassword !== confirmCredPassword) {
        setCredMsg("New password and confirm password do not match.");
        return;
      }

      setCredLoading(true);
      try {
        const username = unlockedUserId || (typeof window !== "undefined" && localStorage.getItem("currentUser")) || "staff";
        const res = await fetch("/api/institute/staff", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            currentPassword: credCurrentPassword,
            newPassword: newCredPassword
          })
        });
        const data = await res.json();
        if (res.ok) {
          setCredMsg("SUCCESS: Password updated successfully! Please use your new password next time you log in.");
          const instKey = instituteName ? `inst_${instituteName.trim().toLowerCase().replace(/\s+/g, '_')}` : "default";
          try {
            const staffKey = `instituteStaffList_${instKey}`;
            const stored = JSON.parse(localStorage.getItem(staffKey) || "[]");
            const idx = stored.findIndex(s => s.username?.toLowerCase() === username.toLowerCase() || s.phone === username);
            if (idx !== -1) {
              stored[idx].password = newCredPassword;
              localStorage.setItem(staffKey, JSON.stringify(stored));
            }
          } catch (e) {}

          setTimeout(() => {
            setShowCredModal(false);
            setCredMsg("");
            setCredCurrentPassword("");
            setNewCredPassword("");
            setConfirmCredPassword("");
          }, 1600);
        } else {
          setCredMsg(data.error || "Failed to update password.");
        }
      } catch (err) {
        setCredMsg("Failed to connect to server. Please try again.");
      } finally {
        setCredLoading(false);
      }
      return;
    }

    // Admin: can update both User ID and Password (with mandatory current credential verification)
    if (!credCurrentPassword || credCurrentPassword.trim().length === 0) {
      setCredMsg("Please enter your current Password or PIN to authorize changes.");
      return;
    }

    if (!newCredUserId || newCredUserId.trim().length < 3) {
      setCredMsg("User ID must be at least 3 characters.");
      return;
    }

    if (!newCredPassword || newCredPassword.trim().length < 6) {
      setCredMsg("New password must be at least 6 characters for security.");
      return;
    }

    if (newCredPassword !== confirmCredPassword) {
      setCredMsg("New Password and Confirm Password do not match.");
      return;
    }

    setCredLoading(true);
    const res = await updateSharedGateCredentials({
      currentPassword: credCurrentPassword.trim(),
      newUserId: newCredUserId.trim(),
      newPassword: newCredPassword.trim(),
      instituteName,
      currentRole: "admin"
    });
    setCredLoading(false);

    if (res.ok) {
      setCredMsg("SUCCESS: User ID and Password updated! This now works for both Billing and Manage Students.");
      setTimeout(() => {
        setShowCredModal(false);
        setCredMsg("");
        setCredCurrentPassword("");
        setNewCredPassword("");
        setConfirmCredPassword("");
      }, 1500);
    } else {
      setCredMsg(res.error || "Failed to update credentials.");
    }
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
  const [newPkgType, setNewPkgType] = useState(() => (typeof window !== "undefined" && (localStorage.getItem("instituteLanguage") === "japanese" || (typeof window !== "undefined" && window.location.search.includes("lang=japanese"))) ? "Full Mock Test" : "UBT Full Exam"));
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
      return sType === "UBT" && s.track !== "japanese";
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

  const handleSelectAllMockSets = () => {
    const mockNames = examSets.filter(s => {
      return s.setType === "MOCK" || s.track === "japanese" || s.isMock || (s.name && (s.name.toLowerCase().includes("mock") || s.name.toLowerCase().includes("jlpt") || s.name.toLowerCase().includes("jft") || s.name.toLowerCase().includes("nat")));
    }).map(s => s.name);
    setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...mockNames])));
  };

  const handleSelectMockByLevel = (levelStr) => {
    const names = examSets.filter(s => {
      const match = (s.level || s.packageName || s.name || "").toLowerCase().includes(levelStr.toLowerCase());
      return match;
    }).map(s => s.name);
    setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...names])));
  };

  const handleSelectMockModel = () => {
    const modelNames = examSets.filter(s => {
      const isJp = s.track === "japanese" || s.setType === "MOCK" || s.isMock;
      if (!isJp) return false;
      const name = (s.name || s.title || "").toLowerCase();
      const desc = (s.desc || "").toLowerCase();
      const titleJp = (s.titleJp || "").toLowerCase();
      return name.includes("model") || name.includes("simulation") || desc.includes("simulation") || titleJp.includes("模試") || titleJp.includes("模擬");
    }).map(s => s.name);
    setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...modelNames])));
  };

  const handleSelectAllModelSets = () => {
    const modelNames = examSets.filter(s => {
      const name = (s.name || "").toLowerCase();
      const pkg = (s.packageName || "").toLowerCase();
      return name.includes("model") || pkg.includes("model");
    }).map(s => s.name);
    setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...modelNames])));
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

    const isJapaneseTrack = instituteLanguage === "japanese" || selectedSetsForPkg.some(s => {
      const low = (s || "").toLowerCase();
      return low.includes("mock") || low.includes("jlpt") || low.includes("jft") || low.includes("nat");
    });

    const newPkg = {
      id: "pkg-inst-" + Date.now(),
      name: newPkgName.trim(),
      price: formattedPrice,
      desc: newPkgDesc.trim() || `Custom ${newPkgType} package configured by ${instituteName}.`,
      duration: newPkgDuration,
      type: newPkgType,
      includedSets: selectedSetsForPkg,
      createdBy: instituteName,
      isCustom: true,
      track: isJapaneseTrack ? "japanese" : "korean"
    };

    const currentPkgs = JSON.parse(localStorage.getItem("examPackages")) || examPackages;
    const updatedPackages = [...currentPkgs.filter(p => p.name !== newPkg.name), newPkg];
    if (instituteLanguage === "japanese") {
      setExamPackages(updatedPackages.filter(p => {
        const name = (p.name || "").toLowerCase();
        const type = (p.type || "").toLowerCase();
        const isKorean = p.track === "korean" || name.includes("ubt") || name.includes("chapter") || name.includes("eps") || name.includes("topik") || type.includes("ubt") || type.includes("chapter");
        const isJp = p.track === "japanese" || name.includes("mock") || name.includes("jft") || name.includes("jlpt") || name.includes("nat") || type.includes("mock");
        return isJp && !isKorean;
      }));
    } else {
      setExamPackages(updatedPackages);
    }
    localStorage.setItem("examPackages", JSON.stringify(updatedPackages));

    alert(`✅ Custom ${isJapaneseTrack ? "Mock Test" : "UBT"} package "${newPkgName}" created with price ${formattedPrice}! (${selectedSetsForPkg.length} sets included)`);
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

  const handleTogglePackageDistribution = (pkgName) => {
    const currentPkgs = JSON.parse(localStorage.getItem("examPackages")) || examPackages;
    const target = currentPkgs.find(p => p.name === pkgName);
    if (!target) return;

    const isCurrentlyFree = target.distributionMode === "free" || target.isFreeForInstituteStudents || (target.price || "").toLowerCase().includes("free") || target.price === "Rs. 0";
    const nextMode = isCurrentlyFree ? "paid" : "free";

    const updatedPkgs = currentPkgs.map(p => {
      if (p.name === pkgName) {
        return {
          ...p,
          distributionMode: nextMode,
          isFreeForInstituteStudents: nextMode === "free",
          price: nextMode === "free" ? "Free" : (p.previousPrice || "Rs. 1,500"),
          previousPrice: nextMode === "free" ? p.price : p.previousPrice
        };
      }
      return p;
    });

    setExamPackages(updatedPkgs);
    localStorage.setItem("examPackages", JSON.stringify(updatedPkgs));

    const instDist = JSON.parse(localStorage.getItem(`instituteDistribution_${instituteName}`) || "{}");
    instDist[pkgName] = nextMode;
    localStorage.setItem(`instituteDistribution_${instituteName}`, JSON.stringify(instDist));

    alert(
      nextMode === "free"
        ? `🎁 Package "${pkgName}" is now FREE for all enrolled students of ${instituteName}!\n\nYour students can now start all sets in this package directly with zero payment.`
        : `💳 Package "${pkgName}" is now set to PURCHASE REQUIRED.\n\nStudents will see package fee and can purchase access.`
    );
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
            assignedPackage: s.batch || (instituteLanguage === "japanese" ? "Full Mock Test" : "Full Set UBT"),
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
                  batch: loc.assignedPackage || (instituteLanguage === "japanese" ? "Full Mock Test" : "Full Set UBT"),
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
    const isJapaneseInst = instituteLanguage === "japanese";

    const defaultMockPackages = [
      { id: "pkg-jp-1", name: "Full Mock Test", price: "Rs. 2,500", desc: "Complete access to all JLPT (N5-N2) & JFT-Basic CBT Mock Test Sets.", duration: "1 Month", type: "Full Mock Test", track: "japanese" },
      { id: "pkg-jp-2", name: "JFT-Basic Mock Test", price: "Rs. 1,500", desc: "Official JFT-Basic SSW mock test sets with audio and real-time evaluation.", duration: "1 Month", type: "JFT-Basic Mock Test", track: "japanese" },
      { id: "pkg-jp-3", name: "NAT-TEST Mock Test", price: "Rs. 1,500", desc: "NAT-TEST 5Q & 4Q authentic practice sets with listening.", duration: "1 Month", type: "NAT-TEST Mock Test", track: "japanese" },
      { id: "pkg-jp-4", name: "JLPT Mock Test Bundle", price: "Rs. 2,000", desc: "Standard JLPT N5 & N4 simulation mock exam sets.", duration: "1 Month", type: "JLPT Mock Test", track: "japanese" }
    ];

    if (isJapaneseInst) {
      // In Japanese Institute: Strictly strip out ANY Korean UBT / Chapter / EPS packages
      savedPackages = savedPackages.filter(p => {
        if (!p) return false;
        const name = (p.name || "").toLowerCase();
        const type = (p.type || "").toLowerCase();
        const isKorean = p.track === "korean" || name.includes("ubt") || name.includes("chapter") || name.includes("eps") || name.includes("topik") || type.includes("ubt") || type.includes("chapter");
        const isJp = p.track === "japanese" || name.includes("mock") || name.includes("jft") || name.includes("jlpt") || name.includes("nat") || type.includes("mock");
        return isJp && !isKorean;
      });
      // Ensure the standard Japanese mock test packages are always present
      defaultMockPackages.forEach(jpPkg => {
        if (!savedPackages.some(p => (p.name || "").toLowerCase() === jpPkg.name.toLowerCase())) {
          savedPackages.push(jpPkg);
        }
      });
    } else if (savedPackages.length === 0) {
      savedPackages = [
        { id: "pkg-1", name: "Full Set UBT", price: "Rs. 2,000", desc: "Full EPS-TOPIK UBT exam sets (20 Reading + 20 Listening).", duration: "1 Month", type: "UBT Full Exam" },
        { id: "pkg-2", name: "30 Set Chapter UBT", price: "Rs. 1,000", desc: "Chapterwise practice sets with listening audio.", duration: "1 Month", type: "Chapter Wise" },
        { id: "pkg-3", name: "100 UBT set", price: "Rs. 3,500", desc: "Comprehensive 100 UBT test sets simulation.", duration: "3 Months", type: "UBT Full Exam" },
        { id: "pkg-4", name: "Full Package", price: "Rs. 4,500", desc: "Complete access to all UBT & chapterwise test sets.", duration: "Lifetime", type: "Combo Package" }
      ];
      localStorage.setItem("examPackages", JSON.stringify(savedPackages));
    } else if (instituteLanguage === "both") {
      let updated = false;
      defaultMockPackages.forEach(jpPkg => {
        if (!savedPackages.some(p => (p.name || "").toLowerCase() === jpPkg.name.toLowerCase())) {
          savedPackages.push(jpPkg);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem("examPackages", JSON.stringify(savedPackages));
      }
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

    // Build Japanese Mock Exam Sets from JLPT_MOCK_SETS_META for making Mock Test Packages
    const jpMockSets = (JLPT_MOCK_SETS_META || []).map((meta) => ({
      id: meta.id,
      name: meta.title,
      titleJp: meta.titleJp,
      packageName: meta.level || "Full Mock Test",
      setType: "MOCK",
      track: "japanese",
      level: meta.level,
      totalQs: meta.totalQs || 40,
      isPublished: true,
      isMock: true
    }));

    let combinedExamSets = [];
    if (isJapaneseInst) {
      // In Japanese Institute: Strictly exclude ANY Korean UBT / Chapterwise / EPS sets
      const instituteMockSets = savedSets.filter(s => {
        if (!s) return false;
        const name = (s.name || s.title || "").toLowerCase();
        const sType = (s.setType || "").toUpperCase();
        const isKorean = s.track === "korean" || sType === "UBT" || sType === "CHAPTERWISE" || name.includes("ubt") || name.includes("eps") || name.includes("chapter") || name.includes("topik") || name.includes("reading") || name.includes("listening");
        const isJp = s.track === "japanese" || sType === "MOCK" || s.isMock === true || name.includes("mock") || name.includes("jlpt") || name.includes("jft") || name.includes("nat");
        return isJp && !isKorean;
      });
      const seen = new Set();
      [...instituteMockSets, ...jpMockSets].forEach(s => {
        const key = (s.name || s.id).toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          combinedExamSets.push(s);
        }
      });
    } else if (instituteLanguage === "both") {
      const seen = new Set();
      [...savedSets, ...jpMockSets].forEach(s => {
        const key = (s.name || s.id).toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          combinedExamSets.push(s);
        }
      });
    } else {
      combinedExamSets = savedSets;
    }

    const allFoldersData = JSON.parse(localStorage.getItem("epsFoldersContent")) || {};
    const savedNews = JSON.parse(localStorage.getItem("epsNewsList")) || [];

    setExamPackages(savedPackages);
    setExamSets(combinedExamSets);
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
            if (instituteLanguage === "korean") {
              const nTrack = (n.language || n.track || "all").toLowerCase();
              if (nTrack !== "all" && nTrack !== "korean") return false;
            } else if (instituteLanguage === "japanese") {
              const nTrack = (n.language || n.track || "all").toLowerCase();
              if (nTrack !== "all" && nTrack !== "japanese") return false;
            }
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
      language: instituteLanguage === "korean" ? "korean" : (instituteLanguage === "japanese" ? "japanese" : noticeTargetTrack),
      track: instituteLanguage === "korean" ? "korean" : (instituteLanguage === "japanese" ? "japanese" : noticeTargetTrack)
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

  const calculateExpiryDate = (duration, customDate) => {
    if (duration === "Custom Date" && customDate) return customDate;
    if (duration === "Lifetime") return "Lifetime";
    const date = new Date();
    if (duration === "15 Days") date.setDate(date.getDate() + 15);
    else if (duration === "1 Month") date.setMonth(date.getMonth() + 1);
    else if (duration === "2 Months") date.setMonth(date.getMonth() + 2);
    else if (duration === "3 Months") date.setMonth(date.getMonth() + 3);
    else if (duration === "6 Months") date.setMonth(date.getMonth() + 6);
    else if (duration === "1 Year") date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0]; 
  };

  const handleAddPackageItem = (itemToAdd) => {
    if (!itemToAdd) return;
    const cleanItem = itemToAdd.trim();
    if (!selectedPackagesList.includes(cleanItem)) {
      const updated = [...selectedPackagesList, cleanItem];
      setSelectedPackagesList(updated);
      setFormData(prev => ({ ...prev, assignedPackage: updated.join(", ") }));
    }
  };

  const handleRemovePackageItem = (itemToRemove) => {
    const updated = selectedPackagesList.filter(it => it !== itemToRemove);
    setSelectedPackagesList(updated);
    setFormData(prev => ({ ...prev, assignedPackage: updated.join(", ") }));
  };

  const handleSelectAllAvailableSets = () => {
    const setNames = studentFormSpecificSets.map(s => s.name);
    const updated = Array.from(new Set([...selectedPackagesList, ...setNames]));
    setSelectedPackagesList(updated);
    setFormData(prev => ({ ...prev, assignedPackage: updated.join(", ") }));
  };

  const handleClearAllSelectedItems = () => {
    setSelectedPackagesList([]);
    setFormData(prev => ({ ...prev, assignedPackage: "" }));
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    const calculatedExpiryDate = calculateExpiryDate(formData.expiryDuration, formData.customExpiryDate);
    const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    const currentInstStudents = allStudents[instituteName] || [];

    const chosenLanguage = formData.language || (instituteLanguage === "both" ? "both" : instituteLanguage);
    const finalBatch = (selectedPackagesList.length > 0 ? selectedPackagesList.join(", ") : formData.assignedPackage) || (instituteLanguage === "japanese" ? "Full Mock Test" : "Full Set UBT");

    const studentPayload = {
      id: editId || undefined,
      name: formData.name.trim(),
      username: formData.phone.trim(),
      phone: formData.phone.trim(),
      password: (formData.password || "1234").trim(),
      batch: finalBatch,
      status: "Active",
      language: chosenLanguage,
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
            ? { ...stu, ...formData, assignedPackage: finalBatch, id: data.student?.id || stu.id, expiryDate: calculatedExpiryDate, language: data.student?.language || chosenLanguage }
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
        assignedPackage: finalBatch,
        language: data.student?.language || chosenLanguage,
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
    const rawAssigned = student.assignedPackage || student.batch || (instituteLanguage === "japanese" ? "Full Mock Test" : "Full Set UBT");
    const items = rawAssigned.split(",").map(s => s.trim().replace(/^Specific Exam:\s*/i, "")).filter(Boolean);
    setSelectedPackagesList(items.length > 0 ? items : [rawAssigned]);
    setFormData({
      name: student.name,
      phone: student.phone,
      password: student.password || "",
      assignedPackage: rawAssigned,
      expiryDuration: student.expiryDuration || "1 Month",
      customExpiryDate: (student.expiryDate && student.expiryDate !== "Lifetime" && student.expiryDate !== "Active") ? student.expiryDate : "",
      language: student.language || (instituteLanguage === "both" ? "both" : instituteLanguage)
    });
    setEditId(student.id);
    setShowForm(true);
    setActiveTab("students");
  };

  const handleDelete = async (id, phone) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this student from the database?")) return;
    const allStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    const currentInstStudents = allStudents[instituteName] || [];
    const target = currentInstStudents.find(s => s.id === id || s.phone === phone);
    const targetPhone = phone || target?.phone || '';
    const updatedStudents = currentInstStudents.filter(stu => stu.id !== id && stu.phone !== targetPhone);
    allStudents[instituteName] = updatedStudents;
    localStorage.setItem("instituteStudents", JSON.stringify(allStudents));
    setStudents(updatedStudents);

    try {
      const res = await fetch(`/api/institute/students?id=${encodeURIComponent(id || '')}&phone=${encodeURIComponent(targetPhone)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to permanently delete student");
      }
    } catch (err) {
      console.warn("Delete student error:", err);
    }
  };

  const resetForm = () => {
    const defPkg = instituteLanguage === "japanese" ? "Full Mock Test" : "Full Set UBT";
    setSelectedPackagesList([defPkg]);
    setFormData({
      name: "",
      phone: "",
      password: "",
      assignedPackage: defPkg,
      expiryDuration: "1 Month",
      customExpiryDate: "",
      language: instituteLanguage === "japanese" ? "japanese" : (instituteLanguage === "both" ? "both" : instituteLanguage)
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleCopyStudent = (stu) => {
    if (!stu) return;
    const stuLang = stu.language === "japanese" ? "🇯🇵 Japanese Track" : stu.language === "korean" ? "🇰🇷 Korean Track" : "🌐 Both (Dual Track)";
    const text = `🎓 EXAMJK STUDENT LOGIN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Student Name: ${stu.name}
Login ID / Phone: ${stu.phone}
Password: ${stu.password || "1234"}
Course Track: ${stuLang}
Assigned Package: ${stu.assignedPackage || (instituteLanguage === "japanese" ? "Full Mock Test" : "Full Set UBT")}
Validity: ${stu.expiryDate || "Active"}
Login Portal: ${typeof window !== "undefined" ? window.location.origin : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    navigator.clipboard.writeText(text);
    setCopiedStudentId(stu.id || stu.phone);
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

  const isJpTrackEntity = (item) => {
    if (!item) return false;
    const track = (item.track || "").toLowerCase();
    const sType = (item.setType || item.type || "").toUpperCase();
    const name = (item.name || item.title || "").toLowerCase();
    const pkgName = (item.packageName || "").toLowerCase();
    if (track === "japanese") return true;
    if (track === "korean") return false;
    if (sType.includes("MOCK") || item.isMock === true) return true;
    if (sType.includes("UBT") || sType.includes("CHAPTER")) return false;
    return Boolean(
      name.includes("mock") ||
      name.includes("jlpt") ||
      name.includes("jft") ||
      name.includes("nat") ||
      pkgName.includes("mock") ||
      pkgName.includes("jlpt") ||
      pkgName.includes("jft") ||
      pkgName.includes("nat")
    );
  };

  const studentFormPackages = useMemo(() => {
    const defaultKoreanPkgs = [
      { name: "Full Set UBT", price: "Rs. 2,000", track: "korean" },
      { name: "30 Set Chapter UBT", price: "Rs. 1,000", track: "korean" },
      { name: "100 UBT set", price: "Rs. 3,500", track: "korean" },
      { name: "Full Package", price: "Rs. 4,500", track: "korean" }
    ];
    const defaultJapanesePkgs = [
      { name: "Full Mock Test", price: "Rs. 2,500", track: "japanese" },
      { name: "JFT-Basic Mock Test", price: "Rs. 1,500", track: "japanese" },
      { name: "NAT-TEST Mock Test", price: "Rs. 1,500", track: "japanese" },
      { name: "JLPT Mock Test Bundle", price: "Rs. 2,000", track: "japanese" }
    ];

    let combined = Array.isArray(examPackages) ? [...examPackages] : [];
    defaultKoreanPkgs.forEach(kPkg => {
      if (!combined.some(p => (p.name || "").toLowerCase() === kPkg.name.toLowerCase())) {
        combined.push(kPkg);
      }
    });
    defaultJapanesePkgs.forEach(jPkg => {
      if (!combined.some(p => (p.name || "").toLowerCase() === jPkg.name.toLowerCase())) {
        combined.push(jPkg);
      }
    });

    if (instituteLanguage === "korean") {
      return combined.filter(p => !isJpTrackEntity(p));
    }
    if (instituteLanguage === "japanese") {
      return combined.filter(p => isJpTrackEntity(p));
    }
    return combined;
  }, [examPackages, instituteLanguage]);

  const studentFormSpecificSets = useMemo(() => {
    let sets = examSets || [];
    if (instituteLanguage === "korean") {
      sets = sets.filter(s => !isJpTrackEntity(s));
    } else if (instituteLanguage === "japanese") {
      sets = sets.filter(s => isJpTrackEntity(s));
    }
    const seen = new Set();
    const deduped = [];
    sets.forEach(s => {
      const key = (s.name || s.title || "").trim();
      if (key && !seen.has(key.toLowerCase())) {
        seen.add(key.toLowerCase());
        deduped.push(s);
      }
    });
    return deduped;
  }, [examSets, instituteLanguage]);


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
    padding: "0 28px", 
    height: "64px",
    minHeight: "64px",
    maxHeight: "64px",
    display: "flex", 
    alignItems: "center", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    flexWrap: "nowrap",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 9999,
    boxSizing: "border-box",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch"
  };

  const navInnerStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "960px",
    height: "100%"
  };

  const navLeftSlotStyle = {
    flex: "1 1 0",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
    whiteSpace: "nowrap",
    fontSize: "17px",
    fontWeight: "800"
  };

  const menuContainerStyle = { 
    flex: "0 0 auto",
    display: "flex", 
    gap: "8px", 
    flexWrap: "nowrap", 
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    whiteSpace: "nowrap"
  };

  const navRightSlotStyle = {
    flex: "1 1 0",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 0,
    whiteSpace: "nowrap"
  };
  
  const getNavBtnStyle = (tabName) => ({
    backgroundColor: activeTab === tabName ? "#2563eb" : "transparent",
    color: "#ffffff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.15s ease",
    whiteSpace: "nowrap",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "38px",
    boxSizing: "border-box"
  });

  const contentAreaStyle = { padding: "30px", maxWidth: "1200px", margin: "0 auto", userSelect: "text" };
  const cardStyle = { backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: "20px", border: "1px solid #e2e8f0" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderRadius: "8px", overflow: "hidden" };
  const thStyle = { backgroundColor: "#f8fafc", padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: "700", fontSize: "13px", borderBottom: "2px solid #e2e8f0" };
  const tdStyle = { padding: "15px", borderBottom: "1px solid #e2e8f0", color: "#1e293b", verticalAlign: "middle" };
  const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #cbd5e1", borderRadius: "5px", boxSizing: "border-box", backgroundColor: "white" };

  return (
    <div style={containerStyle} onContextMenu={(e) => e.preventDefault()}>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          overflow-y: scroll !important;
          scrollbar-gutter: stable !important;
        }
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
      ` }} />
      
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
        <div style={navInnerStyle}>
          <div style={navLeftSlotStyle}>
            <span suppressHydrationWarning={true}>INSTITUTE PANEL ({instituteName || "sig"})</span>
            {userRole === "staff" && (
              <span style={{ fontSize: "11px", backgroundColor: "#10b981", color: "white", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold", flexShrink: 0, whiteSpace: "nowrap" }}>
                👤 Staff Cashier
              </span>
            )}
          </div>
          
          <div style={menuContainerStyle}>
            <button onClick={() => handleTabChange("billing")} style={getNavBtnStyle("billing")}>
              Billing
            </button>
            
            <button onClick={() => handleTabChange("listening")} style={getNavBtnStyle("listening")}>
              Study Materials
            </button>
            
            <button onClick={() => handleTabChange("dictionary")} style={getNavBtnStyle("dictionary")}>
              Dictionary
            </button>
            
            <button onClick={() => handleTabChange("news")} style={getNavBtnStyle("news")}>
              Notice
            </button>
            
            {userRole !== "staff" && (
              <button onClick={() => handleTabChange("students")} style={getNavBtnStyle("students")}>
                Manage Students
              </button>
            )}
          </div>

          <div style={navRightSlotStyle}>
            <button 
              onClick={handleLogout} 
              style={{ 
                backgroundColor: "#ef4444", 
                color: "white", 
                border: "none", 
                padding: "8px 18px", 
                borderRadius: "6px", 
                cursor: "pointer", 
                fontWeight: "700", 
                fontSize: "13px",
                flexShrink: 0,
                whiteSpace: "nowrap",
                minHeight: "38px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.15s ease"
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Navbar Spacer: Keeps page content exactly in place without overlap */}
      <div style={{ height: "64px", minHeight: "64px", flexShrink: 0 }} aria-hidden="true" />

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
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                boxShadow: "0 12px 30px rgba(5, 150, 105, 0.22), 0 4px 10px rgba(0, 0, 0, 0.05)",
                border: "1.5px solid #a7f3d0",
                overflow: "hidden",
                flexShrink: 0
              }}>
                {/* Header: Manage Students Distinct Emerald Green Theme */}
                <div style={{
                  backgroundColor: "#059669",
                  backgroundImage: "linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)",
                  padding: "26px 20px 22px 20px",
                  textAlign: "center",
                  color: "#ffffff"
                }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.22)",
                    border: "2px solid rgba(255, 255, 255, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px auto",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
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
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "rgba(255, 255, 255, 0.9)", fontWeight: "600" }}>
                    Manage Students Access
                  </p>
                </div>

                {/* Form: White Background */}
                <div style={{ padding: "26px 24px 30px 24px", backgroundColor: "#ffffff" }}>
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
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#065f46", marginBottom: "6px" }}>
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
                          border: "1.5px solid #cbd5e1",
                          backgroundColor: "#f8fafc",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          outline: "none",
                          transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#059669";
                          e.target.style.backgroundColor = "#ffffff";
                          e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#cbd5e1";
                          e.target.style.backgroundColor = "#f8fafc";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "22px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#065f46", marginBottom: "6px" }}>
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
                          border: "1.5px solid #cbd5e1",
                          backgroundColor: "#f8fafc",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          outline: "none",
                          transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#059669";
                          e.target.style.backgroundColor = "#ffffff";
                          e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#cbd5e1";
                          e.target.style.backgroundColor = "#f8fafc";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={unlockLoading}
                      style={{
                        width: "100%",
                        backgroundColor: "#059669",
                        backgroundImage: "linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)",
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
                        boxShadow: "0 4px 14px rgba(5, 150, 105, 0.35)",
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

                  <button
                    onClick={handleOpenCredModal}
                    title={
                      (unlockedRole === "staff" || userRole === "staff")
                        ? "Change your staff login password (Password only, ID cannot be changed)"
                        : "Update shared Login ID and Password for Billing & Manage Students (Admin Only)"
                    }
                    style={{
                      backgroundColor: "#1e3a8a",
                      color: "white",
                      border: "1px solid #1e40af",
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
                    <span>
                      {(unlockedRole === "staff" || userRole === "staff")
                        ? "🔑 Change Password"
                        : "🔑 Change ID / Password"}
                    </span>
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
                    href={`/institute/questions?institute=${encodeURIComponent(instituteName)}${instId ? `&instId=${instId}` : ""}&lang=${encodeURIComponent(instituteLanguage || "korean")}`}
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
                    title={instituteLanguage === "japanese" ? "Create and manage your private Japanese Mock Tests & question bucket" : "Create and manage your private UBT sets & question bucket"}
                  >
                    <span style={{ color: "#ffffff" }}>
                      {instituteLanguage === "japanese" ? "Create Mock Test" : "Create UBT Set"}
                    </span>
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
                      <span style={{ color: "#ffffff" }}>
                        {instituteLanguage === "japanese" ? "Create Mock Test Package" : "Create UBT Exam Package"}
                      </span>
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
                    <div style={{ gridColumn: "span 2", backgroundColor: "#f8fafc", padding: "14px 16px", borderRadius: "8px", border: "1.5px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                          Assigned Packages & Specific Exams ({selectedPackagesList.length} items selected)
                        </label>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {studentFormSpecificSets.length > 0 && (
                            <button
                              type="button"
                              onClick={handleSelectAllAvailableSets}
                              style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                            >
                              + Add All Exams
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleClearAllSelectedItems}
                            style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      {/* Interactive Selected Chips */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "38px", padding: "6px 8px", backgroundColor: "#ffffff", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "10px" }}>
                        {selectedPackagesList.length === 0 ? (
                          <span style={{ fontSize: "12.5px", color: "#94a3b8", fontStyle: "italic", alignSelf: "center" }}>
                            No package or specific exam selected yet. Choose from dropdown below to add.
                          </span>
                        ) : (
                          selectedPackagesList.map((item, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                backgroundColor: isJpTrackEntity({ name: item }) ? "#f3e8ff" : "#eff6ff",
                                color: isJpTrackEntity({ name: item }) ? "#6b21a8" : "#1e40af",
                                border: `1px solid ${isJpTrackEntity({ name: item }) ? "#d8b4fe" : "#bfdbfe"}`,
                                padding: "4px 10px",
                                borderRadius: "16px",
                                fontSize: "12px",
                                fontWeight: "700"
                              }}
                            >
                              <span>{item.includes("SET") || item.includes("Chapter") || item.includes("Simulation") || item.startsWith("Specific Exam:") ? "🎯" : "📦"}</span>
                              <span>{item}</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePackageItem(item)}
                                style={{ background: "transparent", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: "bold", fontSize: "12px", padding: "0 2px" }}
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Dropdown to add more packages or specific exams and Time Limit */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>
                            ➕ Add Package or Specific Exam:
                          </label>
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddPackageItem(e.target.value);
                                e.target.value = "";
                              }
                            }}
                            style={{ ...inputStyle, marginBottom: 0 }}
                          >
                            <option value="">-- Click to Add to Student Access --</option>
                            <optgroup label={instituteLanguage === "japanese" ? "🇯🇵 Japanese Mock Packages" : instituteLanguage === "korean" ? "🇰🇷 Korean UBT Packages" : "📦 Exam Packages"}>
                              {studentFormPackages.map((pkg, idx) => (
                                <option key={`pkg-${idx}`} value={pkg.name}>
                                  + Package: {pkg.name} {pkg.price ? `(${pkg.price})` : ''}
                                </option>
                              ))}
                            </optgroup>
                            {studentFormSpecificSets.length > 0 && (
                              <optgroup label="🎯 Specific Exams (Particular Exam Access)">
                                {studentFormSpecificSets.map((s, idx) => (
                                  <option key={`set-${idx}`} value={s.name}>
                                    + Specific Exam: {s.name}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>
                            ⏳ Access Time Limit:
                          </label>
                          <select
                            name="expiryDuration"
                            value={formData.expiryDuration}
                            onChange={handleInputChange}
                            style={{ ...inputStyle, marginBottom: formData.expiryDuration === "Custom Date" ? "6px" : 0 }}
                          >
                            <option value="15 Days">15 Days</option>
                            <option value="1 Month">1 Month</option>
                            <option value="2 Months">2 Months</option>
                            <option value="3 Months">3 Months</option>
                            <option value="6 Months">6 Months</option>
                            <option value="1 Year">1 Year</option>
                            <option value="Lifetime">Lifetime</option>
                            <option value="Custom Date">Custom Date...</option>
                          </select>
                          {formData.expiryDuration === "Custom Date" && (
                            <input
                              type="date"
                              name="customExpiryDate"
                              value={formData.customExpiryDate || ""}
                              onChange={handleInputChange}
                              style={{ ...inputStyle, marginBottom: 0 }}
                              required
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "700", color: "#334155" }}>
                        Study Language:
                      </label>
                      {instituteLanguage === "korean" ? (
                        <div style={{
                          ...inputStyle,
                          fontWeight: "800",
                          backgroundColor: "#eff6ff",
                          border: "1.5px solid #bfdbfe",
                          color: "#1d4ed8",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <span>🇰🇷 Korean</span>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>(Locked to Korean Institute)</span>
                        </div>
                      ) : instituteLanguage === "japanese" ? (
                        <div style={{
                          ...inputStyle,
                          fontWeight: "800",
                          backgroundColor: "#fdf4ff",
                          border: "1.5px solid #f5d0fe",
                          color: "#9333ea",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <span>🇯🇵 Japanese</span>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>(Locked to Japanese Institute)</span>
                        </div>
                      ) : (
                        <select
                          name="language"
                          value={formData.language || "both"}
                          onChange={handleInputChange}
                          style={{
                            ...inputStyle,
                            fontWeight: "700",
                            backgroundColor: "#f8fafc",
                            border: "1.5px solid #cbd5e1"
                          }}
                        >
                          <option value="korean">🇰🇷 Korean</option>
                          <option value="japanese">🇯🇵 Japanese</option>
                          <option value="both">🌐 Both</option>
                        </select>
                      )}
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <button type="submit" style={{ backgroundColor: editId ? "#f59e0b" : "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                        {editId ? "Update Student" : "Save Student"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Language Filter Tabs for Both Institute or Header Banner */}
              {(() => {
                const koreanCount = students.filter(s => (s.language || "korean").toLowerCase() === "korean").length;
                const japaneseCount = students.filter(s => (s.language || "").toLowerCase() === "japanese").length;
                const bothCount = students.filter(s => (s.language || "").toLowerCase() === "both").length;

                const displayedStudents = students.filter((stu) => {
                  const sLang = (stu.language || "korean").toLowerCase();
                  if (instituteLanguage === "korean") {
                    return sLang === "korean" || sLang === "both";
                  }
                  if (instituteLanguage === "japanese") {
                    return sLang === "japanese" || sLang === "both";
                  }
                  if (studentLangFilter === "korean") return sLang === "korean";
                  if (studentLangFilter === "japanese") return sLang === "japanese";
                  return true;
                });

                return (
                  <div>
                    {instituteLanguage === "both" && (
                      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b", marginRight: "4px" }}>Filter:</span>
                        <button
                          type="button"
                          onClick={() => setStudentLangFilter("all")}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "10px",
                            border: studentLangFilter === "all" ? "2px solid #2563eb" : "1.5px solid #cbd5e1",
                            backgroundColor: studentLangFilter === "all" ? "#2563eb" : "#ffffff",
                            color: studentLangFilter === "all" ? "#ffffff" : "#475569",
                            fontWeight: "800",
                            fontSize: "13px",
                            cursor: "pointer",
                            boxShadow: studentLangFilter === "all" ? "0 4px 12px rgba(37,99,235,0.25)" : "none"
                          }}
                        >
                          🌐 All Students ({students.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentLangFilter("korean")}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "10px",
                            border: studentLangFilter === "korean" ? "2px solid #2563eb" : "1.5px solid #cbd5e1",
                            backgroundColor: studentLangFilter === "korean" ? "#eff6ff" : "#ffffff",
                            color: studentLangFilter === "korean" ? "#1d4ed8" : "#475569",
                            fontWeight: "800",
                            fontSize: "13px",
                            cursor: "pointer",
                            boxShadow: studentLangFilter === "korean" ? "0 4px 12px rgba(37,99,235,0.25)" : "none"
                          }}
                        >
                          🇰🇷 Korean ({koreanCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentLangFilter("japanese")}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "10px",
                            border: studentLangFilter === "japanese" ? "2px solid #9333ea" : "1.5px solid #cbd5e1",
                            backgroundColor: studentLangFilter === "japanese" ? "#fdf4ff" : "#ffffff",
                            color: studentLangFilter === "japanese" ? "#9333ea" : "#475569",
                            fontWeight: "800",
                            fontSize: "13px",
                            cursor: "pointer",
                            boxShadow: studentLangFilter === "japanese" ? "0 4px 12px rgba(147,51,234,0.25)" : "none"
                          }}
                        >
                          🇯🇵 Japanese ({japaneseCount})
                        </button>
                      </div>
                    )}

                    {instituteLanguage === "korean" && (
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        color: "#1d4ed8",
                        fontWeight: "800",
                        fontSize: "13px",
                        marginBottom: "14px"
                      }}>
                        <span>🇰🇷</span>
                        <span>Korean Student Management ({displayedStudents.length} Students)</span>
                      </div>
                    )}

                    {instituteLanguage === "japanese" && (
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#fdf4ff",
                        border: "1px solid #f5d0fe",
                        color: "#9333ea",
                        fontWeight: "800",
                        fontSize: "13px",
                        marginBottom: "14px"
                      }}>
                        <span>🇯🇵</span>
                        <span>Japanese Student Management ({displayedStudents.length} Students)</span>
                      </div>
                    )}

                    <table style={tableStyle}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8fafc" }}>
                          <th style={{ ...thStyle, borderTopLeftRadius: "8px" }}>Student Name</th>
                          <th style={thStyle}>Phone Number</th>
                          <th style={thStyle}>Study Language</th>
                          <th style={thStyle}>Package & Expiry</th>
                          <th style={thStyle}>Status</th>
                          <th style={{ ...thStyle, borderTopRightRadius: "8px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedStudents.length === 0 ? (
                          <tr><td colSpan="6" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>No students registered under this track yet.</td></tr>
                        ) : (
                          displayedStudents.map((stu) => (
                      <tr key={stu.id}>
                        <td style={{ ...tdStyle, fontWeight: "bold" }}>{stu.name}</td>
                        <td style={tdStyle}>{stu.phone}</td>
                        <td style={tdStyle}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "800",
                            backgroundColor: stu.language === "japanese" ? "#f3e8ff" : stu.language === "korean" ? "#eff6ff" : "#f1f5f9",
                            color: stu.language === "japanese" ? "#7e22ce" : stu.language === "korean" ? "#1d4ed8" : "#334155",
                            border: `1px solid ${stu.language === "japanese" ? "#d8b4fe" : stu.language === "korean" ? "#bfdbfe" : "#cbd5e1"}`
                          }}>
                            {stu.language === "japanese" ? "🇯🇵 Japanese" : stu.language === "korean" ? "🇰🇷 Korean" : "🌐 Both"}
                          </span>
                        </td>
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
            </div>
          );
        })()}

              {/* UBT PACKAGES & PRICING MANAGEMENT (CREATED BY OWN CHOICE & CUSTOM PRICE) */}
        {true && (
          <div style={{ marginTop: "50px" }}>
            

            {/* Form to Create Custom Package */}
            {showCreatePkgForm && (
              <div style={cardStyle}>
                <div style={{ paddingTop: "10px" }}>
                  <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a", fontWeight: "700" }}>
                    🛠️ Design Custom {instituteLanguage === "japanese" ? "Mock Test" : "Exam"} Package Details
                  </h4>

                  <form onSubmit={handleCreateCustomPackage}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                          Package Name *
                        </label>
                        <input
                          type="text"
                          placeholder={instituteLanguage === "japanese" ? "e.g. Special 20 Japanese Mock Test Sets or JLPT Bundle" : "e.g. Special 20 UBT Sets or Crash Course Bundle"}
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
                          {instituteLanguage === "japanese" ? (
                            <>
                              <option value="Full Mock Test">Full Mock Test</option>
                              <option value="JLPT Mock Test">JLPT Mock Test</option>
                              <option value="JFT-Basic Mock Test">JFT-Basic Mock Test</option>
                              <option value="NAT-TEST Mock Test">NAT-TEST Mock Test</option>
                              <option value="Combo Package">Combo Mock Package</option>
                              <option value="Special Offer">Special Offer</option>
                            </>
                          ) : (
                            <>
                              <option value="UBT Full Exam">UBT Full Exam</option>
                              <option value="Chapter Wise">Chapter Wise Practice</option>
                              <option value="Combo Package">Combo Full Package</option>
                              <option value="Special Offer">Special Offer</option>
                            </>
                          )}
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
                        placeholder={instituteLanguage === "japanese" ? "e.g. Intensive Japanese mock test sets with reading & listening questions." : "e.g. Intensive model test sets with 20 Reading + 20 Listening questions per set."}
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
                            {instituteLanguage === "japanese" ? "⛩️ Choose Mock Test Sets to Bundle in this Package" : "🎯 Choose Exam Sets Included in this Package"} ({selectedSetsForPkg.length} selected)
                          </label>
                          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                            {instituteLanguage === "japanese"
                              ? "Select specific JLPT / JFT mock test sets to build a custom mock package. Students purchasing will auto-unlock these sets."
                              : "Students who purchase or are assigned this package will have access to these sets."}
                          </p>
                        </div>

                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {instituteLanguage === "japanese" || examSets.some(s => s.track === "japanese" || s.setType === "MOCK") ? (
                            <>
                              <button
                                type="button"
                                onClick={handleSelectAllMockSets}
                                style={{ backgroundColor: "#faf5ff", color: "#7e22ce", border: "1px solid #e9d5ff", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                              >
                                ⛩️ All Mock Sets
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectMockByLevel("N5")}
                                style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "4px 8px", borderRadius: "4px", fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}
                              >
                                + JLPT N5 (10)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectMockByLevel("N4")}
                                style={{ backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "4px 8px", borderRadius: "4px", fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}
                              >
                                + JLPT N4 (10)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectMockByLevel("N3")}
                                style={{ backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", padding: "4px 8px", borderRadius: "4px", fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}
                              >
                                + JLPT N3 (10)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectMockByLevel("N2")}
                                style={{ backgroundColor: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", padding: "4px 8px", borderRadius: "4px", fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}
                              >
                                + JLPT N2 (10)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectMockByLevel("JFT")}
                                style={{ backgroundColor: "#fdf4ff", color: "#a21caf", border: "1px solid #f0abfc", padding: "4px 8px", borderRadius: "4px", fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}
                              >
                                + JFT-Basic (10)
                              </button>
                              <button
                                type="button"
                                onClick={handleSelectMockModel}
                                style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "4px 8px", borderRadius: "4px", fontSize: "11.5px", fontWeight: "700", cursor: "pointer" }}
                              >
                                🎯 Model Exam / Simulation
                              </button>
                            </>
                          ) : (
                            <>
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
                                onClick={handleSelectAllModelSets}
                                style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                              >
                                + All Model Sets
                              </button>
                            </>
                          )}
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

                      {studentFormSpecificSets.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>No sets available in the system yet.</p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px", maxHeight: "250px", overflowY: "auto", padding: "4px" }}>
                          {studentFormSpecificSets.map((s, idx) => {
                            const isChecked = selectedSetsForPkg.includes(s.name);
                            const isMock = s.setType === "MOCK" || s.track === "japanese" || s.isMock || (s.name && (s.name.toLowerCase().includes("mock") || s.name.toLowerCase().includes("jlpt") || s.name.toLowerCase().includes("jft") || s.name.toLowerCase().includes("nat")));
                            const isChapter = (s.setType || "").toLowerCase().includes("chapter") || (s.name || "").toLowerCase().includes("chapter");
                            const icon = isMock ? "⛩️" : (isChapter ? "📚" : "🎯");
                            const levelBadge = s.level || (isMock ? "Mock" : (isChapter ? "Chapter" : "UBT"));
                            return (
                              <label
                                key={idx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 10px",
                                  borderRadius: "6px",
                                  backgroundColor: isChecked ? (isMock ? "#faf5ff" : "#eff6ff") : "#ffffff",
                                  border: isChecked ? (isMock ? "1.5px solid #9333ea" : "1.5px solid #2563eb") : "1px solid #cbd5e1",
                                  cursor: "pointer",
                                  fontSize: "12.5px",
                                  fontWeight: isChecked ? "700" : "normal",
                                  color: isChecked ? (isMock ? "#6b21a8" : "#1e40af") : "#1e293b"
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleSetForPackage(s.name)}
                                  style={{ cursor: "pointer" }}
                                />
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  <span>{icon}</span>
                                  <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "3px", backgroundColor: isMock ? "#f3e8ff" : "#e0f2fe", color: isMock ? "#7e22ce" : "#0369a1", fontWeight: "700", flexShrink: 0 }}>
                                    {levelBadge}
                                  </span>
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                                </span>
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
                    {instituteLanguage === "japanese" ? "Configured Mock Test Packages" : "Configured UBT Packages"} ({examPackages.length})
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                    Click <strong>"✏️ Set / Edit Price"</strong> on any package to customize its fee for your students.
                  </p>
                </div>

                <Link
                  href={`/institute/questions?institute=${encodeURIComponent(instituteName)}${instId ? `&instId=${instId}` : ""}&lang=${encodeURIComponent(instituteLanguage || "korean")}`}
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
                  title={instituteLanguage === "japanese" ? "Create your own private Japanese Mock Tests & question bucket" : "Create your own private UBT sets & question bucket"}
                >
                  <span style={{ color: "#ffffff" }}>
                    {instituteLanguage === "japanese" ? "Create Mock Test" : "Create UBT Set"}
                  </span>
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
                          {pkg.desc || (instituteLanguage === "japanese" ? "Full simulated Japanese CBT Mock Test examination sets with audio and detailed scoring." : "Full EPS-TOPIK UBT examination sets with audio and detailed scoring.")}
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Package Price:</span>
                          <span style={{ fontSize: "20px", fontWeight: "800", color: (pkg.distributionMode === "free" || (pkg.price || "").toLowerCase().includes("free") || pkg.price === "Rs. 0") ? "#16a34a" : "#1e40af" }}>
                            {pkg.price || "Rs. 1,500"}
                          </span>
                        </div>

                        {/* Distribution Mode Badge & Quick Toggle */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", backgroundColor: "#f8fafc", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569" }}>Student Access:</span>
                          <span style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            backgroundColor: (pkg.distributionMode === "free" || (pkg.price || "").toLowerCase().includes("free") || pkg.price === "Rs. 0") ? "#dcfce7" : "#ffedd5",
                            color: (pkg.distributionMode === "free" || (pkg.price || "").toLowerCase().includes("free") || pkg.price === "Rs. 0") ? "#15803d" : "#c2410c"
                          }}>
                            {(pkg.distributionMode === "free" || (pkg.price || "").toLowerCase().includes("free") || pkg.price === "Rs. 0") ? "🎁 FREE FOR ENROLLED STUDENTS" : "💳 PURCHASE REQUIRED"}
                          </span>
                        </div>

                        {/* Distribution Toggle Button */}
                        <div style={{ marginBottom: "10px" }}>
                          <button
                            type="button"
                            onClick={() => handleTogglePackageDistribution(pkg.name)}
                            style={{
                              width: "100%",
                              backgroundColor: (pkg.distributionMode === "free" || (pkg.price || "").toLowerCase().includes("free") || pkg.price === "Rs. 0") ? "#fef2f2" : "#f0fdf4",
                              color: (pkg.distributionMode === "free" || (pkg.price || "").toLowerCase().includes("free") || pkg.price === "Rs. 0") ? "#b91c1c" : "#166534",
                              border: `1.5px solid ${(pkg.distributionMode === "free" || (pkg.price || "").toLowerCase().includes("free") || pkg.price === "Rs. 0") ? "#fca5a5" : "#86efac"}`,
                              padding: "7px 10px",
                              borderRadius: "6px",
                              fontWeight: "700",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px"
                            }}
                          >
                            <span>{(pkg.distributionMode === "free" || (pkg.price || "").toLowerCase().includes("free") || pkg.price === "Rs. 0") ? "💳 Switch to Purchase Required" : "🎁 Distribute Free to Our Students"}</span>
                          </button>
                        </div>

                        {/* Price editing toggle */}
                        {isEditingPrice ? (
                          <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                            <input
                              type="text"
                              value={editingPriceValue}
                              onChange={(e) => setEditingPriceValue(e.target.value)}
                              placeholder="New Price (e.g. Free or Rs. 2,000)"
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
                      <span>📝</span> {instituteLanguage === "japanese" ? "Mock Test Sets & Packages Overview" : "UBT Exam Sets & Packages Overview"}
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
                      {instituteLanguage === "japanese"
                        ? "Preview and verify available Japanese mock test sets for students under your institute"
                        : "Preview and verify available UBT test sets for students under your institute"}
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
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#475569", background: "#cbd5e1", padding: "2px 6px", borderRadius: "4px" }}>{set.packageName || (instituteLanguage === "japanese" ? "Mock Test" : "UBT-TEST")}</span>
                          <h4 style={{ margin: "10px 0", fontSize: "16px", color: "#1e293b" }}>{set.name}</h4>
                        </div>
                        <div style={{ marginTop: "15px", display: "flex", gap: "8px" }}>
                          <button onClick={() => router.push(`/institute/exam-preview/${set.id}`)} style={{ flex: 1, backgroundColor: "#2563eb", color: "white", border: "none", padding: "9px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>PREVIEW EXAM</button>
                          <button
                            type="button"
                            onClick={() => {
                              const isFree = Boolean(set.isFree || set.distributionMode === "free");
                              const nextFree = !isFree;
                              const allSets = JSON.parse(localStorage.getItem("examSets") || "[]");
                              const updated = allSets.map(s => (s.id === set.id || s.name === set.name) ? { ...s, isFree: nextFree, distributionMode: nextFree ? "free" : "paid" } : s);
                              setExamSets(updated);
                              localStorage.setItem("examSets", JSON.stringify(updated));

                              try {
                                const instDist = JSON.parse(localStorage.getItem(`instituteDistribution_${instituteName}`) || "{}");
                                instDist[set.id] = nextFree ? "free" : "paid";
                                instDist[set.name] = nextFree ? "free" : "paid";
                                localStorage.setItem(`instituteDistribution_${instituteName}`, JSON.stringify(instDist));
                              } catch (e) {}

                              alert(nextFree ? `✅ Set "${set.name}" is now FREE for your students!` : `Set "${set.name}" now set to Purchase Required.`);
                            }}
                            title={set.isFree ? "Click to require purchase" : "Click to distribute free to your students"}
                            style={{
                              backgroundColor: (set.isFree || set.distributionMode === "free") ? "#dcfce7" : "#fff7ed",
                              color: (set.isFree || set.distributionMode === "free") ? "#15803d" : "#c2410c",
                              border: `1.5px solid ${(set.isFree || set.distributionMode === "free") ? "#86efac" : "#fed7aa"}`,
                              padding: "9px 12px",
                              borderRadius: "4px",
                              fontWeight: "700",
                              fontSize: "11px",
                              cursor: "pointer",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {(set.isFree || set.distributionMode === "free") ? "🎁 Free" : "💳 Paid"}
                          </button>
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
          <DictionarySection instituteLanguage={instituteLanguage} userRole="institute" />
        )}

        {activeTab === "news" && (
          <div>
            <div style={{ marginBottom: "32px" }}>
              <OfficialPortalButtons track={instituteLanguage || "both"} showTrackTabs={instituteLanguage === "both"} />
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

      {/* Shared Gate / Staff Password Modal */}
      {showCredModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "14px",
            width: "100%",
            maxWidth: "420px",
            padding: "26px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            border: "1px solid #cbd5e1"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#1e3a8a", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              🔑 {(unlockedRole === "staff" || userRole === "staff") ? "Change Staff Password" : "Update Login Credentials"}
            </h3>
            <p style={{ margin: "0 0 18px 0", color: "#64748b", fontSize: "13px" }}>
              {(unlockedRole === "staff" || userRole === "staff")
                ? "Staff User: You can change your password only (User ID cannot be modified)."
                : "Admin only: Updating this User ID and Password will immediately work for both Billing and Manage Students."}
            </p>

            <form onSubmit={handleUpdateCredSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: (unlockedRole === "staff" || userRole === "staff") ? "#64748b" : "#1e3a8a", marginBottom: "6px" }}>
                  {(unlockedRole === "staff" || userRole === "staff")
                    ? "User ID (Fixed - Staff cannot change ID)"
                    : "User ID / Username *"}
                </label>
                {(unlockedRole === "staff" || userRole === "staff") ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    gap: "8px"
                  }}>
                    <span>🔒</span>
                    <input
                      type="text"
                      value={unlockedUserId || newCredUserId || "staff"}
                      disabled
                      readOnly
                      style={{
                        width: "100%",
                        backgroundColor: "transparent",
                        border: "none",
                        fontSize: "14px",
                        color: "#475569",
                        fontWeight: "bold",
                        cursor: "not-allowed",
                        outline: "none"
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>
                      ID Locked
                    </span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={newCredUserId}
                    onChange={(e) => setNewCredUserId(e.target.value)}
                    placeholder="e.g. admin or custom ID"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                  />
                )}
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                  {(unlockedRole === "staff" || userRole === "staff") ? "Current Password *" : "Current Password / Admin PIN *"}
                </label>
                <input
                  type="password"
                  value={credCurrentPassword}
                  onChange={(e) => setCredCurrentPassword(e.target.value)}
                  placeholder={(unlockedRole === "staff" || userRole === "staff") ? "Enter your current password" : "Enter current admin password or PIN"}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                  New Password (Min 6 chars) *
                </label>
                <input
                  type="password"
                  value={newCredPassword}
                  onChange={(e) => setNewCredPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={confirmCredPassword}
                  onChange={(e) => setConfirmCredPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {credMsg && (
                <div style={{
                  backgroundColor: credMsg.startsWith("SUCCESS") ? "#dcfce7" : "#fee2e2",
                  color: credMsg.startsWith("SUCCESS") ? "#166534" : "#991b1b",
                  padding: "10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  marginBottom: "16px",
                  fontWeight: "600"
                }}>
                  {credMsg}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowCredModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={credLoading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: credLoading ? "#93c5fd" : "#1e3a8a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: credLoading ? "not-allowed" : "pointer"
                  }}
                >
                  {credLoading ? "Saving..." : (unlockedRole === "staff" || userRole === "staff") ? "Update My Password" : "Save for Both"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default InstituteDashboard;