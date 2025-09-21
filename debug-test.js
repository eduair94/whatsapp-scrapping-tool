// Quick debug test to check phone number format issue
const { WhatsAppChecker } = require('whatsapp-number-checker');

async function testPhoneFormat() {
  // Test different phone number formats
  const testNumbers = [
    '+59898297150',
    '59898297150',
    '+1-555-123-4567',
    '+1234567890',
  ];

  console.log('Testing phone number formats...');

  for (const number of testNumbers) {
    console.log(`\nTesting: ${number}`);

    // Create a mock checker to see what happens
    try {
      const checker = new WhatsAppChecker({
        apiKey: 'test-key', // This won't work but we can see the format issue
        throwOnLimit: false,
        timeout: 5000,
      });

      console.log('Checker created successfully');
      // Don't actually call the API, just see if the checker accepts the format
    } catch (error) {
      console.log('Error creating checker:', error.message);
    }
  }
}

testPhoneFormat().catch(console.error);
