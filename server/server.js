import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

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
    'http://localhost:5173',
    'https://shazyboo-df9m-git-completed-nihalcp1108s-projects.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow any vercel deployment
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // Check if origin is in allowedOrigins or matches localhost
        const isAllowed = allowedOrigins.includes(origin) || 
                          origin === process.env.CLIENT_URL || 
                          origin === process.env.CORS_ORIGIN ||
                          origin.startsWith('http://localhost:');

        if (isAllowed) {
            return callback(null, true);
        }

        return callback(new Error('CORS not allowed for this origin: ' + origin));
    },
    credentials: true, // required for cookies/JWT
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Pre-flight requests
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

// ================= GLOBAL ERROR HANDLER =================
import multer from 'multer';
app.use((err, req, res, next) => {
    // Multer-specific errors
    if (err instanceof multer.MulterError) {
        let message = err.message;
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Maximum of 20 images allowed';
        } else if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'One or more images exceed the 5 MB size limit';
        }
        return res.status(400).json({ success: false, error: message });
    }

    if (err) {
        const statusCode = err.statusCode || 500;
        const message = err.message || 'Server error';
        return res.status(statusCode).json({ success: false, error: message });
    }

    next();
});

// ================= START SERVER =================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});