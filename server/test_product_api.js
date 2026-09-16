import http from 'http';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path) {
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

async function runProductTests() {
  console.log('======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PRODUCT API TEST SUITE');
  console.log('======================================================\n');

  // 1. Product Listing
  console.log('Test 1: Product Listing (GET /api/products)');
  const listRes = await request('GET', '/products');
  assert(listRes.status === 200, `Status is 200 (got ${listRes.status})`);
  const listData = listRes.body?.data?.products || listRes.body?.data || [];
  assert(Array.isArray(listData) && listData.length > 0, `Returned products array with length ${listData.length}`);
  const firstProduct = listData[0];
  assert(!!firstProduct.title && !!firstProduct.price && !!firstProduct.slug, 'Product contains title, price, and slug');

  // 2. Product Detail by Slug
  console.log('\nTest 2: Product Detail by Slug (GET /api/products/:slug)');
  const slugRes = await request('GET', `/products/${firstProduct.slug}`);
  assert(slugRes.status === 200, `Status is 200 (got ${slugRes.status})`);
  const slugProduct = slugRes.body?.data || slugRes.body;
  assert(slugProduct.slug === firstProduct.slug, `Fetched product matches requested slug "${firstProduct.slug}"`);
  assert(!!slugProduct.description && !!slugProduct.craftTechnique, 'Product details include craftTechnique and description');

  // 3. Product Detail by ID
  console.log('\nTest 3: Product Detail by ID (GET /api/products/:id)');
  const idRes = await request('GET', `/products/${firstProduct._id}`);
  assert(idRes.status === 200, `Status is 200 (got ${idRes.status})`);
  const idProduct = idRes.body?.data || idRes.body;
  assert(String(idProduct._id) === String(firstProduct._id), `Fetched product matches requested ID "${firstProduct._id}"`);

  // 4. Search Filter
  console.log('\nTest 4: Search Query (GET /api/products?search=Merino)');
  const searchRes = await request('GET', '/products?search=Merino');
  assert(searchRes.status === 200, `Status is 200 (got ${searchRes.status})`);
  const searchProducts = searchRes.body?.data?.products || searchRes.body?.data || [];
  assert(searchProducts.length > 0, `Search found ${searchProducts.length} product(s) matching "Merino"`);
  const allMatchSearch = searchProducts.every((p) =>
    p.title.toLowerCase().includes('merino') ||
    p.description.toLowerCase().includes('merino') ||
    p.material.toLowerCase().includes('merino')
  );
  assert(allMatchSearch, 'All returned items contain the search term in title, description, or material');

  // 5. Category Filtering
  console.log('\nTest 5: Category Filtering (GET /api/products?category=gloves)');
  const catRes = await request('GET', '/products?category=gloves');
  assert(catRes.status === 200, `Status is 200 (got ${catRes.status})`);
  const catProducts = catRes.body?.data?.products || catRes.body?.data || [];
  assert(catProducts.length > 0, `Category "gloves" returned ${catProducts.length} product(s)`);
  assert(catProducts.every((p) => p.category === 'gloves'), 'Every returned item has category="gloves"');

  // 6. Price Range Filtering
  console.log('\nTest 6: Price Filtering (GET /api/products?minPrice=700&maxPrice=1000)');
  const priceRes = await request('GET', '/products?minPrice=700&maxPrice=1000');
  assert(priceRes.status === 200, `Status is 200 (got ${priceRes.status})`);
  const priceProducts = priceRes.body?.data?.products || priceRes.body?.data || [];
  assert(priceProducts.length > 0, `Price range ₹700–₹1000 returned ${priceProducts.length} product(s)`);
  assert(
    priceProducts.every((p) => p.price >= 700 && p.price <= 1000),
    'Every returned item has price between ₹700 and ₹1000'
  );

  // 7. Availability Filtering
  console.log('\nTest 7: Availability Filtering (GET /api/products?availability=made_to_order)');
  const availRes = await request('GET', '/products?availability=made_to_order');
  assert(availRes.status === 200, `Status is 200 (got ${availRes.status})`);
  const availProducts = availRes.body?.data?.products || availRes.body?.data || [];
  assert(availProducts.length > 0, `Made to order filter returned ${availProducts.length} product(s)`);
  assert(
    availProducts.every((p) => p.isMadeToOrder === true),
    'Every returned item has isMadeToOrder=true'
  );

  // 8. Sorting - Price Low to High
  console.log('\nTest 8: Sorting - Price Low to High (GET /api/products?sort=price_asc)');
  const sortAscRes = await request('GET', '/products?sort=price_asc');
  assert(sortAscRes.status === 200, `Status is 200 (got ${sortAscRes.status})`);
  const sortAscProducts = sortAscRes.body?.data?.products || sortAscRes.body?.data || [];
  let isSortedAsc = true;
  for (let i = 0; i < sortAscProducts.length - 1; i++) {
    if (sortAscProducts[i].price > sortAscProducts[i + 1].price) {
      isSortedAsc = false;
      break;
    }
  }
  assert(isSortedAsc, 'Products are strictly in ascending price order');

  // 9. Sorting - Price High to Low
  console.log('\nTest 9: Sorting - Price High to Low (GET /api/products?sort=price_desc)');
  const sortDescRes = await request('GET', '/products?sort=price_desc');
  assert(sortDescRes.status === 200, `Status is 200 (got ${sortDescRes.status})`);
  const sortDescProducts = sortDescRes.body?.data?.products || sortDescRes.body?.data || [];
  let isSortedDesc = true;
  for (let i = 0; i < sortDescProducts.length - 1; i++) {
    if (sortDescProducts[i].price < sortDescProducts[i + 1].price) {
      isSortedDesc = false;
      break;
    }
  }
  assert(isSortedDesc, 'Products are strictly in descending price order');

  // 10. Invalid Product ID / Slug
  console.log('\nTest 10: Invalid Product Error State (GET /api/products/non-existent-creation-slug)');
  const notFoundRes = await request('GET', '/products/non-existent-creation-slug');
  assert(notFoundRes.status === 404, `Invalid slug returns 404 Not Found (got ${notFoundRes.status})`);
  assert(
    notFoundRes.body.message && notFoundRes.body.message.includes('not found'),
    `Error response contains descriptive message ("${notFoundRes.body.message}")`
  );

  // 11. Categories API
  console.log('\nTest 11: Categories List (GET /api/categories)');
  const catListRes = await request('GET', '/categories');
  assert(catListRes.status === 200, `Status is 200 (got ${catListRes.status})`);
  const categories = catListRes.body?.data || catListRes.body || [];
  assert(Array.isArray(categories) && categories.length >= 6, `Returned ${categories.length} category entries`);
  assert(categories.some((c) => c.slug === 'scarves'), 'Includes scarves category');
  assert(categories.some((c) => c.slug === 'other'), 'Includes other woolen handcrafts category');

  console.log('\n======================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runProductTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
