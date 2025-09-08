const mongoose = require('mongoose');

// Test script to verify CRUD operations for all models
async function testCRUDOperations() {
  try {
    console.log('🔍 Testing CRUD Operations...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/car-rental', {
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

    // Test data
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };

    const testCar = {
      name: 'Test Car',
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      pricePerDay: 50,
      location: 'Downtown',
      availability: true,
      isActive: true,
      description: 'Test car for CRUD operations',
      features: ['AC', 'GPS'],
      images: ['test-image.jpg']
    };

    console.log('🚗 Testing CARS CRUD:');
    console.log('==================');

    // CREATE - Car
    console.log('➕ CREATE: Adding test car...');
    const newCar = new Car(testCar);
    await newCar.save();
    console.log(`✅ Car created with ID: ${newCar._id}`);

    // READ - Car
    console.log('📖 READ: Finding all cars...');
    const allCars = await Car.find({}).select('name brand model pricePerDay availability');
    console.log(`✅ Found ${allCars.length} cars`);

    // UPDATE - Car
    console.log('✏️  UPDATE: Updating car price...');
    const updatedCar = await Car.findByIdAndUpdate(
      newCar._id,
      { pricePerDay: 60 },
      { new: true }
    );
    console.log(`✅ Car updated. New price: $${updatedCar.pricePerDay}/day`);

    // DELETE - Car
    console.log('🗑️  DELETE: Removing test car...');
    await Car.findByIdAndDelete(newCar._id);
    console.log('✅ Car deleted');

    console.log('\n👤 Testing USERS CRUD:');
    console.log('====================');

    // CREATE - User
    console.log('➕ CREATE: Adding test user...');
    const newUser = new User(testUser);
    await newUser.save();
    console.log(`✅ User created with ID: ${newUser._id}`);

    // READ - User
    console.log('📖 READ: Finding all users...');
    const allUsers = await User.find({}).select('name email role');
    console.log(`✅ Found ${allUsers.length} users`);

    // UPDATE - User
    console.log('✏️  UPDATE: Updating user name...');
    const updatedUser = await User.findByIdAndUpdate(
      newUser._id,
      { name: 'Updated Test User' },
      { new: true }
    );
    console.log(`✅ User updated. New name: ${updatedUser.name}`);

    // DELETE - User
    console.log('🗑️  DELETE: Removing test user...');
    await User.findByIdAndDelete(newUser._id);
    console.log('✅ User deleted');

    console.log('\n📝 Testing BOOKINGS CRUD:');
    console.log('========================');

    // First create a user and car for booking
    const bookingUser = new User({ ...testUser, email: 'booking@example.com' });
    await bookingUser.save();

    const bookingCar = new Car({ ...testCar, name: 'Booking Car' });
    await bookingCar.save();

    const testBooking = {
      user: bookingUser._id,
      car: bookingCar._id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-05'),
      pickupLocation: 'Airport',
      returnLocation: 'Airport',
      driverInfo: {
        name: 'John Doe',
        licenseNumber: 'DL123456',
        licenseExpiry: new Date('2025-12-31'),
        phone: '123-456-7890',
        age: 30
      },
      totalAmount: 200,
      status: 'confirmed'
    };

    // CREATE - Booking
    console.log('➕ CREATE: Adding test booking...');
    const newBooking = new Booking(testBooking);
    await newBooking.save();
    console.log(`✅ Booking created with ID: ${newBooking._id}`);

    // READ - Booking
    console.log('📖 READ: Finding all bookings...');
    const allBookings = await Booking.find({}).populate('user', 'name email').populate('car', 'name brand model');
    console.log(`✅ Found ${allBookings.length} bookings`);

    // UPDATE - Booking
    console.log('✏️  UPDATE: Updating booking status...');
    const updatedBooking = await Booking.findByIdAndUpdate(
      newBooking._id,
      { status: 'completed' },
      { new: true }
    );
    console.log(`✅ Booking updated. New status: ${updatedBooking.status}`);

    // DELETE - Booking
    console.log('🗑️  DELETE: Removing test booking...');
    await Booking.findByIdAndDelete(newBooking._id);
    console.log('✅ Booking deleted');

    // Clean up test data
    await User.findByIdAndDelete(bookingUser._id);
    await Car.findByIdAndDelete(bookingCar._id);

    console.log('\n⭐ Testing REVIEWS CRUD:');
    console.log('=======================');

    // First create user and car for review
    const reviewUser = new User({ ...testUser, email: 'review@example.com' });
    await reviewUser.save();

    const reviewCar = new Car({ ...testCar, name: 'Review Car' });
    await reviewCar.save();

    const testReview = {
      user: reviewUser._id,
      car: reviewCar._id,
      rating: 5,
      comment: 'Excellent car, highly recommended!',
      isActive: true
    };

    // CREATE - Review
    console.log('➕ CREATE: Adding test review...');
    const newReview = new Review(testReview);
    await newReview.save();
    console.log(`✅ Review created with ID: ${newReview._id}`);

    // READ - Review
    console.log('📖 READ: Finding all reviews...');
    const allReviews = await Review.find({}).populate('user', 'name').populate('car', 'name');
    console.log(`✅ Found ${allReviews.length} reviews`);

    // UPDATE - Review
    console.log('✏️  UPDATE: Updating review rating...');
    const updatedReview = await Review.findByIdAndUpdate(
      newReview._id,
      { rating: 4 },
      { new: true }
    );
    console.log(`✅ Review updated. New rating: ${updatedReview.rating}`);

    // DELETE - Review
    console.log('🗑️  DELETE: Removing test review...');
    await Review.findByIdAndDelete(newReview._id);
    console.log('✅ Review deleted');

    // Clean up
    await User.findByIdAndDelete(reviewUser._id);
    await Car.findByIdAndDelete(reviewCar._id);

    console.log('\n💳 Testing PAYMENTS CRUD:');
    console.log('========================');

    // First create user for payment
    const paymentUser = new User({ ...testUser, email: 'payment@example.com' });
    await paymentUser.save();

    const testPayment = {
      user: paymentUser._id,
      amount: 250,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'credit_card',
      transactionId: 'txn_123456789',
      description: 'Car rental payment'
    };

    // CREATE - Payment
    console.log('➕ CREATE: Adding test payment...');
    const newPayment = new Payment(testPayment);
    await newPayment.save();
    console.log(`✅ Payment created with ID: ${newPayment._id}`);

    // READ - Payment
    console.log('📖 READ: Finding all payments...');
    const allPayments = await Payment.find({}).populate('user', 'name email');
    console.log(`✅ Found ${allPayments.length} payments`);

    // UPDATE - Payment
    console.log('✏️  UPDATE: Updating payment status...');
    const updatedPayment = await Payment.findByIdAndUpdate(
      newPayment._id,
      { status: 'refunded' },
      { new: true }
    );
    console.log(`✅ Payment updated. New status: ${updatedPayment.status}`);

    // DELETE - Payment
    console.log('🗑️  DELETE: Removing test payment...');
    await Payment.findByIdAndDelete(newPayment._id);
    console.log('✅ Payment deleted');

    // Clean up
    await User.findByIdAndDelete(paymentUser._id);

    console.log('\n🎉 CRUD Operations Test Summary:');
    console.log('===============================');
    console.log('✅ Cars: CREATE, READ, UPDATE, DELETE - WORKING');
    console.log('✅ Users: CREATE, READ, UPDATE, DELETE - WORKING');
    console.log('✅ Bookings: CREATE, READ, UPDATE, DELETE - WORKING');
    console.log('✅ Reviews: CREATE, READ, UPDATE, DELETE - WORKING');
    console.log('✅ Payments: CREATE, READ, UPDATE, DELETE - WORKING');
    console.log('\n🎯 All CRUD operations are functioning correctly!');

  } catch (error) {
    console.error('❌ Error during CRUD testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📪 Disconnected from MongoDB');
  }
}

// Run the test
testCRUDOperations();
