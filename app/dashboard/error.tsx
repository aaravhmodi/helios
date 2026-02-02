'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div style={{ padding: '20px', textAlign: 'center', color: '#fff', background: '#1a1a2e', minHeight: '100vh' }}>
      <h2>Dashboard Error</h2>
      <p>{error.message}</p>
      <button onClick={reset} style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer' }}>Try again</button>
    </div>
  )
}
