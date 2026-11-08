'use client';

import React, { useEffect, useState } from 'react';

/**
 * ClientAuthGuard
 * Bulletproof client-side session synchronization.
 * Because parent layouts (AdminLayout, InstituteLayout, StudentLayout) already
 * enforce server-side authentication with getSessionUser(), ClientAuthGuard
 * ensures instant rendering and prevents any possibility of redirect loops.
 */
export default function ClientAuthGuard({ allowedRoles = [], children }) {
  // Initialize authorized to true so server-rendered content appears instantly without delay
  const [authorized, setAuthorized] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Loop Prevention Guard: Never redirect if a redirect occurred recently
    const lastRedirect = sessionStorage.getItem('last_auth_redirect_ts');
    const now = Date.now();
    if (lastRedirect && now - parseInt(lastRedirect, 10) < 8000) {
      console.warn('[ClientAuthGuard] Refresh loop detected and halted.');
      return;
    }

    async function verifySession() {
      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });

        // If server encounters 500 or 503, DO NOT redirect! Parent layout already verified session.
        if (res.status >= 500) {
          console.warn('[ClientAuthGuard] Backend API notice (status ' + res.status + '). Preserving active session.');
          return;
        }

        if (res.status === 401) {
          // Explicitly unauthenticated: clear cookies properly via logout endpoint
          sessionStorage.setItem('last_auth_redirect_ts', String(Date.now()));
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch (e) {}
          try {
            localStorage.removeItem('sigma_session');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('role');
          } catch (e) {}
          if (isMounted) {
            window.location.replace('/?error=unauthorized');
          }
          return;
        }

        const data = await res.json();
        if (data.authenticated && data.user) {
          const role = data.user.role;
          if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
            let target = '/student';
            if (role === 'admin') target = '/admin';
            else if (role === 'institute') target = '/institute';
            else if (role === 'staff') target = '/institute?tab=billing';
            if (isMounted) window.location.replace(target);
          }
        }
      } catch (err) {
        // Network or fetch error: DO NOT redirect in a loop
        console.warn('[ClientAuthGuard] Network verification warning:', err?.message);
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles]);

  if (!authorized && authError) {
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
        <p style={{ fontSize: '15px', color: '#f87171', marginBottom: '16px' }}>{authError}</p>
        <button
          onClick={() => { window.location.href = '/'; }}
          style={{
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer'
          }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return children;
}
