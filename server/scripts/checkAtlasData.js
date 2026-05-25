import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI not set in .env');
  process.exit(1);
}

(async () => {
  try {
    const conn = await mongoose.connect(uri, { dbName: 'shazyboo', useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to Atlas');
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('⚠️ No collections found in Atlas database');
      process.exit(0);
    }
    console.log('📦 Collections and document counts:');
    for (const coll of collections) {
      const count = await db.collection(coll.name).estimatedDocumentCount();
      console.log(`- ${coll.name}: ${count}`);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error connecting to Atlas:', err);
    process.exit(1);
  }
})();
