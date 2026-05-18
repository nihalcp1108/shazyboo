import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Product from '../models/productModel.js';
import MainCategory from '../models/mainCategoryModel.js';
import Category from '../models/categoryModel.js';
import Review from '../models/reviewModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to delete files
const deleteFile = (filePath) => {
    if (!filePath) return false;
    const fullPath = path.join(__dirname, '../..', filePath);
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
            console.log('Deleted file:', filePath);
            return true;
        } catch (err) {
            console.error('Error deleting file:', err);
            return false;
        }
    }
    return false;
};

// Helper function to delete multiple files
const deleteFiles = (filePaths) => {
    const results = filePaths.map(filePath => ({
        path: filePath,
        success: deleteFile(filePath)
    }));
    return results;
};

// @desc    Create new product (Admin)
// @route   POST /api/admin/products
// @access  Private/Admin
export const adminCreateProduct = asyncHandler(async (req, res) => {
    console.log('🚀 ADMIN CREATE PRODUCT FUNCTION CALLED!');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('mainCategory value:', req.body.mainCategory);
    console.log('category value:', req.body.category);
    console.log('Files count:', req.files ? req.files.length : 0);
    
    try {
        // Validate required fields
        if (!req.body.mainCategory || req.body.mainCategory === '') {
            console.error('❌ mainCategory is missing or empty');
            throw new ErrorResponse('Please select main category2', 400);
        }
        
        if (!req.body.category || req.body.category === '') {
            console.error('❌ category is missing or empty');
            throw new ErrorResponse('Please select category', 400);
        }
        
        if (!req.body.name || req.body.name === '') {
            console.error('❌ name is missing or empty');
            throw new ErrorResponse('Product name is required', 400);
        }
        
        if (!req.body.description || req.body.description === '') {
            console.error('❌ description is missing or empty');
            throw new ErrorResponse('Description is required', 400);
        }
        
        if (!req.body.price || req.body.price === '') {
            console.error('❌ price is missing or empty');
            throw new ErrorResponse('Price is required', 400);
        }
        
        if (!req.body.stock || req.body.stock === '') {
            console.error('❌ stock is missing or empty');
            throw new ErrorResponse('Stock is required', 400);
        }
        
        // Validate that mainCategory exists in database
        console.log('Looking for mainCategory with ID:', req.body.mainCategory);
        const mainCategoryExists = await MainCategory.findById(req.body.mainCategory);
        if (!mainCategoryExists) {
            console.log('❌ Main category not found:', req.body.mainCategory);
            throw new ErrorResponse('Invalid main category - Category not found', 400);
        }
        console.log('✅ Main category found:', mainCategoryExists.name);

        // Validate that category exists in database
        console.log('Looking for category with ID:', req.body.category);
        const categoryExists = await Category.findById(req.body.category);
        if (!categoryExists) {
            console.log('❌ Category not found:', req.body.category);
            throw new ErrorResponse('Invalid category - Category not found', 400);
        }
        console.log('✅ Category found:', categoryExists.name);

        // Validate images
        if (!req.files || req.files.length === 0) {
            console.error('❌ No images uploaded');
            throw new ErrorResponse('At least one product image is required', 400);
        }
        console.log(`✅ ${req.files.length} images uploaded`);

        // Process images
        const images = req.files.map((file, index) => ({
            public_id: file.filename,
            url: `/uploads/products/${file.filename}`,
            alt: req.body.name || `Product image ${index + 1}`,
            isDefault: index === 0
        }));

        // Parse numeric fields
        const price = parseFloat(req.body.price);
        if (isNaN(price) || price < 0) {
            throw new ErrorResponse('Price must be a valid positive number', 400);
        }

        const stock = parseInt(req.body.stock);
        if (isNaN(stock) || stock < 0) {
            throw new ErrorResponse('Stock must be a valid positive integer', 400);
        }

        const discountPrice = req.body.discountPrice ? parseFloat(req.body.discountPrice) : 0;
        if (discountPrice < 0) {
            throw new ErrorResponse('Discount price cannot be negative', 400);
        }
        
        // Parse colors
        let colors = [];
        if (req.body.colors) {
            try {
                colors = JSON.parse(req.body.colors);
                console.log('Parsed colors:', colors.length);
            } catch (error) {
                console.error("Error parsing colors:", error);
            }
        }

        // Parse tags
        let tags = [];
        if (req.body.tags) {
            try {
                tags = JSON.parse(req.body.tags);
                console.log('Parsed tags:', tags);
            } catch {
                tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            }
        }

        // Parse boolean fields
        const isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
        const isTrending = req.body.isTrending === 'true' || req.body.isTrending === true;
        const isNewArrival = req.body.isNewArrival === 'true' || req.body.isNewArrival === true;
        const isBestSeller = req.body.isBestSeller === 'true' || req.body.isBestSeller === true;
        const isActive = req.body.isActive === 'true' || req.body.isActive === true;

        // Generate SKU
        const categoryCode = categoryExists.name.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const sku = `${categoryCode}-${timestamp}`;

        // Create product
        const productData = {
            name: req.body.name.trim(),
            description: req.body.description.trim(),
            shortDescription: req.body.shortDescription?.trim() || req.body.description.substring(0, 200),
            price,
            discountPrice,
            mainCategory: req.body.mainCategory,
            category: req.body.category,
            subCategory: req.body.subCategory || '',
            brand: req.body.brand || '',
            stock,
            sku,
            colors,
            images,
            tags,
            isFeatured,
            isTrending,
            isNewArrival,
            isBestSeller,
            isActive,
            seller: req.user.id
        };

        console.log('📦 Creating product with:', {
            name: productData.name,
            mainCategory: productData.mainCategory,
            category: productData.category,
            price: productData.price,
            stock: productData.stock
        });

        const product = await Product.create(productData);
        console.log('✅ Product created successfully with ID:', product._id);

        // Populate response
        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name slug')
            .populate('mainCategory', 'name slug icon');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: populatedProduct
        });

    } catch (error) {
        console.error('❌ Error in adminCreateProduct:', error.message);
        
        // Delete uploaded files if product creation fails
        if (req.files && req.files.length > 0) {
            console.log('Cleaning up uploaded files due to error');
            req.files.forEach(file => {
                const filePath = `/uploads/products/${file.filename}`;
                deleteFile(filePath);
            });
        }
        
        throw error;
    }
});

// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const adminUpdateProduct = asyncHandler(async (req, res) => {
    console.log('🔄 ADMIN UPDATE PRODUCT CALLED!');
    console.log('Product ID:', req.params.id);
    console.log('Request body:', req.body);
    
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        const updateData = { updatedAt: Date.now() };

        // Update basic fields
        const textFields = ['name', 'description', 'shortDescription', 'brand', 'subCategory'];
        textFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field].trim();
            }
        });

        // Update numeric fields
        if (req.body.price !== undefined) {
            const price = parseFloat(req.body.price);
            if (isNaN(price) || price < 0) throw new ErrorResponse('Invalid price', 400);
            updateData.price = price;
        }
        
        if (req.body.discountPrice !== undefined) {
            const discountPrice = parseFloat(req.body.discountPrice);
            if (discountPrice < 0) throw new ErrorResponse('Invalid discount price', 400);
            updateData.discountPrice = discountPrice || 0;
        }
        
        if (req.body.stock !== undefined) {
            const stock = parseInt(req.body.stock);
            if (isNaN(stock) || stock < 0) throw new ErrorResponse('Invalid stock', 400);
            updateData.stock = stock;
        }

        // Update category references
        if (req.body.mainCategory !== undefined && req.body.mainCategory !== '') {
            const mainCatExists = await MainCategory.findById(req.body.mainCategory);
            if (!mainCatExists) throw new ErrorResponse('Invalid main category', 400);
            updateData.mainCategory = req.body.mainCategory;
            console.log('Updating mainCategory to:', req.body.mainCategory);
        }
        
        if (req.body.category !== undefined && req.body.category !== '') {
            const catExists = await Category.findById(req.body.category);
            if (!catExists) throw new ErrorResponse('Invalid category', 400);
            updateData.category = req.body.category;
            console.log('Updating category to:', req.body.category);
        }

        // Update colors
        if (req.body.colors !== undefined) {
            try {
                updateData.colors = JSON.parse(req.body.colors);
                console.log('Updating colors:', updateData.colors.length);
            } catch (error) {
                console.error("Error parsing colors:", error);
            }
        }

        // Update tags
        if (req.body.tags !== undefined) {
            try {
                updateData.tags = JSON.parse(req.body.tags);
            } catch {
                updateData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            }
        }

        // Update boolean fields
        const booleanFields = ['isFeatured', 'isTrending', 'isNewArrival', 'isBestSeller', 'isActive'];
        booleanFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field] === 'true' || req.body[field] === true;
            }
        });

        // Handle images
        let images = [...product.images];
        
        // Add new images
        if (req.files && req.files.length > 0) {
            console.log(`Adding ${req.files.length} new images`);
            const newImages = req.files.map((file, index) => ({
                public_id: file.filename,
                url: `/uploads/products/${file.filename}`,
                alt: req.body.name || product.name,
                isDefault: false
            }));
            images = [...images, ...newImages];
        }

        // Handle deleted images
        if (req.body.deletedImages) {
            let deletedImages;
            try {
                deletedImages = JSON.parse(req.body.deletedImages);
                console.log('Deleting images:', deletedImages);
            } catch (error) {
                throw new ErrorResponse('Invalid deletedImages format', 400);
            }
            
            deletedImages.forEach(imageId => {
                const imageIndex = images.findIndex(img => img.public_id === imageId);
                if (imageIndex !== -1) {
                    deleteFile(images[imageIndex].url);
                    images.splice(imageIndex, 1);
                }
            });
        }

        // Handle default image
        if (req.body.defaultImage) {
            console.log('Setting default image:', req.body.defaultImage);
            images.forEach(img => {
                img.isDefault = img.public_id === req.body.defaultImage;
            });
        } else if (images.length > 0 && !images.some(img => img.isDefault)) {
            images[0].isDefault = true;
        }

        // Ensure at least one image
        if (images.length === 0) {
            throw new ErrorResponse('Product must have at least one image', 400);
        }

        updateData.images = images;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name slug')
         .populate('mainCategory', 'name slug icon');

        console.log('✅ Product updated successfully');
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });

    } catch (error) {
        console.error('❌ Error in adminUpdateProduct:', error.message);
        
        // Delete uploaded files if update fails
        if (req.files && req.files.length > 0) {
            console.log('Cleaning up uploaded files due to error');
            req.files.forEach(file => {
                const filePath = `/uploads/products/${file.filename}`;
                deleteFile(filePath);
            });
        }
        
        throw error;
    }
});

// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const adminDeleteProduct = asyncHandler(async (req, res) => {
    console.log('🗑️ ADMIN DELETE PRODUCT CALLED!');
    console.log('Product ID:', req.params.id);
    
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        // Delete product images from server
        if (product.images && product.images.length > 0) {
            console.log(`Deleting ${product.images.length} images`);
            product.images.forEach(img => {
                deleteFile(img.url);
            });
        }

        await product.deleteOne();
        console.log('✅ Product deleted successfully');

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error in adminDeleteProduct:', error.message);
        throw error;
    }
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    try {
        // Build query
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Handle search
        if (req.query.search) {
            queryObj.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { tags: { $regex: req.query.search, $options: 'i' } },
                { brand: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Handle main category
        if (req.query.mainCategory) {
            queryObj.mainCategory = req.query.mainCategory;
        }

        // Handle category
        if (req.query.category) {
            queryObj.category = req.query.category;
        }

        // Handle price range
        if (req.query.minPrice || req.query.maxPrice) {
            queryObj.price = {};
            if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
            delete queryObj.minPrice;
            delete queryObj.maxPrice;
        }

        // Handle stock
        if (req.query.inStock === 'true') {
            queryObj.stock = { $gt: 0 };
            delete queryObj.inStock;
        }

        // Handle featured
        if (req.query.featured === 'true') {
            queryObj.isFeatured = true;
            delete queryObj.featured;
        }

        // Handle trending
        if (req.query.trending === 'true') {
            queryObj.isTrending = true;
            delete queryObj.trending;
        }

        // Handle new arrival
        if (req.query.newArrival === 'true') {
            queryObj.isNewArrival = true;
            delete queryObj.newArrival;
        }

        // Handle best seller
        if (req.query.bestSeller === 'true') {
            queryObj.isBestSeller = true;
            delete queryObj.bestSeller;
        }

        // Handle active products only for non-admin users
        if (!req.user || req.user.role !== 'admin') {
            queryObj.isActive = true;
        }

        // Execute query
        let query = Product.find(queryObj);

        // Select fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Product.countDocuments(queryObj);

        query = query.skip(startIndex).limit(limit);

        // Populate category and mainCategory
        query = query.populate('category', 'name slug image');
        query = query.populate('mainCategory', 'name slug icon image');

        // Populate reviews
        query = query.populate({
            path: 'reviews',
            select: 'rating comment createdAt',
            perDocumentLimit: 5
        });

        // Execute query
        const products = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.json({
            success: true,
            count: products.length,
            pagination: {
                ...pagination,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            },
            data: products
        });
    } catch (error) {
        console.error('Error in getProducts:', error);
        throw new ErrorResponse('Failed to fetch products', 500);
    }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug image')
            .populate('mainCategory', 'name slug icon image')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'name avatar'
                }
            })
            .populate('seller', 'name');

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        // Check if product is active (for non-admin users)
        if (!product.isActive && (!req.user || req.user.role !== 'admin')) {
            throw new ErrorResponse('Product not available', 404);
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error in getProduct:', error);
        throw error;
    }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({ 
            isFeatured: true, 
            isActive: true,
            stock: { $gt: 0 }
        })
        .sort('-createdAt')
        .limit(8)
        .populate('reviews', 'rating')
        .populate('category', 'name')
        .populate('mainCategory', 'name');

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error in getFeaturedProducts:', error);
        throw new ErrorResponse('Failed to fetch featured products', 500);
    }
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
export const getNewArrivals = asyncHandler(async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const products = await Product.find({ 
            isActive: true,
            stock: { $gt: 0 },
            createdAt: { $gte: thirtyDaysAgo }
        })
        .sort('-createdAt')
        .limit(8)
        .populate('reviews', 'rating')
        .populate('category', 'name')
        .populate('mainCategory', 'name');

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error in getNewArrivals:', error);
        throw new ErrorResponse('Failed to fetch new arrivals', 500);
    }
});

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
export const getBestSellers = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({ 
            isActive: true,
            stock: { $gt: 0 }
        })
        .sort('-sold')
        .limit(8)
        .populate('reviews', 'rating')
        .populate('category', 'name')
        .populate('mainCategory', 'name');

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error in getBestSellers:', error);
        throw new ErrorResponse('Failed to fetch best sellers', 500);
    }
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        const products = await Product.find({
            _id: { $ne: product._id },
            category: product.category,
            isActive: true,
            stock: { $gt: 0 }
        })
        .limit(4)
        .populate('reviews', 'rating')
        .populate('category', 'name')
        .populate('mainCategory', 'name');

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error in getRelatedProducts:', error);
        throw error;
    }
});

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            throw new ErrorResponse('Please provide a rating between 1 and 5', 400);
        }

        if (!comment || comment.trim() === '') {
            throw new ErrorResponse('Please provide a comment', 400);
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        const alreadyReviewed = product.reviews.find(
            review => review.user.toString() === req.user.id.toString()
        );

        if (alreadyReviewed) {
            throw new ErrorResponse('Product already reviewed', 400);
        }

        const review = {
            user: req.user.id,
            name: req.user.name,
            rating: Number(rating),
            comment: comment.trim(),
            isVerifiedPurchase: false
        };

        product.reviews.push(review);
        product.ratings.count = product.reviews.length;
        product.ratings.average = 
            product.reviews.reduce((acc, item) => item.rating + acc, 0) / 
            product.reviews.length;

        await product.save();

        await Review.create({
            product: product._id,
            user: req.user.id,
            rating: Number(rating),
            comment: comment.trim()
        });

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: review
        });
    } catch (error) {
        console.error('Error in createProductReview:', error);
        throw error;
    }
});

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'name avatar'
                }
            });

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        res.json({
            success: true,
            count: product.reviews.length,
            data: product.reviews
        });
    } catch (error) {
        console.error('Error in getProductReviews:', error);
        throw error;
    }
});

