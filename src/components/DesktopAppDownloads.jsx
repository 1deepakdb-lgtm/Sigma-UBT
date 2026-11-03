'use client';

import React, { useState, useEffect } from 'react';

export default function DesktopAppDownloads() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [currentOS, setCurrentOS] = useState('windows');
  const [activeModal, setActiveModal] = useState(null); // 'android' | 'ios' | 'windows' | 'mac' | null
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
      // Detect user operating system
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setCurrentOS('ios');
      } else if (ua.includes('android')) {
        setCurrentOS('android');
      } else if (ua.includes('mac')) {
        setCurrentOS('mac');
      } else {
        setCurrentOS('windows');
      }
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
    if (targetOS === 'android') {
      // Direct APK download for Android users
      try {
        const link = document.createElement('a');
        link.href = '/downloads/ExamJK.apk';
        link.download = 'ExamJK.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {}
      setActiveModal('android');
      return;
    }

    if (targetOS === 'ios') {
      setActiveModal('ios');
      return;
    }

    if (deferredPrompt && (targetOS === 'windows' || targetOS === 'mac')) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          return;
        }
      } catch (e) {}
    }

    setActiveModal(targetOS);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const urlToCopy = currentUrl || window.location.origin;
      navigator.clipboard?.writeText(urlToCopy).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }).catch(() => {});
    }
  };

  const downloadScriptBlob = (filename, content, mime = 'text/plain') => {
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      window.open(`/downloads/${filename}`, '_blank');
    }
  };

  const handleDownloadWindowsBat = () => {
    const origin = currentUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const content = `@echo off
title ExamJK Windows Desktop App Launcher
echo ========================================================
echo        ExamJK - Japanese & Korean UBT Exam System
echo ========================================================
echo.
echo Launching ExamJK in native standalone app window...
echo.

set "TARGET_URL=${origin}"
if "%~1" neq "" set "TARGET_URL=%~1"

:: Check for Google Chrome
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%TARGET_URL%"
    exit /b 0
)
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%TARGET_URL%"
    exit /b 0
)

:: Check for Microsoft Edge
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%TARGET_URL%"
    exit /b 0
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%TARGET_URL%"
    exit /b 0
)

:: Check for Brave Browser
if exist "%LOCALAPPDATA%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" (
    start "" "%LOCALAPPDATA%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" --app="%TARGET_URL%"
    exit /b 0
)

:: Default browser fallback
start "" "%TARGET_URL%"
exit /b 0
`;
    downloadScriptBlob('ExamJK-Windows-Launcher.bat', content, 'application/x-bat');
  };

  const handleDownloadMacSilicon = () => {
    const origin = currentUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const content = `#!/bin/bash
# ExamJK macOS Native Launcher for Apple Silicon (M1, M2, M3, M4)
echo "=========================================================="
echo "   ExamJK - Apple Silicon Launcher (M1/M2/M3/M4)"
echo "=========================================================="
echo "Launching ExamJK in standalone high-performance window..."

TARGET_URL="${origin}"
if [ "$1" != "" ]; then
    TARGET_URL="$1"
fi

if [ -d "/Applications/Google Chrome.app" ]; then
    arch -arm64 open -na "/Applications/Google Chrome.app" --args --app="$TARGET_URL" 2>/dev/null || open -na "/Applications/Google Chrome.app" --args --app="$TARGET_URL"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
    arch -arm64 open -na "/Applications/Microsoft Edge.app" --args --app="$TARGET_URL" 2>/dev/null || open -na "/Applications/Microsoft Edge.app" --args --app="$TARGET_URL"
elif [ -d "/Applications/Brave Browser.app" ]; then
    arch -arm64 open -na "/Applications/Brave Browser.app" --args --app="$TARGET_URL" 2>/dev/null || open -na "/Applications/Brave Browser.app" --args --app="$TARGET_URL"
else
    open "$TARGET_URL"
fi
exit 0
`;
    downloadScriptBlob('ExamJK-macOS-Silicon.command', content, 'application/x-sh');
  };

  const handleDownloadMacIntel = () => {
    const origin = currentUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const content = `#!/bin/bash
# ExamJK macOS Native Launcher for Intel Core Macs (x86_64)
echo "=========================================================="
echo "   ExamJK - Intel Mac Launcher (Core i3/i5/i7/i9)"
echo "=========================================================="
echo "Launching ExamJK in standalone high-performance window..."

TARGET_URL="${origin}"
if [ "$1" != "" ]; then
    TARGET_URL="$1"
fi

if [ -d "/Applications/Google Chrome.app" ]; then
    arch -x86_64 open -na "/Applications/Google Chrome.app" --args --app="$TARGET_URL" 2>/dev/null || open -na "/Applications/Google Chrome.app" --args --app="$TARGET_URL"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
    arch -x86_64 open -na "/Applications/Microsoft Edge.app" --args --app="$TARGET_URL" 2>/dev/null || open -na "/Applications/Microsoft Edge.app" --args --app="$TARGET_URL"
elif [ -d "/Applications/Brave Browser.app" ]; then
    arch -x86_64 open -na "/Applications/Brave Browser.app" --args --app="$TARGET_URL" 2>/dev/null || open -na "/Applications/Brave Browser.app" --args --app="$TARGET_URL"
else
    open "$TARGET_URL"
fi
exit 0
`;
    downloadScriptBlob('ExamJK-macOS-Intel.command', content, 'application/x-sh');
  };

  const handleDownloadWindowsUrl = () => {
    const origin = currentUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const content = `[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,0
[InternetShortcut]
IDList=
URL=${origin}
IconIndex=0
IconFile=https://raw.githubusercontent.com/favicon.ico
`;
    downloadScriptBlob('ExamJK.url', content, 'application/internet-shortcut');
  };

  const qrUrl = currentUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(currentUrl)}`
    : null;

  const apps = [
    {
      id: 'android',
      title: 'ExamJK Android App',
      label: 'Android',
      badge: 'v2.5 APK (6.1 MB)',
      osTag: 'Your Phone',
      iconEmoji: '🤖',
      brandColor: '#16a34a',
      bgHover: '#f0fdf4',
      borderActive: '#16a34a',
      desc: 'Native Android APK with offline question bank and Korean & Japanese tracks.'
    },
    {
      id: 'ios',
      title: 'ExamJK iOS App',
      label: 'iPhone/iPad',
      badge: 'iOS Web App',
      osTag: 'Your Phone',
      iconEmoji: '🍎',
      brandColor: '#0284c7',
      bgHover: '#f0f9ff',
      borderActive: '#0284c7',
      desc: 'Add to iPhone / iPad Home Screen with zero-latency audio and full-screen UBT mode.'
    },
    {
      id: 'windows',
      title: 'ExamJK Windows App',
      label: 'Windows',
      badge: 'PC Desktop App',
      osTag: 'Your PC',
      iconEmoji: '🪟',
      brandColor: '#2563eb',
      bgHover: '#eff6ff',
      borderActive: '#2563eb',
      desc: 'Distraction-free desktop app for Windows 10 & 11 with full screen exam layout.'
    },
    {
      id: 'mac',
      title: 'ExamJK macOS App',
      label: 'macOS',
      badge: 'Mac Desktop',
      osTag: 'Your Mac',
      iconEmoji: '🍏',
      brandColor: '#0f172a',
      bgHover: '#f8fafc',
      borderActive: '#0f172a',
      desc: 'Seamless Mac app integration with Dock launcher and optimized retina display.'
    }
  ];

  const currentModalApp = apps.find((a) => a.id === activeModal) || apps[0];

  return (
    <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '13px' }}>📲</span>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.2px' }}>
            Download ExamJK App for All Devices
          </span>
        </div>
      </div>

      {/* 4 App Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
        {apps.map((app) => {
          const isUserOS = currentOS === app.id;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => handleDownloadClick(app.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 2px 5px 2px',
                borderRadius: '8px',
                border: isUserOS ? `1.5px solid ${app.borderActive}` : '1px solid #cbd5e1',
                background: isUserOS ? app.bgHover : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                boxShadow: isUserOS ? `0 1px 4px ${app.brandColor}22` : '0 1px 2px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = app.brandColor;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isUserOS ? app.borderActive : '#cbd5e1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title={`Download ${app.title}`}
            >
              {isUserOS && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '2px',
                    background: app.brandColor,
                    color: '#ffffff',
                    fontSize: '6.5px',
                    fontWeight: '900',
                    padding: '1px 3.5px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    letterSpacing: '0.2px'
                  }}
                >
                  {app.osTag}
                </span>
              )}

              {/* App Icon with Emoji Badge */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: '3px',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  padding: '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <img
                  src="/icon-192.png"
                  alt="ExamJK Logo"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    display: 'block',
                    objectFit: 'contain'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-4px',
                    fontSize: '9px',
                    lineHeight: '1',
                    background: '#ffffff',
                    borderRadius: '50%',
                    padding: '1px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  {app.iconEmoji}
                </span>
              </div>

              {/* App Name */}
              <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#0f172a', lineHeight: '1.1' }}>
                {app.label}
              </span>
              <span style={{ fontSize: '7.5px', color: isUserOS ? app.brandColor : '#64748b', fontWeight: '700', marginTop: '1px' }}>
                {app.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feature Badges Footer */}
      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '9px', color: '#64748b', fontWeight: '600' }}>
        <span>✓ Free Access</span>
        <span>•</span>
        <span>Zero Latency</span>
        <span>•</span>
        <span>Offline Tests</span>
      </div>

      {/* Comprehensive App Installation & Download Modal */}
      {activeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              textAlign: 'left',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & OS Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '3px',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                    border: '1.5px solid #e2e8f0'
                  }}
                >
                  <img
                    src="/icon-192.png"
                    alt="ExamJK App Icon"
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '9px',
                      boxShadow: 'none',
                      display: 'block',
                      objectFit: 'contain'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-5px',
                      fontSize: '16px',
                      background: '#ffffff',
                      borderRadius: '50%',
                      padding: '2px',
                      lineHeight: '1',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
                    }}
                  >
                    {currentModalApp.iconEmoji}
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {currentModalApp.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', background: `${currentModalApp.brandColor}18`, color: currentModalApp.brandColor, padding: '1px 7px', borderRadius: '6px', fontWeight: '800' }}>
                      {currentModalApp.badge}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Updated 2026</span>
                  </div>
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
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              >
                ✕
              </button>
            </div>

            {/* Quick Platform Switcher Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '16px' }}>
              {apps.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActiveModal(a.id)}
                  style={{
                    border: 'none',
                    background: activeModal === a.id ? '#ffffff' : 'transparent',
                    color: activeModal === a.id ? a.brandColor : '#64748b',
                    fontWeight: activeModal === a.id ? '800' : '600',
                    fontSize: '11.5px',
                    padding: '6px 4px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    boxShadow: activeModal === a.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{a.iconEmoji}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>

            {/* Platform Specific Body */}
            {activeModal === 'android' && (
              <div>
                <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: '800', fontSize: '13px', marginBottom: '6px' }}>
                    <span>⚡</span>
                    <span>Android APK Direct Download (v2.5)</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#166534', lineHeight: '1.5' }}>
                    Download the official native Android APK directly to your phone. Includes full Korean &amp; Japanese question sets, offline mode, and audio player.
                  </p>
                  <a
                    href="/downloads/ExamJK.apk"
                    download="ExamJK.apk"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '8px',
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

                {/* QR Code for Phone Scan */}
                {qrUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
                    <img
                      src={qrUrl}
                      alt="Scan to Install on Android"
                      style={{ width: '84px', height: '84px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', padding: '3px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '3px' }}>
                        Scan with your Android Camera 📱
                      </span>
                      <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                        Point your mobile camera at this QR code to download and install ExamJK directly on your phone.
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedLink ? '✓ Link Copied!' : '📋 Copy Download Link'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Android Steps */}
                <div style={{ fontSize: '12.5px', color: '#334155' }}>
                  <span style={{ fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Quick Installation Steps:
                  </span>
                  <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: '1.6' }}>
                    <li>Tap <strong>Download ExamJK.apk</strong> above.</li>
                    <li>Open your notification bar or <strong>Downloads</strong> folder.</li>
                    <li>Tap <strong>ExamJK.apk</strong>. If prompted, allow &quot;Install Unknown Apps&quot;.</li>
                    <li>Tap <strong>Install</strong> and start your exam preparation!</li>
                  </ol>
                </div>
              </div>
            )}

            {activeModal === 'ios' && (
              <div>
                <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: '800', fontSize: '13px', marginBottom: '6px' }}>
                    <span>🍎</span>
                    <span>Install ExamJK on iPhone &amp; iPad</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#0369a1', lineHeight: '1.5' }}>
                    ExamJK runs as a full-screen, hardware-accelerated Apple Web App on iOS with zero audio lag and full offline support.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(2, 132, 199, 0.35)'
                    }}
                  >
                    {copiedLink ? '✓ Portal Link Copied to Clipboard!' : '📋 Copy Portal Link for Safari'}
                  </button>
                </div>

                {/* QR Code for iPhone Scan */}
                {qrUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
                    <img
                      src={qrUrl}
                      alt="Scan to Open on iPhone"
                      style={{ width: '84px', height: '84px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', padding: '3px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '3px' }}>
                        Scan with your iPhone Camera 📷
                      </span>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                        Open your iPhone Camera, point at this QR code, and tap the yellow banner to open in Safari.
                      </p>
                    </div>
                  </div>
                )}

                {/* iOS 3-Step Guide */}
                <div style={{ fontSize: '12.5px', color: '#334155' }}>
                  <span style={{ fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    3 Simple Steps in Safari:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ background: '#0284c7', color: '#ffffff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0 }}>1</span>
                      <span style={{ fontSize: '12px' }}>Open this website in <strong>Safari</strong> on your iPhone or iPad.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ background: '#0284c7', color: '#ffffff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0 }}>2</span>
                      <span style={{ fontSize: '12px' }}>Tap the <strong>Share</strong> button (⎋ square with upward arrow) at the bottom toolbar.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ background: '#0284c7', color: '#ffffff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0 }}>3</span>
                      <span style={{ fontSize: '12px' }}>Scroll down and tap <strong>&quot;Add to Home Screen&quot; (⊞)</strong>, then tap <strong>Add</strong>. Done!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'windows' && (
              <div>
                <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '800', fontSize: '13px', marginBottom: '6px' }}>
                    <span>🪟</span>
                    <span>ExamJK for Windows 10 &amp; 11</span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#1e40af', lineHeight: '1.5' }}>
                    Install ExamJK directly onto your Windows Desktop &amp; Start Menu for distraction-free UBT practice tests.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {deferredPrompt ? (
                      <button
                        type="button"
                        onClick={async () => {
                          deferredPrompt.prompt();
                          const choice = await deferredPrompt.userChoice;
                          if (choice.outcome === 'accepted') {
                            setDeferredPrompt(null);
                            setActiveModal(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(37, 99, 235, 0.35)'
                        }}
                      >
                        ⚡ 1-Click Install Windows App
                      </button>
                    ) : (
                      <div style={{ background: '#ffffff', border: '1px solid #93c5fd', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#1e3a8a' }}>
                        💡 <strong>1-Click Install:</strong> Click the <strong>Install App icon (💻 or ⊕)</strong> in your browser&apos;s address bar (Chrome, Edge, Brave) to add ExamJK to your Windows Desktop.
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleDownloadWindowsBat}
                        style={{
                          padding: '9px 10px',
                          background: '#ffffff',
                          border: '1.5px solid #2563eb',
                          color: '#2563eb',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                      >
                        📥 Desktop Launcher (.bat)
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadWindowsUrl}
                        style={{
                          padding: '9px 10px',
                          background: '#ffffff',
                          border: '1.5px solid #64748b',
                          color: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                      >
                        📥 Web Shortcut (.url)
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: '#334155' }}>
                  <span style={{ fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    How to install via Browser:
                  </span>
                  <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: '1.6' }}>
                    <li>Look at the right side of your browser URL bar.</li>
                    <li>Click the <strong>Install ExamJK icon (⊕ or 💻)</strong>.</li>
                    <li>Click <strong>Install</strong> to add ExamJK to your Windows Desktop &amp; Start Menu!</li>
                  </ol>
                </div>
              </div>
            )}

            {activeModal === 'mac' && (
              <div>
                <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>
                    <img
                      src="/icon-192.png"
                      alt="ExamJK Logo"
                      style={{ width: '22px', height: '22px', borderRadius: '5px', display: 'block' }}
                    />
                    <span>ExamJK for Apple macOS</span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                    Select your Mac chip to download the standalone native app launcher:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {deferredPrompt && (
                      <button
                        type="button"
                        onClick={async () => {
                          deferredPrompt.prompt();
                          const choice = await deferredPrompt.userChoice;
                          if (choice.outcome === 'accepted') {
                            setDeferredPrompt(null);
                            setActiveModal(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(15, 23, 42, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>⚡ 1-Click Install to Applications &amp; Dock</span>
                      </button>
                    )}

                    {/* Apple Silicon Launcher (M1/M2/M3/M4) */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: '#ffffff',
                        border: '1.5px solid #0f172a',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🍏</span>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', display: 'block', color: '#0f172a' }}>
                            Apple Silicon (M1 / M2 / M3 / M4)
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Optimized for ARM64 macOS
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={handleDownloadMacSilicon}
                          style={{
                            fontSize: '11.5px',
                            fontWeight: '800',
                            color: '#ffffff',
                            background: '#0f172a',
                            border: 'none',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          📥 .command
                        </button>
                        <a
                          href="/downloads/ExamJK-macOS-Silicon.zip"
                          download="ExamJK-macOS-Silicon.zip"
                          style={{
                            fontSize: '11.5px',
                            fontWeight: '800',
                            color: '#0f172a',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap'
                          }}
                          title="Download pre-extracted zip archive"
                        >
                          📦 .zip
                        </a>
                      </div>
                    </div>

                    {/* Intel Mac Launcher (x86_64) */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>💻</span>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', display: 'block', color: '#0f172a' }}>
                            Intel Mac (x86_64 Core i5/i7/i9)
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Optimized for Intel-based Macs
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={handleDownloadMacIntel}
                          style={{
                            fontSize: '11.5px',
                            fontWeight: '800',
                            color: '#ffffff',
                            background: '#334155',
                            border: 'none',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          📥 .command
                        </button>
                        <a
                          href="/downloads/ExamJK-macOS-Intel.zip"
                          download="ExamJK-macOS-Intel.zip"
                          style={{
                            fontSize: '11.5px',
                            fontWeight: '800',
                            color: '#334155',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap'
                          }}
                          title="Download pre-extracted zip archive"
                        >
                          📦 .zip
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <span style={{ fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    How to Launch on Mac:
                  </span>
                  <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: '1.6' }}>
                    <li>Download the launcher for your Mac (<strong>Apple Silicon</strong> or <strong>Intel</strong>).</li>
                    <li>Double-click the downloaded <strong>.command</strong> file in your Downloads folder to launch ExamJK instantly in standalone mode!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {copiedLink ? '✓ Link Copied!' : '📋 Copy Portal Link'}
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  padding: '9px 20px',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
