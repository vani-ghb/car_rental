import React, { useState } from 'react';
import Booking from './Booking';
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
      <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow-sm">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
            <span role="img" aria-label="car" className="me-2" style={{fontSize: '1.5rem'}}>🚗</span>
            <span>CarRental</span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <button className="nav-link active" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Home</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${currentView === 'about' ? 'active' : ''}`} onClick={onAboutClick}>About</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${currentView === 'booking' ? 'active' : ''}`} onClick={handleBookingClick}>Car Booking</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={() => window.scrollTo({top: document.getElementById('cars')?.offsetTop || 0, behavior: 'smooth'})}>List of Cars</button>
              </li>
              <li className="nav-item ms-3">
                <button className="btn btn-primary" onClick={onLoginClick}>Login</button>
              </li>
              <li className="nav-item ms-2">
                <button className="btn btn-success" onClick={onRegisterClick}>Register</button>
              </li>
            </ul>
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
