import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  response.cookies.delete('sigma_session');
  response.cookies.set('sigma_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    maxAge: 0,
    path: '/'
  });

  return response;
}

export async function GET(req) {
  const loginUrl = new URL('/', req.url);
  const response = NextResponse.redirect(loginUrl);

  response.cookies.delete('sigma_session');
  response.cookies.set('sigma_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    maxAge: 0,
    path: '/'
  });

  return response;
}

