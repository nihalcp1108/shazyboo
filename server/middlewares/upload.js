import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const unlinkAsync = promisify(fs.unlink);

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists - use absolute path to root uploads folder
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

// Helper function to delete a single file
export const deleteFile = async (filePath) => {
    try {
        // Remove the leading slash if present and ensure it's relative to current directory
        const cleanPath = filePath.replace(/^\//, '');
        const fullPath = path.join(process.cwd(), cleanPath);
        
        if (fs.existsSync(fullPath)) {
            await unlinkAsync(fullPath);
            console.log(`Deleted file: ${fullPath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
        return false;
    }
};

// Helper function to delete multiple files
export const deleteFiles = async (filePaths) => {
    const results = await Promise.allSettled(
        filePaths.map(filePath => deleteFile(filePath))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === false)).length;
    
    console.log(`Deleted ${successful} files, failed: ${failed}`);
    return { successful, failed };
};

export const uploadProductImages = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
}).array('images', 20); // 'images' is the field name, max 20 files

// Optional: Export a single image upload middleware
export const uploadSingleImage = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
}).single('image');

// Export single image upload for categories
export const uploadCategoryImage = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for categories
    fileFilter: fileFilter
}).single('image');