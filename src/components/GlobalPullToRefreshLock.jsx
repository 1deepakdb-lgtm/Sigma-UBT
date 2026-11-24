'use client';

import { useEffect } from 'react';

/**
 * Universal Global Pull-To-Refresh Blocker for ExamJK UBT
 * Completely disables pull-down-to-refresh across:
 * - All web routes & pages
 * - Android and iOS WebViews & Capacitor wrappers
 * - Mobile browsers (Chrome, Safari, Firefox, Edge, Samsung Internet)
 * - PWA & installed web applications
 * - Tablets, iPads, and Smart Boards (interactive touch displays)
 * - Desktop touchscreens & trackpads
 * 
 * PRESERVES:
 * - Normal vertical scrolling through pages, tables, and lists
 * - Horizontal scrolling, tabs, and carousels
 * - Multi-touch gestures (pinch-to-zoom)
 * - Smartboard pen / stylus drawing
 * - Input fields, modals, and buttons
 * - Explicit user manual refresh buttons (e.g. In-App Sync button)
 */
export default function GlobalPullToRefreshLock() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // 1. Strict CSS Overscroll Locking
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
        /* Lock pull refresh inside scrollable panels while allowing regular internal scrolling */
        .no-pull-refresh,
        .institute-content-area,
        .student-dashboard-wrap,
        .table-wrapper,
        .compact-billing-table-wrapper {
          overscroll-behavior-y: contain !important;
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

    // 2. Touch Gesture Interceptor (Blocks downward drag at scrollTop <= 0)
    var startY = 0;
    var startX = 0;
    var isTracking = false;
    var cachedScrollContainer = null;

    function findScrollParent(node) {
      var cur = node;
      while (cur && cur !== document.body && cur !== document.documentElement) {
        try {
          // If node is a canvas or drawing area on smartboard, don't lock touch
          if (cur.tagName === 'CANVAS' || cur.classList?.contains('drawing-canvas')) {
            return null;
          }
          var oy = window.getComputedStyle(cur).overflowY;
          if ((oy === 'auto' || oy === 'scroll') && cur.scrollHeight > cur.clientHeight) {
            return cur;
          }
        } catch (e) {}
        cur = cur.parentElement;
      }
      return null;
    }

    function handleTouchStart(e) {
      // Single-finger touch gesture only; leave multi-touch (pinch-zoom) unaffected
      if (e.touches && e.touches.length === 1) {
        // Skip stylus/pen on Smartboards
        if (e.pointerType === 'pen') return;

        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        isTracking = true;
        cachedScrollContainer = findScrollParent(e.target);
      } else {
        isTracking = false;
        cachedScrollContainer = null;
      }
    }

    function handleTouchMove(e) {
      if (!isTracking || !e.touches || e.touches.length !== 1) return;

      var currentY = e.touches[0].clientY;
      var currentX = e.touches[0].clientX;
      var dy = currentY - startY;
      var dx = currentX - startX;

      // Downward drag (pull to refresh gesture)
      if (dy > 8 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        var isAtTop = false;

        if (cachedScrollContainer) {
          isAtTop = cachedScrollContainer.scrollTop <= 0;
        } else {
          var winScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          isAtTop = winScroll <= 0;
        }

        // If at top and dragging downward on document root, cancel browser pull-to-refresh
        // Allow inner scrollable containers (tables, modal lists) to scroll freely
        if (isAtTop && !cachedScrollContainer && e.cancelable) {
          e.preventDefault();
        }
      }
    }

    function handleTouchEnd() {
      isTracking = false;
      cachedScrollContainer = null;
    }

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

    window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true, capture: true });
    window.addEventListener('scroll', handleScrollClamp, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true, capture: true });

    return () => {
      clearInterval(bridgeInterval);
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('touchend', handleTouchEnd, { capture: true });
      window.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
      window.removeEventListener('scroll', handleScrollClamp);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('beforeunload', handleBeforeUnload);

      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
      document.removeEventListener('touchend', handleTouchEnd, { capture: true });
      document.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
    };
  }, []);

  return null;
}
