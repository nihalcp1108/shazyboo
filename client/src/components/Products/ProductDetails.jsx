import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FaStar, FaShoppingCart, FaHeart, FaTruck, FaShieldAlt, FaUndo, 
  FaPalette, FaCheck, FaExclamationTriangle, FaTimes, FaExpand, 
  FaCompress, FaChevronLeft, FaChevronRight, FaMinus, FaPlus,
  FaShare, FaWhatsapp, FaTwitter, FaFacebook, FaLink, FaCopy
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'
import { useCart } from '../../Context/CartContext'
import { useAuth } from '../../Context/AuthContext'
import { useWishlist } from '../../Context/WishlistContext'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageUrl, handleImageError, getFallbackImage } from '../../utils/imageUtils'
import { Helmet } from 'react-helmet-async'
import { getProductMeta } from '../../utils/seoHelpers'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [mainImageLoading, setMainImageLoading] = useState(true)
  const touchStartXRef = useRef(null)
  const touchEndXRef = useRef(null)
  const touchStartYRef = useRef(null)
  const isSwipingRef = useRef(false)
  const lightboxTouchStartRef = useRef(null)
  const lightboxIsSwipingRef = useRef(false)
  const mouseDragStartXRef = useRef(null)
  const mouseIsDraggingRef = useRef(false)
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 })
  const [userReview, setUserReview] = useState({
    rating: 5,
    comment: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  
  // Color selection state
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedColorData, setSelectedColorData] = useState(null)
  const [colorStock, setColorStock] = useState(0)
  const [colorPrice, setColorPrice] = useState(0)
  
  const { addToCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const inWishlist = product ? isInWishlist(product._id) : false;
  const enableGalleryLoop = false

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchProduct()
    fetchReviews()
  }, [id])

  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && lightboxOpen) {
        closeLightbox()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [lightboxOpen])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [lightboxOpen])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/${id}`)
      const productData = response.data.data
      
      setProduct(productData)
      
      // Initialize color selection if colors exist
      if (productData.colors && Array.isArray(productData.colors) && productData.colors.length > 0) {
        const availableColor = productData.colors.find(c => c.stock > 0) || productData.colors[0]
        if (availableColor) {
          setSelectedColor(availableColor.name)
          setSelectedColorData(availableColor)
          setColorStock(availableColor.stock || 0)
          setColorPrice(availableColor.additionalPrice || 0)
        }
      }
      
      if (productData.ratings) {
        setReviewStats({
          average: productData.ratings.average || 0,
          count: productData.ratings.count || 0
        })
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Product not found')
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/products/${id}/reviews`)
      setReviews(response.data.data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const hasUserReviewed = () => {
    if (!user || !reviews.length) return false
    return reviews.some(review => review.user?._id === user._id)
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a review')
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }

    if (!userReview.comment.trim()) {
      toast.error('Please write a review comment')
      return
    }

    if (userReview.rating < 1 || userReview.rating > 5) {
      toast.error('Please select a rating between 1 and 5')
      return
    }

    setSubmittingReview(true)
    try {
      const response = await api.post(`/products/${id}/reviews`, {
        rating: userReview.rating,
        comment: userReview.comment
      })

      const newReview = {
        ...response.data.data,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      }
      
      setReviews([newReview, ...reviews])
      
      const newCount = reviewStats.count + 1
      const newAverage = ((reviewStats.average * reviewStats.count) + userReview.rating) / newCount
      
      setReviewStats({
        average: newAverage,
        count: newCount
      })

      setUserReview({
        rating: 5,
        comment: ''
      })
      setShowReviewForm(false)
      
      toast.success('Review submitted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
      if (error.response?.status === 400) {
        toast.error('You have already reviewed this product')
      } else {
        toast.error('Failed to submit review. Please try again.')
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error('Please login to delete your review')
      return
    }

    if (!window.confirm('Are you sure you want to delete your review?')) {
      return
    }

    try {
      await api.delete(`/products/${id}/reviews/${reviewId}`)
      
      const deletedReview = reviews.find(review => review._id === reviewId)
      setReviews(reviews.filter(review => review._id !== reviewId))
      
      if (deletedReview) {
        const newCount = reviewStats.count - 1
        const newAverage = newCount > 0 
          ? ((reviewStats.average * reviewStats.count) - deletedReview.rating) / newCount
          : 0
        
        setReviewStats({
          average: newAverage,
          count: newCount
        })
      }
      
      toast.success('Review deleted successfully!')
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review. Please try again.')
    }
  }


  const images = useMemo(() => {
    if (!product) return []

    if (product.images && product.images.length > 0) {
      return product.images.map(img => ({
        ...img,
        url: getImageUrl(img)
      }))
    }

    if (product.image) {
      if (Array.isArray(product.image)) {
        return product.image.map(img => ({ url: getImageUrl(img) }))
      }
      return [{ url: getImageUrl(product.image) }]
    }

    return [{ url: getFallbackImage() }]
  }, [product])

  const thumbnailRefs = useRef([])
  const loadedUrlsRef = useRef(new Set())

  // Preload all product gallery images for instant switching without lag
  useEffect(() => {
    if (images && images.length > 0) {
      images.forEach((img) => {
        if (img?.url) {
          const imageObj = new Image()
          imageObj.src = img.url
          imageObj.onload = () => loadedUrlsRef.current.add(img.url)
        }
      })
    }
  }, [images])

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailRefs.current[selectedImage]) {
      thumbnailRefs.current[selectedImage]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [selectedImage])

  const handleSelectImage = (index) => {
    setSelectedImage(index)
    const targetUrl = images[index]?.url
    if (targetUrl && loadedUrlsRef.current.has(targetUrl)) {
      setMainImageLoading(false)
    }
  }

  const handleMainImageLoad = (url) => {
    if (url) loadedUrlsRef.current.add(url)
    setMainImageLoading(false)
  }

  // Lightbox Functions
  const openLightbox = (index) => {
    setLightboxImage(index)
    setLightboxOpen(true)
    setZoomLevel(1)
    setZoomPosition({ x: 0, y: 0 })
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setZoomLevel(1)
    setZoomPosition({ x: 0, y: 0 })
  }

  const handlePointerDown = (e) => {
    touchEndXRef.current = null
    touchStartXRef.current = e.clientX
    touchStartYRef.current = e.clientY
    isSwipingRef.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (touchStartXRef.current === null) return
    const currentX = e.clientX
    const currentY = e.clientY
    touchEndXRef.current = currentX

    const dx = Math.abs(currentX - touchStartXRef.current)
    const dy = Math.abs(currentY - touchStartYRef.current)
    if (Math.max(dx, dy) > 8) {
      isSwipingRef.current = true
    }
  }

  const handlePointerUp = (e) => {
    if (touchStartXRef.current === null) return

    const currentX = e.clientX
    const distance = touchStartXRef.current - currentX
    const minSwipeDistance = 30

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        setSelectedImage((prev) => {
          if (enableGalleryLoop) {
            return (prev + 1) % images.length
          }
          return Math.min(prev + 1, images.length - 1)
        })
      } else {
        setSelectedImage((prev) => {
          if (enableGalleryLoop) {
            return (prev - 1 + images.length) % images.length
          }
          return Math.max(prev - 1, 0)
        })
      }
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
    touchStartYRef.current = null
    isSwipingRef.current = false
  }

  const handlePointerCancel = () => {
    touchStartXRef.current = null
    touchEndXRef.current = null
    touchStartYRef.current = null
    isSwipingRef.current = false
  }

  const handleImageClick = (e) => {
    if (e?.target?.closest && e.target.closest('button')) {
      return
    }
    if (isSwipingRef.current) {
      isSwipingRef.current = false
      return
    }
    openLightbox(selectedImage)
  }

  const handleLightboxTouchStart = (e) => {
    lightboxTouchStartRef.current = e.targetTouches[0].clientX
    lightboxIsSwipingRef.current = false
  }

  const handleLightboxTouchMove = (e) => {
    if (lightboxTouchStartRef.current === null) return
    const distance = Math.abs(e.targetTouches[0].clientX - lightboxTouchStartRef.current)
    if (distance > 10) {
      lightboxIsSwipingRef.current = true
    }
  }

  const handleLightboxTouchEnd = (e) => {
    if (lightboxTouchStartRef.current === null) return

    const currentX = e.changedTouches?.[0]?.clientX
    const distance = lightboxTouchStartRef.current - currentX
    const minSwipeDistance = 50

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        nextImage()
      } else {
        prevImage()
      }
    }

    lightboxTouchStartRef.current = null
    lightboxIsSwipingRef.current = false
  }

  const handleMouseDown = (e) => {
    mouseDragStartXRef.current = e.clientX
    mouseIsDraggingRef.current = false
  }

  const handleMouseMoveDrag = (e) => {
    if (mouseDragStartXRef.current === null) return
    const dragDistance = Math.abs(e.clientX - mouseDragStartXRef.current)
    if (dragDistance > 10) {
      mouseIsDraggingRef.current = true
    }
  }

  const handleMouseUp = (e) => {
    if (mouseDragStartXRef.current === null) return
    const distance = mouseDragStartXRef.current - e.clientX
    const minSwipeDistance = 50

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        setSelectedImage((prev) => {
          if (enableGalleryLoop) {
            return (prev + 1) % images.length
          }
          return Math.min(prev + 1, images.length - 1)
        })
      } else {
        setSelectedImage((prev) => {
          if (enableGalleryLoop) {
            return (prev - 1 + images.length) % images.length
          }
          return Math.max(prev - 1, 0)
        })
      }
    }

    mouseDragStartXRef.current = null
    mouseIsDraggingRef.current = false
  }

  const nextImage = () => {
    if (!images.length) return
    setLightboxImage((prev) => {
      if (enableGalleryLoop) {
        return (prev + 1) % images.length
      }
      return Math.min(prev + 1, images.length - 1)
    })
    setZoomLevel(1)
    setZoomPosition({ x: 0, y: 0 })
  }

  const prevImage = () => {
    if (!images.length) return
    setLightboxImage((prev) => {
      if (enableGalleryLoop) {
        return (prev - 1 + images.length) % images.length
      }
      return Math.max(prev - 1, 0)
    })
    setZoomLevel(1)
    setZoomPosition({ x: 0, y: 0 })
  }

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3))
  }

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1))
  }

  const handleMouseMove = (e) => {
    if (zoomLevel > 1) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setZoomPosition({ x, y })
    }
  }

  const handleTouchMove = (e) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      const rect = e.currentTarget.getBoundingClientRect()
      const touch = e.touches[0]
      const x = (touch.clientX - rect.left) / rect.width
      const y = (touch.clientY - rect.top) / rect.height
      setZoomPosition({ x: Math.min(Math.max(x, 0), 1), y: Math.min(Math.max(y, 0), 1) })
    }
  }

  const handleAddToCart = async () => {
    // Check if product has colors and none selected
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color first')
      return
    }

    const availableStock = selectedColorData ? colorStock : product?.stock
    if (!product || availableStock === 0) {
      toast.error('Product is out of stock')
      return
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available`)
      return
    }

    try {
      const cartItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        images: product.images,
        stock: product.stock,
        selectedColor: selectedColor || null,
        selectedColorName: selectedColor || null,
        selectedColorCode: selectedColorData?.code || null,
        selectedColorPrice: colorPrice || 0,
        quantity: quantity
      }
      
      const result = await addToCart(cartItem, quantity)
      if (result !== false) {
        toast.success(`Added ${quantity} item(s) to cart 🎀`)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  const handleBuyNow = async () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color first')
      return
    }

    const availableStock = selectedColorData ? colorStock : product?.stock
    if (!product || availableStock === 0) {
      toast.error('Product is out of stock')
      return
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available`)
      return
    }

    try {
      const cartItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        images: product.images,
        stock: product.stock,
        selectedColor: selectedColor || null,
        selectedColorName: selectedColor || null,
        selectedColorCode: selectedColorData?.code || null,
        selectedColorPrice: colorPrice || 0,
        quantity: quantity
      }
      
      const result = await addToCart(cartItem, quantity)
      if (result !== false) {
        navigate('/cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  const shareProduct = (platform) => {
    const url = window.location.href
    const title = product.name
    const text = `Check out this amazing product: ${product.name}`
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      copy: 'copy'
    }
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } else {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer')
    }
    setShowShareMenu(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-96 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 w-20 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gradient-to-r from-pink-100 to-purple-100 rounded w-3/4"></div>
              <div className="h-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded w-1/2"></div>
              <div className="h-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded w-1/4"></div>
              <div className="h-32 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl"></div>
              <div className="h-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  const { title, description } = getProductMeta(product)
  const basePrice = product.discountPrice > 0 ? product.discountPrice : product.price
  const finalPrice = basePrice + colorPrice
  const discountPercentage = product.discountPrice > 0 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  const userHasReviewed = hasUserReviewed()
  const userReviewObj = user ? reviews.find(review => review.user?._id === user._id) : null
  const availableStock = selectedColorData ? colorStock : product.stock
  const hasColors = product.colors && Array.isArray(product.colors) && product.colors.length > 0

    return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-pink-600">Home</button>
        <span className="mx-2 text-gray-400">/</span>
        <button onClick={() => navigate('/shop')} className="text-gray-500 hover:text-pink-600">Shop</button>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-800 font-medium">{product.name?.substring(0, 50)}...</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images Section */}
        <div>
          <div className="sticky top-24">
            {/* Main Image with click to zoom */}
            <div 
              className="rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 mb-4 shadow-lg relative group cursor-zoom-in"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onClick={handleImageClick}
              style={{ touchAction: 'pan-y' }}
            >
              <div
                className="relative w-full h-96 bg-white overflow-hidden"
              >
                {mainImageLoading && (
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 animate-pulse" />
                  </div>
                )}

                <img
                  key={images[selectedImage]?.url || 'product-main'}
                  src={images[selectedImage]?.url || getFallbackImage()}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain cursor-zoom-in transition-opacity duration-150 ease-out"
                  onClick={handleImageClick}
                  onLoad={() => handleMainImageLoad(images[selectedImage]?.url)}
                  onError={(e) => {
                    handleImageError(e)
                    setMainImageLoading(false)
                  }}
                  draggable={false}
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectImage((selectedImage - 1 + images.length) % images.length)
                      }}
                      disabled={images.length <= 1}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/90 text-gray-800 shadow-md p-2.5 hover:bg-white hover:scale-110 active:scale-95 transition-all disabled:opacity-40"
                    >
                      <FaChevronLeft className="text-lg" />
                    </button>

                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectImage((selectedImage + 1) % images.length)
                      }}
                      disabled={images.length <= 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/90 text-gray-800 shadow-md p-2.5 hover:bg-white hover:scale-110 active:scale-95 transition-all disabled:opacity-40"
                    >
                      <FaChevronRight className="text-lg" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <FaExpand className="text-sm" />
                  <span>Click to zoom</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => openLightbox(selectedImage)}
                className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-4 py-2 text-white shadow-md hover:bg-pink-700 active:scale-95 transition-all text-sm font-bold"
              >
                <FaExpand />
                Zoom Image
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto hide-scroll pb-2 px-1 mt-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    ref={(el) => (thumbnailRefs.current[index] = el)}
                    type="button"
                    onClick={() => handleSelectImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                      selectedImage === index
                        ? 'border-pink-500 shadow-md scale-105 ring-2 ring-pink-300'
                        : 'border-transparent opacity-75 hover:opacity-100 hover:border-pink-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="eager"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Info Section */}
        <div>
          <div className="space-y-6">
            {/* Title & Reviews */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-bold">{reviewStats.average.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({reviewStats.count} reviews)</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  availableStock > 0 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-600' 
                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600'
                }`}>
                  {availableStock > 0 ? `In Stock (${availableStock}) 🎀` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                ₹{finalPrice.toFixed(2)}
              </span>
              {discountPercentage > 0 && (
                <>
                  <span className="text-2xl text-gray-400 line-through">
                    ₹{(product.price + colorPrice).toFixed(2)}
                  </span>
                  <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Save {discountPercentage}% ✨
                  </span>
                </>
              )}
            </div>

            {/* Color Selection Section */}
            {hasColors ? (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-2 border-indigo-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FaPalette className="mr-2 text-indigo-500" />
                  Select Color ({product.colors.length} available)
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (color.stock > 0) {
                          setSelectedColor(color.name)
                          setSelectedColorData(color)
                          setColorStock(color.stock)
                          setColorPrice(color.additionalPrice || 0)
                          setQuantity(1)
                          toast.success(`Selected ${color.name} color ✨`)
                        } else {
                          toast.error(`${color.name} is out of stock`)
                        }
                      }}
                      className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all min-w-[100px] ${
                        selectedColor === color.name
                          ? 'border-indigo-500 bg-indigo-50 shadow-md scale-105'
                          : 'border-white bg-white/50 hover:border-indigo-200 hover:bg-white'
                      } ${color.stock === 0 ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                      disabled={color.stock === 0}
                    >
                      <div className="relative mb-2">
                        <div 
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color.code }}
                        ></div>
                        {selectedColor === color.name && (
                          <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5 shadow-sm">
                            <FaCheck className="text-[10px]" />
                          </div>
                        )}
                      </div>
                      
                      <span className="font-bold text-gray-800 text-sm mb-1">{color.name}</span>
                      
                      <div className="flex flex-col items-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          color.stock > 10 ? 'bg-green-100 text-green-600' : 
                          color.stock > 0 ? 'bg-orange-100 text-orange-600' : 
                          'bg-red-100 text-red-600'
                        }`}>
                          {color.stock > 0 ? `${color.stock} In Stock` : 'Sold Out'}
                        </span>
                        
                        {color.additionalPrice > 0 && (
                          <span className="text-[10px] text-indigo-600 font-bold mt-1">
                            +₹{color.additionalPrice}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedColorData && selectedColorData.stock > 0 && selectedColorData.stock <= 5 && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200 animate-pulse">
                    <p className="text-sm text-orange-700 font-bold flex items-center">
                      <FaExclamationTriangle className="mr-2" />
                      Hurry! Only {selectedColorData.stock} items left in {selectedColor}! 🎀
                    </p>
                  </div>
                )}
                {!selectedColor && (
                  <p className="text-sm text-amber-600 mt-2 font-bold flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    Please select your favorite color variant
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-gray-600">This product comes in a single color variant</p>
              </div>
            )}

            {/* Description */}
            <div className="prose max-w-none">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Specifications ✨</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex bg-white/50 p-3 rounded-lg">
                      <span className="text-gray-600 font-medium w-32">{key}:</span>
                      <span className="text-gray-800 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl">
              <span className="font-bold text-lg text-gray-800">Quantity:</span>
              <div className="flex items-center border-2 border-pink-200 rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-4 py-3 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-l-lg transition"
                >
                  <FaMinus />
                </button>
                <span className="px-6 py-3 border-x border-pink-200 min-w-[60px] text-center font-bold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(prev => Math.min(availableStock, prev + 1))}
                  className="px-4 py-3 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-r-lg transition"
                >
                  <FaPlus />
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {availableStock} items available 🎀
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0 || (hasColors && !selectedColor)}
                className={`flex-1 flex items-center justify-center space-x-3 py-4 rounded-xl text-lg font-bold transition-all ${
                  availableStock === 0 || (hasColors && !selectedColor)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                <FaShoppingCart />
                <span>{availableStock === 0 ? 'Out of Stock' : (hasColors && !selectedColor) ? 'Select Color First' : 'Add to Cart'}</span>
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={availableStock === 0 || (hasColors && !selectedColor)}
                className={`flex-1 flex items-center justify-center space-x-3 py-4 rounded-xl text-lg font-bold transition-all ${
                  availableStock === 0 || (hasColors && !selectedColor)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                <span>Buy Now ✨</span>
              </button>
              
              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-4 border-2 rounded-xl transition-all ${
                  inWishlist 
                    ? 'border-pink-500 bg-pink-50 text-pink-500 hover:bg-pink-100' 
                    : 'border-pink-300 hover:border-pink-500 hover:bg-pink-50 hover:text-pink-600'
                }`}
                title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <FaHeart className="text-xl" />
              </button>

              {/* Share Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-4 border-2 border-pink-300 rounded-xl hover:border-pink-500 hover:bg-pink-50 hover:text-pink-600 transition-all"
                >
                  <FaShare className="text-xl" />
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-20 w-48">
                    <div className="p-2">
                      <button
                        onClick={() => shareProduct('whatsapp')}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <FaWhatsapp className="text-green-500" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => shareProduct('twitter')}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaTwitter className="text-blue-400" />
                        <span>Twitter</span>
                      </button>
                      <button
                        onClick={() => shareProduct('facebook')}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaFacebook className="text-blue-600" />
                        <span>Facebook</span>
                      </button>
                      <button
                        onClick={() => shareProduct('copy')}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FaCopy />
                        <span>Copy Link</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-pink-100">
              <div className="text-center bg-gradient-to-b from-white to-pink-50 p-4 rounded-xl">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 flex items-center justify-center">
                    <FaTruck className="text-white text-xl" />
                  </div>
                </div>
                <div className="font-bold text-gray-800 mb-1">Free Shipping</div>
                <div className="text-sm text-gray-600">On orders over ₹1999</div>
              </div>
              
              <div className="text-center bg-gradient-to-b from-white to-purple-50 p-4 rounded-xl">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center">
                    <FaUndo className="text-white text-xl" />
                  </div>
                </div>
                <div className="font-bold text-gray-800 mb-1">Easy Returns</div>
                <div className="text-sm text-gray-600">7-day return policy</div>
              </div>
              
              <div className="text-center bg-gradient-to-b from-white to-blue-50 p-4 rounded-xl">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
                    <FaShieldAlt className="text-white text-xl" />
                  </div>
                </div>
                <div className="font-bold text-gray-800 mb-1">Secure Payment</div>
                <div className="text-sm text-gray-600">100% secure & safe</div>
              </div>
              
              <div className="text-center bg-gradient-to-b from-white to-yellow-50 p-4 rounded-xl">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                    <FaStar className="text-white text-xl" />
                  </div>
                </div>
                <div className="font-bold text-gray-800 mb-1">Quality Assured</div>
                <div className="text-sm text-gray-600">Premium products</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Reviews 💬</h2>
        </div>
        
        <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <div className="text-6xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {reviewStats.average.toFixed(1)}
              </div>
              <div className="flex justify-center md:justify-start text-yellow-400 mt-3 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-2xl ${i < Math.floor(reviewStats.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <div className="text-gray-600">
                Based on {reviewStats.count} reviews ✨
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              {userHasReviewed ? (
                <div>
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Your Review</h3>
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-xl ${i < (userReviewObj?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 max-w-md">{userReviewObj?.comment}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full font-bold text-sm"
                    >
                      Edit Review
                    </button>
                    <button
                      onClick={() => handleDeleteReview(userReviewObj?._id)}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please login to write a review')
                      navigate('/login', { state: { from: `/product/${id}` } })
                      return
                    }
                    setShowReviewForm(true)
                  }}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold"
                >
                  Write a Review 💖
                </button>
              )}
            </div>
          </div>
        </div>

        {showReviewForm && (
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-pink-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {userHasReviewed ? 'Edit Your Review' : 'Write a Review ✍️'}
            </h3>
            
            <div className="mb-6">
              <label className="block font-bold text-gray-700 mb-3">Rating:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserReview({ ...userReview, rating: star })}
                    className="text-3xl focus:outline-none transition-transform hover:scale-110"
                  >
                    <FaStar className={star <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'} />
                  </button>
                ))}
                <span className="ml-3 font-bold text-gray-800">
                  {userReview.rating} out of 5
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-bold text-gray-700 mb-3">Your Review:</label>
              <textarea
                value={userReview.comment}
                onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                placeholder="Share your experience with this product..."
                className="w-full h-40 p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none"
                maxLength="1000"
              />
              <div className="text-right text-sm text-gray-500 mt-2">
                {userReview.comment.length}/1000 characters
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowReviewForm(false)
                  setUserReview({ rating: 5, comment: '' })
                }}
                className="px-6 py-3 border-2 border-pink-300 text-pink-600 rounded-xl font-bold"
                disabled={submittingReview}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review._id} className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg mr-4">
                      {review.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{review.user?.name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                    {user && review.user?._id === user._id && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 bg-gradient-to-r from-pink-50 to-transparent p-4 rounded-xl">
                  {review.comment}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No reviews yet</h3>
              <p className="text-gray-600">Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all"
          >
            <FaTimes className="text-white text-2xl" />
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <button onClick={zoomOut} disabled={zoomLevel <= 1} className="bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50">
              <FaCompress className="text-white" />
            </button>
            <span className="text-white text-sm font-medium">{Math.round(zoomLevel * 10)}%</span>
            <button onClick={zoomIn} disabled={zoomLevel >= 3} className="bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50">
              <FaExpand className="text-white" />
            </button>
          </div>

          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
            {lightboxImage + 1} / {images.length}
          </div>

          <div 
            className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden"
            onMouseMove={handleMouseMove}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={(e) => {
              handleTouchMove(e)
              handleLightboxTouchMove(e)
            }}
            onTouchEnd={handleLightboxTouchEnd}
            style={{ touchAction: 'pan-y' }}
          >
            <div 
              className="relative transition-transform duration-200 ease-out"
              style={{
                transform: zoomLevel > 1 
                  ? `scale(${zoomLevel}) translate(${zoomPosition.x * 10 * (zoomLevel - 1)}%, ${zoomPosition.y * 10 * (zoomLevel - 1)}%)`
                  : 'scale(1)',
                maxWidth: '90vw',
                maxHeight: '80vh',
              }}
            >
              <img
                src={images[lightboxImage]?.url}
                alt={product.name}
                className="max-h-[80vh] max-w-[90vw] object-contain select-none"
                draggable={false}
              />
            </div>
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 px-4">
              <div className="inline-flex items-center gap-2 overflow-x-auto px-2 py-1 bg-black/30 rounded-full hide-scroll">
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setLightboxImage(index)
                      setZoomLevel(1)
                      setZoomPosition({ x: 0, y: 0 })
                    }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      lightboxImage === index 
                        ? 'border-pink-500 scale-105' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img src={image.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default ProductDetail
