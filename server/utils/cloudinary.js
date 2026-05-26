import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath, override: false });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('🚨 Cloudinary configuration error: missing required environment variables.');
  console.error({
    CLOUDINARY_CLOUD_NAME: cloudName || 'MISSING',
    CLOUDINARY_API_KEY: !!apiKey,
    CLOUDINARY_API_SECRET: !!apiSecret
  });
  throw new Error('Missing Cloudinary environment variables. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

console.log('Cloudinary configured with cloud name:', cloudName);

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