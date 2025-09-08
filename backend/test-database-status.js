const mongoose = require('mongoose');
require('dotenv').config();

// Test script to check database status and existing data
async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking Database Status...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Import models
    const User = require('./models/User');
    const Car = require('./models/Car');
    const Booking = require('./models/Booking');
    const Review = require('./models/Review');
    const Payment = require('./models/Payment');

    console.log('📊 DATABASE STATUS:');
    console.log('==================');

    // Check Users
    const userCount = await User.countDocuments();
    console.log(`👤 Users: ${userCount}`);
    if (userCount > 0) {
      const users = await User.find({}).select('name email role').limit(5);
      console.log('   Recent users:');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    // Check Cars
    const carCount = await Car.countDocuments();
    const availableCars = await Car.countDocuments({ availability: true, isActive: true });
    console.log(`🚗 Cars: ${carCount} total, ${availableCars} available`);
    if (carCount > 0) {
      const cars = await Car.find({}).select('name brand model pricePerDay availability category').limit(5);
      console.log('   Recent cars:');
      cars.forEach(car => {
        console.log(`   - ${car.name} (${car.brand} ${car.model}) - $${car.pricePerDay}/day - ${car.availability ? 'Available' : 'Unavailable'} - ${car.category}`);
      });
    }

    // Check Bookings
    const bookingCount = await Booking.countDocuments();
    console.log(`📝 Bookings: ${bookingCount}`);
    if (bookingCount > 0) {
      const bookings = await Booking.find({}).populate('user', 'name').populate('car', 'name').select('status totalAmount').limit(5);
      console.log('   Recent bookings:');
      bookings.forEach(booking => {
        console.log(`   - ${booking.user?.name || 'Unknown'} booked ${booking.car?.name || 'Unknown car'} - $${booking.totalAmount} - ${booking.status}`);
      });
    }

    // Check Reviews
    const reviewCount = await Review.countDocuments();
    console.log(`⭐ Reviews: ${reviewCount}`);
    if (reviewCount > 0) {
      const reviews = await Review.find({}).populate('user', 'name').populate('car', 'name').select('rating comment').limit(5);
      console.log('   Recent reviews:');
      reviews.forEach(review => {
        console.log(`   - ${review.user?.name || 'Unknown'}: ${review.rating} stars - "${review.comment?.substring(0, 50)}..."`);
      });
    }

    // Check Payments
    const paymentCount = await Payment.countDocuments();
    console.log(`💳 Payments: ${paymentCount}`);
    if (paymentCount > 0) {
      const payments = await Payment.find({}).populate('user', 'name').select('amount status paymentMethod').limit(5);
      console.log('   Recent payments:');
      payments.forEach(payment => {
        console.log(`   - ${payment.user?.name || 'Unknown'}: $${payment.amount} - ${payment.status} - ${payment.paymentMethod}`);
      });
    }

    console.log('\n🔍 API ENDPOINT CHECKS:');
    console.log('=======================');

    // Test Cars API endpoint logic
    console.log('Testing Cars API logic:');
    const apiCars = await Car.find({ isActive: true, availability: true })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-__v');

    console.log(`✅ Cars API would return: ${apiCars.length} cars`);
    if (apiCars.length === 0) {
      console.log('⚠️  WARNING: No available cars found! This explains "No cars available" message.');
      console.log('   Possible solutions:');
      console.log('   1. Run the seed script: node seed-cars.js');
      console.log('   2. Update existing cars to set availability: true and isActive: true');
      console.log('   3. Create new cars with proper data');
    } else {
      console.log('   Available cars for booking:');
      apiCars.forEach((car, index) => {
        console.log(`   ${index + 1}. ${car.name} - ${car.brand} ${car.model} - $${car.pricePerDay}/day`);
      });
    }

    console.log('\n🎯 SUMMARY:');
    console.log('===========');
    console.log(`Total Records: ${userCount + carCount + bookingCount + reviewCount + paymentCount}`);
    console.log(`Available Cars: ${availableCars}`);
    console.log(`Active Bookings: ${bookingCount}`);

    if (availableCars === 0) {
      console.log('\n🚨 ISSUE FOUND: No available cars!');
      console.log('This is why the booking form shows "No cars available at the moment"');
    } else {
      console.log('\n✅ Database looks healthy with available cars!');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📪 Disconnected from MongoDB');
  }
}

// Run the check
checkDatabaseStatus();
