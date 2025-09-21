// Test the API key and basic connectivity
const { WhatsAppChecker } = require('whatsapp-number-checker');

async function testAPIKey() {
  // Test with a mock API key first
  console.log('Testing with invalid API key...');

  try {
    const checker = new WhatsAppChecker({
      apiKey: 'test-invalid-key',
      throwOnLimit: false,
      timeout: 5000,
    });

    const result = await checker.checkNumber('+1234567890');
    console.log('Result with invalid key:', result);
  } catch (error) {
    console.log('Error with invalid key:', error.message);
    console.log('Error stack:', error.stack);
  }

  console.log('\n=== Test completed ===');
}

testAPIKey().catch(console.error);
