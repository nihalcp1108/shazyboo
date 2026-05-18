
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        
        const mainCategories = await db.collection('maincategories').find({}).toArray();
        const categories = await db.collection('categories').find({}).toArray();
        
        console.log('Main Categories:', mainCategories.length);
        mainCategories.forEach(mc => console.log(`- ${mc.name}`));
        
        console.log('Categories:', categories.length);
        categories.forEach(c => console.log(`- ${c.name}`));
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
listCategories();
