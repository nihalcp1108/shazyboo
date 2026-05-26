import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug logs to verify environment variables
console.log('=== CLOUDINARY CONFIG CHECK ===');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'MISSING');
console.log('CLOUDINARY_API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET exists:', !!process.env.CLOUDINARY_API_SECRET);

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('🚨 CRITICAL ERROR: Cloudinary credentials are missing in the environment variables!');
}

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper function for uploading to Cloudinary
export const uploadToCloudinary = async (filePath, folder = 'products') => {
  try {
    console.log(`Starting Cloudinary upload for file: ${filePath} to folder: ${folder}`);
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });
    console.log(`Cloudinary upload SUCCESS: ${result.secure_url}`);
    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error DETAILS:');
    console.error('Error message:', error.message);
    console.error('Error HTTP code:', error.http_code);
    console.error('Full error stack:', error);
    throw new Error(`Image upload failed: ${error.message || 'Unknown Cloudinary error'}`);
  }
};

// Helper function for deleting from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Image deletion failed');
  }
};

// Helper function for multiple deletions
export const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const results = await Promise.all(
      publicIds.map(publicId => cloudinary.uploader.destroy(publicId))
    );
    return results;
  } catch (error) {
    console.error('Cloudinary multiple delete error:', error);
    throw new Error('Multiple image deletion failed');
  }
};

export default cloudinary;