import { useState } from 'react';
import authService from '../api/authService';
import './DemoCommon.css';

const RefreshTokenDemo = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [currentToken, setCurrentToken] = useState(localStorage.getItem('token'));

  const handleRefreshToken = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await authService.refreshToken();
      const newToken = result.data.token;
      localStorage.setItem('token', newToken);
      setCurrentToken(newToken);
      setResponse({
        success: true,
        token: newToken,
        message: 'Token refreshed successfully!'
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to refresh token');
      if (err.response) {
        setResponse({
          success: false,
          status: err.response.status,
          data: err.response.data
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowCurrentToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      alert(`Current JWT Token:\n\n${token}`);
      navigator.clipboard.writeText(token).then(() => {
        console.log('Token copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy token:', err);
      });
    } else {
      alert('No token found');
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-card">
        <div className="demo-header">
          <h2>Refresh Token Demo</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="demo-description">
          <p>This demo tests the refresh token mechanism. The refresh token is stored in an HTTP-only cookie.</p>
          <p>Click the button below to refresh your access token.</p>
        </div>

        <div className="input-section">
          <label>Current Token Status:</label>
          <div className="key-display">
            {currentToken ? 'Token exists in localStorage' : 'No token found'}
          </div>
          <button
            className="demo-button secondary"
            onClick={handleShowCurrentToken}
            disabled={loading || !currentToken}
          >
            View Current Token
          </button>
        </div>

        <div className="demo-buttons">
          <button
            className="demo-button"
            onClick={handleRefreshToken}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Token'}
          </button>
        </div>

        {loading && <div className="loading-indicator">Refreshing token...</div>}

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {response && (
          <div className="response-section">
            <h3>{response.success ? 'Success Response:' : 'Error Response:'}</h3>
            <div className="response-item">
              {response.success ? (
                <div>
                  <div className="detail-field">
                    <strong>Status:</strong> Success
                  </div>
                  <div className="detail-field">
                    <strong>Message:</strong> {response.message}
                  </div>
                  {response.token && (
                    <div className="detail-field">
                      <strong>New Token:</strong>
                      <div className="key-display" style={{ marginTop: '8px' }}>
                        {response.token}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {response.status && (
                    <div className="detail-field">
                      <strong>Status Code:</strong> {response.status}
                    </div>
                  )}
                </div>
              )}
              <h4>Full Response:</h4>
              <pre className="response-data">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefreshTokenDemo;
