import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Review from '../models/reviewModel.js';
import Category from '../models/categoryModel.js';
import { deleteFile, deleteFiles } from '../middlewares/upload.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    // Reset today for queries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // Get counts
    const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalCategories,
        totalRevenue,
        pendingOrders,
        outOfStockProducts,
        blockedUsers,
        newUsersToday,
        newOrdersToday
    ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Category.countDocuments({ isActive: true }),
        Order.aggregate([
            { $match: { orderStatus: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$priceSummary.totalPrice' } } }
        ]),
        Order.countDocuments({ orderStatus: 'pending' }),
        Product.countDocuments({ stock: 0 }),
        User.countDocuments({ isBlocked: true }),
        User.countDocuments({ createdAt: { $gte: todayStart } }),
        Order.countDocuments({ 
            createdAt: { $gte: todayStart },
            orderStatus: { $ne: 'cancelled' }
        })
    ]);

    // Get monthly and yearly revenue
    const [monthlyRevenue, yearlyRevenue] = await Promise.all([
        Order.aggregate([
            { $match: { 
                createdAt: { $gte: startOfMonth },
                orderStatus: { $ne: 'cancelled' }
            }},
            { $group: { _id: null, total: { $sum: '$priceSummary.totalPrice' } } }
        ]),
        Order.aggregate([
            { $match: { 
                createdAt: { $gte: startOfYear },
                orderStatus: { $ne: 'cancelled' }
            }},
            { $group: { _id: null, total: { $sum: '$priceSummary.totalPrice' } } }
        ])
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
        .sort('-createdAt')
        .limit(10)
        .populate('user', 'name email avatar')
        .populate('items.product', 'name images price')
        .lean();

    // Get top selling products
    const topProducts = await Product.find()
        .sort('-sold')
        .limit(5)
        .select('name price sold images ratings category');

    // Get trending products
    const trendingProducts = await Product.find({ isTrending: true })
        .limit(5)
        .select('name price sold images ratings');

    // Get new arrival products
    const newArrivalProducts = await Product.find({ isNewArrival: true })
        .limit(5)
        .select('name price sold images ratings createdAt');

    // Get recent users
    const recentUsers = await User.find()
        .sort('-createdAt')
        .limit(5)
        .select('name email role createdAt isVerified isBlocked');

    // Get featured categories
    const featuredCategories = await Category.find({ 
        isFeatured: true, 
        isActive: true 
    })
    .sort('-order')
    .limit(5)
    .select('name slug icon image productCount');

    // Get category distribution for chart
    const categoryStats = await Category.aggregate([
        { $match: { isActive: true } },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'category',
                as: 'products'
            }
        },
        {
            $project: {
                name: 1,
                productCount: { $size: '$products' }
            }
        },
        { $sort: { productCount: -1 } },
        { $limit: 5 }
    ]);

    // Get monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenueData = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sixMonthsAgo },
                orderStatus: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                revenue: { $sum: '$priceSummary.totalPrice' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
    ]);

    // Get order status distribution
    const orderStatusStats = await Order.aggregate([
        {
            $group: {
                _id: '$orderStatus',
                count: { $sum: 1 },
                totalAmount: { $sum: '$priceSummary.totalPrice' }
            }
        }
    ]);

    res.json({
        success: true,
        data: {
            counts: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalCategories,
                totalRevenue: totalRevenue[0]?.total || 0,
                pendingOrders,
                outOfStockProducts,
                blockedUsers,
                newUsersToday,
                newOrdersToday,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                yearlyRevenue: yearlyRevenue[0]?.total || 0
            },
            recentOrders: recentOrders.map(order => ({
                _id: order._id,
                orderId: order.orderId,
                user: order.user,
                items: order.items,
                priceSummary: order.priceSummary,
                orderStatus: order.orderStatus,
                paymentInfo: order.paymentInfo,
                createdAt: order.createdAt
            })),
            topProducts,
            trendingProducts,
            newArrivalProducts,
            recentUsers,
            featuredCategories,
            charts: {
                categoryStats,
                orderStatusStats,
                monthlyRevenue: monthlyRevenueData.map(item => ({
                    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                    revenue: item.revenue,
                    orders: item.orders
                }))
            }
        }
    });
});

export const getUsers = asyncHandler(async (req, res) => {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Handle search
    if (req.query.search) {
        queryObj.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
            { phone: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Handle role filter
    if (req.query.role) {
        queryObj.role = req.query.role;
    }

    // Handle verified filter
    if (req.query.verified !== undefined) {
        queryObj.isVerified = req.query.verified === 'true';
    }

    // Handle blocked filter
    if (req.query.blocked !== undefined) {
        queryObj.isBlocked = req.query.blocked === 'true';
    }

    // Execute query
    let query = User.find(queryObj).select('-password');

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const total = await User.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    const users = await query;

    res.json({
        success: true,
        count: users.length,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        },
        data: users
    });
});

export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate('wishlist', 'name price images category')
        .populate('addresses');

    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }

    // Get user's orders
    const orders = await Order.find({ user: user._id })
        .sort('-createdAt')
        .populate('items.product', 'name images')
        .lean();

    // Get user's recent reviews
    const reviews = await Review.find({ user: user._id })
        .populate('product', 'name images')
        .sort('-createdAt')
        .limit(10);

    res.json({
        success: true,
        data: {
            user,
            orders,
            reviews,
            orderCount: orders.length,
            totalSpent: orders.reduce((sum, order) => sum + (order.priceSummary?.totalPrice || 0), 0)
        }
    });
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
        throw new ErrorResponse('Please provide a valid role (user or admin)', 400);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }

    // Prevent self-demotion
    if (user._id.toString() === req.user.id && role !== 'admin') {
        throw new ErrorResponse('Cannot change your own role', 400);
    }

    user.role = role;
    await user.save();

    res.json({
        success: true,
        message: `User role updated to ${role}`,
        data: user
    });
});

export const toggleUserBlock = asyncHandler(async (req, res) => {
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
        throw new ErrorResponse('Please provide isBlocked (true/false)', 400);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }

    // Prevent self-block
    if (user._id.toString() === req.user.id) {
        throw new ErrorResponse('Cannot block your own account', 400);
    }

    user.isBlocked = isBlocked;
    await user.save();

    res.json({
        success: true,
        message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        data: user
    });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
        throw new ErrorResponse('Cannot delete your own account', 400);
    }

    // Delete user's avatar if exists
    if (user.avatar?.url) {
        deleteFile(user.avatar.url);
    }

    // Delete user's orders
    await Order.deleteMany({ user: user._id });
    
    // Delete user's reviews
    await Review.deleteMany({ user: user._id });

    // Delete user
    await user.deleteOne();

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});

export const getAdminProducts = asyncHandler(async (req, res) => {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Handle search
    if (req.query.search) {
        queryObj.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { brand: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Handle category filter
    if (req.query.category) {
        if (mongoose.Types.ObjectId.isValid(req.query.category)) {
            queryObj.category = req.query.category;
        } else {
            const category = await Category.findOne({ 
                name: { $regex: req.query.category, $options: 'i' } 
            });
            if (category) {
                queryObj.category = category._id;
            }
        }
    }

    // Handle status filters
    if (req.query.active !== undefined) {
        queryObj.isActive = req.query.active === 'true';
    }
    
    if (req.query.featured !== undefined) {
        queryObj.isFeatured = req.query.featured === 'true';
    }
    
    if (req.query.trending !== undefined) {
        queryObj.isTrending = req.query.trending === 'true';
    }
    
    if (req.query.newArrival !== undefined) {
        queryObj.isNewArrival = req.query.newArrival === 'true';
    }

    // Handle stock filter
    if (req.query.stock === 'low') {
        queryObj.stock = { $lt: 10 };
    } else if (req.query.stock === 'out') {
        queryObj.stock = 0;
    }

    // Execute query
    let query = Product.find(queryObj)
        .populate('category', 'name slug icon')
        .populate('reviews.user', 'name email avatar');

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const total = await Product.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    const products = await query;

    res.json({
        success: true,
        count: products.length,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        },
        data: products
    });
});

export const getAdminProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name slug icon')
        .populate('reviews.user', 'name email avatar');

    if (!product) {
        throw new ErrorResponse('Product not found', 404);
    }

    // Get related orders
    const ordersWithProduct = await Order.find({
        'items.product': product._id
    })
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(10);

    // Get category info
    const category = await Category.findById(product.category);

    res.json({
        success: true,
        data: {
            product,
            categoryInfo: category,
            orders: ordersWithProduct,
            totalSold: product.sold,
            totalRevenue: product.sold * product.price
        }
    });
});

