import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath, override: false });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Allow server to start even if Cloudinary envs are not set.
// When disabled, upload/delete helpers will throw runtime errors with a clear message.
const cloudinaryEnabled = !!(cloudName && apiKey && apiSecret);

console.log('Cloudinary config - enabled:', cloudinaryEnabled);
console.log('CLOUDINARY_CLOUD_NAME:', cloudName);
console.log('CLOUDINARY_API_KEY set:', !!apiKey);
console.log('CLOUDINARY_API_SECRET set:', !!apiSecret);
  if (!cloudinaryEnabled) {
  console.warn('⚠️ Cloudinary not configured. Uploads will fail until environment variables are set.');
  console.warn({
    CLOUDINARY_CLOUD_NAME: cloudName || 'MISSING',
    CLOUDINARY_API_KEY: !!apiKey,
    CLOUDINARY_API_SECRET: !!apiSecret
  });
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log('Cloudinary configured with cloud name:', cloudName);
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log('Cloudinary configured with cloud name:', cloudName);
}

// Helper function for uploading to Cloudinary
export const uploadToCloudinary = async (filePath, folder = 'products') => {
  if (!cloudinaryEnabled) {
    throw new Error('Cloudinary is not configured in this environment. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to enable uploads.');
  }
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
  if (!cloudinaryEnabled) {
    throw new Error('Cloudinary is not configured in this environment. Cannot delete images.');
  }
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
  if (!cloudinaryEnabled) {
    throw new Error('Cloudinary is not configured in this environment. Cannot delete images.');
  }
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