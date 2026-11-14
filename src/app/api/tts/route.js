import { spawn, execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { synthesizeSpeechBuffer } from '@/lib/nativeTtsService';

export const dynamic = 'force-dynamic';

// ─── TTS Rate Limiter (in-memory, per IP) ────────────────────────────────────
const TTS_RATE_LIMIT = 60;              // max requests per window
const TTS_RATE_WINDOW = 60 * 1000;      // 1 minute window
const TTS_MAX_TEXT_LENGTH = 2000;       // max characters per request
const ttsRateStore = new Map();

function checkTtsRateLimit(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const key = `tts:${ip}`;
  const now = Date.now();
  const record = ttsRateStore.get(key) || { calls: [], blocked: false };
  record.calls = record.calls.filter((t) => now - t < TTS_RATE_WINDOW);
  if (record.calls.length >= TTS_RATE_LIMIT) {
    return { limited: true };
  }
  record.calls.push(now);
  ttsRateStore.set(key, record);
  return { limited: false };
}

// Verified High-Fidelity Microsoft Neural Voice Configurations
const VOICE_CONFIG = {
  ko: {
    female: { voice: 'ko-KR-SunHiNeural',       pitch: '+0Hz', rate: '-6%' },
    male:   { voice: 'ko-KR-InJoonNeural',      pitch: '+0Hz', rate: '-6%' },
  },
  en: {
    female: { voice: 'en-US-JennyNeural',        pitch: '+0Hz', rate: '-5%' },
    male:   { voice: 'en-US-ChristopherNeural',  pitch: '+0Hz', rate: '-5%' },
  },
  ne: {
    female: { voice: 'ne-NP-HemkalaNeural',      pitch: '+0Hz', rate: '-6%' },
    male:   { voice: 'ne-NP-SagarNeural',        pitch: '+0Hz', rate: '-6%' },
  },
  ja: {
    female: { voice: 'ja-JP-NanamiNeural',       pitch: '+0Hz', rate: '-4%' },
    male:   { voice: 'ja-JP-KeitaNeural',        pitch: '+0Hz', rate: '-4%' },
  },
};

// Master Model Voice Tone Profiles for Korean & Japanese
// Model 1: Default baseline voice tone (+0Hz pitch, +0% rate)
// Models 2 to 6: Distinct unique voice tone, pitch, speed, and acoustic timbre
const MODEL_VOICE_TONES = {
  // ── Korean Female ──────────────────────────────────────
  'ko-female-1': { voice: 'ko-KR-SunHiNeural', pitch: '+0Hz', rate: '+0%' },  // DEFAULT BASELINE
  'ko-female-2': { voice: 'ko-KR-SunHiNeural', pitch: '+6Hz', rate: '+4%' },  // Bright & Cheerful
  'ko-female-3': { voice: 'ko-KR-SunHiNeural', pitch: '+2Hz', rate: '-3%' },  // Diction / Clear
  'ko-female-4': { voice: 'ko-KR-SunHiNeural', pitch: '-4Hz', rate: '+2%' },  // News Announcer
  'ko-female-5': { voice: 'ko-KR-SunHiNeural', pitch: '+10Hz', rate: '+5%' }, // Youthful Student
  'ko-female-6': { voice: 'ko-KR-SunHiNeural', pitch: '-6Hz', rate: '-5%' },  // Warm Calming Mentor

  'female-1': { voice: 'ko-KR-SunHiNeural', pitch: '+0Hz', rate: '+0%' },
  'female-2': { voice: 'ko-KR-SunHiNeural', pitch: '+6Hz', rate: '+4%' },
  'female-3': { voice: 'ko-KR-SunHiNeural', pitch: '+2Hz', rate: '-3%' },
  'female-4': { voice: 'ko-KR-SunHiNeural', pitch: '-4Hz', rate: '+2%' },
  'female-5': { voice: 'ko-KR-SunHiNeural', pitch: '+10Hz', rate: '+5%' },
  'female-6': { voice: 'ko-KR-SunHiNeural', pitch: '-6Hz', rate: '-5%' },

  // ── Korean Male ────────────────────────────────────────
  'ko-male-1': { voice: 'ko-KR-InJoonNeural', pitch: '+0Hz', rate: '+0%' },   // DEFAULT BASELINE
  'ko-male-2': { voice: 'ko-KR-InJoonNeural', pitch: '-10Hz', rate: '-4%' },  // Deep Bass & Calm
  'ko-male-3': { voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '+0Hz', rate: '+3%' }, // Energetic Workplace Professional
  'ko-male-4': { voice: 'ko-KR-InJoonNeural', pitch: '-6Hz', rate: '+2%' },   // Resonant Broadcaster
  'ko-male-5': { voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '+6Hz', rate: '+5%' }, // Friendly Travel Companion
  'ko-male-6': { voice: 'ko-KR-InJoonNeural', pitch: '-4Hz', rate: '-6%' },   // Senior Academic Lecturer

  'male-1': { voice: 'ko-KR-InJoonNeural', pitch: '+0Hz', rate: '+0%' },
  'male-2': { voice: 'ko-KR-InJoonNeural', pitch: '-10Hz', rate: '-4%' },
  'male-3': { voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '+0Hz', rate: '+3%' },
  'male-4': { voice: 'ko-KR-InJoonNeural', pitch: '-6Hz', rate: '+2%' },
  'male-5': { voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '+6Hz', rate: '+5%' },
  'male-6': { voice: 'ko-KR-InJoonNeural', pitch: '-4Hz', rate: '-6%' },

  // ── Japanese Female ────────────────────────────────────
  'ja-female-1': { voice: 'ja-JP-NanamiNeural', pitch: '+0Hz', rate: '+0%' }, // DEFAULT BASELINE
  'ja-female-2': { voice: 'ja-JP-NanamiNeural', pitch: '+6Hz', rate: '+4%' }, // Bright & Friendly
  'ja-female-3': { voice: 'ja-JP-NanamiNeural', pitch: '+2Hz', rate: '-3%' }, // Soft Pronunciation
  'ja-female-4': { voice: 'ja-JP-NanamiNeural', pitch: '-4Hz', rate: '+2%' }, // News Announcer
  'ja-female-5': { voice: 'ja-JP-NanamiNeural', pitch: '+10Hz', rate: '+5%' },// Lively Campus Student
  'ja-female-6': { voice: 'ja-JP-NanamiNeural', pitch: '-6Hz', rate: '-5%' }, // Warm Mentor & Storyteller

  // ── Japanese Male ──────────────────────────────────────
  'ja-male-1': { voice: 'ja-JP-KeitaNeural', pitch: '+0Hz', rate: '+0%' },    // DEFAULT BASELINE
  'ja-male-2': { voice: 'ja-JP-KeitaNeural', pitch: '-10Hz', rate: '-4%' },   // Deep Calm Baritone
  'ja-male-3': { voice: 'ja-JP-KeitaNeural', pitch: '+4Hz', rate: '+3%' },    // Energetic Business Keigo
  'ja-male-4': { voice: 'ja-JP-KeitaNeural', pitch: '-6Hz', rate: '+2%' },    // Resonant Narrator
  'ja-male-5': { voice: 'ja-JP-KeitaNeural', pitch: '+8Hz', rate: '+5%' },    // Friendly Casual Companion
  'ja-male-6': { voice: 'ja-JP-KeitaNeural', pitch: '-4Hz', rate: '-6%' }     // Senior Academic Lecturer
};

/**
 * Ultra-Realistic Human Neural Voice Synthesizer
 * Connects directly to Microsoft Cognitive Neural models for genuine male/female vocal tracts,
 * heavy chest resonance, and authentic Korean & Japanese pronunciation.
 */
async function generateNeuralSpeech(text, lang = 'ja', gender = 'female', options = {}) {
  const {
    ageStyle = '',
    speechMode = 'natural_conversation',
    emotion = 'reassuring',
    vocalWeight = null,
    pitchFactor = null,
    model = '',
    voice = ''
  } = options;

  let targetLang = lang;
  if (/[\uAC00-\uD7AF]/.test(text)) targetLang = 'ko';
  else if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) targetLang = 'ja';
  else if (/[\u0900-\u097F]/.test(text) || lang === 'ne') targetLang = 'ne';
  else if (lang === 'en') targetLang = 'en';

  // Explicitly determine male vs female (ensures 'female' is never falsely detected as 'male')
  const isExplicitFemale = gender === 'female' || /(?:^|[-_])female(?:[-_\d]|$)/i.test(model) || (/female/i.test(voice) && !/male/i.test(voice.replace(/female/gi, ''))) || /SunHi|Nanami|Jenny|Hemkala|Kyoko|Ayumi|Heami|Yuna/i.test(voice);
  const isExplicitMale = gender === 'male' || (/(?:^|[-_])male(?:[-_\d]|$)/i.test(model) && !/(?:^|[-_])female(?:[-_\d]|$)/i.test(model)) || /InJoon|Keita|Daichi|Hyunsu|Sagar|Christopher|David|George|Minho/i.test(voice);
  const isMale = !isExplicitFemale && (isExplicitMale || gender === 'male');

  // 1. Resolve Voice Tone Profile for Model
  const matchedTone = MODEL_VOICE_TONES[model];

  let neuralVoice = matchedTone?.voice;
  if (!neuralVoice) {
    if (voice && !voice.includes('undefined')) {
      neuralVoice = voice;
    } else if (targetLang === 'ko') {
      neuralVoice = isMale ? 'ko-KR-InJoonNeural' : 'ko-KR-SunHiNeural';
    } else if (targetLang === 'ne') {
      neuralVoice = isMale ? 'ne-NP-SagarNeural' : 'ne-NP-HemkalaNeural';
    } else if (targetLang === 'en') {
      neuralVoice = isMale ? 'en-US-ChristopherNeural' : 'en-US-JennyNeural';
    } else {
      neuralVoice = isMale ? 'ja-JP-KeitaNeural' : 'ja-JP-NanamiNeural';
    }
  }

  // 2. Resolve Pitch String
  let pitchStr = matchedTone?.pitch || options.pitch || '+0Hz';
  if (options.pitch && options.pitch.includes('Hz')) {
    pitchStr = options.pitch;
  } else if (!matchedTone) {
    let pitchOffset = 0;
    if (pitchFactor !== null && !isNaN(pitchFactor)) {
      pitchOffset += Math.round((pitchFactor - 1.0) * 35);
    } else if (ageStyle === 'deep') {
      pitchOffset -= 12;
    } else if (ageStyle === 'bright') {
      pitchOffset += 6;
    }
    if (vocalWeight !== null && !isNaN(vocalWeight)) {
      pitchOffset -= Math.round((vocalWeight - 0.5) * 12);
    }
    if (emotion === 'happy') pitchOffset += 4;
    else if (emotion === 'sad') pitchOffset -= 4;
    pitchStr = (pitchOffset >= 0 ? `+${pitchOffset}Hz` : `${pitchOffset}Hz`);
  }

  // 3. Resolve Rate String
  let rateStr = matchedTone?.rate || options.rate || '+0%';
  if (options.rate && options.rate.includes('%')) {
    rateStr = options.rate;
  } else if (!matchedTone) {
    if (speechMode === 'slow_learning') rateStr = '-18%';
    else if (speechMode === 'teacher') rateStr = '-8%';
    else if (speechMode === 'natural_conversation') rateStr = '+0%';
    else if (speechMode === 'news_announcer') rateStr = '+6%';
  }

  // Ensure valid format (+/- sign and units) for edge-tts
  pitchStr = pitchStr.trim();
  if (!pitchStr.startsWith('+') && !pitchStr.startsWith('-')) pitchStr = `+${pitchStr}`;
  if (!pitchStr.endsWith('Hz')) pitchStr = `${pitchStr}Hz`;

  rateStr = rateStr.trim();
  if (!rateStr.startsWith('+') && !rateStr.startsWith('-')) rateStr = `+${rateStr}`;
  if (!rateStr.endsWith('%')) rateStr = `${rateStr}%`;

  const tmpOut = path.join(os.tmpdir(), `neural_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.mp3`);
  const scriptPath = path.join(process.cwd(), 'scripts', 'tts_engine.py');

  const userHome = process.env.HOME || '/home/examjkco';
  const vendorDir = path.join(process.cwd(), 'scripts', 'vendor');
  const customEnv = {
    ...process.env,
    PATH: `${userHome}/.local/bin:${userHome}/bin:${process.env.PATH || '/usr/local/bin:/usr/bin:/bin'}`,
    PYTHONPATH: `${vendorDir}:${userHome}/.local/lib/python3.11/site-packages:${userHome}/.local/lib/python3.10/site-packages:${userHome}/.local/lib/python3.9/site-packages:${process.env.PYTHONPATH || ''}`,
    PYTHONUNBUFFERED: '1'
  };

  const pyCandidates = ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3'];
  for (const py of pyCandidates) {
    try {
      execFileSync(py, [scriptPath, text, neuralVoice, pitchStr, rateStr, tmpOut], {
        timeout: 12000,
        env: customEnv
      });
      if (fs.existsSync(tmpOut)) {
        const buf = fs.readFileSync(tmpOut);
        try { fs.unlinkSync(tmpOut); } catch {}
        if (buf.length > 500) {
          return { buffer: buf, contentType: 'audio/mpeg', provider: 'neural-edge' };
        }
      }
    } catch (err) {
      // Try next python candidate
    }
  }
  return null;
}

