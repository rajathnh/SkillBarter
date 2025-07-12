// src/pages/UserProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import SwapRequestModal from '../components/SwapRequestModal';
import FeedbackCard from '../components/FeedbackCard';
import './UserProfilePage.css';

function UserProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);

  // Get current user's ID to prevent showing "Request Swap" button on own profile
  const storedUser = JSON.parse(localStorage.getItem('skillSwapUser'));
  const currentUserId = storedUser?.userId;

  useEffect(() => {
    const fetchUserProfileAndFeedback = async () => {
      setLoading(true);
      setError('');
      try {
        // Only one API call is needed now, as the backend sends everything.
        const { data } = await api.get(`/users/${userId}`);
        
        // Set both pieces of state from the single response object.
        setProfile(data.profile);
        setFeedback(data.feedback);

      } catch (err) {
        setError(err.response?.data?.msg || 'Could not load user profile.');
        console.error(err);
      }
      setLoading(false);
    };

    if (userId) {
      fetchUserProfileAndFeedback();
    }
  }, [userId]); // Re-run effect if userId changes

  // --- Render States ---
  if (loading) {
    return <div className="loading-spinner" style={{color: 'white', textAlign: 'center', paddingTop: '4rem'}}>Loading User Profile...</div>;
  }
  if (error) {
    return <div className="error-message" style={{color: '#ff4d4d', textAlign: 'center', paddingTop: '4rem'}}>{error}</div>;
  }
  if (!profile) {
    return <div style={{color: 'white', textAlign: 'center', paddingTop: '4rem'}}>User not found.</div>;
  }

  const profilePhoto = profile.profilePhotoUrl || 'https://i.imgur.com/6VBx3io.png';

  return (
    <div className="user-profile-container">
      <div className="user-profile-card">
        <div className="profile-header">
          <img src={profilePhoto} alt={profile.user.name} className="profile-avatar" />
          <div className="header-info">
            <h1>{profile.user.name}</h1>
            <p>{profile.location || 'Location not specified'}</p>
          </div>
          {/* Only show the button if the profile being viewed is NOT the current user's */}
          {currentUserId !== userId && (
            <button className="request-swap-btn" onClick={() => setShowModal(true)}>
              Request Swap
            </button>
          )}
        </div>

        <div className="profile-body">
          <div className="profile-section">
            <h2>Skills Offered</h2>
            <div className="skill-tags">
              {profile.skillsOffered.length > 0 ? (
                profile.skillsOffered.map(skill => <span key={skill._id} className="tag">{skill.name}</span>)
              ) : <p>This user hasn't listed any skills to offer yet.</p>}
            </div>
          </div>
          <div className="profile-section">
            <h2>Skills Wanted</h2>
            <div className="skill-tags">
               {profile.skillsWanted.length > 0 ? (
                profile.skillsWanted.map(skill => <span key={skill._id} className="tag">{skill.name}</span>)
              ) : <p>This user isn't looking for any specific skills right now.</p>}
            </div>
          </div>
          <div className="profile-section">
            <h2>Availability</h2>
            <p>{profile.availability || 'Availability not specified'}</p>
          </div>

          {/* New Feedback Section */}
          <div className="profile-section">
            <h2>Feedback & Ratings ({feedback.length})</h2>
            <div className="feedback-list">
              {feedback.length > 0 ? (
                feedback.map(item => (
                  <FeedbackCard key={item._id} feedbackItem={item} />
                ))
              ) : (
                <p>This user has not received any feedback yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* The Swap Request Modal (only renders if a profile exists) */}
      {profile && (
        <SwapRequestModal 
          show={showModal} 
          handleClose={() => setShowModal(false)}
          receiverId={profile.user._id}
          receiverName={profile.user.name}
          skillsTheyOffer={profile.skillsOffered}
        />
      )}
    </div>
  );
}

export default UserProfilePage;