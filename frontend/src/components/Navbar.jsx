import React from 'react';
import NavbarPublic from './NavbarPublic';
import NavbarPrivate from './NavbarPrivate';

function Navbar({ user, onLogout }) {
  // If a user object exists, show the private navbar
  if (user) {
    return <NavbarPrivate onLogout={onLogout} />;
  }

  // Otherwise, show the public navbar
  return <NavbarPublic />;
}

export default Navbar;