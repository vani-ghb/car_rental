const mongoose = require('mongoose');
const Car = require('./models/Car');
const User = require('./models/User');

// Test the exact API endpoint that the frontend calls
async function testCarsAPI() {
  try {
    console.log('🔍 Testing Cars API Endpoint...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/car-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Test the exact query the frontend makes: GET /api/cars?availability=true
    console.log('📡 Testing API Query: GET /api/cars?availability=true');
    console.log('   Filter: { isActive: true, availability: true }\n');

    const cars = await Car.find({
      isActive: true,
      availability: true
    })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('-__v');

    console.log(`📊 API Response: ${cars.length} cars found`);

    if (cars.length === 0) {
      console.log('❌ No cars returned - this explains why car select is empty!');
      console.log('\n🔧 POSSIBLE FIXES:');
      console.log('1. Seed the database with cars: node seed-cars.js');
      console.log('2. Update existing cars to be available:');
      console.log('   - Set availability: true');
      console.log('   - Set isActive: true');
      console.log('3. Check if backend server is running on port 5000');

      // Check total cars in database
      const totalCars = await Car.countDocuments();
      console.log(`\n📊 Total cars in database: ${totalCars}`);

      if (totalCars > 0) {
        console.log('   Checking car status...');
        const allCars = await Car.find({}).select('name availability isActive');
        console.log('   Car status:');
        allCars.forEach((car, index) => {
          console.log(`   ${index + 1}. ${car.name} - Available: ${car.availability}, Active: ${car.isActive}`);
        });

        console.log('\n🔧 Auto-fixing car availability...');
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

    console.log('\n🔧 FRONTEND DEBUGGING:');
    console.log('=======================');
    console.log('1. Open browser developer tools (F12)');
    console.log('2. Go to Network tab');
    console.log('3. Load the booking page');
    console.log('4. Look for request to: /api/cars?availability=true');
    console.log('5. Check the response - should contain cars array');
    console.log('6. Check Console tab for any error messages');

    console.log('\n🔧 BACKEND CHECK:');
    console.log('==================');
    console.log('1. Make sure backend server is running: cd backend && npm run dev');
    console.log('2. Check if server is listening on port 5000');
    console.log('3. Test API directly: curl http://localhost:5000/api/cars?availability=true');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📪 Disconnected from MongoDB');
  }
}

// Run the test
testCarsAPI();
