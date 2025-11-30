// src/Login.jsx
import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, checkEmailExists } from './auth';
import { initializeDatabase } from './database';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'borrower',
    company: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize database when component loads
  useEffect(() => {
    initializeDatabase();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      let user;
      
      if (isLogin) {
        // LOGIN LOGIC
        user = loginUser(formData.email, formData.password);
        if (!user) {
          setError('Invalid email or password');
          setIsLoading(false);
          return;
        }
        setSuccess(`Welcome back, ${user.name}!`);
      } else {
        // REGISTRATION LOGIC
        // Check if email already exists
        if (checkEmailExists(formData.email)) {
          setError('Email already exists. Please use a different email or login.');
          setIsLoading(false);
          return;
        }

        // Validate required fields for registration
        if (!formData.name.trim()) {
          setError('Full name is required');
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 3) {
          setError('Password must be at least 3 characters long');
          setIsLoading(false);
          return;
        }

        // Create user data based on role
        const userData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        };

        // Add company field for lenders
        if (formData.role === 'lender' && formData.company) {
          userData.company = formData.company;
        }

        user = registerUser(userData);
        setSuccess(`Account created successfully! Welcome, ${user.name}`);
      }

      // Wait a moment to show success message, then login
      setTimeout(() => {
        onLogin(user);
      }, 1000);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'borrower',
      company: ''
    });
    setError('');
    setSuccess('');
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  // Quick login helpers for testing
  const quickLogin = (email, password) => {
    setFormData({
      ...formData,
      email,
      password
    });
    // Trigger form submission after a brief delay
    setTimeout(() => {
      document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '50px auto', 
      padding: '30px', 
      border: '1px solid #ddd', 
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', margin: '0', color: '#333' }}>💰 LoanPlatform</h1>
        <p style={{ color: '#666', margin: '10px 0 0 0' }}>
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </p>
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '5px',
          marginBottom: '20px',
          color: '#c33'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#efe', 
          border: '1px solid #cfc',
          borderRadius: '5px',
          marginBottom: '20px',
          color: '#363'
        }}>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Registration Fields */}
        {!isLogin && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Account Type *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="borrower">💰 Borrower</option>
                <option value="lender">🏦 Lender</option>
                <option value="analyst">📊 Financial Analyst</option>
              </select>
            </div>

            {formData.role === 'lender' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  placeholder="Enter your company name (optional)"
                  value={formData.company}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
          </>
        )}
        
        {/* Common Fields */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Password *
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          {!isLogin && (
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Password must be at least 3 characters long
            </small>
          )}
        </div>
        
        <button 
          type="submit"
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '15px', 
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={switchMode}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#007bff', 
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>

      {/* Quick Login for Testing */}
      <div style={{ 
        borderTop: '1px solid #eee', 
        paddingTop: '20px',
        marginTop: '20px'
      }}>
        <p style={{ textAlign: 'center', marginBottom: '15px', color: '#666', fontSize: '14px' }}>
          Quick Login (for testing):
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => quickLogin('borrower@test.com', '123')}
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #007bff',
              backgroundColor: '#f0f8ff',
              color: '#007bff',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            👤 Borrower
          </button>
          <button 
            onClick={() => quickLogin('lender@test.com', '123')}
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #28a745',
              backgroundColor: '#f0fff4',
              color: '#28a745',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🏦 Lender
          </button>
          <button 
            onClick={() => quickLogin('admin@test.com', '123')}
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #dc3545',
              backgroundColor: '#fff0f0',
              color: '#dc3545',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ⚙️ Admin
          </button>
          <button 
            onClick={() => quickLogin('analyst@test.com', '123')}
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #ffc107',
              backgroundColor: '#fffbf0',
              color: '#856404',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📊 Analyst
          </button>
        </div>
      </div>

      {/* Role Descriptions */}
      {!isLogin && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          fontSize: '13px'
        }}>
          <strong>Role Descriptions:</strong>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li><strong>Borrower:</strong> Apply for loans and manage repayments</li>
            <li><strong>Lender:</strong> Create loan offers and manage applications</li>
            <li><strong>Financial Analyst:</strong> View platform analytics and reports</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Login;