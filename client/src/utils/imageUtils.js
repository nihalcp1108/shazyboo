// src/utils/imageUtils.js

const getBackendUrl = () => {
  // Build base URL from env (default to local dev API)
  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5001/api';
  // Remove trailing '/api' only
  const BASE_URL = API_URL.replace(/\/api$/, '');
  return BASE_URL;
};

export const getImageUrl = (image) => {
  if (!image) {
    return getFallbackImage();
  }

  const BASE_URL = getBackendUrl();

  // Helper to construct full URL from path
  const constructUrl = (path) => {
      if (!path) return getFallbackImage();

      // If already a full URL (e.g., Cloudinary), return it directly
      if (path.startsWith('http://') || path.startsWith('https://')) {
        // Allow Cloudinary or any external CDN URLs
        if (!path.includes('localhost')) return path;
        // For localhost URLs, extract pathname to use static server
        try {
          const urlObj = new URL(path);
          path = urlObj.pathname;
        } catch (e) {
          console.error('Failed to parse URL:', path);
        }
      }

      if (path.startsWith('data:')) return path;

      // Ensure the path points to the uploads folder
      let normalizedPath = path;
      if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('uploads/')) {
        normalizedPath = `/uploads/products/${normalizedPath}`;
      }

      // Development environment (Vite dev server on port 3000) – use relative path
      const isDev = typeof window !== 'undefined' && window.location.port === '3000';
      if (isDev) {
        return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
      }

      // Production – prepend backend base URL
      return `${BASE_URL}${normalizedPath}`;
    };

  // If image is a string
  if (typeof image === 'string') {
    return constructUrl(image);
  }

  // If image is an object
  if (image && typeof image === 'object') {
    if (image.url) return constructUrl(image.url);
    if (image.public_id) return constructUrl(image.public_id);
    if (image.filename) return constructUrl(image.filename);
  }

  return getFallbackImage();
};

export const getFallbackImage = () => {
  // Inline SVG placeholder to avoid external network requests.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#555" font-size="20">No Image</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const handleImageError = (e) => {
  console.error('Image failed to load:', e.target.src);
  e.target.src = getFallbackImage();
  e.target.onerror = null; // Prevent infinite loop
};

export const getFirstImageUrl = (product) => {
  if (!product) return getFallbackImage();
  
  if (product.images && product.images.length > 0) {
    return getImageUrl(product.images[0]);
  }
  if (product.image && product.image.length > 0) {
    return getImageUrl(product.image[0]);
  }
  return getFallbackImage();
};