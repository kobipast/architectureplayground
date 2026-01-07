import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosClient from '../api/axiosClient';
import './DemoCommon.css';

const RBACDemo = ({ onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [problemDetail, setProblemDetail] = useState(null);

  const handleCallAdminOnly = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setProblemDetail(null);

    try {
      const result = await axiosClient.get('/architecture/admin');
      setResponse(result.data);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 403) {
          setProblemDetail(err.response.data);
        } else {
          setError(err.response.data || { message: err.message });
        }
      } else {
        setError({ message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-card">
        <div className="demo-header">
          <h2>RBAC Demo</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        {user && (
          <div className="user-info-section">
            <h3>Current User:</h3>
            <div className="user-details">
              <div><strong>Name:</strong> {user.name || 'N/A'}</div>
              <div><strong>Email:</strong> {user.email || 'N/A'}</div>
              {user.role && <div><strong>Role:</strong> {user.role}</div>}
            </div>
          </div>
        )}

        <div className="demo-description">
          <p>This endpoint requires admin role. If you don't have admin permissions, you'll receive a 403 Forbidden with Problem Detail.</p>
        </div>

        <div className="demo-buttons">
          <button
            className="demo-button"
            onClick={handleCallAdminOnly}
            disabled={loading}
          >
            Call admin-only
          </button>
        </div>

        {loading && <div className="loading-indicator">Loading...</div>}

        {error && (
          <div className="error-message">
            Error: {JSON.stringify(error, null, 2)}
          </div>
        )}

        {response && (
          <div className="response-section">
            <h3>Success Response:</h3>
            <div className="response-item">
              <pre className="response-data">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {problemDetail && (
          <div className="response-section">
            <h3>403 Forbidden - Problem Detail:</h3>
            <div className="response-item">
              <div className="problem-detail-fields">
                {problemDetail.status && (
                  <div className="detail-field">
                    <strong>Status:</strong> {problemDetail.status}
                  </div>
                )}
                {problemDetail.title && (
                  <div className="detail-field">
                    <strong>Title:</strong> {problemDetail.title}
                  </div>
                )}
                {problemDetail.detail && (
                  <div className="detail-field">
                    <strong>Detail:</strong> {problemDetail.detail}
                  </div>
                )}
                {problemDetail.correlationId && (
                  <div className="detail-field">
                    <strong>Correlation ID:</strong> {problemDetail.correlationId}
                  </div>
                )}
              </div>
              <h4>Full JSON:</h4>
              <pre className="response-data">
                {JSON.stringify(problemDetail, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RBACDemo;
