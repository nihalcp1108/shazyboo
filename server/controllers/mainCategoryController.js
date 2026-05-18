import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import MainCategory from '../models/mainCategoryModel.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteFile = (filePath) => {
    if (!filePath) return false;
    const fullPath = path.join(__dirname, '../..', filePath);
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
            return true;
        } catch (err) {
            return false;
        }
    }
    return false;
};

// @desc    Get all main categories
// @route   GET /api/main-categories
// @access  Public
export const getMainCategories = asyncHandler(async (req, res) => {
    const { isActive, featured, limit = 50, sort = 'order' } = req.query;
    
    const query = {};
    if (isActive === 'true') query.isActive = true;
    if (featured === 'true') query.featured = true;
    
    let sortQuery = {};
    if (sort === 'order') sortQuery = { order: 1, name: 1 };
    else if (sort === 'name') sortQuery = { name: 1 };
    else if (sort === '-createdAt') sortQuery = { createdAt: -1 };
    else sortQuery = { order: 1, name: 1 };
    
    const categories = await MainCategory.find(query)
        .sort(sortQuery)
        .limit(parseInt(limit))
        .populate({
            path: 'subCategories',
            select: 'name slug icon image isActive',
            match: { isActive: true }
        });
    
    const categoriesWithCount = await Promise.all(categories.map(async (category) => {
        const categoryObj = category.toObject();
        const productCount = await Product.countDocuments({
            mainCategory: category._id,
            isActive: true
        });
        categoryObj.productCount = productCount;
        return categoryObj;
    }));
    
    res.json({
        success: true,
        count: categoriesWithCount.length,
        data: categoriesWithCount
    });
});

// @desc    Get active main categories for home page
// @route   GET /api/main-categories/active
// @access  Public
export const getActiveMainCategories = asyncHandler(async (req, res) => {
    const categories = await MainCategory.find({ isActive: true })
        .sort({ order: 1, featured: -1, name: 1 })
        .limit(8)
        .select('name slug icon image description featured');
    
    const categoriesWithCount = await Promise.all(categories.map(async (category) => {
        const categoryObj = category.toObject();
        const productCount = await Product.countDocuments({
            mainCategory: category._id,
            isActive: true
        });
        categoryObj.productCount = productCount;
        return categoryObj;
    }));
    
    res.json({
        success: true,
        count: categoriesWithCount.length,
        data: categoriesWithCount
    });
});

// @desc    Get single main category by slug or id with all products
// @route   GET /api/main-categories/:id
// @access  Public
export const getMainCategory = asyncHandler(async (req, res) => {
    console.log('Fetching main category with slug/id:', req.params.id);
    
    let category;
    
    // Check if it's a slug or id
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        category = await MainCategory.findById(req.params.id);
        console.log('Found by ID:', category ? category.name : 'Not found');
    } else {
        category = await MainCategory.findOne({ slug: req.params.id });
        console.log('Found by slug:', category ? category.name : 'Not found');
    }
    
    if (!category) {
        throw new ErrorResponse('Main category not found', 404);
    }
    
    // Get ALL products for this main category (no limit)
    const products = await Product.find({
        mainCategory: category._id,
        isActive: true
    })
    .populate('category', 'name slug')
    .select('name images price discountPrice ratings slug stock sold description shortDescription createdAt subCategory isFeatured isTrending isNewArrival isBestSeller')
    .sort('-createdAt');
    
    console.log(`Found ${products.length} products for category: ${category.name}`);
    
    // Get sub categories
    const subCategories = await Category.find({
        parentCategory: { $in: category.subCategories },
        isActive: true
    }).select('name slug icon image description');
    
    const categoryObj = category.toObject();
    categoryObj.products = products;
    categoryObj.subCategories = subCategories;
    categoryObj.productCount = products.length;
    
    res.json({
        success: true,
        data: categoryObj
    });
});

// @desc    Create main category
// @route   POST /api/main-categories
// @access  Private/Admin
export const createMainCategory = asyncHandler(async (req, res) => {
    const { name, description, icon, order, featured, isActive } = req.body;
    
    const existingCategory = await MainCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
        throw new ErrorResponse('Main category already exists', 400);
    }
    
    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    const category = await MainCategory.create({
        name,
        slug,
        description: description || '',
        icon: icon || '🎨',
        order: order ? parseInt(order) : 0,
        featured: featured === 'true' || featured === true,
        isActive: isActive !== false,
        image: req.file ? `/uploads/main-categories/${req.file.filename}` : ''
    });
    
    res.status(201).json({
        success: true,
        message: 'Main category created successfully',
        data: category
    });
});

