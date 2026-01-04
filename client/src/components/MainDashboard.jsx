import './MainDashboard.css';

const MainDashboard = () => {
  const handleOverloadServer = () => {
    // TODO: Implement overload the server
    console.log('overload the server clicked');
  };

  const handleRequestWithoutPermission = () => {
    // TODO: Implement request without permission
    console.log('request without permission clicked');
  };

  const handleTestCircuitBreaker = () => {
    // TODO: Implement test circuit breaker
    console.log('test circuit breaker clicked');
  };

  const handleShowJWT = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Show token in alert and copy to clipboard
      alert(`JWT Token:\n\n${token}`);
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
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Microservices Architecture Playground</h2>
        <div className="buttons-container">
          <button 
            className="dashboard-button" 
            onClick={handleOverloadServer}
          >
            overload the server
          </button>
          <button 
            className="dashboard-button" 
            onClick={handleRequestWithoutPermission}
          >
            request without permission
          </button>
          <button 
            className="dashboard-button" 
            onClick={handleTestCircuitBreaker}
          >
            test circuite-breaker
          </button>
          <button 
            className="dashboard-button" 
            onClick={handleShowJWT}
          >
            Show JWT Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
