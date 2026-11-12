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
        'currentInstitute',
        'currentInstituteId',
        'currentInstitutePackage',
        'instituteExamPackage',
        'instituteStudents',
        'instituteStudentsUnlocked',
        'instituteBillingUnlocked',
        'sigma_current_user',
        'billingRole',
        'selectedBillingStudent',
        'instituteLanguage',
        'users',
        'token',
        'sigma_session',
        'activeSessionId'
      ];
      sessionKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {}
      });

      // Clear all tenant-scoped caches to avoid data leakage between institutes
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('instituteStudents') || k.startsWith('instituteDistribution_'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch (e) {}
      sessionStorage.clear();
      document.cookie = 'sigma_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;';
    } catch (e) {}
    window.location.replace('/?logout=true');
  }
}