// @desc    Update main category
// @route   PUT /api/main-categories/:id
// @access  Private/Admin
export const updateMainCategory = asyncHandler(async (req, res) => {
    let category = await MainCategory.findById(req.params.id);
    
    if (!category) {
        throw new ErrorResponse('Main category not found', 404);
    }
    
    const { name, description, icon, order, featured, isActive } = req.body;
    
    if (name) {
        category.name = name;
        category.slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (order !== undefined) category.order = parseInt(order);
    if (featured !== undefined) category.featured = featured === 'true' || featured === true;
    if (isActive !== undefined) category.isActive = isActive === 'true' || isActive === true;
    
    if (req.file) {
        if (category.image) {
            deleteFile(category.image);
        }
        category.image = `/uploads/main-categories/${req.file.filename}`;
    }
    
    await category.save();
    
    res.json({
        success: true,
        message: 'Main category updated successfully',
        data: category
    });
});

// @desc    Delete main category
// @route   DELETE /api/main-categories/:id
// @access  Private/Admin
export const deleteMainCategory = asyncHandler(async (req, res) => {
    const category = await MainCategory.findById(req.params.id);
    
    if (!category) {
        throw new ErrorResponse('Main category not found', 404);
    }
    
    const productCount = await Product.countDocuments({ mainCategory: category._id });
    if (productCount > 0) {
        throw new ErrorResponse(`Cannot delete category with ${productCount} products. Reassign or delete products first.`, 400);
    }
    
    if (category.image) {
        deleteFile(category.image);
    }
    
    await category.deleteOne();
    
    res.json({
        success: true,
        message: 'Main category deleted successfully'
    });
});

// @desc    Toggle main category active status
// @route   PUT /api/main-categories/:id/toggle-active
// @access  Private/Admin
export const toggleMainCategoryActive = asyncHandler(async (req, res) => {
    const category = await MainCategory.findById(req.params.id);
    
    if (!category) {
        throw new ErrorResponse('Main category not found', 404);
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    res.json({
        success: true,
        message: `Main category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
        data: category
    });
});

// @desc    Toggle main category featured status
// @route   PUT /api/main-categories/:id/toggle-featured
// @access  Private/Admin
export const toggleMainCategoryFeatured = asyncHandler(async (req, res) => {
    const category = await MainCategory.findById(req.params.id);
    
    if (!category) {
        throw new ErrorResponse('Main category not found', 404);
    }
    
    category.featured = !category.featured;
    await category.save();
    
    res.json({
        success: true,
        message: `Main category ${category.featured ? 'marked as featured' : 'removed from featured'} successfully`,
        data: category
    });
});

// @desc    Get main category with sub categories
// @route   GET /api/main-categories/:id/subcategories
// @access  Public
export const getMainCategoryWithSubCategories = asyncHandler(async (req, res) => {
    const category = await MainCategory.findById(req.params.id);
    
    if (!category) {
        throw new ErrorResponse('Main category not found', 404);
    }
    
    const subCategories = await Category.find({
        parentCategory: { $in: category.subCategories },
        isActive: true
    }).select('name slug icon image description');
    
    res.json({
        success: true,
        data: {
            mainCategory: category,
            subCategories
        }
    });
});

// @desc    Reorder main categories
// @route   PUT /api/main-categories/reorder
// @access  Private/Admin
export const reorderMainCategories = asyncHandler(async (req, res) => {
    const { categories } = req.body;
    
    if (!categories || !Array.isArray(categories)) {
        throw new ErrorResponse('Please provide categories array with ids and orders', 400);
    }
    
    const operations = categories.map(cat => ({
        updateOne: {
            filter: { _id: cat.id },
            update: { order: cat.order }
        }
    }));
    
    await MainCategory.bulkWrite(operations);
    
    res.json({
        success: true,
        message: 'Categories reordered successfully'
    });
});

// @desc    Bulk delete main categories
// @route   POST /api/main-categories/bulk-delete
// @access  Private/Admin
export const bulkDeleteMainCategories = asyncHandler(async (req, res) => {
    const { categoryIds } = req.body;
    
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
        throw new ErrorResponse('Please provide category IDs to delete', 400);
    }
    
    const productsUsing = await Product.countDocuments({
        mainCategory: { $in: categoryIds }
    });
    
    if (productsUsing > 0) {
        throw new ErrorResponse(`Cannot delete ${categoryIds.length} categories with ${productsUsing} products. Reassign or delete products first.`, 400);
    }
    
    const categories = await MainCategory.find({ _id: { $in: categoryIds } });
    categories.forEach(category => {
        if (category.image) {
            deleteFile(category.image);
        }
    });
    
    const result = await MainCategory.deleteMany({ _id: { $in: categoryIds } });
    
    res.json({
        success: true,
        message: `${result.deletedCount} main categories deleted successfully`
    });
});

export default {
    getMainCategories,
    getMainCategory,
    createMainCategory,
    updateMainCategory,
    deleteMainCategory,
    toggleMainCategoryActive,
    toggleMainCategoryFeatured,
    getActiveMainCategories,
    getMainCategoryWithSubCategories,
    reorderMainCategories,
    bulkDeleteMainCategories
};