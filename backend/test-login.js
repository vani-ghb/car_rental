const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

// Test login function
async function testLogin(email, password) {
  try {
    console.log('🔍 Testing login with:', { email, password });

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    console.log('📡 Response status:', response.status);
    console.log('📄 Response data:', data);

    if (response.ok) {
      console.log('✅ Login successful!');
      return data;
    } else {
      console.log('❌ Login failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('🚨 Network error:', error.message);
    return null;
  }
}

// Test health check
async function testHealth() {
  try {
    console.log('🏥 Testing health endpoint...');

    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();

    console.log('📡 Health status:', response.status);
    console.log('📄 Health data:', data);

    return response.ok;
  } catch (error) {
    console.error('🚨 Health check failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting backend tests...\n');

  // Test 1: Health check
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('❌ Backend server is not running!');
    console.log('💡 Please start the backend server first:');
    console.log('   cd backend && npm start');
    return;
  }

  console.log('✅ Backend server is running!\n');

  // Test 2: Login with test credentials
  console.log('🔐 Testing login...');
  const loginResult = await testLogin('test@example.com', 'password123');

  if (loginResult) {
    console.log('✅ Login test passed!');
  } else {
    console.log('❌ Login test failed - this might be expected if user doesn\'t exist');
  }

  console.log('\n🎉 Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testLogin, testHealth };
