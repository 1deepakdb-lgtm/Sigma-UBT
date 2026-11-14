import { synthesizeElevenLabs } from '@/lib/elevenlabsService';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ─── Rate Limiter (in-memory, per IP) ─────────────────────────────────────────
const ELEVENLABS_RATE_LIMIT = 45; // max requests per minute
const ELEVENLABS_RATE_WINDOW = 60 * 1000;
const rateStore = new Map();

function checkRateLimit(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const key = `el:${ip}`;
  const now = Date.now();
  const record = rateStore.get(key) || { calls: [] };
  record.calls = record.calls.filter((t) => now - t < ELEVENLABS_RATE_WINDOW);
  if (record.calls.length >= ELEVENLABS_RATE_LIMIT) {
    return { limited: true };
  }
  record.calls.push(now);
  rateStore.set(key, record);
  return { limited: false };
}

export async function GET(request) {
  try {
    if (checkRateLimit(request).limited) {
      return new Response('Too many requests. Please wait a moment before generating more speech.', { status: 429 });
    }

    const session = await getSessionUser(request);
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || '';
    const voiceProfileId = searchParams.get('voiceProfileId') || 'ko-female-1';
    const reqGender = searchParams.get('gender') || null;
    const modelId = searchParams.get('modelId') || null;
    const style = searchParams.get('style') || 'natural_conversation';
    const speed = parseFloat(searchParams.get('speed') || '1.0');
    const customVoiceId = searchParams.get('voiceId') || null;

    const ageStyle = searchParams.get('ageStyle') || null;
    const personality = searchParams.get('personality') || null;
    const speechMode = searchParams.get('speechMode') || null;
    const emotion = searchParams.get('emotion') || null;
    const weight = searchParams.get('weight') !== null ? parseFloat(searchParams.get('weight')) : null;
    const pitchFactor = searchParams.get('pitchFactor') !== null ? parseFloat(searchParams.get('pitchFactor')) : null;
    const pitch = searchParams.get('pitch') || null;
    const rate = searchParams.get('rate') || null;
    const voice = searchParams.get('voice') || null;

    if (!text.trim()) {
      return new Response('Text parameter is required.', { status: 400 });
    }
    if (text.length > 2500) {
      return new Response('Text exceeds maximum character limit of 2,500.', { status: 400 });
    }

    const result = await synthesizeElevenLabs({
      text,
      voiceProfileId,
      gender: reqGender,
      customVoiceId,
      modelId: modelId || undefined,
      style: speechMode || style,
      speechMode,
      ageStyle,
      personality,
      emotion,
      weight,
      pitchFactor,
      pitch,
      rate,
      voice,
      speed
    });

    // Students are not permitted download option (audio must play inline only)
    const isStudent = session?.role === 'student';
    const isDownload = !isStudent && searchParams.get('download') === 'true';
    const filename = searchParams.get('filename') || `elevenlabs_${voiceProfileId}.mp3`;
    const disposition = isDownload ? `attachment; filename="${encodeURIComponent(filename)}"` : 'inline';

    return new Response(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': result.contentType || 'audio/mpeg',
        'Content-Disposition': disposition,
        'Cache-Control': 'public, max-age=86400',
        'X-Audio-Provider': result.provider,
        'X-Audio-Cached': result.cached ? 'true' : 'false',
        'Content-Length': String(result.buffer.byteLength)
      }
    });
  } catch (err) {
    console.error('ElevenLabs TTS GET error:', err);
    return new Response(err.message || 'Speech generation failed', { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (checkRateLimit(request).limited) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment before generating more speech.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await getSessionUser(request);
    const body = await request.json();
    const {
      text,
      voiceProfileId = 'ko-female-1',
      gender = null,
      customVoiceId = null,
      modelId,
      style = 'natural_conversation',
      speechMode,
      ageStyle,
      personality,
      emotion,
      weight,
      pitchFactor,
      pitch = null,
      rate = null,
      voice = null,
      customSettings,
      speed = 1.0,
      download = false,
      filename = null
    } = body;

    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: 'Text parameter is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (text.length > 2500) {
      return new Response(JSON.stringify({ error: 'Text exceeds maximum character limit of 2,500.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await synthesizeElevenLabs({
      text,
      voiceProfileId,
      gender,
      customVoiceId,
      modelId,
      style: speechMode || style,
      speechMode,
      ageStyle,
      personality,
      emotion,
      weight,
      pitchFactor,
      pitch,
      rate,
      voice,
      customSettings,
      speed
    });

    // Students are not permitted download option (audio must play inline only)
    const isStudent = session?.role === 'student';
    const isDownload = !isStudent && Boolean(download);
    const disposition = isDownload 
      ? `attachment; filename="${encodeURIComponent(filename || `elevenlabs_${voiceProfileId}.mp3`)}"` 
      : 'inline';

    return new Response(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': result.contentType || 'audio/mpeg',
        'Content-Disposition': disposition,
        'Cache-Control': 'public, max-age=86400',
        'X-Audio-Provider': result.provider,
        'X-Audio-Cached': result.cached ? 'true' : 'false',
        'Content-Length': String(result.buffer.byteLength)
      }
    });
  } catch (err) {
    console.error('ElevenLabs TTS POST error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Speech generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
