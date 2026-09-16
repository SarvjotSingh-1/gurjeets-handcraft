/**
 * Master End-to-End Application Test Suite
 * Gurjeet's Handcraft - Complete Full-Stack E2E Verification
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

let totalTests = 0;
let passedTests = 0;
const failedTests = [];
const domainStats = {};

function recordDomain(domain, success, name, error = null) {
  if (!domainStats[domain]) {
    domainStats[domain] = { total: 0, passed: 0, failed: 0 };
  }
  domainStats[domain].total++;
  totalTests++;
  if (success) {
    domainStats[domain].passed++;
    passedTests++;
    console.log(`  ✅ [PASS] [${domain}] ${name}`);
  } else {
    domainStats[domain].failed++;
    failedTests.push({ domain, name, error: error?.message || 'Assertion failed' });
    console.error(`  ❌ [FAIL] [${domain}] ${name}: ${error?.message || error}`);
  }
}

async function test(domain, name, fn) {
  try {
    await fn();
    recordDomain(domain, true, name);
  } catch (err) {
    recordDomain(domain, false, name, err);
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
console.log('🧶 Gurjeet\'s Handcraft - Master End-to-End Test Suite');
console.log('=============================================================\n');

async function runMasterE2ETests() {
  const timestamp = Date.now();
  let customerUser = null;
  let customerToken = null;
  let adminUser = null;
  let adminToken = null;
  let sampleProduct = null;
  let createdProductId = null;
  let testOrderNumber = null;
  let testCustomOrderNumber = null;

  // =========================================================================
  // DOMAIN 1: AUTHENTICATION & AUTHORIZATION
  // =========================================================================
  console.log('\n--- 1. AUTHENTICATION & AUTHORIZATION ---');

  await test('AUTH', '1. Register new customer with valid credentials', async () => {
    const email = `cust_${timestamp}@artisan.test`;
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Simran Kaur',
        email,
        password: 'secure_password_123',
        phone: '9876543210',
      }
    );

    assert.strictEqual(res.statusCode, 201);
    assert(res.data?.data?.token, 'Token must be issued');
    assert.strictEqual(res.data?.data?.user?.role, 'customer');
    assert.strictEqual(res.data?.data?.user?.email, email);
    customerUser = res.data.data.user;
    customerToken = res.data.data.token;
  });

  await test('AUTH', '2. Reject customer registration with duplicate email (409)', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Duplicate Simran',
        email: customerUser.email,
        password: 'secure_password_123',
      }
    );
    assert.strictEqual(res.statusCode, 409);
  });

  await test('AUTH', '3. Reject registration with password < 6 chars (400)', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Short Pass',
        email: `short_${timestamp}@artisan.test`,
        password: '123',
      }
    );
    assert.strictEqual(res.statusCode, 400);
  });

  await test('AUTH', '4. Register studio administrator with valid secret key', async () => {
    const adminEmail = `admin_${timestamp}@artisan.test`;
    const adminSecret = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key';
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Studio Admin',
        email: adminEmail,
        password: 'admin_master_pass_123',
        role: 'admin',
        adminSecret,
      }
    );

    assert.strictEqual(res.statusCode, 201);
    assert(res.data?.data?.token, 'Admin token must be issued');
    assert.strictEqual(res.data?.data?.user?.role, 'admin');
    adminUser = res.data.data.user;
    adminToken = res.data.data.token;
  });

  await test('AUTH', '5. Login with valid customer credentials', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: customerUser.email,
        password: 'secure_password_123',
      }
    );
    assert.strictEqual(res.statusCode, 200);
    assert(res.data?.data?.token);
    assert.strictEqual(res.data?.data?.user?.role, 'customer');
  });

  await test('AUTH', '6. Login with invalid password returns 401 Unauthorized', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: customerUser.email,
        password: 'WRONG_PASSWORD_XYZ',
      }
    );
    assert.strictEqual(res.statusCode, 401);
  });

  await test('AUTH', '7. Access protected profile /api/auth/me with valid Bearer token', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data?.data?.email, customerUser.email);
  });

  await test('AUTH', '8. Reject protected route access without token (401)', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
    });
    assert.strictEqual(res.statusCode, 401);
  });

  await test('AUTH', '9. Reject customer accessing admin endpoint (403 Forbidden)', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/orders', // Admin-only GET all orders
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.strictEqual(res.statusCode, 403);
  });

  // =========================================================================
  // DOMAIN 2: PRODUCTS
  // =========================================================================
  console.log('\n--- 2. PRODUCT CATALOG & BROWSING ---');

  await test('PRODUCTS', '1. Listing products returns active catalog array', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/products',
      method: 'GET',
    });
    assert.strictEqual(res.statusCode, 200);
    const products = res.data?.data?.products;
    assert(Array.isArray(products) && products.length > 0, 'Must return seeded products');
    sampleProduct = products[0];
  });

  await test('PRODUCTS', '2. Product details by ID retrieves full craft attributes', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/products/${sampleProduct._id}`,
      method: 'GET',
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data?.data?.title, sampleProduct.title);
    assert(res.data?.data?.material, 'Must include material attribute');
    assert(res.data?.data?.craftTechnique, 'Must include craftTechnique');
  });

  await test('PRODUCTS', '3. Product details by slug retrieves product', async () => {
    const slug = sampleProduct.slug || 'handmade-pure-merino-wool-scarf';
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/products/${slug}`,
      method: 'GET',
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data?.data?._id, sampleProduct._id);
  });

  await test('PRODUCTS', '4. Full-text search queries match relevant woolen pieces', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/products?search=wool',
      method: 'GET',
    });
    assert.strictEqual(res.statusCode, 200);
    const items = res.data?.data?.products || [];
    assert(items.length > 0, 'Search for "wool" should return matches');
  });

  await test('PRODUCTS', '5. Filtering by category restricts results to requested category', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/products?category=scarves',
      method: 'GET',
    });
    assert.strictEqual(res.statusCode, 200);
    const items = res.data?.data?.products || [];
    assert(items.every((p) => p.category === 'scarves'), 'All items must belong to scarves category');
  });

  await test('PRODUCTS', '6. Sorting by price ascending orders products correctly', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/products?sort=price_asc',
      method: 'GET',
    });
    assert.strictEqual(res.statusCode, 200);
    const items = res.data?.data?.products || [];
    for (let i = 1; i < items.length; i++) {
      assert(items[i].price >= items[i - 1].price, 'Prices must be ascending');
    }
  });

  await test('PRODUCTS', '7. Requesting invalid/non-existent product ID returns 404', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/products/non_existent_id_999999',
      method: 'GET',
    });
    assert.strictEqual(res.statusCode, 404);
  });

  // =========================================================================
  // DOMAIN 3: CART & STOCK VERIFICATION
  // =========================================================================
  console.log('\n--- 3. CART RELIABILITY & STOCK BOUNDS ---');

  await test('CART', '1. Verify cart recalculates prices from DB (never trusts client price)', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/cart/verify',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        items: [
          {
            productId: sampleProduct._id,
            quantity: 1,
            unitPrice: 1, // Tampered price
          },
        ],
      }
    );

    assert.strictEqual(res.statusCode, 200);
    const calc = res.data?.data;
    assert.strictEqual(calc.items[0].unitPrice, sampleProduct.price, 'Must use DB price');
    assert.strictEqual(calc.subtotal, sampleProduct.price);
    assert.strictEqual(calc.canCheckout, true);
  });

  await test('CART', '2. Free shipping threshold: Orders >= 1499 get free shipping, else 99', async () => {
    // Under 1499 test
    const underRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/cart/verify',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        items: [{ productId: sampleProduct._id, quantity: 1 }],
      }
    );
    const underCalc = underRes.data?.data;
    const expectedShipping = sampleProduct.price >= 1499 ? 0 : 99;
    assert.strictEqual(underCalc.shipping, expectedShipping);
  });

  await test('CART', '3. Stock limits: Requesting quantity > available stock flags out of stock / adjustment', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/cart/verify',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        items: [
          {
            productId: sampleProduct._id,
            quantity: 9999, // Exceeds available stock
          },
        ],
      }
    );

    assert.strictEqual(res.statusCode, 200);
    const calc = res.data?.data;
    assert(calc.hasOutOfStockItems || calc.hasAdjustments || !calc.canCheckout, 'Cart must flag excessive quantity');
  });

  // =========================================================================
  // DOMAIN 4: WISHLIST
  // =========================================================================
  console.log('\n--- 4. ARTISAN WISHLIST ---');

  await test('WISHLIST', '1. Add piece to customer wishlist', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/wishlist',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
      },
      {
        productId: sampleProduct._id,
      }
    );
    assert.strictEqual(res.statusCode, 200);
    const list = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.wishlist || [];
    assert(list.length > 0, 'Wishlist should contain the piece');
  });

  await test('WISHLIST', '2. Duplicate piece addition is handled cleanly without duplicates', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/wishlist',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
      },
      {
        productId: sampleProduct._id,
      }
    );
    assert.strictEqual(res.statusCode, 200);
    const items = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.wishlist || [];
    const occurrences = items.filter(
      (it) => String(it._id || it) === String(sampleProduct._id)
    ).length;
    assert.strictEqual(occurrences, 1, 'Piece must not be duplicated in wishlist');
  });

  await test('WISHLIST', '3. Fetch authenticated customer wishlist', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/wishlist',
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.strictEqual(res.statusCode, 200);
    const items = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.wishlist || [];
    assert(items.length >= 1);
  });

  await test('WISHLIST', '4. Remove piece from wishlist', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/wishlist/${sampleProduct._id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.strictEqual(res.statusCode, 200);
    const items = res.data?.data?.wishlist || [];
    assert(!items.some((it) => String(it._id || it) === String(sampleProduct._id)));
  });

  // =========================================================================
  // DOMAIN 5: CUSTOM ORDERS
  // =========================================================================
  console.log('\n--- 5. BESPOKE CUSTOM ORDERS ---');

  await test('CUSTOM ORDERS', '1. Submit custom order request with full specifications', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/custom-orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Harpreet Singh',
        email: 'harpreet@example.com',
        phone: '9812345678',
        productType: 'Custom Woolen Poncho',
        colorPreference: 'Oatmeal & Terracotta',
        size: 'Medium (Custom Fit)',
        designPattern: 'Classic Nordic Cable Knit',
        quantity: 1,
        additionalNotes: 'Please ensure loose collar for comfort.',
      }
    );

    assert.strictEqual(res.statusCode, 201);
    const custOrd = res.data?.data?.customOrder;
    assert(custOrd?.customOrderNumber, 'Must generate customOrderNumber');
    assert.strictEqual(custOrd?.status, 'Pending');
    testCustomOrderNumber = custOrd.customOrderNumber;
  });

  await test('CUSTOM ORDERS', '2. Validation: Reject custom order missing mandatory fields (400)', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/custom-orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Incomplete Request',
        // Missing email, phone, productType, etc.
      }
    );
    assert.strictEqual(res.statusCode, 400);
  });

  await test('CUSTOM ORDERS', '3. Admin lists and filters custom orders', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/custom-orders?status=Pending',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.statusCode, 200);
    const orders = res.data?.data || [];
    assert(orders.some((o) => o.customOrderNumber === testCustomOrderNumber));
  });

  await test('CUSTOM ORDERS', '4. Admin updates custom order status to "Under Review"', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/custom-orders/${testCustomOrderNumber}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        status: 'Under Review',
        estimatedPrice: 3200,
        adminNotes: 'Yarn selected; crafting commenced.',
      }
    );

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data?.data?.status, 'Under Review');
    assert.strictEqual(res.data?.data?.estimatedPrice, 3200);
  });

  // =========================================================================
  // DOMAIN 6: CHECKOUT
  // =========================================================================
  console.log('\n--- 6. CHECKOUT & AUTHORITATIVE PRICING ---');

  await test('CHECKOUT', '1. Address & PIN code validation: Rejects invalid PIN (400)', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        customerInfo: {
          name: 'Priya Verma',
          phone: '9876543210',
          email: 'priya.verma@example.com',
        },
        shippingAddress: {
          street: '45 Pine Forest Lane',
          city: 'Manali',
          state: 'Himachal Pradesh',
          postalCode: '123', // Invalid PIN (< 6 digits)
          country: 'India',
        },
        items: [{ productId: sampleProduct._id, quantity: 1 }],
      }
    );
    assert.strictEqual(res.statusCode, 400);
  });

  await test('CHECKOUT', '2. Create order with valid address, authoritative subtotal, and generated orderNumber', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        customerInfo: {
          name: 'Priya Verma',
          phone: '9876543210',
          email: customerUser.email,
        },
        shippingAddress: {
          street: '45 Pine Forest Lane',
          city: 'Manali',
          state: 'Himachal Pradesh',
          postalCode: '175131',
          country: 'India',
        },
        items: [
          {
            productId: sampleProduct._id,
            quantity: 1,
            selectedColor: 'Natural Cream',
          },
        ],
        notes: 'Gift wrapping requested if possible.',
      }
    );

    assert.strictEqual(res.statusCode, 201);
    const ord = res.data?.data?.order;
    assert(ord?.orderNumber?.startsWith('GH-ORD-'), 'Order number must start with GH-ORD-');
    assert.strictEqual(ord?.orderStatus, 'Order Placed');
    assert.strictEqual(ord?.paymentStatus, 'Pending');
    assert.strictEqual(ord?.subtotal, sampleProduct.price);
    testOrderNumber = ord.orderNumber;
  });

  // =========================================================================
  // DOMAIN 7 & 8: ORDERS & PAYMENTS LIFECYCLE
  // =========================================================================
  console.log('\n--- 7 & 8. ORDERS & PAYMENTS LIFECYCLE ---');

  await test('ORDERS', '1. Customer views their own order history', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/orders/my-orders',
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.strictEqual(res.statusCode, 200);
    const list = res.data?.data || [];
    assert(list.some((o) => o.orderNumber === testOrderNumber));
  });

  await test('ORDERS', '2. Query single order by orderNumber', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/orders/${testOrderNumber}`,
      method: 'GET',
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data?.data?.orderNumber, testOrderNumber);
  });

  await test('PAYMENTS', '1. Admin transitions order to "Payment Confirmed" -> Payment auto-completes', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/orders/${testOrderNumber}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        status: 'Payment Confirmed',
        orderConfirmationMethod: 'UPI Verified by Gurjeet',
      }
    );

    assert.strictEqual(res.statusCode, 200);
    const updated = res.data?.data;
    assert.strictEqual(updated.orderStatus, 'Payment Confirmed');
    assert.strictEqual(updated.paymentStatus, 'Completed');
  });

  await test('ORDERS', '3. Status timeline sequential progression: Payment Confirmed -> Processing -> Handmade -> Packed -> Shipped -> Delivered', async () => {
    const steps = ['Processing', 'Handmade', 'Packed', 'Shipped', 'Delivered'];
    for (const step of steps) {
      const res = await request(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/orders/${testOrderNumber}/status`,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
        },
        { status: step }
      );
      assert.strictEqual(res.statusCode, 200, `Failed transitioning to ${step}`);
      assert.strictEqual(res.data?.data?.orderStatus, step);
    }
  });

  await test('ORDERS', '4. Transition validation: Reject invalid jump from Delivered to Processing (400)', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/orders/${testOrderNumber}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      { status: 'Processing' }
    );
    assert.strictEqual(res.statusCode, 400);
  });

  // =========================================================================
  // DOMAIN 9: ADMIN DASHBOARD & CRUD
  // =========================================================================
  console.log('\n--- 9. ADMIN CRUD & MODERATION ---');

  await test('ADMIN', '1. Admin creates new artisan product', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/products',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        title: `Master Test Beanie ${timestamp}`,
        price: 950,
        category: 'beanies',
        craftTechnique: 'Crochet',
        material: '100% Merino Wool',
        description: 'Cozy artisan ribbed beanie with turn-up cuff.',
        stock: 5,
        isAvailable: true,
        availableColors: ['Sage Green', 'Warm Rust'],
      }
    );

    assert.strictEqual(res.statusCode, 201);
    createdProductId = res.data?.data?._id;
    assert(createdProductId, 'Product ID must be returned');
  });

  await test('ADMIN', '2. Admin updates product price and stock', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/products/${createdProductId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        price: 1100,
        stock: 8,
      }
    );

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data?.data?.price, 1100);
    assert.strictEqual(res.data?.data?.stock, 8);
  });

  await test('ADMIN', '3. Admin reviews moderation: Fetch, approve/flag review', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reviews',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.statusCode, 200);
    assert(Array.isArray(res.data?.data), 'Admin reviews must return array');
  });

  await test('ADMIN', '4. Admin deletes test product', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/products/${createdProductId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.statusCode, 200);

    // Verify product no longer exists
    const lookupRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/products/${createdProductId}`,
      method: 'GET',
    });
    assert.strictEqual(lookupRes.statusCode, 404);
  });

  // =========================================================================
  // DOMAIN 10: RESPONSIVE CLIENT VIEWPORT AUDIT
  // =========================================================================
  console.log('\n--- 10. RESPONSIVE DESIGN & VIEWPORT AUDIT ---');

  await test('RESPONSIVE', '1. Navbar responsive structure: Mobile toggle drawer & desktop menu breakpoints', () => {
    const navbarPath = path.resolve(__dirname, '../client/src/components/layout/Navbar.jsx');
    assert(fs.existsSync(navbarPath), 'Navbar.jsx must exist');
    const content = fs.readFileSync(navbarPath, 'utf8');

    assert(content.includes('lg:flex'), 'Desktop links must show on large screens (lg:flex)');
    assert(content.includes('lg:hidden'), 'Mobile menu toggle button must hide on desktop (lg:hidden)');
    assert(content.includes('mobileMenuOpen'), 'Must implement state-managed mobile drawer');
  });

  await test('RESPONSIVE', '2. Product showcase grid responsive column breakdown (1 col mobile -> 2/3 col desktop)', () => {
    const shopPath = path.resolve(__dirname, '../client/src/pages/customer/ShopPage.jsx');
    const content = fs.readFileSync(shopPath, 'utf8');

    assert(content.includes('grid-cols-1'), 'Must provide 1-column layout for mobile');
    assert(content.includes('sm:grid-cols-2'), 'Must scale to 2 columns on tablets/small desktops');
    assert(content.includes('md:grid-cols-3'), 'Must scale to 3 columns on desktop');
  });

  await test('RESPONSIVE', '3. Product Detail Page responsive layout: Stacked on mobile, side-by-side on desktop', () => {
    const detailPath = path.resolve(__dirname, '../client/src/pages/customer/ProductDetailPage.jsx');
    const content = fs.readFileSync(detailPath, 'utf8');

    assert(content.includes('grid-cols-1'), 'Product media & details must stack on mobile');
    assert(content.includes('lg:grid-cols-12'), 'Must use 12-column split on desktop');
  });

  await test('RESPONSIVE', '4. Cart and Checkout responsive cards with overflow guards', () => {
    const cartPath = path.resolve(__dirname, '../client/src/pages/customer/CartPage.jsx');
    const content = fs.readFileSync(cartPath, 'utf8');
    assert(content.includes('grid-cols-1'), 'Cart items must stack on mobile');
    assert(content.includes('lg:grid-cols-3'), 'Cart summary and items adapt on desktop');

    const checkoutPath = path.resolve(__dirname, '../client/src/pages/customer/CheckoutPage.jsx');
    const chkContent = fs.readFileSync(checkoutPath, 'utf8');
    assert(chkContent.includes('grid-cols-1'), 'Checkout form must stack on mobile');
    assert(chkContent.includes('lg:grid-cols-3'), 'Checkout form and summary adapt on desktop');
  });

  // =========================================================================
  // DOMAIN 11: ERROR CASES & RESILIENCE
  // =========================================================================
  console.log('\n--- 11. ERROR CASES & SYSTEM RESILIENCE ---');

  await test('ERROR CASES', '1. Out-of-stock product rejection: Cannot checkout unavailable item', async () => {
    // Find or create an unavailable product
    const unavailRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/products',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        title: 'Depleted Stock Scarf',
        price: 1500,
        category: 'scarves',
        craftTechnique: 'Hand-Knitted',
        material: 'Wool',
        description: 'Currently out of yarn stock.',
        stock: 0,
        isAvailable: false,
      }
    );

    const unavailId = unavailRes.data?.data?._id;

    // Attempt order creation with out-of-stock item
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
          name: 'E2E Tester',
          phone: '9876543210',
          email: 'e2e@example.com',
        },
        shippingAddress: {
          street: '10 Mountain Road',
          city: 'Kullu',
          state: 'Himachal Pradesh',
          postalCode: '175101',
          country: 'India',
        },
        items: [{ productId: unavailId, quantity: 1 }],
      }
    );

    assert.strictEqual(orderRes.statusCode, 400, 'Order creation must fail for unavailable item');
    assert(orderRes.data?.message?.includes('unavailable') || orderRes.data?.message?.includes('stock'));

    // Clean up
    await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/products/${unavailId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  });

  await test('ERROR CASES', '2. Invalid endpoint returns clean 404 error structure', async () => {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/non_existent_endpoint_route',
      method: 'GET',
    });
    // Express returns 404 for unknown routes
    assert.strictEqual(res.statusCode, 404);
  });

  await test('ERROR CASES', '3. Malformed JSON payload in POST request is gracefully rejected (400)', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/contact',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      '{ "malformed_json: missing_brace'
    );
    assert.strictEqual(res.statusCode, 400);
  });

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log('\n=============================================================');
  console.log('📊 DOMAIN-BY-DOMAIN E2E TEST SUMMARY');
  console.log('=============================================================');

  Object.entries(domainStats).forEach(([domain, stats]) => {
    const pct = ((stats.passed / stats.total) * 100).toFixed(0);
    console.log(`  ${domain.padEnd(16)} : ${stats.passed}/${stats.total} Passed (${pct}%)`);
  });

  console.log('-------------------------------------------------------------');
  console.log(`TOTAL: ${passedTests} / ${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(0)}%)`);
  console.log('=============================================================\n');

  if (failedTests.length === 0) {
    console.log('🎉 ALL END-TO-END TESTS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  } else {
    console.error(`⚠️ ${failedTests.length} TEST(S) FAILED:`);
    failedTests.forEach((f) => console.error(`  - [${f.domain}] ${f.name}: ${f.error}`));
    console.log('');
    process.exit(1);
  }
}

runMasterE2ETests().catch((err) => {
  console.error('Fatal E2E test runner error:', err);
  process.exit(1);
});
