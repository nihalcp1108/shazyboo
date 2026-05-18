
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    role: { type: String, default: 'user' },
    isVerified: { type: Boolean, default: true }
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function createAdmin() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/shazyboo');
        console.log('Connected to IPv4 DB');
        
        const email = 'shazyboo.info@gmail.com';
        const existing = await User.findOne({ email });
        
        if (existing) {
            console.log('Admin already exists in IPv4 DB');
        } else {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                name: 'Admin',
                email: email,
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            console.log('Admin created in IPv4 DB');
        }
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
createAdmin();
