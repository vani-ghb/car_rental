const http = require('http');

// Test if backend server is running
function testServerStatus() {
  console.log('🔍 Checking Backend Server Status...\n');

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is RUNNING!`);
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`🌐 URL: http://localhost:5000`);
    console.log(`💚 Health Check: http://localhost:5000/api/health`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`📝 Response: ${response.message || 'OK'}`);
      } catch (e) {
        console.log(`📝 Response: ${data}`);
      }

      console.log('\n🎉 Backend server is working correctly!');
      console.log('   Your frontend should now be able to fetch cars.');
      console.log('\n🔧 Next Steps:');
      console.log('1. Refresh your browser');
      console.log('2. Go to the booking page');
      console.log('3. The car select should now show available cars');
    });
  });

  req.on('error', (err) => {
    console.log('❌ Server is NOT RUNNING!');
    console.log(`🔴 Error: ${err.message}`);

    console.log('\n🔧 How to Start the Backend Server:');
    console.log('=====================================');
    console.log('1. Open a new terminal/command prompt');
    console.log('2. Navigate to the backend folder:');
    console.log('   cd backend');
    console.log('3. Install dependencies (if not done):');
    console.log('   npm install');
    console.log('4. Start the server:');
    console.log('   npm run dev');
    console.log('5. You should see: "🚀 Server is running successfully!"');
    console.log('6. Then refresh your browser and try the booking page again');

    console.log('\n🔍 After starting the server, run this test again:');
    console.log('   node test-server-status.js');
  });

  req.on('timeout', () => {
    console.log('⏰ Request timed out - server may be starting up...');
    req.destroy();
  });

  req.end();
}

// Run the test
testServerStatus();
