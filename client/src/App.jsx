import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import MainDashboard from './components/MainDashboard'
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  const [showRegister, setShowRegister] = useState(false)
  const { isAuthenticated, user, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    )
  }

  return (
    <ProtectedRoute>
      <div className="App">
        <div className="user-info-bar">
          <span className="welcome-text">Welcome, {user?.name || user?.email}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
        <header className="App-header">
          <h1>Microservices Architecture Playground</h1>
          <MainDashboard />
        </header>
      </div>
    </ProtectedRoute>
  )
}

export default App

