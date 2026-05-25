import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import { deleteFile } from '../middlewares/upload.js'; // Import from upload middleware

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
    try {
        console.log('Fetching all categories...');
        
        // Build query
        let query = {};
        
        // Show active only for non-admin users
        if (!req.user || req.user.role !== 'admin') {
            query.isActive = true;
        }
        
        // Get categories
        const categories = await Category.find(query)
            .sort('order name')
            .select('name slug description image isFeatured isActive productCount createdAt')
            .lean();
        
        console.log(`Found ${categories.length} categories`);
        
        // Get product counts for each category
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ 
                    category: category._id,
                    isActive: true 
                });
                return {
                    ...category,
                    productCount
                };
            })
        );
        
        res.json({
            success: true,
            count: categoriesWithCounts.length,
            data: categoriesWithCounts
        });
    } catch (error) {
        console.error('Error in getCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .select('name slug description image isFeatured isActive productCount createdAt');
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Check if category is active (for non-admin users)
        if (!category.isActive && (!req.user || req.user.role !== 'admin')) {
            return res.status(404).json({
                success: false,
                message: 'Category not available'
            });
        }
        
        // Get product count
        const productCount = await Product.countDocuments({ 
            category: category._id,
            isActive: true 
        });
        
        const categoryWithCount = {
            ...category.toObject(),
            productCount
        };
        
        res.json({
            success: true,
            data: categoryWithCount
        });
    } catch (error) {
        console.error('Error in getCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category',
            error: error.message
        });
    }
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug })
            .select('name slug description image isFeatured isActive productCount createdAt');
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Check if category is active (for non-admin users)
        if (!category.isActive && (!req.user || req.user.role !== 'admin')) {
            return res.status(404).json({
                success: false,
                message: 'Category not available'
            });
        }
        
        // Get product count
        const productCount = await Product.countDocuments({ 
            category: category._id,
            isActive: true 
        });
        
        const categoryWithCount = {
            ...category.toObject(),
            productCount
        };
        
        res.json({
            success: true,
            data: categoryWithCount
        });
    } catch (error) {
        console.error('Error in getCategoryBySlug:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category',
            error: error.message
        });
    }
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
    try {
        console.log('Creating category with data:', req.body);
        console.log('Uploaded file:', req.file);
        
        // Validate required fields
        if (!req.body.name || req.body.name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }
        
        // Check if category already exists
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${req.body.name.trim()}$`, 'i') }
        });
        
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }
        
        // Process image if uploaded
        let image = null;
        if (req.file) {
            const baseUrl = process.env.BASE_URL || process.env.APP_URL || 'http://localhost:5001';
            image = {
                public_id: req.file.filename,
                url: `${baseUrl}/uploads/categories/${req.file.filename}`,
                alt: req.body.name.trim()
            };
            console.log('Image processed:', image);
        }
        
        // Parse boolean fields
        const isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
        const isActive = req.body.isActive === 'true' || req.body.isActive === true;
        
        // Create category data
        const categoryData = {
            name: req.body.name.trim(),
            description: req.body.description ? req.body.description.trim() : '',
            image,
            isFeatured,
            isActive,
            order: req.body.order ? parseInt(req.body.order) : 0,
            metaTitle: req.body.metaTitle || '',
            metaDescription: req.body.metaDescription || '',
            metaKeywords: req.body.metaKeywords ? 
                req.body.metaKeywords.split(',').map(kw => kw.trim()).filter(kw => kw !== '') : 
                []
        };
        
        console.log('Creating category with data:', categoryData);
        
        // Create category
        const category = await Category.create(categoryData);
        
        // Get product count
        const productCount = await Product.countDocuments({ 
            category: category._id,
            isActive: true 
        });
        
        const categoryWithCount = {
            ...category.toObject(),
            productCount
        };
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: categoryWithCount
        });
    } catch (error) {
        console.error('Error in createCategory:', error);
        
        // Delete uploaded file if category creation fails
        if (req.file) {
            deleteFile(`categories/${req.file.filename}`);
        }
        
        // Handle multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        } else if (error.message.includes('Invalid file type')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
    try {
        console.log('Updating category:', req.params.id);
        console.log('Update data:', req.body);
        console.log('Uploaded file:', req.file);
        
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Check if name is being changed and if it already exists
        if (req.body.name && req.body.name.trim() !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: { $regex: new RegExp(`^${req.body.name.trim()}$`, 'i') },
                _id: { $ne: category._id }
            });
            
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }
        
        // Handle image update
        let image = category.image;
        if (req.file) {
            // Delete old image if exists
            if (category.image && category.image.url) {
                console.log('Deleting old image:', category.image.url);
                deleteFile(category.image);
            }
            
            // Add new image
            const baseUrl = process.env.BASE_URL || process.env.APP_URL || 'http://localhost:5001';
            image = {
                public_id: req.file.filename,
                url: `${baseUrl}/uploads/categories/${req.file.filename}`,
                alt: req.body.name || category.name
            };
            console.log('New image set:', image);
        }
        
        // Build update data
        const updateData = {
            image,
            updatedAt: Date.now()
        };
        
        // Add other fields if provided
        if (req.body.name !== undefined) updateData.name = req.body.name.trim();
        if (req.body.description !== undefined) updateData.description = req.body.description.trim();
        
        // Parse boolean fields
        if (req.body.isFeatured !== undefined) {
            updateData.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
        }
        
        if (req.body.isActive !== undefined) {
            updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
        }
        
        if (req.body.order !== undefined) {
            updateData.order = parseInt(req.body.order) || 0;
        }
        
        // Handle metadata
        if (req.body.metaTitle !== undefined) updateData.metaTitle = req.body.metaTitle;
        if (req.body.metaDescription !== undefined) updateData.metaDescription = req.body.metaDescription;
        if (req.body.metaKeywords !== undefined) {
            updateData.metaKeywords = req.body.metaKeywords ? 
                req.body.metaKeywords.split(',').map(kw => kw.trim()).filter(kw => kw !== '') : 
                [];
        }
        
        console.log('Update data to save:', updateData);
        
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('name slug description image isFeatured isActive productCount createdAt');
        
        // Update slug if name changed
        if (req.body.name && req.body.name.trim() !== category.name) {
            updatedCategory.slug = undefined;
            await updatedCategory.save();
        }
        
        // Get product count
        const productCount = await Product.countDocuments({ 
            category: updatedCategory._id,
            isActive: true 
        });
        
        const categoryWithCount = {
            ...updatedCategory.toObject(),
            productCount
        };
        
        res.json({
            success: true,
            message: 'Category updated successfully',
            data: categoryWithCount
        });
    } catch (error) {
        console.error('Error in updateCategory:', error);
        
        // Delete uploaded file if update fails
        if (req.file) {
            deleteFile(`categories/${req.file.filename}`);
        }
        
        // Handle multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        } else if (error.message.includes('Invalid file type')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: error.message
        });
    }
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Check if category has products
        const productCount = await Product.countDocuments({ 
            category: category._id 
        });
        
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${productCount} products. Remove products first.`
            });
        }
        
        // Delete category image if exists
        if (category.image && category.image.url) {
            deleteFile(category.image);
        }
        
        // Delete the category
        await category.deleteOne();
        
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message
        });
    }
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
export const getFeaturedCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find({ 
            isFeatured: true, 
            isActive: true
        })
        .sort('order name')
        .limit(8)
        .select('name slug description image productCount')
        .lean();
        
        // Add product count to each category
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ 
                    category: category._id,
                    isActive: true 
                });
                return {
                    ...category,
                    productCount
                };
            })
        );
        
        res.json({
            success: true,
            count: categoriesWithCounts.length,
            data: categoriesWithCounts
        });
    } catch (error) {
        console.error('Error in getFeaturedCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured categories',
            error: error.message
        });
    }
});

