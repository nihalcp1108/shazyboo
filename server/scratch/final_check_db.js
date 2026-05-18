
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('Using URI:', process.env.MONGODB_URI);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        
        const mc = await db.collection('maincategories').countDocuments();
        const c = await db.collection('categories').countDocuments();
        
        console.log('MainCategories:', mc);
        console.log('Categories:', c);
        
        if (mc > 0) {
            const mcs = await db.collection('maincategories').find({}).toArray();
            console.log('MainCategories data:', JSON.stringify(mcs, null, 2));
        }
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
check();