// @desc    Delete review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        const review = product.reviews.find(
            review => review._id.toString() === req.params.reviewId
        );

        if (!review) {
            throw new ErrorResponse('Review not found', 404);
        }

        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            throw new ErrorResponse('Not authorized to delete this review', 401);
        }

        product.reviews = product.reviews.filter(
            review => review._id.toString() !== req.params.reviewId
        );

        if (product.reviews.length > 0) {
            product.ratings.count = product.reviews.length;
            product.ratings.average = 
                product.reviews.reduce((acc, item) => item.rating + acc, 0) / 
                product.reviews.length;
        } else {
            product.ratings.count = 0;
            product.ratings.average = 0;
        }

        await product.save();

        await Review.findByIdAndDelete(req.params.reviewId);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteReview:', error);
        throw error;
    }
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
export const updateStock = asyncHandler(async (req, res) => {
    try {
        const { stock } = req.body;

        if (stock === undefined || stock === null) {
            throw new ErrorResponse('Please provide stock quantity', 400);
        }

        const stockNum = parseInt(stock);
        if (isNaN(stockNum) || stockNum < 0) {
            throw new ErrorResponse('Stock must be a valid positive integer', 400);
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        product.stock = stockNum;
        await product.save();

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Error in updateStock:', error);
        throw error;
    }
});

// @desc    Toggle product active status
// @route   PUT /api/products/:id/toggle-active
// @access  Private/Admin
export const toggleActive = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        product.isActive = !product.isActive;
        await product.save();

        res.json({
            success: true,
            message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
            data: product
        });
    } catch (error) {
        console.error('Error in toggleActive:', error);
        throw error;
    }
});

