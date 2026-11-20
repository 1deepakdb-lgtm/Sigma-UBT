import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import mime from 'mime-types';

// Read Cloudflare R2 credentials from environment with resilient production fallbacks
const R2_ACCOUNT_ID = (process.env.R2_ACCOUNT_ID || 'b70b92d169949696594931fa076ae637').trim();
const R2_ACCESS_KEY_ID = (process.env.R2_ACCESS_KEY_ID || 'ef2b9504becd6f05ca27aec5b3914608').trim();
const R2_SECRET_ACCESS_KEY = (process.env.R2_SECRET_ACCESS_KEY || '5256075c5425a63785e3981477b159f6279a97eee7e8264792368276e028316e').trim();
const R2_BUCKET_NAME = (process.env.R2_BUCKET_NAME || 'sigma').trim();

let s3Client = null;
const resolvedKeyCache = new Map();

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

  // 1. Try exact key lookup first
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: requestedKey }));
    resolvedKeyCache.set(requestedKey, requestedKey);
    return requestedKey;
  } catch (e) {}

  // 2. Try normalized Unicode (NFD and NFC)
  const nfcKey = requestedKey.normalize('NFC');
  const nfdKey = requestedKey.normalize('NFD');

  if (nfcKey !== requestedKey) {
    try {
      await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: nfcKey }));
      resolvedKeyCache.set(requestedKey, nfcKey);
      return nfcKey;
    } catch (e) {}
  }

  if (nfdKey !== requestedKey) {
    try {
      await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: nfdKey }));
      resolvedKeyCache.set(requestedKey, nfdKey);
      return nfdKey;
    } catch (e) {}
  }

  // 3. Fallback: Search directory prefix
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

      // A. Match case-insensitively or normalized
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

      // B. If requesting PDF, find matching chapter PDF or only PDF in that folder
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

      // C. If requesting audio, match track number (e.g. Track 028 or Track 28)
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

    const s3 = getS3Client();
    const key = await resolveR2Key(s3, rawKey);
    const rangeHeader = req.headers.get('range');

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
