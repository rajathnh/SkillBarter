// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

// It receives the 'user' object and the 'children' (the page to render)
function ProtectedRoute({ user, children }) {
  if (!user) {
    // If there is no user, redirect to the /login page
    return <Navigate to="/login" replace />;
  }

  // If there is a user, render the child component (e.g., DashboardPage)
  return children;
}

export default ProtectedRoute;