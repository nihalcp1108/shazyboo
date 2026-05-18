
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        
        const mcCount = await db.collection('maincategories').countDocuments();
        const cCount = await db.collection('categories').countDocuments();
        const pCount = await db.collection('products').countDocuments();
        
        console.log(`MainCategories: ${mcCount}`);
        console.log(`Categories: ${cCount}`);
        console.log(`Products: ${pCount}`);
        
        if (mcCount > 0) {
            const mcs = await db.collection('maincategories').find({}).toArray();
            mcs.forEach(m => console.log(`- MainCat: ${m.name} (Active: ${m.isActive})`));
        }
        
        if (cCount > 0) {
            const cs = await db.collection('categories').find({}).toArray();
            cs.forEach(c => console.log(`- Cat: ${c.name} (Active: ${c.isActive})`));
        }
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
checkDb();
