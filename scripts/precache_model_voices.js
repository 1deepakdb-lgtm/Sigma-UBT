import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { AVAILABLE_MODELS, MODEL_SAMPLE_SPEECH, VOICE_PROFILES, SPEAKING_STYLES } from '../src/lib/elevenlabsConfig.js';
import { naturalizeText } from '../src/lib/phoneticNaturalizer.js';
import { MODEL_VOICE_TONES, AI_MODEL_ACOUSTIC_PROFILES } from '../src/lib/nativeTtsService.js';

const CACHE_DIR = path.join(process.cwd(), 'public', 'audio-cache', 'elevenlabs');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

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
      pitchFactor: categoryMeta.pitchFactor ?? '',
      model: categoryMeta.model || '',
      pitch: categoryMeta.pitch || '',
      rate: categoryMeta.rate || '',
      voice: categoryMeta.voice || ''
    }
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function runTtsEngine(text, voice, pitch, rate, destFile) {
  const scriptPath = path.join(process.cwd(), 'scripts', 'tts_engine.py');
  const tmpOut = path.join(CACHE_DIR, `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.mp3`);
  
  try {
    execFileSync('python3', [scriptPath, text, voice, pitch, rate, tmpOut], {
      timeout: 15000,
      env: {
        ...process.env,
        PYTHONPATH: `${path.join(process.cwd(), 'scripts', 'vendor')}:${process.env.PYTHONPATH || ''}`
      }
    });

    if (fs.existsSync(tmpOut) && fs.statSync(tmpOut).size > 500) {
      fs.copyFileSync(tmpOut, destFile);
      try { fs.unlinkSync(tmpOut); } catch {}
      return true;
    }
  } catch (err) {
    console.error(`  TTS Engine error for ${voice} (${pitch}, ${rate}):`, err.message);
  }
  try { if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut); } catch {}
  return false;
}

