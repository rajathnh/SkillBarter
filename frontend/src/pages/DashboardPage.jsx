// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import UserCard from '../components/UserCard';
import './DashboardPage.css';

function DashboardPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for pagination and search functionality
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Get the current logged-in user's ID from localStorage to filter them out
  const storedUser = JSON.parse(localStorage.getItem('skillSwapUser'));
  const currentUserId = storedUser?.userId;

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/users?page=${page}&search=${search}`);
        
        // Filter out the current user's profile from the fetched list
        const otherUserProfiles = response.data.profiles.filter(
          profile => profile.user._id !== currentUserId
        );
        
        setProfiles(otherUserProfiles);
        setTotalPages(response.data.numOfPages);

      } catch (err) {
        setError('Failed to fetch user profiles. Please try again later.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [page, search, currentUserId]); // Dependency array ensures this re-runs if any of these change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to the first page for every new search
    // The useEffect hook will automatically trigger the API call
  };

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Find a Skill Swap</h1>
      
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input 
          type="text" 
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {/* Render Loading or Error State */}
      {loading ? (
        <div className="loading-spinner" style={{color: 'white', textAlign: 'center', padding: '2rem'}}>Loading profiles...</div>
      ) : error ? (
        <div className="error-message" style={{color: 'red', textAlign: 'center', padding: '2rem'}}>{error}</div>
      ) : (
        <>
          {/* Render the list of user cards */}
          <div className="profiles-list">
            {profiles.length > 0 ? (
              profiles.map(profile => (
                <UserCard key={profile._id} profile={profile} />
              ))
            ) : (
              <p style={{color: 'white', textAlign: 'center', padding: '2rem'}}>No other user profiles found.</p>
            )}
          </div>

          {/* Render Pagination Controls only if there's more than one page */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                « Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardPage;