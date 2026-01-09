import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosClient from '../api/axiosClient';
import './DemoCommon.css';

const ProblemDetailsDemo = ({ onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [problemDetail, setProblemDetail] = useState(null);
  const [successResponse, setSuccessResponse] = useState(null);

  const handleTriggerValidationError = async () => {
    setLoading(true);
    setError(null);
    setProblemDetail(null);
    setSuccessResponse(null);

    const invalidPayload = {
      name: "",
      email: "nope"
    };

    try {
      await axiosClient.post('/architecture/validation', invalidPayload);
    } catch (err) {
      if (err.response) {
        setProblemDetail(err.response.data);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValidScenario = async () => {
    setLoading(true);
    setError(null);
    setProblemDetail(null);
    setSuccessResponse(null);

    const validPayload = {
      name: user?.name || "",
      email: user?.email || ""
    };

    try {
      const result = await axiosClient.post('/architecture/validation', validPayload);
      setSuccessResponse(result.data);
    } catch (err) {
      if (err.response) {
        setProblemDetail(err.response.data);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-card">
        <div className="demo-header">
          <h2>Problem Details Demo</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="demo-description">
          <p>This demo demonstrates Problem Details (RFC 7807) format for both valid and invalid scenarios.</p>
          <p>Invalid payload: <code>{'{"name": "", "email": "nope"}'}</code></p>
          {user && (
            <p>Valid payload: <code>{`{"name": "${user.name || ''}", "email": "${user.email || ''}"}`}</code></p>
          )}
        </div>

        <div className="demo-buttons">
          <button
            className="demo-button"
            onClick={handleValidScenario}
            disabled={loading || !user}
          >
            Send valid request
          </button>
          <button
            className="demo-button"
            onClick={handleTriggerValidationError}
            disabled={loading}
          >
            Trigger validation error
          </button>
        </div>

        {loading && <div className="loading-indicator">Loading...</div>}

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {successResponse && (
          <div className="response-section">
            <h3>Success Response:</h3>
            <div className="response-item">
              <div className="detail-field" style={{ background: '#d4edda', borderLeftColor: '#28a745' }}>
                <strong>Status:</strong> Success (200 OK)
              </div>
              <h4>Response Data:</h4>
              <pre className="response-data">
                {JSON.stringify(successResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {problemDetail && (
          <div className="response-section">
            <h3>Problem Detail Response:</h3>
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
                {problemDetail.type && (
                  <div className="detail-field">
                    <strong>Type:</strong> {problemDetail.type}
                  </div>
                )}
                {problemDetail.instance && (
                  <div className="detail-field">
                    <strong>Instance:</strong> {problemDetail.instance}
                  </div>
                )}
                {problemDetail.correlationId && (
                  <div className="detail-field">
                    <strong>Correlation ID:</strong> {problemDetail.correlationId}
                  </div>
                )}
                {problemDetail.errors && (
                  <div className="detail-field">
                    <strong>Errors:</strong>
                    <pre className="errors-data">
                      {JSON.stringify(problemDetail.errors, null, 2)}
                    </pre>
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

export default ProblemDetailsDemo;
