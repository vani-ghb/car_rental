const mongoose = require('mongoose');
const Car = require('./models/Car');
const User = require('./models/User');

// Direct API test to simulate what the frontend does
async function testAPIDirect() {
  try {
    console.log('🔍 Testing Direct API Call (like frontend)...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/car-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Simulate the exact query the frontend makes
    console.log('📡 Simulating Frontend API Call: GET /api/cars?availability=true\n');

    const cars = await Car.find({
      isActive: true,
      availability: true
    })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('-__v');

    console.log(`📊 Query Result: ${cars.length} cars found`);

    if (cars.length === 0) {
      console.log('❌ No cars returned - this explains the "No cars available" message!');
      console.log('   Possible causes:');
      console.log('   1. No cars in database');
      console.log('   2. Cars have availability: false');
      console.log('   3. Cars have isActive: false');
      console.log('   4. Database connection issues');

      // Check total cars in database
      const totalCars = await Car.countDocuments();
      console.log(`\n📊 Total cars in database: ${totalCars}`);

      if (totalCars > 0) {
        console.log('   Checking car status...');
        const allCars = await Car.find({}).select('name availability isActive');
        allCars.forEach((car, index) => {
          console.log(`   ${index + 1}. ${car.name} - Available: ${car.availability}, Active: ${car.isActive}`);
        });

        console.log('\n🔧 Fixing car availability...');
        const updateResult = await Car.updateMany(
          {},
          { availability: true, isActive: true }
        );
        console.log(`✅ Updated ${updateResult.modifiedCount} cars`);

        // Test again
        const fixedCars = await Car.find({
          isActive: true,
          availability: true
        })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('-__v');

        console.log(`🎉 After fix: ${fixedCars.length} cars available!`);
        if (fixedCars.length > 0) {
          console.log('   Available cars:');
          fixedCars.forEach((car, index) => {
            console.log(`   ${index + 1}. ${car.name} (${car.brand} ${car.model}) - $${car.pricePerDay}/day`);
          });
        }
      } else {
        console.log('   No cars in database at all!');
        console.log('   Run: node seed-cars.js to add sample cars');
      }
    } else {
      console.log('✅ Cars found! API should work correctly.');
      console.log('   Available cars:');
      cars.forEach((car, index) => {
        console.log(`   ${index + 1}. ${car.name} (${car.brand} ${car.model}) - $${car.pricePerDay}/day`);
      });
    }

    console.log('\n🔧 FRONTEND FIX:');
    console.log('================');
    console.log('1. Make sure backend server is running: cd backend && npm run dev');
    console.log('2. Make sure frontend proxy is configured in vite.config.js');
    console.log('3. Refresh your browser and try the booking form again');
    console.log('4. Check browser console for any API errors');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📪 Disconnected from MongoDB');
  }
}

// Run the test
testAPIDirect();
