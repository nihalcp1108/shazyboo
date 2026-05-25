// src/utils/imageUtils.js

const getBackendUrl = () => {
  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5001/api';
  const BASE_URL = API_URL.replace('/api', '');
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
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('data:')) return path;

    // Ensure path starts with /uploads/ or uploads/
    let normalizedPath = path;
    if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('uploads/')) {
      normalizedPath = `/uploads/products/${normalizedPath}`;
    }

    // In development (Vite dev server on port 3000), use relative URLs to leverage proxy
    const isDev = typeof window !== 'undefined' && window.location.port === '3000';
    if (isDev) {
      // Return path relative to same origin (proxy will forward to backend)
      return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    }

    // Combine with BASE_URL for production or non‑dev environments
    if (normalizedPath.startsWith('/')) {
      return `${BASE_URL}${normalizedPath}`;
    }
    return `${BASE_URL}/${normalizedPath}`;
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
  return 'https://images.unsplash.com/photo-1550747535-6734fa2e5f6b?w=400&h=400&fit=crop&q=80';
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