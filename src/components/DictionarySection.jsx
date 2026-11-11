'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import BatchimRulesGuide from '@/components/BatchimRulesGuide';
import JapanesePronunciationGuide from '@/components/JapanesePronunciationGuide';
import AiStudio from '@/components/AiStudio';
import { VOICE_PROFILES } from '@/lib/elevenlabsConfig';

/**
 * Dynamic Avatar Icons for Female and Male voices
 * Vibrant, responsive, and animated when active
 */
export function FemaleIcon({ size = 32, isPlaying = false, title = "Female Voice" }) {
  const innerFont = Math.max(13, Math.round(size * 0.62));
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 50%, #e11d48 100%)",
        boxShadow: isPlaying
          ? "0 0 0 3px rgba(244, 63, 94, 0.45), 0 4px 12px rgba(225, 29, 72, 0.5), inset 0 1px 2px rgba(255,255,255,0.8)"
          : size < 24
            ? "0 2px 5px rgba(225, 29, 72, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.7)"
            : "0 4px 10px rgba(225, 29, 72, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.6)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${innerFont}px`,
        lineHeight: 1,
        flexShrink: 0,
        userSelect: "none",
        transform: isPlaying ? "scale(1.12)" : "scale(1)",
        transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease",
        animation: isPlaying ? "voicePulse 1.2s infinite ease-in-out" : "none"
      }}
      title={title}
    >
      👩
    </div>
  );
}

export function MaleIcon({ size = 32, isPlaying = false, title = "Male Voice" }) {
  const innerFont = Math.max(13, Math.round(size * 0.62));
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #1e40af 100%)",
        boxShadow: isPlaying
          ? "0 0 0 3px rgba(2, 132, 199, 0.45), 0 4px 12px rgba(2, 132, 199, 0.5), inset 0 1px 2px rgba(255,255,255,0.8)"
          : size < 24
            ? "0 2px 5px rgba(2, 132, 199, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.7)"
            : "0 4px 10px rgba(2, 132, 199, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.6)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${innerFont}px`,
        lineHeight: 1,
        flexShrink: 0,
        userSelect: "none",
        transform: isPlaying ? "scale(1.12)" : "scale(1)",
        transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease",
        animation: isPlaying ? "voicePulse 1.2s infinite ease-in-out" : "none"
      }}
      title={title}
    >
      👨
    </div>
  );
}

// Backward compatibility aliases
export const Female3DIcon = FemaleIcon;
export const Male3DIcon = MaleIcon;

// AI Studio Ultra-Realistic Human Voice Models (Korean Female)
export const KOREAN_FEMALE_VOICE_MODELS = VOICE_PROFILES
  .filter(v => v.language === 'ko' && v.gender === 'female')
  .map(v => ({
    id: v.id,
    voiceProfileId: v.id,
    name: v.name,
    title: v.title,
    persona: v.title || v.persona,
    tag: v.tag,
    gender: 'female',
    lang: 'ko',
    isAiStudio: true,
    pitch: v.pitch || '+0Hz',
    rate: v.rate || '+0%',
    voice: v.voice,
    sampleSentence: v.sampleSentence
  }));

// AI Studio Ultra-Realistic Human Voice Models (Korean Male)
export const KOREAN_MALE_VOICE_MODELS = VOICE_PROFILES
  .filter(v => v.language === 'ko' && v.gender === 'male')
  .map(v => ({
    id: v.id,
    voiceProfileId: v.id,
    name: v.name,
    title: v.title,
    persona: v.title || v.persona,
    tag: v.tag,
    gender: 'male',
    lang: 'ko',
    isAiStudio: true,
    pitch: v.pitch || '+0Hz',
    rate: v.rate || '+0%',
    voice: v.voice,
    sampleSentence: v.sampleSentence
  }));

// AI Studio Ultra-Realistic Human Voice Models (Japanese Female)
export const JAPANESE_FEMALE_VOICE_MODELS = VOICE_PROFILES
  .filter(v => v.language === 'ja' && v.gender === 'female')
  .map(v => ({
    id: v.id,
    voiceProfileId: v.id,
    name: v.name,
    title: v.title,
    persona: v.title || v.persona,
    tag: v.tag,
    gender: 'female',
    lang: 'ja',
    isAiStudio: true,
    pitch: v.pitch || '+0Hz',
    rate: v.rate || '+0%',
    voice: v.voice,
    sampleSentence: v.sampleSentence
  }));

// AI Studio Ultra-Realistic Human Voice Models (Japanese Male)
export const JAPANESE_MALE_VOICE_MODELS = VOICE_PROFILES
  .filter(v => v.language === 'ja' && v.gender === 'male')
  .map(v => ({
    id: v.id,
    voiceProfileId: v.id,
    name: v.name,
    title: v.title,
    persona: v.title || v.persona,
    tag: v.tag,
    gender: 'male',
    lang: 'ja',
    isAiStudio: true,
    pitch: v.pitch || '+0Hz',
    rate: v.rate || '+0%',
    voice: v.voice,
    sampleSentence: v.sampleSentence
  }));

export const FEMALE_VOICE_MODELS = KOREAN_FEMALE_VOICE_MODELS;
export const MALE_VOICE_MODELS = KOREAN_MALE_VOICE_MODELS;

