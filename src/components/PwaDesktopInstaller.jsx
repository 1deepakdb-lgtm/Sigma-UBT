'use client';

import React, { useState, useEffect } from 'react';

export default function PwaDesktopInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [osName, setOsName] = useState('Desktop');

  useEffect(() => {
    // 1. Detect if running inside installed desktop app window
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(checkStandalone);

    // 2. Detect OS for tailored instructions
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) {
      setOsName('macOS');
    } else if (ua.includes('win')) {
      setOsName('Windows');
    } else if (ua.includes('linux')) {
      setOsName('Linux');
    }

    // 3. Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('ExamJK PWA Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration skipped:', err);
        });
    }

    // 4. Capture native browser install prompt (Chrome, Edge, Brave, etc.)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Detect app installed event
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
        setDeferredPrompt(null);
      }
    } else {
      setShowModal(true);
    }
  };

  // If already running inside installed standalone desktop app, do not show install button
  if (isStandalone) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '18px',
          right: '18px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <button
          type="button"
          onClick={handleInstallClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '10px 16px',
            borderRadius: '50px',
            fontSize: '13px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(79, 70, 229, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.35)';
          }}
        >
          <img
            src="/icon-192.png"
            alt="ExamJK Logo"
            style={{ width: '20px', height: '20px', borderRadius: '4px', display: 'block' }}
          />
          <span>Install {osName} Desktop App</span>
        </button>
      </div>

      {/* Manual Install Guide Modal for Safari / Edge / Chrome if prompt not ready */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src="/icon-192.png"
                  alt="ExamJK Icon"
                  style={{ width: '44px', height: '44px', borderRadius: '10px', boxShadow: '0 3px 8px rgba(0,0,0,0.12)' }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    Install ExamJK App
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Run as a standalone desktop program for {osName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontWeight: '800',
                  color: '#475569'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: '700', color: '#0f172a' }}>
                How to install on {osName}:
              </p>
              {osName === 'macOS' ? (
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li><strong>In Chrome/Brave/Edge:</strong> Click the <strong>Install</strong> icon (💻 or ⊕) in the browser address bar, then click <em>Install</em>.</li>
                  <li><strong>In Safari:</strong> Click <strong>File &gt; Add to Dock</strong> from the top menu bar.</li>
                  <li>The app will appear in your <strong>Applications</strong> folder &amp; Dock!</li>
                </ul>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li><strong>In Chrome / Edge / Brave:</strong> Click the <strong>Install</strong> icon (💻 or ⊕) in the browser address bar.</li>
                  <li>Click <strong>Install</strong> to add ExamJK to your <strong>Desktop &amp; Start Menu</strong>.</li>
                  <li>It runs in its own dedicated, distraction-free desktop window!</li>
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
