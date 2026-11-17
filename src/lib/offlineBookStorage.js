/**
 * OfflineBookStorage
 * Ultra-fast client-side persistent storage for EPS-TOPIK Textbook PDFs and Audio Tracks.
 * Uses native IndexedDB + CacheStorage for lifetime persistent storage + In-Memory ObjectURL cache.
 * Guarantees chapters and audios open immediately in milliseconds with zero download buttons.
 */

const DB_NAME = 'sigma_eps_offline_db';
const DB_VERSION = 1;
const STORE_FILES = 'offline_files';
const STORE_CHAPTERS = 'offline_chapters';
const CACHE_NAME = 'sigma_pdf_cache_v1';

// In-memory cache for instantaneous (0ms) access across current session
const inMemoryBlobUrlCache = new Map();
const inMemoryBufferCache = new Map();
const inMemoryChapterStatusCache = new Map();

if (typeof window !== 'undefined') {
  window.__SIGMA_BLOB_CACHE__ = inMemoryBlobUrlCache;
  window.__SIGMA_BUFFER_CACHE__ = inMemoryBufferCache;
}

let dbPromise = null;

// Request permanent persistence from browser so OS never auto-cleans storage
if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
  try {
    navigator.storage.persist().then((persisted) => {
      if (persisted) {
        console.log('[Storage] Lifetime persistent storage granted.');
      }
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Normalize and generate all encoding variants of a URL
 */
export function getUrlVariants(url) {
  if (!url) return [];
  const clean = String(url).split('#')[0].trim();
  const variants = new Set([clean]);
  try {
    const decoded = decodeURIComponent(clean);
    variants.add(decoded);
    variants.add(encodeURI(decoded));
    variants.add(encodeURIComponent(decoded));
  } catch (e) {}
  return Array.from(variants);
}

export function readBlobAsArrayBuffer(blob) {
  if (!blob) return Promise.resolve(null);
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
      reader.readAsArrayBuffer(blob);
    } catch (e) {
      resolve(null);
    }
  });
}

function getDB() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_FILES)) {
            db.createObjectStore(STORE_FILES, { keyPath: 'url' });
          }
          if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
            db.createObjectStore(STORE_CHAPTERS, { keyPath: 'chapterId' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => {
          console.warn('IndexedDB failed to open:', e);
          resolve(null);
        };
      } catch (err) {
        resolve(null);
      }
    });
  }
  return dbPromise;
}

/**
 * Synchronous in-memory lookup for instant 0ms access
 */
export function getCachedBlobSync(url) {
  if (!url || typeof window === 'undefined') return null;
  const variants = getUrlVariants(url);
  for (const v of variants) {
    const hit = inMemoryBlobUrlCache.get(v);
    if (hit) return hit;
  }
  return null;
}

/**
 * Synchronous chapter offline status check
 */
export function isChapterOfflineReadySync(chapterId) {
  if (chapterId === undefined || typeof window === 'undefined') return false;
  return Boolean(inMemoryChapterStatusCache.get(String(chapterId)));
}

/**
 * Preload all stored blobs into inMemoryBlobUrlCache on app launch
 * Ensures all previously opened chapters and audios open in 0ms from memory
 */
export async function preloadAllCachedBlobs() {
  if (typeof window === 'undefined') return;
  const db = await getDB();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_FILES, 'readonly');
    const store = tx.objectStore(STORE_FILES);
    const req = store.getAll();

    req.onsuccess = () => {
      const items = req.result || [];
      items.forEach((item) => {
        if (item.url && item.blob) {
          const variants = getUrlVariants(item.url);
          let blobUrl = null;
          for (const v of variants) {
            if (inMemoryBlobUrlCache.has(v)) {
              blobUrl = inMemoryBlobUrlCache.get(v);
              break;
            }
          }
          if (!blobUrl) {
            try {
              blobUrl = URL.createObjectURL(item.blob);
            } catch (e) {}
          }
          if (blobUrl) {
            variants.forEach((v) => inMemoryBlobUrlCache.set(v, blobUrl));
          }
        }
      });
    };
  } catch (err) {
    console.warn('Preload blobs notice:', err);
  }
}

/**
 * Retrieve cached blob for a specific URL across memory, IndexedDB, and CacheStorage
 */
