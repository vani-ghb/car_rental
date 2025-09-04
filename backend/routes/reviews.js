const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { authenticate, requireAdmin } = require('../middleware/auth');
const Review = require('../models/Review');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', [
  authenticate,
  body('targetType').isIn(['car', 'booking']).withMessage('Invalid target type'),
  body('targetId').isMongoId().withMessage('Invalid target ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { targetType, targetId, rating, comment, title, categories, bookingExperience, media } = req.body;
    const reviewerId = req.user.id;

    // Check if target exists
    let targetExists = false;
    if (targetType === 'car') {
      const car = await Car.findById(targetId);
      targetExists = !!car;
    } else if (targetType === 'booking') {
      const booking = await Booking.findById(targetId);
      // Only allow review if booking belongs to user and is completed
      if (booking && booking.user.toString() === reviewerId && booking.status === 'completed') {
        targetExists = true;
      }
    }

    if (!targetExists) {
      return res.status(404).json({ message: 'Target not found or not eligible for review' });
    }

    // Check if user has already reviewed this target
    const existingReview = await Review.hasUserReviewed(targetType, targetId, reviewerId);
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }

    // Create review
    const review = new Review({
      targetType,
      targetId,
      reviewer: reviewerId,
      rating,
      comment,
      title,
      categories: targetType === 'car' ? categories : undefined,
      bookingExperience: targetType === 'booking' ? bookingExperience : undefined,
      media,
      isVerified: req.user.isVerified || false,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await review.save();

    // Populate reviewer info
    await review.populate('reviewer', 'name avatar isVerified');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
});

// @route   GET /api/reviews/:targetType/:targetId
// @desc    Get reviews for a specific target
// @access  Public
router.get('/:targetType/:targetId', [
  param('targetType').isIn(['car', 'booking']).withMessage('Invalid target type'),
  param('targetId').isMongoId().withMessage('Invalid target ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt', rating, verified } = req.query;

    // Build query
    const query = {
      targetType,
      targetId,
      status: 'approved',
      isActive: true
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (verified === 'true') {
      query.isVerified = true;
    }

    // Get reviews
    const reviews = await Review.find(query)
      .populate('reviewer', 'name avatar isVerified')
      .populate('adminResponse.respondedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const total = await Review.countDocuments(query);

    // Get average rating
    const ratingStats = await Review.getAverageRating(targetType, targetId);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      ratingStats
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (review owner only)
router.put('/:id', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reviewId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    // Find review and check ownership
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Only allow updates within 30 days of creation
    const daysSinceCreation = (Date.now() - review.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 30) {
      return res.status(400).json({ message: 'Reviews can only be edited within 30 days' });
    }

    // Update review
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        review[key] = updates[key];
      }
    });

    review.updatedAt = new Date();
    await review.save();

    await review.populate('reviewer', 'name avatar isVerified');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error while updating review' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (soft delete)
// @access  Private (review owner or admin)
router.delete('/:id', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid review ID')
], async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const isUserAdmin = req.user.role === 'admin';

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check permissions
    if (review.reviewer.toString() !== userId && !isUserAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Soft delete
    review.isActive = false;
    await review.save();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid review ID')
], async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already voted
    const existingVote = review.helpful.find(vote => vote.user.toString() === userId);
    if (existingVote) {
      return res.status(400).json({ message: 'You have already marked this review as helpful' });
    }

    // Add helpful vote
    review.helpful.push({
      user: userId,
      votedAt: new Date()
    });

    await review.save();

    res.json({
      success: true,
      message: 'Review marked as helpful',
      helpfulCount: review.helpful.length
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ message: 'Server error while marking review as helpful' });
  }
});

// @route   POST /api/reviews/:id/report
// @desc    Report a review
// @access  Private
router.post('/:id/report', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('reason').isIn(['spam', 'inappropriate', 'fake', 'offensive', 'irrelevant']).withMessage('Invalid report reason')
], async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already reported
    const existingReport = review.reports.find(report => report.user.toString() === userId);
    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this review' });
    }

    // Add report
    review.reports.push({
      user: userId,
      reason,
      reportedAt: new Date()
    });

    await review.save();

    res.json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ message: 'Server error while reporting review' });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews by a specific user
// @access  Private (own reviews) or Admin
router.get('/user/:userId', [
  authenticate,
  param('userId').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Only allow users to view their own reviews or admins to view any
    if (targetUserId !== currentUserId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view these reviews' });
    }

    const reviews = await Review.find({
      reviewer: targetUserId,
      isActive: true
    })
    .populate('targetId', 'name model make') // For cars
    .sort('-createdAt');

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching user reviews' });
  }
});

// @route   PUT /api/reviews/:id/admin-response
// @desc    Add admin response to review
// @access  Private (Admin only)
router.put('/:id/admin-response', [
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('comment').trim().isLength({ min: 1, max: 500 }).withMessage('Response must be 1-500 characters')
], async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { comment } = req.body;
    const adminId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.adminResponse = {
      comment,
      respondedBy: adminId,
      respondedAt: new Date()
    };

    await review.save();
    await review.populate('adminResponse.respondedBy', 'name');

    res.json({
      success: true,
      message: 'Admin response added successfully',
      review
    });
  } catch (error) {
    console.error('Admin response error:', error);
    res.status(500).json({ message: 'Server error while adding admin response' });
  }
});

// @route   PUT /api/reviews/:id/status
// @desc    Update review status (approve/reject)
// @access  Private (Admin only)
router.put('/:id/status', [
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    ).populate('reviewer', 'name avatar isVerified');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      success: true,
      message: `Review ${status} successfully`,
      review
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ message: 'Server error while updating review status' });
  }
});

module.exports = router;
