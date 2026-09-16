import http from 'http';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runAuthTests() {
  console.log('=== GURJEET HANDCRAFT AUTHENTICATION TEST SUITE ===\n');

  const testStamp = Date.now();
  const customerEmail = `craftlover_${testStamp}@example.com`;
  const adminEmail = `studio_admin_${testStamp}@gurjeetshandcraft.com`;
  let customerToken = null;
  let adminToken = null;

  // 1. Customer Registration
  console.log('Test 1: Register New Customer');
  const regRes = await request('POST', '/auth/register', {
    name: 'Anita Craft Lover',
    email: customerEmail,
    password: 'password123',
    phone: '9876543210'
  });
  const regData = regRes.body?.data || regRes.body;
  assert(regRes.status === 201, `Customer register status is 201 (got ${regRes.status})`);
  assert(!!regData?.token, 'Customer register returned JWT token');
  assert(regData?.user && regData.user.role === 'customer', 'User role is customer');
  assert(regData?.user?.password === undefined, 'Zero password exposure in registration response');
  customerToken = regData?.token;

  // 2. Duplicate Registration Rejection
  console.log('\nTest 2: Duplicate Email Rejection');
  const dupRes = await request('POST', '/auth/register', {
    name: 'Duplicate Anita',
    email: customerEmail,
    password: 'password123',
    phone: '9876543210'
  });
  assert(dupRes.status === 409 || dupRes.status === 400, `Duplicate registration rejected with 409/400 (got ${dupRes.status})`);

  // 3. Login with Wrong Password
  console.log('\nTest 3: Login with Invalid Password');
  const badLogin = await request('POST', '/auth/login', {
    email: customerEmail,
    password: 'wrong_password'
  });
  assert(badLogin.status === 401, `Wrong password rejected with 401 (got ${badLogin.status})`);

  // 4. Successful Customer Login
  console.log('\nTest 4: Customer Login Success');
  const loginRes = await request('POST', '/auth/login', {
    email: customerEmail,
    password: 'password123'
  });
  const loginData = loginRes.body?.data || loginRes.body;
  assert(loginRes.status === 200, `Login status is 200 (got ${loginRes.status})`);
  assert(!!loginData?.token, 'Login returned valid token');
  assert(loginData?.user?.email === customerEmail, 'User email matches');
  assert(loginData?.user?.password === undefined, 'Zero password exposure in login response');
  customerToken = loginData?.token;

  // 5. Profile Retrieval (/auth/me) with Customer Token
  console.log('\nTest 5: Session Restoration / Current User Profile (/auth/me)');
  const meRes = await request('GET', '/auth/me', null, customerToken);
  const meData = meRes.body?.data || meRes.body;
  assert(meRes.status === 200, `/auth/me returned 200 (got ${meRes.status})`);
  assert(meData?.email === customerEmail, 'Email matches current user');
  assert(meData?.password === undefined, 'Password is NOT exposed on /auth/me');

  // 6. Access with Tampered / Invalid Token
  console.log('\nTest 6: Tampered / Malformed Token Rejection');
  const badTokenRes = await request('GET', '/auth/me', null, 'invalid.tampered.jwt_token');
  assert(badTokenRes.status === 401, `Tampered token returned 401 (got ${badTokenRes.status})`);

  // 7. Missing Token Rejection on Protected Route
  console.log('\nTest 7: Missing Token on Protected Route');
  const noTokenRes = await request('GET', '/auth/me');
  assert(noTokenRes.status === 401, `Missing token returned 401 (got ${noTokenRes.status})`);

  // 8. Customer Attempting Admin-Only Route (Product Creation)
  console.log('\nTest 8: Customer Authorization Boundary Check (403 Forbidden)');
  const custCreateRes = await request('POST', '/products', {
    title: 'Unauthorized Rug',
    price: 999,
    category: 'Other Woolen Handcrafts',
    craftTechnique: 'Crochet',
    material: 'Wool',
    description: 'A test unauthorized rug'
  }, customerToken);
  assert(custCreateRes.status === 403, `Customer blocked with 403 on admin route (got ${custCreateRes.status})`);

  // 9. Admin Registration with Admin Secret
  console.log('\nTest 9: Admin Registration with Passcode');
  const adminRegRes = await request('POST', '/auth/register', {
    name: 'Gurjeet Handcraft Admin',
    email: adminEmail,
    password: 'mock_test_password',
    phone: '7018183172',
    adminSecret: process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key'
  });
  const adminRegData = adminRegRes.body?.data || adminRegRes.body;
  assert(adminRegRes.status === 201, `Admin registered with status 201 (got ${adminRegRes.status})`);
  assert(adminRegData?.user && adminRegData.user.role === 'admin', 'Registered user has admin role');
  adminToken = adminRegData?.token;

  // 10. Admin Accessing Admin-Only Route (Product Creation)
  console.log('\nTest 10: Admin Privileges on Admin-Protected Route');
  const adminCreateRes = await request('POST', '/products', {
    title: `Hand-spun Artisan Muffler ${testStamp}`,
    description: '100% fine Merino wool handmade with knitting needles',
    price: 1850,
    category: 'Mufflers',
    craftTechnique: 'Knitting',
    material: 'Fine Merino Wool',
    availability: 'Available',
    images: ['/assets/products/scarf-1.jpg']
  }, adminToken);
  const adminCreateData = adminCreateRes.body?.data || adminCreateRes.body;
  assert(adminCreateRes.status === 201, `Admin created product successfully with 201 (got ${adminCreateRes.status})`);
  const createdProductId = adminCreateData?._id;

  // 11. Customer Submitting Inquiry Order (Inquiry Model - Zero Payment)
  console.log('\nTest 11: Customer Placing Order Inquiry');
  const orderRes = await request('POST', '/orders', {
    customerInfo: {
      name: 'Anita Craft Lover',
      email: customerEmail,
      phone: '9876543210'
    },
    shippingAddress: {
      street: 'House 42, Craft Lane',
      city: 'Shimla',
      state: 'Himachal Pradesh',
      postalCode: '171001'
    },
    items: [{
      productId: createdProductId,
      quantity: 1,
      selectedColor: 'Warm Walnut'
    }],
    notes: 'Please wrap carefully in artisan brown paper'
  }, customerToken);
  const orderPayload = orderRes.body?.data || orderRes.body;
  const createdOrder = orderPayload?.order || orderPayload;
  assert(orderRes.status === 201, `Order inquiry created with 201 (got ${orderRes.status})`);
  assert(createdOrder?.orderStatus === 'Order Placed' || createdOrder?.orderStatus === 'Inquiry', `Initial status is Order Placed or Inquiry (got ${createdOrder?.orderStatus})`);
  assert(createdOrder?.paymentStatus === 'Pending' || createdOrder?.paymentStatus === undefined, 'Payment status is Pending until Razorpay integration');
  const orderId = createdOrder?._id || createdOrder?.orderNumber;

  // 12. Admin Updating Order Status
  console.log('\nTest 12: Admin Updating Order Status');
  const statusUpdateRes = await request('PUT', `/orders/${orderId}/status`, {
    status: 'Confirmed',
    artisanNotes: 'Confirmed personally via phone with customer'
  }, adminToken);
  const statusUpdateData = statusUpdateRes.body?.data || statusUpdateRes.body;
  assert(statusUpdateRes.status === 200, `Admin updated order status with 200 (got ${statusUpdateRes.status})`);
  assert(statusUpdateData?.orderStatus === 'Confirmed', 'Order status is now Confirmed');

  // 13. Customer Attempting to Update Order Status (Should Be Forbidden)
  console.log('\nTest 13: Customer Updating Order Status Rejection (403 Forbidden)');
  const custUpdateRes = await request('PUT', `/orders/${orderId}/status`, {
    status: 'Delivered'
  }, customerToken);
  assert(custUpdateRes.status === 403, `Customer blocked with 403 from updating order status (got ${custUpdateRes.status})`);

  // 14. Wishlist Operations for Authenticated User
  console.log('\nTest 14: User Wishlist Integration');
  const addWishRes = await request('POST', '/wishlist', {
    productId: createdProductId
  }, customerToken);
  assert(addWishRes.status === 200, `Added to wishlist status 200 (got ${addWishRes.status})`);
  
  const getWishRes = await request('GET', '/wishlist', null, customerToken);
  const getWishData = getWishRes.body?.data || getWishRes.body;
  assert(getWishRes.status === 200, `Fetched wishlist status 200 (got ${getWishRes.status})`);
  assert(Array.isArray(getWishData) && getWishData.some(item => (item?._id || item) === createdProductId), 'Wishlist contains added product');

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAuthTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
