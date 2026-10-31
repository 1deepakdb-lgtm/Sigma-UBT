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

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { performLogout } from "@/lib/clientAuth";
import PdfQuestionUploadModal from "@/components/PdfQuestionUploadModal";
import { JLPT_MOCK_SETS_META } from "@/data/jlptMockTestData";

function InstituteQuestionManagerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [instituteName, setInstituteName] = useState("Language Institute");
  const [instId, setInstId] = useState(null);
  const [instituteLanguage, setInstituteLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      const qLang = new URLSearchParams(window.location.search).get("lang");
      return qLang || localStorage.getItem("instituteLanguage") || "korean";
    }
    return "korean";
  });
  const isJapanese = instituteLanguage === "japanese";

  // Active navigation tab: "mySets" | "createSet" | "uploadQuestions" | "createPackage" | "sharedSets"
  const [activeTab, setActiveTab] = useState("mySets");

  const [packages, setPackages] = useState([]);
  const [allSets, setAllSets] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Create Set Form state
  const [newSetName, setNewSetName] = useState("");
  const [newSetPackage, setNewSetPackage] = useState(() => (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lang") === "japanese" ? "Full Mock Test" : "Full Set UBT"));
  const [newSetAutoInit, setNewSetAutoInit] = useState(true);
  const [newSetIsPublic, setNewSetIsPublic] = useState(false);

  // Question editing / uploading state
  const [filterPackage, setFilterPackage] = useState("");
  const [filterSet, setFilterSet] = useState("");
  const [questionListType, setQuestionListType] = useState("Reading"); // "Reading" | "Listening"
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [qNumber, setQNumber] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [audioDragOver, setAudioDragOver] = useState(false);

  // Viewing set questions in table below Set List
  const [viewingSet, setViewingSet] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  // Bulk import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [bulkJsonInput, setBulkJsonInput] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");

  // Create Package state
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState("Rs. 2,000");
  const [newPkgDuration, setNewPkgDuration] = useState("1 Month");
  const [newPkgDesc, setNewPkgDesc] = useState("");
  const [selectedSetsForPkg, setSelectedSetsForPkg] = useState([]);

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

  // 1. Initialize Institute Identity from URL or LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const qInst = searchParams?.get("institute");
      const qInstId = searchParams?.get("instId");
      const qTab = searchParams?.get("tab");
      const qSet = searchParams?.get("set");
      const qLang = searchParams?.get("lang");

      const name = qInst ? decodeURIComponent(qInst) : (localStorage.getItem("currentInstitute") || "Language Institute");
      setInstituteName(name);
      if (qInstId) setInstId(qInstId);

      const savedLang = localStorage.getItem("instituteLanguage") || "korean";
      const finalLang = qLang || savedLang;
      setInstituteLanguage(finalLang);

      if (finalLang === "japanese" && (!newSetPackage || newSetPackage === "Full Set UBT")) {
        setNewSetPackage("Full Mock Test");
      }

      if (qTab && ["mySets", "createSet", "uploadQuestions", "createPackage", "sharedSets"].includes(qTab)) {
        setActiveTab(qTab);
      }
      if (qSet) {
        setFilterSet(qSet.toUpperCase());
        setActiveTab("uploadQuestions");
      }
    }
  }, [searchParams]);

  // 2. Load sets, packages, and questions with Institute Isolation
  const loadData = () => {
    try {
      const defaultPkgs = isJapanese ? [
        { id: 1, name: "Full Mock Test" },
        { id: 2, name: "JFT-Basic Mock Test" },
        { id: 3, name: "NAT-TEST Mock Test" },
        { id: 4, name: "JLPT Mock Test" }
      ] : [
        { id: 1, name: "Full Set UBT" },
        { id: 2, name: "30 Set Chapter UBT" },
        { id: 3, name: "100 UBT set" }
      ];

      const rawPackages = safeJsonParse(localStorage.getItem("examPackages"), defaultPkgs);
      let savedPackages = rawPackages;
      if (isJapanese) {
        savedPackages = rawPackages.filter(p => {
          if (!p) return false;
          const name = (p.name || "").toLowerCase();
          const type = (p.type || "").toLowerCase();
          const isKorean = p.track === "korean" || name.includes("ubt") || name.includes("chapter") || name.includes("eps") || name.includes("topik") || type.includes("ubt") || type.includes("chapter");
          const isJp = p.track === "japanese" || name.includes("mock") || name.includes("jft") || name.includes("jlpt") || name.includes("nat") || type.includes("mock");
          return isJp && !isKorean;
        });
        if (savedPackages.length === 0) savedPackages = defaultPkgs;
      }

      const rawSets = safeJsonParse(localStorage.getItem("examSets"), []);
      const savedSets = rawSets.filter(s => {
        if (!s) return false;
        if (isJapanese) {
          const name = (s.name || s.title || "").toLowerCase();
          const sType = (s.setType || "").toUpperCase();
          const isKorean = s.track === "korean" || sType === "UBT" || sType === "CHAPTERWISE" || name.includes("ubt") || name.includes("eps") || name.includes("chapter") || name.includes("topik") || name.includes("reading") || name.includes("listening");
          const isJp = s.track === "japanese" || sType === "MOCK" || s.isMock === true || name.includes("mock") || name.includes("jlpt") || name.includes("jft") || name.includes("nat");
          if (isKorean || !isJp) return false;
        }
        return (
          s.isPublished === true ||
          (!s.creatorInstituteName && s.isPrivate !== true) ||
          (s.creatorInstituteName && s.creatorInstituteName.toLowerCase() === instituteName.toLowerCase()) ||
          (instId && s.creatorInstituteId === instId)
        );
      });
      const savedQuestions = safeJsonParse(localStorage.getItem("questionBank"), []);

      // Build Japanese Mock Exam Sets from JLPT_MOCK_SETS_META
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

      const seen = new Set();
      const mergedSets = [];
      [...savedSets, ...(isJapanese ? jpMockSets : [])].forEach(s => {
        if (!s) return;
        const key = (s.name || s.id || "").toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          mergedSets.push(s);
        }
      });

      setPackages(savedPackages);
      setAllSets(mergedSets);
      setQuestions(savedQuestions);

      const defaultPackageName = isJapanese ? "Full Mock Test" : "Full Set UBT";

      // Filter sets belonging to this institute
      const myInstituteSets = savedSets.filter(s =>
        s && (
          (s.creatorInstituteName && s.creatorInstituteName.toLowerCase() === instituteName.toLowerCase()) ||
          (instId && s.creatorInstituteId === instId)
        )
      );

      if (myInstituteSets.length > 0 && !filterSet) {
        setFilterSet(myInstituteSets[0].name);
        setFilterPackage(myInstituteSets[0].packageName || savedPackages[0]?.name || defaultPackageName);
      } else if (savedSets.length > 0 && !filterSet) {
        setFilterSet(savedSets[0].name);
        setFilterPackage(savedSets[0].packageName || defaultPackageName);
      }
    } catch (err) {
      console.error("Error loading institute question bank data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [instituteName, instId, instituteLanguage]);

  // Sets created by this institute (Private Bucket)
  const mySets = allSets.filter(s =>
    s && (
      (s.creatorInstituteName && s.creatorInstituteName.toLowerCase() === instituteName.toLowerCase()) ||
      (instId && s.creatorInstituteId === instId)
    )
  );

  // Global sets published by Super Admin
  const globalSharedSets = allSets.filter(s =>
    s && (s.isPublished === true || (!s.creatorInstituteName && s.isPrivate !== true))
  );

  // Questions in currently selected set
  const cleanFilterSet = (filterSet || "").trim().toUpperCase();
  const currentSetQuestions = questions.filter(
    q => q && ((q.set || "").trim().toUpperCase() === cleanFilterSet || q.setId === filterSet)
  );

  // Set currently selected for viewing below Set List
  const effectiveViewingSet = viewingSet || filterSet || (mySets[0]?.name || "");
  const viewingSetUpper = (effectiveViewingSet || "").trim().toUpperCase();
  const viewingQuestions = questions
    .filter(q => q && (q.set || "").trim().toUpperCase() === viewingSetUpper)
    .sort((a, b) => {
      const numA = Number(a.qIndex || a.questionHeading) || 0;
      const numB = Number(b.qIndex || b.questionHeading) || 0;
      return numA - numB;
    });
  const viewingReadingCount = viewingQuestions.filter(q => q.type === "Reading" || (Number(q.qIndex || q.questionHeading) <= 20)).length;
  const viewingListeningCount = viewingQuestions.filter(q => q.type === "Listening" || (Number(q.qIndex || q.questionHeading) > 20)).length;

  // Calculate question counts for any set
  const getSetCounts = (setObj) => {
    if (!setObj) return { reading: 0, listening: 0, total: 0, isComplete: false };
    const sNameUpper = (setObj.name || "").trim().toUpperCase();
    const matched = questions.filter(
      q => q && ((q.set || "").trim().toUpperCase() === sNameUpper || q.setId === setObj.id)
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

  // Handle Question Number Change
  const handleQNumberChange = (num) => {
    setQNumber(num);
    const autoType = num <= 20 ? "Reading" : "Listening";
    setQuestionListType(autoType);

    // Check if question already exists in this slot
    const existing = currentSetQuestions.find(
      q => Number(q.questionHeading) === num || Number(q.qIndex) === num
    );

    if (existing) {
      setEditingQuestionId(existing.id);
      const formattedOptions = (existing.options || ["", "", "", ""]).map(opt => {
        if (typeof opt === "string") return { text: opt, audio: "", image: "", video: "" };
        return {
          text: opt.text || "",
          audio: opt.audio || "",
          image: opt.image || "",
          video: opt.video || ""
        };
      });

      setQForm({
        mainHeading: existing.mainHeading || (autoType === "Reading" ? `[ ${num} ] 다음을 읽고 알맞은 것을 고르십시오.` : `[ ${num} ] 이야기를 듣고 알맞은 것을 고르십시오.`),
        questionHeading: String(num),
        description: existing.description || "",
        image: existing.image || "",
        audio: existing.audio || "",
        options: formattedOptions,
        answer: existing.answer !== undefined ? existing.answer : 0
      });
    } else {
      setEditingQuestionId(null);
      setQForm({
        mainHeading: autoType === "Reading" ? `[ ${num} ] 다음을 읽고 알맞은 것을 고르십시오.` : `[ ${num} ] 이야기를 듣고 알맞은 것을 고르십시오.`,
        questionHeading: String(num),
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
    }
  };

  // Convert File to Data URL
  const processFileToDataURL = (file, setter) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setter(e.target.result);
      reader.readAsDataURL(file);
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

  // Underline Text in Option Input
  const applyUnderline = (idx) => {
    const inputEl = inputRefs.current[idx];
    if (!inputEl) return;

    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    const currentText = qForm.options[idx].text || "";

    if (start === null || end === null || start === end) {
      alert("Please select text inside the option box to apply underline.");
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

  // 1. CREATE NEW SET IN INSTITUTE PRIVATE BUCKET
  const handleCreatePrivateSet = async (e) => {
    e.preventDefault();
    const cleanName = newSetName.trim().toUpperCase();
    if (!cleanName) {
      alert("Please enter a valid set name.");
      return;
    }

    // Check if name already exists in this institute
    if (allSets.some(s => s.name === cleanName && s.creatorInstituteName === instituteName)) {
      alert(`A set named "${cleanName}" already exists in your institute's bucket.`);
      return;
    }

    const isPublic = Boolean(newSetIsPublic);
    const defaultPackageName = isJapanese ? "Full Mock Test" : "Full Set UBT";
    const newSetObj = {
      id: `inst-${Date.now()}`,
      name: cleanName,
      packageName: newSetPackage || defaultPackageName,
      setType: isJapanese ? "MOCK" : "UBT",
      track: isJapanese ? "japanese" : "korean",
      duration: 3000,
      creatorInstituteId: instId || null,
      creatorInstituteName: instituteName,
      isPrivate: !isPublic,        // Strictly private if not public
      isPublished: isPublic,       // Published to other institutes if checked
      createdAt: new Date().toISOString()
    };

    // Auto-initialize 40 questions template if checked
    let initialBatch = [];
    if (newSetAutoInit) {
      for (let i = 1; i <= 40; i++) {
        const isReading = i <= 20;
        initialBatch.push({
          id: Date.now() + i + Math.random(),
          package: newSetPackage || defaultPackageName,
          set: cleanName,
          qIndex: i,
          type: isReading ? "Reading" : "Listening",
          mainHeading: isReading
            ? (isJapanese ? `[ ${i} ] 次の文章を読んで、正しいものを一つ選びなさい。` : `[ ${i} ] 다음을 읽고 알맞은 것을 고르십시오.`)
            : (isJapanese ? `[ ${i} ] 音声を聞いて、正しいものを一つ選びなさい。` : `[ ${i} ] 이야기를 듣고 알맞은 것을 고르십시오.`),
          questionHeading: String(i),
          description: "",
          image: "",
          audio: "",
          options: [
            { text: `Option 1`, audio: "", image: "", video: "" },
            { text: `Option 2`, audio: "", image: "", video: "" },
            { text: `Option 3`, audio: "", image: "", video: "" },
            { text: `Option 4`, audio: "", image: "", video: "" }
          ],
          answer: 0,
          creatorInstituteName: instituteName
        });
      }
    }

    // 1. Sync to SQLite DB via API
    try {
      await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_set",
          setName: cleanName,
          packageName: newSetPackage || defaultPackageName,
          duration: 3000,
          setType: isJapanese ? "MOCK" : "UBT",
          track: isJapanese ? "japanese" : "korean",
          creatorInstituteId: instId,
          creatorInstituteName: instituteName,
          isPrivate: !isPublic,
          isPublished: isPublic
        })
      });
    } catch (err) {
      console.warn("DB set creation fallback to local:", err);
    }

    // 2. Save in localStorage
    const updatedSets = [...allSets, newSetObj];
    const updatedQuestions = [...questions, ...initialBatch];

    setAllSets(updatedSets);
    setQuestions(updatedQuestions);

    localStorage.setItem("examSets", JSON.stringify(updatedSets));
    localStorage.setItem("questionBank", JSON.stringify(updatedQuestions));

    setNewSetName("");
    setNewSetIsPublic(false);
    setFilterSet(cleanName);
    setFilterPackage(newSetPackage || defaultPackageName);
    setActiveTab("uploadQuestions");
    handleQNumberChange(1);

    const term = isJapanese ? "Mock Test" : "UBT Set";
    alert(isPublic
      ? `${term} "${cleanName}" created and PUBLISHED globally for all institutes and students!`
      : `${term} "${cleanName}" created successfully in your private bucket!\n\nOther institutes cannot access these questions. You can now edit all 40 questions.`
    );
  };

  // Toggle institute set publication between Public (all institutes) and Private (own bucket)
  const handleToggleInstitutePublish = async (setObj) => {
    const nextPublished = !setObj.isPublished;
    try {
      await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_set",
          setName: setObj.name,
          packageName: setObj.packageName,
          duration: setObj.duration || 3000,
          setType: setObj.setType || "UBT",
          creatorInstituteId: instId,
          creatorInstituteName: instituteName,
          isPrivate: !nextPublished,
          isPublished: nextPublished
        })
      });
    } catch (e) {
      console.warn("Could not sync publish toggle to DB:", e);
    }

    const updated = allSets.map(s =>
      (s.id === setObj.id || s.name === setObj.name)
        ? { ...s, isPublished: nextPublished, isPrivate: !nextPublished }
        : s
    );
    setAllSets(updated);
    localStorage.setItem("examSets", JSON.stringify(updated));
    alert(nextPublished
      ? `Set "${setObj.name}" is now PUBLISHED for all institutes and students across the platform!`
      : `Set "${setObj.name}" is now PRIVATE to ${instituteName}. Other institutes cannot see or access it.`
    );
  };

  // 2. SAVE QUESTION HANDLER
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!filterSet) {
      alert("Please select a target exam set first.");
      return;
    }

    const normalizedOptions = qForm.options.map(opt => ({
      text: opt.text || "",
      audio: opt.audio || "",
      image: opt.image || "",
      video: opt.video || ""
    }));

    const questionPayload = {
      ...qForm,
      options: normalizedOptions,
      package: filterPackage,
      set: cleanFilterSet,
      qIndex: Number(qNumber),
      type: questionListType,
      creatorInstituteName: instituteName
    };

    let updatedQuestions;
    if (editingQuestionId) {
      updatedQuestions = questions.map(q => q.id === editingQuestionId ? { ...q, ...questionPayload } : q);
      setEditingQuestionId(null);
    } else {
      const existingIdx = questions.findIndex(
        q => (q.set || "").trim().toUpperCase() === cleanFilterSet && Number(q.qIndex) === Number(qNumber)
      );

      if (existingIdx !== -1) {
        updatedQuestions = [...questions];
        updatedQuestions[existingIdx] = {
          ...updatedQuestions[existingIdx],
          ...questionPayload,
          id: updatedQuestions[existingIdx].id || Date.now()
        };
      } else {
        const newId = Date.now();
        updatedQuestions = [...questions, { id: newId, ...questionPayload }];
      }
    }

    setQuestions(updatedQuestions);
    localStorage.setItem("questionBank", JSON.stringify(updatedQuestions));

    // Auto advance to next question
    if (qNumber < 40) {
      handleQNumberChange(qNumber + 1);
    } else {
      alert(`Question #${qNumber} saved successfully! All 40 questions in ${cleanFilterSet} are up to date.`);
    }
  };

  // Edit question directly from table below set list
  const handleEditQuestion = (q) => {
    setFilterSet(q.set);
    if (q.package) setFilterPackage(q.package);
    setEditingQuestionId(q.id);
    const num = Number(q.qIndex || q.questionHeading) || 1;
    setQNumber(num);
    const autoType = q.type || (num <= 20 ? "Reading" : "Listening");
    setQuestionListType(autoType);

    const formattedOptions = (q.options || ["", "", "", ""]).map(opt => {
      if (typeof opt === "string") return { text: opt, audio: "", image: "", video: "" };
      return {
        text: opt?.text || "",
        audio: opt?.audio || "",
        image: opt?.image || "",
        video: opt?.video || ""
      };
    });

    setQForm({
      mainHeading: q.mainHeading || (autoType === "Reading" ? `[ ${num} ] 다음을 읽고 알맞은 것을 고르십시오.` : `[ ${num} ] 이야기를 듣고 알맞은 것을 고르십시오.`),
      questionHeading: String(num),
      description: q.description || "",
      image: q.image || "",
      audio: q.audio || "",
      options: formattedOptions,
      answer: q.answer !== undefined ? q.answer : 0
    });

    setActiveTab("uploadQuestions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete question directly from table below set list
  const handleDeleteSingleQuestion = (id, qNum) => {
    if (window.confirm(`Are you sure you want to delete Question #${qNum}?`)) {
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      localStorage.setItem("questionBank", JSON.stringify(updated));
    }
  };

  // 3. DELETE SET
  const handleDeleteSet = async (setId, sName) => {
    const term = isJapanese ? "Mock Test" : "UBT Set";
    if (!window.confirm(`Delete ${term} "${sName}" and all its questions from your institute's bucket?`)) {
      return;
    }

    try {
      await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_set", setId })
      });
    } catch (err) {
      console.warn("API delete fallback:", err);
    }

    const updatedSets = allSets.filter(s => s.id !== setId && s.name !== sName);
    const updatedQuestions = questions.filter(q => (q.set || "").trim().toUpperCase() !== sName.trim().toUpperCase());

    setAllSets(updatedSets);
    setQuestions(updatedQuestions);
    localStorage.setItem("examSets", JSON.stringify(updatedSets));
    localStorage.setItem("questionBank", JSON.stringify(updatedQuestions));

    alert(`${term} "${sName}" removed from your private bucket.`);
  };

  // 4. CREATE INSTITUTE CUSTOM PACKAGE
  const handleSavePackage = (e) => {
    e.preventDefault();
    const pkgName = newPkgName.trim();
    if (!pkgName) {
      alert("Please enter a package name.");
      return;
    }

    const newPkg = {
      id: Date.now(),
      name: pkgName,
      price: newPkgPrice || "Rs. 2,000",
      duration: newPkgDuration || "1 Month",
      desc: newPkgDesc || `Custom ${isJapanese ? "Mock Test" : "UBT"} Package created by ${instituteName}`,
      isCustom: true,
      createdBy: instituteName,
      creatorInstituteName: instituteName,
      track: isJapanese ? "japanese" : "korean",
      includedSets: selectedSetsForPkg,
      createdAt: new Date().toISOString()
    };

    const updatedPkgs = [...packages, newPkg];
    setPackages(updatedPkgs);
    localStorage.setItem("examPackages", JSON.stringify(updatedPkgs));

    setNewPkgName("");
    setNewPkgDesc("");
    setSelectedSetsForPkg([]);

    alert(`Package "${pkgName}" created successfully!\n\nYou can now assign this package to students in Manage Students.`);
  };

  // 5. BULK JSON IMPORT
  const handleBulkImport = () => {
    try {
      if (!bulkJsonInput.trim()) return;
      const parsed = JSON.parse(bulkJsonInput);
      if (!Array.isArray(parsed)) {
        setBulkStatus("Error: JSON must be an array of questions.");
        return;
      }

      const formatted = parsed.map((item, idx) => {
        const qNum = item.qIndex || item.questionHeading || idx + 1;
        const qType = Number(qNum) <= 20 ? "Reading" : (item.type || "Listening");
        return {
          id: Date.now() + idx + Math.random(),
          package: filterPackage,
          set: cleanFilterSet,
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
          answer: item.answer !== undefined ? Number(item.answer) : 0,
          creatorInstituteName: instituteName
        };
      });

      const filtered = questions.filter(q => (q.set || "").trim().toUpperCase() !== cleanFilterSet);
      const updated = [...filtered, ...formatted];
      setQuestions(updated);
      localStorage.setItem("questionBank", JSON.stringify(updated));

      setShowBulkModal(false);
      setBulkJsonInput("");
      setBulkStatus("");
      alert(`Imported ${formatted.length} questions into set "${cleanFilterSet}"!`);
    } catch (err) {
      setBulkStatus("Error parsing JSON: " + err.message);
    }
  };

  // 6. PDF QUESTION IMPORT HANDLER
  const handlePdfImportSuccess = async (finalQuestions, targetSetName, targetPkgName) => {
    const cleanSet = (targetSetName || cleanFilterSet).trim().toUpperCase();

    // Attach institute name to ensure private bucket isolation
    const isolatedQuestions = finalQuestions.map(q => ({
      ...q,
      creatorInstituteName: instituteName,
      package: targetPkgName || filterPackage,
      set: cleanSet
    }));

    const filtered = questions.filter(q => (q.set || "").trim().toUpperCase() !== cleanSet);
    const updated = [...filtered, ...isolatedQuestions];
    setQuestions(updated);
    localStorage.setItem("questionBank", JSON.stringify(updated));

    const targetSetObj = allSets.find(s => (s.name || "").trim().toUpperCase() === cleanSet);
    if (targetSetObj?.id) {
      try {
        await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examSetId: targetSetObj.id,
            overwrite: true,
            bulkQuestions: isolatedQuestions
          })
        });
      } catch (err) {
        console.warn("Backend institute bulk save notice:", err);
      }
    }

    setFilterSet(cleanSet);
    if (targetPkgName) setFilterPackage(targetPkgName);
    alert(`Successfully imported 40 questions from PDF into your private bucket for "${cleanSet}"!`);
  };

  // Styles
  const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    marginBottom: "20px",
    border: "1px solid #e2e8f0"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff"
  };

  const primaryBtnStyle = {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(37,99,235,0.2)"
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
      {/* TOP NAVIGATION BAR */}
      <div style={{
        backgroundColor: "#1e3a8a",
        color: "#ffffff",
        padding: "14px 26px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        flexWrap: "wrap",
        gap: "12px",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "17px", fontWeight: "bold" }}>
            {isJapanese ? "CREATE MOCK TEST - PRIVATE BUCKET" : "CREATE UBT SET - PRIVATE BUCKET"}
          </span>
          <span style={{
            fontSize: "12px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "3px 10px",
            borderRadius: "12px",
            fontWeight: "bold"
          }}>
            {instituteName}
          </span>
          <span style={{
            fontSize: "11px",
            backgroundColor: "#065f46",
            color: "#a7f3d0",
            border: "1px solid #047857",
            padding: "2px 8px",
            borderRadius: "10px",
            fontWeight: "bold"
          }}>
            Isolated & Private
          </span>

          {/* Quick Track Switcher */}
          <div style={{ display: "inline-flex", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "2px" }}>
            <button
              type="button"
              onClick={() => {
                setInstituteLanguage("korean");
                if (typeof window !== "undefined") localStorage.setItem("instituteLanguage", "korean");
              }}
              style={{
                backgroundColor: !isJapanese ? "#ffffff" : "transparent",
                color: !isJapanese ? "#1e3a8a" : "#cbd5e1",
                border: "none",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              🇰🇷 Korean UBT
            </button>
            <button
              type="button"
              onClick={() => {
                setInstituteLanguage("japanese");
                if (typeof window !== "undefined") localStorage.setItem("instituteLanguage", "japanese");
                if (newSetPackage === "Full Set UBT") setNewSetPackage("Full Mock Test");
              }}
              style={{
                backgroundColor: isJapanese ? "#ffffff" : "transparent",
                color: isJapanese ? "#7e22ce" : "#cbd5e1",
                border: "none",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              🇯🇵 Japanese Mock Test
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            href={`/institute?tab=students&institute=${encodeURIComponent(instituteName)}${instId ? `&instId=${instId}` : ""}`}
            style={{
              textDecoration: "none",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              padding: "7px 14px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "bold",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            ← Back to Manage Students
          </Link>
          <button
            onClick={() => performLogout()}
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              padding: "7px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "24px auto", padding: "0 20px" }}>
        {/* PRIVATE BUCKET PRIVACY NOTICE BANNER */}
        <div style={{
          backgroundColor: "#eff6ff",
          border: "1.5px solid #bfdbfe",
          borderRadius: "8px",
          padding: "14px 18px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div>
            <div style={{ fontWeight: "bold", color: "#1e40af", fontSize: "14px", marginBottom: "3px" }}>
              Private Institute Question Bucket Policy
            </div>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#334155", lineHeight: "1.5" }}>
              • All {isJapanese ? "mock test sets" : "UBT sets"} and questions created in this section belong exclusively to <strong>{instituteName}</strong>.<br />
              • <strong>Other institutes CANNOT access or view your private questions</strong>.<br />
              • You can create custom packages from your own questions for your students.<br />
              • Super Admin stores sets separately and has authority to review and publish questions globally if approved.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{
              backgroundColor: "#dcfce7",
              color: "#166534",
              border: "1px solid #86efac",
              padding: "4px 10px",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "12px"
            }}>
              {mySets.length} Private Sets
            </span>
            <span style={{
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              padding: "4px 10px",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "12px"
            }}>
              {globalSharedSets.length} Global Sets
            </span>
          </div>
        </div>

        {/* PRIMARY TAB NAVIGATION */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {[
            { key: "mySets", label: isJapanese ? `My Mock Tests (${mySets.length})` : `My UBT Sets (${mySets.length})` },
            { key: "createSet", label: isJapanese ? "+ Create Mock Test" : "+ Create New UBT Set" },
            { key: "uploadQuestions", label: "Upload / Edit Questions (40 Qs)" },
            { key: "createPackage", label: isJapanese ? "+ Create Mock Test Package" : "+ Create Custom Package" },
            { key: "sharedSets", label: `Global Shared Sets (${globalSharedSets.length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                backgroundColor: activeTab === tab.key ? "#1e3a8a" : "#ffffff",
                color: activeTab === tab.key ? "#ffffff" : "#475569",
                border: activeTab === tab.key ? "none" : "1.5px solid #cbd5e1",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "13.5px",
                cursor: "pointer",
                boxShadow: activeTab === tab.key ? "0 2px 6px rgba(30,58,138,0.25)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: MY PRIVATE SETS                                   */}
        {/* ======================================================== */}
        {activeTab === "mySets" && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "18px" }}>
                  Private {isJapanese ? "Mock Tests" : "UBT Sets"} Created by {instituteName} ({mySets.length})
                </h3>
                <p style={{ margin: "3px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                  These sets are only accessible to students enrolled in your institute.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("createSet")}
                style={{ ...primaryBtnStyle, backgroundColor: "#16a34a" }}
              >
                + Create New {isJapanese ? "Mock Test" : "Private Set"}
              </button>
            </div>

            {mySets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1.5px dashed #cbd5e1" }}>
                <p style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 8px 0" }}>
                  No private {isJapanese ? "mock test sets" : "UBT sets"} created yet.
                </p>
                <p style={{ fontSize: "13px", margin: "0 0 16px 0" }}>
                  {isJapanese
                    ? "Click below to create your institute's first private Japanese mock test set!"
                    : "Click below to create your institute's first private set with 40 EPS-TOPIK questions template!"}
                </p>
                <button onClick={() => setActiveTab("createSet")} style={primaryBtnStyle}>
                  + Create Your First {isJapanese ? "Mock Test" : "UBT Set"}
                </button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#1e3a8a", color: "#ffffff", textAlign: "center" }}>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>S.N.</th>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>{isJapanese ? "Mock Test Name" : "UBT Set Name"}</th>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>Linked Package</th>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>Reading (Target 20)</th>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>Listening (Target 20)</th>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>Total Questions</th>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>Status / Visibility</th>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySets.map((s, idx) => {
                      const counts = getSetCounts(s);
                      const isSelectedForView = (effectiveViewingSet || "").trim().toUpperCase() === (s.name || "").trim().toUpperCase();
                      return (
                        <tr
                          key={s.id || idx}
                          style={{
                            borderBottom: "1px solid #e2e8f0",
                            backgroundColor: isSelectedForView ? "#f0fdf4" : "transparent",
                            transition: "background-color 0.15s ease",
                            textAlign: "center"
                          }}
                        >
                          <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#64748b", textAlign: "center" }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#1e3a8a", textAlign: "center" }}>
                            {s.name}
                          </td>
                          <td style={{ padding: "12px 14px", color: "#475569", textAlign: "center" }}>
                            {s.packageName || "N/A"}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <span style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12.5px",
                              fontWeight: "600",
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
                              fontWeight: "600",
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
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                              <span style={{
                                display: "inline-block",
                                backgroundColor: s.isPublished ? "#dcfce7" : "#fef3c7",
                                color: s.isPublished ? "#15803d" : "#92400e",
                                border: s.isPublished ? "1px solid #86efac" : "1px solid #fde68a",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11.5px",
                                fontWeight: "600"
                              }}>
                                {s.isPublished ? "Published Globally" : "Private (Own Bucket)"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleInstitutePublish(s)}
                                title={s.isPublished ? "Click to make this set private to your institute only" : "Click to publish this set globally for all institutes"}
                                style={{
                                  backgroundColor: s.isPublished ? "#f1f5f9" : "#16a34a",
                                  color: s.isPublished ? "#475569" : "#ffffff",
                                  border: s.isPublished ? "1px solid #cbd5e1" : "none",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  cursor: "pointer"
                                }}
                              >
                                {s.isPublished ? "Make Private" : "Publish Globally"}
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingSet(s.name);
                                  const el = document.getElementById("institute-questions-list-section");
                                  if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                                style={{
                                  backgroundColor: isSelectedForView ? "#15803d" : "#f1f5f9",
                                  color: isSelectedForView ? "#ffffff" : "#1e3a8a",
                                  border: isSelectedForView ? "1px solid #166534" : "1px solid #cbd5e1",
                                  padding: "6px 11px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                {isSelectedForView ? "Viewing Qs" : "View Questions"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFilterSet(s.name);
                                  setFilterPackage(s.packageName || "Full Set UBT");
                                  setActiveTab("uploadQuestions");
                                  handleQNumberChange(1);
                                }}
                                style={{
                                  backgroundColor: "#2563eb",
                                  color: "#ffffff",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "bold"
                                }}
                              >
                                Edit Questions
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSet(s.id, s.name)}
                                style={{
                                  backgroundColor: "#fee2e2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                  padding: "6px 10px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "bold"
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
            {/* QUESTIONS LIST OF SELECTED SET (BELOW SET LIST)           */}
            {/* ======================================================== */}
            <div id="institute-questions-list-section" style={{ marginTop: "32px", borderTop: "2px solid #e2e8f0", paddingTop: "24px" }}>
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
                      Questions in Set: <span style={{ color: "#2563eb" }}>{effectiveViewingSet || "None Selected"}</span>
                    </h4>
                  </div>

                  {mySets.length > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#475569" }}>Switch Set:</span>
                      <select
                        value={effectiveViewingSet}
                        onChange={(e) => setViewingSet(e.target.value)}
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
                        {mySets.map((s, idx) => {
                          const c = getSetCounts(s);
                          return (
                            <option key={s.id || idx} value={s.name}>
                              {s.name} ({c.total}/40 Qs)
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
                      {viewingQuestions.length} Questions
                    </span>
                    <span style={{
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}>
                      {viewingReadingCount} Reading
                    </span>
                    <span style={{
                      backgroundColor: "#f3e8ff",
                      color: "#6b21a8",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}>
                      {viewingListeningCount} Listening
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSet(effectiveViewingSet);
                      setActiveTab("uploadQuestions");
                      handleQNumberChange(1);
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
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span>Open in Question Editor</span>
                  </button>
                </div>
              </div>

              {viewingQuestions.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1.5px dashed #cbd5e1"
                }}>
                  <p style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: "700", color: "#475569" }}>
                    No questions found in {effectiveViewingSet} yet.
                  </p>
                  <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b" }}>
                    Click below to start adding questions in the Question Editor.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSet(effectiveViewingSet);
                      setActiveTab("uploadQuestions");
                      handleQNumberChange(1);
                    }}
                    style={primaryBtnStyle}
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
                      {viewingQuestions.map((q, qIdx) => {
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
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
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
                                  onClick={() => handleEditQuestion(q)}
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
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSingleQuestion(q.id, qNum)}
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
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                  </svg>
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
        {/* TAB 2: CREATE NEW SET                                    */}
        {/* ======================================================== */}
        {activeTab === "createSet" && (
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px 0", color: "#1e3a8a", fontSize: "18px" }}>
              Create New {isJapanese ? "Mock Test" : "UBT Set"} in Your Private Bucket
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b" }}>
              {isJapanese
                ? `Each mock test set contains reading and listening question sections. Sets created here are completely isolated to ${instituteName}.`
                : `Each UBT exam set contains 40 questions (20 Reading + 20 Listening). Sets created here are completely isolated to ${instituteName}.`}
            </p>

            <form onSubmit={handleCreatePrivateSet}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                    {isJapanese ? "Mock Test Name *" : "UBT Set Name *"}
                  </label>
                  <input
                    type="text"
                    placeholder={isJapanese ? "e.g. JFT-BASIC MOCK 01, NAT-TEST 01, JLPT N4 MOCK 01" : "e.g. UBT SET 01, EPS SPECIAL MODEL 01"}
                    value={newSetName}
                    onChange={(e) => setNewSetName(e.target.value.toUpperCase())}
                    style={{ ...inputStyle, textTransform: "uppercase" }}
                    required
                  />
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Set name will be saved in uppercase for exam compatibility.
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                    Assign to Package
                  </label>
                  <select
                    value={newSetPackage}
                    onChange={(e) => setNewSetPackage(e.target.value)}
                    style={inputStyle}
                  >
                    {isJapanese ? (
                      <>
                        <option value="Full Mock Test">Full Mock Test (Default)</option>
                        <option value="JFT-Basic Mock Test">JFT-Basic Mock Test</option>
                        <option value="NAT-TEST Mock Test">NAT-TEST Mock Test</option>
                        <option value="JLPT Mock Test">JLPT Mock Test</option>
                        {packages
                          .filter(p => {
                            if (!p) return false;
                            const name = p.name || "";
                            if (["Full Mock Test", "JFT-Basic Mock Test", "NAT-TEST Mock Test", "JLPT Mock Test"].includes(name)) return false;
                            const low = name.toLowerCase();
                            return !low.includes("ubt") && !low.includes("chapter") && !low.includes("eps") && !low.includes("topik");
                          })
                          .map((p, idx) => (
                            <option key={idx} value={p.name}>{p.name}</option>
                          ))
                        }
                      </>
                    ) : (
                      <>
                        <option value="Full Set UBT">Full Set UBT (Default)</option>
                        <option value="100 UBT set">100 UBT set</option>
                        <option value="General UBT">General UBT</option>
                        {packages
                          .filter(p => !["Full Set UBT", "100 UBT set", "General UBT"].includes(p.name))
                          .map((p, idx) => (
                            <option key={idx} value={p.name}>{p.name}</option>
                          ))
                        }
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div style={{
                marginBottom: "16px",
                backgroundColor: "#f0fdf4",
                border: "1.5px solid #86efac",
                padding: "14px 18px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <input
                  type="checkbox"
                  id="newSetAutoInit"
                  checked={newSetAutoInit}
                  onChange={(e) => setNewSetAutoInit(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="newSetAutoInit" style={{ fontSize: "13px", color: "#166534", fontWeight: "bold", cursor: "pointer" }}>
                  Auto-initialize 40 Question slots (20 Reading + 20 Listening template ready to fill)
                </label>
              </div>

              <div style={{
                marginBottom: "20px",
                backgroundColor: "#eff6ff",
                border: "1.5px solid #93c5fd",
                padding: "14px 18px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <input
                  type="checkbox"
                  id="newSetIsPublic"
                  checked={newSetIsPublic}
                  onChange={(e) => setNewSetIsPublic(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <div>
                  <label htmlFor="newSetIsPublic" style={{ fontSize: "13px", color: "#1e40af", fontWeight: "bold", cursor: "pointer", display: "block" }}>
                    Public for All Institutes (Publish globally across all institutes & students)
                  </label>
                  <span style={{ fontSize: "11px", color: "#475569" }}>
                    If checked, other institutes and students can also access this exam set. Unchecked keeps it strictly private to {instituteName}.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" style={{ ...primaryBtnStyle, padding: "12px 24px" }}>
                  {newSetIsPublic ? "+ Create & Publish Set for All Institutes" : "+ Create Set in Private Bucket & Open Editor"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("mySets")}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "12px 20px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: UPLOAD / EDIT QUESTIONS                           */}
        {/* ======================================================== */}
        {activeTab === "uploadQuestions" && (
          <div>
            {/* Top Selector Bar */}
            <div style={{ ...cardStyle, marginBottom: "16px", backgroundColor: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <label style={{ fontSize: "13px", fontWeight: "bold", color: "#1e3a8a" }}>
                    Select Target Set:
                  </label>
                  <select
                    value={filterSet}
                    onChange={(e) => {
                      setFilterSet(e.target.value);
                      const matchingSet = allSets.find(s => s.name === e.target.value);
                      if (matchingSet) setFilterPackage(matchingSet.packageName || "Full Set UBT");
                      handleQNumberChange(1);
                    }}
                    style={{ ...inputStyle, width: "240px", marginBottom: 0, fontWeight: "bold" }}
                  >
                    <optgroup label={`My Private Sets (${instituteName})`}>
                      {mySets.map((s, idx) => (
                        <option key={`my-${idx}`} value={s.name}>{s.name} [Private]</option>
                      ))}
                    </optgroup>
                    <optgroup label="Global Sets (Super Admin)">
                      {globalSharedSets.map((s, idx) => (
                        <option key={`glob-${idx}`} value={s.name}>{s.name} [Global]</option>
                      ))}
                    </optgroup>
                  </select>

                  <span style={{
                    fontSize: "12px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    backgroundColor: currentSetQuestions.length === 40 ? "#dcfce7" : "#fef3c7",
                    color: currentSetQuestions.length === 40 ? "#166534" : "#92400e"
                  }}>
                    {currentSetQuestions.length} / 40 Questions Filled
                  </span>
                </div>
              </div>
            </div>

            {/* Quick 1-40 Question Slot Jump Bar */}
            <div style={{ ...cardStyle, marginBottom: "16px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "#1e3a8a" }}>
                  Jump to Question (1~20 Reading | 21~40 Listening):
                </span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  Active Slot: <strong>Question #{qNumber} ({questionListType})</strong>
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(20, 1fr)", gap: "4px" }}>
                {Array.from({ length: 40 }).map((_, i) => {
                  const num = i + 1;
                  const isCur = qNumber === num;
                  const hasQ = currentSetQuestions.some(
                    q => (Number(q.questionHeading) === num || Number(q.qIndex) === num) && (q.description || q.image || q.audio || (q.options && q.options.some(o => o.text)))
                  );

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleQNumberChange(num)}
                      style={{
                        padding: "8px 2px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        borderRadius: "4px",
                        cursor: "pointer",
                        border: isCur ? "2px solid #2563eb" : "1px solid #cbd5e1",
                        backgroundColor: isCur ? "#2563eb" : (hasQ ? "#dcfce7" : "#ffffff"),
                        color: isCur ? "#ffffff" : (hasQ ? "#166534" : "#475569")
                      }}
                      title={`Question ${num} (${num <= 20 ? "Reading" : "Listening"})`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Edit Form */}
            <div style={cardStyle}>
              <form onSubmit={handleSaveQuestion}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "17px" }}>
                      Editing Question #{qNumber} ({questionListType}) in {cleanFilterSet}
                    </h3>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setQuestionListType("Reading")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "5px",
                        border: "none",
                        fontWeight: "bold",
                        fontSize: "12px",
                        cursor: "pointer",
                        backgroundColor: questionListType === "Reading" ? "#2563eb" : "#f1f5f9",
                        color: questionListType === "Reading" ? "#ffffff" : "#475569"
                      }}
                    >
                      Reading (Q1~20)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionListType("Listening")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "5px",
                        border: "none",
                        fontWeight: "bold",
                        fontSize: "12px",
                        cursor: "pointer",
                        backgroundColor: questionListType === "Listening" ? "#7c3aed" : "#f1f5f9",
                        color: questionListType === "Listening" ? "#ffffff" : "#475569"
                      }}
                    >
                      Listening (Q21~40)
                    </button>
                  </div>
                </div>



                {/* Main Instruction Heading */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "bold", color: "#334155", marginBottom: "4px" }}>
                    Main Instruction (Korean Text) *
                  </label>
                  <input
                    type="text"
                    value={qForm.mainHeading}
                    onChange={(e) => setQForm({ ...qForm, mainHeading: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Description / Paragraph Text */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "bold", color: "#334155", marginBottom: "4px" }}>
                    Reading Paragraph / Description Passage (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter Korean passage, dialogue, or description text here..."
                    value={qForm.description}
                    onChange={(e) => setQForm({ ...qForm, description: e.target.value })}
                    style={{ ...inputStyle, fontFamily: "inherit" }}
                  />
                </div>

                {/* Media: Image & Audio */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
                  {/* Image Attachment */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer?.files?.[0];
                      if (file) processFileToDataURL(file, (data) => setQForm(prev => ({ ...prev, image: data })));
                    }}
                    style={{
                      border: dragOver ? "2px dashed #2563eb" : "1.5px dashed #cbd5e1",
                      borderRadius: "8px",
                      padding: "14px",
                      backgroundColor: dragOver ? "#eff6ff" : "#f8fafc",
                      textAlign: "center"
                    }}
                  >
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                      Question Image (Picture Match / Graph / Sign)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processFileToDataURL(file, (data) => setQForm(prev => ({ ...prev, image: data })));
                      }}
                      style={{ fontSize: "12px", marginBottom: "8px" }}
                    />
                    {qForm.image && (
                      <div style={{ marginTop: "8px" }}>
                        <img src={qForm.image} alt="Preview" style={{ maxHeight: "120px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                        <div>
                          <button
                            type="button"
                            onClick={() => setQForm(prev => ({ ...prev, image: "" }))}
                            style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", marginTop: "4px", cursor: "pointer" }}
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Audio Attachment */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setAudioDragOver(true); }}
                    onDragLeave={() => setAudioDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setAudioDragOver(false);
                      const file = e.dataTransfer?.files?.[0];
                      if (file) processFileToDataURL(file, (data) => setQForm(prev => ({ ...prev, audio: data })));
                    }}
                    style={{
                      border: audioDragOver ? "2px dashed #7c3aed" : "1.5px dashed #cbd5e1",
                      borderRadius: "8px",
                      padding: "14px",
                      backgroundColor: audioDragOver ? "#faf5ff" : "#f8fafc",
                      textAlign: "center"
                    }}
                  >
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                      Listening Audio Track (MP3 / Audio)
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processFileToDataURL(file, (data) => setQForm(prev => ({ ...prev, audio: data })));
                      }}
                      style={{ fontSize: "12px", marginBottom: "8px" }}
                    />
                    {qForm.audio && (
                      <div style={{ marginTop: "8px" }}>
                        <audio controls src={qForm.audio} style={{ width: "100%", height: "36px" }} />
                        <div>
                          <button
                            type="button"
                            onClick={() => setQForm(prev => ({ ...prev, audio: "" }))}
                            style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", marginTop: "4px", cursor: "pointer" }}
                          >
                            Remove Audio
                          </button>
                        </div>
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

                  {/* 4 Options: each option in one full row */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
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
                            padding: "10px 14px",
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
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", margin: 0, whiteSpace: "nowrap", flexShrink: 0 }}>
                              <input
                                type="radio"
                                name="instituteCorrectAnswer"
                                checked={isCorrect}
                                onChange={() => setQForm({ ...qForm, answer: idx })}
                                style={{ width: "17px", height: "17px", cursor: "pointer", accentColor: "#16a34a" }}
                              />
                              <span style={{ fontWeight: "700", fontSize: "13px", color: isCorrect ? "#166534" : "#1e3a8a" }}>
                                Option {idx + 1} {symbols[idx]}
                              </span>
                              {isCorrect && (
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#166534", backgroundColor: "#dcfce7", padding: "1px 7px", borderRadius: "4px" }}>
                                  ✓ Correct Answer
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
                                padding: "8px 10px",
                                borderRadius: "6px",
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

                {/* Form Actions */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ ...primaryBtnStyle, flex: 1, padding: "12px" }}>
                    Save Question #{qNumber} & Advance
                  </button>
                  {qNumber > 1 && (
                    <button
                      type="button"
                      onClick={() => handleQNumberChange(qNumber - 1)}
                      style={{
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #cbd5e1",
                        padding: "12px 18px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      Previous (#{qNumber - 1})
                    </button>
                  )}
                  {qNumber < 40 && (
                    <button
                      type="button"
                      onClick={() => handleQNumberChange(qNumber + 1)}
                      style={{
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #cbd5e1",
                        padding: "12px 18px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      Next (#{qNumber + 1})
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CREATE CUSTOM PACKAGES                            */}
        {/* ======================================================== */}
        {activeTab === "createPackage" && (
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px 0", color: "#1e3a8a", fontSize: "18px" }}>
              {isJapanese ? "⛩️ Create Mock Test Package from Mock Tests" : "📦 Create Custom Package from Your Sets"}
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b" }}>
              {isJapanese
                ? "Bundle Japanese mock test sets (JLPT N5-N2, JFT-Basic & your institute's sets) into packages for your enrolled students."
                : "Bundle your institute's private UBT sets into packages for your enrolled students."}
            </p>

            <form onSubmit={handleSavePackage}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 0.8fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                    Package Name *
                  </label>
                  <input
                    type="text"
                    placeholder={isJapanese ? "e.g. JLPT N5 Complete Mock Bundle or JFT Speed Pass" : "e.g. VIP 10 Set UBT Model Exam"}
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                    Default Price
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rs. 2,000"
                    value={newPkgPrice}
                    onChange={(e) => setNewPkgPrice(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                    Validity Duration
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

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                  Package Description
                </label>
                <input
                  type="text"
                  placeholder={isJapanese ? "e.g. Complete JLPT simulation mock test package with real-time scoring and audio." : "e.g. Comprehensive EPS-TOPIK practice bundle curated by our institute"}
                  value={newPkgDesc}
                  onChange={(e) => setNewPkgDesc(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Set Selection for Package */}
              {(() => {
                const selectableSets = isJapanese
                  ? allSets.filter(s => s && (s.setType === "MOCK" || s.track === "japanese" || s.isMock || (s.name && (s.name.includes("Mock") || s.name.includes("JLPT") || s.name.includes("JFT") || s.name.includes("NAT")))))
                  : (mySets.length > 0 ? mySets : allSets);

                return (
                  <div style={{ marginBottom: "20px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <label style={{ fontSize: "13px", fontWeight: "bold", color: "#1e3a8a" }}>
                          {isJapanese ? "⛩️ Select Mock Test Sets to Include" : "Select Sets Included in this Package"} ({selectedSetsForPkg.length} selected):
                        </label>
                        <p style={{ margin: "2px 0 0 0", fontSize: "11.5px", color: "#64748b" }}>
                          {isJapanese ? "Choose from standard JLPT / JFT mock tests or your private mock sets" : "Students assigned this package will have access to all selected sets"}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {isJapanese ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedSetsForPkg(selectableSets.map(s => s.name))}
                              style={{ backgroundColor: "#faf5ff", color: "#7e22ce", border: "1px solid #e9d5ff", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              ⛩️ All Mock Sets
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const n5s = selectableSets.filter(s => (s.level || s.name || "").includes("N5")).map(s => s.name);
                                setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...n5s])));
                              }}
                              style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              + JLPT N5 (10)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const n4s = selectableSets.filter(s => (s.level || s.name || "").includes("N4")).map(s => s.name);
                                setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...n4s])));
                              }}
                              style={{ backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              + JLPT N4 (10)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const n3s = selectableSets.filter(s => (s.level || s.name || "").includes("N3")).map(s => s.name);
                                setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...n3s])));
                              }}
                              style={{ backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              + JLPT N3 (10)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const n2s = selectableSets.filter(s => (s.level || s.name || "").includes("N2")).map(s => s.name);
                                setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...n2s])));
                              }}
                              style={{ backgroundColor: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              + JLPT N2 (10)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const jfts = selectableSets.filter(s => (s.level || s.name || "").includes("JFT")).map(s => s.name);
                                setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...jfts])));
                              }}
                              style={{ backgroundColor: "#fdf4ff", color: "#a21caf", border: "1px solid #f0abfc", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              + JFT-Basic (10)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const modelSets = selectableSets.filter(s => {
                                  const name = (s.name || s.title || "").toLowerCase();
                                  const desc = (s.desc || "").toLowerCase();
                                  const titleJp = (s.titleJp || "").toLowerCase();
                                  return name.includes("model") || name.includes("simulation") || desc.includes("simulation") || titleJp.includes("模試") || titleJp.includes("模擬");
                                }).map(s => s.name);
                                setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...modelSets])));
                              }}
                              style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              🎯 Model Exam / Simulation
                            </button>
                            {mySets.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const myNames = mySets.map(s => s.name);
                                  setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...myNames])));
                                }}
                                style={{ backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                              >
                                + My Private Sets
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const modelSets = selectableSets.filter(s => {
                                  const name = (s.name || "").toLowerCase();
                                  const pkg = (s.packageName || "").toLowerCase();
                                  return name.includes("model") || pkg.includes("model");
                                }).map(s => s.name);
                                setSelectedSetsForPkg(Array.from(new Set([...selectedSetsForPkg, ...modelSets])));
                              }}
                              style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              + All Model Sets
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedSetsForPkg(mySets.map(s => s.name))}
                              style={{ backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              Select All My Private Sets
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedSetsForPkg([])}
                          style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px", maxHeight: "260px", overflowY: "auto", padding: "2px" }}>
                      {selectableSets.map((s, idx) => {
                        const isChecked = selectedSetsForPkg.includes(s.name);
                        const isMock = s.setType === "MOCK" || s.track === "japanese" || s.isMock || (s.name && (s.name.includes("Mock") || s.name.includes("JLPT") || s.name.includes("JFT") || s.name.includes("NAT")));
                        const badge = s.level || (isMock ? "Mock" : (s.packageName || "Set"));
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
                              border: isChecked ? (isMock ? "1.5px solid #9333ea" : "1.5px solid #3b82f6") : "1px solid #cbd5e1",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: isChecked ? "bold" : "normal",
                              color: isChecked ? (isMock ? "#6b21a8" : "#1e40af") : "#1e293b"
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedSetsForPkg([...selectedSetsForPkg, s.name]);
                                else setSelectedSetsForPkg(selectedSetsForPkg.filter(name => name !== s.name));
                              }}
                            />
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              <span>{isMock ? "⛩️" : "🎯"}</span>
                              <span style={{ fontSize: "9.5px", padding: "1px 5px", borderRadius: "3px", backgroundColor: isMock ? "#f3e8ff" : "#e0f2fe", color: isMock ? "#7e22ce" : "#0369a1", fontWeight: "700", flexShrink: 0 }}>
                                {badge}
                              </span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <button type="submit" style={primaryBtnStyle}>
                + Save Package for My Students
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: GLOBAL SHARED SETS                                */}
        {/* ======================================================== */}
        {activeTab === "sharedSets" && (
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px 0", color: "#1e3a8a", fontSize: "18px" }}>
              Global Shared Sets Published by Super Admin ({globalSharedSets.length})
            </h3>
            <p style={{ margin: "0 0 18px 0", fontSize: "13px", color: "#64748b" }}>
              These sets have been published for all institutes by Super Admin. You can view them and include them in packages.
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1e3a8a", color: "#ffffff", textAlign: "center" }}>
                    <th style={{ padding: "12px 14px", textAlign: "center" }}>S.N.</th>
                    <th style={{ padding: "12px 14px", textAlign: "center" }}>Set Name</th>
                    <th style={{ padding: "12px 14px", textAlign: "center" }}>Package</th>
                    <th style={{ padding: "12px 14px", textAlign: "center" }}>Question Status</th>
                    <th style={{ padding: "12px 14px", textAlign: "center" }}>Authority / Publishing</th>
                    <th style={{ padding: "12px 14px", textAlign: "center" }}>Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {globalSharedSets.map((s, idx) => {
                    const counts = getSetCounts(s);
                    return (
                      <tr key={s.id || idx} style={{ borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                        <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#64748b", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#1e3a8a", textAlign: "center" }}>{s.name}</td>
                        <td style={{ padding: "12px 14px", color: "#475569", textAlign: "center" }}>{s.packageName || "N/A"}</td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            backgroundColor: counts.isComplete ? "#dbeafe" : "#f1f5f9",
                            color: counts.isComplete ? "#1e40af" : "#475569"
                          }}>
                            {counts.total} / 40 Questions
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            backgroundColor: "#dcfce7",
                            color: "#15803d",
                            border: "1px solid #86efac",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: "bold"
                          }}>
                            Published for All Institutes
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setFilterSet(s.name);
                              setFilterPackage(s.packageName || "Full Set UBT");
                              setActiveTab("uploadQuestions");
                              handleQNumberChange(1);
                            }}
                            style={{
                              backgroundColor: "#2563eb",
                              color: "#ffffff",
                              border: "none",
                              padding: "5px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}
                          >
                            View Questions
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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 99999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "600px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#1e3a8a" }}>
              Bulk JSON Import into {cleanFilterSet}
            </h3>
            <p style={{ margin: "0 0 14px 0", fontSize: "12.5px", color: "#64748b" }}>
              Paste an array of question objects (with qIndex, mainHeading, description, options, answer).
            </p>

            <textarea
              rows={10}
              placeholder='[ { "qIndex": 1, "mainHeading": "...", "options": ["A", "B", "C", "D"], "answer": 0 } ]'
              value={bulkJsonInput}
              onChange={(e) => setBulkJsonInput(e.target.value)}
              style={{ ...inputStyle, fontFamily: "monospace", fontSize: "12px", marginBottom: "12px" }}
            />

            {bulkStatus && (
              <div style={{
                color: bulkStatus.includes("Error") ? "#dc2626" : "#16a34a",
                fontWeight: "bold",
                fontSize: "13px",
                marginBottom: "12px"
              }}>
                {bulkStatus}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => { setShowBulkModal(false); setBulkStatus(""); }}
                style={{ backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                style={{ ...primaryBtnStyle, backgroundColor: "#4f46e5" }}
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
        targetSet={cleanFilterSet}
        targetPackage={filterPackage}
        availableSets={mySets}
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

export default function InstituteQuestionManager() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading Question Manager...</div>}>
      <InstituteQuestionManagerContent />
    </Suspense>
  );
}