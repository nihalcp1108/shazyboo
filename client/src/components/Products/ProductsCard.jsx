import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaStar, FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa'
import { useCart } from '../../Context/CartContext'
import { useWishlist } from '../../Context/WishlistContext'
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

  const finalPrice =
    product.discountPrice > 0
      ? product.discountPrice
      : product.price

  const discountPercentage =
    product.discountPrice > 0
      ? Math.round(
          ((product.price - product.discountPrice) /
            product.price) *
            100
        )
      : 0

  return (
    <div
      className="card group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full min-h-[14rem] md:min-h-[16rem]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {discountPercentage > 0 && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
            -{discountPercentage}%
          </span>
        </div>
      )}

      {product.isFeatured && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
            Featured
          </span>
        </div>
      )}

      {/* Product Image */}
      <Link
        to={`/product/${product._id}`}
        className="block relative h-24 md:h-36 overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50"
      >
        <img
          src={getFirstImage()}
          alt={product.name}
          className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />

        <div
          className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 ${
            isHovered ? 'flex' : 'hidden'
          } items-center justify-center gap-3`}
        >
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleWishlist(product)
            }}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition shadow"
          >
            <FaHeart
              className={`text-sm ${
                inWishlist ? 'text-pink-500' : ''
              }`}
            />
          </button>

          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-purple-500 hover:text-white transition shadow">
            <FaEye className="text-sm" />
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-2 flex flex-col flex-grow gap-1">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-pink-600 transition text-sm md:text-base line-clamp-2 h-[2.25rem] md:h-[2.75rem] mb-1 overflow-hidden">
            {product.name}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="flex items-center mb-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={10}
                className={
                  i <
                  Math.floor(product.ratings?.average || 0)
                    ? 'fill-current'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>

          <span className="text-xs text-gray-500 ml-1">
            ({product.ratings?.count || 0})
          </span>
        </div>

        {/* Price + Button */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base md:text-lg font-bold text-gray-900">
              ₹{finalPrice?.toFixed(0)}
            </span>

            {product.discountPrice > 0 &&
              product.discountPrice < product.price && (
                <span className="text-xs text-gray-500 line-through">
                  ₹{product.price?.toFixed(0)}
                </span>
              )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleAddToCart()
            }}
            disabled={isLoading || product.stock === 0}
            className={`w-full py-1.5 rounded-lg transition flex items-center justify-center gap-2 text-sm font-semibold ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : product.stock === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <FaShoppingCart size={12} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard