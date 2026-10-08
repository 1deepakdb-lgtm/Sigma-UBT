'use client';

import React, { useState, useEffect, useRef } from 'react';
import BatchimRulesGuide from '@/components/BatchimRulesGuide';

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

// 9 Smooth & Natural Human Female Voice Models
export const FEMALE_VOICE_MODELS = [
  { id: 'fem-sunhi-std', name: 'SunHi Standard', persona: 'Seoul Native Standard · Warm & Polite', voice: 'ko-KR-SunHiNeural', pitch: '+0Hz', rate: '-4%', tag: 'Seoul Standard' },
  { id: 'fem-sunhi-cheerful', name: 'SunHi Cheerful', persona: 'Friendly, Upbeat & Warm Delivery', voice: 'ko-KR-SunHiNeural', pitch: '+5Hz', rate: '+4%', tag: 'Bright / Upbeat' },
  { id: 'fem-sunhi-anchor', name: 'SunHi News Anchor', persona: 'Crisp & Articulate Formal Speech', voice: 'ko-KR-SunHiNeural', pitch: '-3Hz', rate: '+0%', tag: 'Formal News' },
  { id: 'fem-sunhi-soft', name: 'SunHi Gentle Melody', persona: 'Soft, Calm & Soothing Cadence', voice: 'ko-KR-SunHiNeural', pitch: '+3Hz', rate: '-10%', tag: 'Gentle / Relaxed' },
  { id: 'fem-sunhi-deep', name: 'SunHi Deep Calm', persona: 'Comforting Low Resonance · Grounded Mature Female', voice: 'ko-KR-SunHiNeural', pitch: '-6Hz', rate: '-6%', tag: 'Deep Calm' },
  { id: 'fem-sunhi-guide', name: 'SunHi Study Guide', persona: 'Steady Syllable Pronunciation Guide', voice: 'ko-KR-SunHiNeural', pitch: '+0Hz', rate: '-12%', tag: 'Study Guide' },
  { id: 'fem-sunhi-drill', name: 'SunHi Exam Speed', persona: 'EPS-TOPIK Rapid Exam Listening Pace', voice: 'ko-KR-SunHiNeural', pitch: '+2Hz', rate: '+14%', tag: 'Exam Speed' },
  { id: 'fem-ava-ai', name: 'Ava Conversational', persona: 'Smooth Modern Conversational AI Female', voice: 'en-US-AvaMultilingualNeural', pitch: '+0Hz', rate: '-5%', tag: 'Natural Female' },
  { id: 'fem-emma-ai', name: 'Emma Expressive', persona: 'Sweet & Expressive Natural Female Voice', voice: 'en-US-EmmaMultilingualNeural', pitch: '+4Hz', rate: '+2%', tag: 'Expressive' },
];

