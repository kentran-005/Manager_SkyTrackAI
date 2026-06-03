import Link from 'next/link'

/* ══════════ DATA ══════════ */

const NAV_LINKS = [
  {
    label: 'Home',
    href: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Flights',
    href: '/flights',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    ),
  },
  {
    label: 'Airports',
    href: '/airports',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
]

const SOCIAL_LINKS = [
  {
    label: 'Twitter',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16h4.267l-11.733 -16h-4.267z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" />
      </svg>
    ),
  },
]

/* ══════════ COMPONENT ══════════ */
export default function Footer() {
  return (
    <footer className="pub-footer-wrapper">
      <div className="pub-footer">
        {/* ── 4-Column Grid ── */}
        <div className="pub-footer-grid">

          {/* ══ Column 1: Brand ══ */}
          <div className="pub-footer-brand">
            {/* Logo */}
            <Link href="/" className="pub-footer-logo">
              <div className="pub-footer-logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#1200b8" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path
                    d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"
                    fill="#60a5fa"
                    style={{ transform: 'rotate(45deg)', transformOrigin: 'center' }}
                  />
                </svg>
              </div>
              <div>
                <span className="pub-footer-logo-title">
                  SkyTrack <span className="pub-footer-logo-ai">AI</span>
                </span>
                <span className="pub-footer-logo-sub">Vietnam Flight Intelligence</span>
              </div>
            </Link>

            {/* Description */}
            <p className="pub-footer-desc">
              Real-time flight tracking and aviation intelligence platform for Vietnam and the world.
            </p>

            {/* Social Icons — circular */}
            <div className="pub-footer-socials">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="pub-footer-social-link"
                  aria-label={social.label}
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ══ Column 2: Navigation ══ */}
          <div className="pub-footer-col">
            <h4 className="pub-footer-col-title">Navigation</h4>
            <ul className="pub-footer-col-links">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="pub-footer-link">
                    <span className="pub-footer-link-icon-wrap">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ══ Column 3: Contact ══ */}
          <div className="pub-footer-col">
            <h4 className="pub-footer-col-title">Contact</h4>
            <ul className="pub-footer-col-links">
              <li className="pub-footer-contact-item">
                <span className="pub-footer-contact-icon">
                  {/* Map pin icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="pub-footer-contact-text">268 Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="pub-footer-contact-item">
                <span className="pub-footer-contact-icon">
                  {/* Envelope icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <a href="mailto:contact@skytrackai.com" className="pub-footer-contact-text pub-footer-contact-link">contact@skytrackai.com</a>
              </li>
            </ul>
          </div>

          {/* ══ Column 4: CTA Card ══ */}
          <div className="pub-footer-cta-col">
            <Link href="/" className="pub-footer-cta">
              {/* Globe icon */}
              <div className="pub-footer-cta-top">
                <svg className="pub-footer-cta-globe" width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="white" />
                  <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="1" />
                  <ellipse cx="12" cy="12" rx="4" ry="10" stroke="#2563eb" strokeWidth="0.8" />
                  <line x1="2" y1="12" x2="22" y2="12" stroke="#2563eb" strokeWidth="0.7" />
                  <path d="M4 7.5h16" stroke="#2563eb" strokeWidth="0.5" />
                  <path d="M4 16.5h16" stroke="#2563eb" strokeWidth="0.5" />
                </svg>

                {/* Title + Arrow inline */}
                <span className="pub-footer-cta-title">
                  Open Live Map
                  <svg className="pub-footer-cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>

              {/* Subtext */}
              <span className="pub-footer-cta-sub">Explore real-time flights on the interactive map</span>

              {/* Decorative: dashed flight path + airplane */}
              <div className="pub-footer-cta-decor">
                <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                  <path
                    d="M10 30 C40 15, 70 10, 100 5"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                    fill="none"
                  />
                </svg>
                <svg className="pub-footer-cta-plane" width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="pub-footer-divider" />

        {/* ── Bottom Bar ── */}
        <div className="pub-footer-bottom">
          <p className="pub-footer-copyright">
            &copy; {new Date().getFullYear()} SkyTrack AI. All rights reserved.
          </p>
          <div className="pub-footer-bottom-links">
            <Link href="#" className="pub-footer-bottom-link">Terms of Service</Link>
            <span className="pub-footer-bottom-dot" />
            <Link href="#" className="pub-footer-bottom-link">Privacy Policy</Link>
            <span className="pub-footer-bottom-dot" />
            <Link href="#" className="pub-footer-bottom-link">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}