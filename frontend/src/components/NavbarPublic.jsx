// src/components/NavbarPublic.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import NavbarLayout from './NavbarLayout';

function NavbarPublic() {
  return (
    // Use the layout, linking the logo to the login page by default
    <NavbarLayout logoLinkTo="/">
      {/* These are the links for a logged-out user */}
      <Link to="/login">Login</Link>
      <Link to="/signup" className="nav-button">Sign Up</Link>
    </NavbarLayout>
  );
}

export default NavbarPublic;
