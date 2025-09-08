import React, { useState } from 'react';
import './Login-new-background.css';

const Login = ({ onRegisterClick, onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Direct fetch implementation
      const response = await fetch('https://car-rental-1-jo1o.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login successful:', data);

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Call the success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      // Reset form
      setLoginData({ email: '', password: '' });
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific error types
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check if the backend server is running.');
      } else if (error.name === 'TimeoutError') {
        setError('Login request timed out. The server may be busy or offline.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">Login to CarRental</h2>

        {error && (
          <div className="error-message" style={{
            color: 'red',
            marginBottom: '15px',
            padding: '10px',
            border: '1px solid red',
            borderRadius: '4px',
            backgroundColor: '#ffe6e6'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={loginData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-links">
          <a href="#forgot-password" className="forgot-link">
            Forgot Password?
          </a>
          <span className="register-text">
            Don't have an account? <a href="#register" className="register-link" onClick={onRegisterClick}>
              Register here
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
