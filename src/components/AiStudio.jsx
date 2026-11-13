'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  VOICE_PROFILES, 
  SPEAKING_STYLES, 
  VOICE_CATEGORIES, 
  DIALOGUE_TEMPLATES, 
  ELEVENLABS_MODELS,
  AVAILABLE_MODELS,
  MODEL_SAMPLE_SPEECH
} from '@/lib/elevenlabsConfig';
import ListeningExamSynchronizer from './ListeningExamSynchronizer';

export default function AiStudio({
  initialLang = 'ko',
  initialText = '',
  onClose = null,
  embedded = false,
  instituteLanguage = null,
  userRole = null,
  activeFemaleModelId = null,
  activeMaleModelId = null,
  onSelectVoiceModel = null
}) {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'dialogue' | 'listeningBuilder'

  // Super Admin verification (Strictly exclude Institute and Student)
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    if (userRole) {
      const r = String(userRole).toLowerCase();
      if (r === 'institute' || r === 'student' || r === 'staff' || r === 'teacher') return false;
      if (r === 'admin' || r === 'superadmin') return true;
    }
    if (typeof window !== 'undefined') {
      try {
        const pathname = window.location.pathname || '';
        // If route belongs to student or institute, NEVER allow Super Admin tools
        if (pathname.includes('/student') || pathname.includes('/institute')) return false;

        // Route belongs to admin or explicitly has superadmin flag
        if (pathname.startsWith('/admin')) return true;
        if (window.location.search?.includes('superadmin=true')) return true;

        const r = (localStorage.getItem('currentRole') || localStorage.getItem('role') || '').toLowerCase();
        if (r === 'student' || r === 'institute' || r === 'staff' || r === 'teacher') return false;
        if (r === 'admin' || r === 'superadmin') return true;

        const u = localStorage.getItem('user') || localStorage.getItem('currentUser');
        if (u) {
          const parsed = JSON.parse(u);
          const ur = (parsed?.role || '').toLowerCase();
          if (ur === 'student' || ur === 'institute' || ur === 'staff') return false;
          if (ur === 'admin' || ur === 'superadmin') return true;
        }

        if (pathname.startsWith('/voice-studio')) {
          if (r === 'student' || r === 'institute') return false;
          return true;
        }
      } catch (e) {}
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname || '';
      if (pathname.includes('/student') || pathname.includes('/institute')) {
        setIsSuperAdmin(false);
        if (activeTab === 'listeningBuilder') setActiveTab('generator');
        return;
      }
      const r = (userRole || localStorage.getItem('currentRole') || localStorage.getItem('role') || '').toLowerCase();
      if (r === 'student' || r === 'institute' || r === 'staff' || r === 'teacher') {
        setIsSuperAdmin(false);
        if (activeTab === 'listeningBuilder') setActiveTab('generator');
      } else if (r === 'admin' || r === 'superadmin' || pathname.startsWith('/admin') || window.location.search?.includes('superadmin=true')) {
        setIsSuperAdmin(true);
      }
    }
  }, [userRole, activeTab]);

  // Strict check: audio download is only allowed for Admin and Institute, NEVER for students
  const [canDownloadAudio, setCanDownloadAudio] = useState(() => {
    if (userRole) {
      const r = String(userRole).toLowerCase();
      if (r === 'student' || r === 'staff' || r === 'teacher') return false;
      if (r === 'admin' || r === 'superadmin' || r === 'institute') return true;
    }
    if (typeof window !== 'undefined') {
      try {
        const pathname = window.location.pathname || '';
        if (pathname.includes('/student')) return false;
        if (localStorage.getItem('currentStudentPhone') || localStorage.getItem('studentPhone')) return false;

        const r = (localStorage.getItem('currentRole') || localStorage.getItem('role') || '').toLowerCase();
        if (r === 'student') return false;
        if (r === 'admin' || r === 'superadmin' || r === 'institute') return true;

        if (pathname.startsWith('/admin') || pathname.startsWith('/institute')) return true;
      } catch (e) {}
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname || '';
      if (pathname.includes('/student') || localStorage.getItem('currentStudentPhone') || localStorage.getItem('studentPhone')) {
        setCanDownloadAudio(false);
        return;
      }
      const r = (userRole || localStorage.getItem('currentRole') || localStorage.getItem('role') || '').toLowerCase();
      if (r === 'student') {
        setCanDownloadAudio(false);
      } else if (r === 'admin' || r === 'superadmin' || r === 'institute' || pathname.startsWith('/admin') || pathname.startsWith('/institute')) {
        setCanDownloadAudio(true);
      } else {
        setCanDownloadAudio(false);
      }
    }
  }, [userRole]);

  // Determine effective student language ('korean' | 'japanese' | 'both')
  const [effectiveInstLang, setEffectiveInstLang] = useState(() => {
    if (instituteLanguage) return instituteLanguage.toLowerCase();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('instituteLanguage');
      if (saved) return saved.toLowerCase();
    }
    return (initialLang === 'ja' ? 'japanese' : initialLang === 'ko' ? 'korean' : 'both');
  });

  const getInitialLang = () => {
    if (effectiveInstLang === 'korean') return 'ko';
    if (effectiveInstLang === 'japanese') return 'ja';
    return initialLang === 'ja' ? 'ja' : 'ko';
  };

  const [selectedLang, setSelectedLang] = useState(getInitialLang);
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'female' | 'male'
  const [selectedProfile, setSelectedProfile] = useState(
    VOICE_PROFILES.find(v => v.language === getInitialLang()) || VOICE_PROFILES[0]
  );
  const [selectedStyle, setSelectedStyle] = useState('natural_conversation');
  const [inputText, setInputText] = useState(initialText || '');
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0);
  
  // Categorical States
  const [selectedAgeStyle, setSelectedAgeStyle] = useState('warm');
  const [selectedPersonality, setSelectedPersonality] = useState('friendly');
  const [selectedSpeechMode, setSelectedSpeechMode] = useState('natural_conversation');
  const [selectedEmotion, setSelectedEmotion] = useState('happy');
  const [pitchFactor, setPitchFactor] = useState(1.0);
  const [vocalWeight, setVocalWeight] = useState(0.5);

  // Custom Fine-Tuning Drawer
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [customStability, setCustomStability] = useState(0.50);
  const [customSimilarity, setCustomSimilarity] = useState(0.75);
  const [customStyle, setCustomStyle] = useState(0.15);

  // Audio Playback & Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
  const [audioProvider, setAudioProvider] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedModel, setSelectedModel] = useState('eleven_multilingual_v2');
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null);
  const [audioError, setAudioError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ hasApiKey: false, ready: false });

  // Dialogue Studio State
  const [dialogueLang, setDialogueLang] = useState(getInitialLang());
  const [dialogueSpeakerA, setDialogueSpeakerA] = useState(getInitialLang() === 'ja' ? 'ja-female-1' : 'ko-female-1');
  const [dialogueSpeakerB, setDialogueSpeakerB] = useState(getInitialLang() === 'ja' ? 'ja-male-1' : 'ko-male-2');
  const [dialogueGenderA, setDialogueGenderA] = useState('female');
  const [dialogueGenderB, setDialogueGenderB] = useState('male');
  const [dialogueModelA, setDialogueModelA] = useState('humanized_conversational_v3');
  const [dialogueModelB, setDialogueModelB] = useState('deep_human_neural_v2');
  const [dialogueTurns, setDialogueTurns] = useState([]);
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);
  const [dialogueAudioUrl, setDialogueAudioUrl] = useState(null);
  const [previewingLineIndex, setPreviewingLineIndex] = useState(null);
  const [playingModelKey, setPlayingModelKey] = useState(null);
  const [modelAudioUrls, setModelAudioUrls] = useState({});

  const audioRef = useRef(null);
  const previewAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);

  // Synchronize effective student instituteLanguage
  useEffect(() => {
    if (instituteLanguage) {
      setEffectiveInstLang(instituteLanguage.toLowerCase());
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('instituteLanguage');
      if (saved) setEffectiveInstLang(saved.toLowerCase());
    }
  }, [instituteLanguage]);

  // Update selected language when initialLang or effectiveInstLang changes
  useEffect(() => {
    let target = 'ko';
    if (effectiveInstLang === 'korean') {
      target = 'ko';
    } else if (effectiveInstLang === 'japanese') {
      target = 'ja';
    } else if (initialLang === 'ja') {
      target = 'ja';
    } else {
      target = 'ko';
    }

    setSelectedLang(target);
    setDialogueLang(target);
    const match = VOICE_PROFILES.find(v => v.language === target);
    if (match) {
      setSelectedProfile(match);
      if (!initialText) {
        setInputText(match.sampleSentence);
      }
    }
  }, [initialLang, effectiveInstLang]);

  // Update input text when initialText prop changes
  useEffect(() => {
    if (initialText && initialText.trim()) {
      setInputText(initialText.trim());
    }
  }, [initialText]);

  // Fetch initial API status and default dialogue turns
  useEffect(() => {
    fetch('/api/elevenlabs/voices')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setApiStatus({ hasApiKey: data.hasApiKey, ready: true });
        }
      })
      .catch(() => {});

    // Set initial dialogue template
    const currentLang = effectiveInstLang === 'japanese' ? 'ja' : effectiveInstLang === 'korean' ? 'ko' : selectedLang;
    const initialTemplate = currentLang === 'ja' ? DIALOGUE_TEMPLATES.ja[0] : DIALOGUE_TEMPLATES.ko[0];
    if (initialTemplate) {
      setDialogueTurns(initialTemplate.turns.map(t => ({
        speaker: t.speaker,
        text: t.text,
        voiceProfileId: t.speaker === 'A' ? (currentLang === 'ja' ? 'ja-female-1' : 'ko-female-1') : (currentLang === 'ja' ? 'ja-male-1' : 'ko-male-2')
      })));
    }
    if (!initialText) {
      const defaultProfile = VOICE_PROFILES.find(v => v.language === currentLang) || VOICE_PROFILES[0];
      setInputText(defaultProfile.sampleSentence);
    }
  }, [effectiveInstLang]);

  // Sync selected voice settings
  useEffect(() => {
    if (selectedProfile) {
      setCustomStability(selectedProfile.settings.stability);
      setCustomSimilarity(selectedProfile.settings.similarity_boost);
      setCustomStyle(selectedProfile.settings.style);
      if (selectedProfile.ageStyle) setSelectedAgeStyle(selectedProfile.ageStyle);
      if (selectedProfile.personality) setSelectedPersonality(selectedProfile.personality);
      if (selectedProfile.basePitchFactor !== undefined) setPitchFactor(selectedProfile.basePitchFactor);
      if (selectedProfile.baseVocalWeight !== undefined) setVocalWeight(selectedProfile.baseVocalWeight);
    }
  }, [selectedProfile]);

  // Filter voices by language and gender
  const filteredVoices = VOICE_PROFILES.filter(v => {
    const langMatch = v.language === selectedLang;
    const genderMatch = genderFilter === 'all' || v.gender === genderFilter;
    return langMatch && genderMatch;
  });

  // Crystal-Clear Native Audio Helper for Neat, Crisp Speech Synthesis
  const speakStudioNative = (text, langCode = 'ko-KR', gender = 'female', onEnd = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    try {
      window.speechSynthesis.cancel();
      const clean = (text || '').replace(/[（(][^）)]*[）)]/g, '').replace(/[\/\\]+/g, ', ').trim();
      if (!clean) return false;

      const utt = new SpeechSynthesisUtterance(clean);
      utt.lang = langCode;
      utt.pitch = gender === 'male' ? 0.74 : 1.18;
      utt.rate = gender === 'male' ? 0.94 : 1.00;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langVoices = voices.filter(v => v.lang && v.lang.toLowerCase().includes(langCode.slice(0, 2).toLowerCase()));
        if (langVoices.length > 0) {
          if (gender === 'male') {
            const m = langVoices.find(v => {
              const n = (v.name || '').toLowerCase();
              if (n.includes('female') || n.includes('woman') || n.includes('girl')) return false;
              return n.includes('male') || n.includes('keita') || n.includes('injoon') || n.includes('minho') || n.includes('david') || n.includes('george') || n.includes('sagar') || n.includes('sin-ji') || n.includes('sinji') || n.includes('otoya') || n.includes('guy') || n.includes('ichiro') || n.includes('kenji') || n.includes('x-ism') || n.includes('x-htm') || n.includes('x-kof') || n.includes('alex') || n.includes('fred');
            }) || langVoices.find(v => {
              const n = (v.name || '').toLowerCase();
              return !n.includes('female') && !n.includes('woman') && !n.includes('girl') && !n.includes('sunhi') && !n.includes('nanami') && !n.includes('zira') && !n.includes('kyoko') && !n.includes('ayumi') && !n.includes('samantha');
            });
            if (m) utt.voice = m;
          } else {
            const f = langVoices.find(v => {
              const n = (v.name || '').toLowerCase();
              return n.includes('female') || n.includes('woman') || n.includes('girl') || n.includes('sunhi') || n.includes('nanami') || n.includes('zira') || n.includes('kyoko') || n.includes('ayumi') || n.includes('yuna') || n.includes('samantha') || n.includes('victoria') || n.includes('karen') || n.includes('jenny');
            }) || langVoices[0];
            if (f) utt.voice = f;
          }
        }
      }

      utt.onend = () => { if (onEnd) onEnd(); };
      utt.onerror = () => { if (onEnd) onEnd(); };
      window.speechSynthesis.speak(utt);
      return true;
    } catch (e) {
      return false;
    }
  };

  const playWebAudioStudio = async (url, targetGender, onEnd, onError) => {
    if (typeof window === 'undefined') return false;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }

    const abortController = new AbortController();
    let hasResponded = false;
    const abortTimer = setTimeout(() => {
      if (!hasResponded) {
        abortController.abort();
        if (onError) onError(new Error('TTS fetch timeout'));
      }
    }, 5000);

    try {
      const res = await fetch(url, { signal: abortController.signal });
      hasResponded = true;
      clearTimeout(abortTimer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuf = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));

      const source = ctx.createBufferSource();
      source.buffer = decoded;
      source.playbackRate.value = 1.0;

      source.connect(ctx.destination);
      sourceNodeRef.current = source;

      source.onended = () => {
        sourceNodeRef.current = null;
        if (onEnd) onEnd();
      };

      source.start(0);
      return true;
    } catch (err) {
      hasResponded = true;
      clearTimeout(abortTimer);
      if (err.name === 'AbortError') return false;
      console.warn('Web Audio studio play error:', err);
      if (onError) onError(err);
      return false;
    }
  };

  // Handle Voice Preview with Model Selection
  const handlePlayPreview = async (voice, modelOverride = null) => {
    if (!voice) return;
    const effectiveModel = modelOverride || selectedModel;
    const previewKey = `${voice.id}_${effectiveModel}`;

    // If currently playing, stop it immediately (toggle off)
    if (previewingVoiceId === previewKey) {
      if (previewAudioRef.current) {
        try {
          previewAudioRef.current.pause();
          previewAudioRef.current.currentTime = 0;
        } catch (e) {}
      }
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) {}
        sourceNodeRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      setPreviewingVoiceId(null);
      return;
    }

    // Stop currently running audio
    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    // Unlock Web Audio context synchronously during user tap (crucial for mobile/tablet Safari & Chrome)
    if (typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } catch (e) {}
    }

    setPreviewingVoiceId(previewKey);
    setAudioError(null);

    const isMale = voice.gender === 'male' || (!/(?:^|[-_])female(?:[-_\d]|$)/i.test(voice.id || '') && /(?:^|[-_])male(?:[-_\d]|$)/i.test(voice.id || ''));
    const targetGender = isMale ? 'male' : 'female';

    try {
      const params = new URLSearchParams({
        text: voice.sampleSentence,
        voiceProfileId: voice.id,
        gender: targetGender,
        modelId: effectiveModel,
        speechMode: voice.defaultSpeechMode || 'teacher',
        ageStyle: voice.ageStyle || '',
        personality: voice.personality || '',
        emotion: voice.defaultEmotion || 'reassuring',
        weight: String(voice.baseVocalWeight !== undefined ? voice.baseVocalWeight : 0.40),
        pitchFactor: String(voice.basePitchFactor !== undefined ? voice.basePitchFactor : 1.00),
        speed: String(voice.settings?.speed || 0.96)
      });
      const url = `/api/elevenlabs/tts?${params.toString()}`;

      // Immediate Audio element playback: synchronous with user gesture (guarantees playback on iOS mobile & tablets)
      let audio = previewAudioRef.current;
      if (!audio) {
        audio = new Audio();
        previewAudioRef.current = audio;
      }
      audio.src = url;
      audio.playbackRate = 1.0;

      audio.onended = () => {
        setPreviewingVoiceId(null);
      };

      const fallbackToWebAudio = () => {
        playWebAudioStudio(
          url,
          targetGender,
          () => setPreviewingVoiceId(null),
          () => {
            const spoke = speakStudioNative(voice.sampleSentence, voice.language === 'ja' ? 'ja-JP' : 'ko-KR', targetGender, () => setPreviewingVoiceId(null));
            if (!spoke) {
              setPreviewingVoiceId(null);
              setAudioError('Failed to play voice preview. Please check connection.');
            }
          }
        );
      };

      audio.onerror = () => {
        console.warn('HTML5 Audio error on mobile/tablet, attempting Web Audio fallback...');
        fallbackToWebAudio();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('HTML5 Audio play rejected, falling back to Web Audio:', err);
          fallbackToWebAudio();
        });
      }
    } catch (err) {
      const spoke = speakStudioNative(voice.sampleSentence, voice.language === 'ja' ? 'ja-JP' : 'ko-KR', targetGender, () => setPreviewingVoiceId(null));
      if (!spoke) {
        setPreviewingVoiceId(null);
        setAudioError(err.message || 'Audio playback error');
      }
    }
  };

  // Dedicated Play Audio for AI Model Voice (Female and Male Separately)
  const handlePlayModelVoice = async (modelId, gender, lang = dialogueLang, speakerRole = 'A') => {
    const playKey = `${modelId}_${gender}_${speakerRole}`;

    // If already playing this exact model voice, stop immediately (toggle off)
    if (playingModelKey === playKey) {
      if (previewAudioRef.current) {
        try {
          previewAudioRef.current.pause();
          previewAudioRef.current.currentTime = 0;
        } catch (e) {}
      }
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) {}
        sourceNodeRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      setPlayingModelKey(null);
      setPreviewingVoiceId(null);
      return;
    }

    // Stop currently running audio
    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    // Unlock Web Audio context synchronously during user tap
    if (typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } catch (e) {}
    }

    setPlayingModelKey(playKey);
    setPreviewingVoiceId(`model_${playKey}`);
    setAudioError(null);

    const targetLang = lang === 'ja' ? 'ja' : 'ko';
    const sampleText = MODEL_SAMPLE_SPEECH[modelId]?.[targetLang]?.[gender] 
      || (targetLang === 'ja' 
          ? (gender === 'male' ? 'こんにちは！男性音声モデルのテストです。' : 'こんにちは！女性音声モデルのテストです。')
          : (gender === 'male' ? '안녕하십니까! 남성 음성 모델 테스트입니다.' : '안녕하세요! 여성 음성 모델 테스트입니다.'));

    const defaultVoiceProfile = targetLang === 'ja' 
      ? (gender === 'male' ? 'ja-male-1' : 'ja-female-1')
      : (gender === 'male' ? 'ko-male-1' : 'ko-female-1');

    try {
      const params = new URLSearchParams({
        text: sampleText,
        voiceProfileId: defaultVoiceProfile,
        gender: gender,
        modelId: modelId,
        speechMode: 'natural_conversation',
        speed: '1.0'
      });
      const url = `/api/elevenlabs/tts?${params.toString()}`;
      setModelAudioUrls(prev => ({ ...prev, [playKey]: url }));

      let audio = previewAudioRef.current;
      if (!audio) {
        audio = new Audio();
        previewAudioRef.current = audio;
      }
      audio.src = url;
      audio.playbackRate = 1.0;

      audio.onended = () => {
        setPlayingModelKey(null);
        setPreviewingVoiceId(null);
      };

      const fallbackToWebAudio = () => {
        playWebAudioStudio(
          url,
          gender,
          () => {
            setPlayingModelKey(null);
            setPreviewingVoiceId(null);
          },
          () => {
            const spoke = speakStudioNative(sampleText, targetLang === 'ja' ? 'ja-JP' : 'ko-KR', gender, () => {
              setPlayingModelKey(null);
              setPreviewingVoiceId(null);
            });
            if (!spoke) {
              setPlayingModelKey(null);
              setPreviewingVoiceId(null);
              setAudioError('Failed to play model voice. Please check connection.');
            }
          }
        );
      };

      audio.onerror = () => {
        console.warn('HTML5 Audio error on mobile/tablet, attempting Web Audio fallback...');
        fallbackToWebAudio();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('HTML5 Audio play rejected, falling back to Web Audio:', err);
          fallbackToWebAudio();
        });
      }
    } catch (err) {
      const spoke = speakStudioNative(sampleText, targetLang === 'ja' ? 'ja-JP' : 'ko-KR', gender, () => {
        setPlayingModelKey(null);
        setPreviewingVoiceId(null);
      });
      if (!spoke) {
        setPlayingModelKey(null);
        setPreviewingVoiceId(null);
        setAudioError(err.message || 'Model voice playback error');
      }
    }
  };

  // Preview Individual Dialogue Line
  const handlePreviewDialogueLine = async (turn, index) => {
    if (!turn.text || !turn.text.trim()) return;

    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    if (previewingLineIndex === index) {
      setPreviewingLineIndex(null);
      return;
    }

    // Unlock Web Audio context synchronously during user tap
    if (typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } catch (e) {}
    }

    setPreviewingLineIndex(index);
    setAudioError(null);

    try {
      const voiceId = turn.voiceProfileId || (turn.speaker === 'A' ? dialogueSpeakerA : dialogueSpeakerB);
      const modelId = turn.modelId || (turn.speaker === 'A' ? dialogueModelA : dialogueModelB);
      const voice = VOICE_PROFILES.find(v => v.id === voiceId) || VOICE_PROFILES[0];
      const lineGender = voice.gender || (turn.speaker === 'B' ? 'male' : 'female');

      const params = new URLSearchParams({
        text: turn.text.trim(),
        voiceProfileId: voice.id,
        gender: lineGender,
        modelId,
        speechMode: voice.defaultSpeechMode || 'natural_conversation',
        ageStyle: voice.ageStyle || '',
        personality: voice.personality || '',
        emotion: voice.defaultEmotion || 'reassuring',
        weight: String(voice.baseVocalWeight !== undefined ? voice.baseVocalWeight : 0.40),
        pitchFactor: String(voice.basePitchFactor !== undefined ? voice.basePitchFactor : 1.00),
        speed: String(voice.settings?.speed || 0.96)
      });
      const url = `/api/elevenlabs/tts?${params.toString()}`;

      let audio = previewAudioRef.current;
      if (!audio) {
        audio = new Audio();
        previewAudioRef.current = audio;
      }
      audio.src = url;
      audio.playbackRate = 1.0;

      audio.onended = () => {
        setPreviewingLineIndex(null);
      };

      const fallbackToWebAudio = () => {
        playWebAudioStudio(
          url,
          lineGender,
          () => setPreviewingLineIndex(null),
          () => {
            const spoke = speakStudioNative(turn.text.trim(), voice.language === 'ja' ? 'ja-JP' : 'ko-KR', lineGender, () => setPreviewingLineIndex(null));
            if (!spoke) {
              setPreviewingLineIndex(null);
              setAudioError('Failed to play dialogue line preview.');
            }
          }
        );
      };

      audio.onerror = () => {
        fallbackToWebAudio();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          fallbackToWebAudio();
        });
      }
    } catch (err) {
      const voiceId = turn.voiceProfileId || (turn.speaker === 'A' ? dialogueSpeakerA : dialogueSpeakerB);
      const voice = VOICE_PROFILES.find(v => v.id === voiceId);
      const lineGender = voice?.gender || (turn.speaker === 'B' ? 'male' : 'female');
      const langCode = (voice?.language === 'ja' || dialogueLang === 'ja') ? 'ja-JP' : 'ko-KR';
      const spoke = speakStudioNative(turn.text.trim(), langCode, lineGender, () => setPreviewingLineIndex(null));
      if (!spoke) {
        setPreviewingLineIndex(null);
        setAudioError(err.message || 'Dialogue line preview failed');
      }
    }
  };

  // Handle Speech Generation
  const handleGenerateSpeech = async () => {
    if (!inputText.trim()) {
      setAudioError('Please enter some text to generate speech.');
      return;
    }

    setIsGenerating(true);
    setAudioError(null);

    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          voiceProfileId: selectedProfile.id,
          gender: selectedProfile.gender || ((!/(?:^|[-_])female(?:[-_\d]|$)/i.test(selectedProfile.id || '') && /(?:^|[-_])male(?:[-_\d]|$)/i.test(selectedProfile.id || '')) ? 'male' : 'female'),
          modelId: selectedModel,
          style: selectedSpeechMode,
          speechMode: selectedSpeechMode,
          ageStyle: selectedAgeStyle,
          personality: selectedPersonality,
          emotion: selectedEmotion,
          weight: vocalWeight,
          pitchFactor: pitchFactor,
          speed: speakingSpeed,
          customSettings: showAdvancedSettings ? {
            stability: customStability,
            similarity_boost: customSimilarity,
            style: customStyle,
            use_speaker_boost: true
          } : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Generation failed`);
      }

      const provider = response.headers.get('X-Audio-Provider') || 'elevenlabs';
      setAudioProvider(provider);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.preservesPitch = true;
        audioRef.current.playbackRate = speakingSpeed || 1.0;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setAudioError(err.message || 'Failed to generate speech.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Dialogue Template Load
  const handleLoadTemplate = (template) => {
    setDialogueSpeakerA(template.speakers.A.id);
    setDialogueSpeakerB(template.speakers.B.id);
    const spkA = VOICE_PROFILES.find(v => v.id === template.speakers.A.id);
    const spkB = VOICE_PROFILES.find(v => v.id === template.speakers.B.id);
    if (spkA) setDialogueGenderA(spkA.gender);
    if (spkB) setDialogueGenderB(spkB.gender);

    setDialogueTurns(template.turns.map(t => ({
      speaker: t.speaker,
      text: t.text,
      voiceProfileId: t.speaker === 'A' ? template.speakers.A.id : template.speakers.B.id,
      modelId: t.speaker === 'A' ? dialogueModelA : dialogueModelB
    })));
  };

  // Handle Dialogue Generation with Per-Speaker / Per-Turn Models
  const handleGenerateDialogue = async () => {
    if (dialogueTurns.length === 0) {
      setAudioError('Please add at least one dialogue turn.');
      return;
    }

    setIsGeneratingDialogue(true);
    setAudioError(null);

    try {
      const enrichedTurns = dialogueTurns.map(t => ({
        speaker: t.speaker,
        text: t.text,
        voiceProfileId: t.voiceProfileId || (t.speaker === 'A' ? dialogueSpeakerA : dialogueSpeakerB),
        modelId: t.modelId || (t.speaker === 'A' ? dialogueModelA : dialogueModelB),
        style: 'natural_conversation'
      }));

      const response = await fetch('/api/elevenlabs/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns: enrichedTurns,
          style: 'natural_conversation'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Dialogue synthesis failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDialogueAudioUrl(url);
    } catch (err) {
      setAudioError(err.message || 'Failed to synthesize dialogue.');
    } finally {
      setIsGeneratingDialogue(false);
    }
  };

  const containerStyle = embedded ? {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '2px solid #818cf8',
    padding: '24px 20px',
    boxShadow: '0 10px 30px rgba(79, 70, 229, 0.12)',
    position: 'relative'
  } : {
    width: '100%'
  };

  return (
    <div style={containerStyle}>
      {/* Studio Header Bar (when embedded in Dictionary) */}
      {embedded && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1.5px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                  AI Studio (Under Dictionary)
                </h3>
                <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                  Live Neural Audio
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                Generate speech, listen to realistic accents, and test Korean & Japanese voices directly here
              </span>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            >
              <span>✕ Close AI Studio</span>
            </button>
          )}
        </div>
      )}

      {/* Global Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'generator', label: 'Voice Profiles & Speech Generator' },
          { id: 'dialogue', label: 'Multi-Speaker Dialogue Studio' },
          ...(isSuperAdmin ? [{ id: 'listeningBuilder', label: 'EPS Listening Studio (Q21–Q40)' }] : [])
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: '800',
                color: isActive ? '#4f46e5' : '#64748b',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #4f46e5' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: '-2px'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {audioError && (
        <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {audioError}</span>
          <button type="button" onClick={() => setAudioError(null)} style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontWeight: '800' }}>✕</button>
        </div>
      )}

      {/* ── TAB 1: SPEECH GENERATOR & 10 PROFILES ───────────────────────────────── */}
      {activeTab === 'generator' && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            {/* Language Switcher */}
            <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
              {(effectiveInstLang === 'both' || effectiveInstLang === 'korean') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLang('ko');
                    const firstKo = VOICE_PROFILES.find(v => v.language === 'ko');
                    if (firstKo) {
                      setSelectedProfile(firstKo);
                      if (!inputText) setInputText(firstKo.sampleSentence);
                    }
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: selectedLang === 'ko' ? '#ffffff' : 'transparent',
                    color: selectedLang === 'ko' ? '#4f46e5' : '#64748b',
                    boxShadow: selectedLang === 'ko' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Korean (한국어) · 12 Voices
                </button>
              )}
              {(effectiveInstLang === 'both' || effectiveInstLang === 'japanese') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLang('ja');
                    const firstJa = VOICE_PROFILES.find(v => v.language === 'ja');
                    if (firstJa) {
                      setSelectedProfile(firstJa);
                      if (!inputText) setInputText(firstJa.sampleSentence);
                    }
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: selectedLang === 'ja' ? '#ffffff' : 'transparent',
                    color: selectedLang === 'ja' ? '#db2777' : '#64748b',
                    boxShadow: selectedLang === 'ja' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Japanese (日本語) · 12 Voices
                </button>
              )}
            </div>

            {/* Gender Filter */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'female', 'male'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenderFilter(g)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: genderFilter === g ? '#4f46e5' : '#cbd5e1',
                    background: genderFilter === g ? '#eef2ff' : '#ffffff',
                    color: genderFilter === g ? '#4f46e5' : '#475569',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {g === 'all' ? '🌐 All Voices' : g === 'female' ? '👩 Female Voice Mode' : '👨 Male Voice Mode'}
                </button>
              ))}
            </div>
          </div>

          {/* AI Model Selector & Instant Preview Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px solid #e0e7ff',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.06)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '900', color: '#1e1b4b' }}>
                  ⚡ AI Voice Model:
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.tag || 'Active Engine'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.desc}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #6366f1',
                  fontSize: '13px',
                  fontWeight: '800',
                  color: '#1e1b4b',
                  background: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <optgroup label="🌟 Humanized Voice Models">
                  {AVAILABLE_MODELS.filter(m => m.category === 'humanized').map(m => (
                    <option key={m.id} value={m.id}>{m.name} — {m.tag}</option>
                  ))}
                </optgroup>
                <optgroup label="⚡ Neural Studio Models">
                  {AVAILABLE_MODELS.filter(m => m.category !== 'humanized').map(m => (
                    <option key={m.id} value={m.id}>{m.name} — {m.tag}</option>
                  ))}
                </optgroup>
              </select>

              <button
                type="button"
                onClick={() => handlePlayModelVoice(selectedModel, 'female', selectedLang, 'tab1')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #ec4899',
                  background: playingModelKey === `${selectedModel}_female_tab1` ? '#ef4444' : '#fdf2f8',
                  color: playingModelKey === `${selectedModel}_female_tab1` ? '#ffffff' : '#be185d',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title="Test this Model's Female Voice"
              >
                {playingModelKey === `${selectedModel}_female_tab1` ? '⏹ Stop' : '👩 Model Female'}
              </button>

              <button
                type="button"
                onClick={() => handlePlayModelVoice(selectedModel, 'male', selectedLang, 'tab1')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #3b82f6',
                  background: playingModelKey === `${selectedModel}_male_tab1` ? '#ef4444' : '#eff6ff',
                  color: playingModelKey === `${selectedModel}_male_tab1` ? '#ffffff' : '#1d4ed8',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title="Test this Model's Male Voice"
              >
                {playingModelKey === `${selectedModel}_male_tab1` ? '⏹ Stop' : '👨 Model Male'}
              </button>

              <button
                type="button"
                onClick={() => handlePlayPreview(selectedProfile, selectedModel)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: previewingVoiceId === `${selectedProfile.id}_${selectedModel}` ? '#ef4444' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {previewingVoiceId === `${selectedProfile.id}_${selectedModel}` ? '⏹ Stop Profile' : `▶ Play ${selectedProfile.name}`}
              </button>
            </div>
          </div>

          {/* 10 Voice Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {filteredVoices.map(voice => {
              const isSelected = selectedProfile.id === voice.id;
              const isPreviewing = previewingVoiceId === `${voice.id}_${selectedModel}`;
              const isActive = (voice.gender === 'female' ? activeFemaleModelId === voice.id : activeMaleModelId === voice.id);

              return (
                <div
                  key={voice.id}
                  onClick={() => {
                    setSelectedProfile(voice);
                    if (!inputText || inputText === selectedProfile.sampleSentence) {
                      setInputText(voice.sampleSentence);
                    }
                  }}
                  style={{
                    backgroundColor: isSelected ? '#faf5ff' : '#ffffff',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid #4f46e5' : '1.5px solid #e2e8f0',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(79, 70, 229, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
                    position: 'relative'
                  }}
                >
                  {/* Top: Name, Gender & Active Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '900', fontSize: '15px', color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {voice.name}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        background: voice.gender === 'female' ? '#fce7f3' : '#e0f2fe',
                        color: voice.gender === 'female' ? '#be185d' : '#0369a1',
                        padding: '1px 7px',
                        borderRadius: '10px',
                        fontWeight: '800'
                      }}>
                        {voice.gender === 'female' ? 'Female' : 'Male'}
                      </span>
                    </div>

                    {isActive && (
                      <span style={{
                        fontSize: '11px',
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1.5px solid #059669',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        ✓ Active
                      </span>
                    )}
                  </div>

                  {/* Clean Subtitle / Role */}
                  {voice.title && (
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '12px' }}>
                      {voice.title}
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPreview(voice, selectedModel);
                      }}
                      title="Preview this human voice with selected model"
                      style={{
                        flex: '1 1 auto',
                        minWidth: '100px',
                        background: isPreviewing ? '#ef4444' : '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                        transition: 'all 0.15s ease',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      {isPreviewing ? '⏹ Stop' : '▶ Play Voice'}
                    </button>

                    {onSelectVoiceModel && !isActive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVoiceModel(voice);
                        }}
                        title={`Select ${voice.name} as active ${voice.gender} voice for dictionary`}
                        style={{
                          flex: '1 1 auto',
                          minWidth: '130px',
                          background: '#ffffff',
                          color: '#059669',
                          border: '1.5px solid #059669',
                          borderRadius: '20px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 3px rgba(5, 150, 105, 0.12)',
                          transition: 'all 0.15s ease',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        + Select for Dictionary
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── SPEECH GENERATION STUDIO CONSOLE ─────────────────────────────────── */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
                    Synthesizing with {selectedProfile.name} ({selectedProfile.title})
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Target Language: {selectedProfile.languageName} · High-Fidelity Neural Output
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {onSelectVoiceModel && (
                  <button
                    type="button"
                    onClick={() => onSelectVoiceModel(selectedProfile)}
                    title={`Set ${selectedProfile.name} as the active voice for dictionary`}
                    style={{
                      background: (selectedProfile.gender === 'female' ? activeFemaleModelId === selectedProfile.id : activeMaleModelId === selectedProfile.id)
                        ? '#059669'
                        : '#f0fdf4',
                      color: (selectedProfile.gender === 'female' ? activeFemaleModelId === selectedProfile.id : activeMaleModelId === selectedProfile.id)
                        ? '#ffffff'
                        : '#15803d',
                      border: '1.5px solid #059669',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {(selectedProfile.gender === 'female' ? activeFemaleModelId === selectedProfile.id : activeMaleModelId === selectedProfile.id)
                      ? `✓ Current Active ${selectedProfile.gender === 'female' ? 'Female' : 'Male'} Model`
                      : `★ Use ${selectedProfile.name} in Dictionary`}
                  </button>
                )}

                {/* Quick Sample Button */}
                <button
                  type="button"
                  onClick={() => setInputText(selectedProfile.sampleSentence)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Insert Sample Sentence
                </button>
              </div>
            </div>

            {/* Text Area */}
            <div style={{ marginBottom: '18px' }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type Korean or Japanese text here to generate natural human speech... (e.g. ${selectedProfile.sampleSentence})`}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  lineHeight: 1.6
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                <span>Punctuation (。、！？) automatically generates authentic breath pauses.</span>
                <span>{inputText.length} / 2500 characters</span>
              </div>
            </div>

            {/* 1. Voice Age / Style */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>
                  🌱 1. Voice Age & Vocal Style:
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Select vocal character
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                {VOICE_CATEGORIES.ageStyles.map(style => {
                  const isSelected = selectedAgeStyle === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => {
                        setSelectedAgeStyle(style.id);
                        if (style.defaultPitch) setPitchFactor(style.defaultPitch);
                        if (style.defaultWeight !== undefined) setVocalWeight(style.defaultWeight);
                      }}
                      style={{
                        border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        background: isSelected ? '#eef2ff' : '#ffffff',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '800', color: isSelected ? '#4f46e5' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{style.icon}</span>
                        <span>{style.label}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', lineHeight: 1.2 }}>
                        {style.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Personality */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>
                  🤝 2. Personality Archetype:
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Attitude and warmth
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                {VOICE_CATEGORIES.personalities.map(p => {
                  const isSelected = selectedPersonality === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPersonality(p.id);
                        if (p.stability) setCustomStability(p.stability);
                        if (p.style) setCustomStyle(p.style);
                      }}
                      style={{
                        border: isSelected ? '2px solid #0891b2' : '1px solid #e2e8f0',
                        background: isSelected ? '#ecfeff' : '#ffffff',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '800', color: isSelected ? '#0891b2' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', lineHeight: 1.2 }}>
                        {p.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Speech Mode */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>
                  🎙️ 3. Speech Mode & Cadence:
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Pacing and breath duration
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                {VOICE_CATEGORIES.speechModes.map(mode => {
                  const isSelected = selectedSpeechMode === mode.id;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => {
                        setSelectedSpeechMode(mode.id);
                        setSelectedStyle(mode.id);
                        if (mode.speed) setSpeakingSpeed(mode.speed);
                      }}
                      style={{
                        border: isSelected ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                        background: isSelected ? '#f5f3ff' : '#ffffff',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '800', color: isSelected ? '#7c3aed' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{mode.icon}</span>
                        <span>{mode.label}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', lineHeight: 1.2 }}>
                        {mode.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Emotion */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>
                  🎭 4. Emotion & Expressiveness:
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Melodic inflection
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                {VOICE_CATEGORIES.emotions.map(emo => {
                  const isSelected = selectedEmotion === emo.id;
                  return (
                    <div
                      key={emo.id}
                      onClick={() => setSelectedEmotion(emo.id)}
                      style={{
                        border: isSelected ? '2px solid #db2777' : '1px solid #e2e8f0',
                        background: isSelected ? '#fdf2f8' : '#ffffff',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '800', color: isSelected ? '#db2777' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{emo.icon}</span>
                        <span>{emo.label}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', lineHeight: 1.2 }}>
                        {emo.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>



            {/* Speaking Speed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>⚡ Speaking Speed:</span>
                {[0.75, 0.9, 1.0, 1.15, 1.25].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeakingSpeed(s)}
                    style={{
                      background: speakingSpeed === s ? '#4f46e5' : '#ffffff',
                      color: speakingSpeed === s ? '#ffffff' : '#334155',
                      border: '1px solid',
                      borderColor: speakingSpeed === s ? '#4f46e5' : '#cbd5e1',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleGenerateSpeech}
                disabled={isGenerating}
                style={{
                  background: isGenerating ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: '800',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🎙️</span>
                <span>{isGenerating ? 'Synthesizing Audio...' : 'Generate Human Speech'}</span>
              </button>

              {generatedAudioUrl && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                  <audio
                    ref={audioRef}
                    src={generatedAudioUrl}
                    controls
                    controlsList={!canDownloadAudio ? "nodownload" : undefined}
                    style={{ height: '44px' }}
                  />
                  {canDownloadAudio && (
                    <a
                      href={generatedAudioUrl}
                      download={`voice_${selectedProfile.id}_${Date.now()}.mp3`}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      📥 Download MP3
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MULTI-SPEAKER DIALOGUE STUDIO ─────────────────────────────── */}
      {activeTab === 'dialogue' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 4px 0', color: '#0f172a' }}>
              💬 Multi-Speaker Human Conversation Studio
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Select distinct male & female voice modes, assign different AI models for each speaker, and preview/play authentic dialogue turn-taking.
            </p>
          </div>

          {/* ── SPEAKERS & INDEPENDENT AI MODELS CONFIGURATION ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '16px',
            marginBottom: '22px'
          }}>
            {/* SPEAKER A CARD */}
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '900', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👩 Speaker A (Lead Role)
                </span>
                {/* Voice Gender Mode Switcher for Speaker A */}
                <div style={{ display: 'flex', gap: '4px', background: '#dcfce7', padding: '3px', borderRadius: '8px' }}>
                  {['female', 'male'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setDialogueGenderA(g);
                        const match = VOICE_PROFILES.find(v => (v.language === dialogueLang || v.language === selectedLang) && v.gender === g);
                        if (match) {
                          setDialogueSpeakerA(match.id);
                          setDialogueTurns(prev => prev.map(t => t.speaker === 'A' ? { ...t, voiceProfileId: match.id } : t));
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        background: dialogueGenderA === g ? '#ffffff' : 'transparent',
                        color: dialogueGenderA === g ? '#166534' : '#4b5563',
                        boxShadow: dialogueGenderA === g ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      {g === 'female' ? '👩 Female' : '👨 Male'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaker A Voice Profile */}
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#166534', display: 'block', marginBottom: '4px' }}>
                Voice Profile:
              </label>
              <select
                value={dialogueSpeakerA}
                onChange={(e) => {
                  const newVoiceId = e.target.value;
                  setDialogueSpeakerA(newVoiceId);
                  setDialogueTurns(prev => prev.map(t => t.speaker === 'A' ? { ...t, voiceProfileId: newVoiceId } : t));
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #86efac',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#0f172a',
                  background: '#ffffff',
                  marginBottom: '10px'
                }}
              >
                {VOICE_PROFILES.filter(v => {
                  const lMatch = v.language === dialogueLang || v.language === selectedLang;
                  const gMatch = !dialogueGenderA || v.gender === dialogueGenderA;
                  return lMatch && gMatch;
                }).map(v => (
                  <option key={v.id} value={v.id}>{v.name} — {v.title}</option>
                ))}
              </select>

              {/* Speaker A Model Selection */}
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#166534', display: 'block', marginBottom: '4px' }}>
                ⚡ AI Voice Model for Speaker A:
              </label>
              <select
                value={dialogueModelA}
                onChange={(e) => {
                  const newModel = e.target.value;
                  setDialogueModelA(newModel);
                  setDialogueTurns(prev => prev.map(t => t.speaker === 'A' ? { ...t, modelId: newModel } : t));
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #86efac',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#0f172a',
                  background: '#ffffff',
                  marginBottom: '6px'
                }}
              >
                <optgroup label="🌟 Humanized Voice Models">
                  {AVAILABLE_MODELS.filter(m => m.category === 'humanized').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.tag})</option>
                  ))}
                </optgroup>
                <optgroup label="⚡ Neural Studio Models">
                  {AVAILABLE_MODELS.filter(m => m.category !== 'humanized').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.tag})</option>
                  ))}
                </optgroup>
              </select>

              {/* SEPARATE PLAY AUDIO OF MODEL VOICE (FEMALE & MALE) */}
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '8px',
                padding: '8px 10px',
                marginBottom: '10px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>🎙️ Play Model Audio (Female / Male Separate):</span>
                  <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px' }}>
                    {AVAILABLE_MODELS.find(m => m.id === dialogueModelA)?.shortName}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                  {/* Female Model Voice Button */}
                  <button
                    type="button"
                    onClick={() => handlePlayModelVoice(dialogueModelA, 'female', dialogueLang, 'A')}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #86efac',
                      background: playingModelKey === `${dialogueModelA}_female_A` ? '#ef4444' : '#ffffff',
                      color: playingModelKey === `${dialogueModelA}_female_A` ? '#ffffff' : '#166534',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Play Model's Female Voice audio speech"
                  >
                    {playingModelKey === `${dialogueModelA}_female_A` ? '⏹ Stop' : '👩 Play Female Voice'}
                  </button>

                  {/* Male Model Voice Button */}
                  <button
                    type="button"
                    onClick={() => handlePlayModelVoice(dialogueModelA, 'male', dialogueLang, 'A')}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #86efac',
                      background: playingModelKey === `${dialogueModelA}_male_A` ? '#ef4444' : '#ffffff',
                      color: playingModelKey === `${dialogueModelA}_male_A` ? '#ffffff' : '#166534',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Play Model's Male Voice audio speech"
                  >
                    {playingModelKey === `${dialogueModelA}_male_A` ? '⏹ Stop' : '👨 Play Male Voice'}
                  </button>
                </div>

                {/* Inline HTML5 Audio Player for Speaker A Model when URL is available */}
                {(modelAudioUrls[`${dialogueModelA}_female_A`] || modelAudioUrls[`${dialogueModelA}_male_A`]) && (
                  <div style={{ marginTop: '4px', marginBottom: '6px' }}>
                    <audio
                      key={playingModelKey || `${dialogueModelA}_${dialogueGenderA}_A`}
                      controls
                      src={modelAudioUrls[playingModelKey] || modelAudioUrls[`${dialogueModelA}_${dialogueGenderA}_A`] || modelAudioUrls[`${dialogueModelA}_female_A`] || modelAudioUrls[`${dialogueModelA}_male_A`]}
                      style={{ width: '100%', height: '30px' }}
                    />
                  </div>
                )}

                {/* Active Model Acoustic Character for Speaker A */}
                {(() => {
                  const curModel = AVAILABLE_MODELS.find(m => m.id === dialogueModelA);
                  const voiceSpec = dialogueGenderA === 'male' ? curModel?.maleVoice : curModel?.femaleVoice;
                  return (
                    <div style={{
                      fontSize: '10.5px',
                      color: '#166534',
                      borderTop: '1px dashed #bbf7d0',
                      paddingTop: '5px',
                      marginTop: '4px',
                      lineHeight: '1.3'
                    }}>
                      <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <span>Role Voice ({dialogueGenderA === 'male' ? '👨 Male' : '👩 Female'}): {voiceSpec?.name}</span>
                        <span style={{ fontSize: '10px', color: '#166534' }}>({voiceSpec?.pitch}, {voiceSpec?.rate})</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#15803d', marginTop: '2px' }}>
                        {voiceSpec?.description}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Play / Test Speaker A */}
              <button
                type="button"
                onClick={() => {
                  const voice = VOICE_PROFILES.find(v => v.id === dialogueSpeakerA) || VOICE_PROFILES[0];
                  handlePlayPreview(voice, dialogueModelA);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: previewingVoiceId === `${dialogueSpeakerA}_${dialogueModelA}` ? '#ef4444' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {previewingVoiceId === `${dialogueSpeakerA}_${dialogueModelA}` ? '⏹ Stop Speaker A' : '▶ Play Speaker A Voice'}
              </button>

              {onSelectVoiceModel && (
                <button
                  type="button"
                  onClick={() => {
                    const voice = VOICE_PROFILES.find(v => v.id === dialogueSpeakerA);
                    if (voice) onSelectVoiceModel(voice);
                  }}
                  title={`Select Speaker A as active voice in Dictionary`}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid #16a34a',
                    background: (dialogueGenderA === 'female' ? activeFemaleModelId === dialogueSpeakerA : activeMaleModelId === dialogueSpeakerA) ? '#16a34a' : '#ffffff',
                    color: (dialogueGenderA === 'female' ? activeFemaleModelId === dialogueSpeakerA : activeMaleModelId === dialogueSpeakerA) ? '#ffffff' : '#166534',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {(dialogueGenderA === 'female' ? activeFemaleModelId === dialogueSpeakerA : activeMaleModelId === dialogueSpeakerA)
                    ? `✓ Speaker A is Active in Dictionary (${dialogueGenderA === 'female' ? 'Female' : 'Male'})`
                    : `★ Use Speaker A as ${dialogueGenderA === 'female' ? 'Female' : 'Male'} Voice in Dictionary`}
                </button>
              )}
            </div>

            {/* SPEAKER B CARD (DIFFERENT MODEL!) */}
            <div style={{
              background: '#eff6ff',
              border: '2px solid #93c5fd',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '900', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👨 Speaker B (Response Role)
                </span>
                {/* Voice Gender Mode Switcher for Speaker B */}
                <div style={{ display: 'flex', gap: '4px', background: '#dbeafe', padding: '3px', borderRadius: '8px' }}>
                  {['male', 'female'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setDialogueGenderB(g);
                        const match = VOICE_PROFILES.find(v => (v.language === dialogueLang || v.language === selectedLang) && v.gender === g);
                        if (match) {
                          setDialogueSpeakerB(match.id);
                          setDialogueTurns(prev => prev.map(t => t.speaker === 'B' ? { ...t, voiceProfileId: match.id } : t));
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        background: dialogueGenderB === g ? '#ffffff' : 'transparent',
                        color: dialogueGenderB === g ? '#1e40af' : '#4b5563',
                        boxShadow: dialogueGenderB === g ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      {g === 'male' ? '👨 Male' : '👩 Female'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaker B Voice Profile */}
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', display: 'block', marginBottom: '4px' }}>
                Voice Profile:
              </label>
              <select
                value={dialogueSpeakerB}
                onChange={(e) => {
                  const newVoiceId = e.target.value;
                  setDialogueSpeakerB(newVoiceId);
                  setDialogueTurns(prev => prev.map(t => t.speaker === 'B' ? { ...t, voiceProfileId: newVoiceId } : t));
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #93c5fd',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#0f172a',
                  background: '#ffffff',
                  marginBottom: '10px'
                }}
              >
                {VOICE_PROFILES.filter(v => {
                  const lMatch = v.language === dialogueLang || v.language === selectedLang;
                  const gMatch = !dialogueGenderB || v.gender === dialogueGenderB;
                  return lMatch && gMatch;
                }).map(v => (
                  <option key={v.id} value={v.id}>{v.name} — {v.title}</option>
                ))}
              </select>

              {/* Speaker B Model Selection (DIFFERENT MODEL) */}
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', display: 'block', marginBottom: '4px' }}>
                ⚡ AI Voice Model for Speaker B (Different Model):
              </label>
              <select
                value={dialogueModelB}
                onChange={(e) => {
                  const newModel = e.target.value;
                  setDialogueModelB(newModel);
                  setDialogueTurns(prev => prev.map(t => t.speaker === 'B' ? { ...t, modelId: newModel } : t));
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #93c5fd',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#0f172a',
                  background: '#ffffff',
                  marginBottom: '6px'
                }}
              >
                <optgroup label="🌟 Humanized Voice Models">
                  {AVAILABLE_MODELS.filter(m => m.category === 'humanized').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.tag})</option>
                  ))}
                </optgroup>
                <optgroup label="⚡ Neural Studio Models">
                  {AVAILABLE_MODELS.filter(m => m.category !== 'humanized').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.tag})</option>
                  ))}
                </optgroup>
              </select>

              {/* SEPARATE PLAY AUDIO OF MODEL VOICE (MALE & FEMALE) FOR SPEAKER B */}
              <div style={{
                background: '#eff6ff',
                border: '1.5px solid #93c5fd',
                borderRadius: '8px',
                padding: '8px 10px',
                marginBottom: '10px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>🎙️ Play Model Audio (Male / Female Separate):</span>
                  <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px' }}>
                    {AVAILABLE_MODELS.find(m => m.id === dialogueModelB)?.shortName}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                  {/* Male Model Voice Button */}
                  <button
                    type="button"
                    onClick={() => handlePlayModelVoice(dialogueModelB, 'male', dialogueLang, 'B')}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #93c5fd',
                      background: playingModelKey === `${dialogueModelB}_male_B` ? '#ef4444' : '#ffffff',
                      color: playingModelKey === `${dialogueModelB}_male_B` ? '#ffffff' : '#1e40af',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Play Model's Male Voice audio speech"
                  >
                    {playingModelKey === `${dialogueModelB}_male_B` ? '⏹ Stop' : '👨 Play Male Voice'}
                  </button>

                  {/* Female Model Voice Button */}
                  <button
                    type="button"
                    onClick={() => handlePlayModelVoice(dialogueModelB, 'female', dialogueLang, 'B')}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #93c5fd',
                      background: playingModelKey === `${dialogueModelB}_female_B` ? '#ef4444' : '#ffffff',
                      color: playingModelKey === `${dialogueModelB}_female_B` ? '#ffffff' : '#1e40af',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Play Model's Female Voice audio speech"
                  >
                    {playingModelKey === `${dialogueModelB}_female_B` ? '⏹ Stop' : '👩 Play Female Voice'}
                  </button>
                </div>

                {/* Inline HTML5 Audio Player for Speaker B Model when URL is available */}
                {(modelAudioUrls[`${dialogueModelB}_female_B`] || modelAudioUrls[`${dialogueModelB}_male_B`]) && (
                  <div style={{ marginTop: '4px', marginBottom: '6px' }}>
                    <audio
                      key={playingModelKey || `${dialogueModelB}_${dialogueGenderB}_B`}
                      controls
                      src={modelAudioUrls[playingModelKey] || modelAudioUrls[`${dialogueModelB}_${dialogueGenderB}_B`] || modelAudioUrls[`${dialogueModelB}_male_B`] || modelAudioUrls[`${dialogueModelB}_female_B`]}
                      style={{ width: '100%', height: '30px' }}
                    />
                  </div>
                )}

                {/* Active Model Acoustic Character for Speaker B */}
                {(() => {
                  const curModel = AVAILABLE_MODELS.find(m => m.id === dialogueModelB);
                  const voiceSpec = dialogueGenderB === 'female' ? curModel?.femaleVoice : curModel?.maleVoice;
                  return (
                    <div style={{
                      fontSize: '10.5px',
                      color: '#1e40af',
                      borderTop: '1px dashed #bfdbfe',
                      paddingTop: '5px',
                      marginTop: '4px',
                      lineHeight: '1.3'
                    }}>
                      <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <span>Role Voice ({dialogueGenderB === 'female' ? '👩 Female' : '👨 Male'}): {voiceSpec?.name}</span>
                        <span style={{ fontSize: '10px', color: '#1e40af' }}>({voiceSpec?.pitch}, {voiceSpec?.rate})</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#1d4ed8', marginTop: '2px' }}>
                        {voiceSpec?.description}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Play / Test Speaker B */}
              <button
                type="button"
                onClick={() => {
                  const voice = VOICE_PROFILES.find(v => v.id === dialogueSpeakerB) || VOICE_PROFILES[1];
                  handlePlayPreview(voice, dialogueModelB);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: previewingVoiceId === `${dialogueSpeakerB}_${dialogueModelB}` ? '#ef4444' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {previewingVoiceId === `${dialogueSpeakerB}_${dialogueModelB}` ? '⏹ Stop Speaker B' : '▶ Play Speaker B Voice'}
              </button>

              {onSelectVoiceModel && (
                <button
                  type="button"
                  onClick={() => {
                    const voice = VOICE_PROFILES.find(v => v.id === dialogueSpeakerB);
                    if (voice) onSelectVoiceModel(voice);
                  }}
                  title={`Select Speaker B as active voice in Dictionary`}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid #2563eb',
                    background: (dialogueGenderB === 'female' ? activeFemaleModelId === dialogueSpeakerB : activeMaleModelId === dialogueSpeakerB) ? '#2563eb' : '#ffffff',
                    color: (dialogueGenderB === 'female' ? activeFemaleModelId === dialogueSpeakerB : activeMaleModelId === dialogueSpeakerB) ? '#ffffff' : '#1e40af',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {(dialogueGenderB === 'female' ? activeFemaleModelId === dialogueSpeakerB : activeMaleModelId === dialogueSpeakerB)
                    ? `✓ Speaker B is Active in Dictionary (${dialogueGenderB === 'female' ? 'Female' : 'Male'})`
                    : `★ Use Speaker B as ${dialogueGenderB === 'female' ? 'Female' : 'Male'} Voice in Dictionary`}
                </button>
              )}
            </div>
          </div>

          {/* Template Selector Bar */}
          <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '8px' }}>
              📚 Load Authentic Dialogue Template:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(effectiveInstLang === 'korean'
                ? DIALOGUE_TEMPLATES.ko
                : effectiveInstLang === 'japanese'
                ? DIALOGUE_TEMPLATES.ja
                : [...DIALOGUE_TEMPLATES.ko, ...DIALOGUE_TEMPLATES.ja]
              ).map(tmpl => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleLoadTemplate(tmpl)}
                  style={{
                    padding: '6px 12px',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    color: '#0f172a'
                  }}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Turn-by-Turn Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {dialogueTurns.map((turn, index) => {
              const isSpeakerA = turn.speaker === 'A';
              const assignedVoiceId = turn.voiceProfileId || (isSpeakerA ? dialogueSpeakerA : dialogueSpeakerB);
              const assignedModelId = turn.modelId || (isSpeakerA ? dialogueModelA : dialogueModelB);
              const assignedVoice = VOICE_PROFILES.find(v => v.id === assignedVoiceId);
              const assignedModel = AVAILABLE_MODELS.find(m => m.id === assignedModelId);
              const isLinePlaying = previewingLineIndex === index;

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    background: isSpeakerA ? '#f0fdf4' : '#eff6ff',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: isSpeakerA ? '1.5px solid #86efac' : '1.5px solid #93c5fd',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* Speaker Badge & Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '170px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const nextSpk = isSpeakerA ? 'B' : 'A';
                        const updated = [...dialogueTurns];
                        updated[index].speaker = nextSpk;
                        updated[index].voiceProfileId = nextSpk === 'A' ? dialogueSpeakerA : dialogueSpeakerB;
                        updated[index].modelId = nextSpk === 'A' ? dialogueModelA : dialogueModelB;
                        setDialogueTurns(updated);
                      }}
                      title="Click to toggle speaker between A and B"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isSpeakerA ? '#16a34a' : '#2563eb',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      {isSpeakerA ? '👩 Speaker A' : '👨 Speaker B'}
                    </button>

                    <span style={{
                      fontSize: '10px',
                      background: '#ffffff',
                      color: isSpeakerA ? '#15803d' : '#1d4ed8',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      fontWeight: '700',
                      border: '1px solid #cbd5e1'
                    }}>
                      {assignedModel?.shortName || 'Model'}
                    </span>
                  </div>

                  {/* Dialogue Line Input */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <input
                      type="text"
                      value={turn.text}
                      onChange={(e) => {
                        const updated = [...dialogueTurns];
                        updated[index].text = e.target.value;
                        setDialogueTurns(updated);
                      }}
                      placeholder={`Enter line for ${isSpeakerA ? 'Speaker A' : 'Speaker B'}...`}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff'
                      }}
                    />
                  </div>

                  {/* Play Line Button */}
                  <button
                    type="button"
                    onClick={() => handlePreviewDialogueLine(turn, index)}
                    title="Play this specific line with its assigned model"
                    style={{
                      background: isLinePlaying ? '#ef4444' : isSpeakerA ? '#16a34a' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isLinePlaying ? '⏹ Stop' : '▶ Play Line'}
                  </button>

                  {/* Remove Turn */}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = dialogueTurns.filter((_, i) => i !== index);
                      setDialogueTurns(updated);
                    }}
                    title="Remove turn"
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontWeight: '800'
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Turn & Synthesize Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => {
                const nextSpeaker = dialogueTurns.length % 2 === 0 ? 'A' : 'B';
                setDialogueTurns([
                  ...dialogueTurns,
                  {
                    speaker: nextSpeaker,
                    text: '',
                    voiceProfileId: nextSpeaker === 'A' ? dialogueSpeakerA : dialogueSpeakerB,
                    modelId: nextSpeaker === 'A' ? dialogueModelA : dialogueModelB
                  }
                ]);
              }}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ➕ Add Dialogue Turn
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleGenerateDialogue}
                disabled={isGeneratingDialogue}
                style={{
                  background: isGeneratingDialogue ? '#94a3b8' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: isGeneratingDialogue ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {isGeneratingDialogue ? '⏳ Synthesizing Full Conversation...' : '💬 Synthesize Dialogue'}
              </button>

              {dialogueAudioUrl && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <audio
                    src={dialogueAudioUrl}
                    controls
                    controlsList={!canDownloadAudio ? "nodownload" : undefined}
                    style={{ height: '38px' }}
                  />
                  {canDownloadAudio && (
                    <a
                      href={dialogueAudioUrl}
                      download={`dialogue_${Date.now()}.mp3`}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '12px',
                        fontWeight: '800'
                      }}
                    >
                      📥 Download
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EPS Listening Studio (Q21-Q40 Synchronizer) - SUPER ADMIN ONLY */}
      {isSuperAdmin && activeTab === 'listeningBuilder' && (
        <ListeningExamSynchronizer instituteLanguage={effectiveInstLang} isSuperAdmin={isSuperAdmin} />
      )}

    </div>
  );
}
