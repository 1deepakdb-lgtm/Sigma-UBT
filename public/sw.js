// ExamJK Advanced Progressive Web App & Offline Sync Service Worker
// Automatically caches core assets, API data, PDF viewer, dictionary, and media for seamless offline usage

const STATIC_CACHE = 'examjk-static-v82';
const DATA_CACHE = 'examjk-data-v82';
const MEDIA_CACHE = 'examjk-media-v71';

const STATIC_ASSETS = [
  '/',
  '/about',
  '/student',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/apple-touch-icon.png',
  '/examjk-logo.png',
  '/favicon.ico',
  '/pdfviewer.html',
  '/pdf.min.js',
  '/pdf.worker.min.js',
  '/api/books',
  '/api/books/japanese-r2',
  '/api/dictionary?q=&lang=ko&filter=all&limit=500',
  '/api/dictionary?q=&lang=ja&filter=all&limit=500'
];

// Pre-cache static essentials on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`PWA: Pre-cache asset failed [${asset}]:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Direct message handler for forced updates & cache purges
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'PURGE_ALL_CACHES') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.skipWaiting())
    );
  }
});

// Clean up previous cache generations on activate & broadcast update to tabs
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DATA_CACHE, MEDIA_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!currentCaches.includes(key)) {
            console.log(`[ExamJK SW] Purging obsolete cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // Notify all open client tabs that fresh assets are active
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', version: STATIC_CACHE });
        });
      });
    })
  );
  self.clients.claim();
});

// Intelligent request interceptor with specialized offline strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Never intercept non-GET requests (e.g. POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // 2. Bypass live security auth/session checks so security tokens remain un-stale
  if (url.pathname.startsWith('/api/auth/')) {
    return;
  }

  // 3. Navigation requests (Page reloads, visiting /student, etc.)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // When offline: serve cached destination page or student hub
          return caches.match(request)
            .then((cachedPage) => cachedPage || caches.match('/student') || caches.match('/'));
        })
    );
    return;
  }

  // 4. Heavy Media & PDFs (Chapter PDFs, Book Audio, R2 files, Uploads)
  // Strategy: Cache-First with background download and long-term offline retention
  if (
    url.pathname.includes('/api/r2/') ||
    url.pathname.endsWith('.pdf') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.startsWith('/uploads/')
  ) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);
        });
      })
    );
    return;
  }

  // 5. Read-only Data APIs (Books library, Japanese manifests, Dictionary searches, Questions)
  // Strategy: Network-First with automated background caching and seamless offline fallback
  if (
    url.pathname.startsWith('/api/books') ||
    url.pathname.startsWith('/api/dictionary') ||
    url.pathname.startsWith('/api/eps-book') ||
    url.pathname.startsWith('/api/student/exams')
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Serve saved data response when offline
          return caches.match(request);
        })
    );
    return;
  }

  // 6. Next.js Static Chunks & Immutable Build Assets (/_next/static/...)
  // Network-First when online to ensure newly deployed bundles take effect immediately,
  // falling back to cache when offline
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 7. General Static Assets (Styles, Scripts, Fonts, PDF viewer, Icons)
  // Strategy: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
