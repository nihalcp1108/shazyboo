import express from 'express';
import {
    getMainCategories,
    getMainCategory,
    createMainCategory,
    updateMainCategory,
    deleteMainCategory,
    toggleMainCategoryActive,
    toggleMainCategoryFeatured,
    getActiveMainCategories,
    getMainCategoryWithSubCategories,
    reorderMainCategories,
    bulkDeleteMainCategories
} from '../controllers/mainCategoryController.js';
import { protect, authorize } from '../middlewares/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/main-categories');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `main-cat-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: fileFilter
});

const router = express.Router();

// Public routes
router.get('/', getMainCategories);
router.get('/active', getActiveMainCategories);
router.get('/:id', getMainCategory);
router.get('/:id/subcategories', getMainCategoryWithSubCategories);

// Admin only routes
router.post('/', protect, authorize('admin'), upload.single('image'), createMainCategory);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateMainCategory);
router.delete('/:id', protect, authorize('admin'), deleteMainCategory);
router.put('/:id/toggle-active', protect, authorize('admin'), toggleMainCategoryActive);
router.put('/:id/toggle-featured', protect, authorize('admin'), toggleMainCategoryFeatured);
router.put('/reorder', protect, authorize('admin'), reorderMainCategories);
router.post('/bulk-delete', protect, authorize('admin'), bulkDeleteMainCategories);

export default router;