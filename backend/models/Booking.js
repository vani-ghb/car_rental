const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for booking']
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car is required for booking']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  totalDays: {
    type: Number,
    required: true,
    min: [1, 'Booking must be for at least 1 day']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer', 'cash'],
    default: 'card'
  },
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required'],
    trim: true
  },
  returnLocation: {
    type: String,
    required: [true, 'Return location is required'],
    trim: true
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  driverInfo: {
    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true
    },
    licenseNumber: {
      type: String,
      required: [true, 'Driver license number is required'],
      trim: true
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'License expiry date is required']
    },
    phone: {
      type: String,
      required: [true, 'Driver phone number is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Driver age is required'],
      min: [18, 'Driver must be at least 18 years old'],
      max: [100, 'Invalid age']
    }
  },
  insurance: {
    type: {
      type: String,
      enum: ['basic', 'premium', 'full'],
      default: 'basic'
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Insurance cost cannot be negative']
    }
  },
  additionalCharges: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Charge amount cannot be negative']
    }
  }],
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: Date,
  completedAt: Date,
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, startDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total days and amount
bookingSchema.pre('save', async function(next) {
  if (this.isModified('startDate') || this.isModified('endDate')) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Get car price and calculate total
    const Car = mongoose.model('Car');
    const car = await Car.findById(this.car);
    if (car) {
      this.totalAmount = (car.pricePerDay * this.totalDays) + this.insurance.cost;
    }
  }
  next();
});

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  return `${this.totalDays} day${this.totalDays > 1 ? 's' : ''}`;
});

// Method to check if booking can be cancelled
bookingSchema.methods.canCancel = function() {
  const now = new Date();
  const hoursUntilStart = (this.startDate - now) / (1000 * 60 * 60);
  return hoursUntilStart > 24 && this.status === 'confirmed';
};

module.exports = mongoose.model('Booking', bookingSchema);