export const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        shortDescription,
        price,
        discountPrice,
        costPrice,
        category,
        subCategory,
        brand,
        stock,
        specifications,
        tags,
        isFeatured,
        isTrending,
        isNewArrival,
        weight,
        dimensions,
        metaTitle,
        metaDescription,
        metaKeywords
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !stock) {
        throw new ErrorResponse('Please provide all required fields', 400);
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        throw new ErrorResponse('Category not found', 404);
    }

    // Handle images
    if (!req.files || req.files.length === 0) {
        throw new ErrorResponse('At least one product image is required', 400);
    }

    // Process uploaded files
    const images = req.files.map((file, index) => ({
        public_id: file.filename,
        url: `/uploads/products/${file.filename}`,
        alt: name || `Product image ${index + 1}`,
        isDefault: index === 0
    }));

    // Generate SKU using category name
    const categoryCode = categoryExists.name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const sku = `${categoryCode}-${timestamp}`;

    const product = await Product.create({
        name,
        description,
        shortDescription: shortDescription || description.substring(0, 200),
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : 0,
        costPrice: costPrice ? parseFloat(costPrice) : parseFloat(price) * 0.7,
        category,
        subCategory,
        brand,
        stock: parseInt(stock),
        sku,
        images,
        specifications: specifications ? JSON.parse(specifications) : {},
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isFeatured: isFeatured === 'true' || isFeatured === true,
        isTrending: isTrending === 'true' || isTrending === true,
        isNewArrival: isNewArrival === 'true' || isNewArrival === true || true,
        weight: weight ? parseFloat(weight) : 0,
        dimensions: dimensions ? JSON.parse(dimensions) : {},
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || description.substring(0, 160),
        metaKeywords: metaKeywords ? metaKeywords.split(',').map(kw => kw.trim()) : []
    });

    // Update category product count
    await categoryExists.updateProductCount();

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
    });
});

export const updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        throw new ErrorResponse('Product not found', 404);
    }

    // Handle category update
    let oldCategory = product.category;
    let newCategory = req.body.category || product.category;

    if (newCategory !== oldCategory.toString()) {
        const categoryExists = await Category.findById(newCategory);
        if (!categoryExists) {
            throw new ErrorResponse('Category not found', 404);
        }
    }

    // Handle images update
    let images = [...product.images];
    
    // Add new images
    if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
            images.push({
                public_id: file.filename,
                url: `/uploads/products/${file.filename}`,
                alt: req.body.name || product.name || `Product image ${index + 1}`,
                isDefault: false
            });
        });
    }

    // Handle image deletions
    if (req.body.deletedImages) {
        let deletedImages;
        try {
            deletedImages = JSON.parse(req.body.deletedImages);
        } catch (error) {
            throw new ErrorResponse('Invalid deletedImages format', 400);
        }
        
        deletedImages.forEach(imageId => {
            const image = images.find(img => img.public_id === imageId);
            if (image) {
                // Delete the file from server
                deleteFile(image.url);
                
                // Remove from images array
                const index = images.findIndex(img => img.public_id === imageId);
                images.splice(index, 1);
            }
        });
    }

    // Handle default image setting
    if (req.body.defaultImage) {
        images.forEach(img => {
            img.isDefault = img.public_id === req.body.defaultImage;
        });
    }

    // Ensure at least one image remains
    if (images.length === 0) {
        throw new ErrorResponse('Product must have at least one image', 400);
    }

    // Prepare update data
    const updateData = {};
    
    // Only update fields that are provided
    const fields = [
        'name', 'description', 'shortDescription', 'price', 'discountPrice',
        'costPrice', 'category', 'subCategory', 'brand', 'stock', 'isFeatured',
        'isTrending', 'isNewArrival', 'weight', 'metaTitle', 'metaDescription'
    ];
    
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            if (field === 'price' || field === 'discountPrice' || field === 'costPrice' || field === 'weight') {
                updateData[field] = parseFloat(req.body[field]);
            } else if (field === 'stock') {
                updateData[field] = parseInt(req.body[field]);
            } else if (field === 'isFeatured' || field === 'isTrending' || field === 'isNewArrival') {
                updateData[field] = req.body[field] === 'true' || req.body[field] === true;
            } else {
                updateData[field] = req.body[field];
            }
        }
    });

    // Handle special fields
    if (req.body.specifications) {
        try {
            updateData.specifications = JSON.parse(req.body.specifications);
        } catch (error) {
            throw new ErrorResponse('Invalid specifications format', 400);
        }
    }
    
    if (req.body.dimensions) {
        try {
            updateData.dimensions = JSON.parse(req.body.dimensions);
        } catch (error) {
            throw new ErrorResponse('Invalid dimensions format', 400);
        }
    }
    
    if (req.body.tags) {
        updateData.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    if (req.body.metaKeywords) {
        updateData.metaKeywords = req.body.metaKeywords.split(',').map(kw => kw.trim());
    }

    updateData.images = images;
    updateData.updatedAt = Date.now();

    product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).populate('category', 'name slug icon');

    // Update category product counts if category changed
    if (newCategory !== oldCategory.toString()) {
        const oldCat = await Category.findById(oldCategory);
        const newCat = await Category.findById(newCategory);
        
        if (oldCat) await oldCat.updateProductCount();
        if (newCat) await newCat.updateProductCount();
    }

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
    });
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ErrorResponse('Product not found', 404);
    }

    // Delete product images from server
    const imagePaths = product.images.map(img => img.url);
    deleteFiles(imagePaths);

    // Get category for updating product count
    const category = await Category.findById(product.category);

    // Remove product from orders
    await Order.updateMany(
        { 'items.product': product._id },
        { $pull: { items: { product: product._id } } }
    );

    await product.deleteOne();

    // Update category product count
    if (category) {
        await category.updateProductCount();
    }

    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
});

