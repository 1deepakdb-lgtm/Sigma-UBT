import { spawn } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

// Verified High-Fidelity Microsoft Neural Voices — Genuine, Polite, and Human
const VOICE_CONFIG = {
  ko: {
    female: { voice: 'ko-KR-SunHiNeural',       pitch: '+0Hz', rate: '-6%' }, // SunHi: warm, polite, natural Korean female
    male:   { voice: 'ko-KR-InJoonNeural',      pitch: '+0Hz', rate: '-6%' }, // InJoon: deep, polite, natural Korean male
  },
  en: {
    female: { voice: 'en-US-JennyNeural',        pitch: '+0Hz', rate: '-5%' }, // Jenny: friendly, clear, natural US female
    male:   { voice: 'en-US-ChristopherNeural',  pitch: '+0Hz', rate: '-5%' }, // Christopher: polite, natural, smooth US male
  },
  ne: {
    female: { voice: 'ne-NP-HemkalaNeural',      pitch: '+0Hz', rate: '-6%' }, // Hemkala: polite, respectful Nepali female
    male:   { voice: 'ne-NP-SagarNeural',        pitch: '+0Hz', rate: '-6%' }, // Sagar: clear, respectful Nepali male
  },
};

/**
 * Executes isolated Node runner for EdgeTTS with natural cadence and smooth delivery
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
    }, 12000);

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
 * GET /api/tts?text=안녕&lang=ko&gender=female
 * Serves premium human neural voices with smooth cadence.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '';
  const lang = searchParams.get('lang') || 'ko';
  const gender = searchParams.get('gender') || 'female';

  if (!text.trim()) {
    return new Response('Missing text parameter', { status: 400 });
  }

  const isDownload = searchParams.get('download') === 'true';
  const cleanName = (text.slice(0, 30).replace(/[^a-zA-Z0-9_\-\u0900-\u097F\uAC00-\uD7AF]/g, '_') || 'speech');
  const filename = searchParams.get('filename') || `${cleanName}_${lang}_${gender}.mp3`;
  const disposition = isDownload ? `attachment; filename="${encodeURIComponent(filename)}"` : `inline; filename="${encodeURIComponent(filename)}"`;

  // 1. Generate smooth human neural audio
  try {
    const langKey = VOICE_CONFIG[lang] ? lang : 'ko';
    const cfg = (gender === 'male') ? VOICE_CONFIG[langKey].male : VOICE_CONFIG[langKey].female;
    let selectedVoice = searchParams.get('voice') || cfg.voice;
    const selectedPitch = searchParams.get('pitch') || cfg.pitch;
    const selectedRate  = searchParams.get('rate')  || cfg.rate;

    // Strict validation to guarantee Male has genuine Male voice and Female has genuine Female voice
    const MALE_VOICES = new Set([
      'ko-KR-InJoonNeural',
      'ko-KR-HyunsuMultilingualNeural',
      'ne-NP-SagarNeural',
      'en-US-ChristopherNeural',
      'en-US-AndrewMultilingualNeural',
      'en-US-BrianMultilingualNeural',
      'en-AU-WilliamMultilingualNeural'
    ]);
    const FEMALE_VOICES = new Set([
      'ko-KR-SunHiNeural',
      'ne-NP-HemkalaNeural',
      'en-US-JennyNeural',
      'en-US-AvaMultilingualNeural',
      'en-US-EmmaMultilingualNeural'
    ]);

    if (gender === 'male' && !MALE_VOICES.has(selectedVoice)) {
      selectedVoice = cfg.voice;
    } else if (gender === 'female' && !FEMALE_VOICES.has(selectedVoice)) {
      selectedVoice = cfg.voice;
    }

    // Ensure language compatibility so Edge TTS never errors on language mismatch
    if (langKey === 'ne' && !selectedVoice.startsWith('ne-')) {
      selectedVoice = cfg.voice;
    } else if (langKey === 'en' && !selectedVoice.startsWith('en-')) {
      selectedVoice = cfg.voice;
    }

    const audioBuffer = await generateEdgeTts(text, selectedVoice, selectedPitch, selectedRate);

    if (audioBuffer && audioBuffer.length > 0) {
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'Content-Disposition': disposition,
          'Content-Length': String(audioBuffer.byteLength),
        },
      });
    }
  } catch (edgeErr) {
    console.warn('Edge TTS synthesis fallback to Google:', edgeErr?.message || edgeErr);
  }

  // 2. Seamless fallback to Google Translate TTS
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
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'Content-Disposition': disposition,
          'Content-Length': String(audioBuffer.byteLength),
        },
      });
    }
  } catch (googleErr) {
    console.error('Google TTS fallback error:', googleErr);
  }

  return new Response('TTS unavailable', { status: 502 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const text = body.text || '';
    const lang = body.lang || 'ko';
    const gender = body.gender || 'female';

    if (!text.trim()) {
      return new Response('Missing text parameter', { status: 400 });
    }

    const url = new URL(request.url);
    url.searchParams.set('text', text);
    url.searchParams.set('lang', lang);
    url.searchParams.set('gender', gender);

    return GET(new Request(url.toString(), { method: 'GET' }));
  } catch (err) {
    return new Response('Invalid JSON body', { status: 400 });
  }
}
