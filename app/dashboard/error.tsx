'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Dashboard Error</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
