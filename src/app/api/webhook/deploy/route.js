import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getSessionUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
export const dynamic = 'force-dynamic';

const DEPLOY_SECRET = process.env.DEPLOY_SECRET || 'examjk_deploy_2026';

/**
 * Validate that the caller is authorized:
 * - Query param ?key=... or ?secret=...
 * - Header x-deploy-key or x-deploy-secret
 * - Or authenticated Admin user via session
 */
async function isAuthorized(req) {
  const url = new URL(req.url);
  const secretParam = url.searchParams.get('key') || url.searchParams.get('secret');
  if (secretParam && secretParam === DEPLOY_SECRET) {
    return { authorized: true, user: 'Secret Key Token' };
  }

  const headerSecret = req.headers.get('x-deploy-key') || req.headers.get('x-deploy-secret');
  if (headerSecret && headerSecret === DEPLOY_SECRET) {
    return { authorized: true, user: 'Header Token' };
  }

  // GitHub Webhook Ping/Push with query token
  const githubEvent = req.headers.get('x-github-event');
  if (githubEvent && secretParam === DEPLOY_SECRET) {
    return { authorized: true, user: `GitHub Webhook (${githubEvent})` };
  }

  // Admin session verification
  try {
    const session = await getSessionUser(req);
    if (session && session.role === 'admin') {
      return { authorized: true, user: session.name || session.email || 'Admin User' };
    }
  } catch {
    // Ignore session failure
  }

  return { authorized: false };
}

/**
 * Resolve working repository path
 */
function getRepoDir() {
  const cpanelRepo = '/home/examjkco/repositories/Sigma-UBT';
  if (fs.existsSync(cpanelRepo)) {
    return cpanelRepo;
  }
  return process.cwd();
}

/**
 * Execute Git Sync and return output steps
 */
async function runDeployTasks(repoDir) {
  const logs = [];
  const addLog = (msg) => logs.push(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);

  const execOpts = {
    cwd: repoDir,
    env: {
      ...process.env,
      PATH: `${process.env.PATH || ''}:/usr/local/bin:/usr/bin:/bin:/usr/local/cpanel/3rdparty/bin:/opt/cpanel/ea-git/bin`
    }
  };

  addLog(`📁 Working directory: ${repoDir}`);

  // 1. Database backup
  const dbPath = path.join(repoDir, 'prisma', 'dev.db');
  const dbBackup = path.join(repoDir, 'prisma', 'dev.db.cpanel_backup');
  if (fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(dbPath, dbBackup);
      addLog(`🛡️ Backed up SQLite database to prisma/dev.db.cpanel_backup`);
    } catch (e) {
      addLog(`⚠️ Database backup warning: ${e.message}`);
    }
  }

  // 2. Git stash
  try {
    const res = await execAsync('git stash --include-untracked', execOpts);
    const stashOut = String(res?.stdout || '').trim();
    addLog(`📦 Git stash: ${stashOut || 'No local untracked conflicts'}`);
  } catch (e) {
    addLog(`⚠️ Git stash notice: ${e.message}`);
  }

  // 3. Git fetch origin main
  try {
    addLog(`🌐 Fetching latest changes from origin/main...`);
    try {
      await execAsync('rm -f .git/index.lock .git/refs/remotes/origin/*\\ *', execOpts);
    } catch {}
    const { stdout, stderr } = await execAsync('git fetch origin main --force', execOpts);
    const outStr = stdout ? String(stdout).trim() : '';
    const errStr = stderr ? String(stderr).trim() : '';
    if (outStr) addLog(`⬇️ Fetch output:\n${outStr}`);
    if (errStr) addLog(`ℹ️ Fetch details: ${errStr}`);
  } catch (e) {
    addLog(`❌ Git fetch failed: ${e.message}`);
    throw new Error(`Git fetch failed: ${e.message}`);
  }

  // 4. Git reset --hard origin/main
  try {
    addLog(`🔄 Resetting local tree to origin/main...`);
    const { stdout } = await execAsync('git reset --hard origin/main', execOpts);
    const outStr = stdout ? String(stdout).trim() : '';
    addLog(`✅ Reset output:\n${outStr}`);
  } catch (e) {
    addLog(`❌ Git reset failed: ${e.message}`);
    throw new Error(`Git reset failed: ${e.message}`);
  }

  // 5. CloudLinux node_modules symlink check
  const nodeModulesPath = path.join(repoDir, 'node_modules');
  try {
    const stat = fs.lstatSync(nodeModulesPath);
    if (stat.isDirectory() && !stat.isSymbolicLink()) {
      addLog(`🧹 Cleaning conflicting physical node_modules for CloudLinux symlink compatibility...`);
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    }
  } catch {
    // node_modules check completed
  }

  // 5b. Ensure Python edge-tts package is installed for cPanel user
  try {
    addLog(`🐍 Ensuring edge-tts python dependency is installed...`);
    const pipRes = await execAsync('python3 -m pip install --user --upgrade edge-tts 2>&1 || pip3 install --user --upgrade edge-tts 2>&1', execOpts);
    const pipOut = String(pipRes?.stdout || '').trim();
    if (pipOut) addLog(`🐍 Pip details: ${pipOut.slice(0, 150)}`);
    addLog(`✅ edge-tts package verified.`);

    // Diagnostic test of python & edge_tts
    try {
      const pInfo = await execAsync('python3 --version 2>&1', execOpts);
      addLog(`🐍 Python version: ${String(pInfo.stdout || '').trim()}`);
      const pyTest = await execAsync('python3 -c "import sys; print(sys.path); import edge_tts; print(edge_tts.__file__)" 2>&1', execOpts);
      addLog(`🐍 Edge_tts file: ${String(pyTest.stdout || '').trim()}`);
    } catch (pe) {
      addLog(`❌ Python check error: ${pe.stdout || pe.stderr || pe.message}`);
    }
  } catch (e) {
    addLog(`ℹ️ edge-tts pip check notice: ${e.message}`);
  }

  // 6. Phusion Passenger restart trigger
  const tmpDir = path.join(repoDir, 'tmp');
  const restartFile = path.join(tmpDir, 'restart.txt');
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(restartFile, `Restart triggered by ExamJK Deploy at ${new Date().toISOString()}\n`);
    addLog(`🔄 Touched tmp/restart.txt — Phusion Passenger reload initiated.`);

    try {
      exec("nohup sh -c 'sleep 3 && pkill -9 -u examjkco node' >/dev/null 2>&1 &");
      addLog(`⚡ Scheduled background node worker refresh (pkill) in 3s.`);
    } catch {}
  } catch (e) {
    addLog(`⚠️ Restart touch warning: ${e.message}`);
  }

  // 7. Latest commit details
  let latestCommit = '';
  try {
    const res = await execAsync('git log -1 --format="%h - %s (%cr) by %an"', execOpts);
    latestCommit = String(res?.stdout || '').trim();
    addLog(`📌 Current deployed commit: ${latestCommit}`);
  } catch (e) {
    addLog(`⚠️ Could not read latest commit: ${e.message}`);
  }

  return { success: true, latestCommit, logs };
}

