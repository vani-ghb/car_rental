const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { authenticate, requireAdmin } = require('../middleware/auth');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Review = require('../models/Review');
const { emitToAdmins } = require('../services/socketService');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get dashboard statistics
    const [
      totalUsers,
      totalCars,
      totalBookings,
      totalRevenue,
      pendingReviews,
      recentBookings,
      carStats,
      userStats
    ] = await Promise.all([
      User.countDocuments(),
      Car.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Review.countDocuments({ status: 'pending' }),
      Booking.find()
        .populate('user', 'name email')
        .populate('car', 'name brand model')
        .sort('-createdAt')
        .limit(10),
      Car.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$pricePerDay' }
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': -1 } },
        { $limit: 12 }
      ])
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    res.json({
      success: true,
      statistics: {
        totalUsers,
        totalCars,
        totalBookings,
        totalRevenue: revenue,
        pendingReviews,
        recentBookings,
        carStats,
        userStats
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// @route   GET /api/admin/cars
// @desc    Get all cars for admin management
// @access  Private (Admin only)
router.get('/cars', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      owner,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }
    if (owner) {
      filter.owner = owner;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const cars = await Car.find(filter)
      .populate('owner', 'name email phone')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Car.countDocuments(filter);

    res.json({
      success: true,
      cars,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalCars: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin get cars error:', error);
    res.status(500).json({ message: 'Server error while fetching cars' });
  }
});

// @route   PUT /api/admin/cars/:id/status
// @desc    Update car status (approve/reject)
// @access  Private (Admin only)
router.put('/cars/:id/status', [
  param('id').isMongoId().withMessage('Invalid car ID'),
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status'),
  body('reason').optional().trim().isLength({ min: 1 }).withMessage('Reason is required for rejection')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reason } = req.body;
    const carId = req.params.id;

    const car = await Car.findById(carId).populate('owner', 'name email');
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Update car status
    car.isActive = status === 'approved';
    car.updatedAt = new Date();

    // Add admin note if rejected
    if (status === 'rejected' && reason) {
      car.adminNote = reason;
    }

    await car.save();

    // Notify car owner via socket
    emitToAdmins('admin_car_status_update', {
      carId,
      status,
      ownerId: car.owner._id,
      carName: car.name,
      reason,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Car ${status} successfully`,
      car
    });
  } catch (error) {
    console.error('Admin update car status error:', error);
    res.status(500).json({ message: 'Server error while updating car status' });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings for admin management
// @access  Private (Admin only)
router.get('/bookings', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      user,
      car,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (user) filter.user = user;
    if (car) filter.car = car;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('car', 'name brand model pricePerDay')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
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
    console.error('Admin get bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

// @route   PUT /api/admin/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin only)
router.put('/bookings/:id/status', [
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('reason').optional().trim().isLength({ min: 1 }).withMessage('Reason is required for cancellation')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reason } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email')
      .populate('car', 'name brand model');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const oldStatus = booking.status;
    booking.status = status;
    booking.updatedAt = new Date();

    // Add admin note if cancelled
    if (status === 'cancelled' && reason) {
      booking.adminNote = reason;
    }

    await booking.save();

    // Notify user via socket
    emitToAdmins('admin_booking_status_update', {
      bookingId,
      oldStatus,
      newStatus: status,
      userId: booking.user._id,
      carName: booking.car.name,
      reason,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking
    });
  } catch (error) {
    console.error('Admin update booking status error:', error);
    res.status(500).json({ message: 'Server error while updating booking status' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('status').isIn(['active', 'inactive']).withMessage('Invalid status'),
  body('reason').optional().trim().isLength({ min: 1 }).withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reason } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = status === 'active';
    user.updatedAt = new Date();

    // Add admin note
    if (reason) {
      user.adminNote = reason;
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${status} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Admin update user status error:', error);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews for admin moderation
// @access  Private (Admin only)
router.get('/reviews', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'pending',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (status !== 'all') {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate('reviewer', 'name email avatar')
      .populate('targetId', 'name brand model', null, { strictPopulate: false })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin get reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

// @route   PUT /api/admin/reviews/:id/moderate
// @desc    Moderate a review (approve/reject)
// @access  Private (Admin only)
router.put('/reviews/:id/moderate', [
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('action').isIn(['approve', 'reject']).withMessage('Invalid action'),
  body('reason').optional().trim().isLength({ min: 1 }).withMessage('Reason is required for rejection')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, reason } = req.body;
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId)
      .populate('reviewer', 'name email')
      .populate('targetId', 'name brand model', null, { strictPopulate: false });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.status = action === 'approve' ? 'approved' : 'rejected';
    review.updatedAt = new Date();

    // Add admin note if rejected
    if (action === 'reject' && reason) {
      review.adminNote = reason;
    }

    await review.save();

    res.json({
      success: true,
      message: `Review ${action}d successfully`,
      review
    });
  } catch (error) {
    console.error('Admin moderate review error:', error);
    res.status(500).json({ message: 'Server error while moderating review' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics data
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const [
      userGrowth,
      bookingTrends,
      revenueTrends,
      carPerformance,
      reviewStats
    ] = await Promise.all([
      // User growth over time
      User.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // Booking trends
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // Revenue trends
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // Car performance (most booked)
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: '$car',
            bookingCount: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          }
        },
        {
          $lookup: {
            from: 'cars',
            localField: '_id',
            foreignField: '_id',
            as: 'car'
          }
        },
        { $unwind: '$car' },
        {
          $project: {
            name: '$car.name',
            brand: '$car.brand',
            model: '$car.model',
            bookingCount: 1,
            totalRevenue: 1
          }
        },
        { $sort: { bookingCount: -1 } },
        { $limit: 10 }
      ]),

      // Review statistics
      Review.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        period,
        userGrowth,
        bookingTrends,
        revenueTrends,
        carPerformance,
        reviewStats
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

module.exports = router;
