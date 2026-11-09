'use client';

import { useEffect } from 'react';

/**
 * PwaDesktopInstaller
 * Background PWA service worker registration only.
 * Persistent floating install button & popups removed per user request.
 */
export default function PwaDesktopInstaller() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('ExamJK PWA Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration skipped:', err);
        });
    }
  }, []);

  return null;
}
