const http = require('http');

// Simple test to check if backend is running
function testBackendConnection() {
  console.log('🔍 Testing backend connection...\n');

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📄 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('📄 Response:', jsonData);

        if (res.statusCode === 200) {
          console.log('✅ Backend is running and responding correctly!');
          console.log('\n🚀 Now you can test login from your frontend.');
          console.log('💡 Make sure your frontend is running on http://localhost:3000 or http://localhost:5173');
        } else {
          console.log('❌ Backend responded with error status');
        }
      } catch (e) {
        console.log('📄 Raw response:', data);
        console.log('❌ Failed to parse response as JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error('🚨 Connection failed:', e.message);
    console.log('\n💡 Possible issues:');
    console.log('   1. Backend server is not running');
    console.log('   2. Wrong port (should be 5000)');
    console.log('   3. Firewall blocking connection');
    console.log('\n🔧 To start backend:');
    console.log('   cd backend && npm start');
  });

  req.setTimeout(5000, () => {
    console.log('⏰ Request timed out');
    req.destroy();
  });

  req.end();
}

// Test login endpoint
function testLoginEndpoint() {
  console.log('\n🔐 Testing login endpoint...\n');

  const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('📄 Response:', jsonData);

        if (res.statusCode === 200) {
          console.log('✅ Login endpoint is working!');
        } else if (res.statusCode === 401) {
          console.log('ℹ️  Login failed (expected for test user) - this is normal');
        } else {
          console.log('❌ Login endpoint error');
        }
      } catch (e) {
        console.log('📄 Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('🚨 Login test failed:', e.message);
  });

  req.write(postData);
  req.end();
}

// Run tests
console.log('🚀 Backend Connection Test\n');
console.log('=' .repeat(50));

testBackendConnection();

// Wait a bit then test login
setTimeout(() => {
  testLoginEndpoint();
}, 1000);
