// src/components/AdminRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

// This component is similar to ProtectedRoute but checks for the ADMIN role
function AdminRoute({ user, children }) {
  if (!user) {
    // If no user, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    // If user is not an admin, redirect them to the regular dashboard
    // You could also show an "Unauthorized" page here
    return <Navigate to="/dashboard" replace />;
  }

  // If user is an admin, render the child component (e.g., AdminLayout)
  return children;
}

export default AdminRoute;