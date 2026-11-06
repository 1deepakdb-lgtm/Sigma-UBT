'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LOGO } from '@/utils';
import { performLogout } from '@/lib/clientAuth';

export default function Navbar({
  role = 'admin',
  title,
  subtitle,
  activeTab,
  onTabChange,
  notificationCount = 0,
  instituteLanguage
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentLang, setCurrentLang] = useState(() => {
    if (instituteLanguage) return instituteLanguage;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('instituteLanguage') || 'both';
    }
    return 'both';
  });

  useEffect(() => {
    if (instituteLanguage) {
      setCurrentLang(instituteLanguage);
    }
  }, [instituteLanguage]);

  // Super Admin security validation: continuously verify active admin JWT session on mount
  useEffect(() => {
    if (role === 'admin') {
      fetch('/api/auth/me')
        .then((res) => {
          if (!res.ok) {
            performLogout();
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data && (!data.authenticated || data.user?.role !== 'admin')) {
            performLogout();
          }
        })
        .catch(() => {});
    }
  }, [role]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await performLogout();
  };

  // 1. Define standard navigation configs per role
  const adminLinks = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Study Materials', href: '/admin/listening' },
    { label: 'Dictionary', href: '/admin/dictionary' },
    { label: 'Manage Institutes', href: '/admin/institutes' },
    { label: 'Upload Questions', href: '/admin/questions' },
    { label: 'Notice', href: '/admin/news' },
    { 
      label: 'Notifications', 
      href: '/admin/notifications',
      badge: notificationCount > 0 ? notificationCount : null 
    },
    { label: 'Settings', href: '/admin/settings' },
  ];

  const instituteTabs = [
    { id: 'billing', label: 'Billing' },
    { id: 'listening', label: 'Study Materials' },
    { id: 'dictionary', label: 'Dictionary' },
    { id: 'news', label: 'Notice' },
    { id: 'students', label: 'Manage Students' },
  ];

  const isPureJapanese = currentLang === 'japanese';
  const isPureKorean = currentLang === 'korean';
  const isBoth = !isPureJapanese && !isPureKorean;

  const studentTabs = [
    { id: 'home', label: 'Dashboard' },
    ...((isBoth || isPureKorean) ? [{ id: 'exams', label: 'Start UBT Exam' }] : []),
    ...((isBoth || isPureJapanese) ? [{ id: 'mock', label: 'Mock Test' }] : []),
    { id: 'buyExam', label: 'Packages' },
    { id: 'vocab', label: 'Dictionary' },
    { id: 'listening', label: 'Study Materials' },
    { id: 'news', label: 'Notice' },
    { id: 'notify', label: 'Messages' },
    { id: 'results', label: 'Performance' },
  ];

  // Derive display title
  const defaultTitle = 
    role === 'admin' ? 'EXAMJK ADMIN PANEL' :
    role === 'institute' ? 'INSTITUTE PANEL' : 
    'STUDENT PORTAL';

  const displayTitle = title || defaultTitle;

  // Stable styling tokens
  const navItemBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    fontSize: '15px',
    fontWeight: 700,
    borderRadius: '7px',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s ease, color 0.15s ease',
    flexShrink: 0,
    lineHeight: 1.2
  };

  // Compact, shrink-proof styling specifically for Super Admin links
  const getAdminItemStyle = (isActive, itemKey) => {
    const isHovered = hoveredItem === itemKey;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '7px 11px',
      fontSize: '13px',
      fontWeight: 700,
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      transition: 'background-color 0.15s ease, color 0.15s ease',
      flexShrink: 0,
      minHeight: '34px',
      boxSizing: 'border-box',
      lineHeight: 1.2,
      backgroundColor: isActive ? '#2563eb' : isHovered ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
      color: '#ffffff',
      boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.2)' : 'none'
    };
  };

  const getItemStyle = (isActive, itemKey) => {
    const isHovered = hoveredItem === itemKey;

    if (isActive) {
      return {
        ...navItemBase,
        backgroundColor: '#2563eb',
        color: '#ffffff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
      };
    }
    return {
      ...navItemBase,
      backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
      color: '#ffffff'
    };
  };

  const navBg = '#1e3a8a';

  return (
    <header
      style={{
        backgroundColor: '#1e3a8a',
        backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
        color: '#ffffff',
        width: '100%',
        minWidth: '100%',
        height: '64px',
        minHeight: '64px',
        maxHeight: '64px',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        boxSizing: 'border-box',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        flexShrink: 0,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Left Section: Brand / Logo Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          marginRight: '20px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
        >
          Σ
        </div>
        <div>
          <div
            suppressHydrationWarning
            style={{
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              lineHeight: 1.2,
              whiteSpace: 'nowrap'
            }}
          >
            {displayTitle}
          </div>
          {subtitle && (
            <div
              suppressHydrationWarning
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                fontWeight: 500,
                marginTop: '1px',
                whiteSpace: 'nowrap'
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Desktop Navigation & Mobile 3-line Menu Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: role === 'admin' ? '10px' : '14px',
          marginLeft: 'auto',
          flex: 1,
          minWidth: 0,
          flexShrink: 0
        }}
      >
        {/* DESKTOP NAVIGATION (Visible on screen width > 768px) */}
        <nav
          className="desktop-nav-menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: role === 'admin' ? '4px' : '6px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            padding: '2px 0'
          }}
        >
          {role === 'admin' &&
            adminLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={getAdminItemStyle(isActive, link.href)}
                  onMouseEnter={() => setHoveredItem(link.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span>{link.label}</span>
                  {link.badge != null && (
                    <span
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '10px',
                        lineHeight: '13px',
                        marginLeft: '3px'
                      }}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

          {role === 'institute' &&
            instituteTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => (onTabChange ? onTabChange(tab.id) : router.push(`/institute?tab=${tab.id}`))}
                  style={getItemStyle(isActive, tab.id)}
                  onMouseEnter={() => setHoveredItem(tab.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}

          {role === 'student' &&
            studentTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange && onTabChange(tab.id)}
                  style={getItemStyle(isActive, tab.id)}
                  onMouseEnter={() => setHoveredItem(tab.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
        </nav>

        {/* Subtle vertical divider on desktop */}
        <div
          className="desktop-divider"
          style={{
            width: '1px',
            height: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            flexShrink: 0
          }}
        />

        {/* Desktop Logout button */}
        <button
          className="desktop-logout-btn"
          onClick={handleLogout}
          style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            padding: '7px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '13px',
            lineHeight: 1.2,
            minHeight: '34px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.25)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ef4444';
          }}
        >
          Logout
        </button>

        {/* MOBILE 3-LINE DOTTED HAMBURGER / KEBAB BUTTON */}
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Navigation Menu"
          title="Toggle Navigation Menu"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: mobileMenuOpen ? '#2563eb' : 'rgba(255, 255, 255, 0.12)',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            padding: '4px'
          }}
        >
          {mobileMenuOpen ? (
            <span style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1 }}>✕</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: '20px', height: '2.5px', backgroundColor: '#ffffff', borderRadius: '2px' }}></span>
              <span style={{ width: '20px', height: '2.5px', backgroundColor: '#ffffff', borderRadius: '2px' }}></span>
              <span style={{ width: '20px', height: '2.5px', backgroundColor: '#ffffff', borderRadius: '2px' }}></span>
            </div>
          )}
        </button>
      </div>

      {/* MOBILE SLIDE-DOWN DRAWER MENU (On mobile application screen) */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 99998
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '64px',
              left: 0,
              right: 0,
              backgroundColor: '#0f172a',
              borderBottom: '3px solid #2563eb',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)',
              zIndex: 99999,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: 'calc(100vh - 75px)',
              overflowY: 'auto'
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Navigation Menu
            </div>

            {role === 'admin' &&
              adminLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      padding: '11px 14px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#2563eb' : 'rgba(255, 255, 255, 0.06)',
                      color: '#ffffff',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '14px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent'
                    }}
                  >
                    <span>{link.label}</span>
                    {link.badge != null && (
                      <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

            {role === 'institute' &&
              instituteTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onTabChange ? onTabChange(tab.id) : router.push(`/institute?tab=${tab.id}`);
                    }}
                    style={{
                      padding: '11px 14px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#2563eb' : 'rgba(255, 255, 255, 0.06)',
                      color: '#ffffff',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '14px',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent'
                    }}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}

            {role === 'student' &&
              studentTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onTabChange) onTabChange(tab.id);
                    }}
                    style={{
                      padding: '11px 14px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#2563eb' : 'rgba(255, 255, 255, 0.06)',
                      color: '#ffffff',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '14px',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent'
                    }}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}

            {/* Logout button in mobile drawer */}
            <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Global Responsive Styles for Navbar */}
      <style jsx>{`
        @media (max-width: 768px) {
          :global(.desktop-nav-menu) {
            display: none !important;
          }
          :global(.desktop-divider) {
            display: none !important;
          }
          :global(.desktop-logout-btn) {
            display: none !important;
          }
          :global(.mobile-hamburger-btn) {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}
