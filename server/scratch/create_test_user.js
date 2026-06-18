import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.USE_LOCAL_DB === 'true' ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI;

async function create() {
  try {
    await mongoose.connect(uri, {
      dbName: 'shazyboo',
    });
    console.log('✅ Connected to MongoDB');
    
    // Check if user already exists
    const existing = await User.findOne({ email: 'cpnihal35@gmail.com' });
    if (existing) {
      console.log('User already exists in DB. Deleting first to reset...');
      await User.deleteOne({ email: 'cpnihal35@gmail.com' });
    }

    const testUser = new User({
      name: 'Nihal CP',
      email: 'cpnihal35@gmail.com',
      password: 'password123',
      phone: '9567 16 17 16',
      role: 'user',
      isVerified: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully:');
    console.log(' - Name: Nihal CP');
    console.log(' - Email: cpnihal35@gmail.com');
    console.log(' - Password: password123');
    console.log(' - Phone: 9567 16 1716');
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}
create();
