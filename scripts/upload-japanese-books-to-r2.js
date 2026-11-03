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

  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: r2Key }));
    if (head.ContentLength === size) {
      return { status: 'skipped', r2Key, size, contentType };
    }
  } catch (err) {
    // File not in R2 yet
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
        partSize: 5 * 1024 * 1024,
        queueSize: 3,
        leavePartsOnError: false,
      });

      await uploader.done();
      return { status: 'uploaded', r2Key, size, contentType };
    } catch (err) {
      if (attempt === maxRetries) {
        throw new Error(`Failed to upload ${r2Key}: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

async function main() {
  console.log("====================================================");
  console.log("🇯🇵 Uploading Japanese Materials to Cloudflare R2:", R2_BUCKET_NAME);
  console.log("====================================================");

  const manifest = {
    generatedAt: new Date().toISOString(),
    bucket: R2_BUCKET_NAME,
    minnaLessons: [],
    n3Units: [],
    fullBooks: []
  };

  const MINNA_DIR = '/Users/deepakbhatt/Downloads/untitled folder 2/Minna_no_Nihongo_Chapter_Folders';
  const N3_DIR = '/Users/deepakbhatt/Downloads/untitled folder 2/Nihongo_Soumatome_N3_Goi_Unit_Folders (2)';
  const AUDIO_DIR = '/Users/deepakbhatt/Downloads/0-0001-01-240000';

  // 1. Minna no Nihongo Chapters 1-50
  if (fs.existsSync(MINNA_DIR)) {
    const folders = fs.readdirSync(MINNA_DIR);
    for (let ch = 1; ch <= 50; ch++) {
      const folderName = `Chapter ${ch}`;
      const folderPath = path.join(MINNA_DIR, folderName);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        const pdfFile = files.find(f => f.endsWith('.pdf'));
        let pdfInfo = null;

        if (pdfFile) {
          const localPdf = path.join(folderPath, pdfFile);
          const stat = fs.statSync(localPdf);
          const r2Key = `books/japanese/minna-nihongo/${folderName}/${pdfFile}`;
          try {
            const res = await uploadFileIfNeeded(localPdf, r2Key);
            console.log(`[Minna Ch ${ch}] ${res.status}: ${pdfFile} (${formatBytes(stat.size)})`);
            pdfInfo = {
              fileName: pdfFile,
              fileSize: formatBytes(stat.size),
              r2Key,
              url: `/api/r2/${r2Key.split('/').map(encodeURIComponent).join('/')}`
            };
          } catch (err) {
            console.error(`Error uploading ${localPdf}:`, err.message);
          }
        }

        const level = ch <= 25 ? 'N5' : 'N4';
        const bookPart = ch <= 25 ? 1 : 2;

        manifest.minnaLessons.push({
          chapter: ch,
          lesson: ch,
          level,
          bookPart,
          folder: folderName,
          pdf: pdfInfo,
          pdfUrl: pdfInfo?.url || null
        });
      }
    }
  }

  // 2. Nihongo Soumatome N3 Units (Week 1-6)
  if (fs.existsSync(N3_DIR)) {
    const weeks = fs.readdirSync(N3_DIR).filter(w => w.startsWith('Week ')).sort();
    for (const week of weeks) {
      const weekPath = path.join(N3_DIR, week);
      const units = fs.readdirSync(weekPath).filter(u => u.startsWith('Unit ')).sort();
      for (const unit of units) {
        const unitPath = path.join(weekPath, unit);
        const files = fs.readdirSync(unitPath);
        const pdfFile = files.find(f => f.endsWith('.pdf'));
        let pdfInfo = null;

        if (pdfFile) {
          const localPdf = path.join(unitPath, pdfFile);
          const stat = fs.statSync(localPdf);
          const r2Key = `books/japanese/soumatome-n3/${week}/${unit}/${pdfFile}`;
          try {
            const res = await uploadFileIfNeeded(localPdf, r2Key);
            console.log(`[N3 ${week} ${unit}] ${res.status}: ${pdfFile} (${formatBytes(stat.size)})`);
            pdfInfo = {
              fileName: pdfFile,
              fileSize: formatBytes(stat.size),
              r2Key,
              url: `/api/r2/${r2Key.split('/').map(encodeURIComponent).join('/')}`
            };
          } catch (err) {
            console.error(`Error uploading ${localPdf}:`, err.message);
          }
        }

        manifest.n3Units.push({
          level: 'N3',
          week,
          unit,
          title: `Soumatome N3 ${week} ${unit}`,
          pdf: pdfInfo,
          pdfUrl: pdfInfo?.url || null
        });
      }
    }
  }

  // 3. JLPT N2 Chapters (1-18, Front & Back Matter)
  const N2_DIR = '/Users/deepakbhatt/Downloads/N2_Unit_Wise_Folders (4)';
  manifest.n2Units = [];
  if (fs.existsSync(N2_DIR)) {
    const folders = fs.readdirSync(N2_DIR).filter(f => !f.startsWith('.')).sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || (a.includes('Front') ? -1 : 999);
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || (b.includes('Front') ? -1 : 999);
      return numA - numB;
    });

    for (const folderName of folders) {
      const folderPath = path.join(N2_DIR, folderName);
      if (fs.statSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath);
        const pdfFile = files.find(f => f.endsWith('.pdf'));
        let pdfInfo = null;

        if (pdfFile) {
          const localPdf = path.join(folderPath, pdfFile);
          const stat = fs.statSync(localPdf);
          const r2Key = `books/japanese/n2/${folderName}/${pdfFile}`;
          try {
            const res = await uploadFileIfNeeded(localPdf, r2Key);
            console.log(`[N2 ${folderName}] ${res.status}: ${pdfFile} (${formatBytes(stat.size)})`);
            pdfInfo = {
              fileName: pdfFile,
              fileSize: formatBytes(stat.size),
              r2Key,
              url: `/api/r2/${r2Key.split('/').map(encodeURIComponent).join('/')}`
            };
          } catch (err) {
            console.error(`Error uploading ${localPdf}:`, err.message);
          }
        }

        manifest.n2Units.push({
          level: 'N2',
          chapter: folderName,
          title: `JLPT N2 ${folderName}`,
          pdf: pdfInfo,
          pdfUrl: pdfInfo?.url || null
        });
      }
    }
  }

  // 4. Full Textbooks if available
  const fullBookPaths = [
    { title: 'Minna no Nihongo I (Beginner)', file: '/Users/deepakbhatt/Downloads/toaz.info-minna-no-nihongo-beginner-i-textbookpdf-pr_d07288153db874dc1e450f2d167f9587.pdf', r2Key: 'books/japanese/full/Minna_no_Nihongo_I_Full.pdf', level: 'N5' },
    { title: 'Minna no Nihongo II (Elementary)', file: '/Users/deepakbhatt/Downloads/toaz.info-minna-no-nihongo-ii-main-textbook-pr_450aee81cd76f1fb5c071d5e7e711198.pdf', r2Key: 'books/japanese/full/Minna_no_Nihongo_II_Full.pdf', level: 'N4' },
    { title: 'Nihongo Soumatome N3 Goi (Vocabulary)', file: '/Users/deepakbhatt/Downloads/Nihongo_Soumatome_N3-Goi.pdf', r2Key: 'books/japanese/full/Nihongo_Soumatome_N3_Goi.pdf', level: 'N3' },
    { title: 'Nihongo Soumatome N3 Choukai (Listening)', file: '/Users/deepakbhatt/Downloads/Nihongo_Soumatome_N3-Choukai.pdf', r2Key: 'books/japanese/full/Nihongo_Soumatome_N3_Choukai.pdf', level: 'N3' },
    { title: 'JLPT N2 Complete Textbook', file: '/Users/deepakbhatt/Downloads/untitled folder 2/n2.pdf', r2Key: 'books/japanese/full/JLPT_N2_Complete_Textbook.pdf', level: 'N2' }
  ];

  for (const b of fullBookPaths) {
    if (fs.existsSync(b.file)) {
      const stat = fs.statSync(b.file);
      try {
        const res = await uploadFileIfNeeded(b.file, b.r2Key);
        console.log(`[Full Book] ${res.status}: ${b.title} (${formatBytes(stat.size)})`);
        manifest.fullBooks.push({
          title: b.title,
          level: b.level,
          fileSize: formatBytes(stat.size),
          r2Key: b.r2Key,
          url: `/api/r2/${b.r2Key.split('/').map(encodeURIComponent).join('/')}`
        });
      } catch (e) {
        console.error(`Error uploading full book ${b.title}:`, e.message);
      }
    }
  }

  // Write manifest
  const manifestPath = path.join(process.cwd(), 'data', 'r2-japanese-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\n✅ Saved Japanese R2 manifest to ${manifestPath}`);
  console.log(`   - Minna Lessons: ${manifest.minnaLessons.length}`);
  console.log(`   - N3 Units: ${manifest.n3Units.length}`);
  console.log(`   - N2 Units: ${manifest.n2Units.length}`);
  console.log(`   - Full Textbooks: ${manifest.fullBooks.length}`);
}

main().catch(console.error);
