import express from 'express';
import {
    getCategories,
    getCategory,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
    getFeaturedCategories,
    getCategoryHierarchy,
    getProductsByCategory,
    toggleCategoryActive,
    toggleCategoryFeatured,
    updateCategoryOrder
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { uploadCategoryImage } from '../middlewares/upload.js';

const router = express.Router();

// ─── Public routes ────────────────────────────────────────────────────────────
// Named sub-paths MUST be defined before /:id / /:slug to prevent Express
// from matching them as a param value.
router.get('/featured',       getFeaturedCategories);
router.get('/hierarchy/all',  getCategoryHierarchy);
router.get('/slug/:slug',     getCategoryBySlug);

// Admin bulk-order update (before /:id so Express doesn't treat 'update-order' as an id)
router.put(
    '/update-order',
    protect,
    authorize('admin'),
    updateCategoryOrder
);

router.get('/',               getCategories);
router.get('/:slug/products', getProductsByCategory);
router.get('/:id',            getCategory);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.post(
    '/',
    protect,
    authorize('admin'),
    uploadCategoryImage,
    createCategory
);

router.put(
    '/:id',
    protect,
    authorize('admin'),
    uploadCategoryImage,
    updateCategory
);

router.delete('/:id',              protect, authorize('admin'), deleteCategory);
router.put('/:id/toggle-active',   protect, authorize('admin'), toggleCategoryActive);
router.put('/:id/toggle-featured', protect, authorize('admin'), toggleCategoryFeatured);

export default router;