import mongoose from 'mongoose';

const connectDB = async () => {
  const isLocal = process.env.USE_LOCAL_DB === 'true';
  const atlasUri = process.env.MONGO_URI;
  const localUri = process.env.MONGO_URI_LOCAL;
  const dbUri = isLocal ? localUri : atlasUri;

  if (!dbUri) {
    const missingKey = isLocal ? 'MONGO_URI_LOCAL' : 'MONGO_URI';
    console.error(`DB ERROR: ${missingKey} is not set in server/.env`);
    process.exit(1);
  }

  console.log(`Connecting to database (${isLocal ? 'Local' : 'Atlas'})...`);

  try {
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
    if (!isLocal && localUri) {
      console.warn('Atlas connection failed, attempting local MongoDB fallback...');
      try {
        const conn = await mongoose.connect(localUri, {
          dbName: 'shazyboo',
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000
        });

        console.log(`
══════════════════════════
MongoDB Connected (Local Fallback)
Host: ${conn.connection.host}
DB: ${conn.connection.name}
══════════════════════════
        `);
        return;
      } catch (fallbackError) {
        error = fallbackError;
      }
    }

    console.error('DB ERROR:', error.message);
    process.exit(1);
  }
};

export default connectDB;