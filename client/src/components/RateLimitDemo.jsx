import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import './DemoCommon.css';

const RateLimitDemo = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [requests, setRequests] = useState([]);

  const handleSingleRequest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await axiosClient.get('/architecture/rate-limit');
      const newRequest = {
        number: requestCount + 1,
        status: result.status,
        data: result.data,
        timestamp: new Date().toISOString()
      };
      setRequests(prev => [...prev, newRequest]);
      setResponse(result.data);
      setRequestCount(prev => prev + 1);
    } catch (err) {
      const newRequest = {
        number: requestCount + 1,
        status: err.response?.status || 'Error',
        data: err.response?.data || { message: err.message },
        error: true,
        timestamp: new Date().toISOString()
      };
      setRequests(prev => [...prev, newRequest]);
      
      if (err.response?.status === 429) {
        setError('Rate limit exceeded! Too many requests.');
        setResponse(err.response.data);
      } else {
        setError(err.response?.data?.message || err.message || 'Request failed');
        if (err.response) {
          setResponse(err.response.data);
        }
      }
      setRequestCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleRequests = async (count = 10) => {
    setLoading(true);
    setError(null);
    setRequests([]);
    
    const newRequests = [];
    for (let i = 1; i <= count; i++) {
      try {
        const result = await axiosClient.get('/architecture/rate-limit');
        newRequests.push({
          number: i,
          status: result.status,
          data: result.data,
          timestamp: new Date().toISOString()
        });
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        newRequests.push({
          number: i,
          status: err.response?.status || 'Error',
          data: err.response?.data || { message: err.message },
          error: true,
          timestamp: new Date().toISOString()
        });
        if (err.response?.status === 429) {
          break; // Stop if rate limited
        }
      }
    }
    
    setRequests(newRequests);
    setRequestCount(count);
    setLoading(false);
    
    const rateLimited = newRequests.some(r => r.status === 429);
    if (rateLimited) {
      setError('Rate limit reached during multiple requests');
    }
  };

  const handleClear = () => {
    setRequests([]);
    setResponse(null);
    setError(null);
    setRequestCount(0);
  };

  return (
    <div className="demo-container">
      <div className="demo-card">
        <div className="demo-header">
          <h2>Rate Limiter Demo</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="demo-description">
          <p>This demo tests the rate limiting mechanism. Send requests to see how the rate limiter responds.</p>
          <p>Try sending multiple requests quickly to trigger rate limiting (429 Too Many Requests).</p>
        </div>

        <div className="demo-buttons">
          <button
            className="demo-button"
            onClick={handleSingleRequest}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Single Request'}
          </button>
          <button
            className="demo-button"
            onClick={() => handleMultipleRequests(10)}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send 10 Requests'}
          </button>
          <button
            className="demo-button secondary"
            onClick={handleClear}
            disabled={loading}
          >
            Clear Results
          </button>
        </div>

        {loading && (
          <div className="loading-indicator">
            Sending requests... ({requests.length} completed)
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {requests.length > 0 && (
          <div className="response-section">
            <h3>Request History ({requests.length} requests):</h3>
            {requests.map((req, index) => (
              <div key={index} className="response-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <strong>Request #{req.number}</strong>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      background: req.error || req.status === 429 ? '#dc3545' : '#28a745',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Status: {req.status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(req.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                {req.status === 429 && (
                  <div style={{
                    padding: '10px',
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    color: '#856404'
                  }}>
                    ⚠️ Rate Limit Exceeded
                  </div>
                )}
                <pre className="response-data">
                  {JSON.stringify(req.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}

        {response && requests.length === 0 && (
          <div className="response-section">
            <h3>Response:</h3>
            <div className="response-item">
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

export default RateLimitDemo;
