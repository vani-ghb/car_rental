import React from 'react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="section-header">
          <h2>About CarRental</h2>
          <p>Your trusted partner for premium car rental services</p>
        </div>
        
        <div className="about-content">
          <div className="about-text">
            <h3>Welcome to CarRental Platform</h3>
            <p>
              CarRental is a leading car rental service provider offering a wide range of 
              premium vehicles for all your transportation needs. Whether you're traveling 
              for business, planning a family vacation, or need a reliable vehicle for 
              daily commuting, we have the perfect car for you.
            </p>
            
            <h4>Why Choose Us?</h4>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🚗</div>
                <h5>Wide Vehicle Selection</h5>
                <p>Choose from economy cars, luxury sedans, SUVs, and premium vehicles</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">💰</div>
                <h5>Competitive Pricing</h5>
                <p>Affordable rates with no hidden charges and transparent pricing</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <h5>Quick Booking</h5>
                <p>Easy online booking system with instant confirmation</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🛡️</div>
                <h5>24/7 Support</h5>
                <p>Round-the-clock customer support for all your needs</p>
              </div>
            </div>
            
            <h4>Our Mission</h4>
            <p>
              Our mission is to provide reliable, affordable, and convenient car rental 
              services that exceed customer expectations. We strive to make every journey 
              comfortable and memorable with our well-maintained fleet and exceptional service.
            </p>
            
            <h4>Our Services</h4>
            <ul className="services-list">
              <li>Daily, weekly, and monthly car rentals</li>
              <li>Airport pickup and drop-off services</li>
              <li>Corporate car rental programs</li>
              <li>Long-term leasing options</li>
              <li>24/7 roadside assistance</li>
              <li>Flexible payment options</li>
            </ul>
          </div>
          
          <div className="about-stats">
            <div className="stat-item">
              <h3>500+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Premium Vehicles</p>
            </div>
            <div className="stat-item">
              <h3>10+</h3>
              <p>Service Locations</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Customer Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