/**
 * High-fidelity Japanese & Korean Melodic Human Voice Synthesizer
 * Uses natural neural human speech synthesis with 2-pole soft acoustic filtering,
 * organic micro-intonation inflection, chest/throat warmth, and distinct vocal timbres.
 * Supports multi-dimensional categories: ageStyle, personality, speechMode, emotion, pitch, and vocal weight.
 */
async function generateMelodicVoice(text, lang = 'ja', gender = 'female', voice = '', pitch = '+0Hz', rate = '-4%', model = '', options = {}) {
  const {
    ageStyle = '',
    personality = '',
    speechMode = 'natural_conversation',
    emotion = 'reassuring',
    vocalWeight = null,
    pitchFactor: explicitPitchFactor = null,
    customPitch = 0
  } = options;

  // Auto-detect target language if text contains Korean Hangul or Japanese Kanji/Kana
  let targetLang = lang;
  if (/[\uAC00-\uD7AF]/.test(text)) {
    targetLang = 'ko';
  } else if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
    targetLang = 'ja';
  } else if (model === 'male-1' || model === 'male-2' || model === 'female-1' || model === 'female-2') {
    targetLang = 'ko';
  } else if (model === 'male-3' || model === 'male-4' || model === 'female-3' || model === 'female-4') {
    targetLang = 'ja';
  }

  // Clean text for natural human cadence and polite pauses
  let clean = text
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[\/\\]+/g, '、')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) clean = text.trim();

  const isExplicitFemale = gender === 'female' || /(?:^|[-_])female(?:[-_\d]|$)/i.test(model) || (/female/i.test(voice) && !/male/i.test(voice.replace(/female/gi, ''))) || /SunHi|Nanami|Jenny|Hemkala|Kyoko|Ayumi|Heami|Yuna/i.test(voice);
  const isExplicitMale = gender === 'male' || (/(?:^|[-_])male(?:[-_\d]|$)/i.test(model) && !/(?:^|[-_])female(?:[-_\d]|$)/i.test(model)) || /InJoon|Keita|Daichi|Hyunsu|Sagar|Christopher|David|George|Minho/i.test(voice);
  const isMale = !isExplicitFemale && (isExplicitMale || gender === 'male');

  // 1. Calculate Base Pitch Factor from Gender & Age/Style
  let pitchFactor = 1.0;
  let softness = 0.80;
  let warmth = 0.50;
  let effectiveWeight = 0.50;

  if (isMale) {
    if (ageStyle === 'deep' || model === 'male-2' || model === 'male-injoon-deep' || pitch.includes('-7Hz') || pitch.includes('-6Hz')) {
      // Deep baritone / bass: Low pitch & heavy chest body
      pitchFactor = 0.68;
      warmth = 0.90;
      softness = 0.80;
      effectiveWeight = 0.90;
    } else if (ageStyle === 'mature' || model === 'male-4' || pitch.includes('-5Hz') || pitch.includes('-4Hz')) {
      // Mature male: Grounded, warm resonant baritone
      pitchFactor = 0.74;
      warmth = 0.75;
      softness = 0.82;
      effectiveWeight = 0.75;
    } else if (ageStyle === 'young_adult' || ageStyle === 'bright' || model === 'male-5' || pitch.includes('+4Hz')) {
      // Young adult male: Lighter, energetic, higher male register
      pitchFactor = 0.86;
      warmth = 0.40;
      softness = 0.75;
      effectiveWeight = 0.40;
    } else {
      // Standard male (Male 1 / Male 3 / InJoon Standard)
      pitchFactor = 0.72;
      warmth = 0.65;
      softness = 0.78;
      effectiveWeight = 0.65;
    }
  } else {
    if (ageStyle === 'bright' || model === 'female-2' || pitch.includes('+5Hz') || pitch.includes('+4Hz')) {
      // Bright female: High melodic pitch & light airy head register
      pitchFactor = 1.15;
      warmth = 0.20;
      softness = 0.72;
      effectiveWeight = 0.25;
    } else if (ageStyle === 'soft' || model === 'female-4' || model === 'fem-sunhi-soft') {
      // Soft female: Delicate, gentle, whisper-soft warmth
      pitchFactor = 1.00;
      warmth = 0.40;
      softness = 0.94;
      effectiveWeight = 0.22;
    } else if (ageStyle === 'deep' || ageStyle === 'mature' || model === 'fem-sunhi-deep') {
      // Mature female: Rich, grounded, lower fundamental
      pitchFactor = 0.88;
      warmth = 0.65;
      softness = 0.82;
      effectiveWeight = 0.65;
    } else if (ageStyle === 'young_adult') {
      // Young adult female: Clear, crisp, energetic
      pitchFactor = 1.06;
      warmth = 0.28;
      softness = 0.78;
      effectiveWeight = 0.35;
    } else {
      // Standard female (Female 1 / Female 3 / SunHi Standard)
      pitchFactor = 1.01;
      warmth = 0.35;
      softness = 0.82;
      effectiveWeight = 0.45;
    }
  }

  // 2. Override with explicit vocalWeight if specified
  if (vocalWeight !== null && vocalWeight !== undefined && !isNaN(vocalWeight)) {
    effectiveWeight = vocalWeight;
  }

  // 3. Override with explicit pitch factor or offset
  if (explicitPitchFactor !== null && explicitPitchFactor !== undefined && !isNaN(explicitPitchFactor)) {
    if (explicitPitchFactor >= 0.4 && explicitPitchFactor <= 1.8) {
      pitchFactor = explicitPitchFactor;
    } else if (explicitPitchFactor >= -0.5 && explicitPitchFactor <= 0.5) {
      pitchFactor = pitchFactor * (1.0 + explicitPitchFactor);
    }
  } else if (customPitch !== 0 && !isNaN(customPitch)) {
    if (customPitch >= 0.4 && customPitch <= 1.8) {
      pitchFactor = customPitch;
    } else {
      pitchFactor = pitchFactor * (1.0 + customPitch);
    }
  }

  // 4. Apply Emotional Pitch & Micro-Intonation Adjustments
  let vibratoRate = 0.0012;
  let vibratoDepth = 0.008;

  if (emotion === 'happy') {
    pitchFactor *= 1.05;
    vibratoRate = 0.0015;
    vibratoDepth = 0.010;
  } else if (emotion === 'excited') {
    pitchFactor *= 1.08;
    vibratoRate = 0.0017;
    vibratoDepth = 0.012;
  } else if (emotion === 'sad') {
    pitchFactor *= 0.95;
    softness = Math.min(0.96, softness + 0.10);
    vibratoRate = 0.0009;
    vibratoDepth = 0.006;
  } else if (emotion === 'surprised') {
    pitchFactor *= 1.10;
    vibratoRate = 0.0018;
    vibratoDepth = 0.012;
  } else if (emotion === 'serious') {
    pitchFactor *= 0.96;
    warmth = Math.min(0.85, warmth + 0.12);
    vibratoRate = 0.0008;
    vibratoDepth = 0.004;
  } else if (emotion === 'reassuring') {
    pitchFactor *= 0.98;
    softness = Math.min(0.94, softness + 0.08);
    warmth = Math.min(0.80, warmth + 0.08);
    vibratoRate = 0.0010;
    vibratoDepth = 0.007;
  }

  // 4. Speech Mode Pacing Rate (Slow Learning vs Exam vs Conversation)
  let speedRateParam = '-4%';
  if (speechMode === 'slow_learning') {
    speedRateParam = '-18%';
  } else if (speechMode === 'teacher') {
    speedRateParam = '-8%';
  } else if (speechMode === 'exam_listening') {
    speedRateParam = '+4%';
  } else if (speechMode === 'news_announcer') {
    speedRateParam = '+6%';
  } else if (speechMode === 'storytelling') {
    speedRateParam = '-5%';
  }

  const tmpDir = os.tmpdir();
  const id = `melodic_${targetLang}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const rawMp3Path = path.join(tmpDir, `${id}_raw.mp3`);
  const wavPath = path.join(tmpDir, `${id}.wav`);
  const m4aPath = path.join(tmpDir, `${id}.m4a`);

  try {
    // 1. Fetch fluent neural human speech base
    let gotAudio = false;
    try {
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(clean)}&tl=${targetLang}&client=tw-ob`;
      const res = await fetch(googleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        }
      });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        if (arrayBuf.byteLength > 100) {
          return { buffer: Buffer.from(arrayBuf), contentType: 'audio/mpeg', provider: 'google-tts' };
        }
      }
    } catch (fetchErr) {
      // Network fetch issue, will fall back below
    }

    // Fallback: If offline, use macOS studio engine
    if (!gotAudio && process.platform === 'darwin') {
      const aiffPath = path.join(tmpDir, `${id}.aiff`);
      const macVoice = targetLang === 'ja' ? 'Kyoko' : 'Yuna';
      execFileSync('say', ['-v', macVoice, '-r', '150', clean, '-o', aiffPath], { timeout: 6000 });
      execFileSync('afconvert', [aiffPath, wavPath, '-f', 'WAVE', '-d', 'LEI16'], { timeout: 6000 });
      try { fs.unlinkSync(aiffPath); } catch {}
      gotAudio = true;
    }

    if (!gotAudio || !fs.existsSync(wavPath)) {
      return null;
    }

    const rawBuf = fs.readFileSync(wavPath);
    try { fs.unlinkSync(wavPath); } catch {}

    // Parse WAV data chunk
    let offset = 12;
    let dataOffset = 44;
    let dataSize = rawBuf.length - 44;
    while (offset < rawBuf.length - 8) {
      const chunkId = rawBuf.toString('ascii', offset, offset + 4);
      const chunkSize = rawBuf.readUInt32LE(offset + 4);
      if (chunkId === 'data') {
        dataOffset = offset + 8;
        dataSize = chunkSize;
        break;
      }
      offset += 8 + chunkSize;
    }

    const sampleCount = Math.floor(dataSize / 2);
    const srcSamples = new Int16Array(rawBuf.buffer, rawBuf.byteOffset + dataOffset, sampleCount);

    // ── HIGH-FIDELITY HUMAN VOCAL ENGINE: GRANULAR DURATION-PRESERVED DSP ──
    const sampleRate = 24000;
    const outCount = sampleCount; // DURATION PRESERVED: NEVER SLOWS DOWN SPEECH!
    const outSamples = new Float32Array(outCount);
    const windowSum = new Float32Array(outCount);

    // Grain size: 1024 samples (~42ms), Hop: 256 samples (75% overlap)
    const grainSize = 1024;
    const hopSize = 256;

    // Hanning window lookup
    const window = new Float32Array(grainSize);
    for (let k = 0; k < grainSize; k++) {
      window[k] = 0.5 * (1.0 - Math.cos((2.0 * Math.PI * k) / (grainSize - 1)));
    }

    // Overlap-Add pitch shifting without altering speaking cadence
    const effectivePitch = Math.max(0.55, Math.min(1.45, pitchFactor));
    for (let inPos = 0; inPos <= sampleCount - grainSize; inPos += hopSize) {
      const outPos = inPos;
      // Vibrato modulation for organic vocal chord flexibility
      const vibrato = 1.0 + Math.sin(inPos * vibratoRate) * vibratoDepth;
      const grainPitch = effectivePitch * vibrato;

      for (let k = 0; k < grainSize; k++) {
        const srcIdx = inPos + Math.floor(k * grainPitch);
        const targetIdx = outPos + k;
        if (srcIdx < sampleCount && targetIdx < outCount) {
          const sampleVal = srcSamples[srcIdx] / 32768.0;
          outSamples[targetIdx] += sampleVal * window[k];
          windowSum[targetIdx] += window[k];
        }
      }
    }

    // Normalize overlapping grain windows
    for (let i = 0; i < outCount; i++) {
      if (windowSum[i] > 0.0001) {
        outSamples[i] /= windowSum[i];
      }
    }

    // ── CHEST CAVITY RESONANCE & VOCAL WEIGHT BIQUAD DSP FILTER ──
    // Center around 165Hz (human male/heavy chest cavity resonance)
    const fc = isMale ? 165 : 210;
    // Heavy weight gain up to +11 dB
    const gainDb = (effectiveWeight * 12.0) - 2.0; 
    const Q = 1.25;
    const A = Math.pow(10, gainDb / 40);
    const w0 = (2 * Math.PI * fc) / sampleRate;
    const alpha = Math.sin(w0) / (2 * Q);

    const b0 = 1 + alpha * A;
    const b1 = -2 * Math.cos(w0);
    const b2 = 1 - alpha * A;
    const a0 = 1 + alpha / A;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha / A;

    // Presence High-Shelf filter at 3.4kHz for crisp consonant clarity (Korean/Japanese diction)
    const fcHigh = 3400;
    const w0High = (2 * Math.PI * fcHigh) / sampleRate;
    const alphaHigh = Math.sin(w0High) / 2.0;
    const b0H = 1 + alphaHigh;
    const b1H = -2 * Math.cos(w0High);
    const b2H = 1 - alphaHigh;

    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    let hx1 = 0, hx2 = 0, hy1 = 0, hy2 = 0;

    const processedSamples = new Int16Array(outCount);

    for (let i = 0; i < outCount; i++) {
      const x0 = outSamples[i];

      // 1. Apply chest resonance peaking filter
      const y0 = (b0 / a0) * x0 + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
      x2 = x1; x1 = x0;
      y2 = y1; y1 = y0;

      // 2. Subharmonic chest injection (1/2 frequency octave) for deep human throat mass
      const subIdx = Math.floor(i * 0.5);
      const subSample = (subIdx < outCount ? outSamples[subIdx] : 0) * (0.35 * effectiveWeight);

      // 3. Consonant clarity boost
      const clarity = (b0H * x0 + b1H * hx1 + b2H * hx2 - b1H * hy1 - b2H * hy2) * 0.15;
      hx2 = hx1; hx1 = x0;
      hy2 = hy1; hy1 = clarity;

      // 4. Mix and apply soft analog tape saturation for natural human vocal warmth
      let mixed = (y0 * 1.10) + subSample + clarity;
      mixed = Math.tanh(mixed * 1.15) / 1.15;

      processedSamples[i] = Math.max(-32768, Math.min(32767, Math.round(mixed * 32767)));
    }

    // Write processed WAV
    const numChannels = 1;
    const byteRate = sampleRate * numChannels * 2;
    const blockAlign = numChannels * 2;
    const outDataBytes = outCount * 2;
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + outDataBytes, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(outDataBytes, 40);

    const processedWav = Buffer.concat([header, Buffer.from(processedSamples.buffer, processedSamples.byteOffset, processedSamples.byteLength)]);

    // Convert to compact AAC (.m4a)
    const tempProcWav = path.join(tmpDir, `${id}_proc.wav`);
    fs.writeFileSync(tempProcWav, processedWav);
    try {
      execFileSync('afconvert', [tempProcWav, m4aPath, '-f', 'm4af', '-d', 'aac'], { timeout: 6000 });
      try { fs.unlinkSync(tempProcWav); } catch {}
      const m4aBuf = fs.readFileSync(m4aPath);
      try { fs.unlinkSync(m4aPath); } catch {}
      return { buffer: m4aBuf, contentType: 'audio/mp4' };
    } catch {
      try { if (fs.existsSync(tempProcWav)) fs.unlinkSync(tempProcWav); } catch {}
      return { buffer: processedWav, contentType: 'audio/wav', provider: 'dsp-wav' };
    }
  } catch (err) {
    console.warn(`Melodic voice error (${lang}):`, err?.message || err);
    return null;
  }
}

