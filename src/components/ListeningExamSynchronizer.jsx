'use client';

import React, { useState, useEffect, useRef } from 'react';

// WAV Audio Encoder from AudioBuffer
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * numChannels * bytesPerSample;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + length, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, length, true);

  // Interleave and write audio data
  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = channels[channel][i];
      // Clamp between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Authentic EPS-TOPIK Dual-Tone Bell Chime Generator (Ding-Dong)
function createEpsExamBellBuffer(ctx) {
  const sampleRate = ctx.sampleRate || 44100;
  const duration = 1.3;
  const numSamples = Math.round(sampleRate * duration);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Tone 1: High Bell "Ding" at t = 0s (C6 1046.50 Hz + harmonics)
    if (t >= 0 && t < 0.85) {
      const env1 = Math.exp(-t * 5.8);
      const tone1 = 
        0.50 * Math.sin(2 * Math.PI * 1046.50 * t) + 
        0.26 * Math.sin(2 * Math.PI * 2093.00 * t) + 
        0.14 * Math.sin(2 * Math.PI * 3139.50 * t) +
        0.06 * Math.sin(2 * Math.PI * 4186.00 * t);
      sample += tone1 * env1;
    }

    // Tone 2: Warm Bell "Dong" at t = 0.38s (G5 783.99 Hz + harmonics)
    if (t >= 0.38) {
      const t2 = t - 0.38;
      const env2 = Math.exp(-t2 * 4.2);
      const tone2 = 
        0.58 * Math.sin(2 * Math.PI * 783.99 * t2) + 
        0.24 * Math.sin(2 * Math.PI * 1567.98 * t2) + 
        0.12 * Math.sin(2 * Math.PI * 2351.97 * t2) +
        0.05 * Math.sin(2 * Math.PI * 3135.96 * t2);
      sample += tone2 * env2;
    }

    sample = Math.max(-0.95, Math.min(0.95, sample * 0.75));
    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Sample EPS-TOPIK Q21-Q40 Question Scripts
const SAMPLE_EPS_LISTENING_DATA = [
  {
    qNum: 21,
    title: "21번 문제입니다. 들은 것을 고르십시오.",
    questionText: "21번 문제입니다. 들은 것을 고르십시오. [가방]",
    options: ["가방", "공책", "지갑", "모자"]
  },
  {
    qNum: 22,
    title: "22번 문제입니다. 들은 것을 고르십시오.",
    questionText: "22번 문제입니다. 들은 것을 고르십시오. [선풍기]",
    options: ["세탁기", "선풍기", "냉장고", "청소기"]
  },
  {
    qNum: 23,
    title: "23번 문제입니다. 그림을 보고 알맞은 것을 고르십시오.",
    questionText: "23번 문제입니다. 이것은 무엇입니까?",
    options: ["안경입니다.", "모자입니다.", "시계입니다.", "신발입니다."]
  },
  {
    qNum: 24,
    title: "24번 문제입니다. 그림을 보고 알맞은 것을 고르십시오.",
    questionText: "24번 문제입니다. 이 사람은 지금 무엇을 하고 있습니까?",
    options: ["잠을 자고 있습니다.", "청소를 하고 있습니다.", "밥을 먹고 있습니다.", "전화를 걸고 있습니다."]
  },
  {
    qNum: 25,
    title: "25번 문제입니다. 질문을 듣고 알맞은 대답을 고르십시오.",
    questionText: "25번 문제입니다. 언제 한국에 왔습니까?",
    options: ["작년 3월에 왔습니다.", "비행기를 타고 왔습니다.", "친구와 함께 왔습니다.", "한국말을 배우러 왔습니다."]
  },
  {
    qNum: 26,
    title: "26번 문제입니다. 질문을 듣고 알맞은 대답을 고르십시오.",
    questionText: "26번 문제입니다. 오늘 저녁에 시간 있어요?",
    options: ["네, 오늘 저녁에 바빠요.", "네, 같이 영화 봐요.", "아니요, 내일 갈 거예요.", "네, 어제 만났어요."]
  },
  {
    qNum: 27,
    title: "27번 문제입니다. 잘 듣고 내용과 관계있는 그림을 고르십시오.",
    questionText: "27번 문제입니다. 지금 몇 시예요? 세 시 삼십 분이에요.",
    options: ["2시 30분", "3시 30분", "4시 30분", "3시 정각"]
  },
  {
    qNum: 28,
    title: "28번 문제입니다. 잘 듣고 내용과 관계있는 것을 고르십시오.",
    questionText: "28번 문제입니다. 수루 씨는 어디에서 일해요? 저는 가구 공장에서 일해요.",
    options: ["가구 공장", "식당", "병원", "은행"]
  },
  {
    qNum: 29,
    title: "29번 문제입니다. 대화를 듣고 알맞은 것을 고르십시오.",
    questionText: "29번 문제입니다. 남자는 어디가 아픕니까? 머리가 아프고 열이 나요.",
    options: ["다리가 아픕니다.", "머리가 아픕니다.", "배가 아픕니다.", "눈이 아픕니다."]
  },
  {
    qNum: 30,
    title: "30번 문제입니다. 대화를 듣고 알맞은 것을 고르십시오.",
    questionText: "30번 문제입니다. 이 사람은 주말에 무엇을 했습니까? 친구와 등산을 갔어요.",
    options: ["수영을 했습니다.", "등산을 했습니다.", "쇼핑을 했습니다.", "집에서 잤습니다."]
  },
  {
    qNum: 31,
    title: "31번 문제입니다. 이야기를 듣고 질문에 알맞은 대답을 고르십시오.",
    questionText: "31번 문제입니다. 두 사람은 내일 무엇을 할 것입니까? 내일 같이 축구하러 가요.",
    options: ["축구를 합니다.", "영화를 봅니다.", "공부합니다.", "등산합니다."]
  },
  {
    qNum: 32,
    title: "32번 문제입니다. 이야기를 듣고 질문에 알맞은 대답을 고르십시오.",
    questionText: "32번 문제입니다. 여자는 왜 늦었습니까? 길이 많이 막혀서 늦었습니다.",
    options: ["차가 막혀서", "늦잠을 자서", "길을 잃어서", "비가 많이 와서"]
  },
  {
    qNum: 33,
    title: "33번 문제입니다. 이야기를 듣고 질문에 알맞은 대답을 고르십시오.",
    questionText: "33번 문제입니다. 남자의 직업은 무엇입니까? 저는 농장에서 과일을 재배합니다.",
    options: ["농부", "의사", "경찰관", "요리사"]
  },
  {
    qNum: 34,
    title: "34번 문제입니다. 이야기를 듣고 질문에 알맞은 대답을 고르십시오.",
    questionText: "34번 문제입니다. 회식은 언제입니까? 이번 주 금요일 저녁 7시입니다.",
    options: ["금요일 저녁", "토요일 점심", "목요일 저녁", "일요일 저녁"]
  },
  {
    qNum: 35,
    title: "35번 문제입니다. 이야기를 듣고 질문에 알맞은 대답을 고르십시오.",
    questionText: "35번 문제입니다. 남자는 오늘 무엇을 해야 합니까? 상자를 창고로 옮겨야 합니다.",
    options: ["상자를 옮깁니다.", "청소를 합니다.", "서류를 복사합니다.", "기계를 고칩니다."]
  },
  {
    qNum: 36,
    title: "36번 문제입니다. 이야기를 듣고 질문에 알맞은 대답을 고르십시오.",
    questionText: "36번 문제입니다. 여자는 휴가 때 어디에 갈 것입니까? 제주도에 갈 생각이에요.",
    options: ["제주도", "부산", "설악산", "경주"]
  },
  {
    qNum: 37,
    title: "37번 문제입니다. 하나의 이야기를 듣고 두 개의 질문에 답하십시오.",
    questionText: "37번 문제입니다. 기숙사 규칙에 대한 안내 방송입니다. 밤 10시 이후에는 조용히 해 주십시오.",
    options: ["기숙사 시설 안내", "청소 당번 안내", "야간 규칙 안내", "외출 시간 안내"]
  },
  {
    qNum: 38,
    title: "38번 문제입니다. 안내 방송을 듣고 질문에 답하십시오.",
    questionText: "38번 문제입니다. 이 방송은 누구를 위한 것입니까? 새로 입사한 외국인 근로자 여러분 환영합니다.",
    options: ["신입 외국인 근로자", "기숙사 관리인", "병원 환자", "공항 승객"]
  },
  {
    qNum: 39,
    title: "39번 문제입니다. 담화를 듣고 질문에 답하십시오.",
    questionText: "39번 문제입니다. 공장에서 작업할 때 주의해야 할 점은 무엇입니까? 반드시 안전모와 안전화를 착용하세요.",
    options: ["안전 장비 착용", "기계 청소", "휴식 시간 준수", "출근 시간 엄수"]
  },
  {
    qNum: 40,
    title: "40번 문제입니다. 담화를 듣고 질문에 답하십시오.",
    questionText: "40번 문제입니다. 월급날은 언제입니까? 매월 25일에 통장으로 입금됩니다.",
    options: ["매월 25일", "매월 10일", "매월 마지막 날", "매월 15일"]
  }
];

export default function ListeningExamSynchronizer({ instituteLanguage = 'korean', isSuperAdmin = null }) {
  // Strict Super Admin Access Control: Hidden & Blocked for Institutes & Students
  const [isAuthorized] = useState(() => {
    if (isSuperAdmin === true) return true;
    if (isSuperAdmin === false) return false;
    if (typeof window === 'undefined') return false;
    try {
      const pathname = window.location.pathname || '';
      if (pathname.includes('/student') || pathname.includes('/institute')) return false;
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
      if (pathname.startsWith('/voice-studio')) return true;
    } catch (e) {}
    return false;
  });

  if (!isAuthorized) {
    return null;
  }

  // Questions 21 to 40 state
  const [questions, setQuestions] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('eps_listening_studio_q21_q40');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === 20) {
            return parsed;
          }
        }
      } catch (e) {}
    }

    // Default template for 20 questions (Q21 to Q40)
    return SAMPLE_EPS_LISTENING_DATA.map(sample => ({
      qNum: sample.qNum,
      title: sample.title,
      questionText: sample.questionText,
      questionAudioUrl: null,
      questionAudioFile: null,
      questionDuration: 0,
      repeatQuestion: 1, // 1 time or 2 times
      options: [
        { id: 1, text: sample.options[0] || '1번', audioUrl: null, audioFile: null, duration: 0 },
        { id: 2, text: sample.options[1] || '2번', audioUrl: null, audioFile: null, duration: 0 },
        { id: 3, text: sample.options[2] || '3번', audioUrl: null, audioFile: null, duration: 0 },
        { id: 4, text: sample.options[3] || '4번', audioUrl: null, audioFile: null, duration: 0 }
      ]
    }));
  });

  // Current Active Question (21 to 40)
  const [activeQNum, setActiveQNum] = useState(21);
  const currentQuestion = questions.find(q => q.qNum === activeQNum) || questions[0];

  // Timing Gaps & Sequence Configuration (As requested: Bell -> 1s gap -> Question number -> 1s gap -> Prompt -> 3s gap -> Options -> 7s gap)
  const [includeBell, setIncludeBell] = useState(true); // Bell chime before each question
  const [bellGapSec, setBellGapSec] = useState(1.0); // 1.0s gap after bell chime
  const [includeQuestionNumber, setIncludeQuestionNumber] = useState(true); // "21번", "22번", etc.
  const [qNumFormat, setQNumFormat] = useState('short'); // 'short' ("21번.") or 'full' ("21번 문제입니다.")
  const [qNumGapSec, setQNumGapSec] = useState(1.0); // 1.0s gap after question number announcement
  const [optionGapSec, setOptionGapSec] = useState(3.0); // 3 seconds between question and option, and between options
  const [questionGapSec, setQuestionGapSec] = useState(7.0); // 7 seconds (6 to 8s) between questions

  // Custom Bell Sound
  const [customBellAudioUrl, setCustomBellAudioUrl] = useState(null);
  const [customBellFileName, setCustomBellFileName] = useState('');
  const [defaultBellUrl, setDefaultBellUrl] = useState(null);

  // Single Question Sequence Preview State
  const [previewStage, setPreviewStage] = useState(null); // 'bell' | 'gap-bell' | 'qnum' | 'gap-qnum' | 'prompt' | 'gap-prompt' | 'opt-1' | 'opt-2' | 'opt-3' | 'opt-4'
  const previewCancelRef = useRef(false);

  // Voice Selection for AI Generation
  const [voiceGender, setVoiceGender] = useState('female');
  const [speakingRate, setSpeakingRate] = useState('-4%');

  // Generation / Synthesis States
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthProgress, setSynthProgress] = useState(0);
  const [synthStatusText, setSynthStatusText] = useState('');
  const [masterAudioUrl, setMasterAudioUrl] = useState(null);
  const [masterDuration, setMasterDuration] = useState(0);

  // Audio Playback Preview State
  const [playingItemKey, setPlayingItemKey] = useState(null); // 'q' or 'opt-1' etc.
  const previewAudioRef = useRef(null);

  // Master Audio Player State
  const masterAudioRef = useRef(null);
  const [isMasterPlaying, setIsMasterPlaying] = useState(false);
  const [masterCurrentTime, setMasterCurrentTime] = useState(0);

  // Individual Option Generating state
  const [generatingKey, setGeneratingKey] = useState(null);

  // Auto-save questions to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Strip binary File objects before saving JSON
        const sanitized = questions.map(q => ({
          ...q,
          questionAudioFile: null,
          singleAudioFile: null,
          options: q.options.map(opt => ({ ...opt, audioFile: null }))
        }));
        localStorage.setItem('eps_listening_studio_q21_q40', JSON.stringify(sanitized));
      } catch (e) {}
    }
  }, [questions]);

  // Initialize Default EPS Exam Bell URL on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const buf = createEpsExamBellBuffer(ctx);
          const wavBlob = audioBufferToWav(buf);
          const url = URL.createObjectURL(wavBlob);
          setDefaultBellUrl(url);
          ctx.close().catch(() => {});
        }
      } catch (e) {
        console.error('Failed to create default bell audio:', e);
      }
    }
  }, []);

  // Play test bell chime
  const playBellPreview = () => {
    const url = customBellAudioUrl || defaultBellUrl;
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch(e => console.error('Bell play error:', e));
  };

  // Handle custom bell upload
  const handleCustomBellUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomBellAudioUrl(url);
    setCustomBellFileName(file.name);
  };

  const handleResetToDefaultBell = () => {
    setCustomBellAudioUrl(null);
    setCustomBellFileName('');
  };

  // Helper to format question announcement text
  const getQuestionNumberUrl = (qNum) => {
    const text = qNumFormat === 'full' ? `${qNum}번 문제입니다.` : `${qNum}번.`;
    const voice = voiceGender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural';
    return `/api/tts?text=${encodeURIComponent(text)}&lang=ko&gender=${voiceGender}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(speakingRate)}&pitch=+0Hz`;
  };

  // Stop sequence preview
  const stopSequencePreview = () => {
    previewCancelRef.current = true;
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }
    setPreviewStage(null);
    setPlayingItemKey(null);
  };

  // Preview full sequence for active question
  const handlePreviewSingleSequence = async (qNum) => {
    if (previewStage) {
      stopSequencePreview();
      return;
    }

    const q = questions.find(item => item.qNum === qNum) || currentQuestion;
    previewCancelRef.current = false;

    const playAndWait = (url) => {
      return new Promise((resolve) => {
        if (previewCancelRef.current || !url) return resolve();
        const audio = previewAudioRef.current || new Audio();
        previewAudioRef.current = audio;
        audio.src = url;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    };

    const waitSeconds = (sec) => {
      return new Promise((resolve) => {
        let elapsed = 0;
        const interval = 100;
        const timer = setInterval(() => {
          if (previewCancelRef.current) {
            clearInterval(timer);
            return resolve();
          }
          elapsed += interval / 1000;
          if (elapsed >= sec) {
            clearInterval(timer);
            resolve();
          }
        }, interval);
      });
    };

    try {
      // 1. Bell
      if (includeBell && !previewCancelRef.current) {
        setPreviewStage('bell');
        const bellUrl = customBellAudioUrl || defaultBellUrl;
        await playAndWait(bellUrl);
        if (previewCancelRef.current) return;

        // 1.0s Gap after Bell
        if (bellGapSec > 0) {
          setPreviewStage('gap-bell');
          await waitSeconds(bellGapSec);
          if (previewCancelRef.current) return;
        }
      }

      // 2. Question Number
      if (includeQuestionNumber && !previewCancelRef.current) {
        setPreviewStage('qnum');
        const qNumUrl = getQuestionNumberUrl(q.qNum);
        await playAndWait(qNumUrl);
        if (previewCancelRef.current) return;

        // 1.0s Gap after Question Number
        if (qNumGapSec > 0) {
          setPreviewStage('gap-qnum');
          await waitSeconds(qNumGapSec);
          if (previewCancelRef.current) return;
        }
      }

      // 3. Question Prompt Audio
      if (!previewCancelRef.current) {
        setPreviewStage('prompt');
        let promptUrl = q.questionAudioUrl;
        if (!promptUrl && q.questionText?.trim()) {
          const voice = voiceGender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural';
          promptUrl = `/api/tts?text=${encodeURIComponent(q.questionText.trim())}&lang=ko&gender=${voiceGender}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(speakingRate)}&pitch=+0Hz`;
        }
        if (promptUrl) {
          await playAndWait(promptUrl);
        }
        if (previewCancelRef.current) return;

        // 3.0s Gap after Question Prompt (only if options follow)
        const hasSingleAudio = Boolean(q.singleAudioText?.trim() || q.singleAudioUrl);
        if (optionGapSec > 0 && !hasSingleAudio) {
          setPreviewStage('gap-prompt');
          await waitSeconds(optionGapSec);
          if (previewCancelRef.current) return;
        }
      }

      // 4. Play Single Audio Text if set (skips options 1-4 entirely)
      const hasSingleAudio = Boolean(q.singleAudioText?.trim() || q.singleAudioUrl);
      if (hasSingleAudio) {
        setPreviewStage('single-word');
        let singleUrl = q.singleAudioUrl;
        if (!singleUrl && q.singleAudioText?.trim()) {
          const voice = voiceGender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural';
          singleUrl = `/api/tts?text=${encodeURIComponent(q.singleAudioText.trim())}&lang=ko&gender=${voiceGender}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(speakingRate)}&pitch=+0Hz`;
        }
        if (singleUrl) {
          await playAndWait(singleUrl);
        }
      } else {
        // Standard flow: Options 1 to 4 with 3.0s gap
        for (let i = 0; i < q.options.length; i++) {
          if (previewCancelRef.current) break;
          const opt = q.options[i];
          setPreviewStage(`opt-${opt.id}`);

          let optUrl = opt.audioUrl;
          if (!optUrl && opt.text?.trim()) {
            const prefix = `${opt.id}번. `;
            const fullText = opt.text.startsWith(opt.id + '번') ? opt.text : prefix + opt.text;
            const voice = voiceGender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural';
            optUrl = `/api/tts?text=${encodeURIComponent(fullText.trim())}&lang=ko&gender=${voiceGender}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(speakingRate)}&pitch=+0Hz`;
          }
          if (optUrl) {
            await playAndWait(optUrl);
          }
          if (previewCancelRef.current) break;

          if (i < q.options.length - 1 && optionGapSec > 0) {
            setPreviewStage(`gap-opt-${opt.id}`);
            await waitSeconds(optionGapSec);
          }
        }
      }
    } catch (e) {
      console.error('Sequence preview failed:', e);
    } finally {
      setPreviewStage(null);
    }
  };

  // Handle Question Audio Upload
  const handleQuestionAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src = url;
    audio.onloadedmetadata = () => {
      const dur = audio.duration || 0;
      updateCurrentQuestion({
        questionAudioUrl: url,
        questionAudioFile: file,
        questionDuration: Math.round(dur * 10) / 10
      });
    };
  };

  // Handle Option Audio Upload
  const handleOptionAudioUpload = (optId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src = url;
    audio.onloadedmetadata = () => {
      const dur = audio.duration || 0;
      updateOption(optId, {
        audioUrl: url,
        audioFile: file,
        duration: Math.round(dur * 10) / 10
      });
    };
  };

  // Generate Audio for Question Prompt using TTS
  const handleGenerateQuestionAudio = async () => {
    if (!currentQuestion.questionText?.trim()) {
      alert('Please enter Korean text for Question ' + activeQNum);
      return;
    }

    setGeneratingKey('q');
    try {
      const voice = voiceGender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural';
      const ttsUrl = `/api/tts?text=${encodeURIComponent(currentQuestion.questionText.trim())}&lang=ko&gender=${voiceGender}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(speakingRate)}&pitch=+0Hz`;

      const res = await fetch(ttsUrl);
      if (!res.ok) throw new Error('Speech synthesis failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio();
      audio.src = url;
      audio.onloadedmetadata = () => {
        updateCurrentQuestion({
          questionAudioUrl: url,
          questionAudioFile: new File([blob], `Q${activeQNum}_prompt.mp3`, { type: 'audio/mp3' }),
          questionDuration: Math.round(audio.duration * 10) / 10
        });
        setGeneratingKey(null);
      };
    } catch (err) {
      console.error(err);
      alert('Failed to generate speech: ' + err.message);
      setGeneratingKey(null);
    }
  };

  // Generate Audio for an Option
  const handleGenerateOptionAudio = async (optId, text) => {
    if (!text?.trim()) {
      alert(`Please enter text for Option ${optId}`);
      return;
    }

    setGeneratingKey(`opt-${optId}`);
    try {
      // e.g. "1번, 공장"
      const prefix = `${optId}번. `;
      const fullText = text.startsWith(optId + '번') ? text : prefix + text;

      const voice = voiceGender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural';
      const ttsUrl = `/api/tts?text=${encodeURIComponent(fullText.trim())}&lang=ko&gender=${voiceGender}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(speakingRate)}&pitch=+0Hz`;

      const res = await fetch(ttsUrl);
      if (!res.ok) throw new Error('Option speech synthesis failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio();
      audio.src = url;
      audio.onloadedmetadata = () => {
        updateOption(optId, {
          audioUrl: url,
          audioFile: new File([blob], `Q${activeQNum}_opt${optId}.mp3`, { type: 'audio/mp3' }),
          duration: Math.round(audio.duration * 10) / 10
        });
        setGeneratingKey(null);
      };
    } catch (err) {
      console.error(err);
      alert('Failed to generate option speech: ' + err.message);
      setGeneratingKey(null);
    }
  };

  // Generate All 4 Options in 1 Click
  const handleGenerateAllOptions = async () => {
    for (const opt of currentQuestion.options) {
      await handleGenerateOptionAudio(opt.id, opt.text);
    }
  };

  // Generate Audio for Single Audio Text (skips options 1-4 audio)
  const handleGenerateSingleCustomAudio = async () => {
    if (!currentQuestion.singleAudioText?.trim()) {
      alert('Please enter Korean text to generate single audio.');
      return;
    }

    setGeneratingKey('single-custom');
    try {
      const voice = voiceGender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural';
      const cleanText = currentQuestion.singleAudioText.trim();
      const ttsUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=ko&gender=${voiceGender}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(speakingRate)}&pitch=+0Hz`;

      const res = await fetch(ttsUrl);
      if (!res.ok) throw new Error('Speech synthesis failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio();
      audio.src = url;
      audio.onloadedmetadata = () => {
        updateCurrentQuestion({
          singleAudioUrl: url,
          singleAudioFile: new File([blob], `Q${activeQNum}_single.mp3`, { type: 'audio/mp3' }),
          singleAudioDuration: Math.round(audio.duration * 10) / 10
        });
        setGeneratingKey(null);
      };
    } catch (err) {
      console.error(err);
      alert('Failed to generate speech: ' + err.message);
      setGeneratingKey(null);
    }
  };

  // Upload custom file for Single Audio Text
  const handleSingleCustomAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src = url;
    audio.onloadedmetadata = () => {
      updateCurrentQuestion({
        singleAudioUrl: url,
        singleAudioFile: file,
        singleAudioDuration: Math.round(audio.duration * 10) / 10
      });
    };
  };

  // Update current question
  const updateCurrentQuestion = (updates) => {
    setQuestions(prev => prev.map(q => q.qNum === activeQNum ? { ...q, ...updates } : q));
  };

  // Update a specific option inside current question
  const updateOption = (optId, updates) => {
    setQuestions(prev => prev.map(q => {
      if (q.qNum !== activeQNum) return q;
      return {
        ...q,
        options: q.options.map(opt => opt.id === optId ? { ...opt, ...updates } : opt)
      };
    }));
  };

  // Play Preview of a single sound
  const handlePlayPreview = (key, url) => {
    if (!url) return;

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    if (playingItemKey === key) {
      setPlayingItemKey(null);
      return;
    }

    const audio = new Audio(url);
    previewAudioRef.current = audio;
    setPlayingItemKey(key);
    audio.play();
    audio.onended = () => setPlayingItemKey(null);
    audio.onerror = () => setPlayingItemKey(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // MASTER SYNCHRONIZATION ENGINE (WEB AUDIO API: OFFLINE AUDIO CONTEXT)
  // Concatenates all questions Q21..Q40 with:
  // - Question Audio
  // - 3 seconds pause (configurable optionGapSec)
  // - Option 1 Audio -> 3s pause -> Option 2 Audio -> 3s pause -> Option 3 -> 3s -> Option 4
  // - 7 seconds pause (configurable questionGapSec)
  // - Next Question...
  // Produces 15-20 minutes complete master listening exam track!
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSynchronizeFullListening = async () => {
    setIsSynthesizing(true);
    setSynthProgress(5);
    setSynthStatusText('Initializing Web Audio Engine...');

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported in this browser.');
      }
      const decodeCtx = new AudioContextClass();

      // Step 1: Collect and decode all audio segments for Q21 to Q40
      const segmentsToStitch = []; // Array of AudioBuffers or silence durations
      const totalQuestionsCount = questions.length;

      for (let i = 0; i < totalQuestionsCount; i++) {
        const q = questions[i];
        const progressPct = 5 + Math.round((i / totalQuestionsCount) * 65);
        setSynthProgress(progressPct);
        setSynthStatusText(`Processing Question ${q.qNum} of 40...`);

        // 1. Bell Chime Before Question (if enabled)
        if (includeBell) {
          let bellBuffer = null;
          if (customBellAudioUrl) {
            bellBuffer = await fetchAndDecodeAudio(decodeCtx, customBellAudioUrl);
          }
          if (!bellBuffer) {
            bellBuffer = createEpsExamBellBuffer(decodeCtx);
          }
          if (bellBuffer) {
            segmentsToStitch.push({ type: 'audio', buffer: bellBuffer, label: `Q${q.qNum} Bell Chime` });
          }

          // 1.0s Gap after Bell (as requested: "KEEP GAP 1. SECOND")
          if (bellGapSec > 0) {
            segmentsToStitch.push({ type: 'silence', durationSec: bellGapSec, label: `Q${q.qNum} Post-Bell Gap (${bellGapSec}s)` });
          }
        }

        // 2. Question Number Announcement (if enabled, e.g. "21번")
        if (includeQuestionNumber) {
          const qNumTtsUrl = getQuestionNumberUrl(q.qNum);
          const qNumBuffer = await fetchAndDecodeAudio(decodeCtx, qNumTtsUrl);
          if (qNumBuffer) {
            segmentsToStitch.push({ type: 'audio', buffer: qNumBuffer, label: `Q${q.qNum} Number Announcement` });
          }

          // 1.0s Gap after Question Number (as requested: "AFTER QUESTION NUMBER ALSO KEEP 1 SECOND GAP")
          if (qNumGapSec > 0) {
            segmentsToStitch.push({ type: 'silence', durationSec: qNumGapSec, label: `Q${q.qNum} Post-Number Gap (${qNumGapSec}s)` });
          }
        }

        // 3. Question Audio Prompt Buffer
        let qBuffer = null;
        if (q.questionAudioUrl) {
          qBuffer = await fetchAndDecodeAudio(decodeCtx, q.questionAudioUrl);
        } else if (q.questionText?.trim()) {
          // Auto synthesize if text provided
          const voice = voiceGender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural';
          const ttsUrl = `/api/tts?text=${encodeURIComponent(q.questionText.trim())}&lang=ko&gender=${voiceGender}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(speakingRate)}&pitch=+0Hz`;
          qBuffer = await fetchAndDecodeAudio(decodeCtx, ttsUrl);
        }

        if (qBuffer) {
          segmentsToStitch.push({ type: 'audio', buffer: qBuffer, label: `Q${q.qNum} Prompt` });
        }

        const hasSingleAudio = Boolean(q.singleAudioText?.trim() || q.singleAudioUrl);

        if (hasSingleAudio) {
          // If single audio text/url is set: stitch this text only and SKIP options 1-4!
          let singleBuffer = null;
          if (q.singleAudioUrl) {
            singleBuffer = await fetchAndDecodeAudio(decodeCtx, q.singleAudioUrl);
          } else if (q.singleAudioText?.trim()) {
            const voice = voiceGender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural';
            const ttsUrl = `/api/tts?text=${encodeURIComponent(q.singleAudioText.trim())}&lang=ko&gender=${voiceGender}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(speakingRate)}&pitch=+0Hz`;
            singleBuffer = await fetchAndDecodeAudio(decodeCtx, ttsUrl);
          }

          if (singleBuffer) {
            segmentsToStitch.push({ type: 'audio', buffer: singleBuffer, label: `Q${q.qNum} Single Word Audio` });
          }
        } else {
          // 4. Insert 3-second gap after question
          segmentsToStitch.push({ type: 'silence', durationSec: optionGapSec, label: `Q${q.qNum} 3s Gap` });

          // 3. Process 4 Options with 3-second gap between each option
          for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
            const opt = q.options[optIdx];
            let optBuffer = null;

            if (opt.audioUrl) {
              optBuffer = await fetchAndDecodeAudio(decodeCtx, opt.audioUrl);
            } else if (opt.text?.trim()) {
              const prefix = `${opt.id}번. `;
              const fullText = opt.text.startsWith(opt.id + '번') ? opt.text : prefix + opt.text;
              const voice = voiceGender === 'female' ? 'ko-KR-SunHiNeural' : 'ko-KR-InJoonNeural';
              const ttsUrl = `/api/tts?text=${encodeURIComponent(fullText.trim())}&lang=ko&gender=${voiceGender}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(speakingRate)}&pitch=+0Hz`;
              optBuffer = await fetchAndDecodeAudio(decodeCtx, ttsUrl);
            }

            if (optBuffer) {
              segmentsToStitch.push({ type: 'audio', buffer: optBuffer, label: `Q${q.qNum} Opt ${opt.id}` });
            }

            // Insert 3s gap after option (except if last option, where question gap applies)
            if (optIdx < q.options.length - 1) {
              segmentsToStitch.push({ type: 'silence', durationSec: optionGapSec, label: `Option Gap 3s` });
            }
          }
        }

        // 4. Insert 7-second gap between questions (except after last question Q40)
        if (i < totalQuestionsCount - 1) {
          segmentsToStitch.push({ type: 'silence', durationSec: questionGapSec, label: `Inter-Question Gap 7s` });
        }
      }

      setSynthProgress(75);
      setSynthStatusText('Calculating total exam duration and channel structure...');

      // Calculate total sample length
      const targetSampleRate = 44100;
      let totalSamples = 0;

      for (const seg of segmentsToStitch) {
        if (seg.type === 'audio' && seg.buffer) {
          totalSamples += Math.round(seg.buffer.duration * targetSampleRate);
        } else if (seg.type === 'silence') {
          totalSamples += Math.round(seg.durationSec * targetSampleRate);
        }
      }

      if (totalSamples === 0) {
        throw new Error('No audio content found to synchronize. Please upload or generate audio for at least one question.');
      }

      setSynthProgress(85);
      setSynthStatusText(`Stitching ${Math.round(totalSamples / targetSampleRate)} seconds of master listening track...`);

      // Step 2: Render with OfflineAudioContext
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
        2, // Stereo 2-channels
        totalSamples,
        targetSampleRate
      );

      let currentPlaybackTime = 0;

      for (const seg of segmentsToStitch) {
        if (seg.type === 'audio' && seg.buffer) {
          const sourceNode = offlineCtx.createBufferSource();
          sourceNode.buffer = seg.buffer;
          sourceNode.connect(offlineCtx.destination);
          sourceNode.start(currentPlaybackTime);
          currentPlaybackTime += seg.buffer.duration;
        } else if (seg.type === 'silence') {
          currentPlaybackTime += seg.durationSec;
        }
      }

      setSynthProgress(92);
      setSynthStatusText('Rendering final audio waveform...');

      const renderedBuffer = await offlineCtx.startRendering();

      setSynthProgress(97);
      setSynthStatusText('Encoding master WAV listening file...');

      const wavBlob = audioBufferToWav(renderedBuffer);
      const masterUrl = URL.createObjectURL(wavBlob);

      setMasterAudioUrl(masterUrl);
      setMasterDuration(Math.round(renderedBuffer.duration));
      setSynthProgress(100);
      setSynthStatusText('Synchronized listening track complete!');

      if (decodeCtx.state !== 'closed') {
        decodeCtx.close().catch(() => {});
      }
    } catch (err) {
      console.error('Synchronization error:', err);
      alert('Synchronization Error: ' + err.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Helper to fetch and decode audio
  async function fetchAndDecodeAudio(ctx, url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      return await ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn('Audio decoding fallback error:', e);
      return null;
    }
  }

  // Master Audio Playback Controls
  const toggleMasterPlay = () => {
    if (!masterAudioRef.current) return;
    if (isMasterPlaying) {
      masterAudioRef.current.pause();
      setIsMasterPlaying(false);
    } else {
      masterAudioRef.current.play();
      setIsMasterPlaying(true);
    }
  };

  const handleMasterTimeUpdate = () => {
    if (masterAudioRef.current) {
      setMasterCurrentTime(masterAudioRef.current.currentTime);
    }
  };

  const handleMasterSeek = (e) => {
    const time = parseFloat(e.target.value);
    setMasterCurrentTime(time);
    if (masterAudioRef.current) {
      masterAudioRef.current.currentTime = time;
    }
  };

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
      {/* Title & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '16px', marginBottom: '18px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e3a8a' }}>
            EPS-TOPIK Korean Listening Synchronizer (Q21 – Q40)
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
            Configure Questions 21 to 40, set timing intervals, and export master listening track.
          </p>
        </div>

        {/* Global Action: Synchronize All 20 Questions */}
        <button
          type="button"
          onClick={handleSynchronizeFullListening}
          disabled={isSynthesizing}
          style={{
            background: isSynthesizing
              ? '#94a3b8'
              : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9px',
            padding: '11px 22px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: isSynthesizing ? 'wait' : 'pointer',
            boxShadow: '0 3px 10px rgba(22, 163, 74, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isSynthesizing ? (
            <span>Synchronizing (Q21–Q40)... {synthProgress}%</span>
          ) : (
            <span>Merge &amp; Generate Audio Track (Q21–Q40)</span>
          )}
        </button>
      </div>

      {/* Synthesis Progress Bar */}
      {isSynthesizing && (
        <div style={{ marginBottom: '20px', backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12.5px', fontWeight: '700', color: '#166534' }}>
            <span>{synthStatusText}</span>
            <span>{synthProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#dcfce7', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${synthProgress}%`, height: '100%', backgroundColor: '#16a34a', transition: 'width 0.2s ease' }} />
          </div>
        </div>
      )}

      {/* MASTER AUDIO PLAYER & EXPORT BAR */}
      {masterAudioUrl && (
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '22px',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.2)',
          border: '1.5px solid #334155'
        }}>
          <audio
            ref={masterAudioRef}
            src={masterAudioUrl}
            onTimeUpdate={handleMasterTimeUpdate}
            onEnded={() => setIsMasterPlaying(false)}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={toggleMasterPlay}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(34, 197, 94, 0.35)'
                }}
              >
                {isMasterPlaying ? '⏸' : '▶'}
              </button>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14.5px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Master Listening Track (Q21 – Q40)</span>
                  <span style={{ backgroundColor: '#15803d', color: '#ffffff', fontSize: '10.5px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>20 Questions Merged</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Duration: {formatTime(masterDuration)} ({Math.round(masterDuration / 60)} min) · 44.1kHz Stereo WAV
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <a
                href={masterAudioUrl}
                download="EPS_TOPIK_Listening_Q21-Q40_Merged_Master.wav"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '12.5px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 3px 10px rgba(37, 99, 235, 0.35)'
                }}
              >
                Download Audio (.wav)
              </a>
            </div>
          </div>

          {/* Master Timeline Scrub Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace', minWidth: '45px' }}>
              {formatTime(masterCurrentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={masterDuration || 1}
              step="0.5"
              value={masterCurrentTime}
              onChange={handleMasterSeek}
              style={{ flex: 1, cursor: 'pointer', accentColor: '#22c55e' }}
            />
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace', minWidth: '45px' }}>
              {formatTime(masterDuration)}
            </span>
          </div>
        </div>
      )}

      {/* Global Timing Configuration */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        padding: '14px 18px',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e3a8a' }}>
            Exam Timing &amp; Sequence Settings
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          alignItems: 'start'
        }}>
          {/* 1. BELL CHIME */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '7px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeBell}
                  onChange={(e) => setIncludeBell(e.target.checked)}
                  style={{ accentColor: '#1e3a8a' }}
                />
                <span>Exam Bell Chime</span>
              </label>
              <button
                type="button"
                onClick={playBellPreview}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Test Bell
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <label style={{ fontSize: '11.5px', color: '#475569', fontWeight: '600' }}>Gap after Bell:</label>
              <input
                type="number"
                min="0.5"
                max="3"
                step="0.5"
                value={bellGapSec}
                onChange={(e) => setBellGapSec(parseFloat(e.target.value) || 1.0)}
                style={{ width: '54px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '700', fontSize: '12px' }}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>sec</span>
            </div>

            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {customBellFileName ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#0284c7', fontWeight: '600' }}>{customBellFileName.slice(0, 16)}</span>
                  <button type="button" onClick={handleResetToDefaultBell} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '11px' }}>Reset</button>
                </div>
              ) : (
                <label style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>
                  <span>Upload custom bell sound</span>
                  <input type="file" accept="audio/*" onChange={handleCustomBellUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          {/* 2. QUESTION NUMBER */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '7px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeQuestionNumber}
                  onChange={(e) => setIncludeQuestionNumber(e.target.checked)}
                  style={{ accentColor: '#1e3a8a' }}
                />
                <span>Number Voice (21번)</span>
              </label>
              <select
                value={qNumFormat}
                onChange={(e) => setQNumFormat(e.target.value)}
                style={{ fontSize: '11px', padding: '2px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '600' }}
              >
                <option value="short">21번.</option>
                <option value="full">21번 문제입니다.</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11.5px', color: '#475569', fontWeight: '600' }}>Gap after Number:</label>
              <input
                type="number"
                min="0.5"
                max="3"
                step="0.5"
                value={qNumGapSec}
                onChange={(e) => setQNumGapSec(parseFloat(e.target.value) || 1.0)}
                style={{ width: '54px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '700', fontSize: '12px' }}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>sec</span>
            </div>
          </div>

          {/* 3. OPTION GAP */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '7px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1e3a8a', marginBottom: '6px' }}>
              Option Gap
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <input
                type="number"
                min="1"
                max="6"
                step="0.5"
                value={optionGapSec}
                onChange={(e) => setOptionGapSec(parseFloat(e.target.value) || 3.0)}
                style={{ width: '54px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '700', fontSize: '12px' }}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>seconds</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Between prompt and options</div>
          </div>

          {/* 4. INTER-QUESTION GAP */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '7px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1e3a8a', marginBottom: '6px' }}>
              Inter-Question Gap
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <input
                type="number"
                min="4"
                max="10"
                step="0.5"
                value={questionGapSec}
                onChange={(e) => setQuestionGapSec(parseFloat(e.target.value) || 7.0)}
                style={{ width: '54px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '700', fontSize: '12px' }}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>seconds</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Between questions (6–8s)</div>
          </div>

          {/* 5. VOICE & SPEED */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '7px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1e3a8a', marginBottom: '6px' }}>
              Voice Model &amp; Speed
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <select
                value={voiceGender}
                onChange={(e) => setVoiceGender(e.target.value)}
                style={{ flex: 1, padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '600', fontSize: '11.5px' }}
              >
                <option value="female">SunHi (Female)</option>
                <option value="male">InJoon (Male)</option>
              </select>
              <select
                value={speakingRate}
                onChange={(e) => setSpeakingRate(e.target.value)}
                style={{ flex: 1, padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '600', fontSize: '11.5px' }}
              >
                <option value="-4%">Exam Pace (-4%)</option>
                <option value="+0%">Normal (1.0x)</option>
                <option value="-10%">Slow (-10%)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* QUESTION NAVIGATOR PILLS */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#334155' }}>
            Select Question:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {questions.map((q) => {
            const isSelected = q.qNum === activeQNum;
            const hasQAudio = Boolean(q.questionAudioUrl);
            const hasAllOptions = q.options.every(opt => opt.audioUrl);
            const isComplete = hasQAudio && hasAllOptions;

            return (
              <button
                key={q.qNum}
                type="button"
                onClick={() => setActiveQNum(q.qNum)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: isSelected
                    ? '2px solid #2563eb'
                    : isComplete
                    ? '1.5px solid #86efac'
                    : '1px solid #cbd5e1',
                  backgroundColor: isSelected
                    ? '#2563eb'
                    : isComplete
                    ? '#f0fdf4'
                    : '#ffffff',
                  color: isSelected
                    ? '#ffffff'
                    : isComplete
                    ? '#166534'
                    : '#334155',
                  fontWeight: isSelected ? '800' : '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Q{q.qNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE QUESTION EDITOR CARD */}
      <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {/* Question Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ backgroundColor: '#1e3a8a', color: '#ffffff', padding: '3px 9px', borderRadius: '5px', fontWeight: '800', fontSize: '13px' }}>
              Question {activeQNum}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
              {currentQuestion.title}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={activeQNum <= 21}
              onClick={() => setActiveQNum(prev => Math.max(21, prev - 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                backgroundColor: activeQNum <= 21 ? '#f8fafc' : '#ffffff',
                color: activeQNum <= 21 ? '#94a3b8' : '#334155',
                fontWeight: '600',
                fontSize: '12px',
                cursor: activeQNum <= 21 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous (Q{activeQNum - 1})
            </button>
            <button
              type="button"
              disabled={activeQNum >= 40}
              onClick={() => setActiveQNum(prev => Math.min(40, prev + 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                backgroundColor: activeQNum >= 40 ? '#f8fafc' : '#ffffff',
                color: activeQNum >= 40 ? '#94a3b8' : '#334155',
                fontWeight: '600',
                fontSize: '12px',
                cursor: activeQNum >= 40 ? 'not-allowed' : 'pointer'
              }}
            >
              Next (Q{activeQNum + 1})
            </button>
          </div>
        </div>

        {/* SEQUENCE FLOW PREVIEW BAR FOR THIS QUESTION */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#1e3a8a' }}>
              Question {activeQNum} Sequence Flow:
            </span>

            <button
              type="button"
              onClick={() => handlePreviewSingleSequence(activeQNum)}
              style={{
                backgroundColor: previewStage ? '#dc2626' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '5px',
                padding: '5px 12px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {previewStage ? 'Stop Preview' : `Test Sequence (Q${activeQNum})`}
            </button>
          </div>

          {/* Clean Sequence Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', fontSize: '11.5px', fontWeight: '600' }}>
            <span style={{
              padding: '3px 7px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'bell' ? '#fde68a' : '#ffffff',
              color: previewStage === 'bell' ? '#78350f' : '#1e3a8a',
              border: '1px solid #cbd5e1'
            }}>
              Bell
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'gap-bell' ? '#bbf7d0' : '#f1f5f9',
              color: '#334155'
            }}>
              {bellGapSec}s Gap
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 7px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'qnum' ? '#bfdbfe' : '#ffffff',
              color: '#1e3a8a',
              border: '1px solid #cbd5e1'
            }}>
              {activeQNum}번
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'gap-qnum' ? '#bbf7d0' : '#f1f5f9',
              color: '#334155'
            }}>
              {qNumGapSec}s Gap
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 7px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'prompt' ? '#bae6fd' : '#ffffff',
              color: '#0369a1',
              border: '1px solid #cbd5e1'
            }}>
              Question Audio
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'gap-prompt' ? '#bbf7d0' : '#f1f5f9',
              color: '#334155'
            }}>
              {optionGapSec}s Gap
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'opt-1' ? '#c7d2fe' : '#ffffff',
              color: '#3730a3',
              border: '1px solid #cbd5e1'
            }}>
              Option 1
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'gap-opt-1' ? '#bbf7d0' : '#f1f5f9',
              color: '#334155'
            }}>
              {optionGapSec}s
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'opt-2' ? '#c7d2fe' : '#ffffff',
              color: '#3730a3',
              border: '1px solid #cbd5e1'
            }}>
              Option 2
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'gap-opt-2' ? '#bbf7d0' : '#f1f5f9',
              color: '#334155'
            }}>
              {optionGapSec}s
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'opt-3' ? '#c7d2fe' : '#ffffff',
              color: '#3730a3',
              border: '1px solid #cbd5e1'
            }}>
              Option 3
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'gap-opt-3' ? '#bbf7d0' : '#f1f5f9',
              color: '#334155'
            }}>
              {optionGapSec}s
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: previewStage === 'opt-4' ? '#c7d2fe' : '#ffffff',
              color: '#3730a3',
              border: '1px solid #cbd5e1'
            }}>
              Option 4
            </span>

            <span style={{ color: '#94a3b8' }}>→</span>

            <span style={{
              padding: '3px 6px',
              borderRadius: '5px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a'
            }}>
              {questionGapSec}s (Next Q)
            </span>
          </div>
        </div>

        {/* QUESTION AUDIO PROMPT */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '800', color: '#1e3a8a' }}>
              Question Prompt Audio
            </label>
            {currentQuestion.questionDuration > 0 && (
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#0284c7' }}>
                Duration: {currentQuestion.questionDuration}s
              </span>
            )}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={currentQuestion.questionText || ''}
              onChange={(e) => updateCurrentQuestion({ questionText: e.target.value })}
              placeholder="Enter Korean question text (e.g. 21번 문제입니다. 들은 것을 고르십시오.)"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleGenerateQuestionAudio}
              disabled={generatingKey === 'q'}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '5px',
                padding: '7px 14px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: generatingKey === 'q' ? 'wait' : 'pointer'
              }}
            >
              {generatingKey === 'q' ? 'Generating...' : 'Generate Audio'}
            </button>

            <label style={{
              backgroundColor: '#ffffff',
              color: '#0369a1',
              border: '1px solid #cbd5e1',
              borderRadius: '5px',
              padding: '6px 12px',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              <span>Upload Audio</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleQuestionAudioUpload}
                style={{ display: 'none' }}
              />
            </label>

            {currentQuestion.questionAudioUrl && (
              <button
                type="button"
                onClick={() => handlePlayPreview(`q-${activeQNum}`, currentQuestion.questionAudioUrl)}
                style={{
                  backgroundColor: playingItemKey === `q-${activeQNum}` ? '#dc2626' : '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '7px 12px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {playingItemKey === `q-${activeQNum}` ? 'Stop' : 'Play Preview'}
              </button>
            )}
          </div>
        </div>

        {/* 4 OPTIONS */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '13px', fontWeight: '800', color: '#1e3a8a' }}>
                Options (1 to 4)
              </label>
              {currentQuestion.singleAudioText && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#15803d',
                  backgroundColor: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  ✓ Single Audio Word Active (Options 1-4 Bypassed)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleGenerateAllOptions}
              disabled={Boolean(generatingKey) || Boolean(currentQuestion.singleAudioText)}
              title={currentQuestion.singleAudioText ? 'Disabled because Single Audio Word is active above' : 'Generate TTS speech for all 4 options'}
              style={{
                backgroundColor: currentQuestion.singleAudioText ? '#94a3b8' : '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '5px',
                padding: '5px 12px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: currentQuestion.singleAudioText ? 'not-allowed' : 'pointer'
              }}
            >
              Generate All Options
            </button>
          </div>

          {/* SINGLE TARGET WORD / AUDIO (IF ENTERED, 1-4 OPTIONS AUDIO NOT NEEDED) */}
          <div style={{
            backgroundColor: currentQuestion.singleAudioText ? '#f0fdf4' : '#f8fafc',
            border: currentQuestion.singleAudioText ? '1.5px solid #86efac' : '1.5px dashed #cbd5e1',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '14px',
            transition: 'all 0.15s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🎯</span>
                <label style={{ fontSize: '12.5px', fontWeight: '800', color: currentQuestion.singleAudioText ? '#15803d' : '#1e3a8a' }}>
                  Single Audio Word / Text (यदि यहाँ शब्द लेख्नुभयो भने १-४ अप्सनको अडियो बनाउनु पर्दैन, यसको मात्र अडियो बन्छ)
                </label>
              </div>

              {currentQuestion.singleAudioDuration > 0 && (
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#16a34a', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  Duration: {currentQuestion.singleAudioDuration}s
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={currentQuestion.singleAudioText || ''}
                onChange={(e) => updateCurrentQuestion({ singleAudioText: e.target.value })}
                placeholder="Enter word/sentence to speak only (e.g. 지갑) — Options 1-4 audio will NOT be needed"
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: currentQuestion.singleAudioText ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#0f172a',
                  backgroundColor: '#ffffff'
                }}
              />

              <button
                type="button"
                onClick={handleGenerateSingleCustomAudio}
                disabled={generatingKey === 'single-custom' || !currentQuestion.singleAudioText?.trim()}
                style={{
                  backgroundColor: '#16a34a',
                  backgroundImage: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: !currentQuestion.singleAudioText?.trim() ? 'not-allowed' : 'pointer',
                  opacity: !currentQuestion.singleAudioText?.trim() ? 0.6 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                }}
              >
                <span>🎙️</span>
                <span>{generatingKey === 'single-custom' ? 'Generating...' : 'Generate This Audio Only'}</span>
              </button>

              <label style={{
                backgroundColor: '#ffffff',
                color: '#15803d',
                border: '1px solid #86efac',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}>
                <span>📁 Upload</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleSingleCustomAudioUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {currentQuestion.singleAudioUrl && (
                <button
                  type="button"
                  onClick={() => handlePlayPreview(`single-${activeQNum}`, currentQuestion.singleAudioUrl)}
                  style={{
                    backgroundColor: playingItemKey === `single-${activeQNum}` ? '#dc2626' : '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 14px',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {playingItemKey === `single-${activeQNum}` ? 'Stop' : 'Play Preview'}
                </button>
              )}
            </div>

            {/* Quick helper buttons to auto-fill text from Option 1, 2, 3, or 4 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '11.5px' }}>
              <span style={{ color: '#64748b', fontWeight: '600' }}>Quick set from option:</span>
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    const cleanWord = (opt.text || '').replace(/^[0-9]+번[\.\,\s]*/, '').trim();
                    if (cleanWord) {
                      updateCurrentQuestion({ singleAudioText: cleanWord });
                    }
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: '#1e40af',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Opt {opt.id}: {opt.text || `Option ${opt.id}`}
                </button>
              ))}

              {currentQuestion.singleAudioText && (
                <button
                  type="button"
                  onClick={() => updateCurrentQuestion({ singleAudioText: '', singleAudioUrl: null, singleAudioFile: null, singleAudioDuration: 0 })}
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: '#b91c1c',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  ✕ Clear (Re-enable 1-4 Options Audio)
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {currentQuestion.options.map((opt) => (
              <div
                key={opt.id}
                style={{
                  backgroundColor: opt.audioUrl ? '#f0fdf4' : '#f8fafc',
                  border: opt.audioUrl ? '1.5px solid #86efac' : '1px solid #cbd5e1',
                  borderRadius: '7px',
                  padding: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '12.5px', color: opt.audioUrl ? '#15803d' : '#334155' }}>
                    Option {opt.id}
                  </span>
                  {opt.duration > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a' }}>
                      {opt.duration}s
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(opt.id, { text: e.target.value })}
                  placeholder={`Option ${opt.id} text`}
                  style={{ width: '100%', padding: '6px 9px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box', marginBottom: '8px' }}
                />

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleGenerateOptionAudio(opt.id, opt.text)}
                    disabled={generatingKey === `opt-${opt.id}`}
                    style={{
                      flex: 1,
                      backgroundColor: '#6366f1',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {generatingKey === `opt-${opt.id}` ? '...' : 'Generate'}
                  </button>

                  <label style={{
                    flex: 1,
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '5px 8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}>
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleOptionAudioUpload(opt.id, e)}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {opt.audioUrl && (
                    <button
                      type="button"
                      onClick={() => handlePlayPreview(`opt-${activeQNum}-${opt.id}`, opt.audioUrl)}
                      style={{
                        backgroundColor: playingItemKey === `opt-${activeQNum}-${opt.id}` ? '#dc2626' : '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 9px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {playingItemKey === `opt-${activeQNum}-${opt.id}` ? 'Stop' : 'Play'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
