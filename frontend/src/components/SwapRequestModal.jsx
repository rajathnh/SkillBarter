// src/components/SwapRequestModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import api from '../api/axiosConfig';

// It now correctly receives 'skillsTheyOffer'
function SwapRequestModal({ show, handleClose, receiverId, receiverName, skillsTheyOffer }) {
  const [myProfile, setMyProfile] = useState(null);
  const [offeredSkillId, setOfferedSkillId] = useState('');
  const [wantedSkillId, setWantedSkillId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setOfferedSkillId('');
      setWantedSkillId('');
      setMessage('');
      setError('');
      const fetchMyProfile = async () => {
        try {
          const { data } = await api.get('/profile/me');
          setMyProfile(data.profile);
        } catch (err) {
          setError('Could not load your profile to make a request.');
        }
      };
      fetchMyProfile();
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!offeredSkillId || !wantedSkillId) {
      setError('Please select a skill to offer and a skill to receive.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/swaps', {
        receiverId: receiverId,
        skillOfferedId: offeredSkillId,
        skillWantedId: wantedSkillId, // The backend gets the ID of the skill you want
        message: message,
      });
      alert('Swap request sent successfully!');
      handleClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send request.');
    }
    setLoading(false);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Request Swap with {receiverName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="skillOffered">
            <Form.Label>Skill I'm Offering:</Form.Label>
            <Form.Select 
              value={offeredSkillId}
              onChange={(e) => setOfferedSkillId(e.target.value)}
              required
            >
              <option value="">-- Select one of your skills --</option>
              {myProfile?.skillsOffered.map(skill => (
                <option key={skill._id} value={skill._id}>{skill.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="skillWanted">
            <Form.Label>Skill I Want from Them:</Form.Label>
            <Form.Select 
              value={wantedSkillId}
              onChange={(e) => setWantedSkillId(e.target.value)}
              required
            >
              <option value="">-- Select from skills they offer --</option>
              {/* THIS NOW CORRECTLY USES THE 'skillsTheyOffer' PROP */}
              {skillsTheyOffer?.map(skill => (
                <option key={skill._id} value={skill._id}>{skill.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="message">
            <Form.Label>Message (Optional)</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and suggest a time/place to swap!"
            />
          </Form.Group>
          
          <div className="d-grid">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Swap Request'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default SwapRequestModal;