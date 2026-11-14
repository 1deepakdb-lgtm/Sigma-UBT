/**
 * ElevenLabs & Studio Ultra-Realistic Human AI Voice System Configuration
 * Complete Multi-Dimensional Categorization:
 * - Gender: Male, Female
 * - Voice Age/Style: Young Adult, Mature, Warm, Deep, Soft, Bright
 * - Personality: Friendly, Professional, Calm, Confident, Expressive
 * - Speech Mode: Natural Conversation, Teacher, Slow Learning, Exam Listening, Storytelling, Workplace Dialogue, News Announcer
 * - Emotion: Happy, Sad, Surprised, Excited, Serious, Reassuring
 * 
 * Supports authentic Korean (한국어) and Japanese (日本語) phonetic patterns,
 * pitch control (High to Low), and vocal weight (Light/Airy to Heavy/Chest).
 */

// Supported ElevenLabs Models
export const ELEVENLABS_MODELS = {
  MULTILINGUAL_V2: 'eleven_multilingual_v2', // State of the art expressive multilingual (29 languages)
  TURBO_V2_5: 'eleven_turbo_v2_5',           // Low-latency multilingual
  FLASH_V2: 'eleven_flash_v2'                // Fast response
};

export const AVAILABLE_MODELS = [
  {
    id: 'eleven_multilingual_v2',
    name: 'Multilingual v2',
    shortName: 'Multilingual v2',
    tag: 'Ultra Lifelike · Expressive',
    desc: 'Highest natural intonation, dynamic emotional contour, and authentic human cadence.'
  },
  {
    id: 'eleven_turbo_v2_5',
    name: 'Turbo v2.5',
    shortName: 'Turbo v2.5',
    tag: 'Low-Latency · Dynamic',
    desc: 'Fast generation with natural conversational flow, perfect for responsive dialogue.'
  },
  {
    id: 'eleven_flash_v2',
    name: 'Flash v2',
    shortName: 'Flash v2',
    tag: 'Ultra-Fast · Sharp',
    desc: 'Instant acoustic response, ideal for rapid vocabulary tests and syllable drills.'
  },
  {
    id: 'neural_studio_hd',
    name: 'Neural HD Studio',
    shortName: 'Neural HD',
    tag: 'Studio Broadcast',
    desc: 'Pristine broadcast-grade diction with precision pitch, rate, and batchim clarity.'
  }
];

export const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || ELEVENLABS_MODELS.MULTILINGUAL_V2;

// Multi-Dimensional Voice Categories
export const VOICE_CATEGORIES = {
  genders: [
    { id: 'female', label: 'Female', icon: '👩' },
    { id: 'male', label: 'Male', icon: '👨' }
  ],
  ageStyles: [
    { id: 'young_adult', label: 'Young Adult', icon: '🌱', desc: 'Youthful, energetic, high clarity', defaultPitch: 1.08, defaultWeight: 0.35 },
    { id: 'mature', label: 'Mature', icon: '🏛️', desc: 'Distinguished, grounded, experienced', defaultPitch: 0.92, defaultWeight: 0.65 },
    { id: 'warm', label: 'Warm', icon: '☕', desc: 'Rich, melodic, comforting mid-range', defaultPitch: 0.98, defaultWeight: 0.55 },
    { id: 'deep', label: 'Deep', icon: '🌋', desc: 'Heavy chest resonance, deep low pitch', defaultPitch: 0.70, defaultWeight: 0.85 },
    { id: 'soft', label: 'Soft', icon: '🌸', desc: 'Gentle, airy, delicate whisper-like tone', defaultPitch: 1.02, defaultWeight: 0.20 },
    { id: 'bright', label: 'Bright', icon: '☀️', desc: 'Vibrant, open, higher pitch register', defaultPitch: 1.15, defaultWeight: 0.30 }
  ],
  personalities: [
    { id: 'friendly', label: 'Friendly', icon: '🤝', desc: 'Warm, smiling, approachable', stability: 0.44, style: 0.22 },
    { id: 'professional', label: 'Professional', icon: '💼', desc: 'Clear, articulate, formal composure', stability: 0.56, style: 0.12 },
    { id: 'calm', label: 'Calm', icon: '🍃', desc: 'Soothing, gentle breathing, relaxed cadence', stability: 0.54, style: 0.10 },
    { id: 'confident', label: 'Confident', icon: '🎯', desc: 'Authoritative, firm assertion, decisive', stability: 0.50, style: 0.18 },
    { id: 'expressive', label: 'Expressive', icon: '🎭', desc: 'Lively, dynamic, rich theatrical contour', stability: 0.38, style: 0.28 }
  ],
  speechModes: [
    { id: 'natural_conversation', label: 'Natural Conversation', icon: '💬', speed: 1.00, pauseMs: 300, desc: 'Casual human turn-taking and conversational melody' },
    { id: 'teacher', label: 'Teacher', icon: '👩‍🏫', speed: 0.94, pauseMs: 450, desc: 'Clear, measured pedagogical pronunciation' },
    { id: 'slow_learning', label: 'Slow Learning', icon: '🐢', speed: 0.80, pauseMs: 650, desc: 'Slower syllable-by-syllable drill for beginners' },
    { id: 'exam_listening', label: 'Exam Listening', icon: '🎧', speed: 1.04, pauseMs: 500, desc: 'Official EPS-TOPIK / JLPT listening test cadence' },
    { id: 'storytelling', label: 'Storytelling', icon: '📖', speed: 0.96, pauseMs: 550, desc: 'Dramatic narrative pacing with expressive arc' },
    { id: 'workplace_dialogue', label: 'Workplace Dialogue', icon: '🏢', speed: 1.02, pauseMs: 350, desc: 'Polite business honorifics and workplace communication' },
    { id: 'news_announcer', label: 'News Announcer', icon: '🎙️', speed: 1.06, pauseMs: 400, desc: 'Formal broadcast speech with pristine diction' }
  ],
  emotions: [
    { id: 'happy', label: 'Happy', icon: '😊', pitchMod: +0.06, speedMod: +0.04, desc: 'Joyful, bright, smiling melodic lift' },
    { id: 'sad', label: 'Sad', icon: '😢', pitchMod: -0.05, speedMod: -0.08, desc: 'Gentle, breathy, falling somber cadence' },
    { id: 'surprised', label: 'Surprised', icon: '😲', pitchMod: +0.10, speedMod: +0.05, desc: 'High pitch inflection, wide melodic leap' },
    { id: 'excited', label: 'Excited', icon: '🤩', pitchMod: +0.08, speedMod: +0.08, desc: 'Vibrant, fast, high-energy enthusiasm' },
    { id: 'serious', label: 'Serious', icon: '😐', pitchMod: -0.04, speedMod: -0.02, desc: 'Firm, grounded, disciplined, authoritative' },
    { id: 'reassuring', label: 'Reassuring', icon: '🕊️', pitchMod: -0.02, speedMod: -0.04, desc: 'Comforting, warm, low-pressure soothing cadence' }
  ]
};

