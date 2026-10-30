import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No screenshot file provided' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Screenshot file too large (max 15MB)' }, { status: 413 });
    }

    const ext = path.extname(file.name).toLowerCase() || '.jpg';
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: 'Please upload an image file (JPG, PNG, or WebP)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeBase = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);

    const fileName = `${Date.now()}_receipt_${safeBase}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    const publicUrl = `/uploads/receipts/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: file.size,
      mimeType: file.type
    });
  } catch (err) {
    console.error('Screenshot upload failed:', err);
    return NextResponse.json({ error: 'Failed to process screenshot upload' }, { status: 500 });
  }
}