/**
 * Executes isolated Node runner for EdgeTTS with natural cadence
 */
function generateEdgeTts(text, voice, pitch, rate) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'tts-cli.js');
    const child = spawn(process.execPath, [scriptPath, text, voice, pitch || '+0Hz', rate || '-6%'], {
      windowsHide: true,
    });

    const chunks = [];
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      chunks.push(chunk);
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch { }
      reject(new Error('TTS timeout'));
    }, 6000);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && chunks.length > 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(stderr || `Process exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * GET /api/tts?text=こんにちは&lang=ja&gender=female
 * Serves human melodic voices with distinct male and female acoustics.
 */
export async function GET(request) {
  // Rate limit check
  const rateCheck = checkTtsRateLimit(request);
  if (rateCheck.limited) {
    return new Response('Too Many Requests. Please slow down.', {
      status: 429,
      headers: { 'Retry-After': '60' }
    });
  }

  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '';
  const lang = searchParams.get('lang') || 'ja';
  const gender = searchParams.get('gender') || 'female';

  if (!text.trim()) {
    return new Response('Missing text parameter', { status: 400 });
  }
  // Cap text length to prevent abuse
  if (text.length > TTS_MAX_TEXT_LENGTH) {
    return new Response(`Text too long. Maximum ${TTS_MAX_TEXT_LENGTH} characters allowed.`, { status: 400 });
  }

  const isDownload = searchParams.get('download') === 'true';
  const cleanName = (text.slice(0, 30).replace(/[^a-zA-Z0-9_\-\u0900-\u097F\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_') || 'speech');
  const ext = 'mp3';
  const filename = searchParams.get('filename') || `${cleanName}_${lang}_${gender}.${ext}`;
  const disposition = isDownload ? `attachment; filename="${encodeURIComponent(filename)}"` : `inline; filename="${encodeURIComponent(filename)}"`;

  const langKey = VOICE_CONFIG[lang] ? lang : 'ja';
  const cfg = (gender === 'male') ? VOICE_CONFIG[langKey].male : VOICE_CONFIG[langKey].female;
  const selectedVoice = searchParams.get('voice') || cfg.voice;
  const selectedPitch = searchParams.get('pitch') || cfg.pitch;
  const selectedRate  = searchParams.get('rate')  || cfg.rate;
  const selectedModel = searchParams.get('model') || searchParams.get('modelId') || '';
  const ageStyle = searchParams.get('ageStyle') || '';
  const personality = searchParams.get('personality') || '';
  const speechMode = searchParams.get('speechMode') || 'natural_conversation';
  const emotion = searchParams.get('emotion') || 'reassuring';
  const rawWeight = searchParams.get('weight') || searchParams.get('vocalWeight');
  const vocalWeight = rawWeight !== null ? parseFloat(rawWeight) : null;
  const rawPitch = searchParams.get('pitchFactor') || searchParams.get('customPitch');
  const explicitPitch = rawPitch !== null ? parseFloat(rawPitch) : null;

  const result = await synthesizeSpeechBuffer({
    text,
    lang,
    gender,
    voice: selectedVoice,
    pitch: selectedPitch,
    rate: selectedRate,
    model: selectedModel,
    modelId: selectedModel,
    ageStyle,
    personality,
    speechMode,
    emotion,
    vocalWeight,
    pitchFactor: explicitPitch
  });

  if (result && result.buffer && result.buffer.length > 0) {
    return new Response(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': result.contentType || 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800, immutable',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': disposition,
        'Content-Length': String(result.buffer.byteLength),
        'X-Audio-Provider': result.provider || 'neural-edge'
      },
    });
  }

  return new Response('TTS unavailable', { status: 502 });
}

export async function POST(request) {
  try {
    // Rate limit check (shared with GET)
    const rateCheck = checkTtsRateLimit(request);
    if (rateCheck.limited) {
      return new Response('Too Many Requests. Please slow down.', {
        status: 429,
        headers: { 'Retry-After': '60' }
      });
    }

    const body = await request.json();
    const text = body.text || '';
    const lang = body.lang || 'ja';
    const gender = body.gender || 'female';

    if (!text.trim()) {
      return new Response('Missing text parameter', { status: 400 });
    }
    if (text.length > TTS_MAX_TEXT_LENGTH) {
      return new Response(`Text too long. Maximum ${TTS_MAX_TEXT_LENGTH} characters allowed.`, { status: 400 });
    }

    const url = new URL(request.url);
    url.searchParams.set('text', text);
    url.searchParams.set('lang', lang);
    url.searchParams.set('gender', gender);
    if (body.voice) url.searchParams.set('voice', body.voice);
    if (body.pitch) url.searchParams.set('pitch', body.pitch);
    if (body.rate) url.searchParams.set('rate', body.rate);
    if (body.model) url.searchParams.set('model', body.model);
    if (body.ageStyle) url.searchParams.set('ageStyle', body.ageStyle);
    if (body.personality) url.searchParams.set('personality', body.personality);
    if (body.speechMode) url.searchParams.set('speechMode', body.speechMode);
    if (body.emotion) url.searchParams.set('emotion', body.emotion);
    if (body.weight !== undefined) url.searchParams.set('weight', String(body.weight));
    if (body.pitchFactor !== undefined) url.searchParams.set('pitchFactor', String(body.pitchFactor));

    return GET(new Request(url.toString(), { method: 'GET' }));
  } catch (err) {
    return new Response('Invalid JSON body', { status: 400 });
  }
}
