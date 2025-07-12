// src/pages/Admin/ManageSwapsPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Table, Badge } from 'react-bootstrap';

function ManageSwapsPage() {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSwaps = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/swaps');
        setSwaps(data.swaps);
      } catch (err) {
        console.error('Failed to fetch swaps', err);
      }
      setLoading(false);
    };
    fetchSwaps();
  }, []);

  if (loading) return <p>Loading swaps...</p>;

  return (
    <div>
      <h1>Monitor All Swaps</h1>
      <Table striped bordered hover variant="dark" responsive className="admin-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Requester</th>
            <th>Receiver</th>
            <th>Skill Offered</th>
            <th>Skill Wanted</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {swaps.map((swap) => (
            <tr key={swap._id}>
              <td>{new Date(swap.createdAt).toLocaleDateString()}</td>
              <td>{swap.requester?.name || 'N/A'}</td>
              <td>{swap.receiver?.name || 'N/A'}</td>
              <td>{swap.skillOffered?.name || 'N/A'}</td>
              <td>{swap.skillWanted?.name || 'N/A'}</td>
              <td><Badge bg="primary">{swap.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default ManageSwapsPage;