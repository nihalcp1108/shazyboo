import express from 'express';
import { uploadProductImages } from '../middlewares/upload.js';
import { protect, authorize } from '../middlewares/auth.js';
import { deleteFile } from '../utils/fileUtils.js';

const router = express.Router();

// Upload images endpoint - requires authentication but can be user or admin
router.post('/images', protect, uploadProductImages, (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'No files uploaded'
        });
    }

    // Process uploaded files
    const images = req.files.map((file, index) => ({
        id: Date.now() + index,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/products/${file.filename}`,
        path: file.path,
        isDefault: req.body.isDefault === 'true' && index === 0
    }));

    res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        count: images.length,
        data: images
    });
});

// Upload images for admin (with additional features)
router.post('/admin/images', protect, authorize('admin'), uploadProductImages, (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'No files uploaded'
        });
    }

    const images = req.files.map((file, index) => ({
        id: Date.now() + index,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/products/${file.filename}`,
        path: file.path,
        isDefault: req.body.isDefault === 'true' && index === 0
    }));

    res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        count: images.length,
        data: images
    });
});

// Delete image endpoint - only for admin
router.delete('/images/:filename', protect, authorize('admin'), (req, res) => {
    const { filename } = req.params;
    
    const success = deleteFile(`/uploads/products/${filename}`);
    
    if (success) {
        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Image not found'
        });
    }
});

export default router;