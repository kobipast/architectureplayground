import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import './DemoCommon.css';

const RetryDemo = ({ onBack }) => {
  const [amount, setAmount] = useState('100');
  const [orderId, setOrderId] = useState(null);
  const [attempts, setAttempts] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createResponse, setCreateResponse] = useState(null);
  const [retryResults, setRetryResults] = useState([]);
  const [lastSuccessResponse, setLastSuccessResponse] = useState(null);

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);
    setCreateResponse(null);
    setRetryResults([]);
    setLastSuccessResponse(null);

    try {
      const result = await axiosClient.post('/architecture/orders', { amount: parseInt(amount) });
      const order = result.data?.data?.order || result.data?.order || result.data;
      const newOrderId = order.id || result.data?.id;
      
      setOrderId(newOrderId);
      setCreateResponse({
        status: result.status,
        data: result.data
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create order');
      setCreateResponse({
        status: err.response?.status || 'Error',
        data: err.response?.data || { message: err.message },
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerRetry = async (retry = true) => {
    if (!orderId) {
      setError('Please create an order first');
      return;
    }

    const numAttempts = parseInt(attempts) || 5;
    setLoading(true);
    setError(null);
    setRetryResults([]);
    setLastSuccessResponse(null);

    const results = [];

    for (let i = 1; i <= numAttempts; i++) {
      const startTime = performance.now();
      try {
        console.log('we are going to call the order service');
        const result = await axiosClient.get(`/architecture/orders/${orderId}`,{params: retry ? {} : { retry: false }});
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        const callResult = {
          index: i,
          status: result.status,
          durationMs: parseFloat(duration),
          success: true,
          data: result.data,
          timestamp: new Date().toISOString()
        };
        
        results.push(callResult);
        setLastSuccessResponse(result.data);
        setRetryResults([...results]);
      } catch (err) {
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        const callResult = {
          index: i,
          status: err.response?.status || 'Error',
          durationMs: parseFloat(duration),
          success: false,
          error: err.response?.data || { message: err.message },
          timestamp: new Date().toISOString()
        };

        console.log('error response data', err.response?.data);
        console.log('error message', err.message);
        
        results.push(callResult);
        setRetryResults([...results]);
        
        // Don't break on error, continue with next attempt
      }
    }

    setLoading(false);
  };

  const handleReset = () => {
    setOrderId(null);
    setCreateResponse(null);
    setRetryResults([]);
    setLastSuccessResponse(null);
    setError(null);
  };

  const averageDuration = retryResults.length > 0
    ? (retryResults.reduce((sum, r) => sum + r.durationMs, 0) / retryResults.length).toFixed(2)
    : null;

  return (
    <div className="demo-container">
      <div className="demo-card">
        <div className="demo-header">
          <h2>Retry (Backoff) Demo</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="demo-description">
          <p>This demo demonstrates retry and backoff behavior when calling the order service.</p>
          <p>When the service is DOWN, each call will take longer due to retries/backoff. When UP, calls succeed quickly.</p>
        </div>

        <div className="input-section">
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Amount:
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                padding: '8px',
                width: '150px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              disabled={loading}
            />
          </div>

          {orderId && (
            <div style={{ marginBottom: '15px', padding: '10px', background: '#e7f3ff', borderRadius: '5px', border: '1px solid #b3d9ff' }}>
              <strong>Order ID:</strong> {orderId}
            </div>
          )}

          <div>
            <label htmlFor="attempts" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Number of Attempts:
            </label>
            <input
              id="attempts"
              type="number"
              value={attempts}
              onChange={(e) => setAttempts(e.target.value)}
              min="1"
              max="20"
              style={{
                padding: '8px',
                width: '150px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              disabled={loading || !orderId}
            />
          </div>
        </div>

        <div className="demo-buttons">
          <button
            className="demo-button"
            onClick={handleCreateOrder}
            disabled={loading}
          >
            Create Order
          </button>
          <button
            className="demo-button"
            onClick={handleTriggerRetry}
            disabled={loading || !orderId}
          >
            GET with Retry
          </button>
          <button
            className="demo-button"
            onClick={() => handleTriggerRetry(false)}
            disabled={loading || !orderId}
          >
            Flat GET Order
          </button>
          <button
            className="demo-button secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
        </div>

        {loading && (
          <div className="loading-indicator">
            {retryResults.length > 0 
              ? `Processing... (${retryResults.length}/${attempts} calls completed)`
              : 'Loading...'}
          </div>
        )}

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {createResponse && (
          <div className="response-section">
            <h3>Create Order Response:</h3>
            <div className="response-item">
              <div style={{
                padding: '8px 12px',
                background: createResponse.error ? '#dc3545' : '#28a745',
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-block',
                marginBottom: '10px'
              }}>
                Status: {createResponse.status}
              </div>
              <pre className="response-data">
                {JSON.stringify(createResponse.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {retryResults.length > 0 && (
          <div className="response-section">
            <h3>Retry Results ({retryResults.length} calls):</h3>
            {averageDuration && (
              <div style={{
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '5px',
                marginBottom: '15px',
                border: '1px solid #dee2e6'
              }}>
                <strong>Average Duration:</strong> {averageDuration} ms
              </div>
            )}
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
                background: 'white',
                border: '1px solid #dee2e6'
              }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6', fontWeight: '600' }}>
                      Call Index
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6', fontWeight: '600' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6', fontWeight: '600' }}>
                      Duration (ms)
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6', fontWeight: '600' }}>
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {retryResults.map((result, index) => (
                    <tr key={index} style={{
                      background: result.success ? '#d4edda' : '#f8d7da'
                    }}>
                      <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                        {result.index}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                        <span style={{
                          padding: '4px 10px',
                          background: result.success ? '#28a745' : '#dc3545',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {result.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #dee2e6', fontFamily: 'monospace', fontWeight: '500' }}>
                        {result.durationMs.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                        {result.success ? '✓ Success' : '✗ Error'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {lastSuccessResponse && (
          <div className="response-section">
            <h3>Last Success Response:</h3>
            <div className="response-item">
              <pre className="response-data">
                {JSON.stringify(lastSuccessResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetryDemo;
