/**
 * Comprehensive Automated Test Suite for Authentic Product Reviews
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

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('🌟 Gurjeet\'s Handcraft - Product Reviews Automated Verification');
  console.log('=============================================================\n');

  try {
    const timestamp = Date.now();

    // -------------------------------------------------------------
    // Setup: Register Admin and 2 Customers
    // -------------------------------------------------------------
    console.log('--- Phase 1: Setup Accounts and Product ---');

    // Admin
    const adminEmail = `admin_rev_${timestamp}@gurjeetshandcraft.com`;
    const adminRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Master Craftsman Gurjeet',
        email: adminEmail,
        password: 'admin_secure_123',
        role: 'admin',
        adminSecret: process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key',
      }),
    });
    const adminRegData = await adminRegRes.json();
    const adminToken = adminRegData.data?.token;
    assert(adminRegRes.status === 201 && !!adminToken, 'Admin registered successfully');

    // Customer A (Will purchase product)
    const customerAEmail = `cust_a_${timestamp}@example.com`;
    const custARegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Patel',
        email: customerAEmail,
        password: 'customer_pass_123',
      }),
    });
    const custARegData = await custARegRes.json();
    const customerAToken = custARegData.data?.token;
    assert(custARegRes.status === 201 && !!customerAToken, 'Customer A registered');

    // Customer B (Will NOT purchase product)
    const customerBEmail = `cust_b_${timestamp}@example.com`;
    const custBRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bhavna Sharma',
        email: customerBEmail,
        password: 'customer_pass_123',
      }),
    });
    const custBRegData = await custBRegRes.json();
    const customerBToken = custBRegData.data?.token;
    assert(custBRegRes.status === 201 && !!customerBToken, 'Customer B registered');

    // Create a Test Product
    const prodRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: `Hand-spun Himachal Wool Scarf ${timestamp}`,
        price: 1850,
        category: 'scarves',
        craftTechnique: 'Handwoven Loom',
        material: '100% Merino Wool',
        description: 'Authentic warm handwoven scarf crafted with natural vegetable dyes.',
        stock: 10,
        isAvailable: true,
      }),
    });
    const prodData = await prodRes.json();
    const productId = prodData.data?._id;
    assert(prodRes.status === 201 && !!productId, 'Test product created', `ID: ${productId}`);

    // -------------------------------------------------------------
    // Phase 2: Initial State Verification (Zero Fake Reviews)
    // -------------------------------------------------------------
    console.log('\n--- Phase 2: Initial Reviews State (Strict No Fake Reviews) ---');

    const initRevRes = await fetch(`${BASE_URL}/products/${productId}/reviews`);
    const initRevData = await initRevRes.json();
    assert(
      initRevRes.status === 200 &&
        initRevData.data?.reviews?.length === 0 &&
        initRevData.data?.stats?.ratingCount === 0 &&
        initRevData.data?.stats?.averageRating === 0,
      'Product starts with zero reviews and zero rating count (no fake reviews)'
    );

    // Check Eligibility: Guest (Unauthenticated)
    const guestEligRes = await fetch(`${BASE_URL}/products/${productId}/reviews/eligibility`);
    const guestEligData = await guestEligRes.json();
    assert(
      guestEligRes.status === 200 &&
        guestEligData.data?.isEligible === false &&
        guestEligData.data?.isVerifiedBuyer === false,
      'Guest user is flagged as ineligible with sign-in requirement'
    );

    // Check Eligibility: Customer A before purchase
    const custAEligBefore = await fetch(`${BASE_URL}/products/${productId}/reviews/eligibility`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    const custAEligBeforeData = await custAEligBefore.json();
    assert(
      custAEligBefore.status === 200 &&
        custAEligBeforeData.data?.isEligible === false &&
        custAEligBeforeData.data?.isVerifiedBuyer === false,
      'Customer A is ineligible before purchasing the piece'
    );

    // -------------------------------------------------------------
    // Phase 3: Access Control & Security Rejections
    // -------------------------------------------------------------
    console.log('\n--- Phase 3: Access Control & Verified Purchase Enforcement ---');

    // Test: Unauthenticated review submission rejected (401)
    const unauthSubRes = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        comment: 'Anonymous glowing review attempt should fail.',
      }),
    });
    assert(
      unauthSubRes.status === 401,
      'Unauthenticated review submission rejected with 401 Unauthorized'
    );

    // Test: Non-purchaser Customer B submission rejected (403)
    const unverifiedSubRes = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerBToken}`,
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'I never purchased this item but I want to leave a review.',
      }),
    });
    const unverifiedData = await unverifiedSubRes.json();
    assert(
      unverifiedSubRes.status === 403,
      'Non-purchasing customer rejected with 403 Forbidden',
      unverifiedData.message
    );

    // -------------------------------------------------------------
    // Phase 4: Purchase Creation & Verified Review Submission
    // -------------------------------------------------------------
    console.log('\n--- Phase 4: Purchase & Verified Customer Review Flow ---');

    // Customer A purchases the product
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerInfo: {
          name: 'Aarav Patel',
          phone: '9876543210',
          email: customerAEmail,
        },
        shippingAddress: {
          street: '15 Pine Grove',
          city: 'Manali',
          state: 'Himachal Pradesh',
          postalCode: '175131',
          country: 'India',
        },
        items: [{ productId, quantity: 1 }],
      }),
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 201 && !!orderData.data?.order?.orderNumber, 'Customer A completes order purchase');

    // Check Eligibility: Customer A after purchase
    const custAEligAfter = await fetch(`${BASE_URL}/products/${productId}/reviews/eligibility`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    const custAEligAfterData = await custAEligAfter.json();
    assert(
      custAEligAfter.status === 200 &&
        custAEligAfterData.data?.isEligible === true &&
        custAEligAfterData.data?.isVerifiedBuyer === true,
      'Customer A is now verified and eligible to review'
    );

    // Test Payload Validation: Invalid rating (e.g. 6 stars, 0 stars)
    const invalidRatingRes = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        rating: 6,
        comment: 'Extremely high rating outside 1-5 scale.',
      }),
    });
    assert(invalidRatingRes.status === 400, 'Rating > 5 rejected with 400 Bad Request');

    // Test Payload Validation: Comment too short (< 5 chars)
    const shortCommentRes = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'Ok',
      }),
    });
    assert(shortCommentRes.status === 400, 'Comment < 5 chars rejected with 400 Bad Request');

    // Valid Review Submission by Customer A
    const validRevRes = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'Exquisite weave! The pure merino wool keeps me wonderfully warm during chilly evenings.',
        userName: 'Aarav Patel',
      }),
    });
    const validRevData = await validRevRes.json();
    const createdReviewId = validRevData.data?._id;
    assert(
      validRevRes.status === 201 &&
        validRevData.data?.rating === 5 &&
        validRevData.data?.isVerifiedPurchase === true,
      'Verified customer review submitted successfully',
      `ID: ${createdReviewId}`
    );

    // -------------------------------------------------------------
    // Phase 5: Duplicate Prevention Enforcement
    // -------------------------------------------------------------
    console.log('\n--- Phase 5: Duplicate Review Prevention ---');

    const duplicateRevRes = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        rating: 4,
        comment: 'Attempting to post a second duplicate review for the same piece.',
      }),
    });
    const duplicateData = await duplicateRevRes.json();
    assert(
      duplicateRevRes.status === 409,
      'Duplicate review attempt strictly rejected with 409 Conflict',
      duplicateData.message
    );

    // Eligibility check now confirms hasReviewed = true
    const custAEligDone = await fetch(`${BASE_URL}/products/${productId}/reviews/eligibility`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    const custAEligDoneData = await custAEligDone.json();
    assert(
      custAEligDone.status === 200 &&
        custAEligDoneData.data?.isEligible === false &&
        custAEligDoneData.data?.hasReviewed === true,
      'Eligibility reflects piece has already been reviewed'
    );

    // -------------------------------------------------------------
    // Phase 6: Rating Distribution & Aggregation Math Verification
    // -------------------------------------------------------------
    console.log('\n--- Phase 6: Rating Metrics & Distribution Calculation ---');

    // Add a second review by Admin (to test 4-star distribution calculation)
    const adminRevRes = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        rating: 4,
        comment: 'Studio sample testing: Beautiful softness with hand-dyed earthy tone.',
        userName: 'Gurjeet Kaur',
      }),
    });
    assert(adminRevRes.status === 201, 'Second review added (Admin review for distribution test)');

    // Fetch Reviews and check stats
    const revsWithStatsRes = await fetch(`${BASE_URL}/products/${productId}/reviews`);
    const revsWithStatsData = await revsWithStatsRes.json();
    const stats = revsWithStatsData.data?.stats;
    const revs = revsWithStatsData.data?.reviews;

    assert(
      revsWithStatsRes.status === 200 && revs.length === 2,
      'Reviews count is exactly 2',
      `Found: ${revs.length}`
    );
    assert(
      stats?.ratingCount === 2,
      'Stats ratingCount is 2'
    );
    assert(
      stats?.averageRating === 4.5,
      'Stats averageRating is accurately calculated as 4.5 ((5 + 4) / 2)',
      `Average: ${stats?.averageRating}`
    );
    assert(
      stats?.distribution[5] === 1 &&
        stats?.distribution[4] === 1 &&
        stats?.distribution[3] === 0,
      'Stats distribution breakdown accurately reflects (1x 5-star, 1x 4-star)'
    );
    assert(
      stats?.distributionPercentages[5] === 50 &&
        stats?.distributionPercentages[4] === 50,
      'Distribution percentages correctly calculated (50% 5-star, 50% 4-star)'
    );

    // -------------------------------------------------------------
    // Phase 7: Admin Moderation & Deletion of Inappropriate Reviews
    // -------------------------------------------------------------
    console.log('\n--- Phase 7: Admin Moderation & Deletion ---');

    // Customer cannot view all reviews admin route
    const custAdminListRes = await fetch(`${BASE_URL}/reviews`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    assert(custAdminListRes.status === 403, 'Normal customer forbidden from GET /api/reviews (403)');

    // Admin can view all reviews
    const adminListRes = await fetch(`${BASE_URL}/reviews`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminListData = await adminListRes.json();
    assert(
      adminListRes.status === 200 && Array.isArray(adminListData.data),
      'Admin can view all reviews list',
      `Total studio reviews: ${adminListData.data?.length}`
    );

    // Admin deletes review
    const delRevRes = await fetch(`${BASE_URL}/reviews/${createdReviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delRevRes.status === 200, 'Admin successfully deletes review', `Review ID: ${createdReviewId}`);

    // Re-verify product review count after deletion
    const afterDelRes = await fetch(`${BASE_URL}/products/${productId}/reviews`);
    const afterDelData = await afterDelRes.json();
    assert(
      afterDelData.data?.reviews?.length === 1 &&
        afterDelData.data?.stats?.ratingCount === 1 &&
        afterDelData.data?.stats?.averageRating === 4,
      'Product review stats recalculated automatically after deletion (1 review remaining, 4.0 avg)'
    );

    console.log('\n=============================================================');
    console.log(`📊 Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('=============================================================\n');

    if (passedTests === totalTests) {
      console.log('🎉 ALL PRODUCT REVIEW TESTS PASSED WITH 100% SUCCESS!\n');
      process.exit(0);
    } else {
      console.error(`💥 ${totalTests - passedTests} tests failed!`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTestSuite();
