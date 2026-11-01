import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Auto-configure SQLite for high concurrency (WAL mode & 10s busy timeout)
if (typeof window === 'undefined' && process.env.DATABASE_URL?.startsWith('file:')) {
  prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    .then(() => prisma.$queryRawUnsafe('PRAGMA busy_timeout = 10000;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;'))
    .catch(() => {});
}

export default prisma;
