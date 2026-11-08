/**
 * Universal Client-Side Logout Helper
 * Clears backend HTTP-only cookie, client localStorage, and redirects cleanly to login.
 */
export async function performLogout() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    await fetch('/api/auth/logout', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (err) {
    console.error('Logout error:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const sessionKeys = [
        'currentUser',
        'currentRole',
        'user',
        'role',
        'auth',
        'studentPhone',
        'studentName',
        'instituteName',
        'token',
        'sigma_session',
        'activeSessionId'
      ];
      sessionKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {}
      });
      sessionStorage.clear();
      document.cookie = 'sigma_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;';
    } catch (e) {}
    window.location.replace('/?logout=true');
  }
}

