import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import path from 'path';

dotenv.config();

import connectDB from './config/database.js';
await connectDB();

import authRoutes from './routes/authRoute.js';
import productRoutes from './routes/productRoute.js';
import cartRoutes from './routes/cartRoute.js';
import orderRoutes from './routes/orderRoute.js';
import adminRoutes from './routes/adminRoute.js';
import categoryRoutes from './routes/categoryRoute.js';
import uploadRoutes from './routes/uploadRoute.js';
import mainCategoryRoutes from './routes/mainCategoryRoute.js';
import contactRoutes from './routes/contactRoute.js';

import { protect } from './middlewares/auth.js';

const app = express();

// ================= FIXED CORS =================
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://shazyboo-df9m.vercel.app',
    process.env.CLIENT_URL,
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedOrigins.some(allowed => allowed.replace(/\/$/, '') === cleanOrigin) ||
                          cleanOrigin.startsWith('http://localhost:') ||
                          cleanOrigin.startsWith('http://127.0.0.1:') ||
                          cleanOrigin.endsWith('.vercel.app');

        if (isAllowed) {
            return callback(null, true);
        }

        return callback(new Error('CORS not allowed for this origin: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// ================= STATIC FILES =================
app.use('/uploads', express.static(path.resolve('../uploads')));

// ================= SECURITY =================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

// ================= RATE LIMIT =================
app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
}));

// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/main-categories', mainCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', protect, cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', protect, uploadRoutes);
app.use('/api/contact', contactRoutes);

// ================= HEALTH =================
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server running',
        env: process.env.NODE_ENV
    });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});