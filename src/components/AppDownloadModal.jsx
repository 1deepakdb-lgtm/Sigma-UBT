'use client';

import React, { useState, useEffect } from 'react';

export default function AppDownloadModal({ isOpen, onClose, initialPlatform = null }) {
  const [platform, setPlatform] = useState('android');
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
      if (initialPlatform) {
        setPlatform(initialPlatform);
      } else {
        const ua = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
          setPlatform('ios');
        } else if (ua.includes('android')) {
          setPlatform('android');
        } else if (ua.includes('mac')) {
          setPlatform('mac');
        } else {
          setPlatform('windows');
        }
      }
    }
  }, [isOpen, initialPlatform]);

  if (!isOpen) return null;

  const origin = currentUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const apkDownloadUrl = `${origin}/downloads/ExamJK.apk`;
  const qrUrl = origin
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=${encodeURIComponent(apkDownloadUrl)}`
    : null;

  const handleCopyLink = (textToCopy) => {
    const text = textToCopy || apkDownloadUrl;
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }).catch(() => {});
    }
  };

  const platforms = [
    { id: 'android', label: 'Android', icon: '🤖', color: '#16a34a' },
    { id: 'ios', label: 'iPhone/iPad', icon: '🍎', color: '#0284c7' },
    { id: 'windows', label: 'Windows', icon: '🪟', color: '#2563eb' },
    { id: 'mac', label: 'macOS', icon: '🍏', color: '#0f172a' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxSizing: 'border-box',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              📲
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                Download ExamJK App
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                For Android, iOS, iPad, Windows &amp; Mac
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Platform Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: '#f8fafc', padding: '4px', borderRadius: '10px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
          {platforms.map((p) => {
            const isActive = platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                style={{
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? p.color : '#64748b',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '12px',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Platform Content: ANDROID */}
        {platform === 'android' && (
          <div>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: '800', fontSize: '14px', marginBottom: '6px' }}>
                <span>🤖</span>
                <span>ExamJK Native Android APK (v2.5)</span>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#166534', lineHeight: '1.5' }}>
                Download the official APK directly to your phone. Includes full Korean EPS-TOPIK &amp; Japanese CBT sets, offline audio, and 0-latency timer.
              </p>
              <a
                href="/downloads/ExamJK.apk"
                download="ExamJK.apk"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '800',
                  boxShadow: '0 3px 10px rgba(22, 163, 74, 0.35)',
                  boxSizing: 'border-box'
                }}
              >
                <span>📥</span>
                <span>DOWNLOAD EXAMJK.APK (6.1 MB)</span>
              </a>
            </div>

            {/* QR Code and Direct Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt="Scan to Install Android App"
                  style={{ width: '84px', height: '84px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', padding: '3px', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                  Scan QR with your Phone Camera
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                  Instantly starts download on your phone
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyLink(apkDownloadUrl)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#0f172a',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{copiedLink ? '✓ Copied!' : '🔗 Copy APK Link'}</span>
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                How to install:
              </div>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#64748b', lineHeight: '1.6' }}>
                <li>Tap <strong>DOWNLOAD EXAMJK.APK</strong> above.</li>
                <li>When download finishes, tap <strong>Open</strong> or find it in your Downloads folder.</li>
                <li>If prompted &quot;Install unknown apps&quot;, toggle <strong>Allow from this source</strong>.</li>
                <li>Tap <strong>Install</strong> and launch ExamJK!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Platform Content: IOS / IPAD */}
        {platform === 'ios' && (
          <div>
            <div style={{ background: '#f0f9ff', border: '1.5px solid #7dd3fc', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: '800', fontSize: '14px', marginBottom: '6px' }}>
                <span>🍎</span>
                <span>iPhone &amp; iPad Home Screen App</span>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#0369a1', lineHeight: '1.5' }}>
                Install ExamJK directly onto your iPhone or iPad with zero App Store download delays. Works with full-screen retina display and offline audio.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                Easy 3-Step Setup in Safari:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                    1
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                    Open this website in <strong>Safari</strong> on your iPhone or iPad.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                    2
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                    Tap the <strong>Share</strong> button at bottom center (square with arrow pointing up <span style={{ fontSize: '14px' }}>📤</span>).
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                    3
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                    Scroll down and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopyLink(origin)}
              style={{
                width: '100%',
                padding: '11px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '700',
                color: '#0f172a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>{copiedLink ? '✓ Copied to Clipboard!' : '🔗 Copy Link to Open in Safari'}</span>
            </button>
          </div>
        )}

        {/* Platform Content: WINDOWS */}
        {platform === 'windows' && (
          <div>
            <div style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '800', fontSize: '14px', marginBottom: '6px' }}>
                <span>🪟</span>
                <span>ExamJK Windows Desktop App</span>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#1e40af', lineHeight: '1.5' }}>
                Optimized for full-screen mock exams on Windows 10 &amp; 11 laptops and desktop PCs.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="/downloads/ExamJK-Windows-Launcher.bat"
                  download="ExamJK-Windows-Launcher.bat"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '11px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '800'
                  }}
                >
                  <span>📥</span>
                  <span>Windows Launcher (.bat)</span>
                </a>
                <a
                  href="/downloads/ExamJK.url"
                  download="ExamJK.url"
                  style={{
                    padding: '11px 16px',
                    backgroundColor: '#ffffff',
                    color: '#2563eb',
                    border: '1.5px solid #93c5fd',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none'
                  }}
                >
                  Desktop Shortcut
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Platform Content: MACOS */}
        {platform === 'mac' && (
          <div>
            <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '800', fontSize: '14px', marginBottom: '6px' }}>
                <span>🍏</span>
                <span>ExamJK macOS App</span>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
                Native macOS launcher with Dock integration for Apple Silicon (M1/M2/M3) &amp; Intel Macs.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="/downloads/ExamJK-macOS-Universal.zip"
                  download="ExamJK-macOS-Universal.zip"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '11px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '800'
                  }}
                >
                  <span>📥</span>
                  <span>macOS Universal App (.zip)</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Direct Link Share Footer */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Official App Link: <span style={{ color: '#0f172a', fontWeight: '700' }}>{origin}</span>
          </div>
          <button
            type="button"
            onClick={() => handleCopyLink(apkDownloadUrl)}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#1e293b',
              cursor: 'pointer'
            }}
          >
            {copiedLink ? '✓ Copied!' : '📋 Copy Download Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