// @desc    Get category hierarchy
// @route   GET /api/categories/hierarchy/all
// @access  Public
export const getCategoryHierarchy = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find({ 
            isActive: true
        })
        .sort('order name')
        .select('name slug description image')
        .lean();
        
        // Add product count to each category
        const hierarchy = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ 
                    category: category._id,
                    isActive: true 
                });
                return {
                    ...category,
                    productCount
                };
            })
        );
        
        res.json({
            success: true,
            count: hierarchy.length,
            data: hierarchy
        });
    } catch (error) {
        console.error('Error in getCategoryHierarchy:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category hierarchy',
            error: error.message
        });
    }
});

// @desc    Get products by category
// @route   GET /api/categories/:slug/products
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = 1, limit = 12, sort, minPrice, maxPrice } = req.query;
        
        console.log(`Fetching products for category: ${slug}`);
        
        // Find category by slug
        const category = await Category.findOne({ slug, isActive: true });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        console.log(`Found category: ${category.name}, ID: ${category._id}`);
        
        // Build product query
        const queryObj = {
            category: category._id,
            isActive: true
        };
        
        // Handle price range
        if (minPrice || maxPrice) {
            queryObj.price = {};
            if (minPrice) queryObj.price.$gte = Number(minPrice);
            if (maxPrice) queryObj.price.$lte = Number(maxPrice);
        }
        
        console.log('Product query filter:', JSON.stringify(queryObj, null, 2));
        
        // Build query
        let query = Product.find(queryObj);
        
        // Select fields
        query = query.select('-__v');
        
        // Sort
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }
        
        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const total = await Product.countDocuments(queryObj);
        
        console.log(`Found ${total} products for category ${category.name}`);
        
        query = query.skip(startIndex).limit(limitNum);
        
        // Populate category and reviews
        query = query.populate('category', 'name slug image')
                     .populate({
                         path: 'reviews',
                         select: 'rating comment createdAt',
                         perDocumentLimit: 5
                     });
        
        // Execute query
        const products = await query;
        
        console.log(`Returning ${products.length} products for page ${pageNum}`);
        
        // Pagination result
        const pagination = {
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            limit: limitNum
        };
        
        if (startIndex + limitNum < total) {
            pagination.next = {
                page: pageNum + 1,
                limit: limitNum
            };
        }
        
        if (startIndex > 0) {
            pagination.prev = {
                page: pageNum - 1,
                limit: limitNum
            };
        }
        
        res.json({
            success: true,
            count: products.length,
            category: {
                _id: category._id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                image: category.image
            },
            pagination,
            data: products
        });
    } catch (error) {
        console.error('Error in getProductsByCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category products',
            error: error.message
        });
    }
});

