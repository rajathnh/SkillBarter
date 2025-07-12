import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavbarLayout from './NavbarLayout'; // Import the shared layout

function NavbarPublic() {
  const location = useLocation();

  return (
    // Use the layout component as a wrapper
    <NavbarLayout logoLinkTo="/">
      {/* The content below will be passed as `children` to the layout */}
      {location.pathname === '/login' || location.pathname === '/signup' ? (
        // On login/signup pages, show a "Home" button
        <Link to="/" className="nav-button">Home</Link>
      ) : (
        // On all other public pages, show "Login" and "Sign Up"
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup" className="nav-button">Sign Up</Link>
        </>
      )}
    </NavbarLayout>
  );
}

export default NavbarPublic;