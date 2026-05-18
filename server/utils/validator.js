import { body, param, query, validationResult } from 'express-validator';
import ErrorResponse from './errorResponse.js';

// Common validation rules
export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = [];
        errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

        return res.status(422).json({
            success: false,
            errors: extractedErrors
        });
    };
};

// Auth validators
export const registerValidator = validate([
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .trim(),
    
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail({ gmail_remove_dots: false }),
    
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your password')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match')
]);

export const loginValidator = validate([
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail({ gmail_remove_dots: false }),
    
    body('password')
        .notEmpty().withMessage('Password is required')
]);

export const verifyOTPValidator = validate([
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail({ gmail_remove_dots: false }),
    
    body('otp')
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
        .isNumeric().withMessage('OTP must contain only numbers')
]);

export const forgotPasswordValidator = validate([
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail({ gmail_remove_dots: false })
]);

export const verifyResetOTPValidator = validate([
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail({ gmail_remove_dots: false }),
    
    body('otp')
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
        .isNumeric().withMessage('OTP must contain only numbers')
]);

export const resetPasswordValidator = validate([
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your password')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match')
]);

// Product validators
export const createProductValidator = validate([
    body('name')
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 3, max: 200 }).withMessage('Product name must be between 3 and 200 characters'),
    
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
    
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Other'])
        .withMessage('Please select a valid category'),
    
    body('stock')
        .notEmpty().withMessage('Stock is required')
        .isInt({ min: 0 }).withMessage('Stock must be a positive integer')
]);

export const updateProductValidator = validate([
    body('name')
        .optional()
        .isLength({ min: 3, max: 200 }).withMessage('Product name must be between 3 and 200 characters'),
    
    body('description')
        .optional()
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
    
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a positive integer')
]);

// Review validators
export const createReviewValidator = validate([
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    
    body('comment')
        .notEmpty().withMessage('Comment is required')
        .isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
]);

// Cart validators
export const addToCartValidator = validate([
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID'),
    
    body('quantity')
        .optional()
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
]);

export const updateCartValidator = validate([
    param('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID'),
    
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
]);

// Order validators
export const createOrderValidator = validate([
    body('shippingAddress.name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    
    body('shippingAddress.phone')
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
    
    body('shippingAddress.street')
        .notEmpty().withMessage('Street address is required'),
    
    body('shippingAddress.city')
        .notEmpty().withMessage('City is required'),
    
    body('shippingAddress.state')
        .notEmpty().withMessage('State is required'),
    
    body('shippingAddress.country')
        .notEmpty().withMessage('Country is required'),
    
    body('shippingAddress.zipCode')
        .notEmpty().withMessage('ZIP code is required')
        .matches(/^[0-9]{6}$/).withMessage('ZIP code must be 6 digits'),
    
    body('paymentMethod')
        .notEmpty().withMessage('Payment method is required')
        .isIn(['razorpay', 'cod']).withMessage('Please select a valid payment method')
]);

export const verifyPaymentValidator = validate([
    body('razorpay_order_id')
        .notEmpty().withMessage('Razorpay order ID is required'),
    
    body('razorpay_payment_id')
        .notEmpty().withMessage('Razorpay payment ID is required'),
    
    body('razorpay_signature')
        .notEmpty().withMessage('Razorpay signature is required')
]);

// Admin validators
export const updateUserRoleValidator = validate([
    param('id')
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid user ID'),
    
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['user', 'admin']).withMessage('Please select a valid role')
]);

export const updateOrderStatusValidator = validate([
    param('id')
        .notEmpty().withMessage('Order ID is required')
        .isMongoId().withMessage('Invalid order ID'),
    
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
        .withMessage('Please select a valid status')
]);