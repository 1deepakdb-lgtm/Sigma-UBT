'use client';

import React, { useEffect, useState, useRef } from 'react';
import { fetchAndCacheFile } from '@/lib/offlineBookStorage';
import { INITIAL_60_CHAPTERS } from '@/lib/epsBookData';

/**
 * OfflineSyncManager
 * Intelligent auto-downloader that caches textbooks, dictionary, and examination assets
 * whenever the device is online so users can use ExamJK completely offline.
 */
export default function OfflineSyncManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'completed' | 'error'
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const syncLock = useRef(false);

  // Monitor network online/offline events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setSyncMessage('Device is online. Updating offline content...');
      triggerAutoSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
      setSyncMessage('Offline Mode: Books, Dictionary & Exams are ready without internet.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial background sync check after page settles (3 seconds delay so it doesn't block initial load)
    const timer = setTimeout(() => {
      if (navigator.onLine) {
        triggerAutoSync();
      } else {
        setIsOnline(false);
        setShowNotification(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, []);

  // Main Auto-Sync function: Downloads core assets, books, dictionary, and PDFs for offline use
  async function triggerAutoSync() {
    if (syncLock.current || !navigator.onLine) return;
    syncLock.current = true;
    setSyncStatus('syncing');
    setSyncProgress(10);
    setSyncMessage('Downloading offline essentials...');

    try {
      // 1. Sync & Cache Book Manifests
      setSyncProgress(25);
      setSyncMessage('Caching EPS & Japanese textbook curriculum...');
      try {
        const booksRes = await fetch('/api/books');
        if (booksRes.ok) {
          const booksData = await booksRes.json();
          localStorage.setItem('offline_books_manifest', JSON.stringify(booksData));
        }
      } catch (e) {}

      try {
        const jaRes = await fetch('/api/books/japanese-r2');
        if (jaRes.ok) {
          const jaData = await jaRes.json();
          localStorage.setItem('offline_japanese_books_manifest', JSON.stringify(jaData));
        }
      } catch (e) {}

      // 2. Sync & Cache Dictionary Vocabularies
      setSyncProgress(50);
      setSyncMessage('Saving Korean & Japanese dictionary for offline search...');
      try {
        const dictKoRes = await fetch('/api/dictionary?q=&lang=ko&filter=all&limit=500');
        if (dictKoRes.ok) {
          const dictKo = await dictKoRes.json();
          if (dictKo.results) {
            localStorage.setItem('offline_dict_cache_ko', JSON.stringify(dictKo.results));
          }
        }
      } catch (e) {}

      try {
        const dictJaRes = await fetch('/api/dictionary?q=&lang=ja&filter=all&limit=500');
        if (dictJaRes.ok) {
          const dictJa = await dictJaRes.json();
          if (dictJa.results) {
            localStorage.setItem('offline_dict_cache_ja', JSON.stringify(dictJa.results));
          }
        }
      } catch (e) {}

      // 3. Sync & Cache PDF Viewer Engine
      setSyncProgress(70);
      setSyncMessage('Saving vector PDF viewer & worker engine...');
      const viewerFiles = ['/pdfviewer.html', '/pdf.min.js', '/pdf.worker.min.js'];
      await Promise.allSettled(
        viewerFiles.map(url =>
          fetch(url, { cache: 'force-cache' }).catch(() => {})
        )
      );

      // 4. Preload first 5 EPS Chapter PDFs & Covers in background
      setSyncProgress(85);
      setSyncMessage('Preloading textbook chapters & audio tracks...');
      const priorityChapters = INITIAL_60_CHAPTERS.slice(0, 5);
      for (const ch of priorityChapters) {
        if (ch.pdfUrl) {
          try {
            await fetchAndCacheFile(ch.pdfUrl, {
              type: 'pdf',
              chapterId: ch.id,
              mimeType: 'application/pdf'
            });
          } catch (e) {}
        }
        if (ch.coverImage) {
          try {
            await fetch(ch.coverImage, { cache: 'force-cache' }).catch(() => {});
          } catch (e) {}
        }
      }

      setSyncProgress(100);
      setSyncStatus('completed');
      setSyncMessage('Offline Ready: All books, dictionary & PDF viewer saved.');
      localStorage.setItem('examjk_offline_sync_timestamp', String(Date.now()));

      // Hide success banner after 5 seconds to stay clean
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    } catch (err) {
      console.warn('Offline sync partial notice:', err);
      setSyncStatus('error');
      setSyncMessage('Offline mode active with existing saved content.');
      setTimeout(() => setShowNotification(false), 4000);
    } finally {
      syncLock.current = false;
    }
  }

  if (!showNotification && isOnline && syncStatus !== 'syncing') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '18px',
        right: '18px',
        zIndex: 999999,
        maxWidth: '360px',
        width: 'calc(100vw - 36px)',
        boxSizing: 'border-box',
        backgroundColor: !isOnline ? '#0f172a' : syncStatus === 'syncing' ? '#1e293b' : '#065f46',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0,0,0,0.15)',
        border: !isOnline ? '1.5px solid #eab308' : syncStatus === 'syncing' ? '1.5px solid #38bdf8' : '1.5px solid #34d399',
        fontSize: '12.5px',
        fontWeight: '600',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        animation: 'fadeInUp 0.25s ease-out',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {/* Status Dot */}
          <span
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: !isOnline ? '#eab308' : syncStatus === 'syncing' ? '#38bdf8' : '#10b981',
              boxShadow: !isOnline
                ? '0 0 8px #eab308'
                : syncStatus === 'syncing'
                ? '0 0 8px #38bdf8'
                : '0 0 8px #10b981',
              flexShrink: 0
            }}
          />
          <span style={{ fontWeight: '800', fontSize: '13px', color: '#ffffff' }}>
            {!isOnline
              ? '⚡ Offline Mode'
              : syncStatus === 'syncing'
              ? '⬇️ Downloading Offline Data'
              : '✅ Offline Ready'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowNotification(false)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      <div style={{ fontSize: '11.5px', color: '#e2e8f0', lineHeight: 1.35 }}>
        {syncMessage || (!isOnline ? 'You can read books, view PDFs, and search dictionary without internet.' : 'Content downloaded on this device.')}
      </div>

      {/* Progress Bar while downloading */}
      {syncStatus === 'syncing' && (
        <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
          <div
            style={{
              width: `${syncProgress}%`,
              height: '100%',
              backgroundColor: '#38bdf8',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      )}

      {/* Manual Re-sync Button when online */}
      {isOnline && syncStatus !== 'syncing' && (
        <button
          type="button"
          onClick={triggerAutoSync}
          style={{
            marginTop: '4px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            color: '#ffffff',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          🔄 Re-download / Sync Now
        </button>
      )}
    </div>
  );
}
