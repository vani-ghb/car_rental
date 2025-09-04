import React, { useState, useEffect } from 'react';
import { bookingsAPI, carsAPI } from '../services/api';
import { carsData, locations } from '../data/cars';
import './Booking.css';

const Booking = ({ onHomeClick }) => {
  const [formData, setFormData] = useState({
    carId: '',
    startDate: '',
    endDate: '',
    pickupLocation: '',
    returnLocation: '',
    driverName: '',
    driverLicense: '',
    driverLicenseExpiry: '',
    driverPhone: '',
    driverAge: '',
    specialRequests: '',
    insurance: 'basic'
  });

  const [cars, setCars] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadCars = async () => {
      try {
        setCarsLoading(true);
        const response = await carsAPI.getAllCars();
        setCars(response.cars || response);

        // Extract unique locations from cars
        const uniqueLocations = [...new Set((response.cars || response).map(car => car.location))];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error('Failed to load cars:', error);
        // Fallback to comprehensive dummy data if API fails
        setCars(carsData);
        setLocations(locations);
      } finally {
        setCarsLoading(false);
      }
    };

    loadCars();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    const car = cars.find(c => c._id === formData.carId);
    if (!car || !formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const insuranceCost = formData.insurance === 'basic' ? 10 : formData.insurance === 'premium' ? 20 : 30;
    return (car.pricePerDay * days) + insuranceCost;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Prepare booking data for API call
      const bookingData = {
        car: formData.carId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        pickupLocation: formData.pickupLocation,
        returnLocation: formData.returnLocation,
        driverInfo: {
          name: formData.driverName,
          licenseNumber: formData.driverLicense,
          licenseExpiry: formData.driverLicenseExpiry,
          phone: formData.driverPhone,
          age: parseInt(formData.driverAge)
        },
        specialRequests: formData.specialRequests,
        insurance: {
          type: formData.insurance,
          cost: formData.insurance === 'basic' ? 10 : formData.insurance === 'premium' ? 20 : 30
        }
      };

      // Make API call to create booking
      const response = await bookingsAPI.createBooking(bookingData);

      setMessage('Booking created successfully! You will receive a confirmation email shortly.');
      console.log('Booking created:', response);

      // Reset form
      setFormData({
        carId: '',
        startDate: '',
        endDate: '',
        pickupLocation: '',
        returnLocation: '',
        driverName: '',
        driverLicense: '',
        driverLicenseExpiry: '',
        driverPhone: '',
        driverAge: '',
        specialRequests: '',
        insurance: 'basic'
      });
    } catch (error) {
      console.error('Booking creation error:', error);

      // Handle specific error cases
      if (error.message && error.message.includes('Failed to fetch')) {
        setMessage('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (error.message && error.message.includes('401')) {
        setMessage('Authentication required. Please log in and try again.');
      } else if (error.message && error.message.includes('400')) {
        setMessage('Please check your booking details and try again.');
      } else {
        setMessage(error.message || 'Failed to create booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Book Your Car</h1>
        <p>Fill in the details below to reserve your vehicle</p>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Car Selection</h2>
          <div className="form-group">
            <label htmlFor="carId">Select Car</label>
            {carsLoading ? (
              <div className="loading-cars">
                <p>Loading available cars...</p>
              </div>
            ) : (
              <select
                id="carId"
                name="carId"
                value={formData.carId}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Choose a car</option>
                {cars.map(car => (
                  <option key={car._id} value={car._id}>
                    {car.name} - ${car.pricePerDay}/day ({car.location})
                  </option>
                ))}
              </select>
            )}
            {!carsLoading && cars.length === 0 && (
              <p className="no-cars-message">No cars available at the moment. Please try again later.</p>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Booking Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Pickup Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">Return Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupLocation">Pickup Location</label>
              <select
                id="pickupLocation"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Select pickup location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="returnLocation">Return Location</label>
              <select
                id="returnLocation"
                name="returnLocation"
                value={formData.returnLocation}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Select return location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Driver Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="driverName">Full Name</label>
              <input
                type="text"
                id="driverName"
                name="driverName"
                value={formData.driverName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="driverAge">Age</label>
              <input
                type="number"
                id="driverAge"
                name="driverAge"
                value={formData.driverAge}
                onChange={handleInputChange}
                min="18"
                max="100"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="driverLicense">License Number</label>
              <input
                type="text"
                id="driverLicense"
                name="driverLicense"
                value={formData.driverLicense}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="driverLicenseExpiry">License Expiry</label>
              <input
                type="date"
                id="driverLicenseExpiry"
                name="driverLicenseExpiry"
                value={formData.driverLicenseExpiry}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="driverPhone">Phone Number</label>
            <input
              type="tel"
              id="driverPhone"
              name="driverPhone"
              value={formData.driverPhone}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Options</h2>
          <div className="form-group">
            <label htmlFor="insurance">Insurance Type</label>
            <select
              id="insurance"
              name="insurance"
              value={formData.insurance}
              onChange={handleInputChange}
            >
              <option value="basic">Basic Insurance ($10/day)</option>
              <option value="premium">Premium Insurance ($20/day)</option>
              <option value="full">Full Coverage ($30/day)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="specialRequests">Special Requests</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any special requests or notes..."
            />
          </div>
        </div>

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <p>Total Amount: ${calculateTotal()}</p>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onHomeClick}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Creating Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Booking;
