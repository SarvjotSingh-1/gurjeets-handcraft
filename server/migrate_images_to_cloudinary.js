import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cloudinary from './src/config/cloudinary.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, 'public/uploads');

const runMigration = async () => {
  console.log('====================================================');
  console.log('🚀 Starting Cloudinary Image Migration');
  console.log('====================================================');

  // Verify Cloudinary ping
  const ping = await cloudinary.api.ping();
  console.log('✅ Cloudinary connected successfully. Ping:', ping.status);

  // 1. Upload local uploads directory to Cloudinary
  const localUploadMap = new Map(); // filename -> { url, public_id }

  if (fs.existsSync(UPLOADS_DIR)) {
    const files = fs.readdirSync(UPLOADS_DIR);
    console.log(`\n📁 Found ${files.length} local files in public/uploads:`);

    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        console.log(`   Uploading local file: ${file}...`);
        try {
          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'gurjeets_handcraft/products',
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 1600, crop: 'limit' },
            ],
          });
          localUploadMap.set(file, {
            url: result.secure_url,
            publicId: result.public_id,
          });
          console.log(`   ✅ Uploaded: ${file} -> ${result.secure_url}`);
        } catch (err) {
          console.error(`   ❌ Failed to upload ${file}:`, err.message);
        }
      }
    }
  }

  // 2. Connect to local MongoDB to update all products
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gurjeets_handcraft';
  await mongoose.connect(mongoUri);
  console.log('\n🍃 Connected to MongoDB:', mongoUri);

  const Product = mongoose.model(
    'Product',
    new mongoose.Schema({}, { strict: false }),
    'products'
  );

  const products = await Product.find({});
  console.log(`📦 Found ${products.length} products to process.\n`);

  for (const product of products) {
    const images = product.get('images') || [];
    let modified = false;

    const newImages = [];

    for (const img of images) {
      const currentUrl = img.url || '';
      const currentPublicId = img.publicId || '';

      // Case A: Image is in local /uploads/
      if (currentUrl.startsWith('/uploads/') || currentPublicId.startsWith('local_')) {
        const filename = currentUrl.replace('/uploads/', '');
        if (localUploadMap.has(filename)) {
          const uploaded = localUploadMap.get(filename);
          newImages.push({
            url: uploaded.url,
            publicId: uploaded.publicId,
            alt: img.alt || product.get('title'),
            isPrimary: !!img.isPrimary,
          });
          modified = true;
          console.log(`   [Product: "${product.get('title')}"] Replaced local image ${filename} with Cloudinary URL`);
        } else {
          newImages.push(img);
        }
      }
      // Case B: Image is already on Cloudinary
      else if (currentUrl.includes('res.cloudinary.com')) {
        newImages.push(img);
      }
      // Case C: Image is an external URL (e.g. Unsplash) -> upload to Cloudinary for permanent storage
      else if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://')) {
        console.log(`   [Product: "${product.get('title')}"] Uploading external image to Cloudinary...`);
        try {
          const slugBase = (product.get('slug') || 'artisan-product').replace(/[^a-z0-9]/g, '_');
          const result = await cloudinary.uploader.upload(currentUrl, {
            folder: 'gurjeets_handcraft/products',
            resource_type: 'image',
            public_id: `${slugBase}_${Date.now().toString().slice(-4)}`,
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 1600, crop: 'limit' },
            ],
          });
          newImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: img.alt || product.get('title'),
            isPrimary: !!img.isPrimary,
          });
          modified = true;
          console.log(`   ✅ [Product: "${product.get('title')}"] Successfully hosted on Cloudinary: ${result.secure_url}`);
        } catch (uploadErr) {
          console.warn(`   ⚠️ Could not upload external image for "${product.get('title')}": ${uploadErr.message}`);
          newImages.push(img);
        }
      } else {
        newImages.push(img);
      }
    }

    if (modified) {
      await Product.updateOne({ _id: product._id }, { $set: { images: newImages } });
    }
  }

  // 3. Verify total resources in Cloudinary account
  console.log('\n====================================================');
  console.log('🔍 Verifying Cloudinary Assets in Account:');
  const finalResources = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'gurjeets_handcraft',
    max_results: 100,
  });
  console.log(`🎉 Total images now hosted in Cloudinary (folder: gurjeets_handcraft): ${finalResources.resources.length}`);
  finalResources.resources.forEach((r, idx) => {
    console.log(`   ${idx + 1}. [${r.public_id}] -> ${r.secure_url}`);
  });

  console.log('\n✅ Image migration to Cloudinary completed successfully!');
  process.exit(0);
};

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
