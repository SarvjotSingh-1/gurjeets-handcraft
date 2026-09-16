const BASE_URL = 'http://localhost:5000/api';

async function runCheckoutTests() {
  console.log('=== RUNNING COMPREHENSIVE CHECKOUT WORKFLOW TESTS ===\n');

  // Fetch product catalog for valid test product
  const prodRes = await fetch(`${BASE_URL}/products`);
  const prodData = await prodRes.json();
  const products = prodData.data?.products || prodData.data || [];

  if (products.length === 0) {
    console.error('FAIL: No products available in catalog for checkout test.');
    process.exit(1);
  }

  const p1 = products.find((p) => p.stock > 0 && p.isAvailable) || products[0];
  const unitPrice = Number(p1.price);

  const validCustomerInfo = {
    name: 'Anita Sharma',
    phone: '9876543210',
    email: 'anita.sharma@example.com',
  };

  const validShippingAddress = {
    street: '14 Mountain View Cottage, Mall Road',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    postalCode: '171001',
    country: 'India',
  };

  // Test 1: Reject Missing / Invalid Email
  console.log('Test 1: Reject Missing / Invalid Email');
  const badEmailRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerInfo: { ...validCustomerInfo, email: 'not-an-email' },
      shippingAddress: validShippingAddress,
      items: [{ productId: p1._id, quantity: 1 }],
    }),
  });
  const badEmailData = await badEmailRes.json();

  if (badEmailRes.status === 400 && badEmailData.message.includes('email')) {
    console.log(`  ✓ Invalid email rejected with 400: "${badEmailData.message}"`);
  } else {
    console.error('FAIL Test 1: Invalid email was not rejected:', badEmailRes.status, badEmailData);
    process.exit(1);
  }

  // Test 2: Reject Invalid Phone Number (< 10 digits)
  console.log('\nTest 2: Reject Invalid Phone Number');
  const badPhoneRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerInfo: { ...validCustomerInfo, phone: '12345' },
      shippingAddress: validShippingAddress,
      items: [{ productId: p1._id, quantity: 1 }],
    }),
  });
  const badPhoneData = await badPhoneRes.json();

  if (badPhoneRes.status === 400 && badPhoneData.message.includes('phone')) {
    console.log(`  ✓ Invalid phone rejected with 400: "${badPhoneData.message}"`);
  } else {
    console.error('FAIL Test 2: Invalid phone was not rejected:', badPhoneRes.status, badPhoneData);
    process.exit(1);
  }

  // Test 3: Reject Invalid Pincode (not 6 digits)
  console.log('\nTest 3: Reject Invalid PIN Code');
  const badPinRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerInfo: validCustomerInfo,
      shippingAddress: { ...validShippingAddress, postalCode: 'ABC-12' },
      items: [{ productId: p1._id, quantity: 1 }],
    }),
  });
  const badPinData = await badPinRes.json();

  if (badPinRes.status === 400 && badPinData.message.includes('PIN')) {
    console.log(`  ✓ Invalid PIN code rejected with 400: "${badPinData.message}"`);
  } else {
    console.error('FAIL Test 3: Invalid PIN code was not rejected:', badPinRes.status, badPinData);
    process.exit(1);
  }

  // Test 4: Reject Incomplete Street Address
  console.log('\nTest 4: Reject Incomplete Street Address');
  const badAddressRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerInfo: validCustomerInfo,
      shippingAddress: { ...validShippingAddress, street: 'Hi' },
      items: [{ productId: p1._id, quantity: 1 }],
    }),
  });
  const badAddressData = await badAddressRes.json();

  if (badAddressRes.status === 400 && badAddressData.message.includes('address')) {
    console.log(`  ✓ Short address rejected with 400: "${badAddressData.message}"`);
  } else {
    console.error('FAIL Test 4: Short address was not rejected:', badAddressRes.status, badAddressData);
    process.exit(1);
  }

  // Test 5: Backend Recalculates Prices, Quantity, Subtotal, Shipping, Total (Never Trusts Frontend Totals)
  console.log('\nTest 5: Never Trust Frontend Totals (Authoritative Server Recalculation)');
  const fakeTotalsPayload = {
    customerInfo: validCustomerInfo,
    shippingAddress: validShippingAddress,
    items: [
      {
        productId: p1._id,
        quantity: 1,
        unitPrice: 5, // Client sends fake unitPrice ₹5
      },
    ],
    subtotal: 5, // Client sends fake subtotal ₹5
    shippingFee: 0, // Client sends fake free shipping
    totalAmount: 5, // Client sends fake total ₹5
  };

  const recalcRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fakeTotalsPayload),
  });
  const recalcData = await recalcRes.json();
  const createdOrder = recalcData.data?.order;

  const expectedSubtotal = unitPrice * 1;
  const expectedShipping = expectedSubtotal >= 1499 ? 0 : 99;
  const expectedTotal = expectedSubtotal + expectedShipping;

  if (
    recalcRes.status === 201 &&
    createdOrder.subtotal === expectedSubtotal &&
    createdOrder.shippingFee === expectedShipping &&
    createdOrder.totalAmount === expectedTotal &&
    createdOrder.items[0].unitPrice === unitPrice
  ) {
    console.log(`  ✓ Client fake total ₹5 completely ignored!`);
    console.log(`  ✓ Recalculated Subtotal: ₹${createdOrder.subtotal} (DB Unit Price: ₹${createdOrder.items[0].unitPrice})`);
    console.log(`  ✓ Recalculated Shipping: ₹${createdOrder.shippingFee}`);
    console.log(`  ✓ Recalculated Total: ₹${createdOrder.totalAmount}`);
  } else {
    console.error('FAIL Test 5: Recalculation failed:', recalcData);
    process.exit(1);
  }

  // Test 6: Verify Payment Status is 'Pending'
  console.log('\nTest 6: Verify Payment Status is "Pending"');
  if (createdOrder.paymentStatus === 'Pending') {
    console.log(`  ✓ Order paymentStatus is correctly set to "${createdOrder.paymentStatus}"`);
  } else {
    console.error('FAIL Test 6: paymentStatus is not Pending:', createdOrder.paymentStatus);
    process.exit(1);
  }

  // Test 7: Verify Order Details Retrieval by Order Number
  console.log('\nTest 7: Retrieve Order Details by Order Number');
  const getOrderRes = await fetch(`${BASE_URL}/orders/${createdOrder.orderNumber}`);
  const getOrderData = await getOrderRes.json();
  const fetchedOrder = getOrderData.data;

  if (
    getOrderRes.status === 200 &&
    fetchedOrder.orderNumber === createdOrder.orderNumber &&
    fetchedOrder.customerInfo.name === validCustomerInfo.name &&
    fetchedOrder.customerInfo.email === validCustomerInfo.email &&
    fetchedOrder.paymentStatus === 'Pending'
  ) {
    console.log(`  ✓ Successfully fetched order ${fetchedOrder.orderNumber} for "${fetchedOrder.customerInfo.name}"`);
    console.log(`  ✓ Verified email: ${fetchedOrder.customerInfo.email}, phone: ${fetchedOrder.customerInfo.phone}`);
    console.log(`  ✓ Verified delivery destination: ${fetchedOrder.shippingAddress.street}, ${fetchedOrder.shippingAddress.city}, ${fetchedOrder.shippingAddress.state} - ${fetchedOrder.shippingAddress.postalCode}`);
  } else {
    console.error('FAIL Test 7:', getOrderData);
    process.exit(1);
  }

  console.log('\n🎉 ALL 7 CHECKOUT & ORDER CREATION TESTS PASSED WITH 100% SUCCESS!');
}

runCheckoutTests().catch((err) => {
  console.error('Checkout test execution failed:', err);
  process.exit(1);
});
