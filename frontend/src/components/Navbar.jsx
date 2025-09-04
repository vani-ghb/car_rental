import React from 'react';
import './Navbar.css';

const Navbar = ({ onLoginClick, onRegisterClick, onAboutClick, onBookingClick, currentView }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <div className="logo-emoji">🚗</div>
          <span className="logo-text">CarRental</span>
        </div>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <button className="navbar-link" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Home</button>
          </li>
          <li className="navbar-item">
          <button className={`navbar-link ${currentView === 'about' ? 'active' : ''}`} onClick={onAboutClick}>About</button>
          </li>
          <li className="navbar-item">
            <button className={`navbar-link ${currentView === 'booking' ? 'active' : ''}`} onClick={onBookingClick}>Car Booking</button>
          </li>
          <li className="navbar-item">
            <button className="navbar-link" onClick={() => window.scrollTo({top: document.getElementById('cars')?.offsetTop || 0, behavior: 'smooth'})}>List of Cars</button>
          </li>
        </ul>

        <div className="navbar-auth-buttons">
          <button className="login-button" onClick={onLoginClick}>Login</button>
          <button className="register-button" onClick={onRegisterClick}>Register</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
