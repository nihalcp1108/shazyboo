import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaStar, FaShoppingCart, FaFilter, FaSpinner, 
  FaHeart, FaRegHeart, FaEye, FaChevronLeft, FaChevronRight, 
  FaTags, FaBoxOpen, FaCrown, FaTimes, FaSort, FaTh, FaBars,
  FaFire, FaRocket, FaChartLine
} from 'react-icons/fa';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const MainCategoryProducts = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [sortBy, setSortBy] = useState('-createdAt');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [totalProducts, setTotalProducts] = useState(0);
    const [viewMode, setViewMode] = useState('grid');
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const { addToCart } = useCart();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const BASE_URL = API_URL.replace('/api', '');

    useEffect(() => {
        fetchCategoryData();
        window.scrollTo(0, 0);
    }, [slug, sortBy, priceRange, currentPage, selectedSubCategory]);

    const fetchCategoryData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/main-categories/${slug}`);
            const data = response.data.data;
            
            setCategory(data);
            setProducts(data.products || []);
            setTotalProducts(data.products?.length || 0);
            setSubCategories(data.subCategories || []);
            
            if (data.products?.length === 0) {
                toast.warning('No products found in this category yet');
            }
        } catch (error) {
            console.error('Error fetching main category:', error);
            toast.error(error.response?.data?.error || 'Failed to load category');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (image) => {
        if (!image) return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop';
        
        if (typeof image === 'string') {
            if (image.startsWith('http')) return image;
            if (image.startsWith('/uploads/')) {
                return `${BASE_URL}${image}`;
            }
            return image;
        }
        
        if (image && typeof image === 'object') {
            if (image.url) {
                if (image.url.startsWith('http')) return image.url;
                if (image.url.startsWith('/uploads/')) {
                    return `${BASE_URL}${image.url}`;
                }
                return image.url;
            }
            if (image.public_id) {
                return `${BASE_URL}/uploads/products/${image.public_id}`;
            }
        }
        
        return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop';
    };

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

    const filteredProducts = products.filter(product => {
        if (selectedSubCategory) {
            const matchSubCategory = product.subCategory === selectedSubCategory || 
                                    product.subCategory?._id === selectedSubCategory ||
                                    product.subCategory?.name === selectedSubCategory;
            if (!matchSubCategory) return false;
        }
        
        const finalPrice = product.discountPrice || product.price;
        if (priceRange.min && finalPrice < parseFloat(priceRange.min)) return false;
        if (priceRange.max && finalPrice > parseFloat(priceRange.max)) return false;
        
        return true;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const aPrice = a.discountPrice || a.price;
        const bPrice = b.discountPrice || b.price;
        const aRating = a.ratings?.average || 0;
        const bRating = b.ratings?.average || 0;
        const aSold = a.sold || 0;
        const bSold = b.sold || 0;
        
        switch (sortBy) {
            case '-createdAt':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case '-price':
                return bPrice - aPrice;
            case 'price':
                return aPrice - bPrice;
            case '-sold':
                return bSold - aSold;
            case '-ratings.average':
                return bRating - aRating;
            default:
                return 0;
        }
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSelectedSubCategory('');
        setPriceRange({ min: '', max: '' });
        setSortBy('-createdAt');
        setCurrentPage(1);
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
                    <Link to="/" className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors">
                        <FaArrowLeft /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-20">
            {/* Hero Banner */}
            <div className="relative h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute inset-0 bg-white/5"></div>
                </div>
                
                {/* Animated floating elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 animate-bounce">
                        <div className="text-4xl">{category.icon || '🎨'}</div>
                    </div>
                    <div className="absolute bottom-20 right-10 animate-bounce delay-100">
                        <div className="text-3xl">✨</div>
                    </div>
                    <div className="absolute top-40 right-20 animate-pulse">
                        <div className="text-2xl">⭐</div>
                    </div>
                </div>
                
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
                    <Link to="/" className="text-white/90 hover:text-white mb-4 inline-flex items-center gap-2 transition-colors w-fit">
                        <FaArrowLeft /> Back to Home
                    </Link>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-bold text-white mb-3"
                    >
                        {category.name}
                    </motion.h1>
                    {category.description && (
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-white text-lg opacity-90 max-w-2xl"
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
                        <span className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                            <FaBoxOpen className="inline mr-2" />
                            {totalProducts} Products
                        </span>
                        {category.featured && (
                            <span className="bg-yellow-400 text-yellow-900 rounded-full px-4 py-2 text-sm font-bold">
                                <FaCrown className="inline mr-2" />
                                Featured Category
                            </span>
                        )}
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <div className="lg:w-80 hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            {subCategories.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b pb-3">
                                        <FaFilter className="text-pink-500" />
                                        Sub Categories
                                    </h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        <button
                                            onClick={() => {
                                                setSelectedSubCategory('');
                                                setCurrentPage(1);
                                            }}
                                            className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                                                !selectedSubCategory 
                                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
                                                    : 'hover:bg-pink-50 text-gray-700'
                                            }`}
                                        >
                                            All Products
                                            <span className="float-right text-sm opacity-75">
                                                ({products.length})
                                            </span>
                                        </button>
                                        {subCategories.map(sub => (
                                            <button
                                                key={sub._id}
                                                onClick={() => {
                                                    setSelectedSubCategory(sub._id);
                                                    setCurrentPage(1);
                                                }}
                                                className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                                                    selectedSubCategory === sub._id 
                                                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
                                                        : 'hover:bg-pink-50 text-gray-700'
                                                }`}
                                            >
                                                {sub.icon && <span className="mr-2">{sub.icon}</span>}
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                            className="w-1/2 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max ₹"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                            className="w-1/2 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => fetchCategoryData()}
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
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                                >
                                    <option value="-createdAt">🆕 Newest First</option>
                                    <option value="-price">💰 Price: High to Low</option>
                                    <option value="price">💰 Price: Low to High</option>
                                    <option value="-sold">🔥 Best Selling</option>
                                    <option value="-ratings.average">⭐ Top Rated</option>
                                </select>
                            </div>

                            {(selectedSubCategory || priceRange.min || priceRange.max || sortBy !== '-createdAt') && (
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
                            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded-lg font-medium"
                        >
                            <FaFilter /> Filters & Sort
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                            >
                                <FaTh size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                            >
                                <FaBars size={18} />
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
                                    {subCategories.length > 0 && (
                                        <div>
                                            <h4 className="font-bold mb-3">Sub Categories</h4>
                                            <select
                                                value={selectedSubCategory}
                                                onChange={(e) => {
                                                    setSelectedSubCategory(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full px-4 py-2 border-2 rounded-xl"
                                            >
                                                <option value="">All Products</option>
                                                {subCategories.map(sub => (
                                                    <option key={sub._id} value={sub._id}>
                                                        {sub.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
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
                                            onChange={(e) => {
                                                setSortBy(e.target.value);
                                                setCurrentPage(1);
                                            }}
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
                                                fetchCategoryData();
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
                        <div className="hidden lg:flex bg-white rounded-2xl shadow-lg p-4 mb-6 justify-between items-center">
                            <p className="text-gray-600">
                                Showing <span className="font-bold text-pink-600">{currentProducts.length}</span> of{' '}
                                <span className="font-bold">{sortedProducts.length}</span> products
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

                        {sortedProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                                <div className="text-6xl mb-4">🎁</div>
                                <p className="text-gray-500 text-lg mb-4">No products found in this category</p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' : 'grid-cols-1 gap-6'}`}>
                                    {currentProducts.map((product, index) => {
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
                                                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer flex"
                                                    onClick={() => navigate(`/product/${product._id}`)}
                                                >
                                                    <div className="relative w-48 h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex-shrink-0">
                                                        <img
                                                            src={getImageUrl(product.images?.[0])}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                                                            onError={(e) => {
                                                                e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop';
                                                            }}
                                                        />
                                                        {discount > 0 && (
                                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                                -{discount}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 p-5">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="font-bold text-gray-800 text-lg line-clamp-2 group-hover:text-pink-600 transition-colors flex-1">
                                                                {product.name}
                                                            </h3>
                                                            <div className="text-right ml-4">
                                                                <span className="text-2xl font-bold text-pink-600">
                                                                    ₹{finalPrice.toFixed(2)}
                                                                </span>
                                                                {discount > 0 && (
                                                                    <div className="text-xs text-gray-400 line-through">
                                                                        ₹{originalPrice.toFixed(2)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="flex items-center gap-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <FaStar key={i} size={14} className={i < Math.floor(product.ratings?.average || 0) ? 'text-yellow-400' : 'text-gray-200'} />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                ({product.ratings?.count || 0} reviews)
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                            {product.description?.substring(0, 100)}...
                                                        </p>
                                                        <button
                                                            onClick={(e) => handleAddToCart(product, e)}
                                                            disabled={product.stock === 0}
                                                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                                                <div className={`relative h-64 overflow-hidden bg-gradient-to-br ${gradientClass}`}>
                                                    <img
                                                        src={getImageUrl(product.images?.[0])}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop';
                                                        }}
                                                    />
                                                    
                                                    {discount > 0 && (
                                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                                            -{discount}% OFF
                                                        </div>
                                                    )}
                                                    
                                                    {product.stock === 0 && (
                                                        <div className="absolute top-3 left-3 bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                                            Out of Stock
                                                        </div>
                                                    )}
                                                    
                                                    <div className="absolute top-3 right-3 flex flex-col gap-1">
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
                                                    
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                                                        <button
                                                            onClick={(e) => handleWishlist(product._id, e)}
                                                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                        >
                                                            {isInWishlist ? (
                                                                <FaHeart className="text-pink-500 text-xl" />
                                                            ) : (
                                                                <FaRegHeart className="text-gray-700 text-xl" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleQuickView(product, e)}
                                                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                        >
                                                            <FaEye className="text-gray-700 text-xl" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-5">
                                                    <div className="flex justify-between items-start gap-3 mb-2">
                                                        <h3 className="font-bold text-gray-800 text-base line-clamp-2 group-hover:text-pink-600 transition-colors flex-1">
                                                            {product.name}
                                                        </h3>
                                                        <div className="text-right flex-shrink-0">
                                                            <span className="text-xl font-bold text-pink-600">
                                                                ₹{finalPrice.toFixed(2)}
                                                            </span>
                                                            {discount > 0 && (
                                                                <div className="text-xs text-gray-400 line-through">
                                                                    ₹{originalPrice.toFixed(2)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="flex items-center gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar key={i} size={14} className={i < Math.floor(product.ratings?.average || 0) ? 'text-yellow-400' : 'text-gray-200'} />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            ({product.ratings?.count || 0} reviews)
                                                        </span>
                                                    </div>
                                                    
                                                    {product.stock > 0 && product.stock < 10 && (
                                                        <p className="text-xs text-orange-500 mb-3">
                                                            Only {product.stock} left in stock!
                                                        </p>
                                                    )}
                                                    
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

                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-12">
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 bg-white rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 transition-colors"
                                            >
                                                <FaChevronLeft />
                                            </button>
                                            {[...Array(totalPages)].map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => paginate(index + 1)}
                                                    className={`px-4 py-2 rounded-xl transition-all ${
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
                                                className="px-4 py-2 bg-white rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 transition-colors"
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
                                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
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
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{quickViewProduct.name}</h2>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} size={16} className={i < Math.floor(quickViewProduct.ratings?.average || 0) ? 'text-yellow-400' : 'text-gray-200'} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">({quickViewProduct.ratings?.count || 0} reviews)</span>
                                    </div>
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold text-pink-600">₹{(quickViewProduct.discountPrice || quickViewProduct.price).toFixed(2)}</span>
                                        {quickViewProduct.discountPrice && quickViewProduct.discountPrice < quickViewProduct.price && (
                                            <span className="text-sm text-gray-400 line-through ml-2">₹{quickViewProduct.price.toFixed(2)}</span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-6">{quickViewProduct.description?.substring(0, 200)}</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                handleAddToCart(quickViewProduct, { stopPropagation: () => {} });
                                                setQuickViewProduct(null);
                                            }}
                                            disabled={quickViewProduct.stock === 0}
                                            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <FaShoppingCart /> Add to Cart
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleWishlist(quickViewProduct._id, { stopPropagation: () => {} });
                                            }}
                                            className="w-12 h-12 bg-white border-2 border-pink-200 rounded-xl flex items-center justify-center hover:bg-pink-50 transition-colors"
                                        >
                                            {wishlist.includes(quickViewProduct._id) ? <FaHeart className="text-pink-500 text-xl" /> : <FaRegHeart className="text-pink-500 text-xl" />}
                                        </button>
                                    </div>
                                    <Link
                                        to={`/product/${quickViewProduct._id}`}
                                        className="block text-center mt-4 text-pink-600 hover:text-pink-700 font-medium"
                                        onClick={() => setQuickViewProduct(null)}
                                    >
                                        View Full Details →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MainCategoryProducts;