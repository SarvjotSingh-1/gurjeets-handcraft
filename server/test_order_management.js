const BASE_URL = 'http://localhost:5000/api';

async function runOrderManagementTests() {
  console.log('=== RUNNING CUSTOMER ORDER MANAGEMENT & TRANSITION TEST SUITE ===\n');

  // 1. Setup Accounts: Customer & Admin
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const custEmail = `cust.orders.${randomSuffix}@example.com`;
  const adminEmail = `admin.orders.${randomSuffix}@example.com`;
  const password = 'Password@12345';

  // Register Customer
  const custRegRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Verma',
      email: custEmail,
      phone: '9876500001',
      password,
    }),
  });
  const custRegData = await custRegRes.json();
  const customerToken = custRegData.data?.token || custRegData.data?.tokens?.accessToken;

  if (!customerToken) {
    console.error('FAIL: Could not register test customer:', custRegData);
    process.exit(1);
  }
  console.log(`  ✓ Registered test customer: ${custEmail}`);

  // Register Admin
  const adminRegRes = await fetch(`${BASE_URL}/auth/register`, {
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
  const adminRegData = await adminRegRes.json();
  const adminToken = adminRegData.data?.token || adminRegData.data?.tokens?.accessToken;

  if (!adminToken) {
    console.error('FAIL: Could not register test admin:', adminRegData);
    process.exit(1);
  }
  console.log(`  ✓ Registered test admin: ${adminEmail}`);

  // Fetch a catalog product for order creation
  const prodRes = await fetch(`${BASE_URL}/products`);
  const prodData = await prodRes.json();
  const products = prodData.data?.products || prodData.data || [];
  const testProduct = products.find((p) => p.isAvailable && p.stock > 0) || products[0];

  if (!testProduct) {
    console.error('FAIL: No products available in catalog.');
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 1: Create Order -> Initial Status 'Order Placed' & 'Pending'
  // -------------------------------------------------------------
  console.log('\nTest 1: Initial Order Status & Payment Status');
  const createRes1 = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerInfo: {
        name: 'Rohan Verma',
        phone: '9876500001',
        email: custEmail,
      },
      shippingAddress: {
        street: '88 Whispering Pines',
        city: 'Manali',
        state: 'Himachal Pradesh',
        postalCode: '175131',
        country: 'India',
      },
      items: [
        {
          productId: testProduct._id,
          quantity: 1,
          selectedColor: 'Olive',
        },
      ],
      notes: 'Please pack in eco-friendly paper.',
    }),
  });
  const createData1 = await createRes1.json();
  const order1 = createData1.data?.order;

  if (
    createRes1.status === 201 &&
    order1?.orderStatus === 'Order Placed' &&
    order1?.paymentStatus === 'Pending'
  ) {
    console.log(`  ✓ Order created (${order1.orderNumber}) with status: "${order1.orderStatus}" and paymentStatus: "${order1.paymentStatus}"`);
  } else {
    console.error('FAIL Test 1: Order initial status incorrect:', createData1);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 2: Customer Order Retrieval (GET /api/orders/my-orders)
  // -------------------------------------------------------------
  console.log('\nTest 2: Customer Order Retrieval (GET /api/orders/my-orders)');
  // Unauthenticated check (should return 401)
  const unauthOrdersRes = await fetch(`${BASE_URL}/orders/my-orders`);
  if (unauthOrdersRes.status === 401) {
    console.log('  ✓ Unauthenticated access to /my-orders correctly rejected with 401');
  } else {
    console.error('FAIL Test 2: Expected 401 for unauthenticated /my-orders, got:', unauthOrdersRes.status);
    process.exit(1);
  }

  // Authenticated customer retrieval
  const myOrdersRes = await fetch(`${BASE_URL}/orders/my-orders`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const myOrdersData = await myOrdersRes.json();

  if (
    myOrdersRes.status === 200 &&
    Array.isArray(myOrdersData.data) &&
    myOrdersData.data.some((o) => o.orderNumber === order1.orderNumber)
  ) {
    console.log(`  ✓ Successfully fetched customer orders. Found ${myOrdersData.data.length} order(s) for ${custEmail}`);
  } else {
    console.error('FAIL Test 2: Customer order not returned in /my-orders:', myOrdersData);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 3: Status Transition -> Payment Confirmed & Payment Status Sync
  // -------------------------------------------------------------
  console.log('\nTest 3: Transition to "Payment Confirmed" & Auto-Update Payment Status');
  const payConfirmRes = await fetch(`${BASE_URL}/orders/${order1.orderNumber}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'Payment Confirmed',
      artisanNotes: 'Bank transfer receipt confirmed by Gurjeet',
    }),
  });
  const payConfirmData = await payConfirmRes.json();

  if (
    payConfirmRes.status === 200 &&
    payConfirmData.data?.orderStatus === 'Payment Confirmed' &&
    payConfirmData.data?.paymentStatus === 'Completed'
  ) {
    console.log(`  ✓ Transition to "Payment Confirmed" succeeded!`);
    console.log(`  ✓ Payment status automatically updated to: "${payConfirmData.data?.paymentStatus}"`);
  } else {
    console.error('FAIL Test 3:', payConfirmData);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 4: Full Craft Workflow (Processing -> Handmade -> Packed -> Shipped -> Delivered)
  // -------------------------------------------------------------
  console.log('\nTest 4: Full Production Lifecycle Transitions');
  const workflowSteps = ['Processing', 'Handmade', 'Packed', 'Shipped', 'Delivered'];

  for (const nextStep of workflowSteps) {
    const stepRes = await fetch(`${BASE_URL}/orders/${order1.orderNumber}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: nextStep,
        artisanNotes: `Advancing to ${nextStep}`,
      }),
    });
    const stepData = await stepRes.json();

    if (stepRes.status === 200 && stepData.data?.orderStatus === nextStep) {
      console.log(`  ✓ Advanced order status to: "${nextStep}"`);
    } else {
      console.error(`FAIL Test 4: Failed to transition to "${nextStep}":`, stepData);
      process.exit(1);
    }
  }

  // -------------------------------------------------------------
  // Test 5: Rejection of Invalid Transition from Terminal Status 'Delivered'
  // -------------------------------------------------------------
  console.log('\nTest 5: Reject Invalid Transitions from Terminal State ("Delivered")');
  // Attempt to transition Delivered -> Processing
  const badTransitionRes = await fetch(`${BASE_URL}/orders/${order1.orderNumber}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'Processing',
    }),
  });
  const badTransitionData = await badTransitionRes.json();

  if (badTransitionRes.status === 400 && badTransitionData.message.includes('Cannot transition')) {
    console.log(`  ✓ Illegal backward jump (Delivered -> Processing) correctly rejected with 400:`);
    console.log(`    "${badTransitionData.message}"`);
  } else {
    console.error('FAIL Test 5: Illegal transition was not rejected with 400:', badTransitionRes.status, badTransitionData);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 6: Order Cancellation Lifecycle & Terminal Constraint
  // -------------------------------------------------------------
  console.log('\nTest 6: Order Cancellation & Terminal State');
  // Create second order
  const createRes2 = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerInfo: {
        name: 'Rohan Verma',
        phone: '9876500001',
        email: custEmail,
      },
      shippingAddress: {
        street: '88 Whispering Pines',
        city: 'Manali',
        state: 'Himachal Pradesh',
        postalCode: '175131',
        country: 'India',
      },
      items: [
        {
          productId: testProduct._id,
          quantity: 1,
        },
      ],
    }),
  });
  const createData2 = await createRes2.json();
  const order2 = createData2.data?.order;

  // Cancel order 2
  const cancelRes = await fetch(`${BASE_URL}/orders/${order2.orderNumber}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'Cancelled',
      artisanNotes: 'Cancelled per customer request on WhatsApp',
    }),
  });
  const cancelData = await cancelRes.json();

  if (
    cancelRes.status === 200 &&
    cancelData.data?.orderStatus === 'Cancelled' &&
    cancelData.data?.paymentStatus === 'Cancelled'
  ) {
    console.log(`  ✓ Successfully cancelled order (${order2.orderNumber})`);
    console.log(`  ✓ Payment status synced to: "${cancelData.data?.paymentStatus}"`);
  } else {
    console.error('FAIL Test 6: Cancellation failed:', cancelData);
    process.exit(1);
  }

  // Attempt to transition out of Cancelled (expect 400)
  const cancelReviveRes = await fetch(`${BASE_URL}/orders/${order2.orderNumber}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'Processing',
    }),
  });
  const cancelReviveData = await cancelReviveRes.json();

  if (cancelReviveRes.status === 400 && cancelReviveData.message.includes('terminal')) {
    console.log(`  ✓ Illegal revive of Cancelled order correctly rejected with 400:`);
    console.log(`    "${cancelReviveData.message}"`);
  } else {
    console.error('FAIL Test 6: Cancelled revive not rejected:', cancelReviveRes.status, cancelReviveData);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 7: Non-Admin Status Update Forbidden Check (403)
  // -------------------------------------------------------------
  console.log('\nTest 7: Non-Admin Forbidden Check (403)');
  const customerUpdateRes = await fetch(`${BASE_URL}/orders/${order2.orderNumber}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      status: 'Payment Confirmed',
    }),
  });

  if (customerUpdateRes.status === 403) {
    console.log('  ✓ Customer role correctly blocked from updating order status (403 Forbidden)');
  } else {
    console.error('FAIL Test 7: Customer was not blocked:', customerUpdateRes.status);
    process.exit(1);
  }

  console.log('\n🎉 ALL 7 ORDER MANAGEMENT & TRANSITION TESTS PASSED WITH 100% SUCCESS!');
}

runOrderManagementTests().catch((err) => {
  console.error('Order management test suite execution error:', err);
  process.exit(1);
});
