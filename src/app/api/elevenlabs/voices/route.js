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
  const hasApiKey = Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'YOUR_ELEVENLABS_API_KEY');

  return NextResponse.json({
    success: true,
    hasApiKey,
    defaultModel: DEFAULT_MODEL_ID,
    availableModels: Object.values(ELEVENLABS_MODELS),
    speakingStyles: Object.values(SPEAKING_STYLES),
    categories: VOICE_CATEGORIES,
    voices: VOICE_PROFILES,
    templates: DIALOGUE_TEMPLATES,
    status: hasApiKey ? 'ready' : 'fallback_mode',
    message: hasApiKey 
      ? 'ElevenLabs API is configured and operational.' 
      : 'ElevenLabs API key is not yet configured in .env. System is operating via high-fidelity local studio engine.'
  });
}
