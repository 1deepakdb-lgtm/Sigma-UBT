'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import AiStudio from '@/components/AiStudio';

export default function VoiceStudioPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Navbar role="admin" title="🎙️ AI STUDIO" />

      {/* Main Container */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px' }}>
        <AiStudio embedded={false} userRole="admin" />
      </div>
    </div>
  );
}
