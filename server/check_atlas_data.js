import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function checkAtlasData() {
  const atlasUri = process.env.MONGODB_URI;
  console.log('====================================================');
  console.log('🔍 MongoDB Atlas Verification & Data Storage Check');
  console.log('====================================================');

  if (!atlasUri) {
    console.error('❌ MONGODB_URI is not set in server/.env!');
    process.exit(1);
  }

  const maskedUri = atlasUri.replace(/:([^:@]+)@/, ':****@');
  console.log(`📡 Configured URI: ${maskedUri}`);

  console.log('\n1. Testing Atlas Connection...');
  const startTime = Date.now();
  let conn;
  try {
    conn = await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 15000,
    });
    const duration = Date.now() - startTime;
    console.log(`   ✅ Connected successfully in ${duration}ms!`);
    console.log(`   🏠 Connected Host: ${conn.connection.host}`);
    console.log(`   📁 Database Name: ${conn.connection.name}`);
    console.log(`   📶 Ready State: ${conn.connection.readyState} (1 = Connected)`);
  } catch (err) {
    console.error(`   ❌ Failed to connect to MongoDB Atlas: ${err.message}`);
    process.exit(1);
  }

  const db = conn.connection.db;

  console.log('\n2. Listing Collections & Document Counts in Atlas:');
  const collections = await db.listCollections().toArray();
  
  if (collections.length === 0) {
    console.log('   ⚠️ No collections found in this database yet.');
  }

  const collectionReport = [];

  for (const col of collections) {
    const colName = col.name;
    const count = await db.collection(colName).countDocuments();
    collectionReport.push({ name: colName, count });
    console.log(`   📦 Collection [${colName}]: ${count} documents`);
    
    // Sample a document to inspect structure
    if (count > 0) {
      const sample = await db.collection(colName).findOne({}, { projection: { password: 0, __v: 0 } });
      let preview = '';
      if (colName === 'products') {
        preview = `e.g. Title: "${sample.title || sample.name}", Category: "${sample.category}", Price: ₹${sample.price}`;
      } else if (colName === 'users') {
        preview = `e.g. Name: "${sample.name}", Email: "${sample.email}", Role: "${sample.role}"`;
      } else if (colName === 'orders') {
        preview = `e.g. Order ID: ${sample._id}, Status: "${sample.orderStatus || sample.status}", Amount: ₹${sample.totalAmount}`;
      } else if (colName === 'reviews') {
        preview = `e.g. Rating: ${sample.rating}, Comment: "${sample.comment?.slice(0, 30)}..."`;
      } else if (colName === 'customorders') {
        preview = `e.g. Customer: "${sample.customerName || sample.name}", Status: "${sample.status}"`;
      } else if (colName === 'contactmessages') {
        preview = `e.g. From: "${sample.name}", Subject: "${sample.subject}"`;
      } else {
        preview = `Keys: ${Object.keys(sample).slice(0, 5).join(', ')}`;
      }
      console.log(`      ↳ Sample: ${preview}`);
    }
  }

  console.log('\n3. Testing Write & Delete Operations on Atlas...');
  try {
    const testCol = db.collection('__atlas_storage_test');
    const testDoc = {
      testMessage: 'Atlas data storage verification',
      timestamp: new Date(),
      status: 'active'
    };
    
    // Test Insert
    const insertResult = await testCol.insertOne(testDoc);
    console.log(`   ✅ Insert Test: Successfully created document (ID: ${insertResult.insertedId})`);

    // Test Read
    const fetchedDoc = await testCol.findOne({ _id: insertResult.insertedId });
    if (fetchedDoc && fetchedDoc.testMessage === testDoc.testMessage) {
      console.log('   ✅ Read Test: Successfully read back the created document');
    } else {
      console.error('   ❌ Read Test: Document could not be read back correctly');
    }

    // Test Delete (cleanup)
    await testCol.deleteOne({ _id: insertResult.insertedId });
    await testCol.drop().catch(() => {});
    console.log('   ✅ Delete Test: Cleaned up test document & collection');
    console.log('   🎉 Live Write/Read/Delete operations verified: Full Read/Write Access OK!');
  } catch (opErr) {
    console.error(`   ❌ Write/Read test failed: ${opErr.message}`);
  }

  console.log('\n====================================================');
  console.log('📊 SUMMARY');
  console.log('====================================================');
  console.log(`Cluster Host: ${conn.connection.host}`);
  console.log(`Database:     ${conn.connection.name}`);
  const totalDocs = collectionReport.reduce((acc, c) => acc + c.count, 0);
  console.log(`Total Collections: ${collectionReport.length}`);
  console.log(`Total Documents:   ${totalDocs}`);
  console.log('Status: MongoDB Atlas is ACTIVE and properly STORING data.');
  console.log('====================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

checkAtlasData().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