export const toggleProductActive = asyncHandler(async (req, res) => {
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
});

export const toggleProductFeatured = asyncHandler(async (req, res) => {
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
});

export const toggleProductTrending = asyncHandler(async (req, res) => {
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
});

export const toggleProductNewArrival = asyncHandler(async (req, res) => {
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
});

export const bulkUpdateProducts = asyncHandler(async (req, res) => {
    const { productIds, updateData } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        throw new ErrorResponse('Please provide product IDs', 400);
    }

    if (!updateData || typeof updateData !== 'object') {
        throw new ErrorResponse('Please provide update data', 400);
    }

    // If updating category, update category product counts
    if (updateData.category) {
        // Get all products to be updated
        const products = await Product.find({ _id: { $in: productIds } });
        
        // Get unique old categories
        const oldCategories = [...new Set(products.map(p => p.category.toString()))];
        
        // Update products
        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            updateData,
            { multi: true }
        );

        // Update old categories product counts
        for (const catId of oldCategories) {
            const category = await Category.findById(catId);
            if (category) {
                await category.updateProductCount();
            }
        }

        // Update new category product count
        const newCategory = await Category.findById(updateData.category);
        if (newCategory) {
            await newCategory.updateProductCount();
        }

        res.json({
            success: true,
            message: `${result.modifiedCount} products updated successfully`,
            data: result
        });
    } else {
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
    }
});

