const mongoose = require('mongoose');
const Car = require('./models/Car');

// Simple test script to check cars without populate
async function testCarsSimple() {
  try {
    console.log('🔍 Testing Cars API (Simple)...');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/car-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Count total cars
    const totalCars = await Car.countDocuments();
    console.log(`📊 Total cars in database: ${totalCars}`);

    // Count available cars
    const availableCars = await Car.countDocuments({ availability: true });
    console.log(`🚗 Available cars: ${availableCars}`);

    // Get all cars (without populate to avoid model issues)
    const allCars = await Car.find({}).select('name brand model pricePerDay availability location isActive');
    console.log('\n📋 All Cars:');
    allCars.forEach((car, index) => {
      console.log(`${index + 1}. ${car.name} (${car.brand} ${car.model}) - $${car.pricePerDay}/day - Available: ${car.availability} - Active: ${car.isActive}`);
    });

    // Get only available cars
    const availableOnly = await Car.find({ availability: true, isActive: true }).select('name brand model pricePerDay availability location');
    console.log(`\n🚗 Available Cars Only (${availableOnly.length}):`);
    availableOnly.forEach((car, index) => {
      console.log(`${index + 1}. ${car.name} - ${car.brand} ${car.model} - $${car.pricePerDay}/day`);
    });

  } catch (error) {
    console.error('❌ Error testing cars:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Disconnected from MongoDB');
  }
}

// Run the test
testCarsSimple();
