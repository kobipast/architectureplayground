import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import IdempotencyDemo from './IdempotencyDemo';
import CorrelationDemo from './CorrelationDemo';
import ProblemDetailsDemo from './ProblemDetailsDemo';
import RBACDemo from './RBACDemo';
import RefreshTokenDemo from './RefreshTokenDemo';
import RateLimitDemo from './RateLimitDemo';
import CachingDemo from './CachingDemo';
import './MainDashboard.css';

const MainDashboard = () => {
  const [showIdempotencyDemo, setShowIdempotencyDemo] = useState(false);
  const [showCorrelationDemo, setShowCorrelationDemo] = useState(false);
  const [showProblemDetailsDemo, setShowProblemDetailsDemo] = useState(false);
  const [showRBACDemo, setShowRBACDemo] = useState(false);
  const [showRefreshTokenDemo, setShowRefreshTokenDemo] = useState(false);
  const [showRateLimitDemo, setShowRateLimitDemo] = useState(false);
  const [showCachingDemo, setShowCachingDemo] = useState(false);

  const handleShowJWT = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Show token in alert and copy to clipboard
      alert(`JWT Token:\n\n${token}`);
      navigator.clipboard.writeText(token).then(() => {
        console.log('Token copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy token:', err);
      });
    } else {
      alert('No token found');
    }
  };

  if (showIdempotencyDemo) {
    return <IdempotencyDemo onBack={() => setShowIdempotencyDemo(false)} />;
  }

  if (showCorrelationDemo) {
    return <CorrelationDemo onBack={() => setShowCorrelationDemo(false)} />;
  }

  if (showProblemDetailsDemo) {
    return <ProblemDetailsDemo onBack={() => setShowProblemDetailsDemo(false)} />;
  }

  if (showRBACDemo) {
    return <RBACDemo onBack={() => setShowRBACDemo(false)} />;
  }

  if (showRefreshTokenDemo) {
    return <RefreshTokenDemo onBack={() => setShowRefreshTokenDemo(false)} />;
  }

  if (showRateLimitDemo) {
    return <RateLimitDemo onBack={() => setShowRateLimitDemo(false)} />;
  }

  if (showCachingDemo) {
    return <CachingDemo onBack={() => setShowCachingDemo(false)} />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Microservices Architecture Playground</h2>
        <div className="buttons-container">
        <button 
            className="dashboard-button" 
            onClick={() => setShowProblemDetailsDemo(true)}
          >
            Problem Details
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => setShowCorrelationDemo(true)}
          >
            Correlation ID
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => setShowRBACDemo(true)}
          >
            RBAC
          </button>
          <button 
            className="dashboard-button" 
            onClick={handleShowJWT}
          >
            Show JWT Token
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => setShowRefreshTokenDemo(true)}
          >
            Refresh Token
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => setShowRateLimitDemo(true)}
          >
            Rate Limiter
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => setShowIdempotencyDemo(true)}
          >
            Idempotency
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => setShowCachingDemo(true)}
          >
            Caching
          </button>        
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
