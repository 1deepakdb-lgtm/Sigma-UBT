/** @type {import('next').NextConfig} */

// ─── Security Headers ─────────────────────────────────────────────────────────
const securityHeaders = [
  // Prevent clickjacking / iframe embedding by third-party sites
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing attacks
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Stop leaking referrer info to external sites
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Enforce HTTPS for 2 years (production only - included here, middleware guards dev)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Disable dangerous browser features not needed by the app
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=(self)',   // allow self for TTS/voice features
      'geolocation=()',
      'payment=(self)',      // allow self for eSewa payment
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'fullscreen=(self)',
      'display-capture=()',
    ].join(', ')
  },
  // XSS Protection (legacy browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // DNS Prefetch control
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      // Only load scripts from self + Google APIs (for fonts/analytics)
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://rc-epay.esewa.com.np https://epay.esewa.com.np https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      // Images: self + data URIs + blob + R2 CDN + esewa
      "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://*.r2.dev https://rc-epay.esewa.com.np https://epay.esewa.com.np https://lh3.googleusercontent.com",
      // Audio/video from self and CDN
      "media-src 'self' blob: https://*.r2.cloudflarestorage.com https://*.r2.dev",
      // API connections
      "connect-src 'self' https://accounts.google.com https://*.r2.cloudflarestorage.com https://*.r2.dev https://rc-epay.esewa.com.np https://epay.esewa.com.np https://api.elevenlabs.io",
      // Workers (for service worker / offline)
      "worker-src 'self' blob:",
      // Frames: allow PDF viewer, blobs, eSewa payment iframe
      "frame-src 'self' blob: data: https://*.r2.cloudflarestorage.com https://*.r2.dev https://rc-epay.esewa.com.np https://epay.esewa.com.np https://accounts.google.com",
      // Form submissions only to self
      "form-action 'self' https://rc-epay.esewa.com.np https://epay.esewa.com.np",
      // Allow browser PDF viewer plugins & objects
      "object-src 'self' blob: data: https://*.r2.cloudflarestorage.com https://*.r2.dev",
      // Upgrade insecure requests in production
      "upgrade-insecure-requests",
    ].join('; ')
  },
];

const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // Disable exposing powered-by header
  poweredByHeader: false,
};

export default nextConfig;
