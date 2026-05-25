import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const isLocal = process.env.USE_LOCAL_DB === 'true';
    const dbUri = isLocal ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI;
    
    console.log(`Connecting to database (${isLocal ? 'Local' : 'Atlas'})...`);
    
    const conn = await mongoose.connect(dbUri, {
      dbName: 'shazyboo',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });

    console.log(`
══════════════════════════
MongoDB Connected
Host: ${conn.connection.host}
DB: ${conn.connection.name}
══════════════════════════
    `);
  } catch (error) {
    console.error('DB ERROR:', error.message);
    process.exit(1);
  }
};

export default connectDB;