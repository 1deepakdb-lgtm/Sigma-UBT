'use client';

import React from 'react';

export default function AboutUsSection() {
  const offerings = [
    {
      title: 'EPS-TOPIK Preparation',
      desc: 'Exam-oriented learning resources tailored for Korean language proficiency.',
      icon: '📚',
      badge: 'EPS-TOPIK'
    },
    {
      title: 'Online UBT Exams',
      desc: 'Interactive computer-based examination practice with real exam interface.',
      icon: '💻',
      badge: 'UBT Practice'
    },
    {
      title: 'Reading & Listening',
      desc: 'Comprehensive practice questions with native audio to strengthen skills.',
      icon: '🎧',
      badge: 'Core Skills'
    },
    {
      title: 'Mock Tests',
      desc: 'Realistic full-length examinations with timer and scoring to evaluate performance.',
      icon: '⏱️',
      badge: 'Simulations'
    },
    {
      title: 'Smart Learning',
      desc: 'Digital PDFs, official EPS textbooks, audio lessons, and smart learning tools.',
      icon: '📱',
      badge: 'Digital Assets'
    },
    {
      title: 'Performance Analysis',
      desc: 'Instant results, detailed answer reviews, and continuous progress tracking.',
      icon: '📊',
      badge: 'Analytics'
    },
    {
      title: 'Institute Management',
      desc: 'Digital learning, billing, and examination management facilities for institutes.',
      icon: '🏢',
      badge: 'Institutions'
    }
  ];

  const whyChoosePoints = [
    'Easy to use on mobile, tablet, and computer.',
    'Quality exam-focused learning resources.',
    'Interactive online examination experience.',
    'Flexible practice and progress tracking.',
    'Smart and accessible learning solutions.'
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '10px 0 50px 0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ── 1. HERO BANNER CARD ────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
          borderRadius: '18px',
          padding: '38px 24px',
          color: '#ffffff',
          boxShadow: '0 12px 30px -6px rgba(30, 58, 138, 0.3)',
          marginBottom: '24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '5px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '14px',
              backdropFilter: 'blur(4px)'
            }}
          >
            Digital Learning &amp; Examination Platform
          </span>
          <h1
            style={{
              margin: '0 0 10px 0',
              fontSize: '32px',
              fontWeight: '900',
              letterSpacing: '-0.5px',
              lineHeight: 1.2
            }}
          >
            About Us – ExamJK
          </h1>
          <p
            style={{
              margin: '0 auto 16px auto',
              maxWidth: '680px',
              fontSize: '18px',
              lineHeight: 1.5,
              color: '#93c5fd',
              fontWeight: '700',
              letterSpacing: '0.2px'
            }}
          >
            Smart Learning. Better Practice. Greater Success.
          </p>
          <p
            style={{
              margin: '0 auto',
              maxWidth: '740px',
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#e2e8f0',
              fontWeight: '400'
            }}
          >
            <strong>ExamJK.com</strong> is a digital learning and examination platform focused on helping students prepare for Korean language examinations, especially <strong>EPS-TOPIK</strong>. We make learning easier through quality study materials, interactive practice, and online examinations.
          </p>
        </div>
      </div>

      {/* ── 2. MISSION & VISION GRID ───────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '18px',
          marginBottom: '24px'
        }}
      >
        {/* Mission Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1.5px solid #bfdbfe',
            boxShadow: '0 3px 10px rgba(37,99,235,0.05)',
            background: 'linear-gradient(145deg, #ffffff 0%, #eff6ff 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', backgroundColor: '#dbeafe', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🎯
            </span>
            <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#1e3a8a' }}>
              Our Mission
            </h3>
          </div>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#334155', margin: 0 }}>
            To provide accessible and effective digital learning solutions that help students improve their skills, build confidence, and achieve their goals.
          </p>
        </div>

        {/* Vision Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1.5px solid #c7d2fe',
            boxShadow: '0 3px 10px rgba(99,102,241,0.05)',
            background: 'linear-gradient(145deg, #ffffff 0%, #eef2ff 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', backgroundColor: '#e0e7ff', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              👁️
            </span>
            <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#3730a3' }}>
              Our Vision
            </h3>
          </div>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#334155', margin: 0 }}>
            To become a trusted digital education platform connecting students, teachers, and institutions through innovative technology.
          </p>
        </div>
      </div>

      {/* ── 3. WHAT WE OFFER ───────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '28px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>✨</span>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>
              What We Offer
            </h2>
          </div>
          <span style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: '700', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '20px', border: '1px solid #bfdbfe' }}>
            Comprehensive Exam Ecosystem
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '14px'
          }}
        >
          {offerings.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 18px',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '22px' }}>{item.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '6px' }}>
                    {item.badge}
                  </span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. WHY EXAMJK? & COMMITMENT ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px',
          marginBottom: '24px'
        }}
      >
        {/* Why ExamJK? */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1.5px solid #fed7aa',
            boxShadow: '0 4px 14px rgba(234,88,12,0.04)',
            background: 'linear-gradient(145deg, #ffffff 0%, #fff7ed 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>⭐</span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#9a3412' }}>
              Why ExamJK?
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {whyChoosePoints.map((point, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '9px 12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #ffedd5'
                }}
              >
                <span style={{ color: '#ea580c', fontWeight: '900', fontSize: '16px', lineHeight: 1 }}>✓</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600', lineHeight: 1.45 }}>
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Our Commitment & Banner */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1.5px solid #bbf7d0',
            boxShadow: '0 4px 14px rgba(22,163,74,0.04)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '24px' }}>🤝</span>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#166534' }}>
                Our Commitment
              </h2>
            </div>
            <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#14532d', margin: '0 0 16px 0' }}>
              We continuously improve our platform with innovative technology and useful learning features to provide students with a better learning and examination experience.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              padding: '16px 18px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(21,128,61,0.2)'
            }}
          >
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, fontWeight: '700', marginBottom: '4px' }}>
              Official Platform Motto
            </div>
            <div style={{ fontSize: '17px', fontWeight: '900' }}>
              ExamJK – Learn Smart. Practice Better. Achieve More.
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. CONTACT US & OFFICIAL DETAILS ────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '28px 24px',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <span style={{ fontSize: '24px' }}>📍</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>
              Contact Us
            </h2>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
              ExamJK – Smart Learning &amp; Examination Platform
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginTop: '16px'
          }}
        >
          {/* Email */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Official Email
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>✉️</span>
              <a
                href="mailto:examjk.co@gmail.com"
                style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '800', fontSize: '15px' }}
              >
                examjk.co@gmail.com
              </a>
            </div>
          </div>

          {/* Phone */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Phone &amp; WhatsApp
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📞</span>
              <div style={{ fontWeight: '800', fontSize: '14.5px', color: '#0f172a' }}>
                <a href="tel:+9779868736491" style={{ color: '#2563eb', textDecoration: 'none' }}>
                  +977-9868736491
                </a>
                {' , '}
                <a href="tel:+9779806100148" style={{ color: '#2563eb', textDecoration: 'none' }}>
                  +977-9806100148
                </a>
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Office Location
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🏢</span>
              <span style={{ fontWeight: '700', fontSize: '14.5px', color: '#1e293b' }}>
                Samakhushi Chowk, Kathmandu, Nepal
              </span>
            </div>
          </div>

          {/* Website */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Official Website
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🌐</span>
              <a
                href="https://examjk.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '800', fontSize: '15px' }}
              >
                https://examjk.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
