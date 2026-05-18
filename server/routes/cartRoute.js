import express from 'express';
import {
    addToCartValidator,
    updateCartValidator
} from '../utils/validator.js';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount,
    moveToWishlist,
    applyCoupon,
    removeCoupon
} from '../controllers/cartController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.route('/')
    .get(getCart)
    .post(addToCartValidator, addToCart)
    .delete(clearCart);

router.route('/count')
    .get(getCartCount);

router.route('/:productId')
    .put(updateCartValidator, updateCartItem)
    .delete(removeFromCart);

router.route('/:productId/wishlist')
    .post(moveToWishlist);

router.route('/coupon')
    .post(applyCoupon)
    .delete(removeCoupon);

export default router;