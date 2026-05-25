import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.USE_LOCAL_DB === 'true' ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI;

async function check() {
  try {
    await mongoose.connect(uri, {
      dbName: 'shazyboo',
    });
    console.log('✅ Connected to MongoDB');
    const users = await User.find({}, 'name email role isVerified');
    console.log('Users in DB:');
    users.forEach(u => console.log(`- ${u.name} (${u.email}) [Role: ${u.role}, Verified: ${u.isVerified}]`));
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}
check();
