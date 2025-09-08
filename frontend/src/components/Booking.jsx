import React, { useState, useEffect } from 'react';
import { bookingsAPI, carsAPI } from '../services/api-updated';
import { carsData as dummyCarsData } from '../data/cars';
import './Booking.css';

const Booking = ({ onHomeClick, selectedCar, onClose }) => {
  const [car, setCar] = useState(selectedCar || null);
  const [availableCars, setAvailableCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    returnLocation: '',
    driverName: '',
    driverLicenseNumber: '',
    driverLicenseExpiry: '',
    driverPhone: '',
    driverAge: '',
    specialRequests: '',
    insuranceType: 'basic',
    insuranceCost: 0
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    if (selectedCar) {
      setCar(selectedCar);
    } else {
      // Load available cars when no specific car is selected
      loadAvailableCars();
    }
  }, [selectedCar]);

  const loadAvailableCars = async () => {
    setLoadingCars(true);
    try {
      // Try to fetch from API first
      const response = await carsAPI.getCars();
      setAvailableCars(response.cars || []);
    } catch (error) {
      console.error('Error loading cars from API:', error);
      // Fallback to dummy data
      setAvailableCars(dummyCarsData);
    } finally {
      setLoadingCars(false);
    }
  };

  const handleCarSelect = (selectedCar) => {
    setCar(selectedCar);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    if (!car) {
      setError('No car selected for booking.');
      setIsSubmitting(false);
      return;
    }

    // Check authentication before proceeding
    if (!isAuthenticated) {
      setError('You must be logged in to create a booking. Please login first.');
      setIsSubmitting(false);
      return;
    }

    // Prepare booking data
    const bookingData = {
      car: car._id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      pickupLocation: formData.pickupLocation,
      returnLocation: formData.returnLocation,
      driverInfo: {
        name: formData.driverName,
        licenseNumber: formData.driverLicenseNumber,
        licenseExpiry: formData.driverLicenseExpiry,
        phone: formData.driverPhone,
        age: parseInt(formData.driverAge, 10)
      },
      specialRequests: formData.specialRequests,
      insurance: {
        type: formData.insuranceType,
        cost: parseFloat(formData.insuranceCost)
      }
    };

    try {
      const response = await bookingsAPI.createBooking(bookingData);
      setMessage('Booking created successfully!');
      setFormData({
        startDate: '',
        endDate: '',
        pickupLocation: '',
        returnLocation: '',
        driverName: '',
        driverLicenseNumber: '',
        driverLicenseExpiry: '',
        driverPhone: '',
        driverAge: '',
        specialRequests: '',
        insuranceType: 'basic',
        insuranceCost: 0
      });
    } catch (err) {
      setError(err.message || 'Failed to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!car) {
    return (
      <div className="booking-container">
        <h2>Select a Car to Book</h2>
        {loadingCars ? (
          <div className="loading">Loading available cars...</div>
        ) : (
          <div className="car-selection">
            <div className="cars-grid">
              {availableCars.map(car => (
                <div key={car._id} className="car-card" onClick={() => handleCarSelect(car)}>
                  <div className="car-image-container">
                    <img
                      src={car.images && car.images.length > 0 ? car.images[0] : '/placeholder-car.jpg'}
                      alt={car.name}
                      className="car-image"
                    />
                  </div>
                  <div className="car-info">
                    <h3 className="car-name">{car.name}</h3>
                    <div className="car-price">${car.pricePerDay}/day</div>
                    <div className="car-details">
                      <span>{car.seats} Seats</span>
                      <span>{car.fuelType}</span>
                    </div>
                    <button className="select-car-button">Select This Car</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onClose || onHomeClick}>
            {onClose ? 'Close' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  // Show booking form with selected car details
  return (
    <div className="booking-container">
      <div className="selected-car-summary">
        <h2>Book Your Selected Car</h2>
        <div className="selected-car-card">
          <div className="selected-car-image">
            <img
              src={car.images && car.images.length > 0 ? car.images[0] : '/placeholder-car.jpg'}
              alt={car.name}
            />
          </div>
          <div className="selected-car-details">
            <h3>{car.name}</h3>
            <p className="car-price">${car.pricePerDay}/day</p>
            <div className="car-specs">
              <span>{car.seats} Seats</span>
              <span>{car.fuelType}</span>
              <span>{car.location}</span>
            </div>
          </div>
          <button
            className="change-car-button"
            onClick={() => setCar(null)}
          >
            Change Car
          </button>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="auth-warning">
          <div className="message warning">
            ⚠️ You must be logged in to create a booking. Please login first to proceed.
          </div>
        </div>
      )}

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Booking Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupLocation">Pickup Location</label>
              <input type="text" id="pickupLocation" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="returnLocation">Return Location</label>
              <input type="text" id="returnLocation" name="returnLocation" value={formData.returnLocation} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Driver Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="driverName">Name</label>
              <input type="text" id="driverName" name="driverName" value={formData.driverName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="driverLicenseNumber">License Number</label>
              <input type="text" id="driverLicenseNumber" name="driverLicenseNumber" value={formData.driverLicenseNumber} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="driverLicenseExpiry">License Expiry</label>
              <input type="date" id="driverLicenseExpiry" name="driverLicenseExpiry" value={formData.driverLicenseExpiry} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="driverPhone">Phone</label>
              <input type="tel" id="driverPhone" name="driverPhone" value={formData.driverPhone} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="driverAge">Age</label>
            <input type="number" id="driverAge" name="driverAge" value={formData.driverAge} onChange={handleChange} min="18" max="100" required />
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          <div className="form-group">
            <label htmlFor="specialRequests">Special Requests</label>
            <textarea id="specialRequests" name="specialRequests" value={formData.specialRequests} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="insuranceType">Insurance Type</label>
              <select id="insuranceType" name="insuranceType" value={formData.insuranceType} onChange={handleChange}>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="insuranceCost">Insurance Cost</label>
              <input type="number" id="insuranceCost" name="insuranceCost" value={formData.insuranceCost} onChange={handleChange} min="0" step="0.01" />
            </div>
          </div>
        </div>

        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Booking...' : 'Book Now'}
          </button>
          <button type="button" className="cancel-button" onClick={onHomeClick} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Booking;
