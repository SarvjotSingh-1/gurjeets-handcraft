/**
 * Comprehensive Automated Security Audit Verification
 * Gurjeet's Handcraft - Production Security Verification Suite
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let totalTests = 0;
let passedTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
          rawBody: body,
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      const dataStr = typeof postData === 'string' ? postData : JSON.stringify(postData);
      req.write(dataStr);
    }
    req.end();
  });
}

console.log('\n=============================================================');
console.log('🛡️ Gurjeet\'s Handcraft - Production Security Audit Suite');
console.log('=============================================================\n');

async function runSecurityAudit() {
  const PORT = 5000;
  const BASE_URL = `http://localhost:${PORT}/api`;

  // 1. Security Headers Verification
  await test('1. HTTP Security Headers are enforced and X-Powered-By is disabled', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET',
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff', 'X-Content-Type-Options must be nosniff');
    assert.strictEqual(res.headers['x-frame-options'], 'SAMEORIGIN', 'X-Frame-Options must be SAMEORIGIN');
    assert.strictEqual(res.headers['x-xss-protection'], '1; mode=block', 'X-XSS-Protection must be 1; mode=block');
    assert.strictEqual(res.headers['x-powered-by'], undefined, 'X-Powered-By must be completely removed');
    assert(res.headers['content-security-policy'], 'Content-Security-Policy header must be present');
  });

  // 2. CORS Policy Verification
  await test('2. CORS policy rejects untrusted external origins and allows whitelisted client', async () => {
    // Untrusted Origin
    const blockedRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET',
      headers: {
        Origin: 'http://malicious-phishing-site.com',
      },
    });
    assert.strictEqual(blockedRes.statusCode, 403, 'Untrusted origin must be rejected with 403 Forbidden');

    // Trusted Origin
    const allowedRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET',
      headers: {
        Origin: 'http://localhost:5173',
      },
    });
    assert.strictEqual(allowedRes.statusCode, 200, 'Whitelisted origin must succeed with 200 OK');
  });

  // 3. Admin Privilege Escalation Backdoor Removal
  await test('3. Admin Privilege Escalation: Registering as admin@gurjeetshandcraft.com without secret is rejected', async () => {
    const uniqueEmail = `admin_imposter_${Date.now()}@gurjeetshandcraft.com`;
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        name: 'Imposter Admin',
        email: uniqueEmail,
        password: 'password123',
        role: 'admin',
        // No adminSecret provided
      }
    );

    assert.strictEqual(res.statusCode, 403, 'Must return 403 Forbidden when attempting admin escalation without valid secret');
    assert(res.data.message.includes('Forbidden'), 'Response should state forbidden admin credentials');
  });

  // 4. Input Validation & Type Enforcement on Authentication
  await test('4. Input Validation: Malicious non-string NoSQL injection payloads are rejected (400)', async () => {
    // Attempting object injection for email: { $gt: "" }
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        email: { $gt: '' },
        password: 'any_password',
      }
    );

    // Sanitizer removes $gt leaving empty object, or validation catches invalid email type
    assert.strictEqual(res.statusCode, 400, 'Must return 400 Bad Request on invalid input types');
  });

  // 5. Contact Inquiries Data Privacy: Admin Only
  await test('5. Customer Data Privacy: GET /api/contact is protected and rejects unauthenticated callers (401)', async () => {
    const unauthRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/contact',
      method: 'GET',
    });

    assert.strictEqual(unauthRes.statusCode, 401, 'Unauthenticated access to customer messages must be rejected with 401');
  });

  // 6. Admin Endpoints Role-Based Authorization
  let customerToken = '';
  let adminToken = '';

  await test('6. Role Authorization: Customer token is strictly forbidden (403) from accessing admin endpoints', async () => {
    // Register normal customer
    const custEmail = `audit_cust_${Date.now()}@example.com`;
    const custRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Audit Customer',
        email: custEmail,
        password: 'customer_secure_pass_123',
      }
    );
    assert.strictEqual(custRes.statusCode, 201);
    customerToken = custRes.data.data.token;
    assert(customerToken, 'Customer token must exist');

    // Register valid admin using configured secret
    const adminEmail = `audit_admin_${Date.now()}@example.com`;
    const adminSecret = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key';
    const adminRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Verified Admin',
        email: adminEmail,
        password: 'admin_secure_pass_123',
        role: 'admin',
        adminSecret: adminSecret,
      }
    );
    assert.strictEqual(adminRes.statusCode, 201);
    adminToken = adminRes.data.data.token;
    assert(adminToken, 'Admin token must exist');

    // Test 1: Customer cannot read contact messages
    const custContactRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/contact',
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.strictEqual(custContactRes.statusCode, 403, 'Customer should receive 403 Forbidden for GET /api/contact');

    // Test 2: Admin CAN read contact messages
    const adminContactRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/contact',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminContactRes.statusCode, 200, 'Admin should receive 200 OK for GET /api/contact');

    // Test 3: Customer cannot create products
    const custProdRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/products',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
      },
      {
        title: 'Hacked Product',
        price: 1,
        category: 'scarves',
        craftTechnique: 'Hand-Knitted',
        material: 'Wool',
        description: 'Unauthorized creation',
      }
    );
    assert.strictEqual(custProdRes.statusCode, 403, 'Customer cannot create products (403)');
  });

  // 7. NoSQL Injection Operator Sanitization
  await test('7. NoSQL Sanitizer: Recursively strips operators prefixed with "$" or containing "."', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/contact',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Sanitizer Test',
        email: 'sanitizer@example.com',
        phone: '7018183172',
        subject: 'Inquiry',
        message: 'Normal message',
        $where: 'malicious_code()',
        'nested.injection': 'danger',
      }
    );

    // Sanitizer cleans $where and nested.injection while processing valid fields
    assert.strictEqual(res.statusCode, 201, 'Should accept sanitized payload');
    const saved = res.data.data.contactMessage;
    assert.strictEqual(saved['$where'], undefined, '$where operator must be completely stripped');
    assert.strictEqual(saved['nested.injection'], undefined, 'Dot-notation key must be stripped');
  });

  // 8. File Upload Validation & Extension Spoofing Defense
  await test('8. File Upload Defense: Rejects non-image and executable file extensions', () => {
    const uploadMiddlewarePath = path.resolve(__dirname, '../server/src/middleware/upload.middleware.js');
    const content = fs.readFileSync(uploadMiddlewarePath, 'utf8');

    assert(content.includes('ALLOWED_EXTENSIONS'), 'upload.middleware.js must define ALLOWED_EXTENSIONS');
    assert(content.includes('.jpg'), 'Must allow .jpg');
    assert(content.includes('.webp'), 'Must allow .webp');
    assert(content.includes('isExtValid'), 'Must validate file extension alongside MIME type');
    assert(content.includes('memoryStorage'), 'Must strictly store buffers in memory, never disk execution');
  });

  // 9. Client Source Secret Cleansing & Git Ignore
  await test('9. Zero Secrets in Source Code & .env files ignored by git', () => {
    // RegisterPage check
    const regPath = path.resolve(__dirname, '../client/src/pages/auth/RegisterPage.jsx');
    const regContent = fs.readFileSync(regPath, 'utf8');
    assert(!regContent.includes(process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key'), 'RegisterPage must NOT leak admin passcodes');

    // LoginPage check
    const loginPath = path.resolve(__dirname, '../client/src/pages/auth/LoginPage.jsx');
    const loginContent = fs.readFileSync(loginPath, 'utf8');
    assert(!loginContent.includes(process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key'), 'LoginPage must NOT contain hardcoded admin credentials');

    // .gitignore check
    const serverGitignore = path.resolve(__dirname, '../server/.gitignore');
    assert(fs.existsSync(serverGitignore), 'server/.gitignore must exist');
    const serverGitignoreContent = fs.readFileSync(serverGitignore, 'utf8');
    assert(serverGitignoreContent.includes('.env'), 'server/.gitignore must ignore .env');

    const rootGitignore = path.resolve(__dirname, '../.gitignore');
    const rootGitignoreContent = fs.readFileSync(rootGitignore, 'utf8');
    assert(rootGitignoreContent.includes('.env'), 'root .gitignore must ignore .env');
  });

  // 10. Pricing & Payment Security
  await test('10. Price Recalculation & Payment Security: Backend recalculates all prices and locks payment status', async () => {
    // Submit order request with bogus total and fake payment status
    const orderRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        customerInfo: {
          name: 'Security Test Customer',
          phone: '9876543210',
          email: 'audit_order@example.com',
        },
        shippingAddress: {
          street: '123 Artisan Valley Road',
          city: 'Shimla',
          state: 'Himachal Pradesh',
          postalCode: '171001',
          country: 'India',
        },
        items: [
          {
            productId: '66d000000000000000000001',
            quantity: 1,
            unitPrice: 1, // Tampered price attempt
          },
        ],
        totalAmount: 1, // Tampered total attempt
        paymentStatus: 'Completed', // Tampered payment attempt
      }
    );

    assert.strictEqual(orderRes.statusCode, 201);
    const ord = orderRes.data.data.order;
    // Price must be recalculated to actual product price (1899)
    assert.strictEqual(ord.items[0].unitPrice, 1899, 'Backend must use live product price (1899), not client price (1)');
    assert.strictEqual(ord.subtotal, 1899, 'Subtotal must be recalculated by backend');
    assert.strictEqual(ord.paymentStatus, 'Pending', 'Payment status must be initialized to Pending, ignoring client claims');
  });

  // 11. Rate Limiting Headers & Threshold Protection
  await test('11. Rate Limiting: Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining) are returned', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: 'ratelimit@example.com',
      password: 'testpassword',
    });

    assert(res.headers['x-ratelimit-limit'], 'Must send X-RateLimit-Limit header');
    assert(res.headers['x-ratelimit-remaining'] !== undefined, 'Must send X-RateLimit-Remaining header');
  });

  // 12. Error Shielding
  await test('12. Error Response Shielding: errorHandler conceals stack traces when NODE_ENV is production', () => {
    const errorMiddlewarePath = path.resolve(__dirname, '../server/src/middleware/error.middleware.js');
    const content = fs.readFileSync(errorMiddlewarePath, 'utf8');

    assert(content.includes("isProduction && statusCode >= 500"), 'Must mask 500 messages in production');
    assert(content.includes("!isProduction && { stack: error.stack }"), 'Must hide stack trace when in production');
  });

  console.log('\n-------------------------------------------------------------');
  console.log(`Results: ${passedTests} / ${totalTests} tests passed`);
  console.log('-------------------------------------------------------------\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL SECURITY AUDIT TESTS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME SECURITY TESTS FAILED. Review output above.\n');
    process.exit(1);
  }
}

runSecurityAudit().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
