import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';

export async function GET() {
  try {
    const dbPath = '/home/examjkco/sigma-ubt/prisma/dev.db';
    const dbExists = fs.existsSync(dbPath);
    
    let userCount = 0;
    let dbStatus = 'untested';
    let dbError = null;

    try {
      userCount = await prisma.user.count();
      dbStatus = 'connected';
    } catch (e) {
      dbStatus = 'failed';
      dbError = e?.message || String(e);
    }

    return NextResponse.json({
      status: 'ok',
      cpanelDbExists: dbExists,
      dbStatus,
      userCount,
      dbError,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL,
        HAS_JWT: !!process.env.JWT_SECRET,
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
