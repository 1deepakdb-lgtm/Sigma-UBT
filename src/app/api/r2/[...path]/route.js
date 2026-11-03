import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';

// Read Cloudflare R2 credentials from environment
const R2_ACCOUNT_ID = (process.env.R2_ACCOUNT_ID || '').trim();
const R2_ACCESS_KEY_ID = (process.env.R2_ACCESS_KEY_ID || '').trim();
const R2_SECRET_ACCESS_KEY = (process.env.R2_SECRET_ACCESS_KEY || '').trim();
const R2_BUCKET_NAME = (process.env.R2_BUCKET_NAME || 'sigma').trim();

let s3Client = null;

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

export async function GET(req, { params }) {
  try {
    const key = resolveKey(params);
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const s3 = getS3Client();
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
    headers.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');

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
    const key = resolveKey(params);
    if (!key) {
      return new NextResponse(null, { status: 400 });
    }

    const s3 = getS3Client();
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
    headers.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');

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
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
    },
  });
}
