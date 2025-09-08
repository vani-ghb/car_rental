const mongoose = require('mongoose');
const Car = require('./models/Car');
const User = require('./models/User'); // Register User model

// Test script to check cars in database and fix availability
async function checkAndFixCars() {
  try {
    console.log('🔍 Checking Cars in Database...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/car-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Check all cars
    const allCars = await Car.find({});
    console.log(`📊 Total Cars in Database: ${allCars.length}`);

    if (allCars.length > 0) {
      console.log('\n📋 All Cars:');
      allCars.forEach((car, index) => {
        console.log(`${index + 1}. ${car.name} (${car.brand} ${car.model})`);
        console.log(`   - Availability: ${car.availability}`);
        console.log(`   - Is Active: ${car.isActive}`);
        console.log(`   - Price: $${car.pricePerDay}/day`);
        console.log(`   - Category: ${car.category}`);
        console.log(`   - Location: ${car.location}`);
        console.log('');
      });
    }

    // Check available cars (what the API would return)
    const availableCars = await Car.find({
      availability: true,
      isActive: true
    });

    console.log(`🚗 Available Cars (API would return): ${availableCars.length}`);

    if (availableCars.length === 0) {
      console.log('⚠️  No available cars found! This explains why car select is disabled.');
      console.log('   Fixing car availability...\n');

      // Update all cars to be available
      const updateResult = await Car.updateMany(
        {},
        {
          availability: true,
          isActive: true
        }
      );

      console.log(`✅ Updated ${updateResult.modifiedCount} cars to be available`);

      // Check again
      const fixedAvailableCars = await Car.find({
        availability: true,
        isActive: true
      });

      console.log(`🎉 Now ${fixedAvailableCars.length} cars are available!`);

      if (fixedAvailableCars.length > 0) {
        console.log('\n📋 Available Cars:');
        fixedAvailableCars.forEach((car, index) => {
          console.log(`${index + 1}. ${car.name} (${car.brand} ${car.model}) - $${car.pricePerDay}/day`);
        });
      }
    } else {
      console.log('✅ Cars are already available!');
      console.log('\n📋 Available Cars:');
      availableCars.forEach((car, index) => {
        console.log(`${index + 1}. ${car.name} (${car.brand} ${car.model}) - $${car.pricePerDay}/day`);
      });
    }

    console.log('\n🔧 API TEST:');
    console.log('============');

    // Test the API query that the frontend uses
    const apiCars = await Car.find({
      isActive: true,
      availability: true
    })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('-__v');

    console.log(`✅ API would return: ${apiCars.length} cars`);
    console.log('   These cars should now appear in your booking form!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📪 Disconnected from MongoDB');
  }
}

// Run the check
checkAndFixCars();
