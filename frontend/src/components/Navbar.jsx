import React from 'react';
import NavbarPublic from './NavbarPublic';
import NavbarPrivate from './NavbarPrivate';

// This is the main Navbar component used by App.jsx.
// Its only job is to decide which version of the navbar to show.
function Navbar({ user, onLogout }) {

  // If a user object exists (i.e., the user is logged in), show the private navbar.
  // CRUCIALLY, we pass the user and onLogout props down to it.
  if (user) {
    return <NavbarPrivate user={user} onLogout={onLogout} />;
  }

  // Otherwise, if there is no user, show the public navbar.
  return <NavbarPublic />;
}

export default Navbar;