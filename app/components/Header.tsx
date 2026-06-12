'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  {
    label: 'Home',
    href: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
  },
  {
    label: 'Live Map',
    href: '/live-map',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
      </svg>
    ),
  },
  {
    label: 'Flights',
    href: '/flights',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
      </svg>
    ),
  },
  {
    label: 'Airports',
    href: '/airports',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
  },
]

export default function Header() {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)

  // Khởi tạo theme từ localStorage khi vừa load trang
  useEffect(() => {
    const savedTheme = localStorage.getItem('skytrack-theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Hàm chuyển đổi sáng/tối
  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('skytrack-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('skytrack-theme', 'light')
    }
  }

  return (
    <header className="pub-header">
      {/* Logo */}
      <Link href="/" className="pub-logo-box">
        <div className="pub-logo-icon-wrapper">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="#2563eb" style={{ transform: "rotate(45deg)", transformOrigin: "center" }}/>
          </svg>
        </div>
        <div>
          <div className="pub-logo-title">SkyTrack <span className="pub-logo-ai">AI</span></div>
          <div className="pub-logo-sub">Vietnam Flight Intelligence</div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="pub-nav">
        {NAV_LINKS.map(link => (
          <Link 
            key={link.label} 
            href={link.href} 
            className={`pub-nav-link${pathname === link.href ? " active" : ""}`}
          >
            <span className="pub-nav-link-icon">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      

      {/* Actions */}
      <div className="pub-actions">
        {/* Nút chuyển Dark/Light Mode */}
        {/* <button className="mode-toggle" onClick={toggleTheme}>
          {isDark ? (
            // Icon Mặt trăng (Dark Mode)
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            // Icon Mặt trời (Light Mode)
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path><path d="M12 20v2"></path>
              <path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path>
              <path d="M2 12h2"></path><path d="M20 12h2"></path>
              <path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path>
            </svg>
          )}
        </button> */}
        
        <Link href="/login">
          <button className="btn-login">Login</button>
        </Link>
        
        <Link href="/register">
          <button className="btn-register">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
            <span>Register</span>
          </button>
        </Link>
      </div>
    </header>
  )
}