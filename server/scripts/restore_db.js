import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { deserialize } from 'bson';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.USE_LOCAL_DB === 'true' ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not set');
  process.exit(1);
}

async function restoreCollection(collectionName, bsonFilePath) {
  const db = mongoose.connection.db;
  const collection = db.collection(collectionName);
  console.log(`\nRestoring collection: ${collectionName}`);
  try {
    await collection.drop();
    console.log(`- Dropped existing ${collectionName}`);
  } catch (e) {
    console.log(`- No existing ${collectionName} to drop`);
  }
  const raw = fs.readFileSync(bsonFilePath);
  const docs = [];
  let offset = 0;
  while (offset < raw.length) {
    const size = raw.readInt32LE(offset);
    const slice = raw.slice(offset, offset + size);
    const doc = deserialize(slice);
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
