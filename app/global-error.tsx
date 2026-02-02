'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ padding: '20px', textAlign: 'center', color: '#fff', background: '#1a1a2e', minHeight: '100vh' }}>
          <h2>Something went wrong!</h2>
          <p>{error.message}</p>
          <button onClick={reset} style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer' }}>Try again</button>
        </div>
      </body>
    </html>
  )
}
