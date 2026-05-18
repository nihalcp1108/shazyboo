import express from 'express';
import {
    getDashboardStats,
    getUsers,
    getUser,
    updateUserRole,
    toggleUserBlock,
    deleteUser,
    getAdminProducts,
    getAdminProduct,
    toggleProductActive,
    toggleProductFeatured,
    toggleProductTrending,
    toggleProductNewArrival,
    toggleProductBestSeller,   // ✅ added missing import
    bulkUpdateProducts,
    getAdminOrders,
    getAdminOrder,
    updateOrderStatus,
    updateOrderTracking,
    getReviews,
    deleteReview,
    getSystemLogs,
    getAnalytics,
    getAdminCategories
} from '../controllers/adminController.js';

// Import admin product functions from adminProductController
import { 
    adminCreateProduct, 
    adminUpdateProduct, 
    adminDeleteProduct 
} from '../controllers/adminProductController.js';

import { protect, authorize } from '../middlewares/auth.js';
import { uploadProductImages } from '../middlewares/upload.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Apply authentication to all admin routes
router.use(protect);
router.use(authorize('admin'));

// ============ DEBUG ROUTES (Remove in production) ============
router.get('/debug/categories', async (req, res) => {
    try {
        const MainCategory = (await import('../models/mainCategoryModel.js')).default;
        const Category = (await import('../models/categoryModel.js')).default;
        
        const mainCategories = await MainCategory.find().select('_id name slug');
        const categories = await Category.find().select('_id name slug');
        
        res.json({
            success: true,
            mainCategories: mainCategories.map(c => ({ id: c._id.toString(), name: c.name, slug: c.slug })),
            categories: categories.map(c => ({ id: c._id.toString(), name: c.name, slug: c.slug }))
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
});

router.get('/debug/category/:id', async (req, res) => {
    try {
        const MainCategory = (await import('../models/mainCategoryModel.js')).default;
        const Category = (await import('../models/categoryModel.js')).default;
        
        const { id } = req.params;
        let mainCategory = null;
        let category = null;
        
        try { mainCategory = await MainCategory.findById(id).select('_id name slug'); } catch (e) {}
        try { category = await Category.findById(id).select('_id name slug'); } catch (e) {}
        
        res.json({
            success: true,
            found: !!(mainCategory || category),
            mainCategory: mainCategory ? { id: mainCategory._id.toString(), name: mainCategory.name, slug: mainCategory.slug, type: 'mainCategory' } : null,
            category: category ? { id: category._id.toString(), name: category.name, slug: category.slug, type: 'category' } : null
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ DASHBOARD ============
router.get('/dashboard', getDashboardStats);

// ============ USER MANAGEMENT ============
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/block', toggleUserBlock);
router.delete('/users/:id', deleteUser);

// ============ PRODUCT MANAGEMENT ============
// NOTE: Keep specific routes before dynamic /:id routes to avoid conflicts
router.get('/products', getAdminProducts);
router.get('/products/:id', getAdminProduct);
router.post('/products', uploadProductImages, adminCreateProduct);
router.put('/products/:id', uploadProductImages, adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);
router.put('/products/:id/toggle-active', toggleProductActive);
router.put('/products/:id/toggle-featured', toggleProductFeatured);
router.put('/products/:id/toggle-trending', toggleProductTrending);
router.put('/products/:id/toggle-new-arrival', toggleProductNewArrival);
router.put('/products/:id/toggle-best-seller', toggleProductBestSeller); // ✅ was missing
router.put('/products/bulk-update', bulkUpdateProducts);

// ============ CATEGORY MANAGEMENT ============
router.get('/categories', getAdminCategories);
router.post('/categories', uploadProductImages, asyncHandler(async (req, res) => {
    const { createCategory } = await import('../controllers/categoryController.js');
    return createCategory(req, res);
}));
router.put('/categories/:id', uploadProductImages, asyncHandler(async (req, res) => {
    const { updateCategory } = await import('../controllers/categoryController.js');
    return updateCategory(req, res);
}));
router.delete('/categories/:id', asyncHandler(async (req, res) => {
    const { deleteCategory } = await import('../controllers/categoryController.js');
    return deleteCategory(req, res);
}));
router.put('/categories/:id/toggle-active', asyncHandler(async (req, res) => {
    const { toggleCategoryActive } = await import('../controllers/categoryController.js');
    return toggleCategoryActive(req, res);
}));
router.put('/categories/:id/toggle-featured', asyncHandler(async (req, res) => {
    const { toggleCategoryFeatured } = await import('../controllers/categoryController.js');
    return toggleCategoryFeatured(req, res);
}));
router.put('/categories/update-order', asyncHandler(async (req, res) => {
    const { updateCategoryOrder } = await import('../controllers/categoryController.js');
    return updateCategoryOrder(req, res);
}));

// ============ ORDER MANAGEMENT ============
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrder);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/tracking', updateOrderTracking);

// ============ REVIEW MANAGEMENT ============
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

// ============ SYSTEM & ANALYTICS ============
router.get('/logs', getSystemLogs);
router.get('/analytics', getAnalytics);

export default router;