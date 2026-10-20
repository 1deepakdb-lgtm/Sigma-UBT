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

export default function DictionarySection({ title = "" }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [loadingAudioId, setLoadingAudioId] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(24);
  const [copiedId, setCopiedId] = useState(null);

  // Active Language State ('ko' | 'ja')
  const [activeLang, setActiveLang] = useState('ko');
  const [japaneseFilter, setJapaneseFilter] = useState('all'); // 'all' | 'kanji' | 'n5'..'n1' | 'vocab'

  // Selected Voice Models (State)
  const [selectedFemaleModel, setSelectedFemaleModel] = useState(KOREAN_FEMALE_VOICE_MODELS[0]);
  const [selectedMaleModel, setSelectedMaleModel] = useState(KOREAN_MALE_VOICE_MODELS[0]);
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

  // Role Detection for Audio Downloads (Institute & Admin only; NOT Student)
  const [userRole, setUserRole] = useState(() => {
    if (typeof window === 'undefined') return 'student';
    try {
      const r = localStorage.getItem('currentRole') || localStorage.getItem('role');
      if (r) return r.toLowerCase();
      const u = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed?.role) return parsed.role.toLowerCase();
      }
      if (window.location.pathname.includes('/student')) return 'student';
      if (window.location.pathname.includes('/institute')) return 'institute';
      if (window.location.pathname.includes('/admin')) return 'admin';
    } catch (e) {}
    return 'student';
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data?.user?.role) {
          setUserRole(data.user.role.toLowerCase());
        }
      })
      .catch(() => {});
  }, []);

  const isInstituteOrAdmin = userRole === 'institute' || userRole === 'admin';

  const audioRef = useRef(null);
  const femaleDropdownRef = useRef(null);
  const maleDropdownRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

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
      setSelectedMaleModel(customModelObj);
    }
  }

  function handleDeleteVoice(voiceId) {
    if (!confirm('Are you sure you want to delete this voice from your library?')) return;
    const updated = voiceLibrary.filter(v => v.id !== voiceId);
    saveVoiceLibrary(updated);
    if (activeCustomVoice?.id === voiceId) {
      setActiveCustomVoice(null);
      setSelectedFemaleModel(FEMALE_VOICE_MODELS[0]);
      setSelectedMaleModel(MALE_VOICE_MODELS[0]);
    }
  }

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (femaleDropdownRef.current && !femaleDropdownRef.current.contains(e.target)) {
        setIsFemaleDropdownOpen(false);
      }
      if (maleDropdownRef.current && !maleDropdownRef.current.contains(e.target)) {
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

  // Initial load
  useEffect(() => {
    fetchDictionary('', activeLang);
  }, []);

  function handleSwitchLanguage(newLang) {
    if (activeLang === newLang) return;
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
      setSelectedFemaleModel(JAPANESE_FEMALE_VOICE_MODELS[0]); // Japanese Female 1: Natural Japanese Teacher
      setSelectedMaleModel(JAPANESE_MALE_VOICE_MODELS[0]); // Japanese Male 1: Natural Japanese Male Teacher
      fetchDictionary('', 'ja', 'all');
    } else {
      setSelectedFemaleModel(KOREAN_FEMALE_VOICE_MODELS[0]); // Korean Female 1: Natural Female Teacher
      setSelectedMaleModel(KOREAN_MALE_VOICE_MODELS[0]); // Korean Male 1: Natural Korean Male Teacher
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

  function handlePlayAudio(url, id) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingAudioId === id || loadingAudioId === id) {
      setPlayingAudioId(null);
      setLoadingAudioId(null);
      return;
    }

    setLoadingAudioId(id);
    setPlayingAudioId(null);

    const audio = new Audio();
    audioRef.current = audio;

    audio.onplaying = () => {
      setLoadingAudioId(null);
      setPlayingAudioId(id);
    };

    audio.onended = () => {
      setPlayingAudioId(null);
      setLoadingAudioId(null);
      audioRef.current = null;
    };

    audio.onerror = (err) => {
      console.warn('Playback error:', err);
      setPlayingAudioId(null);
      setLoadingAudioId(null);
      audioRef.current = null;
      alert('Failed to play audio. Please check network connection.');
    };

    audio.src = url;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setLoadingAudioId(null);
          setPlayingAudioId(id);
        })
        .catch(err => {
          console.warn('Playback promise error:', err);
          setPlayingAudioId(null);
          setLoadingAudioId(null);
          audioRef.current = null;
        });
    }
  }

  function handlePlaySearchWord(gender = 'female', customModel = null, customId = null) {
    const activeModel = customModel || (gender === 'female' ? selectedFemaleModel : selectedMaleModel);
    const audioId = customId || (customModel ? `preview-${customModel.id}` : `search-${gender}`);

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

    const voiceProfId = activeModel?.voiceProfileId || activeModel?.id;
    const isAi = activeModel?.isAiStudio || voiceProfId?.startsWith('ko-') || voiceProfId?.startsWith('ja-');

    let url;
    if (isAi) {
      url = `/api/elevenlabs/tts?text=${encodeURIComponent(textToSpeak)}&voiceProfileId=${encodeURIComponent(voiceProfId)}`;
    } else {
      const defaultVoice = activeLang === 'ja'
        ? (gender === 'female' ? 'ja-JP-NanamiNeural' : 'ja-JP-KeitaNeural')
        : (gender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural');

      const voiceName = activeModel?.voice || defaultVoice;
      const pitchVal = activeModel?.pitch || '+0Hz';
      const rateVal = activeModel?.rate || '-5%';

      url = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=${lang}&gender=${gender}&voice=${encodeURIComponent(voiceName)}&pitch=${encodeURIComponent(pitchVal)}&rate=${encodeURIComponent(rateVal)}&model=${encodeURIComponent(activeModel?.id || activeModel?.name || '')}`;
    }
    handlePlayAudio(url, audioId);
  }

  function handleDownloadSearchWord(gender = 'female', customModel = null) {
    const activeModel = customModel || (gender === 'female' ? selectedFemaleModel : selectedMaleModel);

    if (activeModel?.isCustom && activeModel.url) {
      handleDownloadAudio(activeModel.url, `${activeModel.name.replace(/\s+/g, '_')}_custom_voice.mp3`);
      return;
    }

    const queryText = searchQuery.trim();
    if (queryText && !customModel) {
      const qLower = queryText.toLowerCase();
      const matchingCustom = voiceLibrary.find(v => {
        if (!v.word || v.word === 'all') return false;
        const wLower = v.word.trim().toLowerCase();
        if (wLower === qLower) return true;
        if (selectedWord?.korean && wLower === selectedWord.korean.toLowerCase()) return true;
        if (selectedWord?.japanese && wLower === selectedWord.japanese.toLowerCase()) return true;
        return false;
      });
      if (matchingCustom?.url) {
        handleDownloadAudio(matchingCustom.url, `${matchingCustom.word || queryText}_custom_voice.mp3`);
        return;
      }
    }

    const wordToDownload = searchQuery.trim() || (activeLang === 'ja' ? (selectedWord?.japanese || results[0]?.japanese) : (selectedWord?.korean || results[0]?.korean)) || (activeLang === 'ja' ? 'こんにちは' : '안녕하세요');
    if (!wordToDownload) return;

    let lang = activeLang === 'ja' ? 'ja' : 'ko';
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(wordToDownload)) {
      lang = 'ja';
    } else if (/[\uAC00-\uD7AF]/.test(wordToDownload)) {
      lang = 'ko';
    } else if (/[\u0900-\u097F]/.test(wordToDownload)) {
      lang = 'ne';
    } else if (/^[a-zA-Z\s]+$/.test(wordToDownload)) {
      lang = activeLang === 'ja' ? 'ja' : 'en';
    }

    const textToSpeak = (lang === 'ko' && selectedWord?.korean && !/[\uAC00-\uD7AF]/.test(wordToDownload))
      ? selectedWord.korean
      : (lang === 'ja' && selectedWord?.japanese && !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(wordToDownload))
        ? (selectedWord.japaneseSpoken || selectedWord.reading || selectedWord.japanese)
        : wordToDownload;

    const voiceProfId = activeModel?.voiceProfileId || activeModel?.id;
    const isAi = activeModel?.isAiStudio || voiceProfId?.startsWith('ko-') || voiceProfId?.startsWith('ja-');
    const filename = `${textToSpeak}_${gender}_${(activeModel?.name || 'voice').replace(/\s+/g, '_')}.mp3`;

    let url;
    if (isAi) {
      url = `/api/elevenlabs/tts?text=${encodeURIComponent(textToSpeak)}&voiceProfileId=${encodeURIComponent(voiceProfId)}&download=true&filename=${encodeURIComponent(filename)}`;
    } else {
      const defaultVoice = activeLang === 'ja'
        ? (gender === 'female' ? 'ja-JP-NanamiNeural' : 'ja-JP-KeitaNeural')
        : (gender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural');

      url = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=${lang}&gender=${gender}&voice=${encodeURIComponent(activeModel.voice || defaultVoice)}&pitch=${encodeURIComponent(activeModel.pitch || '+0Hz')}&rate=${encodeURIComponent(activeModel.rate || '-5%')}&model=${encodeURIComponent(activeModel.id || activeModel.name || '')}&download=true`;
    }
    handleDownloadAudio(url, filename);
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
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        border: "1.5px solid #e2e8f0",
        padding: "26px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        maxWidth: "1200px",
        margin: "0 auto",
        userSelect: "text",
        WebkitUserSelect: "text",
        MozUserSelect: "text",
        msUserSelect: "text"
      }}
    >
      <style>{`
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
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          {title && <h2 style={{ margin: 0, color: "#0f172a", fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" }}>{title}</h2>}

          {/* 🇰🇷 Korean vs 🇯🇵 Japanese Language Switcher Toggle Buttons */}
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "#f1f5f9",
              padding: "4px",
              borderRadius: "10px",
              border: "1.5px solid #cbd5e1",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
              gap: "4px"
            }}
          >
            <button
              type="button"
              onClick={() => handleSwitchLanguage('ko')}
              title="Korean Multi-Language Dictionary & EPS-TOPIK Batchim Guide"
              style={{
                backgroundColor: activeLang === 'ko' ? "#2563eb" : "transparent",
                color: activeLang === 'ko' ? "#ffffff" : "#475569",
                border: "none",
                borderRadius: "7px",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeLang === 'ko' ? "0 2px 8px rgba(37,99,235,0.32)" : "none",
                transition: "all 0.18s ease"
              }}
            >
              <span style={{ fontSize: "16px" }}>🇰🇷</span>
              <span>Korean (한국어)</span>
              {activeLang === 'ko' && (
                <span style={{ fontSize: "10px", backgroundColor: "rgba(255,255,255,0.25)", padding: "1px 5px", borderRadius: "10px", fontWeight: "700" }}>
                  Active
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchLanguage('ja')}
              title="Japanese Multi-Language Dictionary & JLPT/JFT Pronunciation Guide"
              style={{
                backgroundColor: activeLang === 'ja' ? "#9333ea" : "transparent",
                color: activeLang === 'ja' ? "#ffffff" : "#475569",
                border: "none",
                borderRadius: "7px",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeLang === 'ja' ? "0 2px 8px rgba(147,51,234,0.35)" : "none",
                transition: "all 0.18s ease"
              }}
            >
              <span style={{ fontSize: "16px" }}>🇯🇵</span>
              <span>Japanese (日本語)</span>
              {activeLang === 'ja' && (
                <span style={{ fontSize: "10px", backgroundColor: "rgba(255,255,255,0.25)", padding: "1px 5px", borderRadius: "10px", fontWeight: "700" }}>
                  Active
                </span>
              )}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Active Model Badges & AI Studio Button - All Same Size (Height 42px, radius 24px, 30px icon, 2-line text) */}
          <div
            onClick={() => setIsFemaleDropdownOpen(prev => !prev)}
            title="Active Female Voice Model (Click to select model)"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#fff1f2",
              border: "1.5px solid #fecdd3",
              padding: "4px 14px 4px 6px",
              borderRadius: "24px",
              height: "42px",
              minWidth: "160px",
              boxSizing: "border-box",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <FemaleIcon size={30} isPlaying={playingAudioId === 'search-female'} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#be185d" }}>{selectedFemaleModel.name}</span>
              <span style={{ fontSize: "10px", color: "#9d174d", fontWeight: "600" }}>{selectedFemaleModel.isCustom ? "⭐ Custom Library" : (selectedFemaleModel.tag || "Female Voice")}</span>
            </div>
          </div>

          <div
            onClick={() => setIsMaleDropdownOpen(prev => !prev)}
            title="Active Male Voice Model (Click to select model)"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#f0f9ff",
              border: "1.5px solid #bae6fd",
              padding: "4px 14px 4px 6px",
              borderRadius: "24px",
              height: "42px",
              minWidth: "160px",
              boxSizing: "border-box",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <MaleIcon size={30} isPlaying={playingAudioId === 'search-male'} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#0369a1" }}>{selectedMaleModel.name}</span>
              <span style={{ fontSize: "10px", color: "#0284c7", fontWeight: "600" }}>{selectedMaleModel.isCustom ? "⭐ Custom Library" : (selectedMaleModel.tag || "Male Voice")}</span>
            </div>
          </div>

          {/* AI Studio Toggle Button (Same exact size, height 42px, radius 24px, 30px icon, 2-line layout) */}
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
              gap: "8px",
              background: showAiStudio
                ? "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)"
                : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#ffffff",
              padding: "4px 14px 4px 6px",
              borderRadius: "24px",
              border: showAiStudio ? "1.5px solid #c084fc" : "1.5px solid #6366f1",
              height: "42px",
              minWidth: "160px",
              boxSizing: "border-box",
              cursor: "pointer",
              boxShadow: showAiStudio ? "0 0 14px rgba(168, 85, 247, 0.45)" : "0 2px 8px rgba(79, 70, 229, 0.28)",
              transition: "all 0.18s ease"
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #c084fc 0%, #9333ea 50%, #4f46e5 100%)",
                boxShadow: "0 2px 5px rgba(124, 58, 237, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.7)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                flexShrink: 0
              }}
            >
              🎙️
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, textAlign: "left" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#ffffff" }}>AI Studio</span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.85)", fontWeight: "600" }}>Voice Studio</span>
            </div>
          </button>
        </div>
      </div>

      {/* EMBEDDED AI STUDIO (Opens directly under dictionary without leaving page or jumping navigation) */}
      {showAiStudio && (
        <div ref={aiStudioRef} style={{ marginBottom: "22px" }}>
          <AiStudio
            embedded={true}
            initialLang={activeLang}
            initialText={searchQuery || (activeLang === 'ja' ? selectedWord?.japanese : selectedWord?.korean) || ''}
            onClose={() => setShowAiStudio(false)}
          />
        </div>
      )}

      {/* Search Bar with Reordered Buttons: GO BUTTON FIRST, then Female Dropdown, Male Dropdown, and User Voice */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search Input Box */}
        <div style={{ position: "relative", flex: "1 1 260px", minWidth: "220px" }}>
          <input
            type="text"
            placeholder={
              activeLang === 'ja'
                ? "Type Japanese (e.g. 食べる, taberu, arigatou, पानी, boy), Nepali, or English and press Go..."
                : "Type Korean (e.g. kukur, eat, boy, ghar, 안녕), Nepali, or English and press Go..."
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
              padding: "11px 40px 11px 14px",
              borderRadius: "8px",
              border: "1.5px solid #cbd5e1",
              fontSize: "14px",
              outline: "none",
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
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "14px",
                padding: 0
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* 1. 🔍 GO BUTTON FIRST (Per user instruction: 'yata go button lai suru ma rakhne') */}
        <button
          type="submit"
          disabled={loading}
          title="Click Go or press Enter to find result"
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "0 20px",
            height: "40px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "800",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
            whiteSpace: "nowrap",
            transition: "background 0.15s, transform 0.1s"
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>{loading ? "Searching..." : "Go"}</span>
        </button>

        {/* ⭐ MY VOICE BUTTON FOR THIS SEARCHED WORD (If uploaded voice matches searched word) */}
        {matchingSearchedCustomVoice && (
          <div style={{ display: "inline-flex", borderRadius: "8px", overflow: "hidden", border: "1.5px solid #86efac", background: "#f0fdf4", boxShadow: "0 2px 6px rgba(16, 185, 129, 0.18)" }}>
            <button
              type="button"
              onClick={() => handlePlayAudio(matchingSearchedCustomVoice.url, 'search-custom-voice')}
              title={`Play custom uploaded voice for "${matchingSearchedCustomVoice.word}" (${matchingSearchedCustomVoice.name})`}
              style={{
                backgroundColor: playingAudioId === 'search-custom-voice' ? "#15803d" : loadingAudioId === 'search-custom-voice' ? "#16a34a" : "transparent",
                color: playingAudioId === 'search-custom-voice' || loadingAudioId === 'search-custom-voice' ? "#ffffff" : "#15803d",
                border: "none",
                padding: "0 12px",
                height: "40px",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              <span style={{ fontSize: "14px" }}>⭐</span>
              <span>{playingAudioId === 'search-custom-voice' ? "⏹ Stop" : `▶ My Voice (${matchingSearchedCustomVoice.word})`}</span>
            </button>
            {!(typeof window !== 'undefined' && window.location.pathname.includes('/student')) && (
              <button
                type="button"
                onClick={() => handleDownloadAudio(matchingSearchedCustomVoice.url, `${matchingSearchedCustomVoice.word}_my_voice.mp3`)}
                title={`Download custom voice (${matchingSearchedCustomVoice.name})`}
                style={{
                  backgroundColor: "transparent",
                  color: "#15803d",
                  border: "none",
                  borderLeft: "1.5px solid #86efac",
                  padding: "0 10px",
                  height: "40px",
                  fontSize: "14px",
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

        {/* 2. 👩 FEMALE VOICE GROUP WITH DROPDOWN ARROW (Minimum 10 Models + Uploaded Voice Library) */}
        <div ref={femaleDropdownRef} style={{ position: "relative", display: "inline-flex" }}>
          <div style={{ display: "inline-flex", borderRadius: "8px", overflow: "hidden", border: "1.5px solid #fda4af", background: "#fff1f2", boxShadow: "0 2px 6px rgba(225, 29, 72, 0.1)" }}>
            {/* Play Button */}
            <button
              type="button"
              onClick={() => handlePlaySearchWord('female')}
              title={`Play searched word in Female Voice (${selectedFemaleModel.name})`}
              style={{
                backgroundColor: playingAudioId === 'search-female' ? "#be185d" : loadingAudioId === 'search-female' ? "#f43f5e" : "transparent",
                color: playingAudioId === 'search-female' || loadingAudioId === 'search-female' ? "#ffffff" : "#be185d",
                border: "none",
                padding: "0 12px",
                height: "40px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              <FemaleIcon size={24} isPlaying={playingAudioId === 'search-female'} />
              <span>{loadingAudioId === 'search-female' ? "⏳ Loading..." : playingAudioId === 'search-female' ? "⏹ Stop" : "▶ Female"}</span>
            </button>

            {/* Dropdown Arrow Button */}
            <button
              type="button"
              onClick={() => {
                setIsFemaleDropdownOpen(prev => !prev);
                setIsMaleDropdownOpen(false);
              }}
              title="Choose Female Voice Model or Your Uploaded Voices"
              style={{
                backgroundColor: isFemaleDropdownOpen ? "#fecdd3" : "transparent",
                color: "#be185d",
                border: "none",
                borderLeft: "1.5px solid #fda4af",
                padding: "0 10px",
                height: "40px",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "3px"
              }}
            >
              <span style={{ fontSize: "10px" }}>▼</span>
            </button>

            {/* Download MP3 */}
            {!(typeof window !== 'undefined' && window.location.pathname.includes('/student')) && (
              <button
                type="button"
                onClick={() => handleDownloadSearchWord('female')}
                title={`Download Female Voice (${selectedFemaleModel.name})`}
                style={{
                  backgroundColor: "transparent",
                  color: "#be185d",
                  border: "none",
                  borderLeft: "1.5px solid #fda4af",
                  padding: "0 10px",
                  height: "40px",
                  fontSize: "14px",
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

          {/* Female Models & Voice Library Dropdown Menu */}
          {isFemaleDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                zIndex: 1000,
                width: "330px",
                maxWidth: "calc(100vw - 32px)",
                maxHeight: "440px",
                overflowY: "auto",
                backgroundColor: "#ffffff",
                border: "1.5px solid #fecdd3",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(225, 29, 72, 0.18)",
                padding: "8px",
                animation: "dropdownMenuIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >

              {voiceLibrary.length > 0 && (
                <div style={{ marginBottom: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {voiceLibrary.map((voice) => {
                    const isSelected = selectedFemaleModel.id === voice.id;
                    const isWordMatch = searchedTerm && voice.word && voice.word.toLowerCase() === searchedTerm;
                    return (
                      <div
                        key={voice.id}
                        onClick={() => {
                          handleSetVoiceActive(voice, 'female');
                          setIsFemaleDropdownOpen(false);
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#ffe4e6" : isWordMatch ? "#f0fdf4" : "#fdf2f8",
                          border: isSelected ? "1.5px solid #e11d48" : isWordMatch ? "1.5px solid #86efac" : "1px solid #fbcfe8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: "#9d174d" }}>⭐ {voice.name}</span>
                          <span style={{ fontSize: "10px", color: "#be185d" }}>{voice.word === 'all' ? 'All Words' : `Word: ${voice.word}`}</span>
                          {isWordMatch && (
                            <span style={{ fontSize: "9px", backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "1px 5px", borderRadius: "3px", fontWeight: "800", marginTop: "2px", width: "fit-content" }}>
                              🎯 Matches Searched Word
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayAudio(voice.url, `preview-${voice.id}`);
                            }}
                            title={playingAudioId === `preview-${voice.id}` ? "Stop preview" : `Play ${voice.name}`}
                            style={{
                              background: playingAudioId === `preview-${voice.id}` ? "#9d174d" : loadingAudioId === `preview-${voice.id}` ? "#be185d" : "#be185d",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              fontSize: "11px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: playingAudioId === `preview-${voice.id}` ? "0 0 8px rgba(190, 24, 93, 0.6)" : "none",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {loadingAudioId === `preview-${voice.id}` ? "⏳" : playingAudioId === `preview-${voice.id}` ? "⏹" : "▶"}
                          </button>
                          {isSelected && <span style={{ color: "#e11d48", fontWeight: "800" }}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Standard AI Models */}
              <div style={{ padding: "4px 8px 6px 8px", borderBottom: "1px solid #ffe4e6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#9d174d", textTransform: "uppercase" }}>
                  {activeLang === 'ja' ? 'Japanese Acoustic Voice Models' : 'Korean Acoustic Voice Models'}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                {currentFemaleVoices.map((model) => {
                  const isSelected = selectedFemaleModel.id === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => {
                        setSelectedFemaleModel(model);
                        setIsFemaleDropdownOpen(false);
                      }}
                      style={{
                        padding: "7px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#fff1f2" : "#ffffff",
                        border: isSelected ? "1.5px solid #f43f5e" : "1px solid transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: isSelected ? "800" : "700", color: isSelected ? "#be185d" : "#0f172a" }}>
                            {model.name}
                          </span>
                          <span style={{ fontSize: "10px", background: "#fecdd3", color: "#9d174d", padding: "1px 5px", borderRadius: "4px", fontWeight: "700" }}>
                            {model.tag}
                          </span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{model.persona}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaySearchWord('female', model, `preview-${model.id}`);
                          }}
                          title={playingAudioId === `preview-${model.id}` ? "Stop preview" : `Preview ${model.name}`}
                          style={{
                            background: playingAudioId === `preview-${model.id}` ? "#be185d" : loadingAudioId === `preview-${model.id}` ? "#f43f5e" : "#ffe4e6",
                            color: playingAudioId === `preview-${model.id}` || loadingAudioId === `preview-${model.id}` ? "#ffffff" : "#be185d",
                            border: "none",
                            borderRadius: "50%",
                            width: "26px",
                            height: "26px",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: playingAudioId === `preview-${model.id}` ? "0 0 10px rgba(190, 24, 93, 0.55)" : "none",
                            transform: playingAudioId === `preview-${model.id}` ? "scale(1.08)" : "scale(1)",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {loadingAudioId === `preview-${model.id}` ? (
                            <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⏳</span>
                          ) : playingAudioId === `preview-${model.id}` ? (
                            "⏹"
                          ) : (
                            "▶"
                          )}
                        </button>
                        {isSelected && <span style={{ color: "#e11d48", fontWeight: "800", fontSize: "14px" }}>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. 👨 MALE VOICE GROUP WITH DROPDOWN ARROW (Minimum 10 Models + Uploaded Voice Library) */}
        <div ref={maleDropdownRef} style={{ position: "relative", display: "inline-flex" }}>
          <div style={{ display: "inline-flex", borderRadius: "8px", overflow: "hidden", border: "1.5px solid #7dd3fc", background: "#f0f9ff", boxShadow: "0 2px 6px rgba(2, 132, 199, 0.1)" }}>
            {/* Play Button */}
            <button
              type="button"
              onClick={() => handlePlaySearchWord('male')}
              title={`Play searched word in Male Voice (${selectedMaleModel.name})`}
              style={{
                backgroundColor: playingAudioId === 'search-male' ? "#0284c7" : loadingAudioId === 'search-male' ? "#0ea5e9" : "transparent",
                color: playingAudioId === 'search-male' || loadingAudioId === 'search-male' ? "#ffffff" : "#0369a1",
                border: "none",
                padding: "0 12px",
                height: "40px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              <MaleIcon size={24} isPlaying={playingAudioId === 'search-male'} />
              <span>{loadingAudioId === 'search-male' ? "⏳ Loading..." : playingAudioId === 'search-male' ? "⏹ Stop" : "▶ Male"}</span>
            </button>

            {/* Dropdown Arrow Button */}
            <button
              type="button"
              onClick={() => {
                setIsMaleDropdownOpen(prev => !prev);
                setIsFemaleDropdownOpen(false);
              }}
              title="Choose Male Voice Model or Your Uploaded Voices"
              style={{
                backgroundColor: isMaleDropdownOpen ? "#bae6fd" : "transparent",
                color: "#0369a1",
                border: "none",
                borderLeft: "1.5px solid #7dd3fc",
                padding: "0 10px",
                height: "40px",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "3px"
              }}
            >
              <span style={{ fontSize: "10px" }}>▼</span>
            </button>

            {/* Download MP3 */}
            {!(typeof window !== 'undefined' && window.location.pathname.includes('/student')) && (
              <button
                type="button"
                onClick={() => handleDownloadSearchWord('male')}
                title={`Download Male Voice (${selectedMaleModel.name})`}
                style={{
                  backgroundColor: "transparent",
                  color: "#0369a1",
                  border: "none",
                  borderLeft: "1.5px solid #7dd3fc",
                  padding: "0 10px",
                  height: "40px",
                  fontSize: "14px",
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

          {/* Male Models & Voice Library Dropdown Menu */}
          {isMaleDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                zIndex: 1000,
                width: "330px",
                maxWidth: "calc(100vw - 32px)",
                maxHeight: "440px",
                overflowY: "auto",
                backgroundColor: "#ffffff",
                border: "1.5px solid #bae6fd",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(2, 132, 199, 0.18)",
                padding: "8px",
                animation: "dropdownMenuIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >

              {voiceLibrary.length > 0 && (
                <div style={{ marginBottom: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {voiceLibrary.map((voice) => {
                    const isSelected = selectedMaleModel.id === voice.id;
                    const isWordMatch = searchedTerm && voice.word && voice.word.toLowerCase() === searchedTerm;
                    return (
                      <div
                        key={voice.id}
                        onClick={() => {
                          handleSetVoiceActive(voice, 'male');
                          setIsMaleDropdownOpen(false);
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#e0f2fe" : isWordMatch ? "#f0fdf4" : "#f0f9ff",
                          border: isSelected ? "1.5px solid #0284c7" : isWordMatch ? "1.5px solid #86efac" : "1px solid #bae6fd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: "#0369a1" }}>⭐ {voice.name}</span>
                          <span style={{ fontSize: "10px", color: "#0284c7" }}>{voice.word === 'all' ? 'All Words' : `Word: ${voice.word}`}</span>
                          {isWordMatch && (
                            <span style={{ fontSize: "9px", backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "1px 5px", borderRadius: "3px", fontWeight: "800", marginTop: "2px", width: "fit-content" }}>
                              🎯 Matches Searched Word
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayAudio(voice.url, `preview-${voice.id}`);
                            }}
                            title={playingAudioId === `preview-${voice.id}` ? "Stop preview" : `Play ${voice.name}`}
                            style={{
                              background: playingAudioId === `preview-${voice.id}` ? "#0369a1" : loadingAudioId === `preview-${voice.id}` ? "#0ea5e9" : "#0284c7",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              fontSize: "11px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: playingAudioId === `preview-${voice.id}` ? "0 0 8px rgba(2, 132, 199, 0.6)" : "none",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {loadingAudioId === `preview-${voice.id}` ? "⏳" : playingAudioId === `preview-${voice.id}` ? "⏹" : "▶"}
                          </button>
                          {isSelected && <span style={{ color: "#0284c7", fontWeight: "800" }}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Standard AI Models */}
              <div style={{ padding: "4px 8px 6px 8px", borderBottom: "1px solid #e0f2fe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#0369a1", textTransform: "uppercase" }}>
                  {activeLang === 'ja' ? 'Japanese Acoustic Voice Models' : 'Korean Acoustic Voice Models'}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                {currentMaleVoices.map((model) => {
                  const isSelected = selectedMaleModel.id === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => {
                        setSelectedMaleModel(model);
                        setIsMaleDropdownOpen(false);
                      }}
                      style={{
                        padding: "7px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#f0f9ff" : "#ffffff",
                        border: isSelected ? "1.5px solid #0284c7" : "1px solid transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: isSelected ? "800" : "700", color: isSelected ? "#0369a1" : "#0f172a" }}>
                            {model.name}
                          </span>
                          <span style={{ fontSize: "10px", background: "#bae6fd", color: "#0284c7", padding: "1px 5px", borderRadius: "4px", fontWeight: "700" }}>
                            {model.tag}
                          </span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{model.persona}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaySearchWord('male', model, `preview-${model.id}`);
                          }}
                          title={playingAudioId === `preview-${model.id}` ? "Stop preview" : `Preview ${model.name}`}
                          style={{
                            background: playingAudioId === `preview-${model.id}` ? "#0284c7" : loadingAudioId === `preview-${model.id}` ? "#0ea5e9" : "#e0f2fe",
                            color: playingAudioId === `preview-${model.id}` || loadingAudioId === `preview-${model.id}` ? "#ffffff" : "#0369a1",
                            border: "none",
                            borderRadius: "50%",
                            width: "26px",
                            height: "26px",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: playingAudioId === `preview-${model.id}` ? "0 0 10px rgba(2, 132, 199, 0.55)" : "none",
                            transform: playingAudioId === `preview-${model.id}` ? "scale(1.08)" : "scale(1)",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {loadingAudioId === `preview-${model.id}` ? (
                            <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⏳</span>
                          ) : playingAudioId === `preview-${model.id}` ? (
                            "⏹"
                          ) : (
                            "▶"
                          )}
                        </button>
                        {isSelected && <span style={{ color: "#0284c7", fontWeight: "800", fontSize: "14px" }}>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>



      </form>

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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "12px" }}>
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
                const isPlayingAny = isPlayingFem || isPlayingMale;

                const hasRule = activeLang === 'ja' ? Boolean(word.hasRule || word.pronunciationRule) : Boolean(word.hasBatchimRule);
                const ruleBadge = activeLang === 'ja' ? (word.isKanji ? "漢字" : "発音 / Rule") : "받침";

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
                    onClick={() => setSelectedWord(word)}
                    style={{
                      backgroundColor: isSelected ? (activeLang === 'ja' ? "#faf5ff" : "#f0f9ff") : "#ffffff",
                      border: isSelected
                        ? (activeLang === 'ja' ? "2px solid #9333ea" : "2px solid #2563eb")
                        : (isPlayingAny ? "1.5px solid #f43f5e" : "1px solid #e2e8f0"),
                      borderRadius: "10px",
                      padding: "12px 14px",
                      boxShadow: isSelected
                        ? (activeLang === 'ja' ? "0 4px 12px rgba(147,51,234,0.15)" : "0 4px 12px rgba(37,99,235,0.12)")
                        : "0 1px 4px rgba(0,0,0,0.04)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                      position: "relative",
                      userSelect: "text",
                      WebkitUserSelect: "text"
                    }}
                  >
                    {/* Top Row: Word + Category & Rule Badge */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                      <div>
                        {word.isKanji ? (
                          <div style={{ width: "100%" }}>
                            {/* Medium Kanji Showcase Tile & Badges */}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                              {/* 🈵 MEDIUM KANJI TILE */}
                              <div
                                style={{
                                  width: "52px",
                                  height: "52px",
                                  minWidth: "52px",
                                  background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
                                  border: "1.5px solid #d8b4fe",
                                  borderRadius: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 2px 8px rgba(147, 51, 234, 0.12)",
                                  flexShrink: 0
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "34px",
                                    fontWeight: "900",
                                    color: "#581c87",
                                    lineHeight: 1,
                                    userSelect: "text",
                                    fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', 'Segoe UI Historic', sans-serif"
                                  }}
                                >
                                  {word.kanji}
                                </span>
                              </div>

                              {/* Badges & Pronunciation summary */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "11px", backgroundColor: "#ecfdf5", color: "#047857", border: "1.5px solid #a7f3d0", padding: "1px 7px", borderRadius: "4px", fontWeight: "800" }}>
                                    JLPT N{word.jlpt}
                                  </span>
                                  {word.strokes && (
                                    <span style={{ fontSize: "11px", backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                      {word.strokes} Strokes
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: "12px", color: "#9333ea", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  [{spokenWord}] · <span style={{ color: "#475569", fontWeight: "600" }}>[{nepaliPhonetic || romaji}]</span>
                                </div>
                              </div>
                            </div>

                            {/* Onyomi & Kunyomi detailed block */}
                            <div style={{ backgroundColor: "#faf5ff", border: "1px solid #f3e8ff", borderRadius: "7px", padding: "5px 8px", marginBottom: "4px" }}>
                              <div style={{ fontSize: "12px", color: "#6b21a8", fontWeight: "700", lineHeight: "1.3" }}>
                                音 (On): <span style={{ color: "#0f172a", fontWeight: "700" }}>{word.onyomi}</span>
                              </div>
                              <div style={{ fontSize: "12px", color: "#6b21a8", fontWeight: "700", marginTop: "2px", lineHeight: "1.3" }}>
                                訓 (Kun): <span style={{ color: "#0f172a", fontWeight: "700" }}>{word.kunyomi}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: activeLang === 'ja' ? "18px" : "16px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", userSelect: "text" }}>
                              {primaryWord}
                              {hasRule && (
                                <span
                                  title={activeLang === 'ja' ? (word.pronunciationRule || 'Japanese Pronunciation Rule') : (word.koreanBatchimRule || 'Batchim Rule')}
                                  style={{
                                    fontSize: "11px",
                                    backgroundColor: activeLang === 'ja' ? "#f3e8ff" : "#fef3c7",
                                    color: activeLang === 'ja' ? "#7e22ce" : "#92400e",
                                    border: activeLang === 'ja' ? "1px solid #d8b4fe" : "1px solid #fde68a",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    fontWeight: "700"
                                  }}
                                >
                                  {ruleBadge}
                                </span>
                              )}
                              {customVoiceForWord && (
                                <span title="You uploaded a custom voice for this word!" style={{ fontSize: "11px", backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "1px 5px", borderRadius: "4px", fontWeight: "700" }}>
                                  ⭐ My Voice
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "13px", color: activeLang === 'ja' ? "#9333ea" : "#2563eb", fontWeight: "600", marginTop: "2px", userSelect: "text" }}>
                              [{spokenWord}] · <span style={{ color: activeLang === 'ja' ? "#6b21a8" : "#1e40af", fontWeight: "600" }}>[{nepaliPhonetic || romaji}]</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        {word.category && (
                          <span style={{ fontSize: "11px", backgroundColor: word.isKanji ? "#faf5ff" : "#f1f5f9", color: word.isKanji ? "#7e22ce" : "#475569", border: word.isKanji ? "1px solid #e9d5ff" : "none", padding: "2px 7px", borderRadius: "5px", fontWeight: "700", whiteSpace: "nowrap" }}>
                            {word.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Translations */}
                    <div style={{ margin: "6px 0 4px 0", display: "flex", flexDirection: "column", gap: "3px", userSelect: "text" }}>
                      <div style={{ color: "#15803d", fontWeight: "700", fontSize: "14px", lineHeight: "1.3", userSelect: "text" }}>
                        {word.nepali}
                      </div>
                      <div style={{ color: "#334155", fontWeight: "600", fontSize: "13px", lineHeight: "1.3", userSelect: "text" }}>
                        {word.english}
                      </div>
                    </div>

                    {/* 🔊 Voice Popup Bar (Appears when this word is selected) */}
                    {isSelected && (
                      <div
                        style={{
                          marginTop: "10px",
                          paddingTop: "9px",
                          borderTop: activeLang === 'ja' ? "1.5px solid #e9d5ff" : "1.5px solid #bfdbfe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "7px",
                          animation: "popupFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Custom Voice Button if exists for this word */}
                        {customVoiceForWord && (
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(customVoiceForWord.url, `popup-custom-${primaryWord}`)}
                            title="Play your uploaded voice recording"
                            style={{
                              backgroundColor: playingAudioId === `popup-custom-${primaryWord}` ? "#15803d" : "#dcfce7",
                              color: playingAudioId === `popup-custom-${primaryWord}` ? "#ffffff" : "#15803d",
                              border: "1.5px solid #86efac",
                              borderRadius: "8px",
                              padding: "6px 10px",
                              fontSize: "12px",
                              fontWeight: "800",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <span>⭐</span>
                            <span>{playingAudioId === `popup-custom-${primaryWord}` ? "⏹ Stop" : "▶ My Voice"}</span>
                          </button>
                        )}

                        {/* Female Voice Group */}
                        <div style={{ display: "inline-flex", borderRadius: "8px", overflow: "hidden", border: "1.5px solid #fda4af", background: "#fff1f2", boxShadow: "0 2px 6px rgba(225, 29, 72, 0.12)" }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedFemaleModel.isCustom && selectedFemaleModel.url) {
                                handlePlayAudio(selectedFemaleModel.url, `popup-fem-${primaryWord}`);
                              } else {
                                const langCode = activeLang === 'ja' ? 'ja' : 'ko';
                                const textToPlay = spokenWord || primaryWord;
                                const voiceProfId = selectedFemaleModel.voiceProfileId || selectedFemaleModel.id;
                                const isAi = selectedFemaleModel.isAiStudio || voiceProfId?.startsWith('ko-') || voiceProfId?.startsWith('ja-');
                                const url = isAi
                                  ? `/api/elevenlabs/tts?text=${encodeURIComponent(textToPlay)}&voiceProfileId=${encodeURIComponent(voiceProfId)}`
                                  : `/api/tts?text=${encodeURIComponent(textToPlay)}&lang=${langCode}&gender=female&voice=${encodeURIComponent(selectedFemaleModel.voice)}&pitch=${encodeURIComponent(selectedFemaleModel.pitch || '+0Hz')}&rate=${encodeURIComponent(selectedFemaleModel.rate || '+0%')}&model=${encodeURIComponent(selectedFemaleModel.id || selectedFemaleModel.name || '')}`;
                                handlePlayAudio(url, `popup-fem-${primaryWord}`);
                              }
                            }}
                            title={`Play in Female Voice (${selectedFemaleModel.name})`}
                            style={{
                              backgroundColor: playingAudioId === `popup-fem-${primaryWord}` ? "#be185d" : "transparent",
                              color: playingAudioId === `popup-fem-${primaryWord}` ? "#ffffff" : "#be185d",
                              border: "none",
                              padding: "6px 10px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              whiteSpace: "nowrap"
                            }}
                          >
                            <FemaleIcon size={22} isPlaying={playingAudioId === `popup-fem-${primaryWord}`} />
                            <span>{playingAudioId === `popup-fem-${primaryWord}` ? "⏹ Stop" : "▶ Female"}</span>
                          </button>
                          {!(typeof window !== 'undefined' && window.location.pathname.includes('/student')) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedFemaleModel.isCustom && selectedFemaleModel.url) {
                                  handleDownloadAudio(selectedFemaleModel.url, `${primaryWord}_custom_voice.mp3`);
                                } else {
                                  const langCode = activeLang === 'ja' ? 'ja' : 'ko';
                                  const textToPlay = spokenWord || primaryWord;
                                  const voiceProfId = selectedFemaleModel.voiceProfileId || selectedFemaleModel.id;
                                  const isAi = selectedFemaleModel.isAiStudio || voiceProfId?.startsWith('ko-') || voiceProfId?.startsWith('ja-');
                                  const filename = `${romaji || primaryWord}_female_${(selectedFemaleModel.name || 'voice').replace(/\s+/g, '_')}.mp3`;
                                  const dlUrl = isAi
                                    ? `/api/elevenlabs/tts?text=${encodeURIComponent(textToPlay)}&voiceProfileId=${encodeURIComponent(voiceProfId)}&download=true&filename=${encodeURIComponent(filename)}`
                                    : `/api/tts?text=${encodeURIComponent(textToPlay)}&lang=${langCode}&gender=female&voice=${encodeURIComponent(selectedFemaleModel.voice)}&pitch=${encodeURIComponent(selectedFemaleModel.pitch || '+0Hz')}&rate=${encodeURIComponent(selectedFemaleModel.rate || '+0%')}&model=${encodeURIComponent(selectedFemaleModel.id || selectedFemaleModel.name || '')}&download=true`;
                                  handleDownloadAudio(dlUrl, filename);
                                }
                              }}
                              title="Download Female Voice (MP3)"
                              style={{
                                backgroundColor: "transparent",
                                color: "#be185d",
                                border: "none",
                                borderLeft: "1.5px solid #fda4af",
                                padding: "6px 9px",
                                fontSize: "13px",
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

                        {/* Male Voice Group */}
                        <div style={{ display: "inline-flex", borderRadius: "8px", overflow: "hidden", border: "1.5px solid #7dd3fc", background: "#f0f9ff", boxShadow: "0 2px 6px rgba(2, 132, 199, 0.12)" }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedMaleModel.isCustom && selectedMaleModel.url) {
                                handlePlayAudio(selectedMaleModel.url, `popup-male-${primaryWord}`);
                              } else {
                                const langCode = activeLang === 'ja' ? 'ja' : 'ko';
                                const textToPlay = spokenWord || primaryWord;
                                const voiceProfId = selectedMaleModel.voiceProfileId || selectedMaleModel.id;
                                const isAi = selectedMaleModel.isAiStudio || voiceProfId?.startsWith('ko-') || voiceProfId?.startsWith('ja-');
                                const url = isAi
                                  ? `/api/elevenlabs/tts?text=${encodeURIComponent(textToPlay)}&voiceProfileId=${encodeURIComponent(voiceProfId)}`
                                  : `/api/tts?text=${encodeURIComponent(textToPlay)}&lang=${langCode}&gender=male&voice=${encodeURIComponent(selectedMaleModel.voice)}&pitch=${encodeURIComponent(selectedMaleModel.pitch || '+0Hz')}&rate=${encodeURIComponent(selectedMaleModel.rate || '+0%')}&model=${encodeURIComponent(selectedMaleModel.id || selectedMaleModel.name || '')}`;
                                handlePlayAudio(url, `popup-male-${primaryWord}`);
                              }
                            }}
                            title={`Play in Male Voice (${selectedMaleModel.name})`}
                            style={{
                              backgroundColor: playingAudioId === `popup-male-${primaryWord}` ? "#0284c7" : "transparent",
                              color: playingAudioId === `popup-male-${primaryWord}` ? "#ffffff" : "#0369a1",
                              border: "none",
                              padding: "6px 10px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              whiteSpace: "nowrap"
                            }}
                          >
                            <MaleIcon size={22} isPlaying={playingAudioId === `popup-male-${primaryWord}`} />
                            <span>{playingAudioId === `popup-male-${primaryWord}` ? "⏹ Stop" : "▶ Male"}</span>
                          </button>
                          {!(typeof window !== 'undefined' && window.location.pathname.includes('/student')) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedMaleModel.isCustom && selectedMaleModel.url) {
                                  handleDownloadAudio(selectedMaleModel.url, `${primaryWord}_custom_voice.mp3`);
                                } else {
                                  const langCode = activeLang === 'ja' ? 'ja' : 'ko';
                                  const textToPlay = spokenWord || primaryWord;
                                  const voiceProfId = selectedMaleModel.voiceProfileId || selectedMaleModel.id;
                                  const isAi = selectedMaleModel.isAiStudio || voiceProfId?.startsWith('ko-') || voiceProfId?.startsWith('ja-');
                                  const filename = `${romaji || primaryWord}_male_${(selectedMaleModel.name || 'voice').replace(/\s+/g, '_')}.mp3`;
                                  const dlUrl = isAi
                                    ? `/api/elevenlabs/tts?text=${encodeURIComponent(textToPlay)}&voiceProfileId=${encodeURIComponent(voiceProfId)}&download=true&filename=${encodeURIComponent(filename)}`
                                    : `/api/tts?text=${encodeURIComponent(textToPlay)}&lang=${langCode}&gender=male&voice=${encodeURIComponent(selectedMaleModel.voice)}&pitch=${encodeURIComponent(selectedMaleModel.pitch || '+0Hz')}&rate=${encodeURIComponent(selectedMaleModel.rate || '+0%')}&model=${encodeURIComponent(selectedMaleModel.id || selectedMaleModel.name || '')}&download=true`;
                                  handleDownloadAudio(dlUrl, filename);
                                }
                              }}
                              title="Download Male Voice (MP3)"
                              style={{
                                backgroundColor: "transparent",
                                color: "#0369a1",
                                border: "none",
                                borderLeft: "1.5px solid #7dd3fc",
                                padding: "6px 9px",
                                fontSize: "13px",
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

                      </div>
                    )}
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
