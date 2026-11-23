'use client';

import { useEffect } from 'react';

/**
 * Universal Global Pull-To-Refresh Blocker for ExamJK UBT
 * Completely blocks browser reload on swipe-down across:
 * - Smart Boards & Interactive Touch Displays
 * - 2GB RAM Android phones & tablets
 * - iPhones & iPads (Safari / Chrome)
 * - Touch laptops & Desktop browsers
 * - PWA and installed web applications
 * 
 * PRESERVES:
 * - Normal vertical scrolling
 * - Horizontal scrolling / sliders
 * - Pinch-to-zoom (multi-touch)
 * - Smartboard pen / stylus drawing
 * - Input fields, modals, and buttons
 */
export default function GlobalPullToRefreshLock() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Apply strict CSS overscroll locks globally
    try {
      document.documentElement.style.overscrollBehavior = 'none';
      document.documentElement.style.overscrollBehaviorY = 'none';
      document.body.style.overscrollBehavior = 'none';
      document.body.style.overscrollBehaviorY = 'none';
      document.documentElement.style.setProperty('overscroll-behavior-y', 'none', 'important');
      document.body.style.setProperty('overscroll-behavior-y', 'none', 'important');
    } catch (e) {}

    var startY = 0;
    var startX = 0;
    var isTracking = false;
    var cachedScrollContainer = null;

    // Cache closest scrollable ancestor of touch target ONCE on touchstart
    function findScrollParent(node) {
      var cur = node;
      while (cur && cur !== document.body && cur !== document.documentElement) {
        try {
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
      if (e.touches && e.touches.length === 1) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        isTracking = true;
        // Compute container ONCE during touchstart to prevent 60fps forced reflow
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
      if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
        var isAtTop = false;

        if (cachedScrollContainer) {
          isAtTop = cachedScrollContainer.scrollTop <= 0;
        } else {
          var winScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          isAtTop = winScroll <= 0;
        }

        // If at top or overscrolling downward, block browser pull-to-refresh
        if (isAtTop && e.cancelable) {
          e.preventDefault();
        }
      }
    }

    function handleTouchEnd() {
      isTracking = false;
      cachedScrollContainer = null;
    }

    // Keep scroll position bounded above zero
    function handleScrollClamp() {
      if (window.scrollY < 0) {
        window.scrollTo(0, 0);
      }
    }

    // Disable in native bridges if present (Smart Board & Android WebView)
    var bridgeList = [
      window.AndroidApp, window.SmartboardApp, window.SmartBoardApp, window.SmartBoard, window.smartboard,
      window.BoardApp, window.boardApp, window.Android, window.android, window.AndroidBridge, window.JSBridge,
      window.webApp, window.NativeApp
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

    window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true, capture: true });
    window.addEventListener('scroll', handleScrollClamp, { passive: true });

    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true, capture: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('touchend', handleTouchEnd, { capture: true });
      window.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
      window.removeEventListener('scroll', handleScrollClamp);

      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
      document.removeEventListener('touchend', handleTouchEnd, { capture: true });
      document.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
    };
  }, []);

  return null;
}
