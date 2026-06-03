"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { 
    label: "Home", 
    href: "/", 
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  { 
    label: "Live Map", 
    href: "/live-map", 
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    )
  },
  { 
    label: "AI Assistant", 
    href: "/ai-assistant", 
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </svg>
    )
  },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <style precedence="default" href="/styles/public-layout">{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        
        /* ── GLOBAL & BASE ── */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background-color: #f8fafc; }

        /* ── MODERN NEW HEADER ── */
        .pub-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 80px;
          background: #fff; border-bottom: 1px solid #f1f5f9;
          position: sticky; top: 0; z-index: 50;
          box-shadow: 0 1px 2px rgba(0,0,0,.02);
        }
        
        /* Logo và Branding */
        .pub-logo-box { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .pub-logo-icon-wrapper { color: #2563eb; display: flex; align-items: center; }
        .pub-logo-title { font-weight: 800; font-size: 22px; color: #0f172a; tracking-tight: -0.5px; }
        .pub-logo-ai { color: #2563eb; }
        .pub-logo-sub { font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 1px; }

        /* Navigation Menu theo cột đứng có Icon */
        .pub-nav { display: flex; align-items: center; gap: 36px; height: 100%; margin-left: 20px;}
        .pub-nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px; font-weight: 600; color: #64748b;
          text-decoration: none; height: 100%; position: relative;
          transition: all .15s ease;
          padding-top: 6px;
        }
        .pub-nav-link-icon { color: #94a3b8; transition: color .15s; }
        .pub-nav-link:hover { color: #1e40af; }
        .pub-nav-link:hover .pub-nav-link-icon { color: #1e40af; }
        
        /* Trạng thái Active giống hệt ảnh mẫu */
        .pub-nav-link.active { color: #2563eb; }
        .pub-nav-link.active .pub-nav-link-icon { color: #2563eb; }
        .pub-nav-link.active::after {
          content: "";
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 24px; height: 3px;
          background-color: #2563eb;
          border-radius: 99px;
        }

        /* Ô tìm kiếm Search Bar thông minh */
        .pub-search-container {
          display: flex; align-items: center;
          background: #f4f6f9;
          border: 1px solid #eef2f6;
          border-radius: 14px;
          padding: 10px 14px;
          width: 260px;
          gap: 10px;
          margin: 0 24px;
        }
        .pub-search-icon { color: #94a3b8; display: flex; align-items: center; }
        .pub-search-input {
          border: none; background: transparent; outline: none;
          font-family: inherit; font-size: 13.5px; color: #334155; width: 100%;
        }
        .pub-search-input::placeholder { color: #94a3b8; font-weight: 500; }
        .pub-search-shortcut {
          font-size: 11px; font-weight: 600; color: #94a3b8;
          border: 1px solid #e2e8f0; background: #fff;
          padding: 2px 5px; border-radius: 6px;
          letter-spacing: 0.5px; box-shadow: 0 1px 1px rgba(0,0,0,0.02);
        }

        /* Các nút hành động phía bên phải */
        .pub-actions { display: flex; align-items: center; gap: 14px; }
        
        .mode-toggle {
          width: 42px; height: 42px; border-radius: 50%; border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #eab308; background: #fff; transition: all .15s;
        }
        .mode-toggle:hover { background: #f8fafc; border-color: #cbd5e1; transform: scale(1.02); }
        
        .btn-login {
          padding: 10px 24px; border-radius: 12px; font-size: 14.5px; font-weight: 700;
          border: 1px solid #e2e8f0; background: #fff; color: #0f172a;
          cursor: pointer; font-family: inherit; transition: all .15s;
        }
        .btn-login:hover { border-color: #cbd5e1; background: #f8fafc; }
        
        .btn-register {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 12px; font-size: 14.5px; font-weight: 600;
          border: none; background: #2563eb; color: #fff;
          cursor: pointer; font-family: inherit; transition: background .15s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }
        .btn-register:hover { background: #1d4ed8; }

        /* ── NEW FIXED FOOTER ── */
        .pub-footer {
          background: #051124; 
          color: #fff; 
          padding: 56px 40px 32px;
        }
        .footer-container { max-width: 1200px; margin: 0 auto; }
        .footer-grid { display: grid; grid-template-columns: 1fr 1.2fr 1fr; align-items: start; margin-bottom: 40px; }
        .footer-col { padding: 0 48px; }
        .footer-col:first-child { padding-left: 0; }
        .footer-col:last-child { padding-right: 0; }
        .footer-col-center { border-left: 1px solid rgba(255, 255, 255, 0.08); border-right: 1px solid rgba(255, 255, 255, 0.08); }
        .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .footer-logo-title { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
        .footer-logo-ai { color: #3b82f6; }
        .footer-slogan-text { font-size: 14px; color: #94a3b8; line-height: 1.6; font-weight: 400; }
        .footer-contact-item { display: flex; align-items: flex-start; gap: 14px; color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 20px; }
        .footer-contact-item:last-child { margin-bottom: 0; }
        .footer-icon-wrapper { display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .footer-map-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 20px; border-radius: 12px; background: rgba(59, 130, 246, 0.04); border: 1px solid #1d4ed8; color: #fff; font-size: 14.5px; font-weight: 600; text-decoration: none; transition: all .2s ease; margin-bottom: 24px; }
        .footer-map-btn:hover { background: rgba(59, 130, 246, 0.12); border-color: #3b82f6; }
        .footer-map-btn-left { display: flex; align-items: center; gap: 12px; }
        .footer-social-row { display: flex; gap: 14px; }
        .footer-social-circle { width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 255, 255, 0.04); display: flex; align-items: center; justify-content: center; color: #94a3b8; text-decoration: none; transition: all .2s; }
        .footer-social-circle:hover { background: rgba(255, 255, 255, 0.1); color: #fff; transform: translateY(-1px); }
        .footer-divider { border: none; border-top: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 24px; }
        .footer-copyright { text-align: center; font-size: 13.5px; color: #64748b; font-weight: 400; }

        /* Responsive Mobile */
        @media (max-width: 1100px) {
          .pub-search-container { display: none; }
        }
        @media (max-width: 992px) {
          .pub-nav { display: none; }
          .footer-grid { grid-template-columns: 1fr; gap: 40px; }
          .footer-col { padding: 0; }
          .footer-col-center { border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.08); border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding: 32px 0; }
        }
        @media (max-width: 768px) {
          .pub-header { padding: 0 16px; }
        }
      `}</style>

      {/* ══════════ NEW HEADER ══════════ */}
      <header className="pub-header">
        {/* Khối Logo bên trái */}
        <Link href="/" className="pub-logo-box">
          <div className="pub-logo-icon-wrapper">
            {/* Logo tinh xảo hình quả địa cầu và máy bay bao quanh */}
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

        {/* Khối Menu điều hướng trung tâm */}
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

        {/* Khối Tìm kiếm Search Bar */}
        <div className="pub-search-container">
          <span className="pub-search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input type="text" placeholder="Search flights, airports..." className="pub-search-input" />
          <span className="pub-search-shortcut">⌘ K</span>
        </div>

        {/* Khối Actions bên phải (Theme, Đăng nhập, Đăng ký) */}
        <div className="pub-actions">
          <button className="mode-toggle">
            {/* Sun Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path></svg>
          </button>
          
          <Link href="/login">
            <button className="btn-login">Login</button>
          </Link>
          
          <Link href="/register">
            <button className="btn-register">
              {/* User Plus Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
              <span>Register</span>
            </button>
          </Link>
        </div>
      </header>

      {/* ══════════ CONTENT ══════════ */}
      <main style={{ minHeight: "calc(100vh - 80px - 340px)" }}>
        {children}
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="pub-footer">
        <div className="footer-container">
          <div className="footer-grid">
            
            {/* Cột 1: Slogan & Brand */}
            <div className="footer-col">
              <div className="footer-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: "rotate(45deg)" }}>
                  <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="#3b82f6"/>
                </svg>
                <span className="footer-logo-title">SkyTrack <span className="footer-logo-ai">AI</span></span>
              </div>
              <p className="footer-slogan-text">Track flights in real-time.</p>
              <p className="footer-slogan-text">Fly smarter with AI.</p>
            </div>

            {/* Cột 2: Thông tin liên hệ */}
            <div className="footer-col footer-col-center">
              <div className="footer-contact-item">
                <span className="footer-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <span>contact@skytrackai.com</span>
              </div>
              <div className="footer-contact-item">
                <span className="footer-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </span>
                <span>123 Aviation Way, Ho Chi Minh City,<br />Vietnam</span>
              </div>
            </div>

            {/* Cột 3: Nút hành động & Mạng xã hội */}
            <div className="footer-col">
              <Link href="/map" className="footer-map-btn">
                <div className="footer-map-btn-left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                  <span>Open Live Map</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>

              <div className="footer-social-row">
                <a href="#" className="footer-social-circle">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h3v-9h2.721L15 8h-3V7a1 1 0 0 1 1-1h2V3h-3c-2.761 0-5 2.239-5 5v1z"></path></svg>
                </a>
                <a href="#" className="footer-social-circle">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                </a>
                <a href="#" className="footer-social-circle">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className="footer-social-circle">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </a>
              </div>
            </div>

          </div>

          <hr className="footer-divider" />
          
          <div className="footer-copyright">
            © 2024 SkyTrack AI. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}