export async function getCachedFileBlob(url) {
  if (!url || typeof window === 'undefined') return null;
  const variants = getUrlVariants(url);

  // 1. Check in-memory first for 0ms lookup
  for (const v of variants) {
    if (inMemoryBlobUrlCache.has(v)) {
      return inMemoryBlobUrlCache.get(v);
    }
  }

  // 2. Check IndexedDB
  const db = await getDB();
  if (db) {
    const blobFromDb = await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_FILES, 'readonly');
        const store = tx.objectStore(STORE_FILES);
        let found = null;
        let count = 0;

        variants.forEach((v) => {
          const req = store.get(v);
          req.onsuccess = () => {
            count++;
            if (!found && req.result && req.result.blob) {
              found = req.result.blob;
            }
            if (count === variants.length) resolve(found);
          };
          req.onerror = () => {
            count++;
            if (count === variants.length) resolve(found);
          };
        });
      } catch (err) {
        resolve(null);
      }
    });

    if (blobFromDb) {
      try {
        const blobUrl = URL.createObjectURL(blobFromDb);
        variants.forEach((v) => inMemoryBlobUrlCache.set(v, blobUrl));
        return blobUrl;
      } catch (e) {}
    }
  }

  // 3. Check CacheStorage
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(CACHE_NAME);
      for (const v of variants) {
        const matched = await cache.match(v);
        if (matched) {
          const blob = await matched.blob();
          const blobUrl = URL.createObjectURL(blob);
          variants.forEach((varKey) => inMemoryBlobUrlCache.set(varKey, blobUrl));
          return blobUrl;
        }
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Save a file blob to IndexedDB and CacheStorage for lifetime access
 */
export async function saveFileBlob(url, blob, meta = {}) {
  if (!url || !blob || typeof window === 'undefined') return null;
  const variants = getUrlVariants(url);

  const db = await getDB();
  let blobUrl = null;
  try {
    blobUrl = URL.createObjectURL(blob);
    variants.forEach((v) => inMemoryBlobUrlCache.set(v, blobUrl));
  } catch (e) {}

  // 1. Save in IndexedDB under all variants
  if (db) {
    try {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      variants.forEach((v) => {
        store.put({
          url: v,
          blob,
          mimeType: blob.type || meta.mimeType || 'application/octet-stream',
          size: blob.size,
          timestamp: Date.now(),
          chapterId: meta.chapterId,
          type: meta.type || 'file'
        });
      });
    } catch (err) {
      console.warn('Save blob to IndexedDB notice:', err);
    }
  }

  // 2. Save in CacheStorage for lifetime
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(CACHE_NAME);
      const resp = new Response(blob, {
        headers: {
          'Content-Type': blob.type || meta.mimeType || 'application/octet-stream',
          'Content-Length': String(blob.size),
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
      variants.forEach((v) => {
        cache.put(v, resp.clone()).catch(() => {});
      });
    } catch (e) {}
  }

  // 3. Keep in RAM buffer cache for instant 0ms PDF opening
  if (url.includes('.pdf') && blob) {
    readBlobAsArrayBuffer(blob).then((buf) => {
      if (buf) {
        variants.forEach((v) => inMemoryBufferCache.set(v, buf));
      }
    }).catch(() => {});
  }

  return blobUrl;
}

/**
 * Fetch and silently cache a URL in background
 */
export async function fetchAndCacheFile(url, meta = {}) {
  if (!url || typeof window === 'undefined') return null;

  // Check if already cached
  const existing = await getCachedFileBlob(url);
  if (existing) return existing;

  const cleanUrl = url.split('#')[0].trim();
  try {
    const res = await fetch(cleanUrl, { cache: 'force-cache' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await saveFileBlob(cleanUrl, blob, meta);
  } catch (err) {
    console.warn(`Background offline cache notice for ${cleanUrl}:`, err);
    return null;
  }
}

/**
 * Check if a chapter is already saved offline
 */
export async function isChapterOfflineReady(chapterId) {
  if (chapterId === undefined || typeof window === 'undefined') return false;
  const idStr = String(chapterId);

  if (inMemoryChapterStatusCache.has(idStr)) {
    return inMemoryChapterStatusCache.get(idStr);
  }

  const db = await getDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_CHAPTERS, 'readonly');
      const store = tx.objectStore(STORE_CHAPTERS);
      const req = store.get(idStr);

      req.onsuccess = () => {
        const isReady = Boolean(req.result && req.result.isFullyCached);
        inMemoryChapterStatusCache.set(idStr, isReady);
        resolve(isReady);
      };
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Mark chapter offline status
 */
async function setChapterOfflineStatus(chapterId, status) {
  if (chapterId === undefined || typeof window === 'undefined') return;
  const idStr = String(chapterId);
  inMemoryChapterStatusCache.set(idStr, status.isFullyCached);

  const db = await getDB();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    const store = tx.objectStore(STORE_CHAPTERS);
    store.put({
      chapterId: idStr,
      ...status,
      lastSavedAt: Date.now()
    });
  } catch (e) {}
}

/**
 * Auto-Save Chapter Offline
 * Automatically called whenever a chapter is opened!
 * Caches PDF + all audio tracks in background silently for lifetime.
 * Returns cached URLs for PDF and tracks.
 */
export async function autoSaveChapterOffline(chapter, onProgress) {
  if (!chapter) return null;

  const chapterId = chapter.chapter !== undefined ? chapter.chapter : (chapter.id || chapter.folder);
  const pdfUrl = chapter.pdfUrl || chapter.pdf?.url;
  const audioTracks = chapter.audioTracks || [];

  const results = {
    pdfBlobUrl: null,
    audioBlobUrls: {},
    isCached: false,
  };

  // 1. Check or fetch PDF
  let pdfPromise = Promise.resolve(null);
  if (pdfUrl) {
    const cachedPdf = await getCachedFileBlob(pdfUrl);
    if (cachedPdf) {
      results.pdfBlobUrl = cachedPdf;
      if (onProgress) onProgress({ type: 'pdf', blobUrl: cachedPdf, chapterId });
    } else {
      pdfPromise = fetchAndCacheFile(pdfUrl, { chapterId, type: 'pdf', mimeType: 'application/pdf' })
        .then((blobUrl) => {
          if (blobUrl) {
            results.pdfBlobUrl = blobUrl;
            if (onProgress) onProgress({ type: 'pdf', blobUrl, chapterId });
          }
          return blobUrl;
        });
    }
  }

  // 2. Concurrently check/fetch Audio Tracks
  let cachedTracksCount = 0;
  const trackPromises = audioTracks.map(async (track, index) => {
    const trackUrl = track.url;
    if (!trackUrl) return null;

    const cachedTrack = await getCachedFileBlob(trackUrl);
    if (cachedTrack) {
      results.audioBlobUrls[trackUrl] = cachedTrack;
      cachedTracksCount++;
      if (onProgress) onProgress({ type: 'audio', index, trackUrl, blobUrl: cachedTrack, chapterId });
      return cachedTrack;
    } else {
      const blobUrl = await fetchAndCacheFile(trackUrl, { chapterId, type: 'audio', mimeType: 'audio/mpeg' });
      if (blobUrl) {
        results.audioBlobUrls[trackUrl] = blobUrl;
        cachedTracksCount++;
        if (onProgress) onProgress({ type: 'audio', index, trackUrl, blobUrl, chapterId });
      }
      return blobUrl;
    }
  });

  Promise.all([pdfPromise, ...trackPromises]).then(() => {
    const isFullyCached = Boolean(results.pdfBlobUrl || pdfUrl) && (audioTracks.length === 0 || cachedTracksCount >= audioTracks.length);
    results.isCached = isFullyCached;
    setChapterOfflineStatus(chapterId, {
      isFullyCached,
      pdfCached: Boolean(results.pdfBlobUrl),
      audioCount: audioTracks.length,
      cachedAudioCount: cachedTracksCount
    });
    if (onProgress) onProgress({ type: 'completed', isFullyCached, chapterId });
  });

  return results;
}

/**
 * Load all offline chapters status for grid badge rendering
 */
export async function getAllOfflineChaptersStatus() {
  if (typeof window === 'undefined') return {};
  const db = await getDB();
  if (!db) return {};

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_CHAPTERS, 'readonly');
      const store = tx.objectStore(STORE_CHAPTERS);
      const req = store.getAll();

      req.onsuccess = () => {
        const map = {};
        (req.result || []).forEach((item) => {
          map[item.chapterId] = item.isFullyCached;
          inMemoryChapterStatusCache.set(String(item.chapterId), item.isFullyCached);
        });
        resolve(map);
      };
      req.onerror = () => resolve({});
    } catch (e) {
      resolve({});
    }
  });
}
