import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Delete file helper
export const deleteFile = (filePath) => {
    const fullPath = path.join(__dirname, '../..', filePath);
    
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
            return true;
        } catch (err) {
            console.error('Error deleting file:', err);
            return false;
        }
    }
    return false;
};

// Delete multiple files helper
export const deleteFiles = (filePaths) => {
    const results = filePaths.map(filePath => ({
        path: filePath,
        success: deleteFile(filePath)
    }));
    return results;
};

// Ensure directory exists
export const ensureDirExists = (dirPath) => {
    const fullPath = path.join(__dirname, '../..', dirPath);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
};

export default {
    deleteFile,
    deleteFiles,
    ensureDirExists
};