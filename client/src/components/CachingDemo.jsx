import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import './DemoCommon.css';

const CachingDemo = ({ onBack }) => {
  const [userId, setUserId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState([]);
  const [evictResponse, setEvictResponse] = useState(null);

  const fetchProfile = async (userIdParam) => {
    const startTime = performance.now();
    try {
      const result = await axiosClient.get(`/architecture/cache/profile?userId=${userIdParam}`);
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      return { success: true, data: result.data, duration, status: result.status };
    } catch (err) {
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      return {
        success: false,
        data: err.response?.data || { message: err.message },
        duration,
        status: err.response?.status || 'Error'
      };
    }
  };

  const handleFetchProfile = async () => {
    setLoading(true);
    setError(null);
    setResponses([]);
    setEvictResponse(null);

    const result = await fetchProfile(userId);
    setResponses([{
      request: 'Single request',
      ...result,
      timestamp: new Date().toISOString()
    }]);
    setLoading(false);
  };

  const handleFetchTwice = async () => {
    setLoading(true);
    setError(null);
    setResponses([]);
    setEvictResponse(null);

    const firstResult = await fetchProfile(userId);
    const secondResult = await fetchProfile(userId);

    setResponses([
      {
        request: 'First request',
        ...firstResult,
        timestamp: new Date().toISOString()
      },
      {
        request: 'Second request',
        ...secondResult,
        timestamp: new Date().toISOString()
      }
    ]);
    setLoading(false);
  };

  const handleEvictCache = async () => {
    setLoading(true);
    setError(null);
    setEvictResponse(null);

    try {
      const result = await axiosClient.post(`/architecture/cache/evict?userId=${userId}`);
      setEvictResponse({
        success: true,
        data: result.data,
        status: result.status
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to evict cache');
      setEvictResponse({
        success: false,
        data: err.response?.data || { message: err.message },
        status: err.response?.status || 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setResponses([]);
    setEvictResponse(null);
    setError(null);
  };

  return (
    <div className="demo-container">
      <div className="demo-card">
        <div className="demo-header">
          <h2>Caching Demo</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="demo-description">
          <p>This demo demonstrates caching behavior. Fetch profile data and observe response times.</p>
          <p>First request should be slower (cache miss), second request with same userId should be faster (cache hit).</p>
        </div>

        <div className="input-section">
          <label htmlFor="userId">User ID:</label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="key-display"
            style={{ fontFamily: 'inherit', padding: '12px', width: '200px', marginBottom: '10px' }}
            disabled={loading}
          />
        </div>

        <div className="demo-buttons">
          <button
            className="demo-button"
            onClick={handleFetchProfile}
            disabled={loading || !userId}
          >
            Fetch profile
          </button>
          <button
            className="demo-button"
            onClick={handleFetchTwice}
            disabled={loading || !userId}
          >
            Fetch twice (same userId)
          </button>
          <button
            className="demo-button"
            onClick={handleEvictCache}
            disabled={loading || !userId}
          >
            Evict cache
          </button>
          <button
            className="demo-button secondary"
            onClick={handleClearResults}
            disabled={loading}
          >
            Clear Results
          </button>
        </div>

        {loading && <div className="loading-indicator">Loading...</div>}

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {evictResponse && (
          <div className="response-section">
            <h3>Evict Cache Response:</h3>
            <div className="response-item">
              <div className="detail-field" style={{
                background: evictResponse.success ? '#d4edda' : '#f8d7da',
                borderLeftColor: evictResponse.success ? '#28a745' : '#dc3545'
              }}>
                <strong>Status:</strong> {evictResponse.status}
              </div>
              <pre className="response-data">
                {JSON.stringify(evictResponse.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {responses.length > 0 && (
          <div className="response-section">
            <h3>Profile Fetch Results:</h3>
            {responses.map((response, index) => (
              <div key={index} className="response-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <strong>{response.request}</strong>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{
                      padding: '6px 14px',
                      background: response.success ? '#28a745' : '#dc3545',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Status: {response.status}
                    </span>
                    <span style={{
                      padding: '6px 14px',
                      background: '#007bff',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Duration: {response.duration} ms
                    </span>
                  </div>
                </div>
                {index > 0 && responses[index - 1].success && response.success && (
                  <div style={{
                    padding: '8px',
                    background: parseFloat(response.duration) < parseFloat(responses[index - 1].duration) * 0.8
                      ? '#d1ecf1'
                      : '#fff3cd',
                    border: `1px solid ${parseFloat(response.duration) < parseFloat(responses[index - 1].duration) * 0.8 ? '#bee5eb' : '#ffeaa7'}`,
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '13px'
                  }}>
                    {parseFloat(response.duration) < parseFloat(responses[index - 1].duration) * 0.8
                      ? '✅ Cache hit detected (significantly faster)'
                      : '⚠️ Similar duration (may be cache miss or fast DB query)'}
                  </div>
                )}
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

export default CachingDemo;
