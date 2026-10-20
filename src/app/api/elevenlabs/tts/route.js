import { synthesizeElevenLabs } from '@/lib/elevenlabsService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || '';
    const voiceProfileId = searchParams.get('voiceProfileId') || 'ko-female-1';
    const style = searchParams.get('style') || 'natural_conversation';
    const speed = parseFloat(searchParams.get('speed') || '1.0');
    const customVoiceId = searchParams.get('voiceId') || null;

    const ageStyle = searchParams.get('ageStyle') || null;
    const personality = searchParams.get('personality') || null;
    const speechMode = searchParams.get('speechMode') || null;
    const emotion = searchParams.get('emotion') || null;
    const weight = searchParams.get('weight') !== null ? parseFloat(searchParams.get('weight')) : null;
    const pitchFactor = searchParams.get('pitchFactor') !== null ? parseFloat(searchParams.get('pitchFactor')) : null;

    if (!text.trim()) {
      return new Response('Text parameter is required.', { status: 400 });
    }

    const result = await synthesizeElevenLabs({
      text,
      voiceProfileId,
      customVoiceId,
      style: speechMode || style,
      speechMode,
      ageStyle,
      personality,
      emotion,
      weight,
      pitchFactor,
      speed
    });

    const isDownload = searchParams.get('download') === 'true';
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
    const body = await request.json();
    const {
      text,
      voiceProfileId = 'ko-female-1',
      customVoiceId = null,
      modelId,
      style = 'natural_conversation',
      speechMode,
      ageStyle,
      personality,
      emotion,
      weight,
      pitchFactor,
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

    const result = await synthesizeElevenLabs({
      text,
      voiceProfileId,
      customVoiceId,
      modelId,
      style: speechMode || style,
      speechMode,
      ageStyle,
      personality,
      emotion,
      weight,
      pitchFactor,
      customSettings,
      speed
    });

    const disposition = download 
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
