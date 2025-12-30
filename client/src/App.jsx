import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import UsersList from './components/UsersList'
import UserForm from './components/UserForm'
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  const [showForm, setShowForm] = useState(false)
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
        <header className="App-header">
          <div className="header-top">
            <div>
              <h1>Microservices Architecture Playground</h1>
              <p>User Service Client</p>
            </div>
            <div className="user-info">
              <span className="welcome-text">Welcome, {user?.name || user?.email}</span>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
          
          <div className="card">
            <button onClick={() => setShowForm(showForm => !showForm)}>
              {showForm ? 'Hide Form' : 'Create New User'}
            </button>
          </div>

          {showForm && (
            <div className="form-container">
              <UserForm onSuccess={() => setShowForm(false)} />
            </div>
          )}

          <div className="users-container">
            <UsersList />
          </div>
        </header>
      </div>
    </ProtectedRoute>
  )
}

export default App

