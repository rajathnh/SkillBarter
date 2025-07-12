// src/pages/Admin/ManageUsersPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Table, Button, Badge } from 'react-bootstrap';

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (err) {
      setError('Failed to fetch users.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleToggleBan = async (userId) => {
    const confirmBan = window.confirm("Are you sure you want to change this user's ban status?");
    if (!confirmBan) return;

    try {
        await api.patch(`/admin/users/${userId}/ban`);
        // Refresh the list to show the change
        fetchUsers(); 
    } catch (err) {
        alert("Error updating user status: " + (err.response?.data?.msg || 'Please try again.'));
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Manage Users</h1>
      <Table striped bordered hover variant="dark" responsive className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td><Badge bg="info">{user.role}</Badge></td>
              <td>
                {user.isBanned ? (
                  <Badge bg="danger">Banned</Badge>
                ) : (
                  <Badge bg="success">Active</Badge>
                )}
              </td>
              <td>
                {user.role !== 'ADMIN' && (
                    <Button 
                        variant={user.isBanned ? 'success' : 'danger'}
                        size="sm"
                        onClick={() => handleToggleBan(user._id)}
                    >
                        {user.isBanned ? 'Unban' : 'Ban'}
                    </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default ManageUsersPage;