// src/utils/imageUtils.js

const getBackendUrl = () => {
  // Build base URL from env (default to local dev API)
  const API_URL = import.meta.env?.VITE_API_URL || '/api';
  // Remove trailing '/api' only
  const BASE_URL = API_URL.replace(/\/api$/, '');
  return BASE_URL;
};

// Cloudinary configuration (optional)
const CLOUD_NAME = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || '';

export const getImageUrl = (image) => {
  if (!image) {
    return getFallbackImage();
  }

  const BASE_URL = getBackendUrl();

  // Helper to construct full URL from a path or public_id
  const constructUrl = (path) => {
    if (!path) return getFallbackImage();

    // Data URIs are returned as‑is
    if (typeof path === 'string' && path.startsWith('data:')) return path;

    if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
      try {
        const urlObj = new URL(path);
        if (urlObj.hostname && !urlObj.hostname.includes('localhost')) {
          return path;
        }
        path = urlObj.pathname;
      } catch (e) {
        console.error('Failed to parse URL:', path);
      }
    }

    let normalizedPath = String(path).trim();
    if (!normalizedPath) return getFallbackImage();

    // Normalize explicit upload paths
    if (normalizedPath.startsWith('uploads/')) {
      normalizedPath = `/${normalizedPath}`;
      return `${BASE_URL}${normalizedPath}`;
    }
    if (normalizedPath.startsWith('/uploads/')) {
      return `${BASE_URL}${normalizedPath}`;
    }

    // Detect category filename patterns and route to the correct uploads folder
    const filename = normalizedPath.replace(/^\//, '');
    if (/^category[-_].*\.(jpe?g|png|webp|gif)$/i.test(filename)) {
      return `${BASE_URL}/uploads/categories/${filename}`;
    }
    if (/^main[-_]category[-_].*\.(jpe?g|png|webp|gif)$/i.test(filename) || filename.includes('main-categories') || filename.includes('maincategories')) {
      return `${BASE_URL}/uploads/main-categories/${filename}`;
    }

    // If this looks like a Cloudinary public_id (no slashes, contains only alphanumerics, underscores, or hyphens)
    if (CLOUD_NAME && /^[a-zA-Z0-9-_]+$/.test(filename)) {
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${filename}`;
    }

    // Otherwise assume product image fallback path
    return `${BASE_URL}/uploads/products/${filename}`;
  };

  if (typeof image === 'string') {
    return constructUrl(image);
  }

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
