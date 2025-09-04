const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private (would require auth middleware)
router.get('/profile', async (req, res) => {
  try {
    // In a real app, get user ID from authenticated user
    // const user = await User.findById(req.user.id);

    res.json({
      message: 'User profile endpoint - requires auth middleware',
      user: {
        id: 'placeholder',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private (would require auth middleware)
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // In a real app, get user ID from authenticated user
    // const user = await User.findById(req.user.id);
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    // Update user fields
    // const updatedUser = await User.findByIdAndUpdate(
    //   req.user.id,
    //   { ...req.body, updatedAt: new Date() },
    //   { new: true, runValidators: true }
    // );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: 'placeholder',
        name: req.body.name || 'John Doe',
        email: 'john@example.com',
        phone: req.body.phone
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private (would require auth middleware)
router.put('/change-password', [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // In a real app, get user with password
    // const user = await User.findById(req.user.id).select('+password');
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    // Check current password
    // const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    // if (!isCurrentPasswordValid) {
    //   return res.status(400).json({ message: 'Current password is incorrect' });
    // }

    // Update password
    // user.password = newPassword;
    // await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

// @route   GET /api/users/bookings
// @desc    Get user's booking history
// @access  Private (would require auth middleware)
router.get('/bookings', async (req, res) => {
  try {
    // In a real app, get user's bookings
    // const bookings = await Booking.find({ user: req.user.id })
    //   .populate('car', 'name brand model images')
    //   .sort({ createdAt: -1 });

    res.json({
      message: 'User bookings endpoint - requires auth middleware and Booking model import',
      bookings: []
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

// @route   GET /api/users/cars
// @desc    Get user's listed cars
// @access  Private (would require auth middleware)
router.get('/cars', async (req, res) => {
  try {
    // In a real app, get user's cars
    // const cars = await Car.find({ owner: req.user.id, isActive: true })
    //   .sort({ createdAt: -1 });

    res.json({
      message: 'User cars endpoint - requires auth middleware and Car model import',
      cars: []
    });
  } catch (error) {
    console.error('Get user cars error:', error);
    res.status(500).json({ message: 'Server error while fetching cars' });
  }
});

// @route   DELETE /api/users/deactivate
// @desc    Deactivate user account
// @access  Private (would require auth middleware)
router.delete('/deactivate', async (req, res) => {
  try {
    // In a real app, deactivate user account
    // const user = await User.findById(req.user.id);
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    // user.isActive = false;
    // await user.save();

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Server error while deactivating account' });
  }
});

module.exports = router;
