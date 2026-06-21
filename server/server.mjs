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

app.set('trust proxy', 1);
// ================= CORS =================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',

  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,

  'https://www.shazyboo.com',
  'https://shazyboo.com',

  'https://shazyboo-df9m.vercel.app',
  'https://shazyboo-df9m-git-completed-nihalcp1108s-projects.vercel.app'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (Postman, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      // Exact matches
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Allow Render domains
      if (origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }

      // Allow localhost
      if (origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }

      console.log('❌ Blocked by CORS:', origin);

      return callback(
        new Error(`CORS not allowed for origin: ${origin}`),
        false
      );
    },

    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization'
    ]
  })
);

// Handle preflight requests
app.options('*', cors());
// ================= STATIC FILES =================
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

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
app.get('/test-email-config', (req, res) => {
  res.json({
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET'
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
