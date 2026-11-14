import { synthesizeDialogue } from '@/lib/elevenlabsService';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DIALOGUE_RATE_LIMIT = 20; // max dialogue requests per minute
const DIALOGUE_RATE_WINDOW = 60 * 1000;
const dialogueRateStore = new Map();

function checkDialogueRateLimit(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const key = `eld:${ip}`;
  const now = Date.now();
  const record = dialogueRateStore.get(key) || { calls: [] };
  record.calls = record.calls.filter((t) => now - t < DIALOGUE_RATE_WINDOW);
  if (record.calls.length >= DIALOGUE_RATE_LIMIT) {
    return { limited: true };
  }
  record.calls.push(now);
  dialogueRateStore.set(key, record);
  return { limited: false };
}

export async function POST(request) {
  try {
    if (checkDialogueRateLimit(request).limited) {
      return new Response(JSON.stringify({ error: 'Too many dialogue synthesis requests. Please wait a moment.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await getSessionUser(request);
    const body = await request.json();
    const { turns, modelId, style = 'natural_conversation', download = false, filename = 'dialogue_conversation.mp3' } = body;

    if (!Array.isArray(turns) || turns.length === 0) {
      return new Response(JSON.stringify({ error: 'Turns must be a non-empty array of dialogue turns.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (turns.length > 25) {
      return new Response(JSON.stringify({ error: 'Dialogue turn count exceeds maximum limit of 25 turns per request.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await synthesizeDialogue({ turns, modelId, style });

    // Strict download protection: ONLY Admin and Institute can download. NEVER students.
    const userRole = session?.role || request.headers.get('x-user-role');
    const isPrivileged = userRole === 'admin' || userRole === 'institute' || userRole === 'superadmin';
    const isDownload = isPrivileged && Boolean(download);

    const disposition = isDownload 
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