// 11 Smooth & Natural Human Male Voice Models
export const MALE_VOICE_MODELS = [
  { id: 'male-injoon-std', name: 'InJoon Standard', persona: 'Seoul Native Standard · Polite & Smooth Baritone', voice: 'ko-KR-InJoonNeural', pitch: '+0Hz', rate: '-4%', tag: 'Seoul Standard' },
  { id: 'male-injoon-deep', name: 'InJoon Deep Bass', persona: 'Warm Resonant Baritone · Deep Authoritative Tone', voice: 'ko-KR-InJoonNeural', pitch: '-7Hz', rate: '-7%', tag: 'Deep Baritone' },
  { id: 'male-injoon-cheerful', name: 'InJoon Cheerful', persona: 'Friendly, Warm & Upbeat Conversational Male', voice: 'ko-KR-InJoonNeural', pitch: '+4Hz', rate: '+4%', tag: 'Bright / Upbeat' },
  { id: 'male-injoon-guide', name: 'InJoon Study Guide', persona: 'Steady Step-by-Step Pronunciation Guide', voice: 'ko-KR-InJoonNeural', pitch: '-2Hz', rate: '-12%', tag: 'Study Guide' },
  { id: 'male-injoon-drill', name: 'InJoon Exam Speed', persona: 'EPS-TOPIK Rapid Exam Listening Pace', voice: 'ko-KR-InJoonNeural', pitch: '+2Hz', rate: '+14%', tag: 'Exam Speed' },
  { id: 'male-hyunsu-std', name: 'Hyunsu Instructor', persona: 'Modern Seoul Native Male Instructor', voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '+0Hz', rate: '-5%', tag: 'Korean Native' },
  { id: 'male-hyunsu-anchor', name: 'Hyunsu News Anchor', persona: 'Official KBS-Style Broadcast Formal Speech', voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '-4Hz', rate: '+2%', tag: 'Formal News' },
  { id: 'male-hyunsu-relaxed', name: 'Hyunsu Calm Tutor', persona: 'Relaxed Everyday Dialogue & Clear Articulation', voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '+2Hz', rate: '-8%', tag: 'Calm Tutor' },
  { id: 'male-andrew-ai', name: 'Andrew Casual Male', persona: 'Natural Conversational & Friendly AI Male', voice: 'en-US-AndrewMultilingualNeural', pitch: '+0Hz', rate: '-5%', tag: 'Natural Male' },
  { id: 'male-brian-ai', name: 'Brian Rich Baritone', persona: 'Rich Warm Timber & Fluent Pronunciation', voice: 'en-US-BrianMultilingualNeural', pitch: '-5Hz', rate: '-6%', tag: 'Warm Baritone' },
  { id: 'male-william-ai', name: 'William Articulate', persona: 'Smooth Resonant Modern Clear Male', voice: 'en-AU-WilliamMultilingualNeural', pitch: '+2Hz', rate: '-2%', tag: 'Articulate' },
];

