import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { Readable } from 'stream';

/**
 * High-Performance Direct Streaming & HTTP 206 Range Engine for Local PDFs
 * Supports instantaneous Page 1 opening across all devices, browsers, and smartboards
 */
export async function GET(req, { params }) {
  try {
    const segments = params?.path || [];
    const safeSegments = segments
      .map(s => {
        try {
          return decodeURIComponent(s);
        } catch (e) {
          return '';
        }
      })
      .filter(s => s && s !== '..' && s !== '.' && !s.includes('\0') && !s.includes('..'));

    const relativePath = safeSegments.join('/');
    if (!relativePath) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', relativePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: 'Invalid file target' }, { status: 400 });
    }

    const fileSize = stat.size;
    const detectedType = mime.lookup(filePath) || 'application/pdf';
    const filename = path.basename(filePath);

    const headers = new Headers();
    headers.set('Content-Type', detectedType);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');
    headers.set('ETag', `"${fileSize}-${stat.mtimeMs}"`);
    headers.set('Last-Modified', stat.mtime.toUTCString());

    const rangeHeader = req.headers.get('range');

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

        if (start < fileSize) {
          const finalEnd = Math.min(end, fileSize - 1);
          const chunkSize = finalEnd - start + 1;

          headers.set('Content-Range', `bytes ${start}-${finalEnd}/${fileSize}`);
          headers.set('Content-Length', String(chunkSize));

          const nodeStream = fs.createReadStream(filePath, { start, end: finalEnd });
          const webStream = Readable.toWeb(nodeStream);
          return new NextResponse(webStream, { status: 206, headers });
        } else {
          headers.set('Content-Range', `bytes */${fileSize}`);
          return new NextResponse(null, { status: 416, headers });
        }
      }
    }

    headers.set('Content-Length', String(fileSize));
    const nodeStream = fs.createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream);
    return new NextResponse(webStream, { status: 200, headers });
  } catch (error) {
    console.error('Error streaming PDF file:', error);
    return NextResponse.json({ error: error.message || 'Error streaming PDF' }, { status: 500 });
  }
}

export async function HEAD(req, { params }) {
  try {
    const segments = params?.path || [];
    const safeSegments = segments
      .map(s => {
        try {
          return decodeURIComponent(s);
        } catch (e) {
          return '';
        }
      })
      .filter(s => s && s !== '..' && s !== '.' && !s.includes('\0') && !s.includes('..'));

    const relativePath = safeSegments.join('/');
    const filePath = path.join(process.cwd(), 'public', 'uploads', relativePath);

    if (!fs.existsSync(filePath)) {
      return new NextResponse(null, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const detectedType = mime.lookup(filePath) || 'application/pdf';
    const filename = path.basename(filePath);

    const headers = new Headers();
    headers.set('Content-Type', detectedType);
    headers.set('Content-Length', String(stat.size));
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');
    headers.set('ETag', `"${stat.size}-${stat.mtimeMs}"`);
    headers.set('Last-Modified', stat.mtime.toUTCString());

    return new NextResponse(null, { status: 200, headers });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
