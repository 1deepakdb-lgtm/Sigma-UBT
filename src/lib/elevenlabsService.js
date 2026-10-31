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
      pitchFactor: categoryMeta.pitchFactor ?? ''
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
  customVoiceId = null,
  modelId = DEFAULT_MODEL_ID,
  style = 'natural_conversation',
  speechMode = null,
  ageStyle = null,
  personality = null,
  emotion = null,
  weight = null,
  pitchFactor = null,
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

  const profile = getVoiceProfile(voiceProfileId);
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
    pitch: profile.pitch || '+0Hz',
    rate: profile.rate || '+0%',
    voice: profile.voice || ''
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

  // 4. Check for ElevenLabs API Key
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_ELEVENLABS_API_KEY') {
    console.info('ELEVENLABS_API_KEY not configured. Seamlessly activating local studio audio engine.');
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
        warning: 'ELEVENLABS_API_KEY is not set in .env. Served via native high-fidelity audio engine.'
      };
    }
    throw new Error('ELEVENLABS_API_KEY not configured and fallback unavailable.');
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify(bodyPayload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`ElevenLabs API error (${response.status}):`, errorBody);

    // If quota exhausted or rate limited, gracefully serve fallback
    if (response.status === 401 || response.status === 429 || errorBody.includes('quota')) {
      const fallback = await fallbackSynthesis(naturalized, lang, profile.gender, categoryMeta);
      if (fallback) {
        return {
          ...fallback,
          cached: false,
          warning: `ElevenLabs quota or authorization notice: ${response.status}. Served via fallback engine.`
        };
      }
    }

    throw new Error(`ElevenLabs API returned ${response.status}: ${errorBody}`);
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
 * Synthesizes Multi-Speaker Dialogue
 * Takes an array of turns: [{ speaker: 'A', text: '...', voiceProfileId: 'ko-female-1' }, ...]
 * Returns a unified conversation audio buffer.
 */
export async function synthesizeDialogue({ turns, modelId = DEFAULT_MODEL_ID, style = 'natural_conversation' }) {
  if (!Array.isArray(turns) || turns.length === 0) {
    throw new Error('Dialogue turns must be a non-empty array.');
  }

  if (turns.length > 20) {
    throw new Error('Dialogue cannot exceed 20 conversation turns per generation.');
  }

  // Synthesize each turn with individual speaker voice profiles
  const audioBuffers = [];

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    if (!turn.text || !turn.text.trim()) continue;

    const res = await synthesizeElevenLabs({
      text: turn.text,
      voiceProfileId: turn.voiceProfileId || (turn.speaker === 'B' ? 'ko-male-2' : 'ko-female-1'),
      modelId,
      style: turn.style || style
    });

    audioBuffers.push(res.buffer);

    // Add a natural 350ms acoustic silence gap between turns
    if (i < turns.length - 1) {
      // 350ms of silent MP3 frame padding
      const silenceBytes = Buffer.alloc(1400); // Approximate MP3 silence padding
      audioBuffers.push(silenceBytes);
    }
  }

  const combined = Buffer.concat(audioBuffers);
  return {
    buffer: combined,
    contentType: 'audio/mpeg',
    turnCount: audioBuffers.length,
    provider: 'elevenlabs-dialogue'
  };
}
