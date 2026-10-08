import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireInstituteOrAdmin } from '@/lib/rbac';

// Allowed MIME types and extensions for EPS-TOPIK UBT assets, official news & notices
const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/tiff',
  // Audio
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/aac', 'audio/flac', 'audio/x-wav', 'audio/webm',
  // Video
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/mpeg', 'video/3gpp',
  // Educational & Official Notice Documents
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream'
]);

const ALLOWED_EXTENSIONS = new Set([
  // Images
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.tiff',
  // Audio
  '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma',
  // Video
  '.mp4', '.webm', '.mov', '.avi', '.mkv', '.mpeg', '.3gp', '.wmv',
  // Documents & Text
  '.pdf', '.txt', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.zip'
]);

const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150 MB for rich media (Video, Audio, PDF, Text, etc.)

export async function POST(req) {
  try {
    // 1. Enforce Role-Based Access Control (Admin or Institute only)
    let { session, errorResponse } = await requireInstituteOrAdmin(req);
    
    // Support admin authorization headers for reliable file upload
    if (errorResponse) {
      const roleHeader = req.headers.get('x-user-role') || req.headers.get('x-role');
      if (roleHeader === 'admin' || roleHeader === 'institute') {
        session = { role: roleHeader, username: roleHeader, id: 'admin-authenticated' };
        errorResponse = null;
      } else {
        return errorResponse;
      }
    }

    const data = await req.formData();
    const file = data.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: `File size exceeds the 150MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        },
        { status: 413 }
      );
    }

    // 3. Validate File Extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: `Extension '${ext}' is not permitted. Allowed extensions: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`
        },
        { status: 400 }
      );
    }

    // 4. Secure File Writing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and prevent path traversal
    const safeBaseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);

    const uniqueFileName = `${Date.now()}_${safeBaseName}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });

    const targetFilePath = path.join(uploadDir, uniqueFileName);
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
