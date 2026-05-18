
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkProducts() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shazyboo';
        console.log('Connecting to:', uri);
        const conn = await mongoose.connect(uri);
        const db = mongoose.connection.db;
        
        const products = await db.collection('products').find({}).toArray();
        console.log(`Total Products: ${products.length}`);
        
        const flags = {
            isTrending: 0,
            isNewArrival: 0,
            isBestSeller: 0,
            isFeatured: 0,
            isActive: 0
        };
        
        products.forEach(p => {
            if (p.isTrending) flags.isTrending++;
            if (p.isNewArrival) flags.isNewArrival++;
            if (p.isBestSeller) flags.isBestSeller++;
            if (p.isFeatured) flags.isFeatured++;
            if (p.isActive) flags.isActive++;
            
            console.log(`Product: ${p.name}`);
            console.log(`- Flags: T:${!!p.isTrending}, N:${!!p.isNewArrival}, B:${!!p.isBestSeller}, F:${!!p.isFeatured}, A:${!!p.isActive}`);
            console.log(`- Images: ${JSON.stringify(p.images)}`);
        });
        
        console.log('\nSummary Flags:', flags);
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
checkProducts();
