
import { MongoClient } from 'mongodb';

async function test() {
    const uri1 = 'mongodb://127.0.0.1:27017/shazyboo';
    const uri2 = 'mongodb://[::1]:27017/shazyboo';
    
    console.log('Testing 127.0.0.1...');
    const client1 = new MongoClient(uri1);
    try {
        await client1.connect();
        const count = await client1.db().collection('maincategories').countDocuments();
        console.log('127.0.0.1 Count:', count);
    } catch (e) { console.log('127.0.0.1 Error:', e.message); }
    finally { await client1.close(); }

    console.log('\nTesting [::1]...');
    const client2 = new MongoClient(uri2);
    try {
        await client2.connect();
        const count = await client2.db().collection('maincategories').countDocuments();
        console.log('[::1] Count:', count);
    } catch (e) { console.log('[::1] Error:', e.message); }
    finally { await client2.close(); }
}
test();