// @desc    Toggle product featured status
// @route   PUT /api/admin/products/:id/toggle-featured
// @access  Private/Admin
export const toggleFeatured = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        product.isFeatured = !product.isFeatured;
        await product.save();

        res.json({
            success: true,
            message: `Product ${product.isFeatured ? 'marked as featured' : 'removed from featured'} successfully`,
            data: product
        });
    } catch (error) {
        console.error('Error in toggleFeatured:', error);
        throw error;
    }
});

// @desc    Toggle product trending status
// @route   PUT /api/admin/products/:id/toggle-trending
// @access  Private/Admin
export const toggleTrending = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        product.isTrending = !product.isTrending;
        await product.save();

        res.json({
            success: true,
            message: `Product ${product.isTrending ? 'marked as trending' : 'removed from trending'} successfully`,
            data: product
        });
    } catch (error) {
        console.error('Error in toggleTrending:', error);
        throw error;
    }
});

// @desc    Toggle product new arrival status
// @route   PUT /api/admin/products/:id/toggle-new-arrival
// @access  Private/Admin
export const toggleNewArrival = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        product.isNewArrival = !product.isNewArrival;
        await product.save();

        res.json({
            success: true,
            message: `Product ${product.isNewArrival ? 'marked as new arrival' : 'removed from new arrivals'} successfully`,
            data: product
        });
    } catch (error) {
        console.error('Error in toggleNewArrival:', error);
        throw error;
    }
});

// @desc    Toggle product best seller status
// @route   PUT /api/admin/products/:id/toggle-best-seller
// @access  Private/Admin
export const toggleBestSeller = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ErrorResponse('Product not found', 404);
        }

        product.isBestSeller = !product.isBestSeller;
        await product.save();

        res.json({
            success: true,
            message: `Product ${product.isBestSeller ? 'marked as best seller' : 'removed from best sellers'} successfully`,
            data: product
        });
    } catch (error) {
        console.error('Error in toggleBestSeller:', error);
        throw error;
    }
});

// @desc    Bulk update products
// @route   PUT /api/admin/products/bulk-update
// @access  Private/Admin
export const bulkUpdateProducts = asyncHandler(async (req, res) => {
    try {
        const { productIds, updateData } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            throw new ErrorResponse('Please provide product IDs', 400);
        }

        if (!updateData || typeof updateData !== 'object') {
            throw new ErrorResponse('Please provide update data', 400);
        }

        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            updateData,
            { multi: true }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} products updated successfully`,
            data: result
        });
    } catch (error) {
        console.error('Error in bulkUpdateProducts:', error);
        throw error;
    }
});