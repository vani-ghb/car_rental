// Simple API Testing Script for Car Rental Backend
// Run with: node test-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  phone: '+1234567890'
};

const testCar = {
  name: 'Test Car',
  brand: 'Toyota',
  model: 'Camry',
  year: 2020,
  pricePerDay: 50,
  category: 'sedan',
  transmission: 'automatic',
  fuelType: 'petrol',
  seats: 5,
  location: 'New York',
  images: ['https://example.com/car-image.jpg'],
  description: 'A reliable test car'
};

let authToken = '';
let userId = '';
let carId = '';

// Helper function to make requests
const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data : error.message
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n🔍 Testing Health Check...');
  const result = await makeRequest('GET', '/health');
  if (result.success) {
    console.log('✅ Health check passed:', result.data);
  } else {
    console.log('❌ Health check failed:', result.error);
  }
};

const testUserRegistration = async () => {
  console.log('\n📝 Testing User Registration...');
  const result = await makeRequest('POST', '/auth/register', testUser);
  if (result.success) {
    console.log('✅ Registration successful:', result.data.user);
    userId = result.data.user.id;
  } else {
    console.log('❌ Registration failed:', result.error);
  }
};

const testUserLogin = async () => {
  console.log('\n🔐 Testing User Login...');
  const result = await makeRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  if (result.success) {
    console.log('✅ Login successful');
    authToken = result.data.token;
  } else {
    console.log('❌ Login failed:', result.error);
  }
};

const testGetCars = async () => {
  console.log('\n🚗 Testing Get Cars...');
  const result = await makeRequest('GET', '/cars');
  if (result.success) {
    console.log(`✅ Retrieved ${result.data.cars.length} cars`);
  } else {
    console.log('❌ Get cars failed:', result.error);
  }
};

const testCreateCar = async () => {
  console.log('\n➕ Testing Create Car...');
  const result = await makeRequest('POST', '/cars', testCar, authToken);
  if (result.success) {
    console.log('✅ Car created:', result.data.car.name);
    carId = result.data.car._id;
  } else {
    console.log('❌ Create car failed:', result.error);
  }
};

const testGetUserProfile = async () => {
  console.log('\n👤 Testing Get User Profile...');
  const result = await makeRequest('GET', '/users/profile', null, authToken);
  if (result.success) {
    console.log('✅ Profile retrieved:', result.data.user.name);
  } else {
    console.log('❌ Get profile failed:', result.error);
  }
};

const testCreateBooking = async () => {
  console.log('\n📅 Testing Create Booking...');
  const bookingData = {
    car: carId,
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days later
    pickupLocation: 'New York Airport',
    returnLocation: 'New York Airport',
    driverInfo: {
      name: 'Test Driver',
      licenseNumber: 'DL123456789',
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      phone: '+1234567890',
      age: 30
    }
  };

  const result = await makeRequest('POST', '/bookings', bookingData, authToken);
  if (result.success) {
    console.log('✅ Booking created:', result.data.booking._id);
  } else {
    console.log('❌ Create booking failed:', result.error);
  }
};

const testGetBookings = async () => {
  console.log('\n📋 Testing Get Bookings...');
  const result = await makeRequest('GET', '/bookings', null, authToken);
  if (result.success) {
    console.log(`✅ Retrieved ${result.data.bookings.length} bookings`);
  } else {
    console.log('❌ Get bookings failed:', result.error);
  }
};

const testPaymentMethods = async () => {
  console.log('\n💳 Testing Payment Methods...');
  const result = await makeRequest('GET', '/payments/methods');
  if (result.success) {
    console.log('✅ Payment methods retrieved:', result.data.paymentMethods.length, 'methods');
  } else {
    console.log('❌ Get payment methods failed:', result.error);
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Car Rental API Tests...\n');

  // Basic tests (no auth required)
  await testHealthCheck();
  await testGetCars();
  await testPaymentMethods();

  // User tests
  await testUserRegistration();
  await testUserLogin();

  // Authenticated tests
  if (authToken) {
    await testGetUserProfile();
    await testCreateCar();

    if (carId) {
      await testCreateBooking();
      await testGetBookings();
    }
  }

  console.log('\n✨ API Testing Complete!');
  console.log('\n📝 Note: Some tests may fail if the backend is not running or if authentication is not properly configured.');
  console.log('🔧 Make sure to:');
  console.log('   1. Start MongoDB');
  console.log('   2. Set up environment variables in .env file');
  console.log('   3. Run the backend server with: npm run dev');
};

// Run tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
