export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '10px' }}>404 - Page Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>The page you are looking for does not exist.</p>
      <a href="/" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>Return Home</a>
    </div>
  );
}
