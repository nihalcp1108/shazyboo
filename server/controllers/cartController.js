import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id })
        .populate({
            path: 'items.product',
            select: 'name price images stock isActive'
        });

    if (!cart) {
        return res.json({
            success: true,
            data: {
                items: [],
                totalPrice: 0,
                totalItems: 0
            }
        });
    }

    // Filter out inactive products
    const validItems = cart.items.filter(item => 
        item.product && item.product.isActive
    );

    // Update cart if some products were removed
    if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
    }

    res.json({
        success: true,
        data: {
            items: cart.items,
            totalPrice: cart.totalPrice,
            totalItems: cart.totalItems
        }
    });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    // Get product
    const product = await Product.findById(productId);

    if (!product) {
        throw new ErrorResponse('Product not found', 404);
    }

    if (!product.isActive) {
        throw new ErrorResponse('Product is not available', 400);
    }

    if (product.stock < quantity) {
        throw new ErrorResponse('Insufficient stock', 400);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user.id,
            items: []
        });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        
        if (product.stock < newQuantity) {
            throw new ErrorResponse('Insufficient stock', 400);
        }

        cart.items[itemIndex].quantity = newQuantity;
    } else {
        // Add new item
        cart.items.push({
            product: productId,
            quantity,
            price: product.price
        });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    // Populate product details
    await cart.populate({
        path: 'items.product',
        select: 'name price images stock'
    });

    res.json({
        success: true,
        message: 'Item added to cart',
        data: {
            items: cart.items,
            totalPrice: cart.totalPrice,
            totalItems: cart.totalItems
        }
    });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;

    if (quantity < 1) {
        throw new ErrorResponse('Quantity must be at least 1', 400);
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        throw new ErrorResponse('Cart not found', 404);
    }

    // Find item
    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === req.params.productId
    );

    if (itemIndex === -1) {
        throw new ErrorResponse('Item not found in cart', 404);
    }

    // Check product stock
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
        // Remove item if product no longer exists
        cart.items.splice(itemIndex, 1);
        await cart.save();
        throw new ErrorResponse('Product no longer available', 400);
    }

    if (product.stock < quantity) {
        throw new ErrorResponse('Insufficient stock', 400);
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();

    // Populate product details
    await cart.populate({
        path: 'items.product',
        select: 'name price images stock'
    });

    res.json({
        success: true,
        message: 'Cart updated',
        data: {
            items: cart.items,
            totalPrice: cart.totalPrice,
            totalItems: cart.totalItems
        }
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
    // Get cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        throw new ErrorResponse('Cart not found', 404);
    }

    // Remove item
    cart.items = cart.items.filter(
        item => item.product.toString() !== req.params.productId
    );

    cart.updatedAt = Date.now();
    await cart.save();

    // Populate product details
    await cart.populate({
        path: 'items.product',
        select: 'name price images stock'
    });

    res.json({
        success: true,
        message: 'Item removed from cart',
        data: {
            items: cart.items,
            totalPrice: cart.totalPrice,
            totalItems: cart.totalItems
        }
    });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        throw new ErrorResponse('Cart not found', 404);
    }

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({
        success: true,
        message: 'Cart cleared',
        data: {
            items: [],
            totalPrice: 0,
            totalItems: 0
        }
    });
});

// @desc    Get cart count
// @route   GET /api/cart/count
// @access  Private
export const getCartCount = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return res.json({
            success: true,
            data: {
                count: 0
            }
        });
    }

    res.json({
        success: true,
        data: {
            count: cart.totalItems
        }
    });
});

// @desc    Move item to wishlist
// @route   POST /api/cart/:productId/wishlist
// @access  Private
export const moveToWishlist = asyncHandler(async (req, res) => {
    // This would require a Wishlist model
    // For now, just remove from cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        throw new ErrorResponse('Cart not found', 404);
    }

    // Find item
    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === req.params.productId
    );

    if (itemIndex === -1) {
        throw new ErrorResponse('Item not found in cart', 404);
    }

    // Here you would add to wishlist
    // const wishlistItem = await Wishlist.create({
    //     user: req.user.id,
    //     product: req.params.productId
    // });

    // Remove from cart
    cart.items.splice(itemIndex, 1);
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({
        success: true,
        message: 'Item moved to wishlist',
        // wishlistItem
    });
});

// @desc    Apply coupon (placeholder)
// @route   POST /api/cart/coupon
// @access  Private
export const applyCoupon = asyncHandler(async (req, res) => {
    const { couponCode } = req.body;

    // Implement coupon logic here
    // For now, return a placeholder response

    res.json({
        success: true,
        message: 'Coupon applied successfully',
        data: {
            discount: 0,
            couponCode,
            discountType: 'percentage', // or 'fixed'
            discountValue: 0
        }
    });
});

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
export const removeCoupon = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Coupon removed successfully'
    });
});