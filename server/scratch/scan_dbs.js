
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function scanDbs() {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017');
        const admin = conn.connection.db.admin();
        const dbs = await admin.listDatabases();
        
        console.log('Scanning databases...');
        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            if (['admin', 'config', 'local'].includes(dbName)) continue;
            
            const db = conn.connection.useDb(dbName);
            const collections = await db.db.listCollections().toArray();
            
            for (const col of collections) {
                if (col.name === 'maincategories' || col.name === 'categories') {
                    const count = await db.db.collection(col.name).countDocuments();
                    console.log(`- DB: ${dbName}, Collection: ${col.name}, Count: ${count}`);
                }
            }
        }
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
scanDbs();
