import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be handled by App.jsx to show login
  }

  return children;
};

export default ProtectedRoute;

