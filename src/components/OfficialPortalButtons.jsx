'use client';

import React from 'react';

export const KOREAN_PORTAL_ITEMS = [
  {
    href: 'https://epsnepal.gov.np/notices',
    label: 'Official Notices',
    iconType: 'notice',
    language: 'korean',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
    shadowColor: 'rgba(29, 78, 216, 0.38)',
    hoverShadow: '0 12px 28px rgba(29, 78, 216, 0.55)'
  },
  {
    href: 'https://epsnepal.gov.np/jobappform/?page=newreg',
    label: 'Job Application',
    iconType: 'job',
    language: 'korean',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    shadowColor: 'rgba(2, 132, 199, 0.38)',
    hoverShadow: '0 12px 28px rgba(2, 132, 199, 0.55)'
  },
  {
    href: 'https://eoers.epsnepal.gov.np/',
    label: 'New Application',
    iconType: 'application',
    language: 'korean',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    shadowColor: 'rgba(5, 150, 105, 0.38)',
    hoverShadow: '0 12px 28px rgba(5, 150, 105, 0.55)'
  },
  {
    href: 'https://epstopik.hrdkorea.or.kr/epstopik/pass/candidate/sucessReportList.do?lang=en',
    label: 'EPS Result',
    iconType: 'result',
    language: 'korean',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    shadowColor: 'rgba(217, 119, 6, 0.38)',
    hoverShadow: '0 12px 28px rgba(217, 119, 6, 0.55)'
  }
];

export const JAPANESE_PORTAL_ITEMS = [
  {
    href: 'https://www.np.emb-japan.go.jp/',
    label: 'Official Notice',
    iconType: 'japan_embassy',
    language: 'japanese',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    shadowColor: 'rgba(220, 38, 38, 0.38)',
    hoverShadow: '0 12px 28px rgba(220, 38, 38, 0.55)'
  },
  {
    href: 'https://www.jaltan.org.np/',
    label: 'Japanese Notice & Info',
    iconType: 'japan_notice',
    language: 'japanese',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    shadowColor: 'rgba(225, 29, 72, 0.38)',
    hoverShadow: '0 12px 28px rgba(225, 29, 72, 0.55)'
  },
  {
    href: 'https://www.jlpt.jp/e/application/overseas_list.html',
    label: 'JLPT Application Form',
    iconType: 'jlpt_form',
    language: 'japanese',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    shadowColor: 'rgba(124, 58, 237, 0.38)',
    hoverShadow: '0 12px 28px rgba(124, 58, 237, 0.55)'
  },
  {
    href: 'https://www.prometric-jp.com/ne/ssw/test_list/archives/1',
    label: 'JFT Application Form',
    iconType: 'jft_form',
    language: 'japanese',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    shadowColor: 'rgba(13, 148, 136, 0.38)',
    hoverShadow: '0 12px 28px rgba(13, 148, 136, 0.55)'
  }
];

export const PORTAL_ITEMS = [...KOREAN_PORTAL_ITEMS, ...JAPANESE_PORTAL_ITEMS];

