// components/Products/ProductCard.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaStar, FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { toast } from 'react-hot-toast'
import { getImageUrl, getFallbackImage, handleImageError } from '../../utils/imageUtils'

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  
  const inWishlist = isInWishlist(product._id)

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await addToCart(product, 1)
      // Toast is already shown in addToCart function
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setIsLoading(false)
    }
  }


  const getFirstImage = () => {
    if (product.images && product.images.length > 0) {
      return getImageUrl(product.images[0])
    }
    if (product.image) {
      return getImageUrl(product.image)
    }
    return getFallbackImage()
  }

  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price
  const discountPercentage = product.discountPrice > 0 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <div 
      className="card group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            -{discountPercentage}%
          </span>
        </div>
      )}
      
      {product.isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            Featured
          </span>
        </div>
      )}

      <Link to={`/product/${product._id}`} className="block relative h-48 md:h-64 overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
        <img
          src={getFirstImage()}
          alt={product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
          onError={handleImageError}
        />
        
        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 ${isHovered ? 'flex' : 'hidden'} items-center justify-center space-x-4`}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition shadow-lg z-20"
          >
            <FaHeart className={`text-sm ${inWishlist ? 'text-pink-500' : ''}`} />
          </button>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-purple-500 hover:text-white transition shadow-lg">
            <FaEye className="text-sm" />
          </div>
        </div>
      </Link>

      <div className="p-3 md:p-4 flex flex-col flex-grow">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-bold text-gray-800 hover:text-pink-600 transition line-clamp-1 text-sm md:text-lg mb-1 md:mb-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="hidden md:block text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
          {product.shortDescription || product.description?.substring(0, 100) || 'An adorable item that will make you smile!'}
        </p>
        
        <div className="flex items-center mb-2 md:mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`${i < Math.floor(product.ratings?.average || 0) ? 'fill-current' : 'text-gray-300'}`}
                size={10}
              />
            ))}
          </div>
          <span className="text-[10px] md:text-sm text-gray-500 ml-1 md:ml-2">
            ({product.ratings?.count || 0})
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-auto pt-2">
          <div className="flex items-center space-x-1 md:space-x-2">
            <span className="text-sm md:text-xl font-bold text-gray-900">
              ₹{finalPrice?.toFixed(0)}
            </span>
            {product.discountPrice > 0 && product.discountPrice < product.price && (
              <span className="text-[10px] md:text-sm text-gray-500 line-through">
                ₹{product.price?.toFixed(0)}
              </span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isLoading || product.stock === 0}
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg transition flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm font-bold ${
              product.stock === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
            ) : product.stock === 0 ? (
              'Out'
            ) : (
              <>
                <FaShoppingCart className="text-[10px] md:text-sm" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard