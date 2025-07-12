// src/components/FeedbackModal.jsx

import React, { useState, useEffect } from 'react'; // <-- Add useEffect here
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import api from '../api/axiosConfig';

function FeedbackModal({ show, handleClose, swapId, onFeedbackSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when the modal is opened
  useEffect(() => {
    if(show) {
      setRating(5);
      setComment('');
      setError('');
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/feedback', {
        swapId,
        rating,
        comment,
      });
      alert('Feedback submitted successfully!');
      onFeedbackSuccess(); // Notify parent to refresh or update state
      handleClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit feedback.');
    }
    setLoading(false);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Leave Feedback</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Rating</Form.Label>
            <Form.Select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Average</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Terrible</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Comment (Optional)</Form.Label>
            <Form.Control as="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
          </Form.Group>
          <div className="d-grid">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default FeedbackModal;