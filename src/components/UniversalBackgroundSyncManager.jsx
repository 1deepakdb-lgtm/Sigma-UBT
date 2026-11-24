'use client';

import { useEffect, useRef } from 'react';

/**
 * UniversalBackgroundSyncManager
 * 
 * Implements non-intrusive, automatic background data synchronization across ExamJK UBT.
 * Works seamlessly alongside GlobalPullToRefreshLock so that data updates automatically
 * without requiring the user to pull down, reload, or reopen the application.
 * 
 * STRICT ARCHITECTURAL GUARANTEES:
 * 1. NEVER calls location.reload() or reloads the browser window.
 * 2. NEVER resets scroll position, zoom level, or form inputs.
 * 3. NEVER interrupts ongoing examination sessions or restarts exam timers.
 * 4. NEVER interrupts audio playback (TTS, listening audio, dialogues).
 * 5. NEVER reloads or resets the active PDF or EPUB reader.
 * 6. Pauses polling when the tab is hidden to save battery & memory on 2GB RAM devices.
 * 7. Resumes and immediately synchronizes when returning to the foreground.
 * 8. Broadcasts silent updates via CustomEvent so React components merge state without tearing.
 */
export default function UniversalBackgroundSyncManager() {
  const isSyncingRef = useRef(false);
  const syncTimerRef = useRef(null);
  const lastSyncTimeRef = useRef(0);
  const cachedHashRef = useRef({});

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Helper: Check if an active exam or audio playback is in progress
    const isProtectedState = () => {
      // 1. Active examination
      const pathname = window.location.pathname || '';
      if (pathname.includes('/student/exam/')) return true;
      if (window.isExamRunning === true) return true;

      // 2. Audio is playing
      try {
        const audios = document.querySelectorAll('audio');
        for (let i = 0; i < audios.length; i++) {
          if (!audios[i].paused && !audios[i].ended && audios[i].currentTime > 0) {
            return true;
          }
        }
      } catch (e) {}

      return false;
    };

    // Helper: Simple fast hash to detect real changes before dispatching React updates
    const simpleHash = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return hash.toString();
    };

    // Core silent background sync worker
    const performBackgroundSync = async (force = false) => {
      // Avoid concurrent sync executions or syncing when offline
      if (isSyncingRef.current || !navigator.onLine) return;

      // Do NOT run background sync during active exams to prevent 2GB RAM stutter
      if (!force && isProtectedState()) {
        return;
      }

      // Throttle: don't sync faster than once every 8 seconds unless forced
      const now = Date.now();
      if (!force && now - lastSyncTimeRef.current < 8000) return;

      isSyncingRef.current = true;
      lastSyncTimeRef.current = now;

      const pathname = window.location.pathname || '';
      const controller = new AbortController();
      const signal = controller.signal;
      const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

      try {
        // ── 1. GENERAL APP-WIDE SYNC: Notifications & Announcements ──────────
        try {
          const notifRes = await fetch('/api/notifications', { signal });
          if (notifRes.ok) {
            const notifText = await notifRes.text();
            const notifHash = simpleHash(notifText);
            if (cachedHashRef.current['notifications'] !== notifHash) {
              cachedHashRef.current['notifications'] = notifHash;
              const notifData = JSON.parse(notifText);
              window.dispatchEvent(new CustomEvent('examjk:background-sync', {
                detail: { type: 'notifications', data: notifData }
              }));
            }
          }
        } catch (e) {}

        try {
          const newsRes = await fetch('/api/news', { signal });
          if (newsRes.ok) {
            const newsText = await newsRes.text();
            const newsHash = simpleHash(newsText);
            if (cachedHashRef.current['news'] !== newsHash) {
              cachedHashRef.current['news'] = newsHash;
              const newsData = JSON.parse(newsText);
              window.dispatchEvent(new CustomEvent('examjk:background-sync', {
                detail: { type: 'news', data: newsData }
              }));
            }
          }
        } catch (e) {}

        // ── 2. INSTITUTE PORTAL SYNC: Billing, Expenses, Products, Students ──
        if (pathname.includes('/institute')) {
          try {
            const billingRes = await fetch('/api/institute/billing', { signal });
            if (billingRes.ok) {
              const billingText = await billingRes.text();
              const billingHash = simpleHash(billingText);
              if (cachedHashRef.current['billing'] !== billingHash) {
                cachedHashRef.current['billing'] = billingHash;
                const billingData = JSON.parse(billingText);
                window.dispatchEvent(new CustomEvent('examjk:background-sync', {
                  detail: { type: 'billing', data: billingData }
                }));
              }
            }
          } catch (e) {}

          try {
            const productsRes = await fetch('/api/institute/billing/products', { signal });
            if (productsRes.ok) {
              const productsText = await productsRes.text();
              const productsHash = simpleHash(productsText);
              if (cachedHashRef.current['products'] !== productsHash) {
                cachedHashRef.current['products'] = productsHash;
                const productsData = JSON.parse(productsText);
                window.dispatchEvent(new CustomEvent('examjk:background-sync', {
                  detail: { type: 'products', data: productsData }
                }));
              }
            }
          } catch (e) {}
        }

        // ── 3. STUDENT PORTAL SYNC: Exam Performance, Results, Releases ──────
        if (pathname.includes('/student') && !pathname.includes('/student/exam/')) {
          try {
            const examsRes = await fetch('/api/student/exams', { signal });
            if (examsRes.ok) {
              const examsText = await examsRes.text();
              const examsHash = simpleHash(examsText);
              if (cachedHashRef.current['student-exams'] !== examsHash) {
                cachedHashRef.current['student-exams'] = examsHash;
                const examsData = JSON.parse(examsText);
                window.dispatchEvent(new CustomEvent('examjk:background-sync', {
                  detail: { type: 'student-exams', data: examsData }
                }));
              }
            }
          } catch (e) {}
        }

        // ── 4. ADMIN PORTAL SYNC: Institutes Roster & Live Stats ──────────────
        if (pathname.includes('/admin')) {
          try {
            const instRes = await fetch('/api/admin/institutes', { signal });
            if (instRes.ok) {
              const instText = await instRes.text();
              const instHash = simpleHash(instText);
              if (cachedHashRef.current['admin-institutes'] !== instHash) {
                cachedHashRef.current['admin-institutes'] = instHash;
                const instData = JSON.parse(instText);
                window.dispatchEvent(new CustomEvent('examjk:background-sync', {
                  detail: { type: 'admin-institutes', data: instData }
                }));
              }
            }
          } catch (e) {}
        }

      } catch (err) {
        // Silent error suppression: background sync never disrupts the UI
      } finally {
        clearTimeout(timeoutId);
        isSyncingRef.current = false;
      }
    };

    // Expose programmatic manual background sync to any component button
    window.triggerExamJKBackgroundSync = (force = true) => performBackgroundSync(force);

    // Initial background sync check after page settles (2.5s initial warm-up)
    const initialTimer = setTimeout(() => {
      performBackgroundSync(false);
    }, 2500);

    // Adaptive Polling Interval (Every 25 seconds when active)
    const scheduleNextSync = () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);

      // Low-RAM & Battery optimization: 25 seconds is ideal for real-time responsiveness without lag
      syncTimerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          performBackgroundSync(false);
        }
      }, 25000);
    };

    scheduleNextSync();

    // ── Foreground Wake-Up Handler ───────────────────────────────────────────
    // When the user switches back to the tab, unlocks phone, or wakes up smartboard:
    // Instantly synchronize the latest data silently!
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performBackgroundSync(true);
      }
    };

    const handleWindowFocus = () => {
      performBackgroundSync(false);
    };

    const handleOnline = () => {
      performBackgroundSync(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(initialTimer);
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}
