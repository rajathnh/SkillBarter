// src/components/UserCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './UserCard.css';

// --- START: COPIED FROM FeedbackCard FOR REUSE ---
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
  return <div className="star-rating-display">{stars}</div>;
};
// --- END: COPIED HELPER ---

function UserCard({ profile, onShowRequestModal }) {
  const profilePhoto = profile.profilePhotoUrl || 'https://i.imgur.com/6VBx3io.png';

  const handleRequestClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onShowRequestModal(profile);
  };

  return (
    <Link to={`/users/${profile.user._id}`} className="user-card-link">
      <div className="user-card">
        <div className="card-header">
          <img src={profilePhoto} alt={`${profile.user.name}'s profile`} className="profile-photo" />
          <div className="user-info">
            <h3 className="user-name">{profile.user.name}</h3>
            <p className="user-location">{profile.location || 'Location not specified'}</p>
             {/* --- START: ADDED RATING DISPLAY --- */}
            <div className="user-rating">
              {profile.ratingCount > 0 ? (
                <>
                  <StarRating rating={profile.averageRating} />
                  <span className="rating-text">
                    {profile.averageRating.toFixed(1)} ({profile.ratingCount} reviews)
                  </span>
                </>
              ) : (
                <span className="rating-text">No reviews yet</span>
              )}
            </div>
            {/* --- END: ADDED RATING DISPLAY --- */}
          </div>
          <button onClick={handleRequestClick} className="request-button">Request</button>
        </div>
        <div className="skills-section">
          <div className="skills-list skills-offered">
            <h4>Skills Offered:</h4>
            <div className="tags">
              {profile.skillsOffered.length > 0 ? (
                profile.skillsOffered.map(skill => (
                  <span key={skill._id} className="tag">{skill.name}</span>
                ))
              ) : (
                <span className="tag-empty">No skills offered</span>
              )}
            </div>
          </div>
          <div className="skills-list skills-wanted">
            <h4>Skills Wanted:</h4>
            <div className="tags">
              {profile.skillsWanted.length > 0 ? (
                profile.skillsWanted.map(skill => (
                  <span key={skill._id} className="tag">{skill.name}</span>
                ))
              ) : (
                <span className="tag-empty">No skills wanted</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default UserCard;