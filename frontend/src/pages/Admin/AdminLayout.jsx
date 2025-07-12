// src/pages/Admin/AdminLayout.jsx

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Admin.css'; // We will create this CSS file next

function AdminLayout() {
  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Admin Panel</h2>
        <nav className="admin-nav">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/users">Manage Users</NavLink>
          <NavLink to="/admin/skills">Manage Skills</NavLink>
          <NavLink to="/admin/swaps">Monitor Swaps</NavLink>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet /> {/* This is where the nested child routes will render */}
      </main>
    </div>
  );
}

export default AdminLayout;