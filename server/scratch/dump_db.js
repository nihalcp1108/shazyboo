
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function dumpDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log(`Found ${collections.length} collections`);
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- Collection: ${col.name}, Count: ${count}`);
        }
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
dumpDb();