async function precacheAll() {
  console.log('🚀 Starting Bulletproof Pre-cache Generation for All Models and Voices...');

  // 1. Model Audition Audio (Female and Male separately for all 7 models in Korean & Japanese)
  console.log('\n--- 1. Generating Model Auditions (28 Distinct Model Audio Files) ---');
  for (const model of AVAILABLE_MODELS) {
    for (const lang of ['ko', 'ja']) {
      for (const gender of ['female', 'male']) {
        const text = MODEL_SAMPLE_SPEECH[model.id]?.[lang]?.[gender];
        if (!text) continue;

        const defaultProfileId = lang === 'ja'
          ? (gender === 'male' ? 'ja-male-1' : 'ja-female-1')
          : (gender === 'male' ? 'ko-male-1' : 'ko-female-1');

        const profile = VOICE_PROFILES.find(p => p.id === defaultProfileId);
        const naturalized = naturalizeText(text, lang, 'natural_conversation', 'natural');

        // Resolve voice & pitch
        const acoustic = AI_MODEL_ACOUSTIC_PROFILES[model.id]?.[lang]?.[gender];
        const voice = acoustic?.voice || (lang === 'ja' ? (gender === 'male' ? 'ja-JP-KeitaNeural' : 'ja-JP-NanamiNeural') : (gender === 'male' ? 'ko-KR-InJoonNeural' : 'ko-KR-SunHiNeural'));
        const pitch = acoustic?.pitchOffset ? (acoustic.pitchOffset >= 0 ? `+${acoustic.pitchOffset}Hz` : `${acoustic.pitchOffset}Hz`) : '+0Hz';
        const rate = acoustic?.rateOffset ? (acoustic.rateOffset >= 0 ? `+${acoustic.rateOffset}%` : `${acoustic.rateOffset}%`) : '+0%';

        const namedFile = path.join(CACHE_DIR, `model_${model.id}_${lang}_${gender}.mp3`);
        
        // Compute SHA-256 hash as used by API route
        const styleConfig = SPEAKING_STYLES.natural_conversation;
        const resolvedSettings = {
          stability: styleConfig.stability,
          similarity_boost: styleConfig.similarity_boost,
          style: styleConfig.style,
          use_speaker_boost: true,
          speed: 1.0
        };
        const categoryMeta = {
          ageStyle: profile?.ageStyle || '',
          personality: profile?.personality || '',
          speechMode: 'natural_conversation',
          emotion: 'natural',
          weight: profile?.baseVocalWeight ?? '',
          pitchFactor: profile?.basePitchFactor ?? '',
          model: defaultProfileId,
          modelId: model.id,
          pitch: profile?.pitch || '+0Hz',
          rate: profile?.rate || '+0%',
          voice: profile?.voice || ''
        };
        const hash = computeCacheKey(naturalized, profile?.defaultVoiceId || 'custom', model.id, resolvedSettings, categoryMeta);
        const hashedFile = path.join(CACHE_DIR, `${hash}.mp3`);

        if (fs.existsSync(namedFile) && fs.statSync(namedFile).size > 500) {
          console.log(`  ✓ Already cached: model_${model.id}_${lang}_${gender}.mp3`);
          if (!fs.existsSync(hashedFile)) {
            fs.copyFileSync(namedFile, hashedFile);
          }
        } else {
          console.log(`  🎙️ Generating model_${model.id}_${lang}_${gender}.mp3 (${voice}, ${pitch}, ${rate})...`);
          const ok = runTtsEngine(naturalized, voice, pitch, rate, namedFile);
          if (ok) {
            fs.copyFileSync(namedFile, hashedFile);
            console.log(`     Saved ${fs.statSync(namedFile).size} bytes`);
          }
        }
      }
    }
  }

  // 2. Voice Profiles baseline & key model combinations (Speaker A & B audition)
  console.log('\n--- 2. Generating Voice Profile Auditions (32 Profiles x Models) ---');
  for (const profile of VOICE_PROFILES) {
    if (!profile.sampleSentence) continue;
    const lang = profile.language || (profile.id.startsWith('ko') ? 'ko' : 'ja');
    const isMale = profile.gender === 'male';
    const naturalized = naturalizeText(profile.sampleSentence, lang, profile.defaultSpeechMode || 'teacher', profile.defaultEmotion || 'reassuring');

    // Generate for all 7 models so any model selected in Speaker A / Speaker B plays instantly
    for (const model of AVAILABLE_MODELS) {
      const namedFile = path.join(CACHE_DIR, `${profile.id}_${model.id}.mp3`);
      const defaultFile = path.join(CACHE_DIR, `${profile.id}_default.mp3`);

      // Resolve acoustic profile
      const tone = MODEL_VOICE_TONES[profile.id];
      const acoustic = AI_MODEL_ACOUSTIC_PROFILES[model.id]?.[lang]?.[isMale ? 'male' : 'female'];
      const voice = acoustic?.voice || tone?.voice || (lang === 'ja' ? (isMale ? 'ja-JP-KeitaNeural' : 'ja-JP-NanamiNeural') : (isMale ? 'ko-KR-InJoonNeural' : 'ko-KR-SunHiNeural'));

      let basePitchHz = 0;
      if (tone?.pitch) {
        const m = tone.pitch.match(/([+-]?\d+)/);
        if (m) basePitchHz = parseInt(m[1], 10);
      }
      const totalPitchHz = basePitchHz + (acoustic?.pitchOffset || 0);
      const pitchStr = totalPitchHz >= 0 ? `+${totalPitchHz}Hz` : `${totalPitchHz}Hz`;

      let baseRatePct = 0;
      if (tone?.rate) {
        const m = tone.rate.match(/([+-]?\d+)/);
        if (m) baseRatePct = parseInt(m[1], 10);
      }
      const totalRatePct = baseRatePct + (acoustic?.rateOffset || 0);
      const rateStr = totalRatePct >= 0 ? `+${totalRatePct}%` : `${totalRatePct}%`;

      // Hashed file
      const styleConfig = SPEAKING_STYLES[profile.defaultSpeechMode || 'teacher'] || SPEAKING_STYLES.natural_conversation;
      const resolvedSettings = {
        stability: profile.settings?.stability ?? styleConfig.stability,
        similarity_boost: profile.settings?.similarity_boost ?? styleConfig.similarity_boost,
        style: profile.settings?.style ?? styleConfig.style,
        use_speaker_boost: true,
        speed: profile.settings?.speed || 0.96
      };
      const categoryMeta = {
        ageStyle: profile.ageStyle || '',
        personality: profile.personality || '',
        speechMode: profile.defaultSpeechMode || 'teacher',
        emotion: profile.defaultEmotion || 'reassuring',
        weight: profile.baseVocalWeight ?? '',
        pitchFactor: profile.basePitchFactor ?? '',
        model: profile.id,
        modelId: model.id,
        pitch: profile.pitch || '+0Hz',
        rate: profile.rate || '+0%',
        voice: profile.voice || ''
      };
      const hash = computeCacheKey(naturalized, profile.defaultVoiceId || 'custom', model.id, resolvedSettings, categoryMeta);
      const hashedFile = path.join(CACHE_DIR, `${hash}.mp3`);

      if (fs.existsSync(namedFile) && fs.statSync(namedFile).size > 500) {
        if (!fs.existsSync(hashedFile)) fs.copyFileSync(namedFile, hashedFile);
        if (model.id === 'eleven_multilingual_v2' && !fs.existsSync(defaultFile)) {
          fs.copyFileSync(namedFile, defaultFile);
        }
      } else {
        console.log(`  🗣️ Generating ${profile.id} with ${model.id} (${voice}, ${pitchStr}, ${rateStr})...`);
        const ok = runTtsEngine(naturalized, voice, pitchStr, rateStr, namedFile);
        if (ok) {
          fs.copyFileSync(namedFile, hashedFile);
          if (model.id === 'eleven_multilingual_v2' || !fs.existsSync(defaultFile)) {
            fs.copyFileSync(namedFile, defaultFile);
          }
        }
      }
    }
  }

  console.log('\n🎉 Pre-cache Generation Complete! Total files in cache:', fs.readdirSync(CACHE_DIR).length);
}

precacheAll().catch(console.error);
