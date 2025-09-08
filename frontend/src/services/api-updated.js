const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Auth API functions
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Login failed');
    }
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Registration failed');
    }
    return response.json();
  }
};

// Cars API functions
export const carsAPI = {
  getCars: async () => {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch cars');
    }
    return response.json();
  }
};

// Bookings API functions
export const bookingsAPI = {
  createBooking: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to create booking');
    }
    return response.json();
  }
};
