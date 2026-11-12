import '@/App.css';
import './student.css';
import PwaDesktopInstaller from '@/components/PwaDesktopInstaller';

export const viewport = {
  themeColor: '#003b73',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata = {
  title: 'ExamJK — Exam Japanese and Korean',
  description: 'ExamJK: Japanese and Korean CBT & UBT Examination and Learning System',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    shortcut: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ExamJK'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="application-name" content="ExamJK" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ExamJK" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#003b73" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Universal High-Definition Web Fonts: English (Inter), Korean (Noto Sans KR), Japanese (Noto Sans JP), Nepali (Noto Sans Devanagari) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <PwaDesktopInstaller />
      </body>
    </html>
  );
}
