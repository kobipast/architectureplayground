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
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
