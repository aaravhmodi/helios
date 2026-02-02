export default function NotFound() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', color: '#fff', background: '#1a1a2e', minHeight: '100vh' }}>
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/dashboard" style={{ color: '#64b5f6', textDecoration: 'underline' }}>Go to Dashboard</a>
    </div>
  )
}