export function PortalIcon({ type }) {
  const size = 44;
  switch (type) {
    case 'notice':
      // Vibrant Coloured Announcement Megaphone with Gold & Crimson sound waves
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Main Cone */}
          <path d="M10 20h6l12-8v24l-12-8h-6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" fill="#2563eb" />
          <path d="M26 12l10-4v28l-10-4V12z" fill="#3b82f6" />
          {/* Front Opening Rim */}
          <ellipse cx="36" cy="24" rx="2.5" ry="14" fill="#60a5fa" />
          {/* Handle */}
          <path d="M14 26v8a3 3 0 0 0 6 0v-8" fill="#1d4ed8" />
          {/* Sound waves in energetic Amber & Coral */}
          <path d="M40 18a8 8 0 0 1 0 12" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          <path d="M43 14a13 13 0 0 1 0 20" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          {/* Accent dot */}
          <circle cx="11" cy="24" r="2" fill="#fbbf24" />
        </svg>
      );
    case 'job':
      // Vibrant Coloured Career Briefcase with Gold Buckles & Emerald/Sky finish
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Briefcase base */}
          <rect x="6" y="15" width="36" height="25" rx="4" fill="#0284c7" />
          <rect x="6" y="23" width="36" height="17" rx="3" fill="#0369a1" />
          {/* Golden Handle */}
          <path d="M18 15V11a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
          {/* Golden Corner Brackets */}
          <path d="M6 34h36v3a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-3z" fill="#075985" />
          {/* Golden Buckle Lock */}
          <rect x="22" y="21" width="4" height="6.5" rx="1.5" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
          <circle cx="24" cy="24.2" r="1.2" fill="#78350f" />
          {/* Divider line */}
          <line x1="6" y1="23" x2="42" y2="23" stroke="#38bdf8" strokeWidth="1.5" />
        </svg>
      );
    case 'application':
      // Vibrant Coloured User Application Profile with Emerald Green Plus Badge
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Profile Card Frame */}
          <rect x="6" y="8" width="36" height="32" rx="4" fill="#f0fdf4" stroke="#86efac" strokeWidth="2" />
          {/* Top Navy Clip */}
          <rect x="18" y="5" width="12" height="4.5" rx="2" fill="#059669" />
          {/* User Head */}
          <circle cx="21" cy="19" r="5" fill="#0284c7" />
          {/* User Body */}
          <path d="M12 31c0-4.5 4-6.5 9-6.5s9 2 9 6.5" fill="#0369a1" />
          {/* Vibrant Emerald Plus Badge */}
          <circle cx="34" cy="30" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2.2" />
          <path d="M34 26v8M30 30h8" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case 'result':
      // Vibrant Shining Gold Trophy Cup with Award Star & Emerald pedestal
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Trophy Cup */}
          <path d="M14 10h20v11c0 5.5-4.5 10-10 10s-10-4.5-10-10V10z" fill="#f59e0b" />
          <path d="M17 12h14v8c0 3.8-3.1 7-7 7s-7-3.2-7-7v-8z" fill="#fbbf24" />
          {/* Side Handles */}
          <path d="M14 14H9a4 4 0 0 0 0 8h5" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
          <path d="M34 14h5a4 4 0 0 1 0 8h-5" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
          {/* Stem & Solid Base */}
          <path d="M22 31v5h4v-5" fill="#d97706" />
          <path d="M15 36h18v4a2 2 0 0 1-2 2H17a2 2 0 0 1-2-2v-4z" fill="#b45309" />
          {/* Shining White Winner Star */}
          <polygon points="24,15 25.5,19.2 30,19.2 26.5,21.8 28,26 24,23.2 20,26 21.5,21.8 18,19.2 22.5,19.2" fill="#ffffff" />
        </svg>
      );
    case 'japan_embassy':
      // Vibrant Japanese Official Embassy & National Seal Artwork
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Official Building Base / Pedestal */}
          <rect x="7" y="38" width="34" height="4" rx="1.5" fill="#991b1b" />
          <rect x="9" y="35" width="30" height="3" fill="#dc2626" />
          {/* Classical Embassy Pillars */}
          <rect x="11" y="20" width="4" height="15" rx="1" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />
          <rect x="18.5" y="20" width="4" height="15" rx="1" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />
          <rect x="25.5" y="20" width="4" height="15" rx="1" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />
          <rect x="33" y="20" width="4" height="15" rx="1" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />
          {/* Embassy Roof Triangular Pediment */}
          <polygon points="24,8 6,19 42,19" fill="#dc2626" />
          <polygon points="24,11 10,19 38,19" fill="#ef4444" />
          {/* Japanese Crimson Sun Seal in Center of Pediment */}
          <circle cx="24" cy="15" r="3.2" fill="#ffffff" />
          <circle cx="24" cy="15" r="2.2" fill="#b91c1c" />
          {/* Embassy Entrance Door */}
          <rect x="21" y="27" width="6" height="8" rx="1" fill="#7f1d1d" />
        </svg>
      );
    case 'jft_form':
      // Vibrant JFT-Basic CBT Prometric Computer Test with Teal Glow & Passed Screen
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Desktop Monitor Screen Frame */}
          <rect x="6" y="8" width="36" height="25" rx="4" fill="#0f766e" />
          {/* Screen Display */}
          <rect x="9" y="11" width="30" height="19" rx="2" fill="#ccfbf1" />
          {/* Test Passed Checkmark on Screen */}
          <circle cx="24" cy="19" r="6" fill="#0d9488" />
          <path d="M21 19l2 2 4-4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="26" x2="36" y2="26" stroke="#5eead4" strokeWidth="1.5" strokeLinecap="round" />
          {/* Monitor Stand Base */}
          <path d="M22 33v4h4v-4" fill="#0f766e" />
          <rect x="16" y="37" width="16" height="3" rx="1.5" fill="#115e59" />
          {/* Sparkle Star on top corner */}
          <polygon points="38,6 39,9 42,9 39.5,11 40.5,14 38,12 35.5,14 36.5,11 34,9 37,9" fill="#f59e0b" />
        </svg>
      );
    case 'japan_notice':
      // Vibrant Japanese Vermilion Torii Gate with Golden Rising Sun
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Golden Rising Sun */}
          <circle cx="24" cy="22" r="11" fill="#fef08a" />
          <circle cx="24" cy="22" r="9" fill="#f59e0b" />
          {/* Crimson Japanese Torii Gate */}
          <path d="M6 14c6-2 12-3 18-3s12 1 18 3" stroke="#dc2626" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M9 19h30" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
          <line x1="14" y1="12" x2="14" y2="39" stroke="#b91c1c" strokeWidth="3.6" strokeLinecap="round" />
          <line x1="34" y1="12" x2="34" y2="39" stroke="#b91c1c" strokeWidth="3.6" strokeLinecap="round" />
          <rect x="22" y="14" width="4" height="5" rx="1" fill="#7f1d1d" />
          <line x1="11" y1="39" x2="17" y2="39" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          <line x1="31" y1="39" x2="37" y2="39" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'jlpt_form':
      // Vibrant Examination Checklist with Purple Board, White Paper, Green Ticks & Yellow Pencil
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Purple Clipboard Board */}
          <rect x="9" y="8" width="28" height="34" rx="4" fill="#7c3aed" />
          {/* Crisp White Test Paper */}
          <rect x="13" y="14" width="20" height="24" rx="2" fill="#ffffff" />
          {/* Golden Top Clip */}
          <rect x="18" y="5" width="10" height="5" rx="2" fill="#f59e0b" />
          <circle cx="23" cy="7.5" r="1.5" fill="#ffffff" />
          {/* Green Passed Checkmarks */}
          <path d="M16 20l2 2 3-3" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="23" y1="21" x2="30" y2="21" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 26l2 2 3-3" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="23" y1="27" x2="30" y2="27" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="33" x2="28" y2="33" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          {/* Colorful Test Pencil */}
          <g transform="translate(28, 25) rotate(25)">
            <rect x="0" y="0" width="5" height="15" rx="1" fill="#f59e0b" />
            <polygon points="0,15 2.5,19 5,15" fill="#fbbf24" />
            <polygon points="1.5,17.5 2.5,19 3.5,17.5" fill="#334155" />
            <rect x="0" y="0" width="5" height="3" fill="#ef4444" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

