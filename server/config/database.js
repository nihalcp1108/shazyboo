import mongoose from 'mongoose';

const connectDB = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'shazyboo'
        });

        console.log(`
═══════════════════════════════════════════
✅ MongoDB Connected Successfully
═══════════════════════════════════════════
🌍 Host : ${conn.connection.host}
📦 Database : ${conn.connection.name}
═══════════════════════════════════════════
        `);

    } catch (error) {

        console.error(`
═══════════════════════════════════════════
❌ MongoDB Connection Failed
═══════════════════════════════════════════
${error.message}
═══════════════════════════════════════════
        `);

        process.exit(1);
    }
};

export default connectDB;