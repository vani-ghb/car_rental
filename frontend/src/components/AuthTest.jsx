import React, { useState } from 'react';
import { authAPI } from '../services/api';

const AuthTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message, success = true) => {
    setTestResults(prev => [...prev, { message, success, timestamp: new Date() }]);
  };

  const testLogin = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      addResult('Testing login with test@example.com...');

      // Test login
      const loginResponse = await authAPI.login('test@example.com', 'testpassword123');
      addResult('✅ Login successful', true);
      addResult(`User: ${loginResponse.user.name} (${loginResponse.user.email})`, true);
      addResult(`Token received: ${loginResponse.token ? 'Yes' : 'No'}`, true);

      // Test profile fetching
      addResult('Testing profile fetch...');
      const profileResponse = await authAPI.getProfile();
      addResult('✅ Profile fetch successful', true);
      addResult(`Profile data: ${JSON.stringify(profileResponse.user, null, 2)}`, true);

      addResult('🎉 All authentication tests passed!', true);

    } catch (error) {
      addResult(`❌ Test failed: ${error.message}`, false);
      console.error('Auth test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🔐 Authentication Test</h2>
      <p>This component tests the login and profile fetching functionality.</p>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testLogin}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? 'Testing...' : 'Test Authentication'}
        </button>

        <button
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '5px',
        padding: '15px',
        minHeight: '200px',
        backgroundColor: '#f8f9fa'
      }}>
        <h3>Test Results:</h3>
        {testResults.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            Click "Test Authentication" to run the tests
          </p>
        ) : (
          <div>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '5px 0',
                  color: result.success ? '#28a745' : '#dc3545',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  borderBottom: index < testResults.length - 1 ? '1px solid #eee' : 'none'
                }}
              >
                [{result.timestamp.toLocaleTimeString()}] {result.message}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d7ff',
        borderRadius: '5px'
      }}>
        <h4>📋 Test Information:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Test user: <code>test@example.com</code></li>
          <li>Password: <code>testpassword123</code></li>
          <li>Tests login API and profile fetching</li>
          <li>Verifies token storage and retrieval</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthTest;
