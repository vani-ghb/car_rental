const mongoose = require('mongoose');

const driverInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  licenseExpiry: { type: Date, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true }
});

const insuranceSchema = new mongoose.Schema({
  type: { type: String, enum: ['basic', 'premium'], default: 'basic' },
  cost: { type: Number, default: 0 }
});

const bookingSchema = new mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pickupLocation: { type: String, required: true },
    returnLocation: { type: String, required: true },
    driverInfo: driverInfoSchema,
    specialRequests: { type: String },
    insurance: insuranceSchema,
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
