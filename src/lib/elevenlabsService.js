import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getVoiceProfile, DEFAULT_MODEL_ID, SPEAKING_STYLES } from './elevenlabsConfig.js';
import { naturalizeText } from './phoneticNaturalizer.js';

const CACHE_DIR = path.join(process.cwd(), 'public', 'audio-cache', 'elevenlabs');

// Ensure cache directory exists
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not initialize ElevenLabs cache directory:', e.message);
}

/**
 * Generate a deterministic hash for cache keying
 */
function computeCacheKey(text, voiceId, modelId, settings, categoryMeta = {}) {
  const payload = JSON.stringify({
    version: 'v4_distinct_models',
    text: text.trim(),
    voiceId,
    modelId,
    settings: {
      stability: settings.stability,
      similarity_boost: settings.similarity_boost,
      style: settings.style,
      use_speaker_boost: settings.use_speaker_boost,
      speed: settings.speed || 1.0
    },
    categories: {
      ageStyle: categoryMeta.ageStyle || '',
      personality: categoryMeta.personality || '',
      speechMode: categoryMeta.speechMode || '',
      emotion: categoryMeta.emotion || '',
      weight: categoryMeta.weight ?? '',
      pitchFactor: categoryMeta.pitchFactor ?? '',
      model: categoryMeta.model || '',
      pitch: categoryMeta.pitch || '',
      rate: categoryMeta.rate || '',
      voice: categoryMeta.voice || ''
    }
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

import { synthesizeSpeechBuffer } from './nativeTtsService.js';

/**
 * High-fidelity fallback synthesis when ElevenLabs API key is missing or quota is exhausted
 */
async function fallbackSynthesis(text, lang, gender, options = {}) {
  try {
    const result = await synthesizeSpeechBuffer({
      text,
      lang: lang || 'ko',
      gender: gender || 'female',
      ageStyle: options.ageStyle,
      personality: options.personality,
      speechMode: options.speechMode,
      emotion: options.emotion,
      vocalWeight: options.weight,
      pitchFactor: options.pitchFactor,
      model: options.model,
      modelId: options.modelId,
      pitch: options.pitch,
      rate: options.rate,
      voice: options.voice
    });

    if (result && result.buffer && result.buffer.length > 0) {
      return {
        buffer: result.buffer,
        contentType: result.contentType || 'audio/mpeg',
        provider: result.provider || 'fallback-studio',
        isFallback: true
      };
    }
  } catch (err) {
    console.warn('Fallback synthesis failed:', err.message);
  }
  return null;
}

/**
 * Synthesize speech using ElevenLabs Text-to-Speech API
 * With intelligent disk caching, natural pause insertion, and cost control.
 */
export async function synthesizeElevenLabs({
  text,
  voiceProfileId = 'ko-female-1',
  gender = null,
  customVoiceId = null,
  modelId = DEFAULT_MODEL_ID,
  style = 'natural_conversation',
  speechMode = null,
  ageStyle = null,
  personality = null,
  emotion = null,
  weight = null,
  pitchFactor = null,
  pitch = null,
  rate = null,
  voice = null,
  customSettings = null,
  speed = 1.0
}) {
  if (!text || !text.trim()) {
    throw new Error('Text parameter is required.');
  }

  // Maximum characters per request for security & cost control
  if (text.length > 2500) {
    throw new Error('Text exceeds 2500 character limit for single generation.');
  }

  // Strictly enforce male vs female separation
  let resolvedVoiceProfileId = voiceProfileId;
  const isFemaleId = /(?:^|[-_])female(?:[-_\d]|$)/i.test(resolvedVoiceProfileId);
  const isMaleId = !isFemaleId && /(?:^|[-_])male(?:[-_\d]|$)/i.test(resolvedVoiceProfileId);

  if (gender === 'male' && isFemaleId) {
    resolvedVoiceProfileId = resolvedVoiceProfileId.replace(/female/gi, 'male');
  } else if (gender === 'female' && isMaleId) {
    resolvedVoiceProfileId = resolvedVoiceProfileId.replace(/male/gi, 'female');
  }

  const profile = getVoiceProfile(resolvedVoiceProfileId);
  const voiceId = customVoiceId || profile.defaultVoiceId;
  const lang = profile.language || 'ko';
  const effectiveMode = speechMode || style || 'natural_conversation';

  // 1. Naturalize text for human rhythm, speech mode punctuation, and emotional tone
  const naturalized = naturalizeText(text, lang, effectiveMode, emotion);

  // 2. Resolve settings based on speaking style and individual voice profile
  const styleConfig = SPEAKING_STYLES[effectiveMode] || SPEAKING_STYLES.natural_conversation;
  const resolvedSettings = {
    stability: customSettings?.stability ?? profile.settings.stability ?? styleConfig.stability,
    similarity_boost: customSettings?.similarity_boost ?? profile.settings.similarity_boost ?? styleConfig.similarity_boost,
    style: customSettings?.style ?? profile.settings.style ?? styleConfig.style,
    use_speaker_boost: customSettings?.use_speaker_boost ?? profile.settings.use_speaker_boost ?? true,
    speed: customSettings?.speed ?? speed ?? styleConfig.speed ?? 1.0
  };

  const categoryMeta = {
    ageStyle: ageStyle || profile.ageStyle,
    personality: personality || profile.personality,
    speechMode: effectiveMode,
    emotion: emotion || 'natural',
    weight: weight !== null ? weight : profile.baseVocalWeight,
    pitchFactor: pitchFactor !== null ? pitchFactor : profile.basePitchFactor,
    model: profile.id,
    modelId: modelId,
    pitch: pitch || profile.pitch || '+0Hz',
    rate: rate || profile.rate || '+0%',
    voice: voice || profile.voice || ''
  };

  // 3. Check disk cache
  const cacheKey = computeCacheKey(naturalized, voiceId, modelId, resolvedSettings, categoryMeta);
  const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.mp3`);

  if (fs.existsSync(cacheFilePath)) {
    try {
      const cachedBuffer = fs.readFileSync(cacheFilePath);
      if (cachedBuffer.length > 0) {
        return {
          buffer: cachedBuffer,
          contentType: 'audio/mpeg',
          cached: true,
          provider: 'elevenlabs',
          cacheKey
        };
      }
    } catch (readErr) {
      console.warn('Error reading cached audio file:', readErr.message);
    }
  }

  // 4. Check for Neural Studio HD override or ElevenLabs API Key
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (modelId === 'neural_studio_hd' || !apiKey || apiKey === 'YOUR_ELEVENLABS_API_KEY') {
    if (modelId !== 'neural_studio_hd') {
      console.info('ELEVENLABS_API_KEY not configured. Seamlessly activating local studio audio engine.');
    }
    const fallback = await fallbackSynthesis(naturalized, lang, profile.gender, categoryMeta);
    if (fallback) {
      try {
        fs.writeFileSync(cacheFilePath, fallback.buffer);
      } catch (writeErr) {
        console.warn('Failed to write audio cache:', writeErr.message);
      }
      return {
        ...fallback,
        cached: false,
        warning: modelId === 'neural_studio_hd' ? null : 'ELEVENLABS_API_KEY is not set in .env. Served via native high-fidelity audio engine.'
      };
    }
    throw new Error('Audio engine unavailable. Please try again.');
  }

  // 5. Call ElevenLabs API
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const bodyPayload = {
    text: naturalized,
    model_id: modelId,
    voice_settings: {
      stability: resolvedSettings.stability,
      similarity_boost: resolvedSettings.similarity_boost,
      style: resolvedSettings.style,
      use_speaker_boost: resolvedSettings.use_speaker_boost
    }
  };

  // 5. Call ElevenLabs API with AbortController timeout & complete fallback
  let response = null;
  const abortCtrl = new AbortController();
  const timeoutId = setTimeout(() => abortCtrl.abort(), 4000);

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(bodyPayload),
      signal: abortCtrl.signal
    });
  } catch (netErr) {
    console.warn(`ElevenLabs API fetch notice: ${netErr.message}. Gracefully switching to native engine.`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response || !response.ok) {
    if (response) {
      try {
        const errorBody = await response.text();
        console.warn(`ElevenLabs API returned ${response.status}: ${errorBody}. Gracefully activating fallback.`);
      } catch (e) {}
    }
    const fallback = await fallbackSynthesis(naturalized, lang, profile.gender, categoryMeta);
    if (fallback) {
      try {
        fs.writeFileSync(cacheFilePath, fallback.buffer);
      } catch (writeErr) {}
      return {
        ...fallback,
        cached: false,
        warning: `Served via high-fidelity native audio engine.`
      };
    }
    throw new Error('Audio engine unavailable. Please try again.');
  }

  const audioArrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(audioArrayBuffer);

  // 6. Save to cache
  try {
    fs.writeFileSync(cacheFilePath, audioBuffer);
  } catch (writeErr) {
    console.warn('Failed to write audio cache:', writeErr.message);
  }

  return {
    buffer: audioBuffer,
    contentType: 'audio/mpeg',
    cached: false,
    provider: 'elevenlabs',
    cacheKey
  };
}

/**
 * Strips ID3v2 tags from subsequent MP3 buffers to ensure
 * clean, contiguous MPEG frames without decoder interruption.
 */
function stripId3Header(buffer) {
  if (!buffer || buffer.length < 10) return buffer;
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    const size = ((buffer[6] & 0x7f) << 21) |
                 ((buffer[7] & 0x7f) << 14) |
                 ((buffer[8] & 0x7f) << 7)  |
                 (buffer[9] & 0x7f);
    const tagSize = 10 + size;
    if (tagSize < buffer.length) {
      return buffer.subarray(tagSize);
    }
  }
  return buffer;
}

/**
 * Synthesizes Multi-Speaker Dialogue
 * Takes an array of turns: [{ speaker: 'A', text: '...', voiceProfileId: 'ko-female-1', modelId: '...' }, ...]
 * Returns a unified conversation audio buffer.
 */
export async function synthesizeDialogue({ turns, modelId = DEFAULT_MODEL_ID, style = 'natural_conversation' }) {
  if (!Array.isArray(turns) || turns.length === 0) {
    throw new Error('Dialogue turns must be a non-empty array.');
  }

  if (turns.length > 25) {
    throw new Error('Dialogue cannot exceed 25 conversation turns per generation.');
  }

  // Synthesize each turn concurrently in parallel for maximum speed & reliability
  const turnPromises = turns.map(async (turn, i) => {
    if (!turn.text || !turn.text.trim()) return null;

    const voiceProfId = turn.voiceProfileId || (turn.speaker === 'B' ? 'ko-male-2' : 'ko-female-1');
    const voiceProf = getVoiceProfile(voiceProfId);
    let buf = null;

    try {
      const res = await synthesizeElevenLabs({
        text: turn.text,
        voiceProfileId: voiceProfId,
        gender: turn.gender || voiceProf?.gender || (turn.speaker === 'A' ? 'female' : 'male'),
        modelId: turn.modelId || modelId,
        style: turn.style || style,
        pitch: turn.pitch || voiceProf?.pitch || '+0Hz',
        rate: turn.rate || voiceProf?.rate || '+0%',
        voice: turn.voice || voiceProf?.voice || ''
      });
      if (res && res.buffer && res.buffer.length > 0) {
        buf = res.buffer;
      }
    } catch (turnErr) {
      console.warn(`Turn ${i} ElevenLabs synthesis notice: ${turnErr.message}, activating native engine`);
    }

    if (!buf) {
      try {
        const isMale = voiceProf?.gender === 'male' || (turn.speaker === 'B' && (!voiceProf || voiceProf.gender !== 'female'));
        const fallback = await synthesizeSpeechBuffer({
          text: turn.text,
          lang: voiceProf?.language || 'ko',
          gender: isMale ? 'male' : 'female',
          model: voiceProfId,
          modelId: turn.modelId || modelId,
          voice: turn.voice || voiceProf?.voice || '',
          pitch: turn.pitch || voiceProf?.pitch || '+0Hz',
          rate: turn.rate || voiceProf?.rate || '+0%',
          ageStyle: voiceProf?.ageStyle,
          personality: voiceProf?.personality,
          speechMode: voiceProf?.defaultSpeechMode || 'natural_conversation',
          emotion: voiceProf?.defaultEmotion || 'reassuring',
          vocalWeight: voiceProf?.baseVocalWeight,
          pitchFactor: voiceProf?.basePitchFactor
        });
        if (fallback && fallback.buffer && fallback.buffer.length > 0) {
          buf = fallback.buffer;
        }
      } catch (fbErr) {
        console.warn(`Turn ${i} native fallback notice: ${fbErr.message}`);
      }
    }

    return buf;
  });

  const resolvedBuffers = await Promise.all(turnPromises);
  const audioBuffers = [];
  const validBuffers = resolvedBuffers.filter(Boolean);

  for (let i = 0; i < validBuffers.length; i++) {
    const cleanBuf = i === 0 ? validBuffers[i] : stripId3Header(validBuffers[i]);
    audioBuffers.push(cleanBuf);
  }

  if (audioBuffers.length === 0) {
    throw new Error('Could not synthesize any dialogue turns. Please check input text.');
  }

  const combined = Buffer.concat(audioBuffers);
  return {
    buffer: combined,
    contentType: 'audio/mpeg',
    turnCount: audioBuffers.length,
    provider: 'merged-dialogue'
  };
}
