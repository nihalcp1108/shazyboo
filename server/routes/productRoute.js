import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { uploadAnyImage } from '../middlewares/upload.js';
import {
    getProducts,
    getProduct,
    getFeaturedProducts,
    getNewArrivals,
    getBestSellers,
    getRelatedProducts,
    createProductReview,
    getProductReviews,
    deleteReview,
    updateStock,
    toggleActive,
    toggleFeatured,
    toggleTrending,
    toggleNewArrival,
    bulkUpdateProducts
} from '../controllers/productController.js';

// Import admin product functions from adminProductController
import {
    adminCreateProduct,
    adminUpdateProduct,
    adminDeleteProduct
} from '../controllers/adminProductController.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/reviews', getProductReviews);

// ============ PROTECTED ROUTES (User) ============
router.post('/:id/reviews', protect, createProductReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

// ============ ADMIN ROUTES ============
// Bulk operations
router.put('/bulk-update', protect, authorize('admin'), bulkUpdateProducts);

// Product management - NOTE: The order matters! Place specific routes before dynamic routes
router.post('/admin', protect, authorize('admin'), uploadAnyImage, adminCreateProduct);
router.put('/admin/:id', protect, authorize('admin'), uploadAnyImage, adminUpdateProduct);
router.delete('/admin/:id', protect, authorize('admin'), adminDeleteProduct);

// Toggle routes
router.put('/:id/stock', protect, authorize('admin'), updateStock);
router.put('/:id/toggle-active', protect, authorize('admin'), toggleActive);
router.put('/:id/toggle-featured', protect, authorize('admin'), toggleFeatured);
router.put('/:id/toggle-trending', protect, authorize('admin'), toggleTrending);
router.put('/:id/toggle-new-arrival', protect, authorize('admin'), toggleNewArrival);

export default router;