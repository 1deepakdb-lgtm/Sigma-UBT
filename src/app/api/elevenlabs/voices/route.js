import { NextResponse } from 'next/server';
import { 
  VOICE_PROFILES, 
  VOICE_CATEGORIES,
  ELEVENLABS_MODELS, 
  DEFAULT_MODEL_ID, 
  SPEAKING_STYLES, 
  DIALOGUE_TEMPLATES 
} from '@/lib/elevenlabsConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = (process.env.ELEVENLABS_API_KEY || '').trim();
  const hasApiKey = Boolean(apiKey && apiKey !== 'YOUR_ELEVENLABS_API_KEY');

  let liveVoices = null;

  if (hasApiKey) {
    try {
      const liveRes = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey,
          'Accept': 'application/json'
        },
        next: { revalidate: 3600 }
      });
      if (liveRes.ok) {
        const liveData = await liveRes.json();
        if (Array.isArray(liveData.voices)) {
          liveVoices = liveData.voices.map(v => ({
            voiceId: v.voice_id,
            name: v.name,
            category: v.category,
            labels: v.labels || {},
            previewUrl: v.preview_url,
            gender: v.labels?.gender || (v.name.toLowerCase().includes('female') ? 'female' : 'male'),
            accent: v.labels?.accent || 'multilingual',
            description: v.description || v.labels?.description || ''
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live ElevenLabs voices:', err.message);
    }
  }

  return NextResponse.json({
    success: true,
    hasApiKey,
    defaultModel: DEFAULT_MODEL_ID,
    availableModels: Object.values(ELEVENLABS_MODELS),
    speakingStyles: Object.values(SPEAKING_STYLES),
    categories: VOICE_CATEGORIES,
    voices: VOICE_PROFILES,
    liveElevenLabsVoices: liveVoices,
    templates: DIALOGUE_TEMPLATES,
    status: hasApiKey ? 'ready' : 'fallback_mode',
    message: hasApiKey 
      ? 'ElevenLabs API is active and connected.' 
      : 'ElevenLabs API key is not yet set in .env. Please set ELEVENLABS_API_KEY to fetch clear human voices directly from ElevenLabs.'
  });
}
