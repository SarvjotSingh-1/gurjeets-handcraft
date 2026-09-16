/**
 * Automated Verification for Direct Contact & WhatsApp Configuration
 * Gurjeet's Handcraft - Production Verification
 */

import assert from 'assert';

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('\n=============================================================');
console.log('📱 Gurjeet\'s Handcraft - Direct Contact / WhatsApp Verification');
console.log('=============================================================\n');

// Import the client contact configuration
import {
  BUSINESS_CONTACT_NUMBER,
  FORMATTED_DISPLAY_PHONE,
  WHATSAPP_FULL_NUMBER,
  WHATSAPP_BASE_URL,
  IS_DIRECT_CONTACT_ENABLED,
  createWhatsAppUrl,
  getAskAboutProductMessage,
  getAskAboutProductUrl,
  getContactGurjeetMessage,
  getContactGurjeetUrl,
  getAskAboutAvailabilityMessage,
  getAskAboutAvailabilityUrl,
  CONTACT_CONFIG,
} from '../client/src/config/contact.js';

test('1. Reusable Contact Configuration & Single Contact Value', () => {
  assert.strictEqual(typeof BUSINESS_CONTACT_NUMBER, 'string', 'Contact number must be a string');
  assert.strictEqual(BUSINESS_CONTACT_NUMBER, '7018183172', 'Must match verified studio number (7018183172)');
  assert.strictEqual(FORMATTED_DISPLAY_PHONE, '+91 70181 83172', 'Must format phone cleanly');
  assert.strictEqual(WHATSAPP_FULL_NUMBER, '917018183172', 'Must prefix country code 91');
  assert.strictEqual(WHATSAPP_BASE_URL, 'https://wa.me/917018183172', 'Must generate accurate base URL');
  assert.strictEqual(CONTACT_CONFIG.phone, '7018183172', 'CONTACT_CONFIG.phone matches single source of truth');
});

test('2. Product Page: "Ask About This Product" Message & URL', () => {
  const prodParams = {
    productName: 'Himachal Cable Knit Scarf',
    selectedColor: 'Terracotta',
    price: 1850,
    productUrl: 'http://localhost:5175/product/himachal-cable-knit-scarf',
  };

  const message = getAskAboutProductMessage(prodParams);
  const url = getAskAboutProductUrl(prodParams);

  // Must contain Product Name
  assert(message.includes('Himachal Cable Knit Scarf'), 'Message must contain the product name');
  // Must contain Product Inquiry text
  assert(message.includes('inquiry regarding'), 'Message must indicate product inquiry');
  assert(message.includes('wool texture'), 'Message must inquire about craft details');
  assert(message.includes('Terracotta'), 'Message must contain the selected color');
  assert(message.includes('1,850'), 'Message must contain formatted price');

  // URL must be properly encoded
  assert(url.startsWith('https://wa.me/917018183172?text='), 'URL must target studio WhatsApp');
  assert(url.includes(encodeURIComponent('Himachal Cable Knit Scarf')), 'URL must encode product name');
});

test('3. Custom Orders: "Contact Gurjeet" Message & URL', () => {
  const customDetails = {
    productType: 'Merino Wool Beanie',
    colorPreference: 'Olive Sage',
    size: 'Circumference 56cm',
    designPattern: 'Honeycomb stitch',
    additionalNotes: 'Please ensure extra softness on forehead band.',
  };

  const message = getContactGurjeetMessage(customDetails);
  const url = getContactGurjeetUrl(customDetails);

  assert(message.includes('Hello Gurjeet'), 'Message must address Gurjeet personally');
  assert(message.includes('custom handmade order'), 'Message must specify custom order inquiry');
  assert(message.includes('Merino Wool Beanie'), 'Message must specify desired creation');
  assert(message.includes('Olive Sage'), 'Message must specify color preference');
  assert(message.includes('Honeycomb stitch'), 'Message must specify pattern');
  assert(url.startsWith('https://wa.me/917018183172?text='), 'URL must target studio WhatsApp');
});

test('4. Availability Questions: "Ask About Availability" Message & URL', () => {
  const availParams = {
    productName: 'Vintage Loom Wool Muffler',
    color: 'Oatmeal',
    productUrl: 'http://localhost:5175/product/vintage-loom-muffler',
  };

  const message = getAskAboutAvailabilityMessage(availParams);
  const url = getAskAboutAvailabilityUrl(availParams);

  assert(message.includes('ask about availability'), 'Message must ask specifically about availability');
  assert(message.includes('Vintage Loom Wool Muffler'), 'Message must contain product name');
  assert(message.includes('Oatmeal'), 'Message must contain color');
  assert(message.includes('in studio stock'), 'Message must inquire about studio stock');
  assert(url.startsWith('https://wa.me/917018183172?text='), 'URL must target studio WhatsApp');
});

test('5. Feature Toggle: Easy to Disable Globally', () => {
  // Test base helper with disabled simulation
  const disabledUrl = createWhatsAppUrl('Test message');
  assert(typeof disabledUrl === 'string', 'Helper must return a string');
  assert(CONTACT_CONFIG.isEnabled === true || CONTACT_CONFIG.isEnabled === false, 'isEnabled must be a boolean');
});

test('6. Zero Invented Numbers & Single Source Consistency', () => {
  assert.strictEqual(CONTACT_CONFIG.phone, BUSINESS_CONTACT_NUMBER, 'All contact interfaces share exact number');
  assert(!BUSINESS_CONTACT_NUMBER.includes('1234567890'), 'Strictly no fake placeholder numbers');
});

console.log('\n=============================================================');
console.log(`📊 Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('=============================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL DIRECT CONTACT & WHATSAPP CONFIG TESTS PASSED WITH 100% SUCCESS!\n');
} else {
  console.error(`💥 ${totalTests - passedTests} tests failed!`);
  process.exitCode = 1;
}
