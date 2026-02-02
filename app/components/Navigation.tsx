'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav style={{
      background: 'rgba(26, 26, 26, 0.8)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '10px 20px',
      display: 'flex',
      gap: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <Link 
        href="/" 
        style={{ 
          color: pathname === '/' ? '#4caf50' : '#e0e0e0', 
          textDecoration: 'none', 
          padding: '8px 16px', 
          borderRadius: '4px', 
          transition: 'background 0.2s',
          background: pathname === '/' ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
        }}
      >
        Chat
      </Link>
      <Link 
        href="/dashboard" 
        style={{ 
          color: pathname === '/dashboard' ? '#4caf50' : '#e0e0e0', 
          textDecoration: 'none', 
          padding: '8px 16px', 
          borderRadius: '4px', 
          transition: 'background 0.2s',
          background: pathname === '/dashboard' ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
        }}
      >
        Dashboard
      </Link>
    </nav>
  )
}
