'use client';

import { useEffect } from 'react';

/**
 * PwaDesktopInstaller
 * Registers service worker and enforces true immersive fullscreen
 * (hides mobile status bar completely — exam starts at pixel 0,0).
 */
export default function PwaDesktopInstaller() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Detect PWA Standalone / Native Mobile App mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.matchMedia('(display-mode: fullscreen)').matches ||
                           window.navigator.standalone === true ||
                           document.referrer.includes('android-app://');
      const isNativeApp = !!window.AndroidApp ||
                          !!window.Capacitor ||
                          !!window._isNativeApp ||
                          /ExamJK-Android-App|ExamJKApp|Android.*Version\/[0-9.]+\s+Chrome\/[0-9.]+|wv/i.test(navigator.userAgent);
      const isMobile = window.innerWidth <= 1024;

      if (isStandalone) {
        document.documentElement.classList.add('is-pwa-standalone');
        document.body.classList.add('is-pwa-standalone');
      }
      if (isNativeApp || isMobile) {
        document.documentElement.classList.add('is-mobile-app');
        document.body.classList.add('is-mobile-app');
      }

      // 2. Enforce true immersive fullscreen — hide status bar completely
      const enforceAppImmersive = () => {
        try {
          // Capacitor: hide status bar, overlay web view
          if (window.Capacitor?.Plugins?.StatusBar) {
            window.Capacitor.Plugins.StatusBar.hide().catch(() => {});
            window.Capacitor.Plugins.StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
          }

          // ReactNative WebView bridge
          if (window.ReactNativeWebView?.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HIDE_STATUS_BAR' }));
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SET_STATUS_BAR_OVERLAY', overlay: true }));
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SET_IMMERSIVE_FULLSCREEN', value: true }));
          }

          // Android/Smartboard native bridges
          const bridges = [
            window.AndroidApp, window.SmartboardApp, window.SmartBoardApp, window.SmartBoard, window.smartboard,
            window.BoardApp, window.boardApp, window.Android, window.android, window.AndroidBridge, window.JSBridge,
            window.webApp, window.NativeApp
          ];
          bridges.forEach((b) => {
            if (!b) return;
            if (typeof b.hideStatusBar === 'function') b.hideStatusBar();
            if (typeof b.hideNavigationBar === 'function') b.hideNavigationBar();
            if (typeof b.setStatusBarVisible === 'function') b.setStatusBarVisible(false);
            if (typeof b.setNavigationBarVisible === 'function') b.setNavigationBarVisible(false);
            if (typeof b.hideSystemUI === 'function') b.hideSystemUI();
            if (typeof b.setSystemUIVisible === 'function') b.setSystemUIVisible(false);
            if (typeof b.setImmersiveFullscreen === 'function') b.setImmersiveFullscreen(true);
            if (typeof b.setFullscreen === 'function') b.setFullscreen(true);
            if (typeof b.enterFullscreen === 'function') b.enterFullscreen();
            if (typeof b.enableImmersiveMode === 'function') b.enableImmersiveMode();
          });

          // Web Fullscreen API (for standalone PWA on Android Chrome)
          const el = document.documentElement;
          if (el.requestFullscreen && document.fullscreenElement !== el) {
            el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
          } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
          }
        } catch (e) {}
      };

      // Run immediately and on every user interaction to re-enter fullscreen if dismissed
      enforceAppImmersive();

      window.addEventListener('click', enforceAppImmersive, { capture: true, passive: true });
      window.addEventListener('touchend', enforceAppImmersive, { capture: true, passive: true });
      window.addEventListener('pointerup', enforceAppImmersive, { capture: true, passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') enforceAppImmersive();
      });

      // 3. Register & Automatically Update Service Worker
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
