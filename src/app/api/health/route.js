import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const possiblePaths = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      '/home/examjkco/sigma-ubt/prisma/dev.db',
      path.join(process.cwd(), 'dev.db')
    ];
    const existingPath = possiblePaths.find(p => fs.existsSync(p));
    
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
      timestamp: new Date().toISOString(),
      cpanelDbFound: Boolean(existingPath),
      cpanelDbPath: existingPath || 'not_found',
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
    return NextResponse.json({ 
      status: 'error',
      error: err?.message || String(err) 
    }, { status: 500 });
  }
}

