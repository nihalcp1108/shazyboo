
import { MongoClient } from 'mongodb';

async function scan() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const admin = client.db().admin();
        const dbs = await admin.listDatabases();
        
        console.log('Scanning...');
        for (const dbInfo of dbs.databases) {
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            for (const col of collections) {
                if (col.name === 'maincategories') {
                    const count = await db.collection(col.name).countDocuments();
                    console.log(`DB: ${dbInfo.name}, Count: ${count}`);
                    if (count > 0) {
                        const sample = await db.collection(col.name).findOne();
                        console.log('Sample:', sample.name);
                    }
                }
            }
        }
    } finally {
        await client.close();
    }
}
scan();
