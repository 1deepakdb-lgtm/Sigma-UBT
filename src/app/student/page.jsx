'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import DictionarySection from "@/components/DictionarySection";
import EpsBookReader from "@/components/EpsBookReader";
import OfficialPortalButtons from "@/components/OfficialPortalButtons";
import EsewaCheckoutModal from "@/components/EsewaCheckoutModal";
import JlptMockExamModal from "@/components/JlptMockExamModal";
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
  const [studentName, setStudentName] = useState("");
  const [currentStudentPhone, setCurrentStudentPhone] = useState(null);
  const [studentInstitute, setStudentInstitute] = useState(null);
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
  const [instituteLanguage, setInstituteLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("instituteLanguage") || "both";
    }
    return "both";
  });

  const isGoogleOrFree = Boolean(
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
    if (!currentPhone && !studentName) return list;

    // 1. From adminBuyerStudentsMap for this student phone
    if (currentBuyer?.packages && Array.isArray(currentBuyer.packages)) {
      list.push(...currentBuyer.packages);
    }
    if (currentBuyer?.packageName && !list.includes(currentBuyer.packageName)) {
      list.push(currentBuyer.packageName);
    }

    // 2. From studentPendingQueries where status === "Released" && itemType === "package"
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

    // 3. From institute-assigned package (if student was explicitly enrolled by institute in a paid package)
    if (
      studentPackage &&
      !isGoogleOrFree &&
      !studentPackage.toLowerCase().includes("free") &&
      !studentPackage.toLowerCase().includes("google")
    ) {
      if (!list.includes(studentPackage)) {
        list.push(studentPackage);
      }
    }

    // In Japanese Track: Strictly strip out ANY Korean packages from student package list
    if (isJapaneseTrack) {
      list = list.filter(pkgName => {
        const lower = (pkgName || "").toLowerCase();
        return !lower.includes("ubt") && !lower.includes("chapter") && !lower.includes("eps") && !lower.includes("topik") && !lower.includes("model question");
      });
      if (list.length === 0 && (currentBuyer?.hasPurchased || currentBuyer?.isBuyer)) {
        list = ["Full Mock Test"];
      }
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
  const isSetInPackage = (set, pkgName) => {
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

    const setPkgNorm = norm(set.packageName);
    if (!setPkgNorm || !targetPkgNorm) return false;

    // Exact match (e.g. "30setchapterubt" === "30setchapterubt")
    if (setPkgNorm === targetPkgNorm) return true;

    // Chapterwise package match
    if (targetPkgNorm.includes("chapter") && setPkgNorm.includes("chapter")) return true;

    // 100 UBT package match
    if (targetPkgNorm.includes("100") && setPkgNorm.includes("100")) return true;

    // Model Question Bank match
    if (targetPkgNorm.includes("model") && setPkgNorm.includes("model")) return true;

    // Full Set UBT: covers standard EPS full sets (not chapter and not model question sets)
    if (targetPkgNorm.includes("full") && !setPkgNorm.includes("chapter") && !setPkgNorm.includes("model") && !setPkgNorm.includes("mock") && !setPkgNorm.includes("jlpt") && !setPkgNorm.includes("jft") && !setPkgNorm.includes("nat")) {
      return true;
    }

    // Japanese Mock Test package matches
    if (targetPkgNorm.includes("mock") && setPkgNorm.includes("mock")) return true;
    if (targetPkgNorm.includes("jft") && setPkgNorm.includes("jft")) return true;
    if (targetPkgNorm.includes("jlpt") && setPkgNorm.includes("jlpt")) return true;
    if (targetPkgNorm.includes("nat") && setPkgNorm.includes("nat")) return true;
    if (targetPkgNorm.includes("full") && (setPkgNorm.includes("mock") || setPkgNorm.includes("jlpt") || setPkgNorm.includes("jft") || setPkgNorm.includes("nat"))) {
      return true;
    }

    return false;
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

    // 2. Check in studentPendingQueries for released individual sets
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

    // 3. Check in adminStudentUnlockedSetsMap
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
  // An exam set is ONLY unlocked if:
  // 1) Super Admin designated it as FREE DEMO (set.isFree || set.setType === "FREE" || name includes "free demo"), OR
  // 2) It was individually purchased & released for this student, OR
  // 3) The student has an active package that covers this specific set!
  const isSetUnlocked = (set) => {
    if (!set) return false;
    if (set.isFree === true || set.setType === "FREE" || (set.name && set.name.toLowerCase().includes("free demo"))) {
      return true;
    }
    return Boolean(isSetIndividuallyUnlocked(set) || isSetCoveredByStudentPackage(set));
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
      return pNorm === targetNorm || (pNorm.includes("chapter") && targetNorm.includes("chapter")) || (pNorm.includes("100") && targetNorm.includes("100"));
    });
  };

  const handleOpenEsewaModal = (item) => {
    setSelectedEsewaItem(item);
    setEsewaModalOpen(true);
  };

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
        let defaultPkg = hasPurchasedAccess ? (localBuyer?.package || localBuyer?.packageName || currentBuyer?.package || (isJapaneseTrack ? "Full Mock Test" : "Full Set UBT")) : "Free Student Access";
        if (isJapaneseTrack && defaultPkg && (defaultPkg.toLowerCase().includes("ubt") || defaultPkg.toLowerCase().includes("chapter") || defaultPkg.toLowerCase().includes("eps"))) {
          defaultPkg = "Full Mock Test";
        }
        setStudentPackage(defaultPkg);
      } else {
        let chosenPkg = localPkg;
        if (isJapaneseTrack && (chosenPkg.toLowerCase().includes("ubt") || chosenPkg.toLowerCase().includes("chapter") || chosenPkg.toLowerCase().includes("eps"))) {
          chosenPkg = "Full Mock Test";
        }
        setStudentPackage(chosenPkg);
      }
    }

    // Fetch verified session from backend
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const uName = data.user.name || data.user.username;
          const uPhone = data.user.phone || data.user.username;
          const instName = data.user.institute?.name || null;
          const instLogo = data.user.institute?.logoUrl || logo;
          const batchName = data.user.batch || null;
          const instLang = data.user.instituteLanguage || data.user.institute?.language || "both";
          const rawPkg = data.user.studentPackage || data.user.batch || "";
          const isGoogleOrFreeUser =
            rawPkg.toLowerCase().includes("google") ||
            rawPkg.toLowerCase().includes("free") ||
            data.user.isFreeStudent ||
            data.user.username?.includes("@") ||
            !data.user.phone;

          const userBuyer = (uPhone && localBuyerMap[uPhone]) || (uName && localBuyerMap[uName]) || localBuyer;
          const userHasPurchased = Boolean(
            hasPurchasedAccess ||
            userBuyer?.isBuyer ||
            userBuyer?.hasPurchased ||
            userBuyer?.packageName ||
            userBuyer?.package
          );

          let userPkg = userHasPurchased
            ? (userBuyer?.package || userBuyer?.packageName || currentBuyer?.package || (isJapaneseTrack ? "Full Mock Test" : "Full Set UBT"))
            : ((!isShift(rawPkg) && !isGoogleOrFreeUser && rawPkg) ||
               (!isGoogleOrFreeUser && data.user.institute?.examPackage) ||
               "Free Student Access");

          if (isJapaneseTrack && userPkg && userPkg !== "Free Student Access" && (userPkg.toLowerCase().includes("ubt") || userPkg.toLowerCase().includes("chapter") || userPkg.toLowerCase().includes("eps"))) {
            userPkg = "Full Mock Test";
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
          if (instName) setStudentInstitute(instName);
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
    const isJapaneseTrack = instituteLanguage === "japanese";

    const defaultPackages = isJapaneseTrack ? [
      { id: "jp-1", name: "Full Mock Test", price: "Rs. 2,500", desc: "Complete access to all JLPT (N5-N2) & JFT-Basic CBT Mock Test Sets." },
      { id: "jp-2", name: "JFT-Basic Mock Test", price: "Rs. 1,500", desc: "Official JFT-Basic SSW mock test sets with audio and real-time evaluation." },
      { id: "jp-3", name: "NAT-TEST Mock Test", price: "Rs. 1,500", desc: "NAT-TEST 5Q & 4Q authentic practice sets with listening." },
      { id: "jp-4", name: "JLPT Mock Test Bundle", price: "Rs. 2,000", desc: "Standard JLPT N5 & N4 simulation mock exam sets." }
    ] : [
      { id: 1, name: "30 Set Chapter UBT", price: "Rs. 1,000", desc: "Complete chapterwise practice sets with audio." },
      { id: 2, name: "100 UBT set", price: "Rs. 2,500", desc: "Full-length simulated exam packages for real test experience." },
      { id: 3, name: "Full Set UBT", price: "Rs. 4,000", desc: "Full EPS-TOPIK Korean 40-question UBT sets." },
      { id: 4, name: "Model Question Bank", price: "Rs. 1,500", desc: "Exclusive Model Question Bank 40-question UBT sets with Korean Audio & Real-time Evaluation (Sold Separately)." }
    ];

    const savedPackages = JSON.parse(localStorage.getItem("examPackages") || "[]");
    let finalPackages = savedPackages.length > 0 ? [...savedPackages] : [...defaultPackages];
    if (isJapaneseTrack) {
      defaultPackages.forEach(jpPkg => {
        if (!finalPackages.some(p => (p.name || "").toLowerCase() === jpPkg.name.toLowerCase())) {
          finalPackages.push(jpPkg);
        }
      });
      // Show only Mock Test packages to Japanese track students
      finalPackages = finalPackages.filter(p => {
        const name = (p.name || "").toLowerCase();
        const type = (p.type || "").toLowerCase();
        return p.track === "japanese" || name.includes("mock") || name.includes("jft") || name.includes("jlpt") || name.includes("nat") || type.includes("mock") || type.includes("jft") || type.includes("jlpt");
      });
    } else {
      // Show Korean UBT packages to Korean track students
      finalPackages = finalPackages.filter(p => {
        const name = (p.name || "").toLowerCase();
        const type = (p.type || "").toLowerCase();
        const isJp = p.track === "japanese" || name.includes("mock") || name.includes("jft") || name.includes("jlpt") || name.includes("nat") || type.includes("mock");
        return !isJp;
      });
      if (!finalPackages.some(p => (p.name || "").toLowerCase().includes("model question"))) {
        finalPackages.push({
          id: 4,
          name: "Model Question Bank",
          price: "Rs. 1,500",
          desc: "Exclusive Model Question Bank 40-question UBT sets with Korean Audio & Real-time Evaluation (Sold Separately)."
        });
      }
    }
    setExamPackages(finalPackages);

    // Build Japanese Mock Exam Sets from JLPT_MOCK_SETS_META
    const buildJapaneseSets = () => {
      return (JLPT_MOCK_SETS_META || []).map((meta) => {
        const isFree = Boolean(meta.setNumber === 1 || (meta.id && meta.id.endsWith("-01")));
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
                creatorInstituteName: srvSet.creatorInstituteName || null,
                isPublished: srvSet.isPublished !== false,
                isFree: Boolean(srvSet.isFree),
                setType: srvSet.setType || "UBT",
                track: srvSet.track || "korean"
              });
            }
          });
        }

        if (isJapaneseTrack) {
          const jpSets = buildJapaneseSets();
          const customJpSets = mergedSets.filter(s => {
            if (!s) return false;
            const name = (s.name || s.title || "").toLowerCase();
            const sType = (s.setType || "").toUpperCase();
            const isKorean = s.track === "korean" || sType === "UBT" || sType === "CHAPTERWISE" || name.includes("ubt") || name.includes("eps") || name.includes("chapter") || name.includes("topik") || name.includes("reading") || name.includes("listening");
            const isJp = s.track === "japanese" || sType === "MOCK" || s.isMock === true || name.includes("mock") || name.includes("jlpt") || name.includes("jft") || name.includes("nat") || (s.packageName && s.packageName.toLowerCase().includes("mock"));
            return isJp && !isKorean;
          });
          filterAndSetExamSets([...jpSets, ...customJpSets], finalPackages);
        } else if (instituteLanguage === "both") {
          const jpSets = buildJapaneseSets();
          filterAndSetExamSets([...mergedSets, ...jpSets], finalPackages);
        } else {
          filterAndSetExamSets(mergedSets, finalPackages);
        }
      })
      .catch(() => {
        if (isJapaneseTrack) {
          const jpSets = buildJapaneseSets();
          const customJpSets = savedSets.filter(s => {
            if (!s) return false;
            const name = (s.name || s.title || "").toLowerCase();
            const sType = (s.setType || "").toUpperCase();
            const isKorean = s.track === "korean" || sType === "UBT" || sType === "CHAPTERWISE" || name.includes("ubt") || name.includes("eps") || name.includes("chapter") || name.includes("topik") || name.includes("reading") || name.includes("listening");
            const isJp = s.track === "japanese" || sType === "MOCK" || s.isMock === true || name.includes("mock") || name.includes("jlpt") || name.includes("jft") || name.includes("nat") || (s.packageName && s.packageName.toLowerCase().includes("mock"));
            return isJp && !isKorean;
          });
          filterAndSetExamSets([...jpSets, ...customJpSets], finalPackages);
        } else {
          filterAndSetExamSets(savedSets, finalPackages);
        }
      });

    // Load past results from API and LocalStorage
    fetch("/api/student/exams")
      .then((res) => res.json())
      .then((data) => {
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

    if (isJapaneseTrack) {
      finalSets = finalSets.filter(s => {
        if (!s) return false;
        const name = (s.name || s.title || "").toLowerCase();
        const sType = (s.setType || "").toUpperCase();
        const isKorean = s.track === "korean" || sType === "UBT" || sType === "CHAPTERWISE" || name.includes("ubt") || name.includes("eps") || name.includes("chapter") || name.includes("topik") || name.includes("reading") || name.includes("listening");
        const isJp = s.track === "japanese" || sType === "MOCK" || s.isMock === true || name.includes("mock") || name.includes("jlpt") || name.includes("jft") || name.includes("nat");
        return isJp && !isKorean;
      });
    }

    setExamSets(finalSets);
    const defaultPackageName = isJapaneseTrack ? "Full Mock Test" : "Full Set UBT";
    if (finalSets.length > 0 && (!studentPackage || isShift(studentPackage) || (isJapaneseTrack && (studentPackage.toLowerCase().includes("ubt") || studentPackage.toLowerCase().includes("chapter"))))) {
      const bestPkg = finalSets.find((s) => s.packageName && !isShift(s.packageName))?.packageName || defaultPackageName;
      setStudentPackage(bestPkg);
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

  const sortedExamSets = [...examSets]
    .filter(s => {
      if (isJapaneseTrack) {
        if (!s) return false;
        const name = (s.name || s.title || "").toLowerCase();
        const sType = (s.setType || "").toUpperCase();
        const isKorean = s.track === "korean" || sType === "UBT" || sType === "CHAPTERWISE" || name.includes("ubt") || name.includes("eps") || name.includes("chapter") || name.includes("topik") || name.includes("reading") || name.includes("listening");
        const isJp = s.track === "japanese" || sType === "MOCK" || s.isMock === true || name.includes("mock") || name.includes("jlpt") || name.includes("jft") || name.includes("nat");
        return isJp && !isKorean;
      }
      return true;
    })
    .sort((a, b) => {
      const numA = parseInt((a.name || '').replace(/\D/g, '')) || 9999;
      const numB = parseInt((b.name || '').replace(/\D/g, '')) || 9999;
      return numA - numB;
    });

  const baseFilteredSets =
    selectedPackageFilter === "All" || purchasedPackages.length <= 1
      ? sortedExamSets
      : sortedExamSets.filter((s) => s.packageName === selectedPackageFilter);

  const filteredSets = examSetsSearch.trim()
    ? baseFilteredSets.filter((s) =>
        (s.name || '').toLowerCase().includes(examSetsSearch.toLowerCase()) ||
        (s.packageName || '').toLowerCase().includes(examSetsSearch.toLowerCase())
      )
    : baseFilteredSets;

  const totalExamPages = Math.ceil(filteredSets.length / SETS_PER_PAGE);
  const paginatedSets = filteredSets.slice((examSetsPage - 1) * SETS_PER_PAGE, examSetsPage * SETS_PER_PAGE);

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
    padding: "14px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    flexWrap: "wrap",
    gap: "14px",
    position: "sticky",
    top: 0,
    zIndex: 1000
  };

  const getNavBtnStyle = (tabName) => ({
    backgroundColor: activeTab === tabName ? "#2563eb" : "transparent",
    color: "#ffffff",
    border: "none",
    padding: "9px 16px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "15px",
    letterSpacing: "0.2px",
    transition: "0.2s"
  });

  const contentAreaStyle = { padding: "28px", maxWidth: "1200px", margin: "0 auto" };
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {logoWatermark && (
            <img src={logoWatermark} alt="Institute Logo" style={{ height: "32px", borderRadius: "4px", backgroundColor: "#ffffff", padding: "2px" }} />
          )}
          <div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff" }}>
              STUDENT PORTAL
            </div>
            <div style={{ fontSize: "12px", color: "#93c5fd" }}>
              {studentName} {studentInstitute ? `• ${studentInstitute}` : ""}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setActiveTab("home")} style={getNavBtnStyle("home")}>Dashboard</button>
          <button onClick={() => setActiveTab("exams")} style={getNavBtnStyle("exams")}>
            {instituteLanguage === "japanese" ? "Mock Test" : "Start UBT Exam"}
          </button>
          <button onClick={() => setActiveTab("buyExam")} style={getNavBtnStyle("buyExam")}>
            {instituteLanguage === "japanese" ? "Mock Test Packages" : "Packages"}
          </button>
          <button onClick={() => setActiveTab("vocab")} style={getNavBtnStyle("vocab")}>Dictionary</button>
          <button onClick={() => setActiveTab("listening")} style={getNavBtnStyle("listening")}>Study Materials</button>
          <button onClick={() => setActiveTab("news")} style={getNavBtnStyle("news")}>Notice</button>
          <button onClick={() => setActiveTab("notify")} style={getNavBtnStyle("notify")}>Messages</button>
          <button onClick={() => setActiveTab("results")} style={getNavBtnStyle("results")}>Performance</button>
        </div>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc2626",
            color: "#ffffff",
            border: "none",
            padding: "9px 18px",
            borderRadius: "7px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "14px"
          }}
        >
          Logout
        </button>
      </div>

      <div style={contentAreaStyle}>
        {/* DASHBOARD TAB */}
        {activeTab === "home" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "26px" }}>
              <h2 style={{ color: "#0f172a", margin: "0", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                Welcome, {studentName}
              </h2>
              {!hasPaidExamAccess ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "12px", padding: "6px 18px", backgroundColor: "#f0fdf4", borderRadius: "20px", border: "1px solid #bbf7d0" }}>
                  <span style={{ fontSize: "12px", color: "#166534", fontWeight: "700" }}>
                    Account Validity: <strong style={{ color: "#15803d" }}>Lifetime</strong>
                  </span>
                  <span style={{ color: "#cbd5e1" }}>•</span>
                  <span style={{ fontSize: "12px", color: "#b45309", fontWeight: "700" }}>
                    {instituteLanguage === "japanese" ? "Mock Tests: " : "UBT & Mock Tests: "}
                    <strong style={{ color: "#d97706" }}>Purchase Required</strong>
                  </span>
                </div>
              ) : (
                effectiveExpiryDate && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "12px", padding: "6px 16px", backgroundColor: isPackageExpired ? "#fee2e2" : "#f8fafc", borderRadius: "20px", border: isPackageExpired ? "1px solid #fca5a5" : "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "12px", color: isPackageExpired ? "#991b1b" : "#475569", fontWeight: "600" }}>
                      Package: <strong style={{ color: isPackageExpired ? "#dc2626" : "#1e3a8a" }}>{effectivePackageName}</strong>
                    </span>
                    <span style={{ color: "#cbd5e1" }}>•</span>
                    <span style={{ fontSize: "12px", color: isPackageExpired ? "#991b1b" : "#475569", fontWeight: "600" }}>
                      Package Expiry Date: <strong style={{ color: isPackageExpired ? "#dc2626" : "#047857" }}>{effectiveExpiryDate}</strong>
                    </span>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: isPackageExpired ? "#b91c1c" : "#166534",
                      backgroundColor: isPackageExpired ? "#fecaca" : "#dcfce7",
                      padding: "2px 8px",
                      borderRadius: "10px"
                    }}>
                      {isPackageExpired ? "Expired" : "Active"}
                    </span>
                  </div>
                )
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", maxWidth: "1050px", margin: "0 auto" }}>
              <div onClick={() => {
                setActiveTab("exams");
              }} style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", borderRadius: "16px", padding: "30px 20px", textAlign: "center", cursor: "pointer", border: "1px solid #bfdbfe", boxShadow: "0 4px 12px rgba(37,99,235,0.08)" }}>
                <div style={{ width: "64px", height: "64px", background: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                  <LaptopExamIcon size={28} color="#2563eb" />
                </div>
                <h3 style={{ margin: "0 0 4px 0", color: "#1e3a8a", fontSize: "18px", fontWeight: "700" }}>
                  {hasPaidExamAccess
                    ? (instituteLanguage === "japanese" ? "Start Mock Test" : "Start UBT Exam")
                    : (unlockedSets.length > 0
                        ? (instituteLanguage === "japanese" ? "Start Mock Test (Active)" : "Start UBT Exam (Active)")
                        : (instituteLanguage === "japanese" ? "Start Mock Test" : "Start UBT Exam"))}
                </h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                  {hasPaidExamAccess
                    ? (instituteLanguage === "japanese" ? "Take full Japanese CBT mock tests (JFT-Basic / NAT-TEST / JLPT)" : "Take full 40-question EPS-TOPIK Korean tests")
                    : unlockedSets.length > 0
                    ? `${unlockedSets.length} Set(s) Unlocked · Click to practice or unlock more (Rs. 40 each)`
                    : (instituteLanguage === "japanese" ? "Japanese Mock Tests · Unlock sets for Rs. 40 each" : "UBT & Mock Tests · Unlock sets for Rs. 40 each")}
                </p>
              </div>

              <div onClick={() => setActiveTab("results")} style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", borderRadius: "16px", padding: "30px 20px", textAlign: "center", cursor: "pointer", border: "1px solid #bbf7d0", boxShadow: "0 4px 12px rgba(22,163,74,0.08)" }}>
                <div style={{ width: "64px", height: "64px", background: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                  <BarChartIcon size={28} color="#16a34a" />
                </div>
                <h3 style={{ margin: "0 0 4px 0", color: "#166534", fontSize: "18px", fontWeight: "700" }}>Your Performance</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Inspect past scores, accuracy, and logs</p>
              </div>

              <div onClick={() => setActiveTab("listening")} style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", borderRadius: "16px", padding: "30px 20px", textAlign: "center", cursor: "pointer", border: "1px solid #fcd34d", boxShadow: "0 4px 12px rgba(217,119,6,0.08)" }}>
                <div style={{ width: "64px", height: "64px", background: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                  <BookStackIcon size={28} color="#d97706" />
                </div>
                <h3 style={{ margin: "0 0 4px 0", color: "#92400e", fontSize: "18px", fontWeight: "700" }}>Study Materials</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                  {instituteLanguage === "japanese" ? "Japanese Textbooks, Question Banks & Grammar" : instituteLanguage === "korean" ? "Korean Textbooks, Question Banks & Grammar" : "Korean & Japanese Textbooks, Question Banks & Grammar"}
                </p>
              </div>

              <div onClick={() => setActiveTab("vocab")} style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", borderRadius: "16px", padding: "30px 20px", textAlign: "center", cursor: "pointer", border: "1px solid #ddd6fe", boxShadow: "0 4px 12px rgba(124,58,237,0.08)" }}>
                <div style={{ width: "64px", height: "64px", background: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                  <BookOpenIcon size={28} color="#7c3aed" />
                </div>
                <h3 style={{ margin: "0 0 4px 0", color: "#5b21b6", fontSize: "18px", fontWeight: "700" }}>Dictionary</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                  {instituteLanguage === "japanese" ? "Japanese, Nepali, and English vocabulary lookup" : instituteLanguage === "korean" ? "Korean, Nepali, and English vocabulary lookup" : "Korean & Japanese vocabulary lookup with pronunciation"}
                </p>
              </div>

              {instituteLanguage !== "japanese" && (
                <div onClick={() => setActiveTab("buyExam")} style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", borderRadius: "16px", padding: "30px 20px", textAlign: "center", cursor: "pointer", border: "1px solid #fed7aa", boxShadow: "0 4px 12px rgba(234,88,12,0.08)" }}>
                  <div style={{ width: "64px", height: "64px", background: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                    <CartIcon size={28} color="#ea580c" />
                  </div>
                  <h3 style={{ margin: "0 0 4px 0", color: "#9a3412", fontSize: "18px", fontWeight: "700" }}>Packages</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Explore and request custom exam sets</p>
                </div>
              )}

              <div onClick={() => setActiveTab("notify")} style={{ background: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)", borderRadius: "16px", padding: "30px 20px", textAlign: "center", cursor: "pointer", border: "1px solid #99f6e4", boxShadow: "0 4px 12px rgba(13,148,136,0.08)" }}>
                <div style={{ width: "64px", height: "64px", background: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                  <BellIcon size={28} color="#0d9488" />
                </div>
                <h3 style={{ margin: "0 0 4px 0", color: "#115e59", fontSize: "18px", fontWeight: "700" }}>Notify Admin</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Send inquiries directly to institute administration</p>
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

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <h3 style={{ color: "#0f172a", margin: 0, fontSize: "20px", fontWeight: "800" }}>
                {instituteLanguage === "japanese" ? "Available Japanese Mock Tests" : "Available UBT Exam Sets"}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", backgroundColor: "#eff6ff", padding: "4px 10px", borderRadius: "6px" }}>
                  {filteredSets.length} Sets Ready
                </span>
                <input
                  type="text"
                  placeholder={instituteLanguage === "japanese" ? "Search mock test (e.g. N5, JFT, SET 01)" : "Search set (e.g. SET 05)"}
                  value={examSetsSearch}
                  onChange={(e) => { setExamSetsSearch(e.target.value); setExamSetsPage(1); }}
                  style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", outline: "none", width: "200px" }}
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
              initialFolder={activeTab === "japaneseMock" ? "Mock Test" : undefined}
              onNavigateTab={(tab) => setActiveTab(tab)}
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
                      Active Category: <strong style={{ color: effectiveFilter === "japanese" ? "#9333ea" : effectiveFilter === "korean" ? "#2563eb" : "#0f172a" }}>
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
                          backgroundColor: (effectiveFilter === tab.key) ? (tab.key === "japanese" ? "#9333ea" : tab.key === "korean" ? "#2563eb" : "#1e293b") : "transparent",
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
        {activeTab === "buyExam" && (
          <div>
            <h3 style={{ color: "#0f172a", marginTop: 0, marginBottom: "20px", fontSize: "20px", fontWeight: "800" }}>
              {instituteLanguage === "japanese" ? "Available Japanese Mock Test Packages" : "Available Exam Packages"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {examPackages.map((pkg, idx) => (
                <div key={pkg.id || idx} style={{ backgroundColor: "#ffffff", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: instituteLanguage === "japanese" ? "#7e22ce" : "#2563eb", background: instituteLanguage === "japanese" ? "#faf5ff" : "#eff6ff", border: instituteLanguage === "japanese" ? "1px solid #e9d5ff" : "1px solid #bfdbfe", padding: "3px 8px", borderRadius: "4px" }}>
                      {instituteLanguage === "japanese" ? "MOCK TEST PACKAGE" : "UBT PACKAGE"}
                    </span>
                    <h4 style={{ margin: "14px 0 8px 0", fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>{pkg.name}</h4>
                    <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5", marginBottom: pkg.includedSets?.length ? "10px" : "18px" }}>
                      {pkg.desc || (instituteLanguage === "japanese" ? "Full simulated Japanese mock test sets with audio and timer." : "Full simulated exam practice sets with Korean audio and timer.")}
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
              ))}
            </div>
          </div>
        )}

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
      </div>

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