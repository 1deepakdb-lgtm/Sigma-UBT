import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const result = {
    cwd: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    envDatabaseUrl: process.env.DATABASE_URL || 'not_set',
    files: {},
    dbTest: null,
    error: null,
  };

  try {
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
