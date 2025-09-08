import React, { useState } from 'react';
import Booking from './Booking';
import './Navbar.css';
import './BookingModal.css';

const Navbar = ({ onLoginClick, onRegisterClick, onAboutClick, onBookingClick, currentView }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBookingClick = (car) => {
    setShowBookingModal(true);
    setSelectedCar(car);
  };

  const [selectedCar, setSelectedCar] = React.useState(null);

  const handleCloseBooking = () => {
    setShowBookingModal(false);
  };

  const handleHomeClick = () => {
    setShowBookingModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
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
              <button className={`navbar-link ${currentView === 'booking' ? 'active' : ''}`} onClick={handleBookingClick}>Car Booking</button>
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

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="booking-modal-overlay" onClick={handleCloseBooking}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="booking-modal-close" onClick={handleCloseBooking}>×</button>
            <Booking onClose={handleCloseBooking} onHomeClick={handleHomeClick} selectedCar={selectedCar} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
