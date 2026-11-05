import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
// NEVER hardcode the port — Passenger will set it automatically
const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = 'localhost';

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
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
