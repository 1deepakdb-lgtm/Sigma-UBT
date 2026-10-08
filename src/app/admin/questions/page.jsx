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

const KOREAN_HEADING_PRESETS = [
  { label: "Q1~2: 내용과 관계있는 그림 (Picture Match)", text: "[1~2] 다음 내용과 관계있는 그림을 고르십시오." },
  { label: "Q3~4: 관계 있는 것 / 반대말 / 비슷한 말 (Word Relation)", text: "[3~4] 다음 질문에 답하십시오." },
  { label: "Q5~8: 빈칸에 들어갈 알맞은 것 (Fill in the Blanks)", text: "[5~8] 빈칸에 들어갈 가장 알맞은 것을 고르십시오." },
  { label: "Q9~12: 표지판 / 안내문 / 그래프 (Signs & Information)", text: "[9~12] 다음 질문에 답하십시오." },
  { label: "Q13~14: 빈칸 문법 / 어휘 (Grammar & Vocabulary)", text: "[13~14] 빈칸에 들어갈 가장 알맞은 것을 고르십시오." },
  { label: "Q15~16: 무엇에 대한 글인지 (Paragraph Topic)", text: "[15~16] 다음 글을 읽고 무엇에 대한 글인지 고르십시오." },
  { label: "Q17~18: 내용과 같은 것 (Reading Comprehension)", text: "[17~18] 다음 글을 읽고 내용과 같은 것을 고르십시오." },
  { label: "Q19~20: 설명에 알맞은 어휘 (Definitions & Work)", text: "[19~20] 무엇에 대한 설명입니까?" },
  { label: "Q21~22: 듣고 빈칸 / 단어 (Listening Word Match)", text: "[21~22] 다음을 듣고 빈칸에 알맞은 것을 고르십시오." },
  { label: "Q23~24: 들은 것 고르기 (Listening Audio Choice)", text: "[23~24] 들은 것을 고르십시오." },
  { label: "Q25~29: 그림에 알맞은 답 (Listening Picture Qs)", text: "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오." },
  { label: "Q30~33: 알맞은 대답 (Question-Response)", text: "[30~33] 다음을 듣고 물음에 알맞은 대답을 고르십시오." },
  { label: "Q34~35: 이어지는 말 (Next Statement)", text: "[34~35] 다음을 듣고 이어지는 말을 고르십시오." },
  { label: "Q36~40: 대화 듣고 알맞은 것 (Conversations)", text: "[36~40] 다음을 듣고 알맞은 것을 고르십시오." }
];

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
  const [bulkJsonInput, setBulkJsonInput] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");

  // Search & filter for All Sets tab
  const [allSetsCategoryFilter, setAllSetsCategoryFilter] = useState("All"); // "All" | "UBT" | "Chapterwise"
  const [allSetsSearch, setAllSetsSearch] = useState("");

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

      // Force ALL set names to be in capital letters (uppercase)
      let normalizedSets = savedSets.map((s) => {
        const upperName = (s.name || "").trim().toUpperCase();
        const sType = s.setType || (upperName.includes("CHAPTER") ? "Chapterwise" : "UBT");
        return {
          ...s,
          name: upperName,
          setType: sType
        };
      });

      // Ensure default fallback sets exist so counts and views are never empty
      if (!normalizedSets.some((s) => s.name === "UBT SET 01")) {
        normalizedSets.push({
          id: "set-ubt-01",
          name: "UBT SET 01",
          packageName: "Full Set UBT",
          setType: "UBT",
          duration: 3000
        });
      }
      if (!normalizedSets.some((s) => s.name === "SET 1")) {
        normalizedSets.push({
          id: "set-chapter-01",
          name: "SET 1",
          packageName: "30 Set Chapter UBT",
          setType: "Chapterwise",
          duration: 3000
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

  useEffect(() => {
    loadData();

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

    alert(`✅ UBT Set "${cleanName}" created successfully with 20 Reading & 20 Listening slots!`);
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

    alert(`✅ Chapter Wise Set "${cleanName}" created successfully with 20 Reading & 20 Listening slots!`);
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
      alert(`⚡ 40 Question slots (20 Reading + 20 Listening) generated for "${filterSet}"!`);
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
      alert("⚠️ Please select text inside the option box first to underline.");
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
      alert(`✅ Question #${qNumber} (${questionListType}) updated successfully!`);
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
      alert(`✅ Question #${qNumber} (${questionListType}) saved successfully!`);
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
        setBulkStatus("❌ Error: JSON must be an array of questions.");
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

      setBulkStatus(`✅ Successfully imported ${formatted.length} questions for "${cleanSet}"!`);
      setTimeout(() => {
        setShowBulkModal(false);
        setBulkJsonInput("");
        setBulkStatus("");
      }, 1500);
    } catch (err) {
      setBulkStatus("❌ JSON Parsing Error: " + err.message);
    }
  };

  // Filter sets for UBT vs Chapter Wise
  const ubtSetsList = sets.filter(s => getSetType(s) === "UBT");
  const chapterSetsList = sets.filter(s => getSetType(s) === "Chapterwise");

  // Questions displayed under the current selected set
  const currentSetQuestions = questions.filter(
    q => q && ((q.set || "").trim().toUpperCase() === (filterSet || "").trim().toUpperCase() || q.setId === filterSet) &&
      (!filterPackage || q.package === filterPackage || !q.package)
  );

  const displayedSetQuestions = currentSetQuestions.filter(q => {
    if (questionSubFilter === "Reading") return q.type === "Reading";
    if (questionSubFilter === "Listening") return q.type === "Listening";
    return true;
  }).sort((a, b) => (Number(a.questionHeading || a.qIndex) || 0) - (Number(b.questionHeading || b.qIndex) || 0));

  const targetSetCounts = getSetQuestionCounts(sets.find(s => (s.name || "").trim().toUpperCase() === (filterSet || "").trim().toUpperCase()));

  // Counts for All Sets tab
  const totalAllSetsCount = sets.length;
  const totalUbtSetsCount = ubtSetsList.length;
  const totalChapterSetsCount = chapterSetsList.length;
  const totalCompleteSetsCount = sets.filter(s => getSetQuestionCounts(s).isComplete).length;
  const totalQuestionsCount = questions.length;

  const filteredAllSets = sets.filter(s => {
    const sType = getSetType(s);
    if (allSetsCategoryFilter === "UBT" && sType !== "UBT") return false;
    if (allSetsCategoryFilter === "Chapterwise" && sType !== "Chapterwise") return false;
    if (allSetsSearch.trim()) {
      const q = allSetsSearch.toLowerCase();
      const matchName = (s.name || "").toLowerCase().includes(q);
      const matchPkg = (s.packageName || "").toLowerCase().includes(q);
      if (!matchName && !matchPkg) return false;
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
              Total Sets: <strong style={{ color: "#1e3a8a" }}>{totalAllSetsCount}</strong> | Questions: <strong style={{ color: "#16a34a" }}>{totalQuestionsCount}</strong>
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
            <span>🎯</span>
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
            <span>📚</span>
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
            <span>📝</span>
            <span>Upload Questions (20R + 20L)</span>
          </button>

          {/* 4. All Sets Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); handleTabChange("allSets"); }}
            style={navTabBtnStyle("allSets")}
          >
            <span>📊</span>
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
                <span style={{ fontSize: "24px" }}>🎯</span>
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
                    ⚡ <strong>Auto-initialize 40 Question slots</strong> (20 Reading + 20 Listening slots ready to upload/edit)
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
                <h3 style={{ margin: 0, fontSize: "17px", color: "#0f172a", fontWeight: "700" }}>
                  Created UBT Sets ({ubtSetsList.length})
                </h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Official 20 Reading + 20 Listening Format
                </span>
              </div>

              {ubtSetsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <p style={{ fontSize: "16px", margin: "0 0 8px 0" }}>No UBT sets created yet.</p>
                  <p style={{ fontSize: "13px", margin: 0 }}>Use the form above to create your first UBT exam set!</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#1e3a8a", color: "#ffffff", textAlign: "left" }}>
                        <th style={{ padding: "12px 14px", borderRadius: "6px 0 0 0" }}>S.N.</th>
                        <th style={{ padding: "12px 14px" }}>UBT Set Name</th>
                        <th style={{ padding: "12px 14px" }}>Package</th>
                        <th style={{ padding: "12px 14px" }}>📖 Reading Qs (Target 20)</th>
                        <th style={{ padding: "12px 14px" }}>🎧 Listening Qs (Target 20)</th>
                        <th style={{ padding: "12px 14px" }}>Total Status</th>
                        <th style={{ padding: "12px 14px", textAlign: "center", borderRadius: "0 6px 0 0" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ubtSetsList.map((setObj, idx) => {
                        const counts = getSetQuestionCounts(setObj);
                        return (
                          <tr key={setObj.id || idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "12px 14px", fontWeight: "600", color: "#64748b" }}>{idx + 1}</td>
                            <td style={{ padding: "12px 14px", fontWeight: "700", color: "#1e3a8a" }}>
                              🎯 {setObj.name}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#475569" }}>{setObj.packageName || "Full Set UBT"}</td>
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
                                {counts.total} / 40 Questions {counts.isComplete ? "✅ Ready" : "⏳ Incomplete"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
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
                                  📝 Upload / Edit Questions
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
        {/* TAB 2: CHAPTER WISE SETS (CREATE & MANAGE)                */}
        {/* ======================================================== */}
        {activeTab === "chapterSets" && (
          <div>
            {/* Create Chapter Wise Set Form */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "24px" }}>📚</span>
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
                    ⚡ <strong>Auto-initialize 40 Question slots</strong> (20 Reading + 20 Listening slots ready to upload/edit)
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
                        <th style={{ padding: "12px 14px" }}>📖 Reading Qs (Target 20)</th>
                        <th style={{ padding: "12px 14px" }}>🎧 Listening Qs (Target 20)</th>
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
                              📚 {setObj.name}
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
                                {counts.total} / 40 Questions {counts.isComplete ? "✅ Ready" : "⏳ Incomplete"}
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
                                  📝 Upload / Edit Questions
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
                    ⚡ Initialize 40 Qs Template (20R + 20L)
                  </button>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    style={secondaryBtnStyle}
                  >
                    📥 Bulk JSON Import
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
                    <optgroup label="🎯 UBT Sets">
                      {ubtSetsList.map((s, idx) => (
                        <option key={idx} value={s.name}>🎯 {s.name} ({s.packageName || 'UBT'})</option>
                      ))}
                    </optgroup>
                    <optgroup label="📚 Chapter Wise Sets">
                      {chapterSetsList.map((s, idx) => (
                        <option key={idx} value={s.name}>📚 {s.name} ({s.packageName || 'Chapter'})</option>
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
                      📖 Reading: {targetSetCounts.reading} / 20
                    </span>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      backgroundColor: targetSetCounts.listening === 20 ? "#dcfce7" : "#fef3c7",
                      color: targetSetCounts.listening === 20 ? "#166534" : "#b45309"
                    }}>
                      🎧 Listening: {targetSetCounts.listening} / 20
                    </span>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      backgroundColor: targetSetCounts.isComplete ? "#2563eb" : "#94a3b8",
                      color: "#ffffff"
                    }}>
                      Total: {targetSetCounts.total} / 40 {targetSetCounts.isComplete && "✓"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: "10px", backgroundColor: "#e2e8f0", borderRadius: "5px", overflow: "hidden", display: "flex" }}>
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
                  {editingQuestionId ? `✏️ Edit Question #${qNumber}` : `➕ Upload Question #${qNumber}`}
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
                        📖 Reading (Q1~Q20)
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
                        🎧 Listening (Q21~Q40)
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
                      <optgroup label="📖 Reading Questions (1 to 20)">
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>Q{n} - Reading</option>
                        ))}
                      </optgroup>
                      <optgroup label="🎧 Listening Questions (21 to 40)">
                        {Array.from({ length: 20 }, (_, i) => i + 21).map(n => (
                          <option key={n} value={n}>Q{n} - Listening</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Correct Answer */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                      Correct Answer *
                    </label>
                    <select
                      value={qForm.answer}
                      onChange={(e) => setQForm({ ...qForm, answer: parseInt(e.target.value) })}
                      style={{ ...inputStyle, borderColor: "#16a34a", fontWeight: "700", color: "#166534", backgroundColor: "#f0fdf4" }}
                    >
                      <option value={0}>Option 1 (①)</option>
                      <option value={1}>Option 2 (②)</option>
                      <option value={2}>Option 3 (③)</option>
                      <option value={3}>Option 4 (④)</option>
                    </select>
                  </div>
                </div>

                {/* Korean Main Heading Preset Dropdown */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "700" }}>
                      Korean Main Heading
                    </label>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Choose standard EPS template or edit below:</span>
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setQForm(prev => ({ ...prev, mainHeading: e.target.value }));
                      }
                    }}
                    style={{ ...inputStyle, marginBottom: "8px", backgroundColor: "#f1f5f9" }}
                  >
                    <option value="">-- Insert standard Korean EPS instruction --</option>
                    {KOREAN_HEADING_PRESETS.map((p, idx) => (
                      <option key={idx} value={p.text}>{p.label}</option>
                    ))}
                  </select>
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
                      🖼️ Question Image (Reading/Listening)
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
                      🎧 Listening Audio File (.mp3) {questionListType === "Listening" && <span style={{ color: "#dc2626" }}>* Required for Listening</span>}
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

                {/* 4 Options Configuration with Underline Support */}
                <h4 style={{ margin: "0 0 12px 0", color: "#0f172a", fontSize: "15px" }}>
                  Options (Text, Underline & Optional Image/Audio)
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                  {qForm.options.map((opt, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "14px",
                        backgroundColor: qForm.answer === idx ? "#f0fdf4" : "#f8fafc",
                        border: qForm.answer === idx ? "2px solid #16a34a" : "1px solid #cbd5e1",
                        borderRadius: "8px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "700", color: qForm.answer === idx ? "#166534" : "#1e3a8a" }}>
                          Option {idx + 1} {["①", "②", "③", "④"][idx]} {qForm.answer === idx && "⭐ Correct Answer"}
                        </label>
                        <button
                          type="button"
                          onClick={() => applyUnderline(idx)}
                          style={{
                            backgroundColor: "#1e3a8a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            textDecoration: "underline"
                          }}
                          title="Select text in option box and click here to underline"
                        >
                          Underline Text
                        </button>
                      </div>

                      <input
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        placeholder={`Option ${idx + 1} text`}
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...qForm.options];
                          newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                          setQForm({ ...qForm, options: newOpts });
                        }}
                        style={{ ...inputStyle, marginBottom: "8px" }}
                      />

                      <div style={{ fontSize: "12px", color: "#475569", marginBottom: "8px" }}>
                        Preview: <span dangerouslySetInnerHTML={{ __html: opt.text || "(empty)" }} />
                      </div>

                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <label style={{ backgroundColor: "#e2e8f0", color: "#1e293b", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}>
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
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", fontSize: "11px", padding: "2px 6px", borderRadius: "3px", cursor: "pointer" }}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>

                      {opt.image && (
                        <img
                          src={opt.image}
                          alt={`Opt ${idx + 1}`}
                          style={{ maxHeight: "50px", marginTop: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                        />
                      )}
                    </div>
                  ))}
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
                    📖 Reading ({targetSetCounts.reading}/20)
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
                    🎧 Listening ({targetSetCounts.listening}/20)
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
                    ⚡ Click to Initialize 40 Question Slots (20R + 20L)
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
                                {isReading ? "📖 Reading" : "🎧 Listening"}
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
                                {q.image && <span title="Image attached">🖼️</span>}
                                {q.audio && <span title="Audio attached">🎧</span>}
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

                  <input
                    type="text"
                    placeholder="Search by Set or Package..."
                    value={allSetsSearch}
                    onChange={(e) => setAllSetsSearch(e.target.value)}
                    style={{ ...inputStyle, width: "220px", padding: "8px 12px" }}
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
                        <th style={{ padding: "12px 14px" }}>Reading (X/20)</th>
                        <th style={{ padding: "12px 14px" }}>Listening (Y/20)</th>
                        <th style={{ padding: "12px 14px" }}>Total Status</th>
                        <th style={{ padding: "12px 14px", textAlign: "center", borderRadius: "0 6px 0 0" }}>Actions</th>
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
                              {sType === "UBT" ? "🎯 " : "📚 "}{s.name}
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
                                {counts.total} / 40 {counts.isComplete ? "✅ Complete" : "⏳ Incomplete"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
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
              📥 Bulk Upload Questions for "{filterSet}"
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
              <div style={{ margin: "10px 0", fontSize: "13px", fontWeight: "bold", color: bulkStatus.startsWith("✅") ? "#16a34a" : "#dc2626" }}>
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