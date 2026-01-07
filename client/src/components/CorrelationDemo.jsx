import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import './DemoCommon.css';

const CorrelationDemo = ({ onBack }) => {
  const [correlationId, setCorrelationId] = useState(crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleCallWithCorrelationId = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await axiosClient.get('/architecture/trace', {
        headers: {
          'X-Correlation-Id': correlationId
        }
      });
      setResponse(result.data);
    } catch (err) {
      setError(err.response?.data || { message: err.message });
      if (err.response) {
        setResponse(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCallWithoutCorrelationId = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await axiosClient.get('/architecture/trace');
      setResponse(result.data);
    } catch (err) {
      setError(err.response?.data || { message: err.message });
      if (err.response) {
        setResponse(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewCorrelationId = () => {
    setCorrelationId(crypto.randomUUID());
    setResponse(null);
    setError(null);
  };

  return (
    <div className="demo-container">
      <div className="demo-card">
        <div className="demo-header">
          <h2>Correlation ID Demo</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="input-section">
          <label>Correlation ID:</label>
          <div className="key-display">{correlationId}</div>
          <button
            className="demo-button secondary"
            onClick={handleNewCorrelationId}
            disabled={loading}
          >
            Generate New ID
          </button>
        </div>

        <div className="demo-buttons">
          <button
            className="demo-button"
            onClick={handleCallWithCorrelationId}
            disabled={loading}
          >
            Call trace with Correlation ID
          </button>
          <button
            className="demo-button"
            onClick={handleCallWithoutCorrelationId}
            disabled={loading}
          >
            Call trace without Correlation ID
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
            <h3>Response:</h3>
            <div className="response-item">
              <pre className="response-data">
                {JSON.stringify(response, null, 2)}
              </pre>
              {response.correlationId && (
                <div className="correlation-info">
                  <strong>Correlation ID from response:</strong> {response.correlationId}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrelationDemo;