export const getAdminOrders = asyncHandler(async (req, res) => {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Handle search
    if (req.query.search) {
        queryObj.$or = [
            { orderId: { $regex: req.query.search, $options: 'i' } },
            { 'userDetails.name': { $regex: req.query.search, $options: 'i' } },
            { 'userDetails.email': { $regex: req.query.search, $options: 'i' } },
            { 'shippingAddress.phone': { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Handle status filter
    if (req.query.status) {
        queryObj.orderStatus = req.query.status;
    }

    // Handle payment method filter
    if (req.query.paymentMethod) {
        queryObj['paymentInfo.method'] = req.query.paymentMethod;
    }

    // Handle date filters
    if (req.query.startDate && req.query.endDate) {
        queryObj.createdAt = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    }

    // Execute query
    let query = Order.find(queryObj)
        .populate('user', 'name email phone avatar')
        .populate({
            path: 'items.product',
            select: 'name images price sku category',
            populate: {
                path: 'category',
                select: 'name icon'
            }
        })
        .sort('-createdAt');

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const total = await Order.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    const orders = await query;

    // Calculate statistics
    const statistics = {
        totalOrders: await Order.countDocuments(),
        pending: await Order.countDocuments({ orderStatus: 'pending' }),
        processing: await Order.countDocuments({ orderStatus: 'processing' }),
        shipped: await Order.countDocuments({ orderStatus: 'shipped' }),
        delivered: await Order.countDocuments({ orderStatus: 'delivered' }),
        cancelled: await Order.countDocuments({ orderStatus: 'cancelled' }),
        totalRevenue: await Order.aggregate([
            { $match: { orderStatus: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$priceSummary.totalPrice' } } }
        ])
    };

    res.json({
        success: true,
        count: orders.length,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        },
        statistics,
        data: orders
    });
});

export const getAdminOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email phone avatar addresses')
        .populate({
            path: 'items.product',
            select: 'name images price sku category stock',
            populate: {
                path: 'category',
                select: 'name icon'
            }
        });

    if (!order) {
        throw new ErrorResponse('Order not found', 404);
    }

    res.json({
        success: true,
        data: order
    });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderStatus, status, paymentStatus, notes } = req.body;

    const newOrderStatus = status || orderStatus;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];
    
    if (newOrderStatus && !validStatuses.includes(newOrderStatus)) {
        throw new ErrorResponse('Invalid order status', 400);
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ErrorResponse('Order not found', 404);
    }

    if (newOrderStatus) {
        if (newOrderStatus === 'shipped' && order.orderStatus !== 'shipped') {
            order.trackingInfo.shippedDate = new Date();
            order.trackingInfo.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }

        if (newOrderStatus === 'delivered' && order.orderStatus !== 'delivered') {
            order.trackingInfo.deliveredDate = new Date();
            order.paymentInfo.status = 'completed';
        }

        order.orderStatus = newOrderStatus;
    }

    if (paymentStatus) {
        if (!order.paymentInfo) {
            order.paymentInfo = {};
        }
        order.paymentInfo.status = paymentStatus;
        if (paymentStatus === 'completed' && !order.paymentInfo.paymentDate) {
            order.paymentInfo.paymentDate = new Date();
        }
    }
    
    if (notes) {
        order.notes.adminNote = notes;
    }

    await order.save();

    // Send notification email to user if status changed
    if (newOrderStatus) {
        const userEmail = order.user?.email || order.shippingAddress?.email;
        if (userEmail) {
            try {
                await sendEmail({
                    email: userEmail,
                    subject: `✨ Order Update: ${newOrderStatus.toUpperCase()} - ${order.orderId}`,
                    html: emailTemplates.orderStatusUpdate(order, newOrderStatus)
                });
            } catch (error) {
                console.error('Status update email failed:', error);
            }
        }
    }

    res.json({
        success: true,
        message: `Order updated successfully`,
        data: order
    });
});

export const updateOrderTracking = asyncHandler(async (req, res) => {
    const { trackingNumber, carrier, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ErrorResponse('Order not found', 404);
    }

    order.trackingInfo = {
        ...order.trackingInfo,
        trackingNumber,
        carrier,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined
    };

    if (order.orderStatus !== 'shipped') {
        order.orderStatus = 'shipped';
        order.trackingInfo.shippedDate = new Date();
    }

    await order.save();

    res.json({
        success: true,
        message: 'Tracking information updated',
        data: order
    });
});

export const getReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find()
        .populate('user', 'name email avatar')
        .populate({
            path: 'product',
            select: 'name images price category',
            populate: {
                path: 'category',
                select: 'name icon'
            }
        })
        .sort('-createdAt')
        .limit(50);

    res.json({
        success: true,
        count: reviews.length,
        data: reviews
    });
});

export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        throw new ErrorResponse('Review not found', 404);
    }

    // Remove review from product
    await Product.findByIdAndUpdate(review.product, {
        $pull: { reviews: { _id: review._id } }
    });

    // Recalculate product ratings
    const product = await Product.findById(review.product);
    const reviews = await Review.find({ product: review.product });
    
    if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        product.ratings.average = Math.round(avgRating * 10) / 10;
        product.ratings.count = reviews.length;
    } else {
        product.ratings.average = 0;
        product.ratings.count = 0;
    }
    
    await product.save();

    // Delete the review
    await review.deleteOne();

    res.json({
        success: true,
        message: 'Review deleted successfully'
    });
});

export const getSystemLogs = asyncHandler(async (req, res) => {
    // Get recent logins
    const recentLogins = await User.find()
        .sort('-updatedAt')
        .limit(20)
        .select('name email role lastLogin updatedAt');

    // Get recent orders
    const recentOrders = await Order.find()
        .sort('-createdAt')
        .limit(20)
        .select('orderId orderStatus totalPrice createdAt');

    // Get recent product updates
    const recentProducts = await Product.find()
        .sort('-updatedAt')
        .limit(20)
        .select('name price stock updatedAt')
        .populate('category', 'name icon');

    // Get recent category updates
    const recentCategories = await Category.find()
        .sort('-updatedAt')
        .limit(20)
        .select('name icon isActive updatedAt');

    res.json({
        success: true,
        data: {
            recentLogins,
            recentOrders,
            recentProducts,
            recentCategories
        }
    });
});

