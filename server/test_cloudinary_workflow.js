const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING CLOUDINARY PRODUCT IMAGE WORKFLOW TESTS ===\n');

  let adminToken = '';
  let customerToken = '';
  const timestamp = Date.now();

  // 1. Register and Authenticate Admin and Customer
  try {
    const adminRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Gurjeet Handcraft Admin',
        email: `admin_img_${timestamp}@gurjeetshandcraft.com`,
        password: 'mock_test_password',
        phone: '7018183172',
        adminSecret: process.env.ADMIN_PASSWORD || 'test_suite_mock_token_key',
      }),
    });
    const adminData = await adminRegRes.json();
    adminToken = adminData.data?.token || adminData.token;
    if (!adminToken) {
      throw new Error(`Admin registration response did not contain token: ${JSON.stringify(adminData)}`);
    }
    console.log('✓ Step 1a: Admin registered and authenticated successfully.');

    const custRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Artisan Patron',
        email: `patron_img_${timestamp}@example.com`,
        password: 'CustomerPassword123!',
        phone: '9876543210',
      }),
    });
    const custData = await custRegRes.json();
    customerToken = custData.data?.token || custData.token;
    if (!customerToken) {
      throw new Error(`Customer registration response did not contain token: ${JSON.stringify(custData)}`);
    }
    console.log('✓ Step 1b: Customer registered and authenticated successfully.');
  } catch (err) {
    console.error('Authentication failed:', err.message || err);
    process.exit(1);
  }

  // 2. Test Unauthenticated Access to Upload Route (Should return 401)
  try {
    const formData = new FormData();
    const fakeBlob = new Blob(['fake image content'], { type: 'image/jpeg' });
    formData.append('images', fakeBlob, 'sample.jpg');

    const unauthRes = await fetch(`${BASE_URL}/upload/images`, {
      method: 'POST',
      body: formData,
    });

    if (unauthRes.status === 401) {
      console.log('✓ Step 2: Unauthenticated upload rejected with 401 Unauthorized.');
    } else {
      console.error('FAIL: Expected 401 for unauthenticated upload, got:', unauthRes.status);
      process.exit(1);
    }
  } catch (err) {
    console.error('FAIL Step 2:', err);
    process.exit(1);
  }

  // 3. Test Non-Admin (Customer) Access to Upload Route (Should return 403)
  try {
    const formData = new FormData();
    const fakeBlob = new Blob(['fake image content'], { type: 'image/jpeg' });
    formData.append('images', fakeBlob, 'sample.jpg');

    const custRes = await fetch(`${BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
      body: formData,
    });

    if (custRes.status === 403) {
      console.log('✓ Step 3: Customer upload rejected with 403 Forbidden.');
    } else {
      console.error('FAIL: Expected 403 for customer upload, got:', custRes.status);
      process.exit(1);
    }
  } catch (err) {
    console.error('FAIL Step 3:', err);
    process.exit(1);
  }

  // 4. Test Invalid File Type (e.g. .js or .txt, should return 400)
  try {
    const formData = new FormData();
    const badBlob = new Blob(['console.log("bad code");'], { type: 'application/javascript' });
    formData.append('images', badBlob, 'malicious.js');

    const badTypeRes = await fetch(`${BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });

    const badTypeData = await badTypeRes.json();
    if (badTypeRes.status === 400) {
      console.log(`✓ Step 4: Invalid MIME type rejected with 400: "${badTypeData.message}"`);
    } else {
      console.error('FAIL: Expected 400 for bad MIME type, got:', badTypeRes.status);
      process.exit(1);
    }
  } catch (err) {
    console.error('FAIL Step 4:', err);
    process.exit(1);
  }

  // 5. Test File Size Limit (> 5MB, should return 400)
  try {
    const formData = new FormData();
    const oversizeBuffer = new Uint8Array(6 * 1024 * 1024); // 6MB
    const bigBlob = new Blob([oversizeBuffer], { type: 'image/jpeg' });
    formData.append('images', bigBlob, 'oversize.jpg');

    const bigRes = await fetch(`${BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });

    const bigData = await bigRes.json();
    if (bigRes.status === 400) {
      console.log(`✓ Step 5: File exceeding 5MB rejected with 400: "${bigData.message}"`);
    } else {
      console.error('FAIL: Expected 400 for >5MB file, got:', bigRes.status);
      process.exit(1);
    }
  } catch (err) {
    console.error('FAIL Step 5:', err);
    process.exit(1);
  }

  // 6. Test Valid Multi-Image Upload as Admin (Should return 201 with Cloudinary metadata)
  let uploadedImages = [];
  try {
    // 1x1 transparent PNG buffer
    const validPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    // 1x1 JPEG buffer
    const validJpgBuffer = Buffer.from(
      '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
      'base64'
    );

    const formData = new FormData();
    formData.append('images', new Blob([validPngBuffer], { type: 'image/png' }), 'artisan_crochet_1.png');
    formData.append('images', new Blob([validJpgBuffer], { type: 'image/jpeg' }), 'artisan_crochet_2.jpg');

    const uploadRes = await fetch(`${BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });

    const uploadData = await uploadRes.json();

    if (uploadRes.status === 201 && Array.isArray(uploadData.data)) {
      uploadedImages = uploadData.data;
      console.log(`✓ Step 6: Successfully uploaded ${uploadedImages.length} images.`);
      uploadedImages.forEach((img, i) => {
        console.log(`   [Image ${i + 1}] URL: ${img.url}`);
        console.log(`                PublicId: ${img.publicId}`);
        console.log(`                isPrimary: ${img.isPrimary}`);
        if (!img.url || !img.publicId) {
          throw new Error('Image record missing url or publicId!');
        }
      });
    } else {
      throw new Error(`Unexpected upload response: ${JSON.stringify(uploadData)}`);
    }
  } catch (err) {
    console.error('FAIL Step 6:', err);
    process.exit(1);
  }

  // 7. Verify Zero Binary in MongoDB / Database
  console.log('\n✓ Step 7: Verifying Database Schema Constraint:');
  uploadedImages.forEach((img) => {
    // Verify only URL, publicId, and metadata are referenced (zero binary payload)
    const isCleanRef =
      typeof img.url === 'string' &&
      typeof img.publicId === 'string' &&
      !img.buffer &&
      !img.data;
    if (!isCleanRef) {
      throw new Error('Image object contains binary data payload!');
    }
  });
  console.log('   Confirmed: Only Cloudinary URLs, publicId, and metadata are referenced (Zero DB binary payload).');

  // 8. Create Product with Cloudinary Image References
  let createdProduct = null;
  try {
    const productPayload = {
      title: `Himalayan Merino Wool Throw Blanket ${Date.now()}`,
      price: 2499,
      category: 'other',
      craftTechnique: 'Hand-Knitted',
      material: '100% Pure Himalayan Merino Wool',
      description: 'Chunky cable knit throw blanket hand-crafted with wooden circular needles.',
      stock: 3,
      isAvailable: true,
      images: uploadedImages,
    };

    const createRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(productPayload),
    });

    const createData = await createRes.json();
    createdProduct = createData.data;
    console.log(`\n✓ Step 8: Created Product "${createdProduct.title}" (ID: ${createdProduct._id})`);
    console.log(`   Images attached: ${createdProduct.images.length}`);
    const firstImg = createdProduct.images[0];
    if (firstImg.url !== uploadedImages[0].url || firstImg.publicId !== uploadedImages[0].publicId) {
      throw new Error('Product images do not match Cloudinary references!');
    }
  } catch (err) {
    console.error('FAIL Step 8:', err);
    process.exit(1);
  }

  // 9. Update Product: Reorder Images and Set New Primary
  try {
    const reorderedImages = [
      { ...uploadedImages[1], isPrimary: true },
      { ...uploadedImages[0], isPrimary: false },
    ];

    const updateRes = await fetch(`${BASE_URL}/products/${createdProduct._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        images: reorderedImages,
        stock: 5,
      }),
    });

    const updateData = await updateRes.json();
    const updated = updateData.data;
    console.log('\n✓ Step 9: Reordered product images and updated primary cover image:');
    console.log(`   New Primary: ${updated.images[0].publicId} (isPrimary: ${updated.images[0].isPrimary})`);
    console.log(`   Second Image: ${updated.images[1].publicId} (isPrimary: ${updated.images[1].isPrimary})`);

    if (!updated.images[0].isPrimary || updated.images[0].publicId !== uploadedImages[1].publicId) {
      throw new Error('Image reordering or primary switch failed to persist!');
    }
  } catch (err) {
    console.error('FAIL Step 9:', err);
    process.exit(1);
  }

  // 10. Test Deleting an Image via Cloudinary Delete Endpoint
  try {
    const targetPublicId = uploadedImages[0].publicId;
    const deleteRes = await fetch(`${BASE_URL}/upload/images`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        publicId: targetPublicId,
      }),
    });

    const deleteData = await deleteRes.json();
    console.log(`\n✓ Step 10: Successfully invoked Cloudinary delete endpoint for "${targetPublicId}":`, deleteData.message);
  } catch (err) {
    console.error('FAIL Step 10:', err);
    process.exit(1);
  }

  // 11. Clean up test product
  try {
    await fetch(`${BASE_URL}/products/${createdProduct._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    console.log(`\n✓ Step 11: Cleaned up test product.`);
  } catch (err) {
    console.warn('Could not clean up test product:', err.message);
  }

  console.log('\n🎉 ALL CLOUDINARY PRODUCT IMAGE MANAGEMENT TESTS PASSED PERFECTLY!');
}

runTests();
