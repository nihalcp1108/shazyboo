import { useState, useEffect } from 'react';
import { useDailyShuffle } from '../utils/shuffle';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaStar, FaShoppingCart, FaFilter, FaSpinner, 
  FaHeart, FaRegHeart, FaEye, FaChevronLeft, FaChevronRight, 
  FaTags, FaBoxOpen, FaTimes, FaSort, FaTh, FaBars,
  FaFire, FaRocket, FaChartLine
} from 'react-icons/fa';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../Context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const CategoryProductsPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('-createdAt');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [viewMode, setViewMode] = useState('grid');
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const shuffledProducts = useDailyShuffle(products);
    const { addToCart } = useCart();

    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const BASE_URL = API_URL.replace('/api', '');

    useEffect(() => {
        fetchCategoryAndProducts();
        window.scrollTo(0, 0);
    }, [slug, sortBy, priceRange, currentPage]);

    const fetchCategoryAndProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 20,
                sort: sortBy,
                ...(priceRange.min && { minPrice: priceRange.min }),
                ...(priceRange.max && { maxPrice: priceRange.max })
            };
            
            const response = await api.get(`/categories/${slug}/products`, { params });
            const data = response.data;
            
            setCategory(data.category);
            setProducts(data.data || []);
            setTotalPages(data.pagination?.pages || 1);
            setTotalProducts(data.pagination?.total || 0);
        } catch (error) {
            console.error('Error fetching category products:', error);
            toast.error('Failed to load category products');
        } finally {
            setLoading(false);
        }
    };

    // Using getImageUrl from imageUtils

    const handleAddToCart = async (product, e) => {
        e.stopPropagation();
        if (product.stock === 0) {
            toast.error('Product is out of stock');
            return;
        }
        try {
            await addToCart(product, 1);
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Could not add to cart');
        }
    };

    const handleWishlist = (productId, e) => {
        e.stopPropagation();
        if (wishlist.includes(productId)) {
            setWishlist(wishlist.filter(id => id !== productId));
            toast.success('Removed from wishlist');
        } else {
            setWishlist([...wishlist, productId]);
            toast.success('Added to wishlist');
        }
    };

    const handleQuickView = (product, e) => {
        e.stopPropagation();
        setQuickViewProduct(product);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setPriceRange({ min: '', max: '' });
        setSortBy('-createdAt');
        setCurrentPage(1);
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getRandomGradient = (index) => {
        const gradients = [
            'from-pink-100 to-rose-100',
            'from-purple-100 to-violet-100',
            'from-blue-100 to-cyan-100',
            'from-emerald-100 to-teal-100',
            'from-yellow-100 to-orange-100',
            'from-fuchsia-100 to-pink-100',
            'from-indigo-100 to-purple-100',
            'from-red-100 to-pink-100'
        ];
        return gradients[index % gradients.length];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                <div className="text-center">
                    <FaSpinner className="animate-spin h-16 w-16 text-pink-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading amazing products...</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Category not found</h2>
                    <p className="text-gray-600 mb-4">The category you're looking for doesn't exist.</p>
                    <Link to="/categories" className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors">
                        <FaArrowLeft /> Back to Categories
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            {/* Hero Banner */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute inset-0 bg-white/5"></div>
                </div>
                
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
                    <Link to="/categories" className="text-white/90 hover:text-white mb-4 inline-flex items-center gap-2 transition-colors w-fit text-sm md:text-base">
                        <FaArrowLeft /> Back to Categories
                    </Link>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3"
                    >
                        {category.name}
                    </motion.h1>
                    {category.description && (
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-white text-base md:text-lg opacity-90 max-w-2xl"
                        >
                            {category.description}
                        </motion.p>
                    )}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 mt-4"
                    >
                        <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-2 text-white text-xs md:text-sm">
                            <FaBoxOpen className="inline mr-1 md:mr-2" />
                            {totalProducts} Products
                        </span>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <div className="lg:w-80 hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b pb-3">
                                    <FaTags className="text-pink-500" />
                                    Price Range
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            placeholder="Min ₹"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                            className="w-1/2 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-all"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max ₹"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                            className="w-1/2 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => fetchCategoryAndProducts()}
                                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                                    >
                                        Apply Filter
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b pb-3">
                                    <FaSort className="text-pink-500" />
                                    Sort By
                                </h3>
                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-all"
                                >
                                    <option value="-createdAt">🆕 Newest First</option>
                                    <option value="-price">💰 Price: High to Low</option>
                                    <option value="price">💰 Price: Low to High</option>
                                    <option value="-sold">🔥 Best Selling</option>
                                    <option value="-ratings.average">⭐ Top Rated</option>
                                </select>
                            </div>

                            {(priceRange.min || priceRange.max || sortBy !== '-createdAt') && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaTimes size={14} /> Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Filter Button */}
                    <div className="lg:hidden sticky top-20 z-20 bg-white rounded-xl shadow-lg p-3 flex justify-between items-center">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium text-sm"
                        >
                            <FaFilter /> Filters & Sort
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                            >
                                <FaTh size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                            >
                                <FaBars size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Filters Drawer */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="lg:hidden fixed inset-x-0 top-0 z-50 bg-white rounded-b-2xl shadow-2xl p-6 mx-4 mt-16"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-xl">Filters</h3>
                                    <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-bold mb-3">Price Range</h4>
                                        <div className="flex gap-3">
                                            <input
                                                type="number"
                                                placeholder="Min ₹"
                                                value={priceRange.min}
                                                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                                className="w-1/2 px-4 py-2 border-2 rounded-xl"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max ₹"
                                                value={priceRange.max}
                                                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                                className="w-1/2 px-4 py-2 border-2 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-3">Sort By</h4>
                                        <select
                                            value={sortBy}
                                            onChange={handleSortChange}
                                            className="w-full px-4 py-2 border-2 rounded-xl"
                                        >
                                            <option value="-createdAt">Newest First</option>
                                            <option value="-price">Price: High to Low</option>
                                            <option value="price">Price: Low to High</option>
                                            <option value="-sold">Best Selling</option>
                                            <option value="-ratings.average">Top Rated</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                fetchCategoryAndProducts();
                                                setShowFilters(false);
                                            }}
                                            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-xl"
                                        >
                                            Apply
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {/* Results Info & View Toggle Desktop */}
                        <div className="hidden lg:flex bg-white rounded-2xl shadow-lg p-4 mb-6 justify-between items-center">
                            <p className="text-gray-600 text-sm">
                                Showing <span className="font-bold text-pink-600">{products.length}</span> of{' '}
                                <span className="font-bold">{totalProducts}</span> products
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <FaTh size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <FaBars size={18} />
                                </button>
                            </div>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                                <div className="text-6xl mb-4">🎁</div>
                                <p className="text-gray-500 text-lg mb-4">No products found in this category</p>
                                <button
                                    onClick={clearFilters}
                                    className="text-pink-500 hover:text-pink-600 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' : 'grid-cols-1 gap-4'}`}>
                                    {shuffledProducts.map((product, index) => {
                                        const discount = product.discountPrice > 0 && product.discountPrice < product.price
                                            ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
                                        const isInWishlist = wishlist.includes(product._id);
                                        const finalPrice = product.discountPrice || product.price;
                                        const originalPrice = product.price;
                                        const gradientClass = getRandomGradient(index);
                                        
                                        if (viewMode === 'list') {
                                            return (
                                                <motion.div
                                                    key={product._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col"
                                                    onClick={() => navigate(`/product/${product._id}`)}
                                                >
                                                    <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden bg-gray-100">
                                                        <img
                                                            src={getImageUrl(product.images?.[0])}
                                                            alt={product.name}
                                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                            onError={(e) => {
                                                                e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop';
                                                            }}
                                                        />
                                                        {discount > 0 && (
                                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                                -{discount}%
                                                            </div>
                                                        )}
                                                        {product.isTrending && (
                                                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                                <FaFire size={10} /> Hot
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                                                <h3 className="font-bold text-gray-800 text-base md:text-lg line-clamp-2 group-hover:text-pink-600 transition-colors">
                                                                    {product.name}
                                                                </h3>
                                                                <div className="text-left sm:text-right">
                                                                    <span className="text-xl md:text-2xl font-bold text-pink-600">
                                                                        ₹{finalPrice.toFixed(2)}
                                                                    </span>
                                                                    {discount > 0 && (
                                                                        <div className="text-xs text-gray-400 line-through">
                                                                            ₹{originalPrice.toFixed(2)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                                {product.description?.substring(0, 100)}...
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleAddToCart(product, e)}
                                                            disabled={product.stock === 0}
                                                            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full"
                                                        >
                                                            <FaShoppingCart /> Add to Cart
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        }
                                        
                                        return (
                                            <motion.div
                                                key={product._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                                onClick={() => navigate(`/product/${product._id}`)}
                                            >
                                                {/* Product Image - Full Card */}
                                                <div className={`relative h-56 md:h-64 overflow-hidden bg-gradient-to-br ${gradientClass}`}>
                                                    <img
                                                        src={getImageUrl(product.images?.[0])}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop';
                                                        }}
                                                    />
                                                    
                                                    {/* Discount Badge */}
                                                    {discount > 0 && (
                                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg">
                                                            -{discount}% OFF
                                                        </div>
                                                    )}
                                                    
                                                    {/* Stock Badge */}
                                                    {product.stock === 0 && (
                                                        <div className="absolute top-3 left-3 bg-gray-800 text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full">
                                                            Out of Stock
                                                        </div>
                                                    )}
                                                    
                                                    {/* Trending/Best Seller Badges */}
                                                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                        {product.isTrending && (
                                                            <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                                                                <FaFire size={10} /> Trending
                                                            </div>
                                                        )}
                                                        {product.isNewArrival && (
                                                            <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                                                                <FaRocket size={10} /> New
                                                            </div>
                                                        )}
                                                        {product.isBestSeller && (
                                                            <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                                                                <FaChartLine size={10} /> Bestseller
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Action Buttons - On Hover */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                                                        <button
                                                            onClick={(e) => handleWishlist(product._id, e)}
                                                            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                        >
                                                            {isInWishlist ? (
                                                                <FaHeart className="text-pink-500 text-lg md:text-xl" />
                                                            ) : (
                                                                <FaRegHeart className="text-gray-700 text-lg md:text-xl" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleQuickView(product, e)}
                                                            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                        >
                                                            <FaEye className="text-gray-700 text-lg md:text-xl" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Product Info */}
                                                <div className="p-4 md:p-5">
                                                    {/* Product Name and Price Row */}
                                                    <div className="flex justify-between items-start gap-2 md:gap-3 mb-2">
                                                        <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 group-hover:text-pink-600 transition-colors flex-1">
                                                            {product.name}
                                                        </h3>
                                                        <div className="text-right flex-shrink-0">
                                                            <span className="text-base md:text-xl font-bold text-pink-600">
                                                                ₹{finalPrice.toFixed(2)}
                                                            </span>
                                                            {discount > 0 && (
                                                                <div className="text-xs text-gray-400 line-through">
                                                                    ₹{originalPrice.toFixed(2)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    
                                                    {/* Add to Cart Button */}
                                                    <button
                                                        onClick={(e) => handleAddToCart(product, e)}
                                                        disabled={product.stock === 0}
                                                        className={`w-full py-2 md:py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-base ${
                                                            product.stock === 0
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                                                        }`}
                                                    >
                                                        <FaShoppingCart className="text-[10px] md:text-sm" />
                                                        {product.stock === 0 ? 'Out' : 'Add to Cart'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-12">
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 md:px-4 md:py-2 bg-white rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 transition-colors"
                                            >
                                                <FaChevronLeft />
                                            </button>
                                            {[...Array(totalPages)].map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => paginate(index + 1)}
                                                    className={`px-3 py-1 md:px-4 md:py-2 rounded-xl transition-all text-sm md:text-base ${
                                                        currentPage === index + 1
                                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                                                            : 'bg-white hover:bg-pink-50'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 md:px-4 md:py-2 bg-white rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 transition-colors"
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            {quickViewProduct && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setQuickViewProduct(null)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative">
                            <button
                                onClick={() => setQuickViewProduct(null)}
                                className="absolute top-4 right-4 z-10 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                                <FaTimes />
                            </button>
                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-8">
                                    <img
                                        src={getImageUrl(quickViewProduct.images?.[0])}
                                        alt={quickViewProduct.name}
                                        className="w-full h-64 object-contain"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{quickViewProduct.name}</h2>
                                   
                                    <div className="mb-4">
                                        <span className="text-2xl md:text-3xl font-bold text-pink-600">₹{(quickViewProduct.discountPrice || quickViewProduct.price).toFixed(2)}</span>
                                        {quickViewProduct.discountPrice && quickViewProduct.discountPrice < quickViewProduct.price && (
                                            <span className="text-sm text-gray-400 line-through ml-2">₹{quickViewProduct.price.toFixed(2)}</span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-6 text-sm md:text-base">{quickViewProduct.description?.substring(0, 200)}</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                handleAddToCart(quickViewProduct, { stopPropagation: () => {} });
                                                setQuickViewProduct(null);
                                            }}
                                            disabled={quickViewProduct.stock === 0}
                                            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 md:py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
                                        >
                                            <FaShoppingCart /> Add to Cart
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleWishlist(quickViewProduct._id, { stopPropagation: () => {} });
                                            }}
                                            className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-pink-200 rounded-xl flex items-center justify-center hover:bg-pink-50 transition-colors"
                                        >
                                            {wishlist.includes(quickViewProduct._id) ? <FaHeart className="text-pink-500 text-lg md:text-xl" /> : <FaRegHeart className="text-pink-500 text-lg md:text-xl" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CategoryProductsPage;
