
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MainCategorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    image: String,
    isActive: { type: Boolean, default: true }
}, { collection: 'maincategories' });

const MainCategory = mongoose.model('MainCategory', MainCategorySchema);

async function testCreate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const name = 'Real Category ' + Date.now();
        const slug = name.toLowerCase().replace(/ /g, '-');
        const image = '/uploads/main-categories/test.jpg'; // Dummy image path
        
        const cat = await MainCategory.create({
            name,
            slug,
            image,
            isActive: true
        });
        
        console.log('Success:', cat);
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
testCreate();
