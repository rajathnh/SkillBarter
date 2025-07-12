// src/pages/UserProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import SwapRequestModal from '../components/SwapRequestModal';
import './UserProfilePage.css';

function UserProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/users/${userId}`);
        setProfile(data.profile);
      } catch (err) {
        setError('Could not load user profile. The user may not exist or their profile is private.');
      }
      setLoading(false);
    };
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) return <div className="loading-spinner" style={{color: 'white', textAlign: 'center', paddingTop: '4rem'}}>Loading...</div>;
  if (error) return <div className="error-message" style={{color: '#ff4d4d', textAlign: 'center', paddingTop: '4rem'}}>{error}</div>;
  if (!profile) return <div style={{color: 'white', textAlign: 'center', paddingTop: '4rem'}}>User not found.</div>;

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
          <button className="request-swap-btn" onClick={() => setShowModal(true)}>
            Request Swap
          </button>
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
        </div>
      </div>
      
      {profile && (
        <SwapRequestModal 
          show={showModal} 
          handleClose={() => setShowModal(false)}
          receiverId={profile.user._id}
          receiverName={profile.user.name}
          // THIS IS THE CORRECT PROP TO PASS
          skillsTheyOffer={profile.skillsOffered} 
        />
      )}
    </div>
  );
}

export default UserProfilePage;