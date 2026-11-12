'use client';

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import DictionarySection from "@/components/DictionarySection";
import EpsBookReader from "@/components/EpsBookReader";
import OfficialPortalButtons from "@/components/OfficialPortalButtons";
import EsewaCheckoutModal from "@/components/EsewaCheckoutModal";
import JlptMockExamModal from "@/components/JlptMockExamModal";
import ColorVisionSection from "@/components/ColorVisionSection";
import AboutUsSection from "@/components/AboutUsSection";
import { JLPT_MOCK_SETS_META, getMockExamSetById } from "@/data/jlptMockTestData";
import { performLogout } from "@/lib/clientAuth";

// Clean SVG Icons for zero-emoji compliance
const LaptopExamIcon = ({ size = 28, color = "#1e3a8a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <circle cx="12" cy="10" r="3" />
    <polyline points="12 8.5 12 10 13 10.5" />
  </svg>
);

const BarChartIcon = ({ size = 28, color = "#2563eb" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const CartIcon = ({ size = 28, color = "#d97706" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const BookStackIcon = ({ size = 28, color = "#0284c7" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const BookOpenIcon = ({ size = 28, color = "#475569" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const BellIcon = ({ size = 28, color = "#0284c7" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const FileIcon = ({ size = 20, color = "#2563eb" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const SearchIcon = ({ size = 20, color = "#d97706" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BuildingIcon = ({ size = 20, color = "#0f766e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="22.01" />
    <line x1="15" y1="22" x2="15" y2="22.01" />
  </svg>
);

const SHIFT_NAMES = ['morning', 'day', 'evening', 'night', 'afternoon'];
const isShift = (str) => SHIFT_NAMES.includes((str || '').toLowerCase().trim());

const StudentDashboard = () => {
  const router = useRouter();
  const pathname = usePathname();
  const location = { pathname, state: {} };

  const [activeTab, setActiveTab] = useState("home");
  const [examSets, setExamSets] = useState([]);
  const [examPackages, setExamPackages] = useState([]);
  const [selectedPackageFilter, setSelectedPackageFilter] = useState("All");
  const [examSetsPage, setExamSetsPage] = useState(1);
  const [examSetsSearch, setExamSetsSearch] = useState("");
  const [activeJlptExamSet, setActiveJlptExamSet] = useState(null);
  const SETS_PER_PAGE = 20;

  const [activeBookFolder, setActiveBookFolder] = useState("EPS Book");
  const [folderMaterials, setFolderMaterials] = useState([]);

  const [searchWord, setSearchWord] = useState("");
  const [vocabResult, setVocabResult] = useState(null);
  const [loadingVocab, setLoadingVocab] = useState(false);

  const [newsList, setNewsList] = useState([]);
  const [noticeFilterTrack, setNoticeFilterTrack] = useState("auto"); // "auto" | "all" | "korean" | "japanese"
  const [noticeSubCategory, setNoticeSubCategory] = useState("all");
  const [results, setResults] = useState([]);
  const [showBannerPopup, setShowBannerPopup] = useState(false);
  const [popupNotice, setPopupNotice] = useState(null);
  const [myNotifications, setMyNotifications] = useState([]);
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");

  // Individual UBT sets, Released Sets & eSewa Query State
  const [unlockedSets, setUnlockedSets] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u1 = JSON.parse(localStorage.getItem("unlockedStudentExamSets") || "[]");
        const u2 = JSON.parse(localStorage.getItem("releasedStudentExamSets") || "[]");
        return Array.from(new Set([...u1, ...u2]));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [pendingQueries, setPendingQueries] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("studentPendingQueries") || "[]");
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [esewaModalOpen, setEsewaModalOpen] = useState(false);
  const [selectedEsewaItem, setSelectedEsewaItem] = useState(null);
  const [paidAccessTrigger, setPaidAccessTrigger] = useState(0);

  // Student profile & institute info
  const [studentName, setStudentName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentUser") || localStorage.getItem("currentStudentName") || "";
    }
    return "";
  });
  const [currentStudentPhone, setCurrentStudentPhone] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentStudentPhone") || localStorage.getItem("studentPhone") || null;
    }
    return null;
  });
  const [studentInstitute, setStudentInstitute] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentInstitute") || null;
    }
    return null;
  });
  const [studentInstituteId, setStudentInstituteId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentInstituteId") || null;
    }
    return null;
  });
  const [studentInstitutePackage, setStudentInstitutePackage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentInstitutePackage") || localStorage.getItem("instituteExamPackage") || null;
    }
    return null;
  });
  const [studentBatch, setStudentBatch] = useState(null);
  const [studentPackage, setStudentPackage] = useState(() => (
    typeof window !== "undefined" && (
      window.location.search.includes("lang=japanese") ||
      localStorage.getItem("instituteLanguage") === "japanese"
    ) ? "Full Mock Test" : "Full Set UBT"
  ));
  const [studentExpiryDate, setStudentExpiryDate] = useState("");
  const [purchasedPackages, setPurchasedPackages] = useState([]);
  const [logoWatermark, setLogoWatermark] = useState("");
  const [japaneseMockFilter, setJapaneseMockFilter] = useState("all");
  const [instituteLanguage, setInstituteLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("instituteLanguage") || "both";
    }
    return "both";
  });

  const effectiveLang = (
    (typeof window !== "undefined" && window.location.search.includes("lang=japanese")) ? "japanese" :
    (typeof window !== "undefined" && window.location.search.includes("lang=korean")) ? "korean" :
    (instituteLanguage || (typeof window !== "undefined" ? localStorage.getItem("instituteLanguage") : "both") || "both")
  );

  const isPureJapaneseStudent = effectiveLang === "japanese";
  const isPureKoreanStudent = effectiveLang === "korean";
  const isBothTrack = !isPureJapaneseStudent && !isPureKoreanStudent;
  const isJapaneseTrack = isPureJapaneseStudent;

  // Strict track visibility:
  // Korean students: show Start UBT Exam ONLY (Mock Test is NEVER shown)
  // Japanese students: show Mock Test ONLY (Start UBT Exam is NEVER shown)
  // Both: show BOTH Start UBT Exam and Mock Test
  const showUbtExam = isBothTrack || isPureKoreanStudent;
  const showMockTest = isBothTrack || isPureJapaneseStudent;

  const [examCategoryFilter, setExamCategoryFilter] = useState(() => (
    isPureJapaneseStudent ? "mock" : isPureKoreanStudent ? "ubt" : "all"
  ));
  const [packageCategoryFilter, setPackageCategoryFilter] = useState(() => (
    isPureJapaneseStudent ? "mock" : isPureKoreanStudent ? "ubt" : "all"
  ));

  useEffect(() => {
    if (isPureJapaneseStudent) {
      setExamCategoryFilter("mock");
      setPackageCategoryFilter("mock");
    } else if (isPureKoreanStudent) {
      setExamCategoryFilter("ubt");
      setPackageCategoryFilter("ubt");
    } else {
      setExamCategoryFilter("all");
      setPackageCategoryFilter("all");
    }
  }, [instituteLanguage, isPureJapaneseStudent, isPureKoreanStudent]);

  const isEnrolledInstituteStudent = Boolean(
    (studentInstituteId && !studentInstituteId.startsWith("examjk-open")) ||
    (studentInstitute && !studentInstitute.toLowerCase().includes("open academy") && !studentInstitute.toLowerCase().includes("open institute")) ||
    (typeof window !== "undefined" && (
      (localStorage.getItem("currentInstituteId") && !localStorage.getItem("currentInstituteId").startsWith("examjk-open")) ||
      (localStorage.getItem("currentInstitute") && !localStorage.getItem("currentInstitute").toLowerCase().includes("open academy") && !localStorage.getItem("currentInstitute").toLowerCase().includes("open institute"))
    ))
  );

  const isGoogleOrFree = !isEnrolledInstituteStudent || Boolean(
    studentPackage?.toLowerCase().includes("google") ||
    studentPackage?.toLowerCase().includes("free") ||
    studentBatch?.toLowerCase().includes("google") ||
    studentBatch?.toLowerCase().includes("free") ||
    currentStudentPhone?.includes("@") ||
    (typeof window !== "undefined" && (
      localStorage.getItem("isFreeStudent") === "true" ||
      localStorage.getItem("isGoogleAuth") === "true" ||
      (localStorage.getItem("currentUser") || "").includes("@") ||
      (localStorage.getItem("currentStudentPhone") || "").includes("@") ||
      (localStorage.getItem("studentPhone") || "").includes("@") ||
      (localStorage.getItem("currentStudentPackage") || "").toLowerCase().includes("free") ||
      (localStorage.getItem("currentStudentPackage") || "").toLowerCase().includes("google") ||
      (localStorage.getItem("currentStudentExpiryDate") || "").toLowerCase().includes("free")
    ))
  );

  // Check if student has actually purchased / unlocked UBT exam access
  const buyerMap = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}") : {};
  const currentPhone = currentStudentPhone || (typeof window !== 'undefined' ? localStorage.getItem("currentStudentPhone") : null);
  const currentBuyer = currentPhone ? (buyerMap[currentPhone] || buyerMap[studentName]) : null;

  const isPurchasedBuyer = Boolean(
    currentBuyer?.isBuyer ||
    currentBuyer?.hasPurchased ||
    (currentBuyer?.packages && currentBuyer.packages.length > 0) ||
    currentBuyer?.packageName ||
    currentBuyer?.package ||
    (typeof window !== "undefined" && (
      localStorage.getItem("isPurchasedBuyer") === "true" ||
      localStorage.getItem("hasPurchasedExamAccess") === "true" ||
      (currentPhone && (buyerMap[currentPhone]?.isBuyer || buyerMap[currentPhone]?.hasPurchased)) ||
      (studentName && (buyerMap[studentName]?.isBuyer || buyerMap[studentName]?.hasPurchased)) ||
      (JSON.parse(localStorage.getItem("studentPurchasedSets") || "[]")).length > 0 ||
      (JSON.parse(localStorage.getItem("unlockedStudentExamSets") || "[]")).length > 0 ||
      (JSON.parse(localStorage.getItem("purchasedPackages") || "[]")).length > 0
    ))
  );

  // Track active released packages specifically for this student
  const activeStudentPackages = (() => {
    let list = [];

    // 1. From student's institute: Enrolled students inherit their institute's active package (ONLY for accredited institutes)
    if (isEnrolledInstituteStudent) {
      const instPkg = studentInstitutePackage || (typeof window !== "undefined" ? (localStorage.getItem("currentInstitutePackage") || localStorage.getItem("instituteExamPackage")) : null);
      if (instPkg && !list.includes(instPkg)) {
        list.push(instPkg);
      }

      if (typeof window !== "undefined" && studentInstitute) {
        try {
          const institutes = JSON.parse(localStorage.getItem("institutes") || "[]");
          const found = institutes.find(i => (i.name && i.name.toLowerCase() === studentInstitute.toLowerCase()) || (i.username && i.username.toLowerCase() === studentInstitute.toLowerCase()));
          if (found) {
            if (found.examPackage && !list.includes(found.examPackage)) list.push(found.examPackage);
            if (Array.isArray(found.purchasedPackages)) {
              found.purchasedPackages.forEach(p => { if (p && !list.includes(p)) list.push(p); });
            }
            if (Array.isArray(found.assignedPackages)) {
              found.assignedPackages.forEach(p => { if (p && !list.includes(p)) list.push(p); });
            }
          }
          const instPurchased = JSON.parse(localStorage.getItem(`institutePurchasedPackages_${studentInstitute}`) || "[]");
          if (Array.isArray(instPurchased)) {
            instPurchased.forEach(p => { if (p && !list.includes(p)) list.push(p); });
          }
        } catch (e) {}
      }
    }

    // 2. From adminBuyerStudentsMap for this student phone
    if (currentBuyer?.packages && Array.isArray(currentBuyer.packages)) {
      list.push(...currentBuyer.packages);
    }
    if (currentBuyer?.packageName && !list.includes(currentBuyer.packageName)) {
      list.push(currentBuyer.packageName);
    }

    // 3. From studentPendingQueries where status === "Released" && itemType === "package"
    pendingQueries.forEach((q) => {
      const qPhone = q.phone || "";
      if (
        (q.status === "Released" || q.status === "COMPLETE") &&
        q.itemType === "package" &&
        (!currentPhone || qPhone === currentPhone)
      ) {
        if (q.itemName && !list.includes(q.itemName)) {
          list.push(q.itemName);
        }
      }
    });

    // 4. From institute-assigned package (if student was explicitly enrolled by institute in a paid package or specific exams)
    if (
      studentPackage &&
      !isGoogleOrFree &&
      !studentPackage.toLowerCase().includes("free") &&
      !studentPackage.toLowerCase().includes("google")
    ) {
      const parts = studentPackage.split(",").map(p => p.trim()).filter(Boolean);
      parts.forEach(p => {
        if (!list.includes(p)) {
          list.push(p);
        }
      });
    }

    // Strict Track Isolation:
    // In Japanese Track: Strictly strip out ANY Korean packages
    if (isJapaneseTrack) {
      list = list.filter(pkgName => {
        const lower = (pkgName || "").toLowerCase();
        return !lower.includes("ubt") && !lower.includes("chapter") && !lower.includes("eps") && !lower.includes("topik") && !lower.includes("model question");
      });
    }

    // In Pure Korean Track: Strictly strip out Japanese mock packages
    if (isPureKoreanStudent) {
      list = list.filter(pkgName => {
        const lower = (pkgName || "").toLowerCase();
        return !lower.includes("mock") && !lower.includes("jlpt") && !lower.includes("jft") && !lower.includes("nat");
      });
    }

    return list;
  })();

  const hasPaidExamAccess = activeStudentPackages.length > 0;

  const effectivePackageName = activeStudentPackages.length > 0
    ? activeStudentPackages.join(", ")
    : "Free Student Access (Lifetime Account)";

  const effectiveExpiryDate = hasPaidExamAccess
    ? (currentBuyer?.expiryDate || studentExpiryDate)
    : null;

  const isPackageExpired = Boolean(
    hasPaidExamAccess &&
    effectiveExpiryDate &&
    effectiveExpiryDate !== "Active" &&
    !effectiveExpiryDate.toLowerCase().includes("lifetime") &&
    !isNaN(new Date(effectiveExpiryDate).getTime()) &&
    new Date(effectiveExpiryDate + 'T23:59:59') < new Date()
  );

  // Helper: check if a specific exam set belongs to a package name
  const isSetInSinglePackage = (set, pkgName) => {
    if (!set || !pkgName) return false;
    const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetPkgNorm = norm(pkgName);

    // 1. Direct check: If any exam package named pkgName explicitly includes this set
    const matchingPkg = examPackages.find(p => norm(p.name) === targetPkgNorm);
    if (matchingPkg?.includedSets && Array.isArray(matchingPkg.includedSets)) {
      const match = matchingPkg.includedSets.some(sName => {
        const incNorm = norm(sName);
        return incNorm === norm(set.name) || incNorm === norm(set.id) || incNorm === norm(set.title);
      });
      if (match) return true;
    }

    const setPkgNorm = norm(set.packageName || "");
    const setNameNorm = norm(set.name || "");
    const isJapaneseSet = Boolean(
      set.track === "japanese" ||
      set.level ||
      set.setType === "MOCK" ||
      (set.id && (String(set.id).startsWith("jlpt-") || String(set.id).startsWith("jft-"))) ||
      setNameNorm.includes("mock") ||
      setNameNorm.includes("jlpt") ||
      setNameNorm.includes("jft") ||
      setNameNorm.includes("nat")
    );

    // Direct Specific Exam / Particular Exam Set match
    const cleanTarget = targetPkgNorm.replace("specificexam", "");
    if (setNameNorm && (targetPkgNorm === setNameNorm || cleanTarget === setNameNorm || (set.id && targetPkgNorm === norm(set.id)))) {
      return true;
    }

    // Exact match (e.g. "30setchapterubt" === "30setchapterubt")
    if (setPkgNorm && setPkgNorm === targetPkgNorm) return true;

    // Chapterwise package match
    if (targetPkgNorm.includes("chapter") && (setPkgNorm.includes("chapter") || setNameNorm.includes("chapter"))) return true;

    // 100 UBT package match
    if (targetPkgNorm.includes("100") && (setPkgNorm.includes("100") || setNameNorm.includes("100"))) return true;

    // Model Question Bank match - open for all students
    if (setPkgNorm.includes("model") || setNameNorm.includes("model")) return true;

    // Full Set UBT: covers standard EPS full sets (not chapter and not model question sets)
    if (
      targetPkgNorm.includes("full") &&
      !targetPkgNorm.includes("mock") &&
      !isJapaneseSet &&
      !setPkgNorm.includes("chapter") &&
      !setPkgNorm.includes("model") &&
      !setNameNorm.includes("chapter") &&
      !setNameNorm.includes("model")
    ) {
      return true;
    }

    // Japanese Full Mock Test package covers all Japanese mock sets
    if ((targetPkgNorm.includes("full") || targetPkgNorm.includes("all")) && targetPkgNorm.includes("mock")) {
      if (isJapaneseSet) return true;
    }

    // Specific Japanese Package tracks
    if (targetPkgNorm.includes("jft") && (setNameNorm.includes("jft") || setPkgNorm.includes("jft"))) return true;
    if (targetPkgNorm.includes("nat") && (setNameNorm.includes("nat") || setPkgNorm.includes("nat"))) return true;
    if (targetPkgNorm.includes("jlpt") && (setNameNorm.includes("jlpt") || setPkgNorm.includes("jlpt"))) return true;
    if (targetPkgNorm.includes("mock") && (setPkgNorm.includes("mock") || setNameNorm.includes("mock"))) return true;

    return false;
  };

  const isSetInPackage = (set, pkgName) => {
    if (!set || !pkgName) return false;
    const parts = String(pkgName).split(",").map(s => s.trim()).filter(Boolean);
    return parts.some(p => isSetInSinglePackage(set, p));
  };

  // Helper: check if an exam set is covered by any of the student's active released packages
  const isSetCoveredByStudentPackage = (set) => {
    if (!set || isPackageExpired) return false;
    return activeStudentPackages.some((pkgName) => isSetInPackage(set, pkgName));
  };

  // Helper: check if a specific exam set is individually unlocked (via Rs. 40 purchase or admin release)
  const isSetIndividuallyUnlocked = (set) => {
    if (!set) return false;
    const setId = set.id?.toString();
    const setName = set.name?.toString();
    const encodedName = typeof set.name === "string" ? encodeURIComponent(set.name) : "";

    // 1. Check in unlockedSets state
    if (
      unlockedSets.some((id) =>
        id?.toString() === setId ||
        id?.toString() === setName ||
        (encodedName && id?.toString() === encodedName)
      )
    ) {
      return true;
    }

    // 2. Check fresh localStorage for unlocked and released sets
    if (typeof window !== "undefined") {
      try {
        const u1 = JSON.parse(localStorage.getItem("unlockedStudentExamSets") || "[]");
        const u2 = JSON.parse(localStorage.getItem("releasedStudentExamSets") || "[]");
        if ([...u1, ...u2].some(id => id?.toString() === setId || id?.toString() === setName || (encodedName && id?.toString() === encodedName))) {
          return true;
        }
      } catch (e) {}
    }

    // 3. Check in studentPendingQueries for released individual sets
    if (
      pendingQueries.some((q) =>
        (q.status === "Released" || q.status === "COMPLETE") &&
        q.itemType !== "package" &&
        (!currentPhone || q.phone === currentPhone) &&
        (
          (q.itemId && q.itemId.toString() === setId) ||
          (q.itemName && q.itemName.toString() === setName) ||
          (q.itemId && q.itemId.toString() === setName)
        )
      )
    ) {
      return true;
    }

    // 4. Check in adminStudentUnlockedSetsMap
    if (currentPhone && typeof window !== "undefined") {
      const studentSetMap = JSON.parse(localStorage.getItem("adminStudentUnlockedSetsMap") || "{}");
      const phoneSets = studentSetMap[currentPhone] || [];
      if (phoneSets.some((id) => id?.toString() === setId || id?.toString() === setName)) {
        return true;
      }
    }

    return false;
  };

  // Helper: check if a specific exam set has a pending payment query awaiting admin confirmation
  const isSetPending = (set) => {
    if (!set) return false;
    const setId = set.id?.toString();
    const setName = set.name?.toString();
    return pendingQueries.some((q) =>
      (q.status === "Pending" || q.status === "PENDING") &&
      q.itemType !== "package" &&
      (!currentPhone || q.phone === currentPhone) &&
      (
        (q.itemId && q.itemId.toString() === setId) ||
        (q.itemName && q.itemName.toString() === setName) ||
        (q.itemId && q.itemId.toString() === setName)
      )
    );
  };

  // Strict Set Unlock Rule:
  // An exam set is unlocked if:
  // 1) Super Admin designated it as FREE DEMO (set.isFree || set.setType === "FREE" || name includes "free demo"), OR
  // 2) The set was created by the student's institute (all sets created by their institute are unlocked for their students), OR
  // 3) The Institute granted Free distribution for this package/set, OR
  // 4) It was individually purchased & released for this student, OR
  // 5) The student has an active package (or institute package) that covers this specific set!
  const isSetUnlocked = (set) => {
    if (!set) return false;

    // Strict Track Isolation:
    const setName = (set.name || set.title || "").toLowerCase();
    const sType = (set.setType || "").toUpperCase();
    const isJpSet = Boolean(
      set.track === "japanese" ||
      sType === "MOCK" ||
      set.isMock === true ||
      setName.includes("mock") ||
      setName.includes("jlpt") ||
      setName.includes("jft") ||
      setName.includes("nat") ||
      (set.packageName && set.packageName.toLowerCase().includes("mock"))
    );

    // Korean students should NEVER unlock or access Japanese sets
    if (isPureKoreanStudent && isJpSet) {
      return false;
    }

    // Japanese students should NEVER unlock or access Korean sets
    if (isPureJapaneseStudent && !isJpSet) {
      return false;
    }

    if (set.isFree === true || set.setType === "FREE" || (set.name && set.name.toLowerCase().includes("free demo"))) {
      return true;
    }

    // Explicitly released to student or individually unlocked
    if (isSetIndividuallyUnlocked(set)) {
      return true;
    }

    // Must be covered by student's active package or assigned specific exam
    return Boolean(isSetCoveredByStudentPackage(set));
  };

  // Helper: check if a package has a pending payment query awaiting admin confirmation
  const isPackagePending = (pkg) => {
    if (!pkg) return false;
    const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetNorm = norm(pkg.name);
    const pkgId = pkg.id?.toString();
    return pendingQueries.some((q) =>
      (q.status === "Pending" || q.status === "PENDING") &&
      (!currentPhone || q.phone === currentPhone) &&
      (
        (q.itemType === "package" && (
          norm(q.itemName) === targetNorm ||
          (q.itemId && q.itemId.toString() === pkgId)
        )) ||
        norm(q.itemName) === targetNorm ||
        (q.itemId && q.itemId.toString() === pkgId)
      )
    );
  };

  // Helper: check if a package is active and unlocked
  const isPackageUnlocked = (pkg) => {
    if (!pkg) return false;
    if (isPackageExpired) return false;
    const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetNorm = norm(pkg.name);
    return activeStudentPackages.some((pName) => {
      const pNorm = norm(pName);
      if (pNorm === targetNorm) return true;
      if (pNorm.includes("chapter") && targetNorm.includes("chapter")) return true;
      if (pNorm.includes("100") && targetNorm.includes("100")) return true;
      if (pNorm.includes("model") && targetNorm.includes("model")) return true;
      if (pNorm.includes("full") && targetNorm.includes("full")) return true;
      if (pNorm.includes("mock") && targetNorm.includes("mock")) return true;
      return false;
    });
  };

  const handleOpenEsewaModal = (item) => {
    setSelectedEsewaItem(item);
    setEsewaModalOpen(true);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEsewaSuccessUnlock = (res) => {
    try {
      const u1 = JSON.parse(localStorage.getItem("unlockedStudentExamSets") || "[]");
      const u2 = JSON.parse(localStorage.getItem("releasedStudentExamSets") || "[]");
      setUnlockedSets(Array.from(new Set([...u1, ...u2])));
      setPendingQueries(JSON.parse(localStorage.getItem("studentPendingQueries") || "[]"));
    } catch (e) {}

    setPaidAccessTrigger((prev) => prev + 1);

    // Only auto-unlock if NOT a pending query (must be reviewed and released by admin)
    if (res?.type === "package" && !res?.pendingQuery && res?.status !== "Pending") {
      setStudentPackage(res.packageName || "Full Set UBT");
    }
  };

  // Sync pending queries & released sets with database periodically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const phone = currentStudentPhone || localStorage.getItem("currentStudentPhone") || localStorage.getItem("studentPhone") || "";

    const syncStatus = async () => {
      // 1. Sync from localStorage
      try {
        const u1 = JSON.parse(localStorage.getItem("unlockedStudentExamSets") || "[]");
        const u2 = JSON.parse(localStorage.getItem("releasedStudentExamSets") || "[]");
        const combinedLocal = Array.from(new Set([...u1, ...u2]));
        setUnlockedSets(combinedLocal);
        setPendingQueries(JSON.parse(localStorage.getItem("studentPendingQueries") || "[]"));

        // Sync student-specific unlocked sets from map
        if (phone) {
          const studentSetMap = JSON.parse(localStorage.getItem("adminStudentUnlockedSetsMap") || "{}");
          const mySets = studentSetMap[phone] || [];
          if (mySets.length > 0) {
            setUnlockedSets((prev) => Array.from(new Set([...prev, ...mySets])));
          }

          // Check if package was released by admin in localStorage for this phone
          const buyerMap = JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}");
          const curBuyer = buyerMap[phone] || buyerMap[studentName];
          if (curBuyer?.isBuyer || curBuyer?.hasPurchased) {
            const releasedPkg = curBuyer?.packageName;
            if (releasedPkg && (!studentPackage || studentPackage.toLowerCase().includes("free"))) {
              setStudentPackage(releasedPkg);
            }
          }
        }
      } catch (e) {}

      // 2. Sync from database if phone exists
      if (!phone) return;
      try {
        const res = await fetch(`/api/payment/query?phone=${encodeURIComponent(phone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.queries && data.queries.length > 0) {
            const completeSets = [];
            const completePackages = [];
            data.queries.forEach((q) => {
              if (q.status === 'COMPLETE' || q.status === 'Released') {
                if (q.itemType === 'package') {
                  if (q.itemName) completePackages.push(q.itemName);
                } else {
                  if (q.itemId) completeSets.push(q.itemId);
                  if (q.itemName) completeSets.push(q.itemName);
                }
              }
            });

            if (completeSets.length > 0) {
              setUnlockedSets((prev) => Array.from(new Set([...prev, ...completeSets])));
            }

            if (completePackages.length > 0) {
              const buyerMap = JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}");
              const existingPkgs = buyerMap[phone]?.packages || [];
              buyerMap[phone] = {
                ...(buyerMap[phone] || {}),
                isBuyer: true,
                hasPurchased: true,
                packageName: completePackages[0],
                packages: Array.from(new Set([...existingPkgs, ...completePackages]))
              };
              localStorage.setItem("adminBuyerStudentsMap", JSON.stringify(buyerMap));
              setPaidAccessTrigger((prev) => prev + 1);
            }
          }
        }
      } catch (e) {
        console.warn("Sync error:", e);
      }
    };

    syncStatus();
    const interval = setInterval(syncStatus, 4000);
    return () => clearInterval(interval);
  }, [currentStudentPhone]);

  // Handle return from official eSewa EPAY gateway
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment_status");
    if (!paymentStatus) return;

    if (paymentStatus === "success") {
      const itemId = params.get("item_id");
      const itemName = params.get("item_name") || "UBT Exam Set";
      const itemType = params.get("item_type") || "set";
      const txnCode = params.get("txn_code") || "ESEWA_PAYMENT";
      const amount = params.get("amount") || "40";

      // Submit to studentPendingQueries for Super Admin review & release
      const pending = JSON.parse(localStorage.getItem("studentPendingQueries") || "[]");
      pending.unshift({
        id: Date.now(),
        itemId,
        itemName,
        phone: currentStudentPhone || "",
        studentName: studentName || "Student",
        amount: Number(amount) || 40,
        txnId: txnCode,
        status: "Pending",
        date: new Date().toLocaleString()
      });
      localStorage.setItem("studentPendingQueries", JSON.stringify(pending));
      setPendingQueries(pending);

      // Notify Super Admin
      const notifs = JSON.parse(localStorage.getItem("studentNotifications") || "[]");
      notifs.unshift({
        id: Date.now(),
        type: "payment_query",
        subject: `UBT Purchase Query: ${itemName} (Rs. ${amount})`,
        message: `Student ${studentName || "Student"} (${currentStudentPhone || ""}) paid Rs. ${amount} via eSewa.\n\n` +
                 `Item: ${itemName}\n` +
                 `Txn ID: ${txnCode}\n\n` +
                 `Please verify and confirm to release this UBT exam set.`,
        studentName: studentName || "Student",
        studentPhone: currentStudentPhone || "",
        itemName,
        itemId,
        itemType,
        amount: Number(amount) || 40,
        txnId: txnCode,
        status: "Pending",
        read: false,
        date: new Date().toLocaleString()
      });
      localStorage.setItem("studentNotifications", JSON.stringify(notifs));

      // Clean URL parameters
      window.history.replaceState({}, "", window.location.pathname);

      alert(`Payment Query Submitted!\n\nYour payment for "${itemName}" (Rs. ${amount}) has been submitted to Super Admin with Ref ${txnCode}.\nSuper Admin will review and release your UBT set.`);
    } else if (paymentStatus === "failed") {
      window.history.replaceState({}, "", window.location.pathname);
      alert("Payment was canceled or could not be verified by eSewa. Please try again.");
    }
  }, []);

  // 1. Authenticated Session Sync from /api/auth/me
  useEffect(() => {
    // Initial read from localStorage
    const localName = localStorage.getItem("currentUser") || localStorage.getItem("currentStudentName") || "Student Portal";
    const localPhone = localStorage.getItem("currentStudentPhone") || null;
    const localPkg = localStorage.getItem("currentStudentPackage") || null;
    const localExp = localStorage.getItem("currentStudentExpiryDate") || null;
    const institutes = JSON.parse(localStorage.getItem("institutes") || "[]");
    const logo = institutes[0]?.logoUrl || "";

    const localBuyerMap = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("adminBuyerStudentsMap") || "{}") : {};
    const localBuyer = localPhone ? (localBuyerMap[localPhone] || localBuyerMap[localName]) : (localBuyerMap[localName] || null);
    const hasPurchasedAccess = Boolean(
      isPurchasedBuyer ||
      localBuyer?.isBuyer ||
      localBuyer?.hasPurchased ||
      localBuyer?.packageName ||
      localBuyer?.package ||
      (localBuyer?.packages && localBuyer.packages.length > 0) ||
      (typeof window !== "undefined" && (
        localStorage.getItem("isPurchasedBuyer") === "true" ||
        localStorage.getItem("hasPurchasedExamAccess") === "true" ||
        (JSON.parse(localStorage.getItem("studentPurchasedSets") || "[]")).length > 0 ||
        (JSON.parse(localStorage.getItem("unlockedStudentExamSets") || "[]")).length > 0
      ))
    );

    setStudentName(localName);
    setCurrentStudentPhone(localPhone);
    setLogoWatermark(logo);

    if (isGoogleOrFree && !hasPurchasedAccess) {
      setStudentExpiryDate(null);
      try { localStorage.removeItem("currentStudentExpiryDate"); } catch (e) {}
    } else if (localExp && localExp !== "2027-09-30" && !localExp.toLowerCase().includes("lifetime")) {
      setStudentExpiryDate(localExp);
    }

    if (localPkg && !isShift(localPkg)) {
      if (localPkg.toLowerCase().includes("google") || localPkg.toLowerCase().includes("free")) {
        let defaultPkg = hasPurchasedAccess ? (localBuyer?.package || localBuyer?.packageName || currentBuyer?.package || null) : "Free Student Access";
        setStudentPackage(defaultPkg || "Free Student Access");
      } else {
        setStudentPackage(localPkg);
      }
    } else {
      setStudentPackage("Free Student Access");
    }

    // Fetch verified session from backend
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const uName = data.user.name || data.user.username;
          const uPhone = data.user.phone || data.user.username;
          const instId = data.user.instituteId || data.user.institute?.id || null;
          const instName = data.user.institute?.name || null;
          const instPkg = data.user.institute?.examPackage || null;
          const instLogo = data.user.institute?.logoUrl || logo;
          const batchName = data.user.batch || null;
          const instLang = (data.user.language && data.user.language !== "both")
            ? data.user.language
            : (data.user.institute?.language && data.user.institute?.language !== "both"
                ? data.user.institute?.language
                : (data.user.language || data.user.institute?.language || data.user.instituteLanguage || "both"));
          const rawPkg = data.user.studentPackage || data.user.batch || "";

          const isEnrolledInstitute = Boolean(instId || instName);
          const isGoogleOrFreeUser = !isEnrolledInstitute && (
            rawPkg.toLowerCase().includes("google") ||
            rawPkg.toLowerCase().includes("free") ||
            data.user.isFreeStudent ||
            data.user.username?.includes("@") ||
            !data.user.phone
          );

          const userBuyer = (uPhone && localBuyerMap[uPhone]) || (uName && localBuyerMap[uName]) || localBuyer;
          const userHasPurchased = Boolean(
            hasPurchasedAccess ||
            userBuyer?.isBuyer ||
            userBuyer?.hasPurchased ||
            userBuyer?.packageName ||
            userBuyer?.package
          );

          let userPkg = userHasPurchased
            ? (userBuyer?.package || userBuyer?.packageName || currentBuyer?.package || null)
            : ((!isShift(rawPkg) && !isGoogleOrFreeUser && rawPkg) || null);

          if (!userPkg) {
            userPkg = "Free Student Access";
          }

          const userExp = (isGoogleOrFreeUser && !userHasPurchased)
            ? null
            : (data.user.expiryDate && data.user.expiryDate !== "2027-09-30" && !data.user.expiryDate.toLowerCase().includes("lifetime") && data.user.expiryDate !== "Active"
                ? data.user.expiryDate
                : (localExp && !localExp.toLowerCase().includes("lifetime") && localExp !== "Active" ? localExp : null));

          setStudentName(uName);
          setCurrentStudentPhone(uPhone);
          setInstituteLanguage(instLang);
          localStorage.setItem("instituteLanguage", instLang);
          if (isGoogleOrFreeUser && !userHasPurchased) {
            setStudentExpiryDate(null);
            try { localStorage.removeItem("currentStudentExpiryDate"); } catch (e) {}
          } else {
            setStudentExpiryDate(userExp);
          }
          if (instId) {
            setStudentInstituteId(instId);
            localStorage.setItem("currentInstituteId", instId);
          }
          if (instName) {
            setStudentInstitute(instName);
            localStorage.setItem("currentInstitute", instName);
          }
          if (instPkg) {
            setStudentInstitutePackage(instPkg);
            localStorage.setItem("currentInstitutePackage", instPkg);
          }
          if (instLogo) setLogoWatermark(instLogo);
          if (batchName) setStudentBatch(batchName);
          if (userPkg && !isShift(userPkg)) {
            setStudentPackage(userPkg);
            localStorage.setItem("currentStudentPackage", userPkg);
          }
          if (userExp) {
            setStudentExpiryDate(userExp);
            localStorage.setItem("currentStudentExpiryDate", userExp);
          } else {
            setStudentExpiryDate("");
            localStorage.removeItem("currentStudentExpiryDate");
          }

          localStorage.setItem("currentUser", uName);
          localStorage.setItem("currentStudentPhone", uPhone);
          if (instName) localStorage.setItem("currentInstitute", instName);
        }
      })
  }, []);

  // 2. Fetch Packages & Exam Sets (combining LocalStorage and Server DB)
  useEffect(() => {
    const standardMockPackages = [
      { id: "jp-1", name: "Full Mock Test", price: "Rs. 2,500", desc: "Complete access to all JLPT (N5-N2) & JFT-Basic CBT Mock Test Sets.", track: "japanese" },
      { id: "jp-2", name: "JFT-Basic Mock Test", price: "Rs. 1,500", desc: "Official JFT-Basic SSW mock test sets with audio and real-time evaluation.", track: "japanese" },
      { id: "jp-3", name: "NAT-TEST Mock Test", price: "Rs. 1,500", desc: "NAT-TEST 5Q & 4Q authentic practice sets with listening.", track: "japanese" },
      { id: "jp-4", name: "JLPT Mock Test Bundle", price: "Rs. 2,000", desc: "Standard JLPT N5 & N4 simulation mock exam sets.", track: "japanese" }
    ];

    const standardUbtPackages = [
      { id: 1, name: "30 Set Chapter UBT", price: "Rs. 1,000", desc: "Complete chapterwise practice sets with audio.", track: "korean" },
      { id: 2, name: "100 UBT set", price: "Rs. 2,500", desc: "Full-length simulated exam packages for real test experience.", track: "korean" },
      { id: 3, name: "Full Set UBT", price: "Rs. 4,000", desc: "Full EPS-TOPIK Korean 40-question UBT sets.", track: "korean" },
      { id: 4, name: "Model Question Bank", price: "Rs. 1,500", desc: "Exclusive Model Question Bank 40-question UBT sets with Korean Audio & Real-time Evaluation (Sold Separately).", track: "korean" }
    ];

    const savedPackages = JSON.parse(localStorage.getItem("examPackages") || "[]");
    let finalPackages = savedPackages.length > 0 ? [...savedPackages] : [];

    // Ensure all standard UBT and Mock Test packages are present for all students
    const allStandardPackages = isJapaneseTrack
      ? [...standardMockPackages, ...standardUbtPackages]
      : [...standardUbtPackages, ...standardMockPackages];

    allStandardPackages.forEach(stdPkg => {
      if (!finalPackages.some(p => (p.name || "").toLowerCase() === stdPkg.name.toLowerCase())) {
        finalPackages.push(stdPkg);
      }
    });

    setExamPackages(finalPackages);

    // Build Japanese Mock Exam Sets from JLPT_MOCK_SETS_META
    const buildJapaneseSets = () => {
      return (JLPT_MOCK_SETS_META || []).map((meta) => {
        const isFree = false; // Strictly require package or assigned specific exam access
        return {
          id: meta.id,
          name: meta.title,
          titleJp: meta.titleJp,
          packageName: meta.level || "Full Mock Test",
          level: meta.level,
          timeMin: meta.timeMin || 50,
          totalQs: meta.totalQs || 40,
          desc: meta.desc,
          setType: isFree ? "FREE" : "MOCK",
          isFree,
          track: "japanese"
        };
      });
    };

    const savedSets = JSON.parse(localStorage.getItem("examSets") || "[]");

    // Fetch packages and sets from server API to guarantee data is never empty
    fetch("/api/admin/packages")
      .then((res) => res.json())
      .then((data) => {
        let mergedSets = savedSets.map(s => ({
          ...s,
          isFree: Boolean(s.isFree || s.setType === "FREE" || (s.name && s.name.toLowerCase().includes("free demo")))
        }));
        if (data.sets && Array.isArray(data.sets) && data.sets.length > 0) {
          data.sets.forEach((srvSet) => {
            const idx = mergedSets.findIndex(
              (s) => s.id === srvSet.id || (s.name && srvSet.name && s.name.trim().toUpperCase() === srvSet.name.trim().toUpperCase())
            );
            if (idx >= 0) {
              mergedSets[idx] = {
                ...mergedSets[idx],
                isFree: srvSet.isFree !== undefined ? Boolean(srvSet.isFree) : mergedSets[idx].isFree
              };
            } else {
              mergedSets.push({
                id: srvSet.id,
                name: srvSet.name,
                packageName: srvSet.packageName || srvSet.package?.name || "Full Set UBT",
                creatorInstituteId: srvSet.creatorInstituteId || null,
                creatorInstituteName: srvSet.creatorInstituteName || null,
                isPublished: srvSet.isPublished !== false,
                isFree: Boolean(srvSet.isFree),
                setType: srvSet.setType || "UBT",
                track: srvSet.track || "korean",
                isUnlocked: srvSet.isUnlocked !== undefined ? Boolean(srvSet.isUnlocked) : undefined
              });
            }
          });
        }

        // Merge Japanese Mock Exam Sets only if not pure Korean track
        if (effectiveLang !== "korean") {
          const jpSets = buildJapaneseSets();
          jpSets.forEach((jpSet) => {
            if (!mergedSets.some((s) => s.id === jpSet.id)) {
              mergedSets.push(jpSet);
            }
          });
        }

        filterAndSetExamSets(mergedSets, finalPackages);
      })
      .catch(() => {
        let fallbackSets = [...savedSets];
        if (effectiveLang !== "korean") {
          const jpSets = buildJapaneseSets();
          jpSets.forEach((jpSet) => {
            if (!fallbackSets.some((s) => s.id === jpSet.id)) {
              fallbackSets.push(jpSet);
            }
          });
        }
        filterAndSetExamSets(fallbackSets, finalPackages);
      });

    // Load past results and enriched exam access from API
    fetch("/api/student/exams")
      .then((res) => res.json())
      .then((data) => {
        if (data.institute) {
          if (data.institute.name) {
            setStudentInstitute(data.institute.name);
            localStorage.setItem("currentInstitute", data.institute.name);
          }
          if (data.institute.id) {
            setStudentInstituteId(data.institute.id);
            localStorage.setItem("currentInstituteId", data.institute.id);
          }
          if (data.institute.examPackage) {
            setStudentInstitutePackage(data.institute.examPackage);
            localStorage.setItem("currentInstitutePackage", data.institute.examPackage);
          }
          if (data.institute.language) {
            setInstituteLanguage(data.institute.language);
            localStorage.setItem("instituteLanguage", data.institute.language);
          }
        }
        if (data.sets && Array.isArray(data.sets) && data.sets.length > 0) {
          setExamSets(prev => {
            const serverMap = new Map(data.sets.map(s => [s.id, s]));
            return prev.map(item => {
              const match = serverMap.get(item.id);
              if (match) {
                return {
                  ...item,
                  creatorInstituteId: match.creatorInstituteId || item.creatorInstituteId,
                  creatorInstituteName: match.creatorInstituteName || item.creatorInstituteName,
                  isUnlocked: match.isUnlocked !== undefined ? match.isUnlocked : item.isUnlocked
                };
              }
              return item;
            });
          });
        }
        if (data.pastResults && Array.isArray(data.pastResults)) {
          setResults(data.pastResults);
        } else {
          setResults(JSON.parse(localStorage.getItem("examResults") || "[]"));
        }
      })
      .catch(() => {
        setResults(JSON.parse(localStorage.getItem("examResults") || "[]"));
      });

    const allFoldersData = JSON.parse(localStorage.getItem("epsFoldersContent") || "{}");
    const savedNews = JSON.parse(localStorage.getItem("epsNewsList") || "[]");
    setFolderMaterials(allFoldersData[activeBookFolder] || []);
    setNewsList(savedNews);

    const cleanDigits = (p) => (p || "").toString().replace(/[^0-9]/g, "").slice(-10);
    const targetCleanPhone = cleanDigits(currentStudentPhone);
    const isMatchingPhone = (phone) => {
      if (!phone || !currentStudentPhone) return false;
      if (phone === currentStudentPhone) return true;
      const c = cleanDigits(phone);
      return Boolean(c && targetCleanPhone && c === targetCleanPhone);
    };

    const allNotifications = JSON.parse(localStorage.getItem("studentNotifications") || "[]");
    setMyNotifications(
      allNotifications.filter(
        (n) => n.studentName === studentName || (currentStudentPhone && isMatchingPhone(n.studentPhone))
      )
    );

    // Fetch latest notices for this student's institute only
    const currentInst = studentInstitute || localStorage.getItem("currentInstitute") || "";
    const noticeQuery = currentInst ? `?role=student&institute=${encodeURIComponent(currentInst)}` : "?role=student";
    fetch(`/api/news${noticeQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.notices)) {
          // Deliver to particular institute students only (or global admin notice)
          const instituteOnlyNotices = data.notices.filter((n) => {
            if (!n.instituteName || n.targetAudience === 'all') return true; // Global notice for all students
            if (!currentInst) return false;
            const target = (n.targetAudience || n.instituteName || '').trim().toLowerCase();
            const inst = (n.instituteName || '').trim().toLowerCase();
            const cleanCurr = currentInst.trim().toLowerCase();
            return target === cleanCurr || inst === cleanCurr;
          });
          setNewsList(instituteOnlyNotices);
          const livePopup = instituteOnlyNotices.find((n) => {
            if (!n.isPopup) return false;
            const nLang = (n.language || n.track || "all").toLowerCase();
            const instL = (instituteLanguage || "both").toLowerCase();
            if (instL === "korean") return nLang === "all" || nLang === "korean";
            if (instL === "japanese") return nLang === "all" || nLang === "japanese";
            return true;
          });
          if (livePopup) {
            const lastShownId = localStorage.getItem("lastShownStudentPopupId");
            if (lastShownId !== livePopup.id.toString()) {
              setPopupNotice(livePopup);
              setShowBannerPopup(true);
            }
          }
        }
      })
      .catch((err) => console.warn("Failed to fetch notices:", err));
  }, [currentStudentPhone, studentInstitute, studentBatch, activeBookFolder, instituteLanguage]);

  const filterAndSetExamSets = (allSets, packages) => {
    const studentsList = JSON.parse(localStorage.getItem("studentsList") || "[]");
    const allInstituteStudents = JSON.parse(localStorage.getItem("instituteStudents") || "{}");

    const cleanDigits = (p) => (p || "").toString().replace(/[^0-9]/g, "").slice(-10);
    const targetCleanPhone = cleanDigits(currentStudentPhone);
    const isMatchingPhone = (phone) => {
      if (!phone || !currentStudentPhone) return false;
      if (phone === currentStudentPhone) return true;
      const c = cleanDigits(phone);
      return Boolean(c && targetCleanPhone && c === targetCleanPhone);
    };

    let currentStudent = studentsList.find((s) => isMatchingPhone(s.phone));
    let myInstName = studentInstitute;

    if (!currentStudent) {
      for (const instName in allInstituteStudents) {
        const found = (allInstituteStudents[instName] || []).find((s) => isMatchingPhone(s.phone));
        if (found) {
          currentStudent = found;
          myInstName = instName;
          break;
        }
      }
    }

    const shiftNames = ['morning', 'day', 'evening', 'night', 'afternoon'];
    const isShift = (str) => shiftNames.includes((str || '').toLowerCase().trim());

    if (currentStudent?.expiryDate && currentStudent.expiryDate !== "2027-09-30" && !currentStudent.expiryDate.toLowerCase().includes("lifetime") && currentStudent.expiryDate !== "Active") {
      setStudentExpiryDate(currentStudent.expiryDate);
      localStorage.setItem("currentStudentExpiryDate", currentStudent.expiryDate);
    }
    if (currentStudent?.assignedPackage || currentStudent?.package) {
      const p = currentStudent.assignedPackage || currentStudent.package;
      if (!isShift(p)) {
        setStudentPackage(p);
        localStorage.setItem("currentStudentPackage", p);
      }
    }

    const rawAssigned = currentStudent?.assignedPackage || currentStudent?.package || studentBatch;
    const assignedPackage = !isShift(rawAssigned) ? rawAssigned : null;
    let allowedPackages = currentStudent?.assignedPackages || (assignedPackage ? [assignedPackage] : []);
    if (isJapaneseTrack) {
      allowedPackages = allowedPackages.filter(p => {
        const pLower = (p || "").toLowerCase();
        return !pLower.includes("ubt") && !pLower.includes("chapter") && !pLower.includes("topik") && !pLower.includes("eps") && !pLower.includes("model question");
      });
      if (allowedPackages.length === 0) {
        allowedPackages = ["Full Mock Test"];
      }
    }
    setPurchasedPackages(allowedPackages);

    const accessible = allSets.filter((set) => {
      // 1. Strict Institute Isolation: if private to an institute, must belong to that institute
      if (set.creatorInstituteName && set.isPublished === false) {
        if (!myInstName || set.creatorInstituteName.toLowerCase() !== myInstName.toLowerCase()) {
          return false;
        }
      }

      // 2. Package Access Filter
      if (allowedPackages.length > 0) {
        const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const normAllowed = allowedPackages.map(norm);
        const setPkgNorm = norm(set.packageName);

        if (normAllowed.includes(setPkgNorm)) return true;
        const isMatch = normAllowed.some(ap => {
          if (ap === setPkgNorm) return true;
          if (ap.includes('chapter') && setPkgNorm.includes('chapter')) return true;
          if (ap.includes('full') && setPkgNorm.includes('full')) return true;
          if (ap.includes('mock') && setPkgNorm.includes('mock')) return true;
          if (ap.includes('jlpt') && setPkgNorm.includes('jlpt')) return true;
          if (ap.includes('jft') && setPkgNorm.includes('jft')) return true;
          if (ap.includes('nat') && setPkgNorm.includes('nat')) return true;
          if (ap.includes('full') && (setPkgNorm.includes('mock') || setPkgNorm.includes('jlpt') || setPkgNorm.includes('jft') || setPkgNorm.includes('nat'))) return true;
          return false;
        });
        if (isMatch) return true;

        const matchingPkgs = packages.filter((p) => normAllowed.includes(norm(p.name)));
        for (const mp of matchingPkgs) {
          if (mp.includedSets && mp.includedSets.includes(set.name)) return true;
        }
        return false;
      }

      return true;
    });

    let finalSets = accessible.length > 0
      ? accessible
      : allSets.filter((s) => !s.creatorInstituteName || !myInstName || s.creatorInstituteName.toLowerCase() === myInstName.toLowerCase() || s.isPublished !== false);

    setExamSets(finalSets);
    if (!studentPackage || isShift(studentPackage)) {
      setStudentPackage("Free Student Access");
    }
  };

  const handleCloseBanner = () => {
    if (popupNotice) {
      localStorage.setItem("lastShownStudentPopupId", popupNotice.id.toString());
    }
    setShowBannerPopup(false);
  };

  const handleLogout = () => {
    performLogout();
  };

  const handleBuyRequest = (packageName) => {
    const requests = JSON.parse(localStorage.getItem("examPurchaseRequests") || "[]");
    const newReq = {
      id: Date.now(),
      studentName: studentName || "Student",
      packageName,
      date: new Date().toLocaleDateString(),
      status: "Pending"
    };
    localStorage.setItem("examPurchaseRequests", JSON.stringify([...requests, newReq]));
    alert(`Purchase request for "${packageName}" submitted successfully! Your institute will review and activate it shortly.`);
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notifySubject.trim() || !notifyMessage.trim()) {
      alert("Please fill in both subject and message.");
      return;
    }
    const requests = JSON.parse(localStorage.getItem("studentNotifications") || "[]");
    const newItem = {
      id: Date.now(),
      studentName,
      studentPhone: currentStudentPhone || "",
      instituteName: studentInstitute || "",
      subject: notifySubject.trim(),
      message: notifyMessage.trim(),
      read: false,
      date: new Date().toLocaleString()
    };
    const updated = [newItem, ...requests];
    localStorage.setItem("studentNotifications", JSON.stringify(updated));
    setMyNotifications(updated.filter((n) => n.studentName === studentName || (currentStudentPhone && n.studentPhone === currentStudentPhone)));
    setNotifySubject("");
    setNotifyMessage("");
    alert("Your message was sent to the administration panel.");
  };

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

        if (detectedLang === "ko") {
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
      console.error("Translation error:", err);
      alert("Translation failed. Please check your network.");
    }
    setLoadingVocab(false);
  };

  const ubtSetsCount = examSets.filter(s => {
    if (!s) return false;
    const name = (s.name || s.title || "").toLowerCase();
    const sType = (s.setType || "").toUpperCase();
    const isJp = s.track === "japanese" || sType === "MOCK" || s.isMock === true || name.includes("mock") || name.includes("jlpt") || name.includes("jft") || name.includes("nat") || (s.packageName && s.packageName.toLowerCase().includes("mock"));
    const isKorean = s.track === "korean" || sType === "UBT" || sType === "CHAPTERWISE" || name.includes("ubt") || name.includes("eps") || name.includes("chapter") || name.includes("topik") || name.includes("reading") || name.includes("listening");
    return !isJp || isKorean;
  }).length;

  const mockSetsCount = examSets.filter(s => {
    if (!s) return false;
    const name = (s.name || s.title || "").toLowerCase();
    const sType = (s.setType || "").toUpperCase();
    const isKorean = s.track === "korean" || sType === "UBT" || sType === "CHAPTERWISE" || name.includes("ubt") || name.includes("eps") || name.includes("chapter") || name.includes("topik") || name.includes("reading") || name.includes("listening");
    const isJp = s.track === "japanese" || sType === "MOCK" || s.isMock === true || name.includes("mock") || name.includes("jlpt") || name.includes("jft") || name.includes("nat") || (s.packageName && s.packageName.toLowerCase().includes("mock"));
    return isJp && !isKorean;
  }).length;

  const sortedExamSets = [...examSets]
    .filter(s => {
      if (!s) return false;
      const name = (s.name || s.title || "").toLowerCase();
      const sType = (s.setType || "").toUpperCase();
      const isKorean = s.track === "korean" || sType === "UBT" || sType === "CHAPTERWISE" || name.includes("ubt") || name.includes("eps") || name.includes("chapter") || name.includes("topik") || name.includes("reading") || name.includes("listening");
      const isJp = s.track === "japanese" || sType === "MOCK" || s.isMock === true || name.includes("mock") || name.includes("jlpt") || name.includes("jft") || name.includes("nat") || (s.packageName && s.packageName.toLowerCase().includes("mock"));

      if (isPureKoreanStudent) {
        return !isJp || isKorean;
      }
      if (isPureJapaneseStudent) {
        return isJp && !isKorean;
      }
      if (examCategoryFilter === "ubt") {
        return !isJp || isKorean;
      }
      if (examCategoryFilter === "mock") {
        return isJp && !isKorean;
      }
      if (examCategoryFilter === "free") {
        return s.isFree === true || s.setType === "FREE" || (s.name && s.name.toLowerCase().includes("free demo")) || isSetUnlocked(s);
      }
      return true;
    })
    .sort((a, b) => {
      const numA = parseInt((a.name || '').replace(/\D/g, '')) || 9999;
      const numB = parseInt((b.name || '').replace(/\D/g, '')) || 9999;
      return numA - numB;
    });

  const baseFilteredSets = (() => {
    let list = (selectedPackageFilter === "All" || purchasedPackages.length <= 1)
      ? sortedExamSets
      : sortedExamSets.filter((s) => s.packageName === selectedPackageFilter);

    if (japaneseMockFilter !== "all" && (examCategoryFilter === "mock" || examCategoryFilter === "all")) {
      if (japaneseMockFilter === "model") {
        list = list.filter(s => {
          const name = (s.name || s.title || "").toLowerCase();
          const desc = (s.desc || "").toLowerCase();
          const titleJp = (s.titleJp || "").toLowerCase();
          return name.includes("simulation") || name.includes("model") || desc.includes("simulation") || titleJp.includes("模試") || titleJp.includes("模擬");
        });
      } else {
        list = list.filter(s => {
          const match = (s.level || s.packageName || s.name || "").toLowerCase().includes(japaneseMockFilter.toLowerCase());
          return match;
        });
      }
    }
    return list;
  })();

  const filteredSets = examSetsSearch.trim()
    ? baseFilteredSets.filter((s) =>
        (s.name || '').toLowerCase().includes(examSetsSearch.toLowerCase()) ||
        (s.packageName || '').toLowerCase().includes(examSetsSearch.toLowerCase())
      )
    : baseFilteredSets;

  const totalExamPages = Math.ceil(filteredSets.length / SETS_PER_PAGE);
  const paginatedSets = filteredSets.slice((examSetsPage - 1) * SETS_PER_PAGE, examSetsPage * SETS_PER_PAGE);

  const accessibleSetsList = useMemo(() => {
    const isJpSet = (s) => {
      if (!s) return false;
      const name = (s.name || s.title || "").toLowerCase();
      const sType = (s.setType || "").toUpperCase();
      return Boolean(
        s.track === "japanese" ||
        sType === "MOCK" ||
        s.isMock === true ||
        name.includes("mock") ||
        name.includes("jlpt") ||
        name.includes("jft") ||
        name.includes("nat") ||
        (s.packageName && s.packageName.toLowerCase().includes("mock"))
      );
    };

    const isKoSet = (s) => !isJpSet(s);

    let unlocked = examSets.filter(s => isSetUnlocked(s));

    // STRICT TRACK ISOLATION:
    if (isPureKoreanStudent) {
      unlocked = unlocked.filter(s => isKoSet(s));
    } else if (isPureJapaneseStudent) {
      unlocked = unlocked.filter(s => isJpSet(s));
    }

    return unlocked.sort((a, b) => {
      const numA = parseInt((a.name || '').replace(/\D/g, '')) || 9999;
      const numB = parseInt((b.name || '').replace(/\D/g, '')) || 9999;
      return numA - numB;
    });
  }, [examSets, unlockedSets, activeStudentPackages, examPackages, isPureKoreanStudent, isPureJapaneseStudent]);

  const handleStartExam = (set) => {
    const isJlptSet = Boolean(
      set.track === "japanese" ||
      set.level ||
      (set.id && (String(set.id).startsWith("jlpt-") || String(set.id).startsWith("jft-")))
    );

    const start = () => {
      if (isJlptSet) {
        const fullSet = getMockExamSetById(set.id);
        setActiveJlptExamSet(fullSet);
      } else {
        router.push(`/student/exam/${set.id || encodeURIComponent(set.name)}`);
      }
    };

    if (isSetUnlocked(set)) {
      start();
      return;
    }

    handleOpenEsewaModal({
      id: set.id,
      name: set.name,
      price: 40,
      type: "set",
      packageName: set.packageName || (instituteLanguage === "japanese" ? "Japanese Mock Test" : "UBT Set")
    });
  };

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "rgba(241, 245, 249, 0.94)",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    backgroundImage: logoWatermark ? `url(${logoWatermark})` : "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "320px",
    backgroundBlendMode: "overlay"
  };

  const topNavStyle = {
    backgroundColor: "#1e3a8a",
    color: "#ffffff",
    padding: "8px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    flexWrap: "nowrap",
    gap: "10px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%",
    boxSizing: "border-box"
  };

  const getNavBtnStyle = (tabName) => ({
    backgroundColor: activeTab === tabName ? "#2563eb" : "transparent",
    color: "#ffffff",
    border: "none",
    padding: "6px 9px",
    borderRadius: "5px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "12.5px",
    letterSpacing: "0.1px",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "0.15s ease",
    lineHeight: "1.2"
  });

  const contentAreaStyle = {
    padding: "20px 16px",
    paddingBottom: "85px",
    maxWidth: "1200px",
    margin: "0 auto",
    boxSizing: "border-box"
  };
  const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    marginBottom: "20px",
    border: "1px solid #e2e8f0"
  };

  return (
    <div style={containerStyle}>
      {/* Notice Banner Popup */}
      {showBannerPopup && popupNotice && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999999, padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", border: "2px solid #6366f1", textAlign: "center" }}>
            <h2 style={{ color: "#1e1b4b", margin: "0 0 8px 0", fontSize: "22px", fontWeight: "800", textAlign: "center" }}>{popupNotice.title}</h2>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px", textAlign: "center" }}>📅 {popupNotice.date}</p>
            {popupNotice.content && (
              <p style={{ color: "#334155", fontSize: "14px", lineHeight: "1.7", marginBottom: "18px", whiteSpace: "pre-line", textAlign: "center" }}>{popupNotice.content}</p>
            )}

            {/* Poster full view in popup banner */}
            {popupNotice.fileUrl && popupNotice.fileType === "image" && (
              <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                <a href={popupNotice.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
                  <img
                    src={popupNotice.fileUrl}
                    alt="Notice Poster"
                    style={{ maxWidth: "100%", height: "auto", maxHeight: "60vh", borderRadius: "10px", border: "1px solid #e2e8f0", objectFit: "contain", display: "block", margin: "0 auto" }}
                  />
                </a>
              </div>
            )}

            {popupNotice.fileUrl && (popupNotice.fileType === "document" || popupNotice.fileType === "pdf") && (
              <div style={{ marginBottom: "18px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href={popupNotice.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#6366f1", color: "#ffffff", padding: "9px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}
                >
                  <span>{popupNotice.fileType === "pdf" ? "📕" : "📄"}</span> View Document
                </a>
                <a
                  href={popupNotice.fileUrl}
                  download={popupNotice.fileName || "Notice_Document"}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#0284c7", color: "#ffffff", padding: "9px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}
                >
                  <span>📥</span> Download
                </a>
              </div>
            )}

            <button
              onClick={handleCloseBanner}
              style={{ width: "100%", backgroundColor: "#4f46e5", color: "#ffffff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer", transition: "0.2s" }}
            >
              CLOSE &amp; CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <div style={topNavStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, minWidth: "150px", maxWidth: "220px" }}>
          {logoWatermark && (
            <img src={logoWatermark} alt="Institute Logo" style={{ height: "28px", borderRadius: "4px", backgroundColor: "#ffffff", padding: "2px", flexShrink: 0 }} />
          )}
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#ffffff", whiteSpace: "nowrap", letterSpacing: "0.2px", lineHeight: "1.2" }}>
              STUDENT PORTAL
            </div>
            <div style={{ fontSize: "11px", color: "#93c5fd", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", minHeight: "14px", lineHeight: "1.2" }}>
              {studentName ? `${studentName}${studentInstitute ? ` • ${studentInstitute}` : ""}` : "Student Portal"}
            </div>
          </div>
        </div>

        {/* Desktop Tabs (Visible on screens > 768px) */}
        <div
          className="student-desktop-tabs"
          style={{
            display: "flex",
            gap: "4px",
            flexWrap: "nowrap",
            alignItems: "center",
            flexShrink: 0,
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          <button onClick={() => setActiveTab("home")} style={getNavBtnStyle("home")}>Dashboard</button>
          {showUbtExam && (
            <button
              onClick={() => {
                setActiveTab("exams");
                setExamCategoryFilter("ubt");
                setExamSetsPage(1);
              }}
              style={activeTab === "exams" && examCategoryFilter === "ubt"
                ? { ...getNavBtnStyle("exams"), backgroundColor: "#2563eb", color: "#ffffff", fontWeight: "800" }
                : getNavBtnStyle("exams")}
            >
              Start UBT Exam
            </button>
          )}
          {showMockTest && (
            <button
              onClick={() => {
                setActiveTab("exams");
                setExamCategoryFilter("mock");
                setExamSetsPage(1);
              }}
              style={activeTab === "exams" && examCategoryFilter === "mock"
                ? { ...getNavBtnStyle("exams"), backgroundColor: "#2563eb", color: "#ffffff", fontWeight: "800" }
                : getNavBtnStyle("exams")}
            >
              Mock Test
            </button>
          )}
          <button onClick={() => setActiveTab("buyExam")} style={getNavBtnStyle("buyExam")}>
            Packages
          </button>
          <button onClick={() => setActiveTab("vocab")} style={getNavBtnStyle("vocab")}>Dictionary</button>
          <button onClick={() => setActiveTab("listening")} style={getNavBtnStyle("listening")}>Study Materials</button>
          <button onClick={() => setActiveTab("news")} style={getNavBtnStyle("news")}>Notice</button>
          <button onClick={() => setActiveTab("notify")} style={getNavBtnStyle("notify")}>Messages</button>
          <button onClick={() => setActiveTab("results")} style={getNavBtnStyle("results")}>Performance</button>
          <button onClick={() => setActiveTab("about")} style={getNavBtnStyle("about")}>About Us</button>
        </div>

        {/* Desktop Logout Button */}
        <button
          className="student-desktop-logout"
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc2626",
            color: "#ffffff",
            border: "none",
            padding: "6px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "12.5px",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          Logout
        </button>

        {/* Mobile 3-line Dotted Hamburger Button */}
        <button
          type="button"
          className="student-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Student Navigation Menu"
          title="Toggle Navigation Menu"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            backgroundColor: mobileMenuOpen ? "#2563eb" : "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "#ffffff",
            cursor: "pointer",
            flexShrink: 0,
            padding: "4px"
          }}
        >
          {mobileMenuOpen ? (
            <span style={{ fontSize: "18px", fontWeight: "bold", lineHeight: 1 }}>✕</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: "20px", height: "2.5px", backgroundColor: "#ffffff", borderRadius: "2px", display: "block" }}></span>
              <span style={{ width: "20px", height: "2.5px", backgroundColor: "#ffffff", borderRadius: "2px", display: "block" }}></span>
              <span style={{ width: "20px", height: "2.5px", backgroundColor: "#ffffff", borderRadius: "2px", display: "block" }}></span>
            </div>
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu for Student Portal */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 99998
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "56px",
              left: 0,
              right: 0,
              backgroundColor: "#0f172a",
              borderBottom: "3px solid #2563eb",
              boxShadow: "0 12px 35px rgba(0, 0, 0, 0.5)",
              zIndex: 99999,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "calc(100vh - 65px)",
              overflowY: "auto"
            }}
          >
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Student Menu
            </div>

            <button
              onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
              style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: activeTab === "home" ? "#2563eb" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: activeTab === "home" ? 800 : 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </button>

            {showUbtExam && (
              <button
                onClick={() => {
                  setActiveTab("exams");
                  setExamCategoryFilter("ubt");
                  setExamSetsPage(1);
                  setMobileMenuOpen(false);
                }}
                style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: activeTab === "exams" && examCategoryFilter === "ubt" ? "#2563eb" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: activeTab === "exams" ? 800 : 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>📝</span>
                <span>Start UBT Exam</span>
              </button>
            )}

            {showMockTest && (
              <button
                onClick={() => {
                  setActiveTab("exams");
                  setExamCategoryFilter("mock");
                  setExamSetsPage(1);
                  setMobileMenuOpen(false);
                }}
                style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: activeTab === "exams" && examCategoryFilter === "mock" ? "#2563eb" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: activeTab === "exams" ? 800 : 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>🎯</span>
                <span>Mock Test</span>
              </button>
            )}

            <button
              onClick={() => { setActiveTab("buyExam"); setMobileMenuOpen(false); }}
              style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: activeTab === "buyExam" ? "#2563eb" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: activeTab === "buyExam" ? 800 : 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>💎</span>
              <span>Packages</span>
            </button>

            <button
              onClick={() => { setActiveTab("vocab"); setMobileMenuOpen(false); }}
              style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: activeTab === "vocab" ? "#2563eb" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: activeTab === "vocab" ? 800 : 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>📖</span>
              <span>Dictionary</span>
            </button>

            <button
              onClick={() => { setActiveTab("listening"); setMobileMenuOpen(false); }}
              style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: activeTab === "listening" ? "#2563eb" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: activeTab === "listening" ? 800 : 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>🎧</span>
              <span>Study Materials</span>
            </button>

            <button
              onClick={() => { setActiveTab("news"); setMobileMenuOpen(false); }}
              style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: activeTab === "news" ? "#2563eb" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: activeTab === "news" ? 800 : 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>📢</span>
              <span>Notice</span>
            </button>

            <button
              onClick={() => { setActiveTab("notify"); setMobileMenuOpen(false); }}
              style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: activeTab === "notify" ? "#2563eb" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: activeTab === "notify" ? 800 : 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>💬</span>
              <span>Messages</span>
            </button>

            <button
              onClick={() => { setActiveTab("results"); setMobileMenuOpen(false); }}
              style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: activeTab === "results" ? "#2563eb" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: activeTab === "results" ? 800 : 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>📈</span>
              <span>Performance</span>
            </button>

            <button
              onClick={() => { setActiveTab("about"); setMobileMenuOpen(false); }}
              style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: activeTab === "about" ? "#2563eb" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: activeTab === "about" ? 800 : 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>ℹ️</span>
              <span>About Us</span>
            </button>

            <div style={{ marginTop: "8px", paddingTop: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.15)" }}>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                style={{ width: "100%", backgroundColor: "#ef4444", color: "#ffffff", border: "none", padding: "11px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Global Responsive Styles for Student Portal */}
      <style jsx>{`
        @media (max-width: 1024px) {
          :global(.student-desktop-tabs) {
            display: none !important;
          }
          :global(.student-desktop-logout) {
            display: none !important;
          }
          :global(.student-mobile-menu-btn) {
            display: inline-flex !important;
          }
          :global(.student-bottom-nav) {
            display: flex !important;
          }
        }
        @media (min-width: 1025px) {
          :global(.student-bottom-nav) {
            display: none !important;
          }
        }
        :global(.student-bottom-nav button) {
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.1s ease, color 0.15s ease;
        }
        :global(.student-bottom-nav button:active) {
          transform: scale(0.92);
        }
      `}</style>

      <div style={contentAreaStyle}>
        {/* DASHBOARD / HOME TAB */}
        {activeTab === "home" && (
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            {/* Screen Title */}
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <h1 style={{ color: "#111827", margin: "0 0 12px 0", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.3px" }}>
                Home
              </h1>

              {/* User Welcome Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 14px", backgroundColor: "#f1f5f9", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#334155", fontWeight: "600" }}>
                  Welcome, <strong style={{ color: "#0f3b82" }}>{studentName}</strong>
                </span>
              </div>
            </div>

            {/* Section 1: Our Services (All Menus in Distinct Color Gradients) */}
            <div style={{ marginBottom: "28px" }}>
              <h2 style={{ color: "#111827", fontSize: "18px", fontWeight: "800", textAlign: "center", margin: "0 0 16px 0", letterSpacing: "-0.2px" }}>
                Our Services
              </h2>

              {/* 9-Card Grid (3x3): Every menu has a unique 3D/vector icon and distinct style */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {/* 1. Book Services / Study Materials */}
                <div
                  onClick={() => {
                    setActiveBookFolder("EPS Book");
                    setActiveTab("listening");
                  }}
                  style={{
                    background: "linear-gradient(145deg, #e0f2fe 0%, #bae6fd 50%, #c7d2fe 100%)",
                    borderRadius: "16px",
                    padding: "12px 6px 10px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(2, 132, 199, 0.14)",
                    border: "1.5px solid #93c5fd",
                    minHeight: "108px",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 7,
                      border: "1.5px solid #bfdbfe",
                      boxShadow: "0 3px 8px rgba(37, 99, 235, 0.15)"
                    }}
                  >
                    {/* Layered Color Books with Ribbon */}
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                      <rect x="5" y="24" width="26" height="6.5" rx="2" fill="#2563eb"/>
                      <path d="M5 26h6v4.5H5z" fill="#1d4ed8"/>
                      <rect x="7" y="16" width="24" height="6.5" rx="2" fill="#f59e0b"/>
                      <path d="M7 18h6v4.5H7z" fill="#d97706"/>
                      <rect x="9" y="8" width="22" height="6.5" rx="2" fill="#10b981"/>
                      <path d="M9 10h5v4.5H9z" fill="#059669"/>
                      <path d="M22 6v9l3-2 3 2V6z" fill="#ef4444"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", lineHeight: "1.25" }}>
                    {isPureJapaneseStudent ? "Study Materials" : "Book Services"}
                  </span>
                </div>

                {/* 2. Modal Bank / JFT-Basic CBT */}
                <div
                  onClick={() => {
                    if (isPureJapaneseStudent) {
                      setActiveTab("exams");
                      setExamCategoryFilter("mock");
                      setExamSetsPage(1);
                    } else {
                      setActiveBookFolder("Model Question Bank");
                      setActiveTab("listening");
                    }
                  }}
                  style={{
                    background: "linear-gradient(145deg, #dcfce7 0%, #bbf7d0 50%, #a7f3d0 100%)",
                    borderRadius: "16px",
                    padding: "12px 6px 10px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(16, 185, 129, 0.14)",
                    border: "1.5px solid #86efac",
                    minHeight: "108px",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 7,
                      border: "1.5px solid #bbf7d0",
                      boxShadow: "0 3px 8px rgba(16, 185, 129, 0.15)"
                    }}
                  >
                    {/* Audio Headset with Music Notes on Book */}
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                      <rect x="6" y="21" width="24" height="6.5" rx="2" fill="#059669"/>
                      <rect x="6" y="14" width="24" height="6" rx="2" fill="#dc2626"/>
                      <path d="M11 6a8 8 0 0 1 14 0" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="10" cy="13" r="2.5" fill="#7c3aed"/>
                      <circle cx="26" cy="13" r="2.5" fill="#7c3aed"/>
                      <path d="M21 8.5v3a1.5 1.5 0 1 1-1.5-1.5H21" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", lineHeight: "1.25" }}>
                    {isPureJapaneseStudent ? "JFT-Basic CBT" : "Modal Bank"}
                  </span>
                </div>

                {/* 3. EPS-TOPIK UBT / JLPT Mock Tests */}
                <div
                  onClick={() => {
                    setActiveTab("exams");
                    setExamCategoryFilter(isPureJapaneseStudent ? "mock" : "ubt");
                    setExamSetsPage(1);
                  }}
                  style={{
                    background: "linear-gradient(145deg, #ffedd5 0%, #fed7aa 50%, #fecdd3 100%)",
                    borderRadius: "16px",
                    padding: "12px 6px 10px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(249, 115, 22, 0.14)",
                    border: "1.5px solid #fdba74",
                    minHeight: "108px",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 7,
                      border: "1.5px solid #fed7aa",
                      boxShadow: "0 3px 8px rgba(249, 115, 22, 0.15)"
                    }}
                  >
                    {/* Scorecard with Grid and Score Tag */}
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                      <rect x="7" y="6" width="22" height="26" rx="3.5" fill="#ffffff" stroke="#ef4444" strokeWidth="2"/>
                      <rect x="12" y="3" width="12" height="5" rx="1.5" fill="#ef4444"/>
                      <rect x="10" y="14" width="16" height="15" rx="1.5" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.2"/>
                      <line x1="10" y1="19" x2="26" y2="19" stroke="#3b82f6" strokeWidth="1.2"/>
                      <line x1="10" y1="24" x2="26" y2="24" stroke="#3b82f6" strokeWidth="1.2"/>
                      <line x1="15" y1="14" x2="15" y2="29" stroke="#3b82f6" strokeWidth="1.2"/>
                      <line x1="21" y1="14" x2="21" y2="29" stroke="#3b82f6" strokeWidth="1.2"/>
                      <text x="18" y="11.5" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#ef4444">SCORE</text>
                    </svg>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", lineHeight: "1.25" }}>
                    {isPureJapaneseStudent ? "JLPT Mock Tests" : "EPS-TOPIK UBT"}
                  </span>
                </div>

                {/* 4. Free UBT Exams / Free Mock Sets */}
                <div
                  onClick={() => {
                    setActiveTab("exams");
                    setExamCategoryFilter("free");
                    setExamSetsPage(1);
                  }}
                  style={{
                    background: "linear-gradient(145deg, #fee2e2 0%, #fecdd3 50%, #ffe4e6 100%)",
                    borderRadius: "16px",
                    padding: "12px 6px 10px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(225, 29, 72, 0.14)",
                    border: "1.5px solid #fda4af",
                    minHeight: "108px",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 7,
                      border: "1.5px solid #fecdd3",
                      boxShadow: "0 3px 8px rgba(225, 29, 72, 0.15)"
                    }}
                  >
                    {/* 3D Gift Box with Golden Ribbon & Sparkles */}
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                      {/* Box Body */}
                      <rect x="7" y="16" width="22" height="14" rx="3" fill="#ef4444"/>
                      <path d="M7 19c0-1.657 1.343-3 3-3h8v14H10c-1.657 0-3-1.343-3-3V19z" fill="#dc2626"/>
                      {/* Box Lid */}
                      <rect x="5" y="11.5" width="26" height="5.5" rx="2" fill="#f87171"/>
                      <path d="M5 13.5c0-1.105.895-2 2-2h11v5.5H5v-3.5z" fill="#ef4444"/>
                      {/* Golden Ribbon Cross */}
                      <rect x="15.5" y="11.5" width="5" height="18.5" fill="#facc15"/>
                      <rect x="15.5" y="11.5" width="2.5" height="18.5" fill="#eab308"/>
                      <rect x="7" y="21" width="22" height="4" fill="#facc15"/>
                      <rect x="7" y="21" width="11" height="4" fill="#eab308"/>
                      {/* Ribbon Bow Left */}
                      <path d="M18 11.5C14.5 6.5 8 7.5 10.5 11C12 13 15.5 11.5 18 11.5Z" fill="#fbbf24" stroke="#ca8a04" strokeWidth="0.8"/>
                      {/* Ribbon Bow Right */}
                      <path d="M18 11.5C21.5 6.5 28 7.5 25.5 11C24 13 20.5 11.5 18 11.5Z" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8"/>
                      {/* Ribbon Knot */}
                      <circle cx="18" cy="11.5" r="2.2" fill="#d97706"/>
                      <circle cx="18" cy="11.5" r="1.2" fill="#facc15"/>
                      {/* Sparkles */}
                      <path d="M6 7L6.8 5.3L8.5 4.5L6.8 3.7L6 2L5.2 3.7L3.5 4.5L5.2 5.3L6 7Z" fill="#f59e0b"/>
                      <path d="M30 7.5L30.6 6.1L32 5.5L30.6 4.9L30 3.5L29.4 4.9L28 5.5L29.4 6.1L30 7.5Z" fill="#f59e0b"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", lineHeight: "1.25" }}>
                    {isPureKoreanStudent ? "Free UBT Exams" : isPureJapaneseStudent ? "Free Mock Sets" : "Free exams"}
                  </span>
                </div>

                {/* 5. Buy UBT Package / Buy Exam */}
                <div
                  onClick={() => setActiveTab("buyExam")}
                  style={{
                    background: "linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fed7aa 100%)",
                    borderRadius: "16px",
                    padding: "12px 6px 10px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(217, 119, 6, 0.14)",
                    border: "1.5px solid #fcd34d",
                    minHeight: "108px",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 7,
                      border: "1.5px solid #fde68a",
                      boxShadow: "0 3px 8px rgba(217, 119, 6, 0.15)"
                    }}
                  >
                    {/* Shopping Cart with Dollar Bill Package */}
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                      <circle cx="13" cy="29" r="2.2" fill="#475569"/>
                      <circle cx="26" cy="29" r="2.2" fill="#475569"/>
                      <path d="M7 11h4.5l3.2 14h13.3l3.2-11H13.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="17" y="7" width="13" height="15" rx="1.8" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2"/>
                      <circle cx="23.5" cy="12" r="3" fill="#10b981"/>
                      <text x="23.5" y="14" textAnchor="middle" fontSize="4.8" fontWeight="bold" fill="#ffffff">$</text>
                      <line x1="19.5" y1="17.5" x2="27.5" y2="17.5" stroke="#94a3b8" strokeWidth="1"/>
                      <line x1="19.5" y1="19.5" x2="24.5" y2="19.5" stroke="#94a3b8" strokeWidth="1"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", lineHeight: "1.25" }}>
                    {isPureKoreanStudent ? "Buy UBT Package" : isPureJapaneseStudent ? "Buy Mock Package" : "Buy Packages"}
                  </span>
                </div>

                {/* 6. Dictionary (Vocabulary) */}
                <div
                  onClick={() => setActiveTab("vocab")}
                  style={{
                    background: "linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 50%, #fae8ff 100%)",
                    borderRadius: "16px",
                    padding: "12px 6px 10px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(147, 51, 234, 0.14)",
                    border: "1.5px solid #d8b4fe",
                    minHeight: "108px",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 7,
                      border: "1.5px solid #e9d5ff",
                      boxShadow: "0 3px 8px rgba(147, 51, 234, 0.15)"
                    }}
                  >
                    {/* Dictionary Lexicon with Magnifying Glass */}
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                      <rect x="6" y="7" width="20" height="24" rx="3" fill="#ffffff" stroke="#9333ea" strokeWidth="2"/>
                      <path d="M10 7v24" stroke="#c084fc" strokeWidth="1.8"/>
                      <text x="17" y="17" textAnchor="middle" fontSize="8" fontWeight="900" fill="#7e22ce">가</text>
                      <circle cx="23" cy="22" r="5" fill="#faf5ff" stroke="#3b82f6" strokeWidth="1.8"/>
                      <line x1="26.5" y1="25.5" x2="30.5" y2="29.5" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", lineHeight: "1.25" }}>
                    Dictionary
                  </span>
                </div>

                {/* 7. Performance & Results */}
                <div
                  onClick={() => setActiveTab("results")}
                  style={{
                    background: "linear-gradient(145deg, #ccfbf1 0%, #99f6e4 50%, #e0f2fe 100%)",
                    borderRadius: "16px",
                    padding: "12px 6px 10px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(13, 148, 136, 0.14)",
                    border: "1.5px solid #5eead4",
                    minHeight: "108px",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 7,
                      border: "1.5px solid #99f6e4",
                      boxShadow: "0 3px 8px rgba(13, 148, 136, 0.15)"
                    }}
                  >
                    {/* Champion Gold Trophy with Victory Star */}
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                      <path d="M11 7h14v10a7 7 0 0 1-14 0V7z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.8"/>
                      <path d="M11 10H7a3 3 0 0 0 3 3h1" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M25 10h4a3 3 0 0 1-3 3h-1" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M18 17v7m-5 4h10v-4H13v4z" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 9l1 2 2.2 0.3-1.6 1.6 0.4 2.1-2-1.1-2 1.1 0.4-2.1-1.6-1.6 2.2-0.3z" fill="#ffffff"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", lineHeight: "1.25" }}>
                    Performance
                  </span>
                </div>

                {/* 8. Notice & Messages */}
                <div
                  onClick={() => setActiveTab("news")}
                  style={{
                    background: "linear-gradient(145deg, #ede9fe 0%, #ddd6fe 50%, #e0e7ff 100%)",
                    borderRadius: "16px",
                    padding: "12px 6px 10px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(99, 102, 241, 0.14)",
                    border: "1.5px solid #c4b5fd",
                    minHeight: "108px",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 7,
                      border: "1.5px solid #c7d2fe",
                      boxShadow: "0 3px 8px rgba(99, 102, 241, 0.15)"
                    }}
                  >
                    {/* Announcement Megaphone with Sound Waves */}
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                      <path d="M23 10L12 15H7a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5l11 5V10z" fill="#6366f1" stroke="#4338ca" strokeWidth="1.8"/>
                      <path d="M10 21v6a1.5 1.5 0 0 0 1.5 1.5h1A1.5 1.5 0 0 0 14 27v-6" fill="#a5b4fc" stroke="#4338ca" strokeWidth="1.2"/>
                      <path d="M27 14c1.8 1.5 2.8 3 2.8 4s-1 2.5-2.8 4" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round"/>
                      <circle cx="23" cy="18" r="1.5" fill="#ffffff"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", lineHeight: "1.25" }}>
                    Notice Board
                  </span>
                </div>

                {/* 9. About Us */}
                <div
                  onClick={() => setActiveTab("about")}
                  style={{
                    background: "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 50%, #e0e7ff 100%)",
                    borderRadius: "16px",
                    padding: "12px 6px 10px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(71, 85, 105, 0.14)",
                    border: "1.5px solid #cbd5e1",
                    minHeight: "108px",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 7,
                      border: "1.5px solid #cbd5e1",
                      boxShadow: "0 3px 8px rgba(71, 85, 105, 0.15)"
                    }}
                  >
                    {/* Academy Shield with Columns & Verified Ribbon */}
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                      <path d="M18 5L7 9v9c0 6.5 4.5 11.5 11 13 6.5-1.5 11-6.5 11-13V9L18 5z" fill="#ffffff" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M12 14v8m6-8v8m6-8v8" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M10 24h16M11 13h14" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", lineHeight: "1.25" }}>
                    About Us
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Exam you have Access */}
            <div>
              <h2 style={{ color: "#111827", fontSize: "20px", fontWeight: "800", textAlign: "center", margin: "0 0 16px 0", letterSpacing: "-0.2px" }}>
                {isPureKoreanStudent
                  ? "Korean UBT Exams you have Access"
                  : isPureJapaneseStudent
                  ? "Japanese Mock Tests you have Access"
                  : "Exams you have Access"}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {accessibleSetsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No unlocked exams available currently.</p>
                  </div>
                ) : (
                  accessibleSetsList.map((set, idx) => {
                    const isBlue = idx % 2 === 0;
                    const bg = isBlue ? "#dbeafe" : "#ffedd5";
                    const border = isBlue ? "#bfdbfe" : "#fed7aa";
                    return (
                      <div
                        key={set.id || idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: bg,
                          border: `1.5px solid ${border}`,
                          borderRadius: "14px",
                          padding: "14px 18px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
                        }}
                      >
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", letterSpacing: "0.2px" }}>
                          {set.name}
                        </div>
                        <button
                          onClick={() => handleStartExam(set)}
                          style={{
                            backgroundColor: "#0f3b82",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "10px",
                            padding: "9px 24px",
                            fontSize: "14px",
                            fontWeight: "700",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(15, 59, 130, 0.3)",
                            transition: "all 0.15s"
                          }}
                        >
                          Start
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* EXAMS TAB */}
        {activeTab === "exams" && (
          <div>
            {/* Student's Purchased Package Information Card */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #bfdbfe",
                boxShadow: "0 2px 8px rgba(37,99,235,0.06)",
                padding: "18px 24px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "10px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.25)"
                }}>
                  <LaptopExamIcon size={26} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.6px", color: "#64748b" }}>
                    {hasPaidExamAccess ? "Your Purchased Package" : "Account Access Membership"}
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#1e3a8a", marginTop: "2px" }}>
                    {effectivePackageName}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                {hasPaidExamAccess && effectiveExpiryDate && (
                  <div style={{
                    backgroundColor: "#ffffff",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: isPackageExpired ? "1px solid #fca5a5" : "1px solid #cbd5e1",
                    textAlign: "right"
                  }}>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: isPackageExpired ? "#991b1b" : "#64748b" }}>Package Expiry Date</div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: isPackageExpired ? "#dc2626" : "#047857", marginTop: "2px" }}>
                      {effectiveExpiryDate}
                    </div>
                  </div>
                )}

                <span style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: !hasPaidExamAccess ? (unlockedSets.length > 0 ? "#15803d" : "#b45309") : isPackageExpired ? "#b91c1c" : "#166534",
                  backgroundColor: !hasPaidExamAccess ? (unlockedSets.length > 0 ? "#dcfce7" : "#fef3c7") : isPackageExpired ? "#fee2e2" : "#dcfce7",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: !hasPaidExamAccess ? (unlockedSets.length > 0 ? "1px solid #86efac" : "1px solid #fde68a") : isPackageExpired ? "1px solid #fecaca" : "1px solid #bbf7d0"
                }}>
                  {!hasPaidExamAccess ? (unlockedSets.length > 0 ? `${unlockedSets.length} Set(s) Unlocked (Rs. 40 each)` : "Locked · Purchase Required") : isPackageExpired ? "Expired" : "Active"}
                </span>
              </div>
            </div>


            {isPackageExpired && (
              <div style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", fontWeight: "900", fontSize: "18px" }}>
                    ⚠️
                  </div>
                  <div>
                    <div style={{ color: "#991b1b", fontWeight: "800", fontSize: "15px" }}>
                      Package Expired on {studentExpiryDate}
                    </div>
                    <div style={{ color: "#7f1d1d", fontSize: "13px", marginTop: "2px" }}>
                      Your purchased package has expired. Access to exam sets is locked according to your package expiry date.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("buyExam")}
                  style={{
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(220,38,38,0.2)"
                  }}
                >
                  Renew / Extend Package
                </button>
              </div>
            )}

            {/* Exam Category Switcher: All Sets | UBT Exam Sets | Mock Tests (Only for students with both tracks) */}
            {isBothTrack && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => { setExamCategoryFilter("all"); setExamSetsPage(1); }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "20px",
                    border: examCategoryFilter === "all" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                    backgroundColor: examCategoryFilter === "all" ? "#2563eb" : "#ffffff",
                    color: examCategoryFilter === "all" ? "#ffffff" : "#334155",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: examCategoryFilter === "all" ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  🌐 All Exam Sets ({examSets.length})
                </button>

                <button
                  type="button"
                  onClick={() => { setExamCategoryFilter("ubt"); setExamSetsPage(1); }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "20px",
                    border: examCategoryFilter === "ubt" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                    backgroundColor: examCategoryFilter === "ubt" ? "#2563eb" : "#ffffff",
                    color: examCategoryFilter === "ubt" ? "#ffffff" : "#334155",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: examCategoryFilter === "ubt" ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  🇰🇷 EPS-TOPIK UBT Sets ({ubtSetsCount})
                </button>

                <button
                  type="button"
                  onClick={() => { setExamCategoryFilter("mock"); setExamSetsPage(1); }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "20px",
                    border: examCategoryFilter === "mock" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                    backgroundColor: examCategoryFilter === "mock" ? "#2563eb" : "#ffffff",
                    color: examCategoryFilter === "mock" ? "#ffffff" : "#334155",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: examCategoryFilter === "mock" ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  🇯🇵 Japanese CBT Mock Tests ({mockSetsCount})
                </button>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <h3 style={{ color: "#0f172a", margin: 0, fontSize: "20px", fontWeight: "800" }}>
                {isPureJapaneseStudent || examCategoryFilter === "mock"
                  ? "Available Japanese CBT Mock Tests"
                  : isPureKoreanStudent || examCategoryFilter === "ubt"
                  ? "Available EPS-TOPIK UBT Exam Sets"
                  : "Available Exam Sets & Mock Tests"}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", backgroundColor: "#eff6ff", padding: "4px 10px", borderRadius: "6px" }}>
                  {filteredSets.length} Sets Ready
                </span>
                <input
                  type="text"
                  placeholder={isPureJapaneseStudent || examCategoryFilter === "mock" ? "Search mock test (e.g. N5, JFT, SET 01)" : "Search set (e.g. SET 05)"}
                  value={examSetsSearch}
                  onChange={(e) => { setExamSetsSearch(e.target.value); setExamSetsPage(1); }}
                  style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", outline: "none", width: "220px" }}
                />
              </div>
            </div>

            {/* If student has multiple purchased packages, only filter between their purchased packages */}
            {purchasedPackages.length > 1 && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => { setSelectedPackageFilter("All"); setExamSetsPage(1); }}
                  style={{
                    padding: "7px 14px",
                    backgroundColor: selectedPackageFilter === "All" ? "#1e3a8a" : "#ffffff",
                    color: selectedPackageFilter === "All" ? "#ffffff" : "#1e3a8a",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "12px"
                  }}
                >
                  All My Sets ({examSets.length})
                </button>
                {purchasedPackages.map((pkgName, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSelectedPackageFilter(pkgName); setExamSetsPage(1); }}
                    style={{
                      padding: "7px 14px",
                      backgroundColor: selectedPackageFilter === pkgName ? "#1e3a8a" : "#ffffff",
                      color: selectedPackageFilter === pkgName ? "#ffffff" : "#1e3a8a",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "12px"
                    }}
                  >
                    {pkgName}
                  </button>
                ))}
              </div>
            )}

            {/* Japanese Mock Test Level & Model Selection Pills (Only if mock tests are enabled for student) */}
            {showMockTest && (examCategoryFilter === "mock" || examCategoryFilter === "all") && mockSetsCount > 0 && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center" }}>
                {[
                  { id: "all", label: `⛩️ All Mock Sets (${mockSetsCount})` },
                  { id: "model", label: `🎯 Model Exam / Simulation` },
                  { id: "N5", label: "JLPT N5" },
                  { id: "N4", label: "JLPT N4" },
                  { id: "N3", label: "JLPT N3" },
                  { id: "N2", label: "JLPT N2" },
                  { id: "JFT", label: "JFT-Basic" }
                ].map((f) => {
                  const isActive = japaneseMockFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => { setJapaneseMockFilter(f.id); setExamSetsPage(1); }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: isActive ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                        backgroundColor: isActive ? "#2563eb" : "#ffffff",
                        color: isActive ? "#ffffff" : "#334155",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: isActive ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Exam Sets Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
              {filteredSets.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <p style={{ color: "#64748b", margin: "0 0 10px 0" }}>No exam sets currently available for this package.</p>
                  <button
                    type="button"
                    onClick={() => { setSelectedPackageFilter("All"); setExamSetsSearch(""); }}
                    style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}
                  >
                    View All Sets
                  </button>
                </div>
              ) : (
                paginatedSets.map((set, idx) => {
                  const isFree = Boolean(set.isFree || set.setType === "FREE" || (set.name && set.name.toLowerCase().includes("free demo")));
                  const unlocked = isSetUnlocked(set);
                  const individuallyUnlocked = isSetIndividuallyUnlocked(set);
                  const packageCovered = isSetCoveredByStudentPackage(set);
                  const pending = isSetPending(set);

                  return (
                    <div
                      key={set.id || idx}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        border: isFree ? "1.5px solid #6ee7b7" : "1px solid #e2e8f0",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "12px"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#2563eb", backgroundColor: "#eff6ff", padding: "2px 7px", borderRadius: "4px" }}>
                            {set.packageName || (instituteLanguage === "japanese" ? "Mock Test" : "UBT Set")}
                          </span>
                          {isFree ? (
                            <span style={{ fontSize: "10px", fontWeight: "800", color: "#065f46", backgroundColor: "#d1fae5", border: "1px solid #6ee7b7", padding: "2px 6px", borderRadius: "4px" }}>
                              🎁 FREE DEMO
                            </span>
                          ) : individuallyUnlocked ? (
                            <span style={{ fontSize: "10px", fontWeight: "800", color: "#166534", backgroundColor: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>
                              UNLOCKED (Rs. 40)
                            </span>
                          ) : packageCovered ? (
                            <span style={{ fontSize: "10px", fontWeight: "800", color: "#166534", backgroundColor: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>
                              PACKAGE UNLOCKED
                            </span>
                          ) : pending ? (
                            <span style={{ fontSize: "10px", fontWeight: "800", color: "#0369a1", backgroundColor: "#e0f2fe", padding: "2px 6px", borderRadius: "4px" }}>
                              ⏳ PENDING
                            </span>
                          ) : null}
                        </div>
                        <h4 style={{ margin: 0, fontSize: "15px", color: "#0f172a", fontWeight: "800" }}>
                          {set.name}
                        </h4>
                        <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                          {set.totalQs || 40} Questions · {set.timeMin || 50} Min
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const isJlptSet = Boolean(
                            set.track === "japanese" ||
                            set.level ||
                            (set.id && (String(set.id).startsWith("jlpt-") || String(set.id).startsWith("jft-")))
                          );

                          const startExam = () => {
                            if (isJlptSet) {
                              const fullSet = getMockExamSetById(set.id);
                              setActiveJlptExamSet(fullSet);
                            } else {
                              router.push(`/student/exam/${set.id || encodeURIComponent(set.name)}`);
                            }
                          };

                          if (isFree) {
                            startExam();
                            return;
                          }

                          if (unlocked) {
                            if (isPackageExpired && !individuallyUnlocked) {
                              alert(`Your package expired on ${effectiveExpiryDate}. Please renew your package to take mock exam sets.`);
                              return;
                            }
                            startExam();
                            return;
                          }

                          if (pending) {
                            alert(`Your payment query for "${set.name}" (Rs. 40) is currently pending review by Admin.\n\nYour payment screenshot and eSewa transaction details have been submitted. Once Admin verifies and confirms the payment, your set will be released automatically.`);
                            return;
                          }

                          handleOpenEsewaModal({
                            id: set.id,
                            name: set.name,
                            price: 40,
                            type: "set",
                            packageName: set.packageName || (instituteLanguage === "japanese" ? "Japanese Mock Test" : "UBT Set")
                          });
                        }}
                        style={{
                          width: "100%",
                          background: isFree
                            ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                            : unlocked
                            ? (isPackageExpired && !individuallyUnlocked)
                              ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"
                              : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                            : pending
                            ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                            : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          color: "#ffffff",
                          border: "none",
                          padding: "9px",
                          borderRadius: "6px",
                          fontWeight: "700",
                          cursor: (isPackageExpired && unlocked && !individuallyUnlocked && !isFree) ? "not-allowed" : "pointer",
                          fontSize: "13px",
                          letterSpacing: "0.3px",
                          boxShadow: (unlocked || isFree)
                            ? "none"
                            : pending
                            ? "0 2px 6px rgba(2, 132, 199, 0.3)"
                            : "0 2px 6px rgba(217,119,6,0.25)"
                        }}
                      >
                        {isFree
                          ? "START FREE EXAM ▶"
                          : unlocked
                          ? (isPackageExpired && !individuallyUnlocked)
                            ? "PACKAGE EXPIRED"
                            : "START EXAM ▶"
                          : pending
                          ? "⏳ PENDING CONFIRMATION"
                          : "🔒 BUY TO UNLOCK ▶ (Rs. 40)"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalExamPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "24px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setExamSetsPage(1)}
                  disabled={examSetsPage === 1}
                  style={{ padding: "6px 12px", backgroundColor: examSetsPage === 1 ? "#e2e8f0" : "#1e3a8a", color: examSetsPage === 1 ? "#94a3b8" : "#fff", border: "none", borderRadius: "5px", cursor: examSetsPage === 1 ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "12px" }}
                >
                  ❮❮ First
                </button>
                <button
                  type="button"
                  onClick={() => setExamSetsPage(p => Math.max(1, p - 1))}
                  disabled={examSetsPage === 1}
                  style={{ padding: "6px 12px", backgroundColor: examSetsPage === 1 ? "#e2e8f0" : "#1e3a8a", color: examSetsPage === 1 ? "#94a3b8" : "#fff", border: "none", borderRadius: "5px", cursor: examSetsPage === 1 ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "12px" }}
                >
                  ❮ Prev
                </button>
                {Array.from({ length: totalExamPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalExamPages || Math.abs(p - examSetsPage) <= 2)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === '...' ? (
                      <span key={`dots-${i}`} style={{ padding: "6px 4px", color: "#94a3b8", fontSize: "14px" }}>…</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setExamSetsPage(item)}
                        style={{ padding: "6px 11px", backgroundColor: item === examSetsPage ? "#2563eb" : "#ffffff", color: item === examSetsPage ? "#fff" : "#1e3a8a", border: "1px solid #cbd5e1", borderRadius: "5px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}
                      >
                        {item}
                      </button>
                    )
                  )
                }
                <button
                  type="button"
                  onClick={() => setExamSetsPage(p => Math.min(totalExamPages, p + 1))}
                  disabled={examSetsPage === totalExamPages}
                  style={{ padding: "6px 12px", backgroundColor: examSetsPage === totalExamPages ? "#e2e8f0" : "#1e3a8a", color: examSetsPage === totalExamPages ? "#94a3b8" : "#fff", border: "none", borderRadius: "5px", cursor: examSetsPage === totalExamPages ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "12px" }}
                >
                  Next ❯
                </button>
                <button
                  type="button"
                  onClick={() => setExamSetsPage(totalExamPages)}
                  disabled={examSetsPage === totalExamPages}
                  style={{ padding: "6px 12px", backgroundColor: examSetsPage === totalExamPages ? "#e2e8f0" : "#1e3a8a", color: examSetsPage === totalExamPages ? "#94a3b8" : "#fff", border: "none", borderRadius: "5px", cursor: examSetsPage === totalExamPages ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "12px" }}
                >
                  Last ❯❯
                </button>
                <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "4px" }}>Page {examSetsPage} of {totalExamPages}</span>
              </div>
            )}
          </div>
        )}

        {/* DICTIONARY TAB */}
        {activeTab === "vocab" && (
          <DictionarySection instituteLanguage={instituteLanguage} userRole="student" />
        )}

        {/* STUDY MATERIALS & JAPANESE MOCK TEST TAB */}
        {(activeTab === "listening" || activeTab === "japaneseMock") && (
          <div style={{ marginTop: "10px", marginBottom: "30px" }}>
            <EpsBookReader
              mode="student"
              studentPackage={studentPackage}
              purchasedPackages={purchasedPackages}
              instituteLanguage={instituteLanguage}
              initialFolder={activeTab === "japaneseMock" ? "Mock Test" : (activeBookFolder || undefined)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenEsewaModal={handleOpenEsewaModal}
              unlockedSets={unlockedSets}
              pendingQueries={pendingQueries}
              isPackageExpired={isPackageExpired}
              effectiveExpiryDate={effectiveExpiryDate}
              activeStudentPackages={activeStudentPackages}
            />
          </div>
        )}

        {/* NOTICE BOARD TAB */}
        {activeTab === "news" && (() => {
          const effectiveFilter = instituteLanguage === "japanese"
            ? "japanese"
            : instituteLanguage === "korean"
            ? "korean"
            : (noticeFilterTrack === "auto" ? "all" : noticeFilterTrack);

          const displayedNotices = newsList.filter((item) => {
            const itemLang = (item.language || item.track || "all").toLowerCase();
            if (effectiveFilter === "all") return true;
            if (effectiveFilter === "korean") return itemLang === "all" || itemLang === "korean";
            if (effectiveFilter === "japanese") return itemLang === "all" || itemLang === "japanese";
            return true;
          });

          const totalKorean = newsList.filter(n => (n.language || n.track || "all").toLowerCase() === "korean").length;
          const totalJapanese = newsList.filter(n => (n.language || n.track || "all").toLowerCase() === "japanese").length;
          const totalAll = newsList.length;

          const portalTrack = instituteLanguage === "japanese"
            ? "japanese"
            : instituteLanguage === "korean"
            ? "korean"
            : effectiveFilter;

          const filterTabs = instituteLanguage === "korean"
            ? [{ key: "korean", label: `Notice (${totalKorean})` }]
            : instituteLanguage === "japanese"
            ? [{ key: "japanese", label: `Notice (${totalJapanese})` }]
            : [
                { key: "korean", label: `Korean (${totalKorean})` },
                { key: "japanese", label: `Japanese (${totalJapanese})` },
                { key: "all", label: `All (${totalAll})` }
              ];

          return (
            <div>
              {/* Separate Official Portals:
                  Korean: Official Notices, Job Application, New Application, EPS Result
                  Japanese: Official Notice, Japanese Notice & Info, JLPT Application Form, JFT Application Form */}
              <div style={{ marginBottom: "26px" }}>
                <OfficialPortalButtons
                  track={portalTrack}
                  showTrackTabs={instituteLanguage === "both"}
                />
              </div>

              {/* Notice Section — poster style with Study Track filtering */}
              <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", maxWidth: "860px", margin: "0 auto" }}>
                {/* Study Track Notice Filter Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", flexWrap: "wrap", gap: "12px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#0f172a", fontSize: "19px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>📢</span> Notices & Announcements
                    </h3>
                    <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                      Active Category: <strong style={{ color: "#2563eb" }}>
                        {effectiveFilter === "all" ? "All Announcements" : "Notice"}
                      </strong>
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: "inline-flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "10px", border: "1.5px solid #cbd5e1", gap: "4px", flexWrap: "wrap" }}>
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setNoticeFilterTrack(tab.key)}
                        style={{
                          backgroundColor: (effectiveFilter === tab.key) ? (tab.key === "all" ? "#1e293b" : "#2563eb") : "transparent",
                          color: (effectiveFilter === tab.key) ? "#ffffff" : "#475569",
                          border: "none",
                          borderRadius: "7px",
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: instituteLanguage === "both" ? "pointer" : "default",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                  {displayedNotices.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <p style={{ color: "#64748b", margin: "0 0 6px 0", fontSize: "15px" }}>No notices posted currently for this category.</p>
                      <p style={{ color: "#94a3b8", margin: 0, fontSize: "12px" }}>Switch to All Notices or adjust your Study Track to view more announcements.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      {displayedNotices.map((item) => {
                        const itemTrack = (item.language || item.track || "all").toLowerCase();
                        return (
                          <div key={item.id} style={{
                            borderRadius: "14px",
                            overflow: "hidden",
                            border: item.isPopup ? "2px solid #6366f1" : "1px solid #e2e8f0",
                            boxShadow: item.isPopup ? "0 4px 20px rgba(99,102,241,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
                            background: item.isPopup ? "linear-gradient(135deg, #fafaff 0%, #f0f0ff 100%)" : "#fff",
                          }}>
                            {/* Header — centered */}
                            <div style={{ background: item.isPopup ? "linear-gradient(90deg, #6366f1, #4f46e5)" : "linear-gradient(90deg, #475569, #334155)", padding: "14px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "6px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                                <span style={{
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  padding: "2px 10px",
                                  borderRadius: "12px",
                                  backgroundColor: itemTrack === "japanese" ? "rgba(168, 85, 247, 0.3)" : itemTrack === "korean" ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.2)",
                                  color: "#ffffff",
                                  border: "1px solid rgba(255,255,255,0.4)"
                                }}>
                                  {itemTrack === "japanese" ? "🇯🇵 Japanese Track" : itemTrack === "korean" ? "🇰🇷 Korean Track" : "🌐 All Tracks"}
                                </span>
                                {item.isPopup && (
                                  <span style={{ fontSize: "10px", fontWeight: "800", backgroundColor: "#fbbf24", color: "#78350f", padding: "2px 8px", borderRadius: "10px" }}>
                                    📢 Flex Banner
                                  </span>
                                )}
                              </div>
                              <h4 style={{ margin: 0, color: "white", fontSize: "17px", fontWeight: "700", textAlign: "center" }}>{item.title}</h4>
                              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)" }}>📅 {item.date}</span>
                            </div>

                      {/* Body — centered */}
                      <div style={{ padding: "22px 24px", textAlign: "center" }}>
                        {item.content && (
                          <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.8", whiteSpace: "pre-line", marginBottom: item.fileUrl ? "18px" : "0", textAlign: "center" }}>
                            {item.content}
                          </p>
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

                        {item.fileUrl && item.fileType === "audio" && (
                          <div style={{ maxWidth: "500px", margin: "14px auto 0 auto" }}>
                            <audio controls src={item.fileUrl} style={{ width: "100%", height: "40px", display: "block" }} />
                          </div>
                        )}

                        {item.fileUrl && item.fileType === "video" && (
                          <div style={{ maxWidth: "700px", margin: "14px auto 0 auto" }}>
                            <video controls src={item.fileUrl} style={{ width: "100%", height: "auto", borderRadius: "10px", backgroundColor: "#000", display: "block" }} />
                          </div>
                        )}

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
                  );
                })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        {/* PACKAGES TAB */}
        {activeTab === "buyExam" && (() => {
          const displayedPackages = examPackages.filter((pkg) => {
            const name = (pkg.name || "").toLowerCase();
            const isMock = pkg.track === "japanese" || name.includes("mock") || name.includes("jft") || name.includes("jlpt") || name.includes("nat");
            if (isPureKoreanStudent) return !isMock;
            if (isPureJapaneseStudent) return isMock;
            if (packageCategoryFilter === "ubt") return !isMock;
            if (packageCategoryFilter === "mock") return isMock;
            return true;
          });

          const ubtPkgsCount = examPackages.filter(p => !((p.name||"").toLowerCase().includes("mock") || (p.name||"").toLowerCase().includes("jft") || (p.name||"").toLowerCase().includes("jlpt") || (p.name||"").toLowerCase().includes("nat") || p.track === "japanese")).length;
          const mockPkgsCount = examPackages.filter(p => ((p.name||"").toLowerCase().includes("mock") || (p.name||"").toLowerCase().includes("jft") || (p.name||"").toLowerCase().includes("jlpt") || (p.name||"").toLowerCase().includes("nat") || p.track === "japanese")).length;

          return (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <h3 style={{ color: "#0f172a", margin: 0, fontSize: "20px", fontWeight: "800" }}>
                  {isPureJapaneseStudent || packageCategoryFilter === "mock"
                    ? "Available Japanese Mock Test Packages"
                    : isPureKoreanStudent || packageCategoryFilter === "ubt"
                    ? "Available EPS-TOPIK UBT Packages"
                    : "Available Exam Packages (UBT & Mock Tests)"}
                </h3>
              </div>

              {/* Package Category Filter Pills (Only for students with both tracks) */}
              {isBothTrack && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setPackageCategoryFilter("all")}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "20px",
                      border: packageCategoryFilter === "all" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                      backgroundColor: packageCategoryFilter === "all" ? "#2563eb" : "#ffffff",
                      color: packageCategoryFilter === "all" ? "#ffffff" : "#334155",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: packageCategoryFilter === "all" ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    🌐 All Packages ({examPackages.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPackageCategoryFilter("ubt")}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "20px",
                      border: packageCategoryFilter === "ubt" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                      backgroundColor: packageCategoryFilter === "ubt" ? "#2563eb" : "#ffffff",
                      color: packageCategoryFilter === "ubt" ? "#ffffff" : "#334155",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: packageCategoryFilter === "ubt" ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    🇰🇷 UBT Packages ({ubtPkgsCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPackageCategoryFilter("mock")}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "20px",
                      border: packageCategoryFilter === "mock" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                      backgroundColor: packageCategoryFilter === "mock" ? "#2563eb" : "#ffffff",
                      color: packageCategoryFilter === "mock" ? "#ffffff" : "#334155",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: packageCategoryFilter === "mock" ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    🇯🇵 Mock Test Packages ({mockPkgsCount})
                  </button>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {displayedPackages.map((pkg, idx) => {
                  const isMock = pkg.track === "japanese" || (pkg.name || "").toLowerCase().includes("mock") || (pkg.name || "").toLowerCase().includes("jft") || (pkg.name || "").toLowerCase().includes("jlpt") || (pkg.name || "").toLowerCase().includes("nat");

                  return (
                    <div key={pkg.id || idx} style={{ backgroundColor: "#ffffff", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "3px 8px", borderRadius: "4px" }}>
                          {isMock ? "🇯🇵 MOCK TEST PACKAGE" : "🇰🇷 UBT PACKAGE"}
                        </span>
                        <h4 style={{ margin: "14px 0 8px 0", fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>{pkg.name}</h4>
                        <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5", marginBottom: pkg.includedSets?.length ? "10px" : "18px" }}>
                          {pkg.desc || (isMock ? "Full simulated Japanese mock test sets with audio and timer." : "Full simulated exam practice sets with Korean audio and timer.")}
                        </p>
                        {pkg.includedSets && pkg.includedSets.length > 0 && (
                          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "8px 10px", marginBottom: "14px", fontSize: "12px" }}>
                            <div style={{ fontWeight: "700", color: "#1e40af", marginBottom: "4px", fontSize: "11px" }}>
                              📦 {pkg.includedSets.length} Included Sets:
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {pkg.includedSets.slice(0, 3).map((setName, sIdx) => (
                                <span key={sIdx} style={{ fontSize: "10.5px", backgroundColor: "#e0f2fe", color: "#0369a1", padding: "1px 5px", borderRadius: "3px", fontWeight: "600" }}>
                                  {setName}
                                </span>
                              ))}
                              {pkg.includedSets.length > 3 && (
                                <span style={{ fontSize: "10.5px", color: "#64748b", fontStyle: "italic", alignSelf: "center" }}>
                                  +{pkg.includedSets.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#16a34a", marginBottom: "14px" }}>{pkg.price || "Contact Institute"}</div>
                    <div>
                      {isPackageUnlocked(pkg) ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab("exams")}
                          style={{
                            width: "100%",
                            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                            color: "#ffffff",
                            border: "none",
                            padding: "10px",
                            borderRadius: "6px",
                            fontWeight: "800",
                            cursor: "pointer",
                            fontSize: "13.5px",
                            boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          <span>✓</span>
                          <span>ACCESS EXAMS ▶</span>
                        </button>
                      ) : isPackagePending(pkg) ? (
                        <button
                          type="button"
                          onClick={() => {
                            alert(`Your payment request for "${pkg.name}" is currently in review by Admin.\n\nWait for 5-10 minute, Admin will verify your payment and release your ${isJapaneseTrack ? "Mock Test package" : "UBT package"}.`);
                          }}
                          style={{
                            width: "100%",
                            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                            color: "#ffffff",
                            border: "none",
                            padding: "10px",
                            borderRadius: "6px",
                            fontWeight: "800",
                            cursor: "pointer",
                            fontSize: "13px",
                            boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          <span>⏳</span>
                          <span>IN REVIEW</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEsewaModal({
                              id: pkg.id,
                              name: pkg.name,
                              price: pkg.price || "Rs. 1,000",
                              type: "package",
                              desc: pkg.desc
                            })
                          }
                          style={{
                            width: "100%",
                            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            color: "#ffffff",
                            border: "none",
                            padding: "10px",
                            borderRadius: "6px",
                            fontWeight: "800",
                            cursor: "pointer",
                            fontSize: "13.5px",
                            boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          <span>Buy</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })()}

        {/* NOTIFY ADMIN TAB */}
        {activeTab === "notify" && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: "#0f172a", marginBottom: "14px", fontSize: "18px" }}>Send a Message to Administration</h3>
              <form onSubmit={handleSendNotification}>
                <input
                  type="text"
                  placeholder="Subject"
                  value={notifySubject}
                  onChange={(e) => setNotifySubject(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box", marginBottom: "12px" }}
                  required
                />
                <textarea
                  placeholder="Write your inquiry or question..."
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  rows={4}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box", fontFamily: "inherit", marginBottom: "12px" }}
                  required
                />
                <button type="submit" style={{ backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                  Send Message
                </button>
              </form>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: "#0f172a", fontSize: "18px" }}>Message History</h3>
              {myNotifications.length === 0 ? (
                <p style={{ color: "#64748b", margin: 0 }}>You have not sent any messages yet.</p>
              ) : (
                myNotifications.map((item) => (
                  <div key={item.id} style={{ marginBottom: "12px", padding: "14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                      <h4 style={{ margin: 0, color: "#1e3a8a", fontSize: "14px", fontWeight: "700" }}>{item.subject}</h4>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{item.date}</span>
                    </div>
                    <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#334155", whiteSpace: "pre-line" }}>{item.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PERFORMANCE / RESULTS TAB */}
        {activeTab === "results" && (
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden", border: "1px solid #cbd5e1" }}>
            <div style={{ backgroundColor: "#1e3a8a", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, color: "#ffffff", fontSize: "18px", fontWeight: "700" }}>
                My Exam Results &amp; Performance Logs
              </h3>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#1e3a8a", color: "#ffffff" }}>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "#ffffff", fontSize: "13.5px", fontWeight: "700" }}>Exam Set</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "#ffffff", fontSize: "13.5px", fontWeight: "700" }}>Score</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "#ffffff", fontSize: "13.5px", fontWeight: "700" }}>Percentage</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "#ffffff", fontSize: "13.5px", fontWeight: "700" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                          No exam results recorded yet. Start a {isJapaneseTrack ? "Japanese CBT Mock Exam" : "UBT exam"} to view your scores here.
                        </td>
                      </tr>
                    ) : (
                      results.map((res, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#ffffff" }}>
                          <td style={{ padding: "14px 16px", fontWeight: "700", color: "#0f172a" }}>{res.examName || (isJapaneseTrack ? "Japanese Mock Set" : "UBT Set")}</td>
                          <td style={{ padding: "14px 16px", fontWeight: "700", color: "#2563eb" }}>{res.score} / {res.total || 40}</td>
                          <td style={{ padding: "14px 16px", color: "#334155", fontWeight: "600" }}>{res.percentage || Math.round((Number(res.score) / (Number(res.total) || 40)) * 100)}%</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ backgroundColor: res.passed ? "#dcfce7" : "#fee2e2", color: res.passed ? "#166534" : "#991b1b", padding: "4px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "700" }}>
                              {res.passed ? "Passed" : "Failed"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* COLOR VISION TAB */}
        {activeTab === "colorVision" && (
          <ColorVisionSection onBackToHome={() => setActiveTab("home")} />
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "26px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "22px", paddingBottom: "18px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#0f3b82", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "800", boxShadow: "0 4px 10px rgba(15, 59, 130, 0.25)" }}>
                  {(studentName || "S").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>{studentName || "Student"}</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{currentStudentPhone || "Online Student"}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "13.5px", color: "#64748b", fontWeight: "600" }}>Institute:</span>
                  <span style={{ fontSize: "13.5px", color: "#0f172a", fontWeight: "700" }}>{studentInstitute || "Default Institute"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                  <span style={{ fontSize: "13.5px", color: "#166534", fontWeight: "600" }}>Account Validity:</span>
                  <span style={{ fontSize: "13.5px", color: "#15803d", fontWeight: "800" }}>Lifetime Free Access</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "13.5px", color: "#64748b", fontWeight: "600" }}>Active Package:</span>
                  <span style={{ fontSize: "13.5px", color: "#1e3a8a", fontWeight: "700" }}>{effectivePackageName}</span>
                </div>
                {effectiveExpiryDate && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: isPackageExpired ? "#fee2e2" : "#f8fafc", borderRadius: "10px", border: isPackageExpired ? "1px solid #fca5a5" : "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "13.5px", color: isPackageExpired ? "#991b1b" : "#64748b", fontWeight: "600" }}>Package Expiry:</span>
                    <span style={{ fontSize: "13.5px", color: isPackageExpired ? "#dc2626" : "#059669", fontWeight: "700" }}>{effectiveExpiryDate}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => setActiveTab("colorVision")}
                  style={{ width: "100%", backgroundColor: "#f8fafc", color: "#1e293b", border: "1px solid #cbd5e1", padding: "12px", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <span>👁️</span> Test Color Vision (Ishihara)
                </button>
                <button
                  onClick={() => setActiveTab("results")}
                  style={{ width: "100%", backgroundColor: "#f8fafc", color: "#1e293b", border: "1px solid #cbd5e1", padding: "12px", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <span>📊</span> View Exam Performance History
                </button>
                <button
                  onClick={handleLogout}
                  style={{ width: "100%", backgroundColor: "#ef4444", color: "#ffffff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "6px" }}
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT US TAB */}
        {activeTab === "about" && (
          <AboutUsSection />
        )}
      </div>

      {/* Fixed Bottom Navigation Bar for Mobile, Tablet, iPad & App View */}
      <nav
        className="student-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "64px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 9999,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.06)",
          padding: "4px 8px 6px 8px",
          boxSizing: "border-box"
        }}
      >
        {/* 1. Home */}
        <button
          onClick={() => setActiveTab("home")}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            color: activeTab === "home" ? "#0f3b82" : "#64748b"
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={activeTab === "home" ? "#0f3b82" : "none"} stroke={activeTab === "home" ? "#0f3b82" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span style={{ fontSize: "11px", fontWeight: activeTab === "home" ? 800 : 600, marginTop: "2px" }}>Home</span>
        </button>

        {/* 2. Exams / Mock */}
        <button
          onClick={() => {
            setActiveTab("exams");
            setExamCategoryFilter(isPureJapaneseStudent ? "mock" : "ubt");
            setExamSetsPage(1);
          }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            color: activeTab === "exams" ? "#0f3b82" : "#64748b"
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activeTab === "exams" ? "#0f3b82" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span style={{ fontSize: "11px", fontWeight: activeTab === "exams" ? 800 : 600, marginTop: "2px" }}>
            {isPureJapaneseStudent ? "Mock" : "Exams"}
          </span>
        </button>

        {/* 3. Dictionary (Vocabulary) */}
        <button
          onClick={() => setActiveTab("vocab")}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            color: activeTab === "vocab" ? "#0f3b82" : "#64748b"
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activeTab === "vocab" ? "#0f3b82" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span style={{ fontSize: "11px", fontWeight: activeTab === "vocab" ? 800 : 600, marginTop: "2px" }}>Dictionary</span>
        </button>

        {/* 4. Study / Books (EPS Book, Meaning Book, Grammar Book) */}
        <button
          onClick={() => setActiveTab("listening")}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            color: activeTab === "listening" ? "#0f3b82" : "#64748b"
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activeTab === "listening" ? "#0f3b82" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
          </svg>
          <span style={{ fontSize: "11px", fontWeight: activeTab === "listening" ? 800 : 600, marginTop: "2px" }}>Books</span>
        </button>

        {/* 5. More / Menu */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            color: (mobileMenuOpen || ['buyExam', 'news', 'notify', 'results'].includes(activeTab)) ? "#0f3b82" : "#64748b"
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={(mobileMenuOpen || ['buyExam', 'news', 'notify', 'results'].includes(activeTab)) ? "#0f3b82" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <span style={{ fontSize: "11px", fontWeight: (mobileMenuOpen || ['buyExam', 'news', 'notify', 'results'].includes(activeTab)) ? 800 : 600, marginTop: "2px" }}>More</span>
        </button>
      </nav>

      {/* eSewa Instant Payment & Auto-Unlock Modal */}
      <EsewaCheckoutModal
        isOpen={esewaModalOpen}
        onClose={() => setEsewaModalOpen(false)}
        item={selectedEsewaItem}
        studentName={studentName}
        studentPhone={currentStudentPhone}
        onSuccessUnlock={handleEsewaSuccessUnlock}
      />

      {/* JLPT & JFT Japanese CBT Mock Exam Modal */}
      {activeJlptExamSet && (
        <JlptMockExamModal
          examSet={activeJlptExamSet}
          mode="student"
          onClose={() => setActiveJlptExamSet(null)}
          onComplete={() => {
            try {
              const prevResults = JSON.parse(localStorage.getItem("examResults") || "[]");
              setResults(prevResults);
            } catch (e) {}
          }}
        />
      )}
    </div>
  );
};

export default StudentDashboard;