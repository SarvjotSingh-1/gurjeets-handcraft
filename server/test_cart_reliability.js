const BASE_URL = 'http://localhost:5000/api';

async function runCartTests() {
  console.log('=== RUNNING CART RELIABILITY & VERIFICATION TESTS ===\n');

  // Fetch product catalog first to obtain authentic test product IDs
  const prodRes = await fetch(`${BASE_URL}/products`);
  const prodData = await prodRes.json();
  const products = prodData.data?.products || prodData.data || [];

  if (products.length === 0) {
    console.error('FAIL: No products available in catalog.');
    process.exit(1);
  }

  const p1 = products.find((p) => p.stock > 0) || products[0]; // e.g. Scarf
  const p2 = products.find((p) => p.stock > 0 && p._id !== p1._id) || p1;

  // Test 1: Empty Cart Verification
  console.log('Test 1: Empty Cart Verification');
  const emptyRes = await fetch(`${BASE_URL}/cart/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [] }),
  });
  const emptyData = await emptyRes.json();
  const cart1 = emptyData.data;

  if (
    emptyRes.status === 200 &&
    cart1.subtotal === 0 &&
    cart1.shipping === 0 &&
    cart1.total === 0 &&
    cart1.canCheckout === false
  ) {
    console.log('  ✓ Empty cart returns 0 subtotal, 0 shipping, 0 total, canCheckout=false');
  } else {
    console.error('FAIL Test 1:', cart1);
    process.exit(1);
  }

  // Test 2: Valid Cart Items & Authentic Database Prices
  console.log('\nTest 2: Valid Cart Items & Price Verification');
  const validPayload = {
    items: [
      {
        productId: p1._id,
        quantity: 1,
        selectedColor: 'Default',
      },
    ],
  };
  const validRes = await fetch(`${BASE_URL}/cart/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload),
  });
  const validData = await validRes.json();
  const cart2 = validData.data;

  const expectedSubtotal = Number(p1.price) * 1;
  const expectedShipping = expectedSubtotal >= 1499 ? 0 : 99;
  const expectedTotal = expectedSubtotal + expectedShipping;

  if (
    validRes.status === 200 &&
    cart2.subtotal === expectedSubtotal &&
    cart2.shipping === expectedShipping &&
    cart2.total === expectedTotal &&
    cart2.items[0].unitPrice === Number(p1.price) &&
    cart2.items[0].status === 'valid' &&
    cart2.canCheckout === true
  ) {
    console.log(`  ✓ Subtotal: ₹${cart2.subtotal}, Shipping: ₹${cart2.shipping}, Total: ₹${cart2.total}`);
    console.log(`  ✓ Verified DB price ₹${cart2.items[0].unitPrice} for "${p1.title}"`);
    console.log('  ✓ canCheckout is true for valid in-stock item');
  } else {
    console.error('FAIL Test 2:', cart2);
    process.exit(1);
  }

  // Test 3: Client Price Tampering (Client sends fake price ₹1)
  console.log('\nTest 3: Reject Client-Side Price Tampering');
  const tamperedPayload = {
    items: [
      {
        productId: p1._id,
        price: 1, // Tampered price
        quantity: 2,
      },
    ],
  };
  const tamperedRes = await fetch(`${BASE_URL}/cart/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tamperedPayload),
  });
  const tamperedData = await tamperedRes.json();
  const cart3 = tamperedData.data;

  if (cart3.items[0].unitPrice === Number(p1.price) && cart3.subtotal === Number(p1.price) * Math.min(2, p1.stock || 2)) {
    console.log(`  ✓ Tampered price ₹1 ignored! Authoritative DB price ₹${cart3.items[0].unitPrice} enforced.`);
  } else {
    console.error('FAIL Test 3: Price tampering was not overridden:', cart3);
    process.exit(1);
  }

  // Test 4: Quantity Exceeding Available Stock (Stock boundary clamping)
  console.log('\nTest 4: Stock Boundary Enforcement (Never Exceed Available Stock)');
  // Create an item with known stock = 2
  const maxStock = p1.stock !== undefined ? p1.stock : 2;
  const excessiveQty = maxStock + 5;
  const excessivePayload = {
    items: [
      {
        productId: p1._id,
        quantity: excessiveQty,
      },
    ],
  };
  const excessiveRes = await fetch(`${BASE_URL}/cart/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(excessivePayload),
  });
  const excessiveData = await excessiveRes.json();
  const cart4 = excessiveData.data;

  if (
    cart4.items[0].quantity === maxStock &&
    cart4.items[0].status === 'quantity_adjusted' &&
    cart4.hasAdjustments === true
  ) {
    console.log(`  ✓ Requested ${excessiveQty} clamped to maximum available stock: ${cart4.items[0].quantity}`);
    console.log(`  ✓ Adjustment message returned: "${cart4.items[0].message}"`);
  } else {
    console.error('FAIL Test 4: Excessive quantity was not clamped to stock:', cart4.items[0]);
    process.exit(1);
  }

  // Test 5: Out of Stock Product Detection
  console.log('\nTest 5: Out of Stock Product Detection');
  // First, register admin to create a temporary out-of-stock piece
  const adminRegRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Gurjeet Admin',
      email: `admin_cart_test_${Date.now()}@gurjeetshandcraft.com`,
      password: 'mock_test_password',
      phone: '7018183172',
      adminSecret: process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key',
    }),
  });
  const adminData = await adminRegRes.json();
  const adminToken = adminData.data?.token || adminData.token;

  const oosProductRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: `Sold Out Woolen Mittens ${Date.now()}`,
      price: 599,
      category: 'gloves',
      craftTechnique: 'Hand-Knitted',
      material: '100% Wool',
      description: 'Test out of stock piece',
      stock: 0,
      isAvailable: true,
      isMadeToOrder: false,
    }),
  });
  const oosProduct = (await oosProductRes.json()).data;

  const oosCartRes = await fetch(`${BASE_URL}/cart/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ productId: oosProduct._id, quantity: 1 }],
    }),
  });
  const oosCartData = (await oosCartRes.json()).data;

  if (
    oosCartData.items[0].status === 'out_of_stock' &&
    oosCartData.hasOutOfStockItems === true &&
    oosCartData.canCheckout === false
  ) {
    console.log(`  ✓ Out-of-stock item flagged with status "out_of_stock": "${oosCartData.items[0].message}"`);
    console.log('  ✓ canCheckout correctly set to false');
  } else {
    console.error('FAIL Test 5:', oosCartData);
    process.exit(1);
  }

  // Test 6: Deleted / Non-existent Product Handling
  console.log('\nTest 6: Deleted / Non-Existent Product Handling');
  const deletedCartRes = await fetch(`${BASE_URL}/cart/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ productId: '66d000000000000000000999', quantity: 1, title: 'Old Removed Scarf' }],
    }),
  });
  const deletedCartData = (await deletedCartRes.json()).data;

  if (
    deletedCartData.items[0].status === 'deleted' &&
    deletedCartData.hasDeletedItems === true &&
    deletedCartData.canCheckout === false
  ) {
    console.log(`  ✓ Deleted item flagged with status "deleted": "${deletedCartData.items[0].message}"`);
    console.log('  ✓ canCheckout correctly set to false');
  } else {
    console.error('FAIL Test 6:', deletedCartData);
    process.exit(1);
  }

  // Test 7: Backend Order Creation Rejects Exceeding Stock
  console.log('\nTest 7: Order Creation Strictly Rejects Exceeding Available Stock');
  const orderOverStockRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerInfo: { name: 'Priya Sharma', phone: '9876543210', email: 'priya.sharma@example.com' },
      shippingAddress: { street: '123 Pine St', city: 'Shimla', state: 'Himachal Pradesh', postalCode: '171001' },
      items: [{ productId: p1._id, quantity: maxStock + 10 }],
    }),
  });
  const orderOverStockData = await orderOverStockRes.json();

  if (orderOverStockRes.status === 400 && orderOverStockData.message.includes('exceeds available stock')) {
    console.log(`  ✓ Order creation rejected with 400: "${orderOverStockData.message}"`);
  } else {
    console.error('FAIL Test 7: Order exceeding stock was not rejected with 400:', orderOverStockRes.status, orderOverStockData);
    process.exit(1);
  }

  // Clean up out of stock test product
  await fetch(`${BASE_URL}/products/${oosProduct._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  console.log('\n🎉 ALL 7 CART RELIABILITY TESTS PASSED WITH 100% SUCCESS!');
}

runCartTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
