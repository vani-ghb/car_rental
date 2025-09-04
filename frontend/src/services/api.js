// API Service for Car Rental Application
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

// Generic API request function with retry logic
const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
    // Add timeout to prevent hanging requests
    signal: AbortSignal.timeout(10000) // 10 second timeout
  };

  console.log('API Request:', {
    url,
    method: config.method || 'GET',
    headers: config.headers,
    retryCount
  });

  try {
    const response = await fetch(url, config);
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('API Success Response:', data);
    return data;
  } catch (error) {
    console.error('API request error:', {
      endpoint,
      error: error.message,
      stack: error.stack,
      retryCount
    });

    // Handle specific error types
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      const offlineError = new Error('Unable to connect to the server. Please check if the backend server is running and try again.');
      offlineError.code = 'SERVER_OFFLINE';
      throw offlineError;
    }

    if (error.name === 'TimeoutError') {
      const timeoutError = new Error('Request timed out. The server may be busy or offline.');
      timeoutError.code = 'TIMEOUT';
      throw timeoutError;
    }

    // Retry logic for network errors (max 2 retries)
    if (retryCount < 2 && (error.code === 'SERVER_OFFLINE' || error.name === 'TypeError')) {
      console.log(`Retrying request in ${retryCount + 1} second(s)...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return apiRequest(endpoint, options, retryCount + 1);
    }

    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check if the backend server is running and try again.');
      }
      if (error.name === 'TimeoutError') {
        throw new Error('Login request timed out. The server may be busy or offline.');
      }
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check if the backend server is running and try again.');
      }
      if (error.name === 'TimeoutError') {
        throw new Error('Registration request timed out. The server may be busy or offline.');
      }
      throw error;
    }
  },

  getProfile: () => apiRequest('/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
  }
};

// Cars API functions
export const carsAPI = {
  getAllCars: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/cars?${queryString}`);
  },

  getCarById: (id) => apiRequest(`/cars/${id}`),

  createCar: (carData) => apiRequest('/cars', {
    method: 'POST',
    body: JSON.stringify(carData)
  }),

  updateCar: (id, carData) => apiRequest(`/cars/${id}`, {
    method: 'PUT',
    body: JSON.stringify(carData)
  }),

  deleteCar: (id) => apiRequest(`/cars/${id}`, {
    method: 'DELETE'
  })
};

// Bookings API functions
export const bookingsAPI = {
  getUserBookings: () => apiRequest('/bookings/user'),

  getAllBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/bookings?${queryString}`);
  },

  createBooking: (bookingData) => apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),

  updateBooking: (id, bookingData) => apiRequest(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookingData)
  }),

  cancelBooking: (id) => apiRequest(`/bookings/${id}/cancel`, {
    method: 'PUT'
  })
};

// Users API functions
export const usersAPI = {
  getProfile: () => apiRequest('/users/profile'),

  updateProfile: (userData) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),

  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users?${queryString}`);
  }
};

// Reviews API functions
export const reviewsAPI = {
  getCarReviews: (carId) => apiRequest(`/reviews/car/${carId}`),

  createReview: (reviewData) => apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),

  updateReview: (id, reviewData) => apiRequest(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData)
  }),

  deleteReview: (id) => apiRequest(`/reviews/${id}`, {
    method: 'DELETE'
  })
};

// Payments API functions
export const paymentsAPI = {
  createPaymentIntent: (paymentData) => apiRequest('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  }),

  confirmPayment: (paymentData) => apiRequest('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  }),

  getPaymentHistory: () => apiRequest('/payments/history')
};

// Admin API functions
export const adminAPI = {
  getDashboard: () => apiRequest('/admin/dashboard'),

  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${queryString}`);
  },

  updateUserStatus: (userId, statusData) => apiRequest(`/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
  }),

  getAllCars: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/cars?${queryString}`);
  },

  updateCarStatus: (carId, statusData) => apiRequest(`/admin/cars/${carId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
  }),

  getAllBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/bookings?${queryString}`);
  },

  updateBookingStatus: (bookingId, statusData) => apiRequest(`/admin/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
  }),

  getAllReviews: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/reviews?${queryString}`);
  },

  moderateReview: (reviewId, actionData) => apiRequest(`/admin/reviews/${reviewId}/moderate`, {
    method: 'PUT',
    body: JSON.stringify(actionData)
  }),

  getAnalytics: (period = '30d') => apiRequest(`/admin/analytics?period=${period}`)
};

export default {
  authAPI,
  carsAPI,
  bookingsAPI,
  usersAPI,
  reviewsAPI,
  paymentsAPI,
  adminAPI
};
