import { NextResponse } from 'next/server';

export async function POST(req) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  const isHttps = req.headers.get('x-forwarded-proto') === 'https' ||
    req.nextUrl?.protocol === 'https:' ||
    (typeof req.url === 'string' && req.url.startsWith('https:'));

  const cookieOptions = {
    secure: isHttps,
    sameSite: 'lax',
    expires: new Date(0),
    maxAge: 0,
    path: '/'
  };

  response.cookies.delete('sigma_session');
  response.cookies.delete('sigma_token');

  response.cookies.set('sigma_session', '', {
    ...cookieOptions,
    httpOnly: true
  });

  response.cookies.set('sigma_token', '', {
    ...cookieOptions,
    httpOnly: false
  });

  return response;
}

export async function GET(req) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'examjk.com';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const loginUrl = new URL('/?logout=true', `${proto}://${host}`);
  const response = NextResponse.redirect(loginUrl);

  const isHttps = proto === 'https';
  const cookieOptions = {
    secure: isHttps,
    sameSite: 'lax',
    expires: new Date(0),
    maxAge: 0,
    path: '/'
  };

  response.cookies.delete('sigma_session');
  response.cookies.delete('sigma_token');

  response.cookies.set('sigma_session', '', {
    ...cookieOptions,
    httpOnly: true
  });

  response.cookies.set('sigma_token', '', {
    ...cookieOptions,
    httpOnly: false
  });

  return response;
}

