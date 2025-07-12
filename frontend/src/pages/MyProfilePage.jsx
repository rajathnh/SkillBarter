// src/pages/MyProfilePage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import './MyProfilePage.css'; // We will use the new CSS file below

function MyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newSkill, setNewSkill] = useState({ offered: '', wanted: '' });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/profile/me');
      setProfile(data.profile);
      setError('');
    } catch (err) {
      setError('Failed to fetch profile. Please try logging in again.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { location, availability, isPublic } = profile;
      await api.patch('/profile/me', { location, availability, isPublic });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  const handleSkillInputChange = (e) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = async (type) => {
    const skillName = newSkill[type];
    if (!skillName) return;
    try {
      await api.post('/profile/me/skills', { skillName, type });
      setNewSkill(prev => ({ ...prev, [type]: '' })); // Clear input field
      fetchProfile(); // Refresh profile data
    } catch (err) {
      alert(`Failed to add skill: ${err.response?.data?.msg || 'Error'}`);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/profile/me/skills/${skillId}`);
      fetchProfile();
    } catch (err) {
      alert('Failed to remove skill.');
    }
  };

  if (loading) return <div className="profile-loading">Loading Profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!profile) return <div>Could not find profile data.</div>;

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <h1 className="profile-card-title">My Profile</h1>
        
        <form onSubmit={handleProfileUpdate} className="profile-form-main">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={profile.location || ''}
              onChange={handleFormChange}
              placeholder="e.g., San Francisco, CA"
            />
          </div>
          <div className="form-group">
            <label htmlFor="availability">Availability</label>
            <input
              type="text"
              id="availability"
              name="availability"
              value={profile.availability || ''}
              onChange={handleFormChange}
              placeholder="e.g., Weekends, Evenings"
            />
          </div>
          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={profile.isPublic}
              onChange={handleFormChange}
            />
            <label htmlFor="isPublic">Make my profile public</label>
          </div>
          <button type="submit" className="button-primary">Save Changes</button>
        </form>

        <div className="skills-section-divider"></div>

        <div className="skills-grid">
          {/* Skills Offered Column */}
          <div className="skills-column">
            <h2>Skills I Offer</h2>
            <div className="skill-tags-container">
              {profile.skillsOffered.map(skill => (
                <div key={skill._id} className="skill-tag">
                  <span>{skill.name}</span>
                  <button onClick={() => handleRemoveSkill(skill._id)} className="remove-tag-btn">×</button>
                </div>
              ))}
            </div>
            <div className="add-skill-wrapper">
              <input 
                type="text" 
                name="offered"
                value={newSkill.offered}
                onChange={handleSkillInputChange}
                placeholder="Add a new skill..."
              />
              <button onClick={() => handleAddSkill('offered')} className="button-secondary">Add</button>
            </div>
          </div>
          
          {/* Skills Wanted Column */}
          <div className="skills-column">
            <h2>Skills I Want</h2>
            <div className="skill-tags-container">
              {profile.skillsWanted.map(skill => (
                <div key={skill._id} className="skill-tag">
                  <span>{skill.name}</span>
                  <button onClick={() => handleRemoveSkill(skill._id)} className="remove-tag-btn">×</button>
                </div>
              ))}
            </div>
            <div className="add-skill-wrapper">
              <input 
                type="text"
                name="wanted"
                value={newSkill.wanted}
                onChange={handleSkillInputChange}
                placeholder="Add a new skill..."
              />
              <button onClick={() => handleAddSkill('wanted')} className="button-secondary">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;