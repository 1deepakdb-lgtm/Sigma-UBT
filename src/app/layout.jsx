import '@/App.css';
import './student.css';

export const metadata = {
  title: 'Sigma UBT Exam System',
  description: 'Ubiquitous-Based Test system for EPS-TOPIK Korean Language Practice',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
