import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import './DemoCommon.css';

const ProblemDetailsDemo = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [problemDetail, setProblemDetail] = useState(null);

  const handleTriggerValidationError = async () => {
    setLoading(true);
    setError(null);
    setProblemDetail(null);

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
          <p>This demo triggers a validation error to demonstrate Problem Details (RFC 7807) format.</p>
          <p>The payload sent: <code>{'{"name": "", "email": "nope"}'}</code></p>
        </div>

        <div className="demo-buttons">
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
