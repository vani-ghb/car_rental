import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CarCard from './components/CarCard';
import Login from './components/Login';
import Register from './components/Register';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import Booking from './components/Booking';
import { carsAPI } from './services/api';
import { carsData as dummyCarsData } from './data/cars';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [carsData, setCarsData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchData, setSearchData] = useState({
    location: '',
    pickupDate: '',
    returnDate: ''
  });

  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    // Use local dummy data instead of API call
    const loadDummyData = () => {
      try {
        setCarsData(dummyCarsData);

        // Extract unique locations from cars data
        const uniqueLocations = [...new Set(dummyCarsData.map(car => car.location))];
        setLocations(uniqueLocations);

      } catch (error) {
        console.error('Error loading dummy data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDummyData();

    // Listen to browser back/forward navigation and update currentView accordingly
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/about') setCurrentView('about');
      else if (path === '/booking') setCurrentView('booking');
      else if (path === '/login') setCurrentView('login');
      else if (path === '/register') setCurrentView('register');
      else setCurrentView('home');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleSearchChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching with:', searchData);
    // Here you would typically filter cars based on search criteria
  };

  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleRegisterClick = () => {
    setCurrentView('register');
  };

  const handleHomeClick = () => {
    setCurrentView('home');
  };

  const handleAboutClick = () => {
    setCurrentView('about');
  };

  const handleBookingClick = () => {
    setCurrentView('booking');
  };

  // Show loading spinner while app is loading
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (currentView === 'login') {
    return (
      <div className="app">
        <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onAboutClick={handleAboutClick} onBookingClick={handleBookingClick} currentView={currentView} />
        <Login onRegisterClick={handleRegisterClick} />
      </div>
    );
  }

  if (currentView === 'register') {
    return (
      <div className="app">
        <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onAboutClick={handleAboutClick} onBookingClick={handleBookingClick} currentView={currentView} />
        <Register onLoginClick={handleLoginClick} />
      </div>
    );
  }

  if (currentView === 'about') {
    return (
      <div className="app">
        <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onAboutClick={handleAboutClick} onBookingClick={handleBookingClick} currentView={currentView} />
        <About />
      </div>
    );
  }

  if (currentView === 'booking') {
    return (
      <div className="app">
        <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onAboutClick={handleAboutClick} onBookingClick={handleBookingClick} currentView={currentView} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
          <Booking onHomeClick={handleHomeClick} />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Skip Links for Accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <a href="#search" className="skip-link">Skip to search</a>

      <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onAboutClick={handleAboutClick} onBookingClick={handleBookingClick} currentView={currentView} />
      <main id="main-content" className="main-container">
        {/* Hero Section */}
        <section id="home" className="hero-section">
          <div className="hero-content-wrapper">
            <div className="hero-text-container">
              <h1 className="hero-title">Find Your Perfect Ride</h1>
              <p className="hero-subtitle">Rent premium cars at affordable prices</p>
            </div>

            {/* Search Container */}
            <div id="booking" className="search-section">
              <form className="search-container" onSubmit={handleSearch}>
                <div className="search-grid">
                  <div className="search-field">
                    <label htmlFor="location">Pickup Location</label>
                    <select
                      id="location"
                      value={searchData.location}
                      onChange={(e) => handleSearchChange('location', e.target.value)}
                      required
                    >
                      <option value="">Select Location</option>
                      {locations.map((location, index) => (
                        <option key={index} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <div className="search-field">
                    <label htmlFor="pickupDate">Pickup Date</label>
                    <input
                      type="date"
                      id="pickupDate"
                      value={searchData.pickupDate}
                      onChange={(e) => handleSearchChange('pickupDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="search-field">
                    <label htmlFor="returnDate">Return Date</label>
                    <input
                      type="date"
                      id="returnDate"
                      value={searchData.returnDate}
                      onChange={(e) => handleSearchChange('returnDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="search-field">
                    <label>&nbsp;</label>
                    <button type="submit" className="search-button">
                      Search Cars
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Featured Cars Section */}
        <section className="featured-cars">
          <div className="container">
            <div className="section-header">
              <h2>Featured Vehicles</h2>
              <p>Discover our most popular rental cars</p>
            </div>

            <div className="cars-grid">
              {carsData.slice(0, 6).map(car => (
                <CarCard key={car._id} car={car} onRentNowClick={handleBookingClick} />
              ))}
            </div>

            <div className="explore-button-container">
              <a href="#cars" className="explore-button">
                Explore All Cars
              </a>
            </div>
          </div>
        </section>

        {/* All Cars Section */}
        <section id="cars" className="all-cars">
          <div className="container">
            <div className="section-header">
              <h2>Our Complete Fleet</h2>
              <p>Choose from our wide range of vehicles</p>
            </div>

            <div className="cars-grid">
              {carsData.map(car => (
                <CarCard key={car._id} car={car} onRentNowClick={handleBookingClick} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* Never Miss a Deal Section */}
-        <section className="deal-section">
-          <div className="container">
-            <h1 className="deal-title">
-              <span className="deal-highlight">Never miss a deal!</span>
-            </h1>
-            <p className="deal-subtitle">
-              Subscribe to our newsletter and get exclusive offers on car rentals
-            </p>
-          </div>
-        </section>
+        <Newsletter />

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}

export default App;
