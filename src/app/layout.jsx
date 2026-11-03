import '@/App.css';
import './student.css';
import PwaDesktopInstaller from '@/components/PwaDesktopInstaller';

export const viewport = {
  themeColor: '#003b73',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
        <meta name="application-name" content="ExamJK" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ExamJK" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#003b73" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        {children}
        <PwaDesktopInstaller />
      </body>
    </html>
  );
}