// Aliased legacy speaking styles for backward compatibility
export const SPEAKING_STYLES = Object.fromEntries(
  VOICE_CATEGORIES.speechModes.map(m => [
    m.id,
    {
      id: m.id,
      name: m.label,
      icon: m.icon,
      description: m.desc,
      speed: m.speed,
      stability: m.id === 'slow_learning' ? 0.58 : m.id === 'teacher' ? 0.55 : 0.45,
      similarity_boost: 0.75,
      style: m.id === 'storytelling' ? 0.28 : 0.15,
      pauseMultiplier: m.pauseMs / 300
    }
  ])
);

/**
 * 10 Curated Voice Profiles with Categorical Metadata & Physical Acoustic Weights
 */
export const VOICE_PROFILES = [
  // ── KOREAN VOICES ──────────────────────────────────────────────────────────
  {
    id: 'ko-female-1',
    name: 'Korean Female 1',
    title: 'Natural Female Teacher',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'female',
    pitch: '+0Hz', // DEFAULT BASELINE
    rate: '+0%',
    voice: 'ko-KR-SunHiNeural',
    ageStyle: 'warm',
    personality: 'professional',
    defaultSpeechMode: 'teacher',
    defaultEmotion: 'reassuring',
    persona: 'Natural female teacher (Default)',
    description: 'Standard natural Korean teaching tone with polite cadence and balanced delivery.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_FEMALE_1 || '21m00Tcm4TlvDq8ikWAM', // Rachel
    basePitchFactor: 1.00,
    baseVocalWeight: 0.40,
    settings: {
      stability: 0.52,
      similarity_boost: 0.78,
      style: 0.14,
      use_speaker_boost: true,
      speed: 0.96
    },
    sampleSentence: '안녕하세요! 오늘부터 한국어 기초 문법을 쉽고 재미있게 배워보겠습니다.',
    sampleTranslation: 'Hello! From today, we will learn basic Korean grammar easily and fun.',
    avatar: '👩‍🏫',
    tag: 'Teacher · Default'
  },
  {
    id: 'ko-female-2',
    name: 'Korean Female 2',
    title: 'Friendly Conversation Voice',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'female',
    pitch: '+14Hz',
    rate: '+6%',
    voice: 'ko-KR-SunHiNeural',
    ageStyle: 'bright',
    personality: 'friendly',
    defaultSpeechMode: 'natural_conversation',
    defaultEmotion: 'happy',
    persona: 'Bright & cheerful conversation voice',
    description: 'Warm, energetic everyday conversational speech with an upbeat melodic lift.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_FEMALE_2 || 'EXAVITQu4vr4xnSDxMaL', // Bella
    basePitchFactor: 1.10,
    baseVocalWeight: 0.32,
    settings: {
      stability: 0.44,
      similarity_boost: 0.75,
      style: 0.24,
      use_speaker_boost: true,
      speed: 1.02
    },
    sampleSentence: '주말에 시간 있으면 같이 맛있는 한국 음식 먹으러 갈까요?',
    sampleTranslation: 'If you have time this weekend, shall we go eat delicious Korean food together?',
    avatar: '👩',
    tag: 'Friendly · Bright'
  },
  {
    id: 'ko-female-3',
    name: 'Korean Female 3',
    title: 'Clear Pronunciation Practice',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'female',
    pitch: '+5Hz',
    rate: '-6%',
    voice: 'ko-KR-SunHiNeural',
    ageStyle: 'young_adult',
    personality: 'confident',
    defaultSpeechMode: 'exam_listening',
    defaultEmotion: 'serious',
    persona: 'Crisp articulation & syllable drills',
    description: 'Deliberate, articulate pacing for EPS-TOPIK syllables, batchim phonetics, and listening drills.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_FEMALE_3 || 'jsCqWAovK2LkecY7zXl4', // Freya
    basePitchFactor: 1.04,
    baseVocalWeight: 0.38,
    settings: {
      stability: 0.56,
      similarity_boost: 0.82,
      style: 0.10,
      use_speaker_boost: true,
      speed: 0.92
    },
    sampleSentence: '한국어 표준 발음과 받침 규칙을 정확하게 듣고 따라 해 보세요.',
    sampleTranslation: 'Listen carefully and practice the correct Korean standard pronunciation and batchim rules.',
    avatar: '🎙️',
    tag: 'Pronunciation · Diction'
  },
  {
    id: 'ko-female-4',
    name: 'Korean Female 4',
    title: 'Polite News Announcer',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'female',
    pitch: '-12Hz',
    rate: '+3%',
    voice: 'ko-KR-SunHiNeural',
    ageStyle: 'mature',
    personality: 'confident',
    defaultSpeechMode: 'news_announcer',
    defaultEmotion: 'serious',
    persona: 'Polite broadcast news announcer',
    description: 'Polite, measured news anchor tone with crystal-clear Korean intonation and standard Seoul articulation.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_FEMALE_4 || 'AZnzlk1XvdvUeBnXmlld', // Domi
    basePitchFactor: 0.96,
    baseVocalWeight: 0.45,
    settings: {
      stability: 0.58,
      similarity_boost: 0.80,
      style: 0.12,
      use_speaker_boost: true,
      speed: 0.98
    },
    sampleSentence: '시청자 여러분 안녕하십니까. 오늘의 주요 한국어 학습 뉴스와 표준 발음을 전해드립니다.',
    sampleTranslation: "Good evening viewers. Here are today's major Korean learning news and standard pronunciations.",
    avatar: '🎙️',
    tag: 'Announcer · Polite'
  },
  {
    id: 'ko-female-5',
    name: 'Korean Female 5',
    title: 'Youthful Campus Student',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'female',
    pitch: '+22Hz',
    rate: '+8%',
    voice: 'ko-KR-SunHiNeural',
    ageStyle: 'bright',
    personality: 'energetic',
    defaultSpeechMode: 'natural_conversation',
    defaultEmotion: 'happy',
    persona: 'Youthful campus student',
    description: 'Lively, high-pitched cheerful campus Korean, ideal for conversational peer practice and listening.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_FEMALE_5 || 'pFZP5JQG7iQjIQuC4Bku', // Lily
    basePitchFactor: 1.18,
    baseVocalWeight: 0.26,
    settings: {
      stability: 0.42,
      similarity_boost: 0.74,
      style: 0.28,
      use_speaker_boost: true,
      speed: 1.04
    },
    sampleSentence: '오늘 수업 끝나고 도서관에서 토픽 단어 같이 외울래? 맛있는 간식도 사줄게!',
    sampleTranslation: "Shall we memorize TOPIK vocabulary together at the library after class? I'll buy delicious snacks!",
    avatar: '👧',
    tag: 'Youthful · Energetic'
  },
  {
    id: 'ko-female-6',
    name: 'Korean Female 6',
    title: 'Warm & Calming Mentor',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'female',
    pitch: '-18Hz',
    rate: '-8%',
    voice: 'ko-KR-SunHiNeural',
    ageStyle: 'soft',
    personality: 'calm',
    defaultSpeechMode: 'slow_learning',
    defaultEmotion: 'reassuring',
    persona: 'Warm and calming mentor',
    description: 'Gentle, comforting lower register with patient pacing to build confidence in Korean listening.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_FEMALE_6 || 'LcfcDJNUP1GQjkzn1xUU', // Emily
    basePitchFactor: 0.90,
    baseVocalWeight: 0.38,
    settings: {
      stability: 0.60,
      similarity_boost: 0.82,
      style: 0.10,
      use_speaker_boost: true,
      speed: 0.88
    },
    sampleSentence: '처음에는 어려워도 매일 조금씩 꾸준히 연습하면 반드시 한국어 실력이 늘 거예요.',
    sampleTranslation: 'Even if it seems difficult at first, practicing a little every day will definitely improve your Korean skills.',
    avatar: '🌸',
    tag: 'Mentor · Gentle'
  },
  {
    id: 'ko-male-1',
    name: 'Korean Male 1',
    title: 'Natural Korean Male Teacher',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'male',
    pitch: '+0Hz', // DEFAULT BASELINE
    rate: '+0%',
    voice: 'ko-KR-InJoonNeural',
    ageStyle: 'mature',
    personality: 'professional',
    defaultSpeechMode: 'teacher',
    defaultEmotion: 'serious',
    persona: 'Natural Korean male teacher (Default)',
    description: 'Standard natural Korean instructor baritone voice for structured textbook lessons.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_MALE_1 || 'ErXwobaYiN019PkySvjV', // Antoni
    basePitchFactor: 0.78,
    baseVocalWeight: 0.65,
    settings: {
      stability: 0.50,
      similarity_boost: 0.76,
      style: 0.15,
      use_speaker_boost: true,
      speed: 0.96
    },
    sampleSentence: '여러분 반갑습니다. 이번 단원에서는 EPS-TOPIK 핵심 어휘를 집중 학습하겠습니다.',
    sampleTranslation: 'Welcome everyone. In this unit, we will study core EPS-TOPIK vocabulary.',
    avatar: '👨‍🏫',
    tag: 'Teacher · Default'
  },
  {
    id: 'ko-male-2',
    name: 'Korean Male 2',
    title: 'Deep, Calm Conversational Voice',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'male',
    pitch: '-24Hz',
    rate: '-6%',
    voice: 'ko-KR-InJoonNeural',
    ageStyle: 'deep',
    personality: 'calm',
    defaultSpeechMode: 'natural_conversation',
    defaultEmotion: 'reassuring',
    persona: 'Deep, calm conversational voice',
    description: 'Heavy resonant low bass with relaxed pacing, perfect for natural listening comprehension.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_MALE_2 || 'pNInz6obpgDQGcFmaJgB', // Adam
    basePitchFactor: 0.64,
    baseVocalWeight: 0.90,
    settings: {
      stability: 0.46,
      similarity_boost: 0.78,
      style: 0.18,
      use_speaker_boost: true,
      speed: 0.92
    },
    sampleSentence: '오늘 하루도 수고 많으셨습니다. 차 한잔 마시면서 편안한 저녁 보내세요.',
    sampleTranslation: 'You worked hard today. Enjoy a comfortable evening with a warm cup of tea.',
    avatar: '👨',
    tag: 'Deep Bass · Calm'
  },
  {
    id: 'ko-male-3',
    name: 'Korean Male 3',
    title: 'Energetic Workplace Professional',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'male',
    pitch: '+6Hz',
    rate: '+4%',
    voice: 'ko-KR-HyunsuMultilingualNeural',
    ageStyle: 'young_adult',
    personality: 'confident',
    defaultSpeechMode: 'workplace_dialogue',
    defaultEmotion: 'serious',
    persona: 'Energetic workplace professional',
    description: 'Crisp, dynamic young male voice ideal for EPS-TOPIK workplace terms, business conversations, and dialogues.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_MALE_3 || 'yoZ06aMxZJJ28mfd3POQ', // Sam
    basePitchFactor: 0.84,
    baseVocalWeight: 0.55,
    settings: {
      stability: 0.52,
      similarity_boost: 0.78,
      style: 0.16,
      use_speaker_boost: true,
      speed: 1.00
    },
    sampleSentence: '네, 오늘 작업 일정과 안전 수칙에 대해 현장 매뉴얼을 바탕으로 설명드리겠습니다.',
    sampleTranslation: "Yes, I will explain today's work schedule and safety guidelines based on the on-site manual.",
    avatar: '🧑‍💼',
    tag: 'Workplace · Energetic'
  },
  {
    id: 'ko-male-4',
    name: 'Korean Male 4',
    title: 'Resonant Radio Broadcaster',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'male',
    pitch: '-12Hz',
    rate: '+2%',
    voice: 'ko-KR-InJoonNeural',
    ageStyle: 'mature',
    personality: 'professional',
    defaultSpeechMode: 'storytelling',
    defaultEmotion: 'reassuring',
    persona: 'Resonant radio broadcaster',
    description: 'Commanding, steady baritone with rich presence for clear audio comprehension and exam listening.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_MALE_4 || 'VR6AewLTigWG4xSOukaG', // Arnold
    basePitchFactor: 0.72,
    baseVocalWeight: 0.78,
    settings: {
      stability: 0.55,
      similarity_boost: 0.82,
      style: 0.12,
      use_speaker_boost: true,
      speed: 0.96
    },
    sampleSentence: '한국어 능력시험 준비를 위해 핵심 단어와 관용 표현을 차근차근 점검해 나가겠습니다.',
    sampleTranslation: 'For TOPIK exam preparation, we will systematically review key vocabulary and idiomatic expressions.',
    avatar: '🎙️',
    tag: 'Broadcaster · Resonant'
  },
  {
    id: 'ko-male-5',
    name: 'Korean Male 5',
    title: 'Friendly Companion & Travel Guide',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'male',
    pitch: '+18Hz',
    rate: '+6%',
    voice: 'ko-KR-HyunsuMultilingualNeural',
    ageStyle: 'warm',
    personality: 'friendly',
    defaultSpeechMode: 'natural_conversation',
    defaultEmotion: 'happy',
    persona: 'Friendly companion and travel guide',
    description: 'Natural, lively high-register male tone for everyday travel situations and casual social phrases.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_MALE_5 || 'g5CIjZEefAph4nQFvHAz', // Ethan
    basePitchFactor: 0.88,
    baseVocalWeight: 0.48,
    settings: {
      stability: 0.46,
      similarity_boost: 0.75,
      style: 0.22,
      use_speaker_boost: true,
      speed: 1.02
    },
    sampleSentence: '서울역에 도착하면 지하철 1호선이나 4호선으로 환승하는 게 가장 빠르고 편리해요.',
    sampleTranslation: 'When you arrive at Seoul Station, transferring to subway Line 1 or 4 is the fastest and most convenient.',
    avatar: '👦',
    tag: 'Friendly · Travel Guide'
  },
  {
    id: 'ko-male-6',
    name: 'Korean Male 6',
    title: 'Senior Academic Lecturer',
    language: 'ko',
    languageName: 'Korean (한국어)',
    gender: 'male',
    pitch: '-16Hz',
    rate: '-10%',
    voice: 'ko-KR-InJoonNeural',
    ageStyle: 'deep',
    personality: 'confident',
    defaultSpeechMode: 'teacher',
    defaultEmotion: 'serious',
    persona: 'Senior academic lecturer',
    description: 'Deep authoritative lecture voice with deliberate, crystal-clear diction for advanced grammar.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_KO_MALE_6 || 'flq6f7yk4E4fJM5XTYuZ', // Michael
    basePitchFactor: 0.68,
    baseVocalWeight: 0.82,
    settings: {
      stability: 0.54,
      similarity_boost: 0.80,
      style: 0.14,
      use_speaker_boost: true,
      speed: 0.90
    },
    sampleSentence: '문장의 맥락을 정확하게 파악하고 문법 요소의 유기적 결합을 분석하는 것이 중요합니다.',
    sampleTranslation: 'It is essential to accurately grasp the sentence context and analyze the organic combination of grammatical elements.',
    avatar: '👨‍🎓',
    tag: 'Academic · Lecturer'
  },

  // ── JAPANESE VOICES ────────────────────────────────────────────────────────
  {
    id: 'ja-female-1',
    name: 'Japanese Female 1',
    title: 'Natural Japanese Teacher',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'female',
    pitch: '+0Hz', // DEFAULT BASELINE
    rate: '+0%',
    voice: 'ja-JP-NanamiNeural',
    ageStyle: 'warm',
    personality: 'professional',
    defaultSpeechMode: 'teacher',
    defaultEmotion: 'reassuring',
    persona: 'Natural Japanese teacher (Default)',
    description: 'Standard Tokyo polite female teacher with natural pitch accent and polite cadence.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_FEMALE_1 || 'ThT5KcBeYPX3keUQqHPh', // Dorothy
    basePitchFactor: 1.01,
    baseVocalWeight: 0.38,
    settings: {
      stability: 0.52,
      similarity_boost: 0.78,
      style: 0.14,
      use_speaker_boost: true,
      speed: 0.96
    },
    sampleSentence: '皆さん、こんにちは！今日から日本語の正しい発音と文法を一緒に学びましょう。',
    sampleTranslation: "Hello everyone! Let's learn correct Japanese pronunciation and grammar together.",
    avatar: '👩‍🏫',
    tag: 'Teacher · Default'
  },
  {
    id: 'ja-female-2',
    name: 'Japanese Female 2',
    title: 'Friendly Conversation Voice',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'female',
    pitch: '+16Hz',
    rate: '+6%',
    voice: 'ja-JP-NanamiNeural',
    ageStyle: 'bright',
    personality: 'friendly',
    defaultSpeechMode: 'natural_conversation',
    defaultEmotion: 'happy',
    persona: 'Bright & cheerful conversation voice',
    description: 'Bright, cheerful, and expressive voice for casual Japanese conversation and daily dialogue.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_FEMALE_2 || 'FGY2WhTYpPnrIDTdsKH5', // Laura
    basePitchFactor: 1.10,
    baseVocalWeight: 0.30,
    settings: {
      stability: 0.42,
      similarity_boost: 0.75,
      style: 0.25,
      use_speaker_boost: true,
      speed: 1.02
    },
    sampleSentence: '今度の休みに、浅草へ美味しい抹茶スイーツを食べに行きませんか？',
    sampleTranslation: 'Would you like to go to Asakusa on our next day off to eat delicious matcha sweets?',
    avatar: '👩',
    tag: 'Friendly · Bright'
  },
  {
    id: 'ja-female-3',
    name: 'Japanese Female 3',
    title: 'Clear Pronunciation Practice',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'female',
    pitch: '+5Hz',
    rate: '-6%',
    voice: 'ja-JP-NanamiNeural',
    ageStyle: 'soft',
    personality: 'calm',
    defaultSpeechMode: 'slow_learning',
    defaultEmotion: 'reassuring',
    persona: 'Careful pronunciation & syllable drills',
    description: "Careful, distinct pronunciation for JLPT Kanji On'yomi, Kun'yomi, and kana drills.",
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_FEMALE_3 || 'MF3mGyEYCl7XYWbV9V6O', // Elli
    basePitchFactor: 1.04,
    baseVocalWeight: 0.22,
    settings: {
      stability: 0.58,
      similarity_boost: 0.82,
      style: 0.10,
      use_speaker_boost: true,
      speed: 0.90
    },
    sampleSentence: '日本語の五十音と濁音の正確な発音を、一つずつ丁寧に練習しましょう。',
    sampleTranslation: 'Let us practice the correct pronunciation of Japanese gojūon and dakuten carefully one by one.',
    avatar: '🌸',
    tag: 'Soft · Pronunciation'
  },
  {
    id: 'ja-female-4',
    name: 'Japanese Female 4',
    title: 'Polite News Announcer',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'female',
    pitch: '-12Hz',
    rate: '+3%',
    voice: 'ja-JP-NanamiNeural',
    ageStyle: 'mature',
    personality: 'professional',
    defaultSpeechMode: 'news_announcer',
    defaultEmotion: 'serious',
    persona: 'Polite broadcast announcer',
    description: 'Standard NHK-style articulate Tokyo female announcer voice with precise pitch accent.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_FEMALE_4 || 'AZnzlk1XvdvUeBnXmlld', // Domi
    basePitchFactor: 0.96,
    baseVocalWeight: 0.40,
    settings: {
      stability: 0.58,
      similarity_boost: 0.80,
      style: 0.12,
      use_speaker_boost: true,
      speed: 0.98
    },
    sampleSentence: '皆様、おはようございます。本日の主要な日本語ニュースと正しい敬語表現をお伝えいたします。',
    sampleTranslation: "Good morning everyone. Here is today's major Japanese news and correct honorific expressions.",
    avatar: '🎙️',
    tag: 'Announcer · NHK Standard'
  },
  {
    id: 'ja-female-5',
    name: 'Japanese Female 5',
    title: 'Lively Campus Student',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'female',
    pitch: '+24Hz',
    rate: '+8%',
    voice: 'ja-JP-NanamiNeural',
    ageStyle: 'bright',
    personality: 'energetic',
    defaultSpeechMode: 'natural_conversation',
    defaultEmotion: 'happy',
    persona: 'Lively campus conversation',
    description: 'Upbeat, high-register conversational Japanese for natural peer interactions and listening drills.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_FEMALE_5 || 'pFZP5JQG7iQjIQuC4Bku', // Lily
    basePitchFactor: 1.18,
    baseVocalWeight: 0.28,
    settings: {
      stability: 0.40,
      similarity_boost: 0.75,
      style: 0.28,
      use_speaker_boost: true,
      speed: 1.04
    },
    sampleSentence: '放課後に図書館でJLPTの模擬試験を一緒に解きませんか？終わったらカフェに行こう！',
    sampleTranslation: "Shall we solve JLPT practice tests together at the library after school? Let's go to a cafe afterwards!",
    avatar: '👧',
    tag: 'Lively · Campus'
  },
  {
    id: 'ja-female-6',
    name: 'Japanese Female 6',
    title: 'Warm Mentor & Storyteller',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'female',
    pitch: '-18Hz',
    rate: '-8%',
    voice: 'ja-JP-NanamiNeural',
    ageStyle: 'warm',
    personality: 'calm',
    defaultSpeechMode: 'storytelling',
    defaultEmotion: 'reassuring',
    persona: 'Warm and gentle mentor',
    description: 'Comforting, deeper gentle cadence with patient phrasing to master difficult Japanese nuances.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_FEMALE_6 || 'XB0fDUnXU5powFXDhCwa', // Charlotte
    basePitchFactor: 0.90,
    baseVocalWeight: 0.36,
    settings: {
      stability: 0.60,
      similarity_boost: 0.82,
      style: 0.12,
      use_speaker_boost: true,
      speed: 0.88
    },
    sampleSentence: '焦らずに一歩ずつ練習すれば、日本語のニュアンスも必ず自然に使いこなせるようになりますよ。',
    sampleTranslation: 'If you practice step by step without rushing, you will definitely master Japanese nuances naturally.',
    avatar: '🍵',
    tag: 'Warm · Mentor'
  },
  {
    id: 'ja-male-1',
    name: 'Japanese Male 1',
    title: 'Natural Japanese Male Teacher',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'male',
    pitch: '+0Hz', // DEFAULT BASELINE
    rate: '+0%',
    voice: 'ja-JP-KeitaNeural',
    ageStyle: 'mature',
    personality: 'confident',
    defaultSpeechMode: 'teacher',
    defaultEmotion: 'serious',
    persona: 'Natural Japanese male teacher (Default)',
    description: 'Standard formal and measured Tokyo male instructor voice for JLPT grammar and listening.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_MALE_1 || 'onwK4e9ZLuTAKqWW03F9', // Daniel
    basePitchFactor: 0.77,
    baseVocalWeight: 0.68,
    settings: {
      stability: 0.50,
      similarity_boost: 0.76,
      style: 0.14,
      use_speaker_boost: true,
      speed: 0.96
    },
    sampleSentence: '皆さんお疲れ様です。JLPT試験に向けて、重要な漢字と語彙をしっかり復习しましょう。',
    sampleTranslation: "Good job everyone. Let's thoroughly review essential kanji and vocabulary for the JLPT.",
    avatar: '👨‍🏫',
    tag: 'Teacher · Default'
  },
  {
    id: 'ja-male-2',
    name: 'Japanese Male 2',
    title: 'Calm Conversational Voice',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'male',
    pitch: '-24Hz',
    rate: '-6%',
    voice: 'ja-JP-KeitaNeural',
    ageStyle: 'deep',
    personality: 'calm',
    defaultSpeechMode: 'natural_conversation',
    defaultEmotion: 'reassuring',
    persona: 'Deep calm conversational voice',
    description: 'Warm, deeply resonant baritone voice with gentle cadence for relaxing listening practice.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_MALE_2 || 'TxGEqnHWrfWFTfGW9XjX', // Josh
    basePitchFactor: 0.64,
    baseVocalWeight: 0.88,
    settings: {
      stability: 0.46,
      similarity_boost: 0.78,
      style: 0.16,
      use_speaker_boost: true,
      speed: 0.92
    },
    sampleSentence: '夜遅くまで勉強お疲れ様でした。無理をせず、自分のペースで進めていきましょう。',
    sampleTranslation: "Thank you for studying until late. Don't push yourself too hard, let's proceed at your own pace.",
    avatar: '👨',
    tag: 'Deep Calm · Reassuring'
  },
  {
    id: 'ja-male-3',
    name: 'Japanese Male 3',
    title: 'Energetic Business Professional',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'male',
    pitch: '+8Hz',
    rate: '+4%',
    voice: 'ja-JP-KeitaNeural',
    ageStyle: 'young_adult',
    personality: 'confident',
    defaultSpeechMode: 'workplace_dialogue',
    defaultEmotion: 'serious',
    persona: 'Energetic business professional',
    description: 'Polite business keigo and crisp articulation for JLPT N2/N1 workplace dialogues.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_MALE_3 || 'yoZ06aMxZJJ28mfd3POQ', // Sam
    basePitchFactor: 0.85,
    baseVocalWeight: 0.58,
    settings: {
      stability: 0.52,
      similarity_boost: 0.78,
      style: 0.15,
      use_speaker_boost: true,
      speed: 1.00
    },
    sampleSentence: '本日のお打ち合わせの資料を用意いたしました。ご確認のほどよろしくお願い申し上げます。',
    sampleTranslation: "I have prepared the materials for today's meeting. Please review them at your convenience.",
    avatar: '🧑‍💼',
    tag: 'Business · Keigo'
  },
  {
    id: 'ja-male-4',
    name: 'Japanese Male 4',
    title: 'Deep Resonant Narrator',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'male',
    pitch: '-14Hz',
    rate: '+2%',
    voice: 'ja-JP-KeitaNeural',
    ageStyle: 'deep',
    personality: 'professional',
    defaultSpeechMode: 'storytelling',
    defaultEmotion: 'reassuring',
    persona: 'Deep documentary narrator',
    description: 'Low, resonant baritone with dramatic pacing for storytelling and listening comprehension.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_MALE_4 || 'VR6AewLTigWG4xSOukaG', // Arnold
    basePitchFactor: 0.70,
    baseVocalWeight: 0.85,
    settings: {
      stability: 0.56,
      similarity_boost: 0.82,
      style: 0.12,
      use_speaker_boost: true,
      speed: 0.94
    },
    sampleSentence: '日本の四季折々の豊かな自然と、受け継がれてきた伝統文化の歴史を探求します。',
    sampleTranslation: "Exploring Japan's rich seasonal nature and the historical depth of inherited traditional culture.",
    avatar: '🎙️',
    tag: 'Deep · Documentary'
  },
  {
    id: 'ja-male-5',
    name: 'Japanese Male 5',
    title: 'Friendly Casual Companion',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'male',
    pitch: '+18Hz',
    rate: '+6%',
    voice: 'ja-JP-KeitaNeural',
    ageStyle: 'bright',
    personality: 'friendly',
    defaultSpeechMode: 'natural_conversation',
    defaultEmotion: 'happy',
    persona: 'Casual everyday friend',
    description: 'Relaxed Tokyo conversational cadence for modern colloquial phrases and anime/casual listening.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_MALE_5 || 'g5CIjZEefAph4nQFvHAz', // Ethan
    basePitchFactor: 0.88,
    baseVocalWeight: 0.46,
    settings: {
      stability: 0.45,
      similarity_boost: 0.74,
      style: 0.24,
      use_speaker_boost: true,
      speed: 1.02
    },
    sampleSentence: '次の電車が来るまでまだ時間があるから、駅前のカフェで温かいお茶でも飲もうよ。',
    sampleTranslation: "There is still time until the next train arrives, so let's drink some warm tea at the cafe in front of the station.",
    avatar: '👦',
    tag: 'Friendly · Casual'
  },
  {
    id: 'ja-male-6',
    name: 'Japanese Male 6',
    title: 'Senior Academic Lecturer',
    language: 'ja',
    languageName: 'Japanese (日本語)',
    gender: 'male',
    pitch: '-16Hz',
    rate: '-10%',
    voice: 'ja-JP-KeitaNeural',
    ageStyle: 'mature',
    personality: 'confident',
    defaultSpeechMode: 'teacher',
    defaultEmotion: 'serious',
    persona: 'Senior academic lecturer',
    description: 'Measured, academic lecture cadence with distinct pronunciation for JLPT N1 reading and lectures.',
    defaultVoiceId: process.env.ELEVENLABS_VOICE_JA_MALE_6 || 'flq6f7yk4E4fJM5XTYuZ', // Michael
    basePitchFactor: 0.70,
    baseVocalWeight: 0.76,
    settings: {
      stability: 0.54,
      similarity_boost: 0.80,
      style: 0.14,
      use_speaker_boost: true,
      speed: 0.90
    },
    sampleSentence: '語彙の成り立ちと文脈におけるニュアンスの差異を体系的に理解することが肝要です。',
    sampleTranslation: 'It is vital to systematically understand the origin of vocabulary and differences in nuance within context.',
    avatar: '👨‍🎓',
    tag: 'Academic · Lecturer'
  }
];

