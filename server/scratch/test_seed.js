
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MainCategorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    isActive: { type: Boolean, default: true }
}, { collection: 'maincategories' });

const MainCategory = mongoose.model('MainCategory', MainCategorySchema);

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await MainCategory.countDocuments();
        console.log('Current count:', count);
        
        const newCat = await MainCategory.create({
            name: 'Test Category',
            slug: 'test-category',
            isActive: true
        });
        console.log('Created:', newCat);
        
        const afterCount = await MainCategory.countDocuments();
        console.log('After count:', afterCount);
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
seed();
