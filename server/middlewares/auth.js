import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/userModel.js';

// Protect routes - user must be logged in
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if token exists in authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Check if token exists in cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by id
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return next(new ErrorResponse('No user found with this id', 401));
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return next(new ErrorResponse('Your account has been blocked', 403));
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Admin middleware - user must be admin
export const admin = (req, res, next) => {
    if (!req.user) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    if (req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User role ${req.user.role} is not authorized to access this route`,
                403
            )
        );
    }
    next();
};

// Grant access to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorResponse('Not authorized to access this route', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};

// Optional authentication - user can be logged in or not
export const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    // Check if token exists in authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Check if token exists in cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // If no token, just continue without user
    if (!token) {
        return next();
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by id
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && !user.isBlocked) {
            // Add user to request object if found and not blocked
            req.user = user;
        }
        
        next();
    } catch (err) {
        // If token is invalid, just continue without user
        next();
    }
});

// Check if user is verified
export const isVerified = asyncHandler(async (req, res, next) => {
    if (!req.user.isVerified) {
        return next(new ErrorResponse('Please verify your email address first', 403));
    }
    next();
});