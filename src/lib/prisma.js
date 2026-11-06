import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis;

function getResolvedDatabaseUrl() {
  // 1. Direct cPanel production absolute path check
  const cpanelPath = '/home/examjkco/sigma-ubt/prisma/dev.db';
  if (fs.existsSync(cpanelPath)) {
    return `file:${cpanelPath}`;
  }

  // 2. Environment variable check
  const envUrl = process.env.DATABASE_URL;
  if (envUrl) {
    if (envUrl.startsWith('file:')) {
      const cleanPath = envUrl.replace(/^file:(\/\/)?/, '');
      if (fs.existsSync(cleanPath)) {
        return `file:${cleanPath}`;
      }
    } else {
      return envUrl;
    }
  }

  // 3. Fallback to local prisma/dev.db relative to current directory
  const localPrisma = path.resolve(process.cwd(), 'prisma', 'dev.db');
  return `file:${localPrisma}`;
}

const resolvedDbUrl = getResolvedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