export default function OfficialPortalButtons({
  track = 'both',
  style = {},
  showTrackTabs = false
}) {
  const normTrack = (track || 'both').toLowerCase();
  const [activeTab, setActiveTab] = React.useState(normTrack === 'japanese' ? 'japanese' : normTrack === 'korean' ? 'korean' : 'both');

  React.useEffect(() => {
    if (normTrack === 'korean' || normTrack === 'japanese') {
      setActiveTab(normTrack);
    }
  }, [normTrack]);

  const displayedItems = activeTab === 'korean'
    ? KOREAN_PORTAL_ITEMS
    : activeTab === 'japanese'
    ? JAPANESE_PORTAL_ITEMS
    : PORTAL_ITEMS;

  const renderPortalCard = (card) => (
    <a
      key={card.label}
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        background: card.gradient,
        borderRadius: '16px',
        padding: '20px 14px 18px 14px',
        textAlign: 'center',
        textDecoration: 'none',
        color: 'white',
        boxShadow: `0 6px 18px ${card.shadowColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '168px',
        minHeight: '154px',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)';
        e.currentTarget.style.boxShadow = card.hoverShadow;
        const iconBox = e.currentTarget.querySelector('.portal-icon-container');
        if (iconBox) iconBox.style.transform = 'scale(1.12) rotate(-3deg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = `0 6px 18px ${card.shadowColor}`;
        const iconBox = e.currentTarget.querySelector('.portal-icon-container');
        if (iconBox) iconBox.style.transform = 'scale(1) rotate(0deg)';
      }}
    >
      {/* Clean White Squircle to make the Colorful Artwork POP */}
      <div
        className="portal-icon-container"
        style={{
          width: '70px',
          height: '70px',
          backgroundColor: '#ffffff',
          border: '2px solid rgba(255, 255, 255, 0.85)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.20), 0 2px 6px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <PortalIcon type={card.iconType} />
      </div>
      <h4
        style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: '700',
          lineHeight: '1.3',
          letterSpacing: '0.2px',
          textShadow: '0 1px 3px rgba(0,0,0,0.30)'
        }}
      >
        {card.label}
      </h4>
    </a>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', ...style }}>
      {/* Optional Track Selector if 'both' and enabled */}
      {showTrackTabs && normTrack === 'both' && (
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: '12px',
            border: '1.5px solid #cbd5e1',
            gap: '6px'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('korean')}
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              backgroundColor: activeTab === 'korean' ? '#2563eb' : 'transparent',
              color: activeTab === 'korean' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            🇰🇷 Korean Portals (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('japanese')}
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              backgroundColor: activeTab === 'japanese' ? '#2563eb' : 'transparent',
              color: activeTab === 'japanese' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            🇯🇵 Japanese Portals (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              backgroundColor: activeTab === 'both' ? '#0f172a' : 'transparent',
              color: activeTab === 'both' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            🌐 All Portals (8)
          </button>
        </div>
      )}

      {/* Grid of portal cards: 4, 4 divided in two lines */}
      {displayedItems.length > 4 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
          {/* Line 1: First 4 cards (Korean Portals) */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
            {displayedItems.slice(0, 4).map(renderPortalCard)}
          </div>
          {/* Line 2: Next 4 cards (Japanese Portals) */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
            {displayedItems.slice(4, 8).map(renderPortalCard)}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
          {displayedItems.map(renderPortalCard)}
        </div>
      )}
    </div>
  );
}
