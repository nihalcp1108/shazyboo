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
import http from 'http';
import fs from 'fs';

// Load environment variables FIRST
dotenv.config();

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import database connection AFTER dotenv.config()
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/authRoute.js';
import productRoutes from './routes/productRoute.js';
import cartRoutes from './routes/cartRoute.js';
import orderRoutes from './routes/orderRoute.js';
import adminRoutes from './routes/adminRoute.js';
import categoryRoutes from './routes/categoryRoute.js';
import uploadRoutes from './routes/uploadRoute.js';
import mainCategoryRoutes from './routes/mainCategoryRoute.js';
import contactRoutes from './routes/contactRoute.js';

// Import middleware
import { protect, authorize } from './middlewares/auth.js';
import ErrorResponse from './utils/errorResponse.js';

// Connect to database
await connectDB();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
const categoriesDir = path.join(uploadsDir, 'categories');
if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
}

const mainCategoriesDir = path.join(uploadsDir, 'main-categories');
if (!fs.existsSync(mainCategoriesDir)) {
    fs.mkdirSync(mainCategoriesDir, { recursive: true });
}

const productsDir = path.join(uploadsDir, 'products');
if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
}

// Body parser - IMPORTANT: This must come before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth-token']
}));

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));

// Data sanitization
app.use(mongoSanitize());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    skipSuccessfulRequests: true,
});
app.use('/api/orders', orderLimiter);

// Static folder for uploads - serve both locations
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        database: 'Connected'
    });
});

// API Documentation
app.get('/api-docs', (req, res) => {
    res.json({
        message: 'API Documentation',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                getMe: 'GET /api/auth/me'
            },
            products: {
                getAll: 'GET /api/products',
                getSingle: 'GET /api/products/:id',
                create: 'POST /api/admin/products (Admin)',
                update: 'PUT /api/admin/products/:id (Admin)',
                delete: 'DELETE /api/admin/products/:id (Admin)'
            },
            categories: {
                getAll: 'GET /api/categories'
            },
            mainCategories: {
                getAll: 'GET /api/main-categories',
                getActive: 'GET /api/main-categories/active',
                getSingle: 'GET /api/main-categories/:id',
                create: 'POST /api/main-categories (Admin)',
                update: 'PUT /api/main-categories/:id (Admin)',
                delete: 'DELETE /api/main-categories/:id (Admin)'
            },
            cart: {
                getCart: 'GET /api/cart',
                addToCart: 'POST /api/cart'
            },
            orders: {
                createOrder: 'POST /api/orders',
                getMyOrders: 'GET /api/orders/my-orders'
            }
        }
    });
});

// ============ API Routes ============
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/main-categories', mainCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', protect, cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', protect, uploadRoutes);
app.use('/api/contact', contactRoutes);

// Test route to check route registration
app.get('/api/routes', (req, res) => {
    res.json({
        success: true,
        message: 'Registered routes',
        mainCategoriesRegistered: !!mainCategoryRoutes,
        routes: [
            '/api/auth',
            '/api/products',
            '/api/categories',
            '/api/main-categories',
            '/api/orders',
            '/api/cart',
            '/api/admin',
            '/api/upload'
        ]
    });
});

// Debug route to check file existence
app.get('/api/debug', (req, res) => {
    const routesFile = path.join(__dirname, 'routes', 'mainCategoryRoutes.js');
    const controllerFile = path.join(__dirname, 'controllers', 'mainCategoryController.js');
    const modelFile = path.join(__dirname, 'models', 'mainCategoryModel.js');
    
    res.json({
        success: true,
        files: {
            routesExists: fs.existsSync(routesFile),
            controllerExists: fs.existsSync(controllerFile),
            modelExists: fs.existsSync(modelFile)
        },
        paths: {
            routes: routesFile,
            controller: controllerFile,
            model: modelFile
        },
        routesDirectory: fs.readdirSync(path.join(__dirname, 'routes')).filter(f => f.endsWith('.js'))
    });
});

// ============ Error Handling ============
app.use((err, req, res, next) => {
    console.error('🔥 Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') {
        const message = 'Resource not found with the specified ID';
        error = new ErrorResponse(message, 404);
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = new ErrorResponse(message, 400);
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Find available port
const findAvailablePort = (startPort) => {
    startPort = Number(startPort);
    return new Promise((resolve, reject) => {
        const server = http.createServer();
        
        server.listen(startPort, () => {
            server.once('close', () => {
                resolve(startPort);
            });
            server.close();
        });
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
};

// Start server
const startServer = async () => {
    const DEFAULT_PORT = process.env.PORT || 5001;
    
    try {
        const availablePort = await findAvailablePort(DEFAULT_PORT);
        
        const server = app.listen(availablePort, () => {
            console.log(`
    ════════════════════════════════════════════════════════════
    🚀 SERVER STARTED SUCCESSFULLY!
    ════════════════════════════════════════════════════════════
    ⚡ Environment: ${process.env.NODE_ENV || 'development'}
    📡 Port: ${availablePort}
    🔗 Base URL: http://localhost:${availablePort}
    📚 API Docs: http://localhost:${availablePort}/api-docs
    🏥 Health Check: http://localhost:${availablePort}/health
    🧪 Routes Check: http://localhost:${availablePort}/api/routes
    🔍 Debug Info: http://localhost:${availablePort}/api/debug
    ════════════════════════════════════════════════════════════
            `);
            
            console.log(`
    📝 MAIN CATEGORIES API ENDPOINTS:
    ✅ GET    http://localhost:${availablePort}/api/main-categories
    ✅ GET    http://localhost:${availablePort}/api/main-categories/active
    ✅ GET    http://localhost:${availablePort}/api/main-categories/:id
    ✅ POST   http://localhost:${availablePort}/api/main-categories (Admin)
    ✅ PUT    http://localhost:${availablePort}/api/main-categories/:id (Admin)
    ✅ DELETE http://localhost:${availablePort}/api/main-categories/:id (Admin)
    
    📝 PRODUCT API ENDPOINTS (ADMIN):
    ✅ POST   http://localhost:${availablePort}/api/admin/products (Admin)
    ✅ PUT    http://localhost:${availablePort}/api/admin/products/:id (Admin)
    ✅ DELETE http://localhost:${availablePort}/api/admin/products/:id (Admin)
    ════════════════════════════════════════════════════════════
            `);
        });

        process.on('unhandledRejection', (err) => {
            console.error('❌ Unhandled Promise Rejection:', err.message);
            server.close(() => {
                process.exit(1);
            });
        });

        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('📴 Process terminated');
            });
        });

    } catch (error) {
        console.error('💥 Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

export default app;