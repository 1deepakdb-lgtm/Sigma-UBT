import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sigma-ubt-production-secret-key-2026'
);

// Define protected route prefixes and the roles permitted to access them
const ROUTE_PERMISSIONS = [
  // Super-admin-only routes (most sensitive)
  { prefix: '/admin', allowedRoles: ['admin'] },
  { prefix: '/api/admin', allowedRoles: ['admin'] },
  // Institute-level routes
  { prefix: '/institute', allowedRoles: ['institute', 'admin', 'staff'] },
  { prefix: '/api/institute', allowedRoles: ['institute', 'admin', 'staff'] },
  // Student-level routes
  { prefix: '/student', allowedRoles: ['student', 'admin', 'institute'] },
  { prefix: '/api/student', allowedRoles: ['student', 'admin', 'institute'] },
  // Upload: admin and institute only (not staff)
  { prefix: '/api/upload', allowedRoles: ['admin', 'institute'] },
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Extract session token from cookie
  const sessionToken = req.cookies.get('sigma_session')?.value;
  let userPayload = null;

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, SECRET);
      userPayload = payload;
    } catch (err) {
      userPayload = null;
    }
  }

  // Fallback: check Authorization Bearer token for API routes (NO header-based role spoofing allowed)
  if (!userPayload && pathname.startsWith('/api/')) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { payload } = await jwtVerify(authHeader.split(' ')[1], SECRET);
        userPayload = payload;
      } catch (e) {
        // Invalid token — leave userPayload null, will be rejected below
      }
    }
    // SECURITY: x-user-role / x-role header bypass has been intentionally removed.
    // Identity MUST come from a valid, signed JWT only.
  }

  // 1. Root / Login Page Handling: Redirect authenticated users to their portal
  if (pathname === '/') {
    if (userPayload && userPayload.role) {
      if (userPayload.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      } else if (userPayload.role === 'institute') {
        return NextResponse.redirect(new URL('/institute', req.url));
      } else if (userPayload.role === 'staff') {
        return NextResponse.redirect(new URL('/institute?tab=billing', req.url));
      } else if (userPayload.role === 'student') {
        return NextResponse.redirect(new URL('/student', req.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Check Protected Routes
  const matchedRule = ROUTE_PERMISSIONS.find((rule) => pathname.startsWith(rule.prefix));

  if (matchedRule) {
    const isApiRoute = pathname.startsWith('/api/');

    // Case A: Unauthenticated
    if (!userPayload) {
      if (isApiRoute) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Authentication required. Missing or expired session.'
          },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/', req.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    // Case B: Insufficient Role Permissions (RBAC Violation)
    if (!matchedRule.allowedRoles.includes(userPayload.role)) {
      if (isApiRoute) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: `Role '${userPayload.role}' does not have permission to access ${pathname}. Required: [${matchedRule.allowedRoles.join(', ')}]`
          },
          { status: 403 }
        );
      }

      // Redirect user to their own authorized dashboard
      let redirectPath = '/student';
      if (userPayload.role === 'admin') redirectPath = '/admin';
      else if (userPayload.role === 'institute') redirectPath = '/institute';

      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    // Pass verified user identity to downstream route handlers via headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', userPayload.id || '');
    requestHeaders.set('x-user-role', userPayload.role || '');
    requestHeaders.set('x-user-name', userPayload.name || '');
    requestHeaders.set('x-institute-id', userPayload.instituteId || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, logos, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|mp3|wav|ogg|pdf)).*)',
  ],
};
