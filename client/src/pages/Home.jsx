import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaStar,
  FaHeart,
  FaCrown,
  FaRegHeart,
  FaShoppingCart,
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
  FaChevronRight,
  FaChevronLeft,
  FaFire,
  FaTag,
  FaBoxOpen
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';
import { useWishlist } from '../Context/WishlistContext';
import { getImageUrl, handleImageError, getFallbackImage } from '../utils/imageUtils';
import { Helmet } from 'react-helmet-async';
import { getHomeMeta } from '../utils/seoHelpers';

import hero1 from '../assets/hero(1).jpeg';
import hero2 from '../assets/hero(2).jpeg';
import hero3 from '../assets/hero(3).jpeg';
import hero4 from '../assets/hero(4).jpeg';
import hero5 from '../assets/hero(5).jpeg';
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

    :root {
      --kiddex-yellow: #FFD84D;
      --kiddex-pink:   #FF6B8A;
      --kiddex-green:  #4BC98A;
      --kiddex-blue:   #4BA3E8;
      --kiddex-orange: #FF8C42;
      --kiddex-purple: #9B6BFF;
      --kiddex-red:    #FF4F6E;
      --kiddex-bg:     #FFF9F0;
    }

    body { font-family: 'Nunito', sans-serif; background: var(--kiddex-bg); }
    .fredoka { font-family: 'Fredoka One', cursive; }
    .hide-scroll::-webkit-scrollbar { display: none; }
    .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes floatStar {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
  `}</style>
);

const Star = ({ size = 20, color = '#FFD84D', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);


// Hero Section
const HeroSection = () => {
  const backgroundImages = [hero1, hero2, hero3, hero4, hero5];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentBg = backgroundImages[bgIndex];

  return (
    <section className="relative overflow-hidden pt-0 sm:pt-2 md:pt-14 pb-5 min-h-[36vh] sm:min-h-[42vh] md:min-h-[72vh]" style={{
      background: 'linear-gradient(135deg, rgba(239,99,164,0.18) 0%, rgba(245,133,185,0.16) 35%, rgba(228,241,246,0.14) 100%)',
      marginTop: '0'
    }}>
      <FontStyle />
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBg}
            src={currentBg}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-60"
            initial={{ opacity: 0.25, scale: 1.06 }}
            animate={{ opacity: 0.6, scale: 1.02 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-pink-100/20" />
      </div>
      <div className="absolute inset-0 pointer-events-none select-none">
        <Star size={24} color="#FFD84D" style={{ position: 'absolute', top: 90, left: '6%', animation: 'floatStar 3s ease-in-out infinite' }} />
        <Star size={14} color="#FF6B8A" style={{ position: 'absolute', top: 140, left: '20%', animation: 'floatStar 2.5s ease-in-out infinite 0.5s' }} />
        <Star size={18} color="#4BC98A" style={{ position: 'absolute', top: 110, right: '15%', animation: 'floatStar 3.5s ease-in-out infinite 0.3s' }} />
        <Star size={18} color="#644bc9" style={{ position: 'absolute', top: 190, right: '22%', animation: 'floatStar 3.5s ease-in-out infinite 0.3s' }} />
        <div className="absolute -left-16 top-12 w-48 h-48 rounded-full bg-pink-300/30 blur-3xl" />
        <div className="absolute right-8 top-24 w-72 h-72 rounded-full bg-pink-200/20 blur-3xl" />
      </div>
      <div className="container mx-auto px-4 md:px-10 py-4 relative z-10 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="max-w-3xl text-center flex flex-col items-center justify-center pt-10 md:pt-16 pb-8 md:pb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              <h1 className="fredoka text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight">
                Cute things <span className="text-pink-500">for a happy day</span>
              </h1>
              <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                Kawaii stationery, cute bags, and sweet gifts made to brighten every moment.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
              className="flex gap-4 justify-center md:justify-start flex-wrap"
            >
              <Link to="/shop" className="fredoka text-sm sm:text-base text-white px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ background: '#FF6B8A' }}>
                Shop Now →
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
          <path d="M0,30 C180,60 360,0 540,30 C720,60 900,0 1080,30 C1260,60 1350,20 1440,30 L1440,60 L0,60 Z"
            fill="var(--kiddex-bg)" />
        </svg>
      </div>
    </section>
  );
};

// Main Categories Section as Cards
const MainCategoriesSection = ({ categories, loading, navigate }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-4 bg-gray-200 rounded mt-2 w-3/4" />
            <div className="h-3 bg-gray-200 rounded mt-1 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  const gradients = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-violet-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-fuchsia-500 to-pink-500',
    'from-indigo-500 to-purple-500',
    'from-red-500 to-pink-500'
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <motion.div
          key={category._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="group cursor-pointer"
          onClick={() => navigate(`/main-category/${category.slug || category._id}`)}
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            {/* Image Container */}
            <div className={`relative h-48 bg-gradient-to-br ${gradients[index % gradients.length]} overflow-hidden`}>
              {category.image ? (
                <img
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">
                  {category.icon || '🎨'}
                </div>
              )}

              {/* Featured Badge */}
              {category.featured && (
                <div className="absolute top-3 right-3 bg-yellow-400 rounded-full px-2 py-1 flex items-center gap-1 shadow-lg">
                  <FaStar size={12} className="text-yellow-800" />
                  <span className="text-xs font-bold text-yellow-800">Featured</span>
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Product Count */}
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-xs font-medium flex items-center gap-1">
                  <FaBoxOpen size={10} />
                  {category.productCount || 0} Products
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-pink-600 transition-colors line-clamp-1">
                  {category.name}
                </h3>
                <span className="text-2xl">{category.icon || '🎨'}</span>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {category.subCategories && category.subCategories.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {category.subCategories.length} Subcategories
                    </span>
                  )}
                </div>
                <button
                  className="text-pink-500 group-hover:text-pink-600 font-medium text-sm flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/main-category/${category.slug || category._id}`);
                  }}
                >
                  Explore <FaArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Category Circles (Popular Categories) - ENHANCED VERSION
