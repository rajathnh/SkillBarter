import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavbarLayout from './NavbarLayout'; // Import the shared layout

// It still receives the user and onLogout props from the main Navbar switcher
function NavbarPrivate({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    // Use the layout, but link the logo to the dashboard
    <NavbarLayout logoLinkTo="/dashboard">
      {/* These links are passed as `children` to the layout */}
      <span className="user-greeting">Hi, {user.name}!</span>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/profile/me">My Profile</Link>
      <button onClick={handleLogoutClick} className="nav-button">Logout</button>
    </NavbarLayout>
  );
}

export default NavbarPrivate;