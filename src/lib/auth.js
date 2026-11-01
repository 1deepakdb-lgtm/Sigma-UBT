import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET_VALUE = (process.env.JWT_SECRET || 'sigma-ubt-production-secret-key-2026').trim();

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'sigma-ubt-production-secret-key-2026')) {
  console.warn('[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.');
}

const SECRET = new TextEncoder().encode(JWT_SECRET_VALUE);

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(req) {
  try {
    let token = null;
    if (req) {
      // Check cookies on NextRequest
      const cookieHeader = req.cookies.get('sigma_session')?.value;
      if (cookieHeader) token = cookieHeader;
      else {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }
    } else {
      // Server Component context
      const cookieStore = cookies();
      token = cookieStore.get('sigma_session')?.value;
    }

    if (!token) return null;
    return await verifyToken(token);
  } catch (err) {
    return null;
  }
}