const CategoryCircles = ({ categories, loading }) => {
  const displayCats = categories;

  // Enhanced color palette for rings
  const ringColors = [
    'ring-pink-500', 'ring-purple-500', 'ring-green-500', 'ring-blue-500',
    'ring-orange-500'
  ];

  // Enhanced background gradients for circles
  const circleGradients = [
    'from-pink-200 to-pink-100',
    'from-purple-200 to-purple-100',
    'from-green-200 to-green-100',
    'from-blue-200 to-blue-100',
    'from-orange-200 to-orange-100'
  ];

  // Fallback emojis
  const categoryEmojis = ['🧸', '🎮', '📚', '🎨', '🚂'];

  if (loading) return (
    <div className="overflow-x-auto hide-scroll px-4 py-2">
      <div className="flex gap-4 w-max">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex-shrink-0 w-28 flex flex-col items-center gap-3 p-3 rounded-3xl bg-white shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-gray-100" />
            <div className="w-20 h-4 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );

  if (!displayCats.length) return (
    <div className="text-center py-6 text-gray-400 font-bold text-lg">No categories found.</div>
  );

  return (
    <div className="overflow-x-auto hide-scroll px-4 py-2">
      <div className="flex gap-4 min-w-max justify-start flex-nowrap">
        {displayCats.map((cat, i) => (
          <CategoryCircleItem
            key={cat._id || i}
            cat={cat}
            i={i}
            ringColors={ringColors}
            circleGradients={circleGradients}
            categoryEmojis={categoryEmojis}
          />
        ))}
      </div>
    </div>
  );
};

// Single category circle item (shared between scroll and grid)
const CategoryCircleItem = ({ cat, i, ringColors, circleGradients, categoryEmojis }) => {
  const imageUrl = cat.image ? getImageUrl(cat.image) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: i * 0.07 }}
      className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
    >
      <Link to={`/categories/${cat.slug || cat._id}`} className="flex flex-col items-center gap-2">
        <div className="relative">
          <div className={`relative w-24 h-24 rounded-full border-4 ${ringColors[i % ringColors.length]} overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${circleGradients[i % circleGradients.length]} flex items-center justify-center text-4xl`}> 
                {cat.icon || categoryEmojis[i % categoryEmojis.length]}
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <FaArrowRight className="text-white text-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
          </div>
        </div>

      <div className="text-center w-24">
        <span className="fredoka text-sm font-bold text-gray-700 group-hover:text-pink-600 transition-colors duration-300 line-clamp-2 leading-tight">
          {cat.name}
        </span>
        {cat.productCount !== undefined && (
          <p className="text-xs text-gray-400 mt-0.5">{cat.productCount} items</p>
        )}
      </div>
    </Link>
  </motion.div>
  );
};

