import { useState } from 'react'
import UsersList from './components/UsersList'
import UserForm from './components/UserForm'
import './App.css'

function App() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Microservices Architecture Playground</h1>
        <p>User Service Client</p>
        
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
  )
}

export default App

