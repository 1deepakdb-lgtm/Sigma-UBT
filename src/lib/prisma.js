import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis;

function getResolvedDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL;
  
  // Explicit known cPanel production path fallback
  const cpanelProdDb = '/home/examjkco/sigma-ubt/prisma/dev.db';
  if (fs.existsSync(cpanelProdDb)) {
    return `file:${cpanelProdDb}`;
  }

  if (!envUrl) {
    const defaultLocal = path.resolve(process.cwd(), 'prisma', 'dev.db');
    return `file:${defaultLocal}`;
  }

  if (envUrl.startsWith('file:')) {
    const rawPath = envUrl.slice(5);
    if (fs.existsSync(rawPath)) {
      return `file:${rawPath}`;
    }
    if (!path.isAbsolute(rawPath)) {
      const inPrisma = path.resolve(process.cwd(), 'prisma', path.basename(rawPath));
      const inCwd = path.resolve(process.cwd(), rawPath);
      if (fs.existsSync(inPrisma)) {
        return `file:${inPrisma}`;
      } else if (fs.existsSync(inCwd)) {
        return `file:${inCwd}`;
      }
    }
  }
  return envUrl;
}

const resolvedDbUrl = getResolvedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: resolvedDbUrl ? { db: { url: resolvedDbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Auto-configure SQLite for high concurrency (WAL mode & 10s busy timeout)
if (typeof window === 'undefined') {
  prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    .then(() => prisma.$queryRawUnsafe('PRAGMA busy_timeout = 10000;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;'))
    .catch((err) => {
      console.warn('SQLite PRAGMA setup notice:', err?.message || err);
    });
}

export default prisma;
