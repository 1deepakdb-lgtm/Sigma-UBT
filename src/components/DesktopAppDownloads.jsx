'use client';

import React, { useState, useEffect } from 'react';

export default function DesktopAppDownloads() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [currentOS, setCurrentOS] = useState('windows');
  const [activeModal, setActiveModal] = useState(null); // 'windows' | 'mac' | null

  useEffect(() => {
    // Detect user operating system
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) {
      setCurrentOS('mac');
    } else {
      setCurrentOS('windows');
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleDownloadClick = async (targetOS) => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        return;
      }
    }
    setActiveModal(targetOS);
  };

  return (
    <div style={{ marginTop: '22px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
        <span style={{ fontSize: '15px' }}>💻</span>
        <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.2px' }}>
          Download ExamJK Desktop App
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Windows App Button */}
        <button
          type="button"
          onClick={() => handleDownloadClick('windows')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 10px',
            borderRadius: '10px',
            border: currentOS === 'windows' ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
            background: currentOS === 'windows' ? '#eff6ff' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = currentOS === 'windows' ? '#2563eb' : '#cbd5e1';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {currentOS === 'windows' && (
            <span
              style={{
                position: 'absolute',
                top: '-7px',
                right: '8px',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: '900',
                padding: '1px 6px',
                borderRadius: '8px',
                textTransform: 'uppercase'
              }}
            >
              Your PC
            </span>
          )}
          <div style={{ position: 'relative', marginBottom: '6px' }}>
            <img
              src="/icon-192.png"
              alt="ExamJK Windows App"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                display: 'block',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-6px',
                fontSize: '13px',
                lineHeight: '1',
                background: '#ffffff',
                borderRadius: '50%',
                padding: '1px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              🪟
            </span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Windows</span>
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>.exe / Desktop App</span>
        </button>

        {/* macOS App Button */}
        <button
          type="button"
          onClick={() => handleDownloadClick('mac')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 10px',
            borderRadius: '10px',
            border: currentOS === 'mac' ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
            background: currentOS === 'mac' ? '#f8fafc' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0f172a';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = currentOS === 'mac' ? '#0f172a' : '#cbd5e1';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {currentOS === 'mac' && (
            <span
              style={{
                position: 'absolute',
                top: '-7px',
                right: '8px',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: '900',
                padding: '1px 6px',
                borderRadius: '8px',
                textTransform: 'uppercase'
              }}
            >
              Your Mac
            </span>
          )}
          <div style={{ position: 'relative', marginBottom: '6px' }}>
            <img
              src="/icon-192.png"
              alt="ExamJK macOS App"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                display: 'block',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-6px',
                fontSize: '13px',
                lineHeight: '1',
                background: '#ffffff',
                borderRadius: '50%',
                padding: '1px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              🍏
            </span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>macOS</span>
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>.dmg / Mac App</span>
        </button>
      </div>

      <div style={{ marginTop: '8px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: '#64748b' }}>
          ✓ Full Offline Cache · ✓ Zero Latency Audio · ✓ Exam Mode
        </span>
      </div>

      {/* Guide & Installation Modal */}
      {activeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              textAlign: 'left'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src="/icon-192.png"
                    alt="ExamJK App Icon"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      display: 'block'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      fontSize: '15px',
                      background: '#ffffff',
                      borderRadius: '50%',
                      padding: '1px',
                      lineHeight: '1',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    {activeModal === 'windows' ? '🪟' : '🍏'}
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    Install ExamJK for {activeModal === 'windows' ? 'Windows (.exe)' : 'macOS (.dmg / App)'}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Distraction-free desktop exam environment
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontWeight: '800',
                  color: '#475569'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', fontSize: '13px', color: '#334155', lineHeight: '1.6', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              {activeModal === 'windows' ? (
                <>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#0f172a' }}>
                    How to install on Windows (Chrome / Edge / Brave):
                  </p>
                  <ol style={{ margin: 0, paddingLeft: '18px' }}>
                    <li style={{ marginBottom: '6px' }}>Look at the top right of your browser's address bar.</li>
                    <li style={{ marginBottom: '6px' }}>Click the <strong>Install App icon (💻 or ⊕)</strong>.</li>
                    <li style={{ marginBottom: '6px' }}>Click <strong>Install</strong>.</li>
                    <li>ExamJK will now appear on your <strong>Windows Desktop &amp; Start Menu</strong>!</li>
                  </ol>
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#0f172a' }}>
                    How to install on macOS (Safari / Chrome / Edge):
                  </p>
                  <ol style={{ margin: 0, paddingLeft: '18px' }}>
                    <li style={{ marginBottom: '6px' }}><strong>In Safari:</strong> Click <em>File</em> in the Mac top menu bar &gt; <strong>Add to Dock</strong>.</li>
                    <li style={{ marginBottom: '6px' }}><strong>In Chrome/Edge:</strong> Click the <strong>Install</strong> icon (💻 or ⊕) in the URL bar.</li>
                    <li>The app will be added directly into your <strong>Applications folder &amp; Dock</strong>!</li>
                  </ol>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(() => setActiveModal(null));
                  } else {
                    setActiveModal(null);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: activeModal === 'windows' ? '#2563eb' : '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {deferredPrompt ? '⚡ Install Now' : '✓ Got it, Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
