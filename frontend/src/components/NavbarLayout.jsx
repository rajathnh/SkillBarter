import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// This layout component accepts the specific links as `children`
// and a `logoLinkTo` prop for the logo's destination.
function NavbarLayout({ children, logoLinkTo = "/" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem',
      height: '80px',
      background: 'rgba(0,0,0,0.5)',
      color: 'white',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <style>
        {`
          .nav-logo { font-size: 1.5rem; }
          .nav-logo, .nav-links a, .nav-links button { color: white; text-decoration: none; }
          .nav-links { display: flex; align-items: center; gap: 1.5rem; }
          .nav-button { padding: 0.5rem 1rem; border: 1px solid white; border-radius: 20px; background: transparent; cursor: pointer; transition: all 0.3s ease; }
          .nav-button:hover { background: white; color: black; }
          .user-greeting { font-weight: 500; }
          .hamburger { display: none; }
          .mobile-menu { position: absolute; top: 80px; left: 0; right: 0; background: rgba(26, 42, 108, 0.95); padding: 1rem; display: flex; flex-direction: column; gap: 1rem; z-index: 1001; }
          .mobile-menu a, .mobile-menu button { text-align: center; padding: 0.8rem; border-radius: 8px; background: rgba(255, 255, 255, 0.15); }
          
          @media (max-width: 768px) {
            .nav-links { display: none; }
            .hamburger { display: block; cursor: pointer; }
          }
        `}
      </style>

      {/* Logo uses the prop for its link */}
      <Link to={logoLinkTo} className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700', textDecoration: 'none' }}>
        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(45deg, #4dabf7, #3a7bd5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11V7L9 14L16 21V16.9C21 16.9 24 19 24 24C23 20 20 17 16 17V11Z" fill="white"/><path d="M8 13V17L15 10L8 3V7.1C3 7.1 0 5 0 0C1 4 4 7 8 7V13Z" fill="white"/></svg>
        </div>
        SkillBarter
      </Link>

      {/* Renders the specific links passed in */}
      <div className="nav-links">
        {children}
      </div>

      {/* Mobile Menu Button - stays the same */}
      <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H21" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M3 6H21" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M3 18H21" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>

      {/* Mobile Menu Dropdown renders the same specific links */}
      {isMenuOpen && (
        <div className="mobile-menu" onClick={() => setIsMenuOpen(false)}>
          {children}
        </div>
      )}
    </nav>
  );
}

export default NavbarLayout;