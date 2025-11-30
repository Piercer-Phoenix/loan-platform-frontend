// src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './Login.jsx';
import BorrowerDashboard from './BorrowerDashboard';
import LenderDashboard from './LenderDashboard';
import AdminDashboard from './AdminDashboard';
import AnalystDashboard from './AnalystDashboard';
import { getCurrentUser, logoutUser } from './auth';
import { initializeDatabase } from './database';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize database and check for existing login
    initializeDatabase();
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'borrower':
        return <BorrowerDashboard user={currentUser} onLogout={handleLogout} />;
      case 'lender':
        return <LenderDashboard user={currentUser} onLogout={handleLogout} />;
      case 'admin':
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      case 'analyst':
        return <AnalystDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <div>Unknown user role: {currentUser.role}</div>;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading LoanPlatform...
      </div>
    );
  }

  return (
    <div className="App">
      {currentUser ? (
        renderDashboard()
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;