export const getAnalytics = asyncHandler(async (req, res) => {
    const { period = '30days' } = req.query;

    let days;
    switch (period) {
        case '7days':
            days = 7;
            break;
        case '30days':
            days = 30;
            break;
        case '90days':
            days = 90;
            break;
        case '365days':
            days = 365;
            break;
        default:
            days = 30;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily orders and revenue
    const dailyStats = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                orderStatus: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                orders: { $sum: 1 },
                revenue: { $sum: '$priceSummary.totalPrice' },
                averageOrderValue: { $avg: '$priceSummary.totalPrice' },
                itemsSold: { $sum: { $sum: '$items.quantity' } }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    // Get top categories
    const topCategories = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                orderStatus: { $ne: 'cancelled' }
            }
        },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $lookup: {
                from: 'categories',
                localField: 'product.category',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: '$category' },
        {
            $group: {
                _id: {
                    categoryId: '$category._id',
                    categoryName: '$category.name'
                },
                orders: { $sum: 1 },
                revenue: { $sum: '$items.price' },
                quantity: { $sum: '$items.quantity' }
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                orderStatus: { $ne: 'cancelled' }
            }
        },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $group: {
                _id: {
                    productId: '$product._id',
                    name: '$product.name'
                },
                sold: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.price' }
            }
        },
        { $sort: { sold: -1 } },
        { $limit: 10 }
    ]);

    // Get user signups
    const userSignups = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    // Get revenue by payment method
    const revenueByPayment = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                orderStatus: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: '$paymentInfo.method',
                revenue: { $sum: '$priceSummary.totalPrice' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { revenue: -1 } }
    ]);

    // Get category growth
    const categoryGrowth = await Category.aggregate([
        {
            $match: {
                updatedAt: { $gte: startDate }
            }
        },
        {
            $project: {
                name: 1,
                icon: 1,
                productCount: 1,
                createdAt: 1,
                updatedAt: 1
            }
        },
        { $sort: { productCount: -1 } },
        { $limit: 5 }
    ]);

    res.json({
        success: true,
        data: {
            dailyStats,
            topCategories: topCategories.map(item => ({
                _id: item._id.categoryId,
                name: item._id.categoryName,
                orders: item.orders,
                revenue: item.revenue,
                quantity: item.quantity
            })),
            topProducts: topProducts.map(item => ({
                _id: item._id.productId,
                name: item._id.name,
                sold: item.sold,
                revenue: item.revenue
            })),
            userSignups,
            revenueByPayment,
            categoryGrowth,
            period
        }
    });
});

export const getAdminCategories = asyncHandler(async (req, res) => {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Handle search
    if (req.query.search) {
        queryObj.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Handle featured filter
    if (req.query.featured) {
        queryObj.isFeatured = req.query.featured === 'true';
    }

    // Handle active filter
    if (req.query.active) {
        queryObj.isActive = req.query.active === 'true';
    }

    // Handle parent category filter
    if (req.query.parent === 'null' || req.query.parent === null) {
        queryObj.parentCategory = null;
    } else if (req.query.parent) {
        queryObj.parentCategory = req.query.parent;
    }

    // Execute query
    let query = Category.find(queryObj);

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('order name');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const total = await Category.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    // Populate parent category and subcategories
    query = query.populate('parentCategory', 'name icon')
               .populate('subcategories', 'name icon productCount');

    const categories = await query;

    // Add product count to each category
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            const productCount = await Product.countDocuments({ 
                category: category._id,
                isActive: true 
            });
            return {
                ...category.toObject(),
                productCount
            };
        })
    );

    res.json({
        success: true,
        count: categoriesWithCounts.length,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        },
        data: categoriesWithCounts
    });
});
export const toggleProductBestSeller = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        product.isBestSeller = !product.isBestSeller;
        await product.save();
        res.json({
            success: true,
            message: `Product ${product.isBestSeller ? 'marked as best seller' : 'removed from best sellers'} successfully`,
            data: product
        });
    } catch (error) {
        console.error('Error in toggleProductBestSeller:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default {
    getDashboardStats,
    getUsers,
    getUser,
    updateUserRole,
    toggleUserBlock,
    deleteUser,
    getAdminProducts,
    getAdminProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    toggleProductFeatured,
    toggleProductTrending,
    toggleProductNewArrival,
    bulkUpdateProducts,
    getAdminOrders,
    getAdminOrder,
    updateOrderStatus,
    updateOrderTracking,
    getReviews,
    deleteReview,
    getSystemLogs,
    getAnalytics,
    getAdminCategories,
    toggleProductBestSeller
};