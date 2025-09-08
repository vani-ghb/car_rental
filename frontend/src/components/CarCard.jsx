import React from 'react';
import './CarCard.css';

const CarCard = ({ car, onRentNowClick }) => {
  // Handle backend data structure
  const imageUrl = car.images && car.images.length > 0 ? car.images[0] : '/placeholder-car.jpg';
  const isAvailable = car.availability !== false && car.isActive !== false;

  return (
    <div className="car-card">
      <div className="car-image-container">
        <img src={imageUrl} alt={car.name} className="car-image" />
        {isAvailable ? (
          <div className="availability-badge">Available Now</div>
        ) : (
          <div className="availability-badge not-available">Not Available</div>
        )}
      </div>

      <div className="car-info">
        <div className="car-header">
          <h3 className="car-name">{car.name}</h3>
          <div className="car-price">
            ${car.pricePerDay}<span className="price-unit">/day</span>
          </div>
        </div>

        <div className="car-details">
          <div className="detail-item">
            <span className="detail-icon">👥</span>
            <span>{car.seats} Seats</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">⛽</span>
            <span>{car.fuelType}</span>
          </div>
        </div>

        {car.features && car.features.length > 0 && (
          <div className="car-features">
            <h4>Features:</h4>
            <div className="features-list">
              {car.features.slice(0, 3).map((feature, index) => (
                <span key={index} className="feature-tag">
                  {feature}
                </span>
              ))}
              {car.features.length > 3 && (
                <span className="feature-tag">
                  +{car.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="car-location">
          <span className="location-icon">📍</span>
          <span>{car.location}</span>
        </div>

        <button
          className="rent-button"
          disabled={!isAvailable}
          onClick={() => {
            if (isAvailable && onRentNowClick) {
              onRentNowClick(car);
            }
          }}
        >
          {isAvailable ? 'Rent Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

export default CarCard;
