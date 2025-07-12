// src/components/UserCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './UserCard.css'; // We'll create this CSS file next

// This component takes a single 'profile' object as a prop
function UserCard({ profile }) {
  // A simple fallback for the profile photo if it doesn't exist
  const profilePhoto = profile.profilePhotoUrl || 'https://i.imgur.com/6VBx3io.png';

  return (
    // The entire card is a link to the user's public profile page
    <Link to={`/users/${profile.user._id}`} className="user-card-link">
      <div className="user-card">
        <div className="card-header">
          <img src={profilePhoto} alt={`${profile.user.name}'s profile`} className="profile-photo" />
          <div className="user-info">
            <h3 className="user-name">{profile.user.name}</h3>
            {/* You can add location or other details here if available */}
            <p className="user-location">{profile.location || 'Location not specified'}</p>
          </div>
          <button className="request-button">Request</button>
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