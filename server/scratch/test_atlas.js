import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const uris = [
  'mongodb+srv://nihal:nihal123@cluster0.4ox5m7o.mongodb.net/shazyboo',
  'mongodb+srv://nihal:shazyboo%402026@cluster0.4ox5m7o.mongodb.net/shazyboo',
  'mongodb+srv://nihal:shazyboo2026@cluster0.4ox5m7o.mongodb.net/shazyboo',
  'mongodb+srv://nihal:Nihal123@cluster0.4ox5m7o.mongodb.net/shazyboo',
  'mongodb+srv://nihal:Nihal%402026@cluster0.4ox5m7o.mongodb.net/shazyboo',
  'mongodb+srv://nihal:shazyboo@cluster0.4ox5m7o.mongodb.net/shazyboo',
];

async function run() {
  for (const uri of uris) {
    try {
      console.log(`Testing: ${uri.replace(/:([^@]+)@/, ':****@')}`);
      await mongoose.connect(uri, {
        dbName: 'shazyboo',
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      console.log('✅ Success!');
      await mongoose.connection.close();
      return;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }
}
run();
