// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Component & Page Imports
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoutes'; // <-- IMPORT ADMIN ROUTE
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MyProfilePage from './pages/MyProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import MySwapsPage from './pages/MySwapsPage';

// --- START: IMPORT ADMIN PAGES ---
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import ManageUsersPage from './pages/Admin/ManageUsersPage';
import ManageSkillsPage from './pages/Admin/ManageSkillsPage';
import ManageSwapsPage from './pages/Admin/ManageSwapsPage';
// --- END: IMPORT ADMIN PAGES ---

// Global Styles
import './App.css';
import './pages/Admin/Admin.css'; // Import admin styles globally

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('skillSwapUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse stored user", error);
      localStorage.removeItem('skillSwapUser');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('skillSwapUser');
    setUser(null);
  };
  
  if (loading) {
    return <div>Loading Application...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main style={{ paddingTop: '80px' }}>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<LoginPage onLogin={setUser} />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* PROTECTED ROUTES (Require login) */}
            <Route path="/dashboard" element={<ProtectedRoute user={user}><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile/me" element={<ProtectedRoute user={user}><MyProfilePage /></ProtectedRoute>} />
            <Route path="/swaps" element={<ProtectedRoute user={user}><MySwapsPage /></ProtectedRoute>} />
            <Route path="/users/:userId" element={<ProtectedRoute user={user}><UserProfilePage /></ProtectedRoute>} />

            {/* --- START: ADMIN ROUTES --- */}
            <Route 
              path="/admin"
              element={
                <AdminRoute user={user}>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              {/* These are the nested routes that will render inside AdminLayout's <Outlet> */}
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<ManageUsersPage />} />
              <Route path="skills" element={<ManageSkillsPage />} />
              <Route path="swaps" element={<ManageSwapsPage />} />
            </Route>
            {/* --- END: ADMIN ROUTES --- */}
            
            {/* DEFAULT ROUTE */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;