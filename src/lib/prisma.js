import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis;

function getResolvedDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl) return undefined;
  if (envUrl.startsWith('file:')) {
    const rawPath = envUrl.slice(5);
    if (!path.isAbsolute(rawPath)) {
      // Check candidate locations for SQLite file
      const inPrisma = path.resolve(process.cwd(), 'prisma', path.basename(rawPath));
      const inCwd = path.resolve(process.cwd(), rawPath);
      if (fs.existsSync(inPrisma)) {
        return `file:${inPrisma}`;
      } else if (fs.existsSync(inCwd)) {
        return `file:${inCwd}`;
      } else {
        return `file:${inPrisma}`;
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
