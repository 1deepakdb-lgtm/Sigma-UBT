'use client';

import { useEffect } from 'react';

/**
 * Universal Global Pull-To-Refresh Blocker for ExamJK UBT
 * Completely disables pull-down-to-refresh across:
 * - All website routes and pages
 * - Android and iOS WebViews & Capacitor wrappers
 * - Mobile browsers (Chrome, Safari, Firefox, Edge, Samsung Internet)
 * - PWA & installed web applications
 * - Tablets, iPads, and Smart Boards (interactive touch displays)
 * - Desktop touchscreens & trackpads
 * 
 * PRESERVES:
 * - 100% normal vertical scrolling throughout all sections (including Billing Section)
 * - Free mouse wheel, touch, trackpad, and stylus scrolling from top to bottom
 * - Smooth scroll bubbling without touchmove cancellation traps
 * - Active exam accidental reload protection (F5, Ctrl+R, beforeunload)
 * - Native WebView pull-to-refresh bridge locking
 */
export default function GlobalPullToRefreshLock() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // 1. Strict CSS Overscroll Locking on Root Viewport ONLY
    // overscroll-behavior-y: none on html and body is the standard W3C specification
    // that permanently disables pull-to-refresh across all modern browsers (Chrome, Safari 16+, Edge, Firefox)
    // without blocking normal vertical or touch scrolling.
    const styleId = 'examjk-global-pull-refresh-lock-css';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      styleTag.innerHTML = `
        html {
          overscroll-behavior-y: none !important;
          -webkit-overscroll-behavior-y: none !important;
          overscroll-behavior: none !important;
        }
        body {
          overscroll-behavior-y: none !important;
          -webkit-overscroll-behavior-y: none !important;
          overscroll-behavior: none !important;
        }
      `;
      document.head.appendChild(styleTag);
    }

    try {
      document.documentElement.style.overscrollBehavior = 'none';
      document.documentElement.style.overscrollBehaviorY = 'none';
      document.body.style.overscrollBehavior = 'none';
      document.body.style.overscrollBehaviorY = 'none';
      document.documentElement.style.setProperty('overscroll-behavior-y', 'none', 'important');
      document.body.style.setProperty('overscroll-behavior-y', 'none', 'important');
    } catch (e) {}

    // 2. Prevent Rubber-Banding Overscroll Offset (< 0)
    function handleScrollClamp() {
      if (window.scrollY < 0) {
        window.scrollTo(0, 0);
      }
    }

    // 3. Disable in Native Mobile Bridges (Smart Board, Android WebView, iOS WKWebView)
    function lockNativeBridges() {
      if (typeof window === 'undefined') return;
      var bridgeList = [
        window.AndroidApp, window.SmartboardApp, window.SmartBoardApp, window.SmartBoard, window.smartboard,
        window.BoardApp, window.boardApp, window.Android, window.android, window.AndroidBridge, window.JSBridge,
        window.webApp, window.NativeApp, window.Capacitor?.Plugins?.App
      ];
      bridgeList.forEach(function(b) {
        if (!b) return;
        try {
          if (typeof b.setSwipeRefreshEnabled === 'function') b.setSwipeRefreshEnabled(false);
          if (typeof b.setPullToRefreshEnabled === 'function') b.setPullToRefreshEnabled(false);
          if (typeof b.disablePullToRefresh === 'function') b.disablePullToRefresh();
          if (typeof b.disableSwipeRefresh === 'function') b.disableSwipeRefresh();
        } catch (e) {}
      });
    }

    // 4. Prevent Accidental Keyboard Refresh During Active Examination
    function handleKeyDown(e) {
      const isExamRoute = typeof window !== 'undefined' && window.location.pathname.includes('/student/exam/');
      const isExamRunning = typeof window !== 'undefined' && (window.isExamRunning || isExamRoute);

      if (isExamRunning) {
        // Block F5
        if (e.key === 'F5' || e.keyCode === 116) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block Ctrl+R / Cmd+R
        if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R' || e.keyCode === 82)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    }

    // 5. Active Examination Unload Confirmation (Prevents Accidental Tab Close / Refresh)
    function handleBeforeUnload(e) {
      const isExamRoute = typeof window !== 'undefined' && window.location.pathname.includes('/student/exam/');
      const isExamRunning = typeof window !== 'undefined' && (window.isExamRunning || isExamRoute);

      if (isExamRunning) {
        const msg = "You have an ongoing examination. Refreshing or leaving will lose your current timer and answers.";
        e.preventDefault();
        e.returnValue = msg;
        return msg;
      }
    }

    // Initialize Native Bridges & periodic lock (in case WebView injects bridges late)
    lockNativeBridges();
    const bridgeInterval = setInterval(lockNativeBridges, 2000);

    window.addEventListener('scroll', handleScrollClamp, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(bridgeInterval);
      window.removeEventListener('scroll', handleScrollClamp);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
