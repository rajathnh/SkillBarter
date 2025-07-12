// src/pages/Admin/ManageSkillsPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Table, Button, Badge } from 'react-bootstrap';

function ManageSkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/skills');
      setSkills(data.skills);
    } catch (err) {
      console.error('Failed to fetch skills', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleToggleApproval = async (skillId) => {
    try {
        await api.patch(`/admin/skills/${skillId}/toggle-approval`);
        fetchSkills(); // Refresh list
    } catch (err) {
        alert("Error updating skill: " + (err.response?.data?.msg || 'Please try again.'));
    }
  };

  if (loading) return <p>Loading skills...</p>;

  return (
    <div>
      <h1>Manage Skills</h1>
      <Table striped bordered hover variant="dark" responsive className="admin-table">
        <thead>
          <tr>
            <th>Skill Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill._id}>
              <td>{skill.name}</td>
              <td>
                {skill.isApproved ? (
                  <Badge bg="success">Approved</Badge>
                ) : (
                  <Badge bg="warning">Pending</Badge>
                )}
              </td>
              <td>
                <Button
                  variant={skill.isApproved ? 'warning' : 'success'}
                  size="sm"
                  onClick={() => handleToggleApproval(skill._id)}
                >
                  {skill.isApproved ? 'Disapprove' : 'Approve'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default ManageSkillsPage;