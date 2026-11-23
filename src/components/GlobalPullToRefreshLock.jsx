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
      document.documentElement.style.overscrollBehaviorY = 'none';
      document.body.style.overscrollBehaviorY = 'none';
      document.documentElement.style.setProperty('overscroll-behavior-y', 'none', 'important');
      document.body.style.setProperty('overscroll-behavior-y', 'none', 'important');
    } catch (e) {}

    var startY = 0;
    var startX = 0;
    var isTracking = false;

    // Find closest scrollable ancestor of touch target
    function getScrollParent(element) {
      var node = element;
      while (node && node !== document.body && node !== document.documentElement) {
        try {
          var style = window.getComputedStyle(node);
          var overflowY = style.overflowY || style.overflow;
          if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
            return node;
          }
        } catch (e) {}
        node = node.parentElement;
      }
      return document.scrollingElement || document.documentElement || document.body;
    }

    function handleTouchStart(e) {
      if (e.touches && e.touches.length === 1) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        isTracking = true;
      } else {
        isTracking = false;
      }
    }

    function handleTouchMove(e) {
      if (!isTracking || !e.touches || e.touches.length !== 1) return;

      var currentY = e.touches[0].clientY;
      var currentX = e.touches[0].clientX;
      var dy = currentY - startY;
      var dx = currentX - startX;

      // Downward pull: user dragging finger downwards (the gesture that triggers pull-to-refresh)
      if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
        var container = getScrollParent(e.target);
        var scrollTop = 0;
        if (container === document.body || container === document.documentElement || container === document.scrollingElement) {
          scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        } else {
          scrollTop = container.scrollTop;
        }

        // If at the top or negative overscroll, prevent browser pull-to-refresh reload
        if (scrollTop <= 0) {
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      }
    }

    function handleTouchEnd() {
      isTracking = false;
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

    return () => {
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('touchend', handleTouchEnd, { capture: true });
      window.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
    };
  }, []);

  return null;
}
