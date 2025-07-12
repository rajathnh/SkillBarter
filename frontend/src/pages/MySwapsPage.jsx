// src/pages/MySwapsPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import './MySwapsPage.css';
import { Link, useNavigate } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal';

function MySwapsPage() {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSwapId, setSelectedSwapId] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('skillSwapUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        navigate('/login');
      }
    } catch {
      localStorage.removeItem('skillSwapUser');
      navigate('/login');
    }
  }, [navigate]);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/swaps');
      const sortedSwaps = data.swaps.sort((a, b) => {
        const statusOrder = { 'pending': 1, 'accepted': 2, 'completed': 3, 'rejected': 4, 'cancelled': 5 };
        if (statusOrder[a.status] < statusOrder[b.status]) return -1;
        if (statusOrder[a.status] > statusOrder[b.status]) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setSwaps(sortedSwaps);
    } catch (err) {
      setError('Failed to fetch your swap requests.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      fetchSwaps();
    }
  }, [currentUser]);

  const handleUpdateStatus = async (swapId, status) => {
    const confirmMessages = {
      cancelled: 'Are you sure you want to cancel this request?',
      completed: 'Have you completed this skill swap? This action cannot be undone.'
    };
    if (confirmMessages[status] && !window.confirm(confirmMessages[status])) {
      return;
    }
    try {
      await api.patch(`/swaps/${swapId}`, { status });
      fetchSwaps();
    } catch (err) {
      alert(`Error updating status: ${err.response?.data?.msg || 'Please try again.'}`);
    }
  };

  const handleOpenFeedbackModal = (swapId) => {
    setSelectedSwapId(swapId);
    setShowFeedbackModal(true);
  };
  
  const handleFeedbackSuccess = () => {
    fetchSwaps();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading || !currentUser) {
      return <div className="loading-spinner" style={{color: 'white', textAlign: 'center', padding: '2rem'}}>Loading...</div>;
  }
  
  if (error) {
      return <div className="error-message" style={{color: 'red', textAlign: 'center', padding: '2rem'}}>{error}</div>;
  }

  return (
    <div className="my-swaps-page">
      <h1>My Swap Requests</h1>
      
      <div className="swaps-list">
        {swaps.length === 0 ? (
          <p className="no-swaps-message">You have no active or past swap requests.</p>
        ) : (
          swaps.map(swap => {
            // --- THIS IS THE ULTIMATE BULLETPROOF FIX ---
            // Before trying to render, we check if all necessary data exists.
            if (!swap || !swap.requester || !swap.receiver || !swap.skillOffered || !swap.skillWanted) {
              console.warn("A swap object is missing data and will not be rendered. Swap ID:", swap?._id);
              return null; // This prevents the entire page from crashing.
            }
            
            const currentUserId = currentUser.userId;
            const isReceiver = swap.receiver._id === currentUserId;
            const otherUser = isReceiver ? swap.requester : swap.receiver;
            const myOfferedSkill = isReceiver ? swap.skillWanted : swap.skillOffered;
            const myReceivedSkill = isReceiver ? swap.skillOffered : swap.skillWanted;

            return (
              <div key={swap._id} className={`swap-card ${getStatusClass(swap.status)}`}>
                <div className="swap-info">
                  <div className="swap-user">
                    <p>
                      {isReceiver ? 'Request from: ' : 'Request to: '}
                      <Link to={`/users/${otherUser._id}`}>{otherUser.name}</Link>
                    </p>
                  </div>
                  <div className="swap-details">
                    <p><strong>You Offer:</strong> {myOfferedSkill.name}</p>
                    <p><strong>You Get:</strong> {myReceivedSkill.name}</p>
                  </div>
                </div>

                <div className="swap-status-section">
                  <div className={`status-badge ${getStatusClass(swap.status)}`}>
                    {swap.status}
                  </div>
                  
                  {swap.status === 'pending' && (
                    <div className="action-buttons">
                      {isReceiver ? (
                        <>
                          <button onClick={() => handleUpdateStatus(swap._id, 'accepted')} className="btn-accept">Accept</button>
                          <button onClick={() => handleUpdateStatus(swap._id, 'rejected')} className="btn-reject">Reject</button>
                        </>
                      ) : (
                        <button onClick={() => handleUpdateStatus(swap._id, 'cancelled')} className="btn-cancel">Cancel Request</button>
                      )}
                    </div>
                  )}

                  {swap.status === 'accepted' && (
                    <div className="action-buttons">
                       <button onClick={() => handleUpdateStatus(swap._id, 'completed')} className="btn-complete">Mark as Complete</button>
                    </div>
                  )}
                  
                  {swap.status === 'completed' && (
                     <div className="action-buttons">
                        <button onClick={() => handleOpenFeedbackModal(swap._id)} className="btn-feedback">Leave Feedback</button>
                     </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <FeedbackModal 
        show={showFeedbackModal}
        handleClose={() => setShowFeedbackModal(false)}
        swapId={selectedSwapId}
        onFeedbackSuccess={handleFeedbackSuccess}
      />
    </div>
  );
}

export default MySwapsPage;