// @desc    Toggle category active status
// @route   PUT /api/admin/categories/:id/toggle-active
// @access  Private/Admin
export const toggleCategoryActive = asyncHandler(async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        category.isActive = !category.isActive;
        await category.save();
        
        res.json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            data: category
        });
    } catch (error) {
        console.error('Error in toggleCategoryActive:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle category status',
            error: error.message
        });
    }
});

// @desc    Toggle category featured status
// @route   PUT /api/admin/categories/:id/toggle-featured
// @access  Private/Admin
export const toggleCategoryFeatured = asyncHandler(async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        category.isFeatured = !category.isFeatured;
        await category.save();
        
        res.json({
            success: true,
            message: `Category ${category.isFeatured ? 'marked as featured' : 'removed from featured'} successfully`,
            data: category
        });
    } catch (error) {
        console.error('Error in toggleCategoryFeatured:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle featured status',
            error: error.message
        });
    }
});

// @desc    Update category order
// @route   PUT /api/admin/categories/update-order
// @access  Private/Admin
export const updateCategoryOrder = asyncHandler(async (req, res) => {
    try {
        const { categories } = req.body;
        
        if (!categories || !Array.isArray(categories)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide categories array'
            });
        }
        
        const bulkOps = categories.map((cat, index) => ({
            updateOne: {
                filter: { _id: cat._id },
                update: { order: index }
            }
        }));
        
        const result = await Category.bulkWrite(bulkOps);
        
        res.json({
            success: true,
            message: 'Category order updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in updateCategoryOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category order',
            error: error.message
        });
    }
});