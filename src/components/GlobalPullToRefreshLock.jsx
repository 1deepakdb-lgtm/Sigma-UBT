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

    // 1. Strict CSS Overscroll Locking on Root Viewport & Body
    // overscroll-behavior-y: none on html and body is the standard W3C specification
    // that permanently disables pull-to-refresh across all modern browsers (Chrome, Safari 16+, Edge, Firefox)
    // without blocking normal vertical or touch scrolling.
    const styleId = 'examjk-global-pull-refresh-lock-css';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      styleTag.innerHTML = `
        html, body, #__next, #root {
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
      document.documentElement.style.setProperty('overscroll-behavior-y', 'none', 'important');
      document.documentElement.style.setProperty('overscroll-behavior', 'none', 'important');
      if (document.body) {
        document.body.style.overscrollBehavior = 'none';
        document.body.style.overscrollBehaviorY = 'none';
        document.body.style.setProperty('overscroll-behavior-y', 'none', 'important');
        document.body.style.setProperty('overscroll-behavior', 'none', 'important');
      }
    } catch (e) {}

    // 2. Disable in Native Mobile Bridges (Smart Board, Android WebView, iOS WKWebView)
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

    // 3. Prevent Touch-Driven Pull-Down to Reload
    // Intercepts downward swipe gesture when user is at the top of the viewport
    let startY = 0;
    let startX = 0;

    function handleTouchStart(e) {
      if (e.touches && e.touches.length === 1) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
      }
    }

    function handleTouchMove(e) {
      if (!e.touches || e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - startY;
      const deltaX = currentX - startX;

      // Check if user is at the very top of page/container
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // Downward pull at top (gesture that triggers browser reload)
      if (scrollTop <= 0 && deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });

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

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(bridgeInterval);
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
