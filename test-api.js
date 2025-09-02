// Simple script to test the failing API endpoint
const fetch = require('node-fetch');

async function testModuleAPI() {
  const moduleId = 'cmewyvdl60001w3676tesst8k'; // "Neurons" module
  const url = `http://localhost:3000/api/modules/${moduleId}`;
  
  console.log(`Testing: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.text();
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response:', data);
    
    if (!response.ok) {
      console.log('\n❌ Request failed!');
      console.log('Status:', response.status, response.statusText);
    } else {
      console.log('\n✅ Request successful!');
    }
    
  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
}

// Wait a moment for the server to start, then test
setTimeout(testModuleAPI, 3000);
