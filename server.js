import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure process working directory is ALWAYS the application root (cPanel Passenger fix)
try {
  process.chdir(__dirname);
} catch (chdirErr) {
  console.warn('Warning: Unable to chdir to __dirname:', chdirErr);
}

// Ensure Prisma client is generated if node_modules is symlinked
try {
  const prismaClientDir = path.join(__dirname, 'node_modules', '@prisma', 'client');
  if (!fs.existsSync(prismaClientDir)) {
    console.log('[ExamJK] Prisma client not found. Running prisma generate...');
    try {
      execSync('npx prisma generate', {
        cwd: __dirname,
        stdio: 'inherit',
        timeout: 60000
      });
      console.log('[ExamJK] Prisma client generated successfully!');
    } catch (cmdErr) {
      console.warn('[ExamJK] Prisma generate warning:', cmdErr?.message);
    }
  }
} catch (e) {
  console.warn('[ExamJK] Auto-repair check notice:', e?.message);
}

// Manually load .env if process.env.DATABASE_URL is missing (cPanel/Passenger fix)
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.error('Error loading .env file:', e);
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}
const dev = process.env.NODE_ENV === 'development';

// cPanel Passenger assigns PORT dynamically via environment variable
const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = 'localhost';

// Common MIME types for static asset direct delivery
const MIME_TYPES = {
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

// Initialize Next.js app with explicit directory path
const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        const { pathname } = parsedUrl;

        // 1. Direct Static Asset Serving for Next.js build chunks
        // Prevents 500 errors on cPanel/LiteSpeed when chunks are requested
        if (pathname && pathname.startsWith('/_next/static/')) {
          const relativePath = pathname.replace('/_next/static/', '');
          const filePath = path.join(__dirname, '.next', 'static', relativePath);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            return fs.createReadStream(filePath).pipe(res);
          }
        }

        // 2. Direct Static Asset Serving for Public folder (images, icons, etc.)
        if (pathname && (pathname.startsWith('/images/') || pathname.startsWith('/uploads/') || pathname.startsWith('/icons/') || pathname === '/favicon.ico' || pathname === '/icon-192.png' || pathname === '/manifest.json')) {
          const publicFilePath = path.join(__dirname, 'public', pathname.startsWith('/') ? pathname.slice(1) : pathname);
          if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
            const ext = path.extname(publicFilePath).toLowerCase();
            res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return fs.createReadStream(publicFilePath).pipe(res);
          }
        }

        // 3. Delegate all other routes to Next.js Request Handler
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', req.url, err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Internal Server Error: ' + (err?.message || 'Server Exception'));
        }
      }
    })
      .once('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
      })
      .listen(port, hostname, () => {
        console.log(`> ExamJK Server ready on http://${hostname}:${port}`);
      });
  })
  .catch((err) => {
    console.error('Failed to prepare Next.js app:', err);
    process.exit(1);
  });
