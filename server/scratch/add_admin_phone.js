
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fix() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/shazyboo');
        await mongoose.connection.db.collection('users').updateOne(
            { email: 'shazyboo.info@gmail.com' },
            { $set: { phone: '9876543210' } }
        );
        console.log('Phone number added to admin');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
fix();
