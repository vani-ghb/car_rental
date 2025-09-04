const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Review can be for a car or a booking
  targetType: {
    type: String,
    enum: ['car', 'booking'],
    required: true
  },

  // ID of the car or booking being reviewed
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },

  // User who wrote the review
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  // Review text
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  // Review title
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },

  // Review categories (for cars)
  categories: {
    cleanliness: { type: Number, min: 1, max: 5 },
    comfort: { type: Number, min: 1, max: 5 },
    performance: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    pickup: { type: Number, min: 1, max: 5 }
  },

  // For booking reviews
  bookingExperience: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor', 'terrible'],
    trim: true
  },

  // Images/videos attached to review
  media: [{
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    caption: String
  }],

  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Admin response to review
  adminResponse: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },

  // Helpful votes
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Report count for moderation
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'irrelevant'],
      required: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Verification status (only verified users can review)
  isVerified: {
    type: Boolean,
    default: false
  },

  // Review metadata
  ipAddress: String,
  userAgent: String,

  // Soft delete
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ status: 1 });

// Virtual for helpful count
reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpful.length;
});

// Virtual for report count
reviewSchema.virtual('reportCount').get(function() {
  return this.reports.length;
});

// Method to check if user has already reviewed this target
reviewSchema.statics.hasUserReviewed = async function(targetType, targetId, userId) {
  const existingReview = await this.findOne({
    targetType,
    targetId,
    reviewer: userId,
    isActive: true
  });
  return !!existingReview;
};

// Method to calculate average rating for a target
reviewSchema.statics.getAverageRating = async function(targetType, targetId) {
  const result = await this.aggregate([
    {
      $match: {
        targetType,
        targetId: mongoose.Types.ObjectId(targetId),
        status: 'approved',
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length > 0) {
    const { averageRating, totalReviews, ratingDistribution } = result[0];

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      distribution
    };
  }

  return {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };
};

// Pre-save middleware to check for duplicate reviews
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({
      targetType: this.targetType,
      targetId: this.targetId,
      reviewer: this.reviewer,
      isActive: true
    });

    if (existingReview) {
      const error = new Error('User has already reviewed this item');
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
