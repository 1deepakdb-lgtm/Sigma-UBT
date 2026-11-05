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

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });

        if (!res.ok) {
          if (isMounted) {
            router.replace('/?error=unauthorized');
          }
          return;
        }

        const data = await res.json();
        if (!data.authenticated || !data.user) {
          if (isMounted) {
            router.replace('/?error=unauthorized');
          }
          return;
        }

        const role = data.user.role;
        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
          if (isMounted) {
            let target = '/student';
            if (role === 'admin') target = '/admin';
            else if (role === 'institute') target = '/institute';
            else if (role === 'staff') target = '/institute?tab=billing';
            router.replace(target);
          }
          return;
        }

        if (isMounted) {
          setAuthorized(true);
        }
      } catch (err) {
        if (isMounted) {
          router.replace('/?error=unauthorized');
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
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
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
      </div>
    );
  }

  return <>{children}</>;
}
