const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Car = require('../models/Car');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private (would require auth middleware)
router.get('/', async (req, res) => {
  try {
    // In a real app, get user ID from authenticated user
    // const userId = req.user.id;

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {}; // { user: userId }

    if (status) filter.status = status;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const bookings = await Booking.find(filter)
      .populate('car', 'name brand model images pricePerDay')
      .populate('user', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private (would require auth middleware and ownership check)
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'name brand model images pricePerDay location')
      .populate('user', 'name email phone')
      .select('-__v');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // In a real app, check if user owns the booking
    // if (booking.user.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized to view this booking' });
    // }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    res.status(500).json({ message: 'Server error while fetching booking' });
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (requires auth middleware)
router.post('/', authenticate, [
  body('car').isMongoId().withMessage('Invalid car ID'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('pickupLocation').trim().isLength({ min: 1 }).withMessage('Pickup location is required'),
  body('returnLocation').trim().isLength({ min: 1 }).withMessage('Return location is required'),
  body('driverInfo.name').trim().isLength({ min: 2 }).withMessage('Driver name is required'),
  body('driverInfo.licenseNumber').trim().isLength({ min: 1 }).withMessage('License number is required'),
  body('driverInfo.licenseExpiry').isISO8601().withMessage('Invalid license expiry date'),
  body('driverInfo.phone').isMobilePhone().withMessage('Invalid phone number'),
  body('driverInfo.age').isInt({ min: 18, max: 100 }).withMessage('Driver must be 18-100 years old')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      car: carId,
      startDate,
      endDate,
      pickupLocation,
      returnLocation,
      driverInfo,
      specialRequests,
      insurance = { type: 'basic', cost: 0 }
    } = req.body;

    // Check if car exists and is available
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (!car.availability) {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        message: 'Car is already booked for the selected dates'
      });
    }

    // Calculate total days and amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = (car.pricePerDay * totalDays) + insurance.cost;

// Create booking
const booking = new Booking({
  user: req.user._id, // From auth middleware
  car: carId,
  startDate,
  endDate,
  totalDays,
  totalAmount,
  pickupLocation,
  returnLocation,
  driverInfo,
  specialRequests,
  insurance
});

await booking.save();
await booking.populate('car', 'name brand model images pricePerDay');
await booking.populate('user', 'name email');

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status
// @access  Private (would require auth middleware and ownership check)
router.put('/:id', [
  body('status').optional().isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled', 'refunded']).withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // In a real app, check if user owns the booking or is admin
    // if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized to update this booking' });
    // }

    const { status, cancellationReason } = req.body;

    if (status) {
      booking.status = status;

      if (status === 'cancelled') {
        booking.cancellationReason = cancellationReason;
        booking.cancelledAt = new Date();
      } else if (status === 'completed') {
        booking.completedAt = new Date();
      }
    }

    await booking.save();
    await booking.populate('car', 'name brand model');
    await booking.populate('user', 'name email');

    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    res.status(500).json({ message: 'Server error while updating booking' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private (would require auth middleware and ownership check)
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // In a real app, check if user owns the booking
    // if (booking.user.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    // }

    // Check if booking can be cancelled
    if (!booking.canCancel()) {
      return res.status(400).json({
        message: 'Booking cannot be cancelled within 24 hours of start date'
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    res.status(500).json({ message: 'Server error while cancelling booking' });
  }
});

// @route   GET /api/bookings/car/:carId
// @desc    Get bookings for a specific car
// @access  Private (would require auth middleware and ownership check)
router.get('/car/:carId', async (req, res) => {
  try {
    const bookings = await Booking.find({
      car: req.params.carId,
      status: { $ne: 'cancelled' }
    })
    .populate('user', 'name email')
    .sort({ startDate: 1 })
    .select('startDate endDate status totalAmount');

    res.json(bookings);
  } catch (error) {
    console.error('Get car bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching car bookings' });
  }
});

module.exports = router;