/**
 * Multi-Speaker Dialogue Templates for Korean and Japanese
 */
export const DIALOGUE_TEMPLATES = {
  ko: [
    {
      id: 'ko-interview',
      title: '💼 EPS-TOPIK Job Interview (면접)',
      description: 'Formal workplace dialogue between Examiner (Female Teacher) and Applicant (Male Student)',
      speakers: {
        A: { id: 'ko-female-1', label: 'Examiner (면접관)' },
        B: { id: 'ko-male-2', label: 'Applicant (지원자)' }
      },
      turns: [
        { speaker: 'A', text: '안녕하세요. 오늘 면접에 참여해 주셔서 감사합니다. 먼저 자기소개 부탁드립니다.' },
        { speaker: 'B', text: '안녕하십니까! 저는 네팔에서 온 라메시라고 합니다. 한국의 제조업 현장에서 성실하게 일하고 싶습니다.' },
        { speaker: 'A', text: '한국어 실력이 아주 유창하시네요. 공장에서 안전 수칙을 지키는 것이 가장 중요한데, 잘 지키실 수 있나요?' },
        { speaker: 'B', text: '네, 물론입니다! 작업 전에는 반드시 안전모와 안전화를 착용하고, 항상 관리자님의 지시를 따르겠습니다.' },
        { speaker: 'A', text: '아주 좋습니다. 앞으로 좋은 결과 있기를 기대하겠습니다. 수고하셨습니다.' },
        { speaker: 'B', text: '감사합니다! 열심히 하겠습니다!' }
      ]
    },
    {
      id: 'ko-restaurant',
      title: '🍲 Ordering Korean Food (식당 주문)',
      description: 'Friendly casual dialogue between Customer and Restaurant Server',
      speakers: {
        A: { id: 'ko-female-2', label: 'Customer (손님)' },
        B: { id: 'ko-male-1', label: 'Server (직원)' }
      },
      turns: [
        { speaker: 'A', text: '저기요, 주문할게요! 여기 김치찌개 하나랑 불고기 정식 하나 주세요.' },
        { speaker: 'B', text: '네, 손님! 김치찌개는 매콤하게 해 드릴까요, 아니면 보통으로 해 드릴까요?' },
        { speaker: 'A', text: '보통으로 해 주시고요, 물 좀 더 가져다주실 수 있나요?' },
        { speaker: 'B', text: '네, 바로 시원한 물과 함께 반찬 준비해 드리겠습니다. 잠시만 기다려 주세요!' }
      ]
    }
  ],
  ja: [
    {
      id: 'ja-directions',
      title: '🗺️ Asking Directions in Tokyo (道案内)',
      description: 'Natural conversation asking for subway directions in Tokyo',
      speakers: {
        A: { id: 'ja-female-2', label: 'Tourist (観光客)' },
        B: { id: 'ja-male-2', label: 'Local Resident (地元の方)' }
      },
      turns: [
        { speaker: 'A', text: 'すみません、ちょっとお伺いしてもよろしいですか？浅草駅へ行きたいのですが、どちらでしょうか？' },
        { speaker: 'B', text: 'ああ、浅草駅ですね。この道をまっすぐ進んで、二つ目の交差点を右に曲がると、銀座線の入り口が見えますよ。' },
        { speaker: 'A', text: '二つ目の交差点を右ですね！歩いてどれくらいかかりますか？' },
        { speaker: 'B', text: 'だいたい五分くらいで着きますよ。気をつけて行ってらっしゃい！' },
        { speaker: 'A', text: 'ご親切に教えていただき、本当にありがとうございました！' }
      ]
    },
    {
      id: 'ja-lesson',
      title: '🎓 Japanese Language Consultation (学習相談)',
      description: 'Teacher and student discussing JLPT preparation',
      speakers: {
        A: { id: 'ja-male-1', label: 'Sensei (先生)' },
        B: { id: 'ja-female-1', label: 'Student (留学生)' }
      },
      turns: [
        { speaker: 'A', text: '最近のJLPT模擬試験の結果を見ましたよ。読解の点数が大きく伸びましたね！' },
        { speaker: 'B', text: 'ありがとうございます、先生！でも、聴解のスピードについていくのがまだ少し不安です。' },
        { speaker: 'A', text: '毎日の練習が一番の近道です。まずは教科書の音声を0.9倍速で聴き、慣れたら通常の速さでシャドーイングしてみましょう。' },
        { speaker: 'B', text: 'わかりました！毎日欠かさずシャドーイングを続けます！' }
      ]
    }
  ]
};

export function getVoiceProfile(profileId) {
  return VOICE_PROFILES.find(v => v.id === profileId) || VOICE_PROFILES[0];
}

export function getVoiceProfilesByLanguage(lang = 'ko') {
  return VOICE_PROFILES.filter(v => v.language === lang);
}