const ProductCard = ({ product, index, onAddToCart, navigate }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  
  const liked = isInWishlist(product._id);

  const discount = product.discountPrice > 0 && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const cardColors = ['#FFE4EE', '#E4F4FF', '#E8FFE8', '#FFF4E0', '#F0E4FF', '#FFFAD6'];
  const bg = cardColors[index % cardColors.length];

  const handleAddToCartClick = async (e) => {
    e.stopPropagation();
    setIsAdding(true);
    try {
      await onAddToCart(product, e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="relative bg-white rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden cursor-pointer select-none transition-transform hover:-translate-y-1 hover:shadow-xl flex flex-col w-full max-w-[300px] mx-auto"
      style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="relative flex items-center justify-center overflow-hidden flex-shrink-0 h-[125px] sm:h-[145px] md:h-[165px]" style={{ background: bg }}>
        <img
          src={getImageUrl(product.images?.[0] || product.image)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          onError={handleImageError}
        />

        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-transform hover:scale-110 z-20"
          style={{ background: liked ? 'var(--kiddex-pink)' : 'rgba(255,255,255,0.85)' }}
          onClick={e => { 
            e.preventDefault();
            e.stopPropagation(); 
            toggleWishlist(product); 
          }}
        >
          {liked ? <FaHeart size={14} color="#fff" /> : <FaRegHeart size={14} color="var(--kiddex-pink)" />}
        </button>
      </div>

      <div className="px-3 pt-3 pb-4 flex flex-col flex-grow gap-2">
        <div className="min-h-[28px] w-full">
          <h3 className="font-black text-gray-800 text-sm leading-tight line-clamp-2 overflow-hidden break-words whitespace-normal w-full mb-0">
            {product.name}
          </h3>
        </div>

        <div className="mb-0">
          <span className="fredoka text-base" style={{ color: 'var(--kiddex-pink)' }}>
            ₹{(product.discountPrice > 0 ? product.discountPrice : product.price)?.toFixed(2)}
          </span>
          {product.discountPrice > 0 && product.discountPrice < product.price && (
            <span className="text-[11px] text-gray-400 line-through ml-1">
              ₹{product.price?.toFixed(2)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-1">
          <div className="text-xs text-gray-500 self-end">
            {discount > 0 ? `-${discount}% off` : product.stock > 0 ? 'In stock' : 'Sold out'}
          </div>
          <button
            onClick={handleAddToCartClick}
            disabled={isAdding || product.stock === 0}
            className="inline-flex h-7 w-7 items-center justify-center rounded-[16px] text-pink-500 bg-white/95 shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-500 border-t-transparent"></div>
            ) : (
              <FaShoppingCart size={16} color="currentColor" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Product Carousel
const ProductCarousel = ({ products, loading, onAddToCart, navigate }) => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="overflow-x-auto hide-scroll pb-4 px-3">
      <div className="flex gap-3 md:gap-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 min-w-[40vw] sm:min-w-[38vw] md:min-w-[240px] animate-pulse">
            <div className="rounded-3xl bg-gray-100 h-48 sm:h-64 mb-3" />
            <div className="h-3 bg-gray-100 rounded-full mb-2" />
            <div className="h-3 bg-gray-100 rounded-full w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );

  if (!products.length) return (
    <div className="text-center py-10 text-gray-400 font-bold fredoka text-xl">No products found.</div>
  );

  return (
    <div className="relative">
      <button onClick={() => scroll(-1)}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full shadow-xl items-center justify-center transition-transform hover:scale-110"
        style={{ background: '#fff' }}>
        <FaChevronLeft style={{ color: 'var(--kiddex-pink)' }} />
      </button>
      <div ref={scrollRef} className="flex overflow-x-auto hide-scroll gap-3 sm:gap-4 pb-4 px-3 scroll-smooth snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
        {products.map((p, i) => (
          <div key={p._id || i} className="flex-shrink-0 w-[40vw] sm:w-[38vw] md:w-[240px] h-auto snap-start" style={{ scrollSnapAlign: 'start' }}>
            <ProductCard product={p} index={i} onAddToCart={onAddToCart} navigate={navigate} />
          </div>
        ))}
      </div>
      <button onClick={() => scroll(1)}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full shadow-xl items-center justify-center transition-transform hover:scale-110"
        style={{ background: '#fff' }}>
        <FaChevronRight style={{ color: 'var(--kiddex-pink)' }} />
      </button>
    </div>
  );
};

// Features Row
const features = [
  { icon: <FaShippingFast />, title: 'Free Shipping', desc: 'On orders over ₹1999', color: '#4BA3E8', bg: '#E4F0FF' },
  { icon: <MdVerified />, title: 'Premium Quality', desc: 'Best quality products', color: '#9B6BFF', bg: '#F0E4FF' },
  { icon: <FaBoxOpen />, title: 'Cute Packaging', desc: 'Packed with love', color: '#FF8C42', bg: '#FFF0E4' },
  { icon: <FaShieldAlt />, title: 'Secure Payment', desc: '100% safe checkout', color: '#4BC98A', bg: '#E4FFF0' },
];

const FeaturesRow = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    {features.map((f, i) => (
      <motion.div key={i}
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
        className="flex flex-col items-center text-center gap-2 rounded-2xl px-3 md:px-5 py-3 md:py-4"
        style={{ background: f.bg }}>
        <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl flex-shrink-0"
          style={{ background: f.color, color: '#fff' }}>
          {f.icon}
        </div>
        <div>
          <p className="fredoka text-sm md:text-base leading-tight" style={{ color: '#2D2D2D' }}>{f.title}</p>
          <p className="text-xs font-bold text-gray-500">{f.desc}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

// Main Home Component
const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);

  const INITIAL_SECONDS = 2 * 3600 + 45 * 60 + 30; // 02:45:30
  const REPEAT_SECONDS = 24 * 3600; // 24 hours

  const [timeLeft, setTimeLeft] = useState(() => {
    const storedDeadline = localStorage.getItem('flashSaleDeadline');
    const now = Date.now();
    if (storedDeadline) {
      let deadline = parseInt(storedDeadline, 10);
      if (isNaN(deadline)) {
        deadline = now + INITIAL_SECONDS * 1000;
        localStorage.setItem('flashSaleDeadline', deadline.toString());
      }
      if (now >= deadline) {
        const elapsed = now - deadline;
        const cycles = Math.floor(elapsed / (REPEAT_SECONDS * 1000)) + 1;
        deadline = deadline + cycles * REPEAT_SECONDS * 1000;
        localStorage.setItem('flashSaleDeadline', deadline.toString());
      }
      return Math.max(0, Math.round((deadline - now) / 1000));
    } else {
      const deadline = now + INITIAL_SECONDS * 1000;
      localStorage.setItem('flashSaleDeadline', deadline.toString());
      return INITIAL_SECONDS;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const storedDeadline = localStorage.getItem('flashSaleDeadline');
      let deadline = storedDeadline ? parseInt(storedDeadline, 10) : now + INITIAL_SECONDS * 1000;
      
      if (isNaN(deadline)) {
        deadline = now + INITIAL_SECONDS * 1000;
        localStorage.setItem('flashSaleDeadline', deadline.toString());
      }

      if (now >= deadline) {
        const elapsed = now - deadline;
        const cycles = Math.floor(elapsed / (REPEAT_SECONDS * 1000)) + 1;
        const newDeadline = deadline + cycles * REPEAT_SECONDS * 1000;
        localStorage.setItem('flashSaleDeadline', newDeadline.toString());
        setTimeLeft(Math.max(0, Math.round((newDeadline - now) / 1000)));
      } else {
        setTimeLeft(Math.max(0, Math.round((deadline - now) / 1000)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hrs.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  const [loading, setLoading] = useState({
    trending: true,
    categories: true,
    newArrivals: true,
    bestSellers: true,
    featured: true,
    mainCategories: true
  });

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomeData();
    fetchMainCategories();
  }, []);

  const fetchMainCategories = async () => {
    try {
      const response = await api.get('/main-categories/active');
      setMainCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching main categories:', error);
    } finally {
      setLoading(prev => ({ ...prev, mainCategories: false }));
    }
  };

  const fetchHomeData = async () => {
    try {
      setLoading({ trending: true, categories: true, newArrivals: true, bestSellers: true, featured: true, mainCategories: true });

      const [trendRes, catRes, newRes, bestRes, featRes] = await Promise.allSettled([
        api.get('/products?trending=true&isActive=true&limit=10'),
        api.get('/categories?isActive=true&limit=8'),
        api.get('/products?newArrival=true&isActive=true&limit=10'),
        api.get('/products?bestSeller=true&isActive=true&limit=8'),
        api.get('/products?featured=true&isActive=true&limit=10'),
      ]);

      const extractProducts = (res) => {
        if (res.status !== 'fulfilled') {
          console.warn('Request failed:', res.reason);
          return [];
        }
        const responseData = res.value?.data;
        if (!responseData) return [];

        // The API returns { success: true, data: [...] }
        if (responseData.success && Array.isArray(responseData.data)) {
          return responseData.data;
        }

        // Fallbacks for different response formats
        if (Array.isArray(responseData)) return responseData;
        if (Array.isArray(responseData.products)) return responseData.products;
        if (Array.isArray(responseData.results)) return responseData.results;

        return [];
      };

      const extractCategories = (res) => {
        if (res.status !== 'fulfilled') return [];
        const data = res.value?.data;
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.categories)) return data.categories;
        return [];
      };

      setTrendingProducts(extractProducts(trendRes));
      setCategories(extractCategories(catRes));
      setNewArrivals(extractProducts(newRes));
      setBestSellers(extractProducts(bestRes));
      setFeaturedProducts(extractProducts(featRes));

    } catch (err) {
      console.error('Home data fetch error:', err);
      toast.error('Some sections failed to load.');
    } finally {
      setLoading({ trending: false, categories: false, newArrivals: false, bestSellers: false, featured: false, mainCategories: false });
    }
  };

  const { title, description } = getHomeMeta();
  
  const handleAddToCart = async (product, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      const result = await addToCart(product, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Could not add to cart');
    }
  };

 return (
    <div className="pb-24 lg:pb-0" style={{ fontFamily: "'Nunito', sans-serif", background: 'var(--kiddex-bg)', minHeight: '100vh' }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <FontStyle />

      <HeroSection />

      {/* Popular Categories Section - TOP MOVED */}
      <section className="py-6 sm:py-8 container mx-auto">
        <div className="px-4 mb-6 text-center">
          <h2 className="fredoka text-3xl md:text-4xl text-gray-800 mb-2">
            Popular <span className="text-purple-500">Categories</span>
          </h2>
          <p className="text-gray-500 font-bold">Explore our most-loved collections</p>
        </div>
        <CategoryCircles categories={categories} loading={loading.categories} />
      </section>

      {/* Main Categories Section - SECOND (as cards) */}
      <section className="py-8 container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="fredoka text-2xl md:text-3xl lg:text-4xl text-gray-800">
            Shop by <span className="text-pink-500">Main Category</span>
          </h2>
          <p className="text-gray-600 mt-2">Explore our curated collections</p>
        </div>
        <MainCategoriesSection
          categories={mainCategories}
          loading={loading.mainCategories}
          navigate={navigate}
        />
      </section>

      {/* Featured Products Section */}
      <section className="py-10" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fae8ff 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="mb-2 text-center">
          </div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FaCrown size={22} color="var(--kiddex-yellow)" />
              <h2 className="fredoka text-2xl md:text-3xl lg:text-4xl" style={{ color: '#2D2D2D' }}>
                Featured <span style={{ color: 'var(--kiddex-yellow)' }}>Products</span>
              </h2>
            </div>
            <Link to="/shop" className="text-sm font-black flex items-center gap-1 hover:underline" style={{ color: 'var(--kiddex-yellow)' }}>
              See all <FaArrowRight size={12} />
            </Link>
          </div>
          <ProductCarousel products={featuredProducts} loading={loading.featured} onAddToCart={handleAddToCart} navigate={navigate} />
        </div>
      </section>

      <section className="py-10" style={{ background: '#fff' }}>
        <div className="container mx-auto px-4">
          <div className="mb-2 text-center">
          </div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Star size={22} color="#FFD84D" />
              <h2 className="fredoka text-2xl md:text-3xl lg:text-4xl" style={{ color: '#2D2D2D' }}>
                Popular Picks
              </h2>
            </div>
            <Link to="/shop" className="text-sm font-black flex items-center gap-1 hover:underline" style={{ color: 'var(--kiddex-blue)' }}>
              View all <FaArrowRight size={12} />
            </Link>
          </div>
          <ProductCarousel products={trendingProducts} loading={loading.trending} onAddToCart={handleAddToCart} navigate={navigate} />
        </div>
      </section>

      <section className="py-10" style={{ background: 'linear-gradient(135deg, #ef63a4 0%, #f585b9 0%, #e4f1f6 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="mb-2 text-center">
          </div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className="fredoka text-2xl md:text-3xl lg:text-4xl" style={{ color: '#2D2D2D' }}>
                New Arrivals
              </h2>
            </div>
            <Link to="/shop" className="text-sm font-black flex items-center gap-1 hover:underline" style={{ color: 'var(--kiddex-green)' }}>
              See all <FaArrowRight size={12} />
            </Link>
          </div>
          <ProductCarousel products={newArrivals} loading={loading.newArrivals} onAddToCart={handleAddToCart} navigate={navigate} />
        </div>
      </section>

      <section className="py-10" style={{ background: '#fff' }}>
        <div className="container mx-auto px-4">
          <div className="mb-2 text-center">
          </div>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="fredoka text-2xl md:text-3xl lg:text-4xl" style={{ color: '#2D2D2D' }}>
              Best Sellers
            </h2>
          </div>
          <ProductCarousel products={bestSellers} loading={loading.bestSellers} onAddToCart={handleAddToCart} navigate={navigate} />
        </div>
      </section>

      <section className="py-10 container mx-auto px-4">
        <FeaturesRow />
      </section>

      <section className="py-12" style={{ background: 'linear-gradient(135deg, #fff3f8 0%, #fce8f2 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="rounded-[2rem] bg-white border border-pink-100 shadow-[0_20px_80px_rgba(255,194,218,0.25)] p-6 sm:p-8 lg:p-10 text-center">
            <p className="text-pink-500 font-bold uppercase tracking-[0.35em] text-xs mb-4">Flash Sale ⚡</p>
            <h2 className="fredoka text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">
              Up to 50% OFF on Bestsellers
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Shop our cutest picks with big savings and grab them before they’re gone.
            </p>
            <div className="inline-flex items-center justify-center gap-3 rounded-full bg-pink-50 px-4 py-3 shadow-sm mb-6 text-sm font-bold text-pink-700">
              <span className="bg-white rounded-full px-3 py-2 text-pink-600">{hours}</span>
              <span className="bg-white rounded-full px-3 py-2 text-pink-600">{minutes}</span>
              <span className="bg-white rounded-full px-3 py-2 text-pink-600">{seconds}</span>
              <span className="text-pink-500 lowercase">hrs mins secs</span>
            </div>
            <div>
              <Link to="/shop" className="inline-flex items-center justify-center rounded-full bg-pink-500 px-8 py-3 text-white font-bold shadow-lg transition hover:bg-pink-600">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14" style={{ background: 'linear-gradient(135deg, #ef63a4 0%, #f585b9 0%, #e4f1f6 100%)' }}>
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="fredoka text-3xl md:text-4xl mb-3">🎁 Get Exclusive Toy Deals!</h2>
          <p className="font-bold text-white/80 mb-6 text-lg">Subscribe and get 10% off your first order</p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <input type="email" placeholder="Your email address..."
              className="flex-1 rounded-full px-5 py-3 text-gray-700 font-bold focus:outline-none shadow-lg" />
            <button className="fredoka text-lg px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
              style={{ background: 'var(--kiddex-yellow)', color: '#2D2D2D' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
