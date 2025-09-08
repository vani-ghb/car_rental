const mongoose = require('mongoose');
const User = require('./models/User');

// Test script to check users and create a test user
async function testUsers() {
  try {
    console.log('🔍 Checking Users in Database...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/car-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Check existing users
    const userCount = await User.countDocuments();
    console.log(`👤 Total Users: ${userCount}`);

    if (userCount > 0) {
      const users = await User.find({}).select('name email role isActive');
      console.log('📋 Existing Users:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Active' : 'Inactive'}`);
      });
    } else {
      console.log('⚠️  No users found in database!');
      console.log('   Creating a test user...\n');

      // Create a test user
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        phone: '123-456-7890'
      });

      await testUser.save();
      console.log('✅ Test user created successfully!');
      console.log(`   Name: ${testUser.name}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: password123`);
      console.log(`   Role: ${testUser.role}`);
    }

    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('====================');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\nUse these credentials to login to your application.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📪 Disconnected from MongoDB');
  }
}

// Run the test
testUsers();
