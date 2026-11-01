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

    if (buffer.length < 8) {
      return NextResponse.json({ error: 'Invalid or corrupted image file' }, { status: 400 });
    }

    // Verify binary magic bytes
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isWebp = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;

    if (!isJpeg && !isPng && !isWebp && !isGif) {
      return NextResponse.json({ error: 'File content does not match a valid image format.' }, { status: 400 });
    }

    // Prevent polyglot script injection in image headers
    const textPreview = buffer.slice(0, 512).toString('utf8', 0, 512).toLowerCase();
    if (textPreview.includes('<?php') || textPreview.includes('<script') || textPreview.includes('eval(')) {
      return NextResponse.json({ error: 'Malicious content detected in file.' }, { status: 400 });
    }

    const safeBase = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);

    const fileName = `${Date.now()}_receipt_${safeBase}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');

    await mkdir(uploadDir, { recursive: true });
    const targetPath = path.join(uploadDir, fileName);

    // Prevent path traversal
    if (!targetPath.startsWith(path.resolve(uploadDir))) {
      return NextResponse.json({ error: 'Invalid file destination path' }, { status: 400 });
    }

    await writeFile(targetPath, buffer);

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
