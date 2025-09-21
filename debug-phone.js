// Debug test for phone number validation before API call
const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber');

function testPhoneNumberValidation() {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const testNumber = '+59898297150';

  console.log('Testing phone number:', testNumber);

  try {
    // Parse the number
    const parsedNumber = phoneUtil.parse(testNumber);
    console.log('Parsed successfully');

    // Check if it's valid
    const isValid = phoneUtil.isValidNumber(parsedNumber);
    console.log('Is valid:', isValid);

    // Format in E164
    const e164 = phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);
    console.log('E164 format:', e164);

    // Get country code
    const country = phoneUtil.getRegionCodeForNumber(parsedNumber);
    console.log('Country:', country);

    // Get national number
    const nationalNumber = parsedNumber.getNationalNumber();
    console.log('National number:', nationalNumber);

    // Check if this could be causing URL issues
    console.log('URL encoded:', encodeURIComponent(e164));
  } catch (error) {
    console.error('Error parsing phone number:', error.message);
  }
}

testPhoneNumberValidation();