/**
 * Handle GET requests:
 * If browser requests HTML -> render live styled console
 * If JSON requested -> return JSON payload
 */
export async function GET(req) {
  const auth = await isAuthorized(req);
  if (!auth.authorized) {
    return new Response(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#0f172a;color:#f87171;">
        <h2>⛔ 401 Unauthorized</h2>
        <p>You must provide a valid secret key or be logged in as Super Admin.</p>
        <p style="color:#94a3b8;font-size:14px;">Example: <code>https://examjk.com/api/webhook/deploy?key=examjk_deploy_2026</code></p>
      </body></html>`,
      { status: 401, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const url = new URL(req.url);
  const repoDir = getRepoDir();
  const format = url.searchParams.get('format');
  const acceptHeader = req.headers.get('accept') || '';

  try {
    const result = await runDeployTasks(repoDir);

    if (format === 'json' || acceptHeader.includes('application/json')) {
      return NextResponse.json(result);
    }

    // Render HTML console response
    const logHtml = result.logs
      .map((l) => `<div style="margin: 4px 0; font-family: monospace;">${escapeHtml(l)}</div>`)
      .join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ExamJK Live Deployment Console</title>
  <style>
    body {
      background-color: #0b0f19;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      padding: 30px;
      margin: 0;
    }
    .card {
      max-width: 900px;
      margin: 0 auto;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    .header {
      padding: 20px 24px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-size: 18px;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: #10b981;
      color: #064e3b;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      text-transform: uppercase;
    }
    .terminal {
      background: #030712;
      padding: 24px;
      color: #34d399;
      font-size: 13.5px;
      line-height: 1.6;
      max-height: 550px;
      overflow-y: auto;
      border-top: 1px solid #1f2937;
    }
    .footer {
      padding: 16px 24px;
      background: #0f172a;
      border-top: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #94a3b8;
    }
    .btn {
      background: #2563eb;
      color: #ffffff;
      padding: 8px 18px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      display: inline-block;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">
        <span>⚡ ExamJK Real-Time cPanel Deployment</span>
      </div>
      <div class="badge">Deployed & Active</div>
    </div>
    <div class="terminal">
      ${logHtml}
    </div>
    <div class="footer">
      <div>Authorized by: <strong style="color: #cbd5e1;">${escapeHtml(auth.user)}</strong></div>
      <div>
        <a href="/api/webhook/deploy?key=${encodeURIComponent(DEPLOY_SECRET)}" class="btn">🔄 Re-Pull Latest Git</a>
        <a href="/admin/dictionary" class="btn" style="background: #374151; margin-left: 8px;">Open Dictionary</a>
      </div>
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * Handle POST requests (GitHub Webhooks or API triggers)
 */
export async function POST(req) {
  const auth = await isAuthorized(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized', message: 'Invalid deploy secret.' }, { status: 401 });
  }

  const repoDir = getRepoDir();
  try {
    const result = await runDeployTasks(repoDir);
    return NextResponse.json({
      success: true,
      user: auth.user,
      latestCommit: result.latestCommit,
      logs: result.logs
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
