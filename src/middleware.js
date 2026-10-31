import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sigma-ubt-production-secret-key-2026'
);

// ─── Security Constants ────────────────────────────────────────────────────────
const MAX_REQUEST_BODY_BYTES = 10 * 1024 * 1024; // 10 MB for regular API routes
const ADMIN_MAX_REQUEST_BODY_BYTES = 1 * 1024 * 1024; // 1 MB for admin routes

// Patterns to detect injection in URL query params
const INJECTION_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /union\s+select/i,
  /'\s*(or|and)\s*'/i,
  /;\s*(drop|delete|insert|update|exec)/i,
  /%3cscript/i,
  /\.\.\//,
  /%00/,
  /\x00/,
];

// Blocked security scanner user agents
const BLOCKED_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i,
  /burpsuite/i, /acunetix/i, /nessus/i, /openvas/i, /metasploit/i,
  /dirbuster/i, /gobuster/i, /wfuzz/i, /hydra/i,
];

// Define protected route prefixes and the roles permitted to access them
const ROUTE_PERMISSIONS = [
  // Super-admin-only routes (most sensitive)
  { prefix: '/api/admin/packages', allowedRoles: ['admin', 'institute', 'student'] },
  { prefix: '/api/admin/questions', allowedRoles: ['admin', 'institute', 'student'] },
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

/**
 * Scan URL search params for injection attempts.
 */
function hasInjectionInQuery(url) {
  const queryString = url.search || '';
  if (!queryString) return false;
  try {
    const decoded = decodeURIComponent(queryString);
    return INJECTION_PATTERNS.some((p) => p.test(decoded));
  } catch {
    return false;
  }
}

/**
 * Check if Content-Length header exceeds the allowed limit.
 */
function isPayloadTooLarge(req, isAdminRoute) {
  const contentLength = req.headers.get('content-length');
  if (!contentLength) return false;
  const bytes = parseInt(contentLength, 10);
  if (isNaN(bytes)) return false;
  const limit = isAdminRoute ? ADMIN_MAX_REQUEST_BODY_BYTES : MAX_REQUEST_BODY_BYTES;
  return bytes > limit;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // ─── 1. Block Injection in URL Query Strings ─────────────────────────────
  if (hasInjectionInQuery(req.nextUrl)) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Malicious input detected in request.' },
      { status: 400 }
    );
  }

  // ─── 2. Enforce Request Body Size Limits ──────────────────────────────────
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const isAdminRoute = pathname.startsWith('/api/admin');
    if (isPayloadTooLarge(req, isAdminRoute)) {
      return NextResponse.json(
        { error: 'Payload Too Large', message: 'Request body exceeds the allowed size limit.' },
        { status: 413 }
      );
    }
  }

  // ─── 3. Block Known Security Scanner User-Agents ──────────────────────────
  const userAgent = req.headers.get('user-agent') || '';
  if (BLOCKED_UA_PATTERNS.some((p) => p.test(userAgent))) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Access denied.' },
      { status: 403 }
    );
  }

  // ─── 4. JWT Session Verification ─────────────────────────────────────────
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

  // ─── 5. Admin Route Extra Hardening ───────────────────────────────────────
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    // Block if authenticated but role is not strictly 'admin'
    if (userPayload && userPayload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access only.' },
        { status: 403 }
      );
    }
    // Block cross-origin admin mutations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const referer = req.headers.get('referer') || '';
      const host = req.headers.get('host') || '';
      if (referer && !referer.includes(host) && !referer.includes('localhost')) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Cross-origin admin mutations are not allowed.' },
          { status: 403 }
        );
      }
    }
  }

  // ─── 6. Root / Login Page Handling ──────────────────────────────────────
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

  // ─── 7. Protected Route RBAC Enforcement ────────────────────────────────
  // Allow staff password reset endpoint to verify its own credentials in handler
  if (pathname === '/api/institute/staff' && method === 'PUT') {
    return NextResponse.next();
  }

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
            message: `Role '${userPayload.role}' does not have permission to access this resource.`
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
    // Only pass verified JWT claims — never reflect raw user input
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', String(userPayload.id || ''));
    requestHeaders.set('x-user-role', String(userPayload.role || ''));
    requestHeaders.set('x-user-name', String(userPayload.name || '').slice(0, 100));
    requestHeaders.set('x-institute-id', String(userPayload.instituteId || ''));

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|mp3|wav|ogg|pdf|apk|exe|dmg|zip)).*)',
  ],
};
