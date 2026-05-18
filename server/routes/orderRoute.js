import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getOrders,
  updateOrderStatus,
  deliverOrder,
  processRefund,
  getSalesStats
} from '../controllers/orderController.js';
import { protect, admin } from '../middlewares/auth.js';

const router = express.Router();

// ============ PUBLIC ROUTES (NO AUTHENTICATION REQUIRED) ============
// These MUST come before any authentication middleware

// Guest checkout - anyone can create an order
router.post('/create', createOrder);
router.post('/guest-checkout', createOrder);
router.post('/', createOrder);

// User routes (require login)
router.get('/my-orders', protect, getMyOrders);

// Public route to get order by ID - moved after specific routes
router.get('/:id', getOrder);

// ============ PROTECTED ROUTES ============
router.use(protect);
router.put('/:id/cancel', cancelOrder);
router.patch('/:id/cancel', cancelOrder);

// ============ ADMIN ONLY ROUTES ============
router.get('/admin/orders', admin, getOrders);
router.get('/admin/stats', admin, getSalesStats);
router.put('/admin/orders/:id/status', admin, updateOrderStatus);
router.patch('/admin/orders/:id/status', admin, updateOrderStatus);
router.put('/admin/orders/:id/deliver', admin, deliverOrder);
router.post('/admin/orders/:id/refund', admin, processRefund);

export default router;