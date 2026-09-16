/**
 * Automated Verification for SEO Implementation
 * Gurjeet's Handcraft - Production SEO Verification
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let totalTests = 0;
let passedTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

function fetchHttp(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

console.log('\n=============================================================');
console.log('🔍 Gurjeet\'s Handcraft - Production SEO Verification');
console.log('=============================================================\n');

async function runAllSeoTests() {
  // 1. Robots.txt verification
  await test('1. robots.txt exists, allows public routes, disallows admin/account/checkout, and points to sitemap', () => {
    const robotsPath = path.resolve(__dirname, '../client/public/robots.txt');
    assert(fs.existsSync(robotsPath), 'client/public/robots.txt must exist');
    const content = fs.readFileSync(robotsPath, 'utf8');

    assert(content.includes('User-agent: *'), 'Must target all user-agents');
    assert(content.includes('Allow: /'), 'Must allow root');
    assert(content.includes('Allow: /shop'), 'Must allow /shop');
    assert(content.includes('Allow: /product/'), 'Must allow /product/');
    assert(content.includes('Allow: /custom-orders'), 'Must allow /custom-orders');
    assert(content.includes('Allow: /our-story'), 'Must allow /our-story');
    assert(content.includes('Allow: /how-its-made'), 'Must allow /how-its-made');
    assert(content.includes('Allow: /contact'), 'Must allow /contact');

    assert(content.includes('Disallow: /admin'), 'Must disallow /admin');
    assert(content.includes('Disallow: /account'), 'Must disallow /account');
    assert(content.includes('Disallow: /checkout'), 'Must disallow /checkout');
    assert(content.includes('Disallow: /order-confirmation/'), 'Must disallow /order-confirmation/');
    assert(content.includes('Disallow: /api/'), 'Must disallow /api/');

    assert(content.includes('Sitemap: https://gurjeetshandcraft.com/sitemap.xml'), 'Must define canonical sitemap directive');
  });

  // 2. Static sitemap.xml fallback verification
  await test('2. client/public/sitemap.xml exists with valid XML namespace and core static routes', () => {
    const sitemapPath = path.resolve(__dirname, '../client/public/sitemap.xml');
    assert(fs.existsSync(sitemapPath), 'client/public/sitemap.xml must exist');
    const content = fs.readFileSync(sitemapPath, 'utf8');

    assert(content.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'Must include XML declaration');
    assert(content.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Must define sitemap xmlns');
    assert(content.includes('<loc>https://gurjeetshandcraft.com/</loc>'), 'Must list homepage');
    assert(content.includes('<loc>https://gurjeetshandcraft.com/shop</loc>'), 'Must list shop page');
    assert(content.includes('<loc>https://gurjeetshandcraft.com/custom-orders</loc>'), 'Must list custom orders');
    assert(content.includes('<loc>https://gurjeetshandcraft.com/our-story</loc>'), 'Must list our story');
    assert(content.includes('<loc>https://gurjeetshandcraft.com/how-its-made</loc>'), 'Must list how it is made');
    assert(content.includes('<loc>https://gurjeetshandcraft.com/contact</loc>'), 'Must list contact page');
  });

  // 3. Dynamic Backend /sitemap.xml HTTP endpoint verification
  await test('3. Server dynamic GET /sitemap.xml returns XML headers, static URLs, and dynamic product URLs', async () => {
    const response = await fetchHttp('http://localhost:5000/sitemap.xml');
    assert.strictEqual(response.statusCode, 200, 'Endpoint should respond with 200 OK');
    assert(response.headers['content-type'].includes('application/xml'), 'Content-Type must be application/xml');

    const body = response.body;
    assert(body.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'Body includes XML prolog');
    assert(body.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Body includes urlset');
    assert(body.includes('/shop</loc>'), 'Body includes /shop');
    assert(body.includes('/custom-orders</loc>'), 'Body includes /custom-orders');
    assert(body.includes('/our-story</loc>'), 'Body includes /our-story');
    assert(body.includes('/how-its-made</loc>'), 'Body includes /how-its-made');
    assert(body.includes('/contact</loc>'), 'Body includes /contact');
    assert(body.includes('<priority>1.0</priority>'), 'Homepage has priority 1.0');
    assert(body.includes('<priority>0.9</priority>'), 'Shop page has priority 0.9');
  });

  // 4. Client zero-dependency Head Manager (SEO.jsx) validation
  await test('4. Client zero-dependency Head Manager (SEO.jsx) handles metadata, OG, Twitter, Canonical & JSON-LD', () => {
    const seoPath = path.resolve(__dirname, '../client/src/components/common/SEO.jsx');
    assert(fs.existsSync(seoPath), 'client/src/components/common/SEO.jsx must exist');
    const content = fs.readFileSync(seoPath, 'utf8');

    assert(content.includes('document.title = formattedTitle;'), 'Must update document.title directly');
    assert(content.includes('description'), 'Must manage description meta tag');
    assert(content.includes('keywords'), 'Must manage keywords meta tag');
    assert(content.includes('robots'), 'Must manage robots meta tag with noindex support');
    assert(content.includes('og:title'), 'Must set og:title');
    assert(content.includes('og:description'), 'Must set og:description');
    assert(content.includes('og:image'), 'Must set og:image');
    assert(content.includes('og:url'), 'Must set og:url');
    assert(content.includes('twitter:card'), 'Must set twitter:card');
    assert(content.includes('canonical'), 'Must inject or update link[rel="canonical"]');
    assert(content.includes('application/ld+json'), 'Must inject Schema.org JSON-LD scripts');
  });

  // 5. Check public pages have SEO and correct heading hierarchy
  await test('5. Public pages mount SEO and enforce valid semantic heading hierarchy (h1 per page)', () => {
    const pagesToCheck = [
      { file: 'HomePage.jsx', titleKeyword: 'Handmade Woolen' },
      { file: 'ShopPage.jsx', titleKeyword: 'Collection' },
      { file: 'ProductDetailPage.jsx', titleKeyword: 'product.title' },
      { file: 'OurStoryPage.jsx', titleKeyword: 'Gurjeet' },
      { file: 'HowItsMadePage.jsx', titleKeyword: 'Knitting' },
      { file: 'CustomOrderPage.jsx', titleKeyword: 'Custom' },
      { file: 'ContactPage.jsx', titleKeyword: 'Contact' },
      { file: 'PolicyPage.jsx', titleKeyword: 'Policies' },
    ];

    pagesToCheck.forEach(({ file, titleKeyword }) => {
      const filePath = path.resolve(__dirname, `../client/src/pages/customer/${file}`);
      assert(fs.existsSync(filePath), `${file} must exist`);
      const content = fs.readFileSync(filePath, 'utf8');

      assert(content.includes('<SEO'), `${file} must include <SEO> component`);
      assert(content.includes(titleKeyword), `${file} SEO must include keyword: ${titleKeyword}`);

      // Count <h1> tags in JSX
      const h1Matches = content.match(/<h1[\s>]/g);
      assert(h1Matches && h1Matches.length === 1, `${file} must contain exactly one <h1> element (Found ${h1Matches ? h1Matches.length : 0})`);
    });
  });

  // 6. Check private / transactional pages enforce noindex={true}
  await test('6. Private & non-indexed pages include SEO with noindex={true}', () => {
    const noindexPages = [
      { path: '../client/src/pages/customer/CartPage.jsx', name: 'CartPage' },
      { path: '../client/src/pages/customer/CheckoutPage.jsx', name: 'CheckoutPage' },
      { path: '../client/src/pages/customer/OrderConfirmationPage.jsx', name: 'OrderConfirmationPage' },
      { path: '../client/src/pages/customer/WishlistPage.jsx', name: 'WishlistPage' },
      { path: '../client/src/pages/customer/OrdersPage.jsx', name: 'OrdersPage' },
      { path: '../client/src/pages/customer/AccountPage.jsx', name: 'AccountPage' },
      { path: '../client/src/pages/customer/NotFoundPage.jsx', name: 'NotFoundPage' },
      { path: '../client/src/pages/auth/LoginPage.jsx', name: 'LoginPage' },
      { path: '../client/src/pages/auth/RegisterPage.jsx', name: 'RegisterPage' },
      { path: '../client/src/pages/admin/AdminDashboardPage.jsx', name: 'AdminDashboardPage' },
    ];

    noindexPages.forEach(({ path: relPath, name }) => {
      const fullPath = path.resolve(__dirname, relPath);
      assert(fs.existsSync(fullPath), `${name} must exist at ${relPath}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(content.includes('noindex={true}'), `${name} must specify noindex={true}`);
    });
  });

  // 7. Product JSON-LD structured data verification
  await test('7. ProductDetailPage implements Schema.org JSON-LD Product with offers, INR, availability and brand', () => {
    const detailPath = path.resolve(__dirname, '../client/src/pages/customer/ProductDetailPage.jsx');
    const content = fs.readFileSync(detailPath, 'utf8');

    assert(content.includes("'@context': 'https://schema.org'"), 'Must declare schema.org context');
    assert(content.includes("'@type': 'Product'"), 'Must declare type Product');
    assert(content.includes('offers:'), 'Must include offers block');
    assert(content.includes('priceCurrency: \'INR\''), 'Must specify INR currency');
    assert(content.includes('itemCondition'), 'Must include itemCondition');
    assert(content.includes('https://schema.org/InStock'), 'Must include InStock condition');
    assert(content.includes('https://schema.org/PreOrder'), 'Must handle PreOrder / MadeToOrder condition');
    assert(content.includes('brand:'), 'Must declare brand entity');
    assert(content.includes("name: \"Gurjeet's Handcraft\""), 'Brand name must be Gurjeet\'s Handcraft');
  });

  // 8. Image alt text verification
  await test('8. Product image thumbnails and gallery provide descriptive, natural alt tags', () => {
    const detailPath = path.resolve(__dirname, '../client/src/pages/customer/ProductDetailPage.jsx');
    const content = fs.readFileSync(detailPath, 'utf8');

    assert(content.includes('alt={img.alt || `${product.title} - Photo view ${idx + 1}, Handcrafted Woolen Detail`}'), 'Thumbnail alt text must be descriptive with product name');
    assert(content.includes('alt={currentImage?.alt || product.title}'), 'Main display image must have product.title alt text');
  });

  // 9. Root HTML verification (Google fonts, title, description, viewport)
  await test('9. Root client/index.html includes valid viewport, semantic title, and description fallback', () => {
    const indexPath = path.resolve(__dirname, '../client/index.html');
    const content = fs.readFileSync(indexPath, 'utf8');

    assert(content.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0" />'), 'Must include viewport');
    assert(content.includes('<title>Gurjeet\'s Handcraft\'s | Handmade Woolen Artisan Studio</title>'), 'Must have default title');
    assert(content.includes('<meta name="description"'), 'Must have default description');
  });

  console.log('\n-------------------------------------------------------------');
  console.log(`Results: ${passedTests} / ${totalTests} tests passed`);
  console.log('-------------------------------------------------------------\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL SEO INTEGRATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED. Please review errors above.\n');
    process.exit(1);
  }
}

runAllSeoTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
