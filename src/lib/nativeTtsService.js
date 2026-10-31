import { spawn, execSync, execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Verified High-Fidelity Microsoft Neural Voice Configurations
export const VOICE_CONFIG = {
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
export const MODEL_VOICE_TONES = {
  // ── Korean Female ──────────────────────────────────────
  'ko-female-1': { voice: 'ko-KR-SunHiNeural', pitch: '+0Hz', rate: '+0%' },  // DEFAULT BASELINE
  'ko-female-2': { voice: 'ko-KR-SunHiNeural', pitch: '+12Hz', rate: '+6%' }, // Bright & Cheerful
  'ko-female-3': { voice: 'ko-KR-SunHiNeural', pitch: '+4Hz', rate: '-6%' },  // Diction / Clear
  'ko-female-4': { voice: 'ko-KR-SunHiNeural', pitch: '-6Hz', rate: '+4%' },  // News Announcer
  'ko-female-5': { voice: 'ko-KR-SunHiNeural', pitch: '+20Hz', rate: '+8%' }, // Youthful Student
  'ko-female-6': { voice: 'ko-KR-SunHiNeural', pitch: '-12Hz', rate: '-10%' },// Warm Calming Mentor

  'female-1': { voice: 'ko-KR-SunHiNeural', pitch: '+0Hz', rate: '+0%' },
  'female-2': { voice: 'ko-KR-SunHiNeural', pitch: '+12Hz', rate: '+6%' },
  'female-3': { voice: 'ko-KR-SunHiNeural', pitch: '+4Hz', rate: '-6%' },
  'female-4': { voice: 'ko-KR-SunHiNeural', pitch: '-6Hz', rate: '+4%' },
  'female-5': { voice: 'ko-KR-SunHiNeural', pitch: '+20Hz', rate: '+8%' },
  'female-6': { voice: 'ko-KR-SunHiNeural', pitch: '-12Hz', rate: '-10%' },

  // ── Korean Male ────────────────────────────────────────
  'ko-male-1': { voice: 'ko-KR-InJoonNeural', pitch: '+0Hz', rate: '+0%' },   // DEFAULT BASELINE
  'ko-male-2': { voice: 'ko-KR-InJoonNeural', pitch: '-16Hz', rate: '-8%' },  // Deep Bass & Calm
  'ko-male-3': { voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '+4Hz', rate: '+5%' }, // Energetic Workplace Professional
  'ko-male-4': { voice: 'ko-KR-InJoonNeural', pitch: '-8Hz', rate: '+3%' },   // Resonant Broadcaster
  'ko-male-5': { voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '+12Hz', rate: '+8%' }, // Friendly Travel Companion
  'ko-male-6': { voice: 'ko-KR-InJoonNeural', pitch: '-6Hz', rate: '-12%' },  // Senior Academic Lecturer

  'male-1': { voice: 'ko-KR-InJoonNeural', pitch: '+0Hz', rate: '+0%' },
  'male-2': { voice: 'ko-KR-InJoonNeural', pitch: '-16Hz', rate: '-8%' },
  'male-3': { voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '+4Hz', rate: '+5%' },
  'male-4': { voice: 'ko-KR-InJoonNeural', pitch: '-8Hz', rate: '+3%' },
  'male-5': { voice: 'ko-KR-HyunsuMultilingualNeural', pitch: '+12Hz', rate: '+8%' },
  'male-6': { voice: 'ko-KR-InJoonNeural', pitch: '-6Hz', rate: '-12%' },

  // ── Japanese Female ────────────────────────────────────
  'ja-female-1': { voice: 'ja-JP-NanamiNeural', pitch: '+0Hz', rate: '+0%' }, // DEFAULT BASELINE
  'ja-female-2': { voice: 'ja-JP-NanamiNeural', pitch: '+12Hz', rate: '+6%' },// Bright & Friendly
  'ja-female-3': { voice: 'ja-JP-NanamiNeural', pitch: '+3Hz', rate: '-8%' }, // Soft Pronunciation
  'ja-female-4': { voice: 'ja-JP-NanamiNeural', pitch: '-6Hz', rate: '+4%' }, // News Announcer
  'ja-female-5': { voice: 'ja-JP-NanamiNeural', pitch: '+20Hz', rate: '+8%' },// Lively Campus Student
  'ja-female-6': { voice: 'ja-JP-NanamiNeural', pitch: '-10Hz', rate: '-10%' },// Warm Mentor & Storyteller

  // ── Japanese Male ──────────────────────────────────────
  'ja-male-1': { voice: 'ja-JP-KeitaNeural', pitch: '+0Hz', rate: '+0%' },    // DEFAULT BASELINE
  'ja-male-2': { voice: 'ja-JP-KeitaNeural', pitch: '-16Hz', rate: '-8%' },   // Deep Calm Baritone
  'ja-male-3': { voice: 'ja-JP-KeitaNeural', pitch: '+6Hz', rate: '+5%' },    // Energetic Business Keigo
  'ja-male-4': { voice: 'ja-JP-KeitaNeural', pitch: '-10Hz', rate: '-4%' },   // Resonant Narrator
  'ja-male-5': { voice: 'ja-JP-KeitaNeural', pitch: '+14Hz', rate: '+8%' },   // Friendly Casual Companion
  'ja-male-6': { voice: 'ja-JP-KeitaNeural', pitch: '-6Hz', rate: '-12%' }    // Senior Academic Lecturer
};

/**
 * Ultra-Realistic Human Neural Voice Synthesizer
 * Uses Python script with edge-tts for native neural synthesis
 */
export async function generateNeuralSpeech(text, lang = 'ja', gender = 'female', options = {}) {
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

  const isMale = gender === 'male' || model.includes('male') || voice.includes('male') || voice.includes('InJoon') || voice.includes('Keita') || voice.includes('Daichi') || voice.includes('Hyunsu');

  // 1. Resolve Voice Tone Profile for Model
  const matchedTone = MODEL_VOICE_TONES[model];

  let neuralVoice = matchedTone?.voice;
  if (!neuralVoice) {
    if (voice && (voice === 'ko-KR-SunHiNeural' || voice === 'ko-KR-InJoonNeural' || voice === 'ko-KR-HyunsuMultilingualNeural' || voice === 'ja-JP-NanamiNeural' || voice === 'ja-JP-KeitaNeural')) {
      neuralVoice = voice;
    } else if (targetLang === 'ko') {
      neuralVoice = isMale ? 'ko-KR-InJoonNeural' : 'ko-KR-SunHiNeural';
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

  try {
    execFileSync('python3', [scriptPath, text, neuralVoice, pitchStr, rateStr, tmpOut], { timeout: 10000 });
    if (fs.existsSync(tmpOut)) {
      const buf = fs.readFileSync(tmpOut);
      try { fs.unlinkSync(tmpOut); } catch {}
      if (buf.length > 500) {
        return { buffer: buf, contentType: 'audio/mpeg', provider: 'neural-edge' };
      }
    }
  } catch (err) {
    console.warn('Python neural TTS error, falling back:', err.message);
  }
  return null;
}

/**
 * High-fidelity Japanese & Korean Melodic Human Voice Synthesizer
 */
export async function generateMelodicVoice(text, lang = 'ja', gender = 'female', voice = '', pitch = '+0Hz', rate = '-4%', model = '', options = {}) {
  const {
    ageStyle = '',
    personality = '',
    speechMode = 'natural_conversation',
    emotion = 'reassuring',
    vocalWeight = null,
    pitchFactor: explicitPitchFactor = null,
    customPitch = 0
  } = options;

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

  let clean = text
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[\/\\]+/g, '、')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) clean = text.trim();

  const isMale = gender === 'male' || model.startsWith('male') || voice.includes('Keita') || voice.includes('Daichi') || voice.includes('InJoon') || voice.includes('Hyunsu') || voice.includes('male');

  let pitchFactor = 1.0;
  let softness = 0.80;
  let warmth = 0.50;
  let effectiveWeight = 0.50;

  if (isMale) {
    if (ageStyle === 'deep' || model === 'male-2' || model === 'male-injoon-deep' || pitch.includes('-7Hz') || pitch.includes('-6Hz')) {
      pitchFactor = 0.68; warmth = 0.90; softness = 0.80; effectiveWeight = 0.90;
    } else if (ageStyle === 'mature' || model === 'male-4' || pitch.includes('-5Hz') || pitch.includes('-4Hz')) {
      pitchFactor = 0.74; warmth = 0.75; softness = 0.82; effectiveWeight = 0.75;
    } else if (ageStyle === 'young_adult' || ageStyle === 'bright' || model === 'male-5' || pitch.includes('+4Hz')) {
      pitchFactor = 0.86; warmth = 0.40; softness = 0.75; effectiveWeight = 0.40;
    } else {
      pitchFactor = 0.72; warmth = 0.65; softness = 0.78; effectiveWeight = 0.65;
    }
  } else {
    if (ageStyle === 'bright' || model === 'female-2' || pitch.includes('+5Hz') || pitch.includes('+4Hz')) {
      pitchFactor = 1.15; warmth = 0.20; softness = 0.72; effectiveWeight = 0.25;
    } else if (ageStyle === 'soft' || model === 'female-4' || model === 'fem-sunhi-soft') {
      pitchFactor = 1.00; warmth = 0.40; softness = 0.94; effectiveWeight = 0.22;
    } else if (ageStyle === 'deep' || ageStyle === 'mature' || model === 'fem-sunhi-deep') {
      pitchFactor = 0.88; warmth = 0.65; softness = 0.82; effectiveWeight = 0.65;
    } else if (ageStyle === 'young_adult') {
      pitchFactor = 1.06; warmth = 0.28; softness = 0.78; effectiveWeight = 0.35;
    } else {
      pitchFactor = 1.01; warmth = 0.35; softness = 0.82; effectiveWeight = 0.45;
    }
  }

  if (vocalWeight !== null && vocalWeight !== undefined && !isNaN(vocalWeight)) {
    effectiveWeight = vocalWeight;
  }

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

  if (emotion === 'happy') {
    pitchFactor *= 1.05;
  } else if (emotion === 'excited') {
    pitchFactor *= 1.08;
  } else if (emotion === 'sad') {
    pitchFactor *= 0.95;
    softness = Math.min(0.96, softness + 0.10);
  } else if (emotion === 'surprised') {
    pitchFactor *= 1.10;
  } else if (emotion === 'serious') {
    pitchFactor *= 0.96;
    warmth = Math.min(0.85, warmth + 0.12);
  } else if (emotion === 'reassuring') {
    pitchFactor *= 0.98;
    softness = Math.min(0.94, softness + 0.08);
    warmth = Math.min(0.80, warmth + 0.08);
  }

  const tmpDir = os.tmpdir();
  const id = `melodic_${targetLang}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const rawMp3Path = path.join(tmpDir, `${id}_raw.mp3`);
  const wavPath = path.join(tmpDir, `${id}.wav`);
  const m4aPath = path.join(tmpDir, `${id}.m4a`);

  try {
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
          fs.writeFileSync(rawMp3Path, Buffer.from(arrayBuf));
          execSync(`afconvert "${rawMp3Path}" "${wavPath}" -f WAVE -d LEI16`, { timeout: 6000 });
          try { fs.unlinkSync(rawMp3Path); } catch {}
          gotAudio = true;
        }
      }
    } catch (fetchErr) {
      // Network fetch issue, fall back
    }

    if (!gotAudio && process.platform === 'darwin') {
      const aiffPath = path.join(tmpDir, `${id}.aiff`);
      const macVoice = targetLang === 'ja' ? 'Kyoko' : 'Yuna';
      execSync(`say -v ${macVoice} -r 150 "${clean.replace(/"/g, '')}" -o "${aiffPath}"`, { timeout: 6000 });
      execSync(`afconvert "${aiffPath}" "${wavPath}" -f WAVE -d LEI16`, { timeout: 6000 });
      try { fs.unlinkSync(aiffPath); } catch {}
      gotAudio = true;
    }

    if (!gotAudio || !fs.existsSync(wavPath)) {
      return null;
    }

    const rawBuf = fs.readFileSync(wavPath);
    try { fs.unlinkSync(wavPath); } catch {}

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

    const sampleRate = 24000;
    const outCount = sampleCount;
    const outSamples = new Float32Array(outCount);

    const grainSize = 1024;
    const hopSize = 256;

    const window = new Float32Array(grainSize);
    for (let k = 0; k < grainSize; k++) {
      window[k] = 0.5 * (1.0 - Math.cos((2.0 * Math.PI * k) / (grainSize - 1)));
    }

    const maxHops = Math.floor((outCount - grainSize) / hopSize);
    for (let h = 0; h < maxHops; h++) {
      const outPos = h * hopSize;
      const srcCenter = outPos;
      const srcStart = Math.max(0, Math.min(srcSamples.length - grainSize, Math.round(srcCenter)));

      for (let i = 0; i < grainSize; i++) {
        const grainIdx = (i - grainSize / 2) * pitchFactor + grainSize / 2;
        let s = 0;
        if (grainIdx >= 0 && grainIdx < grainSize - 1) {
          const i0 = Math.floor(grainIdx);
          const i1 = i0 + 1;
          const frac = grainIdx - i0;
          const p0 = srcStart + i0;
          const p1 = srcStart + i1;
          const s0 = p0 < srcSamples.length ? srcSamples[p0] : 0;
          const s1 = p1 < srcSamples.length ? srcSamples[p1] : 0;
          s = s0 + frac * (s1 - s0);
        }
        outSamples[outPos + i] += s * window[i];
      }
    }

    // High shelf / low pass filtering
    const f0 = 220;
    const Q = 1.2;
    const gainDb = 3.5 * warmth;
    const A = Math.pow(10, gainDb / 40);
    const w0 = (2 * Math.PI * f0) / sampleRate;
    const alpha = Math.sin(w0) / (2 * Q);

    const b0 = 1 + alpha * A;
    const b1 = -2 * Math.cos(w0);
    const b2 = 1 - alpha * A;
    const a0 = 1 + alpha / A;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha / A;

    const fHigh = 5500;
    const w0H = (2 * Math.PI * fHigh) / sampleRate;
    const alphaHigh = Math.sin(w0H) / (2 * 0.707);
    const b0H = (1 + Math.cos(w0H)) / 2;
    const b1H = -(1 + Math.cos(w0H));
    const b2H = (1 + Math.cos(w0H)) / 2;

    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    let hx1 = 0, hx2 = 0, hy1 = 0, hy2 = 0;

    const processedSamples = new Int16Array(outCount);

    for (let i = 0; i < outCount; i++) {
      const x0 = outSamples[i];
      const y0 = (b0 / a0) * x0 + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
      x2 = x1; x1 = x0;
      y2 = y1; y1 = y0;

      const subIdx = Math.floor(i * 0.5);
      const subSample = (subIdx < outCount ? outSamples[subIdx] : 0) * (0.35 * effectiveWeight);
      const clarity = (b0H * x0 + b1H * hx1 + b2H * hx2 - b1H * hy1 - b2H * hy2) * 0.15;
      hx2 = hx1; hx1 = x0;
      hy2 = hy1; hy1 = clarity;

      let mixed = (y0 * 1.10) + subSample + clarity;
      mixed = Math.tanh(mixed * 1.15) / 1.15;

      processedSamples[i] = Math.max(-32768, Math.min(32767, Math.round(mixed * 32767)));
    }

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

    const tempProcWav = path.join(tmpDir, `${id}_proc.wav`);
    fs.writeFileSync(tempProcWav, processedWav);
    execSync(`afconvert "${tempProcWav}" "${m4aPath}" -f m4af -d aac`, { timeout: 6000 });
    try { fs.unlinkSync(tempProcWav); } catch {}

    const m4aBuf = fs.readFileSync(m4aPath);
    try { fs.unlinkSync(m4aPath); } catch {}

    return { buffer: m4aBuf, contentType: 'audio/mp4' };
  } catch (err) {
    console.warn(`Melodic voice error (${lang}):`, err?.message || err);
    return null;
  }
}

