// src/pages/LandingPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import './LandingPage.css'; // We will create this dedicated CSS file next

function LandingPage() {
  // State for managing profiles, loading status, and potential errors
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for search and pagination functionality
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Effect hook to fetch user profiles from the API whenever page or search term changes
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch public user profiles from the backend
        const { data } = await api.get(`/users?page=${page}&search=${search}`);
        setProfiles(data.profiles);
        setTotalPages(data.numOfPages);
      } catch (err) {
        setError('Failed to load community profiles. Please try again later.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [page, search]);

  // Handler for the search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to the first page for every new search
  };

  // Helper component to render star ratings visually
  const StarRating = ({ rating }) => {
    const stars = [];
    const fullRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= fullRating ? 'star-filled' : ''}>
          ★
        </span>
      );
    }
    return <div className="landing-star-rating">{stars}</div>;
  };

  return (
    <div className="landing-page-container">
      <h1 className="landing-page-title">Explore the SkillBarter Community</h1>
      <p className="landing-page-subtitle">
        This is a live preview of our talented users. 
        <Link to="/signup" className="landing-signup-link"> Create an account</Link> to connect and start swapping!
      </p>
      
      <form onSubmit={handleSearchSubmit} className="landing-search-form">
        <input 
          type="text" 
          placeholder="Search for a skill like 'Guitar' or 'Python'..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="landing-search-input"
        />
        <button type="submit" className="landing-search-button">Search</button>
      </form>

      {/* Conditional rendering for loading, error, and success states */}
      {loading ? (
        <div className="landing-loading-spinner">Loading profiles...</div>
      ) : error ? (
        <div className="landing-error-message">{error}</div>
      ) : (
        <>
          {/* Grid to display all user cards */}
          <div className="landing-profiles-list">
            {profiles.length > 0 ? (
              profiles.map(profile => {
                const profilePhoto = profile.profilePhotoUrl || 'https://i.imgur.com/6VBx3io.png';
                return (
                  <div key={profile._id} className="landing-user-card">
                    <div className="landing-card-header">
                      <img src={profilePhoto} alt={`${profile.user.name}'s profile`} className="landing-profile-photo" />
                      <div className="landing-user-info">
                        <h3 className="landing-user-name">{profile.user.name}</h3>
                        <p className="landing-user-location">{profile.location || 'Location not specified'}</p>
                        <div className="landing-user-rating-area">
                          {profile.ratingCount > 0 ? (
                            <>
                              <StarRating rating={profile.averageRating} />
                              <span className="landing-rating-text">
                                {profile.averageRating.toFixed(1)} ({profile.ratingCount} reviews)
                              </span>
                            </>
                          ) : (
                            <span className="landing-rating-text">No reviews yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="landing-skills-section">
                      <div className="landing-skills-list">
                        <h4>Offers:</h4>
                        <div className="landing-tags">
                          {profile.skillsOffered.length > 0 ? (
                            profile.skillsOffered.map(skill => <span key={skill._id} className="landing-tag tag-offered">{skill.name}</span>)
                          ) : <span className="landing-tag-empty">Nothing offered</span>}
                        </div>
                      </div>
                      <div className="landing-skills-list">
                        <h4>Wants:</h4>
                        <div className="landing-tags">
                          {profile.skillsWanted.length > 0 ? (
                            profile.skillsWanted.map(skill => <span key={skill._id} className="landing-tag tag-wanted">{skill.name}</span>)
                          ) : <span className="landing-tag-empty">Nothing wanted</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="landing-no-results">No user profiles found matching your search.</p>
            )}
          </div>

          {/* Pagination controls, only shown if there is more than one page */}
          {totalPages > 1 && (
            <div className="landing-pagination">
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

export default LandingPage;