'use client';

import { useEffect } from 'react';

/**
 * PwaDesktopInstaller
 * Background PWA service worker registration only.
 * Persistent floating install button & popups removed per user request.
 */
export default function PwaDesktopInstaller() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Detect PWA Standalone / Native Mobile App mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone === true ||
                           document.referrer.includes('android-app://');
      const isNativeApp = !!window.AndroidApp ||
                          !!window.Capacitor ||
                          !!window._isNativeApp ||
                          /ExamJK-Android-App|ExamJKApp|Android.*Version\/[0-9.]+\s+Chrome\/[0-9.]+|wv/i.test(navigator.userAgent);
      const isMobile = window.innerWidth <= 768;

      if (isStandalone) {
        document.documentElement.classList.add('is-pwa-standalone');
        document.body.classList.add('is-pwa-standalone');
      }
      if (isNativeApp || isMobile) {
        document.documentElement.classList.add('is-mobile-app');
        document.body.classList.add('is-mobile-app');
      }

      // 2. Register Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('ExamJK PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA Service Worker registration skipped:', err);
          });
      }
    }
  }, []);

  return null;
}
