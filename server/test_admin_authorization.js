const BASE_URL = 'http://localhost:5000/api';

async function runAuthorizationTests() {
  console.log('=== RUNNING ADMIN AUTHORIZATION & SECURITY TEST SUITE ===\n');

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const custEmail = `customer.auth.${randomSuffix}@example.com`;
  const adminEmail = `admin.auth.${randomSuffix}@example.com`;
  const password = 'Password@12345';

  // 1. Register a normal customer
  const custRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Regular Customer',
      email: custEmail,
      phone: '9876511111',
      password,
    }),
  });
  const custData = await custRes.json();
  const customerToken = custData.data?.token || custData.data?.tokens?.accessToken;

  if (!customerToken) {
    console.error('FAIL: Could not register customer:', custData);
    process.exit(1);
  }
  console.log(`  ✓ Registered normal customer: ${custEmail} (Role: ${custData.data?.user?.role})`);

  // 2. Register an admin with authorized secret
  const adminRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Artisan Gurjeet',
      email: adminEmail,
      phone: '7018183172',
      password,
      adminSecret: process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key',
    }),
  });
  const adminData = await adminRes.json();
  const adminToken = adminData.data?.token || adminData.data?.tokens?.accessToken;

  if (!adminToken) {
    console.error('FAIL: Could not register admin:', adminData);
    process.exit(1);
  }
  console.log(`  ✓ Registered admin: ${adminEmail} (Role: ${adminData.data?.user?.role})`);

  // Fetch a product ID for product/review tests
  const prodRes = await fetch(`${BASE_URL}/products`);
  const prods = (await prodRes.json()).data?.products || [];
  const testProduct = prods[0];
  const testProdId = String(testProduct?._id);

  // -------------------------------------------------------------
  // Test 1: Products Route Authorization (POST, PUT, DELETE)
  // -------------------------------------------------------------
  console.log('\n--- 1. Product Management Authorization ---');

  // Customer attempting POST /api/products
  const custAddProd = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      title: 'Unauthorized Item',
      price: 999,
      category: 'scarves',
      craftTechnique: 'Hand-Knitted',
      material: 'Wool',
      description: 'Attempted hack',
    }),
  });
  if (custAddProd.status === 403) {
    console.log('  ✓ POST /api/products: Normal customer blocked with 403 Forbidden');
  } else {
    console.error('FAIL: Expected 403, got:', custAddProd.status);
    process.exit(1);
  }

  // Admin attempting POST /api/products -> Should Succeed (201)
  const adminAddProd = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: `Admin Handcrafted Cowl ${randomSuffix}`,
      price: 1399,
      category: 'mufflers',
      craftTechnique: 'Hand-Knitted',
      material: '100% Merino Wool',
      description: 'Hand-knitted by Gurjeet.',
      stock: 4,
      isAvailable: true,
      isMadeToOrder: true,
      isFeatured: true,
    }),
  });
  const adminAddData = await adminAddProd.json();
  const createdProdId = adminAddData.data?._id;
  if (adminAddProd.status === 201 && createdProdId) {
    console.log(`  ✓ POST /api/products: Admin authorized with 201 Created (ID: ${createdProdId})`);
  } else {
    console.error('FAIL: Admin product creation failed:', adminAddData);
    process.exit(1);
  }

  // Customer attempting PUT /api/products/:id -> 403
  const custEditProd = await fetch(`${BASE_URL}/products/${createdProdId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ price: 10 }),
  });
  if (custEditProd.status === 403) {
    console.log('  ✓ PUT /api/products/:id: Normal customer blocked with 403 Forbidden');
  } else {
    console.error('FAIL: Expected 403, got:', custEditProd.status);
    process.exit(1);
  }

  // Customer attempting DELETE /api/products/:id -> 403
  const custDelProd = await fetch(`${BASE_URL}/products/${createdProdId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (custDelProd.status === 403) {
    console.log('  ✓ DELETE /api/products/:id: Normal customer blocked with 403 Forbidden');
  } else {
    console.error('FAIL: Expected 403, got:', custDelProd.status);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 2: Orders Route Authorization (GET, PUT status)
  // -------------------------------------------------------------
  console.log('\n--- 2. Orders Management Authorization ---');

  // Customer attempting GET /api/orders -> 403
  const custGetOrders = await fetch(`${BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (custGetOrders.status === 403) {
    console.log('  ✓ GET /api/orders: Normal customer blocked with 403 Forbidden');
  } else {
    console.error('FAIL: Expected 403, got:', custGetOrders.status);
    process.exit(1);
  }

  // Admin attempting GET /api/orders -> 200
  const adminGetOrders = await fetch(`${BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (adminGetOrders.status === 200) {
    console.log('  ✓ GET /api/orders: Admin authorized with 200 OK');
  } else {
    console.error('FAIL: Admin orders fetch failed:', adminGetOrders.status);
    process.exit(1);
  }

  // Create a test order to test PUT status
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerInfo: { name: 'Customer User', phone: '9876511111', email: custEmail },
      shippingAddress: { street: '12 Ridge', city: 'Shimla', state: 'HP', postalCode: '171001' },
      items: [{ productId: createdProdId, quantity: 1 }],
    }),
  });
  const orderData = await orderRes.json();
  const testOrderId = orderData.data?.order?.orderNumber;

  // Customer attempting PUT /api/orders/:id/status -> 403
  const custUpdateOrderStatus = await fetch(`${BASE_URL}/orders/${testOrderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ status: 'Delivered' }),
  });
  if (custUpdateOrderStatus.status === 403) {
    console.log('  ✓ PUT /api/orders/:id/status: Normal customer blocked with 403 Forbidden');
  } else {
    console.error('FAIL: Expected 403, got:', custUpdateOrderStatus.status);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 3: Custom Orders Route Authorization (GET, PUT)
  // -------------------------------------------------------------
  console.log('\n--- 3. Custom Orders Management Authorization ---');

  // Customer attempting GET /api/custom-orders -> 403
  const custGetCustom = await fetch(`${BASE_URL}/custom-orders`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (custGetCustom.status === 403) {
    console.log('  ✓ GET /api/custom-orders: Normal customer blocked with 403 Forbidden');
  } else {
    console.error('FAIL: Expected 403, got:', custGetCustom.status);
    process.exit(1);
  }

  // Admin attempting GET /api/custom-orders -> 200
  const adminGetCustom = await fetch(`${BASE_URL}/custom-orders`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (adminGetCustom.status === 200) {
    console.log('  ✓ GET /api/custom-orders: Admin authorized with 200 OK');
  } else {
    console.error('FAIL: Admin custom orders fetch failed:', adminGetCustom.status);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 4: Reviews Management Authorization (GET, PUT moderate, DELETE)
  // -------------------------------------------------------------
  console.log('\n--- 4. Reviews Management Authorization ---');

  // Customer attempting GET /api/reviews -> 403
  const custGetReviews = await fetch(`${BASE_URL}/reviews`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (custGetReviews.status === 403) {
    console.log('  ✓ GET /api/reviews: Normal customer blocked with 403 Forbidden');
  } else {
    console.error('FAIL: Expected 403, got:', custGetReviews.status);
    process.exit(1);
  }

  // Admin attempting GET /api/reviews -> 200
  const adminGetReviews = await fetch(`${BASE_URL}/reviews`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminReviewsData = await adminGetReviews.json();
  if (adminGetReviews.status === 200 && Array.isArray(adminReviewsData.data)) {
    console.log(`  ✓ GET /api/reviews: Admin authorized with 200 OK (Found ${adminReviewsData.data.length} reviews)`);
  } else {
    console.error('FAIL: Admin reviews fetch failed:', adminReviewsData);
    process.exit(1);
  }

  const testReview = adminReviewsData.data[0];
  const testRevId = testReview?._id || 'rev_mem_001';

  // Customer attempting PUT /api/reviews/:id/moderate -> 403
  const custModReview = await fetch(`${BASE_URL}/reviews/${testRevId}/moderate`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ isApproved: false }),
  });
  if (custModReview.status === 403) {
    console.log('  ✓ PUT /api/reviews/:id/moderate: Normal customer blocked with 403 Forbidden');
  } else {
    console.error('FAIL: Expected 403, got:', custModReview.status);
    process.exit(1);
  }

  // Admin attempting PUT /api/reviews/:id/moderate -> 200
  const adminModReview = await fetch(`${BASE_URL}/reviews/${testRevId}/moderate`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ isApproved: false }),
  });
  if (adminModReview.status === 200) {
    console.log('  ✓ PUT /api/reviews/:id/moderate: Admin successfully moderated review (Hidden)');
  } else {
    console.error('FAIL: Admin review moderation failed:', adminModReview.status);
    process.exit(1);
  }

  // Customer attempting DELETE /api/reviews/:id -> 403
  const custDelReview = await fetch(`${BASE_URL}/reviews/${testRevId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (custDelReview.status === 403) {
    console.log('  ✓ DELETE /api/reviews/:id: Normal customer blocked with 403 Forbidden');
  } else {
    console.error('FAIL: Expected 403, got:', custDelReview.status);
    process.exit(1);
  }

  // Clean up created test product by admin
  await fetch(`${BASE_URL}/products/${createdProdId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  console.log('\n🎉 ALL 10 ADMIN AUTHORIZATION & SECURITY TESTS PASSED WITH 100% SUCCESS!');
}

runAuthorizationTests().catch((err) => {
  console.error('Authorization test execution failed:', err);
  process.exit(1);
});
