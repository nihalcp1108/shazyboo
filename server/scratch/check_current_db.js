import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://shazyboo:shazyboo2026@cluster0.4ox5m7o.mongodb.net/shazyboo?retryWrites=true&w=majority";

console.log("Checking current Atlas DB products...");

try {
  await mongoose.connect(MONGO_URI);
  console.log("Connected successfully");
  
  const products = await mongoose.connection.db.collection('products').find({}).toArray();
  console.log(`Found ${products.length} products in DB currently.`);
  for (const prod of products) {
    console.log(`- ${prod.name} (ID: ${prod._id})`);
  }
  
  await mongoose.disconnect();
} catch (err) {
  console.error("Error:", err);
}
