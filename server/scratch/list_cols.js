
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listCols() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const cols = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:');
        cols.forEach(c => console.log(`- ${c.name}`));
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
listCols();
