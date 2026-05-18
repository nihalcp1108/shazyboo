import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.param,
            message: error.msg
        }));
        
        return res.status(400).json({
            success: false,
            errors: errorMessages
        });
    }
    
    next();
};

// Validate ObjectId
export const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: `Invalid ${paramName} ID format`
            });
        }
        
        next();
    };
};

// Validate pagination parameters
export const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
            success: false,
            error: 'Invalid pagination parameters'
        });
    }
    
    req.query.page = page;
    req.query.limit = limit;
    req.query.skip = (page - 1) * limit;
    
    next();
};

// Validate sort parameters
export const validateSort = (allowedFields = []) => {
    return (req, res, next) => {
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        
        if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                error: `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`
            });
        }
        
        req.query.sort = { [sortBy]: sortOrder };
        next();
    };
};