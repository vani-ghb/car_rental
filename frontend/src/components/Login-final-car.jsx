import React, { useState } from 'react';
import { authAPI } from '../services/api';
import './Login-final-car.css';

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
        alert('Login successful');
    const response = await authAPI.login(loginData.email, loginData.password);
    
    // Show alert for successful login


    // Call the success callback if provided
    if (onLoginSuccess) {
      onLoginSuccess(response.user);
    }

    // Navigate to homepage
    window.location.href = '/'; // replace '/' with your homepage route if different

    // Reset form
    setLoginData({ email: '', password: '' });
  } catch (error) {
    console.error('Login error:', error);
    setError(error.message || 'Login failed. Please try again.');
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
