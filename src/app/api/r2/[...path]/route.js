import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Readable } from 'stream';

// Read Cloudflare R2 credentials from environment with resilient production fallbacks
const R2_ACCOUNT_ID = (process.env.R2_ACCOUNT_ID || 'b70b92d169949696594931fa076ae637').trim();
const R2_ACCESS_KEY_ID = (process.env.R2_ACCESS_KEY_ID || 'ef2b9504becd6f05ca27aec5b3914608').trim();
const R2_SECRET_ACCESS_KEY = (process.env.R2_SECRET_ACCESS_KEY || '5256075c5425a63785e3981477b159f6279a97eee7e8264792368276e028316e').trim();
const R2_BUCKET_NAME = (process.env.R2_BUCKET_NAME || 'sigma').trim();

// Local on-disk cache directory for instantaneous (0ms - 2ms) responses
const R2_CACHE_DIR = path.join(process.cwd(), '.next', 'cache', 'r2');
try {
  if (!fs.existsSync(R2_CACHE_DIR)) {
    fs.mkdirSync(R2_CACHE_DIR, { recursive: true });
  }
} catch (e) {}

let s3Client = null;
const resolvedKeyCache = new Map();

function getCachePath(key) {
  const hash = crypto.createHash('md5').update(key).digest('hex');
  const ext = path.extname(key) || '';
  return path.join(R2_CACHE_DIR, `${hash}${ext}`);
}

function getS3Client() {
  if (!s3Client) {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      throw new Error('Cloudflare R2 credentials are not configured in environment.');
    }
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

function resolveKey(params) {
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
  return safeSegments.join('/').replace(/^\/+/, '');
}

async function resolveR2Key(s3, requestedKey) {
  if (!requestedKey) return requestedKey;
  if (resolvedKeyCache.has(requestedKey)) {
    return resolvedKeyCache.get(requestedKey);
  }

  // Fast Unicode forms
  const nfdKey = requestedKey.normalize('NFD');
  const nfcKey = requestedKey.normalize('NFC');

  // Try exact key first
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: requestedKey }));
    resolvedKeyCache.set(requestedKey, requestedKey);
    return requestedKey;
  } catch (e) {}

  if (nfdKey !== requestedKey) {
    try {
      await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: nfdKey }));
      resolvedKeyCache.set(requestedKey, nfdKey);
      return nfdKey;
    } catch (e) {}
  }

  if (nfcKey !== requestedKey && nfcKey !== nfdKey) {
    try {
      await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: nfcKey }));
      resolvedKeyCache.set(requestedKey, nfcKey);
      return nfcKey;
    } catch (e) {}
  }

  // Fallback: Search directory prefix
  const lastSlash = requestedKey.lastIndexOf('/');
  if (lastSlash !== -1) {
    const folder = requestedKey.substring(0, lastSlash + 1);
    const targetFilename = requestedKey.substring(lastSlash + 1).toLowerCase();
    const isPdf = targetFilename.endsWith('.pdf');
    const isAudio = targetFilename.endsWith('.mp3');

    try {
      const listRes = await s3.send(new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: folder,
        MaxKeys: 80,
      }));

      const contents = listRes.Contents || [];

      for (const item of contents) {
        const itemFile = item.Key.substring(lastSlash + 1);
        if (
          itemFile.toLowerCase() === targetFilename ||
          itemFile.normalize('NFC').toLowerCase() === targetFilename.normalize('NFC') ||
          itemFile.normalize('NFD').toLowerCase() === targetFilename.normalize('NFD')
        ) {
          resolvedKeyCache.set(requestedKey, item.Key);
          return item.Key;
        }
      }

      if (isPdf) {
        const pdfItems = contents.filter(c => c.Key.toLowerCase().endsWith('.pdf'));
        if (pdfItems.length === 1) {
          resolvedKeyCache.set(requestedKey, pdfItems[0].Key);
          return pdfItems[0].Key;
        }
        const chMatch = requestedKey.match(/chapter[\s_-]*0*(\d+)/i);
        if (chMatch) {
          const chNum = parseInt(chMatch[1], 10);
          const found = pdfItems.find(c => {
            const m = c.Key.match(/chapter[\s_-]*0*(\d+)/i);
            return m && parseInt(m[1], 10) === chNum;
          });
          if (found) {
            resolvedKeyCache.set(requestedKey, found.Key);
            return found.Key;
          }
        }
        if (pdfItems.length > 0) {
          resolvedKeyCache.set(requestedKey, pdfItems[0].Key);
          return pdfItems[0].Key;
        }
      }

      if (isAudio) {
        const trackMatch = targetFilename.match(/track[\s_-]*0*(\d+)/i);
        if (trackMatch) {
          const trackNum = parseInt(trackMatch[1], 10);
          const found = contents.find(c => {
            const m = c.Key.toLowerCase().match(/track[\s_-]*0*(\d+)/i);
            return m && parseInt(m[1], 10) === trackNum;
          });
          if (found) {
            resolvedKeyCache.set(requestedKey, found.Key);
            return found.Key;
          }
        }
      }
    } catch (listErr) {
      console.warn('R2 prefix search notice:', listErr?.message || listErr);
    }
  }

  return requestedKey;
}

