import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';
import { getRateLimitKey, checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/rateLimiter';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // ─── Brute-Force Protection ──────────────────────────────────────────────
    const rateLimitKey = getRateLimitKey(req);
    const { limited, retriesLeft, retryAfterMs } = checkRateLimit(rateLimitKey);

    if (limited) {
      const minutesLeft = Math.ceil(retryAfterMs / 60000);
      return NextResponse.json(
        {
          error: 'Too many failed login attempts.',
          message: `Account temporarily locked. Please try again in ${minutesLeft} minute(s).`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    const identifier = (username || '').trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { username: identifier.toLowerCase() },
          { phone: identifier },
          { id: identifier }
        ]
      },
      include: { institute: true }
    });

    if (!user) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid username or password', retriesLeft: retriesLeft - 1 },
        { status: 401 }
      );
    }

    // Verify password (bcrypt hash only — plain-text comparison removed for security)
    let isMatch = false;
    try {
      isMatch = await verifyPassword(password, user.passwordHash);
    } catch (e) {
      isMatch = false;
    }

    if (!isMatch) {
      recordFailedAttempt(rateLimitKey);
      const afterFail = checkRateLimit(rateLimitKey);
      return NextResponse.json(
        {
          error: 'Invalid username or password',
          retriesLeft: afterFail.retriesLeft,
        },
        { status: 401 }
      );
    }

    if (user.status === 'Blocked') {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Contact the administrator.' },
        { status: 403 }
      );
    }

    // Check institute subscription expiry for non-admin users
    if (user.role === 'institute' || user.role === 'student' || user.role === 'staff') {
      if (user.institute) {
        const isExpired = new Date(user.institute.expireDate + 'T23:59:59') < new Date();
        if (isExpired) {
          await prisma.institute.update({
            where: { id: user.institute.id },
            data: { status: 'Expired' }
          });
          return NextResponse.json(
            { error: 'Institute subscription has expired. Please contact administrator.' },
            { status: 403 }
          );
        }
      }
    }

    // ─── Successful Login ────────────────────────────────────────────────────
    // Clear any previous failed attempts for this IP
    clearRateLimit(rateLimitKey);

    const tokenPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      instituteId: user.instituteId,
      instituteName: user.institute?.name || null
    };

    const token = await signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: tokenPayload
    });

    // Secure HTTP-only cookie — never accessible from JavaScript
    response.cookies.set('sigma_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',  // Upgraded from 'lax' to 'strict' for CSRF hardening
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
