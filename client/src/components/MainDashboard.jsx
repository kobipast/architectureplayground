import { useState } from 'react';
import authService from '../api/authService';
import axiosClient from '../api/axiosClient';
import IdempotencyDemo from './IdempotencyDemo';
import CorrelationDemo from './CorrelationDemo';
import ProblemDetailsDemo from './ProblemDetailsDemo';
import RBACDemo from './RBACDemo';
import './MainDashboard.css';

const MainDashboard = () => {
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [rateLimitLoading, setRateLimitLoading] = useState(false);
  const [showIdempotencyDemo, setShowIdempotencyDemo] = useState(false);
  const [showCorrelationDemo, setShowCorrelationDemo] = useState(false);
  const [showProblemDetailsDemo, setShowProblemDetailsDemo] = useState(false);
  const [showRBACDemo, setShowRBACDemo] = useState(false);

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

  const handleRefreshToken = async () => {
    setRefreshLoading(true);
    try {
      const response = await authService.refreshToken();
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      alert('Token refreshed successfully!');
      console.log('New token:', newToken);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      alert(`Failed to refresh token: ${error.response?.data?.message || error.message}`);
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleRateLimit = async () => {
    setRateLimitLoading(true);
    try {
      const response = await axiosClient.get('/architecture/rate-limit');
      alert(`Rate limit test successful!\n\nResponse: ${JSON.stringify(response.data, null, 2)}`);
      console.log('Rate limit response:', response.data);
    } catch (error) {
      console.error('Rate limit request failed:', error);
      if (error.response?.status === 429) {
        alert('Rate limit exceeded! Too many requests.');
      } else {
        alert(`Rate limit test failed: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setRateLimitLoading(false);
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
            onClick={handleRefreshToken}
            disabled={refreshLoading}
          >
            {refreshLoading ? 'Refreshing...' : 'Refresh Token'}
          </button>
          <button 
            className="dashboard-button" 
            onClick={handleRateLimit}
            disabled={rateLimitLoading}
          >
            {rateLimitLoading ? 'Testing...' : 'Test Rate Limiter'}
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => setShowIdempotencyDemo(true)}
          >
            Idempotency
          </button>        
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
