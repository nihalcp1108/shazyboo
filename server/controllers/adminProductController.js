import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/productModel.js';
import MainCategory from '../models/mainCategoryModel.js';
import Category from '../models/categoryModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to delete files
const deleteFile = (filePath) => {
    if (!filePath) return false;
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(__dirname, '../..', cleanPath);
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
            console.log('Deleted file:', cleanPath);
            return true;
        } catch (err) {
            console.error('Error deleting file:', err);
            return false;
        }
    }
    return false;
};

// @desc    Create new product (Admin)
// @route   POST /api/admin/products
// @access  Private/Admin
export const adminCreateProduct = asyncHandler(async (req, res) => {
    console.log('🚀 ADMIN CREATE PRODUCT CALLED!');
    console.log('=== FORM DATA RECEIVED ===');

    // ✅ Log every field to confirm text fields arrive before files
    for (let key in req.body) {
        console.log(`  ${key}: ${req.body[key]} (${typeof req.body[key]})`);
    }
    console.log(`Files: ${req.files ? req.files.length : 0} images`);

    try {
        // Extract values with safe trimming
        const mainCategoryId = req.body.mainCategory?.trim();
        const categoryId = req.body.category?.trim();
        const name = req.body.name?.trim();
        const description = req.body.description?.trim();
        const price = req.body.price;
        const stock = req.body.stock;

        console.log('\n📌 Processing:');
        console.log(`  Main Category ID: "${mainCategoryId}"`);
        console.log(`  Category ID: "${categoryId}"`);

        // ============ MAIN CATEGORY VALIDATION ============
        if (!mainCategoryId || mainCategoryId === '' || mainCategoryId === 'undefined' || mainCategoryId === 'null') {
            const availableMainCats = await MainCategory.find().select('name _id');
            console.log('❌ No main category provided');
            return res.status(400).json({
                success: false,
                error: availableMainCats.length === 0
                    ? 'No main categories found. Please create a main category first.'
                    : `Please select a main category. Available: ${availableMainCats.map(c => c.name).join(', ')}`
            });
        }

        let mainCategory;
        try {
            mainCategory = await MainCategory.findById(mainCategoryId);
            console.log(`  Main category lookup result: ${mainCategory ? 'FOUND: ' + mainCategory.name : 'NOT FOUND'}`);
        } catch (err) {
            console.error(`  Error finding main category: ${err.message}`);
            return res.status(400).json({ success: false, error: `Invalid main category ID format: ${mainCategoryId}` });
        }

        if (!mainCategory) {
            const availableMainCats = await MainCategory.find().select('name _id');
            console.log(`❌ Main category not found with ID: ${mainCategoryId}`);
            return res.status(400).json({
                success: false,
                error: availableMainCats.length === 0
                    ? 'No main categories found. Please create a main category first.'
                    : `Main category not found. Available: ${availableMainCats.map(c => c.name).join(', ')}`
            });
        }

        console.log(`✅ Main category validated: ${mainCategory.name}`);

        // ============ CATEGORY VALIDATION ============
        if (!categoryId || categoryId === '' || categoryId === 'undefined' || categoryId === 'null') {
            const availableCats = await Category.find().select('name _id');
            console.log('❌ No category provided');
            return res.status(400).json({
                success: false,
                error: availableCats.length === 0
                    ? 'No categories found. Please create a category first.'
                    : `Please select a category. Available: ${availableCats.map(c => c.name).join(', ')}`
            });
        }

        let category;
        try {
            category = await Category.findById(categoryId);
            console.log(`  Category lookup result: ${category ? 'FOUND: ' + category.name : 'NOT FOUND'}`);
        } catch (err) {
            console.error(`  Error finding category: ${err.message}`);
            return res.status(400).json({ success: false, error: `Invalid category ID format: ${categoryId}` });
        }

        if (!category) {
            const availableCats = await Category.find().select('name _id');
            console.log(`❌ Category not found with ID: ${categoryId}`);
            return res.status(400).json({
                success: false,
                error: availableCats.length === 0
                    ? 'No categories found. Please create a category first.'
                    : `Category not found. Available: ${availableCats.map(c => c.name).join(', ')}`
            });
        }

        console.log(`✅ Category validated: ${category.name}`);

        // ============ OTHER VALIDATIONS ============
        if (!name) return res.status(400).json({ success: false, error: 'Product name is required' });
        if (!description) return res.status(400).json({ success: false, error: 'Description is required' });

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) return res.status(400).json({ success: false, error: 'Valid price is required' });

        const parsedStock = parseInt(stock);
        if (isNaN(parsedStock) || parsedStock < 0) return res.status(400).json({ success: false, error: 'Valid stock quantity is required' });

// Validate that at least one image is provided.
// Accept uploaded files (req.files or req.file) or a JSON array of base64 images in req.body.images.
const hasUploadedFiles = (req.files && req.files.length > 0) || req.file;
const hasBase64Images = req.body.images && typeof req.body.images === 'string' && req.body.images.trim().startsWith('[');
if (!hasUploadedFiles && !hasBase64Images) {
    return res.status(400).json({ success: false, error: 'At least one product image is required' });
}

        // ============ PROCESS DATA ============
        // Build images array from uploaded files or base64 data.
        let images = [];
        if (hasUploadedFiles) {
            images = req.files.map((file, index) => ({
                public_id: file.filename,
                url: `/uploads/products/${file.filename}`,
                alt: name,
                isDefault: index === 0
            }));
        } else if (hasBase64Images) {
            try {
                const base64Array = JSON.parse(req.body.images);
                images = base64Array.map((data, index) => ({
                    public_id: `base64-${Date.now()}-${index}`,
                    url: data, // Assuming data is a data URI or already uploaded URL
                    alt: name,
                    isDefault: index === 0
                }));
            } catch (e) {
                console.error('Failed to parse base64 images', e);
                return res.status(400).json({ success: false, error: 'Invalid images format' });
            }
        }

        let discountPriceValue = 0;
        if (req.body.discountPrice && req.body.discountPrice !== 'undefined') {
            discountPriceValue = parseFloat(req.body.discountPrice);
            if (isNaN(discountPriceValue)) discountPriceValue = 0;
        }

        let colorsArray = [];
        if (req.body.colors && req.body.colors !== 'undefined' && req.body.colors !== '[]') {
            try {
                colorsArray = JSON.parse(req.body.colors);
            } catch (error) {
                console.error('Error parsing colors:', error);
            }
        }

        let tagsArray = [];
        if (req.body.tags && req.body.tags !== 'undefined' && req.body.tags !== '[]') {
            try {
                tagsArray = JSON.parse(req.body.tags);
            } catch {
                tagsArray = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
        }

        // Generate SKU
        const categoryCode = category.name.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const sku = `${categoryCode}-${timestamp}`;

        const productData = {
            name,
            description,
            shortDescription: req.body.shortDescription?.trim() || description.substring(0, 200),
            price: parsedPrice,
            discountPrice: discountPriceValue,
            mainCategory: mainCategoryId,
            category: categoryId,
            subCategory: req.body.subCategory || '',
            brand: req.body.brand || '',
            stock: parsedStock,
            sku,
            colors: colorsArray,
            images,
            tags: tagsArray,
            isFeatured: req.body.isFeatured === 'true',
            isTrending: req.body.isTrending === 'true',
            isNewArrival: req.body.isNewArrival === 'true',
            isBestSeller: req.body.isBestSeller === 'true',
            isActive: req.body.isActive === 'true' || req.body.isActive === undefined,
            seller: req.user.id
        };

        console.log('\n📦 Creating product:', {
            name: productData.name,
            mainCategory: mainCategory.name,
            category: category.name,
            price: productData.price,
            stock: productData.stock
        });

        const product = await Product.create(productData);
        console.log('✅ Product created successfully!');

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name slug')
            .populate('mainCategory', 'name slug icon');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: populatedProduct
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);

        // Clean up uploaded files on error
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }

        res.status(500).json({ success: false, error: error.message || 'Failed to create product' });
    }
});

// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const adminUpdateProduct = asyncHandler(async (req, res) => {
    console.log('🔄 ADMIN UPDATE PRODUCT:', req.params.id);

    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

        const updateData = { updatedAt: Date.now() };

        // Basic fields
        if (req.body.name && req.body.name !== 'undefined') updateData.name = req.body.name.trim();
        if (req.body.description && req.body.description !== 'undefined') updateData.description = req.body.description.trim();
        if (req.body.shortDescription && req.body.shortDescription !== 'undefined') updateData.shortDescription = req.body.shortDescription.trim();
        if (req.body.subCategory && req.body.subCategory !== 'undefined') updateData.subCategory = req.body.subCategory;

        // Numeric fields
        if (req.body.price && req.body.price !== 'undefined') {
            const price = parseFloat(req.body.price);
            if (!isNaN(price) && price >= 0) updateData.price = price;
        }
        if (req.body.discountPrice && req.body.discountPrice !== 'undefined') {
            const discountPrice = parseFloat(req.body.discountPrice);
            if (!isNaN(discountPrice) && discountPrice >= 0) updateData.discountPrice = discountPrice;
        }
        if (req.body.stock && req.body.stock !== 'undefined') {
            const stock = parseInt(req.body.stock);
            if (!isNaN(stock) && stock >= 0) updateData.stock = stock;
        }

        // Categories
        if (req.body.mainCategory && req.body.mainCategory !== 'undefined' && req.body.mainCategory !== '') {
            const mainCatExists = await MainCategory.findById(req.body.mainCategory);
            if (mainCatExists) updateData.mainCategory = req.body.mainCategory;
        }
        if (req.body.category && req.body.category !== 'undefined' && req.body.category !== '') {
            const catExists = await Category.findById(req.body.category);
            if (catExists) updateData.category = req.body.category;
        }

        // Colors and tags
        if (req.body.colors && req.body.colors !== 'undefined') {
            try { updateData.colors = JSON.parse(req.body.colors); } catch (error) {}
        }
        if (req.body.tags && req.body.tags !== 'undefined') {
            try {
                updateData.tags = JSON.parse(req.body.tags);
            } catch {
                updateData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
        }

        // Booleans
        const booleanFields = ['isFeatured', 'isTrending', 'isNewArrival', 'isBestSeller', 'isActive'];
        booleanFields.forEach(field => {
            if (req.body[field] !== undefined) updateData[field] = req.body[field] === 'true';
        });

        // Handle images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file) => ({
                public_id: file.filename,
                url: `/uploads/products/${file.filename}`,
                alt: req.body.name || product.name,
                isDefault: false
            }));
            updateData.images = [...product.images, ...newImages];
        } else {
            updateData.images = product.images;
        }

        // Handle deleted images
        if (req.body.deletedImages) {
            try {
                const deletedImages = JSON.parse(req.body.deletedImages);
                deletedImages.forEach(imageId => {
                    const imageIndex = updateData.images.findIndex(img => img.public_id === imageId);
                    if (imageIndex !== -1) {
                        deleteFile(updateData.images[imageIndex].url);
                        updateData.images.splice(imageIndex, 1);
                    }
                });
            } catch (error) {
                console.error('Error parsing deletedImages:', error);
            }
        }

        // Handle default image
        if (req.body.defaultImage) {
            updateData.images.forEach(img => { img.isDefault = img.public_id === req.body.defaultImage; });
        } else if (updateData.images.length > 0 && !updateData.images.some(img => img.isDefault)) {
            updateData.images[0].isDefault = true;
        }

        if (updateData.images.length === 0) {
            return res.status(400).json({ success: false, error: 'Product must have at least one image' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate('category', 'name slug')
            .populate('mainCategory', 'name slug icon');

        res.json({ success: true, message: 'Product updated successfully', data: updatedProduct });

    } catch (error) {
        console.error('Update error:', error);
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const adminDeleteProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

        if (product.images) product.images.forEach(img => deleteFile(img.url));

        await product.deleteOne();
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default { adminCreateProduct, adminUpdateProduct, adminDeleteProduct };