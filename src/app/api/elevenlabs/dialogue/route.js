import { synthesizeDialogue } from '@/lib/elevenlabsService';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { turns, modelId, style = 'natural_conversation', download = false, filename = 'dialogue_conversation.mp3' } = body;

    if (!Array.isArray(turns) || turns.length === 0) {
      return new Response(JSON.stringify({ error: 'Turns must be a non-empty array of dialogue turns.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await synthesizeDialogue({ turns, modelId, style });

    const disposition = download 
      ? `attachment; filename="${encodeURIComponent(filename)}"` 
      : 'inline';

    return new Response(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': disposition,
        'Cache-Control': 'public, max-age=86400',
        'X-Audio-Provider': result.provider,
        'X-Turn-Count': String(result.turnCount),
        'Content-Length': String(result.buffer.byteLength)
      }
    });
  } catch (err) {
    console.error('ElevenLabs Dialogue API error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Dialogue synthesis failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
