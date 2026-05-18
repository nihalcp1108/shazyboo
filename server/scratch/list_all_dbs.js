
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listAllDbs() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        const admin = conn.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Available Databases:');
        dbs.databases.forEach(db => console.log(`- ${db.name}`));
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
listAllDbs();
