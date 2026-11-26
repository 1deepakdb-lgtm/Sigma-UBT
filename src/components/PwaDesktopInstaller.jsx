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

      // 1b. Keep native mobile status bar separated (never overlay app content underneath system bars)
      const syncSystemBarInsets = () => {
        try {
          window.Capacitor?.Plugins?.StatusBar?.setOverlaysWebView?.({ overlay: false }).catch?.(() => {});
          window.Capacitor?.Plugins?.StatusBar?.show?.().catch?.(() => {});
          window.ReactNativeWebView?.postMessage?.(JSON.stringify({ type: 'SET_STATUS_BAR_OVERLAY', overlay: false }));
          const bridges = [
            window.AndroidApp, window.SmartboardApp, window.SmartBoardApp, window.SmartBoard, window.smartboard,
            window.BoardApp, window.boardApp, window.Android, window.android, window.AndroidBridge, window.JSBridge,
            window.webApp, window.NativeApp
          ];
          bridges.forEach((b) => {
            if (!b) return;
            if (typeof b.setStatusBarOverlay === 'function') b.setStatusBarOverlay(false);
            if (typeof b.showStatusBar === 'function') b.showStatusBar();
            if (typeof b.setStatusBarVisible === 'function') b.setStatusBarVisible(true);
          });
        } catch (e) {}
      };

      syncSystemBarInsets();

      // 2. Register & Automatically Update Service Worker
      if ('serviceWorker' in navigator) {
        let isReloading = false;
        const triggerReload = () => {
          if (!isReloading) {
            isReloading = true;
            console.log('ExamJK PWA: Fresh application version active. Reloading...');
            window.location.reload();
          }
        };

        // Reload whenever a new Service Worker takes over control
        navigator.serviceWorker.addEventListener('controllerchange', triggerReload);

        // Listen for direct broadcast messages from sw.js
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATED') {
            triggerReload();
          }
        });

        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            // Check for updates on initial mount
            reg.update().catch(() => {});

            // If an update is detected, activate it immediately
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('ExamJK PWA: New update installed. Skipping waiting...');
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                });
              }
            });

            // Re-check for updates whenever user switches back to the tab/app
            const handleVisibility = () => {
              if (document.visibilityState === 'visible') {
                reg.update().catch(() => {});
              }
            };
            document.addEventListener('visibilitychange', handleVisibility);

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
