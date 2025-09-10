const express = require('express');
const router = express.Router();

// Import controller functions
const { createBooking, getBookings } = require('../controllers/bookingController');

// Import authentication middleware
const { authenticate } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', authenticate, createBooking);

// @route   GET /api/bookings
// @desc    Get all bookings for logged-in user
// @access  Private
router.get('/', authenticate, getBookings);

module.exports = router;
