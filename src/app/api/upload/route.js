import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireInstituteOrAdmin } from '@/lib/rbac';
import { sanitizeFilename, scanRequestBody } from '@/lib/inputSanitizer';

// ─── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  // Audio
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a',
  'audio/aac', 'audio/flac', 'audio/x-wav', 'audio/webm',
  // Video
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  // Documents
  'application/pdf', 'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

// ─── Allowed Extensions ────────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
  '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac',
  '.mp4', '.webm', '.mov',
  '.pdf', '.txt', '.doc', '.docx', '.xls', '.xlsx',
]);

// ─── Dangerous Extension Blocklist (hard stop) ────────────────────────────────
const BLOCKED_EXTENSIONS = new Set([
  '.php', '.php3', '.php4', '.php5', '.phtml', '.phar',
  '.asp', '.aspx', '.jsp', '.jspx',
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.ps1',
  '.py', '.rb', '.pl', '.cgi',
  '.htaccess', '.htpasswd',
  '.js', '.mjs', '.ts',   // block server-side scripts
  '.dll', '.so', '.dylib',
  '.zip', '.tar', '.gz', '.rar', '.7z', // block archives (potential zip-bombs)
]);

// ─── Magic Bytes (file signature) verification ────────────────────────────────
// Verifies the true file type from binary content, preventing extension spoofing
const MAGIC_BYTES = [
  { ext: '.jpg',  mime: 'image/jpeg',       bytes: [0xFF, 0xD8, 0xFF] },
  { ext: '.png',  mime: 'image/png',        bytes: [0x89, 0x50, 0x4E, 0x47] },
  { ext: '.webp', mime: 'image/webp',       bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
  { ext: '.gif',  mime: 'image/gif',        bytes: [0x47, 0x49, 0x46] },       // GIF
  { ext: '.pdf',  mime: 'application/pdf',  bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { ext: '.mp3',  mime: 'audio/mpeg',       bytes: [0x49, 0x44, 0x33] },       // ID3
  { ext: '.mp4',  mime: 'video/mp4',        offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }, // ftyp
];

/**
 * Verify that a buffer's magic bytes match the expected file type.
 * Returns false if file header indicates an executable or mismatched type.
 */
function verifyMagicBytes(buffer, ext) {
  if (!buffer || buffer.length < 8) return false;

  // Block PHP/ASP/script markers embedded in files (polyglot attack prevention)
  const textPreview = buffer.slice(0, 512).toString('utf8', 0, 512);
  const DANGEROUS_MARKERS = [
    '<?php', '<?=', '<asp', '<%@', '<script', 'eval(', 'exec(',
    'system(', 'passthru(', 'shell_exec(', 'base64_decode('
  ];
  if (DANGEROUS_MARKERS.some((m) => textPreview.toLowerCase().includes(m.toLowerCase()))) {
    return false;
  }

  // Check known magic byte signatures
  const sig = MAGIC_BYTES.find((m) => m.ext === ext || m.mime === ext);
  if (sig) {
    const offset = sig.offset || 0;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (buffer[offset + i] !== sig.bytes[i]) return false;
    }
  }

  return true;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB (reduced from 150 MB for security)
const MIN_FILE_SIZE = 1;                 // Reject empty files

export async function POST(req) {
  try {
    // 1. Enforce Role-Based Access Control (Admin or Institute only)
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const data = await req.formData();
    const file = data.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 2. Validate File Size (min + max)
    if (file.size < MIN_FILE_SIZE) {
      return NextResponse.json({ error: 'Empty file rejected' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: `File exceeds the 50MB limit. Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        },
        { status: 413 }
      );
    }

    // 3. Validate File Extension — hard-block dangerous types
    const ext = path.extname(file.name || '').toLowerCase();

    if (BLOCKED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          error: 'Blocked file type',
          message: `Extension '${ext}' is not permitted for security reasons.`
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: `Extension '${ext}' is not permitted.`
        },
        { status: 400 }
      );
    }

    // 4. Validate Declared MIME type
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Invalid MIME type', message: `Type '${file.type}' is not permitted.` },
        { status: 400 }
      );
    }

    // 5. Read file bytes and verify magic bytes (prevents extension spoofing)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!verifyMagicBytes(buffer, ext)) {
      return NextResponse.json(
        { error: 'File content mismatch', message: 'File content does not match its declared type. Upload rejected.' },
        { status: 400 }
      );
    }

    // 6. Sanitize filename and prevent path traversal
    const safeBaseName = sanitizeFilename(path.basename(file.name, ext)).slice(0, 50);
    const uniqueFileName = `${Date.now()}_${safeBaseName}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // 7. Ensure the resolved path is actually inside uploadDir (path traversal prevention)
    const targetFilePath = path.join(uploadDir, uniqueFileName);
    if (!targetFilePath.startsWith(uploadDir)) {
      return NextResponse.json(
        { error: 'Invalid file path', message: 'Path traversal attempt detected.' },
        { status: 400 }
      );
    }

    await mkdir(uploadDir, { recursive: true });
    await writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      size: file.size,
      mimeType: file.type,
      uploadedBy: {
        id: session.id,
        role: session.role,
        username: session.username
      }
    });
  } catch (err) {
    console.error('Upload security error:', err);
    return NextResponse.json({ error: 'Upload processing failed' }, { status: 500 });
  }
}
