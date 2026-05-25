import { useState } from 'react';
import { FaTrash, FaPlus, FaMinus, FaPalette } from 'react-icons/fa';
import { useCart } from '../../Context/CartContext';
import { getFallbackImage, handleImageError } from '../../utils/imageUtils';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, getCartItemKey } = useCart();
  const [loading, setLoading] = useState(false);

  const getImageUrl = (imageInput) => {
    // If we have an images array but no single image, pick the first one or default
    let image = imageInput;
    if (!image && item.images && item.images.length > 0) {
      image = item.images.find(img => img.isDefault) || item.images[0];
    }

    if (!image) {
      return getFallbackImage();
    }
    
    // Handle if the image is just a string (path or URL)
    if (typeof image === 'string') {
      if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
        return image;
      }
      if (image.startsWith('/uploads/')) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const BASE_URL = API_URL.replace('/api', '');
        return `${BASE_URL}${image}`;
      }
      // If it's just a filename
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const BASE_URL = API_URL.replace('/api', '');
      return `${BASE_URL}/uploads/products/${image}`;
    }
    
    // Handle if the image is an object
    if (image && typeof image === 'object') {
      if (image.url) {
        if (image.url.startsWith('http://') || image.url.startsWith('https://') || image.url.startsWith('data:')) {
          return image.url;
        }
        if (image.url.startsWith('/uploads/')) {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
          const BASE_URL = API_URL.replace('/api', '');
          return `${BASE_URL}${image.url}`;
        }
        return image.url;
      }
      if (image.public_id) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const BASE_URL = API_URL.replace('/api', '');
        return `${BASE_URL}/uploads/products/${image.public_id}`;
      }
    }
    
    return getFallbackImage();
  };

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    const maxStock = item.selectedColorData ? item.selectedColorData.stock : item.stock;
    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }
    
    setLoading(true);
    await updateQuantity(getCartItemKey(item), newQuantity);
    setLoading(false);
  };

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove this item from cart?')) {
      setLoading(true);
      removeFromCart(getCartItemKey(item));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="w-full h-full object-cover rounded-lg shadow-md"
          onError={(e) => {
            handleImageError(e);
          }}
        />
      </div>
      
      {/* Product Details */}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
        
        {/* Color Display */}
        {item.selectedColor && (
          <div className="flex items-center mt-1">
            <FaPalette className="text-indigo-500 mr-2 text-sm" />
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: item.selectedColorCode || '#000' }}
              ></div>
              <span className="text-sm text-gray-600">
                Color: {item.selectedColorName || item.selectedColor}
              </span>
              {item.colorAdditionalPrice > 0 && (
                <span className="text-xs text-indigo-600 font-semibold">
                  (+₹{item.colorAdditionalPrice})
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-4 mt-2">
          {/* Price */}
          <div className="flex flex-col">
            <div className="text-lg font-bold text-blue-600">
              ₹{((item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price) + (item.selectedColorPrice || 0)).toFixed(2)}
            </div>
            {item.discountPrice && item.discountPrice > 0 && (
              <div className="text-xs text-gray-400 line-through">
                ₹{(item.price + (item.selectedColorPrice || 0)).toFixed(2)}
              </div>
            )}
          </div>
          
          <div className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Total: ₹{(((item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price) + (item.selectedColorPrice || 0)) * item.quantity).toFixed(2)}
          </div>
          
          {/* Quantity Controls */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FaMinus className="text-xs" />
            </button>
            <span className="px-4 py-1 border-x min-w-[50px] text-center font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={loading || item.quantity >= (item.colorStock || item.stock)}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FaPlus className="text-xs" />
            </button>
          </div>
          
          {/* Stock Info */}
          <div className="text-xs text-gray-500">
            {item.colorStock || item.stock} items available
          </div>
        </div>
      </div>
      
      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={loading}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all disabled:opacity-50"
        title="Remove item"
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default CartItem;