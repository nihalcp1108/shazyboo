import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGO_URI;
console.log('Testing connection to:', uri ? uri.replace(/:([^@]+)@/, ':****@') : 'undefined');

async function test() {
  try {
    if (!uri) throw new Error('MONGO_URI is not defined in server/.env');
    await mongoose.connect(uri, {
      dbName: 'shazyboo',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connection to MongoDB Atlas successful!');
    console.log('Collections:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => console.log(' -', col.name));
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}
test();
