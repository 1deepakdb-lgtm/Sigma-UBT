import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Permitted audio MIME types for user speech uploads and custom voice library
const ALLOWED_AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
  'audio/flac',
  'audio/x-wav',
  'audio/webm',
]);

const ALLOWED_AUDIO_EXTENSIONS = new Set([
  '.mp3',
  '.wav',
  '.ogg',
  '.m4a',
  '.aac',
  '.flac',
  '.webm',
]);

const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15 MB max for speech audio sample

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get('file');
    const wordKey = data.get('word') || 'general';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: `Audio file size exceeds the 15MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        },
        { status: 413 }
      );
    }

    const ext = path.extname(file.name || 'audio.mp3').toLowerCase() || '.mp3';
    if (!ALLOWED_AUDIO_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          error: 'Invalid audio format',
          message: `Format '${ext}' is not supported. Please upload an audio file (.mp3, .wav, .m4a, .webm, .ogg, .aac).`
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeBaseName = path
      .basename(file.name || 'user_voice', ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);

    const safeWord = String(wordKey).replace(/[^a-zA-Z0-9_\-\u0900-\u097F\uAC00-\uD7AF]/g, '_').slice(0, 30);
    const uniqueFileName = `voice_${Date.now()}_${safeWord}_${safeBaseName}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'voices');

    await mkdir(uploadDir, { recursive: true });

    const targetFilePath = path.join(uploadDir, uniqueFileName);
    await writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/voices/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      size: file.size,
      mimeType: file.type || 'audio/mpeg',
      word: wordKey
    });
  } catch (err) {
    console.error('Voice upload error:', err);
    return NextResponse.json({ error: 'Audio upload failed' }, { status: 500 });
  }
}
