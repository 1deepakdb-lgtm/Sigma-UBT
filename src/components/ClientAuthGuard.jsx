'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ClientAuthGuard
 * Client-side double layer protection. Ensures that if a user's session
 * expires or is cleared, the page will not remain visible and will
 * immediately redirect to the login page.
 */
export default function ClientAuthGuard({ allowedRoles = [], children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const retryTimer = setTimeout(() => {
      if (isMounted && !authorized) setShowRetry(true);
    }, 3500);

    function clearSessionAndRedirect() {
      try {
        document.cookie = 'sigma_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;';
        localStorage.removeItem('sigma_session');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('role');
      } catch (e) {}
      window.location.replace('/?error=unauthorized');
    }

    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          if (isMounted) clearSessionAndRedirect();
          return;
        }

        const data = await res.json();
        if (!data.authenticated || !data.user) {
          if (isMounted) clearSessionAndRedirect();
          return;
        }

        const role = data.user.role;
        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
          if (isMounted) {
            let target = '/student';
            if (role === 'admin') target = '/admin';
            else if (role === 'institute') target = '/institute';
            else if (role === 'staff') target = '/institute?tab=billing';
            window.location.replace(target);
          }
          return;
        }

        if (isMounted) {
          setAuthorized(true);
        }
      } catch (err) {
        if (isMounted) clearSessionAndRedirect();
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(retryTimer);
    };
  }, [allowedRoles, router]);

  if (!authorized) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3.5px solid rgba(255,255,255,0.15)',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'authSpin 0.8s linear infinite'
        }} />
        <style>{`@keyframes authSpin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: '16px', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>
          Verifying security session...
        </p>
        {showRetry && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ← Back to Sign In
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

