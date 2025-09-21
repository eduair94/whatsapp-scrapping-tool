// Test the specific phone number that's causing the issue
const { WhatsAppChecker } = require('whatsapp-number-checker');

async function testSpecificNumber() {
  console.log('Testing specific phone number: +59898297150');

  try {
    const checker = new WhatsAppChecker({
      apiKey: 'test-invalid-key',
      throwOnLimit: false,
      timeout: 5000,
    });

    // Test the exact number from the screenshot
    const result = await checker.checkNumber('+59898297150');
    console.log('Result:', result);

    // Also test without the + prefix
    const result2 = await checker.checkNumber('59898297150');
    console.log('Result without +:', result2);

    // Test various formats
    const formats = [
      '+59898297150',
      '59898297150',
      '+598-9829-7150',
      '598 98 297 150',
    ];

    for (const format of formats) {
      try {
        console.log(`\nTesting format: ${format}`);
        const result = await checker.checkNumber(format);
        console.log('Success:', result.error || 'No error');
      } catch (error) {
        console.log('Error:', error.message);
      }
    }
  } catch (error) {
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testSpecificNumber().catch(console.error);