export default function DictionarySection({ title = "", instituteLanguage: propInstituteLanguage, userRole: propUserRole }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [loadingAudioId, setLoadingAudioId] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(24);
  const [copiedId, setCopiedId] = useState(null);

  // Effective Institute Language ('both' | 'korean' | 'japanese')
  // Super Admin always has access to 'both' Korean and Japanese dictionaries
  const isAdminUser = propUserRole === 'admin' || (typeof window !== "undefined" && window.location.pathname.startsWith('/admin'));
  const [instLang, setInstLang] = useState(
    isAdminUser
      ? 'both'
      : (propInstituteLanguage ? propInstituteLanguage.toLowerCase() : 'both')
  );

  const initialLang = instLang === 'japanese' ? 'ja' : 'ko';

  // Active Language State ('ko' | 'ja')
  const [activeLang, setActiveLang] = useState(initialLang);
  const [japaneseFilter, setJapaneseFilter] = useState('all'); // 'all' | 'kanji' | 'n5'..'n1' | 'vocab'

  // Selected Voice Models (Unified Active Model State)
  const [selectedVoiceModel, setSelectedVoiceModel] = useState(
    initialLang === 'ja' ? JAPANESE_FEMALE_VOICE_MODELS[0] : KOREAN_FEMALE_VOICE_MODELS[0]
  );
  const [selectedFemaleModel, setSelectedFemaleModel] = useState(
    initialLang === 'ja' ? JAPANESE_FEMALE_VOICE_MODELS[0] : KOREAN_FEMALE_VOICE_MODELS[0]
  );
  const [selectedMaleModel, setSelectedMaleModel] = useState(
    initialLang === 'ja' ? JAPANESE_MALE_VOICE_MODELS[0] : KOREAN_MALE_VOICE_MODELS[0]
  );
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [modelGenderTab, setModelGenderTab] = useState('all'); // 'all' | 'female' | 'male' | 'custom'
  const modelDropdownRef = useRef(null);
  const [isFemaleDropdownOpen, setIsFemaleDropdownOpen] = useState(false);
  const [isMaleDropdownOpen, setIsMaleDropdownOpen] = useState(false);

  // User Voice Library State (Saved/Uploaded Audio Recordings)
  const [voiceLibrary, setVoiceLibrary] = useState([]);
  const [activeCustomVoice, setActiveCustomVoice] = useState(null);

  // Speech Recognition (Voice Input / Search by speech)
  const [isListening, setIsListening] = useState(false);

  // User Voice Studio Modal & Upload States
  const [showVoiceStudio, setShowVoiceStudio] = useState(false);
  const [showAiStudio, setShowAiStudio] = useState(false);
  const aiStudioRef = useRef(null);
  const [voiceStudioTab, setVoiceStudioTab] = useState('upload'); // 'upload' | 'record' | 'library'
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadVoiceName, setUploadVoiceName] = useState('');
  const [uploadWordScope, setUploadWordScope] = useState('particular'); // 'particular' | 'all'
  const [uploadTargetWord, setUploadTargetWord] = useState('');
  const [uploadGender, setUploadGender] = useState('female');
  const [isUploading, setIsUploading] = useState(false);
  const [editingVoiceId, setEditingVoiceId] = useState(null);
  const [editingWordValue, setEditingWordValue] = useState('');

  // Role Detection for Audio Downloads (Strictly Admin and Institute only; NEVER Student)
  // Deterministic initial state for SSR hydration; client permissions resolved in useEffect
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState(
    propUserRole ? String(propUserRole).toLowerCase() : 'student'
  );

  const isStudent = Boolean(
    propUserRole === 'student' ||
    userRole === 'student' ||
    (mounted && typeof window !== 'undefined' && (
      window.location.pathname.includes('/student') ||
      window.location.pathname.includes('/exam') ||
      localStorage.getItem('currentRole') === 'student' ||
      localStorage.getItem('role') === 'student' ||
      localStorage.getItem('userType') === 'student'
    ))
  );

  // Audio download is strictly for verified Admin and Institute users. NEVER for students or public visitors.
  const isStaffOrAdminOrInstitute = Boolean(
    (propUserRole === 'admin' || propUserRole === 'institute' || userRole === 'admin' || userRole === 'institute') &&
    (!mounted || (typeof window !== 'undefined' && (window.location.pathname.includes('/admin') || window.location.pathname.includes('/institute'))))
  );

  const canDownloadAudio = mounted && !isStudent && isStaffOrAdminOrInstitute;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        if (propUserRole) {
          setUserRole(String(propUserRole).toLowerCase());
          return;
        }
        const pathname = window.location.pathname || '';
        if (pathname.includes('/student') || pathname.includes('/exam')) {
          setUserRole('student');
          return;
        }
        if (pathname.includes('/admin')) {
          setUserRole('admin');
          return;
        }
        if (pathname.includes('/institute')) {
          setUserRole('institute');
          return;
        }

        // Strict student detection from local storage keys
        if (
          localStorage.getItem('currentStudentPhone') ||
          localStorage.getItem('studentPhone') ||
          localStorage.getItem('currentStudentPackage') ||
          localStorage.getItem('currentStudentName') ||
          localStorage.getItem('currentRole') === 'student' ||
          localStorage.getItem('role') === 'student' ||
          localStorage.getItem('userType') === 'student'
        ) {
          setUserRole('student');
          return;
        }

        const r = localStorage.getItem('currentRole') || localStorage.getItem('role') || localStorage.getItem('userType');
        if (r) {
          setUserRole(String(r).toLowerCase());
          return;
        }

        const sigmaUser = localStorage.getItem('sigma_current_user');
        if (sigmaUser) {
          try {
            const parsed = JSON.parse(sigmaUser);
            if (parsed?.role) {
              setUserRole(String(parsed.role).toLowerCase());
              return;
            }
          } catch (e) {}
        }

        const u = localStorage.getItem('user');
        if (u) {
          try {
            const parsed = JSON.parse(u);
            if (parsed?.role) {
              setUserRole(String(parsed.role).toLowerCase());
              return;
            }
          } catch (e) {}
        }
      } catch (e) {}

      // Prewarm speech synthesis voices for zero-delay speech playback
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.getVoices();
          window.speechSynthesis.onvoiceschanged = () => {
            try { window.speechSynthesis.getVoices(); } catch (_) {}
          };
        } catch (_) {}
      }
    }
  }, [propUserRole]);

  // Synchronize with Study Track (korean / japanese / both)
  useEffect(() => {
    const isCurrentAdmin =
      propUserRole === 'admin' ||
      userRole === 'admin' ||
      (typeof window !== "undefined" && window.location.pathname.startsWith('/admin'));

    const rawTrack = isCurrentAdmin
      ? 'both'
      : (
          propInstituteLanguage ||
          (typeof window !== "undefined" ? localStorage.getItem("instituteLanguage") : null) ||
          "both"
        ).toLowerCase();

    setInstLang(rawTrack);

    if (rawTrack === "japanese") {
      setActiveLang("ja");
      setSelectedFemaleModel(JAPANESE_FEMALE_VOICE_MODELS[0]);
      setSelectedMaleModel(JAPANESE_MALE_VOICE_MODELS[0]);
      fetchDictionary('', 'ja', 'all');
    } else if (rawTrack === "korean") {
      setActiveLang("ko");
      setSelectedFemaleModel(KOREAN_FEMALE_VOICE_MODELS[0]);
      setSelectedMaleModel(KOREAN_MALE_VOICE_MODELS[0]);
      fetchDictionary('', 'ko', 'all');
    } else {
      fetchDictionary('', activeLang, activeLang === 'ja' ? japaneseFilter : 'all');
    }
  }, [propInstituteLanguage, propUserRole, userRole]);

  // Restore saved voice model preference from localStorage with strict gender validation
  useEffect(() => {
    try {
      const femaleList = activeLang === 'ja' ? JAPANESE_FEMALE_VOICE_MODELS : KOREAN_FEMALE_VOICE_MODELS;
      const maleList = activeLang === 'ja' ? JAPANESE_MALE_VOICE_MODELS : KOREAN_MALE_VOICE_MODELS;

      const sf = localStorage.getItem(`sigma_selected_female_model_${activeLang}`);
      if (sf) {
        const parsed = JSON.parse(sf);
        const isActuallyFemale = parsed?.gender === 'female' || /(?:^|[-_])female(?:[-_\d]|$)/i.test(parsed?.id || '') || (parsed?.name && parsed.name.toLowerCase().includes('female'));
        if (parsed?.id && isActuallyFemale) {
          setSelectedFemaleModel(parsed);
        } else {
          setSelectedFemaleModel(femaleList[0]);
          localStorage.setItem(`sigma_selected_female_model_${activeLang}`, JSON.stringify(femaleList[0]));
        }
      }

      const sm = localStorage.getItem(`sigma_selected_male_model_${activeLang}`);
      if (sm) {
        const parsed = JSON.parse(sm);
        const isFemale = /(?:^|[-_])female(?:[-_\d]|$)/i.test(parsed?.id || '') || parsed?.gender === 'female' || (parsed?.name && parsed.name.toLowerCase().includes('female'));
        if (parsed?.id && !isFemale) {
          setSelectedMaleModel(parsed);
        } else {
          // Purge corrupted female voice from male slot and restore authentic male model
          setSelectedMaleModel(maleList[0]);
          localStorage.setItem(`sigma_selected_male_model_${activeLang}`, JSON.stringify(maleList[0]));
        }
      }
    } catch (e) {}
  }, [activeLang]);

  // Guarantee 100% strict gender separation between Female and Male state models
  useEffect(() => {
    const femaleList = activeLang === 'ja' ? JAPANESE_FEMALE_VOICE_MODELS : KOREAN_FEMALE_VOICE_MODELS;
    const maleList = activeLang === 'ja' ? JAPANESE_MALE_VOICE_MODELS : KOREAN_MALE_VOICE_MODELS;

    // Check if selectedMaleModel has any female identity
    const maleHasFemale = !selectedMaleModel ||
      selectedMaleModel.gender === 'female' ||
      /(?:^|[-_])female(?:[-_\d]|$)/i.test(selectedMaleModel.id || '') ||
      (selectedMaleModel.name && selectedMaleModel.name.toLowerCase().includes('female'));

    if (maleHasFemale) {
      setSelectedMaleModel(maleList[0]);
      try {
        localStorage.setItem(`sigma_selected_male_model_${activeLang}`, JSON.stringify(maleList[0]));
      } catch (e) {}
    }

    // Check if selectedFemaleModel has any male identity
    const femaleHasMale = !selectedFemaleModel ||
      selectedFemaleModel.gender === 'male' ||
      (!/(?:^|[-_])female(?:[-_\d]|$)/i.test(selectedFemaleModel.id || '') && /(?:^|[-_])male(?:[-_\d]|$)/i.test(selectedFemaleModel.id || '')) ||
      (selectedFemaleModel.name && !selectedFemaleModel.name.toLowerCase().includes('female') && selectedFemaleModel.name.toLowerCase().includes('male'));

    if (femaleHasMale) {
      setSelectedFemaleModel(femaleList[0]);
      try {
        localStorage.setItem(`sigma_selected_female_model_${activeLang}`, JSON.stringify(femaleList[0]));
      } catch (e) {}
    }
  }, [selectedMaleModel, selectedFemaleModel, activeLang]);

  // Listen to window storage events if student switches track in another tab
  useEffect(() => {
    const handleStorageChange = (e) => {
      const isCurrentAdmin =
        propUserRole === 'admin' ||
        userRole === 'admin' ||
        (typeof window !== "undefined" && window.location.pathname.startsWith('/admin'));
      if (isCurrentAdmin) {
        setInstLang("both");
        return;
      }
      if (e.key === "instituteLanguage" && e.newValue) {
        const newTrack = e.newValue.toLowerCase();
        setInstLang(newTrack);
        if (newTrack === "japanese" && activeLang !== "ja") {
          handleSwitchLanguage("ja");
        } else if (newTrack === "korean" && activeLang !== "ko") {
          handleSwitchLanguage("ko");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [activeLang, propUserRole, userRole]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        const role = data?.user?.role?.toLowerCase();
        if (role) {
          setUserRole(role);
        }
        const isCurrentAdmin =
          role === 'admin' ||
          propUserRole === 'admin' ||
          (typeof window !== "undefined" && window.location.pathname.startsWith('/admin'));
        if (isCurrentAdmin) {
          setInstLang("both");
          return;
        }
        const apiInstLang = (data?.user?.instituteLanguage || data?.user?.institute?.language || "").toLowerCase();
        if (apiInstLang) {
          setInstLang(apiInstLang);
          if (typeof window !== "undefined") {
            localStorage.setItem("instituteLanguage", apiInstLang);
          }
          if (apiInstLang === "japanese" && activeLang !== "ja") {
            handleSwitchLanguage("ja");
          } else if (apiInstLang === "korean" && activeLang !== "ko") {
            handleSwitchLanguage("ko");
          }
        }
      })
      .catch(() => {});
  }, [propInstituteLanguage, propUserRole]);

  const isInstituteOrAdmin = userRole === 'institute' || userRole === 'admin';

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const audioBufferCacheRef = useRef(new Map()); // Map<cacheKey, { buffer, lowShelf, speed }>
  const audioBlobCacheRef = useRef(new Map()); // Map<url, string (blobUrl)> for millisecond playback
  const femaleDropdownRef = useRef(null);
  const maleDropdownRef = useRef(null);
  const femaleBadgeRef = useRef(null);
  const maleBadgeRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Prefetch AI Studio model audio in background for instant response
  const prefetchAudio = (url) => {
    if (!url || typeof window === 'undefined') return;
    if (audioBlobCacheRef.current.has(url)) return;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.blob();
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        audioBlobCacheRef.current.set(url, blobUrl);
      })
      .catch(() => {});
  };

  // Load Voice Library from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sigma_voice_library');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVoiceLibrary(parsed);
          const active = parsed.find(v => v.isDefault);
          if (active) {
            setActiveCustomVoice(active);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load voice library:', e);
    }
  }, []);

  function saveVoiceLibrary(newLibrary) {
    setVoiceLibrary(newLibrary);
    try {
      localStorage.setItem('sigma_voice_library', JSON.stringify(newLibrary));
    } catch (e) {
      console.warn('Failed to persist voice library:', e);
    }
  }

  // Set an uploaded voice as active in Voice Library
  function handleSetVoiceActive(voiceItem, targetGender = null) {
    const updated = voiceLibrary.map(v => ({
      ...v,
      isDefault: v.id === voiceItem.id
    }));
    saveVoiceLibrary(updated);
    setActiveCustomVoice(voiceItem);

    const customModelObj = {
      id: voiceItem.id,
      name: voiceItem.name,
      persona: `Custom Voice · ${voiceItem.word === 'all' ? 'Global Speech' : `For "${voiceItem.word}"`}`,
      isCustom: true,
      url: voiceItem.url,
      tag: 'My Voice',
      voice: 'custom',
      pitch: '+0Hz',
      rate: '+0%'
    };

    if (targetGender === 'female' || voiceItem.gender === 'female') {
      setSelectedFemaleModel(customModelObj);
    } else if (targetGender === 'male' || voiceItem.gender === 'male') {
      setSelectedMaleModel(customModelObj);
    } else {
      setSelectedFemaleModel(customModelObj);
    }
  }

  function handleDeleteVoice(voiceId) {
    if (!confirm('Are you sure you want to delete this voice from your library?')) return;
    const updated = voiceLibrary.filter(v => v.id !== voiceId);
    saveVoiceLibrary(updated);
    if (activeCustomVoice?.id === voiceId) {
      setActiveCustomVoice(null);
      setSelectedFemaleModel(activeLang === 'ja' ? JAPANESE_FEMALE_VOICE_MODELS[0] : KOREAN_FEMALE_VOICE_MODELS[0]);
      setSelectedMaleModel(activeLang === 'ja' ? JAPANESE_MALE_VOICE_MODELS[0] : KOREAN_MALE_VOICE_MODELS[0]);
    }
  }

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setIsModelDropdownOpen(false);
      }
      if (
        femaleDropdownRef.current && !femaleDropdownRef.current.contains(e.target) &&
        femaleBadgeRef.current && !femaleBadgeRef.current.contains(e.target)
      ) {
        setIsFemaleDropdownOpen(false);
      }
      if (
        maleDropdownRef.current && !maleDropdownRef.current.contains(e.target) &&
        maleBadgeRef.current && !maleBadgeRef.current.contains(e.target)
      ) {
        setIsMaleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleCopyText(text, id) {
    if (!text) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  }


  function handleSwitchLanguage(newLang) {
    if (activeLang === newLang) return;
    if (instLang === 'korean' && newLang !== 'ko') return;
    if (instLang === 'japanese' && newLang !== 'ja') return;
    setActiveLang(newLang);
    setSearchQuery('');
    setSelectedWord(null);
    setJapaneseFilter('all');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingAudioId(null);
    setLoadingAudioId(null);

    if (newLang === 'ja') {
      let savedFem = null;
      let savedMale = null;
      try {
        const sf = localStorage.getItem('sigma_selected_female_model_ja');
        if (sf) {
          const p = JSON.parse(sf);
          if (p?.gender === 'female' || /(?:^|[-_])female/i.test(p?.id || '')) savedFem = p;
        }
        const sm = localStorage.getItem('sigma_selected_male_model_ja');
        if (sm) {
          const p = JSON.parse(sm);
          if (p?.gender === 'male' || (!/(?:^|[-_])female/i.test(p?.id || '') && /(?:^|[-_])male/i.test(p?.id || ''))) savedMale = p;
        }
      } catch (e) {}
      setSelectedFemaleModel(savedFem || JAPANESE_FEMALE_VOICE_MODELS[0]);
      setSelectedMaleModel(savedMale || JAPANESE_MALE_VOICE_MODELS[0]);
      fetchDictionary('', 'ja', 'all');
    } else {
      let savedFem = null;
      let savedMale = null;
      try {
        const sf = localStorage.getItem('sigma_selected_female_model_ko');
        if (sf) {
          const p = JSON.parse(sf);
          if (p?.gender === 'female' || /(?:^|[-_])female/i.test(p?.id || '')) savedFem = p;
        }
        const sm = localStorage.getItem('sigma_selected_male_model_ko');
        if (sm) {
          const p = JSON.parse(sm);
          if (p?.gender === 'male' || (!/(?:^|[-_])female/i.test(p?.id || '') && /(?:^|[-_])male/i.test(p?.id || ''))) savedMale = p;
        }
      } catch (e) {}
      setSelectedFemaleModel(savedFem || KOREAN_FEMALE_VOICE_MODELS[0]);
      setSelectedMaleModel(savedMale || KOREAN_MALE_VOICE_MODELS[0]);
      fetchDictionary('', 'ko', 'all');
    }
  }

  function handleFilterChange(newFilter) {
    setJapaneseFilter(newFilter);
    fetchDictionary(searchQuery.trim(), activeLang, newFilter);
  }

  async function fetchDictionary(q, langOverride, filterOverride) {
    const targetLang = langOverride !== undefined ? langOverride : activeLang;
    const targetFilter = filterOverride !== undefined ? filterOverride : japaneseFilter;
    setLoading(true);
    try {
      const res = await fetch(`/api/dictionary?q=${encodeURIComponent(q)}&lang=${targetLang}&filter=${encodeURIComponent(targetFilter)}&limit=120`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        if (!selectedWord || q) {
          setSelectedWord(data.results[0]);
        }
        // Background prefetch audio for top items so first click plays within milliseconds
        if (typeof window !== 'undefined' && Array.isArray(data.results)) {
          data.results.slice(0, 8).forEach(item => {
            const wordText = item.japanese || item.korean || '';
            if (wordText) {
              const langCode = targetLang === 'ja' ? 'ja' : 'ko';
              const fUrl = `/api/tts?text=${encodeURIComponent(wordText)}&lang=${langCode}&gender=female&voice=${encodeURIComponent(selectedFemaleModel?.voice || (langCode === 'ja' ? 'ja-JP-NanamiNeural' : 'ko-KR-SunHiNeural'))}`;
              prefetchAudio(fUrl);
            }
          });
        }
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Failed to load dictionary:', err);
    }
    setLoading(false);
  }

  function handleSearch(e) {
    e?.preventDefault();
    fetchDictionary(searchQuery.trim(), activeLang, japaneseFilter);
  }

  function speakTextNative(text, lang = 'ko', gender = 'female', id = null) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const clean = (text || '').replace(/[（(][^）)]*[）)]/g, '').replace(/[\/\\]+/g, ', ').trim();
      if (!clean) return false;

      const utterance = new SpeechSynthesisUtterance(clean);
      let langCode = 'ko-KR';
      if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(clean) || lang === 'ja') langCode = 'ja-JP';
      else if (/[\u0900-\u097F]/.test(clean) || lang === 'ne') langCode = 'ne-NP';
      else if (lang === 'en') langCode = 'en-US';
      else if (lang === 'ko') langCode = 'ko-KR';

      utterance.lang = langCode;
      if (gender === 'male') {
        utterance.pitch = 0.74; // Deep, unmistakable male resonance
        utterance.rate = 0.94;
      } else {
        utterance.pitch = 1.18; // Bright, clear feminine acoustic contour
        utterance.rate = 1.00;
      }

      // Strictly resolve genuine male or female voice matching language
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langVoices = voices.filter(v => v.lang && (v.lang.startsWith(langCode.slice(0, 2)) || v.lang.toLowerCase().includes(langCode.slice(0, 2))));
        if (langVoices.length > 0) {
          if (gender === 'male') {
            const maleMatch = langVoices.find(v => {
              const vName = (v.name || '').toLowerCase();
              if (vName.includes('female') || vName.includes('woman') || vName.includes('girl')) return false;
              return vName.includes('male') || vName.includes('david') || vName.includes('keita') || vName.includes('injoon') || vName.includes('george') || vName.includes('sagar') || vName.includes('minho') || vName.includes('sin-ji') || vName.includes('sinji') || vName.includes('otoya') || vName.includes('guy') || vName.includes('ichiro') || vName.includes('kenji') || vName.includes('x-ism') || vName.includes('x-htm') || vName.includes('x-kof') || vName.includes('alex') || vName.includes('fred');
            }) || langVoices.find(v => {
              const vName = (v.name || '').toLowerCase();
              return !vName.includes('female') && !vName.includes('woman') && !vName.includes('girl') && !vName.includes('zira') && !vName.includes('nanami') && !vName.includes('sunhi') && !vName.includes('susan') && !vName.includes('hemkala') && !vName.includes('yuna') && !vName.includes('kyoko') && !vName.includes('ayumi') && !vName.includes('samantha');
            });
            if (maleMatch) {
              utterance.voice = maleMatch;
            }
          } else {
            const femaleMatch = langVoices.find(v => {
              const vName = (v.name || '').toLowerCase();
              return vName.includes('female') || vName.includes('woman') || vName.includes('girl') || vName.includes('zira') || vName.includes('nanami') || vName.includes('sunhi') || vName.includes('susan') || vName.includes('hemkala') || vName.includes('yuna') || vName.includes('kyoko') || vName.includes('ayumi') || vName.includes('heami') || vName.includes('samantha') || vName.includes('victoria') || vName.includes('karen') || vName.includes('jenny');
            }) || langVoices[0];
            if (femaleMatch) utterance.voice = femaleMatch;
          }
        }
      }

      // Keep reference to prevent GC cutting speech off
      window.__activeSpeechUtt = utterance;

      if (id) {
        setPlayingAudioId(id);
        setLoadingAudioId(null);
      }

      utterance.onend = () => {
        window.__activeSpeechUtt = null;
        setPlayingAudioId(null);
        setLoadingAudioId(null);
      };
      utterance.onerror = () => {
        window.__activeSpeechUtt = null;
        setPlayingAudioId(null);
        setLoadingAudioId(null);
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Direct Web Audio playback engine with 100% transparent studio clarity
  function playDecodedSource(buffer, targetGender, speed, id) {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 1.0;

    source.connect(ctx.destination);
    sourceNodeRef.current = source;

    setLoadingAudioId(null);
    setPlayingAudioId(id);

    source.onended = () => {
      setPlayingAudioId(null);
      setLoadingAudioId(null);
      sourceNodeRef.current = null;
    };

    source.start(0);
  }

  function handlePlayAudio(url, id, text = '', lang = '', gender = '', targetModel = null) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.__activeSpeechUtt = null;
    }
    if (playingAudioId === id || loadingAudioId === id) {
      setPlayingAudioId(null);
      setLoadingAudioId(null);
      return;
    }

    // Unlock Web Audio Context on user tap
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }

    // Auto-extract text, lang, gender from url if not explicitly provided
    if (!text && url) {
      try {
        const parsed = new URL(url, 'https://localhost');
        text = parsed.searchParams.get('text') || '';
        if (!lang) lang = parsed.searchParams.get('lang') || '';
        if (!gender) gender = parsed.searchParams.get('gender') || '';
      } catch (e) {
        const m = url.match(/[?&]text=([^&]+)/);
        if (m) text = decodeURIComponent(m[1]);
      }
    }

    const targetGender = gender || (id && id.includes('fem') ? 'female' : 'male');
    const targetLang = lang || activeLang;

    // Check if it's a user's uploaded custom voice file or recorded blob
    const isCustomVoiceFile = url && (
      url.startsWith('blob:') ||
      url.startsWith('data:') ||
      url.includes('/uploads/') ||
      url.includes('/storage/') ||
      id?.includes('custom') ||
      id?.includes('my-voice') ||
      id?.includes('library-')
    );

    // 1. Direct audio playback for uploaded audio files
    if (isCustomVoiceFile) {
      setLoadingAudioId(id);
      setPlayingAudioId(null);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => {
        setLoadingAudioId(null);
        setPlayingAudioId(id);
      };
      audio.onplaying = () => {
        setLoadingAudioId(null);
        setPlayingAudioId(id);
      };
      audio.onended = () => {
        setPlayingAudioId(null);
        setLoadingAudioId(null);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setPlayingAudioId(null);
        setLoadingAudioId(null);
        audioRef.current = null;
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setLoadingAudioId(null);
            setPlayingAudioId(id);
          })
          .catch(() => {
            setPlayingAudioId(null);
            setLoadingAudioId(null);
            audioRef.current = null;
          });
      }
      return;
    }

    // 2. Play high-fidelity synthesized audio with genuine male/female vocal tracts
    if (url) {
      setLoadingAudioId(id);
      setPlayingAudioId(null);

      const speed = 1.0;

      const cacheKey = `${url}_${targetGender}_${targetModel?.id || 'default'}`;
      if (audioBufferCacheRef.current.has(cacheKey) && audioContextRef.current) {
        const cached = audioBufferCacheRef.current.get(cacheKey);
        playDecodedSource(cached.buffer, targetGender, cached.speed, id);
        return;
      }

      // Ultra-Fast Response Engine:
      // Allow up to 4500ms for high-fidelity human neural audio to stream down from server
      const abortController = new AbortController();
      let hasResponded = false;
      const abortTimer = setTimeout(() => {
        if (!hasResponded) {
          abortController.abort();
          if (text) {
            speakTextNative(text, targetLang, targetGender, id);
          }
        }
      }, 4500);

      fetch(url, { signal: abortController.signal })
        .then(res => {
          hasResponded = true;
          clearTimeout(abortTimer);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then(async (arrayBuf) => {
          const ctx = audioContextRef.current;
          if (!ctx) throw new Error('No AudioContext');

          const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
          audioBufferCacheRef.current.set(cacheKey, { buffer: decoded, speed });
          playDecodedSource(decoded, targetGender, speed, id);
        })
        .catch(err => {
          hasResponded = true;
          clearTimeout(abortTimer);
          if (err.name === 'AbortError') return; // already speaking instantly!
          if (text) {
            speakTextNative(text, targetLang, targetGender, id);
          } else {
            setPlayingAudioId(null);
            setLoadingAudioId(null);
          }
        });
      return;
    }

    // 3. Fallback to client speech synthesis if no URL is provided
    if (text && typeof window !== 'undefined' && window.speechSynthesis) {
      speakTextNative(text, targetLang, targetGender, id);
    }
  }

  function handleSelectModel(model) {
    if (!model) return;
    setSelectedVoiceModel(model);
    if (model.gender === 'male') {
      setSelectedMaleModel(model);
    } else {
      setSelectedFemaleModel(model);
    }
    try {
      localStorage.setItem(`sigma_selected_voice_model_${activeLang}`, JSON.stringify(model));
    } catch (e) {}
    setIsModelDropdownOpen(false);
    // One click one play as human voice
    handlePlaySearchWord(model);
  }

  function handlePlaySearchWord(customModel = null, customId = null) {
    const activeModel = customModel || selectedVoiceModel || selectedFemaleModel;
    const audioId = customId || (customModel ? `preview-${customModel.id}` : 'search-active-model');

    if (playingAudioId === audioId || loadingAudioId === audioId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingAudioId(null);
      setLoadingAudioId(null);
      return;
    }

    // 1. If chosen model is user's uploaded voice
    if (activeModel?.isCustom && activeModel.url) {
      handlePlayAudio(activeModel.url, audioId);
      return;
    }

    // 2. Determine text to speak
    const queryText = searchQuery?.trim();
    let textToSpeak = '';
    let lang = activeLang === 'ja' ? 'ja' : 'ko';

    if (customModel?.sampleSentence && !queryText) {
      // Play the model's authentic benchmark sample sentence when previewing from the dropdown
      textToSpeak = customModel.sampleSentence;
    } else {
      const primarySelected = activeLang === 'ja'
        ? (selectedWord?.japanese || selectedWord?.korean)
        : (selectedWord?.korean || selectedWord?.japanese);
      const primaryFallback = activeLang === 'ja'
        ? (results[0]?.japanese || results[0]?.korean)
        : (results[0]?.korean || results[0]?.japanese);

      textToSpeak = queryText || primarySelected || (results.length > 0 ? primaryFallback : '');
    }

    if (!textToSpeak) {
      textToSpeak = customModel?.sampleSentence || (activeLang === 'ja'
        ? 'こんにちは！日本語を勉強しましょう。'
        : '안녕하세요! 한국어를 공부합시다.');
    } else {
      if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(textToSpeak)) {
        lang = 'ja';
      } else if (/[\uAC00-\uD7AF]/.test(textToSpeak)) {
        lang = 'ko';
      } else if (/[\u0900-\u097F]/.test(textToSpeak)) {
        lang = 'ne';
      } else if (/^[a-zA-Z\s]+$/.test(textToSpeak)) {
        lang = activeLang === 'ja' ? 'ja' : (selectedWord?.korean && selectedWord.korean !== textToSpeak ? 'ko' : 'en');
      }

      if (lang === 'ko' && selectedWord?.korean && !/[\uAC00-\uD7AF]/.test(textToSpeak)) {
        textToSpeak = selectedWord.korean;
      } else if (lang === 'ja' && selectedWord?.japanese && !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(textToSpeak)) {
        textToSpeak = selectedWord.japaneseSpoken || selectedWord.japanese;
      }
    }

    // 3. Check if an uploaded custom voice in library is assigned to this specific word or is default
    if (queryText && !customModel) {
      const qLower = queryText.toLowerCase();
      const matchingCustom = voiceLibrary.find(v => {
        if (!v.word || v.word === 'all') return false;
        const wLower = v.word.trim().toLowerCase();
        if (wLower === qLower) return true;
        if (selectedWord?.korean && wLower === selectedWord.korean.toLowerCase()) return true;
        if (selectedWord?.japanese && wLower === selectedWord.japanese.toLowerCase()) return true;
        if (selectedWord?.english && wLower === selectedWord.english.toLowerCase()) return true;
        return false;
      }) || voiceLibrary.find(v => v.word === 'all' && v.isDefault);

      if (matchingCustom) {
        handlePlayAudio(matchingCustom.url, audioId);
        return;
      }
    }

    const isMale = activeModel?.gender === 'male';
    const voiceProfId = activeModel?.voiceProfileId || (
      lang === 'ja'
        ? (isMale ? 'ja-male-1' : 'ja-female-1')
        : (isMale ? 'ko-male-1' : 'ko-female-1')
    );
    // Take authentic human voice from AI Studio with exact male/female profile
    const url = `/api/elevenlabs/tts?text=${encodeURIComponent(textToSpeak)}&voiceProfileId=${encodeURIComponent(voiceProfId)}&gender=${isMale ? 'male' : 'female'}`;
    handlePlayAudio(url, audioId, textToSpeak, lang, isMale ? 'male' : 'female', activeModel);
  }

  function handlePlayCardWord(word, customAudioId = null) {
    if (!word) return;
    const primary = word.japanese || word.korean || word.kanji || word.word;
    const spoken = word.japaneseSpoken || word.spoken || primary;
    const langCode = word.isKanji || activeLang === 'ja' || /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(primary) ? 'ja' : 'ko';
    const audioId = customAudioId || `card-audio-${primary}`;

    if (playingAudioId === audioId || loadingAudioId === audioId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingAudioId(null);
      setLoadingAudioId(null);
      return;
    }

    // Check custom voice in user's library for this word
    const customVoice = voiceLibrary.find(v => {
      if (!v.word || v.word === 'all') return false;
      const w = v.word.trim().toLowerCase();
      return w === primary.toLowerCase() || (word.english && w === word.english.toLowerCase());
    });

    if (customVoice && customVoice.url) {
      handlePlayAudio(customVoice.url, audioId);
      return;
    }

    // Uses the user's chosen active voice model
    const activeModel = selectedVoiceModel || selectedFemaleModel || (langCode === 'ja' ? JAPANESE_FEMALE_VOICE_MODELS[0] : KOREAN_FEMALE_VOICE_MODELS[0]);
    const isMale = activeModel?.gender === 'male';
    const voiceProfId = activeModel?.voiceProfileId || (langCode === 'ja' ? (isMale ? 'ja-male-1' : 'ja-female-1') : (isMale ? 'ko-male-1' : 'ko-female-1'));
    const url = `/api/elevenlabs/tts?text=${encodeURIComponent(spoken || primary)}&voiceProfileId=${encodeURIComponent(voiceProfId)}&gender=${isMale ? 'male' : 'female'}`;
    handlePlayAudio(url, audioId, spoken || primary, langCode, isMale ? 'male' : 'female', activeModel);
  }

  function handleDownloadSearchWord(customModel = null) {
    const activeModel = customModel || selectedVoiceModel || selectedFemaleModel;

    if (activeModel?.isCustom && activeModel.url) {
      handleDownloadAudio(activeModel.url, `${activeModel.name.replace(/\s+/g, '_')}_custom_voice.mp3`);
      return;
    }

    const queryText = searchQuery.trim();
    let textToSpeak = queryText;
    if (!textToSpeak) {
      textToSpeak = activeLang === 'ja'
        ? (selectedWord?.japanese || results[0]?.japanese || '日本語')
        : (selectedWord?.korean || results[0]?.korean || '한국어');
    }

    const langCode = activeLang === 'ja' ? 'ja' : 'ko';
    const isMale = activeModel?.gender === 'male';
    const voiceProfId = activeModel?.voiceProfileId || (langCode === 'ja' ? (isMale ? 'ja-male-1' : 'ja-female-1') : (isMale ? 'ko-male-1' : 'ko-female-1'));
    const isAi = activeModel?.isAiStudio || voiceProfId?.startsWith('ko-') || voiceProfId?.startsWith('ja-');
    const filename = `${(selectedWord?.romaji || textToSpeak).replace(/\s+/g, '_')}_${(activeModel?.name || 'voice').replace(/\s+/g, '_')}.mp3`;

    const dlUrl = isAi
      ? `/api/elevenlabs/tts?text=${encodeURIComponent(textToSpeak)}&voiceProfileId=${encodeURIComponent(voiceProfId)}&gender=${isMale ? 'male' : 'female'}&download=true&filename=${encodeURIComponent(filename)}`
      : `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=${langCode}&gender=${isMale ? 'male' : 'female'}&voice=${encodeURIComponent(activeModel?.voice || '')}&model=${encodeURIComponent(activeModel?.id || '')}&download=true`;

    handleDownloadAudio(dlUrl, filename);
  }

  function handleOpenVoiceStudioForWord(targetWord = '') {
    const defaultWord = activeLang === 'ja'
      ? (selectedWord?.japanese || results[0]?.japanese || '')
      : (selectedWord?.korean || results[0]?.korean || '');
    const wordToUse = (typeof targetWord === 'string' && targetWord.trim()) || searchQuery.trim() || defaultWord;
    setUploadTargetWord(wordToUse);
    setUploadWordScope(wordToUse ? 'particular' : 'all');
    setVoiceStudioTab('upload');
    setShowVoiceStudio(true);
  }

  function handleDownloadAudio(url, filename) {
    if (!canDownloadAudio) {
      alert("Audio download is restricted for students. You can listen directly in the app!");
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'voice_sample.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Voice Search (Speech-to-Text)
  function handleVoiceSearch() {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      alert('Voice speech input is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = activeLang === 'ja' ? 'ja-JP' : 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          fetchDictionary(transcript.trim(), activeLang);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsListening(false);
    }
  }

  // User Voice Recording (MediaRecorder)
  async function startRecording() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      alert('Audio recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedBlob(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is needed to record your voice. Please allow microphone permission.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  }

  // Save Recorded Voice to Library
  async function handleSaveRecordingToLibrary() {
    if (!recordedBlob) return;
    setIsUploading(true);

    const activeWordStr = activeLang === 'ja'
      ? (selectedWord?.japanese || results[0]?.japanese || '')
      : (selectedWord?.korean || results[0]?.korean || '');

    const wordTarget = uploadWordScope === 'particular'
      ? (uploadTargetWord.trim() || searchQuery.trim() || activeWordStr || 'custom')
      : 'all';

    const voiceName = uploadVoiceName.trim() || `My Recording (${wordTarget !== 'all' ? wordTarget : 'Voice'})`;

    try {
      const formData = new FormData();
      formData.append('file', recordedBlob, `recording_${Date.now()}.webm`);
      formData.append('word', wordTarget);

      const res = await fetch('/api/voice-upload', {
        method: 'POST',
        body: formData
      });

      let finalUrl = recordedAudioUrl;
      if (res.ok) {
        const data = await res.json();
        if (data.url) finalUrl = data.url;
      }

      const newVoiceItem = {
        id: `voice-${Date.now()}`,
        name: voiceName,
        url: finalUrl,
        word: wordTarget,
        gender: uploadGender,
        createdAt: new Date().toLocaleDateString(),
        isDefault: wordTarget === 'all'
      };

      const updated = [newVoiceItem, ...voiceLibrary.filter(v => v.id !== newVoiceItem.id)];
      saveVoiceLibrary(updated);
      handleSetVoiceActive(newVoiceItem, uploadGender);
      setVoiceStudioTab('library');
      alert(`Voice "${voiceName}" successfully saved and set for "${wordTarget === 'all' ? 'All Words' : wordTarget}"!`);
    } catch (err) {
      console.error('Error saving recording:', err);
      const newVoiceItem = {
        id: `voice-${Date.now()}`,
        name: voiceName,
        url: recordedAudioUrl,
        word: wordTarget,
        gender: uploadGender,
        createdAt: new Date().toLocaleDateString(),
        isDefault: wordTarget === 'all'
      };
      const updated = [newVoiceItem, ...voiceLibrary.filter(v => v.id !== newVoiceItem.id)];
      saveVoiceLibrary(updated);
      handleSetVoiceActive(newVoiceItem, uploadGender);
      setVoiceStudioTab('library');
    } finally {
      setIsUploading(false);
    }
  }

  // Handle User Uploading Audio File for Speech & Setting in Voice Library
  async function handleUploadVoiceFile(e) {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select an audio file to upload.');
      return;
    }

    setIsUploading(true);

    const activeWordStr = activeLang === 'ja'
      ? (selectedWord?.japanese || results[0]?.japanese || '')
      : (selectedWord?.korean || results[0]?.korean || '');

    const wordTarget = uploadWordScope === 'particular'
      ? (uploadTargetWord.trim() || searchQuery.trim() || activeWordStr || 'custom')
      : 'all';

    const voiceName = uploadVoiceName.trim() || `${uploadFile.name.replace(/\.[^/.]+$/, "")} (${wordTarget !== 'all' ? wordTarget : 'Global'})`;

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('word', wordTarget);

      const res = await fetch('/api/voice-upload', {
        method: 'POST',
        body: formData
      });

      let audioUrl = '';
      if (res.ok) {
        const data = await res.json();
        audioUrl = data.url;
      } else {
        // Fallback to local Data URL
        audioUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(uploadFile);
        });
      }

      const newVoiceItem = {
        id: `voice-${Date.now()}`,
        name: voiceName,
        fileName: uploadFile.name,
        url: audioUrl,
        word: wordTarget,
        gender: uploadGender,
        createdAt: new Date().toLocaleDateString(),
        isDefault: wordTarget === 'all'
      };

      const updated = [newVoiceItem, ...voiceLibrary.filter(v => v.id !== newVoiceItem.id)];
      saveVoiceLibrary(updated);
      handleSetVoiceActive(newVoiceItem, uploadGender);

      setUploadFile(null);
      setUploadVoiceName('');
      setUploadTargetWord('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setVoiceStudioTab('library');
      alert(`Voice "${voiceName}" uploaded successfully and set for "${wordTarget === 'all' ? 'All Words' : wordTarget}"!`);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload audio file. Please ensure it is a valid MP3, WAV, or M4A file under 15MB.');
    } finally {
      setIsUploading(false);
    }
  }

  const filteredWords = results;
  const currentActiveWord = selectedWord || (results.length > 0 ? results[0] : null);
  const currentFemaleVoices = activeLang === 'ja' ? JAPANESE_FEMALE_VOICE_MODELS : KOREAN_FEMALE_VOICE_MODELS;
  const currentMaleVoices = activeLang === 'ja' ? JAPANESE_MALE_VOICE_MODELS : KOREAN_MALE_VOICE_MODELS;
  const allAvailableModels = [
    ...currentFemaleVoices.map(m => ({ ...m, gender: 'female' })),
    ...currentMaleVoices.map(m => ({ ...m, gender: 'male' })),
    ...voiceLibrary.map(v => ({
      id: `custom-${v.id || v.name}`,
      name: v.name || 'Custom Voice',
      gender: v.gender || 'female',
      tag: `⭐ ${v.word || 'Custom'}`,
      isCustom: true,
      url: v.url
    }))
  ];

  const activeWordString = activeLang === 'ja'
    ? (currentActiveWord?.japanese || currentActiveWord?.kanji || searchQuery.trim() || '')
    : (currentActiveWord?.korean || searchQuery.trim() || '');

  const searchedTerm = searchQuery.trim().toLowerCase();
  const matchingSearchedCustomVoice = searchedTerm
    ? voiceLibrary.find(v => {
        if (!v.word || v.word === 'all') return false;
        const target = v.word.trim().toLowerCase();
        if (target === searchedTerm) return true;
        if (results && results.length > 0) {
          const top = results[0];
          if (top.korean && top.korean.toLowerCase() === target) return true;
          if (top.japanese && top.japanese.toLowerCase() === target) return true;
          if (top.english && top.english.toLowerCase() === target) return true;
          if (top.nepali && top.nepali.toLowerCase() === target) return true;
        }
        return false;
      })
    : null;

  return (
    <div
      onContextMenu={(e) => e.stopPropagation()}
      className="dict-main-container"
      style={{
        backgroundColor: "transparent",
        borderRadius: "0",
        border: "none",
        padding: "8px 2px",
        boxShadow: "none",
        maxWidth: "100%",
        width: "100%",
        margin: "0 auto",
        userSelect: "text",
        WebkitUserSelect: "text",
        MozUserSelect: "text",
        msUserSelect: "text"
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes voicePulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.16); filter: brightness(1.18); }
        }
        @keyframes popupFadeIn {
          0% { opacity: 0; transform: translateY(-4px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
        @keyframes dropdownMenuIn {
          0% { opacity: 0; transform: translateY(-6px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .dict-main-container {
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          padding: 8px 2px !important;
          background-color: transparent !important;
          max-width: 100% !important;
          width: 100% !important;
        }
        .dict-word-row {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.15s ease;
          width: 100%;
          box-sizing: border-box;
          gap: 14px;
        }
        .dict-word-row:hover {
          background-color: #f8fafc;
        }
        .dict-col-word {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 170px;
          flex: 0 0 200px;
          flex-shrink: 0;
        }
        .dict-col-pron {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          min-width: 160px;
          flex: 0 0 220px;
          flex-shrink: 0;
        }
        .dict-col-meaning {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          flex: 1;
        }
        .dict-audio-circle-btn {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 50%;
          border: 1.5px solid #cbd5e1;
          background-color: #ffffff;
          color: #2563eb;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
          padding: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: all 0.15s ease;
        }
        .dict-audio-circle-btn:hover {
          transform: scale(1.08);
          border-color: #93c5fd;
        }
        .dict-top-toolbar {
          white-space: nowrap;
        }
        .dict-top-toolbar::-webkit-scrollbar {
          height: 3px;
        }
        .dict-top-toolbar::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.4);
          border-radius: 4px;
        }
        @media (max-width: 768px) {
          .dict-main-container {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 8px 2px !important;
            background-color: transparent !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .dict-word-row {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
            padding: 9px 4px !important;
            border-bottom: 1px solid #f1f5f9 !important;
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            white-space: normal !important;
          }
          .dict-col-word {
            min-width: auto !important;
            flex: none !important;
            width: 100% !important;
            gap: 8px !important;
          }
          .dict-col-pron {
            min-width: auto !important;
            flex: none !important;
            padding-left: 36px !important;
            gap: 5px !important;
          }
          .dict-col-meaning {
            min-width: auto !important;
            flex: none !important;
            padding-left: 36px !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .dict-audio-circle-btn {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            font-size: 11px !important;
          }
        }
        @media (max-width: 640px) {
          .dict-top-toolbar {
            gap: 4px !important;
          }
        }
      ` }} />

      {title && (
        <div style={{ marginBottom: "14px" }}>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px" }}>{title}</h2>
        </div>
      )}

      {/* Unified One-Row Shrunk Toolbar: Search Input, Go, Voice Model, Play, Download, and AI Studio */}
      <form onSubmit={handleSearch} className="dict-top-toolbar" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", width: "100%", flexWrap: "nowrap", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "3px" }}>
        {/* 1. Search Input Box */}
        <div style={{ position: "relative", flex: "1 1 140px", minWidth: "120px" }}>
          <input
            type="text"
            placeholder={
              activeLang === 'ja'
                ? "Type Japanese, Nepali, English..."
                : "Type Korean, Nepali, English..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            style={{
              width: "100%",
              padding: "7px 28px 7px 10px",
              borderRadius: "7px",
              border: "1.5px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
              height: "36px",
              boxSizing: "border-box",
              backgroundColor: "#f8fafc",
              transition: "border 0.2s, background 0.2s"
            }}
            onFocus={(e) => { e.target.style.borderColor = activeLang === 'ja' ? "#9333ea" : "#2563eb"; e.target.style.backgroundColor = "#fff"; }}
            onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.backgroundColor = "#f8fafc"; }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); fetchDictionary('', activeLang); }}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "12px",
                padding: 0
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* 3. 🔍 GO BUTTON */}
        <button
          type="submit"
          disabled={loading}
          title="Click Go or press Enter to find result"
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "0 13px",
            height: "36px",
            borderRadius: "7px",
            fontSize: "13px",
            fontWeight: "800",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            boxShadow: "0 1px 4px rgba(37,99,235,0.25)",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "background 0.15s, transform 0.1s"
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>{loading ? "..." : "Go"}</span>
        </button>

        {/* 4. ⭐ MY VOICE BUTTON FOR THIS SEARCHED WORD (If uploaded voice matches searched word) */}
        {matchingSearchedCustomVoice && (
          <div style={{ display: "inline-flex", borderRadius: "7px", overflow: "hidden", border: "1.5px solid #86efac", background: "#f0fdf4", boxShadow: "0 1px 4px rgba(16, 185, 129, 0.15)", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => handlePlayAudio(matchingSearchedCustomVoice.url, 'search-custom-voice')}
              title={`Play custom uploaded voice for "${matchingSearchedCustomVoice.word}" (${matchingSearchedCustomVoice.name})`}
              style={{
                backgroundColor: playingAudioId === 'search-custom-voice' ? "#15803d" : loadingAudioId === 'search-custom-voice' ? "#16a34a" : "transparent",
                color: playingAudioId === 'search-custom-voice' || loadingAudioId === 'search-custom-voice' ? "#ffffff" : "#15803d",
                border: "none",
                padding: "0 9px",
                height: "36px",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              <span style={{ fontSize: "12px" }}>⭐</span>
              <span>{playingAudioId === 'search-custom-voice' ? "⏹ Stop" : `▶ My Voice (${matchingSearchedCustomVoice.word})`}</span>
            </button>
            {canDownloadAudio && (
              <button
                type="button"
                onClick={() => handleDownloadAudio(matchingSearchedCustomVoice.url, `${matchingSearchedCustomVoice.word}_my_voice.mp3`)}
                title={`Download custom voice (${matchingSearchedCustomVoice.name})`}
                style={{
                  backgroundColor: "transparent",
                  color: "#15803d",
                  border: "none",
                  borderLeft: "1.5px solid #86efac",
                  padding: "0 8px",
                  height: "36px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                📥
              </button>
            )}
          </div>
        )}

        {/* 5. UNIFIED VOICE MODEL SELECTOR, PLAY & DOWNLOAD */}
        <div ref={modelDropdownRef} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
          {/* Model Picker Pill Button */}
          <button
            type="button"
            onClick={() => setIsModelDropdownOpen(prev => !prev)}
            title="Choose Voice Model for Playback and Download"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: selectedVoiceModel?.gender === 'male' ? "#f0f9ff" : "#fff1f2",
              border: `1.5px solid ${selectedVoiceModel?.gender === 'male' ? '#bae6fd' : '#fecdd3'}`,
              padding: "0 8px 0 6px",
              borderRadius: "7px",
              height: "36px",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap"
            }}
          >
            {selectedVoiceModel?.gender === 'male' ? (
              <MaleIcon size={20} isPlaying={playingAudioId === 'search-active-model'} />
            ) : (
              <FemaleIcon size={20} isPlaying={playingAudioId === 'search-active-model'} />
            )}
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.1 }}>
              <span style={{ fontSize: "9px", fontWeight: "700", color: "#64748b" }}>Choose Model</span>
              <span style={{ fontSize: "11.5px", fontWeight: "800", color: selectedVoiceModel?.gender === 'male' ? "#0369a1" : "#be185d" }}>
                {selectedVoiceModel?.name || (activeLang === 'ja' ? "Japanese 1" : "Korean 1")}
              </span>
            </div>
            <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "2px" }}>
              {isModelDropdownOpen ? "▲" : "▼"}
            </span>
          </button>

          {/* Play Audio with Chosen Model */}
          <button
            type="button"
            onClick={() => handlePlaySearchWord()}
            title={`Play searched word with ${selectedVoiceModel?.name || 'Active Model'}`}
            style={{
              backgroundColor: playingAudioId === 'search-active-model'
                ? (selectedVoiceModel?.gender === 'male' ? "#0284c7" : "#e11d48")
                : loadingAudioId === 'search-active-model'
                ? "#64748b"
                : (selectedVoiceModel?.gender === 'male' ? "#0369a1" : "#be185d"),
              color: "#ffffff",
              border: "none",
              padding: "0 11px",
              height: "36px",
              borderRadius: "7px",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              whiteSpace: "nowrap",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              transition: "all 0.15s ease"
            }}
          >
            {loadingAudioId === 'search-active-model' ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⏳</span>
                <span>Wait</span>
              </>
            ) : playingAudioId === 'search-active-model' ? (
              <>
                <span>⏹</span>
                <span>Stop</span>
              </>
            ) : (
              <>
                <span>🔊</span>
                <span>Play</span>
              </>
            )}
          </button>

          {/* Download MP3 with Chosen Model */}
          {canDownloadAudio && (
            <button
              type="button"
              onClick={() => handleDownloadSearchWord()}
              title={`Download MP3 pronunciation with ${selectedVoiceModel?.name || 'Active Model'}`}
              style={{
                backgroundColor: "#ffffff",
                color: selectedVoiceModel?.gender === 'male' ? "#0284c7" : "#be185d",
                border: `1.5px solid ${selectedVoiceModel?.gender === 'male' ? '#bae6fd' : '#fecdd3'}`,
                padding: "0 9px",
                height: "36px",
                borderRadius: "7px",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                transition: "all 0.15s ease"
              }}
            >
              📥
            </button>
          )}

          {/* Unified Voice Models Dropdown Menu */}
          {isModelDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                zIndex: 100000,
                width: "285px",
                maxWidth: "min(285px, calc(100vw - 20px))",
                boxSizing: "border-box",
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.08)",
                border: "1.5px solid #e2e8f0",
                overflow: "hidden",
                animation: "fadeIn 0.15s ease-out"
              }}
            >
              {/* Header with Title & Close Button */}
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "800", color: "#0f172a" }}>
                  Choose Model
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600" }}>
                    ({allAvailableModels.length} models)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModelDropdownOpen(false);
                    }}
                    title="Close"
                    aria-label="Close"
                    style={{
                      border: "none",
                      backgroundColor: "#e2e8f0",
                      color: "#475569",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Model List Scroll Area */}
              <div style={{ maxHeight: "330px", overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "5px" }}>
                {allAvailableModels.map(model => {
                    const isSelected = selectedVoiceModel?.id === model.id;
                    const isMale = model.gender === 'male';
                    return (
                      <div
                        key={model.id}
                        onClick={() => handleSelectModel(model)}
                        title={`Select & play with ${model.name}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: "8px",
                          marginBottom: "3px",
                          cursor: "pointer",
                          backgroundColor: isSelected ? (isMale ? "#eff6ff" : "#fff1f2") : "transparent",
                          border: isSelected ? `1.5px solid ${isMale ? '#93c5fd' : '#fecdd3'}` : "1.5px solid transparent",
                          transition: "background 0.12s ease",
                          gap: "8px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                          {isMale ? (
                            <MaleIcon size={26} isPlaying={playingAudioId === `preview-${model.id}`} />
                          ) : (
                            <FemaleIcon size={26} isPlaying={playingAudioId === `preview-${model.id}`} />
                          )}
                          <div style={{ minWidth: 0, textAlign: "left", flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "800", color: isSelected ? (isMale ? "#0369a1" : "#be185d") : "#1e293b", whiteSpace: "nowrap" }}>
                                {model.name}
                              </span>
                              {model.isCustom && (
                                <span style={{ fontSize: "8.5px", background: "#fef3c7", color: "#92400e", padding: "1px 4px", borderRadius: "3px", fontWeight: "700" }}>⭐</span>
                              )}
                            </div>
                            <span style={{ fontSize: "10.5px", color: "#64748b", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {model.tag || model.description || "Voice Model"}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                          {/* Tick Sign BEFORE the play button */}
                          <span
                            style={{
                              width: "16px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isMale ? "#0284c7" : "#e11d48",
                              fontWeight: "900",
                              fontSize: "13px",
                              lineHeight: 1
                            }}
                          >
                            {isSelected ? "✓" : ""}
                          </span>

                          {/* One Click Play Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectModel(model);
                            }}
                            title={`One click play with ${model.name}`}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              border: "none",
                              backgroundColor: playingAudioId === `preview-${model.id}` || (isSelected && playingAudioId === 'search-active-model') ? (isMale ? "#0284c7" : "#e11d48") : "#f1f5f9",
                              color: playingAudioId === `preview-${model.id}` || (isSelected && playingAudioId === 'search-active-model') ? "#ffffff" : "#475569",
                              fontSize: "11px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.12s ease",
                              flexShrink: 0
                            }}
                          >
                            {loadingAudioId === `preview-${model.id}` ? "⏳" : playingAudioId === `preview-${model.id}` || (isSelected && playingAudioId === 'search-active-model') ? "⏹" : "▶"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* 6. AI STUDIO TOGGLE BUTTON (Compact at the end of the single row) */}
        <button
          type="button"
          onClick={() => {
            setShowAiStudio(prev => {
              const nextState = !prev;
              if (nextState) {
                setTimeout(() => {
                  aiStudioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 80);
              }
              return nextState;
            });
          }}
          title={showAiStudio ? "Close AI Studio" : "Open AI Studio directly under Dictionary"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: showAiStudio
              ? "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)"
              : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "#ffffff",
            padding: "0 10px 0 5px",
            borderRadius: "18px",
            border: showAiStudio ? "1.5px solid #c084fc" : "1.5px solid #6366f1",
            height: "36px",
            boxSizing: "border-box",
            cursor: "pointer",
            boxShadow: showAiStudio ? "0 0 10px rgba(168, 85, 247, 0.4)" : "0 1px 6px rgba(79, 70, 229, 0.25)",
            transition: "all 0.15s ease",
            flexShrink: 0,
            whiteSpace: "nowrap"
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #c084fc 0%, #9333ea 50%, #4f46e5 100%)",
              boxShadow: "0 1px 3px rgba(124, 58, 237, 0.4)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              flexShrink: 0
            }}
          >
            🎙️
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, textAlign: "left" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff" }}>AI Studio</span>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.85)", fontWeight: "600" }}>Voice Studio</span>
          </div>
        </button>
      </form>

      {/* EMBEDDED AI STUDIO (Opens directly under dictionary toolbar when clicked) */}
      {showAiStudio && (
        <div ref={aiStudioRef} style={{ marginBottom: "20px" }}>
          <AiStudio
            embedded={true}
            userRole={userRole}
            initialLang={activeLang}
            instituteLanguage={instLang}
            initialText={searchQuery || (activeLang === 'ja' ? selectedWord?.japanese : selectedWord?.korean) || ''}
            activeFemaleModelId={selectedFemaleModel?.id}
            activeMaleModelId={selectedMaleModel?.id}
            onSelectVoiceModel={(voice) => {
              const isFemale = voice.gender === 'female' || /(?:^|[-_])female(?:[-_\d]|$)/i.test(voice.id || '') || (voice.name && voice.name.toLowerCase().includes('female'));
              const isMale = !isFemale && (voice.gender === 'male' || /(?:^|[-_])male(?:[-_\d]|$)/i.test(voice.id || ''));
              if (isMale) {
                const list = activeLang === 'ja' ? JAPANESE_MALE_VOICE_MODELS : KOREAN_MALE_VOICE_MODELS;
                const match = list.find(m => m.id === voice.id) || voice;
                setSelectedMaleModel(match);
                try {
                  localStorage.setItem(`sigma_selected_male_model_${activeLang}`, JSON.stringify(match));
                } catch (e) {}
              } else if (isFemale) {
                const list = activeLang === 'ja' ? JAPANESE_FEMALE_VOICE_MODELS : KOREAN_FEMALE_VOICE_MODELS;
                const match = list.find(m => m.id === voice.id) || voice;
                setSelectedFemaleModel(match);
                try {
                  localStorage.setItem(`sigma_selected_female_model_${activeLang}`, JSON.stringify(match));
                } catch (e) {}
              }
            }}
            onClose={() => setShowAiStudio(false)}
          />
        </div>
      )}

      {/* 📚 SEARCHABLE VOCABULARY WORDS GALLERY & AUDIO PLAYERS */}
      <div style={{ marginBottom: "28px" }}>
        {/* Search Results indicator if searching */}
        {searchQuery && (
          <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
              Results for &ldquo;<strong style={{ color: "#0f172a" }}>{searchQuery}</strong>&rdquo; ({filteredWords.length})
            </span>
          </div>
        )}

        {/* Japanese Kanji & JLPT Level Filter Pills (Centered & Green) */}
        {activeLang === 'ja' && (
          <div style={{
            marginBottom: "18px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            width: "100%"
          }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'kanji', label: '1000 Kanji' },
              { id: 'n5', label: 'N5 (81)' },
              { id: 'n4', label: 'N4 (168)' },
              { id: 'n3', label: 'N3 (321)' },
              { id: 'n2', label: 'N2 (254)' },
              { id: 'n1', label: 'N1 (182)' },
              { id: 'vocab', label: 'Vocabulary' }
            ].map((f) => {
              const isActive = japaneseFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFilterChange(f.id)}
                  style={{
                    backgroundColor: isActive ? "#16a34a" : "#f0fdf4",
                    color: isActive ? "#ffffff" : "#15803d",
                    border: isActive ? "1.5px solid #15803d" : "1.5px solid #bbf7d0",
                    borderRadius: "18px",
                    padding: "5px 14px",
                    fontSize: "12px",
                    fontWeight: isActive ? "800" : "700",
                    cursor: "pointer",
                    boxShadow: isActive ? "0 2px 8px rgba(22, 163, 74, 0.35)" : "none",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "#dcfce7";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "#f0fdf4";
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Word Cards Grid */}
        {filteredWords.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 20px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
            <div style={{ color: "#64748b", marginBottom: "8px", display: "flex", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <div style={{ fontWeight: "700", color: "#334155", fontSize: "14px" }}>No matching vocabulary or kanji found</div>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0" }}>Try typing in Kanji, Hiragana, Romaji, Nepali or English</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", boxSizing: "border-box" }}>
              {filteredWords.slice(0, displayLimit).map((word, idx) => {
                const primaryWord = activeLang === 'ja'
                  ? (word.japanese || word.korean)
                  : (word.korean || word.japanese);
                const writtenWord = activeLang === 'ja'
                  ? (word.japaneseWritten || word.japanese || word.korean)
                  : (word.koreanWritten || word.korean);
                const spokenWord = activeLang === 'ja'
                  ? (word.japaneseSpoken || word.japanese || word.korean)
                  : (word.koreanSpoken || word.korean);
                const romaji = activeLang === 'ja'
                  ? (word.japaneseRomanized || word.koreanRomanized)
                  : (word.koreanRomanized || word.japaneseRomanized);
                const nepaliPhonetic = activeLang === 'ja'
                  ? (word.japaneseNepaliRomanized || word.koreanNepaliRomanized)
                  : (word.koreanNepaliRomanized || word.japaneseNepaliRomanized);

                const isSelected = (selectedWord?.japanese && selectedWord.japanese === word.japanese) ||
                  (selectedWord?.korean && selectedWord.korean === word.korean) ||
                  selectedWord === word;

                const isPlayingFem = playingAudioId === `card-fem-${primaryWord}` || playingAudioId === `popup-fem-${primaryWord}`;
                const isPlayingMale = playingAudioId === `card-male-${primaryWord}` || playingAudioId === `popup-male-${primaryWord}`;
                const isPlayingCard = playingAudioId === `card-${primaryWord}`;
                const isPlayingAny = isPlayingFem || isPlayingMale || isPlayingCard;

                const hasBatchimRule = activeLang === 'ko' && Boolean(
                  word.hasBatchimRule ||
                  word.koreanBatchimRule ||
                  (word.koreanWritten && word.koreanSpoken && word.koreanWritten !== word.koreanSpoken)
                );
                const batchimRuleText = word.koreanBatchimRule || (hasBatchimRule ? '음절끝소리 규칙 (받침 발음 변화)' : '');

                const hasRule = activeLang === 'ja' && Boolean(word.hasRule || word.pronunciationRule);
                const ruleBadge = word.isKanji ? "漢字" : "発音 / Rule";

                // Check if user has uploaded voice for this word
                const customVoiceForWord = voiceLibrary.find(v => {
                  if (!v.word || v.word === 'all') return false;
                  const target = v.word.trim().toLowerCase();
                  return (
                    target === primaryWord?.toLowerCase() ||
                    target === spokenWord?.toLowerCase() ||
                    (word.korean && target === word.korean.toLowerCase()) ||
                    (word.japanese && target === word.japanese.toLowerCase()) ||
                    (word.kanji && target === word.kanji.toLowerCase()) ||
                    (word.english && target === word.english.toLowerCase())
                  );
                });

                return (
                  <div
                    key={`${primaryWord}-${idx}`}
                    onClick={() => {
                      setSelectedWord(word);
                      handlePlayCardWord(word, `card-${primaryWord}`);
                    }}
                    className="dict-word-row"
                    style={{
                      backgroundColor: isPlayingAny
                        ? (activeLang === 'ja' ? "#faf5ff" : "#eff6ff")
                        : isSelected
                        ? (activeLang === 'ja' ? "#f5f3ff" : "#f0f9ff")
                        : (idx % 2 === 0 ? "#ffffff" : "#fcfcfc"),
                      borderLeft: isPlayingAny
                        ? (activeLang === 'ja' ? "3.5px solid #9333ea" : "3.5px solid #2563eb")
                        : "3.5px solid transparent",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9"
                    }}
                  >
                    {/* COLUMN 1: Audio Circular Button + Word in Original Script */}
                    <div className="dict-col-word">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayCardWord(word, `card-${primaryWord}`);
                        }}
                        title="उच्चारण सुन्नुहोस् (Listen Pronunciation)"
                        className="dict-audio-circle-btn"
                        style={{
                          backgroundColor: isPlayingAny
                            ? (activeLang === 'ja' ? "#9333ea" : "#2563eb")
                            : "#ffffff",
                          color: isPlayingAny
                            ? "#ffffff"
                            : (activeLang === 'ja' ? "#9333ea" : "#2563eb"),
                          borderColor: isPlayingAny
                            ? (activeLang === 'ja' ? "#7e22ce" : "#1d4ed8")
                            : "#cbd5e1",
                          boxShadow: isPlayingAny
                            ? (activeLang === 'ja' ? "0 0 0 3.5px rgba(147,51,234,0.3)" : "0 0 0 3.5px rgba(37,99,235,0.28)")
                            : "0 1px 3px rgba(0,0,0,0.06)"
                        }}
                      >
                        {isPlayingAny ? "⏹" : "🔊"}
                      </button>

                      {/* Kanji Badge if applicable */}
                      {word.isKanji && (
                        <span
                          style={{
                            fontSize: "17px",
                            fontWeight: "900",
                            color: "#581c87",
                            backgroundColor: "#faf5ff",
                            border: "1px solid #d8b4fe",
                            padding: "1px 6px",
                            borderRadius: "5px",
                            lineHeight: 1,
                            whiteSpace: "nowrap"
                          }}
                        >
                          {word.kanji}
                        </span>
                      )}

                      {/* Word text */}
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "800",
                          color: "#0f172a",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {primaryWord}
                      </span>
                    </div>

                    {/* COLUMN 2: Nepali Pronunciation Badge */}
                    <div className="dict-col-pron">
                      {(nepaliPhonetic || romaji) && (
                        <span
                          style={{
                            fontSize: "12.5px",
                            fontWeight: "700",
                            color: activeLang === 'ja' ? "#7e22ce" : "#1e40af",
                            backgroundColor: activeLang === 'ja' ? "#fdf4ff" : "#f0fdf4",
                            padding: "2px 7px",
                            borderRadius: "5px",
                            border: activeLang === 'ja' ? "1px solid #f5d0fe" : "1px solid #bbf7d0",
                            whiteSpace: "nowrap"
                          }}
                        >
                          [{nepaliPhonetic || romaji}]
                        </span>
                      )}
                    </div>

                    {/* COLUMN 3: Meanings (Nepali in Green + English in Grey) */}
                    <div className="dict-col-meaning">
                      <span
                        style={{
                          color: "#15803d",
                          fontWeight: "700",
                          fontSize: "14.5px"
                        }}
                      >
                        {word.nepali}
                      </span>

                      {word.english && (
                        <span
                          style={{
                            color: "#64748b",
                            fontWeight: "600",
                            fontSize: "12.5px"
                          }}
                        >
                          ({word.english})
                        </span>
                      )}

                      {customVoiceForWord && (
                        <span
                          title="Custom voice available"
                          style={{
                            fontSize: "11px",
                            backgroundColor: "#dcfce7",
                            color: "#15803d",
                            border: "1px solid #86efac",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            fontWeight: "700",
                            whiteSpace: "nowrap"
                          }}
                        >
                          ⭐ My Voice
                        </span>
                      )}

                      {word.isKanji && word.jlpt && (
                        <span style={{ fontSize: "11px", backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "1px 6px", borderRadius: "4px", fontWeight: "800", whiteSpace: "nowrap" }}>
                          N{word.jlpt}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More Button */}
            {filteredWords.length > displayLimit && (
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setDisplayLimit(prev => prev + 24)}
                  style={{
                    backgroundColor: "#f8fafc",
                    color: activeLang === 'ja' ? "#9333ea" : "#2563eb",
                    border: activeLang === 'ja' ? "1.5px solid #d8b4fe" : "1.5px solid #bfdbfe",
                    padding: "8px 24px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Show More ({filteredWords.length - displayLimit} words remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* PRONUNCIATION RULES GUIDE (DYNAMICALLY SWITCHES BETWEEN KOREAN BATCHIM AND JAPANESE KANA & PHONOLOGY) */}
      {activeLang === 'ja' ? (
        <JapanesePronunciationGuide handlePlayAudio={handlePlayAudio} playingAudioId={playingAudioId} />
      ) : (
        <BatchimRulesGuide handlePlayAudio={handlePlayAudio} playingAudioId={playingAudioId} />
      )}

      {/* 🎙️ USER OWN VOICE RECORDING, AUDIO UPLOAD & VOICE LIBRARY STUDIO MODAL */}
      {showVoiceStudio && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
          onClick={() => setShowVoiceStudio(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "560px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              border: "1px solid #e2e8f0",
              animation: "popupFadeIn 0.22s ease-out"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#2563eb", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>Voice Library & Speech Studio</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>आफ्नो आवाज अडियो अपलोड गर्नुहोस् र भ्वाइस लाइब्रेरीमा सेट गर्नुहोस्</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceStudio(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {/* Target Word Display */}
            <div style={{ backgroundColor: activeLang === 'ja' ? "#faf5ff" : "#f8fafc", borderRadius: "12px", border: activeLang === 'ja' ? "1.5px solid #e9d5ff" : "1.5px solid #e2e8f0", padding: "14px", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: (activeLang === 'ja' && currentActiveWord?.isKanji) ? "36px" : "24px", fontWeight: "900", color: activeLang === 'ja' ? "#7e22ce" : "#1e3a8a", marginBottom: "2px", lineHeight: 1.1 }}>
                {uploadTargetWord.trim() || (activeLang === 'ja'
                  ? (currentActiveWord?.kanji || currentActiveWord?.japanese || searchQuery || "日本語")
                  : (currentActiveWord?.korean || searchQuery || "한국어"))}
              </div>
              <div style={{ fontSize: "13px", color: activeLang === 'ja' ? "#9333ea" : "#2563eb", fontWeight: "700" }}>
                {activeLang === 'ja'
                  ? `[${currentActiveWord?.japaneseSpoken || currentActiveWord?.japanese || "japanese"}] · [${currentActiveWord?.japaneseNepaliRomanized || currentActiveWord?.japaneseRomanized || "japanese"}]`
                  : `[${currentActiveWord?.koreanSpoken || currentActiveWord?.korean || "korean"}] · [${currentActiveWord?.koreanNepaliRomanized || currentActiveWord?.koreanRomanized || "korean"}]`}
              </div>
              <div style={{ marginTop: "4px", fontSize: "13px", color: "#15803d", fontWeight: "600" }}>
                {currentActiveWord?.nepali || "नेपाली अर्थ"}
              </div>
              {uploadWordScope === 'particular' && uploadTargetWord.trim() && (
                <div style={{ marginTop: "6px", display: "inline-block", backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "800" }}>
                  🎯 Voice will speak for &ldquo;{uploadTargetWord.trim()}&rdquo; on search
                </div>
              )}
            </div>

            {/* Studio Navigation Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
              <button
                type="button"
                onClick={() => setVoiceStudioTab('upload')}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: voiceStudioTab === 'upload' ? "#2563eb" : "#f1f5f9",
                  color: voiceStudioTab === 'upload' ? "#ffffff" : "#475569",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer"
                }}
              >
                📤 Upload Audio
              </button>
              <button
                type="button"
                onClick={() => setVoiceStudioTab('record')}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: voiceStudioTab === 'record' ? "#ef4444" : "#f1f5f9",
                  color: voiceStudioTab === 'record' ? "#ffffff" : "#475569",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer"
                }}
              >
                🔴 Record Voice
              </button>
              <button
                type="button"
                onClick={() => setVoiceStudioTab('library')}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: voiceStudioTab === 'library' ? "#059669" : "#f1f5f9",
                  color: voiceStudioTab === 'library' ? "#ffffff" : "#475569",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer"
                }}
              >
                📚 Library ({voiceLibrary.length})
              </button>
            </div>

            {/* TAB 1: 📤 UPLOAD AUDIO FILE TO SET IN VOICE LIBRARY */}
            {voiceStudioTab === 'upload' && (
              <form onSubmit={handleUploadVoiceFile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ border: "2px dashed #93c5fd", borderRadius: "12px", padding: "20px", textAlign: "center", backgroundColor: "#eff6ff" }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm,.aac"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setUploadFile(e.target.files[0]);
                        if (!uploadVoiceName) {
                          setUploadVoiceName(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                    style={{ display: "none" }}
                    id="audio-upload-input"
                  />
                  <label htmlFor="audio-upload-input" style={{ cursor: "pointer", display: "block" }}>
                    <div style={{ fontSize: "36px", marginBottom: "6px" }}>📁</div>
                    <div style={{ fontWeight: "800", color: "#1e40af", fontSize: "14px" }}>
                      {uploadFile ? uploadFile.name : "Click to select your Audio File"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                      Supported formats: MP3, WAV, M4A, WEBM, OGG (Max 15MB)
                    </div>
                  </label>
                  {uploadFile && (
                    <div style={{ marginTop: "10px", fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>
                      ✓ File selected: {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  )}
                </div>

                {/* Voice Profile Name */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Voice Profile Name (आवाजको नाम):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. My Seoul Accent, Bikash Voice, Morning Practice"
                    value={uploadVoiceName}
                    onChange={(e) => setUploadVoiceName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                </div>

                {/* Scope Selection: Particular Word vs All Words */}
                <div style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>
                    🎯 Speech Setting (यो आवाज कहाँ प्रयोग गर्ने?):
                  </label>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                    <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", border: uploadWordScope === 'particular' ? "1.5px solid #10b981" : "1px solid #cbd5e1", backgroundColor: uploadWordScope === 'particular' ? "#f0fdf4" : "#ffffff", cursor: "pointer", transition: "all 0.15s ease" }}>
                      <input
                        type="radio"
                        name="uploadWordScope"
                        value="particular"
                        checked={uploadWordScope === 'particular'}
                        onChange={() => setUploadWordScope('particular')}
                        style={{ accentColor: "#10b981" }}
                      />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: uploadWordScope === 'particular' ? "#166534" : "#334155" }}>
                          🎯 Particular Word
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          Use for a specific word speech
                        </div>
                      </div>
                    </label>

                    <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", border: uploadWordScope === 'all' ? "1.5px solid #2563eb" : "1px solid #cbd5e1", backgroundColor: uploadWordScope === 'all' ? "#eff6ff" : "#ffffff", cursor: "pointer", transition: "all 0.15s ease" }}>
                      <input
                        type="radio"
                        name="uploadWordScope"
                        value="all"
                        checked={uploadWordScope === 'all'}
                        onChange={() => setUploadWordScope('all')}
                        style={{ accentColor: "#2563eb" }}
                      />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: uploadWordScope === 'all' ? "#1e40af" : "#334155" }}>
                          🌐 All Words (Global)
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          Default voice for all words
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* If Particular Word is selected: Provide Word Input & Quick Fill */}
                  {uploadWordScope === 'particular' && (
                    <div style={{ backgroundColor: "#ffffff", border: "1.5px solid #86efac", borderRadius: "8px", padding: "12px", marginTop: "8px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#166534", marginBottom: "4px" }}>
                        Word to Speak for (कुन शब्द खोज्दा वा बोल्दा यो आवाज प्रयोग गर्ने?):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 학교, 학생, 食べる, arigatou, school, ghar, पानी..."
                        value={uploadTargetWord}
                        onChange={(e) => setUploadTargetWord(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "6px",
                          border: "1.5px solid #86efac",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#0f172a",
                          outline: "none"
                        }}
                      />

                      {/* Quick-fill Pills */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#15803d", fontWeight: "700" }}>Quick fill:</span>
                        {searchQuery.trim() && (
                          <button
                            type="button"
                            onClick={() => setUploadTargetWord(searchQuery.trim())}
                            style={{ backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                          >
                            🔍 Searched: &ldquo;{searchQuery.trim()}&rdquo;
                          </button>
                        )}
                        {activeWordString && (
                          <button
                            type="button"
                            onClick={() => setUploadTargetWord(activeWordString)}
                            style={{ backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                          >
                            📖 Active Word: &ldquo;{activeWordString}&rdquo;
                          </button>
                        )}
                        {uploadTargetWord && (
                          <button
                            type="button"
                            onClick={() => setUploadTargetWord('')}
                            style={{ backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", cursor: "pointer" }}
                          >
                            ✕ Clear
                          </button>
                        )}
                      </div>

                      <div style={{ fontSize: "11px", color: "#166534", marginTop: "7px" }}>
                        💡 Searching for &ldquo;<strong>{uploadTargetWord.trim() || 'this word'}</strong>&rdquo; in the dictionary will automatically play this uploaded custom voice!
                      </div>
                    </div>
                  )}
                </div>

                {/* Voice Category */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Voice Category Slot:
                  </label>
                  <select
                    value={uploadGender}
                    onChange={(e) => setUploadGender(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}
                  >
                    <option value="female">👩 Female Library Slot</option>
                    <option value="male">👨 Male Library Slot</option>
                    <option value="user">🎙️ Personal Custom Slot</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  style={{
                    backgroundColor: uploadFile ? "#2563eb" : "#94a3b8",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: "800",
                    cursor: uploadFile ? "pointer" : "not-allowed",
                    boxShadow: uploadFile ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <span>
                    {isUploading
                      ? "Uploading & Saving..."
                      : `💾 Upload & Set Voice for ${uploadWordScope === 'particular' ? `"${uploadTargetWord.trim() || 'Particular Word'}"` : 'All Words'}`}
                  </span>
                </button>
              </form>
            )}

            {/* TAB 2: 🔴 RECORD VOICE DIRECTLY */}
            {voiceStudioTab === 'record' && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ marginBottom: "20px" }}>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "50px",
                        padding: "14px 32px",
                        fontSize: "15px",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)"
                      }}
                    >
                      <span>🔴</span>
                      <span>Start Recording My Voice</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      style={{
                        backgroundColor: "#b91c1c",
                        color: "white",
                        border: "none",
                        borderRadius: "50px",
                        padding: "14px 32px",
                        fontSize: "15px",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 0 0 6px rgba(239, 68, 68, 0.3)",
                        animation: "micPulse 1s infinite"
                      }}
                    >
                      <span>⏹</span>
                      <span>Stop Recording (00:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration})</span>
                    </button>
                  )}
                </div>

                {recordedAudioUrl && (
                  <div style={{ backgroundColor: "#ecfdf5", border: "1.5px solid #a7f3d0", borderRadius: "10px", padding: "14px", textAlign: "left" }}>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#065f46", marginBottom: "8px" }}>
                      ✓ Recording Ready to Save
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(recordedAudioUrl, 'my-voice-recorded')}
                        style={{
                          backgroundColor: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 14px",
                          fontSize: "13px",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        {playingAudioId === 'my-voice-recorded' ? "⏹ Stop" : "▶ Play Preview"}
                      </button>
                      {canDownloadAudio && (
                        <button
                          type="button"
                          onClick={() => handleDownloadAudio(recordedAudioUrl, `my_voice_${currentActiveWord?.korean || 'recording'}.webm`)}
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#065f46",
                            border: "1px solid #6ee7b7",
                            borderRadius: "6px",
                            padding: "8px 14px",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          📥 Download
                        </button>
                      )}
                    </div>

                    {/* Recording Target Word Scope */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #a7f3d0", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#065f46", marginBottom: "6px" }}>
                        🎯 Apply Recording to Word:
                      </label>
                      <div style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700", color: "#065f46", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name="recordWordScope"
                            value="particular"
                            checked={uploadWordScope === 'particular'}
                            onChange={() => setUploadWordScope('particular')}
                            style={{ accentColor: "#059669" }}
                          />
                          Particular Word
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700", color: "#065f46", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name="recordWordScope"
                            value="all"
                            checked={uploadWordScope === 'all'}
                            onChange={() => setUploadWordScope('all')}
                            style={{ accentColor: "#059669" }}
                          />
                          All Words
                        </label>
                      </div>
                      {uploadWordScope === 'particular' && (
                        <div>
                          <input
                            type="text"
                            placeholder="Type word: e.g. 학교, 食べる, arigatou..."
                            value={uploadTargetWord}
                            onChange={(e) => setUploadTargetWord(e.target.value)}
                            style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #6ee7b7", fontSize: "13px", fontWeight: "700", outline: "none" }}
                          />
                          <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
                            {searchQuery.trim() && (
                              <button
                                type="button"
                                onClick={() => setUploadTargetWord(searchQuery.trim())}
                                style={{ backgroundColor: "#dcfce7", color: "#065f46", border: "1px solid #86efac", padding: "1px 6px", borderRadius: "3px", fontSize: "10px", cursor: "pointer" }}
                              >
                                🔍 &ldquo;{searchQuery.trim()}&rdquo;
                              </button>
                            )}
                            {activeWordString && (
                              <button
                                type="button"
                                onClick={() => setUploadTargetWord(activeWordString)}
                                style={{ backgroundColor: "#dcfce7", color: "#065f46", border: "1px solid #86efac", padding: "1px 6px", borderRadius: "3px", fontSize: "10px", cursor: "pointer" }}
                              >
                                📖 &ldquo;{activeWordString}&rdquo;
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <input
                        type="text"
                        placeholder="Name this recording (e.g. My Recording)"
                        value={uploadVoiceName}
                        onChange={(e) => setUploadVoiceName(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #a7f3d0", fontSize: "13px" }}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleSaveRecordingToLibrary}
                      style={{
                        width: "100%",
                        backgroundColor: "#059669",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px",
                        fontSize: "13px",
                        fontWeight: "800",
                        cursor: "pointer"
                      }}
                    >
                      {isUploading
                        ? "Saving to Library..."
                        : `💾 Save Recording for ${uploadWordScope === 'particular' ? `"${uploadTargetWord.trim() || 'Particular Word'}"` : 'All Words'}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: 📚 VOICE LIBRARY MANAGER */}
            {voiceStudioTab === 'library' && (
              <div>
                {voiceLibrary.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 10px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                    <div style={{ fontSize: "28px", marginBottom: "6px" }}>📭</div>
                    <div style={{ fontWeight: "700", color: "#475569", fontSize: "14px" }}>No custom voices uploaded yet</div>
                    <p style={{ color: "#64748b", fontSize: "12px", margin: "4px 0 12px" }}>Upload an audio file or record your voice to build your personal library.</p>
                    <button
                      type="button"
                      onClick={() => setVoiceStudioTab('upload')}
                      style={{ backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Upload Audio Now
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {voiceLibrary.map((voice) => {
                      const isVoiceActive = activeCustomVoice?.id === voice.id || voice.isDefault;
                      const isEditingThis = editingVoiceId === voice.id;
                      return (
                        <div
                          key={voice.id}
                          style={{
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: isVoiceActive ? "2px solid #10b981" : "1px solid #e2e8f0",
                            backgroundColor: isVoiceActive ? "#f0fdf4" : "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "8px"
                          }}
                        >
                          <div style={{ flex: "1 1 220px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>⭐ {voice.name}</span>
                              {isVoiceActive && (
                                <span style={{ backgroundColor: "#10b981", color: "white", padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "800" }}>
                                  ✓ ACTIVE
                                </span>
                              )}
                              {voice.word && voice.word !== 'all' ? (
                                <span style={{ backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "1px 7px", borderRadius: "4px", fontSize: "11px", fontWeight: "800" }}>
                                  🎯 Word: &ldquo;{voice.word}&rdquo;
                                </span>
                              ) : (
                                <span style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "1px 7px", borderRadius: "4px", fontSize: "11px", fontWeight: "800" }}>
                                  🌐 All Words
                                </span>
                              )}
                            </div>

                            {/* Inline Edit Target Word */}
                            {isEditingThis ? (
                              <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "6px" }}>
                                <input
                                  type="text"
                                  value={editingWordValue}
                                  onChange={(e) => setEditingWordValue(e.target.value)}
                                  placeholder="Word (e.g. 학교, 食べる, all)"
                                  style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "6px", border: "1.5px solid #2563eb", width: "150px" }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedWord = editingWordValue.trim() || 'all';
                                    const updated = voiceLibrary.map(v => v.id === voice.id ? { ...v, word: updatedWord } : v);
                                    saveVoiceLibrary(updated);
                                    setEditingVoiceId(null);
                                    alert(`Voice "${voice.name}" target word set to "${updatedWord}"!`);
                                  }}
                                  style={{ backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                                >
                                  ✓ Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingVoiceId(null)}
                                  style={{ backgroundColor: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", cursor: "pointer" }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span>Added: {voice.createdAt || 'Recent'}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingVoiceId(voice.id);
                                    setEditingWordValue(voice.word || '');
                                  }}
                                  style={{ background: "none", border: "none", color: "#2563eb", fontSize: "11px", fontWeight: "700", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                                >
                                  ✏️ Change Target Word
                                </button>
                                {searchQuery.trim() && voice.word?.toLowerCase() !== searchQuery.trim().toLowerCase() && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = voiceLibrary.map(v => v.id === voice.id ? { ...v, word: searchQuery.trim() } : v);
                                      saveVoiceLibrary(updated);
                                      alert(`Voice "${voice.name}" is now set to speak for searched word "${searchQuery.trim()}"!`);
                                    }}
                                    style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd", borderRadius: "4px", padding: "1px 6px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}
                                  >
                                    🎯 Set for Searched &ldquo;{searchQuery.trim()}&rdquo;
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {/* Play Preview */}
                            <button
                              type="button"
                              onClick={() => handlePlayAudio(voice.url, `library-${voice.id}`)}
                              style={{
                                backgroundColor: playingAudioId === `library-${voice.id}` ? "#059669" : "#ecfdf5",
                                color: playingAudioId === `library-${voice.id}` ? "#ffffff" : "#059669",
                                border: "1px solid #6ee7b7",
                                borderRadius: "6px",
                                padding: "5px 10px",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer"
                              }}
                            >
                              {playingAudioId === `library-${voice.id}` ? "⏹ Stop" : "▶ Play"}
                            </button>

                            {/* Set as Active */}
                            {!isVoiceActive && (
                              <button
                                type="button"
                                onClick={() => handleSetVoiceActive(voice, voice.gender)}
                                style={{
                                  backgroundColor: "#2563eb",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer"
                                }}
                              >
                                Set Active
                              </button>
                            )}

                            {/* Download */}
                            {canDownloadAudio && (
                              <button
                                type="button"
                                onClick={() => handleDownloadAudio(voice.url, `${voice.name}.mp3`)}
                                style={{
                                  backgroundColor: "#f8fafc",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  padding: "5px 8px",
                                  fontSize: "12px",
                                  cursor: "pointer"
                                }}
                                title="Download Audio"
                              >
                                📥
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteVoice(voice.id)}
                              style={{
                                backgroundColor: "#fef2f2",
                                color: "#ef4444",
                                border: "1px solid #fecaca",
                                borderRadius: "6px",
                                padding: "5px 8px",
                                fontSize: "12px",
                                cursor: "pointer"
                              }}
                              title="Delete voice"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
