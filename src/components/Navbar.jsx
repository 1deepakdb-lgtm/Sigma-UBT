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
  notificationCount = 0
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await performLogout();
  };

  // 1. Define standard navigation configs per role
  const adminLinks = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'EPS Book', href: '/admin/listening' },
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
    { id: 'listening', label: 'EPS Book' },
    { id: 'dictionary', label: 'Dictionary' },
    { id: 'news', label: 'Notice' },
    { id: 'students', label: 'Manage Students' },
  ];

  const studentTabs = [
    { id: 'home', label: 'Dashboard' },
    { id: 'exams', label: 'Start UBT Exam' },
    { id: 'buyExam', label: 'Packages' },
    { id: 'vocab', label: 'Dictionary' },
    { id: 'listening', label: 'EPS Book' },
    { id: 'news', label: 'Notice' },
    { id: 'notify', label: 'Messages' },
    { id: 'results', label: 'Performance' },
  ];

  // Derive display title
  const defaultTitle = 
    role === 'admin' ? 'SIGMA ADMIN PANEL' :
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
        height: '66px',
        minHeight: '66px',
        maxHeight: '66px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 15px rgba(30, 58, 138, 0.25)',
        boxSizing: 'border-box',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        flexShrink: 0
      }}
    >
      {/* Left Section: Brand / Logo Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          marginRight: '24px'
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

      {/* Right Section: Navigation Menu Links aligned to the RIGHT SIDE + Logout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '14px',
          marginLeft: 'auto',
          flex: 1,
          minWidth: 0,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Navigation Options Menu */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '6px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            padding: '4px 0'
          }}
        >
          {role === 'admin' &&
            adminLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={getItemStyle(isActive, link.href)}
                  onMouseEnter={() => setHoveredItem(link.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span>{link.label}</span>
                  {link.badge != null && (
                    <span
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        lineHeight: '14px',
                        marginLeft: '4px'
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

        {/* Subtle vertical divider between right-side menu and Logout */}
        <div
          style={{
            width: '1px',
            height: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            flexShrink: 0
          }}
        />

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            lineHeight: 1.2,
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
      </div>
    </header>
  );
}
