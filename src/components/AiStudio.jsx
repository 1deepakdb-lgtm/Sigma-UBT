'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  VOICE_PROFILES, 
  SPEAKING_STYLES, 
  VOICE_CATEGORIES, 
  DIALOGUE_TEMPLATES, 
  ELEVENLABS_MODELS 
} from '@/lib/elevenlabsConfig';

export default function AiStudio({
  initialLang = 'ko',
  initialText = '',
  onClose = null,
  embedded = false
}) {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'dialogue' | 'benchmark'
  const [selectedLang, setSelectedLang] = useState(initialLang === 'ja' ? 'ja' : 'ko');
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'female' | 'male'
  const [selectedProfile, setSelectedProfile] = useState(
    VOICE_PROFILES.find(v => v.language === (initialLang === 'ja' ? 'ja' : 'ko')) || VOICE_PROFILES[0]
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
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null);
  const [audioError, setAudioError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ hasApiKey: false, ready: false });

  // Dialogue Studio State
  const [dialogueLang, setDialogueLang] = useState(initialLang === 'ja' ? 'ja' : 'ko');
  const [dialogueSpeakerA, setDialogueSpeakerA] = useState(initialLang === 'ja' ? 'ja-female-1' : 'ko-female-1');
  const [dialogueSpeakerB, setDialogueSpeakerB] = useState(initialLang === 'ja' ? 'ja-male-1' : 'ko-male-2');
  const [dialogueTurns, setDialogueTurns] = useState([]);
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);
  const [dialogueAudioUrl, setDialogueAudioUrl] = useState(null);

  const audioRef = useRef(null);
  const previewAudioRef = useRef(null);

  // Update language when initialLang prop changes
  useEffect(() => {
    if (initialLang) {
      const l = initialLang === 'ja' ? 'ja' : 'ko';
      setSelectedLang(l);
      const match = VOICE_PROFILES.find(v => v.language === l);
      if (match) setSelectedProfile(match);
    }
  }, [initialLang]);

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
    const initialTemplate = selectedLang === 'ja' ? DIALOGUE_TEMPLATES.ja[0] : DIALOGUE_TEMPLATES.ko[0];
    if (initialTemplate) {
      setDialogueTurns(initialTemplate.turns.map(t => ({
        speaker: t.speaker,
        text: t.text,
        voiceProfileId: t.speaker === 'A' ? (selectedLang === 'ja' ? 'ja-female-1' : 'ko-female-1') : (selectedLang === 'ja' ? 'ja-male-1' : 'ko-male-2')
      })));
    }
    if (!initialText) {
      const defaultProfile = VOICE_PROFILES.find(v => v.language === selectedLang) || VOICE_PROFILES[0];
      setInputText(defaultProfile.sampleSentence);
    }
  }, []);

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

  // Handle Voice Preview
  const handlePlayPreview = async (voice) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      if (previewingVoiceId === voice.id) {
        setPreviewingVoiceId(null);
        return;
      }
    }

    setPreviewingVoiceId(voice.id);
    setAudioError(null);

    try {
      const params = new URLSearchParams({
        text: voice.sampleSentence,
        voiceProfileId: voice.id,
        speechMode: voice.defaultSpeechMode || 'teacher',
        ageStyle: voice.ageStyle || '',
        personality: voice.personality || '',
        emotion: voice.defaultEmotion || 'reassuring',
        weight: String(voice.baseVocalWeight !== undefined ? voice.baseVocalWeight : 0.40),
        pitchFactor: String(voice.basePitchFactor !== undefined ? voice.basePitchFactor : 1.00),
        speed: String(voice.settings?.speed || 0.96)
      });
      const url = `/api/elevenlabs/tts?${params.toString()}`;
      const audio = new Audio(url);
      previewAudioRef.current = audio;

      audio.onended = () => setPreviewingVoiceId(null);
      audio.onerror = () => {
        setPreviewingVoiceId(null);
        setAudioError('Failed to play voice preview. Please verify your connection.');
      };

      await audio.play();
    } catch (err) {
      setPreviewingVoiceId(null);
      setAudioError(err.message || 'Audio playback error');
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
        audioRef.current.playbackRate = speakingSpeed;
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
    setDialogueTurns(template.turns.map(t => ({
      speaker: t.speaker,
      text: t.text,
      voiceProfileId: t.speaker === 'A' ? template.speakers.A.id : template.speakers.B.id
    })));
  };

  // Handle Dialogue Generation
  const handleGenerateDialogue = async () => {
    if (dialogueTurns.length === 0) {
      setAudioError('Please add at least one dialogue turn.');
      return;
    }

    setIsGeneratingDialogue(true);
    setAudioError(null);

    try {
      const response = await fetch('/api/elevenlabs/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns: dialogueTurns,
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
          { id: 'benchmark', label: 'Quality Benchmarks & Tuning' }
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
                  {g === 'all' ? 'All Genders' : g === 'female' ? '👩 Female Only' : '👨 Male Only'}
                </button>
              ))}
            </div>
          </div>

          {/* 10 Voice Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {filteredVoices.map(voice => {
              const isSelected = selectedProfile.id === voice.id;
              const isPreviewing = previewingVoiceId === voice.id;

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
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 6px 18px rgba(79, 70, 229, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '900', fontSize: '15px', color: '#0f172a' }}>{voice.name}</span>
                          <span style={{ fontSize: '10px', background: voice.gender === 'female' ? '#fce7f3' : '#e0f2fe', color: voice.gender === 'female' ? '#be185d' : '#0369a1', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                            {voice.gender === 'female' ? 'Female' : 'Male'}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{voice.title}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPreview(voice);
                      }}
                      title="Preview this human voice"
                      style={{
                        background: isPreviewing ? '#ef4444' : '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '5px 12px',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {isPreviewing ? '⏹ Stop' : '▶ Preview'}
                    </button>
                  </div>

                  <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    {voice.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                    {(voice.traits || (voice.tag ? [voice.tag] : [])).map(t => (
                      <span key={t} style={{ fontSize: '10px', background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '11px', color: '#334155', fontStyle: 'italic', borderLeft: '3px solid #818cf8' }}>
                    "{voice.sampleSentence}"
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
                    style={{ height: '44px' }}
                  />
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
            <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 4px 0' }}>
              💬 Multi-Speaker Human Conversation Studio
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Simulate authentic Korean & Japanese conversations with natural turn-taking and distinct male/female speaker personalities.
            </p>
          </div>

          {/* Template Selector Bar */}
          <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '8px' }}>
              📚 Load Authentic Dialogue Template:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[...DIALOGUE_TEMPLATES.ko, ...DIALOGUE_TEMPLATES.ja].map(tmpl => (
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
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    background: isSpeakerA ? '#f0fdf4' : '#eff6ff',
                    padding: '12px',
                    borderRadius: '10px',
                    border: isSpeakerA ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
                  }}
                >
                  <div style={{ width: '130px', flexShrink: 0 }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: '800',
                      color: isSpeakerA ? '#15803d' : '#1d4ed8',
                      marginBottom: '2px'
                    }}>
                      Speaker {turn.speaker}
                    </span>
                    <select
                      value={turn.voiceProfileId}
                      onChange={(e) => {
                        const updated = [...dialogueTurns];
                        updated[index].voiceProfileId = e.target.value;
                        setDialogueTurns(updated);
                      }}
                      style={{ width: '100%', fontSize: '11px', padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      {VOICE_PROFILES.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={turn.text}
                      onChange={(e) => {
                        const updated = [...dialogueTurns];
                        updated[index].text = e.target.value;
                        setDialogueTurns(updated);
                      }}
                      placeholder="Enter dialogue line..."
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = dialogueTurns.filter((_, i) => i !== index);
                      setDialogueTurns(updated);
                    }}
                    title="Remove turn"
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
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
                  { speaker: nextSpeaker, text: '', voiceProfileId: nextSpeaker === 'A' ? 'ko-female-1' : 'ko-male-2' }
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
                  <audio src={dialogueAudioUrl} controls style={{ height: '38px' }} />
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: QUALITY BENCHMARKS & TUNING ─────────────────────────────────── */}
      {activeTab === 'benchmark' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 4px 0', color: '#0f172a' }}>
              Voice Profiles Acoustic Benchmarks
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Comparison of all 24 Korean & Japanese voice models and their pronunciation acoustics.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '10px 12px' }}>Profile</th>
                  <th style={{ padding: '10px 12px' }}>Language</th>
                  <th style={{ padding: '10px 12px' }}>Gender</th>
                  <th style={{ padding: '10px 12px' }}>Voice Character</th>
                  <th style={{ padding: '10px 12px' }}>Stability / Style</th>
                  <th style={{ padding: '10px 12px' }}>Sample Sentence</th>
                  <th style={{ padding: '10px 12px' }}>Listen</th>
                </tr>
              </thead>
              <tbody>
                {VOICE_PROFILES.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '800', color: '#0f172a' }}>
                      {v.name}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: v.language === 'ko' ? '#4f46e5' : '#db2777' }}>
                      {v.language === 'ko' ? 'Korean' : 'Japanese'}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: v.gender === 'female' ? '#be185d' : '#0369a1' }}>
                      {v.gender === 'female' ? 'Female' : 'Male'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>
                      {v.title}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>
                      {v.settings.stability} / {v.settings.style}
                    </td>
                    <td style={{ padding: '10px 12px', maxWidth: '320px', color: '#1e293b' }}>
                      "{v.sampleSentence}"
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        type="button"
                        onClick={() => handlePlayPreview(v)}
                        title={`Listen to ${v.name}`}
                        style={{
                          background: previewingVoiceId === v.id ? '#ef4444' : '#4f46e5',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {previewingVoiceId === v.id ? '⏹' : '▶'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
