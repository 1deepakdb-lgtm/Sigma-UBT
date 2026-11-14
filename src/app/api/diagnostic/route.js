import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const result = {
    cwd: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    envDatabaseUrl: process.env.DATABASE_URL || 'not_set',
    files: {},
    python: {},
    dbTest: null,
    error: null,
  };

  try {
    // Check environment PATH and system tools
    result.envPath = process.env.PATH;
    try {
      result.which = execSync('which -a python3 python pip3 pip ffmpeg git 2>&1', { timeout: 3000 }).toString().trim();
    } catch (we) {
      result.which = `which error: ${we.message}`;
    }

    try {
      result.pyFind = execSync('find /usr/bin /usr/local/bin /opt/alt /opt/cpanel -name "python3*" 2>/dev/null | head -n 20', { timeout: 3000 }).toString().trim();
    } catch (fe) {
      result.pyFind = `find error: ${fe.message}`;
    }

    // Test running tts_engine.py directly with each python
    result.ttsEngineTest = {};
    const testScript = path.join(process.cwd(), 'scripts', 'tts_engine.py');
    const diagTmpDir = path.join(process.cwd(), 'public', 'audio-cache', 'tmp');
    try { if (!fs.existsSync(diagTmpDir)) fs.mkdirSync(diagTmpDir, { recursive: true }); } catch {}
    const testOut = path.join(diagTmpDir, 'test_diag_tts.mp3');
    for (const py of ['/opt/alt/python311/bin/python3', 'python3', '/usr/bin/python3']) {
      try {
        if (fs.existsSync(testOut)) fs.unlinkSync(testOut);
        const pyVer = py.includes('311') ? '3.11' : '3.9';
        const out = execSync(`${py} "${testScript}" "안녕하세요" "ko-KR-InJoonNeural" "+0Hz" "+0%" "${testOut}" 2>&1`, {
          timeout: 8000,
          env: {
            ...process.env,
            PATH: `/opt/alt/python311/bin:/opt/alt/python310/bin:/opt/alt/python39/bin:${process.env.PATH || ''}:/usr/local/bin:/usr/bin:/bin`,
            PYTHONPATH: `/home/examjkco/.local/lib/python${pyVer}/site-packages:${process.env.PYTHONPATH || ''}`
          }
        }).toString().trim();
        const created = fs.existsSync(testOut);
        result.ttsEngineTest[py] = {
          success: created,
          size: created ? fs.statSync(testOut).size : 0,
          output: out
        };
      } catch (err) {
        result.ttsEngineTest[py] = {
          success: false,
          error: err.message,
          stdout: err.stdout?.toString(),
          stderr: err.stderr?.toString()
        };
      }
    }
    const pyBinaries = [
      'python3',
      '/usr/bin/python3',
      '/usr/local/bin/python3',
      '/opt/alt/python311/bin/python3',
      '/opt/alt/python310/bin/python3',
      '/opt/alt/python39/bin/python3',
      '/opt/alt/python38/bin/python3',
      '/home/examjkco/.local/bin/python3',
      'python'
    ];
    for (const py of pyBinaries) {
      try {
        const out = execSync(`${py} --version 2>&1`, { timeout: 2000 }).toString().trim();
        let edgeTtsVer = null;
        try {
          edgeTtsVer = execSync(`${py} -c "import edge_tts; print(edge_tts.__version__, edge_tts.__file__)" 2>&1`, { timeout: 2000 }).toString().trim();
        } catch (ee) {
          edgeTtsVer = `error: ${ee.stdout || ee.stderr || ee.message}`;
        }
        result.python[py] = { available: true, version: out, edgeTts: edgeTtsVer };
      } catch (e) {
        result.python[py] = { available: false, error: e.message };
      }
    }

    const candidates = [
      path.resolve(process.cwd(), 'prisma', 'dev.db'),
      path.resolve(process.cwd(), 'dev.db'),
      '/home/examjkco/examjk/prisma/dev.db',
      '/home/examjkco/examjk/dev.db'
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          const stat = fs.statSync(p);
          result.files[p] = {
            exists: true,
            sizeBytes: stat.size,
            mode: stat.mode.toString(8)
          };
        } catch (e) {
          result.files[p] = { exists: true, error: e.message };
        }
      } else {
        result.files[p] = { exists: false };
      }
    }

    const userCount = await prisma.user.count();
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { username: true, role: true, name: true }
    });

    result.dbTest = {
      connected: true,
      totalUsers: userCount,
      adminFound: adminUser ? adminUser.username : null,
    };
  } catch (err) {
    result.error = {
      message: err?.message || String(err),
      name: err?.name,
      stack: err?.stack,
    };
  }

  return NextResponse.json(result);
}
