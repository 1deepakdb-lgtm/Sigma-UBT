'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AboutUsSection from '@/components/AboutUsSection';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Top Universal Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#003b73',
        backgroundImage: 'linear-gradient(135deg, #002b5c 0%, #003b73 60%, #004b93 100%)',
        color: '#ffffff',
        padding: '12px 20px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div
          onClick={() => router.push('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <img
            src="/examjk-logo.png"
            alt="ExamJK Logo"
            style={{ width: '36px', height: '36px', objectFit: 'contain', backgroundColor: '#ffffff', borderRadius: '8px', padding: '2px' }}
          />
          <div>
            <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
              ExamJK
            </div>
            <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: '600' }}>
              Smart Learning &amp; Examination Platform
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }}
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '13px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.15s ease'
          }}
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1020px', margin: '0 auto', padding: '24px 16px' }}>
        <AboutUsSection />
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 16px',
        fontSize: '13px',
        color: '#64748b',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#ffffff'
      }}>
        <div>&copy; {new Date().getFullYear()} ExamJK (examjk.com) — All rights reserved.</div>
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#94a3b8' }}>
          Samakhushi Chowk, Kathmandu, Nepal | Phone: +977-9868736491, +977-9806100148
        </div>
      </footer>
    </div>
  );
}
