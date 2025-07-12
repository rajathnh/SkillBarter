// src/pages/MyProfilePage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import './MyProfilePage.css';

function MyProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    availability: '',
    isPublic: true,
    profilePhotoUrl: '',
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [skills, setSkills] = useState({ offered: [], wanted: [] });
  const [newSkill, setNewSkill] = useState({ offered: '', wanted: '' });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/profile/me');
      setFormData({
        name: data.profile.user.name,
        location: data.profile.location || '',
        availability: data.profile.availability || '',
        isPublic: data.profile.isPublic,
        profilePhotoUrl: data.profile.profilePhotoUrl,
      });
      setSkills({
        offered: data.profile.skillsOffered,
        wanted: data.profile.skillsWanted,
      });
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handlePhotoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setProfilePhotoFile(file);
          // Create a preview URL
          setFormData(prev => ({ ...prev, profilePhotoUrl: URL.createObjectURL(file) }));
      }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Use FormData to send both file and text data
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('location', formData.location);
    submissionData.append('availability', formData.availability);
    submissionData.append('isPublic', formData.isPublic);
    if (profilePhotoFile) {
        submissionData.append('profilePhoto', profilePhotoFile);
    }
    
    try {
      // The header is automatically set to 'multipart/form-data' by axios
      const { data } = await api.patch('/profile/me', submissionData);
      
      // Update localStorage with new user details (e.g., new name)
      localStorage.setItem('skillSwapUser', JSON.stringify(data.user));
      
      alert('Profile updated successfully!');
      // Refresh profile to show new photo URL from cloudinary and reset file input
      setProfilePhotoFile(null); 
      fetchProfile();
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.msg || 'Please try again.'));
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
      setNewSkill(prev => ({ ...prev, [type]: '' }));
      fetchProfile();
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

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <h1 className="profile-card-title">My Profile</h1>
        
        <form onSubmit={handleProfileUpdate} className="profile-form-main">
            <div className="profile-photo-section">
                <img src={formData.profilePhotoUrl || 'https://i.imgur.com/6VBx3io.png'} alt="Profile Preview" className="profile-photo-preview" />
                <div className="form-group">
                    <label htmlFor="profilePhoto">Change Profile Photo</label>
                    <input type="file" id="profilePhoto" name="profilePhoto" onChange={handlePhotoChange} accept="image/*" />
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleFormChange} placeholder="Your full name" required/>
            </div>
            <div className="form-group">
                <label htmlFor="location">Location</label>
                <input type="text" id="location" name="location" value={formData.location || ''} onChange={handleFormChange} placeholder="e.g., San Francisco, CA" />
            </div>
            <div className="form-group">
                <label htmlFor="availability">Availability</label>
                <input type="text" id="availability" name="availability" value={formData.availability || ''} onChange={handleFormChange} placeholder="e.g., Weekends, Evenings" />
            </div>
            <div className="form-group-checkbox">
                <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleFormChange} />
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
              {skills.offered.map(skill => (
                <div key={skill._id} className="skill-tag">
                  <span>{skill.name}</span>
                  <button onClick={() => handleRemoveSkill(skill._id)} className="remove-tag-btn">×</button>
                </div>
              ))}
            </div>
            <div className="add-skill-wrapper">
              <input type="text" name="offered" value={newSkill.offered} onChange={handleSkillInputChange} placeholder="Add a new skill..." />
              <button onClick={() => handleAddSkill('offered')} className="button-secondary">Add</button>
            </div>
          </div>
          
          {/* Skills Wanted Column */}
          <div className="skills-column">
            <h2>Skills I Want</h2>
            <div className="skill-tags-container">
              {skills.wanted.map(skill => (
                <div key={skill._id} className="skill-tag">
                  <span>{skill.name}</span>
                  <button onClick={() => handleRemoveSkill(skill._id)} className="remove-tag-btn">×</button>
                </div>
              ))}
            </div>
            <div className="add-skill-wrapper">
              <input type="text" name="wanted" value={newSkill.wanted} onChange={handleSkillInputChange} placeholder="Add a new skill..." />
              <button onClick={() => handleAddSkill('wanted')} className="button-secondary">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;