export default function DictionarySection({ title = "📖 Multi-Language Dictionary" }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [loadingAudioId, setLoadingAudioId] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(24);
  const [copiedId, setCopiedId] = useState(null);

  // Selected Voice Models (State)
  const [selectedFemaleModel, setSelectedFemaleModel] = useState(FEMALE_VOICE_MODELS[0]);
  const [selectedMaleModel, setSelectedMaleModel] = useState(MALE_VOICE_MODELS[0]);
  const [isFemaleDropdownOpen, setIsFemaleDropdownOpen] = useState(false);
  const [isMaleDropdownOpen, setIsMaleDropdownOpen] = useState(false);

  // User Voice Library State (Saved/Uploaded Audio Recordings)
  const [voiceLibrary, setVoiceLibrary] = useState([]);
  const [activeCustomVoice, setActiveCustomVoice] = useState(null);

  // Speech Recognition (Voice Input / Search by speech)
  const [isListening, setIsListening] = useState(false);

  // User Voice Studio Modal & Upload States
  const [showVoiceStudio, setShowVoiceStudio] = useState(false);
  const [voiceStudioTab, setVoiceStudioTab] = useState('upload'); // 'upload' | 'record' | 'library'
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadVoiceName, setUploadVoiceName] = useState('');
  const [uploadWordScope, setUploadWordScope] = useState('current'); // 'current' | 'all'
  const [uploadGender, setUploadGender] = useState('female');
  const [isUploading, setIsUploading] = useState(false);

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
    fetchDictionary('');
  }, []);

  async function fetchDictionary(q) {
    setLoading(true);
    try {
      const res = await fetch(`/api/dictionary?q=${encodeURIComponent(q)}&limit=100`);
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
    fetchDictionary(searchQuery.trim());
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
    let textToSpeak = queryText || selectedWord?.korean || (results.length > 0 ? results[0]?.korean : '');
    let lang = 'ko';

    if (!textToSpeak) {
      // Natural sample preview phrase when no word is searched yet
      textToSpeak = customModel
        ? `안녕하세요! ${customModel.name} 한국어 발음 모델입니다.`
        : '안녕하세요! 한국어를 공부합시다.';
      lang = 'ko';
    } else {
      if (/[\u0900-\u097F]/.test(textToSpeak)) {
        lang = 'ne';
      } else if (/^[a-zA-Z\s]+$/.test(textToSpeak)) {
        lang = selectedWord?.korean && selectedWord.korean !== textToSpeak ? 'ko' : 'en';
      }

      if (lang === 'ko' && selectedWord?.korean && !/[\uAC00-\uD7AF]/.test(textToSpeak)) {
        textToSpeak = selectedWord.korean;
      }
    }

    // 3. Check if a custom voice in library is set as default for this specific word
    if (queryText && !customModel) {
      const matchingCustom = voiceLibrary.find(v => (v.word === 'all' || v.word?.toLowerCase() === queryText.toLowerCase()) && v.isDefault);
      if (matchingCustom) {
        handlePlayAudio(matchingCustom.url, audioId);
        return;
      }
    }

    const voiceName = activeModel?.voice || (gender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural');
    const pitchVal = activeModel?.pitch || '+0Hz';
    const rateVal = activeModel?.rate || '-5%';

    const url = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=${lang}&gender=${gender}&voice=${encodeURIComponent(voiceName)}&pitch=${encodeURIComponent(pitchVal)}&rate=${encodeURIComponent(rateVal)}`;
    handlePlayAudio(url, audioId);
  }

  function handleDownloadSearchWord(gender = 'female', customModel = null) {
    const activeModel = customModel || (gender === 'female' ? selectedFemaleModel : selectedMaleModel);

    if (activeModel?.isCustom && activeModel.url) {
      handleDownloadAudio(activeModel.url, `${activeModel.name.replace(/\s+/g, '_')}_custom_voice.mp3`);
      return;
    }

    const wordToDownload = searchQuery.trim() || selectedWord?.korean || (results.length > 0 ? results[0].korean : '') || '안녕하세요';
    if (!wordToDownload) return;

    let lang = 'ko';
    if (/[\u0900-\u097F]/.test(wordToDownload)) {
      lang = 'ne';
    } else if (/^[a-zA-Z\s]+$/.test(wordToDownload)) {
      lang = selectedWord?.korean && selectedWord.korean !== wordToDownload ? 'ko' : 'en';
    }

    const textToSpeak = (lang === 'ko' && selectedWord?.korean && !/[\uAC00-\uD7AF]/.test(wordToDownload))
      ? selectedWord.korean
      : wordToDownload;

    const url = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=${lang}&gender=${gender}&voice=${encodeURIComponent(activeModel.voice || 'ko-KR-SunHiNeural')}&pitch=${encodeURIComponent(activeModel.pitch || '+0Hz')}&rate=${encodeURIComponent(activeModel.rate || '-5%')}&download=true`;
    handleDownloadAudio(url, `${textToSpeak}_${gender}_${activeModel.name.replace(/\s+/g, '_')}.mp3`);
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
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          fetchDictionary(transcript.trim());
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

    const wordTarget = uploadWordScope === 'current' ? (currentActiveWord?.korean || searchQuery || 'speech') : 'all';
    const voiceName = uploadVoiceName.trim() || `My Recording (${wordTarget})`;

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
        isDefault: true
      };

      const updated = [newVoiceItem, ...voiceLibrary.map(v => ({ ...v, isDefault: false }))];
      saveVoiceLibrary(updated);
      handleSetVoiceActive(newVoiceItem, uploadGender);
      setVoiceStudioTab('library');
      alert(`Voice "${voiceName}" successfully saved and set as Active Voice!`);
    } catch (err) {
      console.error('Error saving recording:', err);
      const newVoiceItem = {
        id: `voice-${Date.now()}`,
        name: voiceName,
        url: recordedAudioUrl,
        word: wordTarget,
        gender: uploadGender,
        createdAt: new Date().toLocaleDateString(),
        isDefault: true
      };
      const updated = [newVoiceItem, ...voiceLibrary.map(v => ({ ...v, isDefault: false }))];
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
    const wordTarget = uploadWordScope === 'current' ? (currentActiveWord?.korean || searchQuery || 'all') : 'all';
    const voiceName = uploadVoiceName.trim() || uploadFile.name.replace(/\.[^/.]+$/, "");

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
        isDefault: true
      };

      const updated = [newVoiceItem, ...voiceLibrary.map(v => ({ ...v, isDefault: false }))];
      saveVoiceLibrary(updated);
      handleSetVoiceActive(newVoiceItem, uploadGender);

      setUploadFile(null);
      setUploadVoiceName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setVoiceStudioTab('library');
      alert(`Voice "${voiceName}" uploaded successfully and set in your Voice Library!`);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload audio file. Please ensure it is a valid MP3, WAV, or M4A file under 15MB.');
    } finally {
      setIsUploading(false);
    }
  }

  const filteredWords = results;
  const currentActiveWord = selectedWord || (results.length > 0 ? results[0] : null);

  return (
    <div
      onContextMenu={(e) => e.stopPropagation()}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
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
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" }}>{title}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Active Model Badges */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#fff1f2", border: "1.5px solid #fecdd3", padding: "4px 12px 4px 6px", borderRadius: "24px" }}>
            <FemaleIcon size={30} isPlaying={playingAudioId === 'search-female'} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#be185d" }}>{selectedFemaleModel.name}</span>
              <span style={{ fontSize: "10px", color: "#9d174d", fontWeight: "600" }}>{selectedFemaleModel.isCustom ? "⭐ Custom Library" : "Female Model"}</span>
            </div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#f0f9ff", border: "1.5px solid #bae6fd", padding: "4px 12px 4px 6px", borderRadius: "24px" }}>
            <MaleIcon size={30} isPlaying={playingAudioId === 'search-male'} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#0369a1" }}>{selectedMaleModel.name}</span>
              <span style={{ fontSize: "10px", color: "#0284c7", fontWeight: "600" }}>{selectedMaleModel.isCustom ? "⭐ Custom Library" : "Male Model"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar with Reordered Buttons: GO BUTTON FIRST, then Female Dropdown, Male Dropdown, and User Voice */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search Input Box */}
        <div style={{ position: "relative", flex: "1 1 260px", minWidth: "220px" }}>
          <input
            type="text"
            placeholder="Type word (e.g. kukur, eat, boy, ghar, 안녕) and click Go or press Enter..."
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
            onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.backgroundColor = "#fff"; }}
            onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.backgroundColor = "#f8fafc"; }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); fetchDictionary(''); }}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}
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
          <span>🔍</span>
          <span>{loading ? "Searching..." : "Go"}</span>
        </button>

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
                left: 0,
                zIndex: 1000,
                width: "330px",
                maxHeight: "380px",
                overflowY: "auto",
                backgroundColor: "#ffffff",
                border: "1.5px solid #fecdd3",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(225, 29, 72, 0.18)",
                padding: "8px",
                animation: "dropdownMenuIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              {/* Uploaded Voice Library Section */}
              <div style={{ padding: "6px 8px", background: "#fff1f2", borderRadius: "6px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#9d174d", textTransform: "uppercase" }}>
                  ⭐ My Voice Library ({voiceLibrary.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsFemaleDropdownOpen(false);
                    setVoiceStudioTab('upload');
                    setShowVoiceStudio(true);
                  }}
                  style={{
                    backgroundColor: "#be185d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  ➕ Upload Audio
                </button>
              </div>

              {voiceLibrary.length > 0 && (
                <div style={{ marginBottom: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {voiceLibrary.map((voice) => {
                    const isSelected = selectedFemaleModel.id === voice.id;
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
                          backgroundColor: isSelected ? "#ffe4e6" : "#fdf2f8",
                          border: isSelected ? "1.5px solid #e11d48" : "1px solid #fbcfe8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: "#9d174d" }}>⭐ {voice.name}</span>
                          <span style={{ fontSize: "10px", color: "#be185d" }}>{voice.word === 'all' ? 'All Words' : `Word: ${voice.word}`}</span>
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
                  👩 Female Models ({FEMALE_VOICE_MODELS.length})
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                {FEMALE_VOICE_MODELS.map((model) => {
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
                left: 0,
                zIndex: 1000,
                width: "330px",
                maxHeight: "380px",
                overflowY: "auto",
                backgroundColor: "#ffffff",
                border: "1.5px solid #bae6fd",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(2, 132, 199, 0.18)",
                padding: "8px",
                animation: "dropdownMenuIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              {/* Uploaded Voice Library Section */}
              <div style={{ padding: "6px 8px", background: "#f0f9ff", borderRadius: "6px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#0369a1", textTransform: "uppercase" }}>
                  ⭐ My Voice Library ({voiceLibrary.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsMaleDropdownOpen(false);
                    setVoiceStudioTab('upload');
                    setShowVoiceStudio(true);
                  }}
                  style={{
                    backgroundColor: "#0284c7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  ➕ Upload Audio
                </button>
              </div>

              {voiceLibrary.length > 0 && (
                <div style={{ marginBottom: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {voiceLibrary.map((voice) => {
                    const isSelected = selectedMaleModel.id === voice.id;
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
                          backgroundColor: isSelected ? "#e0f2fe" : "#f0f9ff",
                          border: isSelected ? "1.5px solid #0284c7" : "1px solid #bae6fd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: "#0369a1" }}>⭐ {voice.name}</span>
                          <span style={{ fontSize: "10px", color: "#0284c7" }}>{voice.word === 'all' ? 'All Words' : `Word: ${voice.word}`}</span>
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
                  👨 Male Models ({MALE_VOICE_MODELS.length})
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                {MALE_VOICE_MODELS.map((model) => {
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
        {/* Gallery Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>📚</span>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
              {searchQuery ? `Search Results for "${searchQuery}"` : "Searchable Vocabulary Words"}
            </h3>
            <span style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "2px 9px", borderRadius: "12px", fontSize: "14px", fontWeight: "800" }}>
              {filteredWords.length} words
            </span>
          </div>
        </div>

        {/* Word Cards Grid */}
        {filteredWords.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 20px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
            <div style={{ fontWeight: "700", color: "#334155", fontSize: "14px" }}>No matching vocabulary words found</div>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0" }}>Try typing in Korean, Nepali, English or Romanized sound</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "12px" }}>
              {filteredWords.slice(0, displayLimit).map((word, idx) => {
                const isSelected = selectedWord?.korean === word.korean;
                const isPlayingFem = playingAudioId === `card-fem-${word.korean}`;
                const isPlayingMale = playingAudioId === `card-male-${word.korean}`;
                const isPlayingAny = isPlayingFem || isPlayingMale;

                // Check if user has uploaded voice for this word
                const customVoiceForWord = voiceLibrary.find(v => v.word?.toLowerCase() === word.korean?.toLowerCase());

                return (
                  <div
                    key={`${word.korean}-${idx}`}
                    onClick={() => setSelectedWord(word)}
                    style={{
                      backgroundColor: isSelected ? "#f0f9ff" : "#ffffff",
                      border: isSelected ? "2px solid #2563eb" : (isPlayingAny ? "1.5px solid #f43f5e" : "1px solid #e2e8f0"),
                      borderRadius: "10px",
                      padding: "12px 14px",
                      boxShadow: isSelected ? "0 4px 12px rgba(37,99,235,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                      position: "relative",
                      userSelect: "text",
                      WebkitUserSelect: "text"
                    }}
                  >
                    {/* Top Row: Korean + Category & Copy Button */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", userSelect: "text" }}>
                          {word.korean}
                          {word.hasBatchimRule && (
                            <span style={{ fontSize: "14px", backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                              받침
                            </span>
                          )}
                          {customVoiceForWord && (
                            <span title="You uploaded a custom voice for this word!" style={{ fontSize: "11px", backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "1px 5px", borderRadius: "4px", fontWeight: "700" }}>
                              ⭐ My Voice
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "14px", color: "#2563eb", fontWeight: "600", marginTop: "2px", userSelect: "text" }}>
                          [{word.koreanSpoken || word.korean}] · <span style={{ color: "#1e40af", fontWeight: "600" }}>[{word.koreanNepaliRomanized || word.koreanRomanized}]</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        {word.category && (
                          <span style={{ fontSize: "14px", backgroundColor: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "5px", fontWeight: "600", whiteSpace: "nowrap" }}>
                            {word.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Translations */}
                    <div style={{ margin: "10px 0 6px 0", display: "flex", flexDirection: "column", gap: "5px", userSelect: "text" }}>
                      <div style={{ color: "#15803d", fontWeight: "600", fontSize: "14px", lineHeight: "1.4", userSelect: "text" }}>
                        {word.nepali}
                      </div>
                      <div style={{ color: "#334155", fontWeight: "600", fontSize: "14px", lineHeight: "1.4", userSelect: "text" }}>
                        {word.english}
                      </div>
                    </div>

                    {/* 🔊 Voice Popup Bar (Appears when this word is selected) */}
                    {isSelected && (
                      <div
                        style={{
                          marginTop: "10px",
                          paddingTop: "9px",
                          borderTop: "1.5px solid #bfdbfe",
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
                            onClick={() => handlePlayAudio(customVoiceForWord.url, `popup-custom-${word.korean}`)}
                            title="Play your uploaded voice recording"
                            style={{
                              backgroundColor: playingAudioId === `popup-custom-${word.korean}` ? "#15803d" : "#dcfce7",
                              color: playingAudioId === `popup-custom-${word.korean}` ? "#ffffff" : "#15803d",
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
                            <span>{playingAudioId === `popup-custom-${word.korean}` ? "⏹ Stop" : "▶ My Voice"}</span>
                          </button>
                        )}

                        {/* Female Voice Group */}
                        <div style={{ display: "inline-flex", borderRadius: "8px", overflow: "hidden", border: "1.5px solid #fda4af", background: "#fff1f2", boxShadow: "0 2px 6px rgba(225, 29, 72, 0.12)" }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedFemaleModel.isCustom && selectedFemaleModel.url) {
                                handlePlayAudio(selectedFemaleModel.url, `popup-fem-${word.korean}`);
                              } else {
                                const url = `/api/tts?text=${encodeURIComponent(word.korean)}&lang=ko&gender=female&voice=${encodeURIComponent(selectedFemaleModel.voice)}&pitch=${encodeURIComponent(selectedFemaleModel.pitch)}&rate=${encodeURIComponent(selectedFemaleModel.rate)}`;
                                handlePlayAudio(url, `popup-fem-${word.korean}`);
                              }
                            }}
                            title={`Play in Female Voice (${selectedFemaleModel.name})`}
                            style={{
                              backgroundColor: playingAudioId === `popup-fem-${word.korean}` ? "#be185d" : "transparent",
                              color: playingAudioId === `popup-fem-${word.korean}` ? "#ffffff" : "#be185d",
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
                            <FemaleIcon size={22} isPlaying={playingAudioId === `popup-fem-${word.korean}`} />
                            <span>{playingAudioId === `popup-fem-${word.korean}` ? "⏹ Stop" : "▶ Female"}</span>
                          </button>
                          {!(typeof window !== 'undefined' && window.location.pathname.includes('/student')) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedFemaleModel.isCustom && selectedFemaleModel.url) {
                                  handleDownloadAudio(selectedFemaleModel.url, `${word.korean}_custom_voice.mp3`);
                                } else {
                                  const dlUrl = `/api/tts?text=${encodeURIComponent(word.korean)}&lang=ko&gender=female&voice=${encodeURIComponent(selectedFemaleModel.voice)}&pitch=${encodeURIComponent(selectedFemaleModel.pitch)}&rate=${encodeURIComponent(selectedFemaleModel.rate)}&download=true`;
                                  handleDownloadAudio(dlUrl, `${word.koreanRomanized || word.korean}_female_${selectedFemaleModel.name}.mp3`);
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
                                handlePlayAudio(selectedMaleModel.url, `popup-male-${word.korean}`);
                              } else {
                                const url = `/api/tts?text=${encodeURIComponent(word.korean)}&lang=ko&gender=male&voice=${encodeURIComponent(selectedMaleModel.voice)}&pitch=${encodeURIComponent(selectedMaleModel.pitch)}&rate=${encodeURIComponent(selectedMaleModel.rate)}`;
                                handlePlayAudio(url, `popup-male-${word.korean}`);
                              }
                            }}
                            title={`Play in Male Voice (${selectedMaleModel.name})`}
                            style={{
                              backgroundColor: playingAudioId === `popup-male-${word.korean}` ? "#0284c7" : "transparent",
                              color: playingAudioId === `popup-male-${word.korean}` ? "#ffffff" : "#0369a1",
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
                            <MaleIcon size={22} isPlaying={playingAudioId === `popup-male-${word.korean}`} />
                            <span>{playingAudioId === `popup-male-${word.korean}` ? "⏹ Stop" : "▶ Male"}</span>
                          </button>
                          {!(typeof window !== 'undefined' && window.location.pathname.includes('/student')) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedMaleModel.isCustom && selectedMaleModel.url) {
                                  handleDownloadAudio(selectedMaleModel.url, `${word.korean}_custom_voice.mp3`);
                                } else {
                                  const dlUrl = `/api/tts?text=${encodeURIComponent(word.korean)}&lang=ko&gender=male&voice=${encodeURIComponent(selectedMaleModel.voice)}&pitch=${encodeURIComponent(selectedMaleModel.pitch)}&rate=${encodeURIComponent(selectedMaleModel.rate)}&download=true`;
                                  handleDownloadAudio(dlUrl, `${word.koreanRomanized || word.korean}_male_${selectedMaleModel.name}.mp3`);
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
                    color: "#2563eb",
                    border: "1.5px solid #bfdbfe",
                    padding: "8px 24px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  ➕ Show More ({filteredWords.length - displayLimit} words remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* WHOLE BATCHIM (받침) RULES GUIDE & 11 DUAL BATCHIMS */}
      <BatchimRulesGuide handlePlayAudio={handlePlayAudio} playingAudioId={playingAudioId} />

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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px" }}>🎙️</span>
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
            <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", border: "1.5px solid #e2e8f0", padding: "14px", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#1e3a8a", marginBottom: "2px" }}>
                {currentActiveWord?.korean || searchQuery || "한국어"}
              </div>
              <div style={{ fontSize: "13px", color: "#2563eb", fontWeight: "700" }}>
                [{currentActiveWord?.koreanSpoken || currentActiveWord?.korean || "korean"}] · [{currentActiveWord?.koreanNepaliRomanized || currentActiveWord?.koreanRomanized || "korean"}]
              </div>
              <div style={{ marginTop: "4px", fontSize: "13px", color: "#15803d", fontWeight: "600" }}>
                {currentActiveWord?.nepali || "नेपाली अर्थ"}
              </div>
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

                {/* Scope: Current Word vs All Words */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                      Apply Voice To:
                    </label>
                    <select
                      value={uploadWordScope}
                      onChange={(e) => setUploadWordScope(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      <option value="current">Current Word Only ({currentActiveWord?.korean || "This Word"})</option>
                      <option value="all">Global (All Words / Default Speech)</option>
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                      Voice Category:
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
                  <span>{isUploading ? "Uploading & Saving..." : "💾 Upload & Set in Voice Library"}</span>
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
                      {isUploading ? "Saving to Library..." : "💾 Save Recording & Set in Voice Library"}
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
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>⭐ {voice.name}</span>
                              {isVoiceActive && (
                                <span style={{ backgroundColor: "#10b981", color: "white", padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "800" }}>
                                  ✓ ACTIVE
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                              Target: <strong style={{ color: "#2563eb" }}>{voice.word === 'all' ? 'All Words' : voice.word}</strong> · Added: {voice.createdAt || 'Recent'}
                            </div>
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
