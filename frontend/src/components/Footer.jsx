import React from 'react';
import './Footer.css';

const Footer = () => {

  return (
    <footer className="footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="footer-logo-emoji">🚗</span>
              <h3>CarRental</h3>
            </div>
            <p className="footer-description">
              <span className="project-icon">🚗</span>
              Premium car rental services with a wide selection of luxury and everyday vehicles for all your driving needs.
            </p>
            <div className="social-icons">
              <a href="#" className="social-link" aria-label="Facebook">
                <span className="social-emoji">📘</span>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <span className="social-emoji">📷</span>
              </a>
              <a href="#" className="social-link" aria-label="Telegram">
                <span className="social-emoji">✈️</span>
              </a>
              <a href="mailto:info@carrental.com" className="social-link" aria-label="Email">
                <span className="social-emoji">✉️</span>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#cars">Our Fleet</a></li>
              <li><a href="#booking">Book Now</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Booking Guide</a></li>
              <li><a href="#">Insurance Info</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Details</h4>
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Main Street, City, State 12345</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>info@carrental.com</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <span>Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM</span>
              </div>
            </div>
          </div>
        </div>



        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 CarRental. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
