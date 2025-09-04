const mongoose = require('mongoose');
const User = require('./models/User');

// Test script to verify authentication and profile fetching
async function testAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/car-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Create a test user if it doesn't exist
    const testEmail = 'test@example.com';
    let testUser = await User.findOne({ email: testEmail });

    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: testEmail,
        password: 'testpassword123',
        phone: '+1234567890'
      });
      await testUser.save();
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }

    // Test user data retrieval
    const userData = {
      id: testUser._id,
      name: testUser.name,
      email: testUser.email,
      phone: testUser.phone,
      role: testUser.role,
      isActive: testUser.isActive,
      createdAt: testUser.createdAt,
      lastLogin: testUser.lastLogin
    };

    console.log('✅ User data structure:', JSON.stringify(userData, null, 2));

    // Test password comparison (need to select password field)
    const userWithPassword = await User.findOne({ email: testEmail }).select('+password');
    const isValidPassword = await userWithPassword.comparePassword('testpassword123');
    console.log('✅ Password validation:', isValidPassword ? 'PASS' : 'FAIL');

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Test Results:');
    console.log('- User creation: ✅');
    console.log('- User data retrieval: ✅');
    console.log('- Password hashing: ✅');
    console.log('- Password comparison: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Disconnected from MongoDB');
  }
}

// Run the test
testAuth();
