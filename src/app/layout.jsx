import '@/App.css';
import './student.css';
import PwaDesktopInstaller from '@/components/PwaDesktopInstaller';
import OfflineSyncManager from '@/components/OfflineSyncManager';
import GlobalPullToRefreshLock from '@/components/GlobalPullToRefreshLock';

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#003b73' },
    { media: '(prefers-color-scheme: dark)', color: '#003b73' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata = {
  title: 'ExamJK — Exam Japanese and Korean',
  description: 'ExamJK: Japanese and Korean CBT & UBT Examination and Learning System',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    shortcut: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ExamJK'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="application-name" content="ExamJK" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#003b73" />
        <meta name="apple-mobile-web-app-title" content="ExamJK" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#003b73" />
        <meta name="msapplication-navbutton-color" content="#003b73" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#003b73" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Universal High-Definition Web Fonts: English (Inter), Korean (Noto Sans KR), Japanese (Noto Sans JP), Nepali (Noto Sans Devanagari) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Early synchronous platform detection to eliminate navigation menu flashes during page load/refresh */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
                  var isiOSStandalone = window.navigator && window.navigator.standalone === true;
                  var isNativeApp = !!window.AndroidApp || !!window.Capacitor || !!window._isNativeApp || (document.referrer && document.referrer.indexOf('android-app://') !== -1) || /ExamJK-Android-App|ExamJKApp|Android.*Version\\/[0-9.]+\\s+Chrome\\/[0-9.]+|wv/i.test(navigator.userAgent);
                  var isMobileWidth = window.innerWidth <= 1024;
                  if (isStandalone || isiOSStandalone) {
                    document.documentElement.classList.add('is-pwa-standalone');
                  }
                  if (isNativeApp || isStandalone || isiOSStandalone || isMobileWidth) {
                    document.documentElement.classList.add('is-mobile-app');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        {/* Universal Synchronous Pull-Down Refresh Blocker (Active Before Page Hydration) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var startY = 0;
                  var startX = 0;
                  var isTracking = false;
                  var cachedScrollContainer = null;

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

                  function onTouchStart(e) {
                    if (e.touches && e.touches.length === 1) {
                      startY = e.touches[0].clientY;
                      startX = e.touches[0].clientX;
                      isTracking = true;
                      cachedScrollContainer = findScrollParent(e.target);
                    } else {
                      isTracking = false;
                      cachedScrollContainer = null;
                    }
                  }

                  function onTouchMove(e) {
                    if (!isTracking || !e.touches || e.touches.length !== 1) return;
                    var cy = e.touches[0].clientY;
                    var cx = e.touches[0].clientX;
                    var dy = cy - startY;
                    var dx = cx - startX;
                    if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
                      var isAtTop = false;
                      if (cachedScrollContainer) {
                        isAtTop = cachedScrollContainer.scrollTop <= 0;
                      } else {
                        var winScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
                        isAtTop = winScroll <= 0;
                      }
                      if (isAtTop && e.cancelable) {
                        e.preventDefault();
                      }
                    }
                  }

                  function onTouchEnd() {
                    isTracking = false;
                    cachedScrollContainer = null;
                  }

                  window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
                  window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
                  window.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
                  window.addEventListener('touchcancel', onTouchEnd, { passive: true, capture: true });

                  document.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
                  document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
                  document.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
                  document.addEventListener('touchcancel', onTouchEnd, { passive: true, capture: true });
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <GlobalPullToRefreshLock />
        {children}
        <PwaDesktopInstaller />
        <OfflineSyncManager />
      </body>
    </html>
  );
}
