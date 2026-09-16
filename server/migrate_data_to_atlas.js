import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

/**
 * Migration Script: Migrate all data from Local MongoDB to MongoDB Atlas
 */
const migrateData = async () => {
  const localUri = 'mongodb://127.0.0.1:27017/gurjeets_handcraft';
  const atlasUri = process.env.MONGODB_URI;

  console.log('====================================================');
  console.log('🍃 MongoDB Local -> Atlas Cloud Data Migration');
  console.log('====================================================');

  if (!atlasUri || atlasUri.includes('<db_password>') || !atlasUri.startsWith('mongodb+srv://')) {
    console.error('❌ MONGODB_URI is not set to a valid MongoDB Atlas connection string in .env!');
    console.error('   Current MONGODB_URI:', atlasUri);
    console.error('   Please replace <db_password> with your actual MongoDB Atlas password in server/.env');
    process.exit(1);
  }

  console.log('1. Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log('   ✅ Connected to Local MongoDB');

  console.log('2. Connecting to MongoDB Atlas Cloud...');
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
  console.log('   ✅ Connected to MongoDB Atlas Cloud');

  const collections = ['products', 'users', 'reviews', 'orders', 'customorders', 'contactmessages'];

  for (const colName of collections) {
    const localCollection = localConn.collection(colName);
    const docs = await localCollection.find({}).toArray();

    console.log(`\n📦 Migrating collection: "${colName}" (${docs.length} documents)...`);
    if (docs.length > 0) {
      const atlasCollection = atlasConn.collection(colName);
      // Clean existing in atlas to prevent duplicate _id conflicts
      await atlasCollection.deleteMany({});
      await atlasCollection.insertMany(docs);
      const atlasCount = await atlasCollection.countDocuments();
      console.log(`   ✅ Successfully migrated ${atlasCount} documents to Atlas.`);
    } else {
      console.log(`   ℹ️ No documents to migrate in "${colName}".`);
    }
  }

  console.log('\n====================================================');
  console.log('🎉 ALL DATA SUCCESSFULLY STORED IN MONGODB ATLAS CLOUD!');
  console.log('====================================================\n');

  await localConn.close();
  await atlasConn.close();
  process.exit(0);
};

migrateData().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
