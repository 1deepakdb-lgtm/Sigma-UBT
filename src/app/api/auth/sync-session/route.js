import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    let token = body.token;

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      token = req.cookies.get('sigma_session')?.value || req.cookies.get('sigma_token')?.value;
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, message: 'No session token provided' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload) {
      return NextResponse.json({ authenticated: false, message: 'Invalid or expired session token' }, { status: 401 });
    }

    const isHttps =
      req.headers.get('x-forwarded-proto') === 'https' ||
      req.nextUrl?.protocol === 'https:' ||
      (typeof req.url === 'string' && req.url.startsWith('https:'));

    const response = NextResponse.json({
      success: true,
      authenticated: true,
      user: userPayload,
      token
    });

    const cookieOptions = {
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    };

    response.cookies.set('sigma_session', token, {
      ...cookieOptions,
      httpOnly: true
    });

    response.cookies.set('sigma_token', token, {
      ...cookieOptions,
      httpOnly: false
    });

    return response;
  } catch (err) {
    console.error('Session sync error:', err);
    return NextResponse.json({ error: 'Failed to sync session', details: err?.message }, { status: 500 });
  }
}
