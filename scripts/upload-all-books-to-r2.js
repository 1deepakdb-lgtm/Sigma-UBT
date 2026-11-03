import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

// Load .env
const env = {};
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf-8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  });
}

const R2_ACCOUNT_ID = (process.env.R2_ACCOUNT_ID || env.R2_ACCOUNT_ID || '').trim();
const R2_ACCESS_KEY_ID = (process.env.R2_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID || '').trim();
const R2_SECRET_ACCESS_KEY = (process.env.R2_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY || '').trim();
const R2_BUCKET_NAME = (process.env.R2_BUCKET_NAME || env.R2_BUCKET_NAME || 'sigma').trim();

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error("❌ Cloudflare R2 credentials missing in .env");
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const DESKTOP_DIR = '/Users/deepakbhatt/Desktop';
const UNIT_WISE_DIR = path.join(DESKTOP_DIR, 'books', 'EPS_TOPIK_Unit_Wise_Parts');
const COVER_FILE = path.join(DESKTOP_DIR, 'books', 'EPS_TOPIK_chapterwise_folders', 'Cover', 'Cover.pdf');
const BOOK1_FULL = path.join(DESKTOP_DIR, '1.pdf');
const BOOK2_FULL = path.join(DESKTOP_DIR, '2.pdf');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadFileIfNeeded(localPath, r2Key, maxRetries = 3) {
  const stat = fs.statSync(localPath);
  const size = stat.size;
  const contentType = mime.lookup(localPath) || 'application/octet-stream';

  // Check if object already exists with matching size
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: r2Key }));
    if (head.ContentLength === size) {
      return { status: 'skipped', r2Key, size, contentType };
    }
  } catch (err) {
    // Doesn't exist, proceed
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const uploader = new Upload({
        client: s3,
        params: {
          Bucket: R2_BUCKET_NAME,
          Key: r2Key,
          Body: fs.createReadStream(localPath),
          ContentType: contentType,
        },
        partSize: 5 * 1024 * 1024, // 5MB part
        queueSize: 3,
        leavePartsOnError: false,
      });

      await uploader.done();
      return { status: 'uploaded', r2Key, size, contentType };
    } catch (err) {
      if (attempt === maxRetries) {
        throw new Error(`Failed to upload ${r2Key} after ${maxRetries} attempts: ${err.message}`);
      }
      console.warn(`⚠️ Retrying ${r2Key} (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

async function runQueue(tasks, concurrency = 4, onProgress) {
  let index = 0;
  let completed = 0;
  const results = [];

  async function worker() {
    while (index < tasks.length) {
      const taskIndex = index++;
      const task = tasks[taskIndex];
      try {
        const res = await task();
        results[taskIndex] = res;
      } catch (err) {
        console.error(`❌ Task error:`, err.message);
        results[taskIndex] = { status: 'error', error: err.message };
      }
      completed++;
      if (onProgress) onProgress(completed, tasks.length);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log("====================================================");
  console.log("🚀 Starting Resilient Upload to R2 Bucket:", R2_BUCKET_NAME);
  console.log("====================================================");

  const uploadTasks = [];
  const manifest = {
    generatedAt: new Date().toISOString(),
    bucket: R2_BUCKET_NAME,
    fullBooks: [],
    cover: null,
    chapters: [],
  };

  // 1. Scan Unit Wise Folders first (all 60 chapters, preliminary, appendix)
  if (!fs.existsSync(UNIT_WISE_DIR)) {
    console.error(`❌ Unit Wise directory not found: ${UNIT_WISE_DIR}`);
    process.exit(1);
  }

  const folderNames = fs.readdirSync(UNIT_WISE_DIR).filter(name => {
    const p = path.join(UNIT_WISE_DIR, name);
    return fs.statSync(p).isDirectory() && !name.startsWith('.');
  });

  function getFolderOrder(name) {
    if (name.toLowerCase().includes('prelim')) return 0;
    const match = name.match(/chapter\s+(\d+)/i);
    if (match) return parseInt(match[1], 10);
    if (name.toLowerCase().includes('appendix')) return 999;
    return 500;
  }

  folderNames.sort((a, b) => getFolderOrder(a) - getFolderOrder(b));

  // Load existing titles from data/eps-book-chapters.json
  let existingChaptersMap = new Map();
  const existingJsonPath = path.join(process.cwd(), 'data', 'eps-book-chapters.json');
  if (fs.existsSync(existingJsonPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(existingJsonPath, 'utf-8'));
      if (Array.isArray(parsed)) {
        parsed.forEach(c => {
          if (c.chapter) existingChaptersMap.set(Number(c.chapter), c);
        });
      }
    } catch (e) {}
  }

  for (const folder of folderNames) {
    const folderPath = path.join(UNIT_WISE_DIR, folder);
    const files = fs.readdirSync(folderPath).filter(f => !f.startsWith('.'));

    const pdfFiles = files.filter(f => f.endsWith('.pdf'));
    const mp3Files = files.filter(f => f.endsWith('.mp3'));

    mp3Files.sort((a, b) => {
      const na = parseInt((a.match(/\d+/) || [0])[0], 10);
      const nb = parseInt((b.match(/\d+/) || [0])[0], 10);
      return na - nb;
    });

    const chapterNumMatch = folder.match(/chapter\s+(\d+)/i);
    const chapterNum = chapterNumMatch ? parseInt(chapterNumMatch[1], 10) : (folder.toLowerCase().includes('prelim') ? 0 : 61);

    const existingInfo = existingChaptersMap.get(chapterNum) || {};

    let pdfData = null;
    if (pdfFiles.length > 0) {
      const pdfName = pdfFiles[0];
      const localPdfPath = path.join(folderPath, pdfName);
      const r2Key = `books/EPS_TOPIK_Unit_Wise_Parts/${folder}/${pdfName}`;
      pdfData = {
        fileName: pdfName,
        fileSize: formatBytes(fs.statSync(localPdfPath).size),
        r2Key,
        url: `/api/r2/${encodeURI(r2Key)}`,
      };
      uploadTasks.push(() => uploadFileIfNeeded(localPdfPath, r2Key));
    }

    const audioTracks = [];
    mp3Files.forEach((mp3Name, idx) => {
      const localMp3Path = path.join(folderPath, mp3Name);
      const r2Key = `books/EPS_TOPIK_Unit_Wise_Parts/${folder}/${mp3Name}`;
      const trackMatch = mp3Name.match(/track\s*(\d+)/i);
      const trackNumber = trackMatch ? parseInt(trackMatch[1], 10) : idx + 1;
      const cleanTrackName = mp3Name.replace(/\.mp3$/i, '').trim();

      audioTracks.push({
        id: `ch${chapterNum}-t${trackNumber}-${idx}`,
        name: `Track ${trackNumber} (${cleanTrackName})`,
        fileName: mp3Name,
        trackNumber,
        fileSize: formatBytes(fs.statSync(localMp3Path).size),
        r2Key,
        url: `/api/r2/${encodeURI(r2Key)}`,
      });

      uploadTasks.push(() => uploadFileIfNeeded(localMp3Path, r2Key));
    });

    manifest.chapters.push({
      folder,
      chapter: chapterNum,
      bookPart: chapterNum <= 30 ? 1 : 2,
      titleKo: existingInfo.titleKo || folder,
      titleNe: existingInfo.titleNe || folder,
      titleEn: existingInfo.titleEn || folder,
      pdfUrl: pdfData ? pdfData.url : '',
      pdf: pdfData,
      audioTracks,
      notes: existingInfo.notes || '',
    });
  }

  // 2. Cover
  if (fs.existsSync(COVER_FILE)) {
    const key = 'books/Cover/Cover.pdf';
    manifest.cover = {
      r2Key: key,
      url: `/api/r2/${encodeURI(key)}`,
      size: formatBytes(fs.statSync(COVER_FILE).size)
    };
    uploadTasks.push(() => uploadFileIfNeeded(COVER_FILE, key));
  }

  // 3. Full Books
  if (fs.existsSync(BOOK1_FULL)) {
    const key = 'books/full/EPS_TOPIK_Book_1_Full.pdf';
    manifest.fullBooks.push({
      id: 'book-1-full',
      title: 'EPS-TOPIK Book 1 (Full)',
      bookPart: 1,
      r2Key: key,
      url: `/api/r2/${encodeURI(key)}`,
      size: formatBytes(fs.statSync(BOOK1_FULL).size)
    });
    uploadTasks.push(() => {
      console.log(`[UPLOADING] Book 1 Full (${formatBytes(fs.statSync(BOOK1_FULL).size)})...`);
      return uploadFileIfNeeded(BOOK1_FULL, key);
    });
  }

  if (fs.existsSync(BOOK2_FULL)) {
    const key = 'books/full/EPS_TOPIK_Book_2_Full.pdf';
    manifest.fullBooks.push({
      id: 'book-2-full',
      title: 'EPS-TOPIK Book 2 (Full)',
      bookPart: 2,
      r2Key: key,
      url: `/api/r2/${encodeURI(key)}`,
      size: formatBytes(fs.statSync(BOOK2_FULL).size)
    });
    uploadTasks.push(() => {
      console.log(`[UPLOADING] Book 2 Full (${formatBytes(fs.statSync(BOOK2_FULL).size)})...`);
      return uploadFileIfNeeded(BOOK2_FULL, key);
    });
  }

  console.log(`📋 Total files queued for R2 upload: ${uploadTasks.length}`);

  let lastReportedPct = -1;
  const startTime = Date.now();
  await runQueue(uploadTasks, 4, (completed, total) => {
    const pct = Math.floor((completed / total) * 100);
    if (pct % 5 === 0 && pct !== lastReportedPct) {
      lastReportedPct = pct;
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      console.log(`Progress: [${completed}/${total}] ${pct}% completed (${elapsedSec}s elapsed)...`);
    }
  });

  console.log("====================================================");
  console.log("✅ All files verified and uploaded to Cloudflare R2!");
  console.log("====================================================");

  // Write manifest
  const manifestPath = path.join(process.cwd(), 'data', 'r2-books-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`📄 Saved manifest: ${manifestPath}`);

  // Update data/eps-book-chapters.json with chapters 1 to 60
  const standard60Chapters = manifest.chapters.filter(c => c.chapter >= 1 && c.chapter <= 60);
  standard60Chapters.sort((a, b) => a.chapter - b.chapter);

  const updatedEpsChapters = standard60Chapters.map(c => {
    const existing = existingChaptersMap.get(c.chapter) || {};
    return {
      id: c.chapter,
      chapter: c.chapter,
      bookPart: c.bookPart,
      titleKo: existing.titleKo || c.titleKo,
      titleNe: existing.titleNe || c.titleNe,
      titleEn: existing.titleEn || c.titleEn,
      pdfUrl: c.pdfUrl,
      coverImage: existing.coverImage || `/uploads/eps-chapters/covers/cover_${String(c.chapter).padStart(2, '0')}.jpg`,
      audioTracks: c.audioTracks.map(t => ({
        id: t.id,
        name: t.name,
        url: t.url,
        fileName: t.fileName,
        fileSize: t.fileSize,
        textKo: ""
      })),
      notes: existing.notes || "",
    };
  });

  fs.writeFileSync(existingJsonPath, JSON.stringify(updatedEpsChapters, null, 2), 'utf-8');
  console.log(`🎉 Updated data/eps-book-chapters.json with all 60 chapters & audio tracks!`);
}

main().catch(err => {
  console.error("FATAL ERROR in upload:", err);
  process.exit(1);
});
