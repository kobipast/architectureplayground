import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import './DemoCommon.css';

const OptimisticLockingDemo = ({ onBack }) => {
  const [orderId, setOrderId] = useState(null);
  const [loadedVersion, setLoadedVersion] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState([]);
  const [staleVersion, setStaleVersion] = useState(null);

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);
    setResponses([]);
    setCurrentOrder(null);

    try {
      const result = await axiosClient.post('/architecture/orders', { amount: 100 });
      const order = result.data?.data?.order || result.data?.order || result.data;
      const newOrderId = order.id;
      const newVersion = order.version || order.optimisticLockVersion || 0;
      
      setOrderId(newOrderId);
      setLoadedVersion(newVersion);
      setStaleVersion(null);
      setCurrentOrder(order);
      
      setResponses([{
        action: 'Create Order',
        status: result.status,
        data: result.data,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create order');
      if (err.response) {
        setResponses([{
          action: 'Create Order',
          status: err.response.status,
          data: err.response.data,
          error: true,
          timestamp: new Date().toISOString()
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadOrder = async () => {
    if (!orderId) {
      setError('Please create an order first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await axiosClient.get(`/architecture/orders/${orderId}`);
      const order = result.data?.data?.order || result.data?.order || result.data;
      const newVersion = order.version || order.optimisticLockVersion || 0;
      
      setLoadedVersion(newVersion);
      setCurrentOrder(order);
      
      setResponses(prev => [...prev, {
        action: 'Load Order',
        status: result.status,
        data: result.data,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load order');
      if (err.response) {
        setResponses(prev => [...prev, {
          action: 'Load Order',
          status: err.response.status,
          data: err.response.data,
          error: true,
          timestamp: new Date().toISOString()
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatusValid = async () => {
    if (!orderId || loadedVersion === null) {
      setError('Please create or load an order first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await axiosClient.patch(`/architecture/orders/${orderId}/status`, {
        status: 'CONFIRMED',
        version: loadedVersion
      });
      
      const order = result.data?.data?.order || result.data?.order || result.data;
      const newVersion = order.version || order.optimisticLockVersion || loadedVersion + 1;
      setLoadedVersion(newVersion);
      setCurrentOrder(order);
      
      setResponses(prev => [...prev, {
        action: 'Update Status (Valid Version)',
        status: result.status,
        data: result.data,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update order status');
      if (err.response) {
        setResponses(prev => [...prev, {
          action: 'Update Status (Valid Version)',
          status: err.response.status,
          data: err.response.data,
          error: true,
          timestamp: new Date().toISOString()
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatusStale = async () => {
    if (!orderId || loadedVersion === null) {
      setError('Please create or load an order first');
      return;
    }

    setLoading(true);
    setError(null);

    // Use a stale version (one less than current, or 0 if version is 1)
    const staleVer = staleVersion !== null ? staleVersion : (loadedVersion > 0 ? loadedVersion - 1 : 0);
    
    try {
      const result = await axiosClient.patch(`/architecture/orders/${orderId}/status`, {
        status: 'CONFIRMED',
        version: staleVer
      });
      
      // Should not reach here, but handle just in case
      setResponses(prev => [...prev, {
        action: 'Update Status (Stale Version)',
        status: result.status,
        data: result.data,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      if (err.response?.status === 409) {
        // Expected conflict
        setResponses(prev => [...prev, {
          action: 'Update Status (Stale Version)',
          status: err.response.status,
          data: err.response.data,
          error: true,
          isConflict: true,
          timestamp: new Date().toISOString()
        }]);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to update order status');
        if (err.response) {
          setResponses(prev => [...prev, {
            action: 'Update Status (Stale Version)',
            status: err.response.status,
            data: err.response.data,
            error: true,
            timestamp: new Date().toISOString()
          }]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOrderId(null);
    setLoadedVersion(null);
    setStaleVersion(null);
    setCurrentOrder(null);
    setResponses([]);
    setError(null);
  };

  return (
    <div className="demo-container">
      <div className="demo-card">
        <div className="demo-header">
          <h2>Optimistic Locking Demo</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="demo-description">
          <p>This demo demonstrates optimistic locking with version control.</p>
          <p>Create an order, then try updating with valid and stale versions to see how conflicts are handled.</p>
        </div>

        {orderId && (
          <div className="input-section" style={{ 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Order ID:</strong> {orderId}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Current Version:</strong> {loadedVersion !== null ? loadedVersion : 'N/A'}
            </div>
            {staleVersion !== null && (
              <div style={{ marginBottom: '8px', color: '#856404' }}>
                <strong>Stale Version (for testing):</strong> {staleVersion}
              </div>
            )}
            {currentOrder && (
              <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
                <strong>Order Status:</strong> {currentOrder.status || 'N/A'}
              </div>
            )}
          </div>
        )}

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
            onClick={handleLoadOrder}
            disabled={loading || !orderId}
          >
            Load Order
          </button>
          <button
            className="demo-button"
            onClick={handleUpdateStatusValid}
            disabled={loading || !orderId || loadedVersion === null}
          >
            Update Status (Valid Version)
          </button>
          <button
            className="demo-button"
            onClick={handleUpdateStatusStale}
            disabled={loading || !orderId || loadedVersion === null}
          >
            Update Status (Stale Version)
          </button>
          <button
            className="demo-button secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
        </div>

        {loading && <div className="loading-indicator">Loading...</div>}

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {responses.length > 0 && (
          <div className="response-section">
            <h3>Request History:</h3>
            {responses.map((response, index) => (
              <div key={index} className="response-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <strong>{response.action}</strong>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      background: response.isConflict 
                        ? '#dc3545' 
                        : response.error 
                        ? '#dc3545' 
                        : response.status === 200 || response.status === 201
                        ? '#28a745'
                        : '#ffc107',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Status: {response.status}
                    </span>
                    {response.isConflict && (
                      <span style={{
                        padding: '4px 12px',
                        background: '#fff3cd',
                        color: '#856404',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: '1px solid #ffc107'
                      }}>
                        ⚠️ 409 Conflict (Expected)
                      </span>
                    )}
                  </div>
                </div>
                {response.isConflict && response.data && (
                  <div style={{
                    padding: '10px',
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    marginBottom: '10px'
                  }}>
                    <strong>Problem Detail (409 Conflict):</strong>
                    <div style={{ marginTop: '8px' }}>
                      {response.data.title && <div><strong>Title:</strong> {response.data.title}</div>}
                      {response.data.detail && <div><strong>Detail:</strong> {response.data.detail}</div>}
                      {response.data.correlationId && <div><strong>Correlation ID:</strong> {response.data.correlationId}</div>}
                    </div>
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

export default OptimisticLockingDemo;
