// src/components/FeedbackCard.jsx

import React from 'react';
import './FeedbackCard.css'; // We'll create this CSS file next

// A helper function to render star ratings visually
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? 'star-filled' : 'star-empty'}>
        ★
      </span>
    );
  }
  return <div className="star-rating">{stars}</div>;
};


function FeedbackCard({ feedbackItem }) {
  // Destructure props for cleaner access
  const { rater, rating, comment, createdAt } = feedbackItem;
  
  // A simple fallback in case the rater's account was deleted
  const raterName = rater ? rater.name : 'An anonymous user';

  return (
    <div className="feedback-card">
      <div className="feedback-header">
        <span className="rater-name">{raterName}</span>
        <span className="feedback-date">{new Date(createdAt).toLocaleDateString()}</span>
      </div>
      <div className="feedback-rating">
        <StarRating rating={rating} />
      </div>
      <p className="feedback-comment">"{comment || 'No comment was left.'}"</p>
    </div>
  );
}

export default FeedbackCard;