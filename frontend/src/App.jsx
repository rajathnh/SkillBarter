// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Component & Page Imports
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MyProfilePage from './pages/MyProfilePage'; // The new profile page

// Global Styles
import './App.css';

function App() {
  // This is the single source of truth for the logged-in user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To prevent flashes of content

  // On initial load, check localStorage to see if the user was already logged in.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('skillSwapUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // If stored user is invalid, remove it
      console.error("Failed to parse stored user", error);
      localStorage.removeItem('skillSwapUser');
    }
    setLoading(false); // Finished checking, we can now render the app
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('skillSwapUser');
    setUser(null);
  };
  
  // Don't render anything until we have checked for a user
  if (loading) {
    return <div>Loading Application...</div>;
  }

  return (
    <Router>
      <div className="App">
        {/* Pass user object and the logout function to the Navbar */}
        <Navbar user={user} onLogout={handleLogout} />
        
        <main style={{ paddingTop: '80px' }}> {/* Padding to avoid content hiding under fixed navbar */}
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<LoginPage onLogin={setUser} />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* PROTECTED ROUTES (Require login) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute user={user}>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/me"
              element={
                <ProtectedRoute user={user}>
                  <MyProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* DEFAULT ROUTE */}
            {/* If logged in, redirect to dashboard. Otherwise, redirect to login. */}
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;