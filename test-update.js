// Test script to simulate the module update API call
const fetch = require('node-fetch');

async function testModuleUpdate() {
  const moduleId = 'cmes16m170001sii225a1sbnn'; // "Intro to BCS"
  
  // Test different scenarios
  const scenarios = [
    {
      name: 'Set to null (None)',
      data: {
        title: 'Intro to BCS - Updated',
        parentModuleId: null
      }
    },
    {
      name: 'Set to undefined',
      data: {
        title: 'Intro to BCS - Updated',
        parentModuleId: undefined
      }
    },
    {
      name: 'Set to empty string',
      data: {
        title: 'Intro to BCS - Updated',
        parentModuleId: ''
      }
    },
    {
      name: 'Set to valid parent module',
      data: {
        title: 'Intro to BCS - Updated',
        parentModuleId: 'cmewyvdl60001w3676tesst8k' // "Neurons" module
      }
    },
    {
      name: 'Set to non-existent module',
      data: {
        title: 'Intro to BCS - Updated',
        parentModuleId: 'invalid-id'
      }
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n=== Testing: ${scenario.name} ===`);
    console.log('Data being sent:', JSON.stringify(scenario.data, null, 2));
    
    try {
      const response = await fetch(`http://localhost:3000/api/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Note: This won't work without authentication, but we can see what the API expects
        },
        body: JSON.stringify(scenario.data),
      });
      
      const result = await response.text();
      console.log('Status:', response.status);
      console.log('Response:', result);
      
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

testModuleUpdate();
