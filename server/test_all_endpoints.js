/**
 * Comprehensive Automated Test Suite for Gurjeet's Handcraft REST API
 * Tests all requested endpoints, authentication, authorization, and error handling.
 */

const BASE_URL = 'http://localhost:5000/api';

const results = [];

const logTest = (name, passed, details = '') => {
  results.push({ name, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark} - ${name} ${details ? `(${details})` : ''}`);
};

const runSuite = async () => {
  console.log('====================================================');
  console.log('🧪 Starting Full REST API Endpoint Test Suite');
  console.log('====================================================\n');

  let customerToken = '';
  let adminToken = '';
  let testProductId = '';
  let testCustomOrderId = '';
  let testOrderId = '';

  try {
    // -------------------------------------------------------------
    // 1. Categories
    // -------------------------------------------------------------
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    logTest(
      'GET /api/categories',
      catRes.status === 200 && Array.isArray(catData.data) && catData.data.length > 0,
      `Categories count: ${catData.data?.length}`
    );

    // -------------------------------------------------------------
    // 2. Authentication: Register Customer
    // -------------------------------------------------------------
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const custEmail = `tester_${randomSuffix}@example.com`;

    const regCustRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: custEmail,
        password: 'secure_password_123',
        phone: '9876543210',
      }),
    });
    const regCustData = await regCustRes.json();
    logTest(
      'POST /api/auth/register (Customer)',
      regCustRes.status === 201 && !!regCustData.data?.token,
      `User ID: ${regCustData.data?.user?._id}`
    );

    // -------------------------------------------------------------
    // 3. Authentication: Login Customer
    // -------------------------------------------------------------
    const loginCustRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: custEmail,
        password: 'secure_password_123',
      }),
    });
    const loginCustData = await loginCustRes.json();
    customerToken = loginCustData.data?.token;
    logTest(
      'POST /api/auth/login (Customer)',
      loginCustRes.status === 200 && !!customerToken,
      `Token issued`
    );

    // -------------------------------------------------------------
    // 4. Authentication: Register Admin (using adminSecret)
    // -------------------------------------------------------------
    const adminEmail = `admin_test_${randomSuffix}@gurjeetshandcraft.com`;
    const regAdminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Studio Admin Gurjeet',
        email: adminEmail,
        password: 'admin_password_123',
        role: 'admin',
        adminSecret: process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key',
      }),
    });
    const regAdminData = await regAdminRes.json();
    adminToken = regAdminData.data?.token;
    logTest(
      'POST /api/auth/register (Admin with Secret)',
      regAdminRes.status === 201 && regAdminData.data?.user?.role === 'admin',
      `Role: ${regAdminData.data?.user?.role}`
    );

    // -------------------------------------------------------------
    // 5. Authentication: GET /api/auth/me
    // -------------------------------------------------------------
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const meData = await meRes.json();
    logTest(
      'GET /api/auth/me',
      meRes.status === 200 && meData.data?.email === custEmail,
      `Email: ${meData.data?.email}`
    );

    // -------------------------------------------------------------
    // 6. Products: GET /api/products
    // -------------------------------------------------------------
    const prodsRes = await fetch(`${BASE_URL}/products`);
    const prodsData = await prodsRes.json();
    logTest(
      'GET /api/products',
      prodsRes.status === 200 && Array.isArray(prodsData.data?.products),
      `Total products: ${prodsData.data?.total}`
    );

    // -------------------------------------------------------------
    // 7. Products: POST /api/products (Admin Protected)
    // -------------------------------------------------------------
    const newProdPayload = {
      title: `Handcrafted Chunky Wool Cowl ${randomSuffix}`,
      price: 1299,
      category: 'mufflers',
      craftTechnique: 'Hand-Knitted',
      material: '100% Pure Himalayan Wool',
      description: 'Ultra warm chunky knit cowl loop hand-knitted by Gurjeet.',
      stock: 5,
      isAvailable: true,
      availableColors: ['Oatmeal', 'Terracotta'],
    };

    // Unauthenticated test (expect 401)
    const unauthProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProdPayload),
    });
    logTest(
      'POST /api/products (Unauthorized Check -> 401)',
      unauthProdRes.status === 401,
      `Status: ${unauthProdRes.status}`
    );

    // Customer test (expect 403 Forbidden)
    const custProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify(newProdPayload),
    });
    logTest(
      'POST /api/products (Customer Forbidden Check -> 403)',
      custProdRes.status === 403,
      `Status: ${custProdRes.status}`
    );

    // Admin test (expect 201 Created)
    const adminProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newProdPayload),
    });
    const adminProdData = await adminProdRes.json();
    testProductId = adminProdData.data?._id;
    logTest(
      'POST /api/products (Admin Authorized -> 201)',
      adminProdRes.status === 201 && !!testProductId,
      `Product ID: ${testProductId}`
    );

    // -------------------------------------------------------------
    // 8. Products: GET /api/products/:id
    // -------------------------------------------------------------
    const getSingleProdRes = await fetch(`${BASE_URL}/products/${testProductId}`);
    const getSingleProdData = await getSingleProdRes.json();
    logTest(
      'GET /api/products/:id',
      getSingleProdRes.status === 200 && getSingleProdData.data?._id === testProductId,
      `Title: ${getSingleProdData.data?.title}`
    );

    // -------------------------------------------------------------
    // 9. Products: PUT /api/products/:id (Admin Protected)
    // -------------------------------------------------------------
    const updateProdRes = await fetch(`${BASE_URL}/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ price: 1450, stock: 8 }),
    });
    const updateProdData = await updateProdRes.json();
    logTest(
      'PUT /api/products/:id',
      updateProdRes.status === 200 && updateProdData.data?.price === 1450,
      `Updated Price: ₹${updateProdData.data?.price}`
    );

    // Place a purchase order for customer to qualify as verified buyer for review
    await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerInfo: {
          name: 'Artisan Customer',
          phone: '9812345678',
          email: custEmail,
        },
        shippingAddress: {
          street: '12 Ridge Way',
          city: 'Shimla',
          state: 'Himachal Pradesh',
          postalCode: '171001',
          country: 'India',
        },
        items: [{ productId: testProductId, quantity: 1, selectedColor: 'Terracotta' }],
      }),
    });

    // -------------------------------------------------------------
    // 10. Reviews: POST /api/products/:id/reviews
    // -------------------------------------------------------------
    const addReviewRes = await fetch(`${BASE_URL}/products/${testProductId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'Magnificent texture and incredible warmth. Highly recommended!',
        userName: 'Test Reviewer',
      }),
    });
    const addReviewData = await addReviewRes.json();
    logTest(
      'POST /api/products/:id/reviews',
      addReviewRes.status === 201 && addReviewData.data?.rating === 5,
      `Rating: ${addReviewData.data?.rating}`
    );

    // -------------------------------------------------------------
    // 11. Reviews: GET /api/products/:id/reviews
    // -------------------------------------------------------------
    const getReviewsRes = await fetch(`${BASE_URL}/products/${testProductId}/reviews`);
    const getReviewsData = await getReviewsRes.json();
    const reviewsList = Array.isArray(getReviewsData.data) ? getReviewsData.data : (getReviewsData.data?.reviews || []);
    logTest(
      'GET /api/products/:id/reviews',
      getReviewsRes.status === 200 && reviewsList.length > 0,
      `Reviews count: ${reviewsList.length}`
    );

    // -------------------------------------------------------------
    // 12. Wishlist: POST /api/wishlist (Protected)
    // -------------------------------------------------------------
    const addWishRes = await fetch(`${BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: testProductId }),
    });
    const addWishData = await addWishRes.json();
    logTest(
      'POST /api/wishlist',
      addWishRes.status === 200 && Array.isArray(addWishData.data),
      `Wishlist items: ${addWishData.data?.length}`
    );

    // -------------------------------------------------------------
    // 13. Wishlist: GET /api/wishlist (Protected)
    // -------------------------------------------------------------
    const getWishRes = await fetch(`${BASE_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const getWishData = await getWishRes.json();
    logTest(
      'GET /api/wishlist',
      getWishRes.status === 200 && Array.isArray(getWishData.data) && getWishData.data.length > 0,
      `Wishlist count: ${getWishData.data?.length}`
    );

    // -------------------------------------------------------------
    // 14. Wishlist: DELETE /api/wishlist/:productId (Protected)
    // -------------------------------------------------------------
    const delWishRes = await fetch(`${BASE_URL}/wishlist/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const delWishData = await delWishRes.json();
    logTest(
      'DELETE /api/wishlist/:productId',
      delWishRes.status === 200,
      `Remaining items: ${delWishData.data?.length}`
    );

    // -------------------------------------------------------------
    // 15. Custom Orders: POST /api/custom-orders
    // -------------------------------------------------------------
    const createCustOrderRes = await fetch(`${BASE_URL}/custom-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sunita Mehra',
        email: 'sunita@example.com',
        phone: '7018183172',
        productType: 'Scarves',
        colorPreference: 'Olive Green',
        size: '180cm x 30cm',
        designPattern: 'Cable knit with fringed ends',
        quantity: 1,
        additionalNotes: 'Kindly use soft merino blend.',
      }),
    });
    const createCustOrderData = await createCustOrderRes.json();
    testCustomOrderId = createCustOrderData.data?.customOrder?.customOrderNumber;
    logTest(
      'POST /api/custom-orders',
      createCustOrderRes.status === 201 && !!testCustomOrderId,
      `Order No: ${testCustomOrderId}`
    );

    // -------------------------------------------------------------
    // 16. Custom Orders: GET /api/custom-orders (Admin Protected)
    // -------------------------------------------------------------
    const getCustOrdersRes = await fetch(`${BASE_URL}/custom-orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const getCustOrdersData = await getCustOrdersRes.json();
    logTest(
      'GET /api/custom-orders (Admin)',
      getCustOrdersRes.status === 200 && Array.isArray(getCustOrdersData.data),
      `Custom orders count: ${getCustOrdersData.data?.length}`
    );

    // -------------------------------------------------------------
    // 17. Custom Orders: GET /api/custom-orders/:id
    // -------------------------------------------------------------
    const getSingleCustOrderRes = await fetch(`${BASE_URL}/custom-orders/${testCustomOrderId}`);
    const getSingleCustOrderData = await getSingleCustOrderRes.json();
    logTest(
      'GET /api/custom-orders/:id',
      getSingleCustOrderRes.status === 200 && getSingleCustOrderData.data?.customOrderNumber === testCustomOrderId,
      `Status: ${getSingleCustOrderData.data?.status}`
    );

    // -------------------------------------------------------------
    // 18. Custom Orders: PUT /api/custom-orders/:id (Admin Protected)
    // -------------------------------------------------------------
    const updateCustOrderRes = await fetch(`${BASE_URL}/custom-orders/${testCustomOrderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Under Review',
        adminNotes: 'Yarn shade verified, preparing estimate.',
        estimatedPrice: 2200,
      }),
    });
    const updateCustOrderData = await updateCustOrderRes.json();
    logTest(
      'PUT /api/custom-orders/:id (Admin)',
      updateCustOrderRes.status === 200 && updateCustOrderData.data?.status === 'Under Review',
      `New Status: ${updateCustOrderData.data?.status}`
    );

    // -------------------------------------------------------------
    // 19. Orders: POST /api/orders
    // -------------------------------------------------------------
    const createOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerInfo: {
          name: 'Vikram Joshi',
          phone: '9812345678',
          email: 'vikram@example.com',
        },
        shippingAddress: {
          street: '44 Hill Road',
          city: 'Shimla',
          state: 'Himachal Pradesh',
          postalCode: '171001',
          country: 'India',
        },
        items: [
          {
            productId: testProductId,
            quantity: 1,
            selectedColor: 'Oatmeal',
          },
        ],
        notes: 'Please pack with care instructions.',
      }),
    });
    const createOrderData = await createOrderRes.json();
    testOrderId = createOrderData.data?.order?.orderNumber;
    logTest(
      'POST /api/orders',
      createOrderRes.status === 201 && !!testOrderId && (createOrderData.data?.order?.orderStatus === 'Order Placed' || createOrderData.data?.order?.orderStatus === 'Inquiry'),
      `Order: ${testOrderId}, Status: ${createOrderData.data?.order?.orderStatus}`
    );

    // -------------------------------------------------------------
    // 20. Orders: GET /api/orders (Admin Protected)
    // -------------------------------------------------------------
    const getOrdersRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const getOrdersData = await getOrdersRes.json();
    logTest(
      'GET /api/orders (Admin)',
      getOrdersRes.status === 200 && Array.isArray(getOrdersData.data),
      `Orders count: ${getOrdersData.data?.length}`
    );

    // -------------------------------------------------------------
    // 21. Orders: GET /api/orders/:id
    // -------------------------------------------------------------
    const getSingleOrderRes = await fetch(`${BASE_URL}/orders/${testOrderId}`);
    const getSingleOrderData = await getSingleOrderRes.json();
    logTest(
      'GET /api/orders/:id',
      getSingleOrderRes.status === 200 && getSingleOrderData.data?.orderNumber === testOrderId,
      `Status: ${getSingleOrderData.data?.orderStatus}`
    );

    // -------------------------------------------------------------
    // 22. Orders: PUT /api/orders/:id/status (Admin Protected)
    // -------------------------------------------------------------
    const updateOrderStatusRes = await fetch(`${BASE_URL}/orders/${testOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Confirmed',
        artisanNotes: 'Confirmed with customer via WhatsApp.',
        orderConfirmationMethod: 'WhatsApp',
      }),
    });
    const updateOrderStatusData = await updateOrderStatusRes.json();
    logTest(
      'PUT /api/orders/:id/status (Admin)',
      updateOrderStatusRes.status === 200 && updateOrderStatusData.data?.orderStatus === 'Confirmed',
      `Status: ${updateOrderStatusData.data?.orderStatus}`
    );

    // -------------------------------------------------------------
    // 23. Products: DELETE /api/products/:id (Admin Protected)
    // -------------------------------------------------------------
    const delProdRes = await fetch(`${BASE_URL}/products/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    logTest(
      'DELETE /api/products/:id (Admin)',
      delProdRes.status === 200,
      `Deleted test product: ${testProductId}`
    );

    console.log('\n====================================================');
    const allPassed = results.every((r) => r.passed);
    console.log(allPassed ? '🎉 ALL 23 TEST SUITE OPERATIONS PASSED!' : '⚠️ SOME TESTS FAILED');
    console.log(`Passed: ${results.filter((r) => r.passed).length} / ${results.length}`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Fatal test error:', err);
  }
};

runSuite();
