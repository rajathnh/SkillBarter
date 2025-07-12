import React, { useState } from 'react';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem',
      height: '80px',
      background: 'rgba(0,0,0,0.5)',
      backgroundSize: '300% 300%',
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
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .nav-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 700;
            font-size: 1.9rem;
            letter-spacing: -0.5px;
            background: linear-gradient(45deg, #ffffff, #a0e9ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .logo-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(45deg, #4dabf7, #3a7bd5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          }
          
          .nav-button {
            padding: 0.6rem 1.8rem;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 30px;
            color: white;
            cursor: pointer;
            font-size: 1.4rem;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .nav-button:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
          }
          
          .hamburger {
            display: none;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 8px;
          }
          
          .mobile-menu {
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: rgba(26, 42, 108, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideDown 0.3s ease;
          }
          
          .mobile-button {
            padding: 0.8rem;
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            text-align: center;
            font-size: 1.1rem;
            font-weight: 600;
          }
          
          @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @media (max-width: 768px) {
            .nav-button {
              display: none;
            }
            
            .hamburger {
              display: block;
            }
          }
        `}
      </style>

      {/* Logo with icon */}
      <div className="nav-logo">
        <div className="logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 11V7L9 14L16 21V16.9C21 16.9 24 19 24 24C23 20 20 17 16 17V11Z" fill="white"/>
            <path d="M8 13V17L15 10L8 3V7.1C3 7.1 0 5 0 0C1 4 4 7 8 7V13Z" fill="white"/>
          </svg>
        </div>
        SkillBarter
      </div>

      {/* Desktop Home Button */}
      <button className="nav-button">
        Home
      </button>

      {/* Mobile Menu Button */}
      <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 6H21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 18H21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-button">
            Home
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;