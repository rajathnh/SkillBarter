// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import UserCard from '../components/UserCard';
import './DashboardPage.css'; // For dashboard-specific styles

function DashboardPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError('');
      try {
        // Construct the query string for search and pagination
        const response = await api.get(`/users?page=${page}&search=${search}`);
        setProfiles(response.data.profiles);
        setTotalPages(response.data.numOfPages);
      } catch (err) {
        setError('Failed to fetch user profiles. Please try again later.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [page, search]); // Re-fetch whenever page or search term changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    // The useEffect will trigger the fetch
  }

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Find a Skill Swap</h1>
      
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input 
          type="text" 
          placeholder="Search by name or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {/* Main Content */}
      {loading ? (
        <div className="loading-spinner">Loading...</div> // Replace with a real spinner if you have time
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="profiles-list">
            {profiles.length > 0 ? (
              profiles.map(profile => (
                <UserCard key={profile._id} profile={profile} />
              ))
            ) : (
              <p>No profiles found.</p>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              « Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next »
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;