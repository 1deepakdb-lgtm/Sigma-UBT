'use client';

import React from 'react';

export default function AboutUsSection() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 0 40px 0' }}>
      {/* Hero Banner Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)',
          borderRadius: '16px',
          padding: '32px 24px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)',
          marginBottom: '24px',
          textAlign: 'center'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}
        >
          Dedicated Language Training Institute
        </span>
        <h1
          style={{
            margin: '0 0 12px 0',
            fontSize: '28px',
            fontWeight: '900',
            letterSpacing: '-0.5px',
            lineHeight: 1.2
          }}
        >
          About Us – Sigma Education Korean Bhasa Center
        </h1>
        <p
          style={{
            margin: '0 auto',
            maxWidth: '720px',
            fontSize: '15.5px',
            lineHeight: 1.6,
            color: '#e0e7ff',
            fontWeight: '500'
          }}
        >
          Sigma Education – Your Trusted Destination for Language Learning and Global Opportunities.
        </p>
      </div>

      {/* Main Introduction Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          marginBottom: '20px'
        }}
      >
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#334155', marginTop: 0, marginBottom: '14px' }}>
          <strong>Sigma Education Korean Bhasa Center</strong> is a dedicated language training institute located at <strong>Samakhushi Chowk, Kathmandu, Nepal</strong>. We are committed to providing quality language education, practical learning experiences, and professional guidance to students who aspire to build successful careers and explore international opportunities.
        </p>
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#334155', marginBottom: '14px' }}>
          Our primary focus is <strong>Korean language education and EPS-TOPIK preparation</strong>. We provide student-friendly learning environments, exam-oriented classes, regular mock tests, smart classroom facilities, and practical language training to help students achieve their goals.
        </p>
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#334155', marginBottom: 0 }}>
          In addition to Korean language education, we also offer <strong>Japanese language classes, English language classes, IELTS preparation, and other language-related training programs</strong>.
        </p>
      </div>

      {/* Mission & Vision Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        {/* Mission */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '14px',
            padding: '22px',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '22px' }}>🎯</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e3a8a' }}>
              Our Mission
            </h3>
          </div>
          <p style={{ fontSize: '14.5px', lineHeight: 1.65, color: '#334155', margin: 0 }}>
            To provide accessible, quality language education and empower students with the knowledge, skills, and confidence needed to succeed in international education and employment opportunities.
          </p>
        </div>

        {/* Vision */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '14px',
            padding: '22px',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '22px' }}>👁️</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e3a8a' }}>
              Our Vision
            </h3>
          </div>
          <p style={{ fontSize: '14.5px', lineHeight: 1.65, color: '#334155', margin: 0 }}>
            To become one of Nepal&apos;s most trusted language training centers through quality education, innovative teaching methods, and continuous student support.
          </p>
        </div>
      </div>

      {/* Why Choose Sigma Education? */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '22px' }}>⭐</span>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#0f172a' }}>
            Why Choose Sigma Education?
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px'
          }}
        >
          {[
            'Quality Korean language and EPS-TOPIK preparation.',
            'Japanese and English language classes.',
            'IELTS preparation and language training.',
            'Smart and interactive classroom facilities.',
            'Regular mock tests and exam-oriented practice.',
            'Student-friendly learning environment.',
            'Practical teaching methods and dedicated support.',
            'Commitment to student learning and success.'
          ].map((point, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <span style={{ color: '#16a34a', fontWeight: '900', fontSize: '16px', lineHeight: 1 }}>✓</span>
              <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600', lineHeight: 1.4 }}>
                {point}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Address & Contact Information */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '22px' }}>📍</span>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#0f172a' }}>
            Address &amp; Contact Information
          </h2>
        </div>

        <div style={{ fontSize: '15px', color: '#1e293b', lineHeight: 1.7 }}>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e3a8a', marginBottom: '6px' }}>
            Sigma Education Korean Bhasa Center
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span>📍</span>
            <span><strong>Address:</strong> Samakhushi Chowk, Kathmandu, Nepal.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <span>📞</span>
            <div>
              <strong>Contact Numbers:</strong>{' '}
              <a href="tel:9868736491" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>
                9868736491
              </a>
              {' / '}
              <a href="tel:9806100148" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>
                9806100148
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✉️</span>
            <div>
              <strong>Email:</strong>{' '}
              <a
                href="mailto:ktmsigmaedu@gmail.com"
                style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: '700' }}
              >
                ktmsigmaedu@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* We Value Your Feedback */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          borderRadius: '14px',
          padding: '24px',
          border: '1.5px solid #86efac',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '22px' }}>💬</span>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#166534' }}>
            We Value Your Feedback!
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#14532d', margin: '0 0 12px 0' }}>
          Your suggestions, feedback, and recommendations help us improve our educational services and learning environment. If you have any suggestions, questions, or ideas, please feel free to contact us.
        </p>
        <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#14532d', margin: '0 0 12px 0' }}>
          You can email us at{' '}
          <a
            href="mailto:ktmsigmaedu@gmail.com"
            style={{ color: '#15803d', fontWeight: '800', textDecoration: 'underline' }}
          >
            ktmsigmaedu@gmail.com
          </a>{' '}
          or call us at{' '}
          <a href="tel:9868736491" style={{ color: '#15803d', fontWeight: '800', textDecoration: 'none' }}>
            9868736491
          </a>{' '}
          /{' '}
          <a href="tel:9806100148" style={{ color: '#15803d', fontWeight: '800', textDecoration: 'none' }}>
            9806100148
          </a>
          .
        </p>
        <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#166534', fontWeight: '700', margin: 0 }}>
          We always welcome your valuable feedback and look forward to serving you better.
        </p>
      </div>
    </div>
  );
}
