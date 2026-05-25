import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.USE_LOCAL_DB === 'true' ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI;

async function restoreCollection(collectionName, bsonFilePath) {
  const db = mongoose.connection.db;
  const collection = db.collection(collectionName);
  console.log(`\nRestoring collection: ${collectionName}`);
  // Drop existing collection (if any)
  try {
    await collection.drop();
    console.log(`- Dropped existing ${collectionName}`);
  } catch (e) {
    console.log(`- No existing ${collectionName} to drop`);
  }
  // Read BSON file and deserialize all documents
  const raw = fs.readFileSync(bsonFilePath);
  const bson = new mongoose.mongo.BSON();
  const docs = [];
  let offset = 0;
  while (offset < raw.length) {
    const doc = bson.deserialize(raw.slice(offset));
    const size = raw.readInt32LE(offset);
    docs.push(doc);
    offset += size;
  }
  if (docs.length === 0) {
    console.warn(`- No documents found in ${bsonFilePath}`);
    return;
  }
  await collection.insertMany(docs);
  console.log(`- Inserted ${docs.length} documents into ${collectionName}`);
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const dumpDir = path.resolve(__dirname, '../../mongo_dump/shazyboo');
    const files = fs.readdirSync(dumpDir).filter(f => f.endsWith('.bson'));
    for (const file of files) {
      const collectionName = path.basename(file, '.bson');
      const filePath = path.join(dumpDir, file);
      await restoreCollection(collectionName, filePath);
    }
    console.log('\nDatabase restoration complete.');
  } catch (err) {
    console.error('Error during restore:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
