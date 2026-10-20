/**
 * OfflineBookStorage
 * Ultra-fast client-side persistent storage for EPS-TOPIK Textbook PDFs and Audio Tracks.
 * Uses native IndexedDB for persistent binary storage (Blobs) + In-Memory ObjectURL cache.
 * Guarantees chapters open in milliseconds with zero download buttons needed.
 */

const DB_NAME = 'sigma_eps_offline_db';
const DB_VERSION = 1;
const STORE_FILES = 'offline_files';
const STORE_CHAPTERS = 'offline_chapters';

// In-memory cache for instantaneous (0ms) access across current session
const inMemoryBlobUrlCache = new Map();
const inMemoryChapterStatusCache = new Map();

let dbPromise = null;

function getDB() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
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
    });
  }
  return dbPromise;
}

/**
 * Synchronous in-memory lookup for instant 0ms access
 */
export function getCachedBlobSync(url) {
  if (!url || typeof window === 'undefined') return null;
  const cleanUrl = url.split('#')[0].trim();
  return inMemoryBlobUrlCache.get(cleanUrl) || null;
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
 * Ensures all previously opened chapters open in milliseconds from memory
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
        if (item.url && item.blob && !inMemoryBlobUrlCache.has(item.url)) {
          try {
            const blobUrl = URL.createObjectURL(item.blob);
            inMemoryBlobUrlCache.set(item.url, blobUrl);
          } catch (e) {}
        }
      });
    };
  } catch (err) {
    console.warn('Preload blobs notice:', err);
  }
}

/**
 * Retrieve cached blob for a specific URL
 */
export async function getCachedFileBlob(url) {
  if (!url || typeof window === 'undefined') return null;
  const cleanUrl = url.split('#')[0].trim();

  // 1. Check in-memory first for 0ms lookup
  if (inMemoryBlobUrlCache.has(cleanUrl)) {
    return inMemoryBlobUrlCache.get(cleanUrl);
  }

  const db = await getDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const req = store.get(cleanUrl);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          try {
            const blobUrl = URL.createObjectURL(req.result.blob);
            inMemoryBlobUrlCache.set(cleanUrl, blobUrl);
            resolve(blobUrl);
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch (err) {
      resolve(null);
    }
  });
}

/**
 * Save a file blob to IndexedDB
 */
export async function saveFileBlob(url, blob, meta = {}) {
  if (!url || !blob || typeof window === 'undefined') return null;
  const cleanUrl = url.split('#')[0].trim();

  const db = await getDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      store.put({
        url: cleanUrl,
        blob,
        mimeType: blob.type || meta.mimeType || 'application/octet-stream',
        size: blob.size,
        timestamp: Date.now(),
        chapterId: meta.chapterId,
        type: meta.type || 'file'
      });

      tx.oncomplete = () => {
        const blobUrl = URL.createObjectURL(blob);
        inMemoryBlobUrlCache.set(cleanUrl, blobUrl);
        resolve(blobUrl);
      };
      tx.onerror = () => resolve(null);
    } catch (err) {
      resolve(null);
    }
  });
}

/**
 * Fetch and silently cache a URL in background
 */
export async function fetchAndCacheFile(url, meta = {}) {
  if (!url || typeof window === 'undefined') return null;
  const cleanUrl = url.split('#')[0].trim();

  // Check if already cached
  const existing = await getCachedFileBlob(cleanUrl);
  if (existing) return existing;

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
 * Caches PDF + all audio tracks in background silently.
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
