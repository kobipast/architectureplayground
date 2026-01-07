import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import './IdempotencyDemo.css';

const IdempotencyDemo = ({ onBack }) => {
  const [idempotencyKey, setIdempotencyKey] = useState(crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState([]);

  const payload = { action: "charge", amount: 10 };

  const sendRequest = async (key) => {
    try {
      setError(null);
      const response = await axiosClient.post('/architecture/idempotency', payload, {
        headers: {
          'Idempotency-Key': key
        }
      });
      return response;
    } catch (err) {
      throw err;
    }
  };

  const handleSendTwice = async () => {
    setLoading(true);
    setError(null);
    setResponses([]);
    
    try {
      const response1 = await sendRequest(idempotencyKey);
      const response2 = await sendRequest(idempotencyKey);
      
      setResponses([
        { request: 'First request', data: response1.data, status: response1.status },
        { request: 'Second request', data: response2.data, status: response2.status }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
      console.error('Idempotency request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOnce = async () => {
    setLoading(true);
    setError(null);
    setResponses([]);
    
    try {
      const response = await sendRequest(idempotencyKey);
      setResponses([
        { request: 'Request', data: response.data, status: response.status }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
      console.error('Idempotency request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewKey = () => {
    setIdempotencyKey(crypto.randomUUID());
    setResponses([]);
    setError(null);
  };

  const handleSendConflict = async () => {
    setLoading(true);
    setError(null);
    setResponses([]);
    
    const conflictPayload = { action: "charge", amount: 11 };
    
    try {
      const response = await axiosClient.post('/architecture/idempotency', conflictPayload, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      // Should not reach here if conflict handling works correctly
      setResponses([
        { request: 'Conflict request', data: response.data, status: response.status }
      ]);
    } catch (err) {
      if (err.response?.status === 409) {
        // Display 409 Conflict as a response with ProblemDetail
        setResponses([
          { 
            request: 'Conflict request (409)', 
            data: err.response.data, 
            status: err.response.status 
          }
        ]);
      } else {
        setError(err.response?.data?.message || err.message || 'Request failed');
        console.error('Idempotency conflict request failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="idempotency-demo-container">
      <div className="idempotency-demo-card">
        <div className="demo-header">
          <h2>Idempotency Demo</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="current-key-section">
          <label>Current Idempotency Key:</label>
          <div className="key-display">{idempotencyKey}</div>
        </div>

        <div className="demo-buttons">
          <button
            className="demo-button"
            onClick={handleSendTwice}
            disabled={loading}
          >
            Send twice (same key)
          </button>
          <button
            className="demo-button"
            onClick={handleSendOnce}
            disabled={loading}
          >
            Send once (same key)
          </button>
          <button
            className="demo-button"
            onClick={handleSendConflict}
            disabled={loading}
          >
            Send conflict (same key, different body)
          </button>
          <button
            className="demo-button secondary"
            onClick={handleNewKey}
            disabled={loading}
          >
            New key
          </button>
        </div>

        {loading && (
          <div className="loading-indicator">Loading...</div>
        )}

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {responses.length > 0 && (
          <div className="responses-section">
            <h3>Responses:</h3>
            {responses.map((response, index) => (
              <div key={index} className="response-item">
                <div className="response-header">
                  <strong>{response.request}</strong>
                  <span className={`status-badge ${response.status === 409 ? 'status-error' : 'status-success'}`}>
                    Status: {response.status}
                  </span>
                </div>
                <pre className="response-data">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdempotencyDemo;
