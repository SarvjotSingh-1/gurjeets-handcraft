/**
 * Comprehensive Automated Test Suite for Customer Wishlist System
 * Gurjeet's Handcraft - Production Verification
 */

const BASE_URL = 'http://localhost:5000/api';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message} ${details ? `(${details})` : ''}`);
  } else {
    console.error(`  ❌ [FAIL] ${message} ${details ? `(${details})` : ''}`);
  }
}

async function runWishlistTests() {
  console.log('\n=============================================================');
  console.log('🧵 Gurjeet\'s Handcraft - Wishlist System Automated Tests');
  console.log('=============================================================\n');

  try {
    const timestamp = Date.now();

    // -------------------------------------------------------------
    // Phase 1: Setup Customer & Admin & Products
    // -------------------------------------------------------------
    console.log('--- Phase 1: Setup Accounts & Creations ---');

    // Register Admin
    const adminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Studio Master Gurjeet',
        email: `admin_wish_${timestamp}@gurjeetshandcraft.com`,
        password: 'admin_secure_123',
        role: 'admin',
        adminSecret: process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key',
      }),
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.data?.token;
    assert(adminRes.status === 201 && !!adminToken, 'Admin registered successfully');

    // Register Customer
    const custRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kavita Verma',
        email: `kavita_wish_${timestamp}@example.com`,
        password: 'customer_pass_123',
      }),
    });
    const custData = await custRes.json();
    const customerToken = custData.data?.token;
    assert(custRes.status === 201 && !!customerToken, 'Customer registered successfully');

    // Create In-Stock Product
    const prod1Res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: `Himalayan Merino Beanie ${timestamp}`,
        price: 1250,
        category: 'caps',
        craftTechnique: 'Hand-Knitted',
        material: '100% Merino Wool',
        description: 'Chunky cable-knit warm winter beanie.',
        stock: 5,
        isAvailable: true,
      }),
    });
    const prod1Data = await prod1Res.json();
    const product1Id = prod1Data.data?._id;
    assert(prod1Res.status === 201 && !!product1Id, 'Created in-stock test product', `ID: ${product1Id}`);

    // Create Out-of-Stock / Unavailable Product
    const prod2Res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: `Vintage Handwoven Muffler ${timestamp}`,
        price: 1950,
        category: 'mufflers',
        craftTechnique: 'Wooden Loom',
        material: 'Raw Himalayan Sheep Wool',
        description: 'Rare heritage weave muffler, crafted in limited studio batches.',
        stock: 0,
        isAvailable: false,
        isMadeToOrder: true,
      }),
    });
    const prod2Data = await prod2Res.json();
    const product2Id = prod2Data.data?._id;
    assert(prod2Res.status === 201 && !!product2Id, 'Created out-of-stock / unavailable product', `ID: ${product2Id}`);

    // -------------------------------------------------------------
    // Phase 2: Authentication Security Enforcement
    // -------------------------------------------------------------
    console.log('\n--- Phase 2: Authentication Security & Access Control ---');

    // Unauthenticated GET
    const unauthGet = await fetch(`${BASE_URL}/wishlist`);
    assert(unauthGet.status === 401, 'Unauthenticated GET /api/wishlist rejected with 401');

    // Unauthenticated POST
    const unauthPost = await fetch(`${BASE_URL}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product1Id }),
    });
    assert(unauthPost.status === 401, 'Unauthenticated POST /api/wishlist rejected with 401');

    // Unauthenticated DELETE
    const unauthDel = await fetch(`${BASE_URL}/wishlist/${product1Id}`, {
      method: 'DELETE',
    });
    assert(unauthDel.status === 401, 'Unauthenticated DELETE /api/wishlist/:id rejected with 401');

    // -------------------------------------------------------------
    // Phase 3: Add to Wishlist & Populated Data
    // -------------------------------------------------------------
    console.log('\n--- Phase 3: Add Creation & Populated Details ---');

    // Initially Empty
    const initWishRes = await fetch(`${BASE_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const initWishData = await initWishRes.json();
    assert(
      initWishRes.status === 200 && Array.isArray(initWishData.data) && initWishData.data.length === 0,
      'Customer wishlist starts completely empty'
    );

    // Add Product 1
    const addP1Res = await fetch(`${BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: product1Id }),
    });
    const addP1Data = await addP1Res.json();
    assert(
      addP1Res.status === 200 &&
        Array.isArray(addP1Data.data) &&
        addP1Data.data.length === 1 &&
        addP1Data.data[0]._id === product1Id &&
        addP1Data.data[0].price === 1250,
      'Product 1 added with populated title and pricing details'
    );

    // -------------------------------------------------------------
    // Phase 4: Duplicate Prevention (Idempotence)
    // -------------------------------------------------------------
    console.log('\n--- Phase 4: Strict Duplicate Prevention ---');

    // Add Product 1 a second time
    const dupRes = await fetch(`${BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: product1Id }),
    });
    const dupData = await dupRes.json();
    assert(
      dupRes.status === 200 &&
        Array.isArray(dupData.data) &&
        dupData.data.length === 1,
      'Re-adding the same product is idempotent and strictly prevents duplicates'
    );

    // -------------------------------------------------------------
    // Phase 5: Saving Unavailable / Made-to-Order Pieces
    // -------------------------------------------------------------
    console.log('\n--- Phase 5: Saving Out-of-Stock / Unavailable Pieces ---');

    // Add Product 2 (out-of-stock)
    const addP2Res = await fetch(`${BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: product2Id }),
    });
    const addP2Data = await addP2Res.json();
    const savedUnavailable = addP2Data.data?.find((it) => it._id === product2Id);
    assert(
      addP2Res.status === 200 &&
        addP2Data.data?.length === 2 &&
        !!savedUnavailable &&
        savedUnavailable.isAvailable === false &&
        savedUnavailable.stock === 0,
      'Out-of-stock / unavailable piece saved to wishlist preserving availability flags'
    );

    // -------------------------------------------------------------
    // Phase 6: Handling Deleted Products Gracefully
    // -------------------------------------------------------------
    console.log('\n--- Phase 6: Self-Healing Cleanup of Deleted Products ---');

    // Create a temporary 3rd product
    const tempProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: `Limited Edition Prototype ${timestamp}`,
        price: 3500,
        category: 'gloves',
        craftTechnique: 'Fingerless Knit',
        material: 'Angora Blend',
        description: 'Prototype design soon to be discontinued.',
        stock: 1,
        isAvailable: true,
      }),
    });
    const tempProdData = await tempProdRes.json();
    const tempProdId = tempProdData.data?._id;

    // Customer adds temp product to wishlist
    await fetch(`${BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: tempProdId }),
    });

    // Verify it was added (total now 3)
    const checkBeforeDel = await fetch(`${BASE_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const checkBeforeDelData = await checkBeforeDel.json();
    assert(checkBeforeDelData.data?.length === 3, 'Wishlist has 3 items including temporary piece');

    // Admin permanently deletes the temporary product from catalog
    const delFromCatalogRes = await fetch(`${BASE_URL}/products/${tempProdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delFromCatalogRes.status === 200, 'Admin deleted temporary product from store catalog');

    // Customer fetches wishlist again: deleted item must be auto-purged without crashing
    const fetchAfterDel = await fetch(`${BASE_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const fetchAfterDelData = await fetchAfterDel.json();
    const hasDeletedItem = fetchAfterDelData.data?.some((it) => it._id === tempProdId);
    assert(
      fetchAfterDel.status === 200 &&
        fetchAfterDelData.data?.length === 2 &&
        !hasDeletedItem,
      'Deleted product automatically purged from customer wishlist without errors'
    );

    // -------------------------------------------------------------
    // Phase 7: Remove Product from Wishlist
    // -------------------------------------------------------------
    console.log('\n--- Phase 7: Remove Creation from Wishlist ---');

    const remRes = await fetch(`${BASE_URL}/wishlist/${product1Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const remData = await remRes.json();
    assert(
      remRes.status === 200 &&
        Array.isArray(remData.data) &&
        remData.data.length === 1 &&
        remData.data[0]._id === product2Id,
      'Product 1 removed successfully. Remaining items: 1'
    );

    console.log('\n=============================================================');
    console.log(`📊 Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('=============================================================\n');

    if (passedTests === totalTests) {
      console.log('🎉 ALL WISHLIST WORKFLOW TESTS PASSED WITH 100% SUCCESS!\n');
    } else {
      console.error(`💥 ${totalTests - passedTests} tests failed!`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  }
}

runWishlistTests();