export async function GET(req, { params }) {
  try {
    const rawKey = resolveKey(params);
    if (!rawKey) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const rangeHeader = req.headers.get('range');
    const cacheFile = getCachePath(rawKey);

    // 1. INSTANT LOCAL DISK CACHE (0ms - 2ms response time!)
    if (fs.existsSync(cacheFile)) {
      try {
        const stat = fs.statSync(cacheFile);
        if (stat.size > 0) {
          const detectedType = mime.lookup(rawKey) || 'application/octet-stream';
          const filename = rawKey.split('/').pop() || 'file';
          const headers = new Headers();
          headers.set('Content-Type', detectedType);
          headers.set('Accept-Ranges', 'bytes');
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          headers.set('Access-Control-Allow-Headers', '*');
          headers.set('ETag', `"${stat.size}-${stat.mtimeMs}"`);

          if (rangeHeader) {
            const parts = rangeHeader.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

            if (start < stat.size) {
              const chunksize = end - start + 1;
              headers.set('Content-Range', `bytes ${start}-${end}/${stat.size}`);
              headers.set('Content-Length', String(chunksize));
              const nodeStream = fs.createReadStream(cacheFile, { start, end });
              const webStream = Readable.toWeb(nodeStream);
              return new NextResponse(webStream, { status: 206, headers });
            }
          }

          headers.set('Content-Length', String(stat.size));
          const nodeStream = fs.createReadStream(cacheFile);
          const webStream = Readable.toWeb(nodeStream);
          return new NextResponse(webStream, { status: 200, headers });
        }
      } catch (cacheErr) {
        console.warn('Cache read notice:', cacheErr);
      }
    }

    // 2. FETCH FROM R2
    const s3 = getS3Client();
    const key = await resolveR2Key(s3, rawKey);

    const commandInput = {
      Bucket: R2_BUCKET_NAME,
      Key: key,
    };

    if (rangeHeader) {
      commandInput.Range = rangeHeader;
    }

    const s3Res = await s3.send(new GetObjectCommand(commandInput));

    const detectedType = mime.lookup(key) || s3Res.ContentType || 'application/octet-stream';
    const filename = key.split('/').pop() || 'file';

    const headers = new Headers();
    headers.set('Content-Type', detectedType);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');

    if (s3Res.ContentLength !== undefined) {
      headers.set('Content-Length', String(s3Res.ContentLength));
    }
    if (s3Res.ContentRange) {
      headers.set('Content-Range', s3Res.ContentRange);
    }
    if (s3Res.ETag) {
      headers.set('ETag', s3Res.ETag);
    }

    const status = rangeHeader && s3Res.ContentRange ? 206 : 200;

    // Background cache write when full file is requested (non-blocking)
    if (!rangeHeader && s3Res.Body) {
      try {
        const streamData = await s3Res.Body.transformToByteArray();
        fs.writeFile(cacheFile, Buffer.from(streamData), () => {});
        return new NextResponse(streamData, {
          status: 200,
          headers,
        });
      } catch (e) {}
    }

    const stream = s3Res.Body?.transformToWebStream
      ? s3Res.Body.transformToWebStream()
      : s3Res.Body;

    return new NextResponse(stream, {
      status,
      headers,
    });
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: 'File not found in R2' }, { status: 404 });
    }
    console.error('Error fetching file from R2:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching file from R2' },
      { status: 500 }
    );
  }
}

export async function HEAD(req, { params }) {
  try {
    const rawKey = resolveKey(params);
    if (!rawKey) {
      return new NextResponse(null, { status: 400 });
    }

    const cacheFile = getCachePath(rawKey);
    if (fs.existsSync(cacheFile)) {
      try {
        const stat = fs.statSync(cacheFile);
        if (stat.size > 0) {
          const detectedType = mime.lookup(rawKey) || 'application/octet-stream';
          const filename = rawKey.split('/').pop() || 'file';
          const headers = new Headers();
          headers.set('Content-Type', detectedType);
          headers.set('Accept-Ranges', 'bytes');
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          headers.set('Access-Control-Allow-Headers', '*');
          headers.set('Content-Length', String(stat.size));
          headers.set('ETag', `"${stat.size}-${stat.mtimeMs}"`);
          return new NextResponse(null, { status: 200, headers });
        }
      } catch (e) {}
    }

    const s3 = getS3Client();
    const key = await resolveR2Key(s3, rawKey);
    const s3Res = await s3.send(new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    }));

    const detectedType = mime.lookup(key) || s3Res.ContentType || 'application/octet-stream';
    const filename = key.split('/').pop() || 'file';

    const headers = new Headers();
    headers.set('Content-Type', detectedType);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');

    if (s3Res.ContentLength !== undefined) {
      headers.set('Content-Length', String(s3Res.ContentLength));
    }
    if (s3Res.ETag) {
      headers.set('ETag', s3Res.ETag);
    }

    return new NextResponse(null, {
      status: 200,
      headers,
    });
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return new NextResponse(null, { status: 404 });
    }
    return new NextResponse(null, { status: 500 });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  headers.set('Access-Control-Allow-Headers', '*');
  headers.set('Access-Control-Max-Age', '86400');
  return new NextResponse(null, { status: 204, headers });
}