/**
 * Executes isolated Node runner for EdgeTTS with natural cadence
 */
export function generateEdgeTts(text, voice, pitch, rate) {
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
 * Master synthesis function that produces an audio buffer using the best available engine.
 * Never throws connection refused errors, works entirely in-process on any port.
 */
export async function synthesizeSpeechBuffer({
  text,
  lang = 'ja',
  gender = 'female',
  voice = '',
  pitch = '',
  rate = '',
  model = '',
  ageStyle = '',
  personality = '',
  speechMode = 'natural_conversation',
  emotion = 'reassuring',
  vocalWeight = null,
  pitchFactor = null
}) {
  if (!text || !text.trim()) {
    return null;
  }

  const langKey = VOICE_CONFIG[lang] ? lang : (lang === 'ko' ? 'ko' : 'ja');
  const cfg = (gender === 'male') ? VOICE_CONFIG[langKey].male : VOICE_CONFIG[langKey].female;
  const selectedVoice = voice || cfg.voice;
  const selectedPitch = pitch || cfg.pitch;
  const selectedRate  = rate  || cfg.rate;
  const explicitPitch = pitchFactor !== null ? parseFloat(pitchFactor) : null;
  const numericWeight = vocalWeight !== null ? parseFloat(vocalWeight) : null;

  // 1. Primary Engine: Ultra-Realistic Neural Models (Korean & Japanese)
  if (lang === 'ja' || lang === 'ko') {
    const neuralResult = await generateNeuralSpeech(text, lang, gender, {
      voice: selectedVoice,
      model,
      pitch: selectedPitch,
      rate: selectedRate,
      ageStyle,
      personality,
      speechMode,
      emotion,
      vocalWeight: numericWeight,
      pitchFactor: explicitPitch
    });
    if (neuralResult && neuralResult.buffer && neuralResult.buffer.length > 0) {
      return neuralResult;
    }

    // Secondary Fallback: Melodic DSP Engine
    const melodicResult = await generateMelodicVoice(text, lang, gender, selectedVoice, selectedPitch, selectedRate, model, {
      ageStyle,
      personality,
      speechMode,
      emotion,
      vocalWeight: numericWeight,
      pitchFactor: explicitPitch
    });
    if (melodicResult && melodicResult.buffer && melodicResult.buffer.length > 0) {
      return melodicResult;
    }
  }

  // 2. Edge TTS synthesis for other languages or fallback
  try {
    const audioBuffer = await generateEdgeTts(text, selectedVoice, selectedPitch, selectedRate);
    if (audioBuffer && audioBuffer.length > 0) {
      return {
        buffer: audioBuffer,
        contentType: 'audio/mpeg',
        provider: 'edge-tts'
      };
    }
  } catch (edgeErr) {
    console.warn('Edge TTS synthesis fallback to Google:', edgeErr?.message || edgeErr);
  }

  // 3. Fallback: Google Translate TTS
  try {
    const encoded = encodeURIComponent(text);
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=gtx`;
    const res = await fetch(googleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
        'Accept': 'audio/mpeg, audio/mp3, audio/*',
      },
    });

    if (res.ok) {
      const audioBuffer = await res.arrayBuffer();
      return {
        buffer: Buffer.from(audioBuffer),
        contentType: 'audio/mpeg',
        provider: 'google-tts'
      };
    }
  } catch (googleErr) {
    console.error('Google TTS fallback error:', googleErr);
  }

  return null;
}
