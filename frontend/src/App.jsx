// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Component & Page Imports ---

// Core Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoutes';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Protected User Pages
import DashboardPage from './pages/DashboardPage';
import MyProfilePage from './pages/MyProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import MySwapsPage from './pages/MySwapsPage';

// Admin Panel Pages
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import ManageUsersPage from './pages/Admin/ManageUsersPage';
import ManageSkillsPage from './pages/Admin/ManageSkillsPage';
import ManageSwapsPage from './pages/Admin/ManageSwapsPage';

// Global Styles
import './App.css';
import './pages/Admin/Admin.css'; // Import admin styles globally to be safe

function App() {
  // Single source of truth for the logged-in user's data
  const [user, setUser] = useState(null);
  // Loading state to prevent content flashes on initial load
  const [loading, setLoading] = useState(true);

  // On initial app load, check localStorage to see if the user was already logged in.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('skillSwapUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // If stored user data is invalid, remove it
      console.error("Failed to parse stored user data", error);
      localStorage.removeItem('skillSwapUser');
    }
    // Finished checking, we can now render the app
    setLoading(false);
  }, []);

  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem('skillSwapUser');
    setUser(null);
  };
  
  // Don't render anything until the initial user check is complete
  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', paddingTop: '5rem', fontSize: '1.5rem' }}>Loading Application...</div>;
  }

  return (
    <Router>
      <div className="App">
        {/* The Navbar receives the user object to display the correct links */}
        <Navbar user={user} onLogout={handleLogout} />
        
        {/* Add top padding to the main content area to prevent it from being hidden by the fixed navbar */}
        <main style={{ paddingTop: '80px' }}>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            {/* If a user is not logged in, show these pages. Otherwise, redirect to the main dashboard. */}
            <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <LoginPage onLogin={setUser} /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} />


            {/* --- PROTECTED USER ROUTES --- */}
            {/* These routes are only accessible to logged-in users. */}
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute user={user}><DashboardPage /></ProtectedRoute>} 
            />
            <Route 
              path="/profile/me"
              element={<ProtectedRoute user={user}><MyProfilePage /></ProtectedRoute>}
            />
            <Route 
              path="/swaps"
              element={<ProtectedRoute user={user}><MySwapsPage /></ProtectedRoute>}
            />
            <Route 
              path="/users/:userId"
              element={<ProtectedRoute user={user}><UserProfilePage /></ProtectedRoute>}
            />

            
            {/* --- PROTECTED ADMIN ROUTES --- */}
            {/* This parent route checks for ADMIN role and renders the sidebar layout. */}
            <Route 
              path="/admin"
              element={<AdminRoute user={user}><AdminLayout /></AdminRoute>}
            >
              {/* These nested routes render inside the AdminLayout's <Outlet> */}
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<ManageUsersPage />} />
              <Route path="skills" element={<ManageSkillsPage />} />
              <Route path="swaps" element={<ManageSwapsPage />} />
            </Route>

            
            {/* --- CATCH-ALL REDIRECT --- */}
            {/* If a user tries to access any other path, redirect them to the home page. */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;