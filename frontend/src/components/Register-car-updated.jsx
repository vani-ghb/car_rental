import React, { useState } from 'react';
import './Register-final-car.css';

const Register = ({ onLoginClick }) => {
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = registerData;

      // Direct fetch implementation
      const response = await fetch('https://car-rental-1-jo1o.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('Registration successful:', data);

      // Store token if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setSuccess('Registration successful! You can now login.');

      // Reset form
      setRegisterData({
        name: '',
        phone: '',
        email: '',
        location: '',
        password: '',
        confirmPassword: ''
      });

      // Optionally redirect to login after a delay
      setTimeout(() => {
        if (onLoginClick) {
          onLoginClick();
        }
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);

      // Handle specific error types
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check if the backend server is running.');
      } else if (error.name === 'TimeoutError') {
        setError('Registration request timed out. The server may be busy or offline.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2 className="register-title">Create Account</h2>

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

        {success && (
          <div className="success-message" style={{
            color: 'green',
            marginBottom: '15px',
            padding: '10px',
            border: '1px solid green',
            borderRadius: '4px',
            backgroundColor: '#e6ffe6'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={registerData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={registerData.phone}
              onChange={handleInputChange}
              required
              placeholder="Enter your phone number"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={registerData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={registerData.location}
              onChange={handleInputChange}
              required
              placeholder="Enter your location"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={registerData.password}
              onChange={handleInputChange}
              required
              placeholder="Create a password (min 6 characters)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={registerData.confirmPassword}
              onChange={handleInputChange}
              required
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="register-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="register-links">
          <span className="login-text">
            Already have an account? <a href="#login" className="login-link" onClick={onLoginClick}>
              Login